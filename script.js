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
let dataGlobal = null; // for responsive redraw

async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();
    dataGlobal = data; // store globally for redraw

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

  } catch (err) {
    console.error('Fetch Error:', err);
    alert('Failed to fetch placement data. Check your network or the Google Sheet URL.');
  }
}

/************************************************
 * KPI CARDS
 ************************************************/
function updateKPIs(data) {
  document.getElementById('total').innerText = `Total Students\n${data.totalStudents || 0}`;
  document.getElementById('opted').innerText = `Opted for Placement\n${data.optedStudents || 0}`;
  document.getElementById('placed').innerText = `Placed\n${data.placedCount || 0}`;

  const percent = data.optedStudents > 0 ? ((data.placedCount / data.optedStudents) * 100).toFixed(1) : 0;
  document.getElementById('percentage').innerText = `Placement %\n${percent}%`;
}

/************************************************
 * PLACEMENT STATUS PIE
 ************************************************/
function drawPlacementStatusChart(data) {
  const rows = [
    ['Status', 'Count'],
    ['Placed', data.placedCount || 0],
    ['Not Placed', (data.optedStudents || 0) - (data.placedCount || 0)]
  ];

  const table = google.visualization.arrayToDataTable(rows);
  new google.visualization.PieChart(document.getElementById('statusChart')).draw(table, {
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

  new google.visualization.PieChart(document.getElementById('companyChart')).draw(table, {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

/************************************************
 * PROGRAMME-WISE COLUMN CHART
 ************************************************/
function drawProgrammeChart(data) {
  const container = document.getElementById('programmeChart');
  if (!data.programmeCount || Object.keys(data.programmeCount).length === 0) {
    container.innerHTML = '<b>No Programme data available</b>';
    return;
  }

  const colors = ['#1b9e77', '#d95f02'];
  const rows = [['Programme', 'Placed Students', { role: 'style' }]];
  let i = 0;
  for (let prog in data.programmeCount) {
    rows.push([prog, Number(data.programmeCount[prog]) || 0, colors[i % colors.length]]);
    i++;
  }

  const table = google.visualization.arrayToDataTable(rows);

  const options = {
    title: 'Programme-wise Placement',
    width: container.offsetWidth, // fit container
    height: 400,
    chartArea: { left: 80, top: 60, width: '60%', height: '65%' },
    hAxis: { title: 'Programme', slantedText: false, textStyle: { fontSize: 12 } },
    vAxis: { title: 'Placed Students', textStyle: { fontSize: 12 } },
    legend: { position: 'none' }
  };

  new google.visualization.ColumnChart(container).draw(table, options);
}

/************************************************
 * TOP 10 PACKAGES COLUMN CHART
 ************************************************/
function drawTopPackageChart(data) {
  const container = document.getElementById('topPackageChart');
  if (!data.topPackages || data.topPackages.length === 0) {
    container.innerHTML = '<b>No package data available</b>';
    return;
  }

  const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666','#1f78b4','#b2df8a'];

  const rows = [['Student','Package (LPA)',{ role: 'annotation' },{ role: 'style' }]];
  data.topPackages.forEach((s, index) => {
    rows.push([s.name, Number(s.package) || 0, s.package + ' LPA', colors[index % colors.length]]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  const options = {
    title: 'Top 10 Highest Packages (LPA)',
    width: container.offsetWidth,
    height: 450,
    chartArea: { width: '70%', height: '65%', left: 60, top: 60 },
    hAxis: { title: 'Students', slantedText: false },
    vAxis: { title: 'Package (LPA)', minValue: 0 },
    legend: { position: 'none' },
    annotations: { alwaysOutside: true }
  };

  new google.visualization.ColumnChart(container).draw(table, options);
}

/************************************************
 * STUDENT TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';
  data.placedStudents.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.programme}</td><td>${s.name}</td><td>${s.company}</td><td>${s.type}</td>`;
    tbody.appendChild(tr);
  });
}

/************************************************
 * LAST UPDATED
 ************************************************/
function updateLastUpdated() {
  document.getElementById('lastUpdated').innerText = 'Last Updated: ' + new Date().toLocaleString();
}

/************************************************
 * REDRAW ON WINDOW RESIZE
 ************************************************/
window.addEventListener('resize', () => {
  if (dataGlobal) {
    drawProgrammeChart(dataGlobal);
    drawTopPackageChart(dataGlobal);
    drawPlacementStatusChart(dataGlobal);
    drawCompanyChart(dataGlobal);
  }
});
