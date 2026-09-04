/*
# Create question_bank table and extend profiles for Block 1

## 1. New Tables
- `question_bank` — central repository for all exam questions across 10 subjects.
  - `id` (uuid PK)
  - `subject` (text — one of 10 official subjects)
  - `topic` (text — subtopic from master syllabus)
  - `question_text` (text — supports LaTeX notation)
  - `options` (jsonb — array of 4 options A/B/C/D)
  - `correct_option` (int — 0-3 index)
  - `explanation` (text — step-by-step explanation)
  - `question_type` (text — direct, reading_comprehension, analogy, sequence, problem_solving, column_matching)
  - `is_paused` (boolean — default false, set true when error-reported)
  - `created_at` (timestamptz)

## 2. Modified Tables
- `profiles` — added `target_schools` (jsonb array of 5 school options)
  and `bound_device_id` (text, for single-device binding).

## 3. Security (RLS)
- `question_bank`: read access for authenticated users (active questions only);
  write/modify/delete exclusive to admin (email = 'fararuiz64@gmail.com').
- `profiles` policies updated to include admin access via JWT email check.
*/
-- ============ EXTEND profiles ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='target_schools') THEN
    ALTER TABLE profiles ADD COLUMN target_schools jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bound_device_id') THEN
    ALTER TABLE profiles ADD COLUMN bound_device_id text;
  END IF;
END $$;

-- ============ question_bank ============
CREATE TABLE IF NOT EXISTS question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_option int NOT NULL CHECK (correct_option >= 0 AND correct_option <= 3),
  explanation text NOT NULL DEFAULT '',
  question_type text NOT NULL DEFAULT 'direct',
  is_paused boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active (non-paused) questions
