/* ==========================================================================
   UTL. WSPOLNE FUNKCJE POMOCNICZE
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- UTL.1. setText (oryginalna linia 447) ----- */
/* ==========================================================
   HELPERS
   ========================================================== */

function setText(id,value){

    const el =
        document.getElementById(id);

    if(el){

        el.innerText =
            value;

    }

}

/* ----- UTL.2. crmToast (oryginalna linia 4001) ----- */
function crmToast(message, type) {
    crmEnsureUiLayer();
    const item = document.createElement("div");
    const ok = type !== "error";
    item.style.cssText = `padding:13px 16px;border-radius:10px;color:#fff;background:${ok ? "#2e7d32" : "#b3261e"};box-shadow:0 6px 22px rgba(0,0,0,.2);font-weight:600`;
    item.textContent = (ok ? "✓ " : "⚠ ") + message;
    document.getElementById("crm-toast-container").appendChild(item);
    setTimeout(() => item.remove(), ok ? 3500 : 6500);
}

/* ----- UTL.3. crmConfirm (oryginalna linia 4010) ----- */
function crmConfirm(message, confirmText) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px";
        overlay.innerHTML = `<div style="background:#fff;border-radius:14px;padding:22px;max-width:430px;width:100%;box-shadow:0 12px 44px rgba(0,0,0,.28)"><h3 style="margin:0 0 12px">Potwierdzenie</h3><p style="margin:0 0 20px;line-height:1.45"></p><div style="display:flex;justify-content:flex-end;gap:10px"><button type="button" data-no>Wróć</button><button type="button" class="btn-primary" data-yes></button></div></div>`;
        overlay.querySelector("p").textContent = message;
        overlay.querySelector("[data-yes]").textContent = confirmText || "Potwierdź";
        overlay.querySelector("[data-no]").onclick = () => { overlay.remove(); resolve(false); };
        overlay.querySelector("[data-yes]").onclick = () => { overlay.remove(); resolve(true); };
        document.body.appendChild(overlay);
    });
}

/* ----- UTL.4. crmV3NormalizeStatus (oryginalna linia 5583) ----- */
function crmV3NormalizeStatus(item) {
    const raw = String(item?.crmStatus || item?.status || item?.bookingStatus || "CONFIRMED")
        .trim().toUpperCase();
    const map = {
        "POTWIERDZONA":"CONFIRMED", "POTWIERDZONO":"CONFIRMED", "CONFIRMED":"CONFIRMED",
        "OCZEKUJE":"PENDING", "OCZEKUJE_POTWIERDZENIA":"PENDING", "PENDING":"PENDING",
        "TERMIN_ALTERNATYWNY":"ALTERNATIVE", "ALTERNATIVE":"ALTERNATIVE",
        "WYMAGA_KONTAKTU":"CONTACT", "CONTACT":"CONTACT",
        "ANULOWANA_PRZEZ_KLIENTA":"CANCELLED_CLIENT", "CANCELLED_CLIENT":"CANCELLED_CLIENT",
        "ANULOWANA_PRZEZ_SALON":"CANCELLED_SALON", "CANCELLED_SALON":"CANCELLED_SALON",
        "ZREALIZOWANA":"COMPLETED", "COMPLETED":"COMPLETED"
    };
    return map[raw] || "CONFIRMED";
}

/* ----- UTL.5. crmEscapePanelValue (oryginalna linia 5692) ----- */
/* KONIEC ADMIN V3 */


/* ==========================================================
   ADMIN V4: NOWY PANEL WIZYTY BOOKSY WORKSPACE
   ========================================================== */
function crmEscapePanelValue(value, fallback) {
    const text = String(value ?? "").trim();
    return text || (fallback || "—");
}

/* ----- UTL.6. crmSafeText (oryginalna linia 6092) ----- */
function crmSafeText(value) {
    return String(value ?? "").replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
}

/* ----- UTL.7. crmHexToRgb (oryginalna linia 6095) ----- */
function crmHexToRgb(hex) {
    const value = String(hex || "").trim();
    const short = value.match(/^#([0-9a-f]{3})$/i);
    const full = value.match(/^#([0-9a-f]{6})$/i);
    if (short) return short[1].split("").map(x => parseInt(x+x,16));
    if (full) return [parseInt(full[1].slice(0,2),16),parseInt(full[1].slice(2,4),16),parseInt(full[1].slice(4,6),16)];
    return [187,111,143];
}

/* ----- UTL.8. crmEscapeText (oryginalna linia 6470) ----- */
function crmEscapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[char]);
}

/* ----- UTL.9. crmHexToSoftBackground (oryginalna linia 6511) ----- */
function crmHexToSoftBackground(color) {
    const source = String(color || "#b05c75").trim();
    const match = source.match(/^#([0-9a-f]{6})$/i);
    if (!match) return "rgba(176,92,117,.13)";
    const number = parseInt(match[1], 16);
    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;
    return `rgba(${r},${g},${b},.14)`;
}

/* ========================================================================== 
   ADMIN FINAL 2026-08-04: STAN FORMULARZY I BEZPIECZNE OPERACJE
   ========================================================================== */
let crmHasUnsavedChanges = false;
let crmActiveFormContext = "";
const crmBusyOperations = new Set();
function crmSetUnsavedChanges(value, context) {
  crmHasUnsavedChanges = Boolean(value);
  crmActiveFormContext = crmHasUnsavedChanges ? String(context || crmActiveFormContext || "formularz") : "";
  document.body.classList.toggle("crm-has-unsaved-changes", crmHasUnsavedChanges);
}
function crmOperationStart(key) { const k=String(key||"default"); if(crmBusyOperations.has(k)) return false; crmBusyOperations.add(k); return true; }
function crmOperationEnd(key) { crmBusyOperations.delete(String(key||"default")); }
async function crmConfirmUnsavedNavigation() {
  if(!crmHasUnsavedChanges) return true;
  return crmConfirm("Masz niezapisane zmiany w: " + (crmActiveFormContext||"formularzu") + ". Odrzucić zmiany?", "Odrzuć zmiany");
}
document.addEventListener("input", event => {
  if(event.target.closest("#appointmentModal,#clientModal,#serviceModal,#blockTimeModal")) crmSetUnsavedChanges(true, "aktywnym formularzu");
}, true);
window.addEventListener("beforeunload", event => { if(crmHasUnsavedChanges){ event.preventDefault(); event.returnValue=""; } });
/* KONIEC ADMIN FINAL: STAN FORMULARZY */
