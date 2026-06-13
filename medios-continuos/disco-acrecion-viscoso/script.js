const $ = (id) => document.getElementById(id);

function typeset(elements) {
  if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise(elements);
}

function arrow(ctx, x1, y1, x2, y2, color, width = 3) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 11 * Math.cos(angle - .42), y2 - 11 * Math.sin(angle - .42));
  ctx.lineTo(x2 - 11 * Math.cos(angle + .42), y2 - 11 * Math.sin(angle + .42));
  ctx.closePath();
  ctx.fill();
}

function clear(ctx, canvas, fill = "#fcfdfb") {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function axes(ctx, canvas, xLabel, yLabel, zeroFraction = .82) {
  const left = 62;
  const right = canvas.width - 24;
  const top = 26;
  const bottom = canvas.height - 45;
  ctx.strokeStyle = "rgba(27,40,39,.42)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();
  if (zeroFraction > 0 && zeroFraction < 1) {
    const zy = top + (bottom - top) * zeroFraction;
    ctx.strokeStyle = "rgba(27,40,39,.17)";
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(left, zy);
    ctx.lineTo(right, zy);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = "#60706c";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(xLabel, right - 10, bottom + 28);
  ctx.fillText(yLabel, left + 8, top + 10);
  return { left, right, top, bottom };
}

// Navier-Stokes term explorer
const termData = {
  local: {
    title: "Cambio local",
    math: String.raw`$$R\frac{\partial v_\phi}{\partial t}=\frac{\partial(Rv_\phi)}{\partial t}.$$`,
    text: "Mide cómo cambia el giro en un punto fijo del disco.",
    visible: ["phi"]
  },
  radial: {
    title: "Advección radial",
    math: String.raw`$$Ru_R\frac{\partial v_\phi}{\partial R}+u_Rv_\phi=u_R\frac{\partial(Rv_\phi)}{\partial R}.$$`,
    text: "La parcela cruza radios donde el brazo y la velocidad orbital son diferentes. El término geométrico completa la derivada de j.",
    visible: ["radial", "phi"]
  },
  vertical: {
    title: "Advección vertical",
    math: String.raw`$$Ru_z\frac{\partial v_\phi}{\partial z}=u_z\frac{\partial(Rv_\phi)}{\partial z}.$$`,
    text: "Transporta momento angular entre alturas. Luego desaparecerá al integrar verticalmente si no hay flujo neto por las superficies.",
    visible: ["vertical", "phi"]
  },
  geometry: {
    title: "Geometría cilíndrica",
    math: String.raw`$$R\left(\frac{u_Rv_\phi}{R}\right)=u_Rv_\phi.$$`,
    text: "No es una fuerza adicional: aparece porque la dirección azimutal cambia con la posición. Junto con la advección radial produce la derivada de Rvφ.",
    visible: ["radial", "phi"]
  }
};

document.querySelectorAll(".term-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".term-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const data = termData[button.dataset.term];
    $("termTitle").textContent = data.title;
    $("termMath").innerHTML = data.math;
    $("termText").textContent = data.text;
    ["phiArrow", "radialArrow", "verticalArrow"].forEach((id) => {
      const key = id.replace("Arrow", "");
      $(id).style.opacity = data.visible.includes(key) ? "1" : ".13";
      $(id).style.strokeWidth = data.visible.includes(key) ? "6" : "3";
    });
    typeset([$("termMath")]);
  });
});

// Rotation and torque explorer
const qControl = $("qControl");
const qValue = $("qValue");
const ringCanvas = $("ringCanvas");
const ringCtx = ringCanvas.getContext("2d");

function drawCurvedArrow(ctx, cx, cy, radius, start, end, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.stroke();
  const x = cx + radius * Math.cos(end);
  const y = cy + radius * Math.sin(end);
  const tangent = end + Math.PI / 2;
  arrow(ctx, x - 1, y - 1, x + 16 * Math.cos(tangent), y + 16 * Math.sin(tangent), color, width);
}

