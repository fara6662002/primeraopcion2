import { SubjectId } from './types';

export interface RawQ {
  id?: string;
  q: string;
  o: string[];
  c: number;
  e: string;
}

export type SupplementBank = Partial<Record<SubjectId, Record<string, RawQ[]>>>;

// Configuración ajustada a 1,000 preguntas por cada tema
export const TARGET_PER_TOPIC = 1000;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export class SupplementBankManager {
  private bank: SupplementBank = {};
  private seenQuestions: Set<string> = new Set();
  private totalCount: number = 0;

  /**
   * Agrega un arreglo masivo de preguntas a un tema específico.
   */
  public loadBatch(subject: SubjectId, topic: string, questions: RawQ[]): number {
    let addedCount = 0;

    for (const q of questions) {
      if (this.addQuestion(subject, topic, q)) {
        addedCount++;
      }
    }
    return addedCount;
  }

  /**
   * Agrega una pregunta individual validando la cuota de 1,000 y evitando duplicados.
   */
  public addQuestion(subject: SubjectId, topic: string, question: RawQ): boolean {
    const normalizedQ = normalizeText(question.q);

    // Evitar duplicados por contenido de la pregunta
    if (this.seenQuestions.has(normalizedQ)) {
      return false;
    }

    if (!this.bank[subject]) {
      this.bank[subject] = {};
    }
    if (!this.bank[subject]![topic]) {
      this.bank[subject]![topic] = [];
    }

    const currentCount = this.bank[subject]![topic].length;

    // Límite de 1,000 por tema
    if (currentCount >= TARGET_PER_TOPIC) {
      return false;
    }

    const formattedQuestion: RawQ = {
      ...question,
      id: question.id || `${subject}_${topic}_${currentCount + 1}`
    };

    this.bank[subject]![topic].push(formattedQuestion);
    this.seenQuestions.add(normalizedQ);
    this.totalCount++;

    return true;
  }

  public getBank(): SupplementBank {
    return this.bank;
  }

  public getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const subject in this.bank) {
      for (const topic in this.bank[subject as SubjectId]) {
        stats[`${subject}:${topic}`] = this.bank[subject as SubjectId]![topic].length;
      }
    }
    return stats;
  }
}

// Instancia global
const manager = new SupplementBankManager();

// --- EJEMPLO DE CARGA POR BLOQUES ---
// Para llenar las 1,000 preguntas de cada tema, se importan o agregan los lotes así:

/* 
import hvComprensionData from './data/hv_comprension.json';
manager.loadBatch('habilidad_verbal', 'comprension_lectura', hvComprensionData);
*/

export const SUPPLEMENT_BANK: SupplementBank = manager.getBank();