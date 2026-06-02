const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function typeset(target) {
  if (window.MathJax) {
    window.MathJax.typesetPromise(target ? [target] : undefined);
  }
}

function svgDefs() {
  return `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#267a69"></path>
      </marker>
    </defs>
  `;
}

const stepData = {
  energy: [
    {
      title: "1. Partir de un sistema natural",
      equation: "$$L=T-U,\\qquad U=U(q)$$",
      text: "La igualdad H = energía no es automática. Empezamos suponiendo que el potencial no depende de velocidades."
    },
    {
      title: "2. El momento conjugado viene de T",
      equation: "$$p_i=\\frac{\\partial L}{\\partial \\dot q_i}=\\frac{\\partial T}{\\partial \\dot q_i}$$",
      text: "Como U no depende de velocidades, derivar L respecto a q punto equivale a derivar T."
    },
    {
      title: "3. Usar homogeneidad cuadrática",
      equation: "$$\\sum_i\\frac{\\partial T}{\\partial\\dot q_i}\\dot q_i=2T$$",
      text: "Para coordenadas sin dependencia explícita en el tiempo, la energía cinética es cuadrática homogénea en las velocidades."
    },
    {
      title: "4. Sustituir en la transformación de Legendre",
      equation: "$$H=\\sum_i p_i\\dot q_i-L=2T-(T-U)=T+U$$",
      text: "Bajo estas condiciones, H coincide con la energía mecánica."
    }
  ],
  hflow: [
    {
      title: "1. Derivar H como función de fase",
      equation: "$$\\frac{dH}{dt}=\\sum_i\\left(\\frac{\\partial H}{\\partial q_i}\\dot q_i+\\frac{\\partial H}{\\partial p_i}\\dot p_i\\right)+\\frac{\\partial H}{\\partial t}$$",
      text: "Todavía no hay conservación: solo aplicamos regla de la cadena."
    },
    {
      title: "2. Insertar ecuaciones canónicas",
      equation: "$$\\dot q_i=\\frac{\\partial H}{\\partial p_i},\\qquad \\dot p_i=-\\frac{\\partial H}{\\partial q_i}$$",
      text: "Hamilton da la velocidad del punto en el espacio de fase."
    },
    {
      title: "3. Ver la cancelación",
      equation: "$$\\sum_i\\left(\\frac{\\partial H}{\\partial q_i}\\frac{\\partial H}{\\partial p_i}-\\frac{\\partial H}{\\partial p_i}\\frac{\\partial H}{\\partial q_i}\\right)=0$$",
      text: "Cada término se cancela con su gemelo de signo contrario."
    },
    {
      title: "4. Lo que queda",
      equation: "$$\\frac{dH}{dt}=\\frac{\\partial H}{\\partial t}$$",
      text: "Si H no depende explícitamente del tiempo, H es constante."
    }
  ],
  jacobi: [
    {
      title: "1. Hipótesis",
      equation: "$$\\frac{dF}{dt}=0,\\qquad \\frac{dG}{dt}=0$$",
      text: "F y G son constantes de movimiento, pero pueden depender explícitamente del tiempo."
    },
    {
      title: "2. Traducir conservación",
      equation: "$$\\{F,H\\}+\\frac{\\partial F}{\\partial t}=0,\\qquad \\{G,H\\}+\\frac{\\partial G}{\\partial t}=0$$",
      text: "Esta es la parte que se perdería si uno exigiera simplemente corchete cero con H."
    },
    {
      title: "3. Derivar el corchete",
      equation: "$$\\frac{d}{dt}\\{F,G\\}=\\{\\{F,G\\},H\\}+\\frac{\\partial}{\\partial t}\\{F,G\\}$$",
      text: "Tratamos a {F,G} como otra función del espacio de fase."
    },
    {
      title: "4. La parte explícita del tiempo",
      equation: "$$\\frac{\\partial}{\\partial t}\\{F,G\\}=\\left\\{\\frac{\\partial F}{\\partial t},G\\right\\}+\\left\\{F,\\frac{\\partial G}{\\partial t}\\right\\}$$",
      text: "El corchete deriva respecto a cada entrada."
    },
    {
      title: "5. Usar la conservación de F y G",
      equation: "$$\\frac{d}{dt}\\{F,G\\}=\\{\\{F,G\\},H\\}+\\{\\{H,F\\},G\\}-\\{F,\\{G,H\\}\\}$$",
      text: "Reescribimos las derivadas explícitas usando los corchetes con H."
    },
    {
      title: "6. Jacobi cierra la prueba",
      equation: "$$\\{\\{F,G\\},H\\}+\\{\\{G,H\\},F\\}+\\{\\{H,F\\},G\\}=0\\quad\\Rightarrow\\quad\\frac{d}{dt}\\{F,G\\}=0$$",
      text: "Las constantes de movimiento son cerradas bajo el corchete de Poisson."
    }
  ],
  total: [
    {
      title: "1. Modificar el lagrangiano",
      equation: "$$L'=L+\\frac{dF}{dt},\\qquad F=F(q_1,\\ldots,q_n,t)$$",
      text: "La función F no depende de velocidades. Esto será clave para que la cancelación funcione."
    },
    {
      title: "2. Expandir la derivada total",
      equation: "$$\\frac{dF}{dt}=\\frac{\\partial F}{\\partial t}+\\sum_j\\frac{\\partial F}{\\partial q_j}\\dot q_j$$",
      text: "El nuevo lagrangiano sí contiene velocidades a través del término lineal."
    },
    {
      title: "3. Momento conjugado nuevo",
      equation: "$$\\frac{\\partial L'}{\\partial\\dot q_i}=\\frac{\\partial L}{\\partial\\dot q_i}+\\frac{\\partial F}{\\partial q_i}$$",
      text: "Las ecuaciones no cambian, pero los momentos conjugados sí pueden cambiar."
    },
    {
      title: "4. Restar Euler-Lagrange",
      equation: "$$\\begin{aligned}\\frac{d}{dt}\\left(\\frac{\\partial L'}{\\partial\\dot q_i}\\right)-\\frac{\\partial L'}{\\partial q_i}&=\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial\\dot q_i}\\right)-\\frac{\\partial L}{\\partial q_i}\\\\&\\quad+\\sum_j\\left(\\frac{\\partial^2F}{\\partial q_j\\partial q_i}-\\frac{\\partial^2F}{\\partial q_i\\partial q_j}\\right)\\dot q_j\\\\&\\quad+\\left(\\frac{\\partial^2F}{\\partial t\\partial q_i}-\\frac{\\partial^2F}{\\partial q_i\\partial t}\\right).\\end{aligned}$$",
      text: "Todo lo nuevo queda escrito como diferencia de derivadas mixtas."
    },
    {
      title: "5. Cancelación",
      equation: "$$\\frac{\\partial^2F}{\\partial q_j\\partial q_i}=\\frac{\\partial^2F}{\\partial q_i\\partial q_j},\\qquad \\frac{\\partial^2F}{\\partial t\\partial q_i}=\\frac{\\partial^2F}{\\partial q_i\\partial t}$$",
      text: "Si F es suficientemente diferenciable, los términos extra se cancelan."
    },
    {
      title: "6. Misma ecuación de movimiento",
      equation: "$$\\frac{d}{dt}\\left(\\frac{\\partial L'}{\\partial\\dot q_i}\\right)-\\frac{\\partial L'}{\\partial q_i}=\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial\\dot q_i}\\right)-\\frac{\\partial L}{\\partial q_i}$$",
      text: "La trayectoria física no cambia; cambia la descripción."
    }
  ]
};

