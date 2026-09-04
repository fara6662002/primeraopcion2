import { expandedQuestions } from './expandedBank';
import { supplementQuestions } from './supplementBank';
import { theoryQuestions } from './theoryBank';

export type SubjectId = 
  | 'spanish' 
  | 'math' 
  | 'physics' 
  | 'chemistry' 
  | 'biology' 
  | 'history' 
  | 'geography' 
  | 'civics' 
  | 'verbal' 
  | 'math_reasoning';

export interface Question {
  id: string;
  subject: SubjectId;
  topic: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export const SUBJECT_NAMES: Record<SubjectId, string> = {
  spanish: 'Español',
  math: 'Matemáticas',
  physics: 'Física',
  chemistry: 'Química',
  biology: 'Biología',
  history: 'Historia',
  geography: 'Geografía',
  civics: 'Formación Cívica y Ética',
  verbal: 'Habilidad Verbal',
  math_reasoning: 'Habilidad Matemática',
};

const STORAGE_KEY_SEEN = 'ecoems_seen_question_ids';

// Combinación de tus bancos de preguntas
export const ALL_QUESTIONS: Question[] = [
  ...(Array.isArray(expandedQuestions) ? expandedQuestions : []),
  ...(Array.isArray(supplementQuestions) ? supplementQuestions : []),
  ...(Array.isArray(theoryQuestions) ? theoryQuestions : []),
] as Question[];

export function getSeenQuestionIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SEEN);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function markQuestionsAsSeen(ids: string[]) {
  try {
    const seen = new Set(getSeenQuestionIds());
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(seen)));
  } catch (e) {
    console.error('Error al guardar historial de preguntas vistas:', e);
  }
}

export function resetSeenQuestions() {
  try {
    localStorage.removeItem(STORAGE_KEY_SEEN);
  } catch (e) {
    console.error('Error al reiniciar el historial de preguntas:', e);
  }
}

export function getRandomQuestions(count: number, subject?: SubjectId): Question[] {
  if (!ALL_QUESTIONS || ALL_QUESTIONS.length === 0) return [];

  let pool = subject 
    ? ALL_QUESTIONS.filter((q) => q.subject === subject)
    : ALL_QUESTIONS;

  const seenIds = new Set(getSeenQuestionIds());
  let available = pool.filter((q) => !seenIds.has(q.id));

  if (available.length < count) {
    resetSeenQuestions();
    available = [...pool];
  }

  const arr = [...available];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const selected = arr.slice(0, count);
  markQuestionsAsSeen(selected.map((q) => q.id));

  return selected;
}