-- Migration: Restore profiles.avatar_url
-- File: supabase/migrations/20261011_add_profile_avatar_url.sql
-- The live Supabase database was provisioned from an older schema that omitted
-- profiles.avatar_url, while the ORM (backend/app/db/models.py) expects it.
-- Every SELECT on public.profiles (e.g. /api/v1/user/profile) failed with
-- "column profiles.avatar_url does not exist" until this column is added.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