const stepIndex = { energy: 0, hflow: 0, jacobi: 0, total: 0 };

function renderStepper(name) {
  const data = stepData[name];
  const index = stepIndex[name];
  const title = $(`#${name}Title`);
  const equation = $(`#${name}Equation`);
  const text = $(`#${name}Text`);
  const dots = $(`#${name}Dots`);

  title.textContent = data[index].title;
  equation.innerHTML = data[index].equation;
  text.textContent = data[index].text;
  dots.innerHTML = data.map((_, i) => `<button class="step-dot ${i === index ? "active" : ""}" data-stepper-dot="${name}" data-step="${i}" aria-label="Ir al paso ${i + 1}"></button>`).join("");
  typeset(equation);
}

function setupSteppers() {
  Object.keys(stepData).forEach(renderStepper);
  $$("[data-step-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.stepNext;
      stepIndex[name] = (stepIndex[name] + 1) % stepData[name].length;
      renderStepper(name);
    });
  });
  $$("[data-step-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.stepPrev;
      stepIndex[name] = (stepIndex[name] - 1 + stepData[name].length) % stepData[name].length;
      renderStepper(name);
    });
  });
  document.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-stepper-dot]");
    if (!dot) return;
    const name = dot.dataset.stepperDot;
    stepIndex[name] = Number(dot.dataset.step);
    renderStepper(name);
  });
}

