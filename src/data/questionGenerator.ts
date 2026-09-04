import type { Question, SubjectId } from './questionBank';
import { SUBJECTS, SUBJECT_NAMES } from './questionBank';
import { SUPPLEMENT_BANK } from './supplementBank';
import { EXPANDED_BANK } from './expandedBank';
import { generateParametricQuestions } from './parametricGenerators';

let _idCounter = 0;
function qid(): string {
  _idCounter++;
  return `gen_${_idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function range(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Build a question object from raw data, randomly shuffling option order
function makeQuestion(
  subject: SubjectId,
  topic: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Question {
  const correctText = options[correctIndex];
  const shuffled = shuffle(options);
  const newCorrect = shuffled.indexOf(correctText);
  return {
    id: qid(),
    subject,
    topic,
    question,
    options: shuffled,
    correctIndex: newCorrect,
    explanation,
  };
}

// ============ TEMPLATE GENERATORS ============
// Each generator returns an array of Question[] for a given subject+topic.
// They use randomized parameters to produce many unique variants.

type Generator = (topic: string) => Question[];

// ---- HABILIDAD VERBAL ----
const hvGenerators: Record<string, Generator> = {
  'Comprensión de lectura': () => {
    const passages = [
      {
        text: 'La biodiversidad es el resultado de millones de años de evolución. Cada especie desempeña un papel específico en su ecosistema, y la pérdida de una sola puede provocar desequilibrios que afectan a todo el sistema.',
        qs: [
          { q: 'Según el texto, la pérdida de una especie puede provocar:', o: ['Beneficios para el ecosistema', 'Desequilibrios en el sistema', 'Mayor biodiversidad', 'Aceleración evolutiva'], c: 1, e: 'El texto señala que la pérdida de una especie "puede provocar desequilibrios que afectan a todo el sistema".' },
          { q: 'La idea principal del texto es:', o: ['La evolución es un proceso rápido', 'La biodiversidad y la interdependencia de las especies', 'Las especies no importan individualmente', 'El ecosistema es estático'], c: 1, e: 'El texto enfatiza que la biodiversidad resulta de la evolución y que cada especie tiene un papel, es decir, la interdependencia.' },
          { q: 'La palabra "desequilibrios" en el texto se refiere a:', o: ['Pérdida de peso', 'Alteraciones en el ecosistema', 'Estabilidad ambiental', 'Crecimiento poblacional'], c: 1, e: 'En contexto, "desequilibrios" significa alteraciones que afectan al sistema ecológico.' },
        ],
      },
      {
        text: 'La lectura es una herramienta fundamental para el aprendizaje. A través de ella, el ser humano adquiere conocimientos, desarrolla su pensamiento crítico y amplía su vocabulario. Sin embargo, en la era digital, la atención se ha fragmentado y la lectura profunda se ha vuelto menos frecuente.',
        qs: [
          { q: 'Según el texto, la lectura profunda se ha vuelto menos frecuente porque:', o: ['No hay libros disponibles', 'La atención se ha fragmentado en la era digital', 'Las personas ya no saben leer', 'La lectura no es importante'], c: 1, e: 'El texto indica que "en la era digital, la atención se ha fragmentado" y por eso la lectura profunda disminuye.' },
          { q: 'Un sinónimo de "fragmentado" en el contexto del texto es:', o: ['Unido', 'Concentrado', 'Disperso', 'Completo'], c: 2, e: '"Fragmentado" en este contexto significa dividido o disperso, opuesto a concentrado.' },
          { q: 'La intención del autor es:', o: ['Promover la lectura como herramienta de aprendizaje', 'Criticar la tecnología', 'Prohibir el uso de dispositivos', 'Describir la historia del libro'], c: 0, e: 'El autor valora la lectura como herramienta de aprendizaje y advierte sobre los efectos de la era digital.' },
        ],
      },
      {
        text: 'El agua es un recurso vital que cubre aproximadamente el 71% de la superficie de la Tierra. Sin embargo, solo una pequeña fracción es agua dulce accesible para el consumo humano. La contaminación y el desperdicio amenazan este recurso indispensable para la vida.',
        qs: [
          { q: '¿Cuánta superficie de la Tierra cubre el agua?', o: ['50%', '71%', '90%', '30%'], c: 1, e: 'El texto indica que el agua cubre aproximadamente el 71% de la superficie terrestre.' },
          { q: 'El problema principal que identifica el texto es:', o: ['Falta de océanos', 'La contaminación y el desperdicio del agua', 'Exceso de agua dulce', 'La abundancia de agua salada'], c: 1, e: 'El texto menciona que "la contaminación y el desperdicio amenazan este recurso".' },
          { q: 'La palabra "vital" en el texto significa:', o: ['Innecesaria', 'Indispensable para la vida', 'Peligrosa', 'Abundante'], c: 1, e: '"Vital" significa indispensable o esencial para la vida.' },
        ],
      },
    ];
    return passages.flatMap((p) =>
      p.qs.map((item) =>
        makeQuestion('habilidad_verbal', 'Comprensión de lectura', `${p.text}\n\n${item.q}`, item.o, item.c, item.e),
      ),
    );
  },
  'Manejo de vocabulario': () => {
    const synonymPairs = [
      { w: 'efímero', syn: 'fugaz', opts: ['eterno', 'duradero', 'permanente'], e: 'Efímero significa que dura poco tiempo; fugaz es su sinónimo.' },
      { w: 'ostentar', syn: 'lucir', opts: ['ocultar', 'esconder', 'guardar'], e: 'Ostentar significa mostrar con orgullo; lucir es el sinónimo.' },
      { w: 'lúgubre', syn: 'sombrío', opts: ['alegre', 'claro', 'brillante'], e: 'Lúgubre significa oscuro y triste; sombrío es el sinónimo.' },
      { w: 'diligente', syn: 'aplicado', opts: ['perezoso', 'negligente', 'descuidado'], e: 'Diligente significa cuidadoso y activo; aplicado es el sinónimo.' },
      { w: 'abundante', syn: 'copioso', opts: ['escaso', 'reducido', 'limitado'], e: 'Abundante significa en gran cantidad; copioso es el sinónimo.' },
      { w: 'mezquino', syn: 'tacaño', opts: ['generoso', 'desprendido', 'pródigo'], e: 'Mezquino significa reacio a gastar; tacaño es el sinónimo.' },
      { w: 'errante', syn: 'vagabundo', opts: ['fijo', 'estable', 'sedentario'], e: 'Errante significa que va de un lugar a otro; vagabundo es el sinónimo.' },
      { w: 'parco', syn: 'moderado', opts: ['abundante', 'excesivo', 'desbordado'], e: 'Parco significa escaso o moderado; moderado es el sinónimo.' },
      { w: 'inefable', syn: 'inexpresable', opts: ['común', 'explicable', 'corriente'], e: 'Inefable significa que no puede expresarse con palabras; inexpresable es el sinónimo.' },
      { w: 'obsoleto', syn: 'anticuado', opts: ['moderno', 'actual', 'vigente'], e: 'Obsoleto significa que ha caído en desuso; anticuado es el sinónimo.' },
      { w: 'sagaz', syn: 'perspicaz', opts: ['tonto', 'torpe', 'ingenuo'], e: 'Sagaz significa astuto y perspicaz; perspicaz es el sinónimo.' },
      { w: 'vetusto', syn: 'antiguo', opts: ['nuevo', 'moderno', 'reciente'], e: 'Vetusto significa muy antiguo; antiguo es el sinónimo.' },
    ];
    const antonymPairs = [
      { w: 'abundante', ant: 'escaso', opts: ['numeroso', 'copioso', 'profuso'], e: 'Abundante significa en gran cantidad; su antónimo es escaso.' },
      { w: 'diligente', ant: 'negligente', opts: ['activo', 'aplicado', 'cuidadoso'], e: 'Diligente significa cuidadoso; su antónimo es negligente.' },
      { w: 'mezquino', ant: 'generoso', opts: ['tacaño', 'roñoso', 'avaro'], e: 'Mezquino significa tacaño; su antónimo es generoso.' },
      { w: 'lúgubre', ant: 'alegre', opts: ['sombrío', 'oscuro', 'triste'], e: 'Lúgubre significa triste; su antónimo es alegre.' },
      { w: 'sagaz', ant: 'tonto', opts: ['perspicaz', 'astuto', 'listo'], e: 'Sagaz significa inteligente; su antónimo es tonto.' },
      { w: 'obsoleto', ant: 'moderno', opts: ['anticuado', 'viejo', 'pasado'], e: 'Obsoleto significa anticuado; su antónimo es moderno.' },
      { w: 'parco', ant: 'abundante', opts: ['moderado', 'escaso', 'frugal'], e: 'Parco significa escaso; su antónimo es abundante.' },
      { w: 'vetusto', ant: 'nuevo', opts: ['antiguo', 'viejo', 'pasado'], e: 'Vetusto significa antiguo; su antónimo es nuevo.' },
    ];

    const qs: Question[] = [];
    synonymPairs.forEach((p) => {
      const opts = shuffle([p.syn, ...p.opts]);
      qs.push(makeQuestion('habilidad_verbal', 'Manejo de vocabulario', `Elige el sinónimo de "${p.w}":`, opts, opts.indexOf(p.syn), p.e));
    });
    antonymPairs.forEach((p) => {
      const opts = shuffle([p.ant, ...p.opts]);
      qs.push(makeQuestion('habilidad_verbal', 'Manejo de vocabulario', `Elige el antónimo de "${p.w}":`, opts, opts.indexOf(p.ant), p.e));
    });

    // Analogies
    const analogies = [
      { q: 'Médico es a hospital como profesor es a:', o: ['Libro', 'Escuela', 'Alumno', 'Pizarrón'], c: 1, e: 'Un médico trabaja en un hospital; un profesor trabaja en una escuela. La relación es profesional-lugar de trabajo.' },
      { q: 'Pluma es a escribir como cuchillo es a:', o: ['Cocina', 'Cortar', 'Comer', 'Mesa'], c: 1, e: 'La pluma sirve para escribir; el cuchillo sirve para cortar. La relación es herramienta-función.' },
      { q: 'Ojo es a ver como oído es a:', o: ['Hablar', 'Oler', 'Escuchar', 'Tocar'], c: 2, e: 'El ojo sirve para ver; el oído sirve para escuchar. La relación es órgano-función sensorial.' },
      { q: 'Tijeras es a cortar como aguja es a:', o: ['Coser', 'Tejer', 'Bordar', 'Punzar'], c: 0, e: 'Las tijeras sirven para cortar; la aguja sirve para coser. La relación es herramienta-función.' },
      { q: 'Río es a agua como bosque es a:', o: ['Tierra', 'Árboles', 'Piedras', 'Animales'], c: 1, e: 'Un río está compuesto principalmente de agua; un bosque está compuesto principalmente de árboles.' },
      { q: 'Pintor es a brocha como músico es a:', o: ['Partitura', 'Instrumento', 'Canción', 'Escenario'], c: 1, e: 'El pintor usa la brocha como herramienta; el músico usa el instrumento. La relación es profesional-herramienta.' },
      { q: 'Semilla es a árbol como embrión es a:', o: ['Huevo', 'Animal adulto', 'Útero', 'Célula'], c: 1, e: 'La semilla se desarrolla en árbol; el embrión se desarrolla en animal adulto. La relación es etapa inicial-estado maduro.' },
      { q: 'Reloj es a tiempo como termómetro es a:', o: ['Calor', 'Temperatura', 'Grados', 'Mercurio'], c: 1, e: 'El reloj mide el tiempo; el termómetro mide la temperatura. La relación es instrumento-magnitud que mide.' },
    ];
    analogies.forEach((a) => qs.push(makeQuestion('habilidad_verbal', 'Manejo de vocabulario', a.q, a.o, a.c, a.e)));

    return qs;
  },
};

// ---- GEOGRAFÍA ----
const geoGenerators: Record<string, Generator> = {
  'El espacio geográfico y los mapas': () => {
    const coords: [number, number][] = [[23.6, -102.5], [19.4, -99.1], [40.4, -3.7], [35.6, 139.6], [51.5, -0.1]];
    const types = [
      { t: 'coordenadas geográficas', q: 'Las coordenadas geográficas sirven para:', o: ['Medir la temperatura', 'Ubicar un lugar en la Tierra', 'Calcular distancias', 'Determinar el clima'], c: 1, e: 'Las coordenadas geográficas (latitud y longitud) permiten ubicar cualquier punto en la superficie terrestre.' },
      { t: 'paralelos', q: 'Los paralelos son líneas imaginarias que se trazan:', o: ['De norte a sur', 'De este a oeste', 'En diagonal', 'Solo en el ecuador'], c: 1, e: 'Los paralelos son círculos imaginarios horizontales (este-oeste) paralelos al ecuador, que miden la latitud.' },
      { t: 'meridianos', q: 'Los meridianos son líneas que se trazan:', o: ['De este a oeste', 'De norte a sur', 'Solo en los polos', 'En espiral'], c: 1, e: 'Los meridianos son semicírculos imaginarios que van de polo a polo (norte-sur) y miden la longitud.' },
      { t: 'ecuador', q: 'El Ecuador terrestre divide a la Tierra en:', o: ['Este y oeste', 'Norte y sur', 'Cuatro cuadrantes', 'Continentes'], c: 1, e: 'El Ecuador es el paralelo 0° que divide el planeta en hemisferio norte y hemisferio sur.' },
      { t: 'escala', q: 'La escala de un mapa indica:', o: ['El tipo de relieve', 'La relación entre distancia en el mapa y distancia real', 'Los colores del mapa', 'El tamaño del papel'], c: 1, e: 'La escala indica cuántas veces se ha reducido la realidad para representarla en el mapa.' },
    ];
    const qs = types.map((item) => makeQuestion('geografia', 'El espacio geográfico y los mapas', item.q, item.o, item.c, item.e));
    qs.push(makeQuestion('geografia', 'El espacio geográfico y los mapas', '¿Cuál es la proyección más común para representar la Tierra en un mapa plano?', ['Mercator', 'Polar', 'Cilíndrica equidistante', 'Azimutal'], 0, 'La proyección de Mercator es la más usada para mapas planos, aunque distorsiona el tamaño de las zonas cercanas a los polos.'));
    qs.push(makeQuestion('geografia', 'El espacio geográfico y los mapas', 'La latitud se mide desde:', ['El meridiano de Greenwich', 'El ecuador hacia los polos', 'El trópico de Cáncer', 'El círculo polar'], 1, 'La latitud mide la distancia angular desde el ecuador (0°) hacia los polos (90°).'));
    return qs;
  },
  'Recursos naturales y preservación del ambiente': () => {
    const items = [
      { q: '¿Cuál de los siguientes es un recurso renovable?', o: ['Petróleo', 'Carbón', 'Energía solar', 'Gas natural'], c: 2, e: 'La energía solar es renovable porque su fuente (el sol) es inagotable a escala humana.' },
      { q: '¿Cuál es un recurso no renovable?', o: ['Energía eólica', 'Biomasa', 'Petróleo', 'Energía hidráulica'], c: 2, e: 'El petróleo es no renovable porque su formación tarda millones de años y se agota al consumirlo.' },
      { q: 'El efecto invernadero se produce por:', o: ['La deforestación únicamente', 'La acumulación de gases como CO₂ en la atmósfera', 'El uso de energía solar', 'La rotación de la Tierra'], c: 1, e: 'El efecto invernadero se intensifica por la acumulación de gases de efecto invernadero (CO₂, metano) que atrapan calor.' },
      { q: 'La biodiversidad se refiere a:', o: ['La cantidad de personas en un lugar', 'La variedad de seres vivos en un ecosistema', 'El tamaño de los océanos', 'El número de ciudades'], c: 1, e: 'La biodiversidad es la variedad de organismos vivos en diferentes ecosistemas.' },
      { q: 'Una medida para preservar el ambiente es:', o: ['Talar más bosques', 'Reciclar residuos', 'Quemar plásticos', 'Usar más combustibles fósiles'], c: 1, e: 'El reciclaje reduce la extracción de materias primas y la contaminación, preservando el ambiente.' },
      { q: 'La capa de ozono protege a la Tierra de:', o: ['Los terremotos', 'La radiación ultravioleta', 'Los huracanes', 'Las inundaciones'], c: 1, e: 'La capa de ozono filtra la radiación UV del sol, protegiendo a los seres vivos.' },
      { q: 'El desarrollo sustentable busca:', o: ['Explotar recursos sin límite', 'Satisfacer necesidades presentes sin comprometer las futuras', 'Detener toda actividad económica', 'Aumentar la contaminación'], c: 1, e: 'El desarrollo sustentable equilibra el progreso económico con la protección ambiental para las generaciones futuras.' },
      { q: 'La deforestación contribuye principalmente a:', o: ['Reducir el CO₂', 'Aumentar la biodiversidad', 'El cambio climático y pérdida de hábitats', 'Mejorar la calidad del aire'], c: 2, e: 'La deforestación reduce la absorción de CO₂ y destruye hábitats, contribuyendo al cambio climático.' },
    ];
    return items.map((i) => makeQuestion('geografia', 'Recursos naturales y preservación del ambiente', i.q, i.o, i.c, i.e));
  },
  'Dinámica de la población y riesgos': () => {
    const items = [
      { q: 'La densidad de población se calcula como:', o: ['Habitantes × área', 'Habitantes ÷ área', 'Área ÷ habitantes', 'Habitantes + área'], c: 1, e: 'La densidad de población es el número de habitantes dividido entre el área (habitantes/km²).' },
      { q: 'La migración es:', o: ['El nacimiento de nuevos habitantes', 'El desplazamiento de personas de un lugar a otro', 'El envejecimiento poblacional', 'La mortalidad'], c: 1, e: 'La migración es el movimiento de personas que cambian su lugar de residencia.' },
      { q: 'Un riesgo natural es:', o: ['Un problema económico', 'La probabilidad de que un fenómeno natural cause daño', 'Una decisión política', 'Un tipo de contaminación'], c: 1, e: 'Un riesgo natural es la probabilidad de que un fenómeno de la naturaleza (sismo, erupción) afecte a la población.' },
      { q: 'La tasa de natalidad mide:', o: ['Los fallecimientos por mil habitantes', 'Los nacimientos por mil habitantes', 'La esperanza de vida', 'El número de migrantes'], c: 1, e: 'La tasa de natalidad indica el número de nacimientos por cada mil habitantes en un periodo.' },
      { q: 'La explosión demográfica se refiere a:', o: ['La disminución de población', 'El crecimiento acelerado de la población', 'Las guerras', 'Las epidemias'], c: 1, e: 'La explosión demográfica es el crecimiento rápido de la población, especialmente en el siglo XX.' },
      { q: 'Un ejemplo de riesgo geológico es:', o: ['Sequía', 'Sismo', 'Epidemia', 'Contaminación'], c: 1, e: 'Los sismos son riesgos geológicos causados por movimientos de las placas tectónicas.' },
      { q: 'La esperanza de vida indica:', o: ['Cuántos hijos tiene una familia', 'El promedio de años que se espera viva una persona', 'La densidad poblacional', 'La tasa de migración'], c: 1, e: 'La esperanza de vida es el promedio de años que se espera que viva una persona al nacer.' },
    ];
    return items.map((i) => makeQuestion('geografia', 'Dinámica de la población y riesgos', i.q, i.o, i.c, i.e));
  },
  'Espacios económicos y desigualdad social': () => {
    const items = [
      { q: 'El sector primario de la economía incluye:', o: ['Servicios', 'Manufactura', 'Agricultura y ganadería', 'Comercio'], c: 2, e: 'El sector primario abarca actividades que extraen recursos directamente de la naturaleza: agricultura, ganadería, pesca, minería.' },
      { q: 'El sector secundario se relaciona con:', o: ['La educación', 'La transformación de materias primas', 'El turismo', 'La banca'], c: 1, e: 'El sector secundario transforma materias primas en productos elaborados (industria, manufactura).' },
      { q: 'El sector terciario corresponde a:', o: ['La minería', 'La agricultura', 'Los servicios', 'La construcción'], c: 2, e: 'El sector terciario agrupa los servicios: comercio, educación, salud, transporte, turismo.' },
      { q: 'La desigualdad social se manifiesta en:', o: ['Distribución equitativa de la riqueza', 'Diferencias en ingresos y acceso a servicios', 'Igualdad de oportunidades', 'Ausencia de pobreza'], c: 1, e: 'La desigualdad social se refleja en diferencias de ingreso, educación, salud y oportunidades entre grupos.' },
      { q: 'El PIB mide:', o: ['La población total', 'El valor total de bienes y servicios producidos', 'La tasa de desempleo', 'La inflación'], c: 1, e: 'El Producto Interno Bruto (PIB) es el valor monetario de todos los bienes y servicios finales producidos en un país.' },
      { q: 'La globalización económica se caracteriza por:', o: ['Cierre de fronteras', 'Integración de mercados internacionales', 'Eliminación del comercio', 'Autarquía'], c: 1, e: 'La globalización implica la integración e interdependencia de los mercados a nivel mundial.' },
    ];
    return items.map((i) => makeQuestion('geografia', 'Espacios económicos y desigualdad social', i.q, i.o, i.c, i.e));
  },
  'Espacios culturales y políticos': () => {
    const items = [
      { q: 'Una frontera política es:', o: ['Un río natural', 'Una línea que separa estados o países', 'Una montaña', 'Una zona agrícola'], c: 1, e: 'Una frontera política es una línea imaginaria que delimita el territorio de dos o más estados soberanos.' },
      { q: 'La diversidad cultural se refiere a:', o: ['La uniformidad de costumbres', 'La variedad de tradiciones y lenguas', 'La ausencia de migración', 'La globalización'], c: 1, e: 'La diversidad cultural es la coexistencia de diferentes tradiciones, lenguas y costumbres en una sociedad.' },
      { q: 'Un Estado soberano tiene:', o: ['Solo territorio', 'Territorio, población y gobierno', 'Solo población', 'Solo gobierno'], c: 1, e: 'Un Estado soberano posee territorio delimitado, población permanente y gobierno con autoridad.' },
      { q: 'La identidad nacional se construye a partir de:', o: ['La influencia extranjera', 'Elementos culturales compartidos como lengua, historia y símbolos', 'La ausencia de cultura', 'La copia de otras naciones'], c: 1, e: 'La identidad nacional surge de elementos compartidos: idioma, historia, símbolos patrios y tradiciones.' },
      { q: 'El multiculturalismo implica:', o: ['Eliminar culturas minoritarias', 'La convivencia de diversas culturas en un mismo espacio', 'Una sola cultura oficial', 'La asimilación forzada'], c: 1, e: 'El multiculturalismo es la coexistencia de múltiples culturas que se respetan mutuamente en un mismo territorio.' },
    ];
    return items.map((i) => makeQuestion('geografia', 'Espacios culturales y políticos', i.q, i.o, i.c, i.e));
  },
};

// ---- FÍSICA ----
const fisicaGenerators: Record<string, Generator> = {
  'El movimiento. La descripción de los cambios en la naturaleza': () => {
    const qs: Question[] = [];
    // Velocity calculation variants
    for (let i = 0; i < 40; i++) {
      const d = range(50, 400);
      const t = range(2, 20);
      const v = d / t;
      const wrong = [Math.round(v) + range(2, 5), Math.round(v) - range(1, 4), Math.round(v * 2)];
      qs.push(makeQuestion('fisica', 'El movimiento. La descripción de los cambios en la naturaleza',
        `Un móvil recorre ${d} m en ${t} segundos. ¿Cuál es su velocidad?`,
        [`${v.toFixed(1)} m/s`, `${wrong[0]} m/s`, `${wrong[1]} m/s`, `${wrong[2]} m/s`],
        0, `La velocidad se calcula como v = d/t = ${d}/${t} = ${v.toFixed(1)} m/s.`));
    }
    const concepts = [
      { q: 'La velocidad es una magnitud:', o: ['Escalar', 'Vectorial', 'Adimensional', 'Constante siempre'], c: 1, e: 'La velocidad es vectorial porque tiene magnitud, dirección y sentido.' },
      { q: 'La aceleración se define como:', o: ['Cambio de posición', 'Cambio de velocidad por unidad de tiempo', 'Distancia recorrida', 'Velocidad final'], c: 1, e: 'La aceleración es el cambio de velocidad dividido entre el tiempo: a = Δv/Δt.' },
      { q: 'El movimiento rectilíneo uniforme tiene:', o: ['Aceleración constante', 'Velocidad constante', 'Velocidad cambiante', 'Aceleración variable'], c: 1, e: 'En el MRU, la velocidad es constante, por lo que la aceleración es cero.' },
      { q: 'Si un cuerpo cambia de dirección, experimenta:', o: ['Solo cambio de rapidez', 'Cambio de velocidad (aceleración)', 'Ningún cambio', 'Solo desplazamiento'], c: 1, e: 'La velocidad es un vector; cambiar la dirección implica cambio de velocidad, es decir, aceleración.' },
      { q: 'La distancia recorrida es una magnitud:', o: ['Vectorial', 'Escalar', 'Nula', 'Variable dependiente'], c: 1, e: 'La distancia es escalar: solo tiene magnitud, no dirección ni sentido.' },
    ];
    // Velocity with variable start position
    for (let i = 0; i < 30; i++) {
      const v0 = range(0, 15);
      const a = range(1, 10);
      const t = range(2, 15);
      const vf = v0 + a * t;
      const wrong = [vf + range(2, 8), vf - range(1, 6), Math.round(vf * 1.5)];
      qs.push(makeQuestion('fisica', 'El movimiento. La descripción de los cambios en la naturaleza',
        `Un móvil parte con velocidad ${v0} m/s y acelera a ${a} m/s² durante ${t} s. ¿Cuál es su velocidad final?`,
        [`${vf} m/s`, `${wrong[0]} m/s`, `${wrong[1]} m/s`, `${wrong[2]} m/s`],
        0, `vf = v0 + a×t = ${v0} + ${a}×${t} = ${vf} m/s.`));
    }
    // Distance under constant acceleration
    for (let i = 0; i < 30; i++) {
      const v0 = range(0, 10);
      const a = range(1, 8);
      const t = range(2, 12);
      const d = v0 * t + 0.5 * a * t * t;
      const wrong = [Math.round(d) + range(3, 12), Math.round(d) - range(2, 10), v0 * t];
      qs.push(makeQuestion('fisica', 'El movimiento. La descripción de los cambios en la naturaleza',
        `Un móvil parte con velocidad ${v0} m/s y acelera a ${a} m/s² durante ${t} s. ¿Qué distancia recorre?`,
        [`${Math.round(d)} m`, `${wrong[0]} m`, `${wrong[1]} m`, `${wrong[2]} m`],
        0, `d = v0×t + ½×a×t² = ${v0}×${t} + 0.5×${a}×${t}² = ${Math.round(d)} m.`));
    }
    concepts.forEach((c) => qs.push(makeQuestion('fisica', 'El movimiento. La descripción de los cambios en la naturaleza', c.q, c.o, c.c, c.e)));
    return qs;
  },
  'Las fuerzas. La explicación de los cambios': () => {
    const qs: Question[] = [];
    for (let i = 0; i < 30; i++) {
      const m = range(2, 20);
      const a = range(2, 15);
      const f = m * a;
      const wrong = [f + range(3, 10), f - range(1, 8), m + a];
      qs.push(makeQuestion('fisica', 'Las fuerzas. La explicación de los cambios',
        `¿Qué fuerza se necesita para acelerar un cuerpo de ${m} kg a ${a} m/s²?`,
        [`${f} N`, `${wrong[0]} N`, `${wrong[1]} N`, `${wrong[2]} N`],
        0, `Por la segunda ley de Newton: F = m × a = ${m} × ${a} = ${f} N.`));
    }
    const concepts = [
      { q: 'La primera ley de Newton (inercia) establece que:', o: ['Todo cuerpo acelera', 'Un cuerpo en reposo permanece en reposo si no actúa una fuerza', 'F = ma', 'La fuerza es siempre cero'], c: 1, e: 'La primera ley dice que un cuerpo permanece en reposo o MRU si no hay fuerza neta sobre él.' },
      { q: 'La segunda ley de Newton se expresa como:', o: ['F = mv', 'F = ma', 'F = m/a', 'F = a/m'], c: 1, e: 'La segunda ley de Newton: F = m × a. La fuerza neta es proporcional a la aceleración.' },
      { q: 'La tercera ley de Newton dice:', o: ['La energía se conserva', 'A toda acción corresponde una reacción igual y opuesta', 'F = ma', 'La fuerza es constante'], c: 1, e: 'La tercera ley: por cada fuerza de acción hay una fuerza de reacción igual en magnitud y opuesta en dirección.' },
      { q: 'La unidad de fuerza en el SI es:', o: ['Vatio', 'Joule', 'Newton', 'Pascal'], c: 2, e: 'La fuerza se mide en newtons (N) en el Sistema Internacional.' },
      { q: 'El peso de un cuerpo es:', o: ['Lo mismo que su masa', 'La fuerza gravitacional sobre él', 'Constante en cualquier planeta', 'Siempre 9.8 kg'], c: 1, e: 'El peso es la fuerza con que la gravedad atrae a un cuerpo: P = mg. Difiere de la masa.' },
      { q: 'La fuerza de rozamiento se opone al:', o: ['Reposo', 'Movimiento entre superficies en contacto', 'Peso', 'Calor'], c: 1, e: 'La fuerza de fricción o rozamiento se opone al deslizamiento entre superficies en contacto.' },
    ];
    concepts.forEach((c) => qs.push(makeQuestion('fisica', 'Las fuerzas. La explicación de los cambios', c.q, c.o, c.c, c.e)));
    return qs;
  },
  'Las interacciones de la materia. Un modelo para describir lo que no percibimos': () => {
    const items = [
      { q: 'El modelo cinético de la materia establece que:', o: ['La materia está quieta', 'La materia está formada por partículas en movimiento', 'La materia no tiene partículas', 'Las partículas son visibles'], c: 1, e: 'El modelo cinético dice que toda materia está formada por partículas en constante movimiento.' },
      { q: 'La temperatura es una medida de:', o: ['La cantidad de calor', 'La energía cinética promedio de las partículas', 'El volumen del cuerpo', 'La masa'], c: 1, e: 'La temperatura mide la energía cinética promedio de las partículas de un cuerpo.' },
      { q: 'En un sólido, las partículas:', o: ['Se mueven libremente', 'Vibran en posiciones fijas', 'Están totalmente quietas', 'Se desplazan rápidamente'], c: 1, e: 'En un sólido, las partículas vibran alrededor de posiciones fijas debido a las fuerzas de cohesión.' },
      { q: 'La presión se define como:', o: ['Fuerza × área', 'Fuerza ÷ área', 'Área ÷ fuerza', 'Fuerza + área'], c: 1, e: 'La presión es la fuerza aplicada por unidad de área: P = F/A.' },
      { q: 'Los estados de la materia son:', o: ['Sólido y líquido', 'Sólido, líquido, gaseoso y plasma', 'Solo gaseoso', 'Líquido y plasma'], c: 1, e: 'Los estados principales son sólido, líquido, gaseoso y plasma (también condensado de Bose-Einstein).' },
      { q: 'La evaporación es el cambio de:', o: ['Sólido a líquido', 'Líquido a gas', 'Gas a líquido', 'Sólido a gas'], c: 1, e: 'La evaporación es el paso de líquido a gas que ocurre en la superficie.' },
      { q: 'La unidad de presión en el SI es:', o: ['Newton', 'Pascal', 'Joule', 'Vatio'], c: 1, e: 'La presión se mide en pascales (Pa), que equivalen a N/m².' },
    ];
    return items.map((i) => makeQuestion('fisica', 'Las interacciones de la materia. Un modelo para describir lo que no percibimos', i.q, i.o, i.c, i.e));
  },
  'Manifestaciones de la estructura interna de la materia': () => {
    const items = [
      { q: 'El átomo está compuesto por:', o: ['Solo electrones', 'Protones, neutrones y electrones', 'Solo protones', 'Moléculas'], c: 1, e: 'El átomo tiene un núcleo con protones (+) y neutrones (neutros), y electrones (-) orbitando.' },
      { q: 'Las partículas con carga positiva son:', o: ['Electrones', 'Neutrones', 'Protones', 'Fotones'], c: 2, e: 'Los protones tienen carga positiva y se encuentran en el núcleo atómico.' },
      { q: 'Los electrones tienen carga:', o: ['Positiva', 'Negativa', 'Neutra', 'Depende del átomo'], c: 1, e: 'Los electrones tienen carga negativa y orbitan alrededor del núcleo.' },
      { q: 'El número atómico indica:', o: ['Los neutrones', 'Los protones', 'La masa total', 'Los isótopos'], c: 1, e: 'El número atómico es el número de protones, que define el elemento.' },
      { q: 'Los isótopos son átomos con:', o: ['Diferente número de protones', 'Mismo número de protones pero diferente número de neutrones', 'Diferente elemento', 'Carga diferente'], c: 1, e: 'Los isótopos tienen el mismo número de protones (mismo elemento) pero diferente número de neutrones.' },
      { q: 'La energía nuclear se libera mediante:', o: ['Combustión', 'Fisión o fusión nuclear', 'Evaporación', 'Electrólisis'], c: 1, e: 'La energía nuclear proviene de la fisión (división) o fusión (unión) de núcleos atómicos.' },
    ];
    return items.map((i) => makeQuestion('fisica', 'Manifestaciones de la estructura interna de la materia', i.q, i.o, i.c, i.e));
  },
};

// ---- ESPAÑOL ----
const espanolGenerators: Record<string, Generator> = {
  'Obtención de Información': () => {
    const items = [
      { q: 'En un texto, la idea principal es:', o: ['El primer párrafo', 'Lo que el autor quiere comunicar esencialmente', 'El título', 'La última palabra'], c: 1, e: 'La idea principal es el mensaje esencial que el autor desarrolla y sustenta en el texto.' },
      { q: 'Los datos explícitos en un texto son:', o: ['Los que el lector infiere', 'Los que están escritos directamente', 'Los implícitos', 'Los que no aparecen'], c: 1, e: 'Los datos explícitos son los que aparecen literalmente escritos en el texto.' },
      { q: 'La información implícita es aquella que:', o: ['Está escrita literalmente', 'Se deduce del texto pero no está dicha directamente', 'Es el título', 'Es la primera línea'], c: 1, e: 'La información implícita se infiere a partir de lo que el texto dice, pero no se expresa directamente.' },
      { q: 'Para identificar el tema de un texto, debes:', o: ['Contar las palabras', 'Identificar de qué trata en general', 'Leer solo el título', 'Buscar los signos de puntuación'], c: 1, e: 'El tema se identifica analizando el contenido general del texto, no solo el título.' },
      { q: 'El propósito de un texto informativo es:', o: ['Entretener', 'Comunicar datos o conocimientos', 'Persuadir', 'Hacer reír'], c: 1, e: 'Un texto informativo tiene como fin transmitir datos, hechos o conocimientos de manera objetiva.' },
    ];
    return items.map((i) => makeQuestion('espanol', 'Obtención de Información', i.q, i.o, i.c, i.e));
  },
  'Organización de información': () => {
    const items = [
      { q: 'Un cuadro sinóptico sirve para:', o: ['Escribir poemas', 'Organizar información de forma visual y jerárquica', 'Calcular datos', 'Dibujar mapas'], c: 1, e: 'El cuadro sinóptico organiza información visualmente usando llaves para clasificar ideas principales y secundarias.' },
      { q: 'Un mapa conceptual utiliza:', o: ['Solo texto', 'Conceptos unidos por conectores', 'Solo dibujos', 'Números'], c: 1, e: 'El mapa conceptual representa conceptos unidos por líneas con palabras de enlace (conectores).' },
      { q: 'El resumen consiste en:', o: ['Ampliar el texto', 'Reducir el texto a sus ideas esenciales', 'Cambiar las palabras por sinónimos', 'Eliminar la idea principal'], c: 1, e: 'El resumen reduce el texto a sus ideas principales manteniendo la esencia del contenido.' },
      { q: 'La paráfrasis consiste en:', o: ['Copiar textualmente', 'Expresar con otras palabras lo dicho en el texto', 'Resumir en una palabra', 'Traducir'], c: 1, e: 'La paráfrasis reexpresa el contenido con palabras diferentes sin alterar el significado.' },
      { q: 'Un esquema sirve para:', o: ['Decorar el texto', 'Representar la estructura del contenido visualmente', 'Contar palabras', 'Medir la lectura'], c: 1, e: 'El esquema muestra la organización jerárquica del contenido de un texto de forma visual.' },
    ];
    return items.map((i) => makeQuestion('espanol', 'Organización de información', i.q, i.o, i.c, i.e));
  },
  'Elementos que intervienen en la coherencia, la cohesión y la adecuación en los textos. Nexos y expresiones. Signos de puntuación. Oraciones.': () => {
    const items = [
      { q: 'La coma (,) se usa principalmente para:', o: ['Terminar una oración', 'Separar elementos en una enumeración', 'Indicar una pregunta', 'Separar párrafos'], c: 1, e: 'La coma separa elementos en una serie, aísla incisos y marca pausas breves dentro de la oración.' },
      { q: 'El punto y coma (;) se usa para:', o: ['Separar oraciones relacionadas sin usar punto seguido', 'Hacer una pregunta', 'Indicar exclamación', 'Empezar un texto'], c: 0, e: 'El punto y coma separa oraciones estrechamente relacionadas dentro de un mismo párrafo.' },
      { q: 'Los dos puntos (:) se utilizan antes de:', o: ['Una enumeración o una cita', 'Un sustantivo', 'Un verbo', 'Un adjetivo'], c: 0, e: 'Los dos puntos introducen una enumeración, una cita textual o una conclusión.' },
      { q: 'Un nexo copulativo es:', o: ['Pero', 'Y', 'Por lo tanto', 'Sin embargo'], c: 1, e: '"Y" es un nexo copulativo que une elementos o ideas sumándolos.' },
      { q: 'Un nexo adversativo es:', o: ['Y', 'Pero', 'También', 'Además'], c: 1, e: '"Pero" es un nexo adversativo que introduce una idea opuesta o restrictiva.' },
      { q: 'La coherencia de un texto se refiere a:', o: ['La ortografía', 'La unidad y conexión lógica de las ideas', 'La longitud', 'El tipo de letra'], c: 1, e: 'La coherencia implica que las ideas del texto están conectadas lógicamente y tienen unidad temática.' },
      { q: 'La cohesión textual se logra mediante:', o: ['Solo el título', 'Nexos, pronombres y referencias que enlazan ideas', 'Los márgenes', 'El interlineado'], c: 1, e: 'La cohesión se logra con conectores, pronombres y referencias que enlazan las partes del texto.' },
      { q: 'El sujeto de una oración es:', o: ['La acción', 'De quien se dice algo', 'El verbo', 'El adjetivo'], c: 1, e: 'El sujeto es la persona, animal o cosa de quien se dice algo en la oración.' },
      { q: 'El predicado de una oración contiene:', o: ['Al sujeto', 'El verbo y lo que se dice del sujeto', 'Solo adjetivos', 'Solo sustantivos'], c: 1, e: 'El predicado incluye el verbo y toda la información que se expresa sobre el sujeto.' },
    ];
    return items.map((i) => makeQuestion('espanol', 'Elementos que intervienen en la coherencia, la cohesión y la adecuación en los textos. Nexos y expresiones. Signos de puntuación. Oraciones.', i.q, i.o, i.c, i.e));
  },
  'Tipos de textos. Recursos lingüísticos. Textos informativos. Documentos legales y administrativos. Textos periodísticos. Textos publicitarios.': () => {
    const items = [
      { q: 'Un texto periodístico de opinión es:', o: ['La nota informativa', 'El editorial o columna', 'El anuncio', 'El contrato'], c: 1, e: 'El editorial y la columna expresan la opinión del autor o del medio, a diferencia de la nota que es objetiva.' },
      { q: 'Una noticia se caracteriza por ser:', o: ['Subjetiva', 'Objetiva y veraz', 'Ficticia', 'Publicitaria'], c: 1, e: 'La noticia debe ser objetiva, veraz y oportuna, respondiendo a: qué, quién, cómo, cuándo, dónde y por qué.' },
      { q: 'Un texto publicitario tiene como fin:', o: ['Informar objetivamente', 'Persuadir o convencer al receptor', 'Narrar una historia', 'Describir un proceso'], c: 1, e: 'El texto publicitario busca persuadir al receptor para que compre un producto o adopte una conducta.' },
      { q: 'Un acta es un documento:', o: ['Publicitario', 'Administrativo que registra lo tratado en una reunión', 'Periodístico', 'Literario'], c: 1, e: 'Un acta es un documento administrativo que registra fielmente lo ocurrido en una reunión o asamblea.' },
      { q: 'Un contrato es un documento:', o: ['Informativo', 'Legal que establece obligaciones entre partes', 'Publicitario', 'Periodístico'], c: 1, e: 'El contrato es un documento legal que crea derechos y obligaciones entre las partes que lo firman.' },
      { q: 'La función referencial del lenguaje se centra en:', o: ['El emisor', 'El mensaje o contenido informativo', 'El receptor', 'El canal'], c: 1, e: 'La función referencial (o representativa) transmite información objetiva sobre la realidad.' },
      { q: 'La función apelativa busca:', o: ['Expresar emociones', 'Influir en el receptor', 'Explicar el código', 'Mantener el canal'], c: 1, e: 'La función apelativa o conativa busca influir en el comportamiento del receptor (órdenes, ruegos).' },
    ];
    return items.map((i) => makeQuestion('espanol', 'Tipos de textos. Recursos lingüísticos. Textos informativos. Documentos legales y administrativos. Textos periodísticos. Textos publicitarios.', i.q, i.o, i.c, i.e));
  },
};

// ---- QUÍMICA ----
const quimicaGenerators: Record<string, Generator> = {
  'Las características de los materiales': () => {
    const items = [
      { q: 'La densidad de un material se calcula como:', o: ['Masa × volumen', 'Masa ÷ volumen', 'Volumen ÷ masa', 'Masa + volumen'], c: 1, e: 'La densidad es masa dividida entre volumen: d = m/V.' },
      { q: 'Una propiedad extensiva depende de:', o: ['La naturaleza del material', 'La cantidad de materia', 'La temperatura', 'El color'], c: 1, e: 'Las propiedades extensivas (masa, volumen) dependen de la cantidad de materia.' },
      { q: 'Una propiedad intensiva es:', o: ['La masa', 'El volumen', 'La densidad', 'El peso'], c: 2, e: 'Las propiedades intensivas (densidad, punto de ebullición) no dependen de la cantidad de materia.' },
      { q: 'Un material homogéneo es aquel que:', o: ['Tiene componentes distinguibles', 'Tiene composición uniforme', 'Se separa fácilmente', 'Es siempre líquido'], c: 1, e: 'Un material homogéneo tiene composición uniforme en toda su extensión (una fase).' },
      { q: 'Una mezcla heterogénea tiene:', o: ['Composición uniforme', 'Componentes distinguibles', 'Una sola fase', 'Siempre la misma proporción'], c: 1, e: 'En una mezcla heterogénea se distinguen los componentes y tiene más de una fase.' },
      { q: 'Un ejemplo de mezcla homogénea es:', o: ['Agua y aceite', 'Ensalada', 'Agua con sal disuelta', 'Granito'], c: 2, e: 'El agua con sal disuelta es una mezcla homogénea (solución) porque la sal se distribuye uniformemente.' },
      { q: 'La filtración separa:', o: ['Líquidos miscibles', 'Un sólido de un líquido', 'Gases', 'Isótopos'], c: 1, e: 'La filtración separa un sólido insoluble de un líquido mediante un medio poroso.' },
      { q: 'La destilación separa:', o: ['Sólidos', 'Líquidos con diferentes puntos de ebullición', 'Gases del aire', 'Mezclas homogéneas sólidas'], c: 1, e: 'La destilación separa líquidos aproveciendo sus diferentes puntos de ebullición.' },
    ];
    return items.map((i) => makeQuestion('quimica', 'Las características de los materiales', i.q, i.o, i.c, i.e));
  },
  'Estructura y periodicidad de los elementos': () => {
    const items = [
      { q: 'Las partículas con carga positiva en el átomo son:', o: ['Electrones', 'Neutrones', 'Protones', 'Fotones'], c: 2, e: 'Los protones tienen carga positiva y se encuentran en el núcleo.' },
      { q: 'El número atómico indica el número de:', o: ['Neutrones', 'Protones', 'Electrones de valencia', 'Isótopos'], c: 1, e: 'El número atómico es el número de protones, que identifica al elemento.' },
      { q: 'El símbolo del oro es:', o: ['Au', 'Ag', 'Or', 'Go'], c: 0, e: 'El símbolo del oro es Au, del latín "aurum".' },
      { q: 'El símbolo del sodio es:', o: ['So', 'Na', 'Sd', 'Sn'], c: 1, e: 'El símbolo del sodio es Na, del latín "natrium".' },
      { q: 'Los gases nobles están en el grupo:', o: ['1', '17', '18', '2'], c: 2, e: 'Los gases nobles (He, Ne, Ar, Kr, Xe, Rn) están en el grupo 18 de la tabla periódica.' },
      { q: 'Los metales alcalinos están en el grupo:', o: ['1', '2', '17', '18'], c: 0, e: 'Los metales alcalinos (Li, Na, K, Rb, Cs, Fr) están en el grupo 1.' },
      { q: 'Los halógenos están en el grupo:', o: ['1', '16', '17', '18'], c: 2, e: 'Los halógenos (F, Cl, Br, I) están en el grupo 17 de la tabla periódica.' },
      { q: 'Un elemento metal generalmente:', o: ['Es mal conductor', 'Conduce electricidad y calor', 'Es gas a temperatura ambiente', 'Se rompe fácilmente'], c: 1, e: 'Los metales son buenos conductores de electricidad y calor, y son maleables y dúctiles.' },
      { q: 'Un no metal típicamente:', o: ['Es dúctil', 'Es mal conductor del calor y electricidad', 'Tiene brillo metálico', 'Es maleable'], c: 1, e: 'Los no metales son malos conductores y no tienen brillo metálico ni maleabilidad.' },
      { q: 'La masa atómica se aproxima a la suma de:', o: ['Solo protones', 'Protones y neutrones', 'Solo electrones', 'Electrones y protones'], c: 1, e: 'La masa atómica es aproximadamente la suma de protones y neutrones (los electrones tienen masa despreciable).' },
    ];
    return items.map((i) => makeQuestion('quimica', 'Estructura y periodicidad de los elementos', i.q, i.o, i.c, i.e));
  },
  'La reacción química': () => {
    const items = [
      { q: 'En una reacción química, los reactivos son:', o: ['Las sustancias que se forman', 'Las sustancias que reaccionan', 'Los catalizadores', 'Los productos finales'], c: 1, e: 'Los reactivos son las sustancias iniciales que se transforman en la reacción.' },
      { q: 'Los productos de una reacción son:', o: ['Las sustancias iniciales', 'Las sustancias que se forman', 'Los catalizadores', 'Los disolventes'], c: 1, e: 'Los productos son las sustancias nuevas que resultan de la reacción química.' },
      { q: 'En una combustión se produce:', o: ['Oxígeno', 'Agua y CO₂', 'Hidrógeno', 'Nitrógeno'], c: 1, e: 'La combustión de un hidrocarburo produce dióxido de carbono (CO₂) y agua (H₂O), liberando energía.' },
      { q: 'El pH neutro es:', o: ['0', '7', '14', '1'], c: 1, e: 'El pH 7 es neutro. Menores indican acidez; mayores, basicidad.' },
      { q: 'Un ácido tiene un pH:', o: ['Mayor que 7', 'Menor que 7', 'Igual a 7', 'Igual a 14'], c: 1, e: 'Los ácidos tienen pH menor que 7. A menor pH, más ácido.' },
      { q: 'Una base tiene un pH:', o: ['Menor que 7', 'Mayor que 7', 'Igual a 7', 'Igual a 0'], c: 1, e: 'Las bases o álcalis tienen pH mayor que 7.' },
      { q: 'La fórmula del agua es:', o: ['CO₂', 'H₂O', 'O₂', 'H₂O₂'], c: 1, e: 'La molécula de agua es H₂O: dos átomos de hidrógeno y uno de oxígeno.' },
      { q: 'La oxidación implica:', o: ['Ganancia de electrones', 'Pérdida de electrones', 'Ganancia de protones', 'Pérdida de neutrones'], c: 1, e: 'La oxidación es la pérdida de electrones; la reducción es la ganancia. Juntas forman reacciones redox.' },
    ];
    return items.map((i) => makeQuestion('quimica', 'La reacción química', i.q, i.o, i.c, i.e));
  },
};

// ---- HABILIDAD MATEMÁTICA ----
const hmGenerators: Record<string, Generator> = {
  'Sucesiones numéricas': () => {
    const qs: Question[] = [];
    // Arithmetic sequences
    for (let i = 0; i < 50; i++) {
      const start = range(1, 10);
      const diff = range(2, 9);
      const seq = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
      const next = start + 5 * diff;
      const wrong = [next + diff, next - diff, next + 1];
      qs.push(makeQuestion('habilidad_matematica', 'Sucesiones numéricas',
        `¿Qué número continúa la serie: ${seq.join(', ')}, ...?`,
        [String(next), String(wrong[0]), String(wrong[1]), String(wrong[2])],
        0, `La diferencia entre términos es ${diff}. El siguiente es ${seq[4]} + ${diff} = ${next}.`));
    }
    // Geometric sequences
    for (let i = 0; i < 40; i++) {
      const start = range(1, 5);
      const ratio = range(2, 4);
      const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
      const next = start * ratio ** 4;
      const wrong = [next + ratio, next - ratio, seq[3] + ratio];
      qs.push(makeQuestion('habilidad_matematica', 'Sucesiones numéricas',
        `¿Qué número continúa: ${seq.join(', ')}, ...?`,
        [String(next), String(wrong[0]), String(wrong[1]), String(wrong[2])],
        0, `Cada término se multiplica por ${ratio}. El siguiente es ${seq[3]} × ${ratio} = ${next}.`));
    }
    // Fibonacci-like
    qs.push(makeQuestion('habilidad_matematica', 'Sucesiones numéricas',
      'Completa: 1, 1, 2, 3, 5, 8, ...',
      ['11', '13', '15', '12'], 1,
      'Es la serie de Fibonacci: cada término es la suma de los dos anteriores. 5 + 8 = 13.'));
    qs.push(makeQuestion('habilidad_matematica', 'Sucesiones numéricas',
      'Completa: 2, 6, 12, 20, 30, ...',
      ['36', '40', '42', '44'], 2,
      'Las diferencias son 4, 6, 8, 10, 12. El siguiente es 30 + 12 = 42.'));
    return qs;
  },
  'Series espaciales': () => {
    const items = [
      { q: '¿Qué figura continúa el patrón: △, □, ○, △, □, ...?', o: ['○', '△', '□', '◇'], c: 0, e: 'El patrón se repite cada 3 figuras: △, □, ○. Después de △, □, sigue ○.' },
      { q: 'Continúa la serie: ◐, ◓, ◑, ◒, ...', o: ['◐', '◓', '◑', '◒'], c: 0, e: 'La serie se repite cada 4 figuras. Después de ◒, vuelve a empezar con ◐.' },
      { q: 'Si rotas la figura ▷ 90° en sentido horario, obtienes:', o: ['▽', '◁', '△', '▷'], c: 0, e: 'Al rotar ▷ 90° en sentido horario, el vértice apunta hacia abajo: ▽.' },
      { q: '¿Qué figura sigue: ●○○●○○●...?', o: ['○', '●', '◐', '◑'], c: 0, e: 'El patrón es ●○○ repetido. Después de ●, siguen ○, ○. Como ya está ●, sigue ○.' },
    ];
    return items.map((i) => makeQuestion('habilidad_matematica', 'Series espaciales', i.q, i.o, i.c, i.e));
  },
  'Imaginación espacial': () => {
    const items = [
      { q: '¿Cuántas caras tiene un cubo?', o: ['4', '6', '8', '12'], c: 1, e: 'Un cubo tiene 6 caras cuadradas.' },
      { q: '¿Cuántas aristas tiene un cubo?', o: ['6', '8', '12', '24'], c: 2, e: 'Un cubo tiene 12 aristas (las líneas donde se unen las caras).' },
      { q: '¿Cuántos vértices tiene un cubo?', o: ['6', '8', '12', '4'], c: 1, e: 'Un cubo tiene 8 vértices (las esquinas).' },
      { q: 'Si doblas un cubo de papel, la cara opuesta a la superior es:', o: ['La frontal', 'La inferior', 'La lateral derecha', 'La posterior'], c: 1, e: 'En un cubo, cada cara tiene una opuesta. La opuesta a la superior es la inferior.' },
      { q: 'Un prisma triangular tiene caras:', o: ['2 triangulares y 3 rectangulares', '4 cuadradas', '6 rectangulares', '2 circulares'], c: 0, e: 'Un prisma triangular tiene 2 bases triangulares y 3 caras laterales rectangulares.' },
      { q: 'La figura que resulta al cortar una esfera por la mitad es:', o: ['Un triángulo', 'Un círculo', 'Un cuadrado', 'Un rectángulo'], c: 1, e: 'Al cortar una esfera por su centro, la sección es un círculo.' },
    ];
    return items.map((i) => makeQuestion('habilidad_matematica', 'Imaginación espacial', i.q, i.o, i.c, i.e));
  },
  'Problemas de razonamiento': () => {
    const qs: Question[] = [];
    // Inverse proportionality
    for (let i = 0; i < 30; i++) {
      const workers = range(3, 8);
      const days = range(6, 15);
      const newWorkers = workers * 2;
      const newDays = (workers * days) / newWorkers;
      qs.push(makeQuestion('habilidad_matematica', 'Problemas de razonamiento',
        `Si ${workers} obreros construyen un muro en ${days} días, ¿cuántos días tardarán ${newWorkers} obreros?`,
        [`${newDays} días`, `${days} días`, `${days * 2} días`, `${newDays / 2} días`],
        0, `Es inversamente proporcional: más obreros, menos días. (${workers}×${days})/${newWorkers} = ${newDays} días.`));
    }
    // Age problems
    for (let i = 0; i < 30; i++) {
      const son = range(5, 15);
      const father = son * range(2, 4);
      const total = son + father;
      qs.push(makeQuestion('habilidad_matematica', 'Problemas de razonamiento',
        `La edad de Juan es el doble que la de su hijo. Si juntos suman ${total} años, ¿cuánto tiene el hijo?`,
        [`${son}`, `${father}`, `${Math.round(total / 3)}`, `${son * 3}`],
        0, `Sea x la edad del hijo. Juan = 2x. x + 2x = ${total}; 3x = ${total}; x = ${son}.`));
    }
    // Discount
    for (let i = 0; i < 20; i++) {
      const pct = pick([15, 20, 25, 30]);
      const final = range(150, 300);
      const original = Math.round(final / (1 - pct / 100));
      qs.push(makeQuestion('habilidad_matematica', 'Problemas de razonamiento',
        `Si un producto con ${pct}% de descuento cuesta $${final}, ¿cuál era el precio original?`,
        [`$${original}`, `$${final + pct}`, `$${Math.round(final * (1 + pct / 100))}`, `$${original + 50}`],
        0, `Si el descuento es ${pct}%, $${final} representa el ${100 - pct}%. Original = ${final}/${(100 - pct) / 100} = $${original}.`));
    }
    return qs;
  },
};

// ---- BIOLOGÍA ----
const biologiaGenerators: Record<string, Generator> = {
  'El valor de la biodiversidad': () => {
    const items = [
      { q: 'La biodiversidad se define como:', o: ['La cantidad de personas', 'La variedad de seres vivos en un ecosistema', 'El número de climas', 'El tamaño de los océanos'], c: 1, e: 'La biodiversidad es la variedad de organismos vivos, incluidos genes, especies y ecosistemas.' },
      { q: 'Un ecosistema está formado por:', o: ['Solo plantas', 'Serés vivos y su ambiente físico', 'Solo animales', 'Solo el clima'], c: 1, e: 'Un ecosistema incluye todos los seres vivos (biocenosis) y el ambiente físico (biotopo) en que habitan.' },
      { q: 'Una cadena alimentaria describe:', o: ['El clima', 'La transferencia de energía entre organismos', 'El ciclo del agua', 'La reproducción'], c: 1, e: 'La cadena alimentaria muestra cómo fluye la energía de un organismo a otro mediante la alimentación.' },
      { q: 'Los productores en una cadena alimentaria son:', o: ['Los carnívoros', 'Las plantas y algas', 'Los descomponedores', 'Los herbívoros'], c: 1, e: 'Los productores (plantas, algas) fabrican su propio alimento mediante fotosíntesis; son la base de la cadena.' },
      { q: 'Los descomponedores se encargan de:', o: ['Producir alimento', 'Descomponer restos orgánicos y reciclar nutrientes', 'Cazar presas', 'Polinizar flores'], c: 1, e: 'Los descomponedores (hongos, bacterias) descomponen materia orgánica muerta y devuelven nutrientes al suelo.' },
      { q: 'La pérdida de biodiversidad se debe principalmente a:', o: ['La fotosíntesis', 'La destrucción de hábitats', 'El ciclo del agua', 'La respiración'], c: 1, e: 'La destrucción de hábitats (deforestación, urbanización) es la principal causa de pérdida de biodiversidad.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'El valor de la biodiversidad', i.q, i.o, i.c, i.e));
  },
  'Tecnología y sociedad': () => {
    const items = [
      { q: 'La biotecnología aplica conocimientos biológicos para:', o: ['Destruir el ambiente', 'Desarrollar productos útiles para la sociedad', 'Eliminar especies', 'Cambiar el clima'], c: 1, e: 'La biotecnología usa organismos vivos para crear productos como medicamentos, vacunas y alimentos modificados.' },
      { q: 'Un ejemplo de biotecnología es:', o: ['La tala de árboles', 'La producción de insulina con bacterias', 'La quema de combustibles', 'La caza de animales'], c: 1, e: 'La producción de insulina humana mediante bacterias modificadas genéticamente es un ejemplo de biotecnología.' },
      { q: 'Los organismos transgénicos contienen:', o: ['Solo genes propios', 'Genes de otra especie', 'No tienen genes', 'Solo ADN modificado naturalmente'], c: 1, e: 'Los organismos transgénicos tienen genes de otra especie insertados artificialmente.' },
      { q: 'El uso responsable de la tecnología implica:', o: ['Aplicarla sin restricciones', 'Considerar beneficios y riesgos éticos y ambientales', 'Evitar toda innovación', 'Solo usarla para fines militares'], c: 1, e: 'El uso responsable evalúa los beneficios, riesgos e implicaciones éticas y ambientales de la tecnología.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'Tecnología y sociedad', i.q, i.o, i.c, i.e));
  },
  'Transformación de materia y energía': () => {
    const items = [
      { q: 'La fotosíntesis transforma:', o: ['Energía solar en energía química', 'Energía química en solar', 'Materia en energía nuclear', 'Calor en electricidad'], c: 0, e: 'La fotosíntesis convierte la energía solar en energía química (glucosa) usando CO₂ y agua.' },
      { q: 'La respiración celular transforma:', o: ['Energía solar en química', 'Glucosa en energía útil (ATP)', 'Agua en luz', 'CO₂ en oxígeno'], c: 1, e: 'La respiración celular descompone glucosa con oxígeno para producir ATP, liberando CO₂ y agua.' },
      { q: 'En la fotosíntesis, las plantas absorben:', o: ['Oxígeno y liberan CO₂', 'CO₂ y liberan oxígeno', 'Nitrógeno y liberan hidrógeno', 'Agua y liberan sal'], c: 1, e: 'Las plantas absorben CO₂ y liberan O₂ durante la fotosíntesis, lo contrario de la respiración.' },
      { q: 'Los flujos de energía en un ecosistema son:', o: ['Cíclicos', 'Lineales y unidireccionales', 'Reversibles siempre', 'Nulos'], c: 1, e: 'La energía fluye en una sola dirección (lineal): del sol a productores, luego a consumidores; se disipa como calor.' },
      { q: 'La materia en un ecosistema:', o: ['Se pierde definitivamente', 'Se recicla continuamente', 'Solo entra, no sale', 'Se convierte en energía'], c: 1, e: 'La materia se recicla en los ciclos biogeoquímicos (carbono, nitrógeno, agua), a diferencia de la energía.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'Transformación de materia y energía', i.q, i.o, i.c, i.e));
  },
  'Nutrición y respiración para el cuidado de la salud': () => {
    const items = [
      { q: 'Los nutrientes principales en la dieta son:', o: ['Solo grasas', 'Carbohidratos, proteínas, grasas, vitaminas y minerales', 'Solo agua', 'Solo proteínas'], c: 1, e: 'Una dieta equilibrada incluye carbohidratos, proteínas, grasas, vitaminas, minerales y agua.' },
      { q: 'El sistema respiratorio humano intercambia:', o: ['Alimento por energía', 'Oxígeno por dióxido de carbono', 'Agua por sales', 'Glucosa por ATP'], c: 1, e: 'En los alvéolos pulmonares, el oxígeno entra a la sangre y el CO₂ sale de ella.' },
      { q: 'Los alvéolos se encuentran en:', o: ['El corazón', 'Los pulmones', 'El estómago', 'El hígado'], c: 1, e: 'Los alvéolos son sacos pequeños en los pulmones donde ocurre el intercambio de gases.' },
      { q: 'La dieta equilibrada contribuye a:', o: ['Aumentar el colesterol', 'Mantener la salud y prevenir enfermedades', 'Disminuir las defensas', 'Causar obesidad'], c: 1, e: 'Una dieta equilibrada proporciona los nutrientes necesarios para mantener la salud y prevenir enfermedades.' },
      { q: 'El hierro es importante para:', o: ['Los huesos', 'La formación de hemoglobina en la sangre', 'La vista', 'La digestión'], c: 1, e: 'El hierro es esencial para la hemoglobina, proteína que transporta oxígeno en la sangre.' },
      { q: 'La vitamina C ayuda a:', o: ['Formar huesos', 'Fortalecer el sistema inmunológico', 'Digestión de grasas', 'Coagulación'], c: 1, e: 'La vitamina C fortalece el sistema inmunológico y ayuda a absorber hierro.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'Nutrición y respiración para el cuidado de la salud', i.q, i.o, i.c, i.e));
  },
  'Reproducción y sexualidad': () => {
    const items = [
      { q: 'La reproducción sexual implica:', o: ['Un solo progenitor', 'La fusión de dos células sexuales (gametos)', 'División de una célula', 'Gemación'], c: 1, e: 'La reproducción sexual combina gametos (espermatozoide y óvulo) formando un cigoto con información genética de ambos.' },
      { q: 'La reproducción asexual produce descendientes:', o: ['Genéticamente idénticos al progenitor', 'Con variación genética', 'Siempre más fuertes', 'De diferentes especies'], c: 0, e: 'La reproducción asexual genera clones genéticamente idénticos al progenitor.' },
      { q: 'El cigoto resulta de la unión de:', o: ['Dos espermatozoides', 'Un espermatozoide y un óvulo', 'Dos óvulos', 'Dos células somáticas'], c: 1, e: 'El cigoto se forma al fusionarse un espermatozoide y un óvulo (fecundación).' },
      { q: 'La sexualidad incluye aspectos:', o: ['Solo biológicos', 'Biológicos, psicológicos y sociales', 'Solo físicos', 'Solo sociales'], c: 1, e: 'La sexualidad abarca dimensiones biológicas, psicológicas, sociales y afectivas.' },
      { q: 'Un método anticonceptivo de barrera es:', o: ['Las pastillas anticonceptivas', 'El preservativo', 'El DIU', 'La ligadura de trompas'], c: 1, e: 'El preservativo es un método de barrera que impide el contacto entre espermatozoide y óvulo, además de prevenir ITS.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'Reproducción y sexualidad', i.q, i.o, i.c, i.e));
  },
  'Genética, tecnología y sociedad': () => {
    const items = [
      { q: 'El ADN se encuentra principalmente en:', o: ['El citoplasma', 'El núcleo de la célula', 'La membrana', 'Los ribosomas'], c: 1, e: 'En las células eucariotas, el ADN está principalmente en el núcleo.' },
      { q: 'Los genes son segmentos de:', o: ['Proteínas', 'ADN', 'Lípidos', 'Glúcidos'], c: 1, e: 'Los genes son fragmentos de ADN que contienen información para producir proteínas y determinar características.' },
      { q: 'Mendel es conocido como el padre de:', o: ['La evolución', 'La genética', 'La ecología', 'La taxonomía'], c: 1, e: 'Gregor Mendel estableció las leyes de la herencia mediante experimentos con guisantes.' },
      { q: 'El genoma humano es:', o: ['El conjunto de órganos', 'El conjunto completo de genes de la especie humana', 'El número de células', 'El tipo de sangre'], c: 1, e: 'El genoma humano es la totalidad de información genética (ADN) de la especie humana.' },
      { q: 'La clonación consiste en:', o: ['Modificar genes', 'Producir copias genéticamente idénticas', 'Fusionar células', 'Eliminar genes'], c: 1, e: 'La clonación produce organismos o células genéticamente idénticas al original.' },
      { q: 'La terapia génica busca:', o: ['Eliminar órganos', 'Corregir genes defectuosos para tratar enfermedades', 'Clonar personas', 'Modificar el clima'], c: 1, e: 'La terapia génica introduce o modifica genes para tratar enfermedades genéticas.' },
    ];
    return items.map((i) => makeQuestion('biologia', 'Genética, tecnología y sociedad', i.q, i.o, i.c, i.e));
  },
};

// ---- HISTORIA ----
const historiaGenerators: Record<string, Generator> = {
  'De principios del siglo XVI a principios del siglo XVIII': () => {
    const items = [
      { q: 'El Renacimiento se originó en:', o: ['Inglaterra', 'Italia', 'España', 'Francia'], c: 1, e: 'El Renacimiento surgió en Italia (siglos XIV-XVI) y se extendió por Europa.' },
      { q: 'La Reforma Protestante fue iniciada por:', o: ['Calvino', 'Martín Lutero', 'Enrique VIII', 'Zwinglio'], c: 1, e: 'Martín Lutero inició la Reforma en 1517 al publicar sus 95 tesis contra las indulgencias.' },
      { q: 'El descubrimiento de América ocurrió en:', o: ['1453', '1492', '1500', '1517'], c: 1, e: 'Cristóbal Colón llegó a América el 12 de octubre de 1492.' },
      { q: 'La Conquista de México-Tenochtitlan ocurrió entre:', o: ['1492-1500', '1519-1521', '1530-1540', '1550-1560'], c: 1, e: 'Hernán Cortés inició la conquista en 1519 y culminó con la caída de Tenochtitlan en 1521.' },
      { q: 'El absolutismo monárquico se consolidó en:', o: ['Inglaterra', 'Francia', 'Holanda', 'Italia'], c: 1, e: 'El absolutismo se consolidó en Francia con Luis XIV, "el Rey Sol".' },
      { q: 'La Contrarreforma fue impulsada por:', o: ['La Iglesia Anglicana', 'La Iglesia Católica', 'Los protestantes', 'Los humanistas'], c: 1, e: 'La Iglesia Católica impulsó la Contrarreforma mediante el Concilio de Trento (1545-1563).' },
    ];
    return items.map((i) => makeQuestion('historia', 'De principios del siglo XVI a principios del siglo XVIII', i.q, i.o, i.c, i.e));
  },
  'De mediados del siglo XVIII a mediados del siglo XIX': () => {
    const items = [
      { q: 'La Revolución Industrial comenzó en:', o: ['Francia', 'Inglaterra', 'Alemania', 'Estados Unidos'], c: 1, e: 'La Revolución Industrial se inició en Inglaterra a mediados del siglo XVIII.' },
      { q: 'La Independencia de Estados Unidos se declaró en:', o: ['1776', '1789', '1810', '1821'], c: 0, e: 'La Declaración de Independencia de EE.UU. fue el 4 de julio de 1776.' },
      { q: 'La Revolución Francesa estalló en:', o: ['1776', '1789', '1804', '1810'], c: 1, e: 'La Revolución Francesa comenzó en 1789 con la toma de la Bastilla.' },
      { q: 'Napoleón Bonaparte fue emperador de:', o: ['Inglaterra', 'Francia', 'España', 'Alemania'], c: 1, e: 'Napoleón fue coronado emperador de Francia en 1804.' },
      { q: 'El movimiento de Independencia en México inició en:', o: ['1789', '1810', '1821', '1910'], c: 1, e: 'La Independencia de México inició el 16 de septiembre de 1810 con el grito de Dolores.' },
      { q: 'La Ilustración fue un movimiento:', o: ['Religioso', 'Filosófico que promovió la razón y el conocimiento', 'Militar', 'Artístico únicamente'], c: 1, e: 'La Ilustración (siglo XVIII) promovió la razón, la ciencia y la crítica al absolutismo.' },
    ];
    return items.map((i) => makeQuestion('historia', 'De mediados del siglo XVIII a mediados del siglo XIX', i.q, i.o, i.c, i.e));
  },
  'De mediados del siglo XIX a 1920': () => {
    const items = [
      { q: 'La Revolución Industrial de la segunda fase se basó en:', o: ['Vapor y textiles', 'Electricidad y petróleo', 'Carbón únicamente', 'Energía nuclear'], c: 1, e: 'La segunda Revolución Industrial (1850-1914) se basó en electricidad, petróleo y acero.' },
      { q: 'La Reforma en México fue impulsada por:', o: ['Porfirio Díaz', 'Benito Juárez', 'Santa Anna', 'Maximiliano'], c: 1, e: 'Benito Juárez impulsó las Leyes de Reforma (1859-1860) separando Iglesia y Estado.' },
      { q: 'El Imperio de Maximiliano en México duró de:', o: ['1821-1824', '1864-1867', '1876-1911', '1910-1917'], c: 1, e: 'Maximiliano gobernó México de 1864 a 1867, cuando fue fusilado en Querétaro.' },
      { q: 'La Primera Guerra Mundial duró de:', o: ['1910-1920', '1914-1918', '1939-1945', '1900-1910'], c: 1, e: 'La Primera Guerra Mundial duró de 1914 a 1918.' },
      { q: 'La Revolución Mexicana inició en:', o: ['1810', '1821', '1910', '1929'], c: 2, e: 'La Revolución Mexicana inició en 1910 encabezada por Francisco I. Madero.' },
      { q: 'El Porfiriato se caracterizó por:', o: ['Democracia plena', 'Crecimiento económico y dictadura', 'Reparto agrario', 'Independencia'], c: 1, e: 'El Porfiriato (1876-1911) trajo crecimiento económico pero también desigualdad y autoritarismo.' },
    ];
    return items.map((i) => makeQuestion('historia', 'De mediados del siglo XIX a 1920', i.q, i.o, i.c, i.e));
  },
  'El mundo entre 1920 y 1960': () => {
    const items = [
      { q: 'La Gran Depresión comenzó en:', o: ['1920', '1929', '1939', '1945'], c: 1, e: 'La Gran Depresión se inició con el crack bursátil de octubre de 1929 en EE.UU.' },
      { q: 'La Segunda Guerra Mundial duró de:', o: ['1914-1918', '1939-1945', '1929-1939', '1945-1960'], c: 1, e: 'La Segunda Guerra Mundial duró de 1939 a 1945.' },
      { q: 'La ONU se fundó en:', o: ['1919', '1945', '1948', '1950'], c: 1, e: 'La Organización de las Naciones Unidas se fundó en 1945 tras la Segunda Guerra Mundial.' },
      { q: 'La Guerra Fría enfrentó a:', o: ['EE.UU. y China', 'EE.UU. y la URSS', 'Francia y Alemania', 'Japón y Corea'], c: 1, e: 'La Guerra Fría fue el enfrentamiento ideológico entre EE.UU. (capitalismo) y la URSS (comunismo).' },
      { q: 'El cardenismo en México se caracterizó por:', o: ['Privatización', 'Reparto agrario y nacionalización del petróleo', 'Dictadura militar', 'Abolición de la educación'], c: 1, e: 'Lázaro Cárdenas (1934-1940) distribuyó tierras y expropió el petróleo en 1938.' },
    ];
    return items.map((i) => makeQuestion('historia', 'El mundo entre 1920 y 1960', i.q, i.o, i.c, i.e));
  },
  'Décadas recientes': () => {
    const items = [
      { q: 'El muro de Berlín cayó en:', o: ['1961', '1989', '1991', '1985'], c: 1, e: 'El muro de Berlín cayó el 9 de noviembre de 1989, simbolizando el fin de la Guerra Fría.' },
      { q: 'La globalización se intensificó a partir de:', o: ['Los años 50', 'Los años 90', 'El año 2000', 'Los años 70'], c: 1, e: 'En la década de 1990, con la caída del bloque comunista y el auge de internet, la globalización se aceleró.' },
      { q: 'Los ataques del 11 de septiembre ocurrieron en:', o: ['2001', '2003', '1999', '2005'], c: 0, e: 'Los atentados del 11-S en EE.UU. ocurrieron en 2001, marcando un giro en la política mundial.' },
      { q: 'La caída de la URSS ocurrió en:', o: ['1989', '1991', '1995', '1985'], c: 1, e: 'La Unión Soviética se disolvió formalmente en diciembre de 1991.' },
      { q: 'El TLCAN entró en vigor en:', o: ['1990', '1994', '2000', '1989'], c: 1, e: 'El Tratado de Libre Comercio de América del Norte entró en vigor el 1 de enero de 1994.' },
    ];
    return items.map((i) => makeQuestion('historia', 'Décadas recientes', i.q, i.o, i.c, i.e));
  },
  'Las culturas prehispánicas y la conformación de la Nueva España': () => {
    const items = [
      { q: 'La civilización mexica fundó su capital en:', o: ['Tula', 'Tenochtitlan', 'Teotihuacan', 'Chichén Itzá'], c: 1, e: 'Los mexicas fundaron Tenochtitlan en 1325, sobre un islote en el lago de Texcoco.' },
      { q: 'Los mayas se desarrollaron en:', o: ['El centro de México', 'Mesoamérica sur y península de Yucatán', 'El norte de México', 'Sudamérica'], c: 1, e: 'La civilización maya floreció en el sur de Mesoamérica: Yucatán, Guatemala y Belice.' },
      { q: 'Los toltecas tenían su capital en:', o: ['Tula', 'Tenochtitlan', 'Monte Albán', 'Palenque'], c: 0, e: 'Los toltecas establecieron su capital en Tula, Hidalgo.' },
      { q: 'Hernán Cortés llegó a México en:', o: ['1492', '1519', '1521', '1530'], c: 1, e: 'Cortés llegó a las costas de Veracruz en 1519.' },
      { q: 'Moctezuma II fue el último emperador:', o: ['Maya', 'Mexica libre antes de la conquista', 'Tolteca', 'Zapoteca'], c: 1, e: 'Moctezuma II gobernó a los mexicas durante la llegada de los españoles (1519-1520).' },
      { q: 'La Nueva España fue el nombre dado al territorio por:', o: ['Los aztecas', 'Los españoles', 'Los mayas', 'Los criollos'], c: 1, e: 'Los españoles denominaron Nueva España al territorio conquistado, con capital en la Ciudad de México.' },
    ];
    return items.map((i) => makeQuestion('historia', 'Las culturas prehispánicas y la conformación de la Nueva España', i.q, i.o, i.c, i.e));
  },
  'Nueva España desde su consolidación hasta la independencia': () => {
    const items = [
      { q: 'La sociedad novohispana estaba organizada en:', o: ['Clases iguales', 'Castas según el origen étnico', 'Solo dos grupos', 'Sin jerarquía'], c: 1, e: 'La sociedad novohispana se organizó en castas: peninsulares, criollos, mestizos, indígenas y esclavos.' },
      { q: 'Los criollos eran:', o: ['Nacidos en España', 'Hijos de españoles nacidos en América', 'Indígenas', 'Mestizos'], c: 1, e: 'Los criollos eran descendientes de españoles nacidos en América; tenían riqueza pero menos poder político que los peninsulares.' },
      { q: 'Miguel Hidalgo inició la Independencia en:', o: ['1810', '1821', '1810', '1810'], c: 1, e: 'Miguel Hidalgo lanzó el grito de Dolores el 16 de septiembre de 1810.' },
      { q: 'José María Morelos continuó la lucha tras:', o: ['La Independencia', 'La muerte de Hidalgo en 1811', 'El Plan de Iguala', 'La Revolución'], c: 1, e: 'Tras la muerte de Hidalgo (1811), Morelos asumió el liderazgo independentista.' },
      { q: 'La consumación de la Independencia fue en:', o: ['1810', '1814', '1821', '1824'], c: 2, e: 'La Independencia se consumó el 27 de septiembre de 1821 con la entrada del Ejército Trigarante a la Ciudad de México.' },
    ];
    return items.map((i) => makeQuestion('historia', 'Nueva España desde su consolidación hasta la independencia', i.q, i.o, i.c, i.e));
  },
  'De la consumación de la Independencia al inicio de la Revolución Mexicana (1821-1911)': () => {
    const items = [
      { q: 'El Primer Imperio Mexicano fue encabezado por:', o: ['Iturbide', 'Juárez', 'Santa Anna', 'Guerrero'], c: 0, e: 'Agustín de Iturbide encabezó el Primer Imperio (1821-1823).' },
      { q: 'La Reforma fue liderada por:', o: ['Santa Anna', 'Benito Juárez', 'Porfirio Díaz', 'Iturbide'], c: 1, e: 'Benito Juárez lideró la Reforma, que separó Iglesia y Estado y promulgó la Constitución de 1857.' },
      { q: 'La Intervención Francesa y el Imperio de Maximiliano ocurrieron de:', o: ['1821-1824', '1862-1867', '1876-1911', '1910-1917'], c: 1, e: 'La Intervención Francesa duró de 1862 a 1867; Maximiliano fue emperador de 1864 a 1867.' },
      { q: 'La Constitución de 1857 estableció:', o: ['El absolutismo', 'Garantías individuales y separación Iglesia-Estado', 'El imperio', 'La esclavitud'], c: 1, e: 'La Constitución de 1857 garantizó derechos individuales y estableció el estado laico.' },
      { q: 'El Plan de Tuxtepec fue proclamado por:', o: ['Juárez', 'Porfirio Díaz', 'Madero', 'Iturbide'], c: 1, e: 'Porfirio Díaz proclamó el Plan de Tuxtepec (1876) contra la reelección de Lerdo de Tejada.' },
    ];
    return items.map((i) => makeQuestion('historia', 'De la consumación de la Independencia al inicio de la Revolución Mexicana (1821-1911)', i.q, i.o, i.c, i.e));
  },
  'Instituciones revolucionarias y desarrollo económico (1911-1979)': () => {
    const items = [
      { q: 'El iniciador de la Revolución Mexicana fue:', o: ['Pancho Villa', 'Francisco I. Madero', 'Zapata', 'Carranza'], c: 1, e: 'Francisco I. Madero inició la Revolución con el Plan de San Luis en 1910.' },
      { q: 'La Constitución de 1917 se promulgó en:', o: ['Querétaro', 'Ciudad de México', 'Guadalajara', 'Veracruz'], c: 0, e: 'La Constitución vigente se promulgó en Querétaro el 5 de febrero de 1917.' },
      { q: 'El artículo 27 de la Constitución de 1917 establece:', o: ['La libertad de prensa', 'La propiedad de la nación sobre tierras y aguas', 'El voto femenino', 'La educación obligatoria'], c: 1, e: 'El artículo 27 establece que la propiedad de tierras y aguas corresponde originariamente a la nación.' },
      { q: 'Lázaro Cárdenas expropió el petróleo en:', o: ['1917', '1938', '1929', '1940'], c: 1, e: 'Cárdenas nacionalizó la industria petrolera el 18 de marzo de 1938.' },
      { q: 'El PRI fue fundado en:', o: ['1917', '1929', '1938', '1946'], c: 1, e: 'El PNR (luego PRI) se fundó en 1929 como partido oficial bajo Plutarco Elías Calles.' },
    ];
    return items.map((i) => makeQuestion('historia', 'Instituciones revolucionarias y desarrollo económico (1911-1979)', i.q, i.o, i.c, i.e));
  },
  'México en la era global (1970-2000)': () => {
    const items = [
      { q: 'La crisis del petróleo afectó a México en la década de:', o: ['1970', '1982', '1994', '2000'], c: 1, e: 'En 1982, la caída del precio del petróleo provocó una severa crisis económica y de deuda en México.' },
      { q: 'El TLCAN entró en vigor en:', o: ['1990', '1994', '2000', '2001'], c: 1, e: 'El Tratado de Libre Comercio de América del Norte (TLCAN) entró en vigor el 1 de enero de 1994.' },
      { q: 'El levantamiento zapatista de 1994 ocurrió en:', o: ['Oaxaca', 'Chiapas', 'Guerrero', 'Chihuahua'], c: 1, e: 'El EZLN se levantó en Chiapas el 1 de enero de 1994, el mismo día que entró en vigor el TLCAN.' },
      { q: 'La transición democrática en México se consolidó con la victoria de:', o: ['Carlos Salinas', 'Vicente Fox en 2000', 'López Portillo', 'Luis Echeverría'], c: 1, e: 'En 2000, Vicente Fox (PAN) ganó las elecciones, terminando con 71 años de gobierno del PRI.' },
    ];
    return items.map((i) => makeQuestion('historia', 'México en la era global (1970-2000)', i.q, i.o, i.c, i.e));
  },
};

// ---- MATEMÁTICAS ----
const matematicasGenerators: Record<string, Generator> = {
  'Sentido numérico y pensamiento algebraico': () => {
    const qs: Question[] = [];
    // Percentage
    for (let i = 0; i < 5; i++) {
      const pct = pick([10, 15, 20, 25, 30, 40, 50]);
      const base = range(100, 600);
      const result = (pct / 100) * base;
      const wrong = [result + range(5, 20), result - range(3, 15), result + range(21, 40)];
      qs.push(makeQuestion('matematicas', 'Sentido numérico y pensamiento algebraico',
        `¿Cuánto es ${pct}% de ${base}?`,
        [`${result}`, `${wrong[0]}`, `${wrong[1]}`, `${wrong[2]}`],
        0, `${pct}% de ${base} = 0.${pct} × ${base} = ${result}.`));
    }
    // Linear equation
    for (let i = 0; i < 5; i++) {
      const a = range(2, 9);
      const b = range(3, 20);
      const x = range(2, 12);
      const result = a * x + b;
      qs.push(makeQuestion('matematicas', 'Sentido numérico y pensamiento algebraico',
        `Si ${a}x + ${b} = ${result}, entonces x = ?`,
        [`${x}`, `${x + 1}`, `${x - 1}`, `${x + 2}`],
        0, `${a}x = ${result} - ${b} = ${result - b}; x = ${result - b}/${a} = ${x}.`));
    }
    // Fractions
    const fracs = [
      { q: 'Resuelve: 3/4 + 5/8', o: ['11/8', '8/12', '1', '2/3'], c: 0, e: '3/4 = 6/8; 6/8 + 5/8 = 11/8.' },
      { q: 'Resuelve: 2/3 × 3/4', o: ['1/2', '6/12', '1/3', '5/6'], c: 0, e: '2/3 × 3/4 = 6/12 = 1/2.' },
      { q: 'Resuelve: 5/6 - 1/3', o: ['1/2', '4/3', '2/6', '3/6'], c: 0, e: '1/3 = 2/6; 5/6 - 2/6 = 3/6 = 1/2.' },
    ];
    fracs.forEach((f) => qs.push(makeQuestion('matematicas', 'Sentido numérico y pensamiento algebraico', f.q, f.o, f.c, f.e)));
    // Factorización
    qs.push(makeQuestion('matematicas', 'Sentido numérico y pensamiento algebraico', 'Factoriza: x² - 9', ['(x-3)(x+3)', '(x-3)²', '(x+3)²', '(x-9)(x+1)'], 0, 'x² - 9 es una diferencia de cuadrados: (x-3)(x+3).'));
    qs.push(makeQuestion('matematicas', 'Sentido numérico y pensamiento algebraico', 'Si f(x) = 2x + 3, ¿cuánto es f(4)?', ['11', '9', '7', '14'], 0, 'f(4) = 2(4) + 3 = 8 + 3 = 11.'));
    return qs;
  },
  'Forma, espacio y medida': () => {
    const qs: Question[] = [];
    // Triangle area
    for (let i = 0; i < 4; i++) {
      const b = range(4, 16);
      const h = range(3, 14);
      const area = (b * h) / 2;
      qs.push(makeQuestion('matematicas', 'Forma, espacio y medida',
        `El área de un triángulo con base ${b} y altura ${h} es:`,
        [`${area}`, `${b * h}`, `${area + range(2, 5)}`, `${Math.round(area / 2)}`],
        0, `Área = (base × altura)/2 = (${b} × ${h})/2 = ${area}.`));
    }
    // Circle
    for (let i = 0; i < 3; i++) {
      const r = range(3, 12);
      const area = Math.round(Math.PI * r * r);
      qs.push(makeQuestion('matematicas', 'Forma, espacio y medida',
        `El área de un círculo con radio ${r} es (usa π ≈ 3.14):`,
        [`${Math.round(3.14 * r * r)}`, `${2 * 3.14 * r}`, `${r * r}`, `${Math.round(3.14 * r)}`],
        0, `Área = π × r² = 3.14 × ${r}² = ${Math.round(3.14 * r * r)}.`));
    }
    const concepts = [
      { q: 'La suma de los ángulos internos de un triángulo es:', o: ['90°', '180°', '270°', '360°'], c: 1, e: 'La suma de los ángulos internos de cualquier triángulo es 180°.' },
      { q: 'El volumen de un cubo de arista 4 es:', o: ['16', '64', '32', '128'], c: 1, e: 'Volumen = arista³ = 4³ = 64.' },
      { q: 'El perímetro de un cuadrado de lado 7 es:', o: ['14', '28', '49', '21'], c: 1, e: 'Perímetro = 4 × lado = 4 × 7 = 28.' },
      { q: 'El Teorema de Pitágoras establece:', o: ['a + b = c', 'a² + b² = c²', 'a² - b² = c²', 'a × b = c²'], c: 1, e: 'En un triángulo rectángulo, a² + b² = c², donde c es la hipotenusa.' },
    ];
    concepts.forEach((c) => qs.push(makeQuestion('matematicas', 'Forma, espacio y medida', c.q, c.o, c.c, c.e)));
    return qs;
  },
  'Manejo de la información': () => {
    const items = [
      { q: 'La media aritmética de 4, 6, 8, 10 es:', o: ['6', '7', '8', '9'], c: 1, e: 'Media = (4+6+8+10)/4 = 28/4 = 7.' },
      { q: 'La mediana de 3, 5, 7, 9, 11 es:', o: ['5', '7', '9', '7.5'], c: 1, e: 'La medana es el valor central de los datos ordenados: 7.' },
      { q: 'La moda de 2, 4, 4, 6, 8 es:', o: ['2', '4', '6', '8'], c: 1, e: 'La moda es el valor que más se repite: 4.' },
      { q: 'Al lanzar un dado, la probabilidad de obtener un número par es:', o: ['1/6', '1/3', '1/2', '2/3'], c: 2, e: 'Un dado tiene 6 caras; 3 son pares (2, 4, 6). P = 3/6 = 1/2.' },
      { q: 'Un gráfico de barras se usa para:', o: ['Mostrar tendencias continuas', 'Comparar cantidades entre categorías', 'Representar porcentajes de un total', 'Mostrar relaciones entre variables'], c: 1, e: 'El gráfico de barras compara cantidades entre diferentes categorías.' },
      { q: 'Un gráfico circular se usa para:', o: ['Comparar categorías', 'Representar porcentajes de un total', 'Mostrar tendencias', 'Representar datos continuos'], c: 1, e: 'El gráfico circular (de pastel) muestra la proporción de cada categoría respecto al total.' },
    ];
    return items.map((i) => makeQuestion('matematicas', 'Manejo de la información', i.q, i.o, i.c, i.e));
  },
  'Análisis y representación de datos': () => {
    const items = [
      { q: 'El rango de un conjunto de datos es:', o: ['El promedio', 'La diferencia entre el valor mayor y el menor', 'El valor central', 'El más frecuente'], c: 1, e: 'El rango es la diferencia entre el valor máximo y el mínimo de un conjunto de datos.' },
      { q: 'Un histograma representa:', o: ['Categorías discretas', 'La distribución de frecuencias de datos agrupados', 'Porcentajes', 'Relaciones causales'], c: 1, e: 'El histograma muestra la distribución de frecuencias de datos continuos agrupados en intervalos.' },
      { q: 'La desviación media mide:', o: ['El valor central', 'La dispersión de los datos respecto a la media', 'La moda', 'El rango'], c: 1, e: 'La desviación media promedia las distancias de cada dato respecto a la media aritmética.' },
      { q: 'Una encuesta es:', o: ['Una observación natural', 'Un método de recolección de datos mediante preguntas', 'Un experimento', 'Un censo completo'], c: 1, e: 'La encuesta recolecta datos de una muestra mediante preguntas estructuradas.' },
    ];
    return items.map((i) => makeQuestion('matematicas', 'Análisis y representación de datos', i.q, i.o, i.c, i.e));
  },
};

// ---- FORMACIÓN CÍVICA Y ÉTICA ----
const fcGenerators: Record<string, Generator> = {
  'Retos de la sociedad mexicana': () => {
    const items = [
      { q: 'La pobreza es un reto social que se manifiesta en:', o: ['Exceso de riqueza', 'Falta de acceso a bienes y servicios básicos', 'Democracia plena', 'Igualdad económica'], c: 1, e: 'La pobreza implica la falta de acceso a servicios básicos como alimentación, salud, educación y vivienda.' },
      { q: 'La desigualdad social en México se refiere a:', o: ['Distribución equitativa del ingreso', 'Brecha entre ricos y pobres', 'Ausencia de pobreza', 'Igualdad de oportunidades'], c: 1, e: 'La desigualdad social es la brecha en ingresos y oportunidades entre diferentes sectores de la población.' },
      { q: 'La corrupción afecta a la sociedad porque:', o: ['Mejora la economía', 'Deteriora la confianza institucional y el desarrollo', 'Promueve la igualdad', 'Fortalece la democracia'], c: 1, e: 'La corrupción debilita las instituciones, desvía recursos y deteriora la confianza pública.' },
      { q: 'La violencia de género es:', o: ['Un problema privado', 'Una violación a los derechos humanos', 'Legal', 'Natural'], c: 1, e: 'La violencia de género es una violación a los derechos humanos que afecta principalmente a mujeres y niñas.' },
    ];
    return items.map((i) => makeQuestion('formacion_civica_etica', 'Retos de la sociedad mexicana', i.q, i.o, i.c, i.e));
  },
  'Los desafíos del mundo contemporáneo': () => {
    const items = [
      { q: 'El calentamiento global es causado principalmente por:', o: ['Los ciclos solares únicamente', 'La emisión de gases de efecto invernadero', 'La rotación terrestre', 'Los volcanes'], c: 1, e: 'El calentamiento global se debe principalmente a la emisión antropogénica de gases de efecto invernadero (CO₂, metano).' },
      { q: 'La migración internacional se debe a:', o: ['Solo turismo', 'Búsqueda de mejores oportunidades y huida de conflictos', 'Decisiones culturales', 'Cambio climático únicamente'], c: 1, e: 'La migración responde a factores económicos, conflictos, violencia y búsqueda de mejores oportunidades.' },
      { q: 'Los conflictos bélicos contemporáneos afectan principalmente a:', o: ['Las potencias', 'La población civil', 'Solo militares', 'Las empresas'], c: 1, e: 'En los conflictos contemporáneos, la población civil sufre la mayoría de las víctimas y desplazamientos.' },
      { q: 'La sociedad de la información se caracteriza por:', o: ['Falta de tecnología', 'El uso intensivo de las TIC', 'Ausencia de internet', 'Comunicación limitada'], c: 1, e: 'La sociedad de la información se basa en el uso intensivo de tecnologías de información y comunicación (TIC).' },
    ];
    return items.map((i) => makeQuestion('formacion_civica_etica', 'Los desafíos del mundo contemporáneo', i.q, i.o, i.c, i.e));
  },
  'La construcción de la ciudadanía': () => {
    const items = [
      { q: 'Un ciudadano es aquel que:', o: ['Solo vive en un país', 'Participa en la vida pública y conoce sus derechos y obligaciones', 'Paga impuestos únicamente', 'Tiene empleo'], c: 1, e: 'Un ciudadano participa activamente en la vida pública, conoce sus derechos y cumple sus obligaciones.' },
      { q: 'Los derechos humanos son:', o: ['Privilegios otorgados por el gobierno', 'Universales, inherentes e inalienables', 'Opcionales', 'Limitados a ciertos países'], c: 1, e: 'Los derechos humanos son universales (para todos), inherentes (por ser humanos) e inalienables (no se pueden quitar).' },
      { q: 'La Declaración Universal de los Derechos Humanos fue aprobada en:', o: ['1917', '1945', '1948', '1968'], c: 2, e: 'La ONU aprobó la Declaración Universal de los Derechos Humanos el 10 de diciembre de 1948.' },
      { q: 'La tolerancia consiste en:', o: ['Estar de acuerdo con todo', 'Respetar las diferencias y opiniones diversas', 'Ignorar a los demás', 'Imponer la propia opinión'], c: 1, e: 'La tolerancia es el respeto a las diferencias de ideas, creencias y prácticas de los demás.' },
      { q: 'El voto es un derecho:', o: ['Privilegiado', 'Político fundamental en una democracia', 'Opcional sin importancia', 'Económico'], c: 1, e: 'El voto es el derecho político fundamental que permite a los ciudadanos elegir a sus representantes.' },
    ];
    return items.map((i) => makeQuestion('formacion_civica_etica', 'La construcción de la ciudadanía', i.q, i.o, i.c, i.e));
  },
  'Participación ciudadana y vida democrática': () => {
    const items = [
      { q: 'La democracia es un sistema donde el poder emana de:', o: ['El gobierno', 'El pueblo', 'El ejército', 'Las empresas'], c: 1, e: 'En una democracia, el poder emana del pueblo, que lo ejerce mediante representantes electos.' },
      { q: 'La Constitución de los Estados Unidos Mexicanos se promulgó en:', o: ['1810', '1821', '1917', '1929'], c: 2, e: 'La Constitución vigente se promulgó el 5 de febrero de 1917 en Querétaro.' },
      { q: 'Los tres poderes de la Unión en México son:', o: ['Ejecutivo, Legislativo y Judicial', 'Federal, Estatal y Municipal', 'Civil, Penal y Laboral', 'Presidencial, Congresional y Judicial'], c: 0, e: 'Los tres poderes de la Unión son: Ejecutivo (Presidente), Legislativo (Congreso) y Judicial (Suprema Corte).' },
      { q: 'La mayoría de edad en México se alcanza a los:', o: ['16 años', '18 años', '21 años', '15 años'], c: 1, e: 'En México, la mayoría de edad y el derecho al voto se adquieren a los 18 años.' },
      { q: 'Un referéndum es:', o: ['Una elección de presidente', 'Una consulta ciudadana sobre un tema específico', 'Una ley del congreso', 'Un juicio'], c: 1, e: 'El referéndum es un mecanismo de participación directa donde los ciudadanos votan sobre un asunto específico.' },
      { q: 'La rendición de cuentas significa que:', o: ['Los ciudadanos deben informar al gobierno', 'Los servidores públicos deben informar y responder por sus actos', 'No hay transparencia', 'Solo el presidente rinde cuentas'], c: 1, e: 'La rendición de cuentas obliga a los servidores públicos a informar y responder por el ejercicio de su cargo.' },
    ];
    return items.map((i) => makeQuestion('formacion_civica_etica', 'Participación ciudadana y vida democrática', i.q, i.o, i.c, i.e));
  },
};

// ============ MASTER GENERATOR MAP ============
const ALL_GENERATORS: Partial<Record<SubjectId, Record<string, Generator>>> = {
  habilidad_verbal: hvGenerators,
  geografia: geoGenerators,
  fisica: fisicaGenerators,
  espanol: espanolGenerators,
  quimica: quimicaGenerators,
  habilidad_matematica: hmGenerators,
  biologia: biologiaGenerators,
  historia: historiaGenerators,
  matematicas: matematicasGenerators,
  formacion_civica_etica: fcGenerators,
};

// ============ BANK EXPANSION + CACHING ============

// Cache of expanded question banks per subject+topic, so repeated calls
// don't re-run all generators (which can be expensive).
const _bankCache: Map<string, Question[]> = new Map();
function bankKey(subject: SubjectId, topic: string): string {
  return `${subject}::${topic}`;
}

/** Return the full question bank for a subject+topic (supplemented + generated). */
function getExpandedBank(subject: SubjectId, topic: string): Question[] {
  const key = bankKey(subject, topic);
  const cached = _bankCache.get(key);
  if (cached) return cached;

  const qs: Question[] = [];

  // 1. Base generated questions (existing generators)
  const generators = ALL_GENERATORS[subject];
  if (generators && generators[topic]) {
    qs.push(...generators[topic](topic));
  }

  // 2. Supplemental base questions from the static bank
  const supplement = SUPPLEMENT_BANK[subject]?.[topic];
  if (supplement) {
    supplement.forEach((item) => {
      qs.push(makeQuestion(subject, topic, item.q, item.o, item.c, item.e));
    });
  }

  // 3. Expanded bank (additional questions for thinner subjects)
  const expanded = EXPANDED_BANK[subject]?.[topic];
  if (expanded) {
    expanded.forEach((item) => {
      qs.push(makeQuestion(subject, topic, item.q, item.o, item.c, item.e));
    });
  }

  _bankCache.set(key, qs);
  return qs;
}

// ============ PUBLIC API ============

/** Generate a randomized set of questions for a specific subject+topic. */
export function generateQuestionsForTopic(subject: SubjectId, topic: string): Question[] {
  return shuffle(getExpandedBank(subject, topic));
}

/** Generate a randomized set for a subject (all topics mixed + parametric pool). */
export function generateQuestionsForSubject(subject: SubjectId): Question[] {
  const generators = ALL_GENERATORS[subject];
  const all: Question[] = [];
  if (generators) {
    Object.keys(generators).forEach((topic) => {
      all.push(...getExpandedBank(subject, topic));
    });
  }
  // 4. Merge in parametrically generated questions (1000+ per subject)
  all.push(...generateParametricQuestions(subject));
  return shuffle(all);
}

// Official ECOEMS distribution for the 128-question simulacro.
const SIMULACRO_DISTRIBUTION: Record<SubjectId, number> = {
  habilidad_verbal: 16,
  habilidad_matematica: 16,
  espanol: 12,
  matematicas: 16,
  biologia: 12,
  fisica: 12,
  quimica: 12,
  historia: 12,
  geografia: 8,
  formacion_civica_etica: 12,
};

// Session-level tracking of question content fingerprints to prevent
// the same question appearing in consecutive exams within one session.
const SESSION_USED = new Set<string>();

function fingerprint(q: Question): string {
  // Use the question text (not the generated id) so regenerated variants
  // with the same content are still detected as duplicates.
  return `${q.subject}:${q.question}`;
}

function pickUnused(pool: Question[], count: number): Question[] {
  const unused = pool.filter((q) => !SESSION_USED.has(fingerprint(q)));
  const source = unused.length >= count ? unused : pool;
  const shuffled = shuffle(source);
  const picked = shuffled.slice(0, count);
  picked.forEach((q) => SESSION_USED.add(fingerprint(q)));
  return picked;
}

/** Generate a full 128-question simulacro with the official ECOEMS distribution. */
export function generateSimulacroQuestions(): Question[] {
  const pool: Question[] = [];
  (Object.keys(SIMULACRO_DISTRIBUTION) as SubjectId[]).forEach((subjectId) => {
    const count = SIMULACRO_DISTRIBUTION[subjectId];
    const subjectQs = generateQuestionsForSubject(subjectId);
    pool.push(...pickUnused(subjectQs, count));
  });
  return shuffle(pool);
}

export function getQuestionCountForTopic(subject: SubjectId, topic: string): number {
  return getExpandedBank(subject, topic).length;
}

/** Generate a mini-exam of random, non-repeating questions for a topic,
  * excluding questions already used earlier in this session. */
export function generateMiniExam(subject: SubjectId, topic: string, count = 10): Question[] {
  const bank = getExpandedBank(subject, topic);
  return pickUnused(bank, count);
}

/** Clear the session used-question memory (call when user navigates away). */
export function clearUsedQuestions(): void {
  SESSION_USED.clear();
}
