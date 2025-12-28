const music = [
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
    "music/56122be3-d9cc-4e7a-ae74-130ca59d93d8.mp3"
];


let config;
fetch("config.json")
    .then(res => res.json())
    .then(data => config = data);

const audio = new Audio();
audio.volume = 0.7;

let musicIndex = 0;
let songsPlayed = 0;
let playingModeration = false;

// Für Timed-Mod: tracken, welche Stunden schon gespielt wurden
let timedPlayedToday = [];

const status = document.getElementById("status");
const volume = document.getElementById("volume");

function playMusic() {
    audio.src = music[musicIndex];
    status.textContent = "🎵 Musik läuft";
    audio.play();
}

function playModeration(file) {
    audio.src = file;
    status.textContent = "🎙 Moderation";
    playingModeration = true;
    audio.play();
}

// Reset Timed-Mod Tracker täglich um Mitternacht
function checkResetTimed() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    if (timedPlayedToday.lastReset !== dateStr) {
        timedPlayedToday = { lastReset: dateStr, hours: [] };
    }
}

function checkTimedModeration() {
    checkResetTimed();
    const now = new Date();
    const hour = now.getHours();

    // schon gespielt?
    if (timedPlayedToday.hours.includes(hour)) return null;

    const entry = config?.timedModeration?.find(t => t.hour === hour);
    if (entry && entry.files?.length > 0) {
        const randomIndex = Math.floor(Math.random() * entry.files.length);
        timedPlayedToday.hours.push(hour);
        return entry.files[randomIndex];
    }
    return null;
}

function checkSpecials() {
    const now = new Date();
    const dateStr = `${String(now.getMonth() + 1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    return config?.specials?.find(s => s.date === dateStr)?.file;
}

audio.addEventListener("ended", () => {
    if (playingModeration) {
        playingModeration = false;
        playMusic();
        return;
    }

    songsPlayed++;
    const currentSong = music[musicIndex];

    // Specials zuerst
    const specialFile = checkSpecials();
    if (specialFile) {
        playModeration(specialFile);
        return;
    }

    // Timed Moderation zufällig, max 1x pro Tag
    const timedFile = checkTimedModeration();
    if (timedFile) {
        playModeration(timedFile);
        return;
    }

    // Bezug-Mod
    const bezug = config?.bezugModeration.find(b => b.song === currentSong);
    if (bezug && songsPlayed % 3 === 0) {
        playModeration(bezug.file);
        return;
    }

    // Fallback
    if (songsPlayed % 3 === 0 && config?.fallbackModeration?.length > 0) {
        const random = Math.floor(Math.random() * config.fallbackModeration.length);
        playModeration(config.fallbackModeration[random]);
        return;
    }

    // Normaler Ablauf
    musicIndex = (musicIndex + 1) % music.length;
    playMusic();
});

/* Controls */
document.getElementById("play").onclick = () => {
    if (!audio.src) playMusic();
    else audio.play();
};
document.getElementById("pause").onclick = () => audio.pause();
document.getElementById("stop").onclick = () => {
    audio.pause();
    audio.currentTime = 0;
};
document.getElementById("skip").onclick = () => audio.dispatchEvent(new Event("ended"));

volume.oninput = () => {
    audio.volume = volume.value / 100;
};
