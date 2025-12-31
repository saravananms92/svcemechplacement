google.charts.load('current', {'packages':['corechart', 'bar', 'table']});
google.charts.setOnLoadCallback(fetchAndDrawCharts);

const DATA_URL = 'YOUR_DEPLOYED_SCRIPT_URL_HERE?api=1'; // replace with your Apps Script URL

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
  const percentage = ((placed / total) * 100).toFixed(1);

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
  for (let key in statusCount) {
    chartData.push([key, statusCount[key], statusCount[key]]);
  }

  const dataTable = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Placement Status',
    pieHole: 0.4,
    chartArea: {width: '70%', height: '70%'},
    legend: { position: 'right' },
    colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a']
  };

  const chart = new google.visualization.PieChart(document.getElementById('statusChart'));
  chart.draw(dataTable, options);
}

/* ---------- COMPANY TYPE CHART ---------- */
function drawCompanyChart(data) {
  const companyCount = {};
  data.forEach(d => {
    const type = d['COMPANY TYPE'] || 'Unknown';
    companyCount[type] = (companyCount[type] || 0) + 1;
  });

  const chartData = [['Company Type', 'Count', { role: 'annotation' }]];
  for (let key in companyCount) {
    chartData.push([key, companyCount[key], companyCount[key]]);
  }

  const dataTable = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Company Type Distribution',
    pieHole: 0.4,
    chartArea: {width: '70%', height: '70%'},
    legend: { position: 'right' }
  };

  const chart = new google.visualization.PieChart(document.getElementById('companyChart'));
  chart.draw(dataTable, options);
}

/* ---------- PROGRAMME-WISE CHART ---------- */
function drawProgrammeChart(data) {
  const programmeCount = {};
  data.forEach(d => {
    const prog = d['PROGRAMME'] || 'Unknown';
    programmeCount[prog] = (programmeCount[prog] || 0) + 1;
  });

  const chartData = [['Programme', 'Count', { role: 'annotation' }]];
  for (let key in programmeCount) {
    chartData.push([key, programmeCount[key], programmeCount[key]]);
  }

  const dataTable = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Programme-wise Placement',
    chartArea: {width: '60%'},
    hAxis: { title: 'Count', minValue: 0 },
    vAxis: { title: 'Programme' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12 } },
    colors: ['#1b9e77']
  };

  const chart = new google.visualization.BarChart(document.getElementById('programmeChart'));
  chart.draw(dataTable, options);
}

/* ---------- TOP PACKAGES CHART ---------- */
function drawTopPackageChart(data) {
  const placedWithPackage = data.filter(d => d['PLACEMENT STATUS'] === 'Placed' && d['PACKAGE']);
  placedWithPackage.sort((a,b) => b['PACKAGE'] - a['PACKAGE']);
  const top5 = placedWithPackage.slice(0,5);

  const chartData = [['Student', 'Package', { role: 'annotation' }]];
  top5.forEach(d => {
    chartData.push([d['STUDENT NAME'], Number(d['PACKAGE']), d['PACKAGE'] + ' LPA']);
  });

  if (top5.length === 0) {
    document.getElementById('topPackageChart').innerHTML = 'No package data available';
    return;
  }

  const dataTable = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: 'Top 5 Packages (LPA)',
    chartArea: {width: '60%'},
    hAxis: { title: 'Package (LPA)', minValue: 0 },
    vAxis: { title: 'Student Name' },
    annotations: { alwaysOutside: true, textStyle: { fontSize: 12, color: '#000' } },
    colors: ['#1b9e77']
  };

  const chart = new google.visualization.BarChart(document.getElementById('topPackageChart'));
  chart.draw(dataTable, options);
}

/* ---------- STUDENT TABLE ---------- */
function populateStudentTable(data) {
  const tbody = document.getElementById('studentTable');
  tbody.innerHTML = '';

  const placedStudents = data.filter(d => d['PLACEMENT STATUS'] === 'Placed');
  placedStudents.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d['PROGRAMME']}</td>
      <td>${d['STUDENT NAME']}</td>
      <td>${d['COMPANY NAME']}</td>
      <td>${d['COMPANY TYPE']}</td>
      <td>${d['PACKAGE'] || ''}</td>
    `;
    tbody.appendChild(row);
  });
}

/* ---------- LAST UPDATED ---------- */
function updateLastUpdated() {
  const now = new Date();
  document.getElementById('lastUpdated').innerText = `Last Updated: ${now.toLocaleString()}`;
}



