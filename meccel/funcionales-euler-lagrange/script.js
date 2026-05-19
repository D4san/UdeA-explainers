const $ = (selector) => document.querySelector(selector);

const epsilon = $("#epsilon");
const epsilonValue = $("#epsilonValue");
const areaValue = $("#areaValue");
const normValue = $("#normValue");
const lengthValue = $("#lengthValue");
const curveSvg = $("#curveSvg");
const arcSvg = $("#arcSvg");

const mass1 = $("#mass1");
const mass2 = $("#mass2");
const spring = $("#spring");
const mass1Value = $("#mass1Value");
const mass2Value = $("#mass2Value");
const springValue = $("#springValue");
const totalMassValue = $("#totalMassValue");
const reducedMassValue = $("#reducedMassValue");
const omegaValue = $("#omegaValue");
const eqMotion = $("#eqMotion");
const coupledSvg = $("#coupledSvg");

const steps = [
  {
    title: "1. El objeto que se quiere estacionar",
    equation: "$$I[f]=\\int_a^b L(f(t),\\dot f(t),t)\\,dt$$",
    text: "El funcional recibe una función completa f(t) y devuelve un número. La pregunta variacional no busca un valor de t, sino una función f que haga estacionario a I."
  },
  {
    title: "2. La función candidata y sus vecinas",
    equation: "$$f(t;\\epsilon)=f_0(t)+\\epsilon\\eta(t)$$",
    text: "f0 es la candidata. η dice la forma de la deformación y ε mide su amplitud. Cambiar ε no recorre la curva: cambia la curva completa."
  },
  {
    title: "3. El funcional se vuelve una función de ε",
    equation: "$$I(\\epsilon)=I[f_0+\\epsilon\\eta]=\\int_a^b L(f(t;\\epsilon),\\dot f(t;\\epsilon),t)\\,dt$$",
    text: "Una vez elegida la dirección η, el problema en el espacio de funciones se reduce a estudiar una función ordinaria de ε."
  },
  {
    title: "4. Condición de estacionariedad",
    equation: "$$\\left.\\frac{dI}{d\\epsilon}\\right|_{\\epsilon=0}=0$$",
    text: "Miramos la pendiente de I(ε) justo en ε=0, es decir, alrededor de la función candidata f0. Esa pendiente debe ser cero para toda variación admisible."
  },
  {
    title: "5. Regla de la cadena dentro de la integral",
    equation: "$$\\frac{dI}{d\\epsilon}=\\int_a^b\\left(\\frac{\\partial L}{\\partial f}\\frac{\\partial f}{\\partial\\epsilon}+\\frac{\\partial L}{\\partial \\dot f}\\frac{\\partial \\dot f}{\\partial\\epsilon}\\right)dt$$",
    text: "L depende de f y de f punto. Como ambas dependen de ε, derivar I exige aplicar la regla de la cadena."
  },
  {
    title: "6. Qué valen las derivadas respecto a ε",
    equation: "$$\\frac{\\partial f}{\\partial\\epsilon}=\\eta,\\qquad \\frac{\\partial\\dot f}{\\partial\\epsilon}=\\dot\\eta$$",
    text: "Esto produce dI/dε = ∫[(∂L/∂f)η + (∂L/∂f punto)η punto]dt. El término con η punto todavía no permite usar la arbitrariedad de η."
  },
  {
    title: "7. Integración por partes",
    equation: "$$\\int_a^b\\frac{\\partial L}{\\partial\\dot f}\\dot\\eta\\,dt=\\left[\\frac{\\partial L}{\\partial\\dot f}\\eta\\right]_a^b-\\int_a^b\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial\\dot f}\\right)\\eta\\,dt$$",
    text: "Como los extremos son fijos, η(a)=η(b)=0. Por eso el término de frontera desaparece."
  },
  {
    title: "8. Euler-Lagrange",
    equation: "$$\\int_a^b\\left[\\frac{\\partial L}{\\partial f}-\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial\\dot f}\\right)\\right]\\eta(t)\\,dt=0\\quad\\Rightarrow\\quad\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial\\dot f}\\right)-\\frac{\\partial L}{\\partial f}=0$$",
    text: "Como η es arbitraria en el interior, el factor entre corchetes debe anularse. Esta es la condición local que reemplaza a la estacionariedad global del funcional."
  }
];

