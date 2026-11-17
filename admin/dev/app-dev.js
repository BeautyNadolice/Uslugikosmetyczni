
/* ==========================================================================
   NAIL-ART DEV V5.9 — PEŁNY LIVE PREVIEW + REVIEW/BLOKADY
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
                    eventId: "DEV-V5-DEMO-WIFE-REVIEW",
                    name: "Renata Mazur",
                    reviewClient: "Renata Mazur",
                    phone: "",
                    service: "Manicure żelowy",
                    reviewService: "Manicure żelowy",
                    duration: 60,
                    date: new Date().toISOString(),
                    source: "GOOGLE",
                    sourceType: "WIFE_CALENDAR_BLOCK",
                    sourceId: "DEV-WIFE-REVIEW@google.com",
                    reviewRequired: true,
                    reviewReason: "Niepewny termin — wpis zawiera „może być na rano”",
                    originalTitle: "18:00📍📍📍może być na rano Renata Mazur żel",
                    rawText: "18:00📍📍📍może być na rano Renata Mazur żel",
                    sourceReadOnly: true,
                    canEditReview: true,
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
            key: "calendarInsights",
            name: "Wybrany dzień",
            panel: "#crmCalendarInsights",
            editorType: "simplePanel",
            widthVariableTarget: "#tab-kalendarz",
            widthVariable: "--crm-insights-width",
            open: async () => {
                if (typeof switchTab === "function") switchTab("kalendarz");
                await new Promise(resolve => setTimeout(resolve, 40));
                let panel = document.getElementById("crmCalendarInsights");
                if (!panel && typeof crmEnsureCalendarInsights === "function") {
                    try { panel = crmEnsureCalendarInsights(); } catch (_) {}
                }
                if (panel) {
                    panel.hidden = false;
                    panel.removeAttribute("hidden");
                    panel.classList.remove("crm-v173-user-hidden");
                    panel.style.setProperty("display", "block", "important");
                    panel.style.setProperty("visibility", "visible", "important");
                    panel.style.setProperty("opacity", "1", "important");
                }
                try {
                    if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();
                    else if (typeof crmFinalV3RenderInsights === "function") crmFinalV3RenderInsights();
                } catch (_) {}
            }
        },
        {
            key: "dayVisits",
            name: "Wszystkie wizyty",
            panel: "#crmDayVisitsOverlay .crm-day-list-panel",
            close: "#crmDayVisitsOverlay .crm-day-list-close",
            minus: "#crmDayVisitsOverlay #crmDayVisitsMinimizeV25217",
            editorType: "dayVisitsAdvanced",
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
            key: "priceCategoryCard",
            name: "Cennik DOM — karta kategorii",
            panel: "#crmAdminDomPriceGroupV28 .crm-price-card-v27",
            styleSelector: "#crmAdminDomPriceGroupV28 .crm-price-card-v27",
            editorType: "priceCategoryCard",
            open: async () => {
                if (typeof switchTab === "function") switchTab("cennik");
                const group = document.getElementById("crmAdminDomPriceGroupV28");
                if (group) group.open = true;

                try {
                    if (typeof crmLoadDomPricesSingleV284 === "function") {
                        await crmLoadDomPricesSingleV284();
                    }
                } catch (_) {}

                if (typeof renderServicesTable === "function") {
                    try { renderServicesTable(); } catch (_) {}
                }

                await new Promise(resolve => setTimeout(resolve, 80));
                const card = document.querySelector("#crmAdminDomPriceGroupV28 .crm-price-card-v27");
                if (card) card.classList.add("crm-cat-open-v284");
            }
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
    let selectedKey = null; /* V5.4: po odświeżeniu NIE otwieramy automatycznie żadnego panelu ADMIN */
    let dirty = false;
    const dirtyKeys = new Set();
    const liveKeys = new Set(); /* tylko panele faktycznie zmienione w tej sesji */

    function num(value, fallback = 0) {
        const n = Number.parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function px(value) {
        return `${Math.round(num(value) * 100) / 100}px`;
    }

    function getPanelConfig(key = selectedKey) {
        if (!key) return null;
        return PANELS.find(item => item.key === key) || null;
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
        /* GitHub write is explicit opt-in; hosting protocol alone never authorizes a repo write. */
        const params = new URLSearchParams(location.search || "");
        if (params.get("devSave") === "github") return "github";
        return "local-file";
    }

    function runtimeLabel() {
        const mode = runtimeMode();
        if (mode === "github") return "GITHUB — zapis bezpośrednio do repozytorium";
        if (mode === "local-bridge") return "LOCAL — zapis fizyczny do pliku przez lokalny helper";
        return "LOCAL — zapis fizyczny do wybranego styleadmin-overrides.css";
    }

    function cssColorToHex(value, fallback = "#ffffff") {
        const source = String(value || "").trim();
        if (/^#[0-9a-f]{6}$/i.test(source)) return source.toLowerCase();
        if (/^#[0-9a-f]{3}$/i.test(source)) {
            return "#" + source.slice(1).split("").map(ch => ch + ch).join("").toLowerCase();
        }
        const match = source.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/i);
        if (!match) return fallback;
        if (match[4] !== undefined && num(match[4], 1) <= 0.001) return fallback;
        return "#" + [match[1], match[2], match[3]]
            .map(part => Math.max(0, Math.min(255, Math.round(Number(part) || 0))).toString(16).padStart(2, "0"))
            .join("");
    }

    function hexToRgba(hex, alpha = 1) {
        const safe = cssColorToHex(hex, "#000000");
        const r = parseInt(safe.slice(1, 3), 16);
        const g = parseInt(safe.slice(3, 5), 16);
        const b = parseInt(safe.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, num(alpha, 1)))})`;
    }

    function parseShadowState(node) {
        const fallback = {
            shadowX: 0,
            shadowY: 8,
            shadowBlur: 24,
            shadowSpread: 0,
            shadowColor: "#5c3745",
            shadowOpacity: 0.06
        };
        if (!node) return fallback;

        let value = "";
        try { value = String(getComputedStyle(node).boxShadow || ""); } catch (_) {}
        if (!value || value === "none") return {...fallback, shadowOpacity: 0};

        const colorMatch = value.match(/rgba?\([^)]*\)/i);
        const color = colorMatch ? colorMatch[0] : "";
        const pxValues = value.replace(color, "").match(/-?[\d.]+px/g) || [];
        const rgba = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/i);

        return {
            shadowX: num(pxValues[0], fallback.shadowX),
            shadowY: num(pxValues[1], fallback.shadowY),
            shadowBlur: Math.max(0, num(pxValues[2], fallback.shadowBlur)),
            shadowSpread: num(pxValues[3], fallback.shadowSpread),
            shadowColor: cssColorToHex(color, fallback.shadowColor),
            shadowOpacity: rgba && rgba[4] !== undefined ? num(rgba[4], fallback.shadowOpacity) : fallback.shadowOpacity
        };
    }

    function defaultPriceCategoryCardState(config) {
        const panel = el(config.panel);
        const head = panel?.querySelector(".crm-price-card-head-v27") || null;
        const stripe = panel?.querySelector(".crm-price-stripe-v27") || null;
        const icon = panel?.querySelector(".crm-price-category-icon-v27") || null;
        const title = panel?.querySelector(".crm-price-card-head-v27 h3") || null;
        const serviceHead = panel?.querySelector(".crm-price-service-head-v27") || null;
        const serviceRow = panel?.querySelector(".crm-price-service-row-v27") || null;
        const panelStyle = panel ? getComputedStyle(panel) : null;
        const headStyle = head ? getComputedStyle(head) : null;
        const serviceHeadStyle = serviceHead ? getComputedStyle(serviceHead) : null;
        const serviceRowStyle = serviceRow ? getComputedStyle(serviceRow) : null;

        return {
            cardBg: cssColorToHex(panelStyle?.backgroundColor, "#ffffff"),
            borderColor: cssColorToHex(panelStyle?.borderTopColor, "#eadfe3"),
            borderWidth: computedNumber(panel, "border-top-width", 1),
            radius: computedNumber(panel, "border-top-left-radius", 14),
            ...parseShadowState(panel),

            headerBg: cssColorToHex(headStyle?.backgroundColor, "#ffffff"),
            headerHeight: computedNumber(head, "min-height", 52),
            headerPadY: computedNumber(head, "padding-top", 8),
            headerPadX: computedNumber(head, "padding-left", 10),
            headerGap: computedNumber(head, "column-gap", 9),
            separatorColor: cssColorToHex(headStyle?.borderBottomColor, "#eadfe3"),

            stripeWidth: computedNumber(stripe, "width", 4),
            stripeHeight: computedNumber(stripe, "height", 32),
            iconSize: computedNumber(icon, "width", 34),
            titleSize: computedNumber(title, "font-size", 15.5),

            serviceHeaderBg: cssColorToHex(serviceHeadStyle?.backgroundColor, "#ffffff"),
            serviceRowBg: cssColorToHex(serviceRowStyle?.backgroundColor, "#ffffff"),
            serviceRowHeight: computedNumber(serviceRow, "min-height", 52),
            servicePadY: computedNumber(serviceRow, "padding-top", 7),
            servicePadX: computedNumber(serviceRow, "padding-left", 12)
        };
    }

    function defaultPanelState(config) {
        if (!config) return null;
        if (config.editorType === "priceCategoryCard") return defaultPriceCategoryCardState(config);
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

        const base = {
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

        if (config.editorType === "dayVisitsAdvanced") {
            return {
                ...base,
                cardMinHeight: 66,
                cardPadY: 8,
                cardPadX: 10,
                cardGap: 2,
                cardRadius: 12,
                stripeWidth: 5,
                iconSize: 16,
                timeSize: 11,
                clientSize: 13,
                serviceSize: 10.5,
                timeWeight: 700,
                clientWeight: 750,
                serviceWeight: 500,
                textColor: "#3b3338",
                serviceColor: "#746a70",
                headerLabelColor: "#ad5577",
                headerDateColor: "#342d34",
                headerLabelSize: 10,
                headerDateSize: 17,
                headerLabelText: "WSZYSTKIE WIZYTY",
                showHeaderLabel: 1,
                showDate: 1,
                showSource: 1,
                showStatus: 0,
                showTime: 1,
                showCategory: 1,
                showClient: 1,
                showService: 1,
                topOrder: 1,
                clientOrder: 2,
                serviceOrder: 3,
                topX: 0,
                topY: 0,
                clientX: 0,
                clientY: 0,
                serviceX: 0,
                serviceY: 0,
                headerLabelX: 0,
                headerLabelY: 0,
                headerDateX: 0,
                headerDateY: 0
            };
        }
        return base;
    }

    function ensureState(key) {
        const config = getPanelConfig(key);
        if (!config) return null;
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

    function cssForPriceCategoryCard(config, values) {
        const selector = config.styleSelector || config.panel;
        const shadow = hexToRgba(values.shadowColor, values.shadowOpacity);
        return `
