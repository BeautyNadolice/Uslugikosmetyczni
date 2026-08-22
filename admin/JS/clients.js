/* ==========================================================================
   CLI. KLIENCI
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CLI.1. customersData (oryginalna linia 25) ----- */
let customersData = [];

/* ----- CLI.2. populateClientNameDatalist (oryginalna linia 1102) ----- */
function populateClientNameDatalist() {

    const list =
        document.getElementById(
            "appointmentClientNameList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.name) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.name || "";

        option.label =
            client.phone || "";

        list.appendChild(
            option
        );

    });

}

/* ----- CLI.3. populateClientPhoneDatalist (oryginalna linia 1147) ----- */
function populateClientPhoneDatalist() {

    const list =
        document.getElementById(
            "appointmentClientPhoneList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.phone) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.phone || "";

        option.label =
            client.name || "";

        list.appendChild(
            option
        );

    });

}

/* ----- CLI.4. loadClients (oryginalna linia 2288) ----- */
/* ==========================================================
   CLIENTS
   CRM V2
   ========================================================== */

async function loadClients(){

    try{

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getClients=true"
            );

        customersData =
            await response.json();
        renderClients();
    }

    catch(error){

        console.error(
            "Clients error",
            error
        );

        customersData = [];

    }

}

/* ----- CLI.5. normalizeClientCounter (oryginalna linia 2317) ----- */
function normalizeClientCounter(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(0, Math.trunc(value));
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        return Math.max(0, parseInt(value.trim(), 10));
    }

    return 0;
}