function f0(t) {
  return t;
}

function eta(t) {
  return Math.sin(Math.PI * t);
}

function varied(t, eps) {
  return f0(t) + eps * eta(t);
}

function dVaried(t, eps) {
  return 1 + eps * Math.PI * Math.cos(Math.PI * t);
}

function integrate(fn, n = 900) {
  let total = 0;
  const h = 1 / n;
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) * h;
    total += fn(t) * h;
  }
  return total;
}

function point(t, y) {
  const x = 70 + t * 580;
  const yy = 300 - y * 220;
  return [x, yy];
}

function pathFor(fn, samples = 160) {
  const parts = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const [x, y] = point(t, fn(t));
    parts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return parts.join(" ");
}

function areaPath(fn, samples = 160) {
  const start = point(0, 0);
  const end = point(1, 0);
  return `M ${start[0]} ${start[1]} ${pathFor(fn, samples).replace("M", "L")} L ${end[0]} ${end[1]} Z`;
}

function renderCurve() {
  const eps = Number(epsilon.value);
  epsilonValue.textContent = eps.toFixed(2);

  const area = integrate((t) => varied(t, eps));
  const norm = integrate((t) => varied(t, eps) ** 2);
  const length = integrate((t) => Math.sqrt(1 + dVaried(t, eps) ** 2));

  areaValue.textContent = area.toFixed(3);
  normValue.textContent = norm.toFixed(3);
  lengthValue.textContent = length.toFixed(3);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((v) => {
    const [x] = point(v, 0);
    const [, y] = point(0, v);
    return `<line class="grid" x1="${x}" y1="70" x2="${x}" y2="300"></line>
      <line class="grid" x1="70" y1="${y}" x2="650" y2="${y}"></line>`;
  }).join("");

  curveSvg.innerHTML = `
    ${gridLines}
    <line class="axis" x1="70" y1="300" x2="650" y2="300"></line>
    <line class="axis" x1="70" y1="300" x2="70" y2="70"></line>
    <path class="curve-area" d="${areaPath((t) => varied(t, eps))}"></path>
    <path class="curve-base" d="${pathFor(f0)}"></path>
    <path class="eta" d="${pathFor((t) => 0.5 + 0.18 * eta(t))}"></path>
    <path class="curve-varied" d="${pathFor((t) => varied(t, eps))}"></path>
    <text class="label" x="88" y="92">curva variada: f₀ + εη</text>
    <text class="label" x="382" y="116">η(t), dibujada aparte</text>
    <text class="label" x="445" y="286">f₀(t)=t</text>
    <text class="label" x="648" y="322">t</text>
  `;
}

function renderStep(index) {
  $("#stepTitle").textContent = steps[index].title;
  $("#stepEquation").innerHTML = steps[index].equation;
  $("#stepText").textContent = steps[index].text;
  document.querySelectorAll(".step-button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.step) === index);
  });
  if (window.MathJax) {
    window.MathJax.typesetPromise([$("#stepEquation")]);
  }
}

function arcPoint(x, y) {
  return [90 + x * 580, 235 - y * 150];
}

function arcPath(fn, samples = 140) {
  const parts = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = i / samples;
    const [px, py] = arcPoint(x, fn(x));
    parts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return parts.join(" ");
}

function arcLength(fn, dfn) {
  return integrate((x) => Math.sqrt(1 + dfn(x) ** 2), 900);
}

function renderArcExample() {
  const straight = (x) => 0.22 + 0.58 * x;
  const wavy = (x) => straight(x) + 0.16 * Math.sin(2 * Math.PI * x);
  const dStraight = () => 0.58;
  const dWavy = (x) => 0.58 + 0.32 * Math.PI * Math.cos(2 * Math.PI * x);
  const straightLength = arcLength(straight, dStraight);
  const wavyLength = arcLength(wavy, dWavy);
  const [x0, y0] = arcPoint(0, straight(0));
  const [x1, y1] = arcPoint(1, straight(1));

  arcSvg.innerHTML = `
    <line class="axis" x1="70" y1="240" x2="700" y2="240"></line>
    <line class="axis" x1="90" y1="250" x2="90" y2="48"></line>
    <path class="curve-base" d="${arcPath(wavy)}"></path>
    <path class="curve-varied" d="${arcPath(straight)}"></path>
    <circle class="endpoint" cx="${x0}" cy="${y0}" r="7"></circle>
    <circle class="endpoint" cx="${x1}" cy="${y1}" r="7"></circle>
    <text class="label" x="98" y="48">mismos extremos</text>
    <text class="label" x="390" y="118">curva vecina</text>
    <text class="label" x="428" y="176">recta extrema</text>
    <text class="label" x="104" y="276">longitud recta ≈ ${straightLength.toFixed(3)}</text>
    <text class="label" x="382" y="276">longitud curva ≈ ${wavyLength.toFixed(3)}</text>
  `;
}

