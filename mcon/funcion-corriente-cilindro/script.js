const canvas = document.getElementById("streamCanvas");
const ctx = canvas.getContext("2d");
const uniformCanvas = document.getElementById("uniformCanvas");
const uniformCtx = uniformCanvas.getContext("2d");
const failedCanvas = document.getElementById("failedCanvas");
const failedCtx = failedCanvas.getContext("2d");
const radiusControl = document.getElementById("radiusControl");
const lambdaControl = document.getElementById("lambdaControl");
const radiusValue = document.getElementById("radiusValue");
const lambdaValue = document.getElementById("lambdaValue");
const resetButton = document.getElementById("resetButton");
const canvasCaption = document.getElementById("canvasCaption");
const stepButtons = document.getElementById("stepButtons");
const stepContent = document.getElementById("stepContent");

const steps = [
  {
    title: "1. Continuidad",
    body:
      "En dos dimensiones, la condicion \\(\\nabla\\cdot\\mathbf v=0\\) se satisface automaticamente si escribimos \\(v_x=\\partial\\psi/\\partial y\\) y \\(v_y=-\\partial\\psi/\\partial x\\)."
  },
  {
    title: "2. Lineas de corriente",
    body:
      "Con esa definicion, \\(\\mathbf v\\cdot\\nabla\\psi=0\\). Por tanto la velocidad es tangente a las curvas \\(\\psi=\\mathrm{cte}\\)."
  },
  {
    title: "3. Sin cuerpo",
    body:
      "Si no hay obstaculo, la solucion natural es una corriente uniforme: \\(\\psi_U=Ur\\sin\\phi=Uy\\). Sus lineas de corriente son rectas horizontales."
  },
  {
    title: "4. Aparece el cuerpo",
    body:
      "Al poner el circulo \\(r=a\\), esa misma corriente falla: \\(v_r(a,\\phi)=U\\cos\\phi\\). La pared no puede aceptar una componente normal distinta de cero."
  },
  {
    title: "5. Correccion exterior",
    body:
      "Para mantener la misma simetria angular y no modificar el infinito, se agrega \\(B\\sin\\phi/r\\). Asi \\(\\psi=(Ur+B/r)\\sin\\phi\\)."
  },
  {
    title: "6. Impermeabilidad",
    body:
      "La pared del cilindro es \\(r=a\\). Si debe ser una linea de corriente, imponemos \\(\\psi(a,\\phi)=0\\), lo que da \\(B=-Ua^2\\)."
  },
  {
    title: "7. Campo final",
    body:
      "El resultado \\(\\psi=U(r-a^2/r)\\sin\\phi\\) produce \\(v_r=U(1-a^2/r^2)\\cos\\phi\\). En \\(r=a\\), \\(v_r=0\\): el flujo no penetra el cilindro."
  }
];

const state = {
  U: 1,
  a: Number(radiusControl.value),
  lambda: Number(lambdaControl.value),
  activeStep: 0
};

function worldToCanvas(x, y) {
  const scale = canvas.width / 7.2;
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 - y * scale
  };
}

function panelToCanvas(panelCanvas, x, y) {
  const scale = panelCanvas.width / 5.2;
  return {
    x: panelCanvas.width / 2 + x * scale,
    y: panelCanvas.height / 2 - y * scale
  };
}

function canvasToWorld(px, py) {
  const scale = canvas.width / 7.2;
  return {
    x: (px - canvas.width / 2) / scale,
    y: -(py - canvas.height / 2) / scale
  };
}

function psi(x, y) {
  const r2 = x * x + y * y;
  if (r2 < 0.002) return NaN;
  return state.U * y * (1 - (state.lambda * state.a * state.a) / r2);
}

