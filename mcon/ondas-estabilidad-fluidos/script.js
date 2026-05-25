const $ = (id) => document.getElementById(id);

const state = {
  t: 0,
  soundSpeed: 1.25,
  soundK: 3,
  n2: 0.8,
  rhoBottom: 1.6,
  rhoTop: 0.8,
  interfaceK: 2.5,
};

function setupHiDpi(canvas) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round((rect.width * Number(canvas.dataset.ratio || 0.56)) * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.width * Number(canvas.dataset.ratio || 0.56) };
}

function waveY(x, mid, amp, k, phase, width) {
  return mid + amp * Math.sin((2 * Math.PI * k * x) / width - phase);
}

function drawAxes(ctx, w, h, labelX, labelY) {
  ctx.strokeStyle = "rgba(31,37,34,.46)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(46, h / 2);
  ctx.lineTo(w - 26, h / 2);
  ctx.moveTo(58, 32);
  ctx.lineTo(58, h - 32);
  ctx.stroke();
  ctx.fillStyle = "#5f6862";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText(labelX, w - 54, h / 2 - 8);
  ctx.fillText(labelY, 66, 34);
}

function drawHero() {
  const canvas = $("heroCanvas");
  canvas.dataset.ratio = 0.62;
  const { ctx, w, h } = setupHiDpi(canvas);
  const mid = h * 0.5;
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#fffefa");
  grad.addColorStop(1, "#e7f3ef");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 11; i++) {
    const y = 42 + i * ((h - 84) / 10);
    ctx.strokeStyle = i === 5 ? "rgba(15,118,110,.38)" : "rgba(31,37,34,.10)";
    ctx.beginPath();
    ctx.moveTo(50, y + Math.sin(i) * 2);
    for (let x = 50; x <= w - 50; x += 24) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 1.8);
    }
    ctx.stroke();
  }

  const phase = state.t * 1.2;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#0f766e";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let x = 46; x <= w - 46; x += 3) {
    const y = waveY(x - 46, mid, 46, 2.1, phase, w - 92);
    if (x === 46) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(192,96,59,.15)";
  ctx.beginPath();
  for (let x = 46; x <= w - 46; x += 3) {
    const y = waveY(x - 46, mid, 46, 2.1, phase, w - 92);
    if (x === 46) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(w - 46, h - 58);
  ctx.lineTo(46, h - 58);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1f2522";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillText("ω² > 0", 58, 58);
  ctx.fillText("ω² < 0", w - 150, h - 62);
  ctx.font = "14px Inter, sans-serif";
  ctx.fillStyle = "#5f6862";
  ctx.fillText("oscilación", 58, 80);
  ctx.fillText("crecimiento", w - 150, h - 40);

  ctx.strokeStyle = "#1f2522";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(w - 118, h - 84);
  ctx.lineTo(w - 64, h - 84);
  ctx.lineTo(w - 75, h - 94);
  ctx.moveTo(w - 64, h - 84);
  ctx.lineTo(w - 76, h - 73);
  ctx.stroke();
}

function drawSound() {
  const canvas = $("soundCanvas");
  canvas.dataset.ratio = 0.35;
  const { ctx, w, h } = setupHiDpi(canvas);
  const k = state.soundK;
  const c = state.soundSpeed;
  const omega = c * k;
  const phase = state.t * omega * 0.55;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, w, h);
  drawAxes(ctx, w, h, "x", "Δρ");

  ctx.strokeStyle = "rgba(31,37,34,.09)";
  for (let y = 38; y < h - 28; y += 26) {
    ctx.beginPath();
    ctx.moveTo(38, y);
    ctx.lineTo(w - 30, y + Math.sin(y) * 1.5);
    ctx.stroke();
  }

  for (let x = 70; x < w - 36; x += 20) {
    const density = 0.5 + 0.5 * Math.sin((2 * Math.PI * k * (x - 70)) / (w - 120) - phase);
    ctx.fillStyle = `rgba(36,93,143,${0.08 + density * 0.28})`;
    ctx.fillRect(x, 56, 10, h - 112);
  }

  ctx.strokeStyle = "#245d8f";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = 70; x <= w - 46; x += 3) {
    const y = waveY(x - 70, h / 2, h * 0.2, k, phase, w - 116);
    if (x === 70) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  $("soundReadout").innerHTML =
    `c<sub>s</sub> = ${c.toFixed(2)}, k = ${k.toFixed(1)}, ` +
    `ω = c<sub>s</sub>k = ${omega.toFixed(2)}. Como ω² = ${(omega * omega).toFixed(2)} > 0, el modo oscila.`;
}

