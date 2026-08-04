/* ==========================================================================
   API. KOMUNIKACJA Z GOOGLE APPS SCRIPT
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- API.1. APPS_SCRIPT_URL (oryginalna linia 12) ----- */
/* ==========================================================
   NAIL-ART DARIA CRM V2
   ADMIN.JS
   CORE
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzrx1vRCQpx45lPEnPvF-LJpkpAiLqPmME60VIq2A0_YDF4figLOF2uO8griaC6ijYpOQ/exec";

/* ----- API.2. loadSystem (oryginalna linia 3203) ----- */
/* ==========================================================
   LOAD SYSTEM EXTENSION
   ========================================================== */
async function loadSystem() {

    await loadServices();

    await loadSettings();

    await loadClients();

    renderDashboard();

    calculateFinanceReport();

    buildColorsEditor();

}

/* ----- API.3. crmExtendedPost (oryginalna linia 3625) ----- */
async function crmExtendedPost(action, payload) {
    return crmTestPost(Object.assign({ action: action }, payload || {}));
}

/* ----- API.4. crmTestPost (oryginalna linia 4889) ----- */
async function crmTestPost(payload) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
    });
    const text = await response.text();
    if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);
    try { return JSON.parse(text); }
    catch (error) { throw new Error("API nie zwrocilo JSON: " + text.substring(0, 500)); }
}

/* ----- API.5. crmPost: zgodny punkt wejscia dla starszych modulow ----- */
async function crmPost(payload) {
    const result = await crmTestPost(payload || {});
    if (!result || typeof result !== "object") {
        throw new Error("API zwrocilo nieprawidlowa odpowiedz");
    }
    return result;
}