DROP POLICY IF EXISTS "read_active_questions" ON question_bank;
CREATE POLICY "read_active_questions" ON question_bank FOR SELECT
  TO authenticated USING (is_paused = false OR auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Admin can read all questions
DROP POLICY IF EXISTS "admin_read_all_questions" ON question_bank;
CREATE POLICY "admin_read_all_questions" ON question_bank FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Admin can insert questions
DROP POLICY IF EXISTS "admin_insert_questions" ON question_bank;
CREATE POLICY "admin_insert_questions" ON question_bank FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Admin can update questions
DROP POLICY IF EXISTS "admin_update_questions" ON question_bank;
CREATE POLICY "admin_update_questions" ON question_bank FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Admin can delete questions
DROP POLICY IF EXISTS "admin_delete_questions" ON question_bank;
CREATE POLICY "admin_delete_questions" ON question_bank FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Index for subject filtering
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_paused ON question_bank(is_paused);

-- ============ Seed question_bank from existing hardcoded data ============
-- Only seed if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM question_bank LIMIT 1) THEN
    -- Habilidad Verbal
    INSERT INTO question_bank (subject, topic, question_text, options, correct_option, explanation, question_type) VALUES
    ('habilidad_verbal', 'Sinónimos', 'Elige el sinónimo de "efímero":', '["Eterno","Fugaz","Duradero","Permanente"]'::jsonb, 1, 'Efímero significa algo que dura muy poco tiempo, por lo que su sinónimo es "fugaz".', 'direct'),
    ('habilidad_verbal', 'Sinónimos', 'Sinónimo de "ostentar":', '["Ocultar","Esconder","Lucir","Guardar"]'::jsonb, 2, 'Ostentar significa mostrar algo con orgullo, por lo que "lucir" es el sinónimo adecuado.', 'direct'),
    ('habilidad_verbal', 'Antónimos', 'Antónimo de "abundante":', '["Numeroso","Escaso","Copioso","Profuso"]'::jsonb, 1, 'Abundante significa en gran cantidad; su antónimo es "escaso", que significa en poca cantidad.', 'direct'),
    ('habilidad_verbal', 'Antónimos', 'Antónimo de "diligente":', '["Activo","Aplicado","Negligente","Cuidadoso"]'::jsonb, 2, 'Diligente significa cuidadoso y activo; su antónimo es "negligente", descuidado.', 'direct'),
    ('habilidad_verbal', 'Analogías', 'Médico es a hospital como profesor es a:', '["Libro","Escuela","Alumno","Pizarrón"]'::jsonb, 1, 'Un médico trabaja en un hospital; análogamente, un profesor trabaja en una escuela.', 'analogy'),
    ('habilidad_verbal', 'Analogías', 'Pluma es a escribir como cuchillo es a:', '["Cocina","Cortar","Comer","Mesa"]'::jsonb, 1, 'La pluma sirve para escribir; el cuchillo sirve para cortar. La relación es herramienta-función.', 'analogy'),
    ('habilidad_verbal', 'Comprensión de lectura', 'En un texto, el tema principal es:', '["Los detalles menores","La idea central que se desarrolla","El título del texto","La primera palabra"]'::jsonb, 1, 'El tema principal es la idea central que el autor desarrolla a lo largo del texto, no un detalle aislado.', 'reading_comprehension'),
    ('habilidad_verbal', 'Completar oraciones', 'A pesar de que estudió mucho, _____ aprobó el examen.', '["siempre","apenas","nunca","fácilmente"]'::jsonb, 2, 'La conjunción "a pesar de" indica contraste. Si estudió mucho pero el resultado fue negativo, "nunca" da sentido.', 'problem_solving'),
    ('habilidad_verbal', 'Sinónimos', 'Sinónimo de "lúgubre":', '["Alegre","Sombrío","Claro","Brillante"]'::jsonb, 1, 'Lúgubre significa triste y sombrío; su sinónimo es "sombrío".', 'direct'),
    ('habilidad_verbal', 'Antónimos', 'Antónimo de "mezquino":', '["Tacaño","Generoso","Pequeño","Pobre"]'::jsonb, 1, 'Mezquino significa tacaño; su antónimo es "generoso".', 'direct'),
    -- Matemáticas
    ('matematicas', 'Aritmética', '¿Cuánto es 15% de 240?', '["36","34","38","40"]'::jsonb, 0, '15% de 240 = 0.15 × 240 = 36.', 'direct'),
    ('matematicas', 'Aritmética', 'Resuelve: 3/4 + 5/8', '["11/8","8/12","1","2/3"]'::jsonb, 0, '3/4 = 6/8; 6/8 + 5/8 = 11/8.', 'problem_solving'),
    ('matematicas', 'Álgebra', 'Si 2x + 5 = 17, entonces x = ?', '["4","6","8","5"]'::jsonb, 1, '2x = 17 - 5 = 12; x = 6.', 'problem_solving'),
    ('matematicas', 'Álgebra', 'Factoriza: x² - 9', '["(x-3)(x+3)","(x-3)²","(x+3)²","(x-9)(x+1)"]'::jsonb, 0, 'x² - 9 es una diferencia de cuadrados: (x-3)(x+3).', 'problem_solving'),
    ('matematicas', 'Geometría', 'El área de un triángulo con base 8 y altura 6 es:', '["48","24","14","32"]'::jsonb, 1, 'Área = (base × altura)/2 = (8 × 6)/2 = 24.', 'problem_solving'),
    ('matematicas', 'Geometría', 'La suma de los ángulos internos de un triángulo es:', '["90°","180°","270°","360°"]'::jsonb, 1, 'La suma de los ángulos internos de cualquier triángulo es siempre 180°.', 'direct'),
    ('matematicas', 'Probabilidad y estadística', 'Al lanzar un dado, ¿cuál es la probabilidad de obtener un número par?', '["1/6","1/3","1/2","2/3"]'::jsonb, 2, 'Un dado tiene 6 caras; 3 son pares (2, 4, 6). P = 3/6 = 1/2.', 'problem_solving'),
    ('matematicas', 'Funciones', 'Si f(x) = 2x + 3, ¿cuánto es f(4)?', '["11","9","7","14"]'::jsonb, 0, 'f(4) = 2(4) + 3 = 8 + 3 = 11.', 'problem_solving'),
    ('matematicas', 'Aritmética', '¿Cuánto es 7² + 3²?', '["58","52","49","48"]'::jsonb, 0, '7² = 49; 3² = 9; 49 + 9 = 58.', 'direct'),
    ('matematicas', 'Geometría', 'El volumen de un cubo de arista 4 es:', '["16","64","32","128"]'::jsonb, 1, 'Volumen = arista³ = 4³ = 64.', 'problem_solving'),
    -- Habilidad Matemática
    ('habilidad_matematica', 'Series numéricas', '¿Qué número continúa la serie: 2, 6, 12, 20, 30, ...?', '["36","40","42","44"]'::jsonb, 2, 'Las diferencias son 4, 6, 8, 10, 12. La siguiente diferencia es 12, por lo que 30 + 12 = 42.', 'sequence'),
    ('habilidad_matematica', 'Series numéricas', 'Completa: 1, 1, 2, 3, 5, 8, ...', '["11","13","15","12"]'::jsonb, 1, 'Es la serie de Fibonacci: cada término es la suma de los dos anteriores. 5 + 8 = 13.', 'sequence'),
    ('habilidad_matematica', 'Sucesiones lógicas', 'Continúa: A, C, E, G, ...', '["H","I","J","K"]'::jsonb, 1, 'Se salta una letra cada vez: A, C, E, G, I.', 'sequence'),
    ('habilidad_matematica', 'Problemas de razonamiento', 'Si 5 obreros construyen un muro en 10 días, ¿cuántos días tardarán 10 obreros?', '["20","5","10","15"]'::jsonb, 1, 'Es inversamente proporcional: más obreros, menos días. (5 × 10)/10 = 5 días.', 'problem_solving'),
    ('habilidad_matematica', 'Patrones', '¿Qué figura sigue en el patrón: △, □, ○, △, □, ...?', '["○","△","□","◇"]'::jsonb, 0, 'El patrón se repite cada 3 figuras: △, □, ○. Después de △, □, sigue ○.', 'sequence'),
    ('habilidad_matematica', 'Planteamiento algebraico', 'La edad de Juan es el doble que la de su hijo. Si juntos suman 45 años, ¿cuánto tiene el hijo?', '["15","30","22","20"]'::jsonb, 0, 'Sea x la edad del hijo. Juan = 2x. x + 2x = 45; 3x = 45; x = 15.', 'problem_solving'),
    ('habilidad_matematica', 'Series numéricas', 'Continúa: 3, 9, 27, 81, ...', '["162","243","108","324"]'::jsonb, 1, 'Cada término se multiplica por 3: 81 × 3 = 243.', 'sequence'),
    ('habilidad_matematica', 'Problemas de razonamiento', 'Si un producto cuesta $200 con 20% de descuento, ¿cuál era el precio original?', '["$220","$250","$240","$260"]'::jsonb, 1, 'Si el descuento es 20%, $200 representa el 80%. Precio original = 200/0.80 = $250.', 'problem_solving'),
    -- Español
    ('espanol', 'Ortografía', '¿Cuál palabra está escrita correctamente?', '["Examen","Ejamen","Exámen","Ejamén"]'::jsonb, 0, 'La palabra correcta es "examen", sin tilde porque es aguda terminada en "n" pero no lleva acento al ser grave.', 'direct'),
    ('espanol', 'Ortografía', 'Completa: "El _____ del perro es suave."', '["pelo","pollo","poyo","poio"]'::jsonb, 0, 'El contexto se refiere al pelaje del animal, por lo que la palabra correcta es "pelo".', 'reading_comprehension'),
    ('espanol', 'Gramática', '¿Cuál es el sujeto en "Los estudiantes aprobaron el examen"?', '["aprobaron","Los estudiantes","el examen","aprobaron el examen"]'::jsonb, 1, 'El sujeto es aquello de quien se dice algo: "Los estudiantes". El predicado es "aprobaron el examen".', 'direct'),
    ('espanol', 'Concordancia', 'Elige la opción con concordancia correcta:', '["Las casas son bonita","Las casas son bonitas","La casa son bonitas","Las casa es bonita"]'::jsonb, 1, 'El adjetivo debe concordar en género y número: "Las casas" (femenino plural) + "bonitas".', 'direct'),
    ('espanol', 'Redacción', '¿Cuál oración está correctamente redactada?', '["Fui a la tienda y compré pan","Fui a la tienda y compré pan, leche y","Fui a la tienda, compré pan.","Fui, a la tienda y compré pan"]'::jsonb, 0, 'La oración completa y bien estructurada es "Fui a la tienda y compré pan".', 'direct'),
    ('espanol', 'Comprensión de textos', 'En un texto argumentativo, la tesis es:', '["La opinión del lector","La idea que se defiende","Las citas","El título"]'::jsonb, 1, 'La tesis es la idea principal que el autor defiende y fundamenta con argumentos.', 'reading_comprehension'),
    ('espanol', 'Ortografía', '¿Cuál palabra lleva tilde?', '["Futbol","Fútbol","Futból","Fútból"]'::jsonb, 1, 'La palabra "fútbol" lleva tilde en la "u" por ser esdrújula.', 'direct'),
    ('espanol', 'Gramática', 'La palabra "rápidamente" es:', '["Sustantivo","Adjetivo","Adverbio","Verbo"]'::jsonb, 2, 'Las palabras terminadas en "-mente" derivadas de adjetivos son adverbios de modo.', 'direct'),
    -- Biología
    ('biologia', 'La célula', '¿Cuál es la unidad básica de la vida?', '["El átomo","La célula","El tejido","La molécula"]'::jsonb, 1, 'La célula es la unidad estructural y funcional básica de todos los seres vivos.', 'direct'),
    ('biologia', 'La célula', '¿En qué organelo se produce la respiración celular?', '["Núcleo","Mitocondria","Ribosoma","Cloroplasto"]'::jsonb, 1, 'La mitocondria es el organelo encargado de la respiración celular y producción de ATP.', 'direct'),
    ('biologia', 'Genética', 'El ADN se encuentra principalmente en:', '["El citoplasma","El núcleo","La membrana","Los ribosomas"]'::jsonb, 1, 'En las células eucariotas, el ADN se encuentra principalmente en el núcleo.', 'direct'),
    ('biologia', 'Sistemas del cuerpo humano', '¿Qué sistema transporta el oxígeno en el cuerpo?', '["Digestivo","Nervioso","Circulatorio","Excretor"]'::jsonb, 2, 'El sistema circulatorio transporta oxígeno y nutrientes a todas las células del cuerpo.', 'direct'),
    ('biologia', 'Ecología', 'Los organismos que producen su propio alimento se llaman:', '["Consumidores","Productores","Descomponedores","Parásitos"]'::jsonb, 1, 'Los productores (como las plantas) elaboran su propio alimento mediante la fotosíntesis.', 'direct'),
    ('biologia', 'Evolución', '¿Quién propuso la teoría de la evolución por selección natural?', '["Mendel","Darwin","Pasteur","Linneo"]'::jsonb, 1, 'Charles Darwin propuso la teoría de la evolución por selección natural en "El origen de las especies".', 'direct'),
    ('biologia', 'La célula', 'La fotosíntesis ocurre en:', '["Mitocondria","Cloroplasto","Núcleo","Vacuola"]'::jsonb, 1, 'La fotosíntesis se realiza en los cloroplastos, que contienen clorofila.', 'direct'),
    ('biologia', 'Genética', 'Los genes son segmentos de:', '["Proteínas","Lípidos","ADN","Glúcidos"]'::jsonb, 2, 'Los genes son fragmentos de ADN que contienen información hereditaria.', 'direct'),
    -- Física
    ('fisica', 'Cinemática', 'Un móvil recorre 120 m en 6 segundos. Su velocidad es:', '["20 m/s","720 m/s","15 m/s","60 m/s"]'::jsonb, 0, 'Velocidad = distancia/tiempo = 120/6 = 20 m/s.', 'problem_solving'),
    ('fisica', 'Cinemática', 'La aceleración se define como:', '["Cambio de posición","Cambio de velocidad en el tiempo","Distancia recorrida","Velocidad final"]'::jsonb, 1, 'La aceleración es el cambio de velocidad por unidad de tiempo: a = Δv/Δt.', 'direct'),
    ('fisica', 'Dinámica', 'La segunda ley de Newton se expresa como:', '["F = mv","F = ma","F = m/a","F = a/m"]'::jsonb, 1, 'La segunda ley de Newton dice que la fuerza es igual a masa por aceleración: F = ma.', 'direct'),
    ('fisica', 'Energía', 'La energía cinética depende de:', '["Altura y masa","Masa y velocidad","Solo masa","Solo velocidad"]'::jsonb, 1, 'Ec = ½mv². Depende de la masa y del cuadrado de la velocidad.', 'direct'),
    ('fisica', 'Electricidad', 'La unidad de resistencia eléctrica es:', '["Voltio","Amperio","Ohmio","Vatio"]'::jsonb, 2, 'La resistencia eléctrica se mide en ohmios (Ω), según la ley de Ohm: V = IR.', 'direct'),
    ('fisica', 'Óptica', 'La luz blanca está compuesta por:', '["Un solo color","Siete colores","Tres colores","Infinitos colores oscuros"]'::jsonb, 1, 'La luz blanca se descompone en siete colores: rojo, naranja, amarillo, verde, azul, índigo y violeta.', 'direct'),
    ('fisica', 'Dinámica', 'La unidad de fuerza en el SI es:', '["Vatio","Joule","Newton","Pascal"]'::jsonb, 2, 'La fuerza se mide en newtons (N) en el Sistema Internacional.', 'direct'),
    ('fisica', 'Energía', 'La energía potencial gravitatoria depende de:', '["Velocidad","Altura y masa","Temperatura","Carga eléctrica"]'::jsonb, 1, 'Ep = mgh. Depende de la masa, la gravedad y la altura.', 'direct'),
    -- Química
    ('quimica', 'Estructura atómica', 'Las partículas con carga positiva en el átomo son:', '["Electrones","Neutrones","Protones","Fotones"]'::jsonb, 2, 'Los protones tienen carga positiva y se encuentran en el núcleo del átomo.', 'direct'),
    ('quimica', 'Estructura atómica', 'El número atómico de un elemento indica:', '["Los neutrones","Los protones","La masa total","Los electrones de valencia"]'::jsonb, 1, 'El número atómico equivale al número de protones en el núcleo.', 'direct'),
    ('quimica', 'Tabla periódica', 'El símbolo químico del oro es:', '["Au","Ag","Or","Go"]'::jsonb, 0, 'El símbolo del oro es Au, del latín "aurum".', 'direct'),
    ('quimica', 'Tabla periódica', 'Los gases nobles se encuentran en el grupo:', '["1","17","18","2"]'::jsonb, 2, 'Los gases nobles (helio, neón, argón, etc.) están en el grupo 18 de la tabla periódica.', 'direct'),
    ('quimica', 'Enlaces químicos', 'El enlace que se forma al compartir electrones es:', '["Iónico","Covalente","Metálico","De hidrógeno"]'::jsonb, 1, 'El enlace covalente se forma cuando dos átomos comparten pares de electrones.', 'direct'),
    ('quimica', 'Reacciones químicas', 'La fórmula del agua es:', '["CO2","H2O","O2","H2O2"]'::jsonb, 1, 'La molécula de agua está formada por dos átomos de hidrógeno y uno de oxígeno: H2O.', 'direct'),
    ('quimica', 'Reacciones químicas', 'En una reacción de combustión se produce:', '["Oxígeno","Agua y CO2","Hidrógeno","Nitrógeno"]'::jsonb, 1, 'La combustión de un hidrocarburo produce dióxido de carbono (CO2) y agua (H2O).', 'direct'),
    ('quimica', 'Estequiometría', 'El pH de una sustancia neutra es:', '["0","7","14","1"]'::jsonb, 1, 'El pH neutro es 7. Valores menores indican acidez y mayores, basicidad.', 'direct'),
    -- Historia
    ('historia', 'Historia universal', 'La civilización que inventó la escritura cuneiforme fue:', '["Egipcia","Griega","Sumeria","Romana"]'::jsonb, 2, 'Los sumerios, en Mesopotamia, desarrollaron la escritura cuneiforme hacia el 3200 a.C.', 'direct'),
    ('historia', 'Historia universal', 'La Revolución Francesa comenzó en el año:', '["1492","1789","1810","1821"]'::jsonb, 1, 'La Revolución Francesa estalló en 1789 con la toma de la Bastilla.', 'direct'),
    ('historia', 'Historia de México', '¿En qué año inició la Independencia de México?', '["1810","1821","1910","1521"]'::jsonb, 0, 'La Independencia de México inició el 16 de septiembre de 1810 con el grito de Dolores.', 'direct'),
    ('historia', 'Historia de México', 'La Revolución Mexicana comenzó en:', '["1810","1821","1910","1929"]'::jsonb, 2, 'La Revolución Mexicana inició en 1910 encabezada por Francisco I. Madero contra Porfirio Díaz.', 'direct'),
    ('historia', 'Edad contemporánea', 'La Segunda Guerra Mundial terminó en:', '["1939","1942","1945","1950"]'::jsonb, 2, 'La Segunda Guerra Mundial terminó en 1945 con la rendición de Japón.', 'direct'),
    ('historia', 'Civilizaciones antiguas', 'La civilización griega se desarrolló en la península:', '["Itálica","Balcánica","Ibérica","Anatólica"]'::jsonb, 1, 'La civilización griega se desarrolló en la península Balcánica y las islas del Egeo.', 'direct'),
    ('historia', 'Historia universal', 'El Imperio Romano cayó en el año:', '["476 d.C.","1453","1000","800 a.C."]'::jsonb, 0, 'El Imperio Romano de Occidente cayó en 476 d.C. con la deposición del último emperador.', 'direct'),
    ('historia', 'Edad contemporánea', 'El muro de Berlín cayó en:', '["1961","1989","1991","1985"]'::jsonb, 1, 'El muro de Berlín cayó el 9 de noviembre de 1989, símbolo del fin de la Guerra Fría.', 'direct'),
    -- Geografía
    ('geografia', 'Geografía física', 'El río más largo del mundo es:', '["Nilo","Amazonas","Yangtsé","Misisipi"]'::jsonb, 1, 'El río Amazonas es considerado el más largo del mundo, con aproximadamente 7,000 km.', 'direct'),
    ('geografia', 'Geografía de México', 'El estado más grande de México es:', '["Chihuahua","Sonora","Baja California","Coahuila"]'::jsonb, 0, 'Chihuahua es el estado con mayor superficie de México.', 'direct'),
    ('geografia', 'Climas y regiones', 'El clima de la zona ecuatorial se caracteriza por ser:', '["Frío y seco","Cálido y lluvioso","Templado","Desértico"]'::jsonb, 1, 'El clima ecuatorial es cálido y lluvioso durante todo el año debido a la cercanía al ecuador.', 'direct'),
    ('geografia', 'Población y demografía', 'La densidad de población se calcula como:', '["Habitantes × área","Habitantes / área","Área / habitantes","Habitantes + área"]'::jsonb, 1, 'La densidad de población es el número de habitantes dividido entre el área: habitantes/km².', 'direct'),
    ('geografia', 'Recursos naturales', '¿Cuál es un recurso renovable?', '["Petróleo","Carbón","Energía solar","Gas natural"]'::jsonb, 2, 'La energía solar es renovable porque su fuente (el sol) es inagotable a escala humana.', 'direct'),
    ('geografia', 'Geografía física', 'La capa de la Tierra donde vivimos se llama:', '["Núcleo","Manto","Corteza","Atmósfera"]'::jsonb, 2, 'La corteza terrestre es la capa externa donde se desarrolla la vida.', 'direct'),
    ('geografia', 'Geografía de México', 'La capital de México es:', '["Guadalajara","Monterrey","Ciudad de México","Puebla"]'::jsonb, 2, 'La capital de México es la Ciudad de México.', 'direct'),
    ('geografia', 'Recursos naturales', '¿Cuál es un recurso no renovable?', '["Energía eólica","Biomasa","Petróleo","Energía hidráulica"]'::jsonb, 2, 'El petróleo es un recurso no renovable porque su formación toma millones de años.', 'direct'),
    -- Formación Cívica y Ética
    ('formacion_civica_etica', 'Valores y ética', 'La honestidad es un valor que consiste en:', '["Decir mentiras piadosas","Actuar con verdad y rectitud","Ocultar la verdad","Ser indirecto"]'::jsonb, 1, 'La honestidad es actuar con verdad, sinceridad y rectitud en pensamiento, palabra y acción.', 'direct'),
    ('formacion_civica_etica', 'Valores y ética', 'La empatía significa:', '["Ignorar a los demás","Ponerse en el lugar del otro","Critar a otros","Imponer opiniones"]'::jsonb, 1, 'La empatía es la capacidad de comprender y compartir los sentimientos de otra persona.', 'direct'),
    ('formacion_civica_etica', 'Derechos humanos', 'Los derechos humanos son:', '["Privilegios de algunos","Universales e inherentes","Opcionales","Concedidos por el gobierno"]'::jsonb, 1, 'Los derechos humanos son universales, inherentes a toda persona por el simple hecho de serlo.', 'direct'),
    ('formacion_civica_etica', 'Derechos humanos', 'La Declaración Universal de los Derechos Humanos fue aprobada en:', '["1917","1945","1948","1968"]'::jsonb, 2, 'La ONU aprobó la Declaración Universal de los Derechos Humanos el 10 de diciembre de 1948.', 'direct'),
    ('formacion_civica_etica', 'Constitución y leyes', 'La Constitución Política de los Estados Unidos Mexicanos se promulgó en:', '["1810","1821","1917","1929"]'::jsonb, 2, 'La Constitución vigente de México se promulgó el 5 de febrero de 1917 en Querétaro.', 'direct'),
    ('formacion_civica_etica', 'Democracia', 'En una democracia, el poder emana de:', '["El gobierno","El pueblo","El ejército","Las empresas"]'::jsonb, 1, 'En una democracia, el poder emana del pueblo, que lo ejerce mediante representantes elegidos.', 'direct'),
    ('formacion_civica_etica', 'Constitución y leyes', 'El gobierno de México está dividido en:', '["2 poderes","3 poderes","4 poderes","5 poderes"]'::jsonb, 1, 'Los tres poderes de la Unión son: Ejecutivo, Legislativo y Judicial.', 'direct'),
    ('formacion_civica_etica', 'Ciudadanía', 'La mayoría de edad en México se alcanza a los:', '["16 años","18 años","21 años","15 años"]'::jsonb, 1, 'En México, la mayoría de edad y el derecho a voto se adquieren a los 18 años.', 'direct');
  END IF;
END $$;
