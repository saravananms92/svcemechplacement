function switchBatch(folder) {
  if (!folder) return;
  window.location.href = "../" + folder + "/";
}

function setCurrentBatch() {
  const path = window.location.pathname.toLowerCase();

  const select = document.getElementById("batchSwitcher");
  if (!select) return;

  if (path.includes("batch2022")) {
    select.value = "Batch2022";
  } else if (path.includes("batch2023")) {
    select.value = "Batch2023";
  }
}

window.addEventListener("load", setCurrentBatch);

/************************************************
 * ADMIN SYSTEM (SINGLE SOURCE)
 ************************************************/
function openAdminLogin() {
  const pw = prompt("Enter Admin Password:");

  if (pw === "1234") {
    sessionStorage.setItem("admin", "true");
    applyAdminUI();
    location.reload(); // ✅ auto refresh
  } else {
    alert("Invalid Password");
  }
}

function logout() {
  sessionStorage.removeItem("admin");
  applyAdminUI();
  location.reload(); // ✅ auto refresh
}

function applyAdminUI() {
  const isAdmin = sessionStorage.getItem("admin") === "true";

  document.querySelectorAll('.adminOnly').forEach(el => {
    el.style.display = isAdmin ? "block" : "none";
  });

  document.getElementById("adminLoginBtn").style.display = isAdmin ? "none" : "inline-block";
  document.getElementById("logoutBtn").style.display = isAdmin ? "inline-block" : "none";

  toggleAdminView(isAdmin);
}

function toggleAdminView(isAdmin) {
  document.querySelectorAll('.adminCol').forEach(col => {
    col.style.display = isAdmin ? "" : "none";
  });
}

/************************************************
 * GOOGLE CHARTS LOADER
 ************************************************/
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(init);

/************************************************
 * GLOBAL VARIABLES
 ************************************************/
const DATA_URL = 'https://script.google.com/macros/s/AKfycbxpK-mCvnnjvKx7kYT8wGWaPyqOx_ky2SvHunhLzD5gbzv6fGy3QsZUmB6HdpvvN4LH/exec';
let dataGlobal = null;

/************************************************
 * INIT
 ************************************************/
function init() {
  fetchAndDrawCharts();
}

/************************************************
 * FETCH DATA AND DRAW ALL CHARTS
 ************************************************/
async function fetchAndDrawCharts() {
  try {
    console.log('Fetching placement data...');

    const response = await fetch(DATA_URL, { mode: 'cors' });
    if (!response.ok) throw new Error('HTTP error ' + response.status);

    const data = await response.json();
    console.log('DATA RECEIVED:', data);

    dataGlobal = data;

    updateKPIs(data);
    drawPlacementStatusChart(data);
    drawCompanyChart(data);
    drawProgrammeChart(data);
    drawCoreNonCoreChart(data);
    drawCompanyVsStudentsChart(data);
    drawTopPackageChart(data);
    drawPackageDistribution(data);
    populateStudentTable(data);
    populateProgrammeFilter();
    populateCompanyFilter();

    // Apply admin UI based on session
    applyAdminUI();

  } catch (err) {
    console.error('FETCH ERROR:', err);
    document.body.insertAdjacentHTML(
      'afterbegin',
      "<p style='color:red;text-align:center'>⚠ Failed to load placement data</p>"
    );
  }
}

/************************************************
 * KPI CARDS
 ************************************************/
function updateKPIs(data) {
  const percent =
    data.eligibleStudents > 0
      ? ((data.placedCount / data.eligibleStudents) * 100).toFixed(1)
      : 0;

  const set = (id, value) => {
    const el = document.querySelector(`#${id} strong`);
    if (el) el.innerText = value;
  };

  set("total", data.totalStudents || 0);
  set("opted", data.optedStudents || 0);
  set("eligible", data.eligibleStudents || 0);
  set("placed", data.placedCount || 0);
  set("percentage", percent + "%");
}

/************************************************
 * CHART FUNCTIONS
 ************************************************/
