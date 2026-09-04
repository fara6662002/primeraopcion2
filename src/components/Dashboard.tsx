import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchResultsByUser, 
  fetchStreak, 
  fetchAvatarCatalogUrls, 
  updateUserAvatar, 
  updateTargetSchools, 
  getRank, 
  type ExamResult, 
  type DailyStreak 
} from '@/lib/store';
import { SUBJECTS, SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import { 
  BookOpen, 
  Timer, 
  TrendingUp, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  CalendarClock, 
  Flame, 
  GraduationCap, 
  X, 
  Check, 
  FileText, 
  Share2, 
  Target, 
  Mail, 
  Loader2, 
  Award, 
  BarChart3, 
  type LucideIcon 
} from 'lucide-react';
import type { Page } from '@/components/Navbar';
import { generateDiagnosticReport, generateSuccessCard, generateDiploma } from '@/lib/pdfUtils';
import { supabase } from '@/lib/supabase';
import ToastContainer, { type Toast, type ToastType } from '@/components/Toast';
import Leaderboard from '@/components/Leaderboard';
import SchoolSimulator from '@/components/SchoolSimulator';

type Props = { onNavigate: (page: Page) => void };

const EXAM_DATE = new Date('2026-06-14T00:00:00');

const SCHOOL_OPTIONS = [
  'ENP 1 - Gabino Barreda',
  'ENP 2 - Erasmo Castellanos Quinto',
  'ENP 3 - Justo Sierra',
  'ENP 4 - Gabriel Mancera',
  'ENP 5 - José Vasconcelos',
  'ENP 6 - Antonio Caso',
  'ENP 7 - Ramón G. Bonfil',
  'ENP 8 - Miguel E. Schulz',
  'ENP 9 - Pedro de Alba',
  'CCH Sur',
  'CCH Norte',
  'CCH Oriente',
  'CCH Occidente',
  'CCH Azcapotzalco',
  'CCH Naucalpan',
  'CCH Vallejo',
  'CECyT 1 - Wilfrido Massieu',
  'CECyT 2 - Miguel Bernard',
  'CECyT 3 - Estanislao Ramírez',
  'CECyT 4 - Lázaro Cárdenas',
  'CECyT 5 - Benito Juárez',
  'CECyT 6 - Wilfrido Massieu',
  'CECyT 7 - Cuauhtémoc',
  'CECyT 8 - Luis Enrique Erro',
  'CECyT 9 - Juan de Dios Bátiz',
  'CECyT 10 - Karl Marx',
  'CECyT 11 - Wilfrido Massieu',
  'CECyT 12 - José María Morelos',
  'CECyT 13 - Ricardo Flores Magón',
  'CECyT 14 - Luis Enrique Erro',
  'CECyT 15 - Diódoro J. Rueda',
  'Otra',
];

export default function Dashboard({ onNavigate }: Props) {
  const { user, refreshUser } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSchoolsModal, setShowSchoolsModal] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [savedAvatar, setSavedAvatar] = useState(false);
  const [savedSchools, setSavedSchools] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sendingReport, setSendingReport] = useState(false);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [r, s, av] = await Promise.all([
          fetchResultsByUser(user.id),
          fetchStreak(user.id),
          fetchAvatarCatalogUrls(),
        ]);
        setResults(r);
        setStreak(s);
        setAvatars(av);
        setSelectedAvatar(user.avatar ?? null);
        setSelectedSchools(user.target_schools ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [user]);

  const daysLeft = Math.max(0, Math.ceil((EXAM_DATE.getTime() - Date.now()) / 86400000));
  const totalExams = results.length;
  const bestScore = results.length > 0 ? Math.max(...results.map((r) => Number(r.percentage))) : 0;
  const avgScore = results.length > 0 ? results.reduce((s, r) => s + Number(r.percentage), 0) / results.length : 0;
  const totalQuestions = results.reduce((s, r) => s + r.total_questions, 0);
  const rank = getRank(bestScore);
  const firstName = user?.full_name?.split(' ')[0] ?? '';

  const stats: { label: string; value: string; icon: LucideIcon; color: string }[] = [
    { label: 'Simulacros realizados', value: loading ? '—' : String(totalExams), icon: Trophy, color: 'text-academic-600 bg-academic-50' },
    { label: 'Mejor calificación', value: loading ? '—' : `${bestScore.toFixed(1)}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'Promedio general', value: loading ? '—' : `${avgScore.toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Preguntas respondidas', value: loading ? '—' : String(totalQuestions), icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
  ];

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatar) return;
    await updateUserAvatar(user.id, selectedAvatar);
    await refreshUser();
    setSavedAvatar(true);
    setTimeout(() => { setSavedAvatar(false); setShowAvatarModal(false); }, 1200);
  };

  const handleSaveSchools = async () => {
    if (!user) return;
    await updateTargetSchools(user.id, selectedSchools);
    await refreshUser();
    setSavedSchools(true);
    setTimeout(() => { setSavedSchools(false); setShowSchoolsModal(false); }, 1200);
  };

  const handleSendReport = async () => {
    if (!user) return;
    const parentEmail = user.parent_email;
    if (!parentEmail) {
      showToast('error', 'No hay un correo de tutor configurado. Agrégalo en tu perfil.');
      return;
    }
    setSendingReport(true);
    try {
      const breakdown = results.length > 0
        ? (results[0].breakdown_by_subject ?? results[0].subject_breakdown ?? [])
        : [];
      const weakest = [...breakdown]
        .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
        .slice(0, 3)
        .map((w) => SUBJECT_NAMES[w.subject as SubjectId] ?? w.subject);
      const { data, error } = await supabase.functions.invoke('send-progress-report', {
        body: {
          studentName: user.full_name,
          studentEmail: user.email ?? '',
          parentEmail,
          averageScore: avgScore,
          totalExams: totalExams,
          totalQuestions: totalQuestions,
          subjectBreakdown: breakdown.map((s) => ({ subject: SUBJECT_NAMES[s.subject as SubjectId] ?? s.subject, correct: s.correct, total: s.total })),
          weakestAreas: weakest,
        },
      });
      if (error) throw error;
      if (data?.success) {
        showToast('success', `Reporte enviado con éxito a ${parentEmail}`);
      } else {
        showToast('info', 'El correo no pudo enviarse (servicio no configurado). Contacta al administrador.');
      }
    } catch {
      showToast('error', 'Hubo un problema al enviar el reporte. Intenta más tarde.');
    }
    setSendingReport(false);
  };

  const toggleSchool = (school: string) => {
    setSelectedSchools((prev) => {
      if (prev.includes(school)) return prev.filter((s) => s !== school);
      if (prev.length >= 5) return prev;
      return [...prev, school];
    });
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido, {firstName}</h1>
          <p className="text-sm text-slate-500 mt-1">Continúa tu preparación para el examen de admisión</p>
        </div>
        <div className="flex items-center gap-3">
          {streak && streak.streak_count > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-lg font-bold text-orange-600 leading-none">{streak.streak_count}</p>
                <p className="text-xs text-orange-400">días de racha</p>
              </div>
            </div>
          )}
          <div className="bg-gradient-to-br from-academic-600 to-slate-800 rounded-xl px-5 py-2.5 text-white shadow-lg shadow-academic-600/20">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-academic-200" />
              <div>
                <p className="text-2xl font-bold leading-none">{daysLeft}</p>
                <p className="text-xs text-academic-200">días para el examen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar + rank banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 flex-wrap">
        <button onClick={() => setShowAvatarModal(true)} className="relative group flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Cambiar</span>
          </div>
        </button>
        <div className="flex-1 min-w-[180px]">
          <p className="font-semibold text-slate-800">{user?.full_name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${rank.color} text-white`}>
            <Trophy className="w-3.5 h-3.5" /> {rank.label}
          </div>
        </div>
        {/* School choices */}
        <button onClick={() => setShowSchoolsModal(true)} className="text-left bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-colors min-w-[180px]">
          <p className="text-xs text-slate-400 mb-1">Opciones educativas</p>
          {selectedSchools.length > 0 ? (
            <div className="space-y-0.5">
              {selectedSchools.slice(0, 3).map((s, i) => (
                <p key={i} className="text-xs font-medium text-slate-700 truncate">{i + 1}. {s}</p>
              ))}
              {selectedSchools.length > 3 && <p className="text-xs text-slate-400">+{selectedSchools.length - 3} más</p>}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Selecciona tus 5 opciones</p>
          )}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Historial reciente</h2>
            <button onClick={() => onNavigate('profile')} className="text-sm text-academic-600 hover:text-academic-700 font-medium flex items-center gap-1">
              Ver todo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Cargando...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-4">Aún no has realizado ningún simulacro</p>
              <button onClick={() => onNavigate('simulacro')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-academic-600 hover:bg-academic-700 text-white text-sm font-medium transition-all">
                <Timer className="w-4 h-4" /> Iniciar primer simulacro
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 5).map((r) => {
                const pct = Number(r.percentage);
                const color = pct >= 70 ? 'text-emerald-600 bg-emerald-50' : pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{r.correct_answers}/{r.total_questions} aciertos</p>
                      <p className="text-xs text-slate-400">{new Date(r.completed_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${color}`}>{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            <button onClick={() => onNavigate('study')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-academic-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-academic-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Temarios y Estudio</p>
                <p className="text-xs text-slate-400">10 materias oficiales</p>
              </div>
            </button>
            <button onClick={() => onNavigate('simulacro')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Timer className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Iniciar simulacro</p>
                <p className="text-xs text-slate-400">128 preguntas · 3 horas</p>
              </div>
            </button>
            <button onClick={() => onNavigate('theory')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Biblioteca teórica</p>
                <p className="text-xs text-slate-400">Teoría por materia</p>
              </div>
            </button>
            <button onClick={() => onNavigate('certainty')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Indice de certeza</p>
                <p className="text-xs text-slate-400">Analisis de rendimiento</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Send report to parents */}
      {results.length > 0 && (
        <div className="bg-gradient-to-br from-academic-600 to-academic-800 rounded-2xl shadow-lg shadow-academic-600/20 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Enviar reporte de avances a mis papás</h2>
              <p className="text-sm text-academic-200">Se enviará un resumen con promedio, aciertos por materia y áreas a reforzar</p>
            </div>
          </div>
          <button onClick={handleSendReport} disabled={sendingReport}
            className="px-6 py-3 rounded-xl bg-white text-academic-700 font-semibold text-sm hover:bg-academic-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0">
            {sendingReport ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : <><Mail className="w-4 h-4" /> Enviar reporte</>}
          </button>
        </div>
      )}

      {/* Diagnostic weakness chart */}
      {results.length > 0 && (() => {
        const allBreakdowns: Record<string, { correct: number; total: number }> = {};
        results.forEach((r) => {
          const bd = r.breakdown_by_subject ?? r.subject_breakdown ?? [];
          bd.forEach((s) => {
            const key = SUBJECT_NAMES[s.subject as SubjectId] ?? s.subject;
            if (!allBreakdowns[key]) allBreakdowns[key] = { correct: 0, total: 0 };
            allBreakdowns[key].correct += s.correct;
            allBreakdowns[key].total += s.total;
          });
        });
        const chartData = Object.entries(allBreakdowns)
          .map(([subject, v]) => ({ subject, pct: v.total > 0 ? (v.correct / v.total) * 100 : 0, correct: v.correct, total: v.total }))
          .sort((a, b) => a.pct - b.pct);
        const weakest = chartData.filter((d) => d.pct < 60);
        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-academic-600" /> Diagnóstico por materia
            </h2>
            <div className="space-y-3">
              {chartData.map((d) => {
                const barColor = d.pct >= 70 ? 'bg-emerald-500' : d.pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={d.subject} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{d.subject}</span>
                        <span className="text-xs font-bold text-slate-500 ml-2 flex-shrink-0">{d.pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${Math.max(d.pct, 2)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {weakest.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-300">
                  <strong>Áreas a reforzar:</strong> {weakest.map((w) => w.subject).join(', ')}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* School simulator + Leaderboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SchoolSimulator
          correctAnswers={results.length > 0 ? results[0].correct_answers : 0}
          totalQuestions={results.length > 0 ? results[0].total_questions : 0}
        />
        <Leaderboard currentUserId={user?.id} />
      </div>

      {/* PDF tools */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Reportes y documentos</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => {
              const lastExam = results[0];
              generateDiagnosticReport({
                fullName: user?.full_name ?? '',
                email: user?.email ?? '',
                examDate: new Date(lastExam.completed_at).toLocaleDateString('es-MX'),
                correctAnswers: lastExam.correct_answers,
                totalQuestions: lastExam.total_questions,
                percentage: Number(lastExam.percentage),
                subjectBreakdown: lastExam.breakdown_by_subject ?? lastExam.subject_breakdown ?? [],
                rank: rank.label,
              });
            }} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-academic-300 hover:bg-academic-50/50 dark:hover:bg-slate-700 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-academic-50 dark:bg-academic-900/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-academic-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ficha diagnostica (PDF)</p>
                <p className="text-xs text-slate-400">Reporte completo para tutor</p>
              </div>
            </button>
            <button onClick={() => {
              const lastExam = results[0];
              generateSuccessCard({
                fullName: user?.full_name ?? '',
                correctAnswers: lastExam.correct_answers,
                totalQuestions: lastExam.total_questions,
                rank: rank.label,
                targetSchool: selectedSchools[0],
              });
            }} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-academic-300 hover:bg-academic-50/50 dark:hover:bg-slate-700 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Caso de exito (PDF)</p>
                <p className="text-xs text-slate-400">Tarjeta para redes sociales</p>
              </div>
            </button>
            <button onClick={() => {
              const folio = `ECOEMS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
              generateDiploma({
                fullName: user?.full_name ?? '',
                folio,
                date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
                averageScore: avgScore,
                totalQuestions: results[0]?.total_questions ?? 128,
              });
            }} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-slate-700 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Diploma de reconocimiento (PDF)</p>
                <p className="text-xs text-slate-400">Reconocimiento oficial con folio único</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Subjects grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Materias oficiales</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => onNavigate('study')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-700 text-center">{s.name}</p>
              <p className="text-xs text-slate-400">{s.topics.length} temas</p>
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAvatarModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Elige tu avatar</h2>
              <button onClick={() => setShowAvatarModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              {avatars.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No hay avatares disponibles aún.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((av) => (
                    <button key={av} onClick={() => setSelectedAvatar(av)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${selectedAvatar === av ? 'border-academic-500 ring-2 ring-academic-500/30' : 'border-slate-200 hover:border-academic-300'}`}>
                      <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      {selectedAvatar === av && (
                        <div className="absolute inset-0 bg-academic-500/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowAvatarModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSaveAvatar} disabled={!selectedAvatar || selectedAvatar === user?.avatar}
                className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                {savedAvatar ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schools Modal */}
      {showSchoolsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSchoolsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800">5 opciones educativas</h2>
                <p className="text-xs text-slate-400">Selecciona tus escuelas de preferencia ({selectedSchools.length}/5)</p>
              </div>
              <button onClick={() => setShowSchoolsModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                {SCHOOL_OPTIONS.map((school) => {
                  const isSelected = selectedSchools.includes(school);
                  const isDisabled = !isSelected && selectedSchools.length >= 5;
                  return (
                    <button key={school} onClick={() => toggleSchool(school)} disabled={isDisabled}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left text-sm ${isSelected ? 'border-academic-400 bg-academic-50 text-academic-700 font-medium' : isDisabled ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-academic-200'}`}>
                      {school}
                      {isSelected && <Check className="w-4 h-4 text-academic-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowSchoolsModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSaveSchools}
                className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5">
                {savedSchools ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar opciones'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}