/* ${config.name} — DEV V5.6 / CENNIK */
${selector} {
    background: ${values.cardBg} !important;
    border: ${px(values.borderWidth)} solid ${values.borderColor} !important;
    border-radius: ${px(values.radius)} !important;
    box-shadow: ${px(values.shadowX)} ${px(values.shadowY)} ${px(values.shadowBlur)} ${px(values.shadowSpread)} ${shadow} !important;
}

${selector} .crm-price-card-head-v27 {
    min-height: ${px(values.headerHeight)} !important;
    padding: ${px(values.headerPadY)} ${px(values.headerPadX)} !important;
    gap: ${px(values.headerGap)} !important;
    background: ${values.headerBg} !important;
    border-bottom-color: ${values.separatorColor} !important;
}

${selector} .crm-price-stripe-v27 {
    width: ${px(values.stripeWidth)} !important;
    height: ${px(values.stripeHeight)} !important;
}

${selector} .crm-price-category-icon-v27 {
    width: ${px(values.iconSize)} !important;
    height: ${px(values.iconSize)} !important;
}

${selector} .crm-price-card-head-v27 h3 {
    font-size: ${px(values.titleSize)} !important;
}

${selector} .crm-price-service-head-v27 {
    background: ${values.serviceHeaderBg} !important;
}

${selector} .crm-price-service-row-v27 {
    min-height: ${px(values.serviceRowHeight)} !important;
    padding: ${px(values.servicePadY)} ${px(values.servicePadX)} !important;
    background: ${values.serviceRowBg} !important;
}
`;
    }

    function cssContentString(value) {
        return String(value ?? "")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\r?\n/g, "\\A ");
    }

    function cssForDayVisitsAdvanced(config, values) {
        const color = colorFor(config);
        const show = (value, display="block") => num(value, 0) ? `display:${display} !important;` : "display:none !important;";
        const topVisible = num(values.showSource,1) || num(values.showStatus,0) || num(values.showTime,1);
        return `
/* ${config.name} — DEV V5.9 / ZAAWANSOWANY EDYTOR */
${config.panel} {
    width: ${px(values.width)} !important;
    min-width: 0 !important;
    max-width: none !important;
    box-sizing: border-box !important;
    translate: ${px(values.panelX)} ${px(values.panelY)} !important;
    --crm-day-list-card-min-height: ${px(values.cardMinHeight)} !important;
    --crm-day-list-card-pad-y: ${px(values.cardPadY)} !important;
    --crm-day-list-card-pad-x: ${px(values.cardPadX)} !important;
    --crm-day-list-card-gap: ${px(values.cardGap)} !important;
    --crm-day-list-card-radius: ${px(values.cardRadius)} !important;
    --crm-day-list-stripe-width: ${px(values.stripeWidth)} !important;
    --crm-day-list-icon-size: ${px(values.iconSize)} !important;
    --crm-day-list-time-size: ${px(values.timeSize)} !important;
    --crm-day-list-client-size: ${px(values.clientSize)} !important;
    --crm-day-list-service-size: ${px(values.serviceSize)} !important;
    --crm-day-list-text-color: ${values.textColor} !important;
    --crm-day-list-service-color: ${values.serviceColor} !important;
}

