// -----------------------------
// Sprach-System
// -----------------------------

let activeLang = null;
let translations = null;

// Sprache laden
async function loadConfig() {
    const res = await fetch("./lang/lang.config");
    return res.json();
}

// .lang Datei einlesen und parsen
async function loadLangFile(fileName) {
    const res = await fetch("./lang/" + fileName);
    const text = await res.text();
    return parseLang(text);
}

// .lang Text-Datei in JS-Objekt umwandeln
function parseLang(text) {
    const pages = {};
    const pageRegex = /p\[(.+?)\]\s*\{([\s\S]*?)\}/g;
    let match;

    while ((match = pageRegex.exec(text)) !== null) {
        const page = match[1].trim();
        const body = match[2];

        const entries = {};
        body.split("\n").forEach(line => {
            line = line.trim();
            if (!line || line.startsWith("//")) return;

            const parts = line.split("=");
            if (parts.length < 2) return;

            const key = parts[0].trim().replace(";", "");
            let value = parts.slice(1).join("=").trim();

            value = value.replace(/;$/, "");
            value = value.replace(/^"(.*)"$/, "$1");

            entries[key] = value;
        });

        pages[page] = entries;
    }

    return pages;
}

// Texte auf die Seite anwenden
function applyTranslations() {
    const page = window.location.pathname.split("/").pop() || "index.html";

    if (!translations || !translations[page]) return;

    document.querySelectorAll("[data-lang-id]").forEach(el => {
        const key = el.getAttribute("data-lang-id");
        if (translations[page][key]) {
            el.innerText = translations[page][key];
        }
    });

    
}

// Sprache aktivieren
async function setLanguage(langFile) {
    activeLang = langFile;
    localStorage.setItem("lang", langFile);

    translations = await loadLangFile(langFile);
    applyTranslations();
}

// Initialisierung
async function initLang() {
    const config = await loadConfig();

    const saved = localStorage.getItem("lang");
    const defaultLang = saved || config.defaultLang || "german.lang";

    const selector = document.getElementById("langSelector");
    if (selector) selector.value = defaultLang;

    await setLanguage(defaultLang);

    if (selector) {
        selector.addEventListener("change", () => {
            setLanguage(selector.value);
        });
    }

    // btn.clicked Attribut für alle Buttons
    document.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.setAttribute("clicked", "true");
        });
    });
}

// Start
document.addEventListener("DOMContentLoaded", initLang);
