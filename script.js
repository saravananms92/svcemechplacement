const API_URL =
  "https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec?api=1";

let refreshInterval = 60; // seconds
let countdown = refreshInterval;

/* =========================
   Load data from Apps Script
========================= */
function loadData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => renderData(data))
    .catch(err => console.error("API Error:", err));

  // 🔁 reset countdown AFTER refresh
  countdown = refreshInterval;
}

/* =========================
   Render dashboard data
========================= */
function renderData(data) {
  document.getElementById("total").innerHTML =
    `<h3>Total Students</h3><p>${data.totalStudents}</p>`;

  document.getElementById("opted").innerHTML =
    `<h3>Opted for Placement</h3><p>${data.optedStudents}</p>`;

  document.getElementById("placed").innerHTML =
    `<h3>Students Placed</h3><p>${data.placedCount}</p>`;

  // Placement Percentage
  let placementPercentage = 0;
  if (data.optedStudents > 0) {
    placementPercentage = (
      (data.placedCount / data.optedStudents) * 100
    ).toFixed(2);
  }

  document.getElementById("percentage").innerHTML =
    `<h3>Placement %</h3><p>${placementPercentage}%</p>`;

  // Populate table
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

  // Last Updated timestamp
  const now = new Date();
  document.getElementById("lastUpdated").innerText =
    "Last Updated: " + now.toLocaleString();
}

/* =========================
   Countdown timer (1 sec)
========================= */
setInterval(() => {
  countdown--;

  if (countdown <= 0) {
    loadData(); // refresh data
  }

  document.getElementById("refreshCountdown").innerText =
    `Next refresh in: ${countdown}s`;
}, 1000);

/* =========================
   Initial Load
========================= */
loadData();
