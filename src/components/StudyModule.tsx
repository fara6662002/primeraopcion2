import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getRandomQuestions, 
  SUBJECT_NAMES, 
  type Question, 
  type SubjectId 
} from '../data/questionBank';
import { saveExamResult } from '../lib/store';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  ChevronRight,
  Clock
} from 'lucide-react';
import type { Page } from './Navbar';

type Props = {
  onNavigate: (page: Page) => void;
};

const SUBJECT_LIST: SubjectId[] = [
  'spanish',
  'math',
  'physics',
  'chemistry',
  'biology',
  'history',
  'geography',
  'civics',
  'verbal',
  'math_reasoning'
];

export default function StudyModule({ onNavigate }: Props) {
  const { user } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Iniciar miniexamen de 10 reactivos usando preguntas no repetidas por materia
  const startSubjectPractice = (subject: SubjectId) => {
    const loadedQuestions = getRandomQuestions(10, subject);
    setSelectedSubject(subject);
    setQuestions(loadedQuestions);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsFinished(false);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || !questions[currentIdx]) return;
    
    const currentQ = questions[currentIdx];
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      finishPractice();
    }
  };

  const finishPractice = async () => {
    setIsFinished(true);

    if (!user || questions.length === 0 || !selectedSubject) return;

    setIsSaving(true);
    let correctCount = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const percentage = (correctCount / questions.length) * 100;

    try {
      await saveExamResult({
        user_id: user.id,
        score: correctCount,
        correct_answers: correctCount,
        total_questions: questions.length,
        percentage: Number(percentage.toFixed(2)),
        time_spent_seconds: 0,
        breakdown_by_subject: [{
          subject: selectedSubject,
          correct: correctCount,
          total: questions.length
        }],
      });
    } catch (e) {
      console.error('Error al guardar resultado del miniexamen:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentQuestion = questions[currentIdx];

  // Vista 1: Selector de Materia
  if (!selectedSubject) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Miniexámenes por Materia</h1>
            <p className="text-sm text-slate-500 mt-1">
              Practica bloques cortos de 10 reactivos sin repetición acumulativa.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SUBJECT_LIST.map((subject) => (
            <div 
              key={subject}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all flex justify-between items-center group cursor-pointer"
              onClick={() => startSubjectPractice(subject)}
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {SUBJECT_NAMES[subject]}
                </h3>
                <p className="text-xs text-slate-400">10 preguntas aleatorias</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vista 2: Resultados del Miniexamen
  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) correctCount += 1;
    });

    const scorePct = (correctCount / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Práctica Finalizada</h1>
            <p className="text-sm text-slate-500 mt-1">{SUBJECT_NAMES[selectedSubject]}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Aciertos</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{correctCount} / {questions.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400">Porcentaje</p>
              <p className={`text-2xl font-bold mt-1 ${scorePct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {scorePct.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => startSubjectPractice(selectedSubject)}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Repetir Materia
            </button>
            <button
              onClick={() => setSelectedSubject(null)}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cambiar Materia
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista 3: Pregunta Activa
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400">Pregunta {currentIdx + 1} de {questions.length}</p>
          <p className="text-sm font-bold text-slate-800">{SUBJECT_NAMES[selectedSubject]}</p>
        </div>
        <button
          onClick={() => setSelectedSubject(null)}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          Salir de la práctica
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="space-y-2">
          {currentQuestion?.topic && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              Tema: {currentQuestion.topic}
            </span>
          )}
          <h2 className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            {currentQuestion?.text}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswer;
            
            let btnStyle = 'border-slate-200 text-slate-700 hover:bg-slate-50';
            
            if (isAnswerSubmitted) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-red-500 bg-red-50 text-red-900';
              } else {
                btnStyle = 'border-slate-100 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              btnStyle = 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium';
            }

            return (
              <button
                key={idx}
                disabled={isAnswerSubmitted}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm leading-snug flex-1">{option}</span>
                {isAnswerSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && currentQuestion?.explanation && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Explicación:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Comprobar Respuesta
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              {currentIdx + 1 < questions.length ? 'Siguiente Pregunta' : 'Ver Resultados'} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}