function updateRotationExplorer() {
  const q = Number(qControl.value);
  qValue.textContent = q.toFixed(2);
  const gradient = -q;
  const stress = -q;
  const torque = -2 * Math.PI * q;
  $("omegaGradient").textContent = `${gradient.toFixed(2)} Ω/R`;
  $("stressValue").textContent = `${stress.toFixed(2)} ηΩ`;
  $("torqueValue").textContent = `${torque.toFixed(2)} νΣR²Ω`;
  let stateText = "Los anillos interiores giran más rápido. La viscosidad los frena y acelera los exteriores.";
  if (Math.abs(q) < .001) stateText = "Cuerpo rígido: anillos vecinos conservan la misma Ω. No existe cizalla viscosa.";
  if (q < 0) stateText = "La velocidad angular aumenta hacia fuera; el sentido del transporte viscoso se invierte.";
  $("rotationState").textContent = stateText;
  $("omegaEquation").innerHTML = `$$\\Omega\\propto R^{${(-q).toFixed(2)}}.$$`;
  typeset([$("omegaEquation")]);

  clear(ringCtx, ringCanvas);
  const cx = ringCanvas.width / 2;
  const cy = ringCanvas.height / 2 + 12;
  const radii = [85, 145, 205];
  ringCtx.strokeStyle = "#d6ddd8";
  ringCtx.lineWidth = 24;
  radii.forEach((r) => {
    ringCtx.beginPath();
    ringCtx.arc(cx, cy, r, 0, Math.PI * 2);
    ringCtx.stroke();
  });
  radii.forEach((r, i) => {
    const localOmega = Math.pow(r / radii[1], -q);
    const span = Math.min(2.25, .58 + .48 * localOmega);
    drawCurvedArrow(ringCtx, cx, cy, r, -1.9, -1.9 + span, i === 0 ? "#b94f3c" : i === 2 ? "#246c86" : "#b98224", 6);
  });
  ringCtx.fillStyle = "#1b2827";
  ringCtx.font = "700 16px Inter, sans-serif";
  ringCtx.fillText("interior", cx - 48, cy - 52);
  ringCtx.fillText("exterior", cx - 52, cy - 222);
  ringCtx.font = "14px Inter, sans-serif";
  ringCtx.fillStyle = "#60706c";
  ringCtx.fillText(`Ω ∝ R^${(-q).toFixed(2)}`, 28, 35);
  ringCtx.fillText(Math.abs(q) < .001 ? "sin transferencia viscosa" : q > 0 ? "transporte de j hacia fuera" : "transporte de j hacia dentro", 28, 60);
  if (Math.abs(q) > .001) {
    arrow(ringCtx, cx + 240, cy, cx + 310, cy, q > 0 ? "#246c86" : "#b94f3c", 5);
  }
}

qControl.addEventListener("input", updateRotationExplorer);
$("qRigid").addEventListener("click", () => { qControl.value = "0"; updateRotationExplorer(); });
$("qKepler").addEventListener("click", () => { qControl.value = "1.5"; updateRotationExplorer(); });

// Ring balance explorer
const balanceCanvas = $("balanceCanvas");
const balanceCtx = balanceCanvas.getContext("2d");
const imbalanceControl = $("imbalanceControl");

