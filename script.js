/************************************************
 * GOOGLE CHARTS LOADER
 ************************************************/
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(fetchAndDrawCharts);

const DATA_URL =
  'https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec';

/************************************************
 * FETCH CONTROLLER
 ************************************************/
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    console.log('DATA RECEIVED:', data);

    // ✅ OBJECT VALIDATION (IMPORTANT)
    if (!data || !data.placedStudents) {
      alert('No data received from Google Sheet');
      return;
    }

    updateKPIs(data);
    drawPlacementStatusChart(data);
    drawCompanyChart(data);
    drawProgrammeChart(data);
    drawTopPackageChart(data);
    populateStudentTable(data);
    updateLastUpdated();

  } 
}

/************************************************
 * KPI CARDS
 ************************************************/
function updateKPIs(data) {
  document.getElementById('total').innerText =
    `Total Students\n${data.totalStudents}`;

  document.getElementById('opted').innerText =
    `Opted for Placement\n${data.optedStudents}`;

  document.getElementById('placed').innerText =
    `Placed\n${data.placedCount}`;

  const percent =
    data.totalStudents > 0
      ? ((data.placedCount / data.optedStudents) * 100).toFixed(1)
      : 0;

  document.getElementById('percentage').innerText =
    `Placement %\n${percent}%`;
}

/************************************************
 * PLACEMENT STATUS PIE
 ************************************************/
function drawPlacementStatusChart(data) {
  const placed = data.placedCount;
  const notPlaced = data.optedStudents - placed;

  const rows = [
    ['Status', 'Count'],
    ['Placed', placed],
    ['Not Placed', notPlaced]
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
 * COMPANY TYPE PIE
 ************************************************/
function drawCompanyChart(data) {
  const map = {};

  data.placedStudents.forEach(s => {
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
 * PROGRAMME-WISE VERTICAL BAR (COLUMN CHART)
 ************************************************/
function drawProgrammeChart(data) {
  // Use two different colors for the two programmes
  const colors = ['#1b9e77', '#d95f02']; 

  const rows = [['Programme', 'Placed Students', { role: 'style' }]];
  let index = 0;

  for (let prog in data.programmeCount) {
    rows.push([prog, data.programmeCount[prog], colors[index]]);
    index++;
  }

  const table = google.visualization.arrayToDataTable(rows);

  const options = {
    title: 'Programme-wise Placement',
    chartArea: { width: '60%', height: '60%', left: 60, top: 60 },
    hAxis: {
      title: 'Programme',
      slantedText: true,
      slantedTextAngle: 0
    },
    vAxis: {
      title: 'Placed Students',
      minValue: 0
    },
    legend: { position: 'none' },
    bar: { groupWidth: '50%' } // adjusts bar width for two programs
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById('programmeChart')
  );
  chart.draw(table, options);
}
/************************************************
 * TOP 10 PACKAGES BAR
 ************************************************/
function drawTopPackageChart(data) {

  if (!data.topPackages || data.topPackages.length === 0) {
    document.getElementById('topPackageChart').innerHTML =
      '<b>No package data available</b>';
    return;
  }

  const rows = [['Student', 'Package (LPA)', { role: 'annotation' }]];

  data.topPackages.forEach(s => {
    rows.push([s.name, s.package, s.package + ' LPA']);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.BarChart(
    document.getElementById('topPackageChart')
  ).draw(table, {
    title: 'Top 10 Highest Packages (LPA)',
    chartArea: { width: '60%' },
    hAxis: { minValue: 0 },
    annotations: { alwaysOutside: true }
  });
}

/************************************************
 * STUDENT TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  data.placedStudents.forEach(s => {
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
 * LAST UPDATED
 ************************************************/
function updateLastUpdated() {
  document.getElementById('lastUpdated').innerText =
    'Last Updated: ' + new Date().toLocaleString();
}




