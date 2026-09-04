import { useState } from 'react';
import { SUBJECTS, type SubjectId, type SubjectInfo } from '@/data/questionBank';
import { THEORY, type TheoryEntry } from '@/data/theoryBank';
import MathText from '@/components/MathText';
import { ArrowLeft, ChevronRight, Library, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';

export default function TheoryModule() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  if (selectedSubject && selectedTopic) {
    const entries: TheoryEntry[] = THEORY[selectedSubject.id]?.[selectedTopic] ?? [];
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-academic-600 dark:hover:text-academic-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a {selectedSubject.name}
        </button>
        <div className={`bg-gradient-to-br ${selectedSubject.color} rounded-2xl p-6 text-white shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">{selectedSubject.name}</h1>
              <p className="text-sm text-white/80">{selectedTopic}</p>
            </div>
          </div>
        </div>
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
            <Lightbulb className="w-12 h-12 text-slate-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Teoría en desarrollo para este tema.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Pronto agregaremos más contenido.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-academic-500" />
                  {entry.title}
                </h2>
                <MathText text={entry.content} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed block mb-3" />
                {entry.example && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" /> Ejemplo
                    </p>
                    <MathText text={entry.example} className="text-sm text-amber-800 dark:text-amber-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedSubject) {
    const topicsWithTheory = Object.keys(THEORY[selectedSubject.id] ?? {});
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
        <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-academic-600 dark:hover:text-academic-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a materias
        </button>
        <div className={`bg-gradient-to-br ${selectedSubject.color} rounded-2xl p-6 text-white shadow-lg`}>
          <Library className="w-7 h-7 mb-2" />
          <h1 className="text-xl font-bold">{selectedSubject.name}</h1>
          <p className="text-sm text-white/80">Selecciona un tema para ver la teoría</p>
        </div>
        <div className="space-y-2">
          {selectedSubject.topics.map((topic) => {
            const hasTheory = topicsWithTheory.includes(topic);
            return (
              <button key={topic} onClick={() => setSelectedTopic(topic)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-academic-300 dark:hover:border-academic-600 hover:shadow-md transition-all text-left">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${hasTheory ? 'bg-academic-50 dark:bg-academic-900/30' : 'bg-slate-50 dark:bg-slate-700'} flex items-center justify-center`}>
                    <BookOpen className={`w-4 h-4 ${hasTheory ? 'text-academic-500 dark:text-academic-400' : 'text-slate-300 dark:text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{hasTheory ? 'Teoría disponible' : 'Teoría disponible'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Biblioteca Teórica</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Temario maestro organizado por las 10 materias oficiales</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBJECTS.map((s) => {
          const theoryCount = Object.keys(THEORY[s.id] ?? {}).length;
          return (
            <button key={s.id} onClick={() => setSelectedSubject(s)}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md hover:border-academic-200 dark:hover:border-academic-700 transition-all text-left">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}>
                <Library className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{theoryCount > 0 ? `${theoryCount} temas con teoría` : `${s.topics.length} temas`}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