function renderLegendre() {
  const m = Number($("#legendreMass").value);
  const v = Number($("#legendreVelocity").value);
  const p = m * v;
  const t = 0.5 * m * v * v;
  const h = p * v - t;
  const svg = $("#legendreSvg");
  const mapX = (vv) => 90 + (vv + 3.5) * 82;
  const mapY = (val) => 305 - val * 18;
  const curve = [];
  for (let i = 0; i <= 160; i += 1) {
    const vv = -3.2 + (6.4 * i) / 160;
    const yy = 0.5 * m * vv * vv;
    curve.push(`${i === 0 ? "M" : "L"} ${mapX(vv).toFixed(2)} ${mapY(yy).toFixed(2)}`);
  }
  const tangent = [];
  for (let i = 0; i <= 80; i += 1) {
    const vv = v - 1.5 + (3 * i) / 80;
    const yy = t + p * (vv - v);
    tangent.push(`${i === 0 ? "M" : "L"} ${mapX(vv).toFixed(2)} ${mapY(yy).toFixed(2)}`);
  }
  svg.innerHTML = `
    <line class="axis" x1="70" y1="305" x2="690" y2="305"></line>
    <line class="axis" x1="90" y1="315" x2="90" y2="40"></line>
    ${[-3,-2,-1,0,1,2,3].map((tick) => `<line class="grid" x1="${mapX(tick)}" y1="48" x2="${mapX(tick)}" y2="305"></line>`).join("")}
    <path class="curve" d="${curve.join(" ")}"></path>
    <path class="curve alt" d="${tangent.join(" ")}"></path>
    <circle class="particle" cx="${mapX(v)}" cy="${mapY(t)}" r="10"></circle>
    <text class="label" x="104" y="60">L = ½m q̇²</text>
    <text class="small-label" x="515" y="330">velocidad q̇</text>
    <text class="small-label" x="108" y="92">pendiente = p = ∂L/∂q̇</text>
    <rect class="box" x="430" y="64" width="250" height="78"></rect>
    <text class="label" x="450" y="98">p = ${p.toFixed(2)}</text>
    <text class="label" x="450" y="126">H = p q̇ − L = ${h.toFixed(2)}</text>
  `;
  $("#legendreState").innerHTML = `Con $m=${m.toFixed(1)}$ y $\\dot q=${v.toFixed(1)}$, el momento conjugado es $p=${p.toFixed(2)}$.`;
  typeset($("#legendreState"));
}

function renderFreeParticle() {
  const m = Number($("#freeMass").value);
  const p = Number($("#freeMomentum").value);
  const time = Number($("#freeTime").value);
  const x0 = 1.4;
  const x = x0 + (p / m) * time;
  const correction = (p / m) * time;
  const f = x - correction;
  const mapX = (value) => 90 + (value + 5) * 58;
  const y = 164;
  const svg = $("#freeSvg");
  svg.innerHTML = `
    <line class="axis" x1="80" y1="${y}" x2="680" y2="${y}"></line>
    ${[-4, -2, 0, 2, 4, 6].map((tick) => `<line class="grid" x1="${mapX(tick)}" y1="${y - 12}" x2="${mapX(tick)}" y2="${y + 12}"></line><text class="small-label" x="${mapX(tick) - 6}" y="${y + 36}">${tick}</text>`).join("")}
    <circle class="ghost" cx="${mapX(x0)}" cy="${y}" r="12"></circle>
    <text class="small-label" x="${mapX(x0) - 38}" y="${y - 28}">F = x₀</text>
    <circle class="particle" cx="${mapX(x)}" cy="${y}" r="13"></circle>
    <text class="small-label" x="${mapX(x) - 22}" y="${y - 30}">x(t)</text>
    <path class="curve" d="M ${mapX(x0)} ${y + 72} L ${mapX(x)} ${y + 72}"></path>
    <text class="label" x="${Math.min(mapX(x0), mapX(x)) + 8}" y="${y + 105}">pt/m = ${correction.toFixed(2)}</text>
    <text class="label" x="92" y="58">x(t)=x₀+(p/m)t</text>
    <text class="label" x="92" y="88">F=x−pt/m=${f.toFixed(2)}</text>
  `;
  $("#freeState").innerHTML = `Con $m=${m.toFixed(1)}$, $p=${p.toFixed(1)}$ y $t=${time.toFixed(2)}$, $x=${x.toFixed(2)}$ pero $F=${f.toFixed(2)}$ permanece igual a $x_0$.`;
  typeset($("#freeState"));
}

