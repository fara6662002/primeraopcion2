import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SUBJECTS, type SubjectId, type SubjectInfo, type Question } from '@/data/questionBank';
import { generateMiniExam } from '@/data/questionGenerator';
import MathText from '@/components/MathText';
import { getMiniExamAttemptsToday, MINI_EXAM_DAILY_LIMIT, addMiniExamResult } from '@/lib/store';
import { ArrowLeft, ChevronDown, Check, X, BookOpen, Lightbulb, ChevronRight, GraduationCap, RotateCcw, Trophy, AlertCircle } from 'lucide-react';

const MINI_EXAM_SIZE = 10;

export default function StudyModule() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [examKey, setExamKey] = useState(0);

  if (selectedSubject && selectedTopic) {
    return (
      <PracticeView
        key={examKey}
        subject={selectedSubject}
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
        onRetry={() => setExamKey((k) => k + 1)}
      />
    );
  }

  if (selectedSubject) {
    return (
      <SubjectTopics
        subject={selectedSubject}
        onBack={() => setSelectedSubject(null)}
        onSelectTopic={setSelectedTopic}
      />
    );
  }

  return (
    <SubjectGrid onSelectSubject={(id) => setSelectedSubject(SUBJECTS.find((s) => s.id === id) ?? null)} />
  );
}

