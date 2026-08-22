
/* ==========================================================================
   NAIL-ART DEV V4 — REAL ADMIN EDITOR
   DEV ładuje dokładnie te same CSS/JS/DOM co ADMIN.
   Ten plik jest tylko narzędziem edycyjnym na wierzchu.
   ========================================================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "nailArtDevLayoutV4";
    const STYLE_ID = "crmDevLayoutStyleV4";
    const EDITOR_ID = "crmDevEditorV4";

    const PANELS = [
        {
            key: "details",
            name: "Szczegóły wizyty",
            panel: "#appointmentDetailsModal.crm-safe-visit-panel",
            close: "#appointmentDetailsModal .crm-safe-header > .crm-safe-close",
            minus: "#appointmentDetailsModal #crmVisitDetailsMinimizeV25217",
            dark: true,
            open: () => {
                const sample = {
                    eventType: "appointment",
                    eventId: "DEV-V4-DEMO",
                    name: "Jan Kowalski",
                    phone: "48123456789",
                    service: "Manicure z pielęgnacją i kolorem",
                    duration: 60,
                    date: new Date().toISOString(),
                    crmStatus: "COMPLETED",
                    status: "COMPLETED",
                    bookingSource: "ADMIN"
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
    let selectedKey = "details";
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
            panelX: 0,
            panelY: 0,
            closeX: 0,
            closeY: 0,
            closeSize,
            closeStroke,
            minusX: 0,
            minusY: 0,
            minusWidth,
            minusStroke,

            /* Szczegóły wizyty — pozycja całego bloku statusu:
               ZREALIZOWANA / POTWIERDZONA / ANULOWANA / itd. */
            statusTextX: 0,
            statusTextY: 0,

            /* Szczegóły wizyty — pozycja przycisku "Zmień status". */
            statusButtonX: 0,
            statusButtonY: 0
        };
    }

    function ensureState(key) {
        const config = getPanelConfig(key);
        const defaults = defaultPanelState(config);

        if (!state[key]) {
            state[key] = defaults;
            return state[key];
        }

        /*
         * DEV V4.2 — migracja bez utraty ustawień:
         * stare zapisane panele dostają tylko brakujące pola.
         * Jeśli istniała poprzednia kontrolka completedStatusButtonX,
         * jej wartość przechodzi do nowej statusButtonX.
         */
        const old = state[key];

        state[key] = {
            ...defaults,
            ...old
        };

        if (
            key === "details" &&
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
/* ${config.name} — DEV V4 / PRAWDZIWY DOM */
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

${config.key === "details" ? `
/*
 * DEV V4.2 — PRAWDZIWY NAGŁÓWEK SZCZEGÓŁÓW
 * To są dwa niezależne elementy:
 * 1) blok tekstu statusu (ZREALIZOWANA / POTWIERDZONA / ANULOWANA / itd.)
 * 2) przycisk "Zmień status"
 *
 * Używamy właściwości translate, więc nie wyjmujemy elementów z grid/flex.
 */
#appointmentDetailsModal.crm-safe-visit-panel .crm-safe-status-copy {
    translate: ${px(values.statusTextX)} ${px(values.statusTextY)} !important;
}

#appointmentDetailsModal.crm-safe-visit-panel #crmVisitStatusButton {
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

    function loadSaved() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && parsed.panels) {
                state = parsed.panels;
            }
        } catch (error) {
            console.warn("DEV V4: nie udało się odczytać zapisu:", error);
        }
    }

    function saveToAdmin() {
        const payload = {
            version: 4,
            savedAt: new Date().toISOString(),
            css: buildCss(),
            panels: state
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        dirty = false;

        if (typeof window.crmApplySavedDevLayoutV4 === "function") {
            window.crmApplySavedDevLayoutV4();
        } else {
            applyLive();
        }

        setStatus(
            "Zapisano. ADMIN na tej samej przeglądarce użyje tych ustawień po odświeżeniu.",
            "ok"
        );
    }

    function resetSaved() {
        if (!confirm("Usunąć wszystkie zapisane ustawienia DEV V4 i wrócić do CSS z plików ADMIN?")) {
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
        state = {};
        dirty = false;

        document.getElementById(STYLE_ID)?.remove();
        document.getElementById("crmDevSavedLayoutStyleV4")?.remove();

        setStatus("Usunięto zapis DEV V4. Odśwież ADMIN, aby wrócić do CSS z Drive.", "warn");
        renderControls();
    }

    function downloadCss() {
        const content =
`/* NAIL-ART DEV V4 — finalny CSS z prawdziwego ADMIN
   ${new Date().toLocaleString("pl-PL")}
*/
${buildCss()}`;

        const blob = new Blob([content], {type:"text/css;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "panel-layout-dev-v4.css";
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

            ${config.key === "details" ? `
            <div class="crm-dev-v4-section">
                <h4>Blok statusu</h4>
                ${controlRow(
                    "Tekst statusu — poziomo",
                    "statusTextX",
                    -150,
                    150,
                    1
                )}
                ${controlRow(
                    "Tekst statusu — pionowo",
                    "statusTextY",
                    -100,
                    100,
                    1
                )}
            </div>

            <div class="crm-dev-v4-section">
                <h4>Przycisk „Zmień status”</h4>
                ${controlRow(
                    "Przycisk — poziomo",
                    "statusButtonX",
                    -150,
                    150,
                    1
                )}
                ${controlRow(
                    "Przycisk — pionowo",
                    "statusButtonY",
                    -100,
                    100,
                    1
                )}
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
            console.warn("DEV V4 open panel:", error);
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
                    <strong>🛠 DEV V4 — PRAWDZIWY ADMIN</strong>
                    <small>Te same HTML / CSS / JS co produkcja</small>
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
                        Zapisz do ADMIN
                    </button>

                    <button class="crm-dev-v4-btn"
                            type="button"
                            data-dev-download>
                        Pobierz CSS
                    </button>

                    <button class="crm-dev-v4-btn danger"
                            type="button"
                            data-dev-reset>
                        Reset DEV
                    </button>
                </div>

                <div id="crmDevStatusV4"
                     class="crm-dev-v4-status">
                    Gotowe. Wybierz panel.
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
        "deleteCategoryFromModal(",
        "renameCategoryFromModal(",
        "addNewCategoryFromModal(",
        "publishDrafts(",
        "saveDraftsToCloud(",
        "saveSettings("
    ];

    function installSafeMode() {
        document.addEventListener(
            "click",
            event => {
                if (event.target.closest(`#${EDITOR_ID}`)) return;

                const button = event.target.closest("button");
                if (!button) return;

                const onclick = String(button.getAttribute("onclick") || "");
                const isBlocked = BLOCKED_ONCLICK_PATTERNS.some(
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
        document.body.classList.add("crm-dev-v4");

        loadSaved();
        renderEditor();
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
