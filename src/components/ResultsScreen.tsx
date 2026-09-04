import { useMemo, useState } from 'react';
import type { Question } from '@/data/questionBank';
import { SUBJECT_NAMES, SUBJECTS, type SubjectId } from '@/data/questionBank';
import { Trophy, Clock, Target, TrendingUp, TrendingDown, ChevronDown, Check, X, Home, RotateCcw } from 'lucide-react';
import MathText from '@/components/MathText';

type Props = {
  result: {
    correctAnswers: number;
    totalQuestions: number;
    durationSeconds: number;
    answers: (number | null)[];
    questions: Question[];
  };
  onRetry: () => void;
  onHome: () => void;
};

export default function ResultsScreen({ result, onRetry, onHome }: Props) {
  const { correctAnswers, totalQuestions, durationSeconds, answers, questions } = result;
  const percentage = (correctAnswers / totalQuestions) * 100;
  const [reviewOpen, setReviewOpen] = useState(false);

  const subjectBreakdown = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    questions.forEach((q, i) => {
      const name = SUBJECT_NAMES[q.subject];
      if (!map[name]) map[name] = { total: 0, correct: 0 };
      map[name].total++;
      if (answers[i] === q.correctIndex) map[name].correct++;
    });
    return Object.entries(map)
      .map(([subject, v]) => ({ subject, ...v, pct: (v.correct / v.total) * 100 }))
      .sort((a, b) => a.pct - b.pct);
  }, [questions, answers]);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const grade = percentage >= 70 ? 'excelente' : percentage >= 50 ? 'aceptable' : 'requiere mejora';
  const gradeColor = percentage >= 70 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600';
  const gradeBg = percentage >= 70 ? 'from-emerald-500 to-teal-600' : percentage >= 50 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600';

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`bg-gradient-to-br ${gradeBg} rounded-3xl p-8 text-center text-white shadow-xl mb-6`}>
        <Trophy className="w-14 h-14 mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Resultado del Simulacro</h1>
        <p className="text-white/80 mt-1 capitalize">Desempeño {grade}</p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-3xl font-bold">{correctAnswers}/{totalQuestions}</p>
            <p className="text-sm text-white/80 mt-1">Aciertos</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-3xl font-bold">{percentage.toFixed(1)}%</p>
            <p className="text-sm text-white/80 mt-1">Efectividad</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-3xl font-bold">{formatDuration(durationSeconds)}</p>
            <p className="text-sm text-white/80 mt-1">Tiempo</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Desglose por materia</h2>
        <div className="space-y-3">
          {subjectBreakdown.map((s) => {
            const TrendIcon = s.pct >= 60 ? TrendingUp : TrendingDown;
            const barColor = s.pct >= 70 ? 'bg-emerald-500' : s.pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={s.subject} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.subject}</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">
                      {s.correct}/{s.total} ({s.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
                <TrendIcon className={`w-5 h-5 flex-shrink-0 ${s.pct >= 60 ? 'text-emerald-500' : 'text-red-400'}`} />
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <Target className="w-4 h-4 inline mr-1" />
            <strong>Áreas de oportunidad:</strong> {subjectBreakdown.filter((s) => s.pct < 50).map((s) => s.subject).join(', ') || 'No hay áreas críticas. ¡Sigue practicando para mantener tu nivel!'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <button
          onClick={() => setReviewOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5"
        >
          <span className="font-bold text-slate-800 dark:text-slate-100">Revisión de respuestas</span>
          <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${reviewOpen ? 'rotate-180' : ''}`} />
        </button>
        {reviewOpen && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-5 space-y-4 max-h-[600px] overflow-y-auto">
            {questions.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correctIndex;
              const isUnanswered = userAns === null;
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isCorrect ? 'bg-emerald-500 text-white' : isUnanswered ? 'bg-slate-300 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : isUnanswered ? '—' : <X className="w-3.5 h-3.5" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{i + 1}. {SUBJECT_NAMES[q.subject]}</p>
                      <MathText text={q.question} className="text-sm text-slate-700 dark:text-slate-200 font-medium block" />
                    </div>
                  </div>
                  <div className="ml-8 space-y-1">
                    {q.options.map((opt, oi) => {
                      const isUserAns = userAns === oi;
                      const isCorrectOpt = oi === q.correctIndex;
                      return (
                        <div
                          key={oi}
                          className={`text-sm flex items-center gap-2 ${
                            isCorrectOpt ? 'text-emerald-700 dark:text-emerald-400 font-medium' : isUserAns ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                            isCorrectOpt ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : isUserAns ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-300'
                          }`}>
                            {letters[oi]}
                          </span>
                          <MathText text={opt} className="flex-1" />
                          {isCorrectOpt && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                          {isUserAns && !isCorrectOpt && <X className="w-3.5 h-3.5 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ml-8 mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <MathText text={q.explanation} className="text-xs text-slate-600 dark:text-slate-300 block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition-all"
        >
          <Home className="w-5 h-5" /> Dashboard
        </button>
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold transition-all shadow-lg shadow-academic-600/25"
        >
          <RotateCcw className="w-5 h-5" /> Nuevo simulacro
        </button>
      </div>
    </div>
  );
}
