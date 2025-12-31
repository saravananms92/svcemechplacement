async function fetchAndDrawCharts() {
  try {
    const response = await fetch(DATA_URL);
    const data = await response.json();

    console.log('DATA RECEIVED:', data);

    // 🔥 FIX: validate OBJECT, not ARRAY
    if (!data || !data.placedStudents) {
      alert('No data received from Google Sheet');
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
    console.error('Fetch error:', error);
    alert('Failed to load placement data');
  }
}
