function openSettings() {
  document.getElementById('settings').style.display = 'block';
}

function closeSettings() {
  document.getElementById('settings').style.display = 'none';
}

function saveSettings() {
  const bg = document.getElementById('bgColor').value;
  const text = document.getElementById('textColor').value;
  const font = document.getElementById('fontSelect').value;
  const nav = document.getElementById('navPosition').value;

  localStorage.setItem('bgColor', bg);
  localStorage.setItem('textColor', text);
  localStorage.setItem('font', font);
  localStorage.setItem('navPosition', nav);

  applySettings();
  closeSettings();
}

function applySettings() {
  const bg = localStorage.getItem('bgColor');
  const text = localStorage.getItem('textColor');
  const font = localStorage.getItem('font');
  const nav = localStorage.getItem('navPosition');

  if (bg) document.body.style.backgroundColor = bg;
  if (text) document.body.style.color = text;
  if (font) document.body.style.fontFamily = font;

  const navElem = document.getElementById('navigation');
  if (nav === 'side') {
    navElem.style.position = 'fixed';
    navElem.style.left = '0';
    navElem.style.top = '0';
    navElem.style.height = '100%';
    navElem.style.width = '120px';
  } else {
    navElem.style = '';
    navElem.style.textAlign = 'center';
    navElem.style.background = '#333';
    navElem.style.color = 'white';
  }
}

// Direkt beim Laden anwenden
window.onload = applySettings;
