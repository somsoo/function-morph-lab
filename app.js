const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

let funcType = 'quad'; // 'quad', 'sin', 'cubic'
let a = 1.0, b = 0.0, c = 0.0;
let mouseX = null;

const formulaText = document.getElementById('formulaText');
const tangentText = document.getElementById('tangentText');
const paramA = document.getElementById('paramA');
const paramB = document.getElementById('paramB');
const paramC = document.getElementById('paramC');
const valA = document.getElementById('valA');
const valB = document.getElementById('valB');
const valC = document.getElementById('valC');
const btnResetParams = document.getElementById('btnResetParams');

function updateFormula() {
  valA.textContent = a.toFixed(1);
  valB.textContent = b.toFixed(1);
  valC.textContent = c.toFixed(1);

  if (funcType === 'quad') {
    formulaText.textContent = `y = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`;
  } else if (funcType === 'sin') {
    formulaText.textContent = `y = ${a.toFixed(1)}·sin(${b.toFixed(1)}x - ${c.toFixed(1)})`;
  } else if (funcType === 'cubic') {
    formulaText.textContent = `y = ${a.toFixed(1)}x³ + ${b.toFixed(1)}x² + ${c.toFixed(1)}`;
  }
}

paramA.addEventListener('input', (e) => { a = parseFloat(e.target.value); updateFormula(); });
paramB.addEventListener('input', (e) => { b = parseFloat(e.target.value); updateFormula(); });
paramC.addEventListener('input', (e) => { c = parseFloat(e.target.value); updateFormula(); });

btnResetParams.addEventListener('click', () => {
  a = (funcType === 'sin' || funcType === 'quad') ? 1.0 : 0.5;
  b = funcType === 'sin' ? 1.0 : 0.0;
  c = 0.0;
  paramA.value = a; paramB.value = b; paramC.value = c;
  updateFormula();
});

document.querySelectorAll('.mode-tabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    funcType = btn.dataset.type;
    btnResetParams.click();
  });
});

// Evaluate f(x) and f'(x)
function f(x) {
  if (funcType === 'quad') return a * x * x + b * x + c;
  if (funcType === 'sin') return a * Math.sin(b * x - c);
  if (funcType === 'cubic') return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c;
  return 0;
}
function df(x) {
  const h = 0.0001;
  return (f(x + h) - f(x - h)) / (2 * h);
}

// Coordinates
const scale = 30; // 30px per 1 unit
const cx = 300, cy = 170;

function toScreenX(x) { return cx + x * scale; }
function toScreenY(y) { return cy - y * scale; }
function toMathX(px) { return (px - cx) / scale; }

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  mouseX = (e.clientX - rect.left) * scaleX;
});
canvas.addEventListener('pointerleave', () => {
  mouseX = null;
  tangentText.textContent = "마우스를 그래프 위에 올리면 점에서의 미분 접선 f'(x)가 표시됩니다.";
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1;
  for (let x = -10; x <= 10; x++) {
    const sx = toScreenX(x);
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, canvas.height); ctx.stroke();
  }
  for (let y = -6; y <= 6; y++) {
    const sy = toScreenY(y);
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(canvas.width, sy); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();

  // Draw Function Curve
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = 0; px <= canvas.width; px += 2) {
    const mx = toMathX(px);
    const my = f(mx);
    const py = toScreenY(my);
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Tangent at mouseX
  if (mouseX !== null) {
    const mx = toMathX(mouseX);
    const my = f(mx);
    const slope = df(mx);
    const py = toScreenY(my);

    // Tangent Line: y - my = slope * (x - mx)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x1 = mx - 4, y1 = my - slope * 4;
    const x2 = mx + 4, y2 = my + slope * 4;
    ctx.moveTo(toScreenX(x1), toScreenY(y1));
    ctx.lineTo(toScreenX(x2), toScreenY(y2));
    ctx.stroke();

    // Tangent point
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(mouseX, py, 6, 0, Math.PI * 2);
    ctx.fill();

    tangentText.textContent = `x = ${mx.toFixed(2)} 에서 접선의 기울기 f'(${mx.toFixed(2)}) = ${slope.toFixed(2)}`;
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
updateFormula();
