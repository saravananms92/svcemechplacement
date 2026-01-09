/************************************************
 * LOADER CONTROL
 ************************************************/
let chartsToLoad = 7;

function chartFinished() {
  chartsToLoad--;
  if (chartsToLoad === 0) {
    document.getElementById("loader").style.display = "none";
  }
}

/************************************************
 * GOOGLE CHARTS LOADER
 ************************************************/
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(init);

const DATA_URL =
  'https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec';

let dataGlobal = null;

/************************************************
 * INIT
 ************************************************/
function init() {
  fetchAndDrawCharts();
}

/************************************************
 * FETCH + DRAW
 ************************************************/
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
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
    console.error(err);
    document.getElementById("loader").innerHTML =
      "⚠ Failed to load placement data";
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
  document.getElementById('placed').innerText =
    `Placed Students\n${data.placedCount || 0}`;

  const percent =
    data.optedStudents > 0
      ? ((data.placedCount / data.optedStudents) * 100).toFixed(1)
      : 0;

  document.getElementById('percentage').innerText =
    `Placement %\n${percent}%`;
}

/************************************************
 * PLACEMENT STATUS PIE
 ************************************************/
function drawPlacementStatusChart(data) {
  const table = google.visualization.arrayToDataTable([
    ['Status', 'Count'],
    ['Placed', data.placedCount || 0],
    ['Not Placed', (data.optedStudents || 0) - (data.placedCount || 0)]
  ]);

  const chart = new google.visualization.PieChart(
    document.getElementById('statusChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    title: 'Placement Status',
    pieHole: 0.4
  });
}

/************************************************
 * COMPANY TYPE PIE
 ************************************************/
function drawCompanyChart(data) {
  const map = {};
  (data.placedStudents || []).forEach(s => {
    map[s.type || 'Unknown'] = (map[s.type || 'Unknown'] || 0) + 1;
  });

  const rows = [['Company Type', 'Count']];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);

  const chart = new google.visualization.PieChart(
    document.getElementById('companyChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    title: 'Company Type Distribution',
    pieHole: 0.4
  });
}

/************************************************
 * PROGRAMME CHART
 ************************************************/
function drawProgrammeChart(data) {
  const rows = [['Programme', 'Placed']];
  for (let p in data.programmeCount) {
    rows.push([p, data.programmeCount[p]]);
  }

  const table = google.visualization.arrayToDataTable(rows);

  const chart = new google.visualization.ColumnChart(
    document.getElementById('programmeChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    height: 400,
    legend: 'none'
  });
}

/************************************************
 * CORE vs NON-CORE
 ************************************************/
function drawCoreNonCoreChart(data) {
  const rows = [['Programme', 'Core', 'Non-Core']];
  for (let p in data.coreNonCoreCount) {
    rows.push([
      p,
      data.coreNonCoreCount[p].Core,
      data.coreNonCoreCount[p].NonCore
    ]);
  }

  const table = google.visualization.arrayToDataTable(rows);

  const chart = new google.visualization.ColumnChart(
    document.getElementById('coreNonCoreChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    height: 420
  });
}

/************************************************
 * COMPANY vs STUDENTS
 ************************************************/
function drawCompanyVsStudentsChart(data) {
  const rows = [['Company', 'Students']];
  data.Company_Filter.forEach(r => {
    rows.push([r['Company Name'], Number(r['Total students placed']) || 0]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  const chart = new google.visualization.ColumnChart(
    document.getElementById('companyStudentsChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    height: 450,
    legend: 'none'
  });
}

/************************************************
 * TOP PACKAGE
 ************************************************/
function drawTopPackageChart(data) {
  const rows = [['Student', 'Package']];
  data.topPackages.forEach(s => rows.push([s.name, Number(s.package)]));

  const table = google.visualization.arrayToDataTable(rows);

  const chart = new google.visualization.ColumnChart(
    document.getElementById('topPackageChart')
  );

  google.visualization.events.addListener(chart, 'ready', chartFinished);

  chart.draw(table, {
    height: 400,
    legend: 'none'
  });
}

/************************************************
 * STUDENT TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  (data.placedStudents || []).forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.programme}</td>
        <td>${s.name}</td>
        <td>${s.company}</td>
        <td>${s.type}</td>
      </tr>`;
  });
}

/************************************************
 * RESPONSIVE REDRAW
 ************************************************/
window.addEventListener('resize', () => {
  if (!dataGlobal) return;
  chartsToLoad = 7;
  drawPlacementStatusChart(dataGlobal);
  drawCompanyChart(dataGlobal);
  drawProgrammeChart(dataGlobal);
  drawCoreNonCoreChart(dataGlobal);
  drawCompanyVsStudentsChart(dataGlobal);
  drawTopPackageChart(dataGlobal);
});
