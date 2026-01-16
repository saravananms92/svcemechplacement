/************************************************
 * GOOGLE CHARTS LOADER
 ************************************************/
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
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
  fetchAndDrawCharts();
}

/************** Global Chart Theme ******************/
const CHART_THEME = {
  titleTextStyle: { color: '#0d47a1', fontSize: 16, bold: true },
  legend: { textStyle: { color: '#333', fontSize: 12 } },
  backgroundColor: 'transparent',
  tooltip: { textStyle: { fontSize: 12 } }
};

/************************************************
 * FETCH DATA AND DRAW ALL CHARTS
 ************************************************/
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL, { mode: 'cors' });
    if (!response.ok) throw new Error('HTTP error ' + response.status);

    const data = await response.json();
    dataGlobal = data;

    updateKPIs(data);
    drawPlacementStatusChart(data);
    drawCompanyChart(data);
    drawProgrammeChart(data);
    drawCoreNonCoreChart(data);
    drawCompanyVsStudentsChart(data);
    drawTopPackageChart(data);
    populateStudentTable(data);

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
  document.getElementById('total').innerText =
    `Total Students\n${data.totalStudents || 0}`;
  document.getElementById('opted').innerText =
    `Opted for Placement\n${data.optedStudents || 0}`;
  document.getElementById('eligible').innerText =
    `Eligible Students\n${data.eligibleStudents || 0}`;
  document.getElementById('placed').innerText =
    `Placed Students\n${data.placedCount || 0}`;

  const percent =
    data.eligibleStudents > 0
      ? ((data.placedCount / data.eligibleStudents) * 100).toFixed(1)
      : 0;

  document.getElementById('percentage').innerText =
    `Placement %\n${percent}%`;
}

/************************************************
 * PLACEMENT STATUS PIE CHART
 ************************************************/
function drawPlacementStatusChart(data) {
  const rows = [
    ['Status', 'Count'],
    ['Placed', data.placedCount || 0],
    ['Not Placed', Math.max(0, (data.optedStudents || 0) - (data.placedCount || 0))]
  ];

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(
    document.getElementById('statusChart')
  ).draw(table, {
    title: 'Placement Status',
    pieHole: 0.45,
    chartArea: { width: '80%', height: '80%' },
    colors: ['#1e88e5', '#e53935'],
    ...CHART_THEME
  });
}

/************************************************
 * COMPANY TYPE PIE CHART
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
    pieHole: 0.45,
    chartArea: { width: '80%', height: '80%' },
    colors: ['#2e7d32', '#1e88e5', '#ff9800', '#6f42c1'],
    ...CHART_THEME
  });
}

/************************************************
 * PROGRAMME-WISE PLACEMENT
 ************************************************/
function drawProgrammeChart(data) {
  const container = document.getElementById('programmeChart');
  if (!container || !data.programmeCount) return;

  const colors = ['#1e88e5', '#2e7d32', '#ff9800', '#6f42c1', '#e53935'];
  const rows = [['Programme', 'Placed Students', { role: 'style' }]];

  let i = 0;
  for (const p in data.programmeCount) {
    rows.push([p, Number(data.programmeCount[p]) || 0, colors[i % colors.length]]);
    i++;
  }

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    height: 420,
    chartArea: { left: 80, top: 60, width: '65%', height: '60%' },
    vAxis: { title: 'Placed Students', minValue: 0 },
    legend: { position: 'none' },
    bar: { groupWidth: '55%' },
    ...CHART_THEME
  });
}

/************************************************
 * CORE vs NON-CORE
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
    colors: ['#2e7d32', '#e53935'],
    legend: { position: 'bottom' },
    bar: { groupWidth: '55%' },
    ...CHART_THEME
  });
}

/************************************************
 * COMPANY vs STUDENTS
 ************************************************/
function drawCompanyVsStudentsChart(data) {
  const container = document.getElementById('companyStudentsChart');
  if (!container || !data.Company_Filter) return;

  const sortedData = data.Company_Filter
    .map(row => ({
      company: row['Company Name'],
      count: Number(row['Total students placed']) || 0
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const colors = ['#1e88e5','#2e7d32','#ff9800','#6f42c1','#e53935','#26c6da'];

  const rows = [['Company', 'Students Placed', { role: 'annotation' }, { role: 'style' }]];
  sortedData.forEach((item, i) => {
    rows.push([item.company, item.count, item.count.toString(), `color:${colors[i % colors.length]}`]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    title: 'Company-wise Student Placements',
    height: 450,
    chartArea: { left: 80, top: 60, width: '60%', height: '65%' },
    vAxis: { title: 'Total Students Placed', minValue: 0 },
    legend: { position: 'none' },
    annotations: { alwaysOutside: true },
    ...CHART_THEME
  });
}

/************************************************
 * TOP PACKAGE
 ************************************************/
function drawTopPackageChart(data) {
  const container = document.getElementById('topPackageChart');
  if (!container || !data.topPackages) return;

  const colors = ['#ff9800','#1e88e5','#2e7d32','#6f42c1','#e53935'];
  const rows = [['Student','Package',{ role: 'annotation' },{ role: 'style' }]];

  data.topPackages.forEach((s, i) => {
    rows.push([s.name, Number(s.package) || 0, s.package + ' LPA', colors[i]]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(container).draw(table, {
    height: 420,
    chartArea: { left: 60, top: 60, width: '60%', height: '70%' },
    vAxis: { title: 'Package (LPA)', minValue: 0 },
    legend: { position: 'none' },
    annotations: { alwaysOutside: true },
    ...CHART_THEME
  });
}

/************************************************
 * STUDENT TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  if (!tbody) return;

  tbody.innerHTML = '';
  (data.placedStudents || []).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.programme}</td>
      <td>${s.name}</td>
      <td>${s.company}</td>
      <td>${s.type}</td>
    `;
    tbody.appendChild(tr);
  });
}

/************************************************
 * SEARCH
 ************************************************/
function searchTable() {
  const input = document.getElementById("studentSearch");
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById("studentTable");

  Array.from(tbody.getElementsByTagName("tr")).forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
}

/************************************************
 * RESPONSIVE REDRAW
 ************************************************/
window.addEventListener('resize', () => {
  if (!dataGlobal) return;
  drawProgrammeChart(dataGlobal);
  drawTopPackageChart(dataGlobal);
  drawPlacementStatusChart(dataGlobal);
  drawCompanyChart(dataGlobal);
  drawCompanyVsStudentsChart(dataGlobal);
  drawCoreNonCoreChart(dataGlobal);
});