/* ----- CLI.6. renderClients (oryginalna linia 2329) ----- */
function crmClientEscapeHtmlV251(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function crmEnsureClientTableDelegationV251(tbody) {
    if (!tbody || tbody.dataset.crmClientDelegationV251 === "1") return;

    tbody.dataset.crmClientDelegationV251 = "1";
    tbody.addEventListener("click", event => {
        const button = event.target.closest("button[data-crm-client-action]");
        if (!button || !tbody.contains(button)) return;

        const phone = button.dataset.crmPhone || "";
        const action = button.dataset.crmClientAction || "";

        if (action === "edit" && typeof editClient === "function") {
            editClient(phone);
        } else if (action === "delete" && typeof deleteClient === "function") {
            deleteClient(phone);
        } else if (action === "waiting-inbox") {
            if (typeof crmOpenUnifiedInbox === "function") {
                crmOpenUnifiedInbox().catch?.(console.error);
            } else if (typeof switchTab === "function") {
                switchTab("kalendarz");
            }
        }
    });
}

function renderClients(){
    const tbody = document.getElementById("clientsTableBody");
    if (!tbody) return;

    crmEnsureClientTableDelegationV251(tbody);

    if (!Array.isArray(customersData) || customersData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">Brak klientów</td>
            </tr>
        `;
        return;
    }

    /*
     * PERFORMANCE V25.1
     * Budujemy całą tabelę jako jeden fragment HTML zamiast tworzyć i dopinać
     * każdy <tr> osobno. Przy setkach klientów ogranicza to liczbę kosztownych
     * operacji DOM/layout do jednego wstawienia.
     */
    const rows = new Array(customersData.length);

    for (let i = 0; i < customersData.length; i += 1) {
        const client = customersData[i] || {};
        const phone = String(client.phone || "");

        rows[i] = `
            <tr>
                <td>${crmClientEscapeHtmlV251(client.name || "")}</td>
                <td>${crmClientEscapeHtmlV251(phone)}</td>
                <td>${normalizeClientCounter(client.visits)}</td>
                <td>${normalizeClientCounter(client.cancelled)}</td>
                <td>${crmClientEscapeHtmlV251(client.lastVisit || "-")}</td>
                <td>
                    <button
                        type="button"
                        class="btn-secondary"
                        data-crm-client-action="edit"
                        data-crm-phone="${crmClientEscapeHtmlV251(phone)}">
                        Edytuj
                    </button>
                    <button
                        type="button"
                        class="btn-danger"
                        data-crm-client-action="delete"
                        data-crm-phone="${crmClientEscapeHtmlV251(phone)}">
                        Usuń
                    </button>
                </td>
            </tr>
        `;
    }

    tbody.innerHTML = rows.join("");
}

/* ----- CLI.7. openAddClientModal (oryginalna linia 2427) ----- */
/* ==========================================================
   CLIENT CRUD - MODAL
   ========================================================== */

function openAddClientModal() {

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Dodaj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        "";

    document.getElementById(
        "clientModalName"
    ).value =
        "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        "";

    crmSetClientHistoryInfoV261(null);

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

/* ----- CLI.8. closeClientModal (oryginalna linia 2471) ----- */
function closeClientModal() {

    document.getElementById(
        "clientModal"
    ).style.display =
        "none";

}

/* ----- CLI.9. formatClientDateForInput (oryginalna linia 2480) ----- */
function formatClientDateForInput(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        !date ||
        isNaN(date.getTime())
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

function formatClientDateForDisplayV261(value) {
    const inputValue = formatClientDateForInput(value);
    if (!inputValue) return "Brak";

    const parts = inputValue.split("-");
    if (parts.length !== 3) return inputValue;

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function crmSetClientHistoryInfoV261(client) {
    const section = document.getElementById("clientHistoryInfoV261");
    if (!section) return;

    if (!client) {
        section.hidden = true;
        return;
    }

    section.hidden = false;

    const visits = Number(client.visits) || 0;
    const cancelled = Number(client.cancelled) || 0;
    const lastVisit = formatClientDateForDisplayV261(client.lastVisit);

    const visitsInfo = document.getElementById("clientModalVisitsInfoV261");
    const cancelledInfo = document.getElementById("clientModalCancelledInfoV261");
    const lastVisitInfo = document.getElementById("clientModalLastVisitInfoV261");

    if (visitsInfo) visitsInfo.textContent = String(visits);
    if (cancelledInfo) cancelledInfo.textContent = String(cancelled);
    if (lastVisitInfo) lastVisitInfo.textContent = lastVisit;

}


/* ----- CLI.10. editClient (oryginalna linia 2519) ----- */
function editClient(phone) {

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone.toString().trim() ===
                phone.toString().trim()
            );
        });

    if (!client) {
        alert(
            "Nie znaleziono klienta."
        );
        return;
    }

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Edytuj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        client.phone || "";

    document.getElementById(
        "clientModalName"
    ).value =
        client.name || "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        client.phone || "";

    crmSetClientHistoryInfoV261(client);

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

/* ----- CLI.11. saveClientModalData (oryginalna linia 2581) ----- */
function saveClientModalData() {

    const oldPhone =
        document.getElementById(
            "editClientPhone"
        ).value.trim();

    const name =
        document.getElementById(
            "clientModalName"
        ).value.trim();

    const phone =
        document.getElementById(
            "clientModalPhone"
        ).value.trim();

    /*
     * V26.1: statystyki klienta nie są edytowalne.
     * Przy edycji bierzemy je z aktualnego rekordu pobranego z bazy/RAM,
     * a przy nowym kliencie zaczynają od wartości zerowych.
     */
    const existingClient = oldPhone
        ? customersData.find(item =>
            item.phone &&
            item.phone.toString().trim() === oldPhone
        )
        : null;

    const visits = existingClient
        ? (Number(existingClient.visits) || 0)
        : 0;

    const cancelled = existingClient
        ? (Number(existingClient.cancelled) || 0)
        : 0;

    const lastVisit = existingClient
        ? (existingClient.lastVisit || "")
        : "";

    if (!name || !phone) {
        alert(
            "Wpisz imię i telefon klienta."
        );
        return;
    }

    const clientData = {
        name:
        name,

        phone:
        phone,

        visits:
        visits,

        cancelled:
        cancelled,

        lastVisit:
        lastVisit
    };

    if (oldPhone) {

        const index =
            customersData.findIndex(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    oldPhone
                );
            });

        if (index !== -1) {
            customersData[index] =
                clientData;
        } else {
            customersData.push(
                clientData
            );
        }

    } else {

        const alreadyExists =
            customersData.some(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    phone
                );
            });

        if (alreadyExists) {
            alert(
                "Klient z takim telefonem już istnieje."
            );
            return;
        }

        customersData.push(
            clientData
        );

    }

    renderClients();

    closeClientModal();

   saveClientToCloud(clientData, oldPhone);

}

/* ----- CLI.12. saveClientToCloud (oryginalna linia 2692) ----- */
async function saveClientToCloud(clientData, oldPhone) {

    try {

        /*
         * PERFORMANCE V22:
         * - zapis korzysta ze wspólnej kolejki crmPost zamiast osobnego fetch();
         * - po sukcesie NIE pobieramy ponownie całej listy Klientów;
         *   saveClient() już zaktualizował customersData i wyrenderował tabelę lokalnie;
         * - odświeżamy wyłącznie cache, więc kolejny start CRM nie przywróci
         *   starej wersji klienta.
         */
        const data =
            typeof crmPost === "function"
                ? await crmPost({
                    action: "saveClient",
                    oldPhone: oldPhone || "",
                    client: clientData
                })
                : await (async () => {
                    const response = await fetch(
                        APPS_SCRIPT_URL,
                        {
                            method: "POST",
                            headers: { "Content-Type": "text/plain" },
                            body: JSON.stringify({
                                action: "saveClient",
                                oldPhone: oldPhone || "",
                                client: clientData
                            })
                        }
                    );
                    return response.json();
                })();

        if (data && data.success) {

            alert(
                "Klient zapisany."
            );

            closeClientModal();

            if (typeof crmPerfMarkFreshV18 === "function") {
                crmPerfMarkFreshV18(["clients"]);
            }
            if (typeof crmPerfWriteCacheV18 === "function") {
                crmPerfWriteCacheV18({});
            }
            if (typeof crmPerfWritePersistentCacheV19 === "function") {
                crmPerfWritePersistentCacheV19({});
            }

            renderDashboard();

        } else {

            alert(
                "Błąd zapisu klienta: " +
                (
                    data?.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas zapisu klienta."
        );

    }

}

/* ----- CLI.13. deleteClient (oryginalna linia 2762) ----- */
async function deleteClient(phone) {

    if (
        !confirm(
            "Usunąć klienta?"
        )
    ) {
        return;
    }

    const normalizedPhone = String(phone || "").trim();

    try {

        /*
         * PERFORMANCE V22:
         * Po potwierdzonym zapisie serwera aktualizujemy Klientów od razu
         * w RAM. Stary kod robił jeszcze pełny loadClients(), czyli drugi
         * request do Google tylko po to, by odtworzyć stan już znany z odpowiedzi.
         */
        const data =
            typeof crmPost === "function"
                ? await crmPost({
                    action: "deleteClient",
                    phone: normalizedPhone
                })
                : await (async () => {
                    const response = await fetch(
                        APPS_SCRIPT_URL,
                        {
                            method: "POST",
                            headers: { "Content-Type": "text/plain" },
                            body: JSON.stringify({
                                action: "deleteClient",
                                phone: normalizedPhone
                            })
                        }
                    );
                    return response.json();
                })();

        if (data && data.success) {

            if (Array.isArray(customersData)) {
                customersData = customersData.filter(client =>
                    String(client?.phone || "").trim() !== normalizedPhone
                );
            }

            renderClients();
            renderDashboard();

            if (typeof crmPerfMarkFreshV18 === "function") {
                crmPerfMarkFreshV18(["clients"]);
            }
            if (typeof crmPerfWriteCacheV18 === "function") {
                crmPerfWriteCacheV18({});
            }
            if (typeof crmPerfWritePersistentCacheV19 === "function") {
                crmPerfWritePersistentCacheV19({});
            }

            alert(
                "Klient usunięty."
            );

        } else {

            alert(
                "Błąd usuwania klienta: " +
                (
                    data?.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas usuwania klienta."
        );

    }

}

/* ----- CLI.14. loadClientCRMProfile (oryginalna linia 3637) ----- */
async function loadClientCRMProfile(phone) {
    const response = await crmExtendedPost("getClientCRMProfile", { phone: phone });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się pobrać profilu klienta");
    }
    return response.profile;
}

/* ----- CLI.15. saveClientBookingMode (oryginalna linia 3645) ----- */
async function saveClientBookingMode(phone, mode, reason) {
    const response = await crmExtendedPost("setClientBookingMode", {
        phone: phone,
        mode: mode,
        reason: reason || "",
        changedBy: "MISTRZYNI"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zmienić trybu rezerwacji");
    }
    await loadClients();
    return response;
}

/* ----- CLI.16. crmVisitClient (oryginalna linia 6494) ----- */
function crmVisitClient(item) {
    if (item?.eventType === "block") return "Blokada";
    if (item?.eventType === "external") return "Google Calendar";
    return String(item?.name || "Klient");
}

/* ==========================================================================
   CLIENTS V25.2.22 — KOMPAKTOWY WIDOK CRM
   ========================================================================== */

const CRM_CLIENT_PROFILE_CACHE_KEY_V25222 = "crmClientProfileSummaryV25222";
const CRM_CLIENT_PROFILE_CACHE_TTL_V25222 = 10 * 60 * 1000;

const crmClientUiV25222 = {
    query: "",
    page: 1,
    pageSize: 10,
    bookingFilter: "all",
    nextFilter: "all",
    historyFilter: "all",
    sort: "last_desc"
};

const crmClientProfileCacheV25222 = new Map();
const crmClientProfileLoadingV25222 = new Set();

function crmClientPhoneKeyV25222(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[\s()+-]+/g, "");
}

function crmClientPluralV25222(count, one, few, many) {
    const n = Math.max(0, Number(count) || 0);
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return `${n} ${one}`;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
        return `${n} ${few}`;
    }
    return `${n} ${many}`;
}

function crmClientFormatDateV25222(value) {
    if (!value) return "—";
    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "—");
    return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date).replace(",", "");
}

function crmClientIsCancelledV25222(item) {
    return /ANUL|CANCEL|ODRZUC/i.test(
        String(item?.status || item?.crmStatus || "")
    );
}

function crmClientAppointmentsV25222(phone) {
    const key = crmClientPhoneKeyV25222(phone);
    if (!key) return [];
    return (Array.isArray(appointmentsData) ? appointmentsData : [])
        .filter(item =>
            item?.eventType === "appointment" &&
            crmClientPhoneKeyV25222(item?.phone) === key
        )
        .filter(item => {
            const date = new Date(item?.date || "");
            return !Number.isNaN(date.getTime());
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function crmClientVisitSummaryV25222(client) {
    const rows = crmClientAppointmentsV25222(client?.phone)
        .filter(item => !crmClientIsCancelledV25222(item));
    const now = new Date();

    let last = null;
    let next = null;

    rows.forEach(item => {
        const date = new Date(item.date);
        if (date <= now) last = item;
        else if (!next) next = item;
    });

    return { last, next };
}

function crmClientInitialsV25222(name) {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return "—";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function crmClientReadSessionProfilesV25222() {
    try {
        const raw = sessionStorage.getItem(CRM_CLIENT_PROFILE_CACHE_KEY_V25222);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return;

        const now = Date.now();
        Object.entries(parsed).forEach(([phone, entry]) => {
            if (!entry || now - Number(entry.savedAt || 0) > CRM_CLIENT_PROFILE_CACHE_TTL_V25222) return;
            crmClientProfileCacheV25222.set(phone, entry.summary || {});
        });
    } catch (_) {}
}

function crmClientWriteSessionProfilesV25222() {
    try {
        const payload = {};
        crmClientProfileCacheV25222.forEach((summary, phone) => {
            payload[phone] = {
                savedAt: Date.now(),
                summary
            };
        });
        sessionStorage.setItem(
            CRM_CLIENT_PROFILE_CACHE_KEY_V25222,
            JSON.stringify(payload)
        );
    } catch (_) {}
}

crmClientReadSessionProfilesV25222();

function crmClientProfileSummaryV25222(profile) {
    const risk = profile?.risk || {};
    return {
        bookingMode: String(profile?.bookingMode || "STANDARDOWY"),
        cancellations: Math.max(0, Number(risk.cancellations) || 0),
        reschedules: Math.max(0, Number(risk.reschedules) || 0),
        movedLater: Math.max(0, Number(risk.movedLater) || 0),
        noShows: Math.max(0, Number(risk.noShows) || 0),
        movedThenCancelled: Math.max(0, Number(risk.movedThenCancelled) || 0)
    };
}

function crmClientIsStandardBookingV25222(mode) {
    return String(mode || "STANDARDOWY").toUpperCase() === "STANDARDOWY";
}

function crmClientBookingButtonHtmlV25222(phone, profile) {
    const escapedPhone = crmClientEscapeHtmlV251(phone);

    if (!profile) {
        return `
            <select class="crm-client-booking-select-v25224 is-loading"
                    disabled
                    aria-label="Ładowanie trybu rezerwacji">
                <option>Ładowanie…</option>
            </select>`;
    }

    const rawMode = String(profile.bookingMode || "STANDARDOWY").toUpperCase();

    /*
     * Stary tryb REZERWACJA_OGRANICZONA nie jest już oferowany w UI.
     * Jeżeli istnieje w starych danych, pokazujemy go jako „WYMAGA ZGODY”,
     * ale nie zapisujemy niczego dopóki użytkownik sam nie zmieni wyboru.
     */
    const visibleMode =
        rawMode === "TYLKO_KONTAKT"
            ? "TYLKO_KONTAKT"
            : (
                rawMode === "STANDARDOWY"
                    ? "STANDARDOWY"
                    : "WYMAGA_POTWIERDZENIA"
            );

    const visualClass =
        visibleMode === "STANDARDOWY"
            ? "is-standard"
            : (
                visibleMode === "TYLKO_KONTAKT"
                    ? "is-contact"
                    : "is-confirm"
            );

    return `
        <select class="crm-client-booking-select-v25224 ${visualClass}"
                data-crm-client-action="booking-mode"
                data-crm-phone="${escapedPhone}"
                data-crm-original-mode="${crmClientEscapeHtmlV251(rawMode)}"
                aria-label="Rezerwacja online klienta"
                title="Wybierz sposób rezerwacji online">
            <option value="STANDARDOWY"
                    ${visibleMode === "STANDARDOWY" ? "selected" : ""}>
                ✓ SAMODZIELNA
            </option>
            <option value="WYMAGA_POTWIERDZENIA"
                    ${visibleMode === "WYMAGA_POTWIERDZENIA" ? "selected" : ""}>
                ⚠ WYMAGA ZGODY
            </option>
            <option value="TYLKO_KONTAKT"
                    ${visibleMode === "TYLKO_KONTAKT" ? "selected" : ""}>
                ☎ TYLKO KONTAKT
            </option>
        </select>`;
}

function crmClientHistoryHtmlV25222(client, profile) {
    const visits = normalizeClientCounter(client?.visits);
    const cancellations = profile
        ? profile.cancellations
        : normalizeClientCounter(client?.cancelled);
    const reschedules = profile ? profile.reschedules : 0;
    const noShows = profile ? profile.noShows : 0;

    return `
        <strong class="crm-client-visits-v25222">
            ${crmClientPluralV25222(visits, "wizyta", "wizyty", "wizyt")}
        </strong>
        <span>
            ${crmClientPluralV25222(cancellations, "anulowana", "anulowane", "anulowanych")}
            <i>•</i>
            ${crmClientPluralV25222(reschedules, "przeniesienie", "przeniesienia", "przeniesień")}
            <i>•</i>
            ${crmClientPluralV25222(noShows, "nieobecność", "nieobecności", "nieobecności")}
        </span>`;
}

function crmClientVisitCellHtmlV25222(item, fallbackDate) {
    if (item) {
        return `
            <strong>${crmClientEscapeHtmlV251(crmClientFormatDateV25222(item.date))}</strong>
            <span>${crmClientEscapeHtmlV251(item.service || "Wizyta")}</span>`;
    }

    if (fallbackDate) {
        return `
            <strong>${crmClientEscapeHtmlV251(crmClientFormatDateV25222(fallbackDate))}</strong>
            <span>—</span>`;
    }

    return `<span class="crm-client-empty-v25222">Brak</span>`;
}


function crmClientVisibleBookingModeV263(profile) {
    const raw = String(profile?.bookingMode || "STANDARDOWY").toUpperCase();
    if (raw === "STANDARDOWY") return "STANDARDOWY";
    if (raw === "TYLKO_KONTAKT") return "TYLKO_KONTAKT";
    return "WYMAGA_POTWIERDZENIA";
}

function crmClientActiveFilterCountV263() {
    return [
        crmClientUiV25222.bookingFilter,
        crmClientUiV25222.nextFilter,
        crmClientUiV25222.historyFilter
    ].filter(value => value && value !== "all").length;
}

function crmClientNeedsProfileFiltersV263(bookingFilter, historyFilter) {
    return (bookingFilter && bookingFilter !== "all") ||
           (historyFilter && historyFilter !== "all");
}

function crmClientLastTimestampV263(client) {
    const summary = crmClientVisitSummaryV25222(client);
    const raw = summary.last?.date || client?.lastVisit || "";
    const value = new Date(raw).getTime();
    return Number.isFinite(value) ? value : -Infinity;
}

function crmClientNextTimestampV263(client) {
    const summary = crmClientVisitSummaryV25222(client);
    const value = new Date(summary.next?.date || "").getTime();
    return Number.isFinite(value) ? value : Infinity;
}

function crmClientSortRowsV263(rows) {
    const mode = crmClientUiV25222.sort || "last_desc";
    const result = rows.slice();

    result.sort((a, b) => {
        if (mode === "name_asc") {
            return String(a?.name || "").localeCompare(
                String(b?.name || ""),
                "pl",
                { sensitivity: "base" }
            );
        }

        if (mode === "visits_desc") {
            return normalizeClientCounter(b?.visits) - normalizeClientCounter(a?.visits) ||
                String(a?.name || "").localeCompare(String(b?.name || ""), "pl", { sensitivity: "base" });
        }

        if (mode === "next_asc") {
            return crmClientNextTimestampV263(a) - crmClientNextTimestampV263(b) ||
                String(a?.name || "").localeCompare(String(b?.name || ""), "pl", { sensitivity: "base" });
        }

        return crmClientLastTimestampV263(b) - crmClientLastTimestampV263(a) ||
            String(a?.name || "").localeCompare(String(b?.name || ""), "pl", { sensitivity: "base" });
    });

    return result;
}

function crmClientSyncToolbarStateV263() {
    const badge = document.getElementById("crmClientsFilterBadgeV263");
    const count = crmClientActiveFilterCountV263();
    if (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
    }

    const filterButton = document.getElementById("crmClientsFilterBtnV263");
    if (filterButton) {
        filterButton.classList.toggle("is-active", count > 0);
    }

    const sort = document.getElementById("crmClientsSortV263");
    if (sort && sort.value !== crmClientUiV25222.sort) {
        sort.value = crmClientUiV25222.sort;
    }
}

function crmClientSetFilterControlsV263(toolbar) {
    const booking = toolbar?.querySelector("#crmClientsBookingFilterV263");
    const next = toolbar?.querySelector("#crmClientsNextFilterV263");
    const history = toolbar?.querySelector("#crmClientsHistoryFilterV263");
    if (booking) booking.value = crmClientUiV25222.bookingFilter;
    if (next) next.value = crmClientUiV25222.nextFilter;
    if (history) history.value = crmClientUiV25222.historyFilter;
}

async function crmClientApplyFiltersV263(toolbar) {
    const booking = toolbar?.querySelector("#crmClientsBookingFilterV263")?.value || "all";
    const next = toolbar?.querySelector("#crmClientsNextFilterV263")?.value || "all";
    const history = toolbar?.querySelector("#crmClientsHistoryFilterV263")?.value || "all";
    const apply = toolbar?.querySelector("#crmClientsApplyFiltersV263");

    if (crmClientNeedsProfileFiltersV263(booking, history)) {
        const clients = Array.isArray(customersData) ? customersData : [];
        if (apply) {
            apply.disabled = true;
            apply.textContent = "Ładowanie…";
        }
        try {
            await crmLoadVisibleClientProfilesV25222(clients);
        } finally {
            if (apply) {
                apply.disabled = false;
                apply.textContent = "Zastosuj";
            }
        }
    }

    crmClientUiV25222.bookingFilter = booking;
    crmClientUiV25222.nextFilter = next;
    crmClientUiV25222.historyFilter = history;
    crmClientUiV25222.page = 1;

    const popover = toolbar?.querySelector("#crmClientsFiltersPopoverV263");
    if (popover) popover.hidden = true;
    renderClients();
}

function crmClientInstallToolbarOutsideCloseV263() {
    if (document.documentElement.dataset.crmClientsToolbarOutsideV263 === "1") return;
    document.documentElement.dataset.crmClientsToolbarOutsideV263 = "1";

    document.addEventListener("click", event => {
        const wrap = document.getElementById("crmClientsFilterWrapV263");
        const popover = document.getElementById("crmClientsFiltersPopoverV263");
        if (!wrap || !popover || popover.hidden) return;
        if (!wrap.contains(event.target)) popover.hidden = true;
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const popover = document.getElementById("crmClientsFiltersPopoverV263");
        if (popover) popover.hidden = true;
    });
}

function crmEnsureClientsChromeV25222() {
    const tab = document.getElementById("tab-klienci");
    const table = tab?.querySelector("table.admin-table");
    const pageHeader = tab?.querySelector(".page-header");
    if (!tab || !table || !pageHeader) return null;

    table.classList.add("crm-clients-table-v25222");

    const headerRow = table.querySelector("thead tr");
    if (headerRow && headerRow.dataset.crmClientsV25222 !== "1") {
        headerRow.dataset.crmClientsV25222 = "1";
        headerRow.innerHTML = `
            <th>KLIENT</th>
            <th>HISTORIA</th>
            <th>REZERWACJA ONLINE</th>
            <th>OSTATNIA WIZYTA</th>
            <th>NASTĘPNA WIZYTA</th>
            <th>AKCJE</th>`;
    }

    let toolbar = document.getElementById("crmClientsToolbarV25222");
    if (toolbar && toolbar.dataset.crmToolbarV263 !== "1") {
        toolbar.remove();
        toolbar = null;
    }

    if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = "crmClientsToolbarV25222";
        toolbar.className = "crm-clients-toolbar-v25222";
        toolbar.dataset.crmToolbarV263 = "1";
        toolbar.innerHTML = `
            <div class="crm-clients-count-v263">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span id="crmClientsCountV25222">0 klientów</span>
            </div>

            <label class="crm-clients-search-v25222">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m20 20-3.5-3.5"></path>
                </svg>
                <input id="crmClientsSearchV25222"
                       type="search"
                       autocomplete="off"
                       placeholder="Szukaj klienta po imieniu, nazwisku lub numerze telefonu...">
            </label>

            <div id="crmClientsFilterWrapV263" class="crm-clients-filter-wrap-v263">
                <button type="button" id="crmClientsFilterBtnV263" class="crm-clients-filter-btn-v263">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16M7 12h10M10 18h4"></path>
                    </svg>
                    <span>Filtry</span>
                    <span id="crmClientsFilterBadgeV263" class="crm-clients-filter-badge-v263" hidden>0</span>
                </button>

                <div id="crmClientsFiltersPopoverV263" class="crm-clients-filters-popover-v263" hidden>
                    <div class="crm-clients-filter-title-v263">Filtry klientów</div>

                    <label>
                        <span>Rezerwacja online</span>
                        <select id="crmClientsBookingFilterV263">
                            <option value="all">Wszystkie</option>
                            <option value="STANDARDOWY">Samodzielna</option>
                            <option value="WYMAGA_POTWIERDZENIA">Wymaga zgody</option>
                            <option value="TYLKO_KONTAKT">Tylko kontakt</option>
                        </select>
                    </label>

                    <label>
                        <span>Następna wizyta</span>
                        <select id="crmClientsNextFilterV263">
                            <option value="all">Wszystkie</option>
                            <option value="has_next">Ma zaplanowaną</option>
                            <option value="no_next">Brak wizyty</option>
                        </select>
                    </label>

                    <label>
                        <span>Historia</span>
                        <select id="crmClientsHistoryFilterV263">
                            <option value="all">Wszystkie</option>
                            <option value="no_show">Ma nieobecności</option>
                            <option value="cancelled">Ma anulowania</option>
                            <option value="clean">Bez problemów</option>
                        </select>
                    </label>

                    <div class="crm-clients-filter-actions-v263">
                        <button type="button" id="crmClientsClearFiltersV263" class="btn-secondary">Wyczyść</button>
                        <button type="button" id="crmClientsApplyFiltersV263" class="btn-primary">Zastosuj</button>
                    </div>
                </div>
            </div>

            <label class="crm-clients-sort-v263">
                <span>Sortuj:</span>
                <select id="crmClientsSortV263" aria-label="Sortuj klientów">
                    <option value="last_desc">Ostatnia wizyta</option>
                    <option value="next_asc">Następna wizyta</option>
                    <option value="name_asc">Imię A–Z</option>
                    <option value="visits_desc">Liczba wizyt</option>
                </select>
            </label>`;

        pageHeader.insertAdjacentElement("afterend", toolbar);

        const input = toolbar.querySelector("#crmClientsSearchV25222");
        input?.addEventListener("input", () => {
            crmClientUiV25222.query = String(input.value || "").trim().toLowerCase();
            crmClientUiV25222.page = 1;
            renderClients();
        });

        const filterButton = toolbar.querySelector("#crmClientsFilterBtnV263");
        const popover = toolbar.querySelector("#crmClientsFiltersPopoverV263");
        filterButton?.addEventListener("click", event => {
            event.stopPropagation();
            crmClientSetFilterControlsV263(toolbar);
            if (popover) popover.hidden = !popover.hidden;
        });
        popover?.addEventListener("click", event => event.stopPropagation());

        toolbar.querySelector("#crmClientsApplyFiltersV263")?.addEventListener("click", () => {
            crmClientApplyFiltersV263(toolbar).catch(error => {
                console.error("Filtry klientów:", error);
                if (typeof crmToast === "function") crmToast("Nie udało się zastosować filtrów.", "error");
            });
        });

        toolbar.querySelector("#crmClientsClearFiltersV263")?.addEventListener("click", () => {
            crmClientUiV25222.bookingFilter = "all";
            crmClientUiV25222.nextFilter = "all";
            crmClientUiV25222.historyFilter = "all";
            crmClientUiV25222.page = 1;
            crmClientSetFilterControlsV263(toolbar);
            if (popover) popover.hidden = true;
            renderClients();
        });

        toolbar.querySelector("#crmClientsSortV263")?.addEventListener("change", event => {
            crmClientUiV25222.sort = String(event.target.value || "last_desc");
            crmClientUiV25222.page = 1;
            renderClients();
        });

        crmClientInstallToolbarOutsideCloseV263();
        crmClientSyncToolbarStateV263();
    }

    let wrap = table.parentElement;
    if (!wrap?.classList.contains("crm-clients-table-wrap-v25222")) {
        wrap = document.createElement("div");
        wrap.className = "crm-clients-table-wrap-v25222";
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
    }

    let footer = document.getElementById("crmClientsFooterV25222");
    if (!footer) {
        footer = document.createElement("div");
        footer.id = "crmClientsFooterV25222";
        footer.className = "crm-clients-footer-v25222";
        footer.innerHTML = `
            <label>
                Pokaż
                <select id="crmClientsPageSizeV25222">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </label>
            <div>
                <span id="crmClientsRangeV25222">0 z 0</span>
                <button type="button" id="crmClientsPrevV25222">‹</button>
                <strong id="crmClientsPageV25222">1</strong>
                <button type="button" id="crmClientsNextV25222">›</button>
            </div>`;
        wrap.insertAdjacentElement("afterend", footer);

        footer.querySelector("#crmClientsPageSizeV25222")?.addEventListener("change", event => {
            crmClientUiV25222.pageSize = Math.max(1, Number(event.target.value) || 10);
            crmClientUiV25222.page = 1;
            renderClients();
        });

        footer.querySelector("#crmClientsPrevV25222")?.addEventListener("click", () => {
            crmClientUiV25222.page = Math.max(1, crmClientUiV25222.page - 1);
            renderClients();
        });

        footer.querySelector("#crmClientsNextV25222")?.addEventListener("click", () => {
            crmClientUiV25222.page += 1;
            renderClients();
        });
    }

    return { tab, table, toolbar, wrap, footer };
}

function crmClientsTabVisibleV25222() {
    const tab = document.getElementById("tab-klienci");
    if (!tab) return false;
    try {
        return getComputedStyle(tab).display !== "none";
    } catch (_) {
        return false;
    }
}


function crmClientWaitingNormalizeNameV264(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function crmClientWaitingIsOpenV264(item) {
    const raw = String(
        item?.status ||
        item?.readState ||
        item?.state ||
        "OCZEKUJE"
    ).toUpperCase();

    return !/OBSŁUŻ|OBSLUZ|DONE|ODRZUC|REJECT|ZREAL|ZAMKNI|ANUL/.test(raw);
}

function crmClientWaitingRowsV264() {
    const clients = Array.isArray(customersData) ? customersData : [];

    const existingPhones = new Set(
        clients
            .map(item => crmClientPhoneKeyV25222(item?.phone))
            .filter(Boolean)
    );

    const existingNames = new Set(
        clients
            .map(item => crmClientWaitingNormalizeNameV264(item?.name))
            .filter(Boolean)
    );

    /*
     * V26.5:
     * Jedynym źródłem oczekujących jest aktualna wspólna Skrzynka ADMIN.
     * PRZECZYTANE nadal = oczekuje na obsłużenie.
     * Znika dopiero po OBSŁUŻONE / decyzji biznesowej albo gdy osoba
     * już istnieje w bazie klientów.
     */
    const inboxItems =
        typeof crmUnifiedInboxItems !== "undefined" &&
        Array.isArray(crmUnifiedInboxItems)
            ? crmUnifiedInboxItems
            : [];

    const candidates = new Map();

    const needsHandling = raw => {
        if (!raw) return false;

        if (typeof crmInboxNeedsHandlingV25221 === "function") {
            return crmInboxNeedsHandlingV25221(raw);
        }

        const readState = String(raw?.readState || "NOWE")
            .trim()
            .toUpperCase();

        if (readState === "OBSŁUŻONE" || readState === "OBSLUZONE") {
            return false;
        }

        const type = String(raw?.type || "").trim().toUpperCase();
        const status = String(raw?.status || "").trim().toUpperCase();

        if (type === "BOOKING_REQUEST") {
            return !status || status === "OCZEKUJE";
        }

        return true;
    };

    inboxItems.forEach(raw => {
        if (!needsHandling(raw)) return;

        const type = String(raw?.type || "").trim().toUpperCase();

        if (type !== "BOOKING_REQUEST" && type !== "CONTACT_FORM") {
            return;
        }

        const name = String(
            raw?.name ||
            raw?.client ||
            raw?.clientName ||
            "Nowa osoba"
        ).trim();

        const phone = String(
            raw?.phone ||
            raw?.clientPhone ||
            raw?.telephone ||
            raw?.tel ||
            ""
        ).trim();

        const phoneKey = crmClientPhoneKeyV25222(phone);
        const nameKey = crmClientWaitingNormalizeNameV264(name);

        if (phoneKey && existingPhones.has(phoneKey)) return;
        if (!phoneKey && nameKey && existingNames.has(nameKey)) return;

        const dedupeKey = phoneKey
            ? `PHONE:${phoneKey}`
            : `NAME:${nameKey || String(raw?.id || "")}`;

        const row = {
            __crmWaitingV264: true,
            __crmWaitingPriorityV264:
                type === "BOOKING_REQUEST" ? 2 : 1,
            requestType: type,
            requestId: String(raw?.id || ""),
            name: name || "Nowa osoba",
            phone,
            service: String(
                raw?.service ||
                raw?.title ||
                raw?.message ||
                ""
            ).trim(),
            main: String(
                raw?.main ||
                raw?.preferred ||
                raw?.preferredDate ||
                raw?.date ||
                ""
            ).trim(),
            alternative: String(raw?.alternative || "").trim(),
            createdAt: String(
                raw?.createdAt ||
                raw?.timestamp ||
                ""
            ).trim(),
            readState: String(raw?.readState || "NOWE"),
            status: String(raw?.status || "")
        };

        const previous = candidates.get(dedupeKey);

        if (
            !previous ||
            row.__crmWaitingPriorityV264 >
                previous.__crmWaitingPriorityV264
        ) {
            candidates.set(dedupeKey, row);
        }
    });

    return Array.from(candidates.values()).sort((a, b) => {
        const ta = new Date(a.createdAt || "").getTime();
        const tb = new Date(b.createdAt || "").getTime();

        const safeA = Number.isFinite(ta) ? ta : 0;
        const safeB = Number.isFinite(tb) ? tb : 0;

        return safeB - safeA;
    });
}

function crmClientWaitingMatchesQueryV264(item, query) {
    if (!query) return true;
    const haystack = [
        item?.name,
        item?.phone,
        item?.service,
        item?.main,
        item?.alternative
    ].join(" ").toLowerCase();

    return haystack.includes(query);
}

function crmClientWaitingNextHtmlV264(item) {
    if (item?.requestType === "BOOKING_REQUEST") {
        const main = crmClientEscapeHtmlV251(item?.main || "Prośba o termin");
        const service = crmClientEscapeHtmlV251(item?.service || "Wizyta");
        return `
            <strong>${main}</strong>
            <span>${service}</span>`;
    }

    return `
        <strong>Prośba ze Skrzynki</strong>
        <span>${crmClientEscapeHtmlV251(item?.service || "Pierwsza wizyta")}</span>`;
}

function crmClientWaitingRowHtmlV264(item) {
    const name = String(item?.name || "Nowa osoba");
    const phone = String(item?.phone || "");
    const initials = crmClientInitialsV25222(name);

    return `
        <tr class="crm-client-waiting-v264"
            data-crm-waiting-request-id="${crmClientEscapeHtmlV251(item?.requestId || "")}">
            <td>
                <div class="crm-client-person-v25222">
                    <span class="crm-client-avatar-v25222 crm-client-waiting-avatar-v264">
                        ${crmClientEscapeHtmlV251(initials)}
                    </span>
                    <span>
                        <strong>${crmClientEscapeHtmlV251(name)}</strong>
                        <small>${crmClientEscapeHtmlV251(phone || "Brak numeru telefonu")}</small>
                    </span>
                </div>
            </td>
            <td>
                <div class="crm-client-history-v25222 crm-client-waiting-history-v264">
                    <strong>Oczekuje na rejestrację</strong>
                    <span>Jeszcze nie jest klientem w bazie</span>
                </div>
            </td>
            <td>
                <span class="crm-client-waiting-badge-v264">
                    ⏳ OCZEKUJE
                </span>
            </td>
            <td>
                <div class="crm-client-visit-v25222">
                    <span class="crm-client-empty-v25222">—</span>
                </div>
            </td>
            <td>
                <div class="crm-client-visit-v25222">
                    ${crmClientWaitingNextHtmlV264(item)}
                </div>
            </td>
            <td>
                <div class="crm-client-actions-v25222">
                    <button type="button"
                            class="btn-secondary crm-client-waiting-open-v264"
                            data-crm-client-action="waiting-inbox">
                        Skrzynka
                    </button>
                </div>
            </td>
        </tr>`;
}

function crmClientFilteredRowsV25222() {
    const query = String(crmClientUiV25222.query || "").trim().toLowerCase();

    let rows = Array.isArray(customersData) ? customersData.slice() : [];
    let waitingRows = crmClientWaitingRowsV264();

    if (query) {
        rows = rows.filter(client => {
            const haystack = `${client?.name || ""} ${client?.phone || ""}`.toLowerCase();
            return haystack.includes(query);
        });
        waitingRows = waitingRows.filter(item =>
            crmClientWaitingMatchesQueryV264(item, query)
        );
    }

    if (crmClientUiV25222.nextFilter !== "all") {
        rows = rows.filter(client => {
            const hasNext = Boolean(crmClientVisitSummaryV25222(client).next);
            return crmClientUiV25222.nextFilter === "has_next" ? hasNext : !hasNext;
        });
        waitingRows = [];
    }

    if (crmClientUiV25222.bookingFilter !== "all") {
        rows = rows.filter(client => {
            const key = crmClientPhoneKeyV25222(client?.phone);
            const profile = crmClientProfileCacheV25222.get(key);
            if (!profile) return false;
            return crmClientVisibleBookingModeV263(profile) === crmClientUiV25222.bookingFilter;
        });
        waitingRows = [];
    }

    if (crmClientUiV25222.historyFilter !== "all") {
        rows = rows.filter(client => {
            const key = crmClientPhoneKeyV25222(client?.phone);
            const profile = crmClientProfileCacheV25222.get(key);
            if (!profile) return false;

            const cancellations = Math.max(0, Number(profile.cancellations) || 0);
            const reschedules = Math.max(0, Number(profile.reschedules) || 0);
            const noShows = Math.max(0, Number(profile.noShows) || 0);

            if (crmClientUiV25222.historyFilter === "no_show") return noShows > 0;
            if (crmClientUiV25222.historyFilter === "cancelled") return cancellations > 0;
            if (crmClientUiV25222.historyFilter === "clean") {
                return cancellations === 0 && reschedules === 0 && noShows === 0;
            }
            return true;
        });
        waitingRows = [];
    }

    return [
        ...waitingRows,
        ...crmClientSortRowsV263(rows)
    ];
}

function crmClientPatchProfileRowV25222(phone) {
    const key = crmClientPhoneKeyV25222(phone);
    const row = Array.from(
        document.querySelectorAll("#clientsTableBody tr[data-crm-client-phone]")
    ).find(node => crmClientPhoneKeyV25222(node.dataset.crmClientPhone) === key);

    if (!row) return;

    const client = (Array.isArray(customersData) ? customersData : [])
        .find(item => crmClientPhoneKeyV25222(item?.phone) === key);
    const profile = crmClientProfileCacheV25222.get(key);
    if (!client || !profile) return;

    const history = row.querySelector("[data-crm-client-history]");
    const booking = row.querySelector("[data-crm-client-booking]");

    if (history) history.innerHTML = crmClientHistoryHtmlV25222(client, profile);
    if (booking) booking.innerHTML = crmClientBookingButtonHtmlV25222(client.phone, profile);
}

async function crmLoadClientProfileV25222(client) {
    const phone = String(client?.phone || "");
    const key = crmClientPhoneKeyV25222(phone);
    if (!key || crmClientProfileCacheV25222.has(key) || crmClientProfileLoadingV25222.has(key)) return;

    crmClientProfileLoadingV25222.add(key);

    try {
        const profile = await loadClientCRMProfile(phone);
        const summary = crmClientProfileSummaryV25222(profile);
        crmClientProfileCacheV25222.set(key, summary);
        crmClientWriteSessionProfilesV25222();
        crmClientPatchProfileRowV25222(phone);
    } catch (error) {
        console.warn("Profil klienta:", phone, error?.message || error);
        const row = Array.from(
            document.querySelectorAll("#clientsTableBody tr[data-crm-client-phone]")
        ).find(node => crmClientPhoneKeyV25222(node.dataset.crmClientPhone) === key);
        const booking = row?.querySelector("[data-crm-client-booking]");
        if (booking) {
            booking.innerHTML = `
                <select class="crm-client-booking-select-v25224 is-error"
                        disabled
                        title="Nie udało się pobrać trybu rezerwacji">
                    <option>—</option>
                </select>`;
        }
    } finally {
        crmClientProfileLoadingV25222.delete(key);
    }
}

async function crmLoadVisibleClientProfilesV25222(clients) {
    if (!crmClientsTabVisibleV25222()) return;

    const queue = (clients || []).filter(client => {
        const key = crmClientPhoneKeyV25222(client?.phone);
        return key && !crmClientProfileCacheV25222.has(key) && !crmClientProfileLoadingV25222.has(key);
    });

    if (!queue.length) return;

    let index = 0;
    const worker = async () => {
        while (index < queue.length) {
            const current = queue[index++];
            await crmLoadClientProfileV25222(current);
        }
    };

    const workers = Array.from(
        { length: Math.min(2, queue.length) },
        () => worker()
    );

    await Promise.all(workers);
}

async function crmSaveClientBookingModeV25224(select) {
    if (!select || select.disabled) return;

    const phone = String(select.dataset.crmPhone || "");
    const key = crmClientPhoneKeyV25222(phone);
    const current = crmClientProfileCacheV25222.get(key);
    if (!current) return;

    const allowed = new Set([
        "STANDARDOWY",
        "WYMAGA_POTWIERDZENIA",
        "TYLKO_KONTAKT"
    ]);

    const nextMode = String(select.value || "").toUpperCase();
    if (!allowed.has(nextMode)) return;

    const oldMode = String(current.bookingMode || "STANDARDOWY").toUpperCase();
    const oldVisibleMode =
        oldMode === "TYLKO_KONTAKT"
            ? "TYLKO_KONTAKT"
            : (
                oldMode === "STANDARDOWY"
                    ? "STANDARDOWY"
                    : "WYMAGA_POTWIERDZENIA"
            );

    if (nextMode === oldVisibleMode && oldMode !== "REZERWACJA_OGRANICZONA") {
        return;
    }

    select.disabled = true;
    select.classList.add("is-saving");

    try {
        const response = await crmExtendedPost("setClientBookingMode", {
            phone,
            mode: nextMode,
            reason: "Zmiana z listy Klienci",
            changedBy: "MISTRZYNI"
        });

        if (!response || response.success !== true) {
            throw new Error(
                response?.error || "Nie udało się zmienić trybu rezerwacji"
            );
        }

        current.bookingMode = nextMode;
        crmClientProfileCacheV25222.set(key, current);
        crmClientWriteSessionProfilesV25222();
        crmClientPatchProfileRowV25222(phone);

        if (typeof crmToast === "function") {
            const message =
                nextMode === "STANDARDOWY"
                    ? "Klient może rezerwować samodzielnie."
                    : (
                        nextMode === "TYLKO_KONTAKT"
                            ? "Klient może umówić wizytę tylko przez kontakt z salonem."
                            : "Rezerwacje klienta wymagają zgody."
                    );

            crmToast(message);
        }
    } catch (error) {
        select.value = oldVisibleMode;
        select.disabled = false;
        select.classList.remove("is-saving");

        if (typeof crmToast === "function") {
            crmToast(
                error?.message || "Nie udało się zmienić trybu rezerwacji.",
                "error"
            );
        } else {
            alert(
                error?.message || "Nie udało się zmienić trybu rezerwacji."
            );
        }
    }
}

function crmEnsureClientTableActionsV25222(tbody) {
    if (!tbody || tbody.dataset.crmClientActionsV25224 === "1") return;

    tbody.dataset.crmClientActionsV25224 = "1";

    tbody.addEventListener("change", event => {
        const select = event.target.closest(
            'select[data-crm-client-action="booking-mode"]'
        );

        if (!select || !tbody.contains(select)) return;

        event.stopPropagation();

        select.classList.remove(
            "is-standard",
            "is-confirm",
            "is-contact"
        );

        if (select.value === "STANDARDOWY") {
            select.classList.add("is-standard");
        } else if (select.value === "TYLKO_KONTAKT") {
            select.classList.add("is-contact");
        } else {
            select.classList.add("is-confirm");
        }

        crmSaveClientBookingModeV25224(select);
    });
}

renderClients = function() {
    const chrome = crmEnsureClientsChromeV25222();
    const tbody = document.getElementById("clientsTableBody");
    if (!tbody) return;

    crmEnsureClientTableDelegationV251(tbody);
    crmEnsureClientTableActionsV25222(tbody);

    const filtered = crmClientFilteredRowsV25222();
    const total = filtered.length;
    const pageSize = Math.max(1, crmClientUiV25222.pageSize);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    crmClientUiV25222.page = Math.min(Math.max(1, crmClientUiV25222.page), pages);

    const fromIndex = (crmClientUiV25222.page - 1) * pageSize;
    const visible = filtered.slice(fromIndex, fromIndex + pageSize);

    if (!visible.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="crm-client-no-results-v25222">
                    ${total === 0 && !crmClientUiV25222.query ? "Brak klientów" : "Brak wyników"}
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = visible.map(client => {
            if (client?.__crmWaitingV264) {
                return crmClientWaitingRowHtmlV264(client);
            }

            const phone = String(client?.phone || "");
            const key = crmClientPhoneKeyV25222(phone);
            const profile = crmClientProfileCacheV25222.get(key);
            const visits = crmClientVisitSummaryV25222(client);
            const escapedPhone = crmClientEscapeHtmlV251(phone);
            const name = String(client?.name || "");
            const initials = crmClientInitialsV25222(name);

            return `
                <tr data-crm-client-phone="${escapedPhone}">
                    <td>
                        <div class="crm-client-person-v25222">
                            <span class="crm-client-avatar-v25222">${crmClientEscapeHtmlV251(initials)}</span>
                            <span>
                                <strong>${crmClientEscapeHtmlV251(name || "Klient")}</strong>
                                <small>${escapedPhone}</small>
                            </span>
                        </div>
                    </td>
                    <td>
                        <div class="crm-client-history-v25222" data-crm-client-history>
                            ${crmClientHistoryHtmlV25222(client, profile)}
                        </div>
                    </td>
                    <td data-crm-client-booking>
                        ${crmClientBookingButtonHtmlV25222(phone, profile)}
                    </td>
                    <td>
                        <div class="crm-client-visit-v25222">
                            ${crmClientVisitCellHtmlV25222(visits.last, client?.lastVisit)}
                        </div>
                    </td>
                    <td>
                        <div class="crm-client-visit-v25222">
                            ${crmClientVisitCellHtmlV25222(visits.next, "")}
                        </div>
                    </td>
                    <td>
                        <div class="crm-client-actions-v25222">
                            <button type="button"
                                    class="btn-secondary"
                                    data-crm-client-action="edit"
                                    data-crm-phone="${escapedPhone}">
                                Edytuj
                            </button>
                            <button type="button"
                                    class="btn-danger"
                                    data-crm-client-action="delete"
                                    data-crm-phone="${escapedPhone}">
                                Usuń
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join("");
    }

    const count = document.getElementById("crmClientsCountV25222");
    if (count) {
        const allClientsCount = Array.isArray(customersData) ? customersData.length : 0;
        const allWaitingCount = crmClientWaitingRowsV264().length;
        const visibleWaitingCount = filtered.filter(item => item?.__crmWaitingV264).length;
        const visibleClientsCount = total - visibleWaitingCount;

        const narrowed =
            visibleClientsCount !== allClientsCount ||
            Boolean(crmClientUiV25222.query) ||
            crmClientActiveFilterCountV263() > 0;

        if (narrowed) {
            count.textContent =
                `${visibleClientsCount} z ${crmClientPluralV25222(allClientsCount, "klienta", "klientów", "klientów")}` +
                (visibleWaitingCount > 0 ? ` • ${visibleWaitingCount} oczekuje` : "");
        } else {
            count.textContent =
                crmClientPluralV25222(allClientsCount, "klient", "klientów", "klientów") +
                (allWaitingCount > 0 ? ` • ${allWaitingCount} oczekuje` : "");
        }
    }

    crmClientSyncToolbarStateV263();

    const range = document.getElementById("crmClientsRangeV25222");
    if (range) {
        const first = total ? fromIndex + 1 : 0;
        const last = total ? Math.min(total, fromIndex + visible.length) : 0;
        range.textContent = `${first}–${last} z ${total}`;
    }

    const page = document.getElementById("crmClientsPageV25222");
    if (page) page.textContent = String(crmClientUiV25222.page);

    const prev = document.getElementById("crmClientsPrevV25222");
    const next = document.getElementById("crmClientsNextV25222");
    if (prev) prev.disabled = crmClientUiV25222.page <= 1;
    if (next) next.disabled = crmClientUiV25222.page >= pages;

    if (crmClientsTabVisibleV25222()) {
        const actualClients = visible.filter(item => !item?.__crmWaitingV264);
        crmLoadVisibleClientProfilesV25222(actualClients).catch(console.error);
    }
};;

document.addEventListener("click", event => {
    const nav = event.target?.closest?.(
        '.nav-btn[onclick*="klienci"], [onclick*="switchTab"][onclick*="klienci"]'
    );
    if (!nav) return;
    window.setTimeout(() => renderClients(), 0);
}, true);

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureClientsChromeV25222();
        if (crmClientsTabVisibleV25222()) renderClients();
    }, 500);
});