function drawParcel() {
  const canvas = $("parcelCanvas");
  canvas.dataset.ratio = 0.92;
  const { ctx, w, h } = setupHiDpi(canvas);
  const n2 = state.n2;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, w, h);

  const y0 = h * 0.56;
  const amp = n2 >= 0 ? 64 * Math.cos(state.t * Math.sqrt(Math.max(0.05, n2)) * 1.2) : 28 * Math.exp(Math.min(1.3, state.t * Math.sqrt(Math.abs(n2)) * 0.18));
  const parcelY = y0 - amp;

  for (let i = 0; i < 9; i++) {
    const y = 60 + i * (h - 120) / 8;
    ctx.strokeStyle = "rgba(31,37,34,.10)";
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(w - 70, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(15,118,110,.45)";
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.moveTo(84, y0);
  ctx.lineTo(w - 84, y0);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = n2 >= 0 ? "rgba(15,118,110,.18)" : "rgba(192,96,59,.18)";
  ctx.strokeStyle = n2 >= 0 ? "#0f766e" : "#c0603b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, parcelY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = n2 >= 0 ? "#0f766e" : "#c0603b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, parcelY + 42);
  ctx.lineTo(w / 2, y0 - 8);
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.font = "700 14px Inter, sans-serif";
  ctx.fillText("δz", w / 2 + 10, (parcelY + y0) / 2);

  ctx.fillStyle = "#1f2522";
  ctx.font = "700 18px Inter, sans-serif";
  ctx.fillText(n2 >= 0 ? "fuerza restauradora" : "aceleración en el sentido del desplazamiento", 34, 36);

  $("parcelReadout").innerHTML =
    `N² = ${n2.toFixed(2)}. ` +
    (n2 >= 0
      ? "La ecuación d²δz/dt² = -N²δz describe oscilación estable."
      : "La ecuación cambia de carácter: la amplitud crece y la estratificación es inestable.");
}

function drawInterface() {
  const canvas = $("interfaceCanvas");
  canvas.dataset.ratio = 0.5;
  const { ctx, w, h } = setupHiDpi(canvas);
  const rho = state.rhoBottom;
  const rhoP = state.rhoTop;
  const k = state.interfaceK;
  const value = 9.8 * k * (rho - rhoP) / (rho + rhoP);
  const stable = value >= 0;
  const phase = stable ? state.t * Math.sqrt(Math.max(0.01, value)) * 0.35 : 0;
  const growthPhase = (Math.sin(state.t * 0.75) + 1) / 2;
  const growth = stable ? 1 : 1 + 2.4 * growthPhase;
  const baseAmp = stable ? 34 : 22;
  const amp = baseAmp * growth;
  const mid = h * 0.52;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#dcecea";
  ctx.fillRect(0, 0, w, mid);
  ctx.fillStyle = "#e7d4c8";
  ctx.fillRect(0, mid, w, h - mid);

  ctx.fillStyle = "rgba(255,253,248,.72)";
  ctx.fillRect(0, mid - 1, w, 2);

  if (!stable) {
    ctx.strokeStyle = "rgba(31,37,34,.38)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const y = waveY(x, mid, baseAmp, k, 0, w);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  for (let x = 0; x <= w; x += 3) {
    const y = waveY(x, mid, amp, k, phase, w);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = rho > rhoP ? "rgba(192,96,59,.34)" : "rgba(192,96,59,.18)";
  ctx.fill();

  ctx.strokeStyle = stable ? "#0f766e" : "#c0603b";
  ctx.lineWidth = stable ? 4 : 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let x = 0; x <= w; x += 3) {
    const y = waveY(x, mid, amp, k, phase, w);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (!stable) {
    const arrowXs = [w * 0.23, w * 0.5, w * 0.77];
    ctx.strokeStyle = "#c0603b";
    ctx.fillStyle = "#c0603b";
    ctx.lineWidth = 2.5;
    arrowXs.forEach((x) => {
      const y = waveY(x, mid, amp, k, 0, w);
      const direction = y < mid ? -1 : 1;
      const startY = y - direction * 10;
      const endY = y - direction * 42;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, endY);
      ctx.lineTo(x - 7, endY + direction * 10);
      ctx.lineTo(x + 7, endY + direction * 10);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = "rgba(192,96,59,.12)";
    ctx.fillRect(w - 300, 56, 260, 58);
    ctx.strokeStyle = "rgba(192,96,59,.35)";
    ctx.strokeRect(w - 300, 56, 260, 58);
    ctx.fillStyle = "#8b351c";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillText("amplitud creciente", w - 280, 82);
    ctx.font = "14px Georgia, serif";
    ctx.fillText("ξ(t) ∝ e^{σt}", w - 280, 104);
  }

  ctx.fillStyle = "#1f2522";
  ctx.font = "700 17px Inter, sans-serif";
  ctx.fillText(`ρ' superior = ${rhoP.toFixed(2)}`, 28, 36);
  ctx.fillText(`ρ inferior = ${rho.toFixed(2)}`, 28, h - 30);
  ctx.fillText(stable ? "onda estable: ω² > 0" : "Rayleigh-Taylor: ω² < 0", w - 250, 36);

  $("interfaceReadout").innerHTML =
    `ω² = gk(ρ − ρ')/(ρ + ρ') = ${value.toFixed(2)}. ` +
    (stable
      ? "El fluido más denso está abajo: la gravedad restaura la interfaz."
      : `El fluido más denso está arriba: la amplitud crece. En el dibujo, la línea punteada es la perturbación inicial y la curva naranja es ξ(t) ∝ e^{σt}.`);
}

const steps = [
  {
    title: "1. Potencial de velocidad",
    body: "Como el flujo se toma incompresible e irrotacional, la velocidad puede venir de un potencial. La continuidad obliga entonces a que ese potencial satisfaga Laplace.",
    formula: "\\(\\mathbf v=\\nabla\\phi,\\qquad \\nabla^2\\phi=0,\\qquad \\phi=f(z)e^{i(kx-\\omega t)}\\)"
  },
  {
    title: "2. Localización cerca de la interfaz",
    body: "La perturbación no debe crecer lejos de la interfaz. Por eso se escoge el exponencial que decae en cada semiespacio.",
    formula: "\\(\\phi=B e^{kz}e^{i(kx-\\omega t)}\\;(z<0),\\qquad \\phi'=B'e^{-kz}e^{i(kx-\\omega t)}\\;(z>0)\\)"
  },
  {
    title: "3. Condición cinemática",
    body: "La interfaz es material: no es una línea dibujada encima del fluido. Su velocidad vertical debe coincidir con la velocidad vertical del fluido, evaluada en z = 0 a primer orden.",
    formula: "\\(\\partial_t\\xi=\\partial_z\\phi\\big|_{0},\\qquad \\partial_t\\xi=\\partial_z\\phi'\\big|_{0}\\)"
  },
  {
    title: "4. Condición dinámica",
    body: "La presión total debe ser continua a través de la interfaz. Al evaluar la presión hidrostática en z = ξ aparece el término de gravedad que decide el signo.",
    formula: "\\(p_{\\mathrm{tot}}(\\xi)=p'_{\\mathrm{tot}}(\\xi)\\quad\\Longrightarrow\\quad \\omega^2=gk\\frac{\\rho-\\rho'}{\\rho+\\rho'}\\)"
  }
];

function renderStep(index) {
  document.querySelectorAll(".step").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.step) === index);
  });
  const item = steps[index];
  $("stepText").innerHTML = `<h3>${item.title}</h3><p>${item.body}</p><p class="formula">${item.formula}</p>`;
  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([$("stepText")]);
  }
}

