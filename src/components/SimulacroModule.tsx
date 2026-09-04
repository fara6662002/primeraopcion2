import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateSimulacroQuestions } from '@/data/questionGenerator';
import type { Question } from '@/data/questionBank';
import { SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import MathText from '@/components/MathText';
import { reportQuestion } from '@/lib/store';
import { Timer, AlertTriangle, ChevronLeft, ChevronRight, Flag, Play, Clock, AlertCircle, Check, X, FileText, Printer } from 'lucide-react';
import { generateOMRSheet } from '@/lib/pdfUtils';

type Props = {
  onFinish: (result: {
    correctAnswers: number;
    totalQuestions: number;
    durationSeconds: number;
    answers: (number | null)[];
    questions: Question[];
  }) => void;
};

const EXAM_DURATION = 3 * 60 * 60;
const TARGET_QUESTIONS = 128;
const STORAGE_KEY = 'simulacro_progress';
const STRESS_MODE_THRESHOLD = 120;

type SavedState = {
  answers: (number | null)[];
  timeLeft: number;
  startedAt: number;
  questions: Question[];
  markedForReview: number[];
};

export default function SimulacroModule({ onFinish }: Props) {
  const { user } = useAuth();
  const [examQuestions, setExamQuestions] = useState<Question[]>(() => generateSimulacroQuestions());
  const [phase, setPhase] = useState<'intro' | 'exam' | 'confirm'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(TARGET_QUESTIONS).fill(null));
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [showStressAlert, setShowStressAlert] = useState(false);
  const [reportedQs, setReportedQs] = useState<Set<string>>(new Set());
  const questionStartTime = useRef<number>(Date.now());

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const questionsRef = useRef(examQuestions);
  questionsRef.current = examQuestions;

  // Load saved state on mount — restore the actual questions so answers map correctly
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        if (state.questions?.length === TARGET_QUESTIONS && state.timeLeft > 0 && state.answers.length === TARGET_QUESTIONS) {
          setExamQuestions(state.questions);
          setAnswers(state.answers);
          setTimeLeft(state.timeLeft);
          setMarkedForReview(state.markedForReview || []);
          setPhase('exam');
        }
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  // Save to localStorage on changes — persist the full questions so a reload maps answers correctly
  useEffect(() => {
    if (phase === 'exam') {
      const state: SavedState = {
        answers,
        timeLeft,
        startedAt: Date.now(),
        questions: examQuestions,
        markedForReview,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [answers, timeLeft, markedForReview, phase, examQuestions]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const correct = examQuestions.reduce((acc, q, i) => acc + (answersRef.current[i] === q.correctIndex ? 1 : 0), 0);
          localStorage.removeItem(STORAGE_KEY);
          onFinishRef.current({
            correctAnswers: correct,
            totalQuestions: TARGET_QUESTIONS,
            durationSeconds: EXAM_DURATION,
            answers: answersRef.current,
            questions: examQuestions,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, examQuestions]);

  // Stress mode: alert if too long on one question
  useEffect(() => {
    if (phase !== 'exam') return;
    questionStartTime.current = Date.now();
    setShowStressAlert(false);
    const timer = setTimeout(() => {
      setShowStressAlert(true);
    }, STRESS_MODE_THRESHOLD * 1000);
    return () => clearTimeout(timer);
  }, [currentIdx, phase]);

  const clearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setExamQuestions(generateSimulacroQuestions());
    setAnswers(new Array(TARGET_QUESTIONS).fill(null));
    setTimeLeft(EXAM_DURATION);
    setMarkedForReview([]);
    setCurrentIdx(0);
  };

  const finishExam = () => {
    const correct = examQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    localStorage.removeItem(STORAGE_KEY);
    onFinish({
      correctAnswers: correct,
      totalQuestions: TARGET_QUESTIONS,
      durationSeconds: EXAM_DURATION - timeLeft,
      answers: [...answers],
      questions: examQuestions,
    });
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPct = (answeredCount / TARGET_QUESTIONS) * 100;
  const q = examQuestions[currentIdx];
  const hasSaved = localStorage.getItem(STORAGE_KEY) && phase === 'exam';

  const handleReport = async () => {
    if (!q || reportedQs.has(q.id)) return;
    setReportedQs((prev) => new Set(prev).add(q.id));
    try { await reportQuestion(q.id); } catch { /* may fail if not in DB */ }
  };

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-gradient-to-br from-academic-600 to-slate-800 rounded-2xl p-8 text-white shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
            <Timer className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Simulacro de Examen</h1>
          <p className="text-white/80 text-sm">Examen oficial ECOEMS · 128 preguntas · 3 horas</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-academic-600">128</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">preguntas</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-academic-600">3h</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">duración</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-academic-600">10</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">materias</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">El examen se guarda automáticamente. Si cierras o recargas, continuarás donde te quedaste.</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">Puedes marcar preguntas para revisarlas al final.</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">Si pasas más de 2 minutos en una pregunta, te sugeriremos avanzar.</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">No se puede pausar el cronómetro una vez iniciado.</p>
          </div>
        </div>
        <button onClick={() => setPhase('exam')} className="w-full mt-6 py-3.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-bold transition-colors flex items-center justify-center gap-2 text-lg">
          <Play className="w-5 h-5" /> Iniciar simulacro
        </button>
        <button onClick={() => generateOMRSheet({ fullName: user?.full_name ?? 'Alumno', examDate: new Date().toLocaleDateString('es-MX') })}
          className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <Printer className="w-4 h-4" /> Descargar hoja de respuestas OMR (PDF)
        </button>
      </div>
    );
  }

  if (phase === 'confirm') {
    return (
      <div className="max-w-md mx-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">¿Finalizar examen?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Has respondido <strong>{answeredCount}</strong> de <strong>{TARGET_QUESTIONS}</strong> preguntas.</p>
          {answeredCount < TARGET_QUESTIONS && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">Tienes {TARGET_QUESTIONS - answeredCount} preguntas sin responder.</p>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setPhase('exam')} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Seguir examinándome</button>
            <button onClick={finishExam} className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm">Sí, finalizar</button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Pregunta {currentIdx + 1}/{TARGET_QUESTIONS}</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse' : 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">{answeredCount} respondidas · {TARGET_QUESTIONS - answeredCount} restantes</div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div className="bg-academic-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Stress alert */}
      {showStressAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">Llevas más de 2 minutos en esta pregunta. Considera marcarla para revisión y avanzar.</p>
          <button onClick={() => { setMarkedForReview((prev) => prev.includes(currentIdx) ? prev : [...prev, currentIdx]); setCurrentIdx((i) => Math.min(i + 1, TARGET_QUESTIONS - 1)); setShowStressAlert(false); }}
            className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            Marcar y avanzar
          </button>
        </div>
      )}

      {/* Question card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-xs text-academic-600 dark:text-academic-400 bg-academic-50 dark:bg-academic-900/30 px-2 py-0.5 rounded font-medium">
            {SUBJECT_NAMES[q.subject as SubjectId] ?? q.subject}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setMarkedForReview((prev) => prev.includes(currentIdx) ? prev.filter((i) => i !== currentIdx) : [...prev, currentIdx])}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${markedForReview.includes(currentIdx) ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <Flag className="w-3.5 h-3.5" /> {markedForReview.includes(currentIdx) ? 'Marcada' : 'Marcar'}
            </button>
            <button onClick={handleReport} disabled={reportedQs.has(q.id)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${reportedQs.has(q.id) ? 'text-slate-300 cursor-default' : 'text-red-400 hover:bg-red-50'}`}>
              <AlertCircle className="w-3.5 h-3.5" /> {reportedQs.has(q.id) ? 'Reportada' : 'Reportar'}
            </button>
          </div>
        </div>
        <MathText text={q.question} className="text-base text-slate-800 dark:text-slate-100 font-medium block mb-4 whitespace-pre-line" />
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = answers[currentIdx] === i;
            return (
              <button key={i}
                onClick={() => { setAnswers((prev) => { const a = [...prev]; a[currentIdx] = i; return a; }); }}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${isSelected ? 'border-academic-400 bg-academic-50 dark:bg-academic-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-academic-300 hover:bg-academic-50/30 dark:hover:bg-slate-700/50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'bg-academic-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-500'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <MathText text={opt} className="text-sm text-slate-700" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        {currentIdx === TARGET_QUESTIONS - 1 ? (
          <button onClick={() => setPhase('confirm')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">
            <Flag className="w-4 h-4" /> Finalizar
          </button>
        ) : (
          <button onClick={() => setCurrentIdx((i) => Math.min(TARGET_QUESTIONS - 1, i + 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Answer map */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-academic-500" /> Respondida</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /> Marcada</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" /> Pendiente</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded border-2 border-academic-500" /> Actual</span>
        </div>
        <div className="grid grid-cols-12 sm:grid-cols-16 gap-1.5">
          {Array.from({ length: TARGET_QUESTIONS }, (_, i) => {
            const answered = answers[i] !== null;
            const marked = markedForReview.includes(i);
            const isCurrent = i === currentIdx;
            let cls = 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500';
            if (answered) cls = 'bg-academic-500 text-white';
            if (marked && !answered) cls = 'bg-amber-400 text-white';
            if (marked && answered) cls = 'bg-academic-500 text-white ring-2 ring-amber-400';
            if (isCurrent) cls += ' ring-2 ring-offset-1 ring-academic-600';
            return (
              <button key={i} onClick={() => setCurrentIdx(i)}
                className={`w-full aspect-square rounded-lg text-xs font-medium transition-all ${cls}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
        <button onClick={() => setPhase('confirm')} className="w-full mt-4 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <Flag className="w-4 h-4" /> Finalizar examen
        </button>
      </div>
    </div>
  );
}
