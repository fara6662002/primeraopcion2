export type SubjectId =
  | 'habilidad_verbal'
  | 'matematicas'
  | 'habilidad_matematica'
  | 'espanol'
  | 'biologia'
  | 'fisica'
  | 'quimica'
  | 'historia'
  | 'geografia'
  | 'formacion_civica_etica';

export type Question = {
  id: string;
  subject: SubjectId;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type SubjectInfo = {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  topics: string[];
};

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'habilidad_verbal',
    name: 'Habilidad Verbal',
    icon: 'MessageSquareText',
    color: 'from-blue-500 to-cyan-500',
    topics: ['Comprensión de lectura', 'Manejo de vocabulario'],
  },
  {
    id: 'geografia',
    name: 'Geografía',
    icon: 'Globe2',
    color: 'from-teal-500 to-cyan-600',
    topics: [
      'El espacio geográfico y los mapas',
      'Recursos naturales y preservación del ambiente',
      'Dinámica de la población y riesgos',
      'Espacios económicos y desigualdad social',
      'Espacios culturales y políticos',
    ],
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: 'Atom',
    color: 'from-sky-500 to-indigo-500',
    topics: [
      'El movimiento. La descripción de los cambios en la naturaleza',
      'Las fuerzas. La explicación de los cambios',
      'Las interacciones de la materia. Un modelo para describir lo que no percibimos',
      'Manifestaciones de la estructura interna de la materia',
    ],
  },
  {
    id: 'espanol',
    name: 'Español',
    icon: 'BookOpen',
    color: 'from-rose-500 to-pink-500',
    topics: [
      'Obtención de Información',
      'Organización de información',
      'Elementos que intervienen en la coherencia, la cohesión y la adecuación en los textos. Nexos y expresiones. Signos de puntuación. Oraciones.',
      'Tipos de textos. Recursos lingüísticos. Textos informativos. Documentos legales y administrativos. Textos periodísticos. Textos publicitarios.',
    ],
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: 'FlaskConical',
    color: 'from-violet-500 to-purple-500',
    topics: [
      'Las características de los materiales',
      'Estructura y periodicidad de los elementos',
      'La reacción química',
    ],
  },
  {
    id: 'habilidad_matematica',
    name: 'Habilidad Matemática',
    icon: 'BrainCircuit',
    color: 'from-amber-500 to-orange-500',
    topics: ['Sucesiones numéricas', 'Series espaciales', 'Imaginación espacial', 'Problemas de razonamiento'],
  },
  {
    id: 'biologia',
    name: 'Biología',
    icon: 'Dna',
    color: 'from-green-500 to-lime-500',
    topics: [
      'El valor de la biodiversidad',
      'Tecnología y sociedad',
      'Transformación de materia y energía',
      'Nutrición y respiración para el cuidado de la salud',
      'Reproducción y sexualidad',
      'Genética, tecnología y sociedad',
    ],
  },
  {
    id: 'historia',
    name: 'Historia',
    icon: 'ScrollText',
    color: 'from-orange-500 to-red-500',
    topics: [
      'De principios del siglo XVI a principios del siglo XVIII',
      'De mediados del siglo XVIII a mediados del siglo XIX',
      'De mediados del siglo XIX a 1920',
      'El mundo entre 1920 y 1960',
      'Décadas recientes',
      'Las culturas prehispánicas y la conformación de la Nueva España',
      'Nueva España desde su consolidación hasta la independencia',
      'De la consumación de la Independencia al inicio de la Revolución Mexicana (1821-1911)',
      'Instituciones revolucionarias y desarrollo económico (1911-1979)',
      'México en la era global (1970-2000)',
    ],
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    icon: 'Calculator',
    color: 'from-emerald-500 to-teal-500',
    topics: [
      'Sentido numérico y pensamiento algebraico',
      'Forma, espacio y medida',
      'Manejo de la información',
      'Análisis y representación de datos',
    ],
  },
  {
    id: 'formacion_civica_etica',
    name: 'Formación Cívica y Ética',
    icon: 'Scale',
    color: 'from-slate-500 to-gray-600',
    topics: [
      'Retos de la sociedad mexicana',
      'Los desafíos del mundo contemporáneo',
      'La construcción de la ciudadanía',
      'Participación ciudadana y vida democrática',
    ],
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectInfo> = SUBJECTS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SubjectId, SubjectInfo>,
);

export const SUBJECT_NAMES: Record<SubjectId, string> = SUBJECTS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.name }),
  {} as Record<SubjectId, string>,
);
