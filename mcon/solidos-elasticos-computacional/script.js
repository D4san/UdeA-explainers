const canvas = document.getElementById("solidCanvas");
const ctx = canvas.getContext("2d");
const stiffness = document.getElementById("stiffness");
const poisson = document.getElementById("poisson");
const iterations = document.getElementById("iterations");
const stiffnessValue = document.getElementById("stiffnessValue");
const poissonValue = document.getElementById("poissonValue");
const iterationsValue = document.getElementById("iterationsValue");
const scaleReadout = document.getElementById("scaleReadout");
const residualReadout = document.getElementById("residualReadout");
const stageReadout = document.getElementById("stageReadout");
const resetButton = document.getElementById("resetButton");
const stageTabs = document.getElementById("stageTabs");

const state = {
  E: Number(stiffness.value),
  nu: Number(poisson.value),
  iterations: Number(iterations.value),
  stage: "u"
};

const stageText = {
  u: "desplazamiento propuesto",
  strain: "deformacion: derivadas de u",
  stress: "esfuerzo: Hooke sobre la deformacion",
  residual: "residuo interior: f + div sigma",
  boundary: "frontera: apoyo fijo y traccion libre"
};

function convergence() {
  return 1 - Math.exp(-state.iterations / 18);
}

function elasticScale() {
  return state.E / (1 - state.nu * state.nu);
}

function displacement(x, y) {
  const D = elasticScale();
  const c = convergence();
  const poissonFactor = state.nu / Math.max(0.08, 1 - state.nu);
  const ux = c * 0.22 * poissonFactor * x * (1 - y) / D;
  const uy = c * (-0.34 * y * (2 - y) / D + 0.055 * poissonFactor * (3 * x * x - 1) * y / D);
  return { x: ux, y: uy };
}

function sampleField(nx, ny) {
  const nodes = [];
  for (let j = 0; j <= ny; j += 1) {
    const row = [];
    const y = j / ny;
    for (let i = 0; i <= nx; i += 1) {
      const x = i / nx;
      row.push({ x, y, u: displacement(x, y) });
    }
    nodes.push(row);
  }
  return nodes;
}

function toCanvas(x, y, u = { x: 0, y: 0 }, amp = 1) {
  const margin = 82;
  const width = canvas.width - 2 * margin;
  const height = canvas.height - 2 * margin;
  const px = margin + (x + amp * u.x) * width;
  const py = canvas.height - margin - (y + amp * u.y) * height;
  return { x: px, y: py };
}

function drawArrow(from, to, color, width = 2) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - 9 * Math.cos(angle - 0.45), to.y - 9 * Math.sin(angle - 0.45));
  ctx.lineTo(to.x - 9 * Math.cos(angle + 0.45), to.y - 9 * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
}

function strainAt(x, y) {
  const h = 0.01;
  const upx = displacement(Math.min(1, x + h), y);
  const umx = displacement(Math.max(0, x - h), y);
  const upy = displacement(x, Math.min(1, y + h));
  const umy = displacement(x, Math.max(0, y - h));
  const duxDx = (upx.x - umx.x) / (Math.min(1, x + h) - Math.max(0, x - h));
  const duyDy = (upy.y - umy.y) / (Math.min(1, y + h) - Math.max(0, y - h));
  const duyDx = (upx.y - umx.y) / (Math.min(1, x + h) - Math.max(0, x - h));
  const duxDy = (upy.x - umy.x) / (Math.min(1, y + h) - Math.max(0, y - h));
  return {
    xx: duxDx,
    yy: duyDy,
    xy: 0.5 * (duyDx + duxDy)
  };
}

function stressAt(x, y) {
  const e = strainAt(x, y);
  const mu = state.E / (2 * (1 + state.nu));
  const lambda = (state.E * state.nu) / ((1 + state.nu) * Math.max(0.08, 1 - 2 * state.nu));
  const trace = e.xx + e.yy;
  return {
    xx: 2 * mu * e.xx + lambda * trace,
    yy: 2 * mu * e.yy + lambda * trace,
    xy: 2 * mu * e.xy
  };
}

function residualAt(x, y) {
  const base = Math.exp(-state.iterations / 18);
  const swirl = Math.sin(Math.PI * x) * Math.sin(Math.PI * y);
  return {
    x: base * 0.12 * (0.5 - x) * (0.3 + y),
    y: -base * (0.18 + 0.1 * swirl)
  };
}

function colorScale(value, color) {
  const a = Math.min(0.85, Math.abs(value) * 3.8);
  if (color === "green") return `rgba(22, 130, 75, ${a})`;
  if (color === "orange") return `rgba(226, 106, 0, ${a})`;
  return `rgba(197, 34, 34, ${a})`;
}

