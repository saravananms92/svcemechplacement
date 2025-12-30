<script>
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(loadData);

function loadData() {
  google.script.run.withSuccessHandler(renderData).getPlacementData();
}

function renderData(data) {
  document.getElementById('total').innerHTML =
    `<h3>Total Students</h3><p>${data.totalStudents}</p>`;

  document.getElementById('opted').innerHTML =
    `<h3>Opted for Placement</h3><p>${data.optedStudents}</p>`;

  document.getElementById('placed').innerHTML =
    `<h3>Students Placed</h3><p>${data.placedCount}</p>`;

  drawChart(data.companySummary);
  populateTable(data.placedStudents);
}

function drawChart(companyData) {
  let chartData = [['Company', 'Students']];
  companyData.forEach(r => {
    chartData.push([r.company, Number(r.total)]);
  });

  let data = google.visualization.arrayToDataTable(chartData);

  let options = {
    title: 'Company-wise Placements',
    legend: { position: 'none' }
  };

  let chart = new google.visualization.ColumnChart(
    document.getElementById('chart')
  );
  chart.draw(data, options);
}

function populateTable(students) {
  let tbody = document.querySelector('#studentTable tbody');
  tbody.innerHTML = '';

  students.forEach(s => {
    let row = `<tr>
      <td>${s.name}</td>
      <td>${s.company}</td>
      <td>${s.type}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}
</script>