/* KONIEC CLIENTS V25.2.22 */

/* ==========================================================================
   CLIENTS V25.2.24 — REZERWACJA ONLINE: DROPDOWN 3 OPCJE
   ✓ SAMODZIELNA / ⚠ WYMAGA ZGODY / ☎ TYLKO KONTAKT
   ========================================================================== */
/* KONIEC CLIENTS V25.2.24 */
/* ==========================================================================
   CLIENTS V26.2 — DODAJ KLIENTA: TYLKO IMIĘ I TELEFON
   Historia/statystyki nie są pokazywane przy tworzeniu klienta.
   Przy edycji istniejącego klienta sekcja informacji pozostaje tylko do odczytu.
   ========================================================================== */



/* ==========================================================================
   CLIENTS V26.3 — FILTRY I SORTOWANIE
   Toolbar: licznik | wyszukiwarka | Filtry | Sortuj.
   Bez dodatkowego przełącznika widoku.
   ========================================================================== */

/* ==========================================================================
   CLIENTS V26.4 — OCZEKUJĄCY NA REJESTRACJĘ
   Korzysta wyłącznie z danych Skrzynki już pobieranych przez ADMIN.
   Brak dodatkowego pollingu i brak nowego requestu tylko dla zakładki Klienci.
   ========================================================================== */