function springPath(x0, x1, y) {
  const coils = 10;
  const width = x1 - x0;
  const segment = width / (coils * 2);
  const points = [`M ${x0} ${y}`];
  for (let i = 1; i <= coils * 2; i += 1) {
    const x = x0 + i * segment;
    const yy = y + (i % 2 === 0 ? -18 : 18);
    points.push(`L ${x.toFixed(1)} ${yy}`);
  }
  points.push(`L ${x1} ${y}`);
  return points.join(" ");
}

function renderCoupledOscillator() {
  const m1 = Number(mass1.value);
  const m2 = Number(mass2.value);
  const k = Number(spring.value);
  const M = m1 + m2;
  const mu = (m1 * m2) / M;
  const omega = Math.sqrt(k / mu);
  const t = performance.now() / 1000;
  const rest = 260;
  const stretch = 58 * Math.cos(omega * t);
  const r = rest + stretch;
  const cm = 380;
  const x1 = cm - (m2 / M) * r;
  const x2 = cm + (m1 / M) * r;
  const w1 = 42 + m1 * 8;
  const w2 = 42 + m2 * 8;
  const y = 126;

  mass1Value.textContent = m1.toFixed(1);
  mass2Value.textContent = m2.toFixed(1);
  springValue.textContent = k.toFixed(1);
  totalMassValue.textContent = M.toFixed(2);
  reducedMassValue.textContent = mu.toFixed(2);
  omegaValue.textContent = omega.toFixed(3);
  eqMotion.textContent = `M X¨ = 0; μ s¨ + k s = 0`;

  coupledSvg.innerHTML = `
    <line class="axis" x1="70" y1="190" x2="690" y2="190"></line>
    <line class="cm-line" x1="${cm}" y1="58" x2="${cm}" y2="203"></line>
    <text class="label" x="${cm + 8}" y="72">X</text>
    <path class="spring-line" d="${springPath(x1 + w1 / 2, x2 - w2 / 2, y)}"></path>
    <rect class="mass-block mass-one" x="${x1 - w1 / 2}" y="${y - 35}" width="${w1}" height="70" rx="6"></rect>
    <rect class="mass-block mass-two" x="${x2 - w2 / 2}" y="${y - 35}" width="${w2}" height="70" rx="6"></rect>
    <line class="measure-line" x1="${x1}" y1="222" x2="${x2}" y2="222"></line>
    <text class="label" x="${x1 - 18}" y="${y + 5}">m₁</text>
    <text class="label" x="${x2 - 18}" y="${y + 5}">m₂</text>
    <text class="label" x="${(x1 + x2) / 2 - 34}" y="246">r = x₂ - x₁</text>
    <text class="label" x="82" y="38">L = 1/2 m₁ ẋ₁² + 1/2 m₂ ẋ₂² - 1/2 k(x₂ - x₁ - a)²</text>
    <text class="label" x="82" y="264">X libre; s = r - a oscila con μ = m₁m₂/(m₁+m₂)</text>
  `;

  requestAnimationFrame(renderCoupledOscillator);
}

epsilon.addEventListener("input", renderCurve);
$("#resetEpsilon").addEventListener("click", () => {
  epsilon.value = "0.35";
  renderCurve();
});

document.querySelectorAll(".step-button").forEach((button) => {
  button.addEventListener("click", () => renderStep(Number(button.dataset.step)));
});

mass1.addEventListener("input", renderCoupledOscillator);
mass2.addEventListener("input", renderCoupledOscillator);
spring.addEventListener("input", renderCoupledOscillator);

renderCurve();
renderStep(0);
renderArcExample();
renderCoupledOscillator();
