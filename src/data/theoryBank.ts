import type { SubjectId } from '@/data/questionBank';

export type TheoryEntry = {
  title: string;
  content: string;
  example?: string;
};

/**
 * Temario maestro completo — 10 materias, 46 temas.
 * Cada tema incluye explicación detallada, fórmulas en LaTeX y ejemplo práctico.
 */
export const THEORY: Partial<Record<SubjectId, Record<string, TheoryEntry[]>>> = {

  // ───────────────────────────── HABILIDAD VERBAL ─────────────────────────────
  habilidad_verbal: {
    'Comprensión de lectura': [
      {
        title: 'Idea principal vs. detalles',
        content: 'La idea principal es el concepto central que el autor quiere transmitir; suele aparecer en el primer o último párrafo. Los detalles son datos específicos que apoyan, ejemplifican o desarrollan esa idea. Para distinguirlos, pregúntate: "¿Cuál es el mensaje que resume todo el texto?"',
        example: 'Texto sobre reciclaje: idea principal = "el reciclaje reduce residuos y contaminación". Detalle = "el plástico tarda 500 años en degradarse".',
      },
      {
        title: 'Inferencias y conclusiones',
        content: 'Una inferencia es una deducción que no está explícita en el texto pero se deduce de la información presentada. Se combinan pistas del texto con conocimiento previo. Una conclusión sintetiza la información en un enunciado final.',
        example: 'Si el texto dice "María no llevó paraguas y empezó a llover", la inferencia es: María se mojó.',
      },
      {
        title: 'Tipos de texto',
        content: 'Los textos se clasifican según su propósito: narrativo (relata hechos), descriptivo (detalla características), expositivo (explica), argumentativo (defiende una postura) y persuasivo (busca convencer).',
        example: 'Un cuento es narrativo; un manual de instrucciones es expositivo; un ensayo político es argumentativo.',
      },
      {
        title: 'Estructura del texto',
        content: 'Un texto coherente tiene introducción (presenta el tema), desarrollo (expone ideas y detalles) y conclusión (sintetiza). Los párrafos se enlazan mediante nexos y referencias que aseguran cohesión.',
        example: 'En un artículo científico: introducción presenta la hipótesis, desarrollo muestra experimentos, conclusión resume hallazgos.',
      },
    ],
    'Manejo de vocabulario': [
      {
        title: 'Sinónimos',
        content: 'Los sinónimos son palabras con significado similar o equivalente. Se usan para evitar repetición y enriquecer la expresión. Algunos sinónimos comparten el mismo significado central pero difieren en matiz o registro.',
        example: 'Sinónimos de "abundante": copioso, generoso, profuso, amplio. Sinónimos de "efímero": pasajero, breve, fugaz.',
      },
      {
        title: 'Antónimos',
        content: 'Los antónimos son palabras con significado opuesto. Pueden ser graduales (frío–caliente), complementarios (vivo–muerto) o recíprocos (comprar–vender).',
        example: 'Antónimo de "ampliar": reducir. Antónimo de "transparente": opaco. Antónimo de "humilde": arrogante.',
      },
      {
        title: 'Analogías',
        content: 'Una analogía establece una relación de semejanza entre dos pares de palabras. Se identifica la relación base y se busca un par equivalente. Tipos: sinónimas, antónimas, parte-todo, causa-efecto, conjunto-elemento.',
        example: 'Médico es a hospital como profesor es a escuela (relación profesional-lugar de trabajo). Cuchillo es a cortar como tijeras es a recortar (herramienta-función).',
      },
      {
        title: 'Prefijos y sufijos',
        content: 'Los prefijos se anteponen a la raíz y modifican el significado: "a-" (negación), "re-" (repetición), "pre-" (antes), "sub-" (debajo). Los sufijos se posponen y forman nuevas palabras: "-ción" (acción), "-able" (capacidad), "-ismo" (doctrina).',
        example: '"In-útil" = sin utilidad. "Re-hacer" = hacer de nuevo. "Pre-ver" = ver antes.',
      },
    ],
  },

  // ───────────────────────────── HABILIDAD MATEMÁTICA ─────────────────────────────
  habilidad_matematica: {
    'Sucesiones numéricas': [
      {
        title: 'Progresiones aritméticas',
        content: 'Una progresión aritmética tiene una diferencia constante $d$ entre términos consecutivos. El término general es $a_n = a_1 + (n-1)d$. La suma de $n$ términos es $S_n = \\frac{n(a_1 + a_n)}{2}$.',
        example: 'Para $2, 5, 8, 11, \\ldots$ la diferencia es $d = 3$. El término 10 es $a_{10} = 2 + 9 \\times 3 = 29$. La suma de los primeros 10: $S_{10} = \\frac{10(2+29)}{2} = 155$.',
      },
      {
        title: 'Progresiones geométricas',
        content: 'Una progresión geométrica tiene una razón constante $r$. El término general es $a_n = a_1 \\cdot r^{n-1}$. La suma de $n$ términos es $S_n = a_1 \\cdot \\frac{r^n - 1}{r - 1}$ cuando $r \\neq 1$.',
        example: 'Para $3, 6, 12, 24, \\ldots$ la razón es $r = 2$. El término 5 es $a_5 = 3 \\cdot 2^4 = 48$.',
      },
      {
        title: 'Sucesiones especiales',
        content: 'Sucesión de Fibonacci: cada término es la suma de los dos anteriores: $F_n = F_{n-1} + F_{n-2}$ con $F_1 = 1, F_2 = 1$. Sucesión de cuadrados: $1, 4, 9, 16, 25, \\ldots$ donde $a_n = n^2$.',
        example: 'Fibonacci: $1, 1, 2, 3, 5, 8, 13, 21, \\ldots$ El siguiente después de 13 y 21 es $34$.',
      },
    ],
    'Series espaciales': [
      {
        title: 'Rotación de figuras',
        content: 'En series espaciales con rotación, cada figura rota un ángulo constante respecto a la anterior. Los ángulos más comunes son $90^\circ$, $45^\circ$ o $180^\circ$. Se debe identificar el patrón de rotación y aplicarlo a la siguiente posición.',
        example: 'Si un triángulo rota $90^\circ$ en sentido horario en cada paso, después de 4 pasos vuelve a la posición original.',
      },
      {
        title: 'Simetría y reflexión',
        content: 'Una figura puede tener simetría axial (espejo sobre un eje) o simetría central (espejo sobre un punto). En series, se puede alternar reflexiones o combinar rotación con reflexión.',
        example: 'La letra "A" tiene simetría vertical; la letra "H" tiene simetría vertical y horizontal.',
      },
    ],
    'Imaginación espacial': [
      {
        title: 'Desarrollo de cuerpos geométricos',
        content: 'El desarrollo plano de un cubo consiste en 6 cuadrados conectados. El de un prisma rectangular tiene 6 rectángulos. Un tetraedro se desarrolla en 4 triángulos. Identificar qué desarrollo corresponde a un cuerpo 3D requiere visualizar los pliegues.',
        example: 'Un cubo tiene 11 desarrollos planos posibles distintos. El más común es la cruz de 6 cuadrados.',
      },
      {
        title: 'Conteo de elementos ocultos',
        content: 'En figuras 3D representadas en 2D, se debe contar el número total de cubos o elementos, incluyendo los que no son visibles. Para un prisma rectangular de dimensiones $a \\times b \\times c$, el total de cubos es $a \\times b \\times c$.',
        example: 'Un prisma $3 \\times 2 \\times 4$ tiene $24$ cubos en total. Los visibles son los de las caras exteriores; los ocultos están en el interior.',
      },
    ],
    'Problemas de razonamiento': [
      {
        title: 'Lógica deductiva',
        content: 'La lógica deductiva parte de premisas generales para llegar a conclusiones particulares. Si las premisas son verdaderas y el razonamiento es válido, la conclusión necesariamente lo es. Se usa el modus ponens: si $P \\rightarrow Q$ y $P$, entonces $Q$.',
        example: 'Todos los mamíferos tienen pelo. El perro es mamífero. Por lo tanto, el perro tiene pelo.',
      },
      {
        title: 'Lógica inductiva',
        content: 'La lógica inductiva parte de casos particulares para inferir una regla general. La conclusión es probable pero no garantizada. Se usa en patrones y generalizaciones a partir de observaciones.',
        example: 'Observo que el sol sale por el este todos los días. Concluyo (inductivamente) que el sol siempre sale por el este.',
      },
    ],
  },

  // ───────────────────────────── ESPAÑOL ─────────────────────────────
  espanol: {
    'Obtención de Información': [
      {
        title: 'Comprensión lectora',
        content: 'La comprensión lectora implica identificar la idea principal, inferir información implícita, distinguir hechos de opiniones y reconocer el propósito del autor. Se debe leer activamente, subrayando ideas clave y formulando preguntas sobre el texto.',
        example: 'Idea principal: "La contaminación afecta la salud global". Inferencia: requiere acción inmediata. Hecho: "El CO$_2$ aumentó $30\\%$". Opinión: "Deberíamos prohibir los autos".',
      },
      {
        title: 'Resumen y síntesis',
        content: 'El resumen reproduce brevemente las ideas principales del texto manteniendo el orden lógico. La síntesis combina ideas del texto con la interpretación del lector. Ambos requieren identificar lo esencial y omitir lo secundario.',
        example: 'Texto de 3 páginas sobre cambio climático → resumen: "El calentamiento global se debe a gases de efecto invernadero; sus consecuencias incluyen deshielo y eventos extremos".',
      },
    ],
    'Organización de información': [
      {
        title: 'Mapas conceptuales y cuadros sinópticos',
        content: 'Un mapa conceptual organiza jerárquicamente conceptos conectados por enlaces con palabras de relación. Un cuadro sinóptico clasifica información en categorías y subcategorías. Ambos facilitan la comprensión de textos expositivos.',
        example: 'Mapa conceptual: "Ecosistema $\\rightarrow$ está formado por $\\rightarrow$ {Biotope, Biocenosis}". Cuadro sinóptico: clasifica tipos de energía (cinética, potencial, térmica).',
      },
      {
        title: 'Esquemas y diagramas',
        content: 'Los esquemas organizan visualmente la información mediante llaves, flechas y jerarquías. Los diagramas de flujo representan procesos con símbolos estándar: óvalo (inicio/fin), rectángulo (acción), rombo (decisión).',
        example: 'Diagrama de flujo para estudiar: Inicio $\\rightarrow$ Leer texto $\\rightarrow$ ¿Comprendí? — Sí: hacer resumen — No: releer.',
      },
    ],
    'Elementos que intervienen en la coherencia, la cohesión y la adecuación en los textos. Nexos y expresiones. Signos de puntuación. Oraciones.': [
      {
        title: 'Nexos conectores',
        content: 'Los nexos relacionan ideas dentro y entre oraciones. Adición: además, también, asimismo. Contraste: sin embargo, pero, no obstante. Causa: porque, debido a, puesto que. Consecuencia: por lo tanto, entonces, así que. Condición: si, siempre que, a menos que.',
        example: '"Llovió, por lo tanto, el suelo está mojado" — nexo de consecuencia. "Estudié mucho; sin embargo, no aprobé" — nexo de contraste.',
      },
      {
        title: 'Signos de puntuación',
        content: 'La coma (,) separa elementos en enumeración, indica pausa breve y delimita incisos. El punto y coma (;) separa oraciones relacionadas. Los dos puntos (:) anuncian una enumeración o cita. El punto (.) cierra una idea. Los puntos suspensivos (...) indican omisión o duda.',
        example: '"Compré manzanas, naranjas, plátanos y uvas." "El resultado fue claro: aprobó con 90." "No sé qué hacer...',
      },
      {
        title: 'Oración simple y compuesta',
        content: 'Una oración simple tiene un solo verbo conjugado. Una compuesta tiene dos o más verbos. Las oraciones compuestas pueden ser coordinadas (unidas por nexo) o subordinadas (una depende de otra). La oración tiene sujeto y predicado.',
        example: 'Simple: "Juan corre." Coordinada: "Juan corre y María camina." Subordinada: "Juan corre porque quiere estar sano."',
      },
    ],
    'Tipos de textos. Recursos lingüísticos. Textos informativos. Documentos legales y administrativos. Textos periodísticos. Textos publicitarios.': [
      {
        title: 'Textos informativos y expositivos',
        content: 'Los textos informativos transmiten datos objetivos (noticias, reportes). Los expositivos explican temas de manera clara (manuales, enciclopedias, artículos de divulgación). Usan lenguaje denotativo, estructura lógica y recursos como definiciones, ejemplos y gráficas.',
        example: 'Un artículo de Wikipedia sobre fotosíntesis es expositivo. Una noticia sobre un terremoto es informativo.',
      },
      {
        title: 'Textos argumentativos y persuasivos',
        content: 'Los textos argumentativos defienden una postura con razones y evidencia: tesis, argumentos, contraargumentos y conclusión. Los persuasivos buscan convencer al receptor usando recursos retóricos y apelaciones emocionales. La publicidad combina persuasión con técnicas visuales.',
        example: 'Un editorial que defiende la energía renovable es argumentativo. Un anuncio de "Compra ahora y ahorra $50\\%$" es persuasivo publicitario.',
      },
      {
        title: 'Documentos legales y administrativos',
        content: 'Los documentos legales (contratos, actas, poderes) usan lenguaje formal y preciso con cláusulas numeradas. Los administrativos (solicitudes, oficios, memorándums) siguen formatos establecidos con encabezado, cuerpo y firma. Ambos requieren claridad y exactitud.',
        example: 'Un contrato de arrendamiento incluye: partes, objeto, plazo, renta, obligaciones. Un oficio tiene: destinatario, asunto, cuerpo, despedida, firma.',
      },
      {
        title: 'Figuras retóricas',
        content: 'Las figuras retóricas embellecen el lenguaje. Metáfora: comparación implícita ("la vida es un camino"). Símil: comparación explícita con "como" ("valiente como un león"). Hipérbole: exageración ("lloré un mar de lágrimas"). Personificación: atribuir cualidades humanas a cosas ("el viento susurraba").',
        example: 'Metáfora: "sus palabras fueron puñales". Símil: "dormía como un tronco". Personificación: "el sol sonrió al amanecer".',
      },
    ],
  },

  // ───────────────────────────── MATEMÁTICAS ─────────────────────────────
  matematicas: {
    'Sentido numérico y pensamiento algebraico': [
      {
        title: 'Fracciones y operaciones',
        content: 'Suma: $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$. Multiplicación: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$. División: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{ad}{bc}$. Para simplificar, se dividen numerador y denominador entre su MCD.',
        example: '$\\frac{1}{2} + \\frac{1}{3} = \\frac{3+2}{6} = \\frac{5}{6}$. $\\frac{3}{4} \\times \\frac{2}{5} = \\frac{6}{20} = \\frac{3}{10}$.',
      },
      {
        title: 'Ecuaciones de primer grado',
        content: 'Una ecuación de primer grado tiene la forma $ax + b = 0$ donde $a \\neq 0$. Para resolverla: despejar $x$ mediante operaciones inversas: $x = -\\frac{b}{a}$. Si hay fracciones, multiplicar por el MCM para eliminar denominadores.',
        example: 'Resolver $3x + 6 = 0$: $3x = -6$, entonces $x = -2$. Resolver $\\frac{x}{2} + 3 = 5$: $x + 6 = 10$, $x = 4$.',
      },
      {
        title: 'Sistemas de ecuaciones',
        content: 'Un sistema de dos ecuaciones con dos incógnitas se resuelve por sustitución, igualación o reducción. Método de reducción: multiplicar las ecuaciones para que al sumar o restar se elimine una incógnita.',
        example: '$\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}$ Sumando: $3x = 9 \\Rightarrow x = 3$, entonces $y = 1$.',
      },
      {
        title: 'Potencias y raíces',
        content: 'Potencia: $a^n = a \\cdot a \\cdots a$ ($n$ veces). Propiedades: $a^m \\cdot a^n = a^{m+n}$, $\\frac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{mn}$. Raíz cuadrada: $\\sqrt{a^2} = |a|$. $\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}$.',
        example: '$2^3 \\cdot 2^2 = 2^5 = 32$. $\\sqrt{144} = 12$. $(3^2)^3 = 3^6 = 729$.',
      },
      {
        title: 'Porcentajes y proporciones',
        content: 'El porcentaje $p\\%$ de una cantidad $C$ es: $\\frac{p}{100} \\times C$. Para calcular un incremento: $C \\times (1 + \\frac{p}{100})$. Para un descuento: $C \\times (1 - \\frac{p}{100})$. Una proporción es $\\frac{a}{b} = \\frac{c}{d}$ y se resuelve con $a \\cdot d = b \\cdot c$.',
        example: 'El $15\\%$ de 80 es $\\frac{15}{100} \\times 80 = 12$. Un producto de $\\$500$ con $20\\%$ de descuento cuesta $500 \\times 0.8 = \$400$.',
      },
    ],
    'Forma, espacio y medida': [
      {
        title: 'Áreas de figuras planas',
        content: 'Triángulo: $A = \\frac{b \\times h}{2}$. Rectángulo: $A = b \\times h$. Círculo: $A = \\pi r^2$. Trapecio: $A = \\frac{(B + b) \\times h}{2}$. Paralelogramo: $A = b \\times h$.',
        example: 'Un triángulo con $b = 6$ y $h = 4$: $A = 12$. Un círculo con $r = 5$: $A = 25\\pi \\approx 78.54$.',
      },
      {
        title: 'Teorema de Pitágoras',
        content: 'En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: $a^2 + b^2 = c^2$, donde $c$ es la hipotenusa.',
        example: 'Si $a = 3$ y $b = 4$, entonces $c = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
      },
      {
        title: 'Perímetros y volúmenes',
        content: 'Perímetro del círculo (circunferencia): $P = 2\\pi r$. Volumen del cubo: $V = a^3$. Volumen del prisma rectangular: $V = a \\times b \\times c$. Volumen del cilindro: $V = \\pi r^2 h$. Volumen de la esfera: $V = \\frac{4}{3}\\pi r^3$.',
        example: 'Cilindro con $r = 3$ y $h = 10$: $V = \\pi \\cdot 9 \\cdot 10 = 90\\pi \\approx 282.7$.',
      },
      {
        title: 'Ángulos y triángulos',
        content: 'La suma de los ángulos internos de un triángulo es $180^\circ$. En un triángulo equilátero, cada ángulo mide $60^\circ$. Ángulos complementarios suman $90^\circ$; suplementarios suman $180^\circ$. Ángulos opuestos por el vértice son iguales.',
        example: 'Si dos ángulos de un triángulo miden $45^\circ$ y $65^\circ$, el tercero mide $180^\circ - 45^\circ - 65^\circ = 70^\circ$.',
      },
    ],
    'Manejo de la información': [
      {
        title: 'Razón, proporción y porcentaje',
        content: 'Una razón compara dos cantidades: $a:b$ o $\\frac{a}{b}$. Una proporción iguala dos razones: $\\frac{a}{b} = \\frac{c}{d}$. El porcentaje es una razón con denominador 100. La regla de tres simple: si $a \\rightarrow b$, entonces $c \\rightarrow x = \\frac{b \\cdot c}{a}$.',
        example: 'Si 3 lápices cuestan $\$15$, ¿cuánto cuestan 7? $x = \\frac{15 \\times 7}{3} = $\\$35$$.',
      },
      {
        title: 'Variación directa e inversa',
        content: 'Variación directa: $y = kx$ (si $x$ aumenta, $y$ aumenta proporcionalmente). Variación inversa: $y = \\frac{k}{x}$ (si $x$ aumenta, $y$ disminuye). En ambas, $k$ es la constante de proporcionalidad.',
        example: 'Directa: 2 horas $\\rightarrow$ $\$40$, 5 horas $\\rightarrow$ $\$100$ ($k=20$). Inversa: 4 obreros $\\rightarrow$ 6 días, 8 obreros $\\rightarrow$ 3 días ($k=24$).',
      },
    ],
    'Análisis y representación de datos': [
      {
        title: 'Media, mediana y moda',
        content: 'Media aritmética: $\\bar{x} = \\frac{x_1 + x_2 + \\cdots + x_n}{n}$. Mediana: el valor central de los datos ordenados. Moda: el valor que más se repite. Rango: diferencia entre el máximo y el mínimo.',
        example: 'Datos: $4, 6, 6, 8, 10$. Media $= \\frac{34}{5} = 6.8$. Mediana $= 6$. Moda $= 6$. Rango $= 10 - 4 = 6$.',
      },
      {
        title: 'Gráficas estadísticas',
        content: 'Gráfica de barras: compara categorías. Histograma: muestra frecuencias de intervalos. Gráfica circular (pastel): muestra proporciones (cada sector $= \\frac{valor}{total} \\times 360^\circ$). Gráfica de línea: muestra tendencias en el tiempo.',
        example: 'Si un sector representa el $25\\%$ del total, su ángulo es $0.25 \\times 360^\circ = 90^\circ$.',
      },
    ],
  },

  // ───────────────────────────── BIOLOGÍA ─────────────────────────────
  biologia: {
    'El valor de la biodiversidad': [
      {
        title: 'La célula y sus organelos',
        content: 'La célula es la unidad básica de la vida. Las células eucariotas tienen núcleo (ADN), mitocondrias (producción de ATP), ribosomas (síntesis de proteínas), retículo endoplásmico (síntesis y transporte), aparato de Golgi (empaque), lisosomas (digestión) y membrana plasmática (regulación). Las células procariotas carecen de núcleo.',
        example: 'La mitocondria produce ATP mediante respiración celular. Los ribosomas ensamblan proteínas a partir de aminoácidos.',
      },
      {
        title: 'Clasificación de los seres vivos',
        content: 'El sistema de clasificación (taxonomía) organiza a los seres vivos en: Reino, Filo, Clase, Orden, Familia, Género y Especie. Los cinco reinos son: Mónera (bacterias), Protista (protozoarios), Fungi (hongos), Plantae (plantas) y Animalia (animales).',
        example: 'El ser humano: Reino Animalia, Filo Cordados, Clase Mamíferos, Orden Primates, Familia Hominidos, Género Homo, Especie Homo sapiens.',
      },
      {
        title: 'Ecosistemas y biodiversidad',
        content: 'Un ecosistema es el conjunto de organismos (biocenosis) y su ambiente físico (biotopo). Los componentes bióticos son los seres vivos; los abióticos son luz, agua, suelo y temperatura. La biodiversidad incluye diversidad genética, de especies y de ecosistemas.',
        example: 'Un bosque tropical es un ecosistema con alta biodiversidad: árboles, insectos, aves, mamíferos, hongos y microorganismos interactuando con el clima y el suelo.',
      },
    ],
    'Tecnología y sociedad': [
      {
        title: 'Biotecnología y sus aplicaciones',
        content: 'La biotecnología utiliza organismos vivos para crear productos útiles. Incluye ingeniería genética (modificación de ADN), clonación, fermentación industrial y producción de vacunas, antibióticos e insulina. Tiene aplicaciones en medicina, agricultura e industria alimentaria.',
        example: 'La insulina humana se produce insertando el gen humano en bacterias que la sintetizan en grandes cantidades.',
      },
      {
        title: 'Impacto ambiental y sustentabilidad',
        content: 'Las actividades humanas generan impactos: deforestación, contaminación, pérdida de biodiversidad y cambio climático. La sustentabilidad busca satisfacer las necesidades del presente sin comprometer a las futuras generaciones mediante el uso racional de recursos.',
        example: 'Las energías renovables (solar, eólica) reducen la emisión de gases de efecto invernadero frente a los combustibles fósiles.',
      },
    ],
    'Transformación de materia y energía': [
      {
        title: 'Fotosíntesis',
        content: 'La fotosíntesis es el proceso por el cual las plantas convierten luz solar en energía química. Reacción: $6CO_2 + 6H_2O + \\text{luz} \\rightarrow C_6H_{12}O_6 + 6O_2$. Ocurre en los cloroplastos mediante fases lumínica (captación de luz) y oscura (ciclo de Calvin).',
        example: 'Una hoja absorbe $CO_2$ por los estomas, agua por las raíces y luz por la clorofila. Produce glucosa y libera oxígeno.',
      },
      {
        title: 'Cadenas y redes tróficas',
        content: 'Una cadena trófica transfiere energía entre organismos: productores (plantas) $\\rightarrow$ consumidores primarios (herbívoros) $\\rightarrow$ secundarios (carnívoros) $\\rightarrow$ terciarios (superpredadores) $\\rightarrow$ descomponedores (hongos, bacterias). Solo el $10\\%$ de la energía se transfiere al siguiente nivel.',
        example: 'Pasto $\\rightarrow$ saltamontes $\\rightarrow$ rana $\\rightarrow$ serpiente $\\rightarrow$ águila. Los descomponedores reciclan la materia de todos.',
      },
    ],
    'Nutrición y respiración para el cuidado de la salud': [
      {
        title: 'Respiración celular',
        content: 'La respiración celular descompone glucosa con oxígeno para producir ATP. Reacción global: $C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + ATP$. Ocurre en tres etapas: glucólisis (citoplasma), ciclo de Krebs (mitocondria) y cadena de transporte de electrones (mitocondria).',
        example: 'Una molécula de glucosa produce aproximadamente 36 ATP. La fermentación es anaeróbica y produce solo 2 ATP.',
      },
      {
        title: 'Aparatos y sistemas del cuerpo humano',
        content: 'Los principales sistemas son: digestivo (boca, esófago, estómago, intestinos — digestión y absorción), respiratorio (nariz, tráquea, pulmones — intercambio de gases), circulatorio (corazón, vasos, sangre — transporte), nervioso (cerebro, médula, nervios — control) y excretor (riñones — filtración).',
        example: 'El corazón bombea sangre oxigenada desde el pulmón hacia todo el cuerpo mediante el circuito doble (menor y mayor).',
      },
    ],
    'Reproducción y sexualidad': [
      {
        title: 'Reproducción humana',
        content: 'La reproducción sexual implica la fusión de gametos: espermatozoide y óvulo (fecundación). El aparato reproductor femenino incluye ovarios, trompas de Falopio, útero y vagina. El masculino incluye testículos, epidídimo, conductos deferentes, próstata y pene. La fecundación ocurre en las trompas.',
        example: 'El cigoto resultante de la fecundación se implanta en el útero donde se desarrolla durante 9 meses.',
      },
      {
        title: 'Métodos anticonceptivos',
        content: 'Los métodos anticonceptivos previenen el embarazo. De barrera: condón, diafragma. Hormonales: pastillas, parches, inyecciones. Naturales: ritmo, coito interruptus. Permanentes: ligadura de trompas, vasectomía. El condón además previene ETS.',
        example: 'El condón es el único método que protege simultáneamente contra embarazo no planificado y enfermedades de transmisión sexual.',
      },
    ],
    'Genética, tecnología y sociedad': [
      {
        title: 'Herencia y leyes de Mendel',
        content: 'Primera ley (uniformidad): al cruzar dos razas puras, la primera generación es uniforme. Segunda ley (segregación): los alelos se separan al formar gametos. Tercera ley (distribución independiente): genes en cromosomas distintos se heredan independientemente. Genotipo = genes; fenotipo = características observables.',
        example: 'Cruce AA × aa → toda la F$_1$ es Aa (uniforme). La F$_2$ presenta proporción 3:1 en fenotipo.',
      },
      {
        title: 'ADN, ARN y síntesis de proteínas',
        content: 'El ADN es una doble hélice con bases nitrogenadas: adenina (A), timina (T), guanina (G) y citosina (C). A se empareja con T; G con C. El ARN mensajero transcribe la información del ADN y los ribosomas la traducen en proteínas. Cada 3 bases (codón) codifican un aminoácido.',
        example: 'El codón AUG codifica el aminoácido metionina e inicia la traducción. El codón UAA es de terminación.',
      },
      {
        title: 'Evolución y selección natural',
        content: 'La teoría de Darwin propone que los organismos con características ventajosas tienen mayor supervivencia y reproducción (selección natural), transmitiendo esos rasgos a su descendencia. La evolución es el cambio gradual en las poblaciones a lo largo de generaciones. Las mutaciones son la fuente de variación genética.',
        example: 'Los pinzones de las Galápagos desarrollaron picos distintos según la dieta disponible en cada isla — selección natural divergente.',
      },
    ],
  },

  // ───────────────────────────── FÍSICA ─────────────────────────────
  fisica: {
    'El movimiento. La descripción de los cambios en la naturaleza': [
      {
        title: 'MRU — Movimiento Rectilíneo Uniforme',
        content: 'En el MRU la velocidad es constante y la aceleración es cero. Fórmulas: $v = \\frac{d}{t}$, $d = v \\cdot t$, $t = \\frac{d}{v}$. Las unidades son: distancia (m), velocidad (m/s), tiempo (s).',
        example: 'Un auto viaja a $20$ m/s durante $60$ s. Distancia: $d = 20 \\times 60 = 1200$ m $= 1.2$ km.',
      },
      {
        title: 'MRUA — Movimiento Rectilíneo Uniformemente Acelerado',
        content: 'En el MRUA la aceleración es constante. Fórmulas: $v_f = v_0 + at$, $d = v_0 t + \\frac{1}{2}at^2$, $v_f^2 = v_0^2 + 2ad$. Donde $v_0$ es velocidad inicial, $v_f$ es velocidad final, $a$ es aceleración.',
        example: 'Un auto parte del reposo ($v_0 = 0$) con $a = 3$ m/s² durante $5$ s. $v_f = 0 + 3 \\times 5 = 15$ m/s. $d = 0 + \\frac{1}{2}(3)(25) = 37.5$ m.',
      },
      {
        title: 'Caída libre y tiro vertical',
        content: 'La caída libre es un MRUA con $a = g = 9.8$ m/s² (hacia abajo). En tiro vertical, la velocidad máxima es $0$ en el punto más alto. $v_f = v_0 - gt$, $h = v_0 t - \\frac{1}{2}gt^2$. El tiempo de subida iguala al de bajada.',
        example: 'Se lanza una pelota hacia arriba a $19.6$ m/s. Altura máxima: $t = \\frac{v_0}{g} = 2$ s, $h = 19.6 \\times 2 - \\frac{1}{2}(9.8)(4) = 19.6$ m.',
      },
    ],
    'Las fuerzas. La explicación de los cambios': [
      {
        title: 'Leyes de Newton',
        content: 'Primera ley (inercia): un cuerpo en reposo o MRU permanece así salvo que una fuerza externa actúe. Segunda ley: $F = m \\cdot a$ (la fuerza neta es masa por aceleración). Tercera ley: por cada acción existe una reacción igual y opuesta.',
        example: 'Si $m = 2$ kg y $a = 5$ m/s², entonces $F = 10$ N. Al empujar una pared con 50 N, la pared te empuja con 50 N en sentido contrario.',
      },
      {
        title: 'Fuerza de gravedad y peso',
        content: 'El peso es la fuerza con que la Tierra atrae a un cuerpo: $P = m \\cdot g$ donde $g = 9.8$ m/s². La masa es constante; el peso varía según la gravedad. En la Luna $g \\approx 1.6$ m/s².',
        example: 'Un cuerpo de $10$ kg pesa $P = 10 \\times 9.8 = 98$ N en la Tierra, pero solo $16$ N en la Luna.',
      },
      {
        title: 'Fuerza de fricción',
        content: 'La fricción se opone al movimiento relativo entre dos superficies. Fricción estática: $f_e \\leq \\mu_e N$. Fricción cinética: $f_c = \\mu_c N$, donde $N$ es la fuerza normal y $\\mu$ es el coeficiente de fricción. Generalmente $\\mu_e > \\mu_c$.',
        example: 'Una caja de $20$ kg sobre un piso con $\\mu_c = 0.3$: $N = 196$ N, $f_c = 0.3 \\times 196 = 58.8$ N.',
      },
    ],
    'Las interacciones de la materia. Un modelo para describir lo que no percibimos': [
      {
        title: 'Energía mecánica y conservación',
        content: 'La energía cinética es $E_c = \\frac{1}{2}mv^2$. La energía potencial gravitatoria es $E_p = mgh$. La energía mecánica total es $E_m = E_c + E_p$. En ausencia de fricción, la energía mecánica se conserva: $E_{m,i} = E_{m,f}$.',
        example: 'Un objeto de $2$ kg a $10$ m de altura: $E_p = 2 \\times 9.8 \\times 10 = 196$ J. Al caer, toda esa energía se convierte en $E_c$ al llegar al suelo: $v = \\sqrt{2gh} = 14$ m/s.',
      },
      {
        title: 'Trabajo y potencia',
        content: 'El trabajo es $W = F \\cdot d \\cdot \\cos\\theta$, donde $\\theta$ es el ángulo entre la fuerza y el desplazamiento. La potencia es $P = \\frac{W}{t}$. Unidad de trabajo: joule (J). Unidad de potencia: watt (W) $= 1$ J/s.',
        example: 'Una fuerza de $50$ N desplaza un objeto $10$ m en su misma dirección: $W = 50 \\times 10 = 500$ J. Si tarda $5$ s: $P = 100$ W.',
      },
    ],
    'Manifestaciones de la estructura interna de la materia': [
      {
        title: 'Ondas y sus características',
        content: 'Una onda transports energía sin transportar materia. Parámetros: longitud de onda ($\\lambda$), frecuencia ($f$, en Hz), amplitud ($A$). Velocidad de propagación: $v = \\lambda \\cdot f$. Las ondas pueden ser transversales (perpendiculares a la dirección) o longitudinales (paralelas).',
        example: 'Una onda con $\\lambda = 2$ m y $f = 5$ Hz tiene $v = 10$ m/s. El sonido es una onda longitudinal; la luz es transversal.',
      },
      {
        title: 'Electricidad y circuitos',
        content: 'Ley de Ohm: $V = I \\cdot R$, donde $V$ es voltaje (V), $I$ es corriente (A) y $R$ es resistencia ($\\Omega$). Potencia eléctrica: $P = V \\cdot I$. En serie, las resistencias se suman: $R_t = R_1 + R_2 + \\cdots$. En paralelo: $\\frac{1}{R_t} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots$.',
        example: 'Un circuito con $V = 12$ V y $R = 4$ $\\Omega$: $I = \\frac{12}{4} = 3$ A. Potencia: $P = 12 \\times 3 = 36$ W.',
      },
      {
        title: 'Magnetismo y electromagnetismo',
        content: 'Un imán tiene dos polos: norte y sur. Polos iguales se repelen, opuestos se atraen. Una corriente eléctrica genera un campo magnético (efecto Oersted). Un campo magnético variable induce una corriente (ley de Faraday). Los electroimanes usan corriente para generar magnetismo controlable.',
        example: 'Un transformador usa inducción electromagnética para cambiar voltajes de CA. Las turbinas eléctricas generan corriente al girar bobinas en un campo magnético.',
      },
    ],
  },

  // ───────────────────────────── QUÍMICA ─────────────────────────────
  quimica: {
    'Las características de los materiales': [
      {
        title: 'Estados de agregación y cambios de estado',
        content: 'La materia se presenta en estado sólido (forma y volumen fijos), líquido ( volumen fijo, forma variable) o gaseoso (sin forma ni volumen fijos). Cambios: fusión (sólido→líquido), solidificación (líquido→sólido), evaporación (líquido→gas), condensación (gas→líquido), sublimación (sólido→gas), deposición (gas→sólido).',
        example: 'El hielo se funde a $0^\circ$C. El agua se evapora a $100^\circ$C (a 1 atm). El hielo seco (CO$_2$ sólido) se sublima.',
      },
      {
        title: 'Mezclas, sustancias y métodos de separación',
        content: 'Las mezclas son homogéneas (uniformes, como soluciones) o heterogéneas (componentes distinguibles). Las sustancias pueden ser elementos o compuestos. Métodos de separación: filtración, decantación, destilación, evaporación, cromatografía, separación magnética.',
        example: 'Para separar agua y sal: evaporación (el agua se evapora, la sal queda). Para separar agua y aceite: decantación (el aceite flota).',
      },
      {
        title: 'Propiedades de la materia',
        content: 'Propiedades extensivas: dependen de la cantidad (masa, volumen, peso). Propiedades intensivas: no dependen de la cantidad (densidad, punto de fusión, color, dureza). La densidad es $\\rho = \\frac{m}{V}$.',
        example: 'La densidad del agua es $1$ g/cm³. Un objeto de $200$ g con volumen $100$ cm³ tiene $\\rho = 2$ g/cm³ y se hunde en agua.',
      },
    ],
    'Estructura y periodicidad de los elementos': [
      {
        title: 'Estructura atómica',
        content: 'El átomo tiene un núcleo con protones ($+$) y neutrones (neutros), y electrones ($-$) en orbitales. El número atómico ($Z$) es el de protones; el másico ($A$) es protones + neutrones. Notación: $^A_Z\\text{X}$. Los isótopos tienen igual $Z$ pero distinto $A$.',
        example: 'El carbono-12: $Z = 6$, $A = 12$, 6 protones, 6 neutrones, 6 electrones. El carbono-14 tiene 8 neutrones.',
      },
      {
        title: 'Modelo atómico y configuración electrónica',
        content: 'Los electrones se distribuyen en niveles de energía. Los primeros 4 niveles容纳最多 2, 8, 18 y 32 electrones. La configuración electrónica indica la distribución: por ejemplo, el sodio ($Z=11$) tiene $1s^2\\,2s^2\\,2p^6\\,3s^1$. Los electrones de valencia determinan la reactividad.',
        example: 'El oxígeno ($Z=8$): $1s^2\\,2s^2\\,2p^4$. Tiene 6 electrones de valencia y tiende a ganar 2 para completar el octeto.',
      },
      {
        title: 'Tabla periódica y propiedades periódicas',
        content: 'La tabla periódica organiza los elementos por número atómico. Los grupos (columnas) tienen propiedades similares; los períodos (filas) tienen el mismo número de niveles. Propiedades periódicas: radio atómico (crece hacia abajo e izquierda), electronegatividad (crece hacia arriba y derecha), energía de ionización.',
        example: 'El grupo 18 (gases nobles) es casi inerte porque tiene el octeto completo. El grupo 1 (metales alcalinos) es muy reactivo.',
      },
    ],
    'La reacción química': [
      {
        title: 'Enlaces químicos',
        content: 'Enlace iónico: transferencia de electrones (metal + no metal). Enlace covalente: compartición de electrones (no metales). Enlace metálico: electrones compartidos en una "nube" entre metales. El número de oxidación indica la carga que un átomo tiene en un compuesto.',
        example: 'NaCl: enlace iónico. El Na cede 1 electrón al Cl. H$_2$O: enlace covalente, dos átomos de H comparten con uno de O.',
      },
      {
        title: 'Balanceo de ecuaciones (ley de conservación)',
        content: 'Toda ecuación química debe conservar el número de átomos de cada elemento en ambos lados. Se balancean con coeficientes estequiométricos. La masa total de reactivos es igual a la de productos.',
        example: '$2H_2 + O_2 \\rightarrow 2H_2O$. Reactivos: 4 H, 2 O. Productos: 4 H, 2 O. Balanceada.',
      },
      {
        title: 'Tipos de reacciones químicas',
        content: 'Síntesis o combinación: $A + B \\rightarrow AB$. Descomposición: $AB \\rightarrow A + B$. Sustitución simple: $A + BC \\rightarrow AC + B$. Sustitución doble: $AB + CD \\rightarrow AD + CB$. Combustión: hidrocarburo + $O_2 \\rightarrow CO_2 + H_2O$.',
        example: 'Síntesis: $2Na + Cl_2 \\rightarrow 2NaCl$. Combustión: $CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$.',
      },
    ],
  },

  // ───────────────────────────── HISTORIA ─────────────────────────────
  historia: {
    'De principios del siglo XVI a principios del siglo XVIII': [
      {
        title: 'El Renacimiento y la expansión europea',
        content: 'El Renacimiento (siglos XV-XVI) fue un movimiento cultural que retomó los valores de la antigüedad clásica. Se caracterizó por el humanismo, el desarrollo científico y el arte realista. La invención de la imprenta (Gutenberg, 1440) difundió el conocimiento. Los avances náuticos permitieron las grandes exploraciones.',
        example: 'Personajes clave: Leonardo da Vinci, Miguel Ángel, Copérnico, Galileo. Portugal y España lideraron las exploraciones.',
      },
      {
        title: 'Conquista y colonización de América',
        content: 'En 1492 Colón llegó a América. La conquista de México-Tenochtitlán (1519-1521) fue liderada por Hernán Cortés con aliados indígenas. La conquista del Imperio Inca (1532) fue liderada por Pizarro. La colonización impuso religión católica, idioma español y organización política europea.',
        example: 'La caída de Tenochtitlán el 13 de agosto de 1521 marcó el inicio del período colonial en Mesoamérica.',
      },
    ],
    'De mediados del siglo XVIII a mediados del siglo XIX': [
      {
        title: 'La Ilustración y las revoluciones',
        content: 'La Ilustración (siglo XVIII) promovió la razón, la libertad y la igualdad. Pensadores: Voltaire, Rousseau, Montesquieu. Inspiró la Revolución Francesa (1789) que proclamó los Derechos del Hombre. La Revolución de las 13 Colonias (1776) dio origen a Estados Unidos.',
        example: 'La Declaración de Independencia de EE.UU. (1776) y la Declaración de los Derechos del Hombre (1789) son documentos ilustrados.',
      },
      {
        title: 'La Independencia de México',
        content: 'El 16 de septiembre de 1810, Miguel Hidalgo lanzó el Grito de Dolores. Etapas: iniciación (1810-1811, Hidalgo), resistencia (1811-1815, Morelos), consumación (1820-1821, Guerrero e Iturbide). El Plan de Iguala (1821) estableció religión, unión e independencia. Se firmó el Acta de Independencia el 28 de septiembre de 1821.',
        example: 'Hidalgo fue capturado y ejecutado en 1811. Morelos en 1815. Iturbide consumó la independencia en 1821.',
      },
    ],
    'De mediados del siglo XIX a 1920': [
      {
        title: 'La Reforma y el Imperio de Maximiliano',
        content: 'Las Leyes de Reforma (1859-1860) separaron Iglesia y Estado, nacionalizaron bienes del clero y declararon la libertad de culto. La Constitución de 1857 estableció derechos individuales. La intervención francesa (1862-1867) impuso a Maximiliano como emperador. Benito Juárez lo derrotó en Querétaro (1867).',
        example: 'Juárez proclamó las Leyes de Reforma. La frase "Entre los individuos como entre las naciones, el respeto al derecho ajeno es la paz" es suya.',
      },
      {
        title: 'El Porfiriato y la Revolución Mexicana',
        content: 'El Porfiriato (1876-1911) fue una dictadura de Porfirio Díaz caracterizada por estabilidad, modernización y desigualdad social. La Revolución inició en 1910 con el Plan de San Luis (Madero). Etapas: maderista (1910-1911), constitucionalista (1913-1917, Carranza) y la lucha entre facciones (Villa, Zapata). La Constitución de 1917 estableció derechos sociales.',
        example: 'Pancho Villa lideró el Norte; Emiliano Zapata el Sur con el lema "Tierra y Libertad". La Constitución de 1917 fue la primera en incluir derechos sociales.',
      },
    ],
    'El mundo entre 1920 y 1960': [
      {
        title: 'Primera Guerra Mundial (1914-1918)',
        content: 'Causas: nacionalismo, imperialismo, carrera armamentista y asesinato del archiduque Francisco Fernando. Aliados (Francia, Inglaterra, Rusia, EE.UU.) vs Potencias Centrales (Alemania, Austria-Hungría, Imperio Otomano). Terminó con el Tratado de Versalles, que impuso condiciones severas a Alemania. Surgió la Sociedad de Naciones.',
        example: 'El asesinato en Sarajevo (1914) fue el detonante. EE.UU. entró en 1917. El Tratado de Versalles (1919) condenó a Alemania a pagar reparaciones.',
      },
      {
        title: 'Segunda Guerra Mundial (1939-1945)',
        content: 'Causas: Treaty de Versalles humillante, crisis económica, expansionismo fascista. Eje (Alemania, Italia, Japón) vs Aliados (Inglaterra, URSS, EE.UU., Francia). Eventos clave: invasión de Polonia (1939), Pearl Harbor (1941), Stalingrado (1943), D-Day (1944), bombas atómicas (1945). Terminó con la rendición de Alemania y Japón. Surgieron la ONU y la Guerra Fría.',
        example: 'Hitler invadió Polonia el 1° de septiembre de 1939. Las bombas de Hiroshima y Nagasaki (agosto 1945) forzaron la rendición japonesa.',
      },
      {
        title: 'México posrevolucionario (1920-1960)',
        content: 'Período de reconstrucción. Gobiernos de Obregón, Calles, Cárdenas. Reforma agraria, expropiación petrolera (1938, Cárdenas), educación socialista, sindicalismo. El PRI dominó la política. Se consolidaron instituciones revolucionarias y se desarrolló la economía con industrialización por sustitución de importaciones.',
        example: 'Lázaro Cárdenas expropió el petróleo el 18 de marzo de 1938, creando PEMEX. Repartió más de 18 millones de hectáreas.',
      },
    ],
    'Décadas recientes': [
      {
        title: 'La Guerra Fría (1947-1991)',
        content: 'Enfrentamiento indirecto entre EE.UU. (capitalismo) y URSS (comunismo). Características: carrera armamentista (nuclear), carrera espacial, espionaje (CIA vs KGB), conflictos proxy (Corea, Vietnam, Afganistán). Símbolos: Muro de Berlín (1961-1989). Terminó con la disolución de la URSS (1991).',
        example: 'La crisis de los misiles en Cuba (1962) casi desencadenó guerra nuclear. El Sputnik (1957) inició la carrera espacial.',
      },
      {
        title: 'Globalización y tecnología (1990-actualidad)',
        content: 'Tras la Guerra Fría se aceleró la globalización: integración económica, revolución digital (internet, telefonía móvil), bloques comerciales (TLCAN/MERCOSUR/UE). Avances: biotecnología, inteligencia artificial, energías renovables. Retos: cambio climático, desigualdad, migración, terrorism.',
        example: 'Internet se popularizó en los 90. El TLCAN entró en vigor en 1994 entre México, EE.UU. y Canadá. El iPhone revolucionó la comunicación móvil en 2007.',
      },
    ],
    'Las culturas prehispánicas y la conformación de la Nueva España': [
      {
        title: 'Civilizaciones mesoamericanas',
        content: 'Las principales civilizaciones mesoamericanas fueron olmecas (1200-400 a.C., "cultura madre"), mayas (300-900 d.C., escritura y astronomía), teotihuacanos (100-650 d.C., pirámide del Sol), toltecas (900-1200 d.C.) y mexicas o aztecas (1325-1521 d.C.). Compartían agricultura del maíz, calendarios, religión politeísta y arquitectura monumental.',
        example: 'Tenochtitlán, capital mexica, fue fundada en 1325 sobre el lago de Texcoco. Tenía calzadas, chinampas y templos como el Templo Mayor.',
      },
      {
        title: 'Organización social y económica de los pueblos prehispánicos',
        content: 'Los mexicas tenían una sociedad estratificada: pipiltin (nobles), macehualtin (comunes), mayeques (siervos) y esclavos. La economía se basaba en agricultura (maíz, frijol, calabaza), tributo y comercio (pochtecas). Los mayas desarrollaron escritura jeroglífica y el calendario de cuenta larga.',
        example: 'El mercado de Tlatelolco era el más grande de Mesoamérica, con hasta 60 mil personas diarias. El calendario solar mexica (xiuhpohualli) tenía 365 días.',
      },
    ],
    'Nueva España desde su consolidación hasta la independencia': [
      {
        title: 'Organización colonial',
        content: 'Nueva España (1521-1821) se organizó en virreinatos, audiencias y provincias. El virrey representaba al rey. Sociedad de castas: peninsulares, criollos, mestizos, indígenas y esclavos africanos. Economía: minería (plata), agricultura, comercio monopolizado por España. La Iglesia tuvo enorme poder político y económico.',
        example: 'La mina de Plata de Zacatecas y Guanajuato fue la principal fuente de riqueza. Los criollos, descontentos con su exclusión del poder, lideraron la Independencia.',
      },
      {
        title: 'Causas de la Independencia',
        content: 'Causas internas: desigualdad social, exclusión de criollos del poder, descontento indígena. Causas externas: ideas ilustradas, Independencia de EE.UU. (1776), Revolución Francesa (1789), invasión napoleónica a España (1808) que debilitó la autoridad española. La conspiración de Querétaro (1810) planeó el levantamiento.',
        example: 'La obra "El triunfo de la fe y el announcements de la patria" del jesuita Hidalgo y el cartero de Dolores fueron catalizadores del movimiento.',
      },
    ],
    'De la consumación de la Independencia al inicio de la Revolución Mexicana (1821-1911)': [
      {
        title: 'México independiente (1821-1855)',
        content: 'Primer Imperio (Iturbide, 1821-1823) → República Federal (1824) → República Centralista (1835) → Intervenciones extranjeras. Pérdidas territoriales: Texas (1836), Guerra con EE.UU. (1846-1848) perdiendo más de la mitad del territorio. Inestabilidad política con más de 50 presidentes en 55 años.',
        example: 'El Tratado de Guadalupe Hidalgo (1848) cedió California, Nevada, Utah, Arizona, Nuevo México y parte de Colorado a EE.UU.',
      },
      {
        title: 'El Porfiriato (1876-1911)',
        content: 'Porfirio Díaz gobernó 35 años con el lema "Orden y progreso". Modernización: ferrocarriles, telégrafo, minería, industria. Inversión extranjera. Pero hubo desigualdad extrema: campesinos despojados de tierras, salarios bajos, ausencia de democracia. La frase "Poca política y mucha administración" resumió su régimen.',
        example: 'En 1910, Díaz celebró el Centenario de la Independencia con fasto, mientras el país vivía gran desigualdad. Francisco I. Madero publicó "La sucesión presidencial" ese año.',
      },
    ],
    'Instituciones revolucionarias y desarrollo económico (1911-1970)': [
      {
        title: 'La Revolución Mexicana y sus líderes',
        content: 'Francisco I. Madero derrocó a Díaz en 1911 pero fue asesinado por Huerta (1913). Venustiano Carranza lideró el Ejército Constitucionalista. Pancho Villa comandó la División del Norte; Emiliano Zapata el Ejército Libertador del Sur. La Constitución de 1917 estableció derechos sociales: reforma agraria (art. 27), derechos laborales (art. 123), educación laica (art. 3).',
        example: 'El Plan de Ayala (1911) de Zapata exigía redistribución de tierras. La Constitución de 1917 fue pionera en derechos sociales a nivel mundial.',
      },
      {
        title: 'Reconstrucción posrevolucionaria (1920-1970)',
        content: 'Obregón, Calles y Cárdenas consolidaron el Estado post-revolucionario. Reforma agraria, expropiación petrolera (1938), educación rural, sindicalismo (CTM). El PRM/PRI institucionalizó el poder. Crecimiento económico sostenido ("Milagro mexicano", 1940-1970) con industrialización, pero con desigualdad creciente.',
        example: 'Lázaro Cárdenas (1934-1940) repartió 18 millones de hectáreas, expropió el petróleo y apoyó la educación socialista.',
      },
    ],
    'México en la era global (1970-2000)': [
      {
        title: 'Crisis y transición democrática',
        content: 'Años 70: boom petrolero endeudó al país. 1982: crisis de la deuda, devaluación. 1985: terremoto de la Ciudad de México. 1986: ingreso al GATT. 1994: TLCAN, levantamiento zapatista en Chiapas, crisis económica. 1997: el PRI pierde mayoría en la Cámara. 2000: Vicente Fox (PAN) gana, terminando 71 años de PRI.',
        example: 'El EZLN se levantó el 1° de enero de 1994, mismo día que entró en vigor el TLCAN. La transición democrática culminó con la victoria de Fox en julio de 2000.',
      },
      {
        title: 'Neoliberalismo y apertura económica',
        content: 'Desde Miguel de la Madrid (1982-1988) se aplicaron políticas neoliberales: privatización de empresas paraestatales (TELmex, bancos), apertura comercial, desregulación. Salinas (1988-1994) privatizó ampliamente e impulsó el TLCAN. Zedillo (1994-2000) estabilizó la economía tras la crisis de 1994.',
        example: 'Telmex fue privatizada en 1990. Bancos mexicanos fueron privatizados en 1991-1992. El TLCAN entró en vigor el 1° de enero de 1994.',
      },
    ],
  },

  // ───────────────────────────── GEOGRAFÍA ─────────────────────────────
  geografia: {
    'El espacio geográfico y los mapas': [
      {
        title: 'Coordenadas geográficas',
        content: 'La latitud mide la distancia angular al ecuador (0°), va de 0° a 90° N o S. La longitud mide la distancia angular al meridiano de Greenwich (0°), va de 0° a 180° E u O. La altitud es la altura sobre el nivel del mar. El paralelo y el meridiano forman una cuadrícula que permite localizar cualquier punto.',
        example: 'Ciudad de México: latitud $\\approx 19^\circ$ N, longitud $\\approx 99^\circ$ O. Quito, Ecuador está casi sobre el ecuador (latitud $\\approx 0^\circ$).',
      },
      {
        title: 'Tipos de mapas y proyecciones',
        content: 'Los mapas pueden ser políticos (fronteras y ciudades), físicos (relieve y ríos), climáticos, temáticos. Las proyecciones transforman la esfera terrestre en un plano: Mercator (navegación, distorsiona en polos), Robinson (compromiso), Peters (áreas equitativas). La escala es $E = \\frac{\\text{mapa}}{\\text{real}}$.',
        example: 'Escala 1:100000 → 1 cm en el mapa $= 1$ km en la realidad. La proyección de Mercator exagera el tamaño de Groenlandia.',
      },
      {
        title: 'Husos horarios',
        content: 'La Tierra se divide en 24 husos horarios de $15^\circ$ cada uno (360°/24). Cada huso $= 1$ hora de diferencia. Al cruzar la línea internacional de cambio de fecha (180°) se avanza o retrocede un día. México usa 3 zonas horarias: Centro, Montaña y Pacífico.',
        example: 'Si son las 12:00 en Ciudad de México (UTC-6), en Londres (UTC+0) son las 18:00 y en Tokio (UTC+9) son las 3:00 del día siguiente.',
      },
    ],
    'Recursos naturales y preservación del ambiente': [
      {
        title: 'Recursos renovables y no renovables',
        content: 'Recursos renovables: se regeneran naturalmente (agua, aire, biomasa, energía solar, eólica). No renovables: existen en cantidad limitada y no se regeneran a escala humana (petróleo, gas, carbón, minerales). La sobreexplotación de los no renovables genera contaminación y agotamiento.',
        example: 'El petróleo tardó millones de años en formarse. La energía solar, en cambio, es prácticamente inagotable a escala humana.',
      },
      {
        title: 'Problemas ambientales y desarrollo sustentable',
        content: 'Principales problemas: deforestación, contaminación (aire, agua, suelo), cambio climático, pérdida de biodiversidad, desertificación. El desarrollo sustentable equilibra crecimiento económico, protección ambiental y equidad social para no comprometer a las futuras generaciones.',
        example: 'El Protocolo de Kioto (1997) y el Acuerdo de París (2015) buscan reducir las emisiones de gases de efecto invernadero.',
      },
    ],
    'Dinámica de la población y riesgos': [
      {
        title: 'Crecimiento y estructura poblacional',
        content: 'La población mundial crece por diferencia entre natalidad y mortalidad, afectada por migración. La tasa de natalidad es el número de nacimientos por cada 1000 habitantes/año. La transición demográfica describe el paso de altas tasas de natalidad y mortalidad a tasas bajas. La pirámide poblacional muestra la distribución por edad y sexo.',
        example: 'México tiene una pirámide en transición: base más estrecha que antes (menos nacimientos) y mayor proporción de adultos mayores.',
      },
      {
        title: 'Migración y distribución',
        content: 'La migración puede ser voluntaria (búsqueda de oportunidades) o forzada (conflictos, desastres). Tipos: interna (campo-ciudad) e internacional. La distribución de la población depende del relieve, clima, recursos y oportunidades económicas. Las áreas densamente pobladas suelen estar en zonas templadas y costeras.',
        example: 'En México, la migración campo-ciudad creció en el siglo XX. La migración internacional hacia EE.UU. es relevante desde mediados del siglo XX.',
      },
    ],
    'Espacios económicos y desigualdad social': [
      {
        title: 'Sectores económicos',
        content: 'Sector primario: agricultura, ganadería, pesca, minería (extracción). Sector secundario: industria, manufactura, construcción (transformación). Sector terciario: servicios, comercio, transporte, turismo. La participación de cada sector refleja el nivel de desarrollo del país.',
        example: 'En países desarrollados predomina el sector terciario (servicios). En países en vías de desarrollo, el primario puede emplear a mucha población.',
      },
      {
        title: 'Desigualdad y globalización',
        content: 'La desigualdad económica se mide con el coeficiente de Gini (0 = igualdad total, 1 = desigualdad máxima). La globalización integra economías mediante comercio, inversión y tecnología, pero puede ampliar brechas entre ricos y pobres. El PIB per cápita es un indicador del nivel de vida.',
        example: 'Un país con Gini de 0.5 tiene mayor desigualdad que uno con 0.3. La globalización ha permitido crecimiento en Asia pero también concentración de riqueza.',
      },
    ],
    'Espacios culturales y políticos': [
      {
        title: 'Diversidad cultural y lingüística',
        content: 'La diversidad cultural se manifiesta en idiomas, religiones, tradiciones, vestimenta, gastronomía y organización social. En México existen 68 pueblos indígenas y 364 variantes lingüísticas. La UNESCO protege el patrimonio cultural material e inmaterial de la humanidad.',
        example: 'El náhuatl, maya, mixteco y zapoteco son de las lenguas indígenas más habladas en México. La gastronomía mexicana es patrimonio cultural inmaterial de la humanidad.',
      },
      {
        title: 'Organización política del territorio',
        content: 'Los Estados se organizan en: unitarios (poder centralizado) o federales (estados autónomos con gobierno central). México es una república federal con 32 entidades federativas. Las fronteras políticas dividen países; pueden ser naturales (ríos, montañas) o artificiales (líneas geométricas).',
        example: 'México tiene 31 estados y la Ciudad de México. La frontera norte con EE.UU. se delimitó en el Tratado de Guadalupe Hidalgo (1848) y la venta de La Mesilla (1853).',
      },
    ],
  },

  // ───────────────────────────── FORMACIÓN CÍVICA Y ÉTICA ─────────────────────────────
  formacion_civica_etica: {
    'Retos de la sociedad mexicana': [
      {
        title: 'Desigualdad y pobreza',
        content: 'La desigualdad social es uno de los principales retos de México. Se manifiesta en acceso desigual a educación, salud, empleo y servicios básicos. La pobreza se mide por ingresos y carencias sociales (CON EVAL). Reducirla requiere políticas de redistribución, educación inclusiva y oportunidades económicas.',
        example: 'El CONEVAL mide pobreza multidimensional: ingresos, rezago educativo, acceso a salud, seguridad social, alimentación, calidad de vivienda y servicios básicos.',
      },
      {
        title: 'Corrupción e impunidad',
        content: 'La corrupción es el abuso del poder público para beneficio privado. Tiene efectos: debilita instituciones, desvía recursos públicos, fomenta desigualdad y mina la confianza social. La impunidad es la ausencia de sanción. Combatirlas requiere transparencia, rendición de cuentas, independencia judicial y participación ciudadana.',
        example: 'El Sistema Nacional Anticorrupción (SNA), creado en 2016, coordina esfuerzos para prevenir, detectar y sancionar la corrupción.',
      },
    ],
    'Los desafíos del mundo contemporáneo': [
      {
        title: 'Derechos humanos',
        content: 'Los derechos humanos son inherentes a toda persona, universales, inalienables e indivisibles. Se clasifican en: civiles y políticos (vida, libertad, expresión, votar), económicos, sociales y culturales (trabajo, educación, salud), y colectivos (ambiente sano, desarrollo). Están protegidos por la Declaración Universal de 1948 y la Constitución.',
        example: 'El artículo 1° constitucional establece que en México todas las personas gozarán de los derechos humanos reconocidos en la Constitución y en los tratados internacionales.',
      },
      {
        title: 'Globalización y tecnología',
        content: 'La globalización y la tecnología plantean retos: brecha digital, privacidad de datos, desinformación, automatización del empleo, ciberseguridad. Los derechos digitales incluyen acceso a internet, protección de datos personales y libertad de expresión en línea. La ética tecnológica busca un uso responsable de la tecnología.',
        example: 'El GDPR europeo (2018) protege datos personales. En México, la Ley Federal de Protección de Datos Personales (2010) regula el tratamiento de datos.',
      },
    ],
    'La construcción de la ciudadanía': [
      {
        title: 'Derechos y deberes ciudadanos',
        content: 'Los derechos son garantías constitucionales: educación, salud, libertad de expresión, votar, trabajo, igualdad. Los deberes son obligaciones: pagar impuestos, respetar las leyes, votar, participar en la defensa del país, cuidar el ambiente. La ciudadanía se ejerce activamente, no solo con derechos sino con responsabilidades.',
        example: 'Derecho: educación gratuita y laica (art. 3° constitucional). Deber: votar en elecciones (art. 35) y pagar impuestos (art. 31).',
      },
      {
        title: 'La Constitución Política de los Estados Unidos Mexicanos',
        content: 'La Constitución de 1917 es la ley suprema de México. Principios: soberanía popular, división de poderes (Ejecutivo, Legislativo, Judicial), federalismo, derechos humanos. Artículos relevantes: 1° (derechos humanos), 3° (educación laica y gratuita), 27 (propiedad de la tierra), 123 (derechos laborales). Ha sido reformada más de 200 veces.',
        example: 'El artículo 123 establece jornada de 8 horas, salario mínimo, derecho de huelga y sindicalización. Fue pionero a nivel mundial en 1917.',
      },
      {
        title: 'Valores cívicos y éticos',
        content: 'Los valores cívicos son aquellos que sustentan la convivencia democrática: libertad, igualdad, justicia, solidaridad, tolerancia, respeto, responsabilidad y honestidad. Los valores éticos guían el comportamiento individual hacia el bien. Se fomentan mediante la educación, la familia y la participación comunitaria.',
        example: 'La tolerancia implica respetar las diferencias de creencias, opiniones y costumbres. La solidaridad se expresa al ayudar a quienes lo necesitan, como en desastres naturales.',
      },
    ],
    'Participación ciudadana y vida democrática': [
      {
        title: 'Tipos de participación ciudadana',
        content: 'La participación ciudadana incluye: votar en elecciones, iniciar plebiscitos y referendos, asistir a cabildos, denunciar irregularidades, organizarse en sociedad civil, firmar iniciativas populares, participar en consultas públicas y comités de barrio. Es un derecho y un deber democrático.',
        example: 'Un referéndum es una votación directa donde los ciudadanos aprueban o rechazan una propuesta. Un plebiscito consulta la opinión sobre un tema específico.',
      },
      {
        title: 'Sistemas democráticos y elección de representantes',
        content: 'La democracia puede ser directa (ciudadanos deciden) o representativa (ciudadanos eligen representantes). En México, el INE organiza elecciones federales; los OPLES, las locales. Los ciudadanos votan por presidente, senadores, diputados, gobernadores y ayuntamientos. El voto es libre, secreto, universal y directo.',
        example: 'En 2024, los mexicanos votaron simultáneamente para presidente, 128 senadores, 500 diputados, 9 gubernaturas y miles de cargos municipales.',
      },
    ],
  },

};