function crmInstallWaitingClientRefreshV264() {
    if (window.crmWaitingClientRefreshInstalledV264) return;
    window.crmWaitingClientRefreshInstalledV264 = true;

    const wrapAsync = name => {
        const original = window[name];

        if (
            typeof original !== "function" ||
            original.__crmWaitingV265
        ) {
            return;
        }

        const wrapped = async function() {
            const result = await original.apply(this, arguments);

            if (crmClientsTabVisibleV25222()) {
                renderClients();
            }

            return result;
        };

        wrapped.__crmWaitingV265 = true;
        window[name] = wrapped;
    };

    /*
     * Najważniejsze: wspólna Skrzynka jest teraz źródłem oczekujących.
     * Po każdym jej odświeżeniu lista Klienci aktualizuje się bez osobnego
     * requestu do backendu.
     */
    wrapAsync("crmLoadUnifiedInbox");

    window.addEventListener("focus", () => {
        window.setTimeout(() => {
            if (crmClientsTabVisibleV25222()) {
                renderClients();
            }
        }, 250);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) return;

        window.setTimeout(() => {
            if (crmClientsTabVisibleV25222()) {
                renderClients();
            }
        }, 250);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    crmInstallWaitingClientRefreshV264();
});
/* KONIEC CLIENTS V26.4 */