function drawBalance() {
  const kind = $("balanceKind").value;
  const imbalance = Number(imbalanceControl.value);
  $("imbalanceValue").textContent = `${imbalance >= 0 ? "+" : ""}${imbalance.toFixed(2)}`;
  clear(balanceCtx, balanceCanvas);
  const cx = balanceCanvas.width / 2;
  const cy = balanceCanvas.height / 2 + 8;
  const inner = 145;
  const outer = 240;
  balanceCtx.fillStyle = kind === "mass" ? "rgba(36,108,134,.14)" : "rgba(185,130,36,.17)";
  balanceCtx.strokeStyle = kind === "mass" ? "#246c86" : "#b98224";
  balanceCtx.lineWidth = 3;
  balanceCtx.beginPath();
  balanceCtx.arc(cx, cy, outer, 0, Math.PI * 2);
  balanceCtx.arc(cx, cy, inner, 0, Math.PI * 2, true);
  balanceCtx.fill("evenodd");
  balanceCtx.stroke();

  const leftStrength = 90;
  const rightStrength = Math.max(20, leftStrength * (1 + imbalance));
  if (kind === "mass") {
    arrow(balanceCtx, cx - outer - 145, cy, cx - outer + 5, cy, "#246c86", 7);
    arrow(balanceCtx, cx + outer - 5, cy, cx + outer + 55 + rightStrength, cy, "#b94f3c", 7);
    balanceCtx.fillStyle = "#1b2827";
    balanceCtx.font = "700 17px Inter, sans-serif";
    balanceCtx.fillText("Fₘ(R)", cx - outer - 145, cy - 18);
    balanceCtx.fillText("Fₘ(R+dR)", cx + outer + 16, cy - 18);
  } else {
    drawCurvedArrow(balanceCtx, cx, cy, inner - 18, -2.4, -1.25, "#b94f3c", 7);
    drawCurvedArrow(balanceCtx, cx, cy, outer + 20, -.3, -.3 + 1.15 + imbalance * .55, "#246c86", 7);
    balanceCtx.fillStyle = "#1b2827";
    balanceCtx.font = "700 17px Inter, sans-serif";
    balanceCtx.fillText("G(R)", cx - 205, cy - 145);
    balanceCtx.fillText("G(R+dR)", cx + 135, cy - 210);
  }
  balanceCtx.fillStyle = "#1b2827";
  balanceCtx.font = "700 18px Inter, sans-serif";
  balanceCtx.fillText(kind === "mass" ? "masa almacenada: 2πRΣ dR" : "momento almacenado: 2πRΣj dR", cx - 175, cy + 8);
  balanceCtx.font = "14px Inter, sans-serif";
  balanceCtx.fillStyle = "#60706c";
  balanceCtx.fillText("R", cx - inner - 10, cy + 27);
  balanceCtx.fillText("R+dR", cx + outer - 28, cy + 27);

  const equal = Math.abs(imbalance) < .001;
  const quantity = kind === "mass" ? "masa" : "momento angular";
  $("balanceCaption").textContent = equal
    ? `Las fronteras transportan la misma cantidad: el flujo atraviesa el anillo, pero la ${quantity} almacenada no cambia.`
    : `Las fronteras no coinciden: su diferencia produce una tasa neta de cambio de la ${quantity} almacenada.`;
}

$("balanceKind").addEventListener("change", drawBalance);
imbalanceControl.addEventListener("input", drawBalance);
$("balanceEqual").addEventListener("click", () => { imbalanceControl.value = "0"; drawBalance(); });

// Viscous disk finite-volume simulation
const sim = {
  n: 180,
  rMin: .08,
  rMax: 3.2,
  r: [],
  edges: [],
  sigma: [],
  initial: [],
  flux: [],
  ur: [],
  torque: [],
  time: 0,
  accreted: 0,
  playing: false,
  initialAngular: 1,
  lastTimestamp: 0
};

const nuControl = $("nuControl");
const widthControl = $("widthControl");
const speedControl = $("speedControl");

function initializeSimulation() {
  const dr = (sim.rMax - sim.rMin) / sim.n;
  sim.edges = Array.from({ length: sim.n + 1 }, (_, i) => sim.rMin + i * dr);
  sim.r = Array.from({ length: sim.n }, (_, i) => sim.rMin + (i + .5) * dr);
  const width = Number(widthControl.value);
  sim.sigma = sim.r.map((r) => Math.exp(-.5 * Math.pow((r - 1) / width, 2)));
  const mass = diskMass(sim.sigma);
  sim.sigma = sim.sigma.map((v) => v / mass);
  sim.initial = [...sim.sigma];
  sim.flux = new Array(sim.n + 1).fill(0);
  sim.ur = new Array(sim.n).fill(0);
  sim.torque = new Array(sim.n).fill(0);
  sim.time = 0;
  sim.accreted = 0;
  sim.initialAngular = diskAngular(sim.sigma);
  updateDerived();
  drawSimulation();
}