function renderCanonical(mode = "pendulum") {
  const svg = $("#canonicalSvg");
  const isFlat = mode === "flat";
  const mapTheta = (theta) => 80 + ((theta + Math.PI) / (2 * Math.PI)) * 600;
  const mapP = (p) => 210 - p * 55;
  const pendulumCurves = [];
  [0.35, 0.75, 1.2, 1.8].forEach((energy, idx) => {
    const pts = [];
    for (let i = 0; i <= 240; i += 1) {
      const th = -Math.PI + (2 * Math.PI * i) / 240;
      const val = 2 * (energy - (1 - Math.cos(th)));
      if (val >= 0) {
        const pp = Math.sqrt(val);
        pts.push([th, pp]);
      }
    }
    if (pts.length > 1) {
      const top = pts.map(([th, pp], i) => `${i === 0 ? "M" : "L"} ${mapTheta(th).toFixed(1)} ${mapP(pp).toFixed(1)}`).join(" ");
      const bottom = pts.slice().reverse().map(([th, pp], i) => `${i === 0 ? "M" : "L"} ${mapTheta(th).toFixed(1)} ${mapP(-pp).toFixed(1)}`).join(" ");
      pendulumCurves.push(`<path class="phase-curve ${idx === 2 ? "strong" : ""}" d="${top}"></path><path class="phase-curve ${idx === 2 ? "strong" : ""}" d="${bottom}"></path>`);
    }
  });
  const separatrixTop = [];
  const separatrixBottom = [];
  for (let i = 0; i <= 240; i += 1) {
    const th = -Math.PI + (2 * Math.PI * i) / 240;
    const pp = 2 * Math.cos(th / 2);
    separatrixTop.push(`${i === 0 ? "M" : "L"} ${mapTheta(th).toFixed(1)} ${mapP(pp).toFixed(1)}`);
    separatrixBottom.push(`${i === 0 ? "M" : "L"} ${mapTheta(th).toFixed(1)} ${mapP(-pp).toFixed(1)}`);
  }
  const flatLines = [0.35, 0.75, 1.15, 1.55, 1.95].map((j, idx) => {
    const y = 310 - idx * 52;
    return `<path class="phase-curve ${idx === 2 ? "strong" : ""}" d="M 100 ${y} L 665 ${y}"></path>
      <circle class="particle" cx="${220 + idx * 45}" cy="${y}" r="8"></circle>`;
  }).join("");
  svg.innerHTML = `
    <line class="axis" x1="70" y1="210" x2="700" y2="210"></line>
    <line class="axis" x1="380" y1="48" x2="380" y2="360"></line>
    ${isFlat ? `
      ${[0,1,2,3,4,5,6].map(i => `<line class="grid" x1="${100+i*94}" y1="62" x2="${100+i*94}" y2="330"></line>`).join("")}
      ${flatLines}
      <text class="label" x="95" y="54">coordenadas locales (ángulo, acción)</text>
      <text class="small-label" x="104" y="348">el movimiento se lee como avance horizontal; la acción queda fija</text>
    ` : `
      ${[-3,-2,-1,0,1,2,3].map(t => `<line class="grid" x1="${mapTheta(t)}" y1="58" x2="${mapTheta(t)}" y2="350"></line>`).join("")}
      ${pendulumCurves.join("")}
      <path class="phase-separatrix" d="${separatrixTop.join(" ")}"></path>
      <path class="phase-separatrix" d="${separatrixBottom.join(" ")}"></path>
      <text class="label" x="96" y="54">péndulo: espacio de fase (θ,p)</text>
      <text class="small-label" x="462" y="91">separatriz</text>
    `}
  `;
  $("#canonicalState").textContent = isFlat
    ? "En una región regular, unas coordenadas canónicas adaptadas al movimiento pueden aplanar las curvas: una acción casi fija y un ángulo que avanza."
    : "El retrato de fase del péndulo muestra curvas de energía y una separatriz: el movimiento vive como flujo sobre el plano (θ,p).";
  $$(".segment").forEach((button) => button.classList.toggle("active", button.dataset.canonical === mode));
}

