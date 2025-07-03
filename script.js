function opengame() {
  window.location.href ="guesser2.html"
}
function opentime() {
  window.location.href ="time3.html"
}
function backtomenu() {
  window.location.href ="game-library.html"
}
function openlibrary() {
  window.location.href="game-library.html"
}
function openbot() {
  window.location.href="discord-bot.html"
}
function opendownloader() {
  window.location.href="download-hub.html"
}
function downloadtimer() {
  window.location.href="time.zip"
}
function downloadLogo() {
  window.location.href="logo.zip"
}
function downloadbewerbung() {
  window.location.href="Bewerbung-Content_creator.zip"
}
function downloadmemes() {
  window.location.href="memes.zip"
}
function opentwitchplayer() {
  window.location.href="musicplayer.html"
}
function downloadmsgs() {
  window.location.href="msg-coded.zip"
}
function opendiscord() {
  window.open("Discord.html")
}
function opentest() {
  window.location.href="test-coupon-page.html"
}
function openlateindl() {
  window.location.href="projects/latein/verben-gruppen-projekt/downloader.html"
}
function opentycoon() {
  window.location.href="tycoon.html"
}
const units = {
  weight: {
    kg: 1,
    g: 1000,
    lb: 2.20462,
    oz: 35.274
  },
  length: {
    m: 1,
    km: 0.001,
    cm: 100,
    mm: 1000,
    mi: 0.000621371,
    yd: 1.09361,
    ft: 3.28084,
    in: 39.3701
  },
  speed: {
    "m/s": 1,
    "km/h": 3.6,
    "mph": 2.23694,
    "kn": 1.94384
  }
};

const staticRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.3,
  CHF: 0.98,
  AUD: 1.53,
  CAD: 1.37
};

document.getElementById("categorySelect").addEventListener("change", updateUnits);

function updateUnits() {
  const category = document.getElementById("categorySelect").value;
  const fromSelect = document.getElementById("fromUnit");
  const toSelect = document.getElementById("toUnit");

  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  let options = [];

  if (category === "currency") {
    options = Object.keys(staticRates);
  } else {
    options = Object.keys(units[category]);
  }

  options.forEach(unit => {
    const optionFrom = new Option(unit, unit);
    const optionTo = new Option(unit, unit);
    fromSelect.add(optionFrom);
    toSelect.add(optionTo);
  });
}

function convert() {
  const value = parseFloat(document.getElementById("inputValue").value);
  const category = document.getElementById("categorySelect").value;
  const from = document.getElementById("fromUnit").value;
  const to = document.getElementById("toUnit").value;
  const result = document.getElementById("result");

  if (isNaN(value)) {
    result.textContent = "Bitte eine gültige Zahl eingeben.";
    return;
  }

  if (category === "currency") {
    const baseUSD = value / staticRates[from];
    const converted = baseUSD * staticRates[to];
    result.textContent = `Ergebnis: ${converted.toFixed(2)} ${to}`;
    return;
  }

  const fromFactor = units[category][from];
  const toFactor = units[category][to];
  const baseValue = value / fromFactor;
  const converted = baseValue * toFactor;
  result.textContent = `Ergebnis: ${converted.toFixed(2)} ${to}`;
}

// Seite initialisieren mit Gewicht
document.addEventListener("DOMContentLoaded", () => {
  updateUnits();
});

async function loadFlags() {
  const res = await fetch('./src/assets/games/flags/flags.json');
  const data = await res.json();
  return data;
}

function getRandomItems(array, count, exclude) {
  const filtered = array.filter(item => item !== exclude);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

async function startQuiz() {
  const flags = await loadFlags();
  const entries = Object.entries(flags);

  const [flagPath, correctAnswer] = entries[Math.floor(Math.random() * entries.length)];

  const allCountries = entries.map(e => e[1]);
  const wrongAnswers = getRandomItems(allCountries, 2, correctAnswer);
  const options = shuffle([correctAnswer, ...wrongAnswers]);

  document.getElementById('flag-img').src = flagPath.startsWith('./') ? flagPath : `.${flagPath}`;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => {
      document.getElementById('result').textContent =
        option === correctAnswer ? '✅ Richtig!' : `❌ Falsch! Richtige Antwort: ${correctAnswer}`;
      setTimeout(startQuiz, 2000);
    };
    optionsDiv.appendChild(button);
  });
}

startQuiz();

