const API_URL =
  "https://script.google.com/macros/s/AKfycbwEHSGUSxq1FIKD2nby0kPBWxJ2u12yuRrVYPxW5O-CaTJ51KSVu2wx4UHh6rS5tUEn/exec?api=1";
let refreshInterval = 60; // seconds
let countdown = refreshInterval;

function loadData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => renderData(data))
    .catch(err => console.error("API Error:", err));
}

// Reset countdown
  countdown = refreshInterval;

function renderData(data) {
  document.getElementById("total").innerHTML =
    `<h3>Total Students</h3><p>${data.totalStudents}</p>`;

  document.getElementById("opted").innerHTML =
    `<h3>Opted for Placement</h3><p>${data.optedStudents}</p>`;

  document.getElementById("placed").innerHTML =
    `<h3>Students Placed</h3><p>${data.placedCount}</p>`;

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
  // =========================
  // Add Last Updated timestamp
  // =========================
  const now = new Date();
  document.getElementById("lastUpdated").innerText = 
    "Last Updated: " + now.toLocaleString();
}

// Initial load
loadData();

// Auto refresh every 60 seconds
setInterval(loadData, 60000);


