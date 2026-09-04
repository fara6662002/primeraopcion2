import type { SubjectId } from './questionBank';

type RawQ = { q: string; o: string[]; c: number; e: string };

export const EXPANDED_BANK: Partial<Record<SubjectId, Record<string, RawQ[]>>> = {
  formacion_civica_etica: {
    'Retos de la sociedad mexicana': [
      {
        q: 'Según el CONEVAL, la pobreza multidimensional se mide considerando no solo el ingreso, sino también:',
        o: ['El color de piel de las personas', 'Las carencias sociales en educación, salud, vivienda y seguridad social', 'El número de automóviles por hogar', 'La estatura de los habitantes'],
        c: 1,
        e: 'El CONEVAL mide la pobreza multidimensional a partir del ingreso y de seis carencias sociales: educación, salud, seguridad social, vivienda, servicios básicos y cohesión social.',
      },
      {
        q: 'La movilidad social en México se ve limitada principalmente por:',
        o: ['El exceso de universidades públicas', 'La desigualdad de oportunidades educativas y económicas entre sectores', 'La abundancia de empleo formal', 'La obligatoriedad del voto'],
        c: 1,
        e: 'La movilidad social se reduce cuando existen brechas en el acceso a educación de calidad y oportunidades económicas, lo que perpetúa la desigualdad entre generaciones.',
      },
      {
        q: 'La impunidad contribuye a la inseguridad de un país porque:',
        o: ['Disuade la comisión de delitos', 'Permite que las conductas delictivas queden sin castigo, fomentando su repetición', 'Fortalece la confianza en las autoridades', 'Reduce los índices de criminalidad'],
        c: 1,
        e: 'La impunidad, al dejar los delitos sin sanción, debilita el Estado de derecho y fomenta la repetición de conductas delictivas al eliminar el efecto disuasivo del castigo.',
      },
      {
        q: 'La diferencia en el acceso a servicios de salud entre zonas urbanas y rurales de México es un ejemplo de:',
        o: ['Equidad social', 'Desigualdad territorial', 'Desarrollo equilibrado', 'Integración comunitaria'],
        c: 1,
        e: 'La brecha en acceso a servicios médicos entre el campo y la ciudad refleja una desigualdad territorial que afecta las condiciones de vida de la población rural.',
      },
      {
        q: 'El empleo informal en México se caracteriza por:',
        o: ['Contar con prestaciones laborales completas', 'Carecer de seguridad social y contratos formales', 'Ofrecer salarios superiores al promedio', 'Garantizar estabilidad laboral permanente'],
        c: 1,
        e: 'El empleo informal carece de contratos escritos, seguridad social y prestaciones de ley, lo que genera condiciones de precariedad laboral para los trabajadores.',
      },
    ],
    'Los desafíos del mundo contemporáneo': [
      {
        q: 'El terrorismo internacional es un desafío contemporáneo que afecta principalmente a:',
        o: ['Las grandes potencias únicamente', 'La población civil y la estabilidad política global', 'Solo a los gobiernos', 'Exclusivamente a las zonas rurales'],
        c: 1,
        e: 'El terrorismo atenta de manera directa contra la población civil y genera inestabilidad política, económica y social a escala mundial.',
      },
      {
        q: 'La diferencia fundamental entre una pandemia y una epidemia es que la pandemia:',
        o: ['Solo afecta a un país', 'Se extiende a múltiples países o continentes', 'Es siempre menos grave', 'Solo afecta a los animales'],
        c: 1,
        e: 'La pandemia es una epidemia cuya propagación abarca varios países o continentes, afectando a una gran proporción de la población a escala global.',
      },
      {
        q: 'El consumo sostenible consiste en:',
        o: ['Comprar la mayor cantidad posible de productos', 'Utilizar recursos de forma que se reduzca el impacto ambiental y se respeten los límites del planeta', 'Evitar toda actividad económica', 'Consumir únicamente productos importados'],
        c: 1,
        e: 'El consumo sostenible implica satisfacer las necesidades actuales minimizando el impacto ambiental, eligiendo productos y procesos que respeten los recursos naturales.',
      },
      {
        q: 'La desinformación o "noticias falsas" afecta a las sociedades democráticas porque:',
        o: ['Mejora la educación cívica', 'Dificulta la toma de decisiones informadas y polariza a la opinión pública', 'Fortalece la transparencia institucional', 'Aumenta la participación ciudadana'],
        c: 1,
        e: 'Las noticias falsas distorsionan la realidad, dificultan que la ciudadanía tome decisiones informadas y pueden polarizar a la sociedad, debilitando el debate democrático.',
      },
      {
        q: 'El desplazamiento forzado de personas por conflictos armados o violencia genera:',
        o: ['Mayor estabilidad regional', 'Crisis humanitarias y de refugiados que requieren protección internacional', 'Crecimiento económico inmediato', 'Integración automática en los países de destino'],
        c: 1,
        e: 'El desplazamiento forzado provoca crisis humanitarias, ya que las personas pierden su hogar y medios de vida, requiriendo protección y asistencia internacional como refugiados.',
      },
    ],
    'La construcción de la ciudadanía': [
      {
        q: 'La ciudadanía digital implica:',
        o: ['Evitar completamente el uso de tecnología', 'Ejercer derechos y responsabilidades en el entorno digital respetando a los demás', 'Solo navegar por internet sin interactuar', 'Compartir toda la información personal en redes'],
        c: 1,
        e: 'La ciudadanía digital consiste en ejercer derechos y responsabilidades en el uso de las tecnologías, respetando a los demás, protegiendo la información personal y combatiendo la desinformación.',
      },
      {
        q: 'Los derechos de los pueblos indígenas en México, reconocidos en la Constitución y en el Convenio 169 de la OIT, incluyen:',
        o: ['La asimilación forzada a la cultura dominante', 'La autonomía, el respeto a su lengua y su cultura propias', 'La prohibición de usar sus lenguas en público', 'La pérdida de sus tierras ancestrales'],
        c: 1,
        e: 'La Constitución mexicana y el Convenio 169 de la OIT reconocen los derechos de los pueblos indígenas a la autonomía, la libre determinación, el uso de su lengua y la preservación de su cultura y territorio.',
      },
      {
        q: 'La perspectiva de género en las políticas públicas busca:',
        o: ['Privilegiar a un sexo sobre el otro', 'Garantizar la igualdad de oportunidades entre mujeres y hombres corrigiendo desigualdades históricas', 'Eliminar las diferencias biológicas entre sexos', 'Ignorar las desigualdades existentes entre hombres y mujeres'],
        c: 1,
        e: 'La perspectiva de género analiza y busca corregir las desigualdades históricas entre mujeres y hombres, garantizando igualdad de oportunidades en todos los ámbitos.',
      },
      {
        q: 'La laicidad del Estado significa que:',
        o: ['Existe una religión oficial obligatoria', 'El Estado no impone ni privilegia ninguna religión y garantiza la libertad de culto', 'Se prohíbe la práctica de cualquier religión', 'Solo se permite la práctica de una religión'],
        c: 1,
        e: 'La laicidad implica que el Estado es neutral en materia religiosa: no impone ni privilegia ninguna creencia, garantizando así la libertad de conciencia y de culto para todos.',
      },
      {
        q: 'La resolución no violenta de conflictos se basa fundamentalmente en:',
        o: ['El uso de la fuerza para imponer una solución', 'El diálogo, la mediación y el respeto mutuo entre las partes', 'La imposición de una parte sobre la otra', 'La indiferencia ante el problema'],
        c: 1,
        e: 'La resolución no violenta de conflictos emplea el diálogo, la negociación y la mediación para alcanzar soluciones justas y equitativas sin recurrir a la violencia.',
      },
    ],
    'Participación ciudadana y vida democrática': [
      {
        q: 'La iniciativa ciudadana es un mecanismo de participación que permite a los ciudadanos:',
        o: ['Votar en las elecciones federales', 'Proponer leyes o decretos ante el órgano legislativo', 'Juzgar a funcionarios públicos', 'Recaudar impuestos directamente'],
        c: 1,
        e: 'La iniciativa ciudadana permite a los ciudadanos presentar propuestas de ley ante el legislativo, fortaleciendo la participación directa en la creación de normas jurídicas.',
      },
      {
        q: 'La diferencia entre plebiscito y referéndum consiste en que el plebiscito consulta a la ciudadanía sobre:',
        o: ['La creación o reforma de una norma jurídica', 'Un acto de gobierno de gran trascendencia que no requiere aprobación legal', 'La elección del presidente de la república', 'La aprobación del presupuesto federal'],
        c: 1,
        e: 'El plebiscito consulta sobre actos de gobierno de gran trascendencia que no requieren aprobación legal; el referéndum se refiere a la creación, modificación o derogación de normas jurídicas.',
      },
      {
        q: 'Las organizaciones de la sociedad civil (OSC) se caracterizan por:',
        o: ['Tener fines de lucro y buscar ganancias', 'Ser independientes del gobierno, sin fines de lucro, y trabajar por causas sociales', 'Depender económicamente del gobierno para operar', 'Ser equivalentes a los partidos políticos'],
        c: 1,
        e: 'Las OSC son organizaciones no gubernamentales, sin fines de lucro, que trabajan por el bienestar social y la defensa de causas específicas de forma independiente del Estado.',
      },
      {
        q: 'Los partidos políticos en una democracia representativa tienen como función principal:',
        o: ['Administrar la justicia en los tribunales', 'Canalizar las demandas ciudadanas y competir por el poder mediante elecciones', 'Controlar los medios de comunicación', 'Recaudar los impuestos del país'],
        c: 1,
        e: 'Los partidos políticos articulan y representan los intereses de los ciudadanos, presentan candidatos y compiten en elecciones para acceder al poder y gobernar.',
      },
      {
        q: 'El derecho de acceso a la información pública en México está garantizado por el:',
        o: ['Artículo 3 de la Constitución', 'Artículo 6 de la Constitución', 'Artículo 27 de la Constitución', 'Artículo 123 de la Constitución'],
        c: 1,
        e: 'El artículo 6 de la Constitución garantiza el derecho a la información y el acceso a la información pública, herramienta fundamental para la transparencia y el control ciudadano.',
      },
    ],
  },

  matematicas: {
    'Sentido numérico y pensamiento algebraico': [
      {
        q: 'Tres autobuses salen de una terminal a intervalos de 12, 18 y 24 minutos. Si salen juntos a las 8:00, ¿a qué hora volverán a coincidir en la terminal?',
        o: ['8:36', '8:48', '9:00', '9:12'],
        c: 3,
        e: 'Se calcula el mínimo común múltiplo (MCM) de 12, 18 y 24, que es 72 minutos (1 hora 12 minutos). Si salen a las 8:00, coincidirán de nuevo a las 9:12.',
      },
      {
        q: 'Si 4 metros de tela cuestan 120 pesos, ¿cuánto cuestan 7 metros de la misma tela?',
        o: ['180 pesos', '210 pesos', '240 pesos', '168 pesos'],
        c: 1,
        e: 'Es una proporción directa: 4/120 = 7/x. Se despeja x = (7 × 120) / 4 = 210 pesos.',
      },
      {
        q: 'Resuelve la ecuación cuadrática: x^2 - 5x + 6 = 0',
        o: ['x = 2 y x = 3', 'x = -2 y x = -3', 'x = 1 y x = 6', 'x = -1 y x = -6'],
        c: 0,
        e: 'Factorizando: (x - 2)(x - 3) = 0. Las soluciones son x = 2 y x = 3. Comprobación: 2^2 - 5(2) + 6 = 0 y 3^2 - 5(3) + 6 = 0.',
      },
      {
        q: '¿Cuánto vale 3 × 10^4 + 2 × 10^2 + 5 × 10^0?',
        o: ['32005', '30205', '30500', '35000'],
        c: 1,
        e: '3 × 10000 = 30000; 2 × 100 = 200; 5 × 1 = 5. La suma es 30000 + 200 + 5 = 30205.',
      },
      {
        q: 'Si el producto de dos números enteros es -24 y uno de ellos es -6, ¿cuál es el otro número?',
        o: ['4', '-4', '18', '-18'],
        c: 0,
        e: 'Si (-6) × n = -24, entonces n = -24 / (-6) = 4. Comprobación: (-6) × 4 = -24.',
      },
    ],
    'Forma, espacio y medida': [
      {
        q: '¿Cuál es el área de un trapecio cuyas bases miden 8 cm y 12 cm, y su altura es 5 cm?',
        o: ['50 cm²', '60 cm²', '100 cm²', '40 cm²'],
        c: 0,
        e: 'El área del trapecio es (B + b)/2 × h = (12 + 8)/2 × 5 = 10 × 5 = 50 cm².',
      },
      {
        q: '¿Cuál es el volumen de un cilindro con radio 3 cm y altura 10 cm? (Usa pi = 3.14)',
        o: ['282.6 cm³', '188.4 cm³', '94.2 cm³', '314 cm³'],
        c: 0,
        e: 'El volumen del cilindro es pi × r² × h = 3.14 × 3² × 10 = 3.14 × 9 × 10 = 282.6 cm³.',
      },
      {
        q: 'Una escalera de 5 m de longitud se apoya en una pared vertical y su base está a 3 m de la pared. ¿A qué altura de la pared llega la escalera?',
        o: ['2 m', '3 m', '4 m', '5 m'],
        c: 2,
        e: 'Por el teorema de Pitágoras: h² + 3² = 5²; h² = 25 - 9 = 16; h = 4 m.',
      },
      {
        q: 'Dos ángulos son complementarios. Si uno de ellos mide 35 grados, ¿cuánto mide el otro?',
        o: ['55 grados', '65 grados', '145 grados', '45 grados'],
        c: 0,
        e: 'Los ángulos complementarios suman 90 grados. El otro ángulo es 90 - 35 = 55 grados.',
      },
      {
        q: '¿Cuál es el perímetro de un rectángulo cuya base mide 15 cm y su altura 8 cm?',
        o: ['46 cm', '120 cm', '23 cm', '38 cm'],
        c: 0,
        e: 'El perímetro del rectángulo es 2 × (base + altura) = 2 × (15 + 8) = 2 × 23 = 46 cm.',
      },
    ],
    'Manejo de la información': [
      {
        q: 'Un estudiante obtuvo las siguientes calificaciones en tres exámenes de igual valor: 8, 7 y 9. ¿Cuál es su calificación promedio?',
        o: ['7.5', '8.0', '8.5', '9.0'],
        c: 1,
        e: 'El promedio se calcula sumando las calificaciones y dividiendo entre la cantidad: (8 + 7 + 9) / 3 = 24 / 3 = 8.0.',
      },
      {
        q: 'De una baraja inglesa de 52 cartas, ¿cuál es la probabilidad de sacar un as al extraer una carta al azar?',
        o: ['1/52', '1/13', '1/4', '1/26'],
        c: 1,
        e: 'Hay 4 ases en una baraja de 52 cartas. La probabilidad es 4/52 = 1/13.',
      },
      {
        q: 'Al lanzar dos monedas al aire, ¿cuál es la probabilidad de que ambas caigan en cara?',
        o: ['1/2', '1/4', '1/3', '2/3'],
        c: 1,
        e: 'Los resultados posibles son (cara, cara), (cara, cruz), (cruz, cara) y (cruz, cruz): 4 casos equiprobables. Solo uno tiene ambas caras. La probabilidad es 1/4.',
      },
      {
        q: 'En un conjunto de datos, el valor 10 aparece 3 veces, el 20 aparece 5 veces, el 30 aparece 2 veces y el 40 aparece 4 veces. ¿Cuál es la moda?',
        o: ['10', '20', '30', '40'],
        c: 1,
        e: 'La moda es el valor con mayor frecuencia. El 20 aparece 5 veces, más que cualquier otro valor, por lo que es la moda.',
      },
      {
        q: 'Un automóvil recorre 240 km con 20 litros de gasolina. ¿Cuántos kilómetros recorrerá con 35 litros de gasolina al mismo rendimiento?',
        o: ['360 km', '420 km', '400 km', '480 km'],
        c: 1,
        e: 'Es una regla de tres directa: 240/20 = x/35. Se despeja x = (240 × 35) / 20 = 420 km.',
      },
    ],
    'Análisis y representación de datos': [
      {
        q: 'El primer cuartil (Q1) de un conjunto de datos ordenados de menor a mayor representa:',
        o: ['El valor máximo del conjunto', 'El valor que deja por debajo al 25% de los datos', 'El promedio de todos los datos', 'El valor que divide los datos en dos partes iguales'],
        c: 1,
        e: 'El primer cuartil (Q1) es el valor que divide los datos ordenados de modo que el 25% queda por debajo de él y el 75% restante por encima.',
      },
      {
        q: 'La desviación estándar es una medida estadística que indica:',
        o: ['El valor más frecuente en el conjunto', 'Cuánto se alejan en promedio los datos respecto a la media aritmética', 'El valor central de los datos', 'La diferencia entre el valor máximo y el mínimo'],
        c: 1,
        e: 'La desviación estándar mide la dispersión de los datos respecto a la media: a mayor desviación estándar, mayor es la variabilidad o dispersión de los datos.',
      },
      {
        q: 'En estadística, una "muestra" se define como:',
        o: ['El conjunto completo de todos los individuos objeto de estudio', 'Un subconjunto seleccionado y representativo de la población', 'El promedio de todos los datos recolectados', 'El valor máximo observado en el estudio'],
        c: 1,
        e: 'Una muestra es un subconjunto seleccionado de la población que se utiliza para inferir o estimar características del conjunto total sin estudiar a todos sus miembros.',
      },
      {
        q: 'Un gráfico de líneas se utiliza principalmente para:',
        o: ['Comparar cantidades entre categorías discretas', 'Mostrar la variación o tendencia de una variable a lo largo del tiempo', 'Representar porcentajes de un total', 'Mostrar la distribución de frecuencias de datos agrupados'],
        c: 1,
        e: 'El gráfico de líneas muestra la variación o tendencia de una variable cuantitativa a lo largo del tiempo o de un eje continuo, permitiendo identificar crecimientos y decrementos.',
      },
      {
        q: 'La diferencia fundamental entre un censo y una encuesta consiste en que el censo:',
        o: ['Se aplica únicamente a una pequeña muestra de personas', 'Recopila datos de toda la población de interés, no solo de una muestra', 'Es siempre menos preciso que una encuesta', 'Solo se realiza en instituciones educativas'],
        c: 1,
        e: 'El censo recopila información de la totalidad de la población de interés, mientras que la encuesta se aplica a una muestra representativa de esa población.',
      },
    ],
  },

  habilidad_verbal: {
    'Comprensión de lectura': [
      {
        q: 'Lee el siguiente texto y responde: "Los arrecifes de coral son ecosistemas marinos de enorme biodiversidad. Aunque ocupan menos del 1% del fondo oceánico, albergan aproximadamente el 25% de todas las especies marinas. Sin embargo, el aumento de la temperatura del océano provoca el blanqueamiento de los corales, fenómeno que los debilita y puede causar su muerte." ¿Cuál es la idea principal del texto?',
        o: ['Los arrecifes de coral ocupan la mayor parte del fondo oceánico', 'Los arrecifes de coral tienen gran biodiversidad pero están amenazados por el aumento de la temperatura oceánica', 'Los corales son organismos invulnerables a los cambios ambientales', 'El blanqueamiento de los corales es un fenómeno sin consecuencias'],
        c: 1,
        e: 'El texto presenta dos ideas centrales: la gran biodiversidad de los arrecifes de coral y la amenaza que representa el calentamiento oceánico mediante el blanqueamiento, fenómeno que puede causar su muerte.',
      },
      {
        q: 'Según el texto anterior sobre los arrecifes de coral, ¿qué porcentaje de las especies marinas habita en ellos?',
        o: ['1%', '25%', '50%', '75%'],
        c: 1,
        e: 'El texto señala explícitamente que los arrecifes "albergan aproximadamente el 25% de todas las especies marinas", a pesar de ocupar menos del 1% del fondo oceánico.',
      },
      {
        q: 'Lee el siguiente texto: "La invención de la imprenta de tipos móviles por Johannes Gutenberg en el siglo XV revolucionó la difusión del conocimiento. Antes de la imprenta, los libros se copiaban a mano, lo que los hacía escasos y costosos. Con la imprenta, la producción masiva de libros permitió que las ideas se propagaran rápidamente por Europa, impulsando el Renacimiento, la Reforma Protestante y la revolución científica." ¿Qué consecuencia tuvo la imprenta según el texto?',
        o: ['La reducción de la alfabetización en Europa', 'La rápida propagación de ideas y el avance del conocimiento en Europa', 'La prohibición de los libros en Europa', 'El aumento del costo de los libros manuscritos'],
        c: 1,
        e: 'El texto indica que la imprenta permitió la producción masiva de libros y la propagación rápida de ideas, lo cual impulsó movimientos como el Renacimiento, la Reforma Protestante y la revolución científica.',
      },
      {
        q: 'Según el texto anterior sobre la imprenta, antes de su invención los libros se caracterizaban por:',
        o: ['Ser producidos en masa y baratos', 'Copiarse a mano, lo que los hacía escasos y costosos', 'Ser gratuitos y accesibles para todos', 'No existir en absoluto'],
        c: 1,
        e: 'El texto señala que antes de la imprenta los libros se copiaban a mano, lo que los hacía escasos y costosos, limitando el acceso al conocimiento.',
      },
      {
        q: 'Lee el siguiente texto: "El método científico es un proceso sistemático para adquirir conocimiento. Comienza con la observación de un fenómeno, seguida de la formulación de una hipótesis. Luego, se diseñan experimentos para poner a prueba la hipótesis. Si los resultados confirman la hipótesis repetidamente, esta puede convertirse en una teoría científica." La palabra "sistemático" en el contexto del texto significa:',
        o: ['Caótico y desordenado', 'Organizado y metódico', 'Rápido y breve', 'Casual y espontáneo'],
        c: 1,
        e: 'En este contexto, "sistemático" significa que el método sigue un proceso organizado, ordenado y metódico, con pasos bien definidos para adquirir conocimiento.',
      },
      {
        q: 'Según el texto anterior sobre el método científico, una hipótesis puede convertirse en teoría cuando:',
        o: ['Se formula por primera vez', 'Los resultados de los experimentos la confirman de manera repetida', 'Es escrita en un libro de texto', 'La propone un científico reconocido'],
        c: 1,
        e: 'El texto indica que una hipótesis se convierte en teoría cuando los resultados de los experimentos la confirman repetidamente, es decir, cuando la evidencia es consistente y reproducible.',
      },
      {
        q: 'Lee el siguiente texto: "Las energías renovables, como la solar y la eólica, son fuentes que no se agotan y producen menos contaminación que los combustibles fósiles. Su uso creciente ayuda a mitigar el cambio climático. Sin embargo, su producción depende de factores como la disponibilidad de sol o viento, por lo que se requieren sistemas eficientes de almacenamiento de energía." ¿Cuál es una limitación de las energías renovables según el texto?',
        o: ['Son más contaminantes que los combustibles fósiles', 'Dependen de factores como la disponibilidad de sol o viento', 'Se agotan rápidamente con el uso', 'No pueden generar electricidad en absoluto'],
        c: 1,
        e: 'El texto señala que la producción de energías renovables depende de la disponibilidad de sol o viento, lo que hace necesario contar con sistemas eficientes de almacenamiento de energía.',
      },
    ],
    'Manejo de vocabulario': [
      {
        q: 'Elige el sinónimo de "tenaz":',
        o: ['Flojo', 'Perseverante', 'Débil', 'Voluble'],
        c: 1,
        e: 'Tenaz significa que persiste con firmeza y no se rinde fácilmente; perseverante es su sinónimo.',
      },
      {
        q: 'Elige el sinónimo de "procaz":',
        o: ['Educado', 'Atento', 'Grosero', 'Refinado'],
        c: 2,
        e: 'Procaz significa descarado o de mal gusto en el hablar o actuar; grosero es su sinónimo.',
      },
      {
        q: 'Elige el sinónimo de "mutable":',
        o: ['Constante', 'Fijo', 'Inconstante', 'Eterno'],
        c: 2,
        e: 'Mutable significa que cambia o varía con facilidad; inconstante es su sinónimo.',
      },
      {
        q: 'Elige el antónimo de "benévolo":',
        o: ['Generoso', 'Compasivo', 'Cruel', 'Bondadoso'],
        c: 2,
        e: 'Benévolo significa bondadoso, compasivo y generoso; su antónimo es cruel o malévolo.',
      },
      {
        q: 'Elige el antónimo de "idóneo":',
        o: ['Apto', 'Capaz', 'Inepto', 'Adecuado'],
        c: 2,
        e: 'Idóneo significa apto, adecuado o competente para algo; su antónimo es inepto, que significa incapaz o no apto.',
      },
      {
        q: 'Elige el sinónimo de "veraz":',
        o: ['Falso', 'Verídico', 'Mentiroso', 'Dudoso'],
        c: 1,
        e: 'Veraz significa que dice o expresa la verdad; verídico es su sinónimo.',
      },
      {
        q: 'Elige el sinónimo de "nimio":',
        o: ['Importante', 'Insignificante', 'Enorme', 'Extraordinario'],
        c: 1,
        e: 'Nimio significa de poca importancia o demasiado pequeño; insignificante es su sinónimo.',
      },
      {
        q: 'Completa la analogía: Día es a noche como luz es a:',
        o: ['Brillo', 'Oscuridad', 'Sombra', 'Color'],
        c: 1,
        e: 'El día se opone a la noche; la luz se opone a la oscuridad. La relación entre los términos es de antonimia (oposición).',
      },
    ],
  },

  espanol: {
    'Obtención de Información': [
      {
        q: 'La diferencia entre un hecho y una opinión es que un hecho:',
        o: ['Es subjetivo y depende del punto de vista de quien lo expresa', 'Es verificable y objetivo, pues puede comprobarse con datos', 'Depende únicamente de quien lo dice', 'No se puede comprobar de ninguna manera'],
        c: 1,
        e: 'Un hecho es una afirmación verificable y objetiva que puede comprobarse con datos o evidencias; una opinión es subjetiva y depende del punto de vista personal.',
      },
      {
        q: 'En un texto argumentativo, los ejemplos sirven principalmente para:',
        o: ['Confundir al lector con información irrelevante', 'Sostener e ilustrar los argumentos con evidencia concreta', 'Reemplazar la tesis principal del texto', 'Aumentar la extensión sin aportar contenido'],
        c: 1,
        e: 'Los ejemplos aportan evidencia concreta que sostiene e ilustra los argumentos del texto, haciendo más persuasivo y creíble el razonamiento del autor.',
      },
      {
        q: 'Cuando un autor utiliza ironía en un texto, su intención es:',
        o: ['Decir exactamente lo que piensa de forma directa y literal', 'Expresar lo contrario de lo que se dice literalmente, con fin crítico o humorístico', 'Repetir la misma idea varias veces', 'Describir un objeto con detalle técnico'],
        c: 1,
        e: 'La ironía consiste en dar a entender lo contrario de lo que se dice literalmente, con un propósito crítico, satírico o humorístico, esperando que el lector capte el sentido oculto.',
      },
    ],
    'Organización de información': [
      {
        q: 'Una ficha bibliográfica tiene como función principal:',
        o: ['Organizar las ideas principales de un texto mediante llaves', 'Registrar los datos de identificación de una fuente para su localización y cita', 'Resumir en pocas palabras el contenido completo de un libro', 'Dibujar un esquema visual del contenido'],
        c: 1,
        e: 'La ficha bibliográfica registra los datos de identificación de una fuente (autor, título, editorial, año, ciudad) para facilitar su localización y elaborar citas correctamente.',
      },
      {
        q: 'A diferencia del mapa conceptual, el mapa mental se caracteriza por:',
        o: ['Usar conectores con palabras de enlace entre conceptos', 'Partir de una idea central y ramificarse libremente con imágenes, colores y palabras clave', 'Contener únicamente texto sin elementos visuales', 'Seguir una estructura rígida y lineal de izquierda a derecha'],
        c: 1,
        e: 'El mapa mental parte de una idea central y se ramifica libremente usando imágenes, colores y palabras clave; el mapa conceptual, en cambio, usa conectores con palabras de enlace entre conceptos.',
      },
    ],
    'Elementos que intervienen en la coherencia, la cohesión y la adecuación en los textos. Nexos y expresiones. Signos de puntuación. Oraciones.': [
      {
        q: 'La tilde diacrítica en la palabra "sé" (del verbo saber) sirve para:',
        o: ['Marcar que se trata de un sustantivo', 'Distinguirla del pronombre "se", que no lleva tilde', 'Indicar que es un adjetivo calificativo', 'Separar las sílabas de la palabra'],
        c: 1,
        e: 'La tilde diacrítica distingue "sé" (primera persona del verbo saber o del verbo ser) del pronombre "se", que no lleva tilde, diferenciando palabras que se escriben igual pero tienen distinto significado.',
      },
      {
        q: 'Señala la oración con correcta concordancia de género y número:',
        o: ['Los niños está contenta', 'Las niñas están contentos', 'Los niños están contentos', 'El niño están contentos'],
        c: 2,
        e: 'En "Los niños están contentos" hay concordancia de género (masculino) y número (plural) entre el sujeto (Los niños), el verbo (están) y el atributo (contentos).',
      },
      {
        q: 'El nexo "en consecuencia" es de tipo:',
        o: ['Adversativo', 'Consecutivo', 'Copulativo', 'Temporal'],
        c: 1,
        e: '"En consecuencia" es un nexo consecutivo que introduce el resultado, efecto o conclusión lógica de lo expresado anteriormente en el texto.',
      },
    ],
    'Tipos de textos. Recursos lingüísticos. Textos informativos. Documentos legales y administrativos. Textos periodísticos. Textos publicitarios.': [
      {
        q: 'Una carta formal se diferencia de una informal principalmente por:',
        o: ['El número de párrafos que contiene', 'El uso de lenguaje respetuoso y una estructura con encabezado, saludo, cuerpo y despedida formal', 'El tipo de papel en que se imprime', 'La cantidad de páginas que ocupa'],
        c: 1,
        e: 'La carta formal emplea un lenguaje respetuoso y una estructura rígida con encabezado, saludo formal, desarrollo del tema y despedida, a diferencia de la informal que es libre y coloquial.',
      },
      {
        q: 'Un ensayo argumentativo se caracteriza por:',
        o: ['Narrar una historia ficticia con personajes y ambientes', 'Defender una tesis mediante argumentos razonados y evidencia', 'Solo presentar datos sin emitir opinión alguna', 'Persuadir al lector de comprar un producto'],
        c: 1,
        e: 'El ensayo argumentativo defiende una tesis o postura personal mediante argumentos lógicos, evidencia y un tono reflexivo, buscando convencer al lector con razonamientos.',
      },
    ],
  },

  quimica: {
    'Las características de los materiales': [
      {
        q: 'La solubilidad de la mayoría de los sólidos en un líquido generalmente aumenta cuando:',
        o: ['Se disminuye la temperatura del disolvente', 'Se aumenta la temperatura del disolvente', 'Se aumenta la presión sobre la solución', 'Se deja reposar la mezcla sin agitar'],
        c: 1,
        e: 'En la mayoría de los sólidos disueltos en líquidos, la solubilidad aumenta con la temperatura porque las partículas del solvente tienen mayor energía cinética y pueden separar más fácilmente las del soluto.',
      },
      {
        q: 'La diferencia entre ductilidad y maleabilidad es que la ductilidad es la capacidad de un material para:',
        o: ['Aplastarse y formar láminas delgadas', 'Estirarse formando hilos sin romperse', 'Romperse en fragmentos pequeños', 'Conducir corriente eléctrica'],
        c: 1,
        e: 'La ductilidad es la capacidad de un material de estirarse en forma de hilos; la maleabilidad es la capacidad de extenderse en láminas u hojas delgadas sin romperse.',
      },
      {
        q: 'Un cambio físico se diferencia de un cambio químico porque en un cambio físico:',
        o: ['Se forman sustancias nuevas con propiedades distintas', 'No se forman sustancias nuevas; solo cambian la forma o el estado del material', 'Se libera gran cantidad de energía luminosa', 'Cambian la composición y la estructura molecular'],
        c: 1,
        e: 'En un cambio físico no se forman nuevas sustancias; solo se alteran propiedades como forma, tamaño o estado de agregación. En un cambio químico se transforman las sustancias en otras distintas.',
      },
      {
        q: 'Una aleación como el bronce (cobre y estaño) tiene como característica que:',
        o: ['Es un compuesto químico puro con fórmula definida', 'Es una mezcla con propiedades mejoradas respecto a sus componentes', 'No conduce electricidad ni calor', 'Es un elemento de la tabla periódica'],
        c: 1,
        e: 'Una aleación es una mezcla homogénea de dos o más metales (o un metal y un no metal) que adquiere propiedades mejoradas, como mayor dureza o resistencia, respecto a sus componentes individuales.',
      },
      {
        q: 'La molaridad de una solución se define como:',
        o: ['Gramos de soluto por litro de disolvente', 'Moles de soluto disueltos por cada litro de solución', 'Litros de soluto por litro de disolvente', 'Moles de soluto por kilogramo de disolvente'],
        c: 1,
        e: 'La molaridad (M) es el número de moles de soluto disueltos por cada litro de solución. Se expresa en mol/L. La cuarta opción describe la molalidad, no la molaridad.',
      },
    ],
    'Estructura y periodicidad de los elementos': [
      {
        q: 'Según el modelo atómico de Bohr, los electrones se distribuyen en:',
        o: ['Cualquier posición al azar dentro del átomo', 'Niveles o capas de energía fijas y cuantizadas alrededor del núcleo', 'El interior del núcleo junto con los protones', 'Una sola órbita circular sin niveles definidos'],
        c: 1,
        e: 'El modelo de Bohr propone que los electrones giran alrededor del núcleo en niveles o capas de energía cuantizadas, cada una con una energía específica. Los electrones solo pueden ocupar niveles permitidos.',
      },
      {
        q: 'Los electrones de valencia son importantes porque:',
        o: ['No participan en las reacciones químicas', 'Determinan las propiedades químicas y la capacidad del elemento para formar enlaces', 'Se encuentran dentro del núcleo atómico', 'No poseen carga eléctrica'],
        c: 1,
        e: 'Los electrones de valencia, ubicados en la capa más externa del átomo, determinan cómo reacciona un elemento, qué enlaces puede formar y su comportamiento químico.',
      },
      {
        q: 'El número de electrones en un átomo neutro es igual al número de:',
        o: ['Neutrones del núcleo', 'Protones del núcleo', 'Isótopos del elemento', 'Niveles de energía ocupados'],
        c: 1,
        e: 'En un átomo neutro, el número de electrones (carga negativa) es igual al número de protones (carga positiva), de modo que las cargas se equilibran y el átomo es eléctricamente neutro.',
      },
      {
        q: 'En la tabla periódica, el radio atómico de los elementos tiende a:',
        o: ['Aumentar de derecha a izquierda y de arriba hacia abajo', 'Disminuir de derecha a izquierda y de abajo hacia arriba', 'Ser igual en todos los elementos de la tabla', 'Aumentar de izquierda a derecha dentro de un mismo periodo'],
        c: 0,
        e: 'El radio atómico aumenta hacia la izquierda en un periodo (menor atracción del núcleo con menos protones) y hacia abajo en un grupo (se añaden más niveles de energía), por lo que es mayor en los elementos de la esquina inferior izquierda.',
      },
      {
        q: 'La electronegatividad se define como:',
        o: ['La capacidad de un átomo para perder electrones fácilmente', 'La capacidad de un átomo para atraer hacia sí los electrones en un enlace químico', 'La cantidad total de electrones que posee un átomo', 'La masa del átomo medida en unidades atómicas'],
        c: 1,
        e: 'La electronegatividad es la capacidad de un átomo para atraer hacia sí los electrones compartidos en un enlace químico. El flúor es el elemento más electronegativo de la tabla periódica.',
      },
    ],
    'La reacción química': [
      {
        q: 'El balanceo de una ecuación química se fundamenta en la:',
        o: ['Ley de las proporciones múltiples', 'Ley de conservación de la masa de Lavoisier', 'Ley de los gases ideales', 'Teoría cinética de la materia'],
        c: 1,
        e: 'El balanceo de ecuaciones obedece la ley de conservación de la masa de Lavoisier: la masa total de los reactivos debe ser igual a la masa total de los productos; los átomos no se crean ni se destruyen.',
      },
      {
        q: 'En una reacción de síntesis o combinación:',
        o: ['Un compuesto se descompone en dos o más sustancias más simples', 'Dos o más sustancias se unen para formar un solo compuesto', 'Un elemento reemplaza a otro en un compuesto', 'Se intercambian iones entre dos compuestos'],
        c: 1,
        e: 'En una reacción de síntesis, dos o más sustancias (reactivos) se combinan para formar un solo producto, por ejemplo: A + B produce AB.',
      },
      {
        q: 'La serie de actividad de los metales indica que:',
        o: ['Todos los metales reaccionan con la misma intensidad', 'Un metal más reactivo puede desplazar a uno menos reactivo de sus compuestos', 'Los metales no participan en reacciones químicas', 'El oro es el metal más reactivo de todos'],
        c: 1,
        e: 'En la serie de actividad, un metal más reactivo puede desplazar a un metal menos reactivo de sus compuestos. Los metales alcalinos son los más reactivos y el oro es uno de los menos reactivos.',
      },
      {
        q: 'Una reacción exotérmica se caracteriza por:',
        o: ['Absorber energía del entorno durante el proceso', 'Liberar energía al entorno en forma de calor o luz', 'No intercambiar energía con el entorno', 'Disminuir la temperatura de los productos respecto a los reactivos'],
        c: 1,
        e: 'Una reacción exotérmica libera energía al entorno, generalmente en forma de calor o luz, como ocurre en la combustión. Los productos tienen menos energía que los reactivos.',
      },
      {
        q: 'La reacción de neutralización entre un ácido y una base produce:',
        o: ['Un óxido y agua', 'Una sal y agua', 'Un metal y agua', 'Un gas y un nuevo ácido'],
        c: 1,
        e: 'En la neutralización, un ácido reacciona con una base para formar una sal y agua. Por ejemplo: HCl + NaOH produce NaCl + H2O.',
      },
    ],
  },
};
