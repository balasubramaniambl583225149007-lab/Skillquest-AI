"""
Database connection and session manager for Skill Quest AI.
Supports PostgreSQL (Supabase) via asyncpg, with seamless aiosqlite fallback for local operation.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./skillquest.db")

# Normalize postgresql:// to postgresql+asyncpg:// for SQLAlchemy async engine
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    """Dependency for providing database sessions to FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def _reconcile_schema(conn):
    """Add ORM columns that are missing from pre-existing tables.

    ``create_all`` only creates missing tables; it never alters existing ones.
    When the live database (e.g. a Supabase project provisioned from an older
    schema) predates a model column, every ``SELECT`` against that table fails.
    This walks the ORM metadata and issues ``ADD COLUMN`` for any drift, using
    portable DDL so it works on both SQLite and PostgreSQL.
    """
    from sqlalchemy import inspect, text

    def _missing_columns(sync_conn):
        inspector = inspect(sync_conn)
        existing_tables = set(inspector.get_table_names())
        missing = []
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            db_columns = {col["name"] for col in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name not in db_columns:
                    missing.append((table.name, column))
        return missing

    for table_name, column in await conn.run_sync(_missing_columns):
        column_type = column.type.compile(dialect=conn.dialect)
        ddl = f'ALTER TABLE "{table_name}" ADD COLUMN "{column.name}" {column_type}'
        try:
            await conn.execute(text(ddl))
            print(f"[Skill Quest AI] Schema reconcile: added {table_name}.{column.name}")
        except Exception as exc:  # pragma: no cover - defensive, keep startup resilient
            print(f"[Skill Quest AI] Schema reconcile skipped {table_name}.{column.name}: {exc}")


async def init_db():
    """Initializes tables in database and reconciles any schema drift."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _reconcile_schema(conn)