function velocity(x, y) {
  const r2 = x * x + y * y;
  if (r2 < 0.002) return { x: 0, y: 0 };
  const r = Math.sqrt(r2);
  const cos = x / r;
  const sin = y / r;
  const vr = state.U * (1 - (state.lambda * state.a * state.a) / r2) * cos;
  const vt = -state.U * (1 + (state.lambda * state.a * state.a) / r2) * sin;
  return {
    x: vr * cos - vt * sin,
    y: vr * sin + vt * cos
  };
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fcfdfb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(42, 111, 151, 0.08)";
  ctx.lineWidth = 1;
  for (let x = -3.6; x <= 3.6; x += 0.6) {
    const p1 = worldToCanvas(x, -2);
    const p2 = worldToCanvas(x, 2);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  for (let y = -2; y <= 2; y += 0.5) {
    const p1 = worldToCanvas(-3.6, y);
    const p2 = worldToCanvas(3.6, y);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

function interpolate(p1, p2, v1, v2, level) {
  const denom = v2 - v1;
  const t = Math.abs(denom) < 1e-8 ? 0.5 : (level - v1) / denom;
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

function drawContour(level) {
  const nx = 118;
  const ny = 78;
  const xmin = -3.5;
  const xmax = 3.5;
  const ymin = -2.1;
  const ymax = 2.1;
  const dx = (xmax - xmin) / nx;
  const dy = (ymax - ymin) / ny;

  ctx.beginPath();
  for (let i = 0; i < nx; i += 1) {
    for (let j = 0; j < ny; j += 1) {
      const p = [
        { x: xmin + i * dx, y: ymin + j * dy },
        { x: xmin + (i + 1) * dx, y: ymin + j * dy },
        { x: xmin + (i + 1) * dx, y: ymin + (j + 1) * dy },
        { x: xmin + i * dx, y: ymin + (j + 1) * dy }
      ];
      const values = p.map((point) => psi(point.x, point.y));
      if (values.some((value) => !Number.isFinite(value))) continue;

      const crossings = [];
      for (let k = 0; k < 4; k += 1) {
        const next = (k + 1) % 4;
        const v1 = values[k];
        const v2 = values[next];
        if ((v1 <= level && v2 > level) || (v2 <= level && v1 > level)) {
          const point = interpolate(p[k], p[next], v1, v2, level);
          const r = Math.hypot(point.x, point.y);
          if (r > state.a * 0.98 || state.lambda < 0.98) crossings.push(point);
        }
      }
      if (crossings.length >= 2) {
        const c1 = worldToCanvas(crossings[0].x, crossings[0].y);
        const c2 = worldToCanvas(crossings[1].x, crossings[1].y);
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
      }
    }
  }
  ctx.stroke();
}

function drawContours() {
  const levels = [-1.7, -1.35, -1.05, -0.75, -0.5, -0.28, 0, 0.28, 0.5, 0.75, 1.05, 1.35, 1.7];
  ctx.lineWidth = 2;
  levels.forEach((level) => {
    ctx.strokeStyle = level === 0 ? "rgba(13, 124, 102, 0.9)" : "rgba(42, 111, 151, 0.62)";
    drawContour(level);
  });
}

function drawCylinder() {
  const center = worldToCanvas(0, 0);
  const edge = worldToCanvas(state.a, 0);
  const radius = edge.x - center.x;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(240, 229, 207, 0.95)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = state.lambda > 0.98 ? "#0d7c66" : "#b33a3a";
  ctx.stroke();

  ctx.fillStyle = "#1e2724";
  ctx.font = "18px Segoe UI, sans-serif";
  ctx.fillText("r = a", center.x + radius * 0.24, center.y + 6);
}

function drawBoundaryArrows() {
  const arrowCount = 12;
  const color = state.lambda > 0.98 ? "#0d7c66" : "#b33a3a";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < arrowCount; i += 1) {
    const phi = (Math.PI * 2 * i) / arrowCount;
    const normalStrength = 1 - state.lambda;
    const baseR = state.a + 0.08;
    const start = worldToCanvas(baseR * Math.cos(phi), baseR * Math.sin(phi));
    const len = 0.24 * normalStrength * Math.cos(phi);
    if (Math.abs(len) < 0.015) continue;
    const end = worldToCanvas((baseR + len) * Math.cos(phi), (baseR + len) * Math.sin(phi));
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVelocityProbe() {
  const points = [
    { x: -2.6, y: 1.45 },
    { x: -1.5, y: -1.1 },
    { x: 1.4, y: 1.0 },
    { x: 2.4, y: -0.8 }
  ];
  ctx.strokeStyle = "#b77418";
  ctx.fillStyle = "#b77418";
  ctx.lineWidth = 2;
  points.forEach((point) => {
    const v = velocity(point.x, point.y);
    const p = worldToCanvas(point.x, point.y);
    const end = worldToCanvas(point.x + 0.22 * v.x, point.y + 0.22 * v.y);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLabels() {
  ctx.fillStyle = "#1e2724";
  ctx.font = "17px Segoe UI, sans-serif";
  ctx.fillText(`ψ = U(r - λa²/r) sinφ`, 28, 36);
  ctx.fillText(`λ = ${state.lambda.toFixed(2)},  a = ${state.a.toFixed(2)}`, 28, 62);

  const boundary = state.lambda > 0.98 ? "vᵣ(a,φ)=0: frontera impermeable" : "vᵣ(a,φ)=U(1-λ)cosφ: la frontera aun se cruza";
  ctx.fillStyle = state.lambda > 0.98 ? "#0d7c66" : "#b33a3a";
  ctx.fillText(boundary, 28, canvas.height - 30);
}

function arrow(ctxTarget, from, to, color) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctxTarget.strokeStyle = color;
  ctxTarget.fillStyle = color;
  ctxTarget.lineWidth = 2;
  ctxTarget.beginPath();
  ctxTarget.moveTo(from.x, from.y);
  ctxTarget.lineTo(to.x, to.y);
  ctxTarget.stroke();
  ctxTarget.beginPath();
  ctxTarget.moveTo(to.x, to.y);
  ctxTarget.lineTo(to.x - 9 * Math.cos(angle - 0.45), to.y - 9 * Math.sin(angle - 0.45));
  ctxTarget.lineTo(to.x - 9 * Math.cos(angle + 0.45), to.y - 9 * Math.sin(angle + 0.45));
  ctxTarget.closePath();
  ctxTarget.fill();
}

function drawUniformPanel(ctxTarget, panelCanvas, withBody) {
  ctxTarget.clearRect(0, 0, panelCanvas.width, panelCanvas.height);
  ctxTarget.fillStyle = "#fcfdfb";
  ctxTarget.fillRect(0, 0, panelCanvas.width, panelCanvas.height);
  ctxTarget.strokeStyle = "rgba(42, 111, 151, 0.62)";
  ctxTarget.lineWidth = 2;

  for (let y = -1.25; y <= 1.25; y += 0.42) {
    const left = panelToCanvas(panelCanvas, -2.35, y);
    const right = panelToCanvas(panelCanvas, 2.35, y);
    ctxTarget.beginPath();
    ctxTarget.moveTo(left.x, left.y);
    ctxTarget.lineTo(right.x, right.y);
    ctxTarget.stroke();
    arrow(ctxTarget, panelToCanvas(panelCanvas, 1.72, y), panelToCanvas(panelCanvas, 2.14, y), "#2a6f97");
  }

  ctxTarget.fillStyle = "#1e2724";
  ctxTarget.font = "16px Segoe UI, sans-serif";
  ctxTarget.fillText("v = U x-hat", 18, 28);

  if (withBody) {
    const center = panelToCanvas(panelCanvas, 0, 0);
    const edge = panelToCanvas(panelCanvas, 0.72, 0);
    const radius = edge.x - center.x;
    ctxTarget.beginPath();
    ctxTarget.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctxTarget.fillStyle = "rgba(240, 229, 207, 0.96)";
    ctxTarget.fill();
    ctxTarget.lineWidth = 3;
    ctxTarget.strokeStyle = "#b33a3a";
    ctxTarget.stroke();

    for (const phi of [0, Math.PI]) {
      const start = panelToCanvas(panelCanvas, 0.72 * Math.cos(phi), 0.72 * Math.sin(phi));
      const end = panelToCanvas(panelCanvas, 1.12 * Math.cos(phi), 1.12 * Math.sin(phi));
      arrow(ctxTarget, start, end, "#b33a3a");
    }

    ctxTarget.fillStyle = "#b33a3a";
    ctxTarget.fillText("v_r no se anula", center.x - 58, center.y + radius + 28);
  }
}

function updateCaption() {
  const boundary = state.lambda > 0.98
    ? "el cilindro es una linea de corriente. Las curvas rodean la frontera y no la cruzan."
    : "la correccion aun no basta. La frontera circular no coincide con una curva de corriente para todo phi.";
  canvasCaption.textContent = `Con a=${state.a.toFixed(2)} y lambda=${state.lambda.toFixed(2)}, ${boundary}`;
}

function render() {
  radiusValue.textContent = state.a.toFixed(2);
  lambdaValue.textContent = state.lambda.toFixed(2);
  drawBackground();
  drawContours();
  drawCylinder();
  drawBoundaryArrows();
  drawVelocityProbe();
  drawLabels();
  drawUniformPanel(uniformCtx, uniformCanvas, false);
  drawUniformPanel(failedCtx, failedCanvas, true);
  updateCaption();
}

function renderSteps() {
  stepButtons.innerHTML = "";
  steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.className = index === state.activeStep ? "active" : "";
    button.setAttribute("aria-label", step.title);
    button.addEventListener("click", () => {
      state.activeStep = index;
      renderSteps();
    });
    stepButtons.appendChild(button);
  });

  const step = steps[state.activeStep];
  stepContent.innerHTML = `<h3>${step.title}</h3><p>${step.body}</p>`;
  if (window.MathJax) MathJax.typesetPromise([stepContent]);
}

radiusControl.addEventListener("input", (event) => {
  state.a = Number(event.target.value);
  render();
});

lambdaControl.addEventListener("input", (event) => {
  state.lambda = Number(event.target.value);
  render();
});

resetButton.addEventListener("click", () => {
  state.a = 0.8;
  state.lambda = 1;
  radiusControl.value = state.a;
  lambdaControl.value = state.lambda;
  render();
});

render();
renderSteps();