#crmDayVisitsOverlay .crm-day-list-item.crm-v304-day-list-item {
    display:flex !important;
    flex-direction:column !important;
    align-items:stretch !important;
    justify-content:center !important;
    min-height:${px(values.cardMinHeight)} !important;
    height:auto !important;
    padding:${px(values.cardPadY)} ${px(values.cardPadX)} !important;
    gap:${px(values.cardGap)} !important;
    border-radius:${px(values.cardRadius)} !important;
    border-left-width:${px(values.stripeWidth)} !important;
}
#crmDayVisitsOverlay .crm-v304-day-list-top {
    order:${Math.round(num(values.topOrder,1))} !important;
    translate:${px(values.topX)} ${px(values.topY)} !important;
    ${topVisible ? "display:flex !important;" : "display:none !important;"}
}
#crmDayVisitsOverlay .crm-v304-day-list-client {
    order:${Math.round(num(values.clientOrder,2))} !important;
    translate:${px(values.clientX)} ${px(values.clientY)} !important;
    font-size:${px(values.clientSize)} !important;
    font-weight:${Math.round(num(values.clientWeight,750))} !important;
    color:${values.textColor} !important;
    ${show(values.showClient,"flex")}
}
#crmDayVisitsOverlay .crm-v304-day-list-service {
    order:${Math.round(num(values.serviceOrder,3))} !important;
    translate:${px(values.serviceX)} ${px(values.serviceY)} !important;
    font-size:${px(values.serviceSize)} !important;
    font-weight:${Math.round(num(values.serviceWeight,500))} !important;
    color:${values.serviceColor} !important;
    ${show(values.showService,"block")}
}
#crmDayVisitsOverlay .crm-v304-day-list-top b {
    font-size:${px(values.timeSize)} !important;
    font-weight:${Math.round(num(values.timeWeight,700))} !important;
    color:${values.textColor} !important;
    ${show(values.showTime,"block")}
}
#crmDayVisitsOverlay .crm-v304-day-list-top .crm-v304-source-pack { ${show(values.showSource,"inline-flex")} }
#crmDayVisitsOverlay .crm-v304-day-list-top .crm-v304-status { ${show(values.showStatus,"inline-flex")} }
#crmDayVisitsOverlay .crm-v304-day-list-client .crm-v304-category-icon {
    width:${px(values.iconSize)} !important;
    height:${px(values.iconSize)} !important;
    flex-basis:${px(values.iconSize)} !important;
    ${show(values.showCategory,"block")}
}

#crmDayVisitsOverlay .crm-day-list-panel > header span:first-child {
    color:${values.headerLabelColor} !important;
    font-size:0 !important;
    translate:${px(values.headerLabelX)} ${px(values.headerLabelY)} !important;
    ${show(values.showHeaderLabel,"block")}
}
#crmDayVisitsOverlay .crm-day-list-panel > header span:first-child::after {
    content:"${cssContentString(values.headerLabelText)}" !important;
    font-size:${px(values.headerLabelSize)} !important;
    font-weight:800 !important;
    letter-spacing:.07em !important;
}
#crmDayVisitsOverlay #crmDayVisitsTitle {
    color:${values.headerDateColor} !important;
    font-size:${px(values.headerDateSize)} !important;
    translate:${px(values.headerDateX)} ${px(values.headerDateY)} !important;
    ${show(values.showDate,"block")}
}

${config.close} {
    position:relative !important;
    translate:${px(values.closeX)} ${px(values.closeY)} !important;
    color:transparent !important;
    font-size:0 !important;
    overflow:visible !important;
}
${config.close}::before, ${config.close}::after {
    content:"" !important; position:absolute !important; left:50% !important; top:50% !important;
    width:${px(values.closeSize)} !important; height:${px(values.closeStroke)} !important;
    border:0 !important; border-radius:999px !important; background:${color} !important;
    transform-origin:center !important; pointer-events:none !important;
}
${config.close}::before { transform:translate(-50%,-50%) rotate(45deg) !important; }
${config.close}::after { transform:translate(-50%,-50%) rotate(-45deg) !important; }
${config.minus} {
    position:relative !important; translate:${px(values.minusX)} ${px(values.minusY)} !important;
    color:transparent !important; font-size:0 !important; overflow:visible !important;
}
${config.minus}::before {
    content:"" !important; display:block !important; position:absolute !important; left:50% !important; top:50% !important;
    width:${px(values.minusWidth)} !important; height:${px(values.minusStroke)} !important;
    border:0 !important; border-radius:999px !important; background:${color} !important;
    transform:translate(-50%,-50%) !important; pointer-events:none !important;
}
${config.minus}::after { content:none !important; display:none !important; }
`;
    }

    function cssForPanel(config, values) {
        if (config.editorType === "priceCategoryCard") {
            return cssForPriceCategoryCard(config, values);
        }
        if (config.editorType === "dayVisitsAdvanced") {
            return cssForDayVisitsAdvanced(config, values);
        }
        if (config.editorType === "simplePanel") {
            const variableRule = config.widthVariable && config.widthVariableTarget
                ? `${config.widthVariableTarget} { ${config.widthVariable}: ${px(values.width)} !important; }\n`
                : "";
            return `
/* ${config.name} — DEV V5 / PROSTY PANEL */
${variableRule}${config.panel} {
    width: ${px(values.width)} !important;
    min-width: 0 !important;
    max-width: none !important;
    box-sizing: border-box !important;
    translate: ${px(values.panelX)} ${px(values.panelY)} !important;
}
`;
        }
        const color = colorFor(config);

        return `
