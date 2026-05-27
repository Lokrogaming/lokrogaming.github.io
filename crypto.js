const textToBytes = (text) => new TextEncoder().encode(text);
const bytesToText = (bytes) => new TextDecoder().decode(bytes);

async function importKey(keyStr) {
    return await crypto.subtle.importKey(
        "raw",
        textToBytes(keyStr),
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

async function aesEncrypt(rawText, keyStr) {
    const key = await importKey(keyStr);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        textToBytes(rawText)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
}

async function aesDecrypt(base64Str, keyStr) {
    const key = await importKey(keyStr);
    const combined = new Uint8Array(atob(base64Str).split("").map(c => c.charCodeAt(0)));
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
    );
    return bytesToText(decrypted);
}

function shuffleData(keyStr, encryptedBody) {
    let shuffledPart = "";
    let keyIdx = 0;
    let bodyIdx = 0;

    while (keyIdx < keyStr.length) {
        shuffledPart += keyStr.substring(keyIdx, keyIdx + 2);
        keyIdx += 2;

        if (bodyIdx < encryptedBody.length) {
            shuffledPart += encryptedBody.substring(bodyIdx, bodyIdx + 4);
            bodyIdx += 4;
        } else {
            shuffledPart += "...."; 
        }
    }

    if (bodyIdx < encryptedBody.length) {
        shuffledPart += encryptedBody.substring(bodyIdx);
    }

    return shuffledPart;
}

function unshuffleData(shuffledPart) {
    let keyStr = "";
    let encryptedBody = "";
    
    let idx = 0;
    const totalKeyParts = 16; 
    let keyPartsRead = 0;

    while (keyPartsRead < totalKeyParts && idx < shuffledPart.length) {
        keyStr += shuffledPart.substring(idx, idx + 2);
        idx += 2;
        keyPartsRead++;

        const bodyPart = shuffledPart.substring(idx, idx + 4);
        if (bodyPart !== "....") {
            encryptedBody += bodyPart;
        }
        idx += 4;
    }

    if (idx < shuffledPart.length) {
        encryptedBody += shuffledPart.substring(idx);
    }

    return { keyStr, encryptedBody };
}

function generateRandomConfig() {
    const buffer = new Uint8Array(2);
    crypto.getRandomValues(buffer);
    return String.fromCharCode(
        (buffer[0] % 94) + 33, 
        (buffer[1] % 94) + 33
    );
}

/**
 * Interne Funktion zur Key-Generierung (a-zA-Z0-9)
 */
function generateRandomKey() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    
    let key = "";
    for (let i = 0; i < 32; i++) {
        key += chars[buffer[i] % chars.length];
    }
    return key;
}

/**
 * Verschlüsselt Text und formatiert das Ergebnis zu [config][geshuffelter-teil]
 * Der 32-stellige Key wird hierbei vollautomatisch intern generiert.
 * @param {string} text - Der zu verschlüsselnde Klartext
 * @returns {Promise<string>}
 */
export async function encoder(text) {
    const randomKey = generateRandomKey();
    const config = generateRandomConfig();
    const encryptedBody = await aesEncrypt(text, randomKey);
    return `${config}${shuffleData(randomKey, encryptedBody)}`;
}

/**
 * Entschlüsselt einen String im Format [config-block][geshuffelter-teil]
 * Extrahiert Config, Key und Krypto-Text selbstständig aus der Struktur.
 * @param {string} fullEncryptedStr - Der komplette verschlüsselte String
 * @returns {Promise<{config: string, text: string, extractedKey: string}>}
 */
export async function decoder(fullEncryptedStr) {
    const config = fullEncryptedStr.substring(0, 2);
    const shuffledPart = fullEncryptedStr.substring(2);
    const { keyStr, encryptedBody } = unshuffleData(shuffledPart);
    const decryptedText = await aesDecrypt(encryptedBody, keyStr);
    return { config, text: decryptedText, extractedKey: keyStr };
}
