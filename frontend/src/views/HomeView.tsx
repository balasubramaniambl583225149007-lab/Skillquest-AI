import React, { useState, useEffect } from 'react';
import { UserProfile, TrackSummary, CourseTrack } from '../types';
import { SpikeRhinoAvatar } from '../components/SpikeRhinoAvatar';
import { FormattedMathText } from '../components/KaTeXRenderer';
import { api } from '../api';
import { soundManager } from '../utils/soundManager';
import { signInWithGoogle } from '../utils/supabaseClient';
import { ArrowRight, Compass, Sparkles, CheckCircle2, AlertTriangle, BrainCircuit } from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile | null;
  onNavigateToMap: (track: CourseTrack) => void;
  onNavigateToWardrobe: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  onNavigateToMap,
  onNavigateToWardrobe,
}) => {
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [drill, setDrill] = useState<any>(null);
  const [drillAnswer, setDrillAnswer] = useState<number | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);

  useEffect(() => {
    loadTracks();
    loadAdaptiveDrill();
  }, [profile?.active_track]);

  const loadTracks = async () => {
    try {
      const data = await api.getTracksSummary();
      setTracks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdaptiveDrill = async () => {
    setLoadingDrill(true);
    try {
      const data = await api.generateAdaptiveDrill(profile?.active_track || 'EEE');
      setDrill(data);
      setDrillAnswer(null);
      setDrillFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDrill(false);
    }
  };

  const handleSelectDrillOption = (index: number) => {
    if (drillAnswer !== null) return;
    setDrillAnswer(index);
    if (index === drill?.correct_index) {
      soundManager.playLevelVictory();
      soundManager.playCoinPickup();
      setDrillFeedback(`✅ Correct! ${drill?.explanation}`);
    } else {
      soundManager.playHeartLoss();
      setDrillFeedback(`💡 Spike Hint: ${drill?.explanation}`);
    }
  };

  const outfitCode = profile?.equipped_outfit_code || 'SAFARI_EXPLORER';

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* 1. HERO MASCOT GREETING BANNER */}
      <div className="adventure-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-bl-full pointer-events-none -z-0" />

        {/* Spike Avatar Stage */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-36 h-36 rounded-2xl bg-[#0b2a20] border-2 border-emerald-600/40 flex items-center justify-center p-2 shadow-inner group cursor-pointer"
               onClick={onNavigateToWardrobe}>
            <SpikeRhinoAvatar outfit={outfitCode} state="excited" size={130} speechBubble="Ready to explore the jungle circuits? 🦏⚡" />
          </div>
          <button
            onClick={onNavigateToWardrobe}
            className="mt-2 text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Change Wardrobe</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dialogue Bubble */}
        <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spike's Morning Engineering Brief</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight leading-snug">
            Welcome back, {profile?.username || 'Explorer'}! Ready to solve today's circuits?
          </h1>
          <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed max-w-2xl">
            You're currently advancing along the <strong className="text-amber-300">{profile?.active_track} Track</strong>.
            Your Bayesian Knowledge score is strong, but daily practice keeps your circuits from decaying!
          </p>

          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => {
                soundManager.playVineSwing();
                onNavigateToMap(profile?.active_track || 'EEE');
              }}
              className="btn-3d btn-3d-primary px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Continue Learning Map</span>
            </button>

            <button
              onClick={async () => {
                soundManager.playCoinPickup();
                try {
                  await signInWithGoogle();
                } catch (e) {
                  alert("Google OAuth: Add Supabase client keys in .env or enjoy local Guest mode!");
                }
              }}
              className="btn-3d btn-3d-secondary px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#FFFBEB" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FDE68A" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#FCA5A5" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 3 TRACK CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">Engineering Disciplines</h2>
            <p className="text-xs text-amber-200/70">Select a track to launch interactive simulations and winding paths</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tracks.map((t) => {
            const isEee = t.track === 'EEE';
            const isCse = t.track === 'CSE';
            const isEce = t.track === 'ECE';
            const accentBorder = isEee ? 'border-[#F97316]' : isCse ? 'border-[#A855F7]' : 'border-[#F59E0B]';
            const btnClass = isEee ? 'btn-3d-eee' : isCse ? 'btn-3d-cse' : 'btn-3d-ece';
            const badgeBg = isEee ? 'bg-orange-900/50 text-orange-300 border-orange-500/40' : isCse ? 'bg-purple-900/50 text-purple-300 border-purple-500/40' : 'bg-amber-900/50 text-amber-300 border-amber-500/40';

            return (
              <div
                key={t.track}
                className={`adventure-card rounded-3xl p-6 flex flex-col justify-between hover:brightness-110 transition-all relative overflow-hidden ${
                  profile?.active_track === t.track ? `border-2 ${accentBorder} ring-4 ring-emerald-500/20` : ''
                }`}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-950/70 text-amber-200 font-mono border border-emerald-700/50">
                      {t.track}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {t.badge_text}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-[#F8FAFC] leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-xs text-amber-100/70 mt-1">
                      {isEee && 'Ohm’s law, KCL/KVL, AC phasors, RLC resonance, transients, and microgrid Boss missions.'}
                      {isCse && 'Memory layout, pointers, BST, Dijkstra graphs, relational SQL, and cloud crash Boss missions.'}
                      {isEce && 'Semiconductors, BJT Q-points, Fourier, Nyquist sampling, Smith charts, and space telemetry.'}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-6 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-amber-200/80">
                    <span>Level {t.unlocked_level_number} of {t.total_levels}</span>
                    <span>{t.progress_percent}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-emerald-950/70 overflow-hidden border border-emerald-800/40">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, t.progress_percent)}%`,
                        backgroundColor: t.accent_color,
                      }}
                    />
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => onNavigateToMap(t.track)}
                  className={`btn-3d ${btnClass} w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2`}
                >
                  <span>Launch {t.track} Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BKT ADAPTIVE DRILL CARD (REVIEW WEAKEST TOPIC) */}
      {drill && (
        <div className="adventure-card rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-700/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-amber-300 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#F8FAFC] flex items-center gap-2">
                  <span>Bayesian Mastery Booster Drill</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-600/40">
                    Adaptive Review
                  </span>
                </h3>
                <p className="text-xs text-amber-100/70">
                  Targeted at your lowest mastery concept: <strong className="text-amber-300">{drill.target_topic}</strong> (P = {Math.round((drill.current_mastery || 0.3) * 100)}%)
                </p>
              </div>
            </div>
            <button
              onClick={loadAdaptiveDrill}
              disabled={loadingDrill}
              className="text-xs text-amber-300 hover:underline font-bold self-start sm:self-auto cursor-pointer"
            >
              Regenerate Drill ↺
            </button>
          </div>

          {/* Drill Question Prompt */}
          <div className="space-y-2">
            <h4 className="font-bold text-base text-[#F8FAFC]">{drill.title}</h4>
            <p className="text-sm text-amber-100/80">{drill.prompt}</p>
            {drill.equation && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-center my-2 text-amber-100">
                <FormattedMathText text={drill.equation} />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {drill.options?.map((opt: string, idx: number) => {
              const isSelected = drillAnswer === idx;
              const isCorrect = idx === drill.correct_index;
              let btnStyle = 'border-emerald-700/40 hover:border-amber-400 hover:bg-emerald-900/60 text-amber-100';

              if (drillAnswer !== null) {
                if (isCorrect) {
                  btnStyle = 'border-[#10B981] bg-emerald-900/70 text-emerald-100 font-bold';
                } else if (isSelected) {
                  btnStyle = 'border-[#EF4444] bg-red-950/70 text-red-100 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDrillOption(idx)}
                  className={`p-3.5 rounded-2xl border-2 text-left text-sm transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {drillAnswer !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                  {drillAnswer !== null && isSelected && !isCorrect && <AlertTriangle className="w-4 h-4 text-[#EF4444]" />}
                </button>
              );
            })}
          </div>

          {/* Drill Feedback */}
          {drillFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-900/60 border border-amber-500/40 text-sm text-amber-100 font-medium animate-fade-in">
              <FormattedMathText text={drillFeedback} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
