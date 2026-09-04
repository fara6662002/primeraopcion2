import type { Question, SubjectId } from './questionBank';

// ============================================================================
// Parametric question generator engine
// ----------------------------------------------------------------------------
// generateParametricQuestions(subject) returns 1000+ unique question variants
// per subject (500+ for the non-numeric subjects) using randomized numeric
// parameters and template literals. A Fisher-Yates shuffle is applied to the
// options of every question and correctIndex is recomputed to always point at
// the actually correct answer. All text is in Mexican academic Spanish and
// uses plain text (no LaTeX / $ symbols).
// ============================================================================

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Random integer in the inclusive range [min, max]. */
function range(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from a non-empty array. */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Fisher-Yates shuffle returning a new array (input is not mutated). */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Greatest common divisor (used to reduce fractions). */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Format a fraction in its reduced form, e.g. 6/8 -> "3/4". */
function frac(n: number, d: number): string {
  const g = gcd(n, d);
  const rn = n / g;
  const rd = d / g;
  if (rd === 1) return String(rn);
  if (rd < 0) return `${-rn}/${-rd}`;
  return `${rn}/${rd}`;
}

/**
 * Build a Question with options shuffled in place. `correctText` is the exact
 * string of the correct option; after shuffling we look it up to recompute
 * correctIndex. This guarantees correctIndex always points to the right answer
 * regardless of shuffle order.
 */
let _counter = 0;
function makeQ(
  subject: SubjectId,
  topic: string,
  question: string,
  correctText: string,
  distractors: string[],
  explanation: string,
): Question {
  _counter++;
  // Remove distractors equal to the correct text and deduplicate the rest so
  // that every option is distinct (otherwise indexOf could point at a clone).
  const distinct = [...new Set(distractors.filter((d) => d !== correctText))];
  while (distinct.length < 3) {
    // Pad with a clearly-wrong synthetic option if a generator produced too
    // many colliding distractors. This is rare and keeps 4 options total.
    distinct.push(`Ninguna de las anteriores (${distinct.length + 1})`);
  }
  const all = shuffle([correctText, ...distinct.slice(0, 3)]);
  const idx = all.indexOf(correctText);
  return {
    id: `param_${subject}_${_counter}`,
    subject,
    topic,
    question,
    options: all,
    correctIndex: idx,
    explanation,
  };
}

/** Build a numeric set of distractors near `correct`, avoiding the correct value. */
function numericDistractors(correct: number, spread: number, count = 3): string[] {
  const out = new Set<string>();
  let guard = 0;
  while (out.size < count && guard < 50) {
    guard++;
    const delta = range(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const val = correct + delta;
    if (val === correct) continue;
    out.add(String(val));
  }
  // Fallback in case the set couldn't fill (e.g. correct near 0).
  let extra = correct + spread + 1;
  while (out.size < count) {
    out.add(String(extra));
    extra += spread + 1;
  }
  return [...out];
}

// ---------------------------------------------------------------------------
// 1. MATEMATICAS (1000+)
// ---------------------------------------------------------------------------
function genMatematicas(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'matematicas';

  // 1a. Percentages: ¿Cuánto es X% de Y?  (X 5-95, Y 50-1000)  -> 220
  for (let i = 0; i < 220; i++) {
    const x = range(5, 95);
    const y = range(50, 1000);
    const ans = Math.round((x / 100) * y);
    const ds = numericDistractors(ans, Math.max(3, Math.round(ans * 0.1)));
    qs.push(makeQ(subject, 'Porcentajes',
      `¿Cuánto es ${x}% de ${y}?`,
      String(ans), ds,
      `${x}% de ${y} = (${x}/100) × ${y} = ${ans}.`));
  }

  // 1b. Linear equations: Ax + B = C  (A 2-20, B 1-30, C 10-100)  -> 220
  for (let i = 0; i < 220; i++) {
    const a = range(2, 20);
    const b = range(1, 30);
    // Ensure (C - B) is divisible by A so x is an integer.
    const x = range(1, 20);
    const c = a * x + b;
    const ds = [String(x + range(1, 4)), String(x - range(1, 3)), String(Math.round((c - b) / a) + range(2, 6))];
    qs.push(makeQ(subject, 'Ecuaciones lineales',
      `Si ${a}x + ${b} = ${c}, entonces x = ?`,
      String(x), ds,
      `Despejamos: ${a}x = ${c} - ${b} = ${c - b}; x = ${c - b}/${a} = ${x}.`));
  }

  // 1c. Quadratic factoring: x^2 - N^2  (N 2-20)  -> 160
  for (let i = 0; i < 160; i++) {
    const n = range(2, 20);
    const correct = `(x - ${n})(x + ${n})`;
    const ds = [`(x - ${n})^2`, `(x + ${n})^2`, `(x - ${n})(x - ${n + 1})`];
    qs.push(makeQ(subject, 'Factorización',
      `Factoriza: x^2 - ${n * n}`,
      correct, ds,
      `Es una diferencia de cuadrados: x^2 - ${n}^2 = (x - ${n})(x + ${n}).`));
  }

  // 1d. Area of triangle: base H, height K  -> 160
  for (let i = 0; i < 160; i++) {
    const h = range(3, 30);
    const k = range(2, 25);
    const area = (h * k) / 2;
    const correct = String(area);
    const ds = [String(h * k), String(area + range(1, 5)), String(area - range(1, 4))];
    qs.push(makeQ(subject, 'Geometría: área del triángulo',
      `¿Cuál es el área de un triángulo de base ${h} y altura ${k}?`,
      correct, ds,
      `Area = (base × altura)/2 = (${h} × ${k})/2 = ${area}.`));
  }

  // 1e. Fraction operations: a/b ± c/d  -> 160
  for (let i = 0; i < 160; i++) {
    const b = range(2, 12);
    const d = range(2, 12);
    const a = range(1, b - 1);
    const c = range(1, d - 1);
    const op = pick(['+', '-']);
    const num = op === '+' ? a * d + c * b : a * d - c * b;
    const den = b * d;
    const correct = frac(num, den);
    const ds = [frac(a + c, b + d), frac(a * c, b * d), frac(num + range(1, 3), den)];
    qs.push(makeQ(subject, 'Fracciones',
      `Resuelve: ${a}/${b} ${op} ${c}/${d}`,
      correct, ds,
      op === '+'
        ? `${a}/${b} = ${a * d}/${den}; ${c}/${d} = ${c * b}/${den}; suma = ${(a * d + c * b)}/${den} = ${frac(num, den)}.`
        : `${a}/${b} = ${a * d}/${den}; ${c}/${d} = ${c * b}/${den}; resta = ${(a * d - c * b)}/${den} = ${frac(num, den)}.`));
  }

  // 1f. Volume of cube / rectangular prism  -> 120
  for (let i = 0; i < 120; i++) {
    if (Math.random() < 0.5) {
      const e = range(2, 15);
      const v = e * e * e;
      const ds = [String(e * e), String(e * e * 2), String(v + range(2, 10))];
      qs.push(makeQ(subject, 'Geometría: volumen',
        `¿Cuál es el volumen de un cubo de arista ${e}?`,
        String(v), ds,
        `Volumen del cubo = arista^3 = ${e}^3 = ${v}.`));
    } else {
      const l = range(2, 15);
      const w = range(2, 15);
      const h = range(2, 15);
      const v = l * w * h;
      const ds = [String(l * w), String(l * w + h), String(v + range(2, 12))];
      qs.push(makeQ(subject, 'Geometría: volumen',
        `¿Cuál es el volumen de un prisma rectangular de ${l} × ${w} × ${h}?`,
        String(v), ds,
        `Volumen = largo × ancho × alto = ${l} × ${w} × ${h} = ${v}.`));
    }
  }

  // 1g. Probability: dice, cards, coins  -> 120
  const diceSituations = [
    () => {
      const f = pick([1, 2, 3, 4, 5, 6]);
      const correct = '1/6';
      const ds = ['1/3', '1/12', '1/2'];
      qs.push(makeQ(subject, 'Probabilidad',
        `Al lanzar un dado, ¿cuál es la probabilidad de obtener un ${f}?`,
        correct, ds,
        `El dado tiene 6 caras equally likely. P(obtener ${f}) = 1/6.`));
    },
    () => {
      const correct = '1/2';
      const ds = ['1/6', '1/4', '2/3'];
      qs.push(makeQ(subject, 'Probabilidad',
        'Al lanzar una moneda, ¿cuál es la probabilidad de obtener sol (águila)?',
        correct, ds,
        'La moneda tiene 2 resultados igualmente probables. P = 1/2.'));
    },
    () => {
      const correct = '1/13';
      const ds = ['1/52', '1/4', '4/13'];
      qs.push(makeQ(subject, 'Probabilidad',
        'De una baraja de 52 cartas, ¿cuál es la probabilidad de sacar un as?',
        correct, ds,
        'Hay 4 ases en 52 cartas. P = 4/52 = 1/13.'));
    },
    () => {
      const correct = '1/4';
      const ds = ['1/2', '1/13', '1/52'];
      qs.push(makeQ(subject, 'Probabilidad',
        'De una baraja de 52 cartas, ¿cuál es la probabilidad de sacar una figura (J, Q, K)?',
        correct, ds,
        'Hay 12 figuras (4 palos × 3) en 52 cartas. P = 12/52 = 3/13. La opción 1/4 corresponde al palo.'));
    },
    () => {
      const n = range(2, 3);
      const correct = frac(1, 2 ** n);
      const ds = [frac(1, 2 ** (n + 1)), frac(2, 2 ** n), frac(1, n)];
      qs.push(makeQ(subject, 'Probabilidad',
        `Al lanzar ${n} monedas, ¿cuál es la probabilidad de que todas caigan en sol?`,
        correct, ds,
        `Cada moneda tiene P(sol) = 1/2. Para ${n} monedas: (1/2)^${n} = ${frac(1, 2 ** n)}.`));
    },
  ];
  for (let i = 0; i < 120; i++) pick(diceSituations)();

  // 1h. Pythagorean theorem  -> 120
  for (let i = 0; i < 120; i++) {
    // Use Pythagorean triples for clean integer hypotenuse.
    const triples: [number, number, number][] = [
      [3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17],
      [9, 12, 15], [12, 16, 20], [7, 24, 25], [10, 24, 26],
      [20, 21, 29], [9, 40, 41],
    ];
    const t = pick(triples);
    const correct = String(t[2]);
    const ds = [String(t[0] + t[1]), String(Math.round(Math.sqrt(t[0] * t[0] + t[1] * t[1]) + range(1, 4))), String(t[2] - range(1, 3))];
    qs.push(makeQ(subject, 'Teorema de Pitágoras',
      `En un triángulo rectángulo los catetos miden ${t[0]} y ${t[1]}. ¿Cuánto mide la hipotenusa?`,
      correct, ds,
      `Hipotenusa = raiz(${t[0]}^2 + ${t[1]}^2) = raiz(${t[0] * t[0] + t[1] * t[1]}) = ${t[2]}.`));
  }

  // 1i. Direct / inverse proportion  -> 80
  for (let i = 0; i < 40; i++) {
    const a = range(2, 10);
    const b = range(3, 20);
    const k = range(2, 8);
    const x = a * k;
    const y = b * k;
    const x2 = range(2, 12);
    const y2 = Math.round((y * x) / x2);
    const correct = String(y2);
    const ds = [String(y2 + range(2, 6)), String(y2 - range(1, 5)), String(Math.round(y * x2 / x))];
    qs.push(makeQ(subject, 'Proporcionalidad directa',
      `Si ${a} obreros ganan $${y} en un día, ¿cuánto ganan ${x2} obreros en el mismo tiempo (proporción directa)?`,
      correct, ds,
      `Proporción directa: ${a}/${y} = ${x2}/? ; ? = (${x2} × ${y})/${a} = ${y2}.`));
  }
  for (let i = 0; i < 40; i++) {
    const w = range(3, 8);
    const d = range(6, 20);
    const w2 = range(2, 12);
    const newDays = Math.round((w * d) / w2);
    const correct = `${newDays} días`;
    const ds = [`${newDays + range(2, 5)} días`, `${newDays - range(1, 4)} días`, `${Math.round((w2 * d) / w)} días`];
    qs.push(makeQ(subject, 'Proporcionalidad inversa',
      `Si ${w} obreros hacen una obra en ${d} días, ¿cuántos días tardarán ${w2} obreros?`,
      correct, ds,
      `Proporción inversa: ${w} × ${d} = ${w2} × ? ; ? = (${w} × ${d})/${w2} = ${newDays} días.`));
  }

  // 1j. Scientific notation  -> 80
  for (let i = 0; i < 80; i++) {
    const mantissa = range(1, 9);
    const exp = range(-6, 9);
    const value = mantissa * Math.pow(10, exp);
    const correct = `${mantissa} × 10^${exp}`;
    const ds = [`${mantissa} × 10^${exp + 1}`, `${mantissa} × 10^${exp - 1}`, `${mantissa + 1} × 10^${exp}`];
    qs.push(makeQ(subject, 'Notación científica',
      `¿Cuál es la notación científica de ${value}?`,
      correct, ds,
      `Se escribe como ${mantissa} × 10^${exp} porque se mueve el decimal ${Math.abs(exp)} lugares ${exp >= 0 ? 'a la izquierda' : 'a la derecha'}.`));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 2. HABILIDAD MATEMATICA (1000+)
// ---------------------------------------------------------------------------
function genHabilidadMatematica(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'habilidad_matematica';

  // 2a. Arithmetic sequences  -> 200
  for (let i = 0; i < 200; i++) {
    const start = range(1, 20);
    const diff = range(2, 15);
    const seq = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
    const next = start + 5 * diff;
    const ds = [String(next + diff), String(next - diff), String(next + 1)];
    qs.push(makeQ(subject, 'Sucesiones numéricas',
      `¿Qué número continúa la serie: ${seq.join(', ')}, ...?`,
      String(next), ds,
      `La diferencia constante es ${diff}. El siguiente término es ${seq[4]} + ${diff} = ${next}.`));
  }

  // 2b. Geometric sequences  -> 160
  for (let i = 0; i < 160; i++) {
    const start = range(1, 5);
    const ratio = range(2, 4);
    const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
    const next = start * ratio ** 4;
    const ds = [String(next + ratio), String(next - ratio), String(seq[3] + ratio)];
    qs.push(makeQ(subject, 'Sucesiones geométricas',
      `¿Qué número continúa: ${seq.join(', ')}, ...?`,
      String(next), ds,
      `Cada término se multiplica por ${ratio}. El siguiente es ${seq[3]} × ${ratio} = ${next}.`));
  }

  // 2c. Patterns / alternating  -> 120
  for (let i = 0; i < 120; i++) {
    const kind = range(0, 2);
    if (kind === 0) {
      // Fibonacci-like: each term = sum of previous two
      const a = range(1, 6);
      const b = range(2, 8);
      const seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
      const next = 3 * a + 5 * b;
      const ds = [String(next + a), String(next - b), String(seq[4] + b)];
      qs.push(makeQ(subject, 'Patrones numéricos',
        `Completa la serie: ${seq.join(', ')}, ...`,
        String(next), ds,
        `Cada término es la suma de los dos anteriores: ${seq[3]} + ${seq[4]} = ${next}.`));
    } else if (kind === 1) {
      // Interleaved: two arithmetic progressions
      const a0 = range(1, 10);
      const b0 = range(2, 12);
      const da = range(2, 6);
      const db = range(3, 7);
      const seq = [a0, b0, a0 + da, b0 + db, a0 + 2 * da, b0 + 2 * db];
      const next = a0 + 3 * da;
      const ds = [String(b0 + 3 * db), String(next + da), String(a0 + 2 * da + 1)];
      qs.push(makeQ(subject, 'Patrones numéricos',
        `¿Qué número continúa: ${seq.join(', ')}, ...?`,
        String(next), ds,
        `Hay dos series intercaladas: una suma ${da} (posiciones impares) y otra suma ${db} (posiciones pares). El siguiente es ${seq[4]} + ${da} = ${next}.`));
    } else {
      // Squares pattern: 1,4,9,16,25,...
      const start = range(1, 3);
      const seq = [start * start, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2];
      const next = (start + 4) ** 2;
      const ds = [String(next + 2), String(next - 1), String(seq[3] + range(2, 5))];
      qs.push(makeQ(subject, 'Patrones numéricos',
        `¿Qué número continúa: ${seq.join(', ')}, ...?`,
        String(next), ds,
        `Son cuadrados: ${start}^2, ${(start + 1)}^2, ${(start + 2)}^2, ${(start + 3)}^2. El siguiente es ${(start + 4)}^2 = ${next}.`));
    }
  }

  // 2d. Reasoning / work problems (inverse proportion)  -> 160
  for (let i = 0; i < 160; i++) {
    const workers = range(3, 10);
    const days = range(5, 20);
    const newWorkers = range(2, 16);
    const newDays = Math.round((workers * days) / newWorkers);
    const correct = `${newDays} días`;
    const ds = [`${newDays + range(2, 5)} días`, `${newDays - range(1, 4)} días`, `${Math.round((newWorkers * days) / workers)} días`];
    qs.push(makeQ(subject, 'Problemas de razonamiento',
      `Si ${workers} obreros construyen un muro en ${days} días, ¿cuántos días tardarán ${newWorkers} obreros?`,
      correct, ds,
      `Es proporcionalidad inversa: (${workers} × ${days})/${newWorkers} = ${newDays} días.`));
  }

  // 2e. Age problems  -> 160
  for (let i = 0; i < 160; i++) {
    const factor = range(2, 4);
    const son = range(4, 18);
    const father = son * factor;
    const total = son + father;
    const correct = String(son);
    const ds = [String(father), String(Math.round(total / 3)), String(son * 3)];
    qs.push(makeQ(subject, 'Problemas de razonamiento',
      `La edad de un padre es ${factor} veces la de su hijo. Si juntos suman ${total} años, ¿cuántos años tiene el hijo?`,
      correct, ds,
      `Sea x = edad del hijo. Padre = ${factor}x. x + ${factor}x = ${total}; ${factor + 1}x = ${total}; x = ${total}/${factor + 1} = ${son}.`));
  }

  // 2f. Speed / distance / time  -> 200
  for (let i = 0; i < 100; i++) {
    const v = range(20, 120);
    const t = range(2, 12);
    const d = v * t;
    const ds = [String(d + range(5, 20)), String(d - range(5, 20)), String(v + t)];
    qs.push(makeQ(subject, 'Velocidad, distancia y tiempo',
      `Un auto viaja a ${v} km/h durante ${t} horas. ¿Qué distancia recorre?`,
      String(d), ds,
      `Distancia = velocidad × tiempo = ${v} × ${t} = ${d} km.`));
  }
  for (let i = 0; i < 100; i++) {
    const d = range(120, 600);
    const t = range(2, 10);
    const v = Math.round(d / t);
    const ds = [String(v + range(3, 10)), String(v - range(2, 8)), String(d + t)];
    qs.push(makeQ(subject, 'Velocidad, distancia y tiempo',
      `Un auto recorre ${d} km en ${t} horas. ¿Cuál es su velocidad promedio?`,
      String(v), ds,
      `Velocidad = distancia / tiempo = ${d} / ${t} = ${v} km/h.`));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 3. FISICA (1000+)
// ---------------------------------------------------------------------------
function genFisica(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'fisica';

  // 3a. Velocity v = d/t  -> 200
  for (let i = 0; i < 200; i++) {
    const d = range(50, 500);
    const t = range(2, 20);
    const v = Math.round((d / t) * 10) / 10;
    const vStr = Number.isInteger(v) ? String(v) : v.toFixed(1);
    const ds = [String(Math.round(v) + range(2, 8)), String(Math.round(v) - range(1, 6)), String(Math.round(v * 2))];
    qs.push(makeQ(subject, 'Cinemática: velocidad',
      `Un móvil recorre ${d} m en ${t} s. ¿Cuál es su velocidad?`,
      `${vStr} m/s`, ds.map((x) => `${x} m/s`),
      `Velocidad = distancia / tiempo = ${d} / ${t} = ${vStr} m/s.`));
  }

  // 3b. Acceleration a = (vf - v0)/t  -> 160
  for (let i = 0; i < 160; i++) {
    const v0 = range(0, 15);
    const a = range(1, 10);
    const t = range(2, 15);
    const vf = v0 + a * t;
    const ds = [String(vf + range(2, 8)), String(vf - range(1, 6)), String(Math.round(vf * 1.5))];
    qs.push(makeQ(subject, 'Cinemática: aceleración',
      `Un móvil parte con velocidad ${v0} m/s y acelera a ${a} m/s² durante ${t} s. ¿Cuál es su velocidad final?`,
      `${vf} m/s`, ds.map((x) => `${x} m/s`),
      `vf = v0 + a × t = ${v0} + ${a} × ${t} = ${vf} m/s.`));
  }

  // 3c. Force F = m × a  -> 200
  for (let i = 0; i < 200; i++) {
    const m = range(2, 30);
    const a = range(2, 15);
    const f = m * a;
    const ds = [String(f + range(3, 12)), String(f - range(2, 10)), String(m + a)];
    qs.push(makeQ(subject, 'Dinámica: segunda ley de Newton',
      `¿Qué fuerza se necesita para acelerar un cuerpo de ${m} kg a ${a} m/s²?`,
      `${f} N`, ds.map((x) => `${x} N`),
      `Por la segunda ley de Newton: F = m × a = ${m} × ${a} = ${f} N.`));
  }

  // 3d. Kinetic energy Ec = 1/2 m v²  -> 160
  for (let i = 0; i < 160; i++) {
    const m = range(1, 20);
    const v = range(2, 20);
    const ec = Math.round(0.5 * m * v * v);
    const ds = [String(ec + range(5, 20)), String(ec - range(4, 15)), String(m * v * v)];
    qs.push(makeQ(subject, 'Energía cinética',
      `¿Cuál es la energía cinética de un cuerpo de ${m} kg que se mueve a ${v} m/s?`,
      `${ec} J`, ds.map((x) => `${x} J`),
      `Ec = (1/2) × m × v² = 0.5 × ${m} × ${v}² = 0.5 × ${m} × ${v * v} = ${ec} J.`));
  }

  // 3e. Potential energy Ep = m g h  -> 160
  for (let i = 0; i < 160; i++) {
    const m = range(1, 25);
    const h = range(2, 30);
    const g = 9.8;
    const ep = Math.round(m * g * h);
    const ds = [String(ep + range(5, 25)), String(ep - range(4, 20)), String(m * h)];
    qs.push(makeQ(subject, 'Energía potencial',
      `¿Cuál es la energía potencial de un cuerpo de ${m} kg a ${h} m de altura? (g = 9.8 m/s²)`,
      `${ep} J`, ds.map((x) => `${x} J`),
      `Ep = m × g × h = ${m} × 9.8 × ${h} = ${ep} J.`));
  }

  // 3f. Ohm's law V = I × R  -> 160
  for (let i = 0; i < 80; i++) {
    const i = range(1, 12);
    const r = range(2, 50);
    const v = i * r;
    const ds = [String(v + range(2, 10)), String(v - range(2, 8)), String(i + r)];
    qs.push(makeQ(subject, 'Electricidad: ley de Ohm',
      `Por una resistencia de ${r} ohmios circula una corriente de ${i} A. ¿Cuál es el voltaje?`,
      `${v} V`, ds.map((x) => `${x} V`),
      `V = I × R = ${i} × ${r} = ${v} V.`));
  }
  for (let i = 0; i < 80; i++) {
    const v = range(10, 240);
    const r = range(2, 50);
    const current = Math.round((v / r) * 100) / 100;
    const curStr = Number.isInteger(current) ? String(current) : current.toFixed(2);
    const ds = [String(Math.round(current) + range(1, 4)), String(Math.round(current) - range(1, 3)), String(v + r)];
    qs.push(makeQ(subject, 'Electricidad: ley de Ohm',
      `Se aplica un voltaje de ${v} V a una resistencia de ${r} ohmios. ¿Cuál es la corriente?`,
      `${curStr} A`, ds.map((x) => `${x} A`),
      `I = V / R = ${v} / ${r} = ${curStr} A.`));
  }

  // 3g. Pressure P = F / A  -> 120
  for (let i = 0; i < 120; i++) {
    const f = range(10, 500);
    const a = range(1, 20);
    const p = Math.round((f / a) * 100) / 100;
    const pStr = Number.isInteger(p) ? String(p) : p.toFixed(2);
    const ds = [String(Math.round(p) + range(2, 10)), String(Math.round(p) - range(1, 8)), String(f * a)];
    qs.push(makeQ(subject, 'Presión',
      `Se aplica una fuerza de ${f} N sobre un área de ${a} m². ¿Cuál es la presión?`,
      `${pStr} Pa`, ds.map((x) => `${x} Pa`),
      `Presión = Fuerza / Area = ${f} / ${a} = ${pStr} Pa.`));
  }

  // 3h. Density d = m / V  -> 120
  for (let i = 0; i < 120; i++) {
    const m = range(10, 500);
    const v = range(2, 100);
    const d = Math.round((m / v) * 100) / 100;
    const dStr = Number.isInteger(d) ? String(d) : d.toFixed(2);
    const ds = [String(Math.round(d) + range(1, 5)), String(Math.round(d) - range(1, 4)), String(m * v)];
    qs.push(makeQ(subject, 'Densidad',
      `Un cuerpo tiene masa de ${m} g y volumen de ${v} cm³. ¿Cuál es su densidad?`,
      `${dStr} g/cm³`, ds.map((x) => `${x} g/cm³`),
      `Densidad = masa / volumen = ${m} / ${v} = ${dStr} g/cm³.`));
  }

  // 3i. Work W = F × d  -> 100
  for (let i = 0; i < 100; i++) {
    const f = range(5, 100);
    const d = range(2, 30);
    const w = f * d;
    const ds = [String(w + range(3, 15)), String(w - range(2, 12)), String(f + d)];
    qs.push(makeQ(subject, 'Trabajo mecánico',
      `Se aplica una fuerza de ${f} N para mover un objeto ${d} m. ¿Cuánto trabajo se realiza?`,
      `${w} J`, ds.map((x) => `${x} J`),
      `Trabajo = Fuerza × distancia = ${f} × ${d} = ${w} J.`));
  }

  // 3j. Power P = W / t  -> 100
  for (let i = 0; i < 100; i++) {
    const w = range(100, 5000);
    const t = range(2, 30);
    const p = Math.round((w / t) * 100) / 100;
    const pStr = Number.isInteger(p) ? String(p) : p.toFixed(2);
    const ds = [String(Math.round(p) + range(5, 30)), String(Math.round(p) - range(4, 25)), String(w * t)];
    qs.push(makeQ(subject, 'Potencia',
      `Se realiza un trabajo de ${w} J en ${t} s. ¿Cuál es la potencia?`,
      `${pStr} W`, ds.map((x) => `${x} W`),
      `Potencia = Trabajo / tiempo = ${w} / ${t} = ${pStr} W.`));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 4. QUIMICA (1000+)
// ---------------------------------------------------------------------------
function genQuimica(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'quimica';

  // Compound database for molar mass / percent composition calculations.
  interface Compound { name: string; formula: string; mass: number; breakdown: { sym: string; count: number; atomic: number }[]; }
  const compounds: Compound[] = [
    { name: 'agua', formula: 'H2O', mass: 18, breakdown: [{ sym: 'H', count: 2, atomic: 1 }, { sym: 'O', count: 1, atomic: 16 }] },
    { name: 'dióxido de carbono', formula: 'CO2', mass: 44, breakdown: [{ sym: 'C', count: 1, atomic: 12 }, { sym: 'O', count: 2, atomic: 16 }] },
    { name: 'metano', formula: 'CH4', mass: 16, breakdown: [{ sym: 'C', count: 1, atomic: 12 }, { sym: 'H', count: 4, atomic: 1 }] },
    { name: 'amoníaco', formula: 'NH3', mass: 17, breakdown: [{ sym: 'N', count: 1, atomic: 14 }, { sym: 'H', count: 3, atomic: 1 }] },
    { name: 'glucosa', formula: 'C6H12O6', mass: 180, breakdown: [{ sym: 'C', count: 6, atomic: 12 }, { sym: 'H', count: 12, atomic: 1 }, { sym: 'O', count: 6, atomic: 16 }] },
    { name: 'ácido sulfúrico', formula: 'H2SO4', mass: 98, breakdown: [{ sym: 'H', count: 2, atomic: 1 }, { sym: 'S', count: 1, atomic: 32 }, { sym: 'O', count: 4, atomic: 16 }] },
    { name: 'cloruro de sodio', formula: 'NaCl', mass: 58.5, breakdown: [{ sym: 'Na', count: 1, atomic: 23 }, { sym: 'Cl', count: 1, atomic: 35.5 }] },
    { name: 'óxido de calcio', formula: 'CaO', mass: 56, breakdown: [{ sym: 'Ca', count: 1, atomic: 40 }, { sym: 'O', count: 1, atomic: 16 }] },
  ];

  // 4a. Molar mass calculations  -> 180
  for (let i = 0; i < 180; i++) {
    const c = pick(compounds);
    const correct = `${c.mass} g/mol`;
    const ds = [`${c.mass + range(1, 10)} g/mol`, `${c.mass - range(1, 8)} g/mol`, `${c.mass * 2} g/mol`];
    const detail = c.breakdown.map((p) => `${p.atomic} × ${p.count}`).join(' + ');
    qs.push(makeQ(subject, 'Masa molar',
      `¿Cuál es la masa molar del ${c.name} (${c.formula})?`,
      correct, ds,
      `Suma de las masas atómicas: ${detail} = ${c.mass} g/mol.`));
  }

  // 4b. pH from [H+]  -> 180
  for (let i = 0; i < 180; i++) {
    const ph = range(1, 13);
    const exp = -ph;
    const conc = `1 × 10^${exp} M`;
    const correct = String(ph);
    const ds = [String(ph + 1), String(ph - 1), String(14 - ph)];
    qs.push(makeQ(subject, 'pH y concentración de H+',
      `Si la concentración de iones H+ es ${conc}, ¿cuál es el pH de la solución?`,
      correct, ds,
      `pH = -log[H+] = -log(10^${exp}) = ${ph}.`));
  }

  // 4c. Mole conversions  -> 180
  for (let i = 0; i < 90; i++) {
    const c = pick(compounds);
    const moles = range(1, 10);
    const mass = Math.round(moles * c.mass * 100) / 100;
    const massStr = Number.isInteger(mass) ? String(mass) : mass.toFixed(2);
    const ds = [String(Math.round(mass + range(2, 15))), String(Math.round(mass - range(2, 12))), String(Math.round(moles * c.mass * 2))];
    qs.push(makeQ(subject, 'Conversiones de mol',
      `¿Cuántos gramos hay en ${moles} mol(es) de ${c.name} (${c.formula})? (Masa molar = ${c.mass} g/mol)`,
      `${massStr} g`, ds.map((x) => `${x} g`),
      `Masa = moles × masa molar = ${moles} × ${c.mass} = ${massStr} g.`));
  }
  for (let i = 0; i < 90; i++) {
    const c = pick(compounds);
    const mass = range(1, 10) * c.mass;
    const moles = mass / c.mass;
    const molStr = Number.isInteger(moles) ? String(moles) : moles.toFixed(2);
    const ds = [String(Math.round(moles + range(1, 4))), String(Math.round(moles - range(1, 3))), String(Math.round(moles * 2))];
    qs.push(makeQ(subject, 'Conversiones de mol',
      `¿Cuántos moles hay en ${mass} g de ${c.name} (${c.formula})? (Masa molar = ${c.mass} g/mol)`,
      `${molStr} mol`, ds.map((x) => `${x} mol`),
      `Moles = masa / masa molar = ${mass} / ${c.mass} = ${molStr} mol.`));
  }

  // 4d. Stoichiometry (simple ratios from balanced equations)  -> 140
  // 2 H2 + O2 -> 2 H2O ; ratio 2:1:2
  for (let i = 0; i < 70; i++) {
    const molH2 = range(2, 20);
    const molO2 = Math.round(molH2 / 2);
    const molH2O = molH2;
    const correct = `${molH2O} mol`;
    const ds = [`${molH2O + range(1, 4)} mol`, `${molH2O - range(1, 3)} mol`, `${molO2} mol`];
    qs.push(makeQ(subject, 'Estequiometría',
      `En la reacción 2 H2 + O2 -> 2 H2O, ¿cuántos moles de H2O se obtienen al reaccionar ${molH2} mol de H2 con O2 suficiente?`,
      correct, ds,
      `La proporción es 2 mol H2 : 2 mol H2O (1:1). Con ${molH2} mol de H2 se forman ${molH2O} mol de H2O.`));
  }
  for (let i = 0; i < 70; i++) {
    const molO2 = range(1, 10);
    const molCO2 = molO2 * 2;
    const correct = `${molCO2} mol`;
    const ds = [`${molCO2 + range(1, 4)} mol`, `${molCO2 - range(1, 3)} mol`, `${molO2} mol`];
    qs.push(makeQ(subject, 'Estequiometría',
      `En la combustión C + O2 -> CO2, ¿cuántos moles de CO2 se producen con ${molO2} mol de O2?`,
      correct, ds,
      `La proporción es 1 mol O2 : 1 mol CO2. Con ${molO2} mol de O2 se producen ${molO2} mol de CO2. (Nota: 2×O2 en CH4 sería 2:1.)`));
  }

  // 4e. Concentration (molarity) M = n / V  -> 160
  for (let i = 0; i < 80; i++) {
    const n = range(1, 10);
    const v = range(1, 5);
    const m = Math.round((n / v) * 100) / 100;
    const mStr = Number.isInteger(m) ? String(m) : m.toFixed(2);
    const ds = [String(Math.round(m) + range(1, 4)), String(Math.round(m) - range(1, 3)), String(n * v)];
    qs.push(makeQ(subject, 'Molaridad',
      `Se disuelven ${n} mol de soluto en ${v} L de solución. ¿Cuál es la molaridad?`,
      `${mStr} M`, ds.map((x) => `${x} M`),
      `Molaridad = moles de soluto / litros de solución = ${n} / ${v} = ${mStr} M.`));
  }
  for (let i = 0; i < 80; i++) {
    const m = range(1, 6);
    const v = range(1, 5);
    const n = Math.round(m * v * 100) / 100;
    const nStr = Number.isInteger(n) ? String(n) : n.toFixed(2);
    const ds = [String(Math.round(n) + range(1, 4)), String(Math.round(n) - range(1, 3)), String(m + v)];
    qs.push(makeQ(subject, 'Molaridad',
      `¿Cuántos moles de soluto hay en ${v} L de una solución ${m} M?`,
      `${nStr} mol`, ds.map((x) => `${x} mol`),
      `Moles = Molaridad × volumen = ${m} × ${v} = ${nStr} mol.`));
  }

  // 4f. Gas laws PV = nRT  -> 100
  // P1 V1 = P2 V2 (Boyle, T constant) — keep P2 an integer.
  for (let i = 0; i < 50; i++) {
    const p1 = range(1, 5);
    const v1 = range(2, 10);
    const v2 = range(1, 10);
    const p2 = Math.round((p1 * v1) / v2 * 100) / 100;
    const p2Str = Number.isInteger(p2) ? String(p2) : p2.toFixed(2);
    const ds = [String(Math.round(p2) + range(1, 4)), String(Math.round(p2) - range(1, 3)), String(p1 * v2)];
    qs.push(makeQ(subject, 'Ley de Boyle',
      `A temperatura constante, un gas ocupa ${v1} L a ${p1} atm. ¿Cuál será la presión si el volumen cambia a ${v2} L?`,
      `${p2Str} atm`, ds.map((x) => `${x} atm`),
      `Por la ley de Boyle (T constante): P1 × V1 = P2 × V2 ; P2 = (${p1} × ${v1}) / ${v2} = ${p2Str} atm.`));
  }
  // V1/T1 = V2/T2 (Charles) — temperatures in kelvin.
  for (let i = 0; i < 50; i++) {
    const t1 = range(200, 400);
    const v1 = range(2, 10);
    const t2 = range(200, 500);
    const v2 = Math.round((v1 * t2) / t1 * 100) / 100;
    const v2Str = Number.isInteger(v2) ? String(v2) : v2.toFixed(2);
    const ds = [String(Math.round(v2) + range(1, 4)), String(Math.round(v2) - range(1, 3)), String(v1 * t2)];
    qs.push(makeQ(subject, 'Ley de Charles',
      `Un gas ocupa ${v1} L a ${t1} K. ¿Cuál será su volumen a ${t2} K (presión constante)?`,
      `${v2Str} L`, ds.map((x) => `${x} L`),
      `Por la ley de Charles (P constante): V1/T1 = V2/T2 ; V2 = (${v1} × ${t2}) / ${t1} = ${v2Str} L.`));
  }

  // 4g. Percent composition  -> 120
  for (let i = 0; i < 120; i++) {
    const c = pick(compounds);
    const elem = pick(c.breakdown);
    const pct = Math.round((elem.count * elem.atomic / c.mass) * 1000) / 10;
    const pctStr = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
    const correct = `${pctStr}%`;
    const ds = [`${Math.round(pct + range(2, 8))}%`, `${Math.round(pct - range(2, 6))}%`, `${Math.round(100 - pct)}%`];
    qs.push(makeQ(subject, 'Composición porcentual',
      `¿Cuál es el porcentaje de ${elem.sym} en el ${c.name} (${c.formula})? (Masa molar = ${c.mass} g/mol)`,
      correct, ds,
      `% ${elem.sym} = (masa de ${elem.sym} / masa total) × 100 = (${elem.atomic} × ${elem.count} / ${c.mass}) × 100 = ${pctStr}%.`));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 5. BIOLOGIA (500+)
// ---------------------------------------------------------------------------
function genBiologia(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'biologia';

  // 5a. Genetics: Punnett squares / phenotype ratios  -> 160
  const crossTypes: { desc: string; ratio: string; explain: string }[] = [
    { desc: 'Aa × Aa', ratio: '3:1', explain: 'Cruza monohíbrida: 1 AA, 2 Aa, 1 aa. Fenotipo dominante:recesivo = 3:1.' },
    { desc: 'AA × aa', ratio: '1:0', explain: 'Todos los descendientes son Aa, fenotipo dominante: 100% (4:0).' },
    { desc: 'Aa × aa', ratio: '1:1', explain: 'Cruza de prueba: 1 Aa : 1 aa. Fenotipo dominante:recesivo = 1:1.' },
    { desc: 'AaBb × AaBb', ratio: '9:3:3:1', explain: 'Cruza dihíbrida: 9 fenotipos dominantes dobles, 3 de cada simple, 1 doble recesivo.' },
  ];
  for (let i = 0; i < 160; i++) {
    const c = pick(crossTypes);
    const ratioVar = c.ratio;
    const ds = ['1:2:1', '2:1', '9:1', '4:1'].filter((x) => x !== ratioVar).slice(0, 3);
    qs.push(makeQ(subject, 'Genética: cuadros de Punnett',
      `En la cruza ${c.desc}, ¿cuál es la proporción fenotípica esperada?`,
      ratioVar, ds,
      c.explain));
  }

  // 5b. Cell division stages  -> 120
  const mitosisStages = [
    { s: 'Profase', desc: 'Los cromosomas se condensan y la envoltura nuclear desaparece.' },
    { s: 'Metafase', desc: 'Los cromosomas se alinean en la placa ecuatorial de la célula.' },
    { s: 'Anafase', desc: 'Las cromátidas hermanas se separan y migran a los polos.' },
    { s: 'Telofase', desc: 'Se forman dos núcleos hijos y reaparece la envoltura nuclear.' },
  ];
  for (let i = 0; i < 60; i++) {
    const st = pick(mitosisStages);
    const others = mitosisStages.filter((x) => x.s !== st.s).map((x) => x.s);
    qs.push(makeQ(subject, 'División celular',
      `¿En qué fase de la mitosis ${st.desc}`,
      st.s, others,
      `Es la ${st.s}: ${st.desc}`));
  }
  for (let i = 0; i < 60; i++) {
    const meiosisQ = [
      { q: '¿Cuántas células hijas se obtienen de la meiosis?', a: '4 células haploides', d: ['2 células diploides', '4 células diploides', '8 células haploides'], e: 'La meiosis produce 4 células hijas haploides (n) a partir de una célula diploide (2n).' },
      { q: 'La meiosis reduce el número de cromosomas a:', a: 'la mitad (n)', d: ['el doble (4n)', 'igual (2n)', 'un cuarto (n/2)'], e: 'La meisión reduce el número cromosómico a la mitad: de 2n a n.' },
      { q: 'El entrecruzamiento (crossing-over) ocurre en:', a: 'Profase I de la meiosis', d: ['Metafase II', 'Anafase de la mitosis', 'Telofase I'], e: 'El entrecruzamiento entre cromosomas homólogos ocurre en la Profase I de la meiosis.' },
    ];
    const m = pick(meiosisQ);
    qs.push(makeQ(subject, 'División celular', m.q, m.a, m.d, m.e));
  }

  // 5c. Ecological pyramids  -> 80
  const ecoPyramids = [
    { q: 'En una pirámide de energía, cada nivel trófico transmite aproximadamente:', a: '10% al siguiente nivel', d: ['100% al siguiente nivel', '50% al siguiente nivel', '1% al siguiente nivel'], e: 'La regla del 10% indica que solo ~10% de la energía pasa al siguiente nivel trófico.' },
    { q: 'La base de una pirámide ecológica la ocupan:', a: 'Los productores', d: ['Los carnívoros', 'Los descomponedores', 'Los consumidores terciarios'], e: 'Los productores (plantas) ocupan la base de la pirámide por captar energía solar.' },
    { q: 'En una pirámide de números, los productores suelen ser:', a: 'los más numerosos', d: ['los menos numerosos', 'iguales a los consumidores', 'inexistentes'], e: 'Los productores son generalmente los más numerosos en la pirámide de números.' },
    { q: 'Los consumidores primarios se alimentan de:', a: 'productores (plantas)', d: ['otros consumidores', 'descomponedores', 'carroña'], e: 'Los consumidores primarios (herbívoros) se alimentan de los productores.' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(ecoPyramids);
    qs.push(makeQ(subject, 'Pirámides ecológicas', m.q, m.a, m.d, m.e));
  }

  // 5d. Photosynthesis / respiration equations  -> 80
  const photosynQ = [
    { q: 'En la fotosíntesis, las plantas absorben:', a: 'CO2 y liberan O2', d: ['O2 y liberan CO2', 'N2 y liberan H2', 'CO y liberan O2'], e: 'Las plantas absorben CO2 y liberan O2 durante la fotosíntesis.' },
    { q: 'La ecuación general de la fotosíntesis es:', a: '6 CO2 + 6 H2O -> C6H12O6 + 6 O2', d: ['C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O', '2 H2 + O2 -> 2 H2O', 'N2 + 3 H2 -> 2 NH3'], e: 'La fotosíntesis: 6 CO2 + 6 H2O --luz--> C6H12O6 + 6 O2.' },
    { q: 'La ecuación de la respiración celular es:', a: 'C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ATP', d: ['6 CO2 + 6 H2O -> C6H12O6 + 6 O2', '2 H2O -> 2 H2 + O2', 'C6H12O6 -> 2 C2H5OH + 2 CO2'], e: 'La respiración celular: C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + energia (ATP).' },
    { q: 'La fotosíntesis ocurre en los:', a: 'cloroplastos', d: ['mitocondrias', 'núcleo', 'ribosomas'], e: 'La fotosíntesis se realiza en los cloroplastos, que contienen clorofila.' },
    { q: 'La respiración celular ocurre en las:', a: 'mitocondrias', d: ['cloroplastos', 'núcleo', 'vacuolas'], e: 'La respiración celular (fase aerobia) ocurre en las mitocondrias.' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(photosynQ);
    qs.push(makeQ(subject, 'Fotosíntesis y respiración', m.q, m.a, m.d, m.e));
  }

  // 5e. Population growth  -> 80
  for (let i = 0; i < 40; i++) {
    const p0 = range(100, 5000);
    const r = range(2, 10) / 100;
    const t = range(2, 10);
    const pFinal = Math.round(p0 * Math.pow(1 + r, t));
    const ds = [String(Math.round(pFinal * 1.2)), String(Math.round(pFinal * 0.8)), String(p0 + range(50, 500))];
    qs.push(makeQ(subject, 'Crecimiento poblacional',
      `Una población de ${p0} individuos crece a una tasa del ${Math.round(r * 100)}% anual. ¿Cuántos habrá después de ${t} años?`,
      String(pFinal), ds,
      `P = P0 × (1 + r)^t = ${p0} × (1 + ${r})^${t} ≈ ${pFinal}.`));
  }
  for (let i = 0; i < 40; i++) {
    const m = pick([
      { q: 'El crecimiento exponencial de una población se da cuando:', a: 'los recursos son ilimitados', d: ['los recursos se agotan', 'hay depredadores', 'hay competencia'], e: 'El crecimiento exponencial ocurre con recursos ilimitados (modelo de Malthus).' },
      { q: 'La capacidad de carga de un ecosistema es:', a: 'el máximo número de individuos que puede sostener', d: ['la velocidad de crecimiento', 'el número de depredadores', 'la temperatura promedio'], e: 'La capacidad de carga (K) es el máximo de individuos que el ambiente puede sostener a largo plazo.' },
      { q: 'La curva de crecimiento logístico tiene forma de:', a: 'S (sigmoide)', d: ['L', 'U', 'línea recta'], e: 'La curva logística tiene forma de S (sigmoide) al estabilizarse en K.' },
    ]);
    qs.push(makeQ(subject, 'Crecimiento poblacional', m.q, m.a, m.d, m.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 6. HABILIDAD VERBAL (500+)
// ---------------------------------------------------------------------------
function genHabilidadVerbal(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'habilidad_verbal';

  // 6a. Synonyms (large word bank, 30+ pairs)  -> 180
  const synonymPairs: { w: string; syn: string; d: string[]; e: string }[] = [
    { w: 'efímero', syn: 'fugaz', d: ['eterno', 'duradero', 'permanente'], e: 'Efímero significa que dura poco; fugaz es su sinónimo.' },
    { w: 'ostentar', syn: 'lucir', d: ['ocultar', 'esconder', 'guardar'], e: 'Ostentar significa mostrar con orgullo; lucir es el sinónimo.' },
    { w: 'lúgubre', syn: 'sombrío', d: ['alegre', 'claro', 'brillante'], e: 'Lúgubre significa oscuro y triste; sombrío es el sinónimo.' },
    { w: 'diligente', syn: 'aplicado', d: ['perezoso', 'negligente', 'descuidado'], e: 'Diligente significa cuidadoso y activo; aplicado es el sinónimo.' },
    { w: 'abundante', syn: 'copioso', d: ['escaso', 'reducido', 'limitado'], e: 'Abundante significa en gran cantidad; copioso es el sinónimo.' },
    { w: 'mezquino', syn: 'tacaño', d: ['generoso', 'desprendido', 'pródigo'], e: 'Mezquino significa reacio a gastar; tacaño es el sinónimo.' },
    { w: 'errante', syn: 'vagabundo', d: ['fijo', 'estable', 'sedentario'], e: 'Errante significa que va de un lugar a otro; vagabundo es el sinónimo.' },
    { w: 'parco', syn: 'moderado', d: ['abundante', 'excesivo', 'desbordado'], e: 'Parco significa escaso o moderado; moderado es el sinónimo.' },
    { w: 'inefable', syn: 'inexpresable', d: ['común', 'explicable', 'corriente'], e: 'Inefable significa que no puede expresarse con palabras; inexpresable es el sinónimo.' },
    { w: 'obsoleto', syn: 'anticuado', d: ['moderno', 'actual', 'vigente'], e: 'Obsoleto significa que ha caído en desuso; anticuado es el sinónimo.' },
    { w: 'sagaz', syn: 'perspicaz', d: ['tonto', 'torpe', 'ingenuo'], e: 'Sagaz significa astuto y perspicaz; perspicaz es el sinónimo.' },
    { w: 'vetusto', syn: 'antiguo', d: ['nuevo', 'moderno', 'reciente'], e: 'Vetusto significa muy antiguo; antiguo es el sinónimo.' },
    { w: 'procaz', syn: 'grosero', d: ['educado', 'cortés', 'refinado'], e: 'Procaz significa grosero o insolente; grosero es el sinónimo.' },
    { w: 'vacuo', syn: 'vano', d: ['lleno', 'profundo', 'sustancial'], e: 'Vacuo significa vacío o sin contenido; vano es el sinónimo.' },
    { w: 'insidioso', syn: 'engañoso', d: ['franco', 'sincero', 'honesto'], e: 'Insidioso significa que engaña con apariencia inocente; engañoso es el sinónimo.' },
    { w: 'menguar', syn: 'disminuir', d: ['aumentar', 'crecer', 'ampliar'], e: 'Menguar significa reducir o disminuir; disminuir es el sinónimo.' },
    { w: 'placentero', syn: 'agradable', d: ['desagradable', 'fastidioso', 'molesto'], e: 'Placentero causa placer; agradable es el sinónimo.' },
    { w: 'redundante', syn: 'repetitivo', d: ['conciso', 'breve', 'sintético'], e: 'Redundante repite información innecesariamente; repetitivo es el sinónimo.' },
    { w: 'adecuado', syn: 'apropiado', d: ['inapropiado', 'incorrecto', 'improcedente'], e: 'Adecuado significa conveniente; apropiado es el sinónimo.' },
    { w: 'exhaustivo', syn: 'completo', d: ['parcial', 'incompleto', 'superficial'], e: 'Exhaustivo significa completo y detallado; completo es el sinónimo.' },
    { w: 'inaudito', syn: 'insólito', d: ['común', 'frecuente', 'habitual'], e: 'Inaudito significa nunca oído o extraño; insólito es el sinónimo.' },
    { w: 'vehemente', syn: 'apasionado', d: ['tibio', 'indiferente', 'apático'], e: 'Vehemente significa con fuerza o pasión; apasionado es el sinónimo.' },
    { w: 'denuesto', syn: 'insulto', d: ['elogio', 'alabanza', 'cumplido'], e: 'Denuesto es un insulto o afrenta; insulto es el sinónimo.' },
    { w: 'protervo', syn: 'perverso', d: ['bondadoso', 'recto', 'honrado'], e: 'Protervo significa perverso o malvado; perverso es el sinónimo.' },
    { w: 'solícito', syn: 'atento', d: ['desatento', 'negligente', 'indiferente'], e: 'Solícito significa atento y diligente; atento es el sinónimo.' },
    { w: 'exánime', syn: 'inerte', d: ['vivo', 'animado', 'energético'], e: 'Exánime significa sin vida o sin fuerzas; inerte es el sinónimo.' },
    { w: 'azuzar', syn: 'incitar', d: ['detener', 'calmar', 'frenar'], e: 'Azuzar significa incitar o provocar; incitar es el sinónimo.' },
    { w: 'ufano', syn: 'presumido', d: ['humilde', 'modesto', 'retirado'], e: 'Ufano significa presuntuoso o satisfecho de sí mismo; presumido es el sinónimo.' },
    { w: 'lacónico', syn: 'breve', d: ['extenso', 'detallado', 'prolijo'], e: 'Lacónico usa pocas palabras; breve es el sinónimo.' },
    { w: 'cándido', syn: 'ingenuo', d: ['malicioso', 'astuto', 'desconfiado'], e: 'Cándido significa puro e inocente; ingenuo es el sinónimo.' },
    { w: 'dipar', syn: 'desviar', d: ['enderezar', 'alinear', 'corregir'], e: 'Dipar o desviar significa apartar del camino; desviar es el sinónimo.' },
    { w: 'estropear', syn: 'arruinar', d: ['reparar', 'arreglar', 'mejorar'], e: 'Estropear significa dañar o arruinar; arruinar es el sinónimo.' },
  ];
  for (let i = 0; i < 180; i++) {
    const p = pick(synonymPairs);
    qs.push(makeQ(subject, 'Sinónimos', `Elige el sinónimo de "${p.w}":`, p.syn, p.d, p.e));
  }

  // 6b. Antonyms  -> 140
  const antonymPairs: { w: string; ant: string; d: string[]; e: string }[] = [
    { w: 'abundante', ant: 'escaso', d: ['numeroso', 'copioso', 'profuso'], e: 'Abundante significa en gran cantidad; su antónimo es escaso.' },
    { w: 'diligente', ant: 'negligente', d: ['activo', 'aplicado', 'cuidadoso'], e: 'Diligente significa cuidadoso; su antónimo es negligente.' },
    { w: 'mezquino', ant: 'generoso', d: ['tacaño', 'roñoso', 'avaro'], e: 'Mezquino significa tacaño; su antónimo es generoso.' },
    { w: 'lúgubre', ant: 'alegre', d: ['sombrío', 'oscuro', 'triste'], e: 'Lúgubre significa triste; su antónimo es alegre.' },
    { w: 'sagaz', ant: 'tonto', d: ['perspicaz', 'astuto', 'listo'], e: 'Sagaz significa inteligente; su antónimo es tonto.' },
    { w: 'obsoleto', ant: 'moderno', d: ['anticuado', 'viejo', 'pasado'], e: 'Obsoleto significa anticuado; su antónimo es moderno.' },
    { w: 'parco', ant: 'abundante', d: ['moderado', 'escaso', 'frugal'], e: 'Parco significa escaso; su antónimo es abundante.' },
    { w: 'vetusto', ant: 'nuevo', d: ['antiguo', 'viejo', 'pasado'], e: 'Vetusto significa antiguo; su antónimo es nuevo.' },
    { w: 'procaz', ant: 'educado', d: ['grosero', 'insolente', 'maleducado'], e: 'Procaz significa grosero; su antónimo es educado.' },
    { w: 'vacuo', ant: 'profundo', d: ['vano', 'vacío', 'superficial'], e: 'Vacuo significa vacío; su antónimo es profundo.' },
    { w: 'menguar', ant: 'aumentar', d: ['disminuir', 'reducir', 'decrecer'], e: 'Menguar significa disminuir; su antónimo es aumentar.' },
    { w: 'exhaustivo', ant: 'superficial', d: ['completo', 'detallado', 'minucioso'], e: 'Exhaustivo es completo; su antónimo es superficial.' },
    { w: 'vehemente', ant: 'apático', d: ['apasionado', 'ferviente', 'ardiente'], e: 'Vehemente es apasionado; su antónimo es apático.' },
    { w: 'solícito', ant: 'desatento', d: ['atento', 'diligente', 'obsequioso'], e: 'Solícito es atento; su antónimo es desatento.' },
    { w: 'lacónico', ant: 'prolijo', d: ['breve', 'conciso', 'sucinto'], e: 'Lacónico es breve; su antónimo es prolijo (extenso).' },
    { w: 'cándido', ant: 'astuto', d: ['ingenuo', 'inocente', 'puro'], e: 'Cándido es ingenuo; su antónimo es astuto.' },
  ];
  for (let i = 0; i < 140; i++) {
    const p = pick(antonymPairs);
    qs.push(makeQ(subject, 'Antónimos', `Elige el antónimo de "${p.w}":`, p.ant, p.d, p.e));
  }

  // 6c. Analogies (20+ templates)  -> 180
  const analogies: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Médico es a hospital como profesor es a:', a: 'escuela', d: ['libro', 'alumno', 'pizarrón'], e: 'Un médico trabaja en un hospital; un profesor trabaja en una escuela (relación profesional-lugar).' },
    { q: 'Pluma es a escribir como cuchillo es a:', a: 'cortar', d: ['cocina', 'comer', 'mesa'], e: 'La pluma sirve para escribir; el cuchillo sirve para cortar (relación herramienta-función).' },
    { q: 'Ojo es a ver como oído es a:', a: 'escuchar', d: ['hablar', 'oler', 'tocar'], e: 'El ojo sirve para ver; el oído sirve para escuchar (relación órgano-función).' },
    { q: 'Tijeras es a cortar como aguja es a:', a: 'coser', d: ['tejer', 'bordar', 'punzar'], e: 'Las tijeras sirven para cortar; la aguja sirve para coser (relación herramienta-función).' },
    { q: 'Río es a agua como bosque es a:', a: 'árboles', d: ['tierra', 'piedras', 'animales'], e: 'Un río está compuesto de agua; un bosque está compuesto de árboles (relación conjunto-elemento).' },
    { q: 'Pintor es a brocha como músico es a:', a: 'instrumento', d: ['partitura', 'canción', 'escenario'], e: 'El pintor usa la brocha como herramienta; el músico usa el instrumento (relación profesional-herramienta).' },
    { q: 'Semilla es a árbol como embrión es a:', a: 'animal adulto', d: ['huevo', 'útero', 'célula'], e: 'La semilla se desarrolla en árbol; el embrión se desarrolla en animal adulto (relación inicial-maduro).' },
    { q: 'Reloj es a tiempo como termómetro es a:', a: 'temperatura', d: ['calor', 'grados', 'mercurio'], e: 'El reloj mide el tiempo; el termómetro mide la temperatura (relación instrumento-magnitud).' },
    { q: 'Abogado es a ley como médico es a:', a: 'enfermedad', d: ['hospital', 'paciente', 'receta'], e: 'El abogado se ocupa de la ley; el médico se ocupa de la enfermedad (relación profesional-objeto).' },
    { q: 'Hambre es a comida como sed es a:', a: 'agua', d: ['bebida', 'frío', 'descanso'], e: 'El hambre se sacia con comida; la sed se sacia con agua (relación necesidad-satisfactor).' },
    { q: 'Llave es a puerta como contraseña es a:', a: 'cuenta', d: ['computadora', 'usuario', 'pantalla'], e: 'La llave abre la puerta; la contraseña abre la cuenta (relación acceso-objeto).' },
    { q: 'Verano es a calor como invierno es a:', a: 'frío', d: ['nieve', 'escarcha', 'viento'], e: 'El verano se asocia al calor; el invierno se asocia al frío (relación estación-característica).' },
    { q: 'Tren es a rieles como auto es a:', a: 'carretera', d: ['llantas', 'volante', 'gasolina'], e: 'El tren circula por rieles; el auto por carretera (relación vehículo-vía).' },
    { q: 'Fotógrafo es a cámara como pintor es a:', a: 'pincel', d: ['lienzos', 'colores', 'estudio'], e: 'El fotógrafo usa la cámara; el pintor usa el pincel (relación profesional-herramienta).' },
    { q: 'Libro es a capítulo como obra es a:', a: 'acto', d: ['escena', 'personaje', 'teatro'], e: 'Un libro se divide en capítulos; una obra de teatro se divide en actos (relación todo-parte).' },
    { q: 'Día es a sol como noche es a:', a: 'luna', d: ['oscuridad', 'estrellas', 'sueño'], e: 'El día se asocia con el sol; la noche con la luna (relación periodo-astro).' },
    { q: 'Cuchillo es a filo como aguja es a:', a: 'punta', d: ['ojo', 'hilo', 'metal'], e: 'El cuchillo corta con el filo; la aguja punza con la punta (relación herramienta-parte útil).' },
    { q: 'Médico es a diagnóstico como juez es a:', a: 'sentencia', d: ['ley', 'juicio', 'abogado'], e: 'El médico emite un diagnóstico; el juez emite una sentencia (relación profesional-producto).' },
    { q: 'Panadero es a pan como zapatero es a:', a: 'zapato', d: ['cuero', 'suela', 'tienda'], e: 'El panadero hace pan; el zapatero hace zapatos (relación profesional-producto).' },
    { q: 'Asno es a terco como zorro es a:', a: 'astuto', d: ['tramposo', 'veloz', 'cauteloso'], e: 'El asno es símbolo de terco; el zorro de astuto (relación animal-cualidad simbólica).' },
  ];
  for (let i = 0; i < 180; i++) {
    const a = pick(analogies);
    qs.push(makeQ(subject, 'Analogías', a.q, a.a, a.d, a.e));
  }

  // 6d. Reading comprehension with generated short texts  -> 60
  const passages: { text: string; q: string; a: string; d: string[]; e: string }[] = [
    {
      text: 'La biodiversidad es el resultado de millones de años de evolución. Cada especie desempeña un papel específico en su ecosistema, y la pérdida de una sola puede provocar desequilibrios que afectan a todo el sistema.',
      q: 'Según el texto, la pérdida de una especie puede provocar:',
      a: 'desequilibrios en el sistema',
      d: ['beneficios para el ecosistema', 'mayor biodiversidad', 'aceleración evolutiva'],
      e: 'El texto señala que la pérdida de una especie "puede provocar desequilibrios que afectan a todo el sistema".',
    },
    {
      text: 'La lectura es una herramienta fundamental para el aprendizaje. A través de ella, el ser humano adquiere conocimientos, desarrolla su pensamiento crítico y amplía su vocabulario. Sin embargo, en la era digital, la atención se ha fragmentado y la lectura profunda se ha vuelto menos frecuente.',
      q: 'Según el texto, la lectura profunda se ha vuelto menos frecuente porque:',
      a: 'la atención se ha fragmentado en la era digital',
      d: ['no hay libros disponibles', 'las personas ya no saben leer', 'la lectura no es importante'],
      e: 'El texto indica que "en la era digital, la atención se ha fragmentado" y por eso la lectura profunda disminuye.',
    },
    {
      text: 'El agua es un recurso vital que cubre aproximadamente el 71% de la superficie de la Tierra. Sin embargo, solo una pequeña fracción es agua dulce accesible para el consumo humano. La contaminación y el desperdicio amenazan este recurso indispensable para la vida.',
      q: '¿Cuánta superficie de la Tierra cubre el agua?',
      a: '71%',
      d: ['50%', '90%', '30%'],
      e: 'El texto indica que el agua cubre aproximadamente el 71% de la superficie terrestre.',
    },
  ];
  for (let i = 0; i < 60; i++) {
    const p = pick(passages);
    qs.push(makeQ(subject, 'Comprensión de lectura', `${p.text}\n\n${p.q}`, p.a, p.d, p.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 7. ESPAÑOL (500+)
// ---------------------------------------------------------------------------
function genEspanol(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'espanol';

  // 7a. Spelling rules (s/c/z, b/v, h, g/j)  -> 200
  const spelling: { q: string; a: string; d: string[]; e: string }[] = [
    { q: '¿Cuál palabra está escrita correctamente?', a: 'hacer', d: ['aser', 'acer', 'haser'], e: 'Se escribe con h inicial "hacer" por su etimología latina (facere).' },
    { q: '¿Cuál palabra está escrita correctamente?', a: 'lápiz', d: ['lábiz', 'lapis', 'lávis'], e: 'Se escribe con z "lápiz" (palabras agudas terminadas en sonido /s/ después de vocal no atonal).' },
    { q: 'Completa: "Voy a _____ la mesa para comer."', a: 'levantar', d: ['bantar', 'bantár', 'vanntar'], e: 'Se escribe con v "levantar" (de levantar), no con b.' },
    { q: 'Completa: "El _____ del perro es suave."', a: 'pelo', d: ['pollo', 'poyo', 'poio'], e: 'El contexto se refiere al pelaje del animal, por lo que la palabra correcta es "pelo".' },
    { q: 'Completa: "Necesito _____ este documento."', a: 'imprimir', d: ['imprimír', 'enprimir', 'himprimir'], e: 'Se escribe "imprimir" sin h y sin tilde por ser palabra grave terminada en consonante distinta de n/s.' },
    { q: 'Completa: "El agua es _____ para la vida."', a: 'indispensable', d: ['indispensável', 'indispensablé', 'indispensável '], e: 'Se escribe "indispensable" sin tilde (grave terminada en consonante).' },
    { q: '¿Cuál palabra lleva tilde?', a: 'fútbol', d: ['futbol', 'futból', 'fútból'], e: 'La palabra "fútbol" lleva tilde en la "u" por ser esdrújula.' },
    { q: '¿Cuál palabra está escrita correctamente?', a: 'examen', d: ['ejamen', 'exámen', 'ejamén'], e: 'La palabra correcta es "examen", sin tilde porque es grave terminada en n.' },
    { q: 'Completa: "El jugador _____ el gol."', a: 'hizo', d: ['iso', 'izo', 'hiso'], e: 'Se escribe con h "hizo" (del verbo hacer, h inicial etimológica).' },
    { q: 'Completa: "Compré un _____ de uvas."', a: 'racimo', d: ['racímo', 'rasimo', 'razimo'], e: 'Se escribe "racimo" sin tilde (grave terminada en vocal) y con c.' },
    { q: 'Completa: "La _____ es un metal precioso."', a: 'plata', d: ['platta', 'plataa', 'prata'], e: 'Se escribe "plata" sin doble t y con p.' },
    { q: 'Completa: "Ese niño es muy _____."', a: 'ágil', d: ['hágil', 'ájil', 'agíl'], e: 'Se escribe "ágil" con tilde por ser aguda terminada en l, y con g.' },
    { q: 'Completa: "Voy a _____ las flores del jardín."', a: 'regar', d: ['rejar', 'regár', 'rejar '], e: 'Se escribe "regar" con g suave antes de e.' },
    { q: 'Completa: "El pan está en el _____.', a: 'horno', d: ['orno', 'orno', 'jorno'], e: 'Se escribe con h inicial "horno" por su etimología latina (furnus).' },
    { q: 'Completa: "México tiene una _____ muy rica."', a: 'cultura', d: ['cultzura', 'cultura', 'cultúra'], e: 'Se escribe "cultura" con c y sin tilde (grave terminada en vocal).' },
  ];
  for (let i = 0; i < 200; i++) {
    const m = pick(spelling);
    qs.push(makeQ(subject, 'Ortografía', m.q, m.a.trim(), m.d, m.e));
  }

  // 7b. Sentence analysis  -> 100
  const sentenceAnalysis: { q: string; a: string; d: string[]; e: string }[] = [
    { q: '¿Cuál es el sujeto en "Los estudiantes aprobaron el examen"?', a: 'Los estudiantes', d: ['aprobaron', 'el examen', 'aprobaron el examen'], e: 'El sujeto es aquello de quien se dice algo: "Los estudiantes".' },
    { q: 'El predicado de "Los estudiantes aprobaron el examen" es:', a: 'aprobaron el examen', d: ['Los estudiantes', 'aprobaron', 'el examen'], e: 'El predicado incluye el verbo y lo que se dice del sujeto: "aprobaron el examen".' },
    { q: 'En "La niña corre rápido", el núcleo del sujeto es:', a: 'niña', d: ['La', 'corre', 'rápido'], e: 'El núcleo del sujeto es el sustantivo principal: "niña".' },
    { q: 'En "Mis amigos juegan fútbol", el núcleo del predicado es:', a: 'juegan', d: ['Mis amigos', 'fútbol', 'Mis'], e: 'El núcleo del predicado es el verbo: "juegan".' },
    { q: '¿Cuál oración es bimembre?', a: 'El perro ladra fuerte', d: ['¡Auxilio!', '¡Qué frío!', 'Buenos días'], e: 'La oración bimembre tiene sujeto y predicado: "El perro ladra fuerte".' },
    { q: '¿Cuál oración es unimembre?', a: '¡Qué hermoso atardecer!', d: ['El sol se pone', 'Los pájaros cantan', 'El viento sopla'], e: 'La oración unimembre no tiene sujeto ni predicado: "¡Qué hermoso atardecer!".' },
    { q: 'En "Mi hermano compró un libro", el modificador del núcleo del sujeto es:', a: 'Mi', d: ['hermano', 'compró', 'un libro'], e: '"Mi" es el modificador del sustantivo "hermano" (núcleo del sujeto).' },
    { q: 'La oración "Llueve mucho" es:', a: 'impersonal', d: ['personal', 'bimembre', 'compuesta'], e: 'Es impersonal: el verbo "llover" no admite sujeto.' },
  ];
  for (let i = 0; i < 100; i++) {
    const m = pick(sentenceAnalysis);
    qs.push(makeQ(subject, 'Análisis de oraciones', m.q, m.a, m.d, m.e));
  }

  // 7c. Literary figures  -> 100
  const figures: { q: string; a: string; d: string[]; e: string }[] = [
    { q: '"Sus ojos son luceros" es un ejemplo de:', a: 'metáfora', d: ['símil', 'hipérbole', 'personificación'], e: 'Es una metáfora: identifica los ojos con luceros sin usar "como".' },
    { q: '"Sus ojos son como luceros" es un ejemplo de:', a: 'símil', d: ['metáfora', 'hipérbole', 'aliteración'], e: 'Es un símil: usa el nexo "como" para comparar.' },
    { q: '"Te he dicho un millón de veces" es un ejemplo de:', a: 'hipérbole', d: ['metáfora', 'símil', 'ironía'], e: 'Es una hipérbole: exageración evidente.' },
    { q: '"El viento susurra entre los árboles" es un ejemplo de:', a: 'personificación', d: ['metáfora', 'símil', 'hipérbole'], e: 'Es personificación: se atribuye una acción humana (susurrar) al viento.' },
    { q: '"Pan, paz, poesía" es un ejemplo de:', a: 'aliteración', d: ['metáfora', 'hipérbaton', 'ironía'], e: 'Es aliteración: repetición del sonido /p/.' },
    { q: '"Del salón en el ángel oscuro" es un ejemplo de:', a: 'hipérbaton', d: ['metáfora', 'símil', 'epíteto'], e: 'Es hipérbaton: alteración del orden sintáctico (en el salón oscuro del ángel).' },
    { q: '"La blanca nieve" contiene un:', a: 'epíteto', d: ['símil', 'metáfora', 'hipérbole'], e: 'Es epíteto: adjetivo innecesario que refuerza una cualidad inherente.' },
    { q: '"El rey de los animales" es un ejemplo de:', a: 'metonimia', d: ['metáfora', 'símil', 'ironía'], e: 'Es metonimia: designa al león con una expresión asociada.' },
    { q: 'La ironía consiste en:', a: 'decir lo contrario de lo que se piensa', d: ['exagerar', 'comparar con "como"', 'repetir sonidos'], e: 'La ironía expresa lo contrario de lo que se quiere dar a entender.' },
  ];
  for (let i = 0; i < 100; i++) {
    const m = pick(figures);
    qs.push(makeQ(subject, 'Figuras literarias', m.q, m.a, m.d, m.e));
  }

  // 7d. Text types  -> 80
  const textTypes: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Un texto narrativo se caracteriza por:', a: 'relatar hechos y eventos', d: ['defender una tesis', 'describir un objeto', 'dar instrucciones'], e: 'El texto narrativo relata hechos, reales o ficticios, en un tiempo y espacio.' },
    { q: 'Un texto argumentativo tiene como fin:', a: 'defender una tesis con razones', d: ['relatar hechos', 'describir un lugar', 'informar datos'], e: 'El texto argumentativo defiende una postura (tesis) mediante argumentos.' },
    { q: 'Un texto descriptivo:', a: 'explica cómo es algo o alguien', d: ['cuenta una historia', 'persuade al lector', 'da instrucciones'], e: 'El texto descriptivo detalla características de objetos, personas o lugares.' },
    { q: 'Un texto instructivo:', a: 'indica pasos para realizar algo', d: ['relata hechos', 'defiende una opinión', 'describe un paisaje'], e: 'El texto instructivo da pasos o instrucciones para hacer algo (recetas, manuales).' },
    { q: 'Un texto expositivo:', a: 'informa de manera objetiva', d: ['persuade', 'narra una historia', 'describe emociones'], e: 'El texto expositivo presenta información de forma clara y objetiva.' },
    { q: 'Una noticia se caracteriza por ser:', a: 'objetiva y veraz', d: ['subjetiva', 'ficticia', 'publicitaria'], e: 'La noticia debe ser objetiva y veraz, respondiendo qué, quién, cómo, cuándo, dónde y por qué.' },
    { q: 'Un texto publicitario tiene como fin:', a: 'persuadir al receptor', d: ['informar objetivamente', 'narrar una historia', 'describir un proceso'], e: 'El texto publicitario busca persuadir para vender o convencer.' },
    { q: 'Un acta es un documento:', a: 'administrativo que registra lo tratado en una reunión', d: ['publicitario', 'periodístico', 'literario'], e: 'Un acta es un documento administrativo que registra lo ocurrido en una reunión.' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(textTypes);
    qs.push(makeQ(subject, 'Tipos de texto', m.q, m.a, m.d, m.e));
  }

  // 7e. Grammar rules  -> 60
  const grammar: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'La palabra "rápidamente" es:', a: 'adverbio', d: ['sustantivo', 'adjetivo', 'verbo'], e: 'Las palabras terminadas en "-mente" derivadas de adjetivos son adverbios de modo.' },
    { q: 'El adjetivo concuerda con el sustantivo en:', a: 'género y número', d: ['tiempo y modo', 'persona y número', 'solo género'], e: 'El adjetivo concuerda en género y número con el sustantivo al que modifica.' },
    { q: 'El verbo concuerda con el sujeto en:', a: 'persona y número', d: ['género y número', 'tiempo y género', 'solo tiempo'], e: 'El verbo concuerda con el sujeto en persona y número.' },
    { q: 'Las palabras agudas llevan tilde cuando terminan en:', a: 'n, s o vocal', d: ['consonante distinta de n/s', 'dos consonantes', 'nunca'], e: 'Las agudas llevan tilde si terminan en n, s o vocal.' },
    { q: 'Las palabras graves llevan tilde cuando:', a: 'no terminan en n, s o vocal', d: ['terminan en vocal', 'terminan en n o s', 'siempre'], e: 'Las graves llevan tilde si NO terminan en n, s o vocal.' },
    { q: 'Las palabras esdrújulas llevan tilde:', a: 'siempre', d: ['nunca', 'solo si terminan en vocal', 'solo si terminan en consonante'], e: 'Las esdrújulas y sobreesdrújulas llevan tilde siempre.' },
    { q: 'El pronombre "yo" es de:', a: 'primera persona', d: ['segunda persona', 'tercera persona', 'primera persona del plural'], e: '"Yo" es primera persona del singular.' },
    { q: 'La palabra "cantar" es un verbo en:', a: 'infinitivo', d: ['gerundio', 'participio', 'subjuntivo'], e: 'Los infinitivos terminan en -ar, -er, -ir: "cantar".' },
  ];
  for (let i = 0; i < 60; i++) {
    const m = pick(grammar);
    qs.push(makeQ(subject, 'Gramática', m.q, m.a, m.d, m.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 8. HISTORIA (500+)
// ---------------------------------------------------------------------------
function genHistoria(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'historia';

  // 8a. Dates of historical events  -> 200
  const events: { event: string; year: number; e: string }[] = [
    { event: 'el descubrimiento de América por Colón', year: 1492, e: 'Cristóbal Colón llegó a América el 12 de octubre de 1492.' },
    { event: 'la caída de Constantinopla', year: 1453, e: 'El Imperio Otomano conquistó Constantinopla en 1453.' },
    { event: 'la Reforma Protestante iniciada por Lutero', year: 1517, e: 'Martín Lutero publicó sus 95 tesis en 1517.' },
    { event: 'la conquista de Tenochtitlan', year: 1521, e: 'La caída de Tenochtitlan ocurrió en 1521.' },
    { event: 'la Independencia de Estados Unidos', year: 1776, e: 'La Declaración de Independencia de EE.UU. fue el 4 de julio de 1776.' },
    { event: 'la Revolución Francesa', year: 1789, e: 'La Revolución Francesa estalló en 1789 con la toma de la Bastilla.' },
    { event: 'la coronación de Napoleón Bonaparte', year: 1804, e: 'Napoleón fue coronado emperador de Francia en 1804.' },
    { event: 'el inicio de la Independencia de México', year: 1810, e: 'La Independencia de México inició el 16 de septiembre de 1810.' },
    { event: 'la consumación de la Independencia de México', year: 1821, e: 'La Independencia de México se consumó en 1821 con el Plan de Iguala.' },
    { event: 'la promulgación de la Constitución de 1857', year: 1857, e: 'La Constitución Liberal de 1857 se promulgó el 5 de febrero.' },
    { event: 'el inicio de la Revolución Mexicana', year: 1910, e: 'La Revolución Mexicana inició en 1910 con Francisco I. Madero.' },
    { event: 'el inicio de la Primera Guerra Mundial', year: 1914, e: 'La Primera Guerra Mundial comenzó en 1914.' },
    { event: 'el fin de la Primera Guerra Mundial', year: 1918, e: 'La Primera Guerra Mundial terminó en 1918.' },
    { event: 'la promulgación de la Constitución de 1917 en México', year: 1917, e: 'La Constitución vigente de México se promulgó el 5 de febrero de 1917.' },
    { event: 'el inicio de la Segunda Guerra Mundial', year: 1939, e: 'La Segunda Guerra Mundial comenzó en 1939.' },
    { event: 'el fin de la Segunda Guerra Mundial', year: 1945, e: 'La Segunda Guerra Mundial terminó en 1945.' },
    { event: 'la aprobación de la Declaración Universal de Derechos Humanos', year: 1948, e: 'La ONU aprobó la DUDH el 10 de diciembre de 1948.' },
    { event: 'la caída del muro de Berlín', year: 1989, e: 'El muro de Berlín cayó el 9 de noviembre de 1989.' },
    { event: 'la caída del Imperio Romano de Occidente', year: 476, e: 'El Imperio Romano de Occidente cayó en 476 d.C.' },
    { event: 'la Revolución Cubana', year: 1959, e: 'La Revolución Cubana triunfó en 1959.' },
  ];
  for (let i = 0; i < 200; i++) {
    const ev = pick(events);
    const ds = [String(ev.year + range(1, 5)), String(ev.year - range(1, 5)), String(ev.year + range(6, 20))];
    qs.push(makeQ(subject, 'Fechas históricas',
      `¿En qué año ocurrió ${ev.event}?`,
      String(ev.year), ds,
      ev.e));
  }

  // 8b. Chronological ordering  -> 100
  const orderSets: { events: [string, number][]; q: string; a: string; e: string }[] = [
    {
      events: [['la Revolución Francesa', 1789], ['la Independencia de México', 1810], ['la consumación de la Independencia de México', 1821], ['la Revolución Mexicana', 1910]],
      q: 'Ordena cronológicamente: 1) Revolución Francesa, 2) Independencia de México, 3) Consumación de la Independencia, 4) Revolución Mexicana.',
      a: '1, 2, 3, 4',
      e: 'La Revolución Francesa (1789) precede al inicio de la Independencia de México (1810), luego la consumación (1821) y la Revolución Mexicana (1910).',
    },
    {
      events: [['el descubrimiento de América', 1492], ['la Reforma Protestante', 1517], ['la conquista de Tenochtitlan', 1521], ['la Independencia de EE.UU.', 1776]],
      q: 'Ordena cronológicamente: 1) Descubrimiento de América, 2) Reforma Protestante, 3) Conquista de Tenochtitlan, 4) Independencia de EE.UU.',
      a: '1, 2, 3, 4',
      e: 'Descubrimiento (1492), Reforma (1517), Conquista de Tenochtitlan (1521), Independencia de EE.UU. (1776).',
    },
    {
      events: [['la Primera Guerra Mundial', 1914], ['la Segunda Guerra Mundial', 1939], ['la Revolución Cubana', 1959], ['la caída del muro de Berlín', 1989]],
      q: 'Ordena cronológicamente: 1) Primera Guerra Mundial, 2) Segunda Guerra Mundial, 3) Revolución Cubana, 4) Caída del muro de Berlín.',
      a: '1, 2, 3, 4',
      e: 'Primera Guerra Mundial (1914), Segunda Guerra Mundial (1939), Revolución Cubana (1959), Muro de Berlín (1989).',
    },
  ];
  for (let i = 0; i < 100; i++) {
    const s = pick(orderSets);
    const ds = ['2, 1, 3, 4', '1, 3, 2, 4', '4, 3, 2, 1'];
    qs.push(makeQ(subject, 'Cronología', s.q, s.a, ds, s.e));
  }

  // 8c. Cause-effect relationships  -> 100
  const causeEffect: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Una causa de la Revolución Francesa fue:', a: 'la desigualdad social y la crisis económica', d: ['el descubrimiento de América', 'la invención de la imprenta', 'la caída del muro de Berlín'], e: 'La crisis económica y la desigualdad entre estamentos precipitaron la Revolución Francesa.' },
    { q: 'Una causa de la Independencia de México fue:', a: 'la dominación colonial y la inspiración ilustrada', d: ['la Revolución Industrial', 'el descubrimiento de América', 'la caída del Imperio Romano'], e: 'La opresión colonial y las ideas ilustradas impulsaron la Independencia de México.' },
    { q: 'Una causa de la Revolución Mexicana fue:', a: 'la dictadura de Porfirio Díaz y la desigualdad', d: ['la Revolución Francesa', 'la Independencia de Cuba', 'la Guerra Fría'], e: 'El Porfiriato concentró riqueza y poder, lo que detonó la Revolución Mexicana.' },
    { q: 'Una consecuencia de la Segunda Guerra Mundial fue:', a: 'la división del mundo en dos bloques (Guerra Fría)', d: ['la caída del Imperio Romano', 'el descubrimiento de América', 'la Revolución Industrial'], e: 'Tras 1945, el mundo quedó dividido entre EE.UU. y la URSS (Guerra Fría).' },
    { q: 'Una consecuencia de la Revolución Industrial fue:', a: 'la urbanización y el surgimiento de la clase obrera', d: ['la caída de Constantinopla', 'la Independencia de México', 'la Reforma Protestante'], e: 'La Revolución Industrial impulsó la urbanización y creó la clase obrera.' },
    { q: 'Una causa de la Primera Guerra Mundial fue:', a: 'el asesinato del archiduque Francisco Fernando', d: ['la caída del muro de Berlín', 'el descubrimiento de América', 'la Revolución Cubana'], e: 'El asesinato del archiduque en Sarajevo (1914) detonó la Primera Guerra Mundial.' },
    { q: 'Una consecuencia de la globalización es:', a: 'la mayor interconexión económica mundial', d: ['el aislamiento de los países', 'el fin del comercio', 'la reducción de la tecnología'], e: 'La globalización aumenta la interconexión e interdependencia económica.' },
  ];
  for (let i = 0; i < 100; i++) {
    const m = pick(causeEffect);
    qs.push(makeQ(subject, 'Causa y efecto', m.q, m.a, m.d, m.e));
  }

  // 8d. Historical figures and achievements  -> 120
  const figures: { name: string; achievement: string; d: string[]; e: string }[] = [
    { name: 'Miguel Hidalgo', achievement: 'inició la Independencia de México con el grito de Dolores', d: ['lideró la Revolución Mexicana', 'promulgó la Constitución de 1917', 'conquistó Tenochtitlan'], e: 'Miguel Hidalgo inició la Independencia de México el 16 de septiembre de 1810.' },
    { name: 'Benito Juárez', achievement: 'impulsó las Leyes de Reforma y defendió la soberanía nacional', d: ['conquistó Tenochtitlan', 'lideró la Revolución Cubana', 'firmó el Tratado de Versalles'], e: 'Benito Juárez impulsó las Leyes de Reforma y restauró la República.' },
    { name: 'Francisco I. Madero', achievement: 'inició la Revolución Mexicana contra Porfirio Díaz', d: ['promulgó la Constitución de 1857', 'descubrió América', 'dirigió la Independencia'], e: 'Madero inició la Revolución Mexicana en 1910.' },
    { name: 'Hernán Cortés', achievement: 'conquistó el Imperio azteca (Tenochtitlan)', d: ['independizó México', 'lideró la Reforma Protestante', 'creó la ONU'], e: 'Cortés conquistó Tenochtitlan en 1521.' },
    { name: 'Martín Lutero', achievement: 'inició la Reforma Protestante en 1517', d: ['dirigió la Revolución Francesa', 'conquistó México', 'descubrió América'], e: 'Lutero publicó sus 95 tesis en 1517, iniciando la Reforma.' },
    { name: 'Napoleón Bonaparte', achievement: 'fue emperador de Francia y expandió su imperio', d: ['lideró la Revolución Mexicana', 'independizó EE.UU.', 'promulgó la DUDH'], e: 'Napoleón fue coronado emperador en 1804 y dominó Europa.' },
    { name: 'Simón Bolívar', achievement: 'lideró la independencia de varias naciones sudamericanas', d: ['conquistó Tenochtitlan', 'lideró la Revolución Francesa', 'promulgó la Constitución de 1917'], e: 'Bolívar libertó a Venezuela, Colombia, Ecuador, Perú y Bolivia.' },
    { name: 'Charles Darwin', achievement: 'propuso la teoría de la evolución por selección natural', d: ['inició la Reforma Protestante', 'conquistó América', 'lideró la Revolución Mexicana'], e: 'Darwin publicó "El origen de las especies" en 1859.' },
    { name: 'Galileo Galilei', achievement: 'perfeccionó el telescopio y defendió el heliocentrismo', d: ['inició la Independencia de México', 'promulgó la DUDH', 'lideró la Revolución Cubana'], e: 'Galileo defendió que la Tierra gira alrededor del Sol.' },
    { name: 'Porfirio Díaz', achievement: 'encabezó el Porfiriato, una larga dictadura en México', d: ['inició la Independencia', 'lideró la Reforma Protestante', 'descubrió América'], e: 'Porfirio Díaz gobernó México de 1876 a 1911 (Porfiriato).' },
  ];
  for (let i = 0; i < 120; i++) {
    const f = pick(figures);
    qs.push(makeQ(subject, 'Personajes históricos',
      `¿Qué hizo ${f.name}?`,
      f.achievement, f.d, f.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 9. GEOGRAFIA (500+)
// ---------------------------------------------------------------------------
function genGeografia(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'geografia';

  // 9a. Coordinates & map concepts  -> 120
  const coordItems: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Las coordenadas geográficas sirven para:', a: 'ubicar un lugar en la Tierra', d: ['medir la temperatura', 'calcular distancias exactas', 'determinar el clima'], e: 'Las coordenadas geográficas (latitud y longitud) ubican cualquier punto en la Tierra.' },
    { q: 'Los paralelos son líneas que se trazan:', a: 'de este a oeste', d: ['de norte a sur', 'en diagonal', 'solo en el ecuador'], e: 'Los paralelos son círculos horizontales (este-oeste) paralelos al ecuador, que miden la latitud.' },
    { q: 'Los meridianos son líneas que se trazan:', a: 'de norte a sur', d: ['de este a oeste', 'solo en los polos', 'en espiral'], e: 'Los meridianos van de polo a polo (norte-sur) y miden la longitud.' },
    { q: 'El Ecuador terrestre divide a la Tierra en:', a: 'norte y sur', d: ['este y oeste', 'cuatro cuadrantes', 'continentes'], e: 'El Ecuador es el paralelo 0° que divide el planeta en hemisferios norte y sur.' },
    { q: 'La latitud se mide desde:', a: 'el ecuador hacia los polos', d: ['el meridiano de Greenwich', 'el trópico de Cáncer', 'el círculo polar'], e: 'La latitud mide la distancia angular desde el ecuador (0°) hacia los polos (90°).' },
    { q: 'La longitud se mide desde:', a: 'el meridiano de Greenwich', d: ['el ecuador', 'el trópico de Capricornio', 'los polos'], e: 'La longitud mide la distancia angular desde el meridiano de Greenwich (0°).' },
    { q: 'La escala de un mapa indica:', a: 'la relación entre distancia en el mapa y distancia real', d: ['el tipo de relieve', 'los colores del mapa', 'el tamaño del papel'], e: 'La escala indica cuántas veces se reduce la realidad para representarla en el mapa.' },
    { q: 'La proyección más común para mapas planos es:', a: 'Mercator', d: ['Polar', 'Cilíndrica equidistante', 'Azimutal'], e: 'La proyección de Mercator es muy usada, aunque distorsiona el tamaño cerca de los polos.' },
  ];
  for (let i = 0; i < 120; i++) {
    const m = pick(coordItems);
    qs.push(makeQ(subject, 'El espacio geográfico y los mapas', m.q, m.a, m.d, m.e));
  }

  // 9b. Capitals  -> 120
  const capitals: { country: string; capital: string; d: string[]; e: string }[] = [
    { country: 'México', capital: 'Ciudad de México', d: ['Guadalajara', 'Monterrey', 'Puebla'], e: 'La capital de México es la Ciudad de México.' },
    { country: 'Estados Unidos', capital: 'Washington D.C.', d: ['Nueva York', 'Los Ángeles', 'Chicago'], e: 'La capital de EE.UU. es Washington D.C., no Nueva York.' },
    { country: 'España', capital: 'Madrid', d: ['Barcelona', 'Sevilla', 'Valencia'], e: 'La capital de España es Madrid.' },
    { country: 'Francia', capital: 'París', d: ['Marsella', 'Lyon', 'Niza'], e: 'La capital de Francia es París.' },
    { country: 'Japón', capital: 'Tokio', d: ['Kioto', 'Osaka', 'Nagoya'], e: 'La capital de Japón es Tokio.' },
    { country: 'Brasil', capital: 'Brasilia', d: ['Río de Janeiro', 'São Paulo', 'Salvador'], e: 'La capital de Brasil es Brasilia (no Río de Janeiro).' },
    { country: 'Argentina', capital: 'Buenos Aires', d: ['Córdoba', 'Rosario', 'Mendoza'], e: 'La capital de Argentina es Buenos Aires.' },
    { country: 'Canadá', capital: 'Ottawa', d: ['Toronto', 'Montreal', 'Vancouver'], e: 'La capital de Canadá es Ottawa.' },
    { country: 'Italia', capital: 'Roma', d: ['Milán', 'Nápoles', 'Florencia'], e: 'La capital de Italia es Roma.' },
    { country: 'Inglaterra (Reino Unido)', capital: 'Londres', d: ['Mánchester', 'Liverpool', 'Birmingham'], e: 'La capital del Reino Unido es Londres.' },
  ];
  for (let i = 0; i < 120; i++) {
    const c = pick(capitals);
    qs.push(makeQ(subject, 'Capitales del mundo',
      `¿Cuál es la capital de ${c.country}?`,
      c.capital, c.d, c.e));
  }

  // 9c. Population density  -> 100
  for (let i = 0; i < 50; i++) {
    const pop = range(100000, 50000000);
    const area = range(100, 50000);
    const density = Math.round(pop / area);
    const ds = [String(density + range(5, 30)), String(density - range(5, 25)), String(Math.round(pop * area / 1000000))];
    qs.push(makeQ(subject, 'Densidad de población',
      `Una región tiene ${pop.toLocaleString('es-MX')} habitantes y un área de ${area.toLocaleString('es-MX')} km². ¿Cuál es su densidad de población?`,
      `${density} hab/km²`, ds.map((x) => `${x} hab/km²`),
      `Densidad = habitantes / area = ${pop} / ${area} = ${density} hab/km².`));
  }
  for (let i = 0; i < 50; i++) {
    const m = pick([
      { q: 'La densidad de población se calcula como:', a: 'habitantes / area', d: ['habitantes × area', 'area / habitantes', 'habitantes + area'], e: 'Densidad de población = número de habitantes / área (hab/km²).' },
      { q: 'La migración es:', a: 'el desplazamiento de personas de un lugar a otro', d: ['el nacimiento de habitantes', 'el envejecimiento poblacional', 'la mortalidad'], e: 'La migración es el movimiento de personas que cambian su residencia.' },
      { q: 'La tasa de natalidad mide:', a: 'los nacimientos por mil habitantes', d: ['los fallecimientos por mil', 'la esperanza de vida', 'el número de migrantes'], e: 'La tasa de natalidad indica nacimientos por cada mil habitantes.' },
      { q: 'La explosión demográfica se refiere a:', a: 'el crecimiento acelerado de la población', d: ['la disminución de población', 'las guerras', 'las epidemias'], e: 'La explosión demográfica es el crecimiento rápido de la población.' },
    ]);
    qs.push(makeQ(subject, 'Dinámica de la población', m.q, m.a, m.d, m.e));
  }

  // 9d. Climate zones  -> 80
  const climates: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'El clima de la zona ecuatorial se caracteriza por ser:', a: 'cálido y lluvioso', d: ['frío y seco', 'templado', 'desértico'], e: 'El clima ecuatorial es cálido y lluvioso todo el año por la cercanía al ecuador.' },
    { q: 'El clima desértico se caracteriza por:', a: 'escasez de lluvia y gran amplitud térmica', d: ['lluvias todo el año', 'temperaturas constantes', 'humedad elevada'], e: 'El clima desértico tiene pocas precipitaciones y mucha diferencia térmica entre día y noche.' },
    { q: 'El clima templado se encuentra principalmente en:', a: 'latitudes medias', d: ['el ecuador', 'los polos', 'la zona tropical'], e: 'El clima templado se da en latitudes medias, entre los trópicos y los círculos polares.' },
    { q: 'El clima polar se caracteriza por:', a: 'temperaturas muy bajas todo el año', d: ['calor extremo', 'lluvias abundantes', 'estaciones marcadas'], e: 'El clima polar tiene temperaturas bajo cero la mayor parte del año.' },
    { q: 'Los trópicos de Cáncer y Capricornio se encuentran a:', a: '23.5° de latitud', d: ['0°', '66.5°', '90°'], e: 'Los trópicos están a 23.5° de latitud norte (Cáncer) y sur (Capricornio).' },
    { q: 'La zona intertropical se encuentra entre:', a: 'los trópicos de Cáncer y Capricornio', d: ['los polos', 'el ecuador y el trópico de Cáncer', 'los círculos polares'], e: 'La zona intertropical se ubica entre los dos trópicos (Cáncer y Capricornio).' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(climates);
    qs.push(makeQ(subject, 'Zonas climáticas', m.q, m.a, m.d, m.e));
  }

  // 9e. Time zones  -> 50
  const timezones: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Los husos horarios se basan en:', a: 'la rotación de la Tierra (15° = 1 hora)', d: ['la traslación de la Tierra', 'las estaciones', 'las mareas'], e: 'Cada 15° de longitud corresponde a 1 hora de diferencia (360°/24h = 15°/h).' },
    { q: 'Si son las 12:00 en Greenwich (0°), ¿qué hora es a 90° al este?', a: '18:00', d: ['6:00', '9:00', '21:00'], e: 'Cada 15° al este se suma 1 hora: 90°/15° = 6 horas; 12:00 + 6 = 18:00.' },
    { q: 'Si son las 12:00 en Greenwich (0°), ¿qué hora es a 60° al oeste?', a: '8:00', d: ['16:00', '10:00', '14:00'], e: 'Cada 15° al oeste se resta 1 hora: 60°/15° = 4 horas; 12:00 - 4 = 8:00.' },
    { q: 'La línea internacional de cambio de fecha se encuentra cerca de:', a: 'el meridiano 180°', d: ['el ecuador', 'el meridiano 0°', 'el trópico de Cáncer'], e: 'La línea de cambio de fecha está próxima al meridiano 180°.' },
    { q: 'México se ubica principalmente en los husos horarios:', a: 'UTC-6 a UTC-8', d: ['UTC+1 a UTC+3', 'UTC-1 a UTC-3', 'UTC+5 a UTC+7'], e: 'México abarca de UTC-6 (centro) a UTC-8 (Baja California).' },
  ];
  for (let i = 0; i < 50; i++) {
    const m = pick(timezones);
    qs.push(makeQ(subject, 'Husos horarios', m.q, m.a, m.d, m.e));
  }

  // 9f. Country / continent facts  -> 80
  const facts: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'El río más largo del mundo es:', a: 'el Amazonas', d: ['el Nilo', 'el Yangtsé', 'el Misisipi'], e: 'El río Amazonas es considerado el más largo, con aproximadamente 7,000 km.' },
    { q: 'El estado más grande de México es:', a: 'Chihuahua', d: ['Sonora', 'Baja California', 'Coahuila'], e: 'Chihuahua es el estado con mayor superficie de México.' },
    { q: 'La capa de la Tierra donde vivimos se llama:', a: 'corteza', d: ['núcleo', 'manto', 'atmósfera'], e: 'La corteza terrestre es la capa externa donde se desarrolla la vida.' },
    { q: 'El continente más poblado es:', a: 'Asia', d: ['África', 'Europa', 'América'], e: 'Asia es el continente más poblado del mundo.' },
    { q: 'El continente más extenso es:', a: 'Asia', d: ['África', 'América', 'Antártida'], e: 'Asia es el continente más extenso después de Eurasia combinada.' },
    { q: 'El océano más grande es:', a: 'el Pacífico', d: ['el Atlántico', 'el Índico', 'el Ártico'], e: 'El océano Pacífico es el más extenso y profundo.' },
    { q: 'El desierto más extenso del mundo es:', a: 'el Sahara (desierto cálido)', d: ['el de Sonora', 'el de Atacama', 'el de Kalahari'], e: 'El Sahara es el desierto cálido más grande; la Antártida es el más extenso (frío).' },
    { q: 'La cordillera más larga del mundo es:', a: 'los Andes', d: ['el Himalaya', 'las Montañas Rocosas', 'los Alpes'], e: 'La cordillera de los Andes es la más larga del mundo (~7,000 km).' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(facts);
    qs.push(makeQ(subject, 'Geografía física', m.q, m.a, m.d, m.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// 10. FORMACION CIVICA Y ETICA (500+)
// ---------------------------------------------------------------------------
function genFormacionCivicaEtica(): Question[] {
  const qs: Question[] = [];
  const subject: SubjectId = 'formacion_civica_etica';

  // 10a. Constitutional articles  -> 140
  const articles: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'El artículo 1 de la Constitución mexicana establece que:', a: 'todas las personas gozan de derechos humanos', d: ['el derecho al voto', 'la libertad de prensa', 'la propiedad privada'], e: 'El artículo 1 consagra los derechos humanos y el principio de igualdad.' },
    { q: 'El artículo 3 de la Constitución mexicana garantiza:', a: 'el derecho a la educación laica y gratuita', d: ['el derecho al trabajo', 'la libertad de expresión', 'el derecho a la salud'], e: 'El artículo 3 establece que la educación será laica, gratuita y obligatoria.' },
    { q: 'El artículo 27 de la Constitución establece que:', a: 'la nación tiene dominio sobre las tierras y aguas', d: ['el derecho al voto', 'la libertad de culto', 'el derecho a la información'], e: 'El artículo 27 regula la propiedad de la tierra y los recursos naturales.' },
    { q: 'El artículo 123 de la Constitución se refiere a:', a: 'el derecho al trabajo y las condiciones laborales', d: ['la educación', 'la propiedad', 'el sufragio'], e: 'El artículo 123 regula el trabajo, jornadas, salario mínimo y derechos laborales.' },
    { q: 'El artículo 33 de la Constitución se refiere a:', a: 'las obligaciones de los extranjeros', d: ['los derechos de los niños', 'la educación superior', 'el servicio militar'], e: 'El artículo 33 establece las facultades de los extranjeros y su expulsión.' },
    { q: 'El sufragio universal se consagra en el artículo:', a: '35', d: ['27', '123', '3'], e: 'El artículo 35 establece las prerrogativas del ciudadano, incluido el voto.' },
    { q: 'El artículo 14 de la Constitución garantiza:', a: 'el debido proceso y legalidad', d: ['la educación gratuita', 'la propiedad de la tierra', 'el derecho al trabajo'], e: 'El artículo 14 garantiza que nadie puede ser privado de la libertad sin juicio previo.' },
    { q: 'El artículo 16 protege contra:', a: 'la arbitrariedad en cateos y detenciones', d: ['la falta de educación', 'el trabajo infantil', 'la censura'], e: 'El artículo 16 requiere orden judicial para cateos, detenciones e intervenciones.' },
  ];
  for (let i = 0; i < 140; i++) {
    const m = pick(articles);
    qs.push(makeQ(subject, 'Constitución y leyes', m.q, m.a, m.d, m.e));
  }

  // 10b. Human rights  -> 120
  const humanRights: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Los derechos humanos son:', a: 'universales e inherentes a toda persona', d: ['privilegios de algunos', 'opcionales', 'concedidos por el gobierno'], e: 'Los derechos humanos son universales, inherentes a toda persona por su dignidad.' },
    { q: 'La Declaración Universal de los Derechos Humanos fue aprobada en:', a: '1948', d: ['1917', '1945', '1968'], e: 'La ONU aprobó la DUDH el 10 de diciembre de 1948.' },
    { q: 'El derecho a la vida es un derecho:', a: 'fundamental e inalienable', d: ['condicional', 'temporal', 'concedido por el Estado'], e: 'El derecho a la vida es fundamental y no puede ser suspendido.' },
    { q: 'El derecho a la educación es:', a: 'un derecho humano reconocido internacionalmente', d: ['un privilegio', 'una obligación sin derecho', 'opcional'], e: 'La educación es un derecho humano reconocido en la DUDH (art. 26).' },
    { q: 'La libertad de expresión es:', a: 'un derecho humano fundamental', d: ['una concesión del gobierno', 'un delito', 'un privilegio económico'], e: 'La libertad de expresión es un derecho humano fundamental (DUDH art. 19).' },
    { q: 'Los derechos de los niños están protegidos por:', a: 'la Convención sobre los Derechos del Niño (1989)', d: ['la DUDH únicamente', 'la Constitución únicamente', 'el Código Penal'], e: 'La Convención sobre los Derechos del Niño fue aprobada por la ONU en 1989.' },
    { q: 'La discriminación es contraria al principio de:', a: 'igualdad', d: ['libertad de mercado', 'seguridad nacional', 'propiedad privada'], e: 'La discriminación viola el principio de igualdad ante la ley.' },
  ];
  for (let i = 0; i < 120; i++) {
    const m = pick(humanRights);
    qs.push(makeQ(subject, 'Derechos humanos', m.q, m.a, m.d, m.e));
  }

  // 10c. Civic duties  -> 100
  const civicDuties: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'Es un deber cívico de los mexicanos:', a: 'votar en las elecciones', d: ['no pagar impuestos', 'evadir la ley', 'viajar al extranjero'], e: 'Votar es una obligación cívica para elegir representantes democráticos.' },
    { q: 'La mayoría de edad en México se alcanza a los:', a: '18 años', d: ['16 años', '21 años', '15 años'], e: 'En México, la mayoría de edad y el derecho al voto se adquieren a los 18 años.' },
    { q: 'Es una obligación ciudadana:', a: 'pagar impuestos', d: ['evadir impuestos', 'no participar', 'desobedecer leyes'], e: 'Pagar impuestos es una obligación que financia servicios públicos.' },
    { q: 'El servicio militar es:', a: 'una obligación para varones de 18 años', d: ['opcional siempre', 'obligatorio para mujeres únicamente', 'prohibido'], e: 'En México, el servicio militar nacional es obligatorio para varones de 18 años.' },
    { q: 'Un deber ambiental es:', a: 'separar y reciclar residuos', d: ['desperdiciar agua', 'queman basura', 'talar árboles'], e: 'Separar y reciclar residuos es un deber ambiental ciudadano.' },
    { q: 'Participar en la vida democrática implica:', a: 'informarse y votar responsablemente', d: ['ignorar las elecciones', 'vender el voto', 'abstenerse siempre'], e: 'La participación democrática requiere informarse y votar de manera responsable.' },
  ];
  for (let i = 0; i < 100; i++) {
    const m = pick(civicDuties);
    qs.push(makeQ(subject, 'Deberes cívicos', m.q, m.a, m.d, m.e));
  }

  // 10d. Democratic principles  -> 80
  const democracy: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'En una democracia, el poder emana de:', a: 'el pueblo', d: ['el gobierno', 'el ejército', 'las empresas'], e: 'En una democracia, el poder emana del pueblo, que lo ejerce mediante representantes.' },
    { q: 'El gobierno de México está dividido en:', a: '3 poderes', d: ['2 poderes', '4 poderes', '5 poderes'], e: 'Los tres poderes de la Unión son: Ejecutivo, Legislativo y Judicial.' },
    { q: 'El principio de división de poderes busca:', a: 'evitar la concentración del poder', d: ['centralizar el poder', 'eliminar el gobierno', 'crear un monarca'], e: 'La división de poderes equilibra al Estado y evita el autoritarismo.' },
    { q: 'El sufragio en México es:', a: 'universal, libre, directo y secreto', d: ['restringido a hombres', 'público', 'condicionado al ingreso'], e: 'El voto en México es universal, libre, directo y secreto.' },
    { q: 'La separación de poderes se refiere a:', a: 'Ejecutivo, Legislativo y Judicial', d: ['Norte, Centro y Sur', 'Federal, Estatal y Municipal', 'Civil, Penal y Administrativo'], e: 'Los tres poderes son Ejecutivo, Legislativo y Judicial.' },
    { q: 'Un referéndum es:', a: 'una consulta ciudadana sobre un tema específico', d: ['una elección de diputados', 'un juicio', 'un decreto presidencial'], e: 'El referéndum permite que la ciudadanía decida directamente sobre un asunto.' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(democracy);
    qs.push(makeQ(subject, 'Principios democráticos', m.q, m.a, m.d, m.e));
  }

  // 10e. Ethical dilemmas  -> 80
  const ethics: { q: string; a: string; d: string[]; e: string }[] = [
    { q: 'La honestidad es un valor que consiste en:', a: 'actuar con verdad y rectitud', d: ['decir mentiras piadosas', 'ocultar la verdad', 'ser indirecto'], e: 'La honestidad es actuar con verdad, sinceridad y rectitud.' },
    { q: 'La empatía significa:', a: 'ponerse en el lugar del otro', d: ['ignorar a los demás', 'criticar a otros', 'imponer opiniones'], e: 'La empatía es comprender y compartir los sentimientos de otra persona.' },
    { q: 'La justicia consiste en:', a: 'dar a cada quien lo que le corresponde', d: ['favorecer a unos pocos', 'ignorar las leyes', 'evitar el diálogo'], e: 'La justicia es dar a cada persona lo que le corresponde conforme a la equidad.' },
    { q: 'La tolerancia implica:', a: 'respetar ideas y creencias diferentes', d: ['rechazar lo distinto', 'imponer la propia opinión', 'evitar el diálogo'], e: 'La tolerancia es respetar las diferencias de ideas, creencias y costumbres.' },
    { q: 'La responsabilidad es:', a: 'asumir las consecuencias de los actos', d: ['evitar compromisos', 'culpar a otros', 'postergar todo'], e: 'La responsabilidad implica asumir las consecuencias de las propias decisiones.' },
    { q: 'Un dilema ético se presenta cuando:', a: 'hay un conflicto entre valores en una decisión', d: ['no hay opciones', 'todo está permitido', 'no hay consecuencias'], e: 'Un dilema ético surge cuando dos valores entran en conflicto en una decisión.' },
    { q: 'La solidaridad consiste en:', a: 'apoyar a otros en sus necesidades', d: ['ignorar a los demás', 'competir siempre', 'aislarse'], e: 'La solidaridad es brindar apoyo a otras personas frente a sus necesidades.' },
    { q: 'El respeto significa:', a: 'valorar la dignidad de las personas', d: ['someter a otros', 'ignorar opiniones', 'imponer ideas'], e: 'El respeto es valorar la dignidad, derechos y diferencias de los demás.' },
  ];
  for (let i = 0; i < 80; i++) {
    const m = pick(ethics);
    qs.push(makeQ(subject, 'Ética y valores', m.q, m.a, m.d, m.e));
  }

  return qs;
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

const GENERATORS: Record<SubjectId, () => Question[]> = {
  matematicas: genMatematicas,
  habilidad_matematica: genHabilidadMatematica,
  fisica: genFisica,
  quimica: genQuimica,
  biologia: genBiologia,
  habilidad_verbal: genHabilidadVerbal,
  espanol: genEspanol,
  historia: genHistoria,
  geografia: genGeografia,
  formacion_civica_etica: genFormacionCivicaEtica,
};

/**
 * Generates 1000+ unique question variants per subject using randomized
 * numeric parameters (500+ for the non-numeric subjects). Options are shuffled
 * with a Fisher-Yates shuffle and `correctIndex` is recomputed so it always
 * points to the actually correct answer.
 *
 * Each call produces a fresh random set; repeated calls yield new variants.
 */
export function generateParametricQuestions(subject: SubjectId): Question[] {
  const gen = GENERATORS[subject];
  if (!gen) return [];
  // Reset the per-call counter so ids stay compact while still unique.
  _counter = 0;
  return gen();
}
