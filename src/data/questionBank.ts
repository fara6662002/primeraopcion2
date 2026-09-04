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

// Clave para guardar en el navegador las preguntas ya mostradas
const STORAGE_KEY_SEEN = 'ecoems_seen_question_ids';

// Banco base de preguntas (agrega o amplía tus preguntas dentro de este arreglo)
export const ALL_QUESTIONS: Question[] = [];

// Métodos para leer y guardar preguntas vistas en el navegador
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

// Función principal para obtener preguntas aleatorias sin repetición
export function getRandomQuestions(count: number, subject?: SubjectId): Question[] {
  if (ALL_QUESTIONS.length === 0) return [];

  // 1. Filtrar por materia si se especifica (para miniexámenes)
  let pool = subject 
    ? ALL_QUESTIONS.filter((q) => q.subject === subject)
    : ALL_QUESTIONS;

  // 2. Descartar reactivos ya mostrados anteriormente
  const seenIds = new Set(getSeenQuestionIds());
  let available = pool.filter((q) => !seenIds.has(q.id));

  // 3. Si se agotan los reactivos disponibles, reiniciar el registro para esa categoría
  if (available.length < count) {
    resetSeenQuestions();
    available = [...pool];
  }

  // 4. Algoritmo de mezcla aleatoria (Fisher-Yates)
  const arr = [...available];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // 5. Cortar la cantidad solicitada y registrar como vistas
  const selected = arr.slice(0, count);
  markQuestionsAsSeen(selected.map((q) => q.id));

  return selected;
}