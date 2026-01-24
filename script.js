const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

/************************************************
 * GOOGLE CHARTS LOADER
 ************************************************/
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
  document.addEventListener("DOMContentLoaded", init);
});

/************************************************
 * GLOBAL VARIABLES
 ************************************************/
const DATA_URL = 'https://script.google.com/macros/s/AKfycbxpK-mCvnnjvKx7kYT8wGWaPyqOx_ky2SvHunhLzD5gbzv6fGy3QsZUmB6HdpvvN4LH/exec';
let dataGlobal = null;

/************************************************
 * INIT
 ************************************************/
function init() {
  console.log("INIT STARTED");
  loadPlacementData();
}

/************************************************
 * FETCH + RENDER PIPELINE
 ************************************************/
async function loadPlacementData() {
  try {
    console.log("Fetching placement data...");

    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    console.log("DATA RECEIVED:", data);

    if (data.error) throw new Error(data.message || "Server Error");

    dataGlobal = data;

    renderAll(data);
    applyAdminView();

  } catch (err) {
    console.error("FETCH ERROR:", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      "<p style='color:red;text-align:center'>⚠ Failed to load placement data</p>"
    );
  }
}

/************************************************
 * RENDER ALL
 ************************************************/
function renderAll(data) {
  updateKPIs(data);
  drawPlacementStatusChart(data);
  drawCompanyChart(data);
  drawProgrammeChart(data);
  drawCoreNonCoreChart(data);
  drawCompanyVsStudentsChart(data);
  drawTopPackageChart(data);
  populateStudentTable(data);
}

/************************************************
 * ADMIN VIEW
 ************************************************/
function applyAdminView() {
  document.querySelectorAll(".adminOnly").forEach(el => {
    el.style.display = isAdmin ? "" : "none";
  });
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
 * PLACEMENT STATUS PIE
 ************************************************/
function drawPlacementStatusChart(data) {
  const rows = [
    ['Status', 'Count'],
    ['Placed', data.placedCount || 0],
    ['Not Placed', (data.eligibleStudents || 0) - (data.placedCount || 0)]
  ];

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(
    document.getElementById('statusChart')
  ).draw(table, {
    title: 'Placement Status',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

/************************************************
 * COMPANY TYPE
 ************************************************/
function drawCompanyChart(data) {
  const map = {};

  (data.placedStudents || []).forEach(s => {
    const type = s.type || 'Unknown';
    map[type] = (map[type] || 0) + 1;
  });

  const rows = [['Company Type', 'Count']];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(
    document.getElementById('companyChart')
  ).draw(table, {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

/************************************************
 * PROGRAMME WISE
 ************************************************/
function drawProgrammeChart(data) {
  const container = document.getElementById('programmeChart');
  if (!data.programmeCount || Object.keys(data.programmeCount).length === 0) {
    container.innerHTML = '<b>No Programme data available</b>';
    return;
  }

  const rows = [['Programme', 'Placed Students']];
  for (const p in data.programmeCount) {
    rows.push([p, Number(data.programmeCount[p]) || 0]);
  }

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    height: 420,
    chartArea: { left: 80, top: 60, width: '65%', height: '60%' },
    vAxis: { title: 'Placed Students', minValue: 0 },
    legend: { position: 'none' }
  });
}

/************************************************
 * CORE vs NON CORE
 ************************************************/
function drawCoreNonCoreChart(data) {
  const el = document.getElementById('coreNonCoreChart');
  if (!el || !data.coreNonCoreCount) return;

  const rows = [['Programme', 'Core', 'Non-Core']];
  Object.keys(data.coreNonCoreCount).forEach(p => {
    rows.push([p, data.coreNonCoreCount[p].Core, data.coreNonCoreCount[p].NonCore]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: 420,
    chartArea: { left: 80, top: 60, width: '65%', height: '60%' },
    vAxis: { title: 'No. of Students', minValue: 0 },
    legend: { position: 'bottom' },
    bar: { groupWidth: '55%' }
  });
}

/************************************************
 * COMPANY vs STUDENTS
 ************************************************/
function drawCompanyVsStudentsChart(data) {
  const container = document.getElementById('companyStudentsChart');
  if (!container) return;

  if (!data.Company_Filter || data.Company_Filter.length === 0) {
    container.innerHTML = '<b>No company placement data available</b>';
    return;
  }

  const sortedData = data.Company_Filter
    .map(row => ({
      company: row['Company Name'],
      count: Number(row['Total students placed']) || 0
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const rows = [['Company', 'Students Placed']];
  sortedData.forEach(item => rows.push([item.company, item.count]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    title: 'Company-wise Student Placements',
    height: 500,
    chartArea: { left: 80, top: 60, width: '60%', height: '65%' },
    vAxis: { title: 'Total Students Placed', minValue: 0 },
    legend: { position: 'none' }
  });
}

/************************************************
 * TOP PACKAGES
 ************************************************/
function drawTopPackageChart(data) {
  const container = document.getElementById('topPackageChart');
  if (!data.topPackages || data.topPackages.length === 0) {
    container.innerHTML = '<b>No package data available</b>';
    return;
  }

  const rows = [['Student','Package']];
  data.topPackages.forEach(s => {
    rows.push([s.name, Number(s.package) || 0]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    height: 400,
    chartArea: { left: 60, top: 60, width: '60%', height: '70%' },
    vAxis: { title: 'Package (LPA)', minValue: 0 },
    legend: { position: 'none' }
  });
}

/************************************************
 * TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  if (!tbody) return;

  tbody.innerHTML = '';

  (data.placedStudents || []).forEach((s, i) => {
    const tr = document.createElement('tr');
    const offerLink = s.offerLetterUrl || '';
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.programme || ''}</td>
      <td>${s.registerNo || ''}</td>
      <td>${s.name || ''}</td>
      <td>${s.company || ''}</td>
      <td>${s.type || ''}</td>
      <td>${s.package || ''}</td>
      <td class="adminOnly">${offerLink ? `<a href="${offerLink}" target="_blank">View</a>` : "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  applyAdminView();
}

/************************************************
 * SEARCH
 ************************************************/
function searchTable() {
  const input = document.getElementById("studentSearch");
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById("studentTable");
  if (!tbody) return;

  Array.from(tbody.getElementsByTagName("tr")).forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
}

/************************************************
 * RESIZE
 ************************************************/
window.addEventListener('resize', () => {
  if (!dataGlobal) return;
  renderAll(dataGlobal);
});

