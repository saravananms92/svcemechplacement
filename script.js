/*************************************
 * CONFIG
 *************************************/
const API_URL =
  "https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec?api=1";

let refreshInterval = 60; // seconds
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

  // reset countdown after refresh
  countdown = refreshInterval;
}

/*************************************
 * DRAW CHARTS
 *************************************/
function drawStatusChart(opted, placed) {
  const data = google.visualization.arrayToDataTable([
    ["Status", "Count"],
    ["Opted for Placement", opted],
    ["Placed Students", placed]
  ]);

  const options = {
    title: "Placement Status Overview",
    pieHole: 0.4,
    legend: { position: "bottom" }
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("statusChart")
  );
  chart.draw(data, options);
}

function drawCompanyChart(placedStudents) {
  let companyTypeCount = {};

  placedStudents.forEach(s => {
    companyTypeCount[s.type] =
      (companyTypeCount[s.type] || 0) + 1;
  });

  let chartData = [["Company Type", "Students"]];
  for (let type in companyTypeCount) {
    chartData.push([type, companyTypeCount[type]]);
  }

  const data = google.visualization.arrayToDataTable(chartData);

  const options = {
    title: "Company Type Distribution",
    legend: { position: "bottom" }
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("companyChart")
  );
  chart.draw(data, options);
}

/*************************************
 * RENDER DASHBOARD
 *************************************/
function renderData(data) {

  // Cards
  document.getElementById("total").innerHTML =
    `<h3>Total Students</h3><p>${data.totalStudents}</p>`;

  document.getElementById("opted").innerHTML =
    `<h3>Opted for Placement</h3><p>${data.optedStudents}</p>`;

  document.getElementById("placed").innerHTML =
    `<h3>Students Placed</h3><p>${data.placedCount}</p>`;

  let placementPercentage = 0;
  if (data.optedStudents > 0) {
    placementPercentage =
      ((data.placedCount / data.optedStudents) * 100).toFixed(2);
  }

  document.getElementById("percentage").innerHTML =
    `<h3>Placement %</h3><p>${placementPercentage}%</p>`;

  // Table
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

  // Last updated time
  document.getElementById("lastUpdated").innerText =
    "Last Updated: " + new Date().toLocaleString();

  // Draw charts
  google.charts.setOnLoadCallback(() => {
    drawStatusChart(data.optedStudents, data.placedCount);
    drawCompanyChart(data.placedStudents);
  });
}

/*************************************
 * COUNTDOWN TIMER
 *************************************/
setInterval(() => {
  countdown--;

  if (countdown <= 0) {
    loadData();
  }

  document.getElementById("refreshCountdown").innerText =
    `Next refresh in: ${countdown}s`;
}, 1000);

/*************************************
 * INITIAL LOAD
 *************************************/
loadData();
