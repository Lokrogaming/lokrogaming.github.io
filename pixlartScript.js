const csvFile = document.getElementById("csvFile");

const materialTable =
    document.getElementById("materialTable");

const searchInput =
    document.getElementById("search");

const sortSelect =
    document.getElementById("sort");

const printButton =
    document.getElementById("printButton");


const totalItemsElement =
    document.getElementById("totalItems");

const totalStacksElement =
    document.getElementById("totalStacks");

const totalShulkersElement =
    document.getElementById("totalShulkers");

const totalChestsElement =
    document.getElementById("totalChests");

const completedCountElement =
    document.getElementById("completedCount");

const materialCountElement =
    document.getElementById("materialCount");

const progressPercentElement =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const fileNameElement =
    document.getElementById("fileName");

const fileStatusElement =
    document.getElementById("fileStatus");

const dimensionsElement =
    document.getElementById("dimensions");

const canvas =
    document.getElementById("pixelCanvas");

const ctx =
    canvas.getContext("2d");


/*
    Minecraft Lagergrößen

    1 Stack = 64 Items
    1 Shulker = 27 Slots
    1 Doppelkiste = 54 Slots
*/

const STACK_SIZE = 64;

const SHULKER_SLOTS = 27;

const CHEST_SLOTS = 54;

const SHULKER_SIZE =
    STACK_SIZE * SHULKER_SLOTS;

const CHEST_SIZE =
    STACK_SIZE * CHEST_SLOTS;


/*
    Daten
*/

let materials = [];

let pixelMatrix = [];

let completed = {};

let currentFileName = "";


/*
    Einige Minecraft-Farben

    Damit die Pixelart auch ohne Resourcepack
    ungefähr dargestellt werden kann.
*/

const blockColors = {

    "minecraft:redstone_block": "#8f0000",

    "minecraft:pink_concrete": "#e76e91",

    "minecraft:pink_terracotta": "#a24c55",

    "minecraft:white_wool": "#f4f4f4",

    "minecraft:prismarine_bricks": "#5f9c94",

    "minecraft:birch_wood": "#d8c38a",

    "minecraft:lime_terracotta": "#677d45",

    "minecraft:lime_concrete": "#72b72b",

    "minecraft:quartz_block": "#e8e3d8",

    "minecraft:emerald_block": "#17dd78",

    "minecraft:black_concrete": "#080a0a",

    "minecraft:white_concrete": "#d9d9d9",

    "minecraft:red_concrete": "#8f2525",

    "minecraft:green_concrete": "#4d7c45",

    "minecraft:blue_concrete": "#344e9a",

    "minecraft:yellow_concrete": "#f0c52e",

    "minecraft:orange_concrete": "#d96c1c",

    "minecraft:purple_concrete": "#762e9c",

    "minecraft:cyan_concrete": "#168c8c",

    "minecraft:light_blue_concrete": "#4e9bd6",

    "minecraft:gray_concrete": "#373b3d",

    "minecraft:light_gray_concrete": "#858585",

    "minecraft:brown_concrete": "#603b25",

    "minecraft:magenta_concrete": "#a62da5"

};


/*
    CSV-Datei laden
*/

csvFile.addEventListener(
    "change",
    handleFile
);


function handleFile(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    currentFileName =
        file.name;


    fileNameElement.textContent =
        file.name;


    const reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            parseCSV(e.target.result);

        } catch(error) {

            console.error(error);

            fileStatusElement.textContent =
                "❌ CSV konnte nicht gelesen werden";

            alert(
                "Die CSV-Datei konnte nicht verarbeitet werden."
            );

        }

    };


    reader.readAsText(file);

}


/*
    CSV Parser

    Unterstützt:
    - Kommas
    - Anführungszeichen
    - normale CSV-Dateien
*/

