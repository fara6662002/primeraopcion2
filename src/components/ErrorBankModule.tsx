import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchErrorBank, removeFromErrorBank, type ErrorBankEntry } from '@/lib/store';
import { SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import MathText from '@/components/MathText';
import { AlertCircle, Check, X, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';

type Phase = 'list' | 'practice' | 'results';

export default function ErrorBankModule() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('list');
  const [entries, setEntries] = useState<ErrorBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceQueue, setPracticeQueue] = useState<ErrorBankEntry[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<{ entry: ErrorBankEntry; correct: boolean }[]>([]);

  const refresh = async () => {
    if (!user) return;
    try {
      setEntries(await fetchErrorBank(user.id));
    } catch { setEntries([]); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user]);

  const startPractice = () => {
    if (entries.length === 0) return;
    setPracticeQueue([...entries]);
    setCurrentIdx(0);
    setSelected(null);
    setVerified(false);
    setResults([]);
    setPhase('practice');
  };

  const handleVerify = () => {
    if (selected === null) return;
    const entry = practiceQueue[currentIdx];
    const isCorrect = selected === entry.question_data.correctIndex;
    setVerified(true);
    setResults((prev) => [...prev, { entry, correct: isCorrect }]);
    if (isCorrect) {
      removeFromErrorBank(entry.id).then(() => refresh()).catch(() => {});
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= practiceQueue.length) {
      setPhase('results');
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setVerified(false);
  };

  if (phase === 'list') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" /> Banco de Errores
          </h1>
          <p className="text-sm text-slate-500 mt-1">Repasa las preguntas que has fallado. Al responder correctamente, se eliminan de tu lista.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-400">Cargando…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Check className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">¡No tienes errores pendientes!</p>
            <p className="text-sm text-slate-400 mt-1">Sigue practicando para mantener tu lista limpia.</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{entries.length}</p>
                <p className="text-sm text-white/80">preguntas por repasar</p>
              </div>
              <button onClick={startPractice} className="px-5 py-2.5 rounded-xl bg-white text-red-600 font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Iniciar repaso
              </button>
            </div>
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-academic-600 bg-academic-50 px-2 py-0.5 rounded font-medium">
                      {SUBJECT_NAMES[e.subject as SubjectId] ?? e.subject}
                    </span>
                    <span className="text-xs text-slate-400">{e.topic}</span>
                  </div>
                  <MathText text={e.question_data.question} className="text-sm text-slate-700" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === 'results') {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-gradient-to-br from-academic-600 to-slate-800 rounded-2xl p-8 text-white shadow-xl text-center">
          <Check className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Repaso completado</h1>
          <p className="text-white/80 text-sm mt-1">{correctCount} de {results.length} corregidas</p>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${r.correct ? 'border-emerald-200' : 'border-red-200'}`}>
              {r.correct ? <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <MathText text={r.entry.question_data.question} className="text-sm text-slate-700" />
                {r.correct && <p className="text-xs text-emerald-600 mt-1">Eliminada de tu banco de errores</p>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { setPhase('list'); refresh(); }} className="w-full py-3 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold transition-colors">
          Volver al banco de errores
        </button>
      </div>
    );
  }

  // Practice phase
  const entry = practiceQueue[currentIdx];
  if (!entry) return null;
  const q = entry.question_data;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <span className="text-sm font-medium text-slate-600">Pregunta {currentIdx + 1} de {practiceQueue.length}</span>
        <span className="text-xs text-academic-600 bg-academic-50 px-2 py-0.5 rounded font-medium">
          {SUBJECT_NAMES[entry.subject as SubjectId] ?? entry.subject}
        </span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <MathText text={q.question} className="text-base text-slate-800 font-medium block mb-4" />
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = 'border-slate-200 hover:border-academic-300 hover:bg-academic-50/50';
            if (verified) {
              if (i === q.correctIndex) cls = 'border-emerald-300 bg-emerald-50';
              else if (i === selected) cls = 'border-red-300 bg-red-50';
            } else if (selected === i) {
              cls = 'border-academic-400 bg-academic-50';
            }
            return (
              <button key={i} disabled={verified}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${cls} disabled:cursor-default`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    verified && i === q.correctIndex ? 'bg-emerald-500 text-white' :
                    verified && i === selected ? 'bg-red-500 text-white' :
                    selected === i ? 'bg-academic-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <MathText text={opt} className="text-sm text-slate-700" />
                </div>
              </button>
            );
          })}
        </div>
        {verified && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 mb-1">Explicación</p>
            <MathText text={q.explanation} className="text-sm text-amber-800" />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          {!verified ? (
            <button onClick={handleVerify} disabled={selected === null}
              className="px-6 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-50">
              Verificar
            </button>
          ) : (
            <button onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors flex items-center gap-2">
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
