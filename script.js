/*******************************
 * GOOGLE CHARTS LOADER
 *******************************/
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(fetchAndDrawCharts);

/*******************************
 * APPS SCRIPT JSON URL
 *******************************/
const DATA_URL =
  'https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec';

/*******************************
 * FETCH + MAIN CONTROLLER
 *******************************/
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    console.log('DATA RECEIVED:', data); // DEBUG – keep this

    if (!Array.isArray(data) || data.length === 0) {
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

  } catch (error) {
    console.error('Fetch error:', error);
    alert('Failed to load placement data');
  }
}

/*******************************
 * KPI CARDS
 *******************************/
function updateKPIs(data) {
  const total = data.length;
  const opted = data.filter(d => d['PLACEMENT STATUS']).length;
  const placed = data.filter(d => d['PLACEMENT STATUS'] === 'Placed').length;
  const percentage = total ? ((placed / total) * 100).toFixed(1) : 0;

  document.getElementById('total').innerText = `Total Students\n${total}`;
  document.getElementById('opted').innerText = `Opted for Placement\n${opted}`;
  document.getElementById('placed').innerText = `Placed\n${placed}`;
  document.getElementById('percentage').innerText = `Placement %\n${percentage}%`;
}

/*******************************
 * PLACEMENT STATUS PIE
 *******************************/
function drawPlacementStatusChart(data) {
  const map = {};

  data.forEach(d => {
    const status = d['PLACEMENT STATUS'] || 'Not Placed';
    map[status] = (map[status] || 0) + 1;
  });

  const rows = [['Status', 'Count']];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(
    document.getElementById('statusChart')
  ).draw(table, {
    title: 'Placement Status',
    pieHole: 0.4,
    chartArea: { width: '75%', height: '75%' }
  });
}

/*******************************
 * COMPANY TYPE PIE
 *******************************/
function drawCompanyChart(data) {
  const map = {};

  data.forEach(d => {
    const type = d['COMPANY TYPE'] || 'Unknown';
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

/*******************************
 * PROGRAMME-WISE BAR
 *******************************/
function drawProgrammeChart(data) {
  const map = {};

  data.forEach(d => {
    const prog = d['PROGRAMME'] || 'Unknown';
    map[prog] = (map[prog] || 0) + 1;
  });

  const rows = [['Programme', 'Students']];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.BarChart(
    document.getElementById('programmeChart')
  ).draw(table, {
    title: 'Programme-wise Placement',
    chartArea: { width: '60%' },
    hAxis: { minValue: 0 }
  });
}

/*******************************
 * TOP 5 PACKAGES BAR (IMPORTANT)
 *******************************/
function drawTopPackageChart(data) {
  const cleaned = [];

  data.forEach(d => {
    const pkg = Number(d['PACKAGE']);
    if (!isNaN(pkg) && pkg > 0) {
      cleaned.push({
        student: d['STUDENT NAME'],
        pkg: pkg
      });
    }
  });

  if (cleaned.length === 0) {
    document.getElementById('topPackageChart').innerHTML =
      '<b>No package data available</b>';
    return;
  }

  cleaned.sort((a, b) => b.pkg - a.pkg);
  const top5 = cleaned.slice(0, 5);

  const rows = [['Student', 'Package (LPA)', { role: 'annotation' }]];
  top5.forEach(d => rows.push([d.student, d.pkg, d.pkg + ' LPA']));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.BarChart(
    document.getElementById('topPackageChart')
  ).draw(table, {
    title: 'Top 5 Highest Packages (LPA)',
    chartArea: { width: '60%' },
    hAxis: { minValue: 0 },
    annotations: { alwaysOutside: true }
  });
}

/*******************************
 * STUDENT TABLE
 *******************************/
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  data
    .filter(d => d['PLACEMENT STATUS'] === 'Placed')
    .forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d['PROGRAMME']}</td>
        <td>${d['STUDENT NAME']}</td>
        <td>${d['COMPANY NAME']}</td>
        <td>${d['COMPANY TYPE']}</td>
        <td>${d['PACKAGE'] || ''}</td>
      `;
      tbody.appendChild(tr);
    });
}

/*******************************
 * LAST UPDATED
 *******************************/
function updateLastUpdated() {
  document.getElementById('lastUpdated').innerText =
    'Last Updated: ' + new Date().toLocaleString();
}