let gaugeOn = false;
function renderGauge() {
  const svg = $("#gaugeSvg");
  const compact = window.matchMedia("(max-width: 620px)").matches;
  const fieldArrows = [];
  for (let x = 90; x <= 300; x += 70) {
    for (let y = 80; y <= 250; y += 56) {
      fieldArrows.push(`<path class="field-arrow" d="M ${x} ${y} l 34 -14"></path>`);
    }
  }
  const pShift = gaugeOn ? -52 : 0;
  if (compact) {
    svg.setAttribute("viewBox", "0 0 390 700");
    const mobileArrows = [];
    for (let x = 58; x <= 300; x += 78) {
      for (let y = 92; y <= 228; y += 46) {
        mobileArrows.push(`<path class="field-arrow" d="M ${x} ${y} l 32 -12"></path>`);
      }
    }
    svg.innerHTML = `
      ${svgDefs()}
      <rect class="box" x="24" y="28" width="342" height="246"></rect>
      <text class="label gauge-label" x="42" y="62">1. Campos y trayectoria</text>
      ${mobileArrows.join("")}
      <path class="curve" d="M 58 236 C 112 170, 198 176, 318 104"></path>
      <circle class="particle" cx="185" cy="165" r="10"></circle>
      <text class="small-label gauge-small" x="42" y="258">E, B y la curva física no cambian.</text>

      <rect class="${gaugeOn ? "term-change" : "term-stay"}" x="24" y="306" width="342" height="64" rx="8"></rect>
      <text class="label gauge-label" x="42" y="346">${gaugeOn ? "2. A → A + ∇ψ" : "2. Potencial A"}</text>

      <rect class="${gaugeOn ? "term-change" : "term-stay"}" x="24" y="388" width="342" height="72" rx="8"></rect>
      <text class="label gauge-label" x="42" y="426">${gaugeOn ? "3. L → L + d[(q/c)ψ]/dt" : "3. Lagrangiano L"}</text>

      <rect class="box" x="24" y="492" width="342" height="154" rx="8"></rect>
      <text class="label gauge-label" x="42" y="528">4. Espacio de fase</text>
      <line class="axis" x1="64" y1="604" x2="328" y2="604"></line>
      <line class="axis" x1="104" y1="630" x2="104" y2="550"></line>
      <circle class="ghost" cx="212" cy="${594 + pShift}" r="11"></circle>
      <circle class="particle" cx="212" cy="594" r="9"></circle>
      <path class="arrow" d="M 212 594 L 212 ${594 + pShift + (gaugeOn ? 12 : 0)}"></path>
      <text class="small-label gauge-small" x="232" y="598">mv</text>
      <text class="small-label gauge-small" x="232" y="${gaugeOn ? 548 : 580}">p_can</text>
      <text class="small-label gauge-small" x="42" y="632">${gaugeOn ? "El momento canónico se desplaza." : "Una elección de potenciales fija p_can."}</text>
    `;
  } else {
    svg.setAttribute("viewBox", "0 0 760 420");
    svg.innerHTML = `
      ${svgDefs()}
      <rect class="box" x="44" y="44" width="310" height="260"></rect>
      <text class="label" x="68" y="76">campos y trayectoria</text>
      ${fieldArrows.join("")}
      <path class="curve" d="M 76 252 C 138 178, 216 180, 310 112"></path>
      <circle class="particle" cx="205" cy="170" r="9"></circle>
      <text class="small-label" x="68" y="286">E y B quedan iguales</text>

      <rect class="${gaugeOn ? "term-change" : "term-stay"}" x="402" y="50" width="300" height="62" rx="8"></rect>
      <text class="label" x="424" y="86">${gaugeOn ? "A → A + ∇ψ" : "potencial A"}</text>

      <rect class="${gaugeOn ? "term-change" : "term-stay"}" x="402" y="132" width="300" height="62" rx="8"></rect>
      <text class="label" x="424" y="168">${gaugeOn ? "L → L + d[(q/c)ψ]/dt" : "lagrangiano L"}</text>

      <rect class="box" x="402" y="222" width="300" height="138" rx="8"></rect>
      <text class="label" x="424" y="252">espacio de fase</text>
      <line class="axis" x1="430" y1="326" x2="675" y2="326"></line>
      <line class="axis" x1="455" y1="344" x2="455" y2="236"></line>
      <circle class="ghost" cx="555" cy="${300 + pShift}" r="10"></circle>
      <circle class="particle" cx="555" cy="300" r="8"></circle>
      <path class="arrow" d="M 555 300 L 555 ${300 + pShift + (gaugeOn ? 12 : 0)}"></path>
      <text class="small-label" x="576" y="305">mv</text>
      <text class="small-label" x="576" y="${gaugeOn ? 252 : 286}">p_can</text>
    `;
  }
  $("#gaugeToggle").textContent = gaugeOn ? "Desactivar gauge" : "Activar gauge";
  $("#gaugeState").textContent = gaugeOn
    ? "Gauge activado: la trayectoria y los campos no cambian; lo que se desplaza es la representación por potenciales y el momento canónico."
    : "Estado base: una elección particular de potenciales representa los mismos campos y la misma trayectoria.";
}