function SubjectGrid({ onSelectSubject }: { onSelectSubject: (id: SubjectId) => void }) {
  return (
    <div className="animate-[fadeIn_0.2s_ease-out]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Temarios y Estudio por Materia</h1>
        <p className="text-slate-500 mt-1 text-sm">Selecciona una asignatura para desplegar sus temas oficiales.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS.map((s) => (
          <button key={s.id} onClick={() => onSelectSubject(s.id)}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-academic-300 transition-all text-left">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-academic-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-slate-800 group-hover:text-academic-600 transition-colors">{s.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{s.topics.length} temas</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubjectTopics({ subject, onBack, onSelectTopic }: { subject: SubjectInfo; onBack: () => void; onSelectTopic: (topic: string) => void }) {
  return (
    <div className="animate-[fadeIn_0.2s_ease-out]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-academic-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a materias
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-md`}>
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{subject.name}</h1>
          <p className="text-slate-500 text-sm">Mini-exámenes de 10 preguntas · Máximo {MINI_EXAM_DAILY_LIMIT} intentos por tema al día</p>
        </div>
      </div>
      <div className="space-y-2">
        {subject.topics.map((topic) => (
          <button key={topic} onClick={() => onSelectTopic(topic)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-academic-300 transition-all text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-academic-50 flex items-center justify-center transition-colors">
                <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-academic-500 transition-colors" />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-academic-600 transition-colors text-sm">{topic}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-academic-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}

type Phase = 'intro' | 'exam' | 'results';

function PracticeView({ subject, topic, onBack, onRetry }: { subject: SubjectInfo; topic: string; onBack: () => void; onRetry: () => void }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [attemptsToday, setAttemptsToday] = useState(0);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMiniExamAttemptsToday(user.id, subject.id, topic).then((n) => {
      setAttemptsToday(n);
      setLoadingAttempts(false);
    }).catch(() => setLoadingAttempts(false));
  }, [user, subject.id, topic]);

  const attemptsLeft = MINI_EXAM_DAILY_LIMIT - attemptsToday;

  const startExam = () => {
    const qs = generateMiniExam(subject.id, topic, MINI_EXAM_SIZE);
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(null));
    setCurrentIdx(0);
    setSelected(null);
    setVerified(false);
    setPhase('exam');
  };

  const saveResult = async (correct: number, total: number) => {
    if (!user) return;
    const pct = total > 0 ? (correct / total) * 100 : 0;
    try {
      await addMiniExamResult({ userId: user.id, subject: subject.id, topic, totalQuestions: total, correctAnswers: correct, percentage: pct });
      setAttemptsToday((n) => n + 1);
    } catch { /* ignore */ }
  };

  if (phase === 'intro') {
    const limitReached = attemptsLeft <= 0;
    return (
      <div className="max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-academic-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a {subject.name}
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${subject.color} p-8 text-center`}>
            <BookOpen className="w-12 h-12 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-white/80 mt-2 text-sm">{topic}</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-3xl font-bold text-slate-800">{MINI_EXAM_SIZE}</p>
                <p className="text-xs text-slate-500 mt-1">Preguntas aleatorias</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-3xl font-bold text-slate-800">{loadingAttempts ? '—' : attemptsLeft}</p>
                <p className="text-xs text-slate-500 mt-1">Intentos restantes hoy</p>
              </div>
            </div>
            {limitReached ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700">Límite diario alcanzado</p>
                  <p className="text-xs text-amber-600 mt-0.5">Has usado tus {MINI_EXAM_DAILY_LIMIT} intentos para este tema hoy. Vuelve mañana después de las 00:00 h.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-6 text-sm text-slate-600">
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>Cada intento genera un conjunto diferente de preguntas.</span></div>
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>Verifica cada respuesta y consulta su explicación al instante.</span></div>
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /><span>Al finalizar verás tu calificación y el desglose completo.</span></div>
              </div>
            )}
            <button onClick={startExam} disabled={limitReached}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-academic-600/25">
              <GraduationCap className="w-5 h-5" /> Iniciar mini-examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' || questions.length === 0) {
    if (questions.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-slate-500">No hay preguntas disponibles para este tema.</p>
          <button onClick={onBack} className="mt-4 text-academic-600 hover:text-academic-700 font-medium">Volver</button>
        </div>
      );
    }
    const correctCount = answers.filter((a, i) => a !== null && a === questions[i].correctIndex).length;
    return (
      <ResultsView
        subject={subject}
        topic={topic}
        questions={questions}
        answers={answers}
        attemptsLeft={MINI_EXAM_DAILY_LIMIT - attemptsToday}
        onBack={onBack}
        onRetry={() => { onRetry(); startExam(); }}
        onRestart={startExam}
      />
    );
  }

  const q = questions[currentIdx];

  const handleVerify = () => {
    if (selected === null) return;
    setVerified(true);
    setAnswers((prev) => { const n = [...prev]; n[currentIdx] = selected; return n; });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(answers[currentIdx + 1] ?? null);
      setVerified(answers[currentIdx + 1] !== null);
    } else {
      const correctCount = answers.filter((a, i) => a !== null && a === questions[i].correctIndex).length;
      saveResult(correctCount, questions.length);
      setPhase('results');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setSelected(answers[currentIdx - 1] ?? null);
      setVerified(answers[currentIdx - 1] !== null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-[fadeIn_0.2s_ease-out]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-academic-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a {subject.name}
      </button>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">{subject.name}</h1>
          <p className="text-sm text-slate-500">{topic}</p>
        </div>
        <p className="text-sm font-medium text-slate-600">Pregunta {currentIdx + 1} de {questions.length}</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
        <div className="bg-academic-600 h-1.5 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <MathText text={q.question} className="text-lg text-slate-800 font-medium leading-relaxed block mb-6 whitespace-pre-line" />
        <div className="space-y-3">
          {q.options.map((opt: string, i: number) => {
            const isSelected = selected === i;
            const isCorrectOpt = i === q.correctIndex;
            let cls = 'border-slate-200 hover:border-academic-300 hover:bg-academic-50/50';
            if (verified && isCorrectOpt) cls = 'border-emerald-400 bg-emerald-50';
            else if (verified && isSelected && !isCorrectOpt) cls = 'border-red-400 bg-red-50';
            else if (isSelected) cls = 'border-academic-500 bg-academic-50';
            return (
              <button key={i} onClick={() => !verified && setSelected(i)} disabled={verified}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${cls} ${verified ? 'cursor-default' : 'cursor-pointer'}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  verified && isCorrectOpt ? 'bg-emerald-500 text-white' :
                  verified && isSelected && !isCorrectOpt ? 'bg-red-500 text-white' :
                  isSelected ? 'bg-academic-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {verified && isCorrectOpt ? <Check className="w-4 h-4" /> :
                   verified && isSelected && !isCorrectOpt ? <X className="w-4 h-4" /> :
                   String.fromCharCode(65 + i)}
                </span>
                <MathText text={opt} className="text-slate-700" />
              </button>
            );
          })}
        </div>
        {verified && (
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Explicación</p>
            <MathText text={q.explanation} className="text-sm text-amber-800" />
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          {!verified ? (
            <button onClick={handleVerify} disabled={selected === null}
              className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Verificar respuesta
            </button>
          ) : (
            <>
              {selected === q.correctIndex ? (
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5"><Check className="w-4 h-4" /> ¡Correcto!</span>
              ) : (
                <span className="text-sm font-bold text-red-500 flex items-center gap-1.5"><X className="w-4 h-4" /> Respuesta incorrecta</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {currentIdx > 0 && <button onClick={handlePrev} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">Anterior</button>}
                {currentIdx < questions.length - 1 ? (
                  <button onClick={handleNext} className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">Siguiente</button>
                ) : (
                  <button onClick={handleNext} className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">Ver resultados</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsView({ subject, topic, questions, answers, attemptsLeft, onBack, onRetry, onRestart }: {
  subject: SubjectInfo; topic: string; questions: Question[]; answers: (number | null)[]; attemptsLeft: number;
  onBack: () => void; onRetry: () => void; onRestart: () => void;
}) {
  const [showDetails, setShowDetails] = useState(true);
  const correctCount = answers.filter((a, i) => a !== null && a === questions[i].correctIndex).length;
  const percentage = Math.round((correctCount / questions.length) * 100);
  const grade = percentage >= 70 ? { label: 'Aprobado', color: 'text-emerald-600' } : percentage >= 50 ? { label: 'Regular', color: 'text-amber-600' } : { label: 'Reprobado', color: 'text-red-500' };

  return (
    <div className="max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-academic-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a {subject.name}
      </button>
      <div className={`bg-gradient-to-br ${subject.color} rounded-2xl p-8 text-white shadow-xl text-center`}>
        <Trophy className="w-12 h-12 mx-auto mb-3" />
        <p className="text-4xl font-bold">{percentage}%</p>
        <p className="text-white/80 text-sm mt-1">{correctCount} de {questions.length} aciertos</p>
        <p className={`text-sm font-bold mt-2 ${grade.color} bg-white/90 inline-block px-3 py-1 rounded-lg`}>{grade.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6">
        {attemptsLeft > 0 ? (
          <button onClick={onRestart} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> Nuevo mini-examen
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-600 font-medium text-sm">
            <AlertCircle className="w-4 h-4" /> Límite diario alcanzado
          </div>
        )}
        <button onClick={onBack} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">
          Otro tema
        </button>
      </div>
      <button onClick={() => setShowDetails(!showDetails)} className="w-full mt-6 flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <span className="font-semibold text-slate-700 text-sm">Desglose y explicaciones</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>
      {showDetails && (
        <div className="mt-2 space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  <MathText text={q.question} className="text-sm text-slate-700 flex-1" />
                </div>
                <div className="ml-6 space-y-1">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`text-xs flex items-center gap-1.5 ${j === q.correctIndex ? 'text-emerald-600 font-semibold' : j === userAnswer && !isCorrect ? 'text-red-500 line-through' : 'text-slate-400'}`}>
                      <span>{String.fromCharCode(65 + j)}.</span>
                      <MathText text={opt} />
                      {j === q.correctIndex && <Check className="w-3 h-3" />}
                    </div>
                  ))}
                </div>
                <div className="ml-6 mt-2 p-2 bg-amber-50 rounded-lg">
                  <MathText text={q.explanation} className="text-xs text-amber-700" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