/* ==========================================================================
   CLIENTS V26.5 — UNIFIED INBOX JAKO ŹRÓDŁO OCZEKUJĄCYCH
   ========================================================================== */
/* KONIEC CLIENTS V26.5 */

/* ==========================================================================
   CLIENTS V26.8 — LAZY HYDRATION SKRZYNKI TYLKO PO WEJŚCIU W KLIENTÓW

   Cel:
   - NIE dokładamy nic do bootstrapa ADMIN,
   - NIE dokładamy nowego pingu,
   - NIE czekamy na Skrzynkę przed pokazaniem Klientów,
   - pełna Skrzynka jest pobierana najwyżej raz i dopiero po wejściu w Klientów,
     jeśli nie ma jej jeszcze w RAM/cache,
   - gdy ping widzi NOWE wpisy -> start od razu po renderze,
   - gdy ping pokazuje 0 / nie jest jeszcze gotowy -> pełny odczyt wykonuje się
     w idle/background, żeby wychwycić także PRZECZYTANE, ale nadal nieobsłużone.
   ========================================================================== */

let crmClientsInboxHydratePromiseV268 = null;
let crmClientsInboxHydrationScheduledV268 = false;
let crmClientsInboxHydrationRetryV268 = null;

function crmClientsHasFullInboxCacheV268() {
    try {
        return Number(crmUnifiedInboxLastSuccessV3 || 0) > 0;
    } catch (_) {
        return false;
    }
}

function crmClientsCancelInboxHydrationRetryV268() {
    if (!crmClientsInboxHydrationRetryV268) return;
    window.clearTimeout(crmClientsInboxHydrationRetryV268);
    crmClientsInboxHydrationRetryV268 = null;
}

function crmClientsStartInboxHydrationV268() {
    crmClientsInboxHydrationScheduledV268 = false;

    if (!crmClientsTabVisibleV25222()) return;
    if (crmClientsHasFullInboxCacheV268()) return;
    if (crmClientsInboxHydratePromiseV268) return crmClientsInboxHydratePromiseV268;

    /*
     * Jeśli ADMIN jeszcze kończy swój normalny start albo działa diagnostyka,
     * nie wchodzimy do kolejki. Spróbujemy dopiero później.
     */
    if (
        window.crmBootInProgressV2 ||
        window.crmDiagnosticsNetworkModeV11
    ) {
        crmClientsCancelInboxHydrationRetryV268();
        crmClientsInboxHydrationRetryV268 = window.setTimeout(() => {
            crmClientsInboxHydrationRetryV268 = null;
            crmClientsScheduleInboxHydrationV268();
        }, 500);
        return;
    }

    if (typeof crmLoadUnifiedInbox !== "function") return;

    /*
     * silent:false jest celowe:
     * finalna wersja crmLoadUnifiedInbox przy silent:true robi tylko lekki ping.
     * Tutaj potrzebujemy PEŁNEJ listy, ale wyłącznie po wejściu w Klientów.
     *
     * force:false:
     * - użyje istniejącego cache, jeśli jest aktualny,
     * - skorzysta z istniejącego dedupe crmInboxPromiseV11,
     * - nie uruchomi drugiego requestu, jeśli Skrzynka już się pobiera.
     */
    crmClientsInboxHydratePromiseV268 = Promise.resolve()
        .then(() => crmLoadUnifiedInbox({ force: false }))
        .then(() => {
            if (crmClientsTabVisibleV25222()) {
                renderClients();
            }
        })
        .catch(error => {
            console.warn(
                "Klienci — ciche pobranie Skrzynki:",
                error?.message || error
            );
        })
        .finally(() => {
            crmClientsInboxHydratePromiseV268 = null;
        });

    return crmClientsInboxHydratePromiseV268;
}

