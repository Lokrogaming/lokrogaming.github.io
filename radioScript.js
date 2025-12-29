/********************
 * SETTINGS
 ********************/
const MOD_EVERY_SONGS = 3;

/********************
 * MUSIC + SHUFFLE
 ********************/
let originalMusic = [
    "music/1c51dc48-0b6c-4999-a52a-755b8c6813b8.mp3",
    "music/551cffa1-cd13-437f-a25d-32948c04c3a5.mp3",
    "music/bca5239f-16aa-49b6-848d-48db236cee8e.mp3",
    "music/d600a7c7-74f1-4c65-80d1-963d7f67c12b.mp3",
    "music/a4abb29e-d730-4743-8763-f4b6fffa7099.mp3",
    "music/56122be3-d9cc-4e7a-ae74-130ca59d93d8.mp3",
    "music/41addbf3-191b-480d-9e4f-a1f760f755ec.mp3",
    "music/9fd0931b-824c-466e-8cd7-f47e1894ae44.mp3",
    "music/1d9d3ebd-9160-46e0-8326-c85edc39c634.mp3",
    "music/fbf566fd-9b20-4699-a4e4-4e7ce2a8f27d.mp3",
    "music/671093ad-18b5-481a-a3f6-82f949a8de6b.mp3",
    "music/6fda93ad-efc7-4eb4-bfa4-d56e576ca02c.mp3",
    "music/003a96ec-1806-4d2d-a027-048a74c60ade.mp3",
    "music/bb794e60-6061-4eb8-ae5e-d0a44afcd757.mp3",
    "music/b619b1d2-b4dd-45a1-8b9a-7bfe9408f20c.mp3",
    "music/642f3a68-48b4-48de-a901-f45e7f36a981.mp3",
    "music/5f58717c-25a7-4f17-be4e-0a59b51cc33c.mp3",
    "music/526d9066-156f-4c24-8f79-005189a88623.mp3",
    "music/a114571b-164a-4ca2-947e-897cbc09ad80.mp3",
    "music/473124bf-f8f4-4119-8e7e-71b948280659.mp3"
];


originalMusic = [...new Set(originalMusic)];

let music = [];
let musicIndex = 0;

function shuffleMusic() {
    music = [...originalMusic];
    for (let i = music.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [music[i], music[j]] = [music[j], music[i]];
    }
    musicIndex = 0;
}

/********************
 * CONFIG
 ********************/
let config = {};
fetch("radioConfig.json")
    .then(r => r.json())
    .then(j => config = j);

/********************
 * AUDIO
 ********************/
const audio = new Audio();
audio.volume = 0.7;
let playingModeration = false;
let songsSinceLastMod = 0;

/********************
 * STATS (daily)
 ********************/
let stats = {
    date: "",
    songsPlayed: 0,
    moderationPlayed: 0,
    uniqueSongs: new Set()
};

function resetStatsIfNeeded() {
    const today = new Date().toISOString().split("T")[0];
    if (stats.date !== today) {
        stats = {
            date: today,
            songsPlayed: 0,
            moderationPlayed: 0,
            uniqueSongs: new Set()
        };
    }
}

/********************
 * TIMED MOD (1x/day per hour)
 ********************/
let timedPlayed = { date: "", hours: [] };

function resetTimedIfNeeded() {
    const today = new Date().toISOString().split("T")[0];
    if (timedPlayed.date !== today) {
        timedPlayed = { date: today, hours: [] };
    }
}

function getTimedModeration() {
    resetTimedIfNeeded();
    const hour = new Date().getHours();

    if (timedPlayed.hours.includes(hour)) return null;

    const entry = config.timedModeration?.find(t => t.hour === hour);
    if (!entry || !entry.files?.length) return null;

    timedPlayed.hours.push(hour);
    return entry.files[Math.floor(Math.random() * entry.files.length)];
}

/********************
 * SPECIALS (dates)
 ********************/
function getSpecial() {
    const d = new Date();
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return config.specials?.find(s => s.date === key)?.file || null;
}

/********************
 * PLAY FUNCTIONS
 ********************/
function playMusic() {
    resetStatsIfNeeded();

    const song = music[musicIndex];
    audio.src = song;
    audio.play();

    stats.songsPlayed++;
    stats.uniqueSongs.add(song);

    console.log("🎵 Song:", song);
}

function playModeration(file) {
    resetStatsIfNeeded();

    audio.src = file;
    playingModeration = true;
    audio.play();

    stats.moderationPlayed++;
    console.log("🎙 Moderation:", file);
}

function nextSong() {
    musicIndex++;
    if (musicIndex >= music.length) {
        shuffleMusic();
    }
}

/********************
 * CORE RADIO LOGIC
 ********************/
audio.addEventListener("ended", () => {

    // Nach Moderation zurück zur Musik
    if (playingModeration) {
        playingModeration = false;
        songsSinceLastMod = 0;
        nextSong();
        playMusic();
        return;
    }

    songsSinceLastMod++;
    const currentSong = music[musicIndex];
    const modTriggered = songsSinceLastMod >= MOD_EVERY_SONGS;

    if (modTriggered) {

        const special = getSpecial();
        if (special) return playModeration(special);

        const timed = getTimedModeration();
        if (timed) return playModeration(timed);

        const bezug = config.bezugModeration?.find(b => b.song === currentSong);
        if (bezug) return playModeration(bezug.file);

        if (config.fallbackModeration?.length) {
            const r = Math.floor(Math.random() * config.fallbackModeration.length);
            return playModeration(config.fallbackModeration[r]);
        }
    }

    nextSong();
    playMusic();
});

/********************
 * CONTROLS
 ********************/
document.getElementById("play").onclick = () => {
    if (!audio.src) {
        shuffleMusic();
        playMusic();
    } else audio.play();
};

document.getElementById("pause").onclick = () => audio.pause();

document.getElementById("stop").onclick = () => {
    audio.pause();
    audio.currentTime = 0;
};

document.getElementById("skip").onclick = () => {
    audio.dispatchEvent(new Event("ended"));
};

document.getElementById("volume").oninput = e => {
    audio.volume = e.target.value / 100;
};