function diskMass(sigma) {
  const dr = (sim.rMax - sim.rMin) / sim.n;
  return sigma.reduce((sum, value, i) => sum + 2 * Math.PI * sim.r[i] * value * dr, 0);
}

function diskAngular(sigma) {
  const dr = (sim.rMax - sim.rMin) / sim.n;
  return sigma.reduce((sum, value, i) => sum + 2 * Math.PI * sim.r[i] * value * Math.sqrt(sim.r[i]) * dr, 0);
}

function updateDerived() {
  const nu = Number(nuControl.value);
  const dr = (sim.rMax - sim.rMin) / sim.n;
  const q = sim.sigma.map((value, i) => nu * value * Math.sqrt(sim.r[i]));
  sim.flux.fill(0);
  // Outward-positive mass flux. Zero torque at the inner edge: Q=0.
  sim.flux[0] = -6 * Math.PI * Math.sqrt(sim.edges[0]) * (q[0] - 0) / (dr / 2);
  for (let e = 1; e < sim.n; e += 1) {
    sim.flux[e] = -6 * Math.PI * Math.sqrt(sim.edges[e]) * (q[e] - q[e - 1]) / dr;
  }
  sim.flux[sim.n] = 0; // no mass flux through outer edge
  const peakSigma = Math.max(...sim.sigma);
  sim.ur = sim.r.map((r, i) => {
    if (sim.sigma[i] <= 1e-10) return 0;
    const raw = .5 * (sim.flux[i] + sim.flux[i + 1]) / (2 * Math.PI * r * sim.sigma[i]);
    const visibleWeight = Math.min(1, sim.sigma[i] / (.1 * peakSigma));
    return raw * visibleWeight;
  });
  sim.torque = sim.r.map((r, i) => -3 * Math.PI * nu * sim.sigma[i] * Math.sqrt(r));
}

function stableTimeStep() {
  const nu = Number(nuControl.value);
  if (nu <= 0) return Infinity;
  const dr = (sim.rMax - sim.rMin) / sim.n;
  return .12 * dr * dr / (3 * nu);
}

function simulationStep(requestedDt = stableTimeStep()) {
  const nu = Number(nuControl.value);
  if (nu <= 0) { updateDerived(); return; }
  const dr = (sim.rMax - sim.rMin) / sim.n;
  const dt = Math.min(requestedDt, stableTimeStep());
  updateDerived();
  const next = sim.sigma.map((value, i) => {
    const cellMass = 2 * Math.PI * sim.r[i] * value * dr;
    const nextMass = cellMass + dt * (sim.flux[i] - sim.flux[i + 1]);
    return Math.max(0, nextMass / (2 * Math.PI * sim.r[i] * dr));
  });
  sim.accreted += Math.max(0, -sim.flux[0] * dt);
  sim.sigma = next;
  sim.time += dt;
  updateDerived();
}

