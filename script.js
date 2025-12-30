const URL = "https://script.google.com/macros/s/AKfycbw6NW8cq8n4Wgk4gwTtqaDIQH9PtQxgLKCjLcPxQuQapm8jKEoN8uz8VjLagW18k8_k/exec";

fetch(URL)
  .then(res => res.json())
  .then(data => {
    updateKPIs(data.summary);
    buildTable("studentTable", data.students);
    buildTable("companyTable", data.companies);
    drawCompanyChart(data.companyTypeStats);
  });

function updateKPIs(s) {
  total.textContent = s.totalStudents;
  placed.textContent = s.placed;
  unplaced.textContent = s.unplaced;
  percent.textContent = s.placementPercentage + "%";
}

function buildTable(id, rows) {
  if (rows.length === 0) return;

  const table = document.getElementById(id);
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  thead.innerHTML =
    "<tr>" + Object.keys(rows[0]).map(h => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = rows.map(r =>
    "<tr>" + Object.values(r).map(v => `<td>${v}</td>`).join("") + "</tr>"
  ).join("");
}

function drawCompanyChart(stats) {
  new Chart(document.getElementById("companyChart"), {
    type: "bar",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: "Number of Companies",
        data: Object.values(stats)
      }]
    }
  });
}

