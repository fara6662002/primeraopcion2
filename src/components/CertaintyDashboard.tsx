import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchResultsByUser, type ExamResult } from '@/lib/store';
import { SUBJECTS, SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, Target, Zap } from 'lucide-react';

export default function CertaintyDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchResultsByUser(user.id)
      .then((r) => setResults(r))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-academic-200 border-t-academic-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center animate-[fadeIn_0.2s_ease-out]">
        <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">No hay datos de simulacros aun.</p>
        <p className="text-sm text-slate-400 mt-1">Realiza tu primer simulacro para ver tu indice de certeza.</p>
      </div>
    );
  }

  // Aggregate by subject across all exams
  const subjectStats: Record<string, { total: number; correct: number; exams: number }> = {};
  results.forEach((r) => {
    const breakdown = r.breakdown_by_subject ?? r.subject_breakdown ?? [];
    breakdown.forEach((s) => {
      if (!subjectStats[s.subject]) subjectStats[s.subject] = { total: 0, correct: 0, exams: 0 };
      subjectStats[s.subject].total += s.total;
      subjectStats[s.subject].correct += s.correct;
      subjectStats[s.subject].exams += 1;
    });
  });

  const subjectRows = SUBJECTS.map((s) => {
    const stats = subjectStats[s.id];
    if (!stats) return { id: s.id, name: s.name, total: 0, correct: 0, pct: 0, exams: 0, certainty: 0, status: 'none' as const };
    const pct = (stats.correct / stats.total) * 100;
    const certainty = pct; // certainty = effectiveness
    const status = pct >= 70 ? 'strong' as const : pct >= 50 ? 'medium' as const : pct > 0 ? 'weak' as const : 'none' as const;
    return { id: s.id, name: s.name, total: stats.total, correct: stats.correct, pct, exams: stats.exams, certainty, status };
  }).filter((r) => r.total > 0);

  // False confidence: high volume but low accuracy
  const falseConfidence = subjectRows
    .filter((r) => r.total >= 20 && r.pct < 50)
    .sort((a, b) => b.total - a.total);

  // Speed metrics
  const avgDuration = results.reduce((s, r) => s + r.duration_seconds, 0) / results.length;
  const avgTimePerQuestion = avgDuration / 128;
  const formatTimePerQ = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const speedRecommendation =
    avgTimePerQuestion < 60 ? 'Ritmo rapido — podrias estar respondiendo sin verificar. Toma tu tiempo para revisar.' :
    avgTimePerQuestion <= 90 ? 'Ritmo optimo — mantienes un buen balance entre velocidad y precision.' :
    'Ritmo lento — practica gestion del tiempo para completar las 128 preguntas en 3 horas.';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Indice de Certeza y Ritmo</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analisis de tu desempeno por materia basado en {results.length} simulacro(s)</p>
      </div>

      {/* Speed metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-academic-50 dark:bg-academic-900/30 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-academic-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatTimePerQ(avgTimePerQuestion)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tiempo promedio por pregunta</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{results.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simulacros analizados</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{speedRecommendation}</p>
        </div>
      </div>

      {/* Certainty chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Certeza por materia</h2>
        <div className="space-y-3">
          {subjectRows.map((row) => {
            const barColor = row.status === 'strong' ? 'bg-emerald-500' : row.status === 'medium' ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={row.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate flex-1">{row.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs ml-2">{row.correct}/{row.total} · {row.pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* False confidence alert */}
      {falseConfidence.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Areas de falsa confianza</h3>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1 mb-3">Materias con alto volumen de respuestas pero baja efectividad. Necesitas reforzar el conocimiento, no solo practicar mas.</p>
              <div className="space-y-2">
                {falseConfidence.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{r.total} preguntas</span>
                      <span className="text-red-600 font-bold">{r.pct.toFixed(0)}%</span>
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strengths */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Materias dominadas</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1 mb-3">Areas con certeza alta (70% o mas). Mantenlas asi.</p>
            <div className="flex flex-wrap gap-2">
              {subjectRows.filter((r) => r.status === 'strong').map((r) => (
                <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {r.name} · {r.pct.toFixed(0)}%
                </span>
              ))}
              {subjectRows.filter((r) => r.status === 'strong').length === 0 && (
                <span className="text-sm text-emerald-600 dark:text-emerald-300">Aun no hay materias dominadas. ¡Sigue practicando!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