function plotCurve(ctx, box, values, minY, maxY, color, width = 3) {
  const range = maxY - minY || 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  values.forEach((value, i) => {
    const x = box.left + ((sim.r[i] - sim.rMin) / (sim.rMax - sim.rMin)) * (box.right - box.left);
    const y = box.bottom - ((value - minY) / range) * (box.bottom - box.top);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawProfile() {
  const canvas = $("profileCanvas");
  const ctx = canvas.getContext("2d");
  clear(ctx, canvas);
  const box = axes(ctx, canvas, "R", "Σ", 1);
  const maxY = Math.max(...sim.initial, ...sim.sigma) * 1.08;
  plotCurve(ctx, box, sim.initial, 0, maxY, "rgba(96,112,108,.38)", 3);
  plotCurve(ctx, box, sim.sigma, 0, maxY, "#176f70", 4);
  ctx.fillStyle = "#60706c";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText("inicial", box.right - 115, box.top + 20);
  ctx.fillStyle = "#176f70";
  ctx.fillText("actual", box.right - 115, box.top + 42);
}

function drawSignedPlot(canvasId, values, color, label) {
  const canvas = $(canvasId);
  const ctx = canvas.getContext("2d");
  clear(ctx, canvas);
  const box = axes(ctx, canvas, "R", label, .5);
  const maxAbs = Math.max(1e-8, ...values.map((v) => Math.abs(v)));
  plotCurve(ctx, box, values, -maxAbs * 1.1, maxAbs * 1.1, color, 3.5);
}

function diskColor(t) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(36 + 211 * Math.pow(clamped, .7));
  const g = Math.round(91 + 92 * clamped);
  const b = Math.round(112 - 70 * clamped);
  return `rgb(${r},${g},${b})`;
}

function drawDisk() {
  const canvas = $("diskCanvas");
  const ctx = canvas.getContext("2d");
  clear(ctx, canvas, "#f8faf7");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const scale = (canvas.width * .45) / sim.rMax;
  const maxSigma = Math.max(...sim.sigma, 1e-8);
  for (let i = sim.n - 1; i >= 0; i -= 1) {
    const outer = sim.edges[i + 1] * scale;
    const inner = sim.edges[i] * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fillStyle = diskColor(sim.sigma[i] / maxSigma);
    ctx.fill("evenodd");
  }
  ctx.beginPath();
  ctx.arc(cx, cy, sim.rMin * scale, 0, Math.PI * 2);
  ctx.fillStyle = "#172524";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#f2b84b";
  ctx.fill();
  ctx.fillStyle = "#60706c";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(`t = ${sim.time.toFixed(3)}`, 20, 28);
}

function drawSimulation() {
  drawDisk();
  drawProfile();
  drawSignedPlot("velocityCanvas", sim.ur, "#b94f3c", "uR");
  drawSignedPlot("torqueCanvas", sim.torque, "#b98224", "G");
  const mass = diskMass(sim.sigma);
  const angular = diskAngular(sim.sigma);
  $("timeMetric").textContent = sim.time.toFixed(3);
  $("massMetric").textContent = mass.toFixed(4);
  $("accretedMetric").textContent = sim.accreted.toFixed(4);
  $("angularMetric").textContent = (angular / sim.initialAngular).toFixed(4);
  const conservation = mass + sim.accreted;
  const peak = Math.max(...sim.sigma);
  const innerFlow = sim.ur.find((_, i) => sim.sigma[i] > .3 * peak) || 0;
  const outerFlow = [...sim.ur].reverse().find((_, rev) => sim.sigma[sim.n - 1 - rev] > .3 * peak) || 0;
  $("simulationCaption").textContent =
    `Lectura actual: la masa total contabilizada es ${conservation.toFixed(5)}. ` +
    `En la región poblada, el lado interior tiende a uR=${innerFlow.toFixed(3)} y el exterior a uR=${outerFlow.toFixed(3)}.`;
}

function animationLoop(timestamp) {
  const elapsed = sim.lastTimestamp ? Math.min(.05, (timestamp - sim.lastTimestamp) / 1000) : 0;
  sim.lastTimestamp = timestamp;
  if (sim.playing && elapsed > 0) {
    const speed = Number(speedControl.value);
    const targetAdvance = elapsed * .24 * speed;
    const steps = Math.max(1, Math.ceil(targetAdvance / stableTimeStep()));
    const substep = targetAdvance / steps;
    for (let i = 0; i < steps; i += 1) simulationStep(substep);
    drawSimulation();
  }
  requestAnimationFrame(animationLoop);
}

nuControl.addEventListener("input", () => {
  $("nuValue").textContent = Number(nuControl.value).toFixed(3);
  updateDerived();
  drawSimulation();
});
widthControl.addEventListener("input", () => {
  $("widthValue").textContent = Number(widthControl.value).toFixed(2);
  initializeSimulation();
});
speedControl.addEventListener("input", () => { $("speedValue").textContent = `${speedControl.value}×`; });
$("playButton").addEventListener("click", () => {
  sim.playing = !sim.playing;
  $("playButton").textContent = sim.playing ? "Pausar" : "Reproducir";
});
$("stepButton").addEventListener("click", () => { simulationStep(); drawSimulation(); });
$("resetSimulation").addEventListener("click", initializeSimulation);

updateRotationExplorer();
drawBalance();
initializeSimulation();
requestAnimationFrame(animationLoop);
