/*************************************
 * CONFIG
 *************************************/
const API_URL =
  "https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec?api=1";

let refreshInterval = 60;
let countdown = refreshInterval;

/*************************************
 * LOAD GOOGLE CHARTS
 *************************************/
google.charts.load("current", { packages: ["corechart"] });

/*************************************
 * FETCH DATA
 *************************************/
function loadData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => renderData(data))
    .catch(err => console.error("API Error:", err));

  countdown = refreshInterval;
}

/*************************************
 * DRAW CHART FUNCTIONS
 *************************************/
function drawStatusChart(opted, placed) {
  const data = google.visualization.arrayToDataTable([
    ["Status", "Count"],
    ["Opted for Placement", opted],
    ["Placed Students", placed]
  ]);

  const chart = new google.visualization.PieChart(
    document.getElementById("statusChart")
  );
  chart.draw(data, { pieHole: 0.4, legend: { position: "bottom" } });
}

function drawCompanyChart(placedStudents) {
  const count = {};
  placedStudents.forEach(s => {
    count[s.type] = (count[s.type] || 0) + 1;
  });

  const chartData = [["Company Type", "Students"]];
  Object.keys(count).forEach(k => chartData.push([k, count[k]]));

  const chart = new google.visualization.ColumnChart(
    document.getElementById("companyChart")
  );
  chart.draw(
    google.visualization.arrayToDataTable(chartData),
    { legend: { position: "bottom" } }
  );
}

function drawProgrammeChart(programmeCount) {
  const chartData = [["Programme", "Students"]];
  Object.keys(programmeCount).forEach(p =>
    chartData.push([p, programmeCount[p]])
  );

  const chart = new google.visualization.ColumnChart(
    document.getElementById("programmeChart")
  );
  chart.draw(
    google.visualization.arrayToDataTable(chartData),
    { legend: "none" }
  );
}

function drawTopPackageChart(topPackages) {

  // SAFETY CHECK
  if (!topPackages || topPackages.length === 0) {
    document.getElementById("topPackageChart").innerHTML =
      "<p style='text-align:center;color:#999'>No package data available</p>";
    return;
  }
  const chartData = [["Student", "Package"]];
  topPackages.forEach(s => {
    chartData.push([s.name, Number(s.package)]);
  });
  
const data = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: "Top 10 Highest Packages (LPA)",
    legend: { position: "none" },
    bars: "horizontal",
    height: 400,
    hAxis: {
      title: "Package",
      minValue: 0
    },
    vAxis: {
      textStyle: { fontSize: 11 }
    }
  };
  const chart = new google.visualization.BarChart(
    document.getElementById("topPackageChart")
  );
  chart.draw(data, options);
}

/*************************************
 * DRAW ALL CHARTS
 *************************************/
function drawAllCharts(data) {
  drawStatusChart(data.optedStudents, data.placedCount);
  drawCompanyChart(data.placedStudents);
  drawProgrammeChart(data.programmeCount);
  drawTopPackageChart(data.topPackageChart);
}

/*************************************
 * RENDER DASHBOARD
 *************************************/
function renderData(data) {

  document.getElementById("total").innerHTML =
    `<h3>Total Students</h3><p>${data.totalStudents}</p>`;

  document.getElementById("opted").innerHTML =
    `<h3>Opted for Placement</h3><p>${data.optedStudents}</p>`;

  document.getElementById("placed").innerHTML =
    `<h3>Students Placed</h3><p>${data.placedCount}</p>`;

  const percent = data.optedStudents
    ? ((data.placedCount / data.optedStudents) * 100).toFixed(2)
    : 0;

  document.getElementById("percentage").innerHTML =
    `<h3>Placement %</h3><p>${percent}%</p>`;

  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";
  data.placedStudents.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.programme}</td>
        <td>${s.name}</td>
        <td>${s.company}</td>
        <td>${s.type}</td>
      </tr>`;
  });

  document.getElementById("lastUpdated").innerText =
    "Last Updated: " + new Date().toLocaleString();

  google.charts.setOnLoadCallback(() => drawAllCharts(data));
}

/*************************************
 * AUTO REFRESH TIMER
 *************************************/
setInterval(() => {
  countdown--;
  if (countdown <= 0) loadData();
  document.getElementById("refreshCountdown").innerText =
    `Next refresh in: ${countdown}s`;
}, 1000);

/*************************************
 * INITIAL LOAD
 *************************************/
loadData();