function parseCSV(text) {

    const rows =
        csvToRows(text);


    if (!rows.length) {

        throw new Error(
            "CSV ist leer"
        );

    }


    /*
        Deine CSV hat ungefähr diese Struktur:

        [leer] | 1 | 2 | 3 | 4 | ...
        1      | minecraft:block | ...
        2      | minecraft:block | ...
        ...
        " "    | block list
        " "    | minecraft:block | 123
        ...

        Deshalb suchen wir zuerst
        nach "block list".
    */


    let blockListRow = -1;


    for (
        let i = 0;
        i < rows.length;
        i++
    ) {

        const firstValues =
            rows[i]
                .map(x =>
                    String(x).trim().toLowerCase()
                );


        if (
            firstValues.includes("block list")
        ) {

            blockListRow = i;

            break;

        }

    }


    /*
        Pixelmatrix bestimmen
    */

    let matrixRows = [];


    if (blockListRow !== -1) {

        matrixRows =
            rows.slice(1, blockListRow);

    } else {

        /*
            Falls eine CSV ohne
            Blockliste verwendet wird,
            versuchen wir alle Zeilen
            mit minecraft:-Einträgen
            zu erkennen.
        */

        matrixRows =
            rows.slice(1);

    }


    /*
        Nur tatsächliche Pixelzeilen
    */

    const cleanMatrix =
        [];


    for (const row of matrixRows) {

        const blocks =
            row
                .slice(1)
                .filter(value =>
                    isMinecraftBlock(value)
                );


        if (blocks.length > 0) {

            cleanMatrix.push(blocks);

        }

    }


    pixelMatrix =
        cleanMatrix;


    /*
        Materialien direkt aus der Pixelmatrix zählen.

        Das ist absichtlich zuverlässiger als
        die Blockliste am Ende der CSV.
    */

    const counts =
        new Map();


    for (const row of pixelMatrix) {

        for (const block of row) {

            const name =
                block.trim();


            if (!isMinecraftBlock(name)) {
                continue;
            }


            counts.set(
                name,
                (counts.get(name) || 0) + 1
            );

        }

    }


    materials =
        Array.from(counts.entries())
            .map(([name, amount]) => ({
                name,
                amount
            }));


    /*
        Gespeicherten Fortschritt laden
    */

    loadProgress();


    /*
        UI aktualisieren
    */

    updateAll();


    /*
        Pixelart anzeigen
    */

    drawPixelArt();


    /*
        Status
    */

    fileStatusElement.textContent =
        "✅ CSV erfolgreich geladen";


    dimensionsElement.textContent =
        `${getWidth()} × ${getHeight()} Pixel | ${materials.length} Blockarten`;

}


/*
    Erkennen eines Minecraft-Blocks
*/

function isMinecraftBlock(value) {

    if (value === null || value === undefined) {
        return false;
    }


    const string =
        String(value).trim();


    return string.startsWith(
        "minecraft:"
    );

}


/*
    CSV zu Arrays
*/

function csvToRows(text) {

    const rows = [];

    let row = [];

    let cell = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        if (char === '"') {

            if (
                insideQuotes &&
                next === '"'
            ) {

                cell += '"';

                i++;

            } else {

                insideQuotes =
                    !insideQuotes;

            }

            continue;

        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(cell);

            cell = "";

            continue;

        }


        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(cell);

            cell = "";


            if (
                row.some(
                    value =>
                        value.trim() !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            continue;

        }


        cell += char;

    }


    if (cell !== "" || row.length) {

        row.push(cell);

        rows.push(row);

    }


    return rows;

}


/*
    Pixelart Größe
*/

function getWidth() {

    if (!pixelMatrix.length) {
        return 0;
    }


    return Math.max(
        ...pixelMatrix.map(
            row => row.length
        )
    );

}


function getHeight() {

    return pixelMatrix.length;

}


/*
    Pixelart zeichnen
*/

