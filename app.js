const courses = [
  {
    id: "matematika",
    code: "MA1101",
    title: "Matematika",
    lab: "Turunan dan Garis Singgung",
    description: "Geser titik pada kurva dan amati bagaimana gradien berubah.",
    kind: "Canvas",
    accent: "orange"
  },
  {
    id: "fisika",
    code: "FI1101",
    title: "Fisika",
    lab: "Gerak Proyektil",
    description: "Uji pengaruh sudut dan kecepatan terhadap lintasan benda.",
    kind: "Simulasi",
    accent: "teal"
  },
  {
    id: "kimia",
    code: "KI1101",
    title: "Kimia",
    lab: "Setarakan Reaksi",
    description: "Jaga jumlah atom sebelum dan sesudah reaksi tetap sama.",
    kind: "Partikel",
    accent: "yellow"
  },
  {
    id: "komputasional",
    code: "WI1102",
    title: "Berpikir Komputasional",
    lab: "Robot Maze",
    description: "Susun algoritma, jalankan, temukan kesalahan, lalu perbaiki.",
    kind: "Drag Drop",
    accent: "orange"
  },
  {
    id: "ai-data",
    code: "WI2002",
    title: "Literasi Data dan AI",
    lab: "Batas Klasifikasi",
    description: "Atur keputusan model dan ukur hasil klasifikasinya.",
    kind: "Data",
    accent: "teal"
  },
  {
    id: "sustainability",
    code: "WI1103",
    title: "Sustainability",
    lab: "Kebijakan Kampus",
    description: "Bagi anggaran sambil menjaga lingkungan, sosial, dan ekonomi.",
    kind: "Sistem",
    accent: "yellow"
  }
];

const catalogView = document.querySelector("#catalog-view");
const labView = document.querySelector("#lab-view");
const courseGrid = document.querySelector("#course-grid");
const labContent = document.querySelector("#lab-content");
const labCode = document.querySelector("#lab-code");
const labTitle = document.querySelector("#lab-title");
const labSummary = document.querySelector("#lab-summary");
const backButton = document.querySelector("#back-button");
const homeButton = document.querySelector("#home-button");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const closeHelp = document.querySelector("#close-help");
const statusCells = [...document.querySelectorAll(".status-cell")];
let cleanupLab = () => {};

const renderers = {
  matematika: renderMathLab,
  fisika: renderPhysicsLab,
  kimia: renderChemistryLab,
  komputasional: renderComputationalLab,
  "ai-data": renderAiLab,
  sustainability: renderSustainabilityLab
};

function renderCatalog() {
  courseGrid.innerHTML = courses.map((course, index) => `
    <button class="course-card" type="button" data-course="${course.id}" data-accent="${course.accent}" aria-label="Buka ${course.title}: ${course.lab}">
      <span class="course-topline">
        <span class="course-code">${course.code}</span>
        <span class="course-kind">${course.kind}</span>
      </span>
      <h2>${course.title}</h2>
      <p><strong>${course.lab}</strong></p>
      <p>${course.description}</p>
      <span class="course-enter"><span>Masuk lab</span><span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span></span>
    </button>
  `).join("");

  courseGrid.querySelectorAll("[data-course]").forEach((button) => {
    button.addEventListener("click", () => openLab(button.dataset.course));
  });
}

function openLab(id, updateHash = true) {
  const course = courses.find((item) => item.id === id);
  if (!course) {
    showCatalog();
    return;
  }
  cleanupLab();
  cleanupLab = () => {};
  catalogView.classList.add("hidden");
  labView.classList.remove("hidden");
  backButton.classList.remove("hidden");
  labCode.textContent = `${course.code} · LAB INTERAKTIF`;
  labTitle.textContent = course.lab;
  labSummary.textContent = course.description;
  updateStage(1);
  renderers[id]();
  if (updateHash) {
    history.pushState({ course: id }, "", `#${id}`);
  }
  document.querySelector("#main-content").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCatalog(updateHash = true) {
  cleanupLab();
  cleanupLab = () => {};
  labView.classList.add("hidden");
  catalogView.classList.remove("hidden");
  backButton.classList.add("hidden");
  labContent.innerHTML = "";
  if (updateHash) {
    history.pushState({}, "", location.pathname);
  }
  document.querySelector("#main-content").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStage(stage) {
  statusCells.forEach((cell, index) => {
    cell.classList.toggle("active", index + 1 <= stage);
  });
}

function setFeedback(element, title, message, tone = "warning") {
  element.dataset.tone = tone;
  element.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
}

function setupPrediction(name, feedback, explanations) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.addEventListener("change", () => {
      const result = explanations[input.value];
      setFeedback(feedback, result.title, result.message, result.tone);
      updateStage(2);
    });
  });
}

function prepareCanvas(canvas, cssHeight = 360) {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width);
  const height = Math.max(280, rect.height || cssHeight);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function labShell(control, experiment, reflection) {
  return `
    <div class="lab-layout">
      <aside class="control-panel">${control}</aside>
      <section class="experiment-panel">${experiment}</section>
      <section class="reflection-panel">
        <div>
          <span class="panel-label">03 REFLEKSI</span>
          <h2>Apa yang dapat disimpulkan?</h2>
        </div>
        <div class="reflection-question">${reflection}</div>
      </section>
    </div>
  `;
}

function renderMathLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Arah garis singgung</h2>
      <p>Untuk fungsi f(x) = x², bagaimana gradien saat titik berada di x negatif?</p>
      <fieldset class="prediction-group">
        <legend>Pilih dugaanmu</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="math-prediction" value="positive"> Positif, garis naik</label>
          <label class="choice"><input type="radio" name="math-prediction" value="zero"> Selalu nol</label>
          <label class="choice"><input type="radio" name="math-prediction" value="negative"> Negatif, garis turun</label>
        </div>
      </fieldset>
      <div class="feedback" id="math-prediction-feedback"><p>Pilih prediksi sebelum bereksperimen.</p></div>
      <div class="range-row">
        <label class="range-label" for="math-x"><span>Posisi x</span><output id="math-x-output">-2.0</output></label>
        <input id="math-x" type="range" min="-4" max="4" value="-2" step="0.1">
      </div>
      <div class="button-row"><button class="action-button secondary" id="math-reset" type="button">Reset</button></div>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Kurva dan garis singgung</h2>
      <div class="canvas-wrap"><canvas id="math-canvas" aria-label="Grafik fungsi kuadrat dan garis singgung"></canvas></div>
      <div class="metrics">
        <div class="metric"><span>Titik</span><strong id="math-point">(-2, 4)</strong></div>
        <div class="metric"><span>Gradien f'(x)</span><strong id="math-slope">-4.0</strong></div>
        <div class="metric"><span>Arah</span><strong id="math-direction">Turun</strong></div>
      </div>
      <div class="feedback" id="math-result"><p>Geser titik melewati x = 0 dan amati perubahan kemiringan.</p></div>
    `,
    `Gradien f(x) = x² adalah f'(x) = 2x. Di kiri titik minimum gradien bernilai negatif, tepat di x = 0 gradiennya nol, dan di kanan gradien bernilai positif. Turunan menyatakan laju perubahan sesaat.`
  );

  const slider = document.querySelector("#math-x");
  const canvas = document.querySelector("#math-canvas");
  const output = document.querySelector("#math-x-output");
  const point = document.querySelector("#math-point");
  const slope = document.querySelector("#math-slope");
  const direction = document.querySelector("#math-direction");
  const result = document.querySelector("#math-result");
  const predictionFeedback = document.querySelector("#math-prediction-feedback");

  setupPrediction("math-prediction", predictionFeedback, {
    positive: { title: "Coba buktikan", message: "Geser titik di wilayah x negatif dan perhatikan arah garis.", tone: "warning" },
    zero: { title: "Coba buktikan", message: "Gradien nol hanya muncul pada posisi tertentu.", tone: "warning" },
    negative: { title: "Prediksi tercatat", message: "Sekarang geser titik untuk menguji alasanmu.", tone: "success" }
  });

  function draw() {
    const x0 = Number(slider.value);
    const y0 = x0 * x0;
    const m = 2 * x0;
    const { context: ctx, width, height } = prepareCanvas(canvas);
    const padding = 38;
    const xMin = -5;
    const xMax = 5;
    const yMin = -3;
    const yMax = 26;
    const px = (x) => padding + ((x - xMin) / (xMax - xMin)) * (width - padding * 2);
    const py = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - padding * 2);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ead8ad";
    ctx.lineWidth = 1;
    for (let x = -5; x <= 5; x += 1) {
      ctx.beginPath();
      ctx.moveTo(px(x), padding);
      ctx.lineTo(px(x), height - padding);
      ctx.stroke();
    }
    for (let y = 0; y <= 25; y += 5) {
      ctx.beginPath();
      ctx.moveTo(padding, py(y));
      ctx.lineTo(width - padding, py(y));
      ctx.stroke();
    }
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, py(0));
    ctx.lineTo(width - padding, py(0));
    ctx.moveTo(px(0), padding);
    ctx.lineTo(px(0), height - padding);
    ctx.stroke();
    ctx.strokeStyle = "#218c82";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = xMin; x <= xMax; x += 0.05) {
      const method = x === xMin ? "moveTo" : "lineTo";
      ctx[method](px(x), py(x * x));
    }
    ctx.stroke();
    ctx.strokeStyle = "#e4572e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    const tangentLeft = m * (xMin - x0) + y0;
    const tangentRight = m * (xMax - x0) + y0;
    ctx.moveTo(px(xMin), py(tangentLeft));
    ctx.lineTo(px(xMax), py(tangentRight));
    ctx.stroke();
    ctx.fillStyle = "#f2c14e";
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px(x0), py(y0), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    output.textContent = x0.toFixed(1);
    point.textContent = `(${x0.toFixed(1)}, ${y0.toFixed(1)})`;
    slope.textContent = m.toFixed(1);
    const directionText = Math.abs(m) < 0.05 ? "Datar" : m > 0 ? "Naik" : "Turun";
    direction.textContent = directionText;
    const message = Math.abs(m) < 0.05
      ? "Di titik minimum, garis singgung mendatar dan gradien sama dengan nol."
      : `Ketika x = ${x0.toFixed(1)}, setiap kenaikan kecil x mengubah f(x) sekitar ${Math.abs(m).toFixed(1)} kali ke arah ${m > 0 ? "atas" : "bawah"}.`;
    setFeedback(result, "Pengamatan", message, Math.abs(m) < 0.05 ? "success" : "warning");
  }

  const resize = () => draw();
  slider.addEventListener("input", () => {
    draw();
    updateStage(3);
  });
  document.querySelector("#math-reset").addEventListener("click", () => {
    slider.value = -2;
    draw();
    updateStage(2);
  });
  window.addEventListener("resize", resize);
  draw();
  cleanupLab = () => window.removeEventListener("resize", resize);
}

function renderPhysicsLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Sudut peluncuran</h2>
      <p>Dengan kecepatan awal yang sama dan tanpa hambatan udara, sudut mana yang memberi jangkauan terjauh?</p>
      <fieldset class="prediction-group">
        <legend>Pilih dugaanmu</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="physics-prediction" value="30"> 30 derajat</label>
          <label class="choice"><input type="radio" name="physics-prediction" value="45"> 45 derajat</label>
          <label class="choice"><input type="radio" name="physics-prediction" value="60"> 60 derajat</label>
        </div>
      </fieldset>
      <div class="feedback" id="physics-prediction-feedback"><p>Pilih prediksi, lalu uji beberapa sudut.</p></div>
      <div class="range-row">
        <label class="range-label" for="physics-speed"><span>Kecepatan</span><output id="physics-speed-output">20 m/s</output></label>
        <input id="physics-speed" type="range" min="8" max="32" value="20" step="1">
      </div>
      <div class="range-row">
        <label class="range-label" for="physics-angle"><span>Sudut</span><output id="physics-angle-output">45°</output></label>
        <input id="physics-angle" type="range" min="15" max="75" value="45" step="1">
      </div>
      <div class="button-row">
        <button class="action-button primary" id="physics-launch" type="button">Luncurkan</button>
        <button class="action-button secondary" id="physics-reset" type="button">Reset</button>
      </div>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Lintasan benda</h2>
      <div class="canvas-wrap"><canvas id="physics-canvas" aria-label="Simulasi lintasan gerak proyektil"></canvas></div>
      <div class="metrics">
        <div class="metric"><span>Waktu terbang</span><strong id="physics-time">2.89 s</strong></div>
        <div class="metric"><span>Tinggi maksimum</span><strong id="physics-height">10.20 m</strong></div>
        <div class="metric"><span>Jangkauan</span><strong id="physics-range">40.82 m</strong></div>
      </div>
      <div class="feedback" id="physics-result"><p>Tekan Luncurkan untuk melihat gerak benda terhadap waktu.</p></div>
    `,
    `Pada permukaan datar, pasangan sudut yang jumlahnya 90° menghasilkan jangkauan sama. Sudut 45° memberi jangkauan maksimum karena menyeimbangkan komponen kecepatan horizontal dan vertikal.`
  );

  const speedSlider = document.querySelector("#physics-speed");
  const angleSlider = document.querySelector("#physics-angle");
  const speedOutput = document.querySelector("#physics-speed-output");
  const angleOutput = document.querySelector("#physics-angle-output");
  const canvas = document.querySelector("#physics-canvas");
  const result = document.querySelector("#physics-result");
  const predictionFeedback = document.querySelector("#physics-prediction-feedback");
  let animationFrame = 0;
  let progress = 1;

  setupPrediction("physics-prediction", predictionFeedback, {
    30: { title: "Hipotesis tersimpan", message: "Bandingkan 30°, 45°, dan 60° dengan kecepatan tetap.", tone: "warning" },
    45: { title: "Hipotesis tersimpan", message: "Uji apakah keseimbangan komponen horizontal dan vertikal benar-benar optimal.", tone: "success" },
    60: { title: "Hipotesis tersimpan", message: "Sudut tinggi memperbesar waktu di udara, tetapi mengurangi kecepatan horizontal.", tone: "warning" }
  });

  function values() {
    const speed = Number(speedSlider.value);
    const angle = Number(angleSlider.value) * Math.PI / 180;
    const g = 9.8;
    const totalTime = (2 * speed * Math.sin(angle)) / g;
    const maxHeight = (speed * speed * Math.sin(angle) ** 2) / (2 * g);
    const range = (speed * speed * Math.sin(2 * angle)) / g;
    return { speed, angle, g, totalTime, maxHeight, range };
  }

  function draw() {
    const data = values();
    const { context: ctx, width, height } = prepareCanvas(canvas);
    const pad = 40;
    const plotWidth = width - pad * 2;
    const plotHeight = height - pad * 2;
    const maxX = Math.max(25, data.range * 1.12);
    const maxY = Math.max(12, data.maxHeight * 1.35);
    const px = (x) => pad + (x / maxX) * plotWidth;
    const py = (y) => height - pad - (y / maxY) * plotHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ead8ad";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i += 1) {
      const x = pad + (plotWidth / 5) * i;
      const y = pad + (plotHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x, height - pad);
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.stroke();
    ctx.strokeStyle = "#218c82";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 100; i += 1) {
      const t = data.totalTime * i / 100;
      const x = data.speed * Math.cos(data.angle) * t;
      const y = data.speed * Math.sin(data.angle) * t - 0.5 * data.g * t * t;
      const method = i === 0 ? "moveTo" : "lineTo";
      ctx[method](px(x), py(Math.max(0, y)));
    }
    ctx.stroke();
    const currentTime = data.totalTime * progress;
    const currentX = data.speed * Math.cos(data.angle) * currentTime;
    const currentY = data.speed * Math.sin(data.angle) * currentTime - 0.5 * data.g * currentTime * currentTime;
    ctx.fillStyle = "#f2c14e";
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px(currentX), py(Math.max(0, currentY)), 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    speedOutput.textContent = `${data.speed} m/s`;
    angleOutput.textContent = `${angleSlider.value}°`;
    document.querySelector("#physics-time").textContent = `${data.totalTime.toFixed(2)} s`;
    document.querySelector("#physics-height").textContent = `${data.maxHeight.toFixed(2)} m`;
    document.querySelector("#physics-range").textContent = `${data.range.toFixed(2)} m`;
  }

  function updatePreview() {
    cancelAnimationFrame(animationFrame);
    progress = 1;
    draw();
    setFeedback(result, "Parameter diubah", "Tekan Luncurkan untuk mengamati lintasan dari awal.", "warning");
  }

  function launch() {
    cancelAnimationFrame(animationFrame);
    const start = performance.now();
    const duration = 1800;
    function animate(now) {
      progress = Math.min(1, (now - start) / duration);
      draw();
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        const data = values();
        const optimal = Math.abs(Number(angleSlider.value) - 45) <= 2;
        setFeedback(result, "Percobaan selesai", `Benda menempuh ${data.range.toFixed(2)} meter dalam ${data.totalTime.toFixed(2)} detik. ${optimal ? "Sudut ini berada dekat jangkauan maksimum." : "Coba bandingkan dengan sudut 45°."}`, optimal ? "success" : "warning");
        updateStage(3);
      }
    }
    animationFrame = requestAnimationFrame(animate);
  }

  speedSlider.addEventListener("input", updatePreview);
  angleSlider.addEventListener("input", updatePreview);
  document.querySelector("#physics-launch").addEventListener("click", launch);
  document.querySelector("#physics-reset").addEventListener("click", () => {
    speedSlider.value = 20;
    angleSlider.value = 45;
    updatePreview();
    updateStage(2);
  });
  const resize = () => draw();
  window.addEventListener("resize", resize);
  draw();
  cleanupLab = () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resize);
  };
}

function renderChemistryLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Kekekalan atom</h2>
      <p>Bolehkah jumlah atom oksigen berubah setelah reaksi berlangsung?</p>
      <fieldset class="prediction-group">
        <legend>Pilih dugaanmu</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="chem-prediction" value="yes"> Boleh, atom dapat hilang</label>
          <label class="choice"><input type="radio" name="chem-prediction" value="no"> Tidak, jumlahnya harus sama</label>
        </div>
      </fieldset>
      <div class="feedback" id="chem-prediction-feedback"><p>Pilih prediksi sebelum mengatur koefisien.</p></div>
      <div class="equation" aria-label="Koefisien reaksi kimia">
        <label><input id="coeff-h2" type="number" min="1" max="6" value="1" aria-label="Koefisien H2"> H₂</label>
        <span>+</span>
        <label><input id="coeff-o2" type="number" min="1" max="6" value="1" aria-label="Koefisien O2"> O₂</label>
        <span>→</span>
        <label><input id="coeff-h2o" type="number" min="1" max="6" value="1" aria-label="Koefisien H2O"> H₂O</label>
      </div>
      <div class="button-row">
        <button class="action-button primary" id="chem-check" type="button">Periksa reaksi</button>
        <button class="action-button secondary" id="chem-reset" type="button">Reset</button>
      </div>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Neraca partikel</h2>
      <div class="canvas-wrap"><canvas id="chem-canvas" aria-label="Visualisasi partikel hidrogen, oksigen, dan air"></canvas></div>
      <div class="atom-counts">
        <div class="atom-side"><h3>Reaktan</h3><p>H: <strong id="reactant-h">2</strong></p><p>O: <strong id="reactant-o">2</strong></p></div>
        <div class="atom-side"><h3>Produk</h3><p>H: <strong id="product-h">2</strong></p><p>O: <strong id="product-o">1</strong></p></div>
      </div>
      <div class="feedback" id="chem-result"><p>Ubah koefisien hingga jumlah setiap jenis atom seimbang.</p></div>
    `,
    `Koefisien mengubah jumlah molekul, bukan angka indeks di dalam rumus kimia. Persamaan 2H₂ + O₂ → 2H₂O memiliki empat atom H dan dua atom O pada kedua ruas.`
  );

  const h2Input = document.querySelector("#coeff-h2");
  const o2Input = document.querySelector("#coeff-o2");
  const h2oInput = document.querySelector("#coeff-h2o");
  const canvas = document.querySelector("#chem-canvas");
  const result = document.querySelector("#chem-result");
  const predictionFeedback = document.querySelector("#chem-prediction-feedback");

  setupPrediction("chem-prediction", predictionFeedback, {
    yes: { title: "Uji kembali", message: "Dalam reaksi biasa, atom disusun ulang dan tidak diciptakan atau dimusnahkan.", tone: "danger" },
    no: { title: "Prediksi tercatat", message: "Atur koefisien untuk membuktikan kekekalan setiap jenis atom.", tone: "success" }
  });

  function coefficients() {
    return {
      h2: Math.max(1, Math.min(6, Number(h2Input.value) || 1)),
      o2: Math.max(1, Math.min(6, Number(o2Input.value) || 1)),
      h2o: Math.max(1, Math.min(6, Number(h2oInput.value) || 1))
    };
  }

  function molecule(ctx, x, y, type) {
    const atom = (cx, cy, radius, color, label) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = "#1b2338";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1b2338";
      ctx.font = "bold 12px Courier New";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx, cy + 1);
    };
    if (type === "h2") {
      atom(x - 10, y, 14, "#f8edcf", "H");
      atom(x + 10, y, 14, "#f8edcf", "H");
    }
    if (type === "o2") {
      atom(x - 11, y, 16, "#e4572e", "O");
      atom(x + 11, y, 16, "#e4572e", "O");
    }
    if (type === "h2o") {
      atom(x, y, 17, "#e4572e", "O");
      atom(x - 19, y + 13, 12, "#f8edcf", "H");
      atom(x + 19, y + 13, 12, "#f8edcf", "H");
    }
  }

  function draw() {
    const data = coefficients();
    h2Input.value = data.h2;
    o2Input.value = data.o2;
    h2oInput.value = data.h2o;
    const { context: ctx, width, height } = prepareCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 34);
    ctx.lineTo(width / 2, height - 34);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#1b2338";
    ctx.font = "bold 14px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("REAKTAN", width * 0.25, 28);
    ctx.fillText("PRODUK", width * 0.75, 28);
    const leftItems = [
      ...Array(data.h2).fill("h2"),
      ...Array(data.o2).fill("o2")
    ];
    const rightItems = Array(data.h2o).fill("h2o");
    const place = (items, startX, areaWidth) => {
      const columns = areaWidth < 300 ? 2 : 3;
      items.forEach((type, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + ((col + 0.5) / columns) * areaWidth;
        const y = 86 + row * 72;
        if (y < height - 26) molecule(ctx, x, y, type);
      });
    };
    place(leftItems, 12, width / 2 - 24);
    place(rightItems, width / 2 + 12, width / 2 - 24);
    const reactantH = data.h2 * 2;
    const reactantO = data.o2 * 2;
    const productH = data.h2o * 2;
    const productO = data.h2o;
    document.querySelector("#reactant-h").textContent = reactantH;
    document.querySelector("#reactant-o").textContent = reactantO;
    document.querySelector("#product-h").textContent = productH;
    document.querySelector("#product-o").textContent = productO;
    return reactantH === productH && reactantO === productO;
  }

  [h2Input, o2Input, h2oInput].forEach((input) => input.addEventListener("input", () => {
    draw();
    setFeedback(result, "Neraca diperbarui", "Bandingkan jumlah H dan O pada kedua sisi, lalu tekan Periksa reaksi.", "warning");
  }));
  document.querySelector("#chem-check").addEventListener("click", () => {
    const balanced = draw();
    if (balanced) {
      setFeedback(result, "Reaksi setara", "Jumlah atom H dan O sama pada kedua ruas. Hukum kekekalan atom terpenuhi.", "success");
      updateStage(3);
    } else {
      setFeedback(result, "Belum setara", "Masih ada jenis atom dengan jumlah berbeda. Ubah koefisien, bukan angka indeks rumus.", "danger");
    }
  });
  document.querySelector("#chem-reset").addEventListener("click", () => {
    h2Input.value = 1;
    o2Input.value = 1;
    h2oInput.value = 1;
    draw();
    setFeedback(result, "Eksperimen direset", "Mulai lagi dengan membandingkan jumlah H dan O.", "warning");
    updateStage(2);
  });
  const resize = () => draw();
  window.addEventListener("resize", resize);
  draw();
  cleanupLab = () => window.removeEventListener("resize", resize);
}

function renderComputationalLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Rancang sebelum menjalankan</h2>
      <p>Strategi apa yang paling membantu saat robot gagal mencapai tujuan?</p>
      <fieldset class="prediction-group">
        <legend>Pilih tindakan</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="ct-prediction" value="random"> Tambah instruksi acak</label>
          <label class="choice"><input type="radio" name="ct-prediction" value="debug"> Telusuri langkah dan perbaiki</label>
        </div>
      </fieldset>
      <div class="feedback" id="ct-prediction-feedback"><p>Pilih strategi, lalu susun program.</p></div>
      <h2>Blok instruksi</h2>
      <p>Seret atau ketuk blok untuk menambahkannya ke program.</p>
      <div class="block-bank" id="block-bank" aria-label="Pilihan blok instruksi">
        <button class="block-button" type="button" draggable="true" data-command="forward">MAJU</button>
        <button class="block-button" type="button" draggable="true" data-command="left">KIRI</button>
        <button class="block-button" type="button" draggable="true" data-command="right">KANAN</button>
      </div>
      <div class="button-row">
        <button class="action-button primary" id="run-program" type="button">Jalankan</button>
        <button class="action-button secondary" id="clear-program" type="button">Kosongkan</button>
      </div>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Robot Maze</h2>
      <div class="maze-shell">
        <div class="maze-grid" id="maze-grid" aria-label="Maze lima kali lima"></div>
        <div class="command-area">
          <div>
            <h3>Program</h3>
            <p>Tujuan berada di pojok kanan atas. Robot mulai menghadap ke atas.</p>
          </div>
          <div class="program-track" id="program-track" tabindex="0" aria-label="Urutan program. Seret blok ke area ini."></div>
          <p><strong id="program-count">0</strong> instruksi</p>
        </div>
      </div>
      <div class="feedback" id="ct-result"><p>Susun instruksi. Setiap blok dijalankan dari kiri ke kanan.</p></div>
    `,
    `Algoritma adalah urutan langkah yang jelas. Debugging dilakukan dengan mencari langkah pertama yang menghasilkan keadaan berbeda dari rencana, lalu memperbaikinya secara terarah.`
  );

  const grid = document.querySelector("#maze-grid");
  const track = document.querySelector("#program-track");
  const result = document.querySelector("#ct-result");
  const predictionFeedback = document.querySelector("#ct-prediction-feedback");
  const walls = new Set(["1,4", "2,4", "3,4", "1,3", "2,3", "3,3", "4,3", "3,2", "4,2", "0,1", "1,1", "3,1", "4,1"]);
  const program = [];
  let robot = { x: 0, y: 4, direction: 0 };
  let runTimer = 0;

  setupPrediction("ct-prediction", predictionFeedback, {
    random: { title: "Kurang terarah", message: "Instruksi acak dapat menambah masalah baru dan menyulitkan pelacakan kesalahan.", tone: "danger" },
    debug: { title: "Strategi tepat", message: "Jalankan, amati langkah gagal pertama, lalu ubah bagian itu.", tone: "success" }
  });

  function directionLabel() {
    return ["↑", "→", "↓", "←"][robot.direction];
  }

  function renderGrid() {
    grid.innerHTML = "";
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const cell = document.createElement("div");
        cell.className = "maze-cell";
        if (walls.has(`${x},${y}`)) cell.classList.add("wall");
        if (x === 4 && y === 0) cell.classList.add("goal");
        if (x === robot.x && y === robot.y) {
          const marker = document.createElement("span");
          marker.className = "robot";
          marker.textContent = directionLabel();
          marker.setAttribute("aria-label", `Robot menghadap ${directionLabel()}`);
          cell.append(marker);
        }
        grid.append(cell);
      }
    }
  }

  function renderProgram() {
    track.innerHTML = "";
    program.forEach((command, index) => {
      const chip = document.createElement("span");
      chip.className = "program-chip";
      chip.textContent = command === "forward" ? "MAJU" : command === "left" ? "KIRI" : "KANAN";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Hapus instruksi ${index + 1}`);
      remove.addEventListener("click", () => {
        program.splice(index, 1);
        renderProgram();
      });
      chip.append(remove);
      track.append(chip);
    });
    document.querySelector("#program-count").textContent = program.length;
  }

  function addCommand(command) {
    if (program.length >= 18) {
      setFeedback(result, "Program penuh", "Gunakan maksimal 18 instruksi. Hapus langkah yang tidak diperlukan.", "danger");
      return;
    }
    program.push(command);
    renderProgram();
    updateStage(2);
  }

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => addCommand(button.dataset.command));
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", button.dataset.command);
      event.dataTransfer.effectAllowed = "copy";
    });
  });
  track.addEventListener("dragover", (event) => {
    event.preventDefault();
    track.classList.add("drag-over");
  });
  track.addEventListener("dragleave", () => track.classList.remove("drag-over"));
  track.addEventListener("drop", (event) => {
    event.preventDefault();
    track.classList.remove("drag-over");
    const command = event.dataTransfer.getData("text/plain");
    if (["forward", "left", "right"].includes(command)) addCommand(command);
  });

  function resetRobot() {
    robot = { x: 0, y: 4, direction: 0 };
    renderGrid();
  }

  function execute(command) {
    if (command === "left") {
      robot.direction = (robot.direction + 3) % 4;
      renderGrid();
      return "ok";
    }
    if (command === "right") {
      robot.direction = (robot.direction + 1) % 4;
      renderGrid();
      return "ok";
    }
    const moves = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const [dx, dy] = moves[robot.direction];
    const nextX = robot.x + dx;
    const nextY = robot.y + dy;
    if (nextX < 0 || nextX >= 5 || nextY < 0 || nextY >= 5 || walls.has(`${nextX},${nextY}`)) {
      return "crash";
    }
    robot.x = nextX;
    robot.y = nextY;
    renderGrid();
    return robot.x === 4 && robot.y === 0 ? "goal" : "ok";
  }

  function runProgram() {
    clearTimeout(runTimer);
    resetRobot();
    if (program.length === 0) {
      setFeedback(result, "Program kosong", "Tambahkan setidaknya satu instruksi.", "danger");
      return;
    }
    let index = 0;
    setFeedback(result, "Program berjalan", "Robot menjalankan instruksi secara berurutan.", "warning");
    function step() {
      const state = execute(program[index]);
      if (state === "crash") {
        setFeedback(result, `Terhalang pada langkah ${index + 1}`, "Robot mencoba masuk ke dinding atau keluar maze. Periksa arah sebelum blok MAJU ini.", "danger");
        updateStage(3);
        return;
      }
      if (state === "goal") {
        setFeedback(result, "Tujuan tercapai", `Algoritma berhasil dalam ${index + 1} langkah. Coba cari urutan yang paling ringkas.`, "success");
        updateStage(3);
        return;
      }
      index += 1;
      if (index < program.length) {
        runTimer = window.setTimeout(step, 280);
      } else {
        setFeedback(result, "Program selesai", "Robot belum mencapai tujuan. Lihat posisi dan arahnya, lalu lanjutkan algoritma.", "warning");
        updateStage(3);
      }
    }
    runTimer = window.setTimeout(step, 250);
  }

  document.querySelector("#run-program").addEventListener("click", runProgram);
  document.querySelector("#clear-program").addEventListener("click", () => {
    clearTimeout(runTimer);
    program.length = 0;
    renderProgram();
    resetRobot();
    setFeedback(result, "Program dikosongkan", "Susun algoritma baru dari posisi awal.", "warning");
    updateStage(2);
  });
  renderGrid();
  renderProgram();
  cleanupLab = () => clearTimeout(runTimer);
}

function renderAiLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Akurasi model</h2>
      <p>Apakah batas keputusan di tengah selalu menghasilkan akurasi terbaik?</p>
      <fieldset class="prediction-group">
        <legend>Pilih dugaanmu</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="ai-prediction" value="always"> Ya, selalu</label>
          <label class="choice"><input type="radio" name="ai-prediction" value="data"> Tergantung sebaran data</label>
        </div>
      </fieldset>
      <div class="feedback" id="ai-prediction-feedback"><p>Pilih prediksi, lalu geser batas model.</p></div>
      <div class="range-row">
        <label class="range-label" for="ai-threshold"><span>Batas keputusan</span><output id="ai-threshold-output">50</output></label>
        <input id="ai-threshold" type="range" min="15" max="85" value="50" step="1">
      </div>
      <div class="button-row"><button class="action-button secondary" id="ai-reset" type="button">Reset</button></div>
      <p>Kiri garis diprediksi Kelas A. Kanan garis diprediksi Kelas B.</p>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Dataset dan keputusan model</h2>
      <div class="canvas-wrap"><canvas id="ai-canvas" aria-label="Diagram sebar data dan batas klasifikasi"></canvas></div>
      <div class="metrics">
        <div class="metric"><span>Akurasi</span><strong id="ai-accuracy">0%</strong></div>
        <div class="metric"><span>Benar A / A</span><strong id="ai-a">0 / 0</strong></div>
        <div class="metric"><span>Benar B / B</span><strong id="ai-b">0 / 0</strong></div>
      </div>
      <div class="feedback" id="ai-result"><p>Geser garis untuk mencari akurasi terbaik.</p></div>
    `,
    `Batas keputusan dipelajari dari pola data. Akurasi hanya satu ukuran: dataset yang tidak mewakili populasi dapat menghasilkan model yang tampak akurat tetapi merugikan kelompok tertentu. Data, tujuan, dan dampak penggunaan tetap perlu diperiksa.`
  );

  const data = [
    { x: 17, y: 32, label: "A" }, { x: 22, y: 68, label: "A" }, { x: 28, y: 48, label: "A" },
    { x: 34, y: 76, label: "A" }, { x: 39, y: 25, label: "A" }, { x: 45, y: 58, label: "A" },
    { x: 52, y: 38, label: "A" }, { x: 41, y: 88, label: "A" }, { x: 36, y: 14, label: "A" },
    { x: 43, y: 42, label: "B" }, { x: 51, y: 72, label: "B" }, { x: 57, y: 20, label: "B" },
    { x: 62, y: 56, label: "B" }, { x: 68, y: 82, label: "B" }, { x: 73, y: 35, label: "B" },
    { x: 78, y: 66, label: "B" }, { x: 84, y: 45, label: "B" }, { x: 64, y: 12, label: "B" }
  ];
  const slider = document.querySelector("#ai-threshold");
  const output = document.querySelector("#ai-threshold-output");
  const canvas = document.querySelector("#ai-canvas");
  const result = document.querySelector("#ai-result");
  const predictionFeedback = document.querySelector("#ai-prediction-feedback");

  setupPrediction("ai-prediction", predictionFeedback, {
    always: { title: "Perlu diuji", message: "Posisi terbaik ditentukan oleh sebaran data, bukan bentuk bidang semata.", tone: "warning" },
    data: { title: "Prediksi tercatat", message: "Cari batas yang paling sedikit salah mengelompokkan titik.", tone: "success" }
  });

  function draw() {
    const threshold = Number(slider.value);
    const { context: ctx, width, height } = prepareCanvas(canvas);
    const pad = 42;
    const px = (x) => pad + (x / 100) * (width - pad * 2);
    const py = (y) => height - pad - (y / 100) * (height - pad * 2);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(33, 140, 130, 0.12)";
    ctx.fillRect(pad, pad, px(threshold) - pad, height - pad * 2);
    ctx.fillStyle = "rgba(228, 87, 46, 0.12)";
    ctx.fillRect(px(threshold), pad, width - pad - px(threshold), height - pad * 2);
    ctx.strokeStyle = "#ead8ad";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(px(i), pad);
      ctx.lineTo(px(i), height - pad);
      ctx.moveTo(pad, py(i));
      ctx.lineTo(width - pad, py(i));
      ctx.stroke();
    }
    ctx.strokeStyle = "#1b2338";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.stroke();
    ctx.strokeStyle = "#f2c14e";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px(threshold), pad);
    ctx.lineTo(px(threshold), height - pad);
    ctx.stroke();
    let correct = 0;
    let totalA = 0;
    let totalB = 0;
    let correctA = 0;
    let correctB = 0;
    data.forEach((point) => {
      const prediction = point.x < threshold ? "A" : "B";
      const isCorrect = prediction === point.label;
      if (isCorrect) correct += 1;
      if (point.label === "A") {
        totalA += 1;
        if (isCorrect) correctA += 1;
      } else {
        totalB += 1;
        if (isCorrect) correctB += 1;
      }
      ctx.fillStyle = point.label === "A" ? "#218c82" : "#e4572e";
      ctx.strokeStyle = isCorrect ? "#1b2338" : "#b83b3b";
      ctx.lineWidth = isCorrect ? 2 : 5;
      if (point.label === "A") {
        ctx.beginPath();
        ctx.arc(px(point.x), py(point.y), 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(px(point.x) - 8, py(point.y) - 8, 16, 16);
        ctx.strokeRect(px(point.x) - 8, py(point.y) - 8, 16, 16);
      }
    });
    const accuracy = Math.round((correct / data.length) * 100);
    output.textContent = threshold;
    document.querySelector("#ai-accuracy").textContent = `${accuracy}%`;
    document.querySelector("#ai-a").textContent = `${correctA} / ${totalA}`;
    document.querySelector("#ai-b").textContent = `${correctB} / ${totalB}`;
    const tone = accuracy >= 88 ? "success" : accuracy >= 70 ? "warning" : "danger";
    setFeedback(result, `Akurasi ${accuracy}%`, accuracy >= 88 ? "Batas ini cocok untuk sebagian besar data latihan. Periksa juga kesalahan pada tiap kelas." : "Beberapa titik berada di sisi keputusan yang salah. Geser batas dan bandingkan.", tone);
  }

  slider.addEventListener("input", () => {
    draw();
    updateStage(3);
  });
  document.querySelector("#ai-reset").addEventListener("click", () => {
    slider.value = 50;
    draw();
    updateStage(2);
  });
  const resize = () => draw();
  window.addEventListener("resize", resize);
  draw();
  cleanupLab = () => window.removeEventListener("resize", resize);
}

function renderSustainabilityLab() {
  labContent.innerHTML = labShell(
    `
      <span class="panel-label">01 PREDIKSI</span>
      <h2>Tiga dimensi</h2>
      <p>Apakah seluruh anggaran sebaiknya diberikan pada satu program dengan dampak lingkungan tertinggi?</p>
      <fieldset class="prediction-group">
        <legend>Pilih dugaanmu</legend>
        <div class="choice-list">
          <label class="choice"><input type="radio" name="sustain-prediction" value="single"> Ya, fokus satu program</label>
          <label class="choice"><input type="radio" name="sustain-prediction" value="balance"> Tidak, cari keseimbangan</label>
        </div>
      </fieldset>
      <div class="feedback" id="sustain-prediction-feedback"><p>Pilih prediksi, lalu bagi 100 poin anggaran.</p></div>
      <div class="range-row">
        <label class="range-label" for="budget-energy"><span>Energi bersih</span><output id="energy-output">34</output></label>
        <input id="budget-energy" type="range" min="0" max="100" value="34" step="1">
      </div>
      <div class="range-row">
        <label class="range-label" for="budget-transit"><span>Transportasi publik</span><output id="transit-output">33</output></label>
        <input id="budget-transit" type="range" min="0" max="100" value="33" step="1">
      </div>
      <div class="range-row">
        <label class="range-label" for="budget-green"><span>Ruang hijau dan komunitas</span><output id="green-output">33</output></label>
        <input id="budget-green" type="range" min="0" max="100" value="33" step="1">
      </div>
      <div class="budget-total" id="budget-total"><span>Total</span><output>100 / 100</output></div>
      <div class="button-row">
        <button class="action-button primary" id="evaluate-policy" type="button">Evaluasi</button>
        <button class="action-button secondary" id="sustain-reset" type="button">Reset</button>
      </div>
    `,
    `
      <span class="panel-label">02 EKSPERIMEN</span>
      <h2>Dampak kebijakan kampus</h2>
      <div class="canvas-wrap"><canvas id="sustain-canvas" aria-label="Diagram dampak lingkungan, sosial, dan ekonomi"></canvas></div>
      <div class="metrics">
        <div class="metric"><span>Lingkungan</span><strong id="score-environment">0</strong></div>
        <div class="metric"><span>Sosial</span><strong id="score-social">0</strong></div>
        <div class="metric"><span>Ekonomi</span><strong id="score-economy">0</strong></div>
      </div>
      <div class="feedback" id="sustain-result"><p>Ketiga dimensi harus mencapai minimal 60 poin.</p></div>
    `,
    `Keberlanjutan melihat keterkaitan lingkungan, sosial, dan ekonomi sebagai satu sistem. Solusi terbaik bukan selalu yang memaksimalkan satu indikator, melainkan yang menjaga manfaat dan risiko antardimensi dalam konteks lokal.`
  );

  const energy = document.querySelector("#budget-energy");
  const transit = document.querySelector("#budget-transit");
  const green = document.querySelector("#budget-green");
  const totalBox = document.querySelector("#budget-total");
  const canvas = document.querySelector("#sustain-canvas");
  const result = document.querySelector("#sustain-result");
  const predictionFeedback = document.querySelector("#sustain-prediction-feedback");

  setupPrediction("sustain-prediction", predictionFeedback, {
    single: { title: "Periksa dampak silang", message: "Memaksimalkan satu program dapat meninggalkan kebutuhan sosial atau ekonomi.", tone: "warning" },
    balance: { title: "Prediksi tercatat", message: "Cari kombinasi yang membuat ketiga dimensi melewati ambang aman.", tone: "success" }
  });

  function policy() {
    const e = Number(energy.value);
    const t = Number(transit.value);
    const g = Number(green.value);
    const total = e + t + g;
    const environment = Math.min(100, Math.round(25 + e * 0.55 + t * 0.45 + g * 0.35));
    const social = Math.min(100, Math.round(30 + e * 0.12 + t * 0.42 + g * 0.48));
    const economy = Math.min(100, Math.round(69 - e * 0.14 + t * 0.23 + g * 0.08));
    return { e, t, g, total, environment, social, economy };
  }

  function draw() {
    const data = policy();
    document.querySelector("#energy-output").textContent = data.e;
    document.querySelector("#transit-output").textContent = data.t;
    document.querySelector("#green-output").textContent = data.g;
    totalBox.querySelector("output").textContent = `${data.total} / 100`;
    totalBox.classList.toggle("invalid", data.total !== 100);
    document.querySelector("#score-environment").textContent = data.environment;
    document.querySelector("#score-social").textContent = data.social;
    document.querySelector("#score-economy").textContent = data.economy;
    const { context: ctx, width, height } = prepareCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, width, height);
    const bars = [
      { label: "LINGKUNGAN", value: data.environment, color: "#218c82" },
      { label: "SOSIAL", value: data.social, color: "#f2c14e" },
      { label: "EKONOMI", value: data.economy, color: "#e4572e" }
    ];
    const left = Math.min(150, width * 0.3);
    const right = 34;
    const barWidth = width - left - right;
    bars.forEach((bar, index) => {
      const y = 72 + index * 92;
      ctx.fillStyle = "#1b2338";
      ctx.font = "bold 13px Courier New";
      ctx.textAlign = "right";
      ctx.fillText(bar.label, left - 12, y + 24);
      ctx.fillStyle = "#ead8ad";
      ctx.fillRect(left, y, barWidth, 38);
      ctx.fillStyle = bar.color;
      ctx.fillRect(left, y, barWidth * bar.value / 100, 38);
      ctx.strokeStyle = "#1b2338";
      ctx.lineWidth = 3;
      ctx.strokeRect(left, y, barWidth, 38);
      ctx.fillStyle = "#1b2338";
      ctx.textAlign = "left";
      ctx.fillText(String(bar.value), Math.min(width - 55, left + barWidth * bar.value / 100 + 8), y + 24);
      ctx.strokeStyle = "#b83b3b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left + barWidth * 0.6, y - 5);
      ctx.lineTo(left + barWidth * 0.6, y + 43);
      ctx.stroke();
    });
    return data;
  }

  [energy, transit, green].forEach((input) => input.addEventListener("input", () => {
    const data = draw();
    setFeedback(result, "Anggaran diubah", data.total === 100 ? "Total tepat 100. Tekan Evaluasi untuk menilai keseimbangan." : `Total saat ini ${data.total}. Sesuaikan hingga tepat 100.`, data.total === 100 ? "warning" : "danger");
  }));
  document.querySelector("#evaluate-policy").addEventListener("click", () => {
    const data = draw();
    if (data.total !== 100) {
      setFeedback(result, "Anggaran belum valid", `Gunakan tepat 100 poin. Total saat ini ${data.total}.`, "danger");
      return;
    }
    const minimum = Math.min(data.environment, data.social, data.economy);
    if (minimum >= 60) {
      setFeedback(result, "Kebijakan seimbang", `Ketiga dimensi melewati ambang 60. Indikator terendah bernilai ${minimum}, sehingga masih ada ruang untuk membandingkan alternatif.`, "success");
      updateStage(3);
    } else {
      const weakest = data.environment === minimum ? "lingkungan" : data.social === minimum ? "sosial" : "ekonomi";
      setFeedback(result, "Belum seimbang", `Dimensi ${weakest} baru mencapai ${minimum}. Ubah alokasi tanpa melewati total anggaran.`, "warning");
      updateStage(3);
    }
  });
  document.querySelector("#sustain-reset").addEventListener("click", () => {
    energy.value = 34;
    transit.value = 33;
    green.value = 33;
    draw();
    setFeedback(result, "Kebijakan direset", "Ketiga program kembali mendapat alokasi hampir sama.", "warning");
    updateStage(2);
  });
  const resize = () => draw();
  window.addEventListener("resize", resize);
  draw();
  cleanupLab = () => window.removeEventListener("resize", resize);
}

helpButton.addEventListener("click", () => helpDialog.showModal());
closeHelp.addEventListener("click", () => helpDialog.close());
helpDialog.addEventListener("click", (event) => {
  if (event.target === helpDialog) helpDialog.close();
});
backButton.addEventListener("click", () => showCatalog());
homeButton.addEventListener("click", () => showCatalog());
window.addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  if (courses.some((course) => course.id === id)) openLab(id, false);
  else showCatalog(false);
});

renderCatalog();
const initialCourse = location.hash.slice(1);
if (courses.some((course) => course.id === initialCourse)) openLab(initialCourse, false);
