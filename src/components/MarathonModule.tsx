import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateMiniExam } from '@/data/questionGenerator';
import type { Question } from '@/data/questionBank';
import { SUBJECTS, SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import MathText from '@/components/MathText';
import { Zap, Check, X, RotateCcw, Trophy, AlertCircle, Flame, ArrowRight } from 'lucide-react';

type Phase = 'intro' | 'playing' | 'results';

export default function MarathonModule() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [answeredHistory, setAnsweredHistory] = useState<{ q: Question; correct: boolean }[]>([]);

  const startMarathon = () => {
    const pool: Question[] = [];
    SUBJECTS.forEach((s) => {
      pool.push(...generateMiniExam(s.id, s.topics[0], 5));
    });
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 50);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelected(null);
    setVerified(false);
    setErrors(0);
    setCorrectCount(0);
    setMaxStreak(0);
    setCurrentStreak(0);
    setAnsweredHistory([]);
    setPhase('playing');
  };

  const handleVerify = () => {
    if (selected === null) return;
    const q = questions[currentIdx];
    const isCorrect = selected === q.correctIndex;
    setVerified(true);
    setAnsweredHistory((prev) => [...prev, { q, correct: isCorrect }]);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setCurrentStreak((s) => {
        const ns = s + 1;
        setMaxStreak((m) => Math.max(m, ns));
        return ns;
      });
    } else {
      setErrors((e) => {
        const ne = e + 1;
        if (ne >= 3) {
          setTimeout(() => setPhase('results'), 1500);
        }
        return ne;
      });
      setCurrentStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setPhase('results');
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setVerified(false);
  };

  const q = questions[currentIdx];

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Modo Maratón</h1>
          <p className="text-white/80 text-sm">Desafío continuo sin límite de tiempo</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">¿Cómo funciona?</p>
              <p className="text-sm text-slate-500 mt-0.5">Responde preguntas de todas las materias sin límite de tiempo. El maratón termina cuando acumules 3 errores.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Racha máxima</p>
              <p className="text-sm text-slate-500 mt-0.5">Acumula respuestas correctas consecutivas para batir tu récord personal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">3 errores y se acaba</p>
              <p className="text-sm text-slate-500 mt-0.5">Solo tienes 3 vidas. Cada error te acerca al final del maratón.</p>
            </div>
          </div>
          <button onClick={startMarathon} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" /> Iniciar maratón
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">¡Maratón completado!</h1>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
            <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{correctCount}</p>
            <p className="text-xs text-slate-500">Aciertos</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
            <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{errors}</p>
            <p className="text-xs text-slate-500">Errores</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
            <Flame className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{maxStreak}</p>
            <p className="text-xs text-slate-500">Racha máxima</p>
          </div>
        </div>
        <button onClick={startMarathon} className="w-full mt-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors flex items-center justify-center gap-2">
          <RotateCcw className="w-5 h-5" /> Nuevo maratón
        </button>
      </div>
    );
  }

  if (!q) return null;

  const livesLeft = 3 - errors;

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-[fadeIn_0.2s_ease-out]">
      {/* Stats bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < livesLeft ? 'bg-red-500' : 'bg-slate-200'}`} />
            ))}
            <span className="text-xs text-slate-400 ml-1">{livesLeft} vidas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600">{currentStreak}</span>
            <span className="text-xs text-slate-400">racha</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">{correctCount} aciertos</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-academic-600 bg-academic-50 px-2 py-0.5 rounded font-medium">
            {SUBJECT_NAMES[q.subject as SubjectId] ?? q.subject}
          </span>
          <span className="text-xs text-slate-400">Pregunta {currentIdx + 1}</span>
        </div>
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
                  {verified && i === q.correctIndex && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-auto" />}
                  {verified && i === selected && i !== q.correctIndex && <X className="w-4 h-4 text-red-500 flex-shrink-0 ml-auto" />}
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
              className="px-6 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