function drawPixelArt() {

    if (!pixelMatrix.length) {
        return;
    }


    const width =
        getWidth();

    const height =
        getHeight();


    /*
        Bei sehr großen Pixelarts
        werden einzelne Pixel zunächst
        klein dargestellt.
    */

    const maxCanvasWidth = 1200;

    const pixelSize =
        Math.max(
            1,
            Math.floor(
                maxCanvasWidth / width
            )
        );


    canvas.width =
        width * pixelSize;

    canvas.height =
        height * pixelSize;


    ctx.imageSmoothingEnabled =
        false;


    /*
        Hintergrund
    */

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (
        let y = 0;
        y < height;
        y++
    ) {

        const row =
            pixelMatrix[y];


        for (
            let x = 0;
            x < width;
            x++
        ) {

            const block =
                row[x];


            if (
                !isMinecraftBlock(block)
            ) {

                continue;

            }


            ctx.fillStyle =
                getBlockColor(block);


            ctx.fillRect(
                x * pixelSize,
                y * pixelSize,
                pixelSize,
                pixelSize
            );

        }

    }

}


/*
    Blockfarbe

    Unbekannte Blöcke bekommen
    eine neutrale Farbe.
*/

function getBlockColor(block) {

    if (
        blockColors[block]
    ) {

        return blockColors[block];

    }


    /*
        Fallback anhand des Blocknamens
    */

    if (
        block.includes("white")
    ) return "#eeeeee";


    if (
        block.includes("black")
    ) return "#111111";


    if (
        block.includes("red")
    ) return "#a52a2a";


    if (
        block.includes("pink")
    ) return "#e78ca3";


    if (
        block.includes("green") ||
        block.includes("lime")
    ) return "#6fae3b";


    if (
        block.includes("blue")
    ) return "#3f65a8";


    if (
        block.includes("yellow")
    ) return "#e4c43a";


    if (
        block.includes("orange")
    ) return "#d77b2d";


    if (
        block.includes("purple")
    ) return "#824aa8";


    if (
        block.includes("gray") ||
        block.includes("grey")
    ) return "#777";


    return "#777";

}


/*
    Materialliste rendern
*/

function renderMaterials() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    let list =
        [...materials];


    /*
        Suche
    */

    if (search) {

        list =
            list.filter(material =>
                material.name
                    .toLowerCase()
                    .includes(search)
            );

    }


    /*
        Sortierung
    */

    const sort =
        sortSelect.value;


    if (sort === "amount-desc") {

        list.sort(
            (a, b) =>
                b.amount - a.amount
        );

    }


    if (sort === "amount-asc") {

        list.sort(
            (a, b) =>
                a.amount - b.amount
        );

    }


    if (sort === "name-asc") {

        list.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    if (sort === "name-desc") {

        list.sort(
            (a, b) =>
                b.name.localeCompare(
                    a.name
                )
        );

    }


    if (sort === "unchecked") {

        list.sort(
            (a, b) =>
                Number(
                    isCompleted(a.name)
                ) -
                Number(
                    isCompleted(b.name)
                )
        );

    }


    if (sort === "checked") {

        list.sort(
            (a, b) =>
                Number(
                    isCompleted(b.name)
                ) -
                Number(
                    isCompleted(a.name)
                )
        );

    }


    materialTable.innerHTML = "";


    for (const material of list) {

        const row =
            document.createElement("tr");


        if (
            isCompleted(material.name)
        ) {

            row.classList.add(
                "completed"
            );

        }


        const stacks =
            Math.ceil(
                material.amount /
                STACK_SIZE
            );


        const shulkers =
            Math.ceil(
                material.amount /
                SHULKER_SIZE
            );


        const chests =
            Math.ceil(
                material.amount /
                CHEST_SIZE
            );


        row.innerHTML = `

            <td class="check-column">

                <input
                    type="checkbox"
                    ${isCompleted(material.name) ? "checked" : ""}
                >

            </td>


            <td>

                <span class="block-name">
                    ${escapeHTML(material.name)}
                </span>

            </td>


            <td class="number">

                ${formatNumber(material.amount)}

            </td>


            <td class="number">

                ${formatNumber(stacks)}

            </td>


            <td>

                <span class="badge">
                    ${formatNumber(shulkers)}
                </span>

            </td>


            <td>

                <span class="badge">
                    ${formatNumber(chests)}
                </span>

            </td>

        `;


        const checkbox =
            row.querySelector(
                "input[type=checkbox]"
            );


        checkbox.addEventListener(
            "change",
            () => {

                setCompleted(
                    material.name,
                    checkbox.checked
                );


                row.classList.toggle(
                    "completed",
                    checkbox.checked
                );


                updateProgress();

                saveProgress();

            }
        );


        materialTable.appendChild(row);

    }

}