function crmClientsScheduleInboxHydrationV268() {
    if (!crmClientsTabVisibleV25222()) return;
    if (crmClientsHasFullInboxCacheV268()) return;
    if (crmClientsInboxHydratePromiseV268) return;
    if (crmClientsInboxHydrationScheduledV268) return;

    crmClientsInboxHydrationScheduledV268 = true;

    const pingNewCount = Number(window.crmInboxPingNewCountV25);

    /*
     * Jeśli obecny ping już wykrył nowe zgłoszenie, nie ma sensu czekać.
     * To nadal dzieje się PO natychmiastowym renderze Klientów.
     */
    if (Number.isFinite(pingNewCount) && pingNewCount > 0) {
        window.setTimeout(crmClientsStartInboxHydrationV268, 0);
        return;
    }

    /*
     * Ping liczy tylko NOWE. PRZECZYTANE, ale nadal nieobsłużone zgłoszenie
     * też musi trafić do Klientów, dlatego przy ping=0 wykonujemy dokładnie
     * jeden pełny odczyt dopiero w czasie bezczynności przeglądarki.
     */
    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(
            crmClientsStartInboxHydrationV268,
            { timeout: 1200 }
        );
    } else {
        window.setTimeout(crmClientsStartInboxHydrationV268, 220);
    }
}

/*
 * Render Klientów pozostaje natychmiastowy.
 * Dopiero po nim uruchamiamy lazy hydration.
 */
const crmRenderClientsBeforeInboxHydrationV268 = renderClients;
renderClients = function() {
    const result = crmRenderClientsBeforeInboxHydrationV268.apply(this, arguments);

    if (crmClientsTabVisibleV25222()) {
        crmClientsScheduleInboxHydrationV268();
    }

    return result;
};

/*
 * Dodatkowe zabezpieczenie wejścia przez nawigację:
 * render wykonuje się natychmiast, hydration dopiero po nim.
 */
document.addEventListener("click", event => {
    const nav = event.target?.closest?.(
        '.nav-btn[onclick*="klienci"], [onclick*="switchTab"][onclick*="klienci"]'
    );
    if (!nav) return;

    window.setTimeout(() => {
        if (crmClientsTabVisibleV25222()) {
            crmClientsScheduleInboxHydrationV268();
        }
    }, 0);
}, true);

/* KONIEC CLIENTS V26.8 */

/* ==========================================================================
   CLIENTS V26.9 — FINALNY WIDOK KLIENCI
   2026-08-22

   Widoki:
   - Klienci stali
   - Osoby oczekujące
   - Historia

   Osoby oczekujące:
   - NOWE / PRZECZYTANE
   - Imię i nazwisko
   - Kategoria
   - Preferowane widełki + opcjonalne konkretne terminy
   - Sposób kontaktu
   - Opis potrzeby
   - przejście do konkretnego wpisu w Skrzynce

   Historia:
   - ładowana WYŁĄCZNIE po kliknięciu zakładki Historia
   - nie wydłuża startu ADMIN ani zwykłego wejścia w Klientów

   V26.8 lazy hydration pozostaje zachowany:
   - brak nowego pollingu
   - brak nowego pingu
   - brak requestu przed pokazaniem Klientów
   ========================================================================== */

let crmClientsViewV269 = "steady";
let crmClientsHistoryCacheV269 = null;
let crmClientsHistoryLoadingV269 = null;
let crmClientsHistoryErrorV269 = "";

function crmClientsEscapeJsStringV269(value) {
    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}

function crmClientsInboxStateV269(item) {
    if (typeof crmInboxStatusLabel === "function") {
        return crmInboxStatusLabel(item?.readState);
    }

    const raw = String(item?.readState || "NOWE").trim().toUpperCase();
    if (raw === "PRZECZYTANE") return "PRZECZYTANE";
    if (raw === "OBSŁUŻONE" || raw === "OBSLUZONE") return "OBSŁUŻONE";
    return "NOWE";
}

function crmClientsWaitingRowsV269() {
    const base =
        typeof crmClientWaitingRowsV264 === "function"
            ? crmClientWaitingRowsV264()
            : [];

    const inbox =
        typeof crmUnifiedInboxItems !== "undefined" &&
        Array.isArray(crmUnifiedInboxItems)
            ? crmUnifiedInboxItems
            : [];

    return base.map(item => {
        const requestId = String(item?.requestId || "");
        const raw = inbox.find(entry =>
            String(entry?.id || "") === requestId
        ) || {};

        const category = String(
            raw?.category ||
            item?.category ||
            raw?.service ||
            item?.service ||
            ""
        ).trim();

        const preferredWindow = String(
            raw?.preferredWindow ||
            raw?.availability ||
            ""
        ).trim();

        const contactMethod = String(
            raw?.contactMethod ||
            raw?.preferredContact ||
            ""
        ).trim().toUpperCase();

        return {
            ...item,
            inboxType: String(raw?.type || item?.requestType || ""),
            firstVisitType: String(raw?.requestType || ""),
            category,
            preferredWindow,
            contactMethod,
            email: String(raw?.email || "").trim(),
            message: String(raw?.message || item?.service || "").trim(),
            proposals: Array.isArray(raw?.proposals) ? raw.proposals : [],
            timestamp: Number(raw?.timestamp) || 0,
            createdAt: raw?.createdAt || item?.createdAt || "",
            readState: raw?.readState || item?.readState || "NOWE",
            status: raw?.status || item?.status || ""
        };
    });
}

function crmClientsWaitingStatePriorityV269(item) {
    const state = crmClientsInboxStateV269(item);
    if (state === "NOWE") return 0;
    if (state === "PRZECZYTANE") return 1;
    return 2;
}

function crmClientsWaitingSortV269(rows) {
    return rows.slice().sort((a, b) => {
        const stateDiff =
            crmClientsWaitingStatePriorityV269(a) -
            crmClientsWaitingStatePriorityV269(b);

        if (stateDiff) return stateDiff;

        const ta = Number(a?.timestamp) || new Date(a?.createdAt || "").getTime() || 0;
        const tb = Number(b?.timestamp) || new Date(b?.createdAt || "").getTime() || 0;

        return tb - ta;
    });
}

function crmClientsWaitingMatchesV269(item, query) {
    if (!query) return true;

    const proposals = Array.isArray(item?.proposals)
        ? item.proposals.map(row =>
            `${row?.date || ""} ${(row?.times || []).join(" ")}`
        ).join(" ")
        : "";

    const haystack = [
        item?.name,
        item?.phone,
        item?.category,
        item?.service,
        item?.message,
        item?.preferredWindow,
        item?.contactMethod,
        item?.email,
        item?.main,
        item?.alternative,
        proposals
    ].join(" ").toLowerCase();

    return haystack.includes(query);
}

function crmClientsProposalTextV269(item) {
    const proposals = Array.isArray(item?.proposals) ? item.proposals : [];

    const parts = proposals
        .filter(row => row?.date)
        .slice(0, 3)
        .map(row => {
            const times = Array.isArray(row?.times)
                ? row.times.filter(Boolean).slice(0, 2)
                : [];

            return times.length
                ? `${row.date}: ${times.join(" / ")}`
                : `${row.date}: bez godziny`;
        });

    if (parts.length) return parts.join(" • ");

    const oldMain = String(item?.main || "").trim();
    const oldAlt = String(item?.alternative || "").trim();

    return [oldMain, oldAlt].filter(Boolean).join(" • ");
}

function crmClientsContactMetaV269(item) {
    const method = String(item?.contactMethod || "").trim().toUpperCase();

    if (method === "WHATSAPP") {
        return {
            key: "whatsapp",
            icon: "W",
            label: "WhatsApp",
            value: String(item?.phone || "")
        };
    }

    if (method === "SMS") {
        return {
            key: "sms",
            icon: "SMS",
            label: "SMS",
            value: String(item?.phone || "")
        };
    }

    if (method === "EMAIL") {
        return {
            key: "email",
            icon: "@",
            label: "E-mail",
            value: String(item?.email || "")
        };
    }

    if (item?.email) {
        return {
            key: "email",
            icon: "@",
            label: "E-mail",
            value: String(item.email)
        };
    }

    return {
        key: "phone",
        icon: "☎",
        label: "Telefon",
        value: String(item?.phone || "")
    };
}

function crmClientsStatusBadgeV269(item) {
    const state = crmClientsInboxStateV269(item);
    const cls =
        state === "NOWE"
            ? "is-new"
            : (
                state === "PRZECZYTANE"
                    ? "is-read"
                    : "is-handled"
            );

    return `
      <span class="crm-clients-request-status-v269 ${cls}">
        ${crmClientEscapeHtmlV251(state)}
      </span>`;
}

function crmClientsWaitingPreferredHtmlV269(item) {
    const windowText = String(item?.preferredWindow || "").trim();
    const proposalText = crmClientsProposalTextV269(item);

    if (!windowText && !proposalText) {
        return `<span class="crm-client-empty-v25222">Nie podano</span>`;
    }

    return `
      <div class="crm-clients-request-preference-v269">
        ${windowText
            ? `<strong>${crmClientEscapeHtmlV251(windowText)}</strong>`
            : ""}
        ${proposalText
            ? `<small>${crmClientEscapeHtmlV251(proposalText)}</small>`
            : ""}
      </div>`;
}

function crmClientsWaitingContactHtmlV269(item) {
    const meta = crmClientsContactMetaV269(item);

    return `
      <div class="crm-clients-request-contact-v269">
        <span class="crm-clients-request-contact-icon-v269 is-${meta.key}">
          ${crmClientEscapeHtmlV251(meta.icon)}
        </span>
        <span>
          <strong>${crmClientEscapeHtmlV251(meta.label)}</strong>
          <small>${crmClientEscapeHtmlV251(meta.value || "—")}</small>
        </span>
      </div>`;
}

function crmClientsWaitingRowHtmlV269(item) {
    const name = String(item?.name || "Nowa osoba");
    const category = String(item?.category || item?.service || "—");
    const message = String(item?.message || "").trim();
    const requestId = String(item?.requestId || item?.id || "");

    return `
      <tr class="crm-clients-request-row-v269"
          data-crm-request-id="${crmClientEscapeHtmlV251(requestId)}">
        <td>${crmClientsStatusBadgeV269(item)}</td>
        <td>
          <div class="crm-clients-request-person-v269">
            <strong>${crmClientEscapeHtmlV251(name)}</strong>
            <small>${crmClientEscapeHtmlV251(item?.phone || "Brak numeru")}</small>
          </div>
        </td>
        <td>
          <div class="crm-clients-request-category-v269">
            <strong>${crmClientEscapeHtmlV251(category)}</strong>
            ${message
                ? `<small title="${crmClientEscapeHtmlV251(message)}">${crmClientEscapeHtmlV251(message)}</small>`
                : ""}
          </div>
        </td>
        <td>${crmClientsWaitingPreferredHtmlV269(item)}</td>
        <td>${crmClientsWaitingContactHtmlV269(item)}</td>
        <td>
          <button type="button"
                  class="btn-secondary crm-clients-request-open-v269"
                  data-crm-waiting-open-v269="${crmClientEscapeHtmlV251(requestId)}">
            Skrzynka
          </button>
        </td>
      </tr>`;
}

function crmClientsHistoryRowHtmlV269(item) {
    const name = String(item?.name || "Nowa osoba");
    const category = String(item?.category || item?.service || "—");
    const message = String(item?.message || "").trim();
    const preferredWindow = String(item?.preferredWindow || "").trim();
    const handledAt = String(item?.handledAt || item?.createdAt || "—");

    return `
      <tr class="crm-clients-request-row-v269 crm-clients-history-row-v269">
        <td>
          <span class="crm-clients-request-status-v269 is-handled">
            OBSŁUŻONE
          </span>
        </td>
        <td>
          <div class="crm-clients-request-person-v269">
            <strong>${crmClientEscapeHtmlV251(name)}</strong>
            <small>${crmClientEscapeHtmlV251(item?.phone || "Brak numeru")}</small>
          </div>
        </td>
        <td>
          <div class="crm-clients-request-category-v269">
            <strong>${crmClientEscapeHtmlV251(category)}</strong>
            ${message
                ? `<small title="${crmClientEscapeHtmlV251(message)}">${crmClientEscapeHtmlV251(message)}</small>`
                : ""}
          </div>
        </td>
        <td>
          <div class="crm-clients-request-preference-v269">
            ${preferredWindow
                ? `<strong>${crmClientEscapeHtmlV251(preferredWindow)}</strong>`
                : `<strong>${crmClientEscapeHtmlV251(crmClientsProposalTextV269(item) || "—")}</strong>`}
            <small>${crmClientEscapeHtmlV251(
                String(item?.businessStatus || item?.status || "")
                    .replaceAll("_", " ")
            )}</small>
          </div>
        </td>
        <td>${crmClientsWaitingContactHtmlV269(item)}</td>
        <td>
          <div class="crm-clients-history-date-v269">
            ${crmClientEscapeHtmlV251(handledAt)}
          </div>
        </td>
      </tr>`;
}