function renderTotalVisual() {
  const alpha = Number($("#totalAlpha").value);
  const svg = $("#totalVisualSvg");
  const q = (t) => Math.sin(2 * Math.PI * t);
  const p = (t) => 2 * Math.PI * Math.cos(2 * Math.PI * t) / 4;
  const xT = (t) => 80 + t * 310;
  const yQ = (val) => 118 - val * 55;
  const xPhase = (val) => 560 + val * 70;
  const yPhase = (val) => 210 - val * 70;
  const pathQ = [];
  const pathP = [];
  const pathP2 = [];
  for (let i = 0; i <= 180; i += 1) {
    const t = i / 180;
    const qq = q(t);
    const pp = p(t);
    const pp2 = pp + alpha * qq;
    pathQ.push(`${i === 0 ? "M" : "L"} ${xT(t).toFixed(1)} ${yQ(qq).toFixed(1)}`);
    pathP.push(`${i === 0 ? "M" : "L"} ${xPhase(qq).toFixed(1)} ${yPhase(pp).toFixed(1)}`);
    pathP2.push(`${i === 0 ? "M" : "L"} ${xPhase(qq).toFixed(1)} ${yPhase(pp2).toFixed(1)}`);
  }
  svg.innerHTML = `
    <line class="axis" x1="62" y1="118" x2="420" y2="118"></line>
    <line class="axis" x1="80" y1="44" x2="80" y2="194"></line>
    <path class="curve" d="${pathQ.join(" ")}"></path>
    <text class="label" x="76" y="32">misma curva q(t)</text>
    <text class="small-label" x="342" y="150">t</text>

    <line class="axis" x1="470" y1="210" x2="720" y2="210"></line>
    <line class="axis" x1="560" y1="324" x2="560" y2="82"></line>
    <path class="phase-curve" d="${pathP.join(" ")}"></path>
    <path class="phase-curve strong" d="${pathP2.join(" ")}"></path>
    <text class="label" x="476" y="54">espacio de fase</text>
    <text class="small-label" x="610" y="112">p' = p + αq</text>
    <text class="small-label" x="610" y="286">p original</text>
  `;
  $("#totalVisualState").innerHTML = `Con $F(q)=\\alpha q^2/2$, el nuevo momento es $p'=p+\\alpha q$. La curva $q(t)$ no cambia; cambia su representación en fase.`;
  typeset($("#totalVisualState"));
}

function setupGauge() {
  $("#gaugeToggle").addEventListener("click", () => {
    gaugeOn = !gaugeOn;
    renderGauge();
  });
  $("#gaugeReset").addEventListener("click", () => {
    gaugeOn = false;
    renderGauge();
  });
}

function setupInputs() {
  ["#legendreMass", "#legendreVelocity"].forEach((selector) => {
    $(selector).addEventListener("input", renderLegendre);
  });
  ["#freeMass", "#freeMomentum", "#freeTime"].forEach((selector) => {
    $(selector).addEventListener("input", renderFreeParticle);
  });
  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => renderCanonical(button.dataset.canonical));
  });
  $("#totalAlpha").addEventListener("input", renderTotalVisual);
  window.addEventListener("resize", renderGauge);
}

function init() {
  setupSteppers();
  setupInputs();
  setupGauge();
  renderLegendre();
  renderFreeParticle();
  renderCanonical("pendulum");
  renderTotalVisual();
  renderGauge();
}

document.addEventListener("DOMContentLoaded", init);
