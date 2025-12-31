/* ================= GOOGLE CHARTS LOAD ================= */
google.charts.load('current', {
  packages: ['corechart', 'bar', 'table']
});
google.charts.setOnLoadCallback(fetchAndDrawCharts);

/* ================= DATA SOURCE ================= */
const DATA_URL =
  'https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec?api=1';

/* ================= FETCH DATA ================= */
async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error('No data received');
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
    console.error('Error fetching placement data:', error);
  }
}

/* ================= KPI CARDS ================= */
function updateKPIs(data) {
  const total = data.length;
  const opted = data.filter(d => d['PLACEMENT STATUS']).length;
  const placed = data.filter(d => d['PLACEMENT STATUS'] === 'Placed').length;
  const percentage = total ? ((placed / total) * 100).toFixed(1) : 0;

  document.getElementById('total').innerText =
    `Total Students\n${total}`;
  document.getElementById('opted').innerText =
    `Opted for Placement\n${opted}`;
  document.getElementById('placed').innerText =
    `Placed\n${placed}`;
  document.getElementById('percentage').innerText =
    `Placement %\n${percentage}%`;
}

/* ================= PLACEMENT STATUS ================= */
function drawPlacementStatusChart(data) {
  const statusCount = {};

  data.forEach(d => {
    const status = d['PLACEMENT STATUS'] || 'Not Placed';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const chartData = [['Status', 'Count', { role: 'annotation' }]];
  Object.keys(statusCount).forEach(key => {
    chartData.push([key, statusCount[key], statusCount[key]]);
  });

  const dataTable =
    google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Placement Status',
    pieHole: 0.4,
    legend: { position: 'right' },
    chartArea: { width: '70%', height: '70%' },
    colors: ['#1b9e77', '#d95f02', '#7570b3']
  };

  new google.visualization.PieChart(
    document.getElementById('statusChart')
  ).draw(dataTable, options);
}

/* ================= COMPANY TYPE ================= */
function drawCompanyChart(data) {
  const companyCount = {};

  data.forEach(d => {
    const type = d['COMPANY TYPE'] || 'Unknown';
    companyCount[type] = (companyCount[type] || 0) + 1;
  });

  const chartData = [['Company Type', 'Count', { role: 'annotation' }]];
  Object.keys(companyCount).forEach(key => {
    chartData.push([key, companyCount[key], companyCount[key]]);
  });

  const dataTable =
    google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    legend: { position: 'right' },
    chartArea: { width: '70%', height: '70%' }
  };

  new google.visualization.PieChart(
    document.getElementById('companyChart')
  ).draw(dataTable, options);
}

/* ================= PROGRAMME-WISE ================= */
function drawProgrammeChart(data) {
  const programmeCount = {};

  data.forEach(d => {
    const programme = d['PROGRAMME'] || 'Unknown';
    programmeCount[programme] =
      (programmeCount[programme] || 0) + 1;
  });

  const chartData = [['Programme', 'Count', { role: 'annotation' }]];
  Object.keys(programmeCount).forEach(key => {
    chartData.push([key, programmeCount[key], programmeCount[key]]);
  });

  const dataTable =
    google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Programme-wise Placement',
    chartArea: { width: '60%' },
    hAxis: { title: 'Count', minValue: 0 },
    vAxis: { title: 'Programme' },
    annotations: { alwaysOutside: true },
    colors: ['#1b9e77']
  };

  new google.visualization.BarChart(
    document.getElementById('programmeChart')
  ).draw(dataTable, options);
}

/* ================= TOP 10 PACKAGES ================= */
function drawTopPackageChart(data) {

  const cleaned = [];

  data.forEach(d => {
    const student = d['STUDENT NAME'];
    const pkg = Number(d['PACKAGE']);

    if (!student || isNaN(pkg) || pkg <= 0) return;

    cleaned.push({
      student: student,
      package: pkg
    });
  });

  if (cleaned.length === 0) {
    document.getElementById('topPackageChart').innerHTML =
      '<b>No package data available</b>';
    return;
  }

  cleaned.sort((a, b) => b.package - a.package);
  const top10 = cleaned.slice(0, 10);

  const chartData =
    [['Student', 'Package (LPA)', { role: 'annotation' }]];

  top10.forEach(d => {
    chartData.push([
      d.student,
      d.package,
      d.package + ' LPA'
    ]);
  });

  const dataTable =
    google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Top 10 Highest Packages (LPA)',
    chartArea: { width: '60%' },
    hAxis: { title: 'Package (LPA)', minValue: 0 },
    vAxis: { title: 'Student Name' },
    annotations: { alwaysOutside: true },
    colors: ['#0b8043']
  };

  new google.visualization.BarChart(
    document.getElementById('topPackageChart')
  ).draw(dataTable, options);
}

/* ================= STUDENT TABLE ================= */
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  data
    .filter(d => d['PLACEMENT STATUS'] === 'Placed')
    .forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${d['PROGRAMME'] || ''}</td>
        <td>${d['STUDENT NAME'] || ''}</td>
        <td>${d['COMPANY NAME'] || ''}</td>
        <td>${d['COMPANY TYPE'] || ''}</td>
      `;
      tbody.appendChild(row);
    });
}

/* ================= LAST UPDATED ================= */
function updateLastUpdated() {
  document.getElementById('lastUpdated').innerText =
    'Last Updated: ' + new Date().toLocaleString();
}