function crmClientsEnsureTabsV269() {
    const chrome = crmEnsureClientsChromeV25222();
    const tab = chrome?.tab || document.getElementById("tab-klienci");
    const pageHeader = tab?.querySelector(".page-header");

    if (!tab || !pageHeader) return null;

    let nav = document.getElementById("crmClientsViewsV269");

    if (!nav) {
        nav = document.createElement("nav");
        nav.id = "crmClientsViewsV269";
        nav.className = "crm-clients-views-v269";
        nav.setAttribute("aria-label", "Widok klientów");

        nav.innerHTML = `
          <button type="button" data-crm-clients-view-v269="steady">
            Klienci stali
            <span id="crmClientsSteadyBadgeV269"></span>
          </button>
          <button type="button" data-crm-clients-view-v269="waiting">
            Osoby oczekujące
            <span id="crmClientsWaitingBadgeV269"></span>
          </button>
          <button type="button" data-crm-clients-view-v269="history">
            Historia
            <span id="crmClientsHistoryBadgeV269"></span>
          </button>`;

        pageHeader.insertAdjacentElement("afterend", nav);

        nav.addEventListener("click", event => {
            const button = event.target.closest("[data-crm-clients-view-v269]");
            if (!button) return;

            crmClientsViewV269 =
                String(button.dataset.crmClientsViewV269 || "steady");

            crmClientUiV25222.page = 1;
            renderClients();

            if (crmClientsViewV269 === "history") {
                crmClientsLoadHistoryV269().catch(console.error);
            }
        });
    }

    return nav;
}

function crmClientsUpdateTabsV269() {
    const nav = crmClientsEnsureTabsV269();
    if (!nav) return;

    const buttons = nav.querySelectorAll("[data-crm-clients-view-v269]");
    buttons.forEach(button => {
        const view = String(button.dataset.crmClientsViewV269 || "");
        button.classList.toggle("is-active", view === crmClientsViewV269);
        button.setAttribute(
            "aria-current",
            view === crmClientsViewV269 ? "page" : "false"
        );
    });

    const steady = document.getElementById("crmClientsSteadyBadgeV269");
    if (steady) {
        steady.textContent =
            String(Array.isArray(customersData) ? customersData.length : 0);
    }

    const waiting = document.getElementById("crmClientsWaitingBadgeV269");
    if (waiting) {
        let count = 0;

        if (crmClientsHasFullInboxCacheV268()) {
            count = crmClientsWaitingRowsV269().length;
        } else {
            count = Math.max(
                0,
                Number(window.crmInboxPendingActionCountV25221) ||
                Number(window.crmInboxPingNewCountV25) ||
                0
            );
        }

        waiting.textContent = String(count);
        waiting.hidden = count === 0;

        const waitingButton = waiting.closest(
            '[data-crm-clients-view-v269="waiting"]'
        );

        if (waitingButton) {
            waitingButton.classList.toggle(
                "has-waiting-v273",
                count > 0
            );
            waitingButton.setAttribute(
                "data-waiting-count-v273",
                String(count)
            );
            waitingButton.setAttribute(
                "aria-label",
                count > 0
                    ? `Osoby oczekujące — ${count}`
                    : "Osoby oczekujące"
            );
        }
    }

    const history = document.getElementById("crmClientsHistoryBadgeV269");
    if (history) {
        const count = Array.isArray(crmClientsHistoryCacheV269)
            ? crmClientsHistoryCacheV269.length
            : 0;

        history.textContent = count ? String(count) : "";
        history.hidden = !count;
    }
}

function crmClientsSetHeaderV269(headers, mode) {
    const table = document.querySelector("#tab-klienci table.admin-table");
    const row = table?.querySelector("thead tr");

    if (!table || !row) return;

    table.classList.remove(
        "crm-clients-mode-steady-v269",
        "crm-clients-mode-waiting-v269",
        "crm-clients-mode-history-v269"
    );

    table.classList.add(`crm-clients-mode-${mode}-v269`);

    row.innerHTML = headers.map(value => `<th>${value}</th>`).join("");
}

function crmClientsConfigureToolbarV269() {
    const toolbar = document.getElementById("crmClientsToolbarV25222");
    if (!toolbar) return;

    const steady = crmClientsViewV269 === "steady";
    const filter = document.getElementById("crmClientsFilterWrapV263");
    const sort = toolbar.querySelector(".crm-clients-sort-v263");
    const search = document.getElementById("crmClientsSearchV25222");
    const add = document.getElementById("addClientBtn");

    if (filter) filter.style.display = steady ? "" : "none";
    if (sort) sort.style.display = steady ? "" : "none";
    if (add) add.style.display = steady ? "" : "none";

    if (search) {
        search.placeholder =
            crmClientsViewV269 === "waiting"
                ? "Szukaj osoby, kategorii, terminu lub kontaktu..."
                : (
                    crmClientsViewV269 === "history"
                        ? "Szukaj w historii pierwszych wizyt..."
                        : "Szukaj klienta po imieniu, nazwisku lub numerze telefonu..."
                );
    }
}

function crmClientsSteadyFilteredRowsV269() {
    const query =
        String(crmClientUiV25222.query || "").trim().toLowerCase();

    let rows =
        Array.isArray(customersData)
            ? customersData.slice()
            : [];

    if (query) {
        rows = rows.filter(client => {
            const haystack =
                `${client?.name || ""} ${client?.phone || ""}`
                    .toLowerCase();

            return haystack.includes(query);
        });
    }

    if (crmClientUiV25222.nextFilter !== "all") {
        rows = rows.filter(client => {
            const hasNext =
                Boolean(crmClientVisitSummaryV25222(client).next);

            return crmClientUiV25222.nextFilter === "has_next"
                ? hasNext
                : !hasNext;
        });
    }

    if (crmClientUiV25222.bookingFilter !== "all") {
        rows = rows.filter(client => {
            const key =
                crmClientPhoneKeyV25222(client?.phone);

            const profile =
                crmClientProfileCacheV25222.get(key);

            if (!profile) return false;

            return (
                crmClientVisibleBookingModeV263(profile) ===
                crmClientUiV25222.bookingFilter
            );
        });
    }

    if (crmClientUiV25222.historyFilter !== "all") {
        rows = rows.filter(client => {
            const key =
                crmClientPhoneKeyV25222(client?.phone);

            const profile =
                crmClientProfileCacheV25222.get(key);

            if (!profile) return false;

            const cancellations =
                Math.max(0, Number(profile.cancellations) || 0);

            const reschedules =
                Math.max(0, Number(profile.reschedules) || 0);

            const noShows =
                Math.max(0, Number(profile.noShows) || 0);

            if (crmClientUiV25222.historyFilter === "no_show") {
                return noShows > 0;
            }

            if (crmClientUiV25222.historyFilter === "cancelled") {
                return cancellations > 0;
            }

            if (crmClientUiV25222.historyFilter === "clean") {
                return (
                    cancellations === 0 &&
                    reschedules === 0 &&
                    noShows === 0
                );
            }

            return true;
        });
    }

    return crmClientSortRowsV263(rows);
}

function crmClientsSteadyRowHtmlV269(client) {
    const phone = String(client?.phone || "");
    const key = crmClientPhoneKeyV25222(phone);
    const profile = crmClientProfileCacheV25222.get(key);
    const visits = crmClientVisitSummaryV25222(client);
    const escapedPhone = crmClientEscapeHtmlV251(phone);
    const name = String(client?.name || "");
    const initials = crmClientInitialsV25222(name);

    return `
      <tr data-crm-client-phone="${escapedPhone}">
        <td>
          <div class="crm-client-person-v25222">
            <span class="crm-client-avatar-v25222">
              ${crmClientEscapeHtmlV251(initials)}
            </span>
            <span>
              <strong>${crmClientEscapeHtmlV251(name || "Klient")}</strong>
              <small>${escapedPhone}</small>
            </span>
          </div>
        </td>
        <td>
          <div class="crm-client-history-v25222" data-crm-client-history>
            ${crmClientHistoryHtmlV25222(client, profile)}
          </div>
        </td>
        <td data-crm-client-booking>
          ${crmClientBookingButtonHtmlV25222(phone, profile)}
        </td>
        <td>
          <div class="crm-client-visit-v25222">
            ${crmClientVisitCellHtmlV25222(visits.last, client?.lastVisit)}
          </div>
        </td>
        <td>
          <div class="crm-client-visit-v25222">
            ${crmClientVisitCellHtmlV25222(visits.next, "")}
          </div>
        </td>
        <td>
          <div class="crm-client-actions-v25222">
            <button type="button"
                    class="btn-secondary"
                    data-crm-client-action="edit"
                    data-crm-phone="${escapedPhone}">
              Edytuj
            </button>
            <button type="button"
                    class="btn-danger"
                    data-crm-client-action="delete"
                    data-crm-phone="${escapedPhone}">
              Usuń
            </button>
          </div>
        </td>
      </tr>`;
}

function crmClientsUpdateFooterV269(total, visibleLength, fromIndex) {
    const pages =
        Math.max(
            1,
            Math.ceil(
                total /
                Math.max(1, crmClientUiV25222.pageSize)
            )
        );

    crmClientUiV25222.page =
        Math.min(
            Math.max(1, crmClientUiV25222.page),
            pages
        );

    const range =
        document.getElementById(
            "crmClientsRangeV25222"
        );

    if (range) {
        const first = total ? fromIndex + 1 : 0;
        const last = total
            ? Math.min(total, fromIndex + visibleLength)
            : 0;

        range.textContent = `${first}–${last} z ${total}`;
    }

    const page =
        document.getElementById(
            "crmClientsPageV25222"
        );

    if (page) {
        page.textContent =
            String(crmClientUiV25222.page);
    }

    const prev =
        document.getElementById(
            "crmClientsPrevV25222"
        );

    const next =
        document.getElementById(
            "crmClientsNextV25222"
        );

    if (prev) {
        prev.disabled =
            crmClientUiV25222.page <= 1;
    }

    if (next) {
        next.disabled =
            crmClientUiV25222.page >= pages;
    }
}

function crmClientsRenderSteadyV269(tbody) {
    crmClientsSetHeaderV269(
        [
            "KLIENT",
            "HISTORIA",
            "REZERWACJA ONLINE",
            "OSTATNIA WIZYTA",
            "NASTĘPNA WIZYTA",
            "AKCJE"
        ],
        "steady"
    );

    const filtered = crmClientsSteadyFilteredRowsV269();
    const total = filtered.length;
    const pageSize = Math.max(1, crmClientUiV25222.pageSize);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    crmClientUiV25222.page =
        Math.min(
            Math.max(1, crmClientUiV25222.page),
            pages
        );

    const fromIndex =
        (crmClientUiV25222.page - 1) *
        pageSize;

    const visible =
        filtered.slice(
            fromIndex,
            fromIndex + pageSize
        );

    tbody.innerHTML =
        visible.length
            ? visible.map(crmClientsSteadyRowHtmlV269).join("")
            : `
              <tr>
                <td colspan="6" class="crm-client-no-results-v25222">
                  ${total === 0 && !crmClientUiV25222.query
                    ? "Brak klientów"
                    : "Brak wyników"}
                </td>
              </tr>`;

    const count =
        document.getElementById(
            "crmClientsCountV25222"
        );

    if (count) {
        const all =
            Array.isArray(customersData)
                ? customersData.length
                : 0;

        const narrowed =
            total !== all ||
            Boolean(crmClientUiV25222.query) ||
            crmClientActiveFilterCountV263() > 0;

        count.textContent =
            narrowed
                ? `${total} z ${crmClientPluralV25222(all, "klienta", "klientów", "klientów")}`
                : crmClientPluralV25222(all, "klient", "klientów", "klientów");
    }

    crmClientSyncToolbarStateV263();
    crmClientsUpdateFooterV269(total, visible.length, fromIndex);

    if (crmClientsTabVisibleV25222()) {
        crmLoadVisibleClientProfilesV25222(visible).catch(console.error);
    }
}

