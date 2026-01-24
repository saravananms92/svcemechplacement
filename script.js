/************************************************
 * CONFIG
 ************************************************/
const DATA_URL = "https://script.google.com/macros/s/AKfycbxpK-mCvnnjvKx7kYT8wGWaPyqOx_ky2SvHunhLzD5gbzv6fGy3QsZUmB6HdpvvN4LH/exec";
let dataGlobal = null;

/************************************************
 * GOOGLE CHARTS LOAD
 ************************************************/
google.charts.load("current", { packages: ["corechart"] });

/************************************************
 * SAFE INIT
 ************************************************/
document.addEventListener("DOMContentLoaded", () => {
  google.charts.setOnLoadCallback(() => {
    console.log("Charts + DOM Ready");
    init();
  });
});

function init() {
  fetchAndDrawCharts();
}

/************************************************
 * FETCH DATA
 ************************************************/
async function fetchAndDrawCharts() {
  try {
    console.log("Fetching placement data...");

    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    console.log("DATA RECEIVED:", data);

    dataGlobal = data;

    updateKPIs(data);
    drawPlacementStatusChart(data);
    drawCompanyChart(data);
    drawProgrammeChart(data);
    drawCoreNonCoreChart(data);
    drawCompanyVsStudentsChart(data);
    drawTopPackageChart(data);
    populateStudentTable(data);

  } catch (err) {
    console.error("FETCH ERROR:", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      "<p style='color:red;text-align:center'>⚠ Failed to load placement data</p>"
    );
  }
}

/************************************************
 * KPI
 ************************************************/
function updateKPIs(data) {
  const percent =
    data.eligibleStudents > 0
      ? ((data.placedCount / data.eligibleStudents) * 100).toFixed(1)
      : 0;

  const set = (id, value) => {
    const el = document.querySelector(`#${id} strong`);
    if (el) el.innerText = value;
  };

  set("total", data.totalStudents || 0);
  set("opted", data.optedStudents || 0);
  set("eligible", data.eligibleStudents || 0);
  set("placed", data.placedCount || 0);
  set("percentage", percent + "%");
}

/************************************************
 * PLACEMENT STATUS
 ************************************************/
function drawPlacementStatusChart(data) {
  const el = document.getElementById("statusChart");
  if (!el) return;

  const rows = [
    ["Status", "Count"],
    ["Placed", data.placedCount || 0],
    ["Not Placed", (data.eligibleStudents || 0) - (data.placedCount || 0)]
  ];

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(el).draw(table, {
    title: "Placement Status",
    pieHole: 0.4,
    chartArea: { width: "75%", height: "75%" }
  });
}

/************************************************
 * COMPANY TYPE
 ************************************************/
function drawCompanyChart(data) {
  const el = document.getElementById("companyChart");
  if (!el) return;

  const map = {};
  (data.placedStudents || []).forEach(s => {
    const type = s.type || "Unknown";
    map[type] = (map[type] || 0) + 1;
  });

  const rows = [["Company Type", "Count"]];
  Object.keys(map).forEach(k => rows.push([k, map[k]]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.PieChart(el).draw(table, {
    title: "Company Type Distribution",
    pieHole: 0.4,
    chartArea: { width: "75%", height: "75%" }
  });
}

/************************************************
 * PROGRAMME
 ************************************************/
function drawProgrammeChart(data) {
  const el = document.getElementById("programmeChart");
  if (!el) return;

  if (!data.programmeCount) {
    el.innerHTML = "No data";
    return;
  }

  const rows = [["Programme", "Placed"]];
  Object.keys(data.programmeCount).forEach(p => {
    rows.push([p, Number(data.programmeCount[p]) || 0]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: 420,
    chartArea: { left: 80, top: 60, width: "65%", height: "60%" },
    vAxis: { title: "Placed Students", minValue: 0 },
    legend: { position: "none" }
  });
}

/************************************************
 * CORE vs NON CORE
 ************************************************/
function drawCoreNonCoreChart(data) {
  const el = document.getElementById("coreNonCoreChart");
  if (!el || !data.coreNonCoreCount) return;

  const rows = [["Programme", "Core", "Non-Core"]];
  Object.keys(data.coreNonCoreCount).forEach(p => {
    rows.push([p, data.coreNonCoreCount[p].Core, data.coreNonCoreCount[p].NonCore]);
  });

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: 420,
    chartArea: { left: 80, top: 60, width: "65%", height: "60%" },
    legend: { position: "bottom" }
  });
}

/************************************************
 * COMPANY vs STUDENTS
 ************************************************/
function drawCompanyVsStudentsChart(data) {
  const el = document.getElementById("companyStudentsChart");
  if (!el || !data.Company_Filter) return;

  const sorted = data.Company_Filter
    .map(r => ({ company: r["Company Name"], count: Number(r["Total students placed"]) }))
    .sort((a, b) => b.count - a.count);

  const rows = [["Company", "Students"]];
  sorted.forEach(i => rows.push([i.company, i.count]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: 500,
    chartArea: { left: 80, top: 60, width: "60%", height: "65%" },
    legend: { position: "none" }
  });
}

/************************************************
 * TOP PACKAGE
 ************************************************/
function drawTopPackageChart(data) {
  const el = document.getElementById("topPackageChart");
  if (!el || !data.topPackages) return;

  const rows = [["Student", "Package"]];
  data.topPackages.forEach(s => rows.push([s.name, Number(s.package)]));

  const table = google.visualization.arrayToDataTable(rows);

  new google.visualization.ColumnChart(el).draw(table, {
    height: 400,
    chartArea: { left: 60, top: 60, width: "60%", height: "70%" },
    legend: { position: "none" }
  });
}

/************************************************
 * TABLE
 ************************************************/
function populateStudentTable(data) {
  const tbody = document.getElementById("studentTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  (data.placedStudents || []).forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.programme || ""}</td>
      <td>${s.registerNo || ""}</td>
      <td>${s.name || ""}</td>
      <td>${s.company || ""}</td>
      <td>${s.type || ""}</td>
      <td>${s.package || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

/************************************************
 * RESIZE
 ************************************************/
window.addEventListener("resize", () => {
  if (!dataGlobal) return;
  drawPlacementStatusChart(dataGlobal);
  drawCompanyChart(dataGlobal);
  drawProgrammeChart(dataGlobal);
  drawCoreNonCoreChart(dataGlobal);
  drawCompanyVsStudentsChart(dataGlobal);
  drawTopPackageChart(dataGlobal);
});