/* ${config.name} — DEV V5 / PRAWDZIWY DOM */
${config.panel} {
    width: ${px(values.width)} !important;
    min-width: 0 !important;
    max-width: none !important;
    box-sizing: border-box !important;
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

    function setImportant(node, property, value) {
        if (!node || !node.style) return;
        try { node.style.setProperty(property, String(value), "important"); } catch (_) {}
    }

    function applyDirectPreviewForPanel(config, values) {
        if (!config || !values) return;

        if (config.editorType === "priceCategoryCard") {
            const selector = config.styleSelector || config.panel;
            document.querySelectorAll(selector).forEach(panel => {
                setImportant(panel, "background", values.cardBg);
                setImportant(panel, "border", `${px(values.borderWidth)} solid ${values.borderColor}`);
                setImportant(panel, "border-radius", px(values.radius));
                setImportant(panel, "box-shadow", `${px(values.shadowX)} ${px(values.shadowY)} ${px(values.shadowBlur)} ${px(values.shadowSpread)} ${hexToRgba(values.shadowColor, values.shadowOpacity)}`);

                const head = panel.querySelector(".crm-price-card-head-v27");
                setImportant(head, "min-height", px(values.headerHeight));
                setImportant(head, "padding", `${px(values.headerPadY)} ${px(values.headerPadX)}`);
                setImportant(head, "gap", px(values.headerGap));
                setImportant(head, "background", values.headerBg);
                setImportant(head, "border-bottom-color", values.separatorColor);

                const stripe = panel.querySelector(".crm-price-stripe-v27");
                setImportant(stripe, "width", px(values.stripeWidth));
                setImportant(stripe, "height", px(values.stripeHeight));

                const icon = panel.querySelector(".crm-price-category-icon-v27");
                setImportant(icon, "width", px(values.iconSize));
                setImportant(icon, "height", px(values.iconSize));

                const title = panel.querySelector(".crm-price-card-head-v27 h3");
                setImportant(title, "font-size", px(values.titleSize));

                panel.querySelectorAll(".crm-price-service-head-v27").forEach(node => {
                    setImportant(node, "background", values.serviceHeaderBg);
                });
                panel.querySelectorAll(".crm-price-service-row-v27").forEach(node => {
                    setImportant(node, "min-height", px(values.serviceRowHeight));
                    setImportant(node, "padding", `${px(values.servicePadY)} ${px(values.servicePadX)}`);
                    setImportant(node, "background", values.serviceRowBg);
                });
            });
            return;
        }

        const panel = el(config.panel);
        if (!panel) return;
        setImportant(panel, "width", px(values.width));
        setImportant(panel, "min-width", "0px");
        setImportant(panel, "max-width", "none");
        setImportant(panel, "box-sizing", "border-box");
        setImportant(panel, "flex-basis", "auto");
        setImportant(panel, "translate", `${px(values.panelX)} ${px(values.panelY)}`);

        if (config.widthVariable && config.widthVariableTarget) {
            const target = el(config.widthVariableTarget);
            if (target) setImportant(target, config.widthVariable, px(values.width));
        }

        if (config.close) {
            const close = el(config.close);
            setImportant(close, "translate", `${px(values.closeX)} ${px(values.closeY)}`);
        }
        if (config.minus) {
            const minus = el(config.minus);
            setImportant(minus, "translate", `${px(values.minusX)} ${px(values.minusY)}`);
        }
        if (config.headerText) {
            const headerText = el(config.headerText);
            setImportant(headerText, "translate", `${px(values.headerTextX)} ${px(values.headerTextY)}`);
        }
        if (config.statusButton) {
            const statusButton = el(config.statusButton);
            setImportant(statusButton, "translate", `${px(values.statusButtonX)} ${px(values.statusButtonY)}`);
        }
    }

    function applyDirectPreview() {
        liveKeys.forEach(key => {
            const config = getPanelConfig(key);
            const values = state[key];
            if (config && values) applyDirectPreviewForPanel(config, values);
        });
    }

    let previewVerifyTimerV59 = null;
    function setPreviewStatusV59(message, ok = true) {
        const node = document.getElementById("crmDevPreviewStatusV59");
        if (!node) return;
        node.textContent = message;
        node.dataset.ok = ok ? "1" : "0";
    }

    function verifyPanelWidthV59(key, attempt = 0) {
        const config = getPanelConfig(key);
        const values = state[key];
        if (!config || !values || config.editorType === "priceCategoryCard") return true;
        const panel = el(config.panel);
        if (!panel) {
            setPreviewStatusV59(`Podgląd: panel „${config.name}” nie jest jeszcze widoczny`, false);
            return false;
        }
        const expected = Math.max(0, num(values.width, 0));
        const actual = panel.getBoundingClientRect().width;
        if (!expected || Math.abs(actual - expected) <= 2) {
            setPreviewStatusV59(`Podgląd szerokości OK: ${Math.round(actual)} px`, true);
            return true;
        }
        if (attempt < 5) {
            applyDirectPreviewForPanel(config, values);
            window.setTimeout(() => verifyPanelWidthV59(key, attempt + 1), 45 + attempt * 35);
            return false;
        }
        setPreviewStatusV59(`Podgląd szerokości NIEZGODNY: ustawiono ${Math.round(expected)} px, widać ${Math.round(actual)} px`, false);
        console.warn("DEV V5.9: szerokość panelu nie przyjęła wartości", {key, expected, actual});
        return false;
    }

    function schedulePreviewVerificationV59() {
        if (previewVerifyTimerV59) clearTimeout(previewVerifyTimerV59);
        previewVerifyTimerV59 = setTimeout(() => {
            previewVerifyTimerV59 = null;
            if (selectedKey) verifyPanelWidthV59(selectedKey, 0);
        }, 70);
    }

    function buildCss() {
        return PANELS
            .filter(config => state[config.key])
            .map(config => cssForPanel(config, state[config.key]))
            .join("\n");
    }

    function buildLiveCss() {
        return PANELS
            .filter(config => liveKeys.has(config.key) && state[config.key])
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
        /* V5.6: live CSS + bezpośredni preview DOM. ADMIN może przebudować panel po otwarciu,
           dlatego nie polegamy już tylko na kaskadzie CSS. */
        style.textContent = buildLiveCss();
        applyDirectPreview();
        // V5.9: część paneli ADMIN przebudowuje własne style po otwarciu.
        // Powtarzamy preview po dwóch klatkach, aby szerokość widoczna w DEV była rzeczywista.
        requestAnimationFrame(()=>{
            applyDirectPreview();
            requestAnimationFrame(()=>{
                applyDirectPreview();
                schedulePreviewVerificationV59();
            });
        });

        highlightSelected();
    }

    function highlightSelected() {
        document
            .querySelectorAll(".crm-dev-v4-selected-real")
            .forEach(node => node.classList.remove("crm-dev-v4-selected-real"));

        if (!selectedKey) return;
        const config = getPanelConfig();
        if (!config) return;
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


    function panelPatchStart(key) {
        return `/* ===== NAIL-ART DEV V5 PANEL ${key} START ===== */`;
    }

    function panelPatchEnd(key) {
        return `/* ===== NAIL-ART DEV V5 PANEL ${key} END ===== */`;
    }

    function panelPatchBlock(patch) {
        const key = String(patch?.key || "").trim();
        const css = String(patch?.css || "").trim();
        if (!key || !css) throw new Error("Nieprawidłowy blok panelu DEV.");
        return `${panelPatchStart(key)}
${css}
${panelPatchEnd(key)}`;
    }

    function legacyPanelComment(config) {
        return `/* ${config.name} — DEV V5 / PRAWDZIWY DOM */`;
    }

    function nextPanelBoundary(body, fromIndex) {
        const candidates = [];
        PANELS.forEach(config => {
            const legacy = body.indexOf(legacyPanelComment(config), fromIndex);
            if (legacy >= 0) candidates.push(legacy);
            const modern = body.indexOf(panelPatchStart(config.key), fromIndex);
            if (modern >= 0) candidates.push(modern);
        });
        return candidates.length ? Math.min(...candidates) : body.length;
    }

    function mergePanelPatchesIntoCss(fullCss, patches) {
        const source = String(fullCss || "");
        const normalized = (Array.isArray(patches) ? patches : [])
            .filter(item => item && String(item.key || "").trim() && String(item.css || "").trim());
        if (!normalized.length) return source;

        const startIndex = source.indexOf(MANAGED_START);
        const endIndex = source.indexOf(MANAGED_END);
        const hasManaged = startIndex >= 0 && endIndex > startIndex;

        let body = hasManaged
            ? source.slice(startIndex + MANAGED_START.length, endIndex)
            : "";

        normalized.forEach(patch => {
            const key = String(patch.key).trim();
            const config = getPanelConfig(key);
            if (!config || config.key !== key) throw new Error(`Nieznany panel DEV: ${key}`);

            const replacement = panelPatchBlock({key, css: patch.css});
            const modernStart = body.indexOf(panelPatchStart(key));
            const modernEnd = body.indexOf(panelPatchEnd(key));

            if (modernStart >= 0 && modernEnd > modernStart) {
                body = body.slice(0, modernStart) + replacement + body.slice(modernEnd + panelPatchEnd(key).length);
                return;
            }

            const legacyStart = body.indexOf(legacyPanelComment(config));
            if (legacyStart >= 0) {
                const legacyEnd = nextPanelBoundary(body, legacyStart + legacyPanelComment(config).length);
                body = body.slice(0, legacyStart) + replacement + body.slice(legacyEnd);
                return;
            }

            body = body.replace(/\s*$/, "") + `

${replacement}
`;
        });

        const stamp = new Date().toISOString();
        const managed = `${MANAGED_START}
/* Aktualizacja panelowa V5.1: ${stamp} */${body.replace(/^\s*/, "\n").replace(/\s*$/, "\n")}${MANAGED_END}`;

        if (hasManaged) {
            return source.slice(0, startIndex) + managed + source.slice(endIndex + MANAGED_END.length);
        }
        return source.replace(/\s*$/, "") + `

${managed}
`;
    }

    function buildDirtyPanelPatches() {
        return Array.from(dirtyKeys)
            .map(key => {
                const config = getPanelConfig(key);
                const values = state[key];
                if (!config || !values) return null;
                return { key, css: cssForPanel(config, values) };
            })
            .filter(Boolean);
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

    async function saveGithub(panelPatches) {
        const key = getSyncKey({required:true});
        if (!key) throw new Error("Brak DEV_SYNC_KEY.");

        const result = await postJson(appsScriptUrl(), {
            action: "saveDevLayoutToGithub",
            devSyncKey: key,
            panels: panelPatches,
            source: "GITHUB_DEV",
            pageUrl: location.href
        }, 90000);

        if (!result?.success) {
            if (String(result?.error || "").includes("DEV_SYNC_AUTH")) clearSyncKey();
            throw new Error(result?.message || result?.error || "GitHub nie zapisał pliku.");
        }
        return result;
    }

    function verifySavedPanelPatches(cssText, panelPatches) {
        const source = String(cssText || "");
        const missing = (Array.isArray(panelPatches) ? panelPatches : [])
            .map(p => String(p?.key || "").trim())
            .filter(Boolean)
            .filter(key => !source.includes(panelPatchStart(key)) || !source.includes(panelPatchEnd(key)));
        if (missing.length) {
            throw new Error(`Plik został zapisany, ale weryfikacja nie znalazła bloków DEV: ${missing.join(", ")}.`);
        }
        return true;
    }

    async function saveViaLocalBridge(panelPatches) {
        const oldResponse = await fetch(`../CSS/styleadmin-overrides.css?devsync=${Date.now()}`, {cache:"no-store"});
        if (!oldResponse.ok) throw new Error("Nie mogę odczytać lokalnego styleadmin-overrides.css.");
        const oldContent = await oldResponse.text();

        const backup = await backupToDriveBeforeLocalWrite(oldContent, "LOCAL_DEV_BRIDGE");
        const result = await postJson(`${location.origin}/__dev/save-layout`, {
            panels: panelPatches
        }, 30000);
        if (!result?.success) throw new Error(result?.message || result?.error || "Lokalny helper nie zapisał pliku.");

        await new Promise(resolve => setTimeout(resolve, 120));
        const verifyResponse = await fetch(`../CSS/styleadmin-overrides.css?devverify=${Date.now()}`, {cache:"no-store"});
        if (!verifyResponse.ok) throw new Error("Zapis wykonany, ale nie mogę ponownie odczytać styleadmin-overrides.css do weryfikacji.");
        verifySavedPanelPatches(await verifyResponse.text(), panelPatches);

        return { ...result, driveBackupId: backup.backupFileId || "", verified:true };
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

    async function saveToPhysicalLocalFile(panelPatches) {
        const handle = await getLocalAdminFileHandle();
        const file = await handle.getFile();
        const oldContent = await file.text();
        const backup = await backupToDriveBeforeLocalWrite(oldContent, "LOCAL_DEV_FILE_PICKER");
        const newContent = mergePanelPatchesIntoCss(oldContent, panelPatches);
        const writable = await handle.createWritable();
        await writable.write(newContent);
        await writable.close();
        const verifyFile = await handle.getFile();
        verifySavedPanelPatches(await verifyFile.text(), panelPatches);
        return {success:true, fileName:handle.name, driveBackupId:backup.backupFileId || "", verified:true};
    }

    async function saveToAdmin() {
        const button = document.querySelector(`#${EDITOR_ID} [data-dev-save]`);
        if (button?.disabled) return;
        const panelPatches = buildDirtyPanelPatches();
        const mode = runtimeMode();

        if (!panelPatches.length) {
            setStatus("Brak nowych zmian do zapisania.", "ok");
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Zapisywanie…";
        }
        setStatus(`Tworzę backup i zapisuję ${panelPatches.length} zmieniony panel bez naruszania pozostałych…`, "warn");

        try {
            let result;
            if (mode === "github") result = await saveGithub(panelPatches);
            else if (mode === "local-bridge") result = await saveViaLocalBridge(panelPatches);
            else result = await saveToPhysicalLocalFile(panelPatches);

            dirty = false;
            dirtyKeys.clear();
            if (mode === "github") {
                setStatus(
                    `✓ Zapisano fizycznie do GitHub: admin/CSS/styleadmin-overrides.css. Backup Google Drive: ${result.backupFileId || "OK"}. Commit: ${result.commitSha || "OK"}. GitHub Pages może potrzebować kilkudziesięciu sekund na publikację.`,
                    "ok"
                );
            } else {
                setStatus(
                    `✓ Zapisano i zweryfikowano fizyczny styleadmin-overrides.css. Backup Google Drive: ${result.driveBackupId || "OK"}.`,
                    "ok"
                );
            }
        } catch (error) {
            console.error("DEV V5.6 save:", error);
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
        dirtyKeys.clear();
        liveKeys.clear();
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

    function colorRow(label, key) {
        const values = ensureState(selectedKey);
        const value = cssColorToHex(values[key], "#ffffff");
        return `
            <div class="crm-dev-v4-row crm-dev-v4-color-row">
                <label for="crmDev_${key}">${label}</label>
                <input
                    id="crmDev_${key}"
                    type="color"
                    value="${value}"
                    data-dev-kind="color"
                    data-dev-key="${key}">
            </div>
        `;
    }

    function toggleRow(label, key) {
        const values = ensureState(selectedKey);
        const checked = num(values[key], 0) ? "checked" : "";
        return `
            <div class="crm-dev-v4-row crm-dev-v4-toggle-row">
                <label for="crmDev_${key}">${label}</label>
                <input id="crmDev_${key}" type="checkbox" ${checked} data-dev-kind="boolean" data-dev-key="${key}">
            </div>
        `;
    }

    function textRow(label, key) {
        const values = ensureState(selectedKey);
        const value = String(values[key] ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        return `
            <div class="crm-dev-v4-row crm-dev-v4-text-row">
                <label for="crmDev_${key}">${label}</label>
                <input id="crmDev_${key}" type="text" value="${value}" data-dev-kind="text" data-dev-key="${key}">
            </div>
        `;
    }

    function bindControlInputs(host, values) {
        host
            .querySelectorAll("[data-dev-key]")
            .forEach(input => {
                input.addEventListener("input", event => {
                    const key = event.currentTarget.dataset.devKey;
                    const kind = event.currentTarget.dataset.devKind || "number";
                    let value;
                    if (kind === "color") value = String(event.currentTarget.value || "#ffffff");
                    else if (kind === "boolean") value = event.currentTarget.checked ? 1 : 0;
                    else if (kind === "text") value = String(event.currentTarget.value || "");
                    else value = num(event.currentTarget.value, values[key] || 0);

                    ensureState(selectedKey)[key] = value;
                    dirtyKeys.add(selectedKey);
                    liveKeys.add(selectedKey);
                    markDirty();
                    applyLive();
                });
            });
    }

    function renderControls() {
        const host = document.getElementById("crmDevControlsV4");
        if (!host) return;
        if (!selectedKey) {
            host.innerHTML = '<div class="crm-dev-v4-safe">Wybierz panel. Po odświeżeniu DEV nie otwiera już automatycznie żadnego okna ADMIN.</div>';
            return;
        }

        const config = getPanelConfig();
        if (!config) return;
        const values = ensureState(selectedKey);

        if (config.editorType === "dayVisitsAdvanced") {
            host.innerHTML = `
                <div class="crm-dev-v4-section">
                    <h4>Panel — Wszystkie wizyty</h4>
                    ${controlRow("Szerokość", "width", 260, 720, 1)}
                    ${controlRow("Przesuń panel X", "panelX", -500, 500, 1)}
                    ${controlRow("Przesuń panel Y", "panelY", -500, 500, 1)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Nagłówek</h4>
                    ${textRow("Tekst etykiety", "headerLabelText")}
                    ${toggleRow("Pokaż etykietę", "showHeaderLabel")}
                    ${toggleRow("Pokaż datę", "showDate")}
                    ${colorRow("Kolor etykiety", "headerLabelColor")}
                    ${colorRow("Kolor daty", "headerDateColor")}
                    ${controlRow("Rozmiar etykiety", "headerLabelSize", 7, 24, .5)}
                    ${controlRow("Rozmiar daty", "headerDateSize", 10, 32, .5)}
                    ${controlRow("Etykieta X", "headerLabelX", -150, 150, 1)}
                    ${controlRow("Etykieta Y", "headerLabelY", -100, 100, 1)}
                    ${controlRow("Data X", "headerDateX", -150, 150, 1)}
                    ${controlRow("Data Y", "headerDateY", -100, 100, 1)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Karta wizyty</h4>
                    ${controlRow("Minimalna wysokość", "cardMinHeight", 42, 160, 1)}
                    ${controlRow("Padding pionowy", "cardPadY", 0, 30, 1)}
                    ${controlRow("Padding poziomy", "cardPadX", 0, 36, 1)}
                    ${controlRow("Odstęp między wierszami", "cardGap", 0, 20, 1)}
                    ${controlRow("Zaokrąglenie", "cardRadius", 0, 36, 1)}
                    ${controlRow("Szerokość kolorowego paska", "stripeWidth", 0, 14, .5)}
                    ${controlRow("Rozmiar ikon", "iconSize", 8, 32, .5)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Co ma być widoczne</h4>
                    ${toggleRow("Źródło (ikony)", "showSource")}
                    ${toggleRow("Status", "showStatus")}
                    ${toggleRow("Godzina", "showTime")}
                    ${toggleRow("Ikona kategorii", "showCategory")}
                    ${toggleRow("Klient", "showClient")}
                    ${toggleRow("Usługa", "showService")}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Tekst</h4>
                    ${colorRow("Kolor głównego tekstu", "textColor")}
                    ${colorRow("Kolor usługi", "serviceColor")}
                    ${controlRow("Godzina — rozmiar", "timeSize", 7, 24, .5)}
                    ${controlRow("Godzina — grubość", "timeWeight", 300, 900, 50)}
                    ${controlRow("Klient — rozmiar", "clientSize", 8, 28, .5)}
                    ${controlRow("Klient — grubość", "clientWeight", 300, 900, 50)}
                    ${controlRow("Usługa — rozmiar", "serviceSize", 7, 24, .5)}
                    ${controlRow("Usługa — grubość", "serviceWeight", 300, 900, 50)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Pozycja i kolejność wierszy</h4>
                    ${controlRow("Góra — kolejność", "topOrder", 1, 3, 1)}
                    ${controlRow("Góra X", "topX", -120, 120, 1)}
                    ${controlRow("Góra Y", "topY", -80, 80, 1)}
                    ${controlRow("Klient — kolejność", "clientOrder", 1, 3, 1)}
                    ${controlRow("Klient X", "clientX", -120, 120, 1)}
                    ${controlRow("Klient Y", "clientY", -80, 80, 1)}
                    ${controlRow("Usługa — kolejność", "serviceOrder", 1, 3, 1)}
                    ${controlRow("Usługa X", "serviceX", -120, 120, 1)}
                    ${controlRow("Usługa Y", "serviceY", -80, 80, 1)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>X i minimalizacja</h4>
                    ${controlRow("X poziomo", "closeX", -150, 150, 1)}
                    ${controlRow("X pionowo", "closeY", -150, 150, 1)}
                    ${controlRow("Rozmiar X", "closeSize", 7, 40, .5)}
                    ${controlRow("Grubość X", "closeStroke", .75, 8, .25)}
                    ${controlRow("— poziomo", "minusX", -150, 150, 1)}
                    ${controlRow("— pionowo", "minusY", -150, 150, 1)}
                    ${controlRow("Szerokość —", "minusWidth", 6, 42, .5)}
                    ${controlRow("Grubość —", "minusStroke", .75, 8, .25)}
                </div>
            `;
            bindControlInputs(host, values);
            applyLive();
            return;
        }

        if (config.editorType === "simplePanel") {
            host.innerHTML = `
                <div class="crm-dev-v4-section">
                    <h4>Panel — ${config.name}</h4>
                    ${controlRow("Szerokość", "width", 240, 700, 1)}
                    ${controlRow("Przesuń panel X", "panelX", -500, 500, 1)}
                    ${controlRow("Przesuń panel Y", "panelY", -500, 500, 1)}
                </div>
            `;
            bindControlInputs(host, values);
            applyLive();
            return;
        }

        if (config.editorType === "priceCategoryCard") {
            host.innerHTML = `
                <div class="crm-dev-v4-section">
                    <h4>Karta kategorii — wygląd</h4>
                    ${colorRow("Tło karty", "cardBg")}
                    ${colorRow("Kolor obramowania", "borderColor")}
                    ${controlRow("Grubość obramowania", "borderWidth", 0, 8, .25)}
                    ${controlRow("Zaokrąglenie", "radius", 0, 40, 1)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Cień karty</h4>
                    ${controlRow("Cień X", "shadowX", -40, 40, 1)}
                    ${controlRow("Cień Y", "shadowY", -40, 60, 1)}
                    ${controlRow("Rozmycie", "shadowBlur", 0, 80, 1)}
                    ${controlRow("Rozszerzenie", "shadowSpread", -20, 30, 1)}
                    ${colorRow("Kolor cienia", "shadowColor")}
                    ${controlRow("Krycie cienia", "shadowOpacity", 0, 1, .01)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Nagłówek kategorii</h4>
                    ${colorRow("Tło nagłówka", "headerBg")}
                    ${colorRow("Linia pod nagłówkiem", "separatorColor")}
                    ${controlRow("Minimalna wysokość", "headerHeight", 34, 100, 1)}
                    ${controlRow("Padding pionowy", "headerPadY", 0, 30, 1)}
                    ${controlRow("Padding poziomy", "headerPadX", 0, 40, 1)}
                    ${controlRow("Odstęp elementów", "headerGap", 0, 24, 1)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Ikona i tytuł</h4>
                    ${controlRow("Szerokość paska", "stripeWidth", 1, 16, .5)}
                    ${controlRow("Wysokość paska", "stripeHeight", 10, 70, 1)}
                    ${controlRow("Rozmiar ikony", "iconSize", 16, 64, 1)}
                    ${controlRow("Rozmiar tytułu", "titleSize", 10, 28, .5)}
                </div>

                <div class="crm-dev-v4-section">
                    <h4>Wiersze usług</h4>
                    ${colorRow("Tło nagłówka tabeli", "serviceHeaderBg")}
                    ${colorRow("Tło wierszy usług", "serviceRowBg")}
                    ${controlRow("Minimalna wysokość wiersza", "serviceRowHeight", 30, 100, 1)}
                    ${controlRow("Padding pionowy wiersza", "servicePadY", 0, 24, 1)}
                    ${controlRow("Padding poziomy wiersza", "servicePadX", 0, 30, 1)}
                </div>
            `;

            bindControlInputs(host, values);
            applyLive();
            return;
        }

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

        bindControlInputs(host, values);
        applyLive();
    }

    function panelFingerprint(config) {
        const panel = el(config?.panel);
        const close = config?.close ? el(config.close) : null;
        const minus = config?.minus ? el(config.minus) : null;
        if (!panel || (config?.close && !close) || (config?.minus && !minus)) return null;

        const rectPart = node => {
            if (!node) return "-";
            const r = node.getBoundingClientRect();
            const st = getComputedStyle(node);
            return [
                Math.round(r.left * 10) / 10,
                Math.round(r.top * 10) / 10,
                Math.round(r.width * 10) / 10,
                Math.round(r.height * 10) / 10,
                String(st.translate || "none"),
                String(st.top || "auto"),
                String(st.left || "auto"),
                String(st.position || "static")
            ].join("|");
        };

        return [rectPart(panel), rectPart(close), rectPart(minus)].join("##");
    }

    async function waitForPanelStable(config, timeoutMs = 4500) {
        const started = Date.now();
        let last = null;
        let stableCount = 0;

        /* CSS/fonty/admin-core mogą jeszcze kończyć pracę po samym DOMContentLoaded. */
        try {
            if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 700))]);
        } catch (_) {}

        while (Date.now() - started < timeoutMs) {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            const fp = panelFingerprint(config);
            if (fp && fp === last) stableCount += 1;
            else { last = fp; stableCount = fp ? 1 : 0; }

            /* 6 identycznych próbek = min. kilka kolejnych klatek bez zmiany układu. */
            if (stableCount >= 6) return true;
            await new Promise(resolve => setTimeout(resolve, 45));
        }
        return !!panelFingerprint(config);
    }

    function closeDevPreviewPanelsBeforeOpen(nextKey) {
        /* DEV ma pokazywać dokładnie jeden edytowany panel. Nie uruchamiamy logiki zapisu/usuwania. */
        const displayNone = [
            "appointmentDetailsModal", "appointmentModal", "blockTimeModal",
            "clientModal", "serviceModal", "categoryModal", "crmContactDataConfirmModalV2"
        ];
        displayNone.forEach(id => {
            const node = document.getElementById(id);
            if (!node) return;
            node.style.display = "none";
        });

        ["crmDayVisitsOverlay", "crmUnifiedInboxModal"].forEach(id => {
            const node = document.getElementById(id);
            if (!node) return;
            node.hidden = true;
            node.setAttribute("hidden", "");
        });

        /* Panel podsumowania jest częścią layoutu kalendarza, więc chowamy go tylko,
           gdy edytujemy inny prawy panel. */
        const insights = document.getElementById("crmCalendarInsights");
        if (insights && nextKey !== "calendarInsights") {
            insights.style.removeProperty("display");
        }
    }

    async function runDevPreviewAuditV59() {
        const savedKey = selectedKey;
        const failures = [];
        let checked = 0;
        setPreviewStatusV59("Test wszystkich paneli: start…", true);
        for (const config of PANELS) {
            if (config.editorType === "priceCategoryCard") continue;
            try {
                closeDevPreviewPanelsBeforeOpen(config.key);
                await config.open?.();
                const ready = await waitForPanelStable(config, 3200);
                const panel = el(config.panel);
                if (!ready || !panel) { failures.push(`${config.name}: brak panelu`); continue; }
                const base = defaultPanelState(config);
                const originalWidth = panel.getBoundingClientRect().width;
                const testWidth = Math.max(240, Math.min(700, Math.round(originalWidth + (originalWidth < 650 ? 13 : -13))));
                applyDirectPreviewForPanel(config, Object.assign({}, base, {width:testWidth}));
                await new Promise(resolve => setTimeout(resolve, 80));
                const changed = panel.getBoundingClientRect().width;
                const changeOk = Math.abs(changed - testWidth) <= 2;
                applyDirectPreviewForPanel(config, Object.assign({}, base, {width:originalWidth}));
                await new Promise(resolve => setTimeout(resolve, 45));
                const restored = panel.getBoundingClientRect().width;
                const restoreOk = Math.abs(restored - originalWidth) <= 2;
                checked++;
                if (!changeOk || !restoreOk) failures.push(`${config.name}: ${Math.round(originalWidth)}→${Math.round(changed)}→${Math.round(restored)} px`);
            } catch (error) {
                failures.push(`${config.name}: ${error?.message || error}`);
            }
        }
        if (savedKey) { try { await selectPanel(savedKey); } catch (_) {} }
        if (failures.length) {
            setPreviewStatusV59(`Test paneli: ${checked} sprawdzonych, ${failures.length} problemów — ${failures.slice(0,2).join("; ")}`, false);
            console.warn("DEV V5.9 — audit szerokości paneli", failures);
        } else {
            setPreviewStatusV59(`Test paneli OK: ${checked}/${checked} — szerokość zmienia się i wraca`, true);
        }
        return {checked, failures};
    }
    window.crmDevRunPreviewAuditV59 = runDevPreviewAuditV59;

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
        if (!config) return;

        closeDevPreviewPanelsBeforeOpen(key);

        try {
            await config.open?.();
        } catch (error) {
            console.warn("DEV V5.9 open panel:", error);
        }

        const ready = await waitForPanelStable(config);
        if (!ready) {
            console.warn("DEV V5.9: panel nie ustabilizował się przed odczytem:", key);
        }

        /*
         * Baza zawsze pochodzi z aktualnego, fizycznego CSS ADMIN.
         * V5.6 czyta ją dopiero gdy prawdziwy panel, X i — przestaną się ruszać.
         * Dzięki temu refresh i kolejność inicjalizacji ADMIN nie zmieniają odczytu.
         */
        if (!dirtyKeys.has(key)) {
            state[key] = defaultPanelState(config);
        } else {
            ensureState(key);
        }

        renderControls();
        highlightSelected();
        window.setTimeout(() => verifyPanelWidthV59(key, 0), 90);
    }

    function renderEditor() {
        const editor = document.createElement("aside");
        editor.id = EDITOR_ID;

        editor.innerHTML = `
            <div class="crm-dev-v4-head">
                <div style="min-width:0;flex:1">
                    <strong>🛠 EDYTOR DEV</strong>
                    <small id="crmDevSyncModeV5">Wybierz tryb edytora</small>
                </div>
                <div class="crm-dev-v4-mode-switch" role="tablist" aria-label="Tryb edytora">
                    <button type="button" class="crm-dev-v4-mode-btn is-active" data-dev-mode="admin" role="tab" aria-selected="true">ADMIN</button>
                    <button type="button" class="crm-dev-v4-mode-btn" data-dev-mode="index" role="tab" aria-selected="false">INDEX</button>
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
                <div class="crm-dev-v4-mode-pane is-active" data-dev-pane="admin">
                <div class="crm-dev-v4-safe">
                    <strong>TRYB BEZPIECZNY:</strong>
                    DEV blokuje operacje zapisu/usuwania danych.
                    Edytujesz wyłącznie wygląd prawdziwych paneli.
                    <small id="crmDevPreviewStatusV59" data-ok="1" style="display:block;margin-top:6px">Podgląd: wybierz panel</small>
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

                    <button class="crm-dev-v4-btn"
                            type="button"
                            data-dev-audit>
                        Test podglądu paneli
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

                <div class="crm-dev-v4-mode-pane" data-dev-pane="index" hidden>
                    <div class="crm-dev-v4-index-host">
                        <iframe src="../../index-editor.html?embedded=1" title="Edytor INDEX — wspólny panel" loading="eager"></iframe>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(editor);

        editor.querySelectorAll("[data-dev-mode]").forEach(button => {
            button.addEventListener("click", () => {
                const mode = button.dataset.devMode === "index" ? "index" : "admin";
                editor.dataset.devMode = mode;
                editor.classList.toggle("is-index-mode", mode === "index");
                editor.querySelectorAll("[data-dev-mode]").forEach(btn => {
                    const active = btn.dataset.devMode === mode;
                    btn.classList.toggle("is-active", active);
                    btn.setAttribute("aria-selected", active ? "true" : "false");
                });
                editor.querySelectorAll("[data-dev-pane]").forEach(pane => {
                    pane.hidden = pane.dataset.devPane !== mode;
                    pane.classList.toggle("is-active", pane.dataset.devPane === mode);
                });
            });
        });

        editor
            .querySelectorAll("[data-dev-panel]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    selectPanel(button.dataset.devPanel);
                });
            });

        editor
            .querySelector("[data-dev-collapse]")
            ?.addEventListener("click", (event) => {
                if (editor.classList.contains("is-index-mode")) {
                    const iframe = editor.querySelector(".crm-dev-v4-index-host iframe");
                    try { iframe?.contentWindow?.postMessage({channel:"DARIA_INDEX_DESIGN_V1",type:"toggleEmbeddedControls"}, "*"); } catch (_) {}
                    const button = event.currentTarget;
                    button.title = button.title === "Pokaż ustawienia INDEX" ? "Zwiń ustawienia INDEX" : "Pokaż ustawienia INDEX";
                    return;
                }
                editor.classList.toggle("is-collapsed");
            });

        editor
            .querySelector("[data-dev-audit]")
            ?.addEventListener("click", async event => {
                const button = event.currentTarget;
                const oldText = button.textContent;
                button.disabled = true;
                button.textContent = "Testuję panele…";
                try { await runDevPreviewAuditV59(); }
                finally { button.disabled = false; button.textContent = oldText; }
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

    let liveReapplyTimer = null;
    function installLiveReapplyObserver() {
        if (!document.body || typeof MutationObserver === "undefined") return;
        const observer = new MutationObserver(mutations => {
            if (!liveKeys.size) return;
            const relevant = mutations.some(m => m.type === "childList" && (m.addedNodes?.length || m.removedNodes?.length));
            if (!relevant) return;
            if (liveReapplyTimer) clearTimeout(liveReapplyTimer);
            liveReapplyTimer = setTimeout(() => {
                liveReapplyTimer = null;
                applyLive();
            }, 30);
        });
        observer.observe(document.body, {childList:true, subtree:true});
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
        installLiveReapplyObserver();
        markBlockedButtons();

        /* V5.3: po refreshu nie dotykamy żadnego panelu ADMIN i niczego nie odczytujemy.
           Użytkownik wybiera panel ręcznie; dopiero wtedy otwieramy go i czekamy na stabilny layout. */
        renderControls();
        setStatus("Gotowe. Wybierz panel — refresh nie zmienia już stanu okien ADMIN.", "ok");
        setTimeout(markBlockedButtons, 350);
    }

    if (document.readyState === "complete") {
        init();
    } else {
        window.addEventListener("load", init, {once:true});
    }

    window.addEventListener("beforeunload", event => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = "";
    });
})();
