import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getRandomQuestions, 
  SUBJECT_NAMES, 
  type Question, 
  type SubjectId 
} from '../data/questionBank';
import { saveExamResult } from '../lib/store';
import { 
  Timer, 
  AlertCircle, 
  Trophy, 
  BarChart3, 
  ArrowLeft, 
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import type { Page } from './Navbar';

type Props = {
  onNavigate: (page: Page) => void;
};

const TOTAL_TIME_SECONDS = 3 * 60 * 60;
const TOTAL_QUESTIONS_COUNT = 128;

export default function SimulacroModule({ onNavigate }: Props) {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startExam = () => {
    const loadedQuestions = getRandomQuestions(TOTAL_QUESTIONS_COUNT);
    setQuestions(loadedQuestions);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setIsFinished(false);
    setIsExamActive(true);
  };

  const handleFinishExam = useCallback(async () => {
    setIsExamActive(false);
    setIsFinished(true);

    if (!user || questions.length === 0) return;

    setIsSaving(true);
    let correctCount = 0;

    const subjectMap: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      if (!subjectMap[q.subject]) {
        subjectMap[q.subject] = { correct: 0, total: 0 };
      }
      subjectMap[q.subject].total += 1;

      const selectedOption = userAnswers[q.id];
      if (selectedOption === q.correctAnswer) {
        correctCount += 1;
        subjectMap[q.subject].correct += 1;
      }
    });

    const breakdown = Object.entries(subjectMap).map(([subj, data]) => ({
      subject: subj as SubjectId,
      correct: data.correct,
      total: data.total,
    }));

    const percentage = (correctCount / questions.length) * 100;
    const timeSpent = TOTAL_TIME_SECONDS - timeLeft;

    try {
      await saveExamResult({
        user_id: user.id,
        score: correctCount,
        correct_answers: correctCount,
        total_questions: questions.length,
        percentage: Number(percentage.toFixed(2)),
        time_spent_seconds: timeSpent,
        breakdown_by_subject: breakdown,
      });
    } catch (e) {
      console.error('Error al guardar resultado del simulacro:', e);
    } finally {
      setIsSaving(false);
    }
  }, [user, questions, userAnswers, timeLeft]);

  useEffect(() => {
    if (!isExamActive || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamActive, isFinished, handleFinishExam]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQuestion = questions[currentIdx];

  if (!isExamActive && !isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Timer className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Simulacro Tipo COMIPEMS / ECOEMS</h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Prueba completa bajo condiciones reales de tiempo y reactivos seleccionados sin repetición acumulativa.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Reactivos</p>
              <p className="text-lg font-bold text-slate-700 mt-0.5">128 preguntas</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Tiempo Límite</p>
              <p className="text-lg font-bold text-slate-700 mt-0.5">3 Horas</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-medium">Preguntas</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">Sin Repetición</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Recomendaciones antes de iniciar:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-700">
                <li>Asegúrate de contar con tiempo continuo sin interrupciones.</li>
                <li>Ten a la mano hoja y lápiz para tus operaciones.</li>
                <li>El temporizador no se detendrá una vez iniciado.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
          >
            Comenzar Simulacro
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const totalCount = questions.length;
    let correctCount = 0;
    const subjectStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { correct: 0, total: 0 };
      }
      subjectStats[q.subject].total += 1;

      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
        subjectStats[q.subject].correct += 1;
      }
    });

    const scorePct = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Resultados del Simulacro</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSaving ? 'Guardando avance en tu perfil...' : 'Tu desempeño ha sido registrado.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Aciertos Total</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{correctCount} / {totalCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Porcentaje</p>
              <p className={`text-2xl font-bold mt-1 ${scorePct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {scorePct.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Respondidas</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{answeredCount} / {totalCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Tiempo Invertido</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{formatTime(TOTAL_TIME_SECONDS - timeLeft)}</p>
            </div>
          </div>

          <div className="text-left space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Desglose por Materia
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(subjectStats).map(([subjKey, data]) => {
                const pct = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                return (
                  <div key={subjKey} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{SUBJECT_NAMES[subjKey as SubjectId] ?? subjKey}</span>
                      <span className="text-slate-500">{data.correct}/{data.total} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={startExam}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Intentar otro simulacro
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Reactivo {currentIdx + 1} de {questions.length}</p>
            <p className="text-sm font-bold text-slate-800">
              {SUBJECT_NAMES[currentQuestion?.subject] ?? currentQuestion?.subject}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
          timeLeft < 900 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <Timer className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={handleFinishExam}
          className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-semibold text-xs transition-colors"
        >
          Finalizar examen
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              Tema: {currentQuestion?.topic}
            </span>
            <h2 className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
              {currentQuestion?.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = userAnswers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="text-xs text-slate-400">
              {answeredCount} de {questions.length} respondidas
            </span>

            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mapa de preguntas</h3>
          <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'ring-2 ring-blue-600 ring-offset-1 bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}