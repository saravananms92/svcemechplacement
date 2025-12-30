const API_URL = "https://script.google.com/macros/s/AKfycbw6NW8cq8n4Wgk4gwTtqaDIQH9PtQxgLKCjLcPxQuQapm8jKEoN8uz8VjLagW18k8_k/exec";

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log("API DATA:", data); // keep for verification

    /* ===== KPI VALUES ===== */
    document.getElementById("total").textContent =
      data.summary.totalStudents;

    document.getElementById("Placed").textContent =
      data.summary.placed;

    document.getElementById("Unplaced").textContent =
      data.summary.unplaced;

    document.getElementById("Not applicable").textContent =
      data.summary.notApplicable;

    document.getElementById("percent").textContent =
      data.summary.placementPercentage + "%";

    /* ===== TABLES ===== */
    buildTable("studentTable", data.students);
    buildTable("companyTable", data.companies);

    /* ===== CHART ===== */
    drawCompanyChart(data.companyTypeStats);
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
    alert("Data not loading – check console");
  });

/* ---------- TABLE GENERATOR ---------- */
function buildTable(tableId, rows) {
  if (!rows || rows.length === 0) return;

  const table = document.getElementById(tableId);
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  thead.innerHTML =
    "<tr>" +
    Object.keys(rows[0]).map(h => `<th>${h}</th>`).join("") +
    "</tr>";

  tbody.innerHTML = rows.map(r =>
    "<tr>" +
    Object.values(r).map(v => `<td>${v ?? ""}</td>`).join("") +
    "</tr>"
  ).join("");
}

/* ---------- CHART ---------- */
function drawCompanyChart(stats) {
  new Chart(document.getElementById("companyChart"), {
    type: "bar",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: "Number of Companies",
        data: Object.values(stats)
      }]
    },
    options: {
      responsive: true
    }
  });
}


