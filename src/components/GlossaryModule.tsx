import { useState, useMemo } from 'react';
import { SUBJECTS, type SubjectId } from '@/data/questionBank';
import { Search, BookText, ChevronRight } from 'lucide-react';
import MathText from '@/components/MathText';

type GlossaryEntry = {
  term: string;
  definition: string;
  subject: SubjectId;
};

const GLOSSARY: GlossaryEntry[] = [
  // Biología
  { term: 'Mitocondria', definition: 'Organelo encargado de producir energía (ATP) mediante la respiración celular.', subject: 'biologia' },
  { term: 'Célula eucariota', definition: 'Célula con núcleo definido y organelos membranales.', subject: 'biologia' },
  { term: 'ADN', definition: 'Ácido desoxirribonucleico, molécula que contiene la información genética.', subject: 'biologia' },
  { term: 'Fotosíntesis', definition: 'Proceso por el cual las plantas transforman luz solar en energía química.', subject: 'biologia' },
  { term: 'Ribosoma', definition: 'Organelo responsable de la síntesis de proteínas.', subject: 'biologia' },
  { term: 'Genética', definition: 'Rama de la biología que estudia la herencia y variación de los seres vivos.', subject: 'biologia' },
  // Física
  { term: 'Velocidad', definition: 'Magnitud vectorial que indica la rapidez y dirección de un movimiento.', subject: 'fisica' },
  { term: 'Aceleración', definition: 'Cambio de velocidad por unidad de tiempo. Se mide en m/s².', subject: 'fisica' },
  { term: 'Fuerza', definition: 'Interacción que cambia el estado de movimiento de un cuerpo. Unidad: Newton (N).', subject: 'fisica' },
  { term: 'Energía cinética', definition: 'Energía de un cuerpo en movimiento: $E_c = \\frac{1}{2}mv^2$.', subject: 'fisica' },
  { term: 'Gravedad', definition: 'Fuerza de atracción que ejerce la Tierra sobre los cuerpos. $g \\approx 9.8$ m/s².', subject: 'fisica' },
  // Química
  { term: 'Átomo', definition: 'Unidad más pequeña de un elemento que conserva sus propiedades químicas.', subject: 'quimica' },
  { term: 'Molécula', definition: 'Conjunto de átomos unidos por enlaces químicos.', subject: 'quimica' },
  { term: 'Reacción exotérmica', definition: 'Reacción que libera energía en forma de calor.', subject: 'quimica' },
  { term: 'Reacción endotérmica', definition: 'Reacción que absorbe energía del entorno.', subject: 'quimica' },
  { term: 'Tabla periódica', definition: 'Organización de los elementos químicos según su número atómico y propiedades.', subject: 'quimica' },
  { term: 'Enlace covalente', definition: 'Enlace químico donde los átomos comparten electrones.', subject: 'quimica' },
  // Español
  { term: 'Símil', definition: 'Figura retórica que compara dos cosas usando "como" o "cual".', subject: 'espanol' },
  { term: 'Metáfora', definition: 'Figura retórica que identifica un término real con uno imaginario.', subject: 'espanol' },
  { term: 'Hipérbaton', definition: 'Figura que altera el orden lógico de las palabras en una oración.', subject: 'espanol' },
  { term: 'Idea principal', definition: 'Concepto central de un texto, del que derivan los demás.', subject: 'espanol' },
  { term: 'Nexo', definition: 'Palabra que relaciona ideas u oraciones (pero, porque, sin embargo).', subject: 'espanol' },
  // Matemáticas
  { term: 'Fracción', definition: 'Expresión $\\frac{a}{b}$ que representa una división. $a$ es numerador, $b$ denominador.', subject: 'matematicas' },
  { term: 'Ecuación', definition: 'Igualdad que contiene incógnitas. Resolverla es encontrar el valor de la incógnita.', subject: 'matematicas' },
  { term: 'Hipotenusa', definition: 'Lado mayor de un triángulo rectángulo, opuesto al ángulo recto.', subject: 'matematicas' },
  { term: 'Porcentaje', definition: 'Forma de expresar una proporción por cada 100 unidades. $x\\% = \\frac{x}{100}$.', subject: 'matematicas' },
  // Habilidad Matemática
  { term: 'Sucesión aritmética', definition: 'Secuencia con diferencia constante entre términos: $a_n = a_1 + (n-1)d$.', subject: 'habilidad_matematica' },
  { term: 'Sucesión geométrica', definition: 'Secuencia donde cada término se multiplica por una razón constante.', subject: 'habilidad_matematica' },
  { term: 'Razonamiento lógico', definition: 'Proceso mental para deducir conclusiones a partir de premisas.', subject: 'habilidad_matematica' },
  // Habilidad Verbal
  { term: 'Sinónimo', definition: 'Palabra con significado similar o igual a otra.', subject: 'habilidad_verbal' },
  { term: 'Antónimo', definition: 'Palabra con significado opuesto a otra.', subject: 'habilidad_verbal' },
  { term: 'Analogía', definition: 'Relación de semejanza entre dos cosas diferentes.', subject: 'habilidad_verbal' },
  { term: 'Inferencia', definition: 'Conclusión obtenida a partir de datos implícitos en un texto.', subject: 'habilidad_verbal' },
  // Historia
  { term: 'Mesoamérica', definition: 'Región cultural que abarca el centro y sur de México y parte de Centroamérica.', subject: 'historia' },
  { term: 'Conquista', definition: 'Proceso militar y político de sometimiento de los pueblos indígenas (1521).', subject: 'historia' },
  { term: 'Independencia', definition: 'Proceso político que dio fin al dominio español en México (1810-1821).', subject: 'historia' },
  { term: 'Revolución Mexicana', definition: 'Movimiento armado (1910-1920) contra la dictadura de Porfirio Díaz.', subject: 'historia' },
  // Geografía
  { term: 'Latitud', definition: 'Distancia angular al ecuador, medida en grados (N o S).', subject: 'geografia' },
  { term: 'Longitud', definition: 'Distancia angular al meridiano de Greenwich, medida en grados (E u O).', subject: 'geografia' },
  { term: 'Clima', definition: 'Conjunto de condiciones atmosféricas que caracterizan una región.', subject: 'geografia' },
  // Formación Cívica y Ética
  { term: 'Ciudadanía', definition: 'Condición de miembro de una comunidad política con derechos y obligaciones.', subject: 'formacion_civica_etica' },
  { term: 'Democracia', definition: 'Forma de gobierno donde el poder emana del pueblo mediante elecciones.', subject: 'formacion_civica_etica' },
  { term: 'Constitución', definition: 'Ley suprema que organiza el Estado y garantiza derechos ciudadanos.', subject: 'formacion_civica_etica' },
  { term: 'Referéndum', definition: 'Votación directa donde los ciudadanos aprueban o rechazan una propuesta.', subject: 'formacion_civica_etica' },
];

export default function GlossaryModule() {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');

  const filtered = useMemo(() => {
    return GLOSSARY.filter((e) => {
      const matchesSearch = e.term.toLowerCase().includes(search.toLowerCase()) || e.definition.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = filterSubject === 'all' || e.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });
  }, [search, filterSubject]);

  const subjectName = (id: SubjectId) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookText className="w-6 h-6 text-academic-500" /> Glosario
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Diccionario de términos clave por materia</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar término o definición…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSubject === 'all' ? 'bg-academic-100 text-academic-700 dark:bg-academic-900/30 dark:text-academic-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
            Todas
          </button>
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => setFilterSubject(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSubject === s.id ? 'bg-academic-100 text-academic-700 dark:bg-academic-900/30 dark:text-academic-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <BookText className="w-12 h-12 text-slate-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No se encontraron términos.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((entry, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{entry.term}</h3>
                <span className="text-xs text-academic-600 dark:text-academic-400 bg-academic-50 dark:bg-academic-900/30 px-2 py-0.5 rounded font-medium flex-shrink-0">
                  {subjectName(entry.subject)}
                </span>
              </div>
              <MathText text={entry.definition} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed block" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