/*
    Gesamtstatistik

    Wichtig:

    Die Gesamtanzahl der Shulkerkisten
    wird aus ALLEN Items berechnet.

    Dadurch werden nicht pro Material
    einzelne Kisten aufgerundet.
*/

function updateStatistics() {

    const total =
        materials.reduce(
            (sum, material) =>
                sum + material.amount,
            0
        );


    const stacks =
        Math.ceil(
            total / STACK_SIZE
        );


    const shulkers =
        Math.ceil(
            total / SHULKER_SIZE
        );


    const chests =
        Math.ceil(
            total / CHEST_SIZE
        );


    totalItemsElement.textContent =
        formatNumber(total);


    totalStacksElement.textContent =
        formatNumber(stacks);


    totalShulkersElement.textContent =
        formatNumber(shulkers);


    totalChestsElement.textContent =
        formatNumber(chests);


    materialCountElement.textContent =
        materials.length;

}


/*
    Fortschritt

    Hier wird nach Materialarten gezählt,
    nicht nach einzelnen Blöcken.

    Beispiel:

    White Wool erledigt
    = 1 von 10 Materialien
*/

function updateProgress() {

    const total =
        materials.length;


    const completedCount =
        materials.filter(
            material =>
                isCompleted(
                    material.name
                )
        ).length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                completedCount /
                total *
                100
            );


    completedCountElement.textContent =
        completedCount;


    progressPercentElement.textContent =
        `${percent}%`;


    progressFill.style.width =
        `${percent}%`;

}


/*
    Alles aktualisieren
*/

function updateAll() {

    updateStatistics();

    renderMaterials();

    updateProgress();

}


/*
    Checkbox Status
*/

function isCompleted(name) {

    return completed[name] === true;

}


function setCompleted(
    name,
    value
) {

    completed[name] =
        value;

}


/*
    LocalStorage
*/

function saveProgress() {

    if (!currentFileName) {
        return;
    }


    const key =
        "minecraft-pixelart-progress-" +
        currentFileName;


    localStorage.setItem(
        key,
        JSON.stringify(completed)
    );

}


function loadProgress() {

    completed = {};


    if (!currentFileName) {
        return;
    }


    const key =
        "minecraft-pixelart-progress-" +
        currentFileName;


    const saved =
        localStorage.getItem(key);


    if (!saved) {
        return;
    }


    try {

        completed =
            JSON.parse(saved) || {};

    } catch {

        completed = {};

    }

}


/*
    Suche
*/

searchInput.addEventListener(
    "input",
    renderMaterials
);


/*
    Sortierung
*/

sortSelect.addEventListener(
    "change",
    renderMaterials
);


/*
    Drucken
*/

printButton.addEventListener(
    "click",
    () => {

        window.print();

    }
);


/*
    Zahlen formatieren
*/

function formatNumber(number) {

    return Number(
        number
    ).toLocaleString(
        "de-DE"
    );

}


/*
    HTML Escaping
*/

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/*
    Wenn noch keine CSV geladen wurde,
    leere Tabelle anzeigen.
*/

updateAll();