function bindControls() {
  $("soundSpeed").addEventListener("input", (event) => { state.soundSpeed = Number(event.target.value); drawSound(); });
  $("soundK").addEventListener("input", (event) => { state.soundK = Number(event.target.value); drawSound(); });
  $("resetSound").addEventListener("click", () => {
    state.soundSpeed = 1.25;
    state.soundK = 3;
    $("soundSpeed").value = state.soundSpeed;
    $("soundK").value = state.soundK;
    drawSound();
  });
  $("nSquared").addEventListener("input", (event) => { state.n2 = Number(event.target.value); state.t = 0; drawParcel(); });
  $("resetParcel").addEventListener("click", () => {
    state.n2 = 0.8;
    state.t = 0;
    $("nSquared").value = state.n2;
    drawParcel();
  });
  $("rhoBottom").addEventListener("input", (event) => { state.rhoBottom = Number(event.target.value); drawInterface(); });
  $("rhoTop").addEventListener("input", (event) => { state.rhoTop = Number(event.target.value); drawInterface(); });
  $("interfaceK").addEventListener("input", (event) => { state.interfaceK = Number(event.target.value); drawInterface(); });
  $("swapFluids").addEventListener("click", () => {
    [state.rhoBottom, state.rhoTop] = [state.rhoTop, state.rhoBottom];
    $("rhoBottom").value = state.rhoBottom;
    $("rhoTop").value = state.rhoTop;
    drawInterface();
  });
  document.querySelectorAll(".step").forEach((button) => {
    button.addEventListener("click", () => renderStep(Number(button.dataset.step)));
  });
}

function render() {
  drawHero();
  drawSound();
  drawParcel();
  drawInterface();
}

function tick() {
  state.t += 0.035;
  render();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", render);
bindControls();
renderStep(0);
tick();