function drawPlacementStatusChart(data) {
  const rows = [
    ['Status', 'Count'],
    ['Placed', data.placedCount || 0],
    ['Not Placed', (data.eligibleStudents || 0) - (data.placedCount || 0)]
  ];

  const table = google.visualization.arrayToDataTable(rows);
  new google.visualization.PieChart(document.getElementById('statusChart')).draw(table, {
    title: 'Placement Status',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

function drawCompanyChart(data) {
  const map = {};
  (data.placedStudents || []).forEach(s => {
    const type = s.type || 'Unknown';
    map[type] = (map[type] || 0) + 1;
  });

  const rows = [['Company Type', 'Count']];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);
  new google.visualization.PieChart(document.getElementById('companyChart')).draw(table, {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

function drawProgrammeChart(data) {
  const container = document.getElementById('programmeChart');
  if (!data.programmeCount || Object.keys(data.programmeCount).length === 0) {
    container.innerHTML = '<b>No Programme data available</b>';
    return;
  }

  const colors = ['#20c997', '#0dcaf0'];
  const rows = [['Programme', 'Placed Students', { role: 'annotation' }, { role: 'style' }]];

  let i = 0;
  for (const p in data.programmeCount) {
    let val = Number(data.programmeCount[p]) || 0;
    rows.push([p, val, val.toString(), colors[i % colors.length]]);
    i++;
  }

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    height: '100%',
    chartArea: {
      left: 70,
      top: 80,
      width: '85%',
      height: '75%'
    },
    vAxis: { title: 'Placed Students', minValue: 0, format: '0' },
    legend: { position: 'none' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, bold: true } },
    animation: { startup: true, duration: 800, easing: 'out' }
  });
}

function drawCoreNonCoreChart(data) {
  const el = document.getElementById('coreNonCoreChart');
  if (!el || !data.coreNonCoreCount) return;

  const rows = [['Programme', 'Core', { role: 'annotation' }, 'Non-Core', { role: 'annotation' }]];

  Object.keys(data.coreNonCoreCount).forEach(p => {
    let c = Number(data.coreNonCoreCount[p].Core) || 0;
    let n = Number(data.coreNonCoreCount[p].NonCore) || 0;
    rows.push([p, c, c.toString(), n, n.toString()]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: '100%',
    chartArea: {
      left: 70,
      top: 80,
      width: '85%',
      height: '75%'
    },
    vAxis: { title: 'No. of Students', minValue: 0, format: '0' },
    colors: ['#1e88e5', '#fb8c00'],
    legend: { position: 'bottom' },
    bar: { groupWidth: '55%' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, bold: true } },
    animation: { startup: true, duration: 800, easing: 'out' }
  });
}

function drawCompanyVsStudentsChart(data) {
  const container = document.getElementById('companyStudentsChart');
  if (!container) return;

  if (!data.Company_Filter || data.Company_Filter.length === 0) {
    container.innerHTML = '<b>No company placement data available</b>';
    return;
  }

  const sortedData = data.Company_Filter
    .map(row => ({ company: row['Company Name'], count: Number(row['Total students placed']) || 0 }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const colors = [
    "#0d6efd", "#198754", "#dc3545", "#fd7e14", "#6f42c1",
    "#20c997", "#0dcaf0", "#6610f2", "#adb5bd", "#212529",
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#393b79", "#637939", "#8c6d31", "#843c39", "#7b4173",
    "#3182bd", "#31a354", "#756bb1", "#636363", "#e6550d"
  ];

  const rows = [['Company', 'Students Placed', { role: 'annotation' }, { role: 'style' }]];
  sortedData.forEach((item, i) => {
    rows.push([item.company, item.count, item.count.toString(), `color: ${colors[i % colors.length]}`]);
  });

  const table = google.visualization.arrayToDataTable(rows);
  new google.visualization.ColumnChart(container).draw(table, {
    title: 'Company-wise Student Placements',
    height: 500,
    chartArea: { left: 80, top: 60, width: '60%', height: '65%' },
    vAxis: {
    title: 'No. of Students',
    minValue: 0,
    format: '0',
    viewWindow: { min: 0 }
    }, 
    legend: { position: 'none' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, bold: true } }
  });

  drawCompanyLegend(sortedData, colors);
}

function drawCompanyLegend(data, colors) {
  const legendContainer = document.getElementById('companyLegend');
  if (!legendContainer) return;

  legendContainer.innerHTML = '<b>Companies</b><br>';
  data.forEach((item, i) => {
    const color = colors[i % colors.length];
    legendContainer.innerHTML += `
      <div style="display:flex;align-items:center;margin-bottom:6px">
        <span style="width:14px;height:16px;background:${color};display:inline-block;margin-right:8px"></span>
        <span style="font-size:10px">${item.company}</span>
      </div>
    `;
  });
}

function drawTopPackageChart(data) {
  const container = document.getElementById('topPackageChart');
  if (!data.topPackages || data.topPackages.length === 0) {
    container.innerHTML = '<b>No package data available</b>';
    return;
  }

  const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e'];
  const rows = [['Student','Package',{ role: 'annotation' },{ role: 'style' }]];
  data.topPackages.forEach((s, i) => {
    rows.push([s.name, Number(s.package) || 0, s.package + ' LPA', colors[i]]);
  });

  const table = google.visualization.arrayToDataTable(rows);
  new google.visualization.ColumnChart(container).draw(table, {
    height: 400,
    chartArea: { left: 60, top: 60, width: '60%', height: '75%' },
    vAxis: { title: 'Package (LPA)', minValue: 0 },
    legend: { position: 'none' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, bold: true } }
  });
}

function drawPackageDistribution(data) {
  const el = document.getElementById("packageDistChart");
  if (!el || !data.placedStudents || data.placedStudents.length === 0) {
    if (el) el.innerHTML = "<b>No package data available</b>";
    return;
  }

  let ranges = {
    "< 3 LPA": 0,
    "3 - 5 LPA": 0,
    "5 - 8 LPA": 0,
    "8 - 10 LPA": 0,
    "> 10 LPA": 0
  };

  data.placedStudents.forEach(s => {
    let pkg = parseFloat(s.package || 0);

    if (pkg > 0 && pkg < 3) ranges["< 3 LPA"]++;
    else if (pkg >= 3 && pkg < 5) ranges["3 - 5 LPA"]++;
    else if (pkg >= 5 && pkg < 8) ranges["5 - 8 LPA"]++;
    else if (pkg >= 8 && pkg <= 10) ranges["8 - 10 LPA"]++;
    else if (pkg > 10) ranges["> 10 LPA"]++;
  });

  const rows = [
    ["Package Range", "Students", { role: "annotation" }, { role: "style" }],
    ["< 3 LPA", ranges["< 3 LPA"], ranges["< 3 LPA"].toString(), "#c8e6c9"],
    ["3 - 5 LPA", ranges["3 - 5 LPA"], ranges["3 - 5 LPA"].toString(), "#81c784"],
    ["5 - 8 LPA", ranges["5 - 8 LPA"], ranges["5 - 8 LPA"].toString(), "#4caf50"],
    ["8 - 10 LPA", ranges["8 - 10 LPA"], ranges["8 - 10 LPA"].toString(), "#2e7d32"],
    ["> 10 LPA", ranges["> 10 LPA"], ranges["> 10 LPA"].toString(), "#1b5e20"]
  ];

  const table = google.visualization.arrayToDataTable(rows);
  
  new google.visualization.ColumnChart(el).draw(table, {
    height: 420,
    bar: { groupWidth: "55%" },
    legend: { position: "none" },
    chartArea: { left: 70, top: 80, width: "70%", height: "65%" },
    vAxis: {
      title: "No. of Students",
      minValue: 0,
      format: '0',
      viewWindow: { min: 0 },
      gridlines: { count: -1 }
    },
    hAxis: { title: "Package Range" },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, bold: true } },
    animation: { startup: true, duration: 800, easing: "out" }
  });
}