function crmClientsRenderWaitingV269(tbody) {
    crmClientsSetHeaderV269(
        [
            "STATUS",
            "IMIĘ I NAZWISKO",
            "KATEGORIA",
            "PREFEROWANE TERMINY",
            "KONTAKT",
            "AKCJE"
        ],
        "waiting"
    );

    const fullInboxReady =
        crmClientsHasFullInboxCacheV268();

    if (!fullInboxReady) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="crm-client-no-results-v25222">
              Synchronizowanie osób oczekujących…
            </td>
          </tr>`;

        const count =
            document.getElementById(
                "crmClientsCountV25222"
            );

        if (count) {
            count.textContent =
                "Osoby oczekujące";
        }

        crmClientsUpdateFooterV269(0, 0, 0);
        return;
    }

    const query =
        String(crmClientUiV25222.query || "")
            .trim()
            .toLowerCase();

    let rows =
        crmClientsWaitingRowsV269()
            .filter(item =>
                crmClientsWaitingMatchesV269(
                    item,
                    query
                )
            );

    rows = crmClientsWaitingSortV269(rows);

    const total = rows.length;
    const pageSize =
        Math.max(
            1,
            crmClientUiV25222.pageSize
        );

    const pages =
        Math.max(
            1,
            Math.ceil(total / pageSize)
        );

    crmClientUiV25222.page =
        Math.min(
            Math.max(1, crmClientUiV25222.page),
            pages
        );

    const fromIndex =
        (crmClientUiV25222.page - 1) *
        pageSize;

    const visible =
        rows.slice(
            fromIndex,
            fromIndex + pageSize
        );

    if (!visible.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="crm-client-no-results-v25222">
              ${query
                ? "Brak wyników"
                : "Brak osób oczekujących"}
            </td>
          </tr>`;
    } else {
        let html = "";
        let lastState = "";

        visible.forEach(item => {
            const state =
                crmClientsInboxStateV269(item);

            if (state !== lastState) {
                const count =
                    rows.filter(row =>
                        crmClientsInboxStateV269(row) === state
                    ).length;

                html += `
                  <tr class="crm-clients-request-group-v269">
                    <td colspan="6">
                      ${crmClientEscapeHtmlV251(state)}
                      <span>${count}</span>
                    </td>
                  </tr>`;

                lastState = state;
            }

            html += crmClientsWaitingRowHtmlV269(item);
        });

        tbody.innerHTML = html;
    }

    const count =
        document.getElementById(
            "crmClientsCountV25222"
        );

    if (count) {
        count.textContent =
            `${total} ${total === 1 ? "osoba oczekująca" : "osoby oczekujące"}`;
    }

    crmClientsUpdateFooterV269(
        total,
        visible.length,
        fromIndex
    );
}

function crmClientsHistoryMatchesV269(item, query) {
    if (!query) return true;

    const haystack = [
        item?.name,
        item?.phone,
        item?.category,
        item?.service,
        item?.message,
        item?.preferredWindow,
        item?.contactMethod,
        item?.email,
        item?.status,
        item?.handledAt
    ].join(" ").toLowerCase();

    return haystack.includes(query);
}

function crmClientsRenderHistoryV269(tbody) {
    crmClientsSetHeaderV269(
        [
            "STATUS",
            "IMIĘ I NAZWISKO",
            "KATEGORIA",
            "INFORMACJA",
            "KONTAKT",
            "DATA OBSŁUGI"
        ],
        "history"
    );

    if (crmClientsHistoryLoadingV269) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="crm-client-no-results-v25222">
              Ładowanie historii…
            </td>
          </tr>`;

        const count =
            document.getElementById(
                "crmClientsCountV25222"
            );

        if (count) {
            count.textContent =
                "Historia pierwszych wizyt";
        }

        crmClientsUpdateFooterV269(0, 0, 0);
        return;
    }

    if (crmClientsHistoryErrorV269) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="crm-client-no-results-v25222">
              Nie udało się pobrać historii.
              <button type="button"
                      class="btn-secondary"
                      id="crmClientsHistoryRetryV269">
                Spróbuj ponownie
              </button>
            </td>
          </tr>`;

        document.getElementById(
            "crmClientsHistoryRetryV269"
        )?.addEventListener("click", () => {
            crmClientsHistoryCacheV269 = null;
            crmClientsHistoryErrorV269 = "";
            crmClientsLoadHistoryV269({ force:true }).catch(console.error);
        });

        crmClientsUpdateFooterV269(0, 0, 0);
        return;
    }

    if (!Array.isArray(crmClientsHistoryCacheV269)) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="crm-client-no-results-v25222">
              Historia zostanie pobrana po otwarciu tej zakładki.
            </td>
          </tr>`;

        crmClientsUpdateFooterV269(0, 0, 0);
        return;
    }

    const query =
        String(crmClientUiV25222.query || "")
            .trim()
            .toLowerCase();

    const rows =
        crmClientsHistoryCacheV269
            .filter(item =>
                crmClientsHistoryMatchesV269(
                    item,
                    query
                )
            );

    const total = rows.length;
    const pageSize =
        Math.max(
            1,
            crmClientUiV25222.pageSize
        );

    const pages =
        Math.max(
            1,
            Math.ceil(total / pageSize)
        );

    crmClientUiV25222.page =
        Math.min(
            Math.max(1, crmClientUiV25222.page),
            pages
        );

    const fromIndex =
        (crmClientUiV25222.page - 1) *
        pageSize;

    const visible =
        rows.slice(
            fromIndex,
            fromIndex + pageSize
        );

    tbody.innerHTML =
        visible.length
            ? visible.map(crmClientsHistoryRowHtmlV269).join("")
            : `
              <tr>
                <td colspan="6" class="crm-client-no-results-v25222">
                  ${query
                    ? "Brak wyników"
                    : "Brak obsłużonych pierwszych wizyt"}
                </td>
              </tr>`;

    const count =
        document.getElementById(
            "crmClientsCountV25222"
        );

    if (count) {
        count.textContent =
            `${total} ${total === 1 ? "wpis w historii" : "wpisów w historii"}`;
    }

    crmClientsUpdateFooterV269(
        total,
        visible.length,
        fromIndex
    );
}

async function crmClientsLoadHistoryV269(options = {}) {
    if (
        Array.isArray(crmClientsHistoryCacheV269) &&
        options.force !== true
    ) {
        if (crmClientsViewV269 === "history") {
            renderClients();
        }
        return crmClientsHistoryCacheV269;
    }

    if (crmClientsHistoryLoadingV269) {
        return crmClientsHistoryLoadingV269;
    }

    crmClientsHistoryErrorV269 = "";

    const url =
        `${APPS_SCRIPT_URL}?adminClientRequestHistory=true&limit=100&_crmClientsHistory=${Date.now()}`;

    crmClientsHistoryLoadingV269 =
        Promise.resolve()
            .then(async () => {
                if (crmClientsViewV269 === "history") {
                    renderClients();
                }

                if (typeof crmQueuedGetV11 === "function") {
                    return crmQueuedGetV11(
                        url,
                        {
                            key: "adminClientRequestHistoryV269",
                            priority: 55,
                            timeoutMs: 30000
                        }
                    );
                }

                const response =
                    await fetch(
                        url,
                        {
                            method: "GET",
                            cache: "no-store"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "HTTP " + response.status
                    );
                }

                return response.json();
            })
            .then(data => {
                if (
                    !data?.success ||
                    !Array.isArray(data?.items)
                ) {
                    throw new Error(
                        data?.error ||
                        "Nieprawidłowa odpowiedź historii"
                    );
                }

                crmClientsHistoryCacheV269 =
                    data.items;

                return crmClientsHistoryCacheV269;
            })
            .catch(error => {
                crmClientsHistoryErrorV269 =
                    error?.message ||
                    String(error);

                throw error;
            })
            .finally(() => {
                crmClientsHistoryLoadingV269 = null;

                if (crmClientsViewV269 === "history") {
                    renderClients();
                }
            });

    return crmClientsHistoryLoadingV269;
}

async function crmClientsOpenInboxItemV269(requestId) {
    if (typeof crmOpenUnifiedInbox !== "function") {
        return;
    }

    await crmOpenUnifiedInbox();

    const allButton =
        document.querySelector(
            '#crmUnifiedInboxModal [data-inbox-filter="ALL"]'
        );

    if (allButton) {
        allButton.click();
    }

    window.setTimeout(() => {
        const selector =
            `[data-crm-inbox-id="${CSS.escape(String(requestId || ""))}"]`;

        const card =
            document.querySelector(selector);

        if (card) {
            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            card.classList.add(
                "crm-inbox-focus-v269"
            );

            window.setTimeout(() => {
                card.classList.remove(
                    "crm-inbox-focus-v269"
                );
            }, 1800);
        }
    }, 40);
}

function crmClientsInstallRequestActionsV269() {
    const tbody =
        document.getElementById(
            "clientsTableBody"
        );

    if (
        !tbody ||
        tbody.dataset.crmRequestActionsV269 === "1"
    ) {
        return;
    }

    tbody.dataset.crmRequestActionsV269 = "1";

    tbody.addEventListener("click", event => {
        const button =
            event.target.closest(
                "[data-crm-waiting-open-v269]"
            );

        if (!button) return;

        const id =
            String(
                button.dataset.crmWaitingOpenV269 ||
                ""
            );

        crmClientsOpenInboxItemV269(id)
            .catch(console.error);
    });
}

/*
 * FINALNY render.
 * Nie wywołujemy starszego renderu mieszanego,
 * dzięki czemu osoby oczekujące są już osobną zakładką.
 */
renderClients = function() {
    const chrome =
        crmEnsureClientsChromeV25222();

    const tbody =
        document.getElementById(
            "clientsTableBody"
        );

    if (!tbody) return;

    crmEnsureClientTableDelegationV251(tbody);
    crmEnsureClientTableActionsV25222(tbody);
    crmClientsInstallRequestActionsV269();
    crmClientsEnsureTabsV269();
    crmClientsConfigureToolbarV269();

    if (crmClientsViewV269 === "waiting") {
        crmClientsRenderWaitingV269(tbody);
    } else if (crmClientsViewV269 === "history") {
        crmClientsRenderHistoryV269(tbody);
    } else {
        crmClientsRenderSteadyV269(tbody);
    }

    crmClientsUpdateTabsV269();

    /*
     * V26.8: pełna Skrzynka tylko po renderze i tylko w tle.
     * Zachowujemy to także dla nowego finalnego widoku.
     */
    if (crmClientsTabVisibleV25222()) {
        crmClientsScheduleInboxHydrationV268();
    }

    return chrome;
};

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmClientsEnsureTabsV269();
        crmClientsUpdateTabsV269();

        if (crmClientsTabVisibleV25222()) {
            renderClients();
        }
    }, 650);
});

/* KONIEC CLIENTS V26.9 */



/* ==========================================================================
   CLIENTS V27.3 — CZYTELNIEJSZE ZAKŁADKI + ALERT OCZEKUJĄCYCH
   - większe zakładki
   - klasa .has-waiting-v273 gdy count > 0
   - bez nowych requestów / pollingu / zmian backendu
   ========================================================================== */
