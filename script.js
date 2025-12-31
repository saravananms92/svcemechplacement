google.charts.load('current', { packages: ['corechart', 'bar', 'table'] });
google.charts.setOnLoadCallback(fetchAndDrawCharts);

const DATA_URL = 'https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec';

/* ---------- FETCH DATA ---------- */
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    updateKPIs(data);
    drawPlacementStatusChart(data);
    drawCompanyChart(data);
    drawProgrammeChart(data);
    drawTopPackageChart(data);
    populateStudentTable(data);
    updateLastUpdated();

  } catch (err) {
    console.error('Error fetching placement data:', err);
  }
}

/* ---------- KPI CARDS ---------- */
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

/* ---------- PLACEMENT STATUS CHART ---------- */
function drawPlacementStatusChart(data) {
  const statusCount = {};

  data.forEach(d => {
    const status = d['PLACEMENT STATUS'] || 'Not Placed';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const chartData = [['Status', 'Count', { role: 'annotation' }]];
  Object.keys(statusCount).forEach(k => {
    chartData.push([k, statusCount[k], statusCount[k]]);
  });

  const options = {
    title: 'Placement Status',
    pieHole: 0.4,
    chartArea: { width: '70%', height: '70%' },
    legend: { position: 'right' }
  };

  new google.visualization.PieChart(
    document.getElementById('statusChart')
  ).draw(google.visualization.arrayToDataTable(chartData), options);
}

/* ---------- COMPANY TYPE CHART ---------- */
function drawCompanyChart(data) {
  const companyCount = {};

  data.forEach(d => {
    const type = d['COMPANY TYPE'] || 'Unknown';
    companyCount[type] = (companyCount[type] || 0) + 1;
  });

  const chartData = [['Company Type', 'Count', { role: 'annotation' }]];
  Object.keys(companyCount).forEach(k => {
    chartData.push([k, companyCount[k], companyCount[k]]);
  });

  const options = {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    chartArea: { width: '70%', height: '70%' },
    legend: { position: 'right' }
  };

  new google.visualization.PieChart(
    document.getElementById('companyChart')
  ).draw(google.visualization.arrayToDataTable(chartData), options);
}

/* ---------- PROGRAMME-WISE CHART ---------- */
function drawProgrammeChart(data) {
  const programmeCount = {};

  data.forEach(d => {
    const prog = d['PROGRAMME'] || 'Unknown';
    programmeCount[prog] = (programmeCount[prog] || 0) + 1;
  });

  const chartData = [['Programme', 'Count', { role: 'annotation' }]];
  Object.keys(programmeCount).forEach(k => {
    chartData.push([k, programmeCount[k], programmeCount[k]]);
  });

  const options = {
    title: 'Programme-wise Placement',
    chartArea: { width: '60%' },
    hAxis: { title: 'Count', minValue: 0 },
    vAxis: { title: 'Programme' },
    annotations: { alwaysOutside: true }
  };

  new google.visualization.BarChart(
    document.getElementById('programmeChart')
  ).draw(google.visualization.arrayToDataTable(chartData), options);
}

/* ---------- TOP 10 PACKAGES CHART (FIXED) ---------- */
function drawTopPackageChart(data) {

  const cleaned = [];

  data.forEach(d => {
    let student = d['STUDENT NAME'];
    let pkg = d['PACKAGE'];

    if (pkg === null || pkg === '' || pkg === undefined) return;
    if (isNaN(pkg)) return;

    cleaned.push({
      student: student,
      package: Number(pkg)
    });
  });

  if (cleaned.length === 0) {
    document.getElementById('topPackageChart').innerHTML =
      '<b>No package data available</b>';
    return;
  }

  cleaned.sort((a, b) => b.package - a.package);
  const top10 = cleaned.slice(0, 10);

  const chartData = [['Student', 'Package (LPA)', { role: 'annotation' }]];
  top10.forEach(d => {
    chartData.push([d.student, d.package, d.package + ' LPA']);
  });

  const options = {
    title: 'Top 10 Highest Packages (LPA)',
    chartArea: { width: '60%' },
    hAxis: { title: 'Package (LPA)', minValue: 0 },
    vAxis: { title: 'Student Name' },
    annotations: { alwaysOutside: true }
  };

  new google.visualization.BarChart(
    document.getElementById('topPackageChart')
  ).draw(google.visualization.arrayToDataTable(chartData), options);
}

/* ---------- STUDENT TABLE ---------- */
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  data
    .filter(d => d['PLACEMENT STATUS'] === 'Placed')
    .forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${d['PROGRAMME']}</td>
        <td>${d['STUDENT NAME']}</td>
        <td>${d['COMPANY NAME']}</td>
        <td>${d['COMPANY TYPE']}</td>
        <td>${d['PACKAGE'] ?? ''}</td>
      `;
      tbody.appendChild(row);
    });
}

/* ---------- LAST UPDATED ---------- */
function updateLastUpdated() {
  document.getElementById('lastUpdated').innerText =
    `Last Updated: ${new Date().toLocaleString()}`;
}
