
/* ==========================================================================
   NAIL-ART DEV V5 — REAL ADMIN EDITOR + PHYSICAL SAVE
   DEV ładuje dokładnie te same CSS/JS/DOM co ADMIN.
   Ten plik jest tylko narzędziem edycyjnym na wierzchu.
   ========================================================================== */

(() => {
    "use strict";

    const LEGACY_STORAGE_KEY = "nailArtDevLayoutV4";
    const SYNC_KEY_STORAGE = "nailArtDevSyncKeyV5";
    const STYLE_ID = "crmDevLayoutStyleV5";
    const EDITOR_ID = "crmDevEditorV4"; /* ID zostaje dla zgodności z dev.css */
    const MANAGED_START = "/* ===== NAIL-ART DEV V5 MANAGED LAYOUT START ===== */";
    const MANAGED_END = "/* ===== NAIL-ART DEV V5 MANAGED LAYOUT END ===== */";
    const FALLBACK_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrx1vRCQpx45lPEnPvF-LJpkpAiLqPmME60VIq2A0_YDF4figLOF2uO8griaC6ijYpOQ/exec";
    let localAdminFileHandle = null;

    const PANELS = [
        {
            key: "detailsAppointment",
            name: "Szczegóły — wizyta CRM",
            panel: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="appointment"]',
            close: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="appointment"] .crm-safe-header > .crm-safe-close',
            minus: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="appointment"] #crmVisitDetailsMinimizeV25217',
            headerText: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="appointment"] .crm-safe-status-copy',
            statusButton: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="appointment"] #crmVisitStatusButton',
            dark: true,
            supportsHeaderText: true,
            supportsStatusButton: true,
            open: () => {
                const sample = {
                    eventType: "appointment",
                    eventId: "DEV-V4-DEMO-APPOINTMENT",
                    name: "Jan Kowalski",
                    phone: "48123456789",
                    service: "Manicure z pielęgnacją i kolorem",
                    duration: 60,
                    date: new Date().toISOString(),
                    crmStatus: "COMPLETED",
                    status: "COMPLETED",
                    bookingSource: "FORM_FIRST",
                    source: "FORM_FIRST"
                };
                if (typeof openAppointmentDetailsModal === "function") {
                    openAppointmentDetailsModal(sample);
                }
            }
        },
        {
            key: "detailsBlock",
            name: "Szczegóły — blokada czasu",
            panel: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="block"]',
            close: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="block"] .crm-safe-header > .crm-safe-close',
            minus: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="block"] #crmVisitDetailsMinimizeV25217',
            headerText: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="block"] .crm-safe-status-copy',
            dark: true,
            supportsHeaderText: true,
            supportsStatusButton: false,
            open: () => {
                const sample = {
                    eventType: "block",
                    eventId: "DEV-V4-DEMO-BLOCK",
                    name: "Zablokowane",
                    phone: "",
                    service: "Blokada czasu",
                    duration: 60,
                    date: new Date().toISOString(),
                    source: "ADMIN",
                    color: "#8c6b4f"
                };
                if (typeof openAppointmentDetailsModal === "function") {
                    openAppointmentDetailsModal(sample);
                }
            }
        },
        {
            key: "detailsExternal",
            name: "Szczegóły — Google",
            panel: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="external"]',
            close: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="external"] .crm-safe-header > .crm-safe-close',
            minus: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="external"] #crmVisitDetailsMinimizeV25217',
            headerText: '#appointmentDetailsModal.crm-safe-visit-panel[data-crm-event-type="external"] .crm-safe-status-copy',
            dark: true,
            supportsHeaderText: true,
            supportsStatusButton: false,
            open: () => {
                const sample = {
                    eventType: "external",
                    eventId: "DEV-V4-DEMO-GOOGLE",
                    name: "Wydarzenie Google",
                    phone: "Google Calendar",
                    service: "",
                    duration: 45,
                    date: new Date().toISOString(),
                    source: "GOOGLE CALENDAR",
                    color: "#777777"
                };
                if (typeof openAppointmentDetailsModal === "function") {
                    openAppointmentDetailsModal(sample);
                }
            }
        },
        {
            key: "appointment",
            name: "Dodaj wizytę",
            panel: "#appointmentModal .modal-content",
            close: "#appointmentModal .modal-header > .modal-close",
            minus: "#appointmentModal #crmAppointmentMinimizeBtnV7",
            open: () => typeof openCreateModal === "function" && openCreateModal()
        },
        {
            key: "block",
            name: "Zablokuj czas",
            panel: "#blockTimeModal .modal-content",
            close: "#blockTimeModal .modal-header > .modal-close",
            minus: "#blockTimeModal #crmBlockTimeMinimizeBtnV172",
            open: () => typeof openBlockTimeModal === "function" && openBlockTimeModal()
        },
        {
            key: "dayVisits",
            name: "Wszystkie wizyty",
            panel: "#crmDayVisitsOverlay .crm-day-list-panel",
            close: "#crmDayVisitsOverlay .crm-day-list-close",
            minus: "#crmDayVisitsOverlay #crmDayVisitsMinimizeV25217",
            open: () => {
                if (typeof crmOpenDayVisitsList === "function") {
                    let date = new Date();
                    try {
                        if (typeof selectedDate !== "undefined" && selectedDate) {
                            date = new Date(selectedDate);
                        }
                    } catch (_) {}
                    crmOpenDayVisitsList(date);
                }
            }
        },
        {
            key: "inbox",
            name: "Skrzynka",
            panel: "#crmUnifiedInboxModal .crm-day-list-panel",
            close: "#crmUnifiedInboxModal #crmUnifiedInboxClose",
            minus: "#crmUnifiedInboxModal #crmInboxMinimizeV25217",
            open: async () => {
                if (typeof crmOpenUnifiedInbox === "function") {
                    await crmOpenUnifiedInbox();
                }
            }
        },
        {
            key: "client",
            name: "Klient",
            panel: "#clientModal .modal-content",
            close: "#clientModal .modal-header > .modal-close",
            minus: "#clientModal .crm-utility-minimize-v2525",
            open: () => typeof openAddClientModal === "function" && openAddClientModal()
        },
        {
            key: "service",
            name: "Usługa",
            panel: "#serviceModal .modal-content",
            close: "#serviceModal .modal-header > .modal-close",
            minus: "#serviceModal .crm-utility-minimize-v2525",
            open: () => typeof openAddServiceModal === "function" && openAddServiceModal()
        },
        {
            key: "category",
            name: "Kategoria",
            panel: "#categoryModal .modal-content",
            close: "#categoryModal .modal-header > .modal-close",
            minus: "#categoryModal .crm-utility-minimize-v2525",
            open: () => typeof openCategoryModal === "function" && openCategoryModal()
        },
        {
            key: "contactConfirm",
            name: "Dane klienta",
            panel: "#crmContactDataConfirmModalV2 > section",
            close: "#crmContactDataConfirmModalV2 [data-close]",
            minus: "#crmContactDataConfirmModalV2 .crm-utility-minimize-v2525",
            open: () => {
                const demo = {
                    id: "DEV-V4",
                    name: "Anna Nowak",
                    phone: "48123456789",
                    message: "Podgląd DEV — dane przykładowe."
                };

                if (typeof crmConfirmContactDataV2 === "function") {
                    crmConfirmContactDataV2(demo);
                } else if (typeof crmEnsureContactDataConfirmModalV2 === "function") {
                    const modal = crmEnsureContactDataConfirmModalV2();
                    if (modal) modal.style.display = "flex";
                }
            }
        }
    ];

    let state = {};
    let selectedKey = "detailsAppointment";
    let dirty = false;

    function num(value, fallback = 0) {
        const n = Number.parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function px(value) {
        return `${Math.round(num(value) * 100) / 100}px`;
    }

    function getPanelConfig(key = selectedKey) {
        return PANELS.find(item => item.key === key) || PANELS[0];
    }

    function el(selector) {
        try {
            return document.querySelector(selector);
        } catch (_) {
            return null;
        }
    }

    function computedNumber(node, property, fallback = 0, pseudo = null) {
        if (!node) return fallback;
        try {
            const style = getComputedStyle(node, pseudo);
            const value = style.getPropertyValue(property);
            return num(value, fallback);
        } catch (_) {
            return fallback;
        }
    }

    function computedTranslate(node) {
        if (!node) return [0, 0];
        try {
            const raw = String(getComputedStyle(node).translate || "").trim();
            if (!raw || raw === "none") return [0, 0];
            const parts = raw.split(/\s+/);
            const toPx = value => {
                const match = String(value || "").match(/^(-?\d+(?:\.\d+)?)px$/i);
                return match ? num(match[1], 0) : 0;
            };
            return [toPx(parts[0]), toPx(parts[1] || "0px")];
        } catch (_) {
            return [0, 0];
        }
    }

    function appsScriptUrl() {
        try {
            return typeof APPS_SCRIPT_URL !== "undefined" && APPS_SCRIPT_URL
                ? APPS_SCRIPT_URL
                : FALLBACK_APPS_SCRIPT_URL;
        } catch (_) {
            return FALLBACK_APPS_SCRIPT_URL;
        }
    }

    function runtimeMode() {
        const host = String(location.hostname || "").toLowerCase();
        if (host === "127.0.0.1" || host === "localhost") return "local-bridge";
        if (location.protocol === "file:") return "local-file";
        /* GitHub Pages dziś, ewentualna własna domena później. */
        if (location.protocol === "https:" || location.protocol === "http:") return "github";
        return "local-file";
    }

    function runtimeLabel() {
        const mode = runtimeMode();
        if (mode === "github") return "GITHUB — zapis bezpośrednio do repozytorium";
        if (mode === "local-bridge") return "LOCAL — zapis fizyczny do pliku przez lokalny helper";
        return "LOCAL — zapis fizyczny do wybranego styleadmin-overrides.css";
    }

    function defaultPanelState(config) {
        const panel = el(config.panel);
        const close = el(config.close);
        const minus = el(config.minus);

        const width = panel
            ? Math.round(panel.getBoundingClientRect().width || computedNumber(panel, "width", 320))
            : 320;

        const maxHeight = panel
            ? Math.round(panel.getBoundingClientRect().height || 560)
            : 560;

        const [panelX, panelY] = computedTranslate(panel);
        const [closeX, closeY] = computedTranslate(close);
        const [minusX, minusY] = computedTranslate(minus);
        const headerTextNode = config.headerText ? el(config.headerText) : null;
        const statusButtonNode = config.statusButton ? el(config.statusButton) : null;
        const [headerTextX, headerTextY] = computedTranslate(headerTextNode);
        const [statusButtonX, statusButtonY] = computedTranslate(statusButtonNode);

        const closeSize = Math.max(
            8,
            Math.round(
                computedNumber(close, "width", 13, "::before") ||
                computedNumber(close, "font-size", 13, "::before") ||
                13
            )
        );

        const closeStroke = Math.max(
            1,
            computedNumber(close, "height", 2, "::before") || 2
        );

        const minusWidth = Math.max(
            8,
            Math.round(computedNumber(minus, "width", 14, "::before") || 14)
        );

        const minusStroke = Math.max(
            1,
            computedNumber(minus, "height", 2.25, "::before") || 2.25
        );

        return {
            width,
            height: maxHeight,
            panelX,
            panelY,
            closeX,
            closeY,
            closeSize,
            closeStroke,
            minusX,
            minusY,
            minusWidth,
            minusStroke,

            /* Prawdziwy blok nagłówka:
               ZREALIZOWANA / POTWIERDZONA / Szczegóły blokady / wydarzenie Google. */
            headerTextX,
            headerTextY,

            /* Tylko wariant wizyty CRM. */
            statusButtonX,
            statusButtonY
        };
    }

    function ensureState(key) {
        const config = getPanelConfig(key);
        const defaults = defaultPanelState(config);

        /*
         * Migracja z poprzedniego DEV V5:
         * stary wspólny "details" staje się bazą dla trzech prawdziwych wariantów.
         */
        if (
            !state[key] &&
            (key === "detailsAppointment" || key === "detailsBlock" || key === "detailsExternal") &&
            state.details
        ) {
            state[key] = { ...state.details };
        }

        if (!state[key]) {
            state[key] = defaults;
            return state[key];
        }

        const old = state[key];
        state[key] = {
            ...defaults,
            ...old
        };

        if (
            key === "detailsAppointment" &&
            old.statusButtonX === undefined &&
            old.completedStatusButtonX !== undefined
        ) {
            state[key].statusButtonX = num(old.completedStatusButtonX, 0);
        }

        return state[key];
    }

    function colorFor(config) {
        return config.dark ? "#ffffff" : "#81737a";
    }

    function cssForPanel(config, values) {
        const color = colorFor(config);

        return `
/* ${config.name} — DEV V5 / PRAWDZIWY DOM */
${config.panel} {
    width: ${px(values.width)} !important;
    translate: ${px(values.panelX)} ${px(values.panelY)} !important;
}

${config.close} {
    position: relative !important;
    translate: ${px(values.closeX)} ${px(values.closeY)} !important;
    color: transparent !important;
    font-size: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
}

${config.close}::before,
${config.close}::after {
    content: "" !important;
    display: block !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    width: ${px(values.closeSize)} !important;
    height: ${px(values.closeStroke)} !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: ${color} !important;
    box-shadow: none !important;
    transform-origin: center !important;
    pointer-events: none !important;
}

${config.close}::before {
    transform: translate(-50%, -50%) rotate(45deg) !important;
}

${config.close}::after {
    transform: translate(-50%, -50%) rotate(-45deg) !important;
}

${config.minus} {
    position: relative !important;
    translate: ${px(values.minusX)} ${px(values.minusY)} !important;
    color: transparent !important;
    font-size: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
}

${config.minus}::before {
    content: "" !important;
    display: block !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    width: ${px(values.minusWidth)} !important;
    height: ${px(values.minusStroke)} !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: ${color} !important;
    box-shadow: none !important;
    transform: translate(-50%, -50%) !important;
    pointer-events: none !important;
}

${config.minus}::after {
    content: none !important;
    display: none !important;
}

${config.supportsHeaderText && config.headerText ? `
${config.headerText} {
    translate: ${px(values.headerTextX)} ${px(values.headerTextY)} !important;
}
` : ""}

${config.supportsStatusButton && config.statusButton ? `
${config.statusButton} {
    translate: ${px(values.statusButtonX)} ${px(values.statusButtonY)} !important;
}
` : ""}
`;
    }

    function buildCss() {
        return PANELS
            .filter(config => state[config.key])
            .map(config => cssForPanel(config, state[config.key]))
            .join("\n");
    }

    function applyLive() {
        let style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement("style");
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }
        style.textContent = buildCss();

        highlightSelected();
    }

    function highlightSelected() {
        document
            .querySelectorAll(".crm-dev-v4-selected-real")
            .forEach(node => node.classList.remove("crm-dev-v4-selected-real"));

        const config = getPanelConfig();
        const panel = el(config.panel);
        if (panel) panel.classList.add("crm-dev-v4-selected-real");
    }

    function clearLegacyLayout() {
        try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
        document.getElementById("crmDevSavedLayoutStyleV4")?.remove();
    }

    function managedBlock(css) {
        return `${MANAGED_START}\n/* Aktualizacja: ${new Date().toISOString()} */\n${String(css || "").trim()}\n${MANAGED_END}`;
    }

    function replaceManagedBlock(fullCss, generatedCss) {
        const source = String(fullCss || "");
        const block = managedBlock(generatedCss);
        const startIndex = source.indexOf(MANAGED_START);
        const endIndex = source.indexOf(MANAGED_END);

        if (startIndex >= 0 && endIndex > startIndex) {
            return source.slice(0, startIndex) + block + source.slice(endIndex + MANAGED_END.length);
        }
        return source.replace(/\s*$/, "") + "\n\n" + block + "\n";
    }

    async function postJson(url, payload, timeoutMs = 45000) {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type":"text/plain"},
                body: JSON.stringify(payload),
                signal: controller ? controller.signal : undefined
            });
            const text = await response.text();
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0,300)}`);
            let data;
            try { data = JSON.parse(text); }
            catch (_) { throw new Error("Serwer nie zwrócił JSON: " + text.slice(0,300)); }
            return data;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    function getSyncKey({required = true} = {}) {
        let key = "";
        try { key = String(localStorage.getItem(SYNC_KEY_STORAGE) || "").trim(); } catch (_) {}
        if (!key && required) {
            key = String(prompt("Podaj klucz DEV_SYNC_KEY skonfigurowany w Google Apps Script:") || "").trim();
            if (key) {
                try { localStorage.setItem(SYNC_KEY_STORAGE, key); } catch (_) {}
            }
        }
        return key;
    }

    function clearSyncKey() {
        try { localStorage.removeItem(SYNC_KEY_STORAGE); } catch (_) {}
    }

    async function backupToDriveBeforeLocalWrite(oldContent, sourceLabel) {
        const key = getSyncKey({required:true});
        if (!key) throw new Error("Anulowano — przed zapisem wymagany jest backup na Google Drive.");
        const result = await postJson(appsScriptUrl(), {
            action: "backupDevLayoutToDrive",
            devSyncKey: key,
            source: sourceLabel,
            content: String(oldContent || ""),
            fileName: "styleadmin-overrides.css"
        }, 60000);
        if (!result?.success) {
            if (String(result?.error || "").includes("DEV_SYNC_AUTH")) clearSyncKey();
            throw new Error(result?.message || result?.error || "Nie udało się wykonać backupu na Google Drive.");
        }
        return result;
    }

    async function saveGithub(generatedCss) {
        const key = getSyncKey({required:true});
        if (!key) throw new Error("Brak DEV_SYNC_KEY.");

        const result = await postJson(appsScriptUrl(), {
            action: "saveDevLayoutToGithub",
            devSyncKey: key,
            css: generatedCss,
            source: "GITHUB_DEV",
            pageUrl: location.href
        }, 90000);

        if (!result?.success) {
            if (String(result?.error || "").includes("DEV_SYNC_AUTH")) clearSyncKey();
            throw new Error(result?.message || result?.error || "GitHub nie zapisał pliku.");
        }
        return result;
    }

    async function saveViaLocalBridge(generatedCss) {
        const oldResponse = await fetch(`../CSS/styleadmin-overrides.css?devsync=${Date.now()}`, {cache:"no-store"});
        if (!oldResponse.ok) throw new Error("Nie mogę odczytać lokalnego styleadmin-overrides.css.");
        const oldContent = await oldResponse.text();

        const backup = await backupToDriveBeforeLocalWrite(oldContent, "LOCAL_DEV_BRIDGE");
        const result = await postJson(`${location.origin}/__dev/save-layout`, {
            css: generatedCss
        }, 30000);
        if (!result?.success) throw new Error(result?.message || result?.error || "Lokalny helper nie zapisał pliku.");
        return { ...result, driveBackupId: backup.backupFileId || "" };
    }

    function openHandleDb() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return resolve(null);
            const request = indexedDB.open("NailArtDevSyncV5", 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function rememberLocalHandle(handle) {
        try {
            const db = await openHandleDb();
            if (!db) return;
            await new Promise((resolve, reject) => {
                const tx = db.transaction("handles", "readwrite");
                tx.objectStore("handles").put(handle, "adminOverrides");
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            db.close();
        } catch (_) {}
    }

    async function restoreLocalHandle() {
        try {
            const db = await openHandleDb();
            if (!db) return null;
            const handle = await new Promise((resolve, reject) => {
                const tx = db.transaction("handles", "readonly");
                const req = tx.objectStore("handles").get("adminOverrides");
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
            db.close();
            return handle;
        } catch (_) {
            return null;
        }
    }

    async function getLocalAdminFileHandle() {
        if (!localAdminFileHandle) localAdminFileHandle = await restoreLocalHandle();

        if (localAdminFileHandle) {
            try {
                const permission = await localAdminFileHandle.queryPermission({mode:"readwrite"});
                if (permission === "granted") return localAdminFileHandle;
                if (await localAdminFileHandle.requestPermission({mode:"readwrite"}) === "granted") return localAdminFileHandle;
            } catch (_) {
                localAdminFileHandle = null;
            }
        }

        if (typeof window.showOpenFilePicker !== "function") {
            throw new Error("Ta przeglądarka nie pozwala bezpośrednio zapisać pliku. Uruchom START_DEV_LOCAL.bat i otwórz DEV przez localhost.");
        }

        const handles = await window.showOpenFilePicker({
            multiple: false,
            types: [{description:"CSS ADMIN", accept:{"text/css":[".css"]}}]
        });
        const handle = handles?.[0];
        if (!handle) throw new Error("Nie wybrano pliku.");
        if (String(handle.name || "").toLowerCase() !== "styleadmin-overrides.css") {
            throw new Error("Wybierz dokładnie plik admin/CSS/styleadmin-overrides.css.");
        }
        localAdminFileHandle = handle;
        await rememberLocalHandle(handle);
        return handle;
    }

    async function saveToPhysicalLocalFile(generatedCss) {
        const handle = await getLocalAdminFileHandle();
        const file = await handle.getFile();
        const oldContent = await file.text();
        const backup = await backupToDriveBeforeLocalWrite(oldContent, "LOCAL_DEV_FILE_PICKER");
        const newContent = replaceManagedBlock(oldContent, generatedCss);
        const writable = await handle.createWritable();
        await writable.write(newContent);
        await writable.close();
        return {success:true, fileName:handle.name, driveBackupId:backup.backupFileId || ""};
    }

    async function saveToAdmin() {
        const button = document.querySelector(`#${EDITOR_ID} [data-dev-save]`);
        if (button?.disabled) return;
        const generatedCss = buildCss();
        const mode = runtimeMode();

        if (button) {
            button.disabled = true;
            button.textContent = "Zapisywanie…";
        }
        setStatus("Tworzę backup i zapisuję prawdziwy plik ADMIN…", "warn");

        try {
            let result;
            if (mode === "github") result = await saveGithub(generatedCss);
            else if (mode === "local-bridge") result = await saveViaLocalBridge(generatedCss);
            else result = await saveToPhysicalLocalFile(generatedCss);

            dirty = false;
            if (mode === "github") {
                setStatus(
                    `✓ Zapisano fizycznie do GitHub: admin/CSS/styleadmin-overrides.css. Backup Google Drive: ${result.backupFileId || "OK"}. Commit: ${result.commitSha || "OK"}. GitHub Pages może potrzebować kilkudziesięciu sekund na publikację.`,
                    "ok"
                );
            } else {
                setStatus(
                    `✓ Zapisano fizycznie do lokalnego styleadmin-overrides.css. Backup Google Drive: ${result.driveBackupId || "OK"}. Ten plik możesz normalnie wysłać na GitHub.`,
                    "ok"
                );
            }
        } catch (error) {
            console.error("DEV V5 save:", error);
            setStatus("BŁĄD ZAPISU: " + (error?.message || String(error)), "warn");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = runtimeMode() === "github"
                    ? "Zapisz do GitHub / ADMIN"
                    : "Zapisz do pliku ADMIN";
            }
        }
    }

    function resetSaved() {
        if (!confirm("Cofnąć tylko niezapisany podgląd i ponownie wczytać wartości z fizycznego CSS?")) return;
        dirty = false;
        location.reload();
    }

    function downloadCss() {
        const content = `${managedBlock(buildCss())}\n`;
        const blob = new Blob([content], {type:"text/css;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "panel-layout-dev-v5-awaryjny.css";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function setStatus(text, kind = "") {
        const node = document.getElementById("crmDevStatusV4");
        if (!node) return;

        node.textContent = text;
        node.className = "crm-dev-v4-status";

        if (kind === "ok") node.classList.add("is-ok");
        if (kind === "warn") node.classList.add("is-warn");
    }

    function markDirty() {
        dirty = true;
        setStatus("Zmiany są tylko w podglądzie. Kliknij „Zapisz do ADMIN”.", "warn");
    }

    function controlRow(label, key, min, max, step = 1) {
        const values = ensureState(selectedKey);
        const value = values[key];

        return `
            <div class="crm-dev-v4-row">
                <label for="crmDev_${key}">${label}</label>
                <input
                    id="crmDev_${key}"
                    type="number"
                    min="${min}"
                    max="${max}"
                    step="${step}"
                    value="${value}"
                    data-dev-key="${key}">
            </div>
        `;
    }

    function renderControls() {
        const host = document.getElementById("crmDevControlsV4");
        if (!host) return;

        const config = getPanelConfig();
        const values = ensureState(selectedKey);

        host.innerHTML = `
            <div class="crm-dev-v4-section">
                <h4>Panel — ${config.name}</h4>
                ${controlRow("Szerokość", "width", 240, 700, 1)}
                ${controlRow("Przesuń panel X", "panelX", -500, 500, 1)}
                ${controlRow("Przesuń panel Y", "panelY", -500, 500, 1)}
            </div>

            <div class="crm-dev-v4-section">
                <h4>X</h4>
                ${controlRow("Przesuń X poziomo", "closeX", -150, 150, 1)}
                ${controlRow("Przesuń X pionowo", "closeY", -150, 150, 1)}
                ${controlRow("Rozmiar X", "closeSize", 7, 40, .5)}
                ${controlRow("Grubość X", "closeStroke", .75, 8, .25)}
            </div>

            <div class="crm-dev-v4-section">
                <h4>Minimalizacja —</h4>
                ${controlRow("Przesuń — poziomo", "minusX", -150, 150, 1)}
                ${controlRow("Przesuń — pionowo", "minusY", -150, 150, 1)}
                ${controlRow("Szerokość —", "minusWidth", 6, 42, .5)}
                ${controlRow("Grubość —", "minusStroke", .75, 8, .25)}
            </div>

            ${config.supportsHeaderText ? `
            <div class="crm-dev-v4-section">
                <h4>Tekst nagłówka / statusu</h4>
                ${controlRow("Tekst — poziomo", "headerTextX", -150, 150, 1)}
                ${controlRow("Tekst — pionowo", "headerTextY", -100, 100, 1)}
            </div>
            ` : ""}

            ${config.supportsStatusButton ? `
            <div class="crm-dev-v4-section">
                <h4>Przycisk „Zmień status”</h4>
                ${controlRow("Przycisk — poziomo", "statusButtonX", -150, 150, 1)}
                ${controlRow("Przycisk — pionowo", "statusButtonY", -100, 100, 1)}
            </div>
            ` : ""}
        `;

        host
            .querySelectorAll("[data-dev-key]")
            .forEach(input => {
                input.addEventListener("input", event => {
                    const key = event.currentTarget.dataset.devKey;
                    const value = num(event.currentTarget.value, values[key] || 0);

                    ensureState(selectedKey)[key] = value;
                    markDirty();
                    applyLive();
                });
            });

        applyLive();
    }

    async function selectPanel(key) {
        selectedKey = key;

        document
            .querySelectorAll("[data-dev-panel]")
            .forEach(button => {
                button.classList.toggle(
                    "is-active",
                    button.dataset.devPanel === key
                );
            });

        const config = getPanelConfig(key);

        try {
            await config.open?.();
        } catch (error) {
            console.warn("DEV V5 open panel:", error);
        }

        setTimeout(() => {
            ensureState(key);
            renderControls();
            highlightSelected();
        }, 80);
    }

    function renderEditor() {
        const editor = document.createElement("aside");
        editor.id = EDITOR_ID;

        editor.innerHTML = `
            <div class="crm-dev-v4-head">
                <div style="min-width:0;flex:1">
                    <strong>🛠 DEV V5 — PRAWDZIWY ADMIN</strong>
                    <small id="crmDevSyncModeV5">Tryb zapisu: wykrywanie…</small>
                </div>
                <button class="crm-dev-v4-icon-btn"
                        type="button"
                        data-dev-collapse
                        title="Zwiń">—</button>
                <a class="crm-dev-v4-icon-btn"
                   href="../admin.html"
                   title="Otwórz ADMIN"
                   style="text-decoration:none">↗</a>
            </div>

            <div class="crm-dev-v4-body">
                <div class="crm-dev-v4-safe">
                    <strong>TRYB BEZPIECZNY:</strong>
                    DEV blokuje operacje zapisu/usuwania danych.
                    Edytujesz wyłącznie wygląd prawdziwych paneli.
                </div>

                <div class="crm-dev-v4-panel-list">
                    ${PANELS.map(item => `
                        <button type="button"
                                data-dev-panel="${item.key}">
                            ${item.name}
                        </button>
                    `).join("")}
                </div>

                <div id="crmDevControlsV4"></div>

                <div class="crm-dev-v4-actions">
                    <button class="crm-dev-v4-btn primary crm-dev-v4-wide"
                            type="button"
                            data-dev-save>
                        Zapisz do pliku ADMIN
                    </button>

                    <button class="crm-dev-v4-btn"
                            type="button"
                            data-dev-download>
                        Eksport awaryjny
                    </button>

                    <button class="crm-dev-v4-btn danger"
                            type="button"
                            data-dev-reset>
                        Cofnij podgląd
                    </button>
                </div>

                <div id="crmDevStatusV4"
                     class="crm-dev-v4-status">
                    Gotowe. Wybierz panel i zapisz fizycznie do pliku.
                </div>
            </div>
        `;

        document.body.appendChild(editor);

        editor
            .querySelectorAll("[data-dev-panel]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    selectPanel(button.dataset.devPanel);
                });
            });

        editor
            .querySelector("[data-dev-collapse]")
            ?.addEventListener("click", () => {
                editor.classList.toggle("is-collapsed");
            });

        editor
            .querySelector("[data-dev-save]")
            ?.addEventListener("click", saveToAdmin);

        editor
            .querySelector("[data-dev-reset]")
            ?.addEventListener("click", resetSaved);

        editor
            .querySelector("[data-dev-download]")
            ?.addEventListener("click", downloadCss);
    }

    /*
     * DEV SAFE MODE:
     * Blokujemy tylko wywołania, które mogą zmienić dane.
     * Otwieranie/zamykanie paneli pozostaje normalne.
     */
    const BLOCKED_ONCLICK_PATTERNS = [
        "saveAppointment(",
        "submitBlockTime(",
        "saveServiceModalData(",
        "saveClientModalData(",
        "deleteSelectedCalendarItemFromAdmin(",
        "deleteBlockTimeFromAdmin(",
        "deleteExternalCalendarEventFromAdmin(",
        "crmVisitStatusAction(",
        "crmVisitTrashAction(",
        "completeCurrentAppointment(",
        "markCurrentAppointmentNoShow(",
        "cancelAppointmentWithHistory(",
        "convertExternalToCRMAppointment(",
        "deleteCategoryFromModal(",
        "renameCategoryFromModal(",
        "addNewCategoryFromModal(",
        "publishDrafts(",
        "saveDraftsToCloud(",
        "saveSettings("
    ];

    const BLOCKED_BUTTON_IDS = new Set([
        "crmVisitTrashButton",
        "deleteAppointmentBtn",
        "saveAppointmentBtn",
        "blockTimeSubmitBtn",
        "saveSettingsBtn"
    ]);

    function installSafeMode() {
        document.addEventListener(
            "click",
            event => {
                if (event.target.closest(`#${EDITOR_ID}`)) return;

                const button = event.target.closest("button");
                if (!button) return;

                const onclick = String(button.getAttribute("onclick") || "");
                const isBlocked =
                    BLOCKED_BUTTON_IDS.has(button.id) ||
                    BLOCKED_ONCLICK_PATTERNS.some(
                        pattern => onclick.includes(pattern)
                    );

                if (!isBlocked) return;

                event.preventDefault();
                event.stopImmediatePropagation();

                setStatus(
                    "DEV SAFE MODE: zapis/usuwanie danych zostało zablokowane.",
                    "warn"
                );
            },
            true
        );
    }

    function markBlockedButtons() {
        document.querySelectorAll("button[onclick]").forEach(button => {
            const onclick = String(button.getAttribute("onclick") || "");
            const blocked = BLOCKED_ONCLICK_PATTERNS.some(
                pattern => onclick.includes(pattern)
            );

            if (blocked) {
                button.dataset.crmDevV4Blocked = "1";
                button.title = "DEV SAFE MODE — operacja zapisu danych zablokowana";
            }
        });
    }

    function init() {
        document.body.classList.add("crm-dev-v4", "crm-dev-v5");

        clearLegacyLayout();
        renderEditor();
        const modeNode = document.getElementById("crmDevSyncModeV5");
        if (modeNode) modeNode.textContent = runtimeLabel();
        const saveButton = document.querySelector(`#${EDITOR_ID} [data-dev-save]`);
        if (saveButton) saveButton.textContent = runtimeMode() === "github"
            ? "Zapisz do GitHub / ADMIN"
            : "Zapisz do pliku ADMIN";
        installSafeMode();
        markBlockedButtons();

        applyLive();

        setTimeout(() => {
            selectPanel(selectedKey);
            markBlockedButtons();
        }, 350);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {once:true});
    } else {
        init();
    }

    window.addEventListener("beforeunload", event => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = "";
    });
})();