/************************************************
 * SEARCH FUNCTION
 ************************************************/
function searchTable() {
  const input = document.getElementById("studentSearch");
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById("studentTable");
  if (!tbody) return;

  Array.from(tbody.getElementsByTagName("tr")).forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
  applyFilters();
}

/************************************************
 * POPULATE STUDENT TABLE
 ************************************************/
function getPhotoUrl(photo) {
  if (!photo) {
    return "https://via.placeholder.com/80x105?text=No+Photo";
  }

  let fileId = "";

  // Match uc?id=FILEID
  let match = photo.match(/uc\?id=([^&]+)/);

  // Match /d/FILEID/
  if (!match) {
    match = photo.match(/\/d\/([^\/]+)/);
  }

  if (match && match[1]) {
    fileId = match[1];
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w150`;
  }

  return photo;
}

// ───────── Populate Placed Students Table ─────────//
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  if (!tbody) return;

  tbody.innerHTML = '';

  (data.placedStudents || []).forEach((s, i) => {
    
    // Offer letter HTML
    const offerLink = s.offerLetterUrl
      ? `<a href="${s.offerLetterUrl}" target="_blank" class="btn-view">View</a>`
      : 'N/A';

    // Photo URL — use direct link from JSON
    const photoUrl = getPhotoUrl(s.photo);

    // Create table row
    const tr = document.createElement('tr');
    tr.dataset.programme = (s.programme || '').trim();
    tr.dataset.company = (s.company || '').trim();
    tr.dataset.type = (s.type || '').trim();
    tr.dataset.package = s.package || 0;
    
    tr.innerHTML = `
      <td class="center">${i + 1}</td>
      <td>${s.programme || ''}</td>
      <td style="text-align:center">
        <img 
          src="${photoUrl}" 
          alt="${s.name || ""}" 
          loading="lazy" 
          class="stud-photo"
          onerror="this.src='https://via.placeholder.com/60x80?text=No+Photo';"
        >
      </td>
      <td class="center">${s.registerNo || ''}</td>
      <td>${s.name || ''}</td>
      <td>${s.company || ''}</td>
      <td class="center">${s.type || ''}</td>
      <td class="center">${s.package || ''}</td>
      <td class="adminCol">${offerLink}</td>
    `;
    tbody.appendChild(tr);
  });

  // Apply admin toggle immediately
  const isAdmin = sessionStorage.getItem("admin") === "true";
  toggleAdminView(isAdmin);

updateRowCount();
}

// ───────── Populate Programme Filter ─────────//
function populateProgrammeFilter() {
  const progSet = new Set();

  document.querySelectorAll("#studentTable tr").forEach(row => {
    if (row.dataset.programme) progSet.add(row.dataset.programme);
  });

  const select = document.getElementById("filterProgramme");
  if (!select) return;

  select.innerHTML = `<option value="">All Programmes</option>`;

  progSet.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });
}

// ───────── Populate Company Filter ─────────//
function populateCompanyFilter() {
  const companySet = new Set();
  document.querySelectorAll("#studentTable tr").forEach(row => {
    if (row.dataset.company) companySet.add(row.dataset.company);
  });

  const select = document.getElementById("filterCompany");
  if (!select) return;

  select.innerHTML = `<option value="">All Companies</option>`;

  companySet.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

// ───────── Attach Filter Events + Search Events ─────────//
document.addEventListener("DOMContentLoaded", () => {
// Filters
document.querySelectorAll("#filterProgramme, #filterCompany, #filterType, #filterPackage")
  .forEach(el => el.addEventListener("change", applyFilters));
// Search
  const searchInput = document.getElementById("studentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", searchTable);
  }
});

// ───────── Apply Filters ─────────
function applyFilters() {
  const searchValue = (document.getElementById("studentSearch")?.value || "").toLowerCase();
  const programme = filterProgramme.value.toLowerCase();
  const company = filterCompany.value.toLowerCase();
  const type = filterType.value.toLowerCase();
  const pack = filterPackage.value;

  document.querySelectorAll("#studentTable tr").forEach(row => {
    const text = row.innerText.toLowerCase();
    const rowProgramme = (row.dataset.programme || "").toLowerCase();
    const rowCompany = (row.dataset.company || "").toLowerCase();
    const rowType = (row.dataset.type || "").toLowerCase();
    const rowPack = parseFloat(row.dataset.package || 0);

    let show = true;

    // ✅ SEARCH
    if (searchValue && !text.includes(searchValue)) show = false;

    // ✅ FILTERS
    if (programme && rowProgramme !== programme) show = false;
    if (company && rowCompany !== company) show = false;
    if (type && rowType !== type) show = false;

    if (pack) {
      if (pack === "0-3" && rowPack > 3) show = false;
      if (pack === "3-5" && (rowPack < 3 || rowPack > 5)) show = false;
      if (pack === "5-10" && (rowPack < 5 || rowPack > 10)) show = false;
      if (pack === "10+" && rowPack < 10) show = false;
    }

    row.style.display = show ? "" : "none";
  });
    updateRowCount();
                    }

function updateRowCount() {
  const table = document.getElementById("studentTableMain");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll("tr");

  let visibleCount = 0;

  rows.forEach(row => {
    if (row.style.display !== "none") {
      visibleCount++;
    }
  });

  const rowCountBox = document.getElementById("rowCount");
  if (rowCountBox) {
    rowCountBox.innerText =
      "Showing " + visibleCount + " of " + rows.length + " Students";
  }
}

/************************************************
 * WINDOW RESIZE REDRAW
 ************************************************/
window.addEventListener('resize', () => {
  if (!dataGlobal) return;
  drawProgrammeChart(dataGlobal);
  drawTopPackageChart(dataGlobal);
  drawPlacementStatusChart(dataGlobal);
  drawCompanyChart(dataGlobal);
  drawCompanyVsStudentsChart(dataGlobal);
});

/************************************************
 * HIGH QUALITY DOWNLOAD CHART FUNCTION
 ************************************************/
function downloadChart(chartId, filename) {
  const chartDiv = document.getElementById(chartId);
  if (!chartDiv) return alert("Chart not found!");

  const svg = chartDiv.querySelector("svg");
  if (!svg) return alert("Chart not ready yet!");

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  // 👉 Improve quality
  const scale = window.devicePixelRatio || 2;

  const width = svg.clientWidth;
  const height = svg.clientHeight;

  canvas.width = width * scale;
  canvas.height = height * scale;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  img.onload = function () {
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    const imgURI = canvas.toDataURL("image/png"); // PNG = better quality
    const a = document.createElement("a");
    a.download = filename;
    a.href = imgURI;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  img.src = url;
}





