function drawCells(nodes, stage) {
  const nx = nodes[0].length - 1;
  const ny = nodes.length - 1;
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const x = (i + 0.5) / nx;
      const y = (j + 0.5) / ny;
      let fill = "transparent";
      if (stage === "strain") {
        const e = strainAt(x, y);
        fill = colorScale(Math.hypot(e.xx, e.yy, e.xy), "green");
      }
      if (stage === "stress") {
        const s = stressAt(x, y);
        fill = colorScale(Math.hypot(s.xx, s.yy, s.xy) * 0.18, "orange");
      }
      if (stage === "residual") {
        const r = residualAt(x, y);
        fill = colorScale(Math.hypot(r.x, r.y) * 2.6, "red");
      }
      if (fill === "transparent") continue;
      const p1 = toCanvas(i / nx, j / ny, displacement(i / nx, j / ny), 1.55);
      const p2 = toCanvas((i + 1) / nx, j / ny, displacement((i + 1) / nx, j / ny), 1.55);
      const p3 = toCanvas((i + 1) / nx, (j + 1) / ny, displacement((i + 1) / nx, (j + 1) / ny), 1.55);
      const p4 = toCanvas(i / nx, (j + 1) / ny, displacement(i / nx, (j + 1) / ny), 1.55);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawMesh(nodes) {
  const nx = nodes[0].length - 1;
  const ny = nodes.length - 1;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(29, 37, 36, 0.36)";
  for (let j = 0; j <= ny; j += 1) {
    ctx.beginPath();
    for (let i = 0; i <= nx; i += 1) {
      const n = nodes[j][i];
      const p = toCanvas(n.x, n.y, n.u, 1.55);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  for (let i = 0; i <= nx; i += 1) {
    ctx.beginPath();
    for (let j = 0; j <= ny; j += 1) {
      const n = nodes[j][i];
      const p = toCanvas(n.x, n.y, n.u, 1.55);
      if (j === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
}

function drawOriginalMesh() {
  const nx = 10;
  const ny = 7;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(20, 89, 179, 0.18)";
  for (let j = 0; j <= ny; j += 1) {
    const p1 = toCanvas(0, j / ny);
    const p2 = toCanvas(1, j / ny);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  for (let i = 0; i <= nx; i += 1) {
    const p1 = toCanvas(i / nx, 0);
    const p2 = toCanvas(i / nx, 1);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

function drawVectors(stage) {
  const points = [
    [0.25, 0.25], [0.5, 0.25], [0.75, 0.25],
    [0.25, 0.55], [0.5, 0.55], [0.75, 0.55],
    [0.25, 0.82], [0.5, 0.82], [0.75, 0.82]
  ];
  points.forEach(([x, y]) => {
    const u = displacement(x, y);
    const p = toCanvas(x, y, u, 1.55);
    if (stage === "u") {
      const q = { x: p.x + u.x * 520, y: p.y - u.y * 520 };
      drawArrow(p, q, "#1459b3", 2);
    }
    if (stage === "residual") {
      const r = residualAt(x, y);
      const q = { x: p.x + r.x * 430, y: p.y - r.y * 430 };
      drawArrow(p, q, "#c52222", 2);
    }
    if (stage === "stress") {
      const s = stressAt(x, y);
      const q = { x: p.x + s.xx * 75, y: p.y - s.yy * 75 };
      drawArrow(p, q, "#e26a00", 2);
    }
  });
}

function drawBoundaries() {
  const leftBottom = toCanvas(0, 0, displacement(0, 0), 1.55);
  const leftTop = toCanvas(0, 1, displacement(0, 1), 1.55);
  const rightBottom = toCanvas(1, 0, displacement(1, 0), 1.55);
  const topLeft = toCanvas(0, 1, displacement(0, 1), 1.55);
  const topRight = toCanvas(1, 1, displacement(1, 1), 1.55);

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#111";
  ctx.beginPath();
  ctx.moveTo(leftBottom.x, leftBottom.y);
  ctx.lineTo(leftTop.x, leftTop.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(leftBottom.x, leftBottom.y);
  ctx.lineTo(rightBottom.x, rightBottom.y);
  ctx.stroke();

  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#16824b";
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#111";
  ctx.font = "18px Segoe UI, sans-serif";
  ctx.fillText("apoyo fijo", leftBottom.x + 10, leftBottom.y + 38);
  ctx.fillStyle = "#16824b";
  ctx.fillText("frontera libre", topLeft.x + 10, topLeft.y - 18);
}

function drawLabels() {
  const D = elasticScale();
  const chi = Math.exp(-state.iterations / 18);
  ctx.fillStyle = "#1d2524";
  ctx.font = "18px Segoe UI, sans-serif";
  ctx.fillText(`E=${state.E.toFixed(1)}   nu=${state.nu.toFixed(2)}   D=${D.toFixed(2)}   iter=${state.iterations}`, 28, 36);
  ctx.fillStyle = "#63716d";
  ctx.fillText(`chi ~ ${chi.toFixed(3)}: el residuo cae cuando se repite la correccion`, 28, 62);
}

function render() {
  const nodes = sampleField(10, 7);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fcfdfb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawOriginalMesh();
  drawCells(nodes, state.stage);
  drawMesh(nodes);
  drawVectors(state.stage);
  if (state.stage === "boundary") drawBoundaries();
  else {
    ctx.globalAlpha = 0.35;
    drawBoundaries();
    ctx.globalAlpha = 1;
  }
  drawLabels();

  stiffnessValue.textContent = state.E.toFixed(1);
  poissonValue.textContent = state.nu.toFixed(2);
  iterationsValue.textContent = String(state.iterations);
  scaleReadout.textContent = `D = ${elasticScale().toFixed(2)}`;
  residualReadout.textContent = `chi = ${Math.exp(-state.iterations / 18).toFixed(3)}`;
  stageReadout.textContent = stageText[state.stage];
}

function setStage(stage) {
  state.stage = stage;
  document.querySelectorAll(".stage-tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === stage);
  });
  render();
}

stiffness.addEventListener("input", (event) => {
  state.E = Number(event.target.value);
  render();
});

poisson.addEventListener("input", (event) => {
  state.nu = Number(event.target.value);
  render();
});

iterations.addEventListener("input", (event) => {
  state.iterations = Number(event.target.value);
  render();
});

stageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-stage]");
  if (button) setStage(button.dataset.stage);
});

resetButton.addEventListener("click", () => {
  state.E = 2.4;
  state.nu = 0.28;
  state.iterations = 28;
  stiffness.value = state.E;
  poisson.value = state.nu;
  iterations.value = state.iterations;
  setStage("u");
});

render();
