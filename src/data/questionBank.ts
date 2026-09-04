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
  explanation: string;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  color: string;
  topics: string[];
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

export const SUBJECTS: SubjectInfo[] = [
  { id: 'spanish', name: 'Español', color: 'from-blue-500 to-indigo-600', topics: ['Funciones de la lengua', 'Gramática', 'Ortografía', 'Comprensión lectora'] },
  { id: 'math', name: 'Matemáticas', color: 'from-emerald-500 to-teal-600', topics: ['Álgebra', 'Aritmética', 'Geometría', 'Ecuaciones'] },
  { id: 'physics', name: 'Física', color: 'from-amber-500 to-orange-600', topics: ['Movimiento', 'Fuerzas', 'Energía', 'Electricidad y Magnetismo'] },
  { id: 'chemistry', name: 'Química', color: 'from-rose-500 to-pink-600', topics: ['Estructura atómica', 'Tabla periódica', 'Enlaces químicos', 'Reacciones químicas'] },
  { id: 'biology', name: 'Biología', color: 'from-green-500 to-emerald-700', topics: ['Célula', 'Genética', 'Evolución', 'Ecología'] },
  { id: 'history', name: 'Historia', color: 'from-purple-500 to-violet-600', topics: ['Historia Universal', 'Historia de México', 'Revolución Mexicana', 'Mundo Contemporáneo'] },
  { id: 'geography', name: 'Geografía', color: 'from-cyan-500 to-blue-600', topics: ['Geografía física', 'Geografía humana', 'Recursos naturales', 'Geopolítica'] },
  { id: 'civics', name: 'Formación Cívica y Ética', color: 'from-teal-500 to-emerald-600', topics: ['Derechos humanos', 'Democracia', 'Valores y ética', 'Convivencia'] },
  { id: 'verbal', name: 'Habilidad Verbal', color: 'from-fuchsia-500 to-pink-600', topics: ['Sinónimos y antónimos', 'Analogías', 'Comprensión de textos', 'Completar oraciones'] },
  { id: 'math_reasoning', name: 'Habilidad Matemática', color: 'from-sky-500 to-indigo-600', topics: ['Secuencias numéricas', 'Patrones espaciales', 'Problemas de lógica', 'Razonamiento abstracto'] },
];

// Reemplaza esta lista con las 1000 preguntas completas de tu repositorio
export const ALL_QUESTIONS: Question[] = [
  // ... Tu arreglo completo de preguntas
];

// Claves para el almacenamiento persistente de preguntas vistas
const STORAGE_KEY_SEEN = 'ecoems_seen_question_ids';

/**
 * Obtiene la lista de IDs de preguntas que ya han sido utilizadas.
 */
function getSeenQuestionIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SEEN);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda y actualiza la lista de preguntas vistas.
 */
function markQuestionsAsSeen(ids: string[]) {
  try {
    const seen = new Set(getSeenQuestionIds());
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(seen)));
  } catch (e) {
    console.error('Error al guardar historial de preguntas', e);
  }
}

/**
 * Reinicia el ciclo de preguntas vistas cuando el banco se ha agotado.
 */
export function resetSeenQuestions() {
  try {
    localStorage.removeItem(STORAGE_KEY_SEEN);
  } catch (e) {
    console.error('Error al reiniciar preguntas vistas', e);
  }
}

/**
 * Mezcla un arreglo de forma estrictamente aleatoria usando Fisher-Yates shuffle.
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Genera un conjunto de preguntas únicas sin repeticiones inmediatas ni históricas.
 * Sirve tanto para miniexámenes como para el examen de prueba completo.
 */
export function getRandomQuestions(
  count: number,
  subjectFilter?: SubjectId
): Question[] {
  // 1. Filtrar preguntas por materia si aplica
  let pool = subjectFilter
    ? ALL_QUESTIONS.filter((q) => q.subject === subjectFilter)
    : ALL_QUESTIONS;

  if (pool.length === 0) return [];

  // 2. Obtener preguntas vistas
  const seenIds = new Set(getSeenQuestionIds());

  // 3. Filtrar preguntas no vistas dentro del pool seleccionado
  let availableQuestions = pool.filter((q) => !seenIds.has(q.id));

  // 4. Si las disponibles son menores a las requeridas, reiniciar historial para esa categoría
  if (availableQuestions.length < count) {
    // Eliminar del historial solo los IDs pertenecientes al pool actual
    const currentPoolIds = new Set(pool.map((q) => q.id));
    const updatedSeen = Array.from(seenIds).filter((id) => !currentPoolIds.has(id));
    
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(updatedSeen));
    } catch (e) {
      console.error(e);
    }

    // El pool vuelve a estar completamente disponible
    availableQuestions = [...pool];
  }

  // 5. Mezclar de forma estrictamente aleatoria
  const shuffled = shuffleArray(availableQuestions);

  // 6. Tomar exactamente el número de preguntas solicitado asegurando unicidad por ID
  const selectedMap = new Map<string, Question>();
  for (const question of shuffled) {
    if (selectedMap.size >= count) break;
    if (!selectedMap.has(question.id)) {
      selectedMap.set(question.id, question);
    }
  }

  const selectedQuestions = Array.from(selectedMap.values());

  // 7. Marcar las preguntas seleccionadas como vistas
  markQuestionsAsSeen(selectedQuestions.map((q) => q.id));

  return selectedQuestions;
}