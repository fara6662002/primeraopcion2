import { EXPANDED_BANK } from './expandedBank';
import { SUPPLEMENT_BANK } from './supplementBank';
import { THEORY_BANK } from './theoryBank';

export type SubjectId =
  | 'espanol'
  | 'matematicas'
  | 'fisica'
  | 'quimica'
  | 'biologia'
  | 'historia'
  | 'geografia'
  | 'formacion_civica_etica'
  | 'habilidad_verbal'
  | 'habilidad_matematica';

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
  espanol: 'Español',
  matematicas: 'Matemáticas',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
  historia: 'Historia',
  geografia: 'Geografía',
  formacion_civica_etica: 'Formación Cívica y Ética',
  habilidad_verbal: 'Habilidad Verbal',
  habilidad_matematica: 'Habilidad Matemática',
};

const STORAGE_KEY_SEEN = 'ecoems_seen_question_ids';

// Función auxiliar para aplanar estructuras tipo { materia: { tema: RawQ[] } } o arreglos de preguntas
function flattenBank(bank: any): Question[] {
  if (!bank || typeof bank !== 'object') return [];
  
  // Si ya es un arreglo plano de preguntas
  if (Array.isArray(bank)) {
    return bank.map((q, idx) => ({
      id: q.id || `q_flat_${idx}`,
      subject: q.subject || 'matematicas',
      topic: q.topic || 'General',
      text: q.text || q.q || '',
      options: q.options || q.o || [],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.c ?? 0),
      explanation: q.explanation || q.e || '',
    }));
  }

  const result: Question[] = [];

  Object.entries(bank).forEach(([subjectKey, topics]) => {
    const subject = subjectKey as SubjectId;
    if (topics && typeof topics === 'object') {
      Object.entries(topics as Record<string, any[]>).forEach(([topic, questions]) => {
        if (Array.isArray(questions)) {
          questions.forEach((q, idx) => {
            result.push({
              id: q.id || `${subject}_${topic}_${idx}`,
              subject,
              topic,
              text: q.text || q.q || '',
              options: q.options || q.o || [],
              correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.c ?? 0),
              explanation: q.explanation || q.e || '',
            });
          });
        }
      });
    }
  });

  return result;
}

// Combinación y aplanado de todos los bancos de preguntas
export const ALL_QUESTIONS: Question[] = [
  ...flattenBank(EXPANDED_BANK),
  ...flattenBank(SUPPLEMENT_BANK),
  ...flattenBank(THEORY_BANK),
];

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

  if (pool.length === 0) return [];

  const seenIds = new Set(getSeenQuestionIds());
  let available = pool.filter((q) => !seenIds.has(q.id));

  // Si se agotaron las preguntas no vistas para el filtro, reiniciamos historial del pool
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