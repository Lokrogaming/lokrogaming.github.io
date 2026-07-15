
     fetch('/src/JSON/Projects/settings.json')
  .then(response => {
    if (!response.ok) throw new Error("Datei konnte nicht geladen werden.");
    return response.json();
  })
  .then(data => {
    // Quarantänemodus prüfen
    if (data.quarantine === true) {
      window.location.href = 'https://lokro.dev/error.html?reason=503';
      return;
    }

    // Dateinamen der aktuellen Seite ermitteln
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Wartungsmodus prüfen
    if (data.maintenance && typeof data.maintenance === 'object') {
      if (data.maintenance[currentPage] === true) {
        window.location.href = 'https://lokro.dev/error.html?reason=maintenance';
      }
      if (data.maintenance["all"] === true) {
        window.location.href = 'https://lokro.dev/error.html?reason=maintenance';
      }
    }
  })
  .catch(error => {
    console.error('Fehler beim Laden der JSON-Datei:', error);
  });

