// BUILD MARKER: V30.32 — BOOKSY EDIT IDENTITY GUARD
/* ==========================================================================
   VIS. WIZYTY I PRAWY PANEL
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ADMIN PERFORMANCE V25.2 2026-08-19
   Bazuje na V25.1; zachowuje wszystkie optymalizacje V24/V25.1.

   ADMIN PERFORMANCE V24 2026-08-19
   - zapis/edycja wizyty od razu aktualizuje appointmentsData także przy edycji;
   - blokada create/edit/delete od razu aktualizuje RAM i cache;
   - drugi odczyt Kalendarza po blokadzie jest wyłącznie w tle;
   - brak zmian w INDEX i Google Apps Script. */

/* ----- VIS.1. appointmentsData (oryginalna linia 24) ----- */
let appointmentsData = [];

/* ----- VIS.2. currentEditingAppointment (oryginalna linia 30) ----- */
let currentEditingAppointment = null;

/* ----- VIS.3. isDeletingAppointment (oryginalna linia 36) ----- */
let isDeletingAppointment = false;

/* ----- VIS.4. isSavingAppointment (oryginalna linia 37) ----- */
let isSavingAppointment = false;

/* ----- VIS.5. renderAppointmentCard (oryginalna linia 998) ----- */
/* ==========================================================
   EVENT CARD
   ========================================================== */

function renderAppointmentCard(app,container){

    const card =
        document.createElement("div");

    card.className =
        "booksy-event-card";

    let color =
        "#b05c75";

    const isBlock = app.eventType === "block";
    const isWorkShift = app.eventType === "work_shift";

    const isExternal =
        app.eventType === "external" ||
        (app.phone === "Google Calendar" && !isBlock && !isWorkShift);

    if (isBlock) {
        color = "#8c6b4f";
        card.classList.add("booksy-block-card");
    }
    else if(isExternal){
        color = "#555555";
    }
    else if(isWorkShift){
        color = "#f2c94c";
        card.style.color = "#111";
        card.classList.add("booksy-work-shift-card");
    }
    else{

        const service =
            currentServices.find(
                s =>
                s.name &&
                app.service &&
                s.name.trim()
                .toLowerCase()
                ===
                app.service.trim()
                .toLowerCase()
            );

        if(
            service &&
            globalColors[
                service.category
            ]
        ){

            color =
                globalColors[
                    service.category
                ];

        }

    }

    card.style.background =
        color;

    if (isWorkShift) {
        card.innerHTML = `<strong>${app.name || "Brak"}</strong>`;
        card.onclick = null;
        card.style.cursor = "default";
    } else {
        card.innerHTML = `
            <strong>${app.name}</strong>
            <br>
            ${app.service}
            <br>
            ${app.date}
        `;
        card.onclick = () => openAppointmentDetailsModal(app);
    }

    container.appendChild(
        card
    );

}

/* ----- VIS.6. populateAppointmentDropdowns (oryginalna linia 1086) ----- */
/* ==========================================================
   APPOINTMENT AUTOCOMPLETE / DATALISTS
   ========================================================== */

function populateAppointmentDropdowns() {

    populateAppointmentDatalists();

}

/* ----- VIS.6.1. Dwustopniowy wybór usługi: kategoria -> usługa (ADMIN V30.15) ----- */
function crmAppointmentServicesV3015() {
    return (Array.isArray(currentServices) ? currentServices : [])
        .filter(item => item && String(item.name || "").trim());
}

function crmAppointmentServiceCategoriesV3015() {
    const seen = new Set();
    const result = [];
    crmAppointmentServicesV3015().forEach(item => {
        const category = String(item.category || "Inne").trim() || "Inne";
        const key = category.toLocaleLowerCase("pl-PL");
        if (seen.has(key)) return;
        seen.add(key);
        result.push(category);
    });
    return result;
}

/* ADMIN V30.20: jeden jawny builder pełnego selecta kategorii.
   Źródłem jest wyłącznie currentServices — nigdy aktualne optiony DOM.
   Dzięki temu Edytuj / Zmień usługę / Dodaj wizytę nie dziedziczą
   zawężonej listy z poprzedniego otwarcia formularza. */
function crmRebuildAppointmentServiceCategorySelectV3020(selectedCategory) {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    if (!categorySelect) return [];

    const categories = crmAppointmentServiceCategoriesV3015();
    const wanted = String(selectedCategory || "").trim();

    categorySelect.disabled = false;
    categorySelect.innerHTML = '<option value="">Wybierz kategorię</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    const exact = categories.find(category =>
        String(category).toLocaleLowerCase("pl-PL") === wanted.toLocaleLowerCase("pl-PL")
    );
    categorySelect.value = exact || "";
    return categories;
}
window.crmRebuildAppointmentServiceCategorySelectV3020 = crmRebuildAppointmentServiceCategorySelectV3020;

/* ADMIN V30.17: picker usługi ma własny szybki odczyt Cennika DOM.
   Poprzednia wersja 30.16 korzystała z crmLoadServicesPrimaryV2(), czyli wspólnej kolejki
   odczytów serwera. Przy zajętej kolejce select potrafił długo wisieć na
   „Ładowanie kategorii…”. Zmiana usługi jest akcją użytkownika, więc ma dostać
   bezpośredni, limitowany czasowo odczyt i nie może czekać w tle bez końca. */
const CRM_APPOINTMENT_SERVICES_CACHE_V3017 = "crm_appointment_services_v3017";
let crmAppointmentServicesLoadPromiseV3017 = null;

function crmRestoreAppointmentServicesCacheV3017() {
    if (crmAppointmentServicesV3015().length) return true;
    try {
        const raw = window.sessionStorage?.getItem(CRM_APPOINTMENT_SERVICES_CACHE_V3017);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || !data.length) return false;
        currentServices = data;
        return true;
    } catch (error) {
        console.warn("Nie udało się odczytać podręcznego Cennika DOM:", error);
        return false;
    }
}

function crmRememberAppointmentServicesV3017(data) {
    try {
        if (Array.isArray(data) && data.length) {
            window.sessionStorage?.setItem(CRM_APPOINTMENT_SERVICES_CACHE_V3017, JSON.stringify(data));
        }
    } catch (error) {
        console.warn("Nie udało się zapisać podręcznego Cennika DOM:", error);
    }
}

/* ADMIN V30.18: picker najpierw korzysta z danych, które ADMIN już ma.
   Kalendarz może być widoczny z cache zanim zakończy się świeży bootstrap Google.
   Nie uruchamiamy wtedy drugiego równoległego getPrices — najpierw bierzemy usługi
   z cache V18/V19 albo czekamy krótko na istniejący bootstrap V19.1. */
window.crmAppointmentPickerSourceV3018 = window.crmAppointmentPickerSourceV3018 || "";

function crmUseAppointmentServicesV3018(data, source) {
    const list = Array.isArray(data)
        ? data.filter(item => item && String(item.name || "").trim())
        : [];
    if (!list.length) return false;

    currentServices = list;
    window.crmAppointmentPickerSourceV3018 = String(source || "unknown");
    crmRememberAppointmentServicesV3017(list);
    try { if (typeof renderServicesTable === "function") renderServicesTable(); } catch (ignore) {}
    try { if (typeof crmAdminSyncDomPriceCountV28 === "function") crmAdminSyncDomPriceCountV28(); } catch (ignore) {}
    return true;
}

function crmRestoreAppointmentServicesFromAdminCachesV3018() {
    if (crmAppointmentServicesV3015().length) {
        window.crmAppointmentPickerSourceV3018 = "currentServices";
        crmRememberAppointmentServicesV3017(currentServices);
        return true;
    }

    if (crmRestoreAppointmentServicesCacheV3017()) {
        window.crmAppointmentPickerSourceV3018 = "picker-session-cache";
        return true;
    }

    try {
        if (typeof crmPerfReadCacheV18 === "function") {
            const cached = crmPerfReadCacheV18();
            if (crmUseAppointmentServicesV3018(cached?.services, "bootstrap-session-v18")) return true;
        }
    } catch (ignore) {}

    try {
        const raw = window.sessionStorage?.getItem("crm_admin_bootstrap_v18");
        const parsed = raw ? JSON.parse(raw) : null;
        if (crmUseAppointmentServicesV3018(parsed?.data?.services, "bootstrap-session-raw")) return true;
    } catch (ignore) {}

    try {
        if (typeof crmPerfReadPersistentCacheV19 === "function") {
            const cached = crmPerfReadPersistentCacheV19();
            if (crmUseAppointmentServicesV3018(cached?.data?.services, "bootstrap-persistent-v19")) return true;
        }
    } catch (ignore) {}

    try {
        const raw = window.localStorage?.getItem("crm_admin_bootstrap_persist_v19");
        const parsed = raw ? JSON.parse(raw) : null;
        if (crmUseAppointmentServicesV3018(parsed?.data?.services, "bootstrap-persistent-raw")) return true;
    } catch (ignore) {}

    return false;
}

async function crmAwaitExistingBootstrapServicesV3018(timeoutMs = 7000) {
    if (crmRestoreAppointmentServicesFromAdminCachesV3018()) return true;

    const fresh = window.crmPerfFreshBootstrapPromiseV191;
    if (!fresh || typeof fresh.then !== "function") return false;

    let timer = null;
    try {
        await Promise.race([
            Promise.resolve(fresh).catch(() => null),
            new Promise(resolve => {
                timer = window.setTimeout(resolve, Math.max(500, Number(timeoutMs) || 7000));
            })
        ]);
    } finally {
        if (timer) window.clearTimeout(timer);
    }

    if (crmAppointmentServicesV3015().length) {
        window.crmAppointmentPickerSourceV3018 = "fresh-bootstrap-v19.1";
        crmRememberAppointmentServicesV3017(currentServices);
        return true;
    }
    return crmRestoreAppointmentServicesFromAdminCachesV3018();
}

function crmRenderAppointmentServiceLoadErrorV3018(message) {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");

    if (categorySelect) {
        categorySelect.disabled = false;
        categorySelect.innerHTML = '<option value="__retry__">Nie udało się — kliknij, aby ponowić</option>';
        categorySelect.value = "__retry__";
        categorySelect.title = String(message || "Nie udało się załadować Cennika DOM");
    }
    if (serviceSelect) {
        serviceSelect.disabled = true;
        serviceSelect.innerHTML = '<option value="">Najpierw wczytaj kategorie</option>';
    }
    if (durationInput) {
        durationInput.value = "";
        durationInput.disabled = true;
        durationInput.placeholder = "Wybierz usługę";
    }
}

async function crmReloadAppointmentServicePickerV3018() {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");
    if (categorySelect) {
        categorySelect.disabled = true;
        categorySelect.innerHTML = '<option value="">Ładowanie kategorii…</option>';
    }
    if (serviceSelect) {
        serviceSelect.disabled = true;
        serviceSelect.innerHTML = '<option value="">Najpierw wybierz kategorię</option>';
    }

    const ready = await crmEnsureAppointmentServicesV3018();
    if (!ready) {
        crmRenderAppointmentServiceLoadErrorV3018("Cennik DOM nie odpowiedział. Kliknij pole kategorii, aby spróbować ponownie.");
        return false;
    }
    populateAppointmentDropdowns();
    crmSetAppointmentServiceSelectionV3015("", { clear:true });
    return true;
}
window.crmReloadAppointmentServicePickerV3018 = crmReloadAppointmentServicePickerV3018;

async function crmFetchAppointmentServicesDirectV3017() {
    const separator = String(APPS_SCRIPT_URL || "").includes("?") ? "&" : "?";
    const url = `${APPS_SCRIPT_URL}${separator}getPrices=true&_appointmentPicker=${Date.now()}`;

    let data = null;
    if (typeof crmFetchJsonV12 === "function") {
        data = await crmFetchJsonV12(url, { timeoutMs: 15000 });
    } else {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        let timer = null;
        try {
            const timeout = new Promise((_, reject) => {
                timer = window.setTimeout(() => {
                    try { controller?.abort(); } catch (ignore) {}
                    reject(new Error("Cennik DOM nie odpowiedział w ciągu 15 s."));
                }, 15000);
            });
            const request = (async () => {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-store",
                    signal: controller ? controller.signal : undefined
                });
                const text = await response.text();
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return JSON.parse(text);
            })();
            data = await Promise.race([request, timeout]);
        } finally {
            if (timer) window.clearTimeout(timer);
        }
    }

    if (!Array.isArray(data) || !data.length) {
        throw new Error("Cennik DOM nie zwrócił listy usług.");
    }

    currentServices = data;
    crmRememberAppointmentServicesV3017(data);
    if (typeof renderServicesTable === "function") renderServicesTable();
    if (typeof crmAdminSyncDomPriceCountV28 === "function") crmAdminSyncDomPriceCountV28();
    return data;
}

async function crmEnsureAppointmentServicesV3017() {
    if (crmAppointmentServicesV3015().length) {
        crmRememberAppointmentServicesV3017(currentServices);
        return true;
    }

    if (crmRestoreAppointmentServicesCacheV3017()) return true;

    if (!crmAppointmentServicesLoadPromiseV3017) {
        crmAppointmentServicesLoadPromiseV3017 = (async () => {
            try {
                await crmFetchAppointmentServicesDirectV3017();
                return crmAppointmentServicesV3015().length > 0;
            } catch (directError) {
                console.warn("Bezpośredni odczyt Cennika DOM nie powiódł się:", directError);

                /* Awaryjnie próbujemy istniejącym loaderem, ale maksymalnie 12 s.
                   Nie pozwalamy już zostawić selecta w stanie „Ładowanie…” bez końca. */
                if (typeof crmLoadServicesPrimaryV2 === "function") {
                    try {
                        let timer = null;
                        const timeout = new Promise((_, reject) => {
                            timer = window.setTimeout(() => reject(new Error("Awaryjny odczyt Cennika DOM przekroczył 12 s.")), 12000);
                        });
                        try {
                            await Promise.race([Promise.resolve(crmLoadServicesPrimaryV2()), timeout]);
                        } finally {
                            if (timer) window.clearTimeout(timer);
                        }
                    } catch (fallbackError) {
                        console.warn("Awaryjny odczyt Cennika DOM nie powiódł się:", fallbackError);
                    }
                }

                if (crmAppointmentServicesV3015().length) {
                    crmRememberAppointmentServicesV3017(currentServices);
                    return true;
                }
                return false;
            }
        })().finally(() => {
            crmAppointmentServicesLoadPromiseV3017 = null;
        });
    }

    return crmAppointmentServicesLoadPromiseV3017;
}

async function crmEnsureAppointmentServicesV3018() {
    if (crmRestoreAppointmentServicesFromAdminCachesV3018()) return true;

    /* Najważniejsza ścieżka dla zwykłego startu strony: czekamy na request bootstrap,
       który ADMIN już uruchomił. Nie tworzymy od razu drugiego requestu do Google. */
    if (await crmAwaitExistingBootstrapServicesV3018(7000)) return true;

    /* Dopiero gdy ADMIN naprawdę nie ma usług ani w cache, ani w bieżącym bootstrapie,
       uruchamiamy ograniczony czasowo odczyt awaryjny. */
    let timer = null;
    try {
        const pending = Promise.resolve(crmEnsureAppointmentServicesV3017());
        const result = await Promise.race([
            pending,
            new Promise(resolve => {
                timer = window.setTimeout(() => resolve(false), 9000);
            })
        ]);

        if (result && crmAppointmentServicesV3015().length) {
            window.crmAppointmentPickerSourceV3018 = window.crmAppointmentPickerSourceV3018 || "fallback-getPrices";
            return true;
        }

        /* Jeśli Google odpowie później, odśwież picker automatycznie — bez ponownego kliknięcia. */
        pending.then(ok => {
            if (!ok || !crmAppointmentServicesV3015().length) return;
            const modal = document.getElementById("appointmentModal");
            if (!modal || getComputedStyle(modal).display === "none") return;
            populateAppointmentDropdowns();
            crmSetAppointmentServiceSelectionV3015("", { clear:true });
            window.crmAppointmentPickerSourceV3018 = "late-fallback-getPrices";
        }).catch(() => {});

        return false;
    } finally {
        if (timer) window.clearTimeout(timer);
    }
}

function crmPopulateAppointmentServiceOptionsV3015(category, selectedService) {
    const serviceSelect = document.getElementById("appointmentService");
    if (!serviceSelect) return;

    const normalizedCategory = String(category || "").trim();
    const wantedService = String(selectedService || "").trim();
    serviceSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = normalizedCategory
        ? "Wybierz usługę"
        : "Najpierw wybierz kategorię";
    serviceSelect.appendChild(placeholder);

    if (!normalizedCategory) {
        serviceSelect.disabled = true;
        serviceSelect.value = "";
        return;
    }

    const services = crmAppointmentServicesV3015().filter(item =>
        String(item.category || "Inne").trim() === normalizedCategory
    );

    services.forEach(item => {
        const option = document.createElement("option");
        option.value = String(item.name || "").trim();
        option.textContent = option.value;
        serviceSelect.appendChild(option);
    });

    serviceSelect.disabled = false;
    serviceSelect.value = services.some(item => String(item.name || "").trim() === wantedService)
        ? wantedService
        : "";
}

function populateServiceNameDatalist(selectedCategory, selectedService) {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");
    if (!categorySelect || !serviceSelect) return;

    const previousCategory = selectedCategory !== undefined
        ? String(selectedCategory || "")
        : String(categorySelect.value || "");
    const previousService = selectedService !== undefined
        ? String(selectedService || "")
        : String(serviceSelect.value || "");

    crmRebuildAppointmentServiceCategorySelectV3020(previousCategory);
    crmPopulateAppointmentServiceOptionsV3015(categorySelect.value, previousService);
}

/* ADMIN V30.19: przy zwykłej edycji zachowujemy i pokazujemy kategorię
   bieżącej usługi od razu, zamiast zostawiać pole kategorii na "Ładowanie...".
   Najpierw próbujemy dokładnego Cennika DOM, a gdy nie jest jeszcze dostępny
   — bezpiecznej podpowiedzi z danych wizyty/nazwy usługi. */
function crmInferAppointmentCategoryV3019(appointmentOrService) {
    const appointment = appointmentOrService && typeof appointmentOrService === "object"
        ? appointmentOrService
        : null;
    const serviceName = String(appointment ? (appointment.service || "") : (appointmentOrService || "")).trim();
    const rawCategory = String(appointment?.category || "").trim();

    if (serviceName) {
        const exact = crmAppointmentServicesV3015().find(item =>
            String(item.name || "").trim().toLocaleLowerCase("pl-PL") ===
            serviceName.toLocaleLowerCase("pl-PL")
        );
        if (exact) return String(exact.category || "Inne").trim() || "Inne";
    }

    const knownCategories = crmAppointmentServiceCategoriesV3015();
    if (rawCategory && !/^(inne|do_weryfikacji|blokada)$/i.test(rawCategory)) {
        const exactCategory = knownCategories.find(category =>
            String(category).toLocaleLowerCase("pl-PL") === rawCategory.toLocaleLowerCase("pl-PL")
        );
        if (exactCategory) return exactCategory;
    }

    const text = `${rawCategory} ${serviceName}`.toLocaleLowerCase("pl-PL");
    if (/pedicure|st[oó]p|paluszk/.test(text)) return "Pedicure";
    if (/manicure|paznok|paznokci|żel|hybryd|r[eę]ce/.test(text)) return "Manicure";
    if (/napraw|zdobieni|ści[aą]gni|french|baby boomer|gradient|ombre|masaż/.test(text)) return "Dodatki";

    return rawCategory && !/^(inne|do_weryfikacji|blokada)$/i.test(rawCategory)
        ? rawCategory
        : "";
}

function crmPrimeAppointmentServiceFieldsV3019(appointment) {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");
    if (!categorySelect || !serviceSelect || !appointment) return;

    const serviceName = String(appointment.service || "").trim();
    const inferredCategory = crmInferAppointmentCategoryV3019(appointment);

    /* V30.20: nawet przy zwykłej edycji budujemy PEŁNĄ listę kategorii,
       a dopiero potem zaznaczamy kategorię bieżącej usługi. */
    crmRebuildAppointmentServiceCategorySelectV3020(inferredCategory);
    crmPopulateAppointmentServiceOptionsV3015(categorySelect.value, serviceName);

    if (serviceName && serviceSelect.value !== serviceName) {
        const current = document.createElement("option");
        current.value = serviceName;
        current.textContent = `Obecna wartość: ${serviceName}`;
        serviceSelect.insertBefore(current, serviceSelect.firstChild?.nextSibling || null);
        serviceSelect.disabled = false;
        serviceSelect.value = serviceName;
    }

    if (durationInput) {
        durationInput.disabled = false;
        durationInput.placeholder = "";
        durationInput.value = appointment.duration || durationInput.value || 45;
    }
}

function crmSetAppointmentServiceSelectionV3015(serviceName, options) {
    const config = options || {};
    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");
    if (!categorySelect || !serviceSelect) return;

    crmRebuildAppointmentServiceCategorySelectV3020("");

    if (config.clear === true) {
        categorySelect.value = "";
        crmPopulateAppointmentServiceOptionsV3015("", "");
        if (durationInput) {
            durationInput.value = "";
            durationInput.disabled = true;
            durationInput.placeholder = "Wybierz usługę";
        }
        return;
    }

    const wanted = String(serviceName || "").trim();
    const matched = crmAppointmentServicesV3015().find(item =>
        String(item.name || "").trim().toLocaleLowerCase("pl-PL") ===
        wanted.toLocaleLowerCase("pl-PL")
    );

    if (matched) {
        const category = String(matched.category || "Inne").trim() || "Inne";
        categorySelect.value = category;
        crmPopulateAppointmentServiceOptionsV3015(category, String(matched.name || "").trim());
        if (durationInput) {
            durationInput.disabled = false;
            durationInput.placeholder = "";
            if (matched.duration) durationInput.value = matched.duration;
        }
        return;
    }

    // Historyczna/niepełna nazwa, np. "brwi": przy zwykłej edycji zachowujemy ją.
    // V30.19: jeśli potrafimy wskazać kategorię, zostawiamy ją zaznaczoną i jednocześnie
    // pokazujemy poprawne usługi z tej kategorii. Dzięki temu można od razu zastąpić
    // historyczny opis dokładną procedurą z Cennika DOM.
    const preferredCategory = String(config.preferredCategory || "").trim();
    const availableCategories = crmAppointmentServiceCategoriesV3015();
    const resolvedCategory = availableCategories.find(category =>
        String(category).toLocaleLowerCase("pl-PL") === preferredCategory.toLocaleLowerCase("pl-PL")
    ) || "";

    if (resolvedCategory) {
        categorySelect.value = resolvedCategory;
        crmPopulateAppointmentServiceOptionsV3015(resolvedCategory, "");
        const currentOption = document.createElement("option");
        currentOption.value = wanted;
        currentOption.textContent = wanted ? `Obecna wartość: ${wanted}` : "Wybierz usługę";
        serviceSelect.insertBefore(currentOption, serviceSelect.firstChild?.nextSibling || null);
        serviceSelect.value = wanted;
    } else {
        categorySelect.value = "";
        serviceSelect.innerHTML = "";
        const option = document.createElement("option");
        option.value = wanted;
        option.textContent = wanted ? `Obecna wartość: ${wanted}` : "Najpierw wybierz kategorię";
        serviceSelect.appendChild(option);
        serviceSelect.value = wanted;
        serviceSelect.disabled = false;
    }

    if (durationInput) {
        durationInput.disabled = false;
        durationInput.placeholder = "";
    }
}

function handleAppointmentServiceCategoryChange() {
    const categorySelect = document.getElementById("appointmentServiceCategory");
    if (!categorySelect) return;

    if (categorySelect.value === "__retry__") {
        crmReloadAppointmentServicePickerV3018();
        return;
    }

    crmPopulateAppointmentServiceOptionsV3015(categorySelect.value, "");

    const durationInput = document.getElementById("appointmentDuration");
    if (durationInput) {
        durationInput.value = "";
        durationInput.disabled = true;
        durationInput.placeholder = categorySelect.value ? "Wybierz usługę" : "Najpierw wybierz kategorię";
    }

    const serviceSelect = document.getElementById("appointmentService");
    if (serviceSelect && !serviceSelect.disabled) serviceSelect.focus();
}

/* ----- VIS.7. populateAppointmentDatalists (oryginalna linia 1092) ----- */
function populateAppointmentDatalists() {

    populateClientNameDatalist();

    populateClientPhoneDatalist();

    populateServiceNameDatalist();

}

/* ----- VIS.8. handleAppointmentNameInput (oryginalna linia 1248) ----- */
function handleAppointmentNameInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedName =
        nameInput.value
            .trim()
            .toLowerCase();

    if (!typedName) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.name &&
                item.name
                    .toString()
                    .trim()
                    .toLowerCase() === typedName
            );
        });

    if (client) {
        phoneInput.value =
            client.phone || "";
    }

}

/* ----- VIS.9. handleAppointmentPhoneInput (oryginalna linia 1291) ----- */
function handleAppointmentPhoneInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedPhone =
        phoneInput.value.trim();

    if (!typedPhone) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone
                    .toString()
                    .trim() === typedPhone
            );
        });

    if (client) {
        nameInput.value =
            client.name || "";
    }

}

/* ----- VIS.10. handleAppointmentServiceInput (oryginalna linia 1331) ----- */
function handleAppointmentServiceInput() {

    const serviceInput = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");
    const categoryInput = document.getElementById("appointmentServiceCategory");

    if (!serviceInput || !durationInput) return;

    const selectedService = String(serviceInput.value || "").trim();
    if (!selectedService) {
        durationInput.value = "";
        durationInput.disabled = true;
        durationInput.placeholder = "Wybierz usługę";
        return;
    }

    const service = crmAppointmentServicesV3015().find(item =>
        String(item.name || "").trim() === selectedService
    );

    if (service) {
        durationInput.disabled = false;
        durationInput.placeholder = "";
        durationInput.value = service.duration || 45;
        if (categoryInput) categoryInput.value = String(service.category || "Inne").trim() || "Inne";
    }

}

/* ----- VIS.11. saveAppointment (oryginalna linia 1376) ----- */
/* ==========================================================
   CREATE APPOINTMENT
   ========================================================== */
async function saveAppointment() {

    if (isSavingAppointment) {
        return;
    }

    const name =
        document.getElementById(
            "appointmentName"
        ).value.trim();

    const phone =
        document.getElementById(
            "appointmentPhone"
        ).value.trim();

    const service =
        document.getElementById(
            "appointmentService"
        ).value.trim();

    const category = String(
        document.getElementById("appointmentServiceCategory")?.value ||
        crmAppointmentServicesV3015().find(item => String(item.name || "").trim() === service)?.category ||
        currentEditingAppointment?.category ||
        ""
    ).trim();

    const duration =
        Number(
            document.getElementById(
                "appointmentDuration"
            ).value
        ) || 45;

    const dateValue =
        document.getElementById(
            "appointmentDateTime"
        ).value;

    const isBooksyEditV3021 =
        Boolean(
            currentEditingAppointment &&
            typeof crmIsBooksyVisitV3021 === "function" &&
            crmIsBooksyVisitV3021(currentEditingAppointment)
        );

    if (
        !name ||
        (!phone && !isBooksyEditV3021) ||
        !service ||
        !dateValue
    ) {
        alert(
            isBooksyEditV3021
                ? "Uzupełnij klienta, usługę i termin wizyty."
                : "Uzupełnij wszystkie pola wizyty."
        );
        return;
    }

    const saveBtn =
        document.getElementById(
            "saveAppointmentBtn"
        );

    isSavingAppointment = true;

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText =
            currentEditingAppointment
                ? "Aktualizowanie..."
                : "Zapisywanie...";
    }

    const payload = {
        action:
        "createBooking",

        bookingSource:
        "ADMIN",

        phone:
        phone,

        name:
        name,

        service:
        service,

        category:
        category,

        date:
        dateValue,

        duration:
        duration,

        rodo:
        currentEditingAppointment
            ? "Edytowano z CRM"
            : "Dodano z CRM"
    };

    /*
     * Rezerwacja uruchomiona ze Skrzynki ADMIN.
     * ID zgłoszenia jedzie w tym samym żądaniu co zapis wizyty,
     * więc zgłoszenie zostanie oznaczone OBSŁUŻONE dopiero po sukcesie.
     */
    const pendingContactRequest =
        (!currentEditingAppointment &&
         window.crmPendingContactRequestForBooking &&
         window.crmPendingContactRequestForBooking.id)
            ? window.crmPendingContactRequestForBooking
            : null;

    if (pendingContactRequest) {
        payload.contactRequestId = pendingContactRequest.id;
        payload.bookingSource = "FORM_FIRST";
        payload.sourceRequestId = pendingContactRequest.id;
    } else if (!currentEditingAppointment) {
        payload.bookingSource = "ADMIN";
    }

    if (
        currentEditingAppointment
    ) {

        const oldEventId =
            currentEditingAppointment.eventId || "";

        if (
            !oldEventId
        ) {
            alert(
                "Nie można edytować wizyty, bo brakuje Event ID. Odśwież kalendarz i spróbuj ponownie."
            );

            isSavingAppointment = false;

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = "Zapisz wizytę";
            }

            return;
        }

        payload.editFlag =
            true;

        payload.oldEventId =
            oldEventId;

        payload.oldDate =
            currentEditingAppointment.date;

        payload.oldName =
            currentEditingAppointment.name;

        if (
            typeof crmBooksyEditSourceMetadataV3021 === "function" &&
            crmIsBooksyVisitV3021(currentEditingAppointment)
        ) {
            const booksyMetaV3021 = crmBooksyEditSourceMetadataV3021(currentEditingAppointment);
            payload.bookingSource = "ADMIN";
            payload.preserveBookingSource = booksyMetaV3021.preserveBookingSource;
            payload.sourceRequestId = booksyMetaV3021.sourceRequestId;
            payload.rodo = "Edytowano tylko w CRM — źródło Booksy zachowane";
        }

    }

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify(
                        payload
                    )
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            const successMessage =
                currentEditingAppointment
                    ? "Wizyta została zaktualizowana."
                    : "Wizyta została dodana.";

            currentEditingAppointment =
                null;

            /*
             * Po sukcesie zamykamy formularz bez pytania o niezapisane zmiany.
             * Wcześniej asynchroniczna ochrona formularza mogła zostawić modal
             * widoczny mimo poprawnego zapisu.
             */
            await closeCreateAppointmentModal(true);

            if (pendingContactRequest) {
                window.crmPendingContactRequestForBooking = null;

                // Skrzynka odświeża się w tle; nie blokuje zamknięcia modala.
                Promise.resolve().then(() => {
                    if (typeof crmLoadUnifiedInbox === "function") {
                        return crmLoadUnifiedInbox({ silent: true, force: true });
                    }
                    return null;
                }).catch(error => console.error("Odświeżanie Skrzynki po zapisie wizyty:", error));
            }

            if (typeof crmToast === "function") {
                crmToast(successMessage);
            }

            await loadSettings();
            if (typeof crmRememberAppointmentsAsSeen === "function") crmRememberAppointmentsAsSeen();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd zapisu wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas zapisu wizyty."
        );

    } finally {

        isSavingAppointment = false;

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "Zapisz wizytę";
        }

    }

}

/* ----- VIS.12. openEditAppointmentModal (oryginalna linia 1628) ----- */
async function openEditAppointmentModal(options) {

    if (isDeletingAppointment) {
        return;
    }

    if (currentEditingAppointment && currentEditingAppointment.eventType === "block") {
        openEditBlockTimeModal(currentEditingAppointment);
        return;
    }

    if (!currentEditingAppointment) {
        alert(
            "Nie wybrano wizyty do edycji."
        );
        return;
    }

    const editOptions = options || {};

    const categorySelect = document.getElementById("appointmentServiceCategory");
    const serviceSelect = document.getElementById("appointmentService");

    if (editOptions.changeService !== true) {
        // V30.19: zwykła edycja ma od razu pokazać obecną kategorię/usługę,
        // nawet jeśli pełny Cennik DOM jest jeszcze doładowywany w tle.
        crmPrimeAppointmentServiceFieldsV3019(currentEditingAppointment);
    }

    if (editOptions.changeService === true) {
        if (categorySelect) {
            categorySelect.disabled = true;
            categorySelect.innerHTML = '<option value="">Ładowanie kategorii…</option>';
        }
        if (serviceSelect) {
            serviceSelect.disabled = true;
            serviceSelect.innerHTML = '<option value="">Najpierw wybierz kategorię</option>';
        }

        /* V30.18: formularz pokazujemy od razu. Użytkownik widzi, że kliknięcie zadziałało,
           a ładowanie odbywa się wewnątrz pola kategorii. */
        const modalTitle = document.getElementById("modalTitleAppointment");
        if (modalTitle) modalTitle.innerText = "Zmień usługę wizyty";
        const nameInput = document.getElementById("appointmentName");
        const phoneInput = document.getElementById("appointmentPhone");
        const durationInput = document.getElementById("appointmentDuration");
        const dateInput = document.getElementById("appointmentDateTime");
        if (nameInput) nameInput.value = currentEditingAppointment.name || "";
        if (phoneInput) phoneInput.value = currentEditingAppointment.phone || "";
        if (durationInput) {
            durationInput.value = "";
            durationInput.disabled = true;
            durationInput.placeholder = "Wybierz usługę";
        }
        if (dateInput) dateInput.value = formatDateTimeLocalValue(currentEditingAppointment.date);
        closeAppointmentModal();
        const editorModal = document.getElementById("appointmentModal");
        if (editorModal) editorModal.style.display = "flex";
    }

    const servicesReady = await crmEnsureAppointmentServicesV3018();
    populateAppointmentDropdowns();

    if (categorySelect) categorySelect.disabled = false;
    if (!servicesReady && editOptions.changeService === true && categorySelect) {
        categorySelect.innerHTML = '<option value="">Nie udało się załadować kategorii</option>';
    }

    document.getElementById(
        "modalTitleAppointment"
    ).innerText =
        editOptions.changeService ? "Zmień usługę wizyty" : "Edytuj wizytę";

    document.getElementById(
        "appointmentName"
    ).value =
        currentEditingAppointment.name || "";

    document.getElementById(
        "appointmentPhone"
    ).value =
        currentEditingAppointment.phone || "";

    document.getElementById(
        "appointmentDuration"
    ).value =
        currentEditingAppointment.duration || 45;

    crmSetAppointmentServiceSelectionV3015(
        currentEditingAppointment.service || "",
        {
            clear: editOptions.changeService === true,
            preferredCategory: crmInferAppointmentCategoryV3019(currentEditingAppointment)
        }
    );

    if (!servicesReady && editOptions.changeService === true) {
        crmRenderAppointmentServiceLoadErrorV3018("Nie udało się załadować Cennika DOM. Kliknij pole kategorii, aby spróbować ponownie.");
        if (typeof crmToast === "function") {
            crmToast("Cennik DOM jeszcze się nie załadował. Możesz ponowić odczyt bez zamykania wizyty.", "error");
        }
    }

    document.getElementById(
        "appointmentDateTime"
    ).value =
        formatDateTimeLocalValue(
            currentEditingAppointment.date
        );

    closeAppointmentModal();

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "flex";

    if (editOptions.changeService === true) {
        setTimeout(() => document.getElementById("appointmentServiceCategory")?.focus(), 0);
    }

}

/* ----- VIS.13. closeCreateAppointmentModal (oryginalna linia 1728) ----- */
function crmAppointmentFormHasUnsavedChanges() {
    const value = id => {
        const element = document.getElementById(id);
        return element ? String(element.value || "").trim() : "";
    };

    /* Pola tekstowe i data oznaczaja rzeczywiste rozpoczecie formularza. */
    if (value("appointmentName")) return true;
    if (value("appointmentPhone")) return true;
    if (value("appointmentServiceCategory")) return true;
    if (value("appointmentService")) return true;
    if (value("appointmentDateTime")) return true;
    if (value("appointmentDate")) return true;

    /* Domyslny czas trwania nowej wizyty to 45 minut. */
    const duration = value("appointmentDuration");
    if (duration && duration !== "45") return true;

    /* W rozdzielonym wyborze godziny domyslne wartosci to 12:00. */
    const hour = value("appointmentHour");
    const minute = value("appointmentMinute");
    if (hour && hour !== "12") return true;
    if (minute && minute !== "00" && minute !== "0") return true;

    return false;
}

async function closeCreateAppointmentModal(forceClose) {
    const modal = document.getElementById("appointmentModal");
    if (!modal || modal.style.display === "none") return;

    const mayCloseImmediately =
        forceClose === true ||
        isSavingAppointment ||
        isDeletingAppointment ||
        !crmAppointmentFormHasUnsavedChanges();

    if (!mayCloseImmediately) {
        const message = "Masz niezapisane zmiany. Zamknąć formularz bez zapisywania?";
        const confirmed = typeof crmConfirm === "function"
            ? await crmConfirm(message, "Odrzuć zmiany")
            : window.confirm(message);
        if (!confirmed) return;
    }

    modal.style.display = "none";
    if (!isSavingAppointment && window.crmPendingContactRequestForBooking) {
        window.crmPendingContactRequestForBooking = null;
    }
    if (!isSavingAppointment && window.crmPendingFirstVisitRequestForBooking) {
        window.crmPendingFirstVisitRequestForBooking = null;
        if (typeof window.crmFirstVisitClearSelectionModeV8 === "function") {
            window.crmFirstVisitClearSelectionModeV8();
        }
    }
}

/* ----- VIS.14. openAppointmentDetailsModal (oryginalna linia 1741) ----- */
/* ==========================================================
   DETAILS MODAL
   ========================================================== */

function openAppointmentDetailsModal(app){
    currentEditingAppointment = app;
    const isBlock = app.eventType === "block";
    const isExternal = app.eventType === "external";
    const isWorkShift = app.eventType === "work_shift";
    setText("appointmentDetailsTitle", isWorkShift ? "Szczegóły grafiku pracy" : (isBlock ? "Szczegóły blokady czasu" : (isExternal ? "Szczegóły wydarzenia zewnętrznego" : "Szczegóły rezerwacji")));
    setText("details-name-label", isWorkShift ? "Wpis grafiku:" : (isBlock ? "Nazwa blokady:" : "Klient:"));
    setText("details-service-label", isWorkShift ? "Rodzaj:" : (isBlock ? "Typ:" : "Zabieg:"));
    setText("details-name", app.name || "");
    setText("details-phone", app.phone || "");
    setText("details-service", app.service || "");
    setText("details-datetime", app.date || "");
    setText("details-duration", app.duration || 45);
    const phoneRow = document.getElementById("details-phone-row");
    if (phoneRow) phoneRow.style.display = (isBlock || isWorkShift) ? "none" : "block";
    const deleteBtn = document.getElementById("deleteAppointmentBtn");
    const editBtn = document.getElementById("editAppointmentBtn");
    if (deleteBtn) {
        deleteBtn.style.display = (isExternal || isWorkShift) ? "none" : "inline-block";
        deleteBtn.innerText = isBlock ? "Usuń blokadę 🗑️" : "Usuń wizytę 🗑️";
    }
    if (editBtn) {
        editBtn.style.display = (isExternal || isWorkShift) ? "none" : "inline-block";
        editBtn.innerText = isBlock ? "Edytuj blokadę" : "Edytuj wizytę";
    }
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}

/* ----- VIS.15. closeAppointmentModal (oryginalna linia 1765) ----- */
function closeAppointmentModal(){

    document.getElementById(
        "appointmentDetailsModal"
    ).style.display =
        "none";

}

/* ----- VIS.16. deleteBlockTimeFromAdmin (oryginalna linia 1783) ----- */
async function deleteBlockTimeFromAdmin() {
    if (!currentEditingAppointment || currentEditingAppointment.eventType !== "block") return alert("Nie wybrano blokady czasu.");
    if (isDeletingAppointment || !confirm("Usunąć wybraną blokadę czasu?")) return;
    const block = currentEditingAppointment;
    const btn = document.getElementById("deleteAppointmentBtn");
    isDeletingAppointment = true;
    if (btn) { btn.disabled = true; btn.innerText = "Usuwanie blokady..."; }
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST", headers: {"Content-Type":"text/plain"},
            body: JSON.stringify({action:"deleteBlockTime", eventId:block.eventId||"", start:block.date||"", end:block.endDate||"", title:block.name||""})
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Nieznany błąd");
        appointmentsData = appointmentsData.filter(x => !(block.eventId && x.eventId === block.eventId));
        currentEditingAppointment = null;
        closeAppointmentModal();
        await loadSettings();
        alert("Blokada czasu została usunięta.");
    } catch(error) { console.error(error); alert("Błąd usuwania blokady czasu: " + (error.message || error)); }
    finally { isDeletingAppointment = false; if (btn) {btn.disabled=false;btn.innerText="Usuń blokadę 🗑️";} }
}

/* ----- VIS.17. deleteAppointmentFromAdmin (oryginalna linia 1810) ----- */
/* ==========================================================
   DELETE FIX
   ========================================================== */

async function deleteAppointmentFromAdmin() {

    if (
        !currentEditingAppointment
    ) {
        return;
    }

    if (
        isDeletingAppointment
    ) {
        return;
    }

    if (
        !confirm(
            "Usunąć wizytę?"
        )
    ) {
        return;
    }

    const deleteBtn =
        document.getElementById(
            "deleteAppointmentBtn"
        );
const editBtn =
    document.getElementById(
        "editAppointmentBtn"
    );
    isDeletingAppointment =
        true;

    if (
        deleteBtn
    ) {
        deleteBtn.disabled =
            true;

        deleteBtn.innerText =
            "Usuwanie...";
    }
if (
    editBtn
) {
    editBtn.disabled =
        true;

    editBtn.innerText =
        "Edycja zablokowana";
}
    const appointmentToDelete =
        currentEditingAppointment;

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify({
                        action:
                        "createBooking",

                        bookingSource:
                        "ADMIN",

                        deleteFlag:
                        true,

                        eventId:
                        appointmentToDelete.eventId || "",

                        date:
                        new Date(
                            appointmentToDelete.date
                        )
                        .toISOString(),

                        name:
                        appointmentToDelete.name
                    })
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            const deletedEventId =
                appointmentToDelete.eventId || "";

            const deletedDate =
                appointmentToDelete.date || "";

            const deletedName =
                appointmentToDelete.name || "";

            appointmentsData =
                appointmentsData.filter(app => {

                    if (
                        deletedEventId &&
                        app.eventId === deletedEventId
                    ) {
                        return false;
                    }

                    if (
                        !deletedEventId &&
                        app.date === deletedDate &&
                        app.name === deletedName
                    ) {
                        return false;
                    }

                    return true;

                });

            currentEditingAppointment =
                null;

            closeAppointmentModal();

            closeCreateAppointmentModal();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

            alert(
                "Wizyta usunięta."
            );

            await loadSettings();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd usuwania wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas usuwania wizyty."
        );

    } finally {

        isDeletingAppointment =
            false;

        if (
            deleteBtn
        ) {
            deleteBtn.disabled =
                false;

            deleteBtn.innerText =
                "Usuń wizytę 🗑️";
        }
if (
    editBtn
) {
    editBtn.disabled =
        false;

    editBtn.innerText =
        "Edytuj wizytę";
}
    }

}

/* ----- VIS.18. openBlockTimeModal (oryginalna linia 2018) ----- */
/* ==========================================================
   BLOCK TIME
   ========================================================== */

function openBlockTimeModal() {

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    if (blockDateInput) {
        blockDateInput.value =
            getFormattedISOBlockDate(
                selectedCalendarDate
            );
    }

    if (blockTypeInput) {
        blockTypeInput.value =
            "hours";
    }

    if (blockStartInput) {
        blockStartInput.value =
            "09:00";
    }

    if (blockEndInput) {
        blockEndInput.value =
            "18:00";
    }

    if (blockTitleInput) {
        blockTitleInput.value =
            "Zablokowane";
    }

    toggleBlockTimeFields();

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "flex";

}

function crmLocalBlockParts(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return {date:"", time:""};
    const pad = number => String(number).padStart(2, "0");
    return {
        date: date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()),
        time: pad(date.getHours()) + ":" + pad(date.getMinutes())
    };
}

function openEditBlockTimeModal(block) {
    if (!block || block.eventType !== "block") return;
    const start = crmLocalBlockParts(block.date);
    const end = crmLocalBlockParts(block.endDate || new Date(new Date(block.date).getTime() + Number(block.duration || 60) * 60000));

    closeAppointmentModal();
    const dateInput = document.getElementById("block-date");
    const typeInput = document.getElementById("block-type");
    const startInput = document.getElementById("block-start-time");
    const endInput = document.getElementById("block-end-time");
    const titleInput = document.getElementById("block-title");
    const submitBtn = document.getElementById("blockTimeSubmitBtn");

    if (dateInput) dateInput.value = start.date;
    if (typeInput) typeInput.value = "hours";
    if (startInput) startInput.value = start.time;
    if (endInput) endInput.value = end.time;
    if (titleInput) titleInput.value = block.name || "Zablokowane";
    if (submitBtn) submitBtn.innerText = "Zapisz blokadę";
    toggleBlockTimeFields();
    document.getElementById("blockTimeModal").style.display = "flex";
}

/* ----- VIS.19. closeBlockTimeModal (oryginalna linia 2082) ----- */
function closeBlockTimeModal() {

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "none";

}

/* ----- VIS.20. toggleBlockTimeFields (oryginalna linia 2092) ----- */
function toggleBlockTimeFields() {

    const blockType =
        document.getElementById(
            "block-type"
        ).value;

    const group =
        document.getElementById(
            "block-hours-group"
        );

    if (!group) {
        return;
    }

    group.style.display =
        blockType === "hours"
            ? "block"
            : "none";

}

/* ----- VIS.21. submitBlockTime (oryginalna linia 2116) ----- */
async function submitBlockTime() {
    if (isBlockingTime) {
        return;
    }

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    const blockType =
        blockTypeInput
            ? blockTypeInput.value
            : "hours";

    const blockDate =
        blockDateInput
            ? blockDateInput.value
            : "";

    const blockStart =
        blockStartInput
            ? blockStartInput.value
            : "09:00";

    const blockEnd =
        blockEndInput
            ? blockEndInput.value
            : "18:00";

    const blockTitle =
        blockTitleInput
            ? blockTitleInput.value.trim()
            : "Zablokowane";

    if (!blockDate) {
        alert(
            "Wybierz datę blokady."
        );
        return;
    }

    if (
        blockType === "hours" &&
        (
            !blockStart ||
            !blockEnd
        )
    ) {
        alert(
            "Wybierz godzinę rozpoczęcia i zakończenia."
        );
        return;
    }

    if (
        blockType === "hours" &&
        blockStart >= blockEnd
    ) {
        alert(
            "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia."
        );
        return;
    }

    const submitBtn =
        document.getElementById(
            "blockTimeSubmitBtn"
        );

    isBlockingTime = true;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Blokowanie...";
    }

    try {
        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",
                    headers: {
                        "Content-Type":
                        "text/plain"
                    },
                    body:
                    JSON.stringify({
                        action:
                        currentEditingAppointment && currentEditingAppointment.eventType === "block"
                            ? "updateBlockTime"
                            : "blockTime",
                        eventId:
                        currentEditingAppointment && currentEditingAppointment.eventType === "block"
                            ? (currentEditingAppointment.eventId || "")
                            : "",
                        blockType:
                        blockType,
                        date:
                        blockDate,
                        startTime:
                        blockStart,
                        endTime:
                        blockEnd,
                        title:
                        blockTitle || "Zablokowane"
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {
            const wasEditingBlock = currentEditingAppointment && currentEditingAppointment.eventType === "block";
            const previousBlock = wasEditingBlock ? currentEditingAppointment : null;
            const oldEventId = String(previousBlock?.eventId || "");
            const eventId = String(data.eventId || oldEventId || "");

            const startIso = blockType === "full_day"
                ? `${blockDate}T00:00`
                : `${blockDate}T${blockStart}`;
            let endIso = "";
            if (blockType === "full_day") {
                const nextDay = new Date(`${blockDate}T12:00:00`);
                nextDay.setDate(nextDay.getDate() + 1);
                endIso = crmLocalIsoMinuteV24(new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 0, 0, 0));
            } else {
                endIso = `${blockDate}T${blockEnd}`;
            }

            const startDate = new Date(startIso);
            const endDate = new Date(endIso);
            const duration = !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
                ? Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
                : Number(previousBlock?.duration) || 60;

            appointmentsData = (appointmentsData || []).filter(item => {
                if (oldEventId && String(item?.eventId || "") === oldEventId) return false;
                if (!oldEventId && wasEditingBlock && previousBlock) {
                    return !(String(item?.date || "") === String(previousBlock.date || "") && String(item?.name || "") === String(previousBlock.name || ""));
                }
                return true;
            });

            appointmentsData.push({
                date:startIso,
                endDate:endIso,
                phone:"",
                name:blockTitle || "Zablokowane",
                service:"Blokada czasu",
                category:"Inne",
                duration,
                eventId,
                status:"",
                crmStatus:"",
                bookingSource:"",
                source:"",
                requestId:"",
                firstVisit:false,
                eventType:"block",
                displayOnly:false
            });

            crmWriteLocalCalendarCacheV24();
            if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();

            if (typeof crmToast === "function") {
                crmToast(wasEditingBlock ? "Blokada została zaktualizowana." : "Czas został zablokowany.");
            }
            currentEditingAppointment = null;
            closeBlockTimeModal();

            // Nie blokujemy formularza drugim odczytem Google. Weryfikacja idzie w tle.
            crmScheduleCalendarSyncV24(wasEditingBlock ? "po-edycji-blokady" : "po-dodaniu-blokady");
        } else {
            alert(
                "Błąd blokowania czasu: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );
        }
    } catch(error) {
        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas blokowania czasu."
        );
    } finally {
        isBlockingTime = false;

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Zablokuj czas 🔒";
        }
    }
}

/* ----- VIS.22. recordAppointmentLifecycle (oryginalna linia 3659) ----- */
async function recordAppointmentLifecycle(options) {
    const response = await crmExtendedPost("recordAppointmentLifecycle", options || {});
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zapisać historii wizyty");
    }

    /*
     * Nie odświeżamy tutaj całego CRM. Funkcja jest używana przez kilka
     * operacji cyklu życia wizyty, a ciężkie loadSystem() powodowało
     * podwójne pobieranie danych i ponad 30 sekund oczekiwania.
     * Widok odświeża funkcja wywołująca, zależnie od rodzaju operacji.
     */
    return response;
}

/* ----- VIS.23. cancelAppointmentWithHistory (oryginalna linia 3668) ----- */
async function cancelAppointmentWithHistory(initiator, reason) {
    if (!currentEditingAppointment) return;
    if (!confirm("Anulować wizytę i zapisać zdarzenie w historii?")) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ANULOWANIE",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: initiator || "MISTRZYNI",
            reason: reason || "",
            deleteCalendarEvent: true
        });
        closeAppointmentModal();
        alert("Wizyta została anulowana, a zdarzenie zapisane w historii.");
    } catch (error) {
        alert("Błąd anulowania wizyty: " + (error.message || error));
    }
}

/* ----- VIS.24. completeCurrentAppointment (oryginalna linia 3690) ----- */
async function completeCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ZREALIZOWANA",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "MISTRZYNI"
        });
        closeAppointmentModal();
        alert("Wizyta została oznaczona jako zrealizowana.");
    } catch (error) {
        alert("Błąd zmiany statusu: " + (error.message || error));
    }
}

/* ----- VIS.25. markCurrentAppointmentNoShow (oryginalna linia 3709) ----- */
async function markCurrentAppointmentNoShow() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "NIEOBECNOSC",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "KLIENT"
        });
        closeAppointmentModal();
        alert("Nieobecność została zapisana.");
    } catch (error) {
        alert("Błąd zapisu nieobecności: " + (error.message || error));
    }
}

/* ----- VIS.26. getSmartNextVisitSuggestion (oryginalna linia 3728) ----- */
async function getSmartNextVisitSuggestion(phone, service, baseDate, preference) {
    const response = await crmExtendedPost("getSmartNextVisit", {
        phone: phone,
        service: service,
        baseDate: baseDate || new Date().toISOString(),
        preference: preference || "REKOMENDOWANY"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się wyznaczyć kolejnej wizyty");
    }
    return response;
}

/* ----- VIS.27. planNextVisitFromCurrentAppointment (oryginalna linia 3741) ----- */
async function planNextVisitFromCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        const suggestion = await getSmartNextVisitSuggestion(
            currentEditingAppointment.phone,
            currentEditingAppointment.service,
            currentEditingAppointment.date,
            "REKOMENDOWANY"
        );
        const hours = (suggestion.availableSlots || []).slice(0, 6).join(", ");
        alert(
            "Rekomendowana data: " + suggestion.recommendedDate + "\n" +
            "Dostępne godziny: " + (hours || "brak automatycznych propozycji") + "\n\n" +
            "Termin można zmienić ręcznie w formularzu wizyty."
        );
    } catch (error) {
        alert("Błąd planowania kolejnej wizyty: " + (error.message || error));
    }
}

/* ----- VIS.28. ensureAppointmentLifecycleButtons (oryginalna linia 3780) ----- */
function ensureAppointmentLifecycleButtons() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal || document.getElementById("crm-lifecycle-actions")) return;
    const content = modal.querySelector(".modal-content") || modal;
    const box = document.createElement("div");
    box.id = "crm-lifecycle-actions";
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5;";
    box.innerHTML = `
        <button type="button" class="btn-secondary" onclick="completeCurrentAppointment()">Oznacz jako zrealizowaną</button>
        <button type="button" class="btn-secondary" onclick="markCurrentAppointmentNoShow()">Nieobecność</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('KLIENT', '')">Anuluj przez klienta</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('MISTRZYNI', '')">Anuluj przez salon</button>
        <button type="button" class="btn-primary" onclick="planNextVisitFromCurrentAppointment()">Zaplanuj następny wizyt</button>
    `;
    content.appendChild(box);
}

/* ----- VIS.29. crmUpdateLifecycleVisibility (oryginalna linia 4043) ----- */
function crmUpdateLifecycleVisibility(app) {
    const box = document.getElementById("crm-lifecycle-actions");
    if (!box) return;
    const external = app && app.eventType === "external";
    const block = app && app.eventType === "block";
    const workShift = app && app.eventType === "work_shift";
    box.style.display = (external || block || workShift) ? "none" : "flex";
    let externalBox = document.getElementById("crm-external-actions");
    if (!externalBox) {
        externalBox = document.createElement("div");
        externalBox.id = "crm-external-actions";
        externalBox.style.cssText = "display:none;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5";
        externalBox.innerHTML = `<button type="button" class="btn-primary" onclick="window.open('https://calendar.google.com/calendar/u/0/r','_blank','noopener')">Otwórz Google Calendar</button><button type="button" class="btn-secondary" onclick="convertExternalToCRMAppointment()">Przekształć w wizytę CRM</button>`;
        box.parentNode.appendChild(externalBox);
    }
    externalBox.style.display = external ? "flex" : "none";
}

/* ----- VIS.30. crmOriginalOpenAppointmentDetailsModal (oryginalna linia 4077) ----- */
const crmOriginalOpenAppointmentDetailsModal = openAppointmentDetailsModal;

/* ----- VIS.31. openAppointmentDetailsModal (oryginalna linia 4078) ----- */
openAppointmentDetailsModal = function(app) {
    crmOriginalOpenAppointmentDetailsModal(app);
    setText("details-datetime", crmFormatDateTime(app.date));
    crmUpdateLifecycleVisibility(app);
};

/* ----- VIS.32. crmRunLifecycleOperation (oryginalna linia 4084) ----- */
async function crmRunLifecycleOperation(operation, initiator, deleteCalendarEvent, successText, button) {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    const affectedAppointment = currentEditingAppointment;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, button, "Zapisywanie...");
    try {
        await recordAppointmentLifecycle({operation, eventId:affectedAppointment.eventId||"", phone:affectedAppointment.phone||"", clientName:affectedAppointment.name||"", service:affectedAppointment.service||"", oldDate:affectedAppointment.date||"", initiator:initiator||"MISTRZYNI", deleteCalendarEvent:Boolean(deleteCalendarEvent)});
        if (deleteCalendarEvent) {
            const affectedEventId = affectedAppointment.eventId || "";
            const affectedDate = affectedAppointment.date || "";
            const affectedName = affectedAppointment.name || "";
            appointmentsData = (appointmentsData || []).filter(item => {
                if (affectedEventId && item.eventId === affectedEventId) return false;
                return !(!affectedEventId && item.date === affectedDate && item.name === affectedName);
            });
        }
        currentEditingAppointment = null;
        closeAppointmentModal();

        if (deleteCalendarEvent) {
            /*
             * Anulowana wizyta znika natychmiast z lokalnego widoku.
             * Pełna synchronizacja z backendem odbywa się później w tle,
             * więc użytkownik nie czeka na loadSystem(), klientów i grafik.
             */
            if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            crmToast(successText);

            Promise.resolve()
                .then(() => {
                    if (typeof crmLightSyncCalendarData === "function") {
                        return crmLightSyncCalendarData("anulowanie-wizyty");
                    }
                    return typeof crmRefreshAllViews === "function"
                        ? crmRefreshAllViews()
                        : null;
                })
                .catch(error => {
                    console.error("Synchronizacja po anulowaniu wizyty nie powiodła się:", error);
                });
        } else {
            const localStatus = operation === "NIEOBECNOSC" ? "NIEOBECNOSC" : (operation === "ZREALIZOWANA" ? "ZREALIZOWANA" : operation);
            affectedAppointment.status = localStatus;
            affectedAppointment.crmStatus = localStatus;
            if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            crmToast(successText);
            Promise.resolve().then(() => typeof crmLightSyncCalendarData === "function" ? crmLightSyncCalendarData("status-wizyty") : null)
                .catch(error => console.error("Lekka synchronizacja statusu wizyty nie powiodła się:", error));
        }
    } catch (error) {
        crmToast(error.message || String(error), "error");
    } finally {
        crmUiOperationLock = false;
        crmSetActionGroupBusy(false);
    }
}

/* ----- VIS.33. completeCurrentAppointment (oryginalna linia 4100) ----- */
completeCurrentAppointment = async function() {
    return crmRunLifecycleOperation("ZREALIZOWANA", "MISTRZYNI", false, "Wizyta została oznaczona jako zrealizowana.", document.activeElement);
};

/* ----- VIS.34. markCurrentAppointmentNoShow (oryginalna linia 4103) ----- */
markCurrentAppointmentNoShow = async function() {
    const ok = await crmConfirm("Czy zapisać nieobecność klienta?", "Zapisz nieobecność");
    if (!ok) return;
    return crmRunLifecycleOperation("NIEOBECNOSC", "KLIENT", false, "Nieobecność została zapisana.", document.activeElement);
};

/* ----- VIS.35. cancelAppointmentWithHistory (oryginalna linia 4108) ----- */
cancelAppointmentWithHistory = async function(initiator) {
    const ok = await crmConfirm("Czy na pewno anulować tę wizytę?", initiator === "KLIENT" ? "Anuluj przez klienta" : "Anuluj przez salon");
    if (!ok) return;
    return crmRunLifecycleOperation("ANULOWANIE", initiator || "MISTRZYNI", true, "Wizyta została anulowana.", document.activeElement);
};

/* ----- VIS.36. planNextVisitFromCurrentAppointment (oryginalna linia 4113) ----- */
planNextVisitFromCurrentAppointment = async function() {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, document.activeElement, "Wyszukiwanie...");
    try {
        const suggestion = await getSmartNextVisitSuggestion(currentEditingAppointment.phone,currentEditingAppointment.service,currentEditingAppointment.date,"REKOMENDOWANY");
        crmToast(`Rekomendowana data: ${suggestion.recommendedDate}. Godziny: ${(suggestion.availableSlots||[]).slice(0,6).join(", ") || "brak propozycji"}`);
    } catch (error) { crmToast(error.message || String(error), "error"); }
    finally { crmUiOperationLock=false; crmSetActionGroupBusy(false); }
};

/* ----- VIS.38. crmV3RenderAppointmentCardOriginal (oryginalna linia 5612) ----- */
const crmV3RenderAppointmentCardOriginal = renderAppointmentCard;

/* ----- VIS.39. renderAppointmentCard (oryginalna linia 5613) ----- */
renderAppointmentCard = function(app, container) {
    const before = container.children.length;
    crmV3RenderAppointmentCardOriginal(app, container);
    crmV3ApplyStatusToElement(container.children[before], app);
};

/* ----- VIS.39.1. Referencje bazowego panelu przed warstwa V3 ----- */
const crmV3OpenDetailsOriginal = openAppointmentDetailsModal;
const crmV3CloseDetailsOriginal = closeAppointmentModal;

/* ----- VIS.40. openAppointmentDetailsModal (oryginalna linia 5637) ----- */
openAppointmentDetailsModal = function(item) {
    crmV3OpenDetailsOriginal(item);
    crmV3UpdateDetailsStatus(item);
    document.body.classList.add("crm-v3-details-open");
};

/* ----- VIS.41. closeAppointmentModal (oryginalna linia 5644) ----- */
closeAppointmentModal = function() {
    crmV3CloseDetailsOriginal();
    document.body.classList.remove("crm-v3-details-open");
};

/* ----- VIS.42. crmParseVisitDate (oryginalna linia 5696) ----- */
function crmParseVisitDate(value) {
    const raw = String(value || "");
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const match = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4}).*?(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2])-1, Number(match[1]), Number(match[4]), Number(match[5]));
}

/* ----- VIS.43. crmFormatVisitDay (oryginalna linia 5704) ----- */
function crmFormatVisitDay(date) {
    if (!date) return "Data wizyty";
    const text = date.toLocaleDateString("pl-PL", {weekday:"short",day:"numeric",month:"short"});
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, "");
}

/* ----- VIS.44. crmFormatVisitTime (oryginalna linia 5709) ----- */
function crmFormatVisitTime(date) {
    return date ? date.toLocaleTimeString("pl-PL", {hour:"2-digit",minute:"2-digit"}) : "—";
}

/* ----- VIS.45. crmFindServiceForVisit (oryginalna linia 5712) ----- */
function crmFindServiceForVisit(app) {
    const name = String(app?.service || "").trim().toLowerCase();
    return (Array.isArray(currentServices) ? currentServices : []).find(item => String(item.name || "").trim().toLowerCase() === name) || null;
}

/* ----- VIS.46. crmGetVisitWorker (oryginalna linia 5723) ----- */
function crmGetVisitWorker(app) {
    return crmEscapePanelValue(app?.worker || app?.employee || app?.master || app?.staffName, "Nie przypisano");
}

/* ----- VIS.47. crmGetVisitEquipment (oryginalna linia 5726) ----- */
function crmGetVisitEquipment(app) {
    return crmEscapePanelValue(app?.equipment || app?.room || app?.cabinet, "Nie przypisano");
}

/* ----- VIS.48. crmSwitchVisitPanelTab (oryginalna linia 5733) ----- */
function crmSwitchVisitPanelTab(tab) {
    const visit = tab !== "info";
    document.getElementById("crmVisitTabVisit")?.classList.toggle("active", visit);
    document.getElementById("crmVisitTabInfo")?.classList.toggle("active", !visit);
    const visitContent = document.getElementById("crmVisitTabContent");
    const infoContent = document.getElementById("crmInfoTabContent");
    if (visitContent) visitContent.hidden = !visit;
    if (infoContent) infoContent.hidden = visit;
}

/* ----- VIS.49. crmToggleVisitStatusMenu (oryginalna linia 5742) ----- */
function crmToggleVisitStatusMenu(force) {
    const menu = document.getElementById("crmVisitStatusMenu");
    if (!menu) return;
    menu.hidden = typeof force === "boolean" ? !force : !menu.hidden;
}

/* ----- VIS.50. crmVisitStatusAction (oryginalna linia 5747) ----- */
async function crmVisitStatusAction(action) {
    crmToggleVisitStatusMenu(false);
    if (action === "COMPLETED") return completeCurrentAppointment();
    if (action === "NO_SHOW") return markCurrentAppointmentNoShow();
    if (action === "CANCEL_CLIENT") return cancelAppointmentWithHistory("KLIENT", "");
    if (action === "CANCEL_SALON") return cancelAppointmentWithHistory("MISTRZYNI", "");
}

function crmToggleVisitTrashMenu(force) {
    const menu = document.getElementById("crmVisitTrashMenu");
    if (!menu) return;
    const shouldOpen = typeof force === "boolean" ? force : menu.hidden;
    const statusMenu = document.getElementById("crmVisitStatusMenu");
    if (statusMenu) statusMenu.hidden = true;
    menu.hidden = !shouldOpen;
}

async function crmVisitTrashAction(initiator) {
    crmToggleVisitTrashMenu(false);
    return cancelAppointmentWithHistory(initiator === "KLIENT" ? "KLIENT" : "MISTRZYNI");
}

/* ----- VIS.51. crmPopulateNewVisitPanel (oryginalna linia 5754) ----- */
function crmPopulateNewVisitPanel(app) {
    const isAppointment = app?.eventType === "appointment";
    const isBlock = app?.eventType === "block";
    const isExternal = app?.eventType === "external";
    const date = crmParseVisitDate(app?.date);
    const duration = Math.max(0, Number(app?.duration) || 0);
    const end = date ? new Date(date.getTime() + duration * 60000) : null;
    const service = crmFindServiceForVisit(app);
    const name = crmEscapePanelValue(app?.name, isAppointment ? "Klient" : "Wydarzenie");

    setText("details-name", name);
    setText("details-phone", crmEscapePanelValue(app?.phone, "Numer telefonu jest ukryty"));
    setText("details-service", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("details-duration", duration || 0);
    setText("details-datetime", crmFormatDateTime(app?.date));
    setText("crmInfoClient", name);
    setText("crmInfoService", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("crmInfoSource", crmEscapePanelValue(app?.source || app?.eventType, "CRM"));
    setText("crmClientAvatar", crmInitial(name));
    setText("crmVisitReservationId", "ID rezerwacji klienta: " + crmEscapePanelValue(app?.requestId || app?.eventId || app?.id, "—"));
    setText("crmVisitDateHeading", crmFormatVisitDay(date));
    setText("crmVisitStart", crmFormatVisitTime(date));
    setText("crmVisitEnd", crmFormatVisitTime(end));
    setText("crmVisitWorker", crmGetVisitWorker(app));
    setText("crmVisitEquipment", crmGetVisitEquipment(app));
    const serviceDescription = isExternal
        ? "Wydarzenie zewnętrzne"
        : crmEscapePanelValue(app?.serviceDescription || service?.description, "Usługa salonowa");
    setText("crmServiceDescription", serviceDescription);
    setText("crmServicePrice", isExternal ? "Cena: —" : "Cena: " + crmGetServicePriceText(app));

    const stripe = document.getElementById("crmServiceStripe");
    if (stripe) stripe.style.background = app?.color || service?.color || "#d6df73";
    const group = document.getElementById("crmVisitGroupFlag");
    const recurring = document.getElementById("crmVisitRecurringFlag");
    if (group) group.hidden = !(app?.group || app?.isGroup);
    if (recurring) recurring.hidden = !(app?.recurring || app?.isRecurring);
    const statusButton = document.getElementById("crmVisitStatusButton");
    const repeatButton = document.getElementById("crmRepeatVisitBtn");
    const settleButton = document.getElementById("crmSettleVisitBtn");
    if (statusButton) statusButton.hidden = !isAppointment;
    if (repeatButton) repeatButton.hidden = !isAppointment;
    if (settleButton) settleButton.hidden = !isAppointment;

    const serviceCard = document.querySelector("#appointmentDetailsModal .crm-safe-service-card");
    if (serviceCard) {
        serviceCard.classList.toggle("crm-service-editable-v3015", isAppointment);
        serviceCard.classList.toggle("is-readonly", !isAppointment);
        serviceCard.title = isAppointment ? "Kliknij, aby zmienić usługę" : "";
        serviceCard.setAttribute("role", isAppointment ? "button" : "article");
        serviceCard.tabIndex = isAppointment ? 0 : -1;
        serviceCard.onclick = isAppointment ? () => openEditAppointmentModal({ changeService: true }) : null;
        serviceCard.onkeydown = isAppointment ? event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEditAppointmentModal({ changeService: true });
            }
        } : null;
    }

    const addServiceButton = document.querySelector("#appointmentDetailsModal .crm-safe-add-service");
    if (addServiceButton) addServiceButton.hidden = !isAppointment;

    const trashButton = document.getElementById("crmVisitTrashButton");
    if (trashButton) {
        trashButton.hidden = !(isAppointment || isBlock || isExternal);

        const trashTitle = isBlock
            ? "Usuń blokadę"
            : (isExternal ? "Usuń wydarzenie z Google Calendar" : "Anuluj wizytę");

        trashButton.title = trashTitle;
        trashButton.setAttribute("aria-label", trashTitle);

        trashButton.onclick = isBlock
            ? function(event) {
                event.preventDefault();
                event.stopPropagation();
                deleteBlockTimeFromAdmin();
            }
            : (isExternal
                ? function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteExternalCalendarEventFromAdmin();
                }
                : function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    crmToggleVisitTrashMenu();
                });
    }
    const trashMenu = document.getElementById("crmVisitTrashMenu");
    if (trashMenu) trashMenu.hidden = true;

    const clientCard = document.querySelector("#appointmentDetailsModal .crm-safe-client-card");
    if (clientCard) {
        clientCard.classList.toggle("is-readonly", isExternal);
        clientCard.title = isExternal ? "Wydarzenie zewnętrzne z Google Calendar" : "Otwórz edycję wizyty";
        clientCard.onclick = isExternal ? null : () => openEditAppointmentModal();
        clientCard.onkeydown = isExternal ? null : event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEditAppointmentModal();
            }
        };
        clientCard.tabIndex = isExternal ? -1 : 0;
    }

    crmSwitchVisitPanelTab("visit");
    crmToggleVisitStatusMenu(false);
}

/* ----- VIS.51.1. Referencja panelu V3 przed warstwa V4 ----- */
const crmV4OpenDetailsOriginal = openAppointmentDetailsModal;

/* ----- VIS.52. openAppointmentDetailsModal (oryginalna linia 5796) ----- */
openAppointmentDetailsModal = function(app) {
    crmV4OpenDetailsOriginal(app);
    crmPopulateNewVisitPanel(app);
};

/* ----- VIS.53. crmVisitSourceInfo (oryginalna linia 6049) ----- */
/* KONIEC ADMIN V6 */

/* ==========================================================
   ADMIN V6.2: ŹRÓDŁO WIZYTY I UPROSZCZENIE PANELU
   ========================================================== */
function crmVisitSourceInfo(app) {
    const raw = String(app?.bookingSource || app?.source || app?.createdBy || "").trim().toUpperCase();
    const phone = String(app?.phone || "").trim().toUpperCase();

    if (raw.includes("FORM")) return {
        code:"FORM_FIRST", label:"Pierwsza wizyta – zapytanie online",
        badge:"PIERWSZA WIZYTA · ONLINE", manual:false,
        background:"#fbf1f5", border:"#d9a6b9", text:"#7c4860"
    };

    if (raw.includes("INDEX_REQUEST") || raw.includes("REQUEST")) return {
        code:"INDEX_REQUEST", label:"Prośba o termin przez stronę",
        badge:"PROŚBA PRZEZ STRONĘ", manual:false,
        background:"#f1f6fb", border:"#a8bfd5", text:"#48657d"
    };

    if (raw.includes("INDEX") || raw.includes("ONLINE") || raw.includes("CLIENT") || raw.includes("KLIENT")) return {
        code:"INDEX", label:"Rezerwacja przez stronę",
        badge:"REZERWACJA PRZEZ STRONĘ", manual:false,
        background:"#f1f6fb", border:"#a8bfd5", text:"#48657d"
    };

    if (raw.includes("GOOGLE") || phone === "GOOGLE CALENDAR") return {
        code:"GOOGLE", label:"Google Kalendarz",
        badge:"GOOGLE KALENDARZ", manual:true,
        background:"#f3f4f6", border:"#c4cad1", text:"#59616b"
    };

    if (raw.includes("ADMIN") || raw.includes("MISTRZYNI") || raw.includes("MASTER")) return {
        code:"ADMIN", label:"Dodana przeze mnie",
        badge:"DODANA PRZEZE MNIE", manual:true,
        background:"#f7f2f5", border:"#ccb8c1", text:"#67545e"
    };

    if (raw.includes("BOOKSY")) return {
        code:"BOOKSY", label:"Wizyta zaimportowana z Booksy",
        badge:"BOOKSY", manual:false,
        background:"#f4f4f4", border:"#c9c9c9", text:"#555"
    };

    return {
        code:"LEGACY", label:"Starsza wizyta – źródło nie zapisane",
        badge:"STARSZA WIZYTA", manual:false,
        background:"#f6f6f6", border:"#d3d3d3", text:"#666"
    };
}

/* ----- VIS.54. crmApplyVisitPanelBusinessRules (oryginalna linia 6058) ----- */
function crmApplyVisitPanelBusinessRules(app) {
    const source = crmVisitSourceInfo(app);
    const note = document.getElementById("crmWorkerNote");
    if (note) {
        note.hidden = !source.manual;
        note.textContent = source.manual ? "Pracownik wybrany ręcznie" : "";
    }
    const sourceNode = document.getElementById("crmInfoSource");
    if (sourceNode) {
        sourceNode.textContent = source.label;
        sourceNode.style.display = "inline-flex";
        sourceNode.style.width = "fit-content";
        sourceNode.style.padding = "5px 8px";
        sourceNode.style.border = `1px solid ${source.border}`;
        sourceNode.style.borderRadius = "999px";
        sourceNode.style.background = source.background;
        sourceNode.style.color = source.text;
        sourceNode.style.fontSize = "11px";
        sourceNode.style.fontWeight = "800";
    }

    const modal = document.getElementById("appointmentDetailsModal");
    if (modal) {
        modal.dataset.crmSource = String(source.code || "").toLowerCase();
        modal.dataset.crmEventType = String(app?.eventType || "").toLowerCase();
    }

    const reservationId = document.getElementById("crmVisitReservationId");
    if (reservationId) reservationId.hidden = true;

    const statusCopy = document.querySelector("#appointmentDetailsModal .crm-safe-status-copy");
    if (statusCopy) {
        let badge = document.getElementById("crmVisitSourceBadge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "crmVisitSourceBadge";
            statusCopy.appendChild(badge);
        }
        badge.textContent = source.badge;
        badge.style.display = "inline-flex";
        badge.style.marginTop = "5px";
        badge.style.padding = "4px 7px";
        badge.style.border = `1px solid ${source.border}`;
        badge.style.borderRadius = "999px";
        badge.style.background = source.background;
        badge.style.color = source.text;
        badge.style.fontSize = "9px";
        badge.style.fontWeight = "800";
        badge.style.letterSpacing = ".03em";
    }
    const fields = document.querySelectorAll("#appointmentDetailsModal .crm-visit-field");
    fields.forEach(field => {
        const label = field.querySelector("span")?.textContent?.trim();
        if (label === "Pracownik" || label === "Sprzęt") field.hidden = true;
    });
    document.querySelector("#appointmentDetailsModal .crm-client-choice")?.setAttribute("hidden", "");
    const settle = document.getElementById("crmSettleVisitBtn");
    if (settle) settle.hidden = true;
    const repeat = document.getElementById("crmRepeatVisitBtn");
    if (repeat) repeat.textContent = "UMÓW PONOWNIE";
}

/* ----- VIS.55. crmPopulateNewVisitPanelV62 (oryginalna linia 6080) ----- */
const crmPopulateNewVisitPanelV62 = crmPopulateNewVisitPanel;

/* ----- VIS.56. crmPopulateNewVisitPanel (oryginalna linia 6081) ----- */
crmPopulateNewVisitPanel = function(app) {
    crmPopulateNewVisitPanelV62(app);
    crmApplyVisitPanelBusinessRules(app);
};

/* ----- VIS.57. crmVisitEntry (oryginalna linia 6117) ----- */
function crmVisitEntry(item, rangeStart, rangeEnd) {
    const date = crmDayEventDate(item);
    if (!date) return null;
    const start = date.getHours()*60 + date.getMinutes();
    const duration = Math.max(15,Number(item.duration)||45);
    const end = start + duration;
    if (end <= rangeStart || start >= rangeEnd) return null;
    return {item,date,endDate:new Date(date.getTime()+duration*60000),start:Math.max(rangeStart,start),end:Math.min(rangeEnd,end)};
}

/* ----- VIS.58. crmInstallSafeRightVisitPanel (oryginalna linia 6370) ----- */
/* KONIEC ADMIN V9 */

/* ==========================================================
   ADMIN V10-SAFE: PRAWY PANEL BEZ ZMIANY HTML
   ========================================================== */
function crmInstallSafeRightVisitPanel() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal || modal.dataset.crmSafePanel === "1") return;
    const surface = modal.querySelector(".modal-content");
    if (!surface) return;

    modal.dataset.crmSafePanel = "1";
    modal.classList.add("crm-safe-visit-panel");
    surface.classList.add("crm-safe-visit-surface");

    surface.innerHTML = `
      <header class="crm-safe-header">
        <button type="button" class="crm-safe-close" onclick="closeAppointmentModal()" aria-label="Zamknij">×</button>
        <div class="crm-safe-status-copy">
          <h4 id="appointmentDetailsTitle">✓ POTWIERDZONO</h4>
          <small id="crmVisitReservationId"></small>
        </div>
        <button id="crmVisitStatusButton" type="button" class="crm-safe-status-btn" onclick="crmToggleVisitStatusMenu()">Zmień status</button>
        <div id="crmVisitStatusMenu" class="crm-safe-status-menu" hidden>
          <button type="button" onclick="crmVisitStatusAction('COMPLETED')">Zrealizowana</button>
          <button type="button" onclick="crmVisitStatusAction('NO_SHOW')">Nieobecność</button>
        </div>
        <button id="crmVisitTrashButton" type="button" class="crm-final-trash" onclick="crmToggleVisitTrashMenu()" aria-label="Anuluj wizytę" title="Anuluj wizytę">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>
        </button>
        <div id="crmVisitTrashMenu" class="crm-final-trash-menu" hidden>
          <button type="button" onclick="crmVisitTrashAction('KLIENT')">Anulowana przez klienta</button>
          <button type="button" onclick="crmVisitTrashAction('MISTRZYNI')">Anulowana przez salon</button>
        </div>
      </header>
      <div id="appointment-details-view" class="crm-safe-body">
        <section class="crm-safe-client-card" role="button" tabindex="0" title="Otwórz edycję wizyty" onclick="openEditAppointmentModal()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openEditAppointmentModal();}">
          <div id="crmClientAvatar" class="crm-safe-avatar">K</div>
          <div class="crm-safe-client-copy">
            <strong id="details-name">Klient</strong>
            <span id="details-phone-row">☎ <span id="details-phone">—</span></span>
          </div>
        </section>
        <nav class="crm-safe-tabs">
          <button id="crmVisitTabVisit" type="button" class="active" onclick="crmSwitchVisitPanelTab('visit')">WIZYTA</button>
          <button id="crmVisitTabInfo" type="button" onclick="crmSwitchVisitPanelTab('info')">INFORMACJE</button>
        </nav>
        <section id="crmVisitTabContent" class="crm-safe-tab-content">
          <strong id="crmVisitDateHeading" class="crm-safe-date">Data wizyty</strong>
          <article class="crm-safe-service-card" title="Kliknij, aby zmienić usługę">
            <span id="crmServiceStripe" class="crm-safe-service-stripe"></span>
            <div class="crm-safe-service-copy">
              <strong id="details-service">Usługa</strong>
              <span id="crmServiceDescription">Usługa salonowa</span>
              <small><span id="details-duration">0</span> min</small>
            </div>
            <strong id="crmServicePrice" class="crm-safe-price">Cena: —</strong>
          </article>
          <div class="crm-safe-time-grid">
            <div><span>Początek</span><strong id="crmVisitStart">—</strong></div>
            <div><span>Koniec</span><strong id="crmVisitEnd">—</strong></div>
          </div>
          <span id="crmVisitWorker" hidden></span><span id="crmVisitEquipment" hidden></span>
          <button type="button" class="crm-safe-add-service">DODAJ KOLEJNĄ USŁUGĘ <b>+</b></button>
          <button id="crmRepeatVisitBtn" type="button" class="crm-safe-repeat" onclick="planNextVisitFromCurrentAppointment()">UMÓW PONOWNIE</button>
        </section>
        <section id="crmInfoTabContent" class="crm-safe-info" hidden>
          <div><span>Klient</span><strong id="crmInfoClient">—</strong></div>
          <div><span>Usługa</span><strong id="crmInfoService">—</strong></div>
          <div><span>Data i godzina</span><strong id="details-datetime">—</strong></div>
          <div><span>Źródło</span><strong id="crmInfoSource">—</strong></div>
        </section>
        <button id="deleteAppointmentBtn" type="button" hidden onclick="deleteSelectedCalendarItemFromAdmin()"></button>
        <button id="editAppointmentBtn" type="button" hidden onclick="openEditAppointmentModal()"></button>
        <button id="crmSettleVisitBtn" type="button" hidden></button>
      </div>`;
}

/* ----- VIS.59. crmSafeVisitCategoryColor (oryginalna linia 6439) ----- */
function crmSafeVisitCategoryColor(app) {
    const service = typeof crmFindServiceForVisit === "function" ? crmFindServiceForVisit(app) : null;
    const category = app?.category || service?.category || "";
    return app?.categoryColor || service?.categoryColor || globalColors?.[category] || app?.color || "#b05c75";
}

/* ----- VIS.60. crmSafeOpenAppointmentOriginal (oryginalna linia 6445) ----- */
const crmSafeOpenAppointmentOriginal = openAppointmentDetailsModal;

/* ----- VIS.61. openAppointmentDetailsModal (oryginalna linia 6446) ----- */
function crmVisitReadableStatus(app) {
    const normalized = typeof crmV3NormalizeStatus === "function" ? crmV3NormalizeStatus(app) : String(app?.crmStatus || app?.status || "CONFIRMED").trim().toUpperCase();
    if (normalized === "NO_SHOW") return {key:"no-show", icon:"❗", label:"NIEOBECNOŚĆ", info:"Klient nie przyszedł"};
    if (normalized === "COMPLETED") return {key:"completed", icon:"✓", label:"ZREALIZOWANA", info:"Zrealizowana"};
    if (normalized === "IN_PROGRESS") return {key:"in-progress", icon:"▶", label:"W TRAKCIE", info:"Wizyta trwa"};
    if (normalized === "CANCELLED_CLIENT" || normalized === "CANCELLED_SALON") return {key:"cancelled", icon:"×", label:"ANULOWANA", info:"Anulowana"};
    if (normalized === "PENDING") return {key:"pending", icon:"⌛", label:"OCZEKUJE", info:"Oczekuje"};
    return {key:"confirmed", icon:"●", label:"POTWIERDZONO", info:"Potwierdzono"};
}

function crmApplyReadableVisitStatus(app) {
    if (!app || app.eventType !== "appointment") return;

    const status = crmVisitReadableStatus(app);
    const modal = document.getElementById("appointmentDetailsModal");
    const title = document.getElementById("appointmentDetailsTitle");

    if (modal) modal.dataset.crmStatus = status.key;
    if (title) title.textContent = status.icon + " " + status.label;

    const info = document.getElementById("crmInfoTabContent");
    if (!info) return;

    let row = document.getElementById("crmInfoVisitStatusRow");
    if (!row) {
        row = document.createElement("div");
        row.id = "crmInfoVisitStatusRow";
        row.innerHTML = '<span>Status</span><strong id="crmInfoVisitStatus">—</strong>';
        info.appendChild(row);
    }

    const value = document.getElementById("crmInfoVisitStatus");
    if (value) value.textContent = status.info;
}

openAppointmentDetailsModal = function(app) {
    const calendarTab = document.getElementById("tab-kalendarz");
    if (!calendarTab || getComputedStyle(calendarTab).display === "none") return;
    crmInstallSafeRightVisitPanel();
    crmSafeOpenAppointmentOriginal(app);
    if (typeof crmPopulateNewVisitPanel === "function") crmPopulateNewVisitPanel(app);

    /* Status nakladamy jako ostatni krok, po zbudowaniu i wypelnieniu panelu. */
    crmApplyReadableVisitStatus(app);

    const stripe = document.getElementById("crmServiceStripe");
    if (stripe) stripe.style.background = crmSafeVisitCategoryColor(app);
};

/* ----- VIS.62. crmVisitStableKey (oryginalna linia 6476) ----- */
function crmVisitStableKey(item) {
    return String(item?.eventId || [item?.date, item?.phone, item?.name, item?.service].join("|"));
}

/* ----- VIS.63. crmVisitEndTime (oryginalna linia 6480) ----- */
function crmVisitEndTime(item) {
    const start = new Date(item?.date);
    if (Number.isNaN(start.getTime())) return "";
    const explicit = new Date(item?.endDate || item?.end || "");
    const end = !Number.isNaN(explicit.getTime())
        ? explicit
        : new Date(start.getTime() + (Math.max(5, Number(item?.duration) || 45) * 60000));
    return formatCalendarTime(start) + "–" + formatCalendarTime(end);
}

/* ----- VIS.64. crmVisitService (oryginalna linia 6490) ----- */
function crmVisitService(item) {
    return String(item?.service || item?.name || (item?.eventType === "block" ? "Zablokowany czas" : "Wizyta"));
}

/* ----- VIS.65. crmVisitCategoryColor (oryginalna linia 6500) ----- */
function crmVisitCategoryColor(item) {
    if (item?.eventType === "block") return "#aaa2a7";
    if (item?.eventType === "external") return "#9aa2af";
    const service = currentServices.find(value =>
        value?.name && item?.service &&
        value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    const category = item?.category || service?.category || "";
    return item?.categoryColor || service?.categoryColor || globalColors?.[category] || item?.color || service?.color || "#b05c75";
}

/* ----- VIS.66. crmEnsureDayVisitsList (oryginalna linia 6616) ----- */
function crmEnsureDayVisitsList() {
    let overlay = document.getElementById("crmDayVisitsOverlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "crmDayVisitsOverlay";
    overlay.className = "crm-day-list-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="crm-day-list-panel" role="dialog" aria-modal="false" aria-labelledby="crmDayVisitsTitle">
        <header>
          <div><span>Wszystkie wizyty</span><h3 id="crmDayVisitsTitle">Wybrany dzień</h3></div>
          <button type="button" class="crm-day-list-close" aria-label="Zamknij">×</button>
        </header>
        <div id="crmDayVisitsBody" class="crm-day-list-body"></div>
      </section>`;
    overlay.querySelector(".crm-day-list-close").addEventListener("click", crmCloseDayVisitsList);

    /* CDL.1.4. Panel listy pozostaje otwarty do świadomego zamknięcia.
       Kliknięcie kalendarza ani obszaru poza panelem nie zamyka listy. */
    document.body.appendChild(overlay);
    return overlay;
}

/* ----- VIS.67. crmOpenDayVisitsList (oryginalna linia 6639) ----- */
function crmOpenDayVisitsList(date) {
    const overlay = crmEnsureDayVisitsList();
    crmOpenDayListDate = new Date(date);
    overlay.hidden = false;
    crmRenderDayVisitsList();
}

/* ----- VIS.68. crmCloseDayVisitsList (oryginalna linia 6646) ----- */
function crmCloseDayVisitsList() {
    const overlay = document.getElementById("crmDayVisitsOverlay");
    if (overlay) overlay.hidden = true;
    crmOpenDayListDate = null;
    crmOpenDayListSelectedKey = "";
}

/* ----- VIS.69. crmRenderDayVisitsList (oryginalna linia 6653) ----- */
function crmRenderDayVisitsList() {
    if (!crmOpenDayListDate) return;
    const title = document.getElementById("crmDayVisitsTitle");
    const body = document.getElementById("crmDayVisitsBody");
    if (!title || !body) return;
    title.textContent = crmOpenDayListDate.toLocaleDateString("pl-PL", {
        weekday:"long", day:"numeric", month:"long", year:"numeric"
    });
    const events = getCalendarEventsForDate(crmOpenDayListDate).filter(item => item.eventType !== "work_shift");
    body.innerHTML = "";
    if (!events.length) {
        const empty = document.createElement("p");
        empty.className = "crm-day-list-empty";
        empty.textContent = "Brak wizyt w tym dniu.";
        body.appendChild(empty);
        return;
    }
    events.forEach(item => {
        const key = crmVisitStableKey(item);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "crm-day-list-item" + (key === crmOpenDayListSelectedKey ? " is-selected" : "");
        const palette = typeof crmCategoryPalette === "function" ? crmCategoryPalette(item) : null;
        const color = palette?.stripe || crmVisitCategoryColor(item);
        const softColor = palette?.fill || crmHexToSoftBackground(color);
        button.style.setProperty("--crm-event-color", color);
        button.style.setProperty("--crm-event-soft", softColor);
        button.innerHTML = `
          <span class="crm-day-list-time">${crmEscapeText(crmVisitEndTime(item))}</span>
          <strong class="crm-day-list-service">${crmEscapeText(crmVisitService(item))}</strong>
          <small class="crm-day-list-client">${crmEscapeText(crmVisitClient(item))}</small>
          <span class="crm-day-list-status">${crmEscapeText(crmStatusIcon(item))}</span>`;
        button.addEventListener("click", () => {
            crmOpenDayListSelectedKey = key;
            body.querySelectorAll(".crm-day-list-item").forEach(node => node.classList.remove("is-selected"));
            button.classList.add("is-selected");
            openAppointmentDetailsModal(item);
        });
        body.appendChild(button);
    });
}

/* ==========================================================================
   ADMIN: ZAMYKANIE MENU STATUSU I KOSZA
   ========================================================================== */
(function crmInstallVisitMenuCloseBehavior() {
    document.addEventListener("click", event => {
        if (!event.target.closest("#crmVisitStatusButton, #crmVisitStatusMenu")) {
            const statusMenu = document.getElementById("crmVisitStatusMenu");
            if (statusMenu) statusMenu.hidden = true;
        }
        if (!event.target.closest("#crmVisitTrashButton, #crmVisitTrashMenu")) {
            const trashMenu = document.getElementById("crmVisitTrashMenu");
            if (trashMenu) trashMenu.hidden = true;
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const statusMenu = document.getElementById("crmVisitStatusMenu");
        const trashMenu = document.getElementById("crmVisitTrashMenu");
        if (statusMenu && !statusMenu.hidden) {
            event.stopImmediatePropagation();
            statusMenu.hidden = true;
        }
        if (trashMenu && !trashMenu.hidden) {
            event.stopImmediatePropagation();
            trashMenu.hidden = true;
        }
    }, true);
})();
/* KONIEC: ZAMYKANIE MENU STATUSU I KOSZA */

/* ==========================================================================
   ADMIN FINAL 2026-08-07: UMOW PONOWNIE, KOSZ BLOKADY I TOASTY
   ========================================================================== */

/* Otwiera istniejacy formularz nowej wizyty z danymi poprzedniej wizyty. */
planNextVisitFromCurrentAppointment = function() {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;

    const sourceVisit = currentEditingAppointment;
    const service = typeof crmFindServiceForVisit === "function"
        ? crmFindServiceForVisit(sourceVisit)
        : null;

    const clientName = String(sourceVisit.name || "").trim();
    const clientPhone = String(
        sourceVisit.phone ||
        sourceVisit.phoneNumber ||
        sourceVisit.clientPhone ||
        ""
    ).trim();
    const serviceName = String(sourceVisit.service || service?.name || "").trim();
    const duration = Math.max(5, Number(sourceVisit.duration || service?.duration || 45));

    /* Nowa wizyta nie moze odziedziczyc Event ID ani starego statusu. */
    currentEditingAppointment = null;

    if (typeof populateAppointmentDropdowns === "function") {
        populateAppointmentDropdowns();
    }

    const title = document.getElementById("modalTitleAppointment");
    const nameInput = document.getElementById("appointmentName");
    const phoneInput = document.getElementById("appointmentPhone");
    const serviceInput = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");
    const dateTimeInput = document.getElementById("appointmentDateTime");
    const modal = document.getElementById("appointmentModal");

    if (title) title.textContent = "Umów ponownie";
    if (nameInput) {
        nameInput.value = clientName;
        nameInput.readOnly = true;
        nameInput.setAttribute("aria-readonly", "true");
        nameInput.title = "Klient przypisany do poprzedniej wizyty";
    }
    if (phoneInput) {
        phoneInput.value = clientPhone;
        phoneInput.readOnly = true;
        phoneInput.setAttribute("aria-readonly", "true");
        phoneInput.title = "Numer telefonu klienta z poprzedniej wizyty";
    }
    if (typeof crmSetAppointmentServiceSelectionV3015 === "function") {
        crmSetAppointmentServiceSelectionV3015(serviceName, { clear:false });
    } else if (serviceInput) {
        serviceInput.value = serviceName;
    }
    if (durationInput) durationInput.value = String(duration);
    if (dateTimeInput) dateTimeInput.value = "";

    closeAppointmentModal();

    if (modal) modal.style.display = "flex";

    /* Odswiezenie kontrolki daty co 5 minut bez kopiowania starego terminu. */
    if (typeof crmSyncFiveMinuteControlsFromHidden === "function") {
        window.setTimeout(crmSyncFiveMinuteControlsFromHidden, 0);
    }

    if (dateTimeInput) {
        window.setTimeout(() => dateTimeInput.focus(), 0);
    }
};

/* Anulowanie zachowuje jedno potwierdzenie, a sukces pokazuje tylko toast. */
cancelAppointmentWithHistory = async function(initiator) {
    const title = initiator === "KLIENT" ? "Anuluj przez klienta" : "Anuluj przez salon";
    const ok = typeof crmConfirm === "function"
        ? await crmConfirm("Czy na pewno anulować tę wizytę?", title)
        : window.confirm("Czy na pewno anulować tę wizytę?");
    if (!ok) return;

    return crmRunLifecycleOperation(
        "ANULOWANIE",
        initiator || "MISTRZYNI",
        true,
        "Wizyta została anulowana.",
        document.activeElement
    );
};

/* Blokada korzysta z tego samego kosza w naglowku co wizyta klienta. */
const crmPopulatePanelBeforeBlockTrashPosition = crmPopulateNewVisitPanel;
crmPopulateNewVisitPanel = function(app) {
    crmPopulatePanelBeforeBlockTrashPosition.apply(this, arguments);

    const modal = document.getElementById("appointmentDetailsModal");
    const trashButton = document.getElementById("crmVisitTrashButton");
    const statusButton = document.getElementById("crmVisitStatusButton");
    const isBlock = app?.eventType === "block";

    if (modal) modal.classList.toggle("crm-panel-is-block", isBlock);

    if (statusButton && isBlock) statusButton.hidden = true;

    if (trashButton) {
        trashButton.style.gridColumn = "4";
        trashButton.style.gridRow = "1";
        trashButton.style.justifySelf = "end";
        trashButton.style.alignSelf = "center";
    }
};

/* Usuniecie blokady: jedno potwierdzenie i informacja w rogu, bez okna OK. */
deleteBlockTimeFromAdmin = async function() {
    if (!currentEditingAppointment || currentEditingAppointment.eventType !== "block") {
        if (typeof crmToast === "function") crmToast("Nie wybrano blokady czasu.", "error");
        return;
    }
    if (isDeletingAppointment) return;

    const confirmed = typeof crmConfirm === "function"
        ? await crmConfirm("Usunąć wybraną blokadę czasu?", "Usuń blokadę")
        : window.confirm("Usunąć wybraną blokadę czasu?");
    if (!confirmed) return;

    const block = currentEditingAppointment;
    const trashButton = document.getElementById("crmVisitTrashButton");
    isDeletingAppointment = true;
    if (trashButton) trashButton.disabled = true;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "deleteBlockTime",
                eventId: block.eventId || "",
                start: block.date || "",
                end: block.endDate || "",
                title: block.name || ""
            })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Nieznany błąd");

        const eventId = String(block.eventId || "");
        const blockDate = String(block.date || "");
        const blockName = String(block.name || "");

        appointmentsData = (appointmentsData || []).filter(item => {
            if (eventId && String(item.eventId || "") === eventId) return false;
            return !(!eventId && String(item.date || "") === blockDate && String(item.name || "") === blockName);
        });

        currentEditingAppointment = null;
        closeAppointmentModal();

        crmWriteLocalCalendarCacheV24();
        if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
        if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
        if (typeof renderDashboard === "function") renderDashboard();
        if (typeof calculateFinanceReport === "function") calculateFinanceReport();
        if (typeof crmToast === "function") crmToast("Blokada czasu została usunięta.");

        // Po sukcesie UI jest już poprawne z RAM; Google potwierdzamy lekkim syncem w tle.
        crmScheduleCalendarSyncV24("po-usunieciu-blokady");
    } catch (error) {
        console.error(error);
        if (typeof crmToast === "function") {
            crmToast("Błąd usuwania blokady czasu: " + (error.message || error), "error");
        }
    } finally {
        isDeletingAppointment = false;
        if (trashButton) trashButton.disabled = false;
    }
};

/* ==========================================================================
   ADMIN V25.2 — BEZPIECZNE USUWANIE ZEWNĘTRZNEGO GOOGLE EVENT
   - tylko eventType="external";
   - tylko dokładny eventId;
   - bez statusów i historii CRM;
   - po sukcesie natychmiastowa aktualizacja RAM/cache;
   - lekka synchronizacja kontrolna w tle.
   ========================================================================== */
async function deleteExternalCalendarEventFromAdmin() {
    const app = currentEditingAppointment;

    if (!app || app.eventType !== "external") {
        if (typeof crmToast === "function") {
            crmToast("Nie wybrano zewnętrznego wydarzenia Google Calendar.", "error");
        }
        return;
    }

    if (isDeletingAppointment) return;

    const eventId = String(app.eventId || "").trim();
    if (!eventId) {
        if (typeof crmToast === "function") {
            crmToast("Brak Event ID — wydarzenia nie można bezpiecznie usunąć.", "error");
        }
        return;
    }

    const confirmed = typeof crmConfirm === "function"
        ? await crmConfirm(
            "Usunąć to wydarzenie z Google Calendar? Tej operacji nie zapisujemy jako anulowania wizyty CRM.",
            "Usuń wydarzenie Google"
        )
        : window.confirm("Usunąć to wydarzenie z Google Calendar?");

    if (!confirmed) return;

    const trashButton = document.getElementById("crmVisitTrashButton");
    isDeletingAppointment = true;
    if (trashButton) trashButton.disabled = true;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "deleteExternalCalendarEvent",
                eventId: eventId
            })
        });

        const data = await response.json();
        if (!data || !data.success) {
            throw new Error((data && data.error) || "Nieznany błąd");
        }

        appointmentsData = (appointmentsData || []).filter(item =>
            String(item?.eventId || "").trim() !== eventId
        );

        currentEditingAppointment = null;
        closeAppointmentModal();

        if (typeof crmWriteLocalCalendarCacheV24 === "function") {
            crmWriteLocalCalendarCacheV24();
        }
        if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
        if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
        if (typeof renderDashboard === "function") renderDashboard();
        if (typeof calculateFinanceReport === "function") calculateFinanceReport();

        if (typeof crmToast === "function") {
            crmToast(
                data.alreadyMissing
                    ? "Wydarzenie nie istnieje już w Google Calendar."
                    : "Wydarzenie zostało usunięte z Google Calendar."
            );
        }

        if (typeof crmScheduleCalendarSyncV24 === "function") {
            crmScheduleCalendarSyncV24("po-usunieciu-external-google");
        }
    } catch (error) {
        console.error("Usuwanie zewnętrznego Google Event:", error);
        if (typeof crmToast === "function") {
            crmToast(
                "Nie udało się usunąć wydarzenia z Google Calendar: " +
                (error?.message || error),
                "error"
            );
        }
    } finally {
        isDeletingAppointment = false;
        if (trashButton) trashButton.disabled = false;
    }
}
/* KONIEC ADMIN V25.2 — EXTERNAL GOOGLE EVENT */

/* KONIEC ADMIN FINAL 2026-08-07 */

/* ==========================================================================
   ADMIN FINAL 2026-08-07: BLOKADA KLIENTA W TRYBIE UMOW PONOWNIE
   ========================================================================== */
function crmSetRebookClientFieldsReadonly(enabled) {
    const nameInput = document.getElementById("appointmentName");
    const phoneInput = document.getElementById("appointmentPhone");

    [nameInput, phoneInput].forEach(input => {
        if (!input) return;
        input.readOnly = Boolean(enabled);
        if (enabled) {
            input.setAttribute("aria-readonly", "true");
            input.classList.add("crm-rebook-readonly");
        } else {
            input.removeAttribute("aria-readonly");
            input.classList.remove("crm-rebook-readonly");
            input.removeAttribute("title");
        }
    });
}

/* Edycja zwyklej wizyty zawsze przywraca mozliwosc edycji danych klienta. */
const crmOpenEditAppointmentBeforeRebookLock = openEditAppointmentModal;
openEditAppointmentModal = function() {
    crmSetRebookClientFieldsReadonly(false);
    return crmOpenEditAppointmentBeforeRebookLock.apply(this, arguments);
};

/* Po rzeczywistym zamknieciu formularza zdejmujemy blokade dla kolejnego
   zwyklego uzycia przycisku Dodaj wizyte. */
const crmCloseCreateAppointmentBeforeRebookLock = closeCreateAppointmentModal;
closeCreateAppointmentModal = async function() {
    const result = await crmCloseCreateAppointmentBeforeRebookLock.apply(this, arguments);
    const modal = document.getElementById("appointmentModal");
    if (!modal || modal.style.display === "none") {
        crmSetRebookClientFieldsReadonly(false);
    }
    return result;
};

/* KONIEC: BLOKADA KLIENTA W TRYBIE UMOW PONOWNIE */

/* ==========================================================================
   VISITS RELIABILITY V7 2026-08-12
   Nieblokujacy zapis, minimalizacja, retry i odzyskanie po odswiezeniu.
   ========================================================================== */
const CRM_PENDING_APPOINTMENT_SAVE_KEY_V7 = "crm_pending_appointment_save_v7";
let crmAppointmentSaveJobV7 = null;

function crmOperationIdV7() {
    if (window.crypto?.randomUUID) return "ADM_" + window.crypto.randomUUID();
    return "ADM_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);
}

function crmReadPendingSaveV7() {
    try {
        return JSON.parse(localStorage.getItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7) || "null");
    } catch (ignore) {
        return null;
    }
}

function crmWritePendingSaveV7(job) {
    try {
        if (!job) localStorage.removeItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7);
        else localStorage.setItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7, JSON.stringify(job));
    } catch (ignore) {}
}

function crmEnsureAppointmentMinimizeButtonV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return null;

    let button = document.getElementById("crmAppointmentMinimizeBtnV7");
    if (button) return button;

    const header = modal.querySelector(".modal-header");
    const close = header?.querySelector(".modal-close");
    if (!header) return null;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmAppointmentMinimizeBtnV7";
    button.className = "crm-panel-minimize-v172";
    button.title = "Zwiń i wróć do Kalendarza";
    button.setAttribute("aria-label", "Zwiń");
    button.textContent = "—";

    button.onclick = () => crmMinimizeAppointmentEditorV7();

    if (close) header.insertBefore(button, close);
    else header.appendChild(button);

    return button;
}

function crmMinimizeAppointmentEditorV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return;
    modal.dataset.crmMinimized = "1";
    modal.style.display = "none";

    const text = isSavingAppointment
        ? "Zapisywanie wizyty w tle — kliknij, aby otworzyć"
        : "Niedokończona wizyta — kliknij, aby dokończyć";

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            isSavingAppointment ? "loading" : "pending",
            text,
            { onClick: crmRestoreAppointmentEditorV7, keep:true }
        );
    }
}

function crmRestoreAppointmentEditorV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return;
    modal.dataset.crmMinimized = "0";
    modal.style.display = "flex";
}

window.crmRestoreAppointmentEditorV7 = crmRestoreAppointmentEditorV7;

function crmCaptureAppointmentDraftV7() {
    const value = id => String(document.getElementById(id)?.value || "");
    return {
        name: value("appointmentName"),
        phone: value("appointmentPhone"),
        category: value("appointmentServiceCategory"),
        service: value("appointmentService"),
        duration: value("appointmentDuration"),
        date: value("appointmentDateTime")
    };
}

function crmApplyAppointmentDraftV7(draft) {
    if (!draft) return;
    const set = (id, value) => {
        const node = document.getElementById(id);
        if (node && value !== undefined && value !== null) node.value = value;
    };
    set("appointmentName", draft.name);
    set("appointmentPhone", draft.phone);
    set("appointmentDuration", draft.duration || "45");
    if (typeof crmSetAppointmentServiceSelectionV3015 === "function") {
        crmSetAppointmentServiceSelectionV3015(draft.service || "", { clear:false });
    } else {
        set("appointmentService", draft.service);
    }
    set("appointmentDateTime", draft.date);
}

async function crmCheckBookingOperationV7(operationId, options = {}) {
    if (!operationId) return { success:true, found:false };

    const attempts = Math.max(1, Number(options.attempts) || 5);
    const delays = [0, 800, 1600, 3000, 5000];
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (attempt > 1) await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));

        if (typeof crmSetBackgroundTaskStatus === "function" && options.showStatus) {
            crmSetBackgroundTaskStatus(
                "save",
                attempt === 1 ? "loading" : "retry",
                `Sprawdzanie zapisu · próba ${attempt}/${attempts}`,
                { keep:true }
            );
        }

        try {
            const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
            const response = await fetch(
                `${APPS_SCRIPT_URL}${separator}bookingOperationStatus=${encodeURIComponent(operationId)}&_op=${Date.now()}`,
                { method:"GET", cache:"no-store" }
            );
            if (!response.ok) throw new Error("HTTP " + response.status);
            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Nie udało się sprawdzić zapisu");
}

async function crmPostBookingAttemptV7(payload, attempt, total) {
    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            attempt === 1 ? "loading" : "retry",
            `Zapisywanie wizyty · próba ${attempt}/${total}`,
            { onClick: crmRestoreAppointmentEditorV7, keep:true }
        );
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 22000) : null;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method:"POST",
            headers:{ "Content-Type":"text/plain" },
            body:JSON.stringify(payload),
            signal:controller ? controller.signal : undefined
        });

        const text = await response.text();
        if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);

        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error("Serwer zwrócił nieprawidłową odpowiedź");
        }
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function crmLocalIsoMinuteV24(value) {
    const date = value instanceof Date ? new Date(value) : new Date(String(value || ""));
    if (Number.isNaN(date.getTime())) return String(value || "").slice(0,16);
    const pad = number => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function crmWriteLocalCalendarCacheV24() {
    try {
        if (typeof crmPerfWriteCacheV18 === "function") crmPerfWriteCacheV18({});
    } catch (ignore) {}
    try {
        if (typeof crmPerfWritePersistentCacheV19 === "function") crmPerfWritePersistentCacheV19({});
    } catch (ignore) {}
}

function crmScheduleCalendarSyncV24(reason) {
    const syncReason = reason || "lokalna-zmiana-kalendarza";

    /* Finalny koordynator sam scala kilka szybkich żądań w jedno.
       Dzięki temu zapis + zamknięcie panelu + render nie uruchamiają
       równoległych synchronizacji Google Calendar. */
    try {
        if (typeof crmScheduleCalendarLightSync === "function") {
            crmScheduleCalendarLightSync(syncReason);
            return;
        }
    } catch (ignore) {}

    Promise.resolve().then(async () => {
        try {
            if (typeof crmRetryCalendarLightSyncV6 === "function") {
                await crmRetryCalendarLightSyncV6(syncReason);
            } else if (typeof crmLightSyncCalendarData === "function") {
                await crmLightSyncCalendarData(syncReason);
            } else if (typeof loadSettings === "function") {
                await loadSettings();
            }
        } catch (error) {
            console.warn("Synchronizacja Kalendarza po lokalnej zmianie:", error?.message || error);
        }
    });
}

function crmLocalInsertSavedAppointmentV7(payload, data) {
    const previous = payload.editFlag && currentEditingAppointment
        ? currentEditingAppointment
        : null;
    const oldEventId = String(payload.oldEventId || previous?.eventId || "");
    const oldDate = String(payload.oldDate || previous?.date || "");
    const oldName = String(payload.oldName || previous?.name || "");
    const eventId = String(data?.eventId || oldEventId || "");

    appointmentsData = Array.isArray(appointmentsData) ? appointmentsData : [];

    if (payload.editFlag) {
        appointmentsData = appointmentsData.filter(item => {
            if (oldEventId && String(item?.eventId || "") === oldEventId) return false;
            return !(!oldEventId && oldDate && oldName && String(item?.date || "") === oldDate && String(item?.name || "") === oldName);
        });
    } else if (eventId && appointmentsData.some(item => String(item?.eventId || "") === eventId)) {
        return;
    }

    const duration = Number(payload.duration) || Number(previous?.duration) || 45;
    const start = crmLocalIsoMinuteV24(payload.date);
    const startDate = new Date(start);
    const end = Number.isNaN(startDate.getTime())
        ? ""
        : crmLocalIsoMinuteV24(new Date(startDate.getTime() + duration * 60000));
    const bookingSource = data?.bookingSource || previous?.bookingSource || previous?.source || payload.bookingSource || "ADMIN";

    appointmentsData.push({
        eventType:"appointment",
        date:start || payload.date,
        endDate:end,
        phone:payload.phone,
        name:payload.name,
        service:payload.service,
        category:previous?.category || "Inne",
        duration,
        status:previous?.status || "POTWIERDZONA",
        crmStatus:previous?.crmStatus || previous?.status || "POTWIERDZONA",
        eventId,
        appointmentId:data?.appointmentId || previous?.appointmentId || "",
        bookingSource,
        source:bookingSource,
        requestId:data?.sourceRequestId || previous?.requestId || payload.sourceRequestId || "",
        firstVisit:Boolean(data?.firstVisit ?? previous?.firstVisit),
        displayOnly:false
    });

    crmWriteLocalCalendarCacheV24();
    if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
    if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
}

async function crmFinishSuccessfulAppointmentSaveV7(payload, data) {
    crmWritePendingSaveV7(null);
    crmAppointmentSaveJobV7 = null;
    window.crmPendingContactRequestForBooking = null;
    window.crmPendingFirstVisitRequestForBooking = null;
    if (payload.firstVisitRequestId && typeof window.crmFirstVisitClearSelectionModeV8 === "function") {
        window.crmFirstVisitClearSelectionModeV8();
    }

    crmLocalInsertSavedAppointmentV7(payload, data);

    currentEditingAppointment = null;
    await closeCreateAppointmentModal(true);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus("save", "success", "Wizyta zapisana ✓");
    }
    if (typeof crmToast === "function") crmToast(payload.editFlag ? "Wizyta została zaktualizowana." : "Wizyta została dodana.");

    // Odświeżenia są osobnym zadaniem. Ich błąd NIE oznacza błędu zapisu.
    Promise.resolve().then(async () => {
        try {
            if (typeof crmRetryCalendarLightSyncV6 === "function") {
                await crmRetryCalendarLightSyncV6("po-zapisie-wizyty");
            } else if (typeof crmLightSyncCalendarData === "function") {
                await crmLightSyncCalendarData("po-zapisie-wizyty");
            }
        } catch (error) {
            console.warn("Wizyta zapisana, ale odświeżenie Kalendarza wymaga ponowienia:", error);
        }

        try {
            if (typeof crmLoadUnifiedInbox === "function") {
                await crmLoadUnifiedInbox({ silent:true, force:true });
            }
        } catch (error) {
            console.warn("Wizyta zapisana, Skrzynka odświeży się później:", error);
        }

        try {
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
        } catch (ignore) {}
    });
}

async function crmRunAppointmentSaveJobV7(job) {
    if (!job?.payload) return;
    crmAppointmentSaveJobV7 = job;
    crmWritePendingSaveV7(job);

    const total = 3;
    let lastNetworkError = null;

    for (let attempt = 1; attempt <= total; attempt += 1) {
        try {
            job.attempt = attempt;
            job.state = "saving";
            crmWritePendingSaveV7(job);

            const data = await crmPostBookingAttemptV7(job.payload, attempt, total);

            if (data?.success) {
                await crmFinishSuccessfulAppointmentSaveV7(job.payload, data);
                return;
            }

            // Błąd biznesowy — ponowienie go nie naprawi. Zachowujemy formularz.
            job.state = "attention";
            job.error = data?.error || "Nieznany błąd zapisu";
            crmWritePendingSaveV7(job);

            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "save",
                    "attention",
                    `Wymaga poprawy: ${job.error} — kliknij, aby dokończyć`,
                    { onClick: crmRestoreAppointmentEditorV7, keep:true }
                );
            }

            crmRestoreAppointmentEditorV7();
            return;
        } catch (error) {
            lastNetworkError = error;

            // Zanim ponowimy, sprawdzamy czy Google mimo utraty odpowiedzi już zapisał wizytę.
            try {
                const status = await crmCheckBookingOperationV7(job.payload.operationId, { attempts:1 });
                if (status?.found) {
                    await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
                    return;
                }
            } catch (ignore) {}

            if (attempt < total) {
                await new Promise(resolve => setTimeout(resolve, attempt * 1200));
            }
        }
    }

    job.state = "unknown";
    job.error = lastNetworkError?.message || "Nie udało się potwierdzić zapisu";
    crmWritePendingSaveV7(job);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "error",
            "Nie udało się potwierdzić zapisu — kliknij, aby sprawdzić i dokończyć",
            {
                keep:true,
                onClick: async () => {
                    try {
                        const status = await crmCheckBookingOperationV7(job.payload.operationId, { attempts:5, showStatus:true });
                        if (status?.found) {
                            await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
                            return;
                        }
                    } catch (error) {
                        console.warn(error);
                    }
                    crmRestoreAppointmentEditorV7();
                }
            }
        );
    }
}

saveAppointment = async function() {
    if (isSavingAppointment) return;

    const name = String(document.getElementById("appointmentName")?.value || "").trim();
    const phone = String(document.getElementById("appointmentPhone")?.value || "").trim();
    const service = String(document.getElementById("appointmentService")?.value || "").trim();
    const category = String(
        document.getElementById("appointmentServiceCategory")?.value ||
        crmAppointmentServicesV3015().find(item => String(item.name || "").trim() === service)?.category ||
        currentEditingAppointment?.category ||
        ""
    ).trim();
    const duration = Number(document.getElementById("appointmentDuration")?.value || 45) || 45;
    const dateValue = String(document.getElementById("appointmentDateTime")?.value || "").trim();
    const isBooksyEditV3032 = Boolean(
        currentEditingAppointment &&
        typeof crmIsBooksyVisitV3021 === "function" &&
        crmIsBooksyVisitV3021(currentEditingAppointment)
    );

    if (!name || (!phone && !isBooksyEditV3032) || !service || !dateValue) {
        const message = isBooksyEditV3032
            ? "Uzupełnij klienta, usługę i termin wizyty."
            : "Uzupełnij wszystkie pola wizyty.";
        if (typeof crmToast === "function") crmToast(message, "error");
        else alert(message);
        return;
    }

    const pendingFirstVisitRequest =
        (!currentEditingAppointment &&
         window.crmPendingFirstVisitRequestForBooking?.id)
            ? window.crmPendingFirstVisitRequestForBooking
            : null;

    const pendingContactRequest =
        (!currentEditingAppointment &&
         window.crmPendingContactRequestForBooking?.id)
            ? window.crmPendingContactRequestForBooking
            : null;

    const previousJob = crmReadPendingSaveV7();
    const sameDraft =
        previousJob?.draft &&
        previousJob.draft.name === name &&
        previousJob.draft.phone === phone &&
        String(previousJob.draft.category || "") === category &&
        previousJob.draft.service === service &&
        previousJob.draft.date === dateValue &&
        String(previousJob.draft.duration || "") === String(duration);

    const operationId =
        sameDraft && previousJob?.payload?.operationId
            ? previousJob.payload.operationId
            : crmOperationIdV7();

    const payload = {
        action:"createBooking",
        bookingSource: (pendingFirstVisitRequest || pendingContactRequest) ? "FORM_FIRST" : "ADMIN",
        phone: isBooksyEditV3032 && /^brak$/i.test(phone) ? "" : phone,
        name,
        service,
        category,
        date:dateValue,
        duration,
        rodo: currentEditingAppointment ? "Edytowano z CRM" : "Dodano z CRM",
        operationId
    };

    if (pendingFirstVisitRequest) {
        payload.firstVisitRequestId = pendingFirstVisitRequest.id;
        payload.sourceRequestId = pendingFirstVisitRequest.id;
    } else if (pendingContactRequest) {
        payload.contactRequestId = pendingContactRequest.id;
        payload.sourceRequestId = pendingContactRequest.id;
    }

    if (currentEditingAppointment) {
        const oldEventId = currentEditingAppointment.eventId || "";
        if (!oldEventId) {
            if (typeof crmToast === "function") crmToast("Brakuje Event ID. Odśwież Kalendarz i spróbuj ponownie.", "error");
            return;
        }
        payload.editFlag = true;
        payload.oldEventId = oldEventId;
        payload.oldDate = currentEditingAppointment.date;
        payload.oldName = currentEditingAppointment.name;

        if (isBooksyEditV3032 && typeof crmBooksyEditSourceMetadataV3021 === "function") {
            const meta = crmBooksyEditSourceMetadataV3021(currentEditingAppointment);
            payload.booksyCrmEdit = true;
            payload.preserveBookingSource = meta.preserveBookingSource;
            payload.sourceRequestId = meta.sourceRequestId;
            payload.preserveAppointmentId = meta.appointmentId;
            payload.preserveEventId = meta.eventId || oldEventId;
            payload.rodo = "Edytowano tylko w CRM — źródło Booksy zachowane";
        }
    }

    const job = {
        version:8,
        createdAt:Date.now(),
        state:"saving",
        attempt:0,
        draft:{ name, phone:payload.phone, category, service, duration:String(duration), date:dateValue },
        payload
    };

    isSavingAppointment = true;
    const saveBtn = document.getElementById("saveAppointmentBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Zapisywanie w tle…";
    }

    crmEnsureAppointmentMinimizeButtonV7();

    try {
        await crmRunAppointmentSaveJobV7(job);
    } finally {
        isSavingAppointment = false;
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Zapisz wizytę";
        }
    }
};

async function crmRecoverPendingAppointmentSaveV7() {
    const job = crmReadPendingSaveV7();
    if (!job?.payload?.operationId) return;

    crmAppointmentSaveJobV7 = job;

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "loading",
            "Sprawdzam niedokończony zapis po odświeżeniu…",
            { keep:true }
        );
    }

    try {
        const status = await crmCheckBookingOperationV7(job.payload.operationId, {
            attempts:5,
            showStatus:true
        });

        if (status?.found) {
            await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
            return;
        }
    } catch (error) {
        console.warn("Odzyskanie zapisu:", error);
    }

    crmApplyAppointmentDraftV7(job.draft);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "pending",
            "Niedokończony zapis wizyty — kliknij, aby dokończyć",
            {
                keep:true,
                onClick: () => {
                    crmRestoreAppointmentEditorV7();
                    const title = document.getElementById("modalTitleAppointment");
                    if (title) title.textContent = "Dokończ zapis wizyty";
                }
            }
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureAppointmentMinimizeButtonV7();
        crmRecoverPendingAppointmentSaveV7().catch(console.error);
    }, 2600);
});

/* KONIEC VISITS RELIABILITY V7 */

/* VISITS FIRST VISIT V8 — zamknięcie formularza nie zamyka samego zgłoszenia. */
if (typeof closeCreateAppointmentModal === "function") {
    const crmCloseCreateAppointmentModalBeforeFirstVisitV8 = closeCreateAppointmentModal;
    closeCreateAppointmentModal = async function(forceClose) {
        const hadFirstVisit = Boolean(window.crmPendingFirstVisitRequestForBooking?.id);
        const result = await crmCloseCreateAppointmentModalBeforeFirstVisitV8.apply(this, arguments);
        const modal = document.getElementById("appointmentModal");
        const closed = !modal || modal.style.display === "none";
        if (hadFirstVisit && closed && !isSavingAppointment) {
            window.crmPendingFirstVisitRequestForBooking = null;
        }
        return result;
    };
}
/* KONIEC VISITS FIRST VISIT V8 */

/* ==========================================================================
   ADMIN UX V17.2 — PANELE + DOLNY DOCK 2026-08-19

   1) Minimalizacja Dodaj/Edytuj wizytę zostawia małą kartę na dole.
   2) Zablokuj czas / Dodaj wolne dostaje taki sam boczny panel i minimalizację.
   3) Można mieć dwa zachowane szkice; dock pokazuje osobne karty.
   ========================================================================== */

function crmV172EnsureMinimizedDock() {
    let dock = document.getElementById("crmMinimizedPanelDockV172");
    if (dock) return dock;

    dock = document.createElement("div");
    dock.id = "crmMinimizedPanelDockV172";
    dock.setAttribute("aria-live", "polite");
    document.body.appendChild(dock);
    return dock;
}

function crmV172SetDockItem(kind, title, detail, onClick) {
    const dock = crmV172EnsureMinimizedDock();
    const id = `crmMinimizedDock_${kind}_V172`;

    let button = document.getElementById(id);
    if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "crm-minimized-dock-item-v172";
        dock.appendChild(button);
    }

    button.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "crm-minimized-dock-icon-v172";
    icon.textContent = kind === "block" ? "🔒" : "📅";

    const copy = document.createElement("span");
    copy.className = "crm-minimized-dock-copy-v172";

    const strong = document.createElement("strong");
    strong.textContent = title || (kind === "block" ? "Blokowanie" : "Rezerwacja");

    const small = document.createElement("small");
    small.textContent = detail || "Kliknij, aby wrócić";

    copy.appendChild(strong);
    copy.appendChild(small);

    button.appendChild(icon);
    button.appendChild(copy);

    button.onclick = typeof onClick === "function" ? onClick : null;
    button.style.display = "flex";
    dock.hidden = false;

    return button;
}

function crmV172ClearDockItem(kind) {
    const button = document.getElementById(`crmMinimizedDock_${kind}_V172`);
    if (button) button.remove();

    const dock = document.getElementById("crmMinimizedPanelDockV172");
    if (dock && !dock.querySelector(".crm-minimized-dock-item-v172")) {
        dock.hidden = true;
    }
}

function crmV172ShortDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return raw;
    return `${match[3]}.${match[2]}.${match[1]}`;
}

function crmV172AppointmentDockDetail() {
    const name = String(document.getElementById("appointmentName")?.value || "").trim();
    const heading = String(document.getElementById("modalTitleAppointment")?.textContent || "").trim();
    if (name) return name;
    if (/edytuj/i.test(heading)) return "Edycja wizyty";
    return "Nowa wizyta";
}

function crmV172BlockDockDetail() {
    const date = crmV172ShortDate(document.getElementById("block-date")?.value);
    const start = String(document.getElementById("block-start-time")?.value || "").trim();
    const end = String(document.getElementById("block-end-time")?.value || "").trim();
    const title = String(document.getElementById("block-title")?.value || "").trim();

    const time = start && end ? `${start}–${end}` : (start || end);
    const parts = [date, time].filter(Boolean);
    if (parts.length) return parts.join(" · ");
    return title || "Blokada czasu";
}

/* --- REZERWACJA: nowy dock zamiast znikania formularza bez śladu. --- */
if (typeof crmMinimizeAppointmentEditorV7 === "function") {
    crmMinimizeAppointmentEditorV7 = function() {
        const modal = document.getElementById("appointmentModal");
        if (!modal) return;

        modal.dataset.crmMinimized = "1";
        modal.style.display = "none";

        const oldStatus = document.getElementById("crmTaskStatusSave");
        if (oldStatus) oldStatus.style.display = "none";

        crmV172SetDockItem(
            "appointment",
            isSavingAppointment ? "Rezerwacja · zapisywanie…" : "Rezerwacja",
            crmV172AppointmentDockDetail(),
            crmRestoreAppointmentEditorV7
        );
    };
    window.crmMinimizeAppointmentEditorV7 = crmMinimizeAppointmentEditorV7;
}

if (typeof crmRestoreAppointmentEditorV7 === "function") {
    crmRestoreAppointmentEditorV7 = function() {
        const modal = document.getElementById("appointmentModal");
        if (!modal) return;

        const blockModal = document.getElementById("blockTimeModal");
        if (blockModal && blockModal.style.display !== "none") {
            crmMinimizeBlockTimeEditorV172();
        }

        modal.dataset.crmMinimized = "0";
        modal.style.display = "flex";
        crmV172ClearDockItem("appointment");
    };
    window.crmRestoreAppointmentEditorV7 = crmRestoreAppointmentEditorV7;
}

/* Po realnym zamknięciu/zapisie usuwamy kartę Rezerwacja z dołu. */
if (typeof closeCreateAppointmentModal === "function") {
    const crmV172CloseCreateAppointmentBefore = closeCreateAppointmentModal;

    closeCreateAppointmentModal = async function() {
        const result = await crmV172CloseCreateAppointmentBefore.apply(this, arguments);
        const modal = document.getElementById("appointmentModal");
        const hidden = !modal || modal.style.display === "none";
        const minimized = modal?.dataset.crmMinimized === "1";

        if (hidden && (!minimized || !crmAppointmentSaveJobV7)) {
            if (modal) modal.dataset.crmMinimized = "0";
            crmV172ClearDockItem("appointment");
        }
        return result;
    };
}

/* --- BLOKADA: taki sam minus jak w Rezerwacji. --- */
function crmEnsureBlockTimeMinimizeButtonV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return null;

    let button = document.getElementById("crmBlockTimeMinimizeBtnV172");
    if (button) return button;

    const header = modal.querySelector(".modal-header");
    const close = header?.querySelector(".modal-close");
    if (!header) return null;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmBlockTimeMinimizeBtnV172";
    button.className = "crm-panel-minimize-v172";
    button.title = "Zwiń blokowanie czasu";
    button.setAttribute("aria-label", "Zwiń blokowanie czasu");
    button.textContent = "—";
    button.onclick = crmMinimizeBlockTimeEditorV172;

    if (close) header.insertBefore(button, close);
    else header.appendChild(button);

    return button;
}

function crmMinimizeBlockTimeEditorV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return;

    modal.dataset.crmMinimized = "1";
    modal.style.display = "none";

    crmV172SetDockItem(
        "block",
        "Blokowanie",
        crmV172BlockDockDetail(),
        crmRestoreBlockTimeEditorV172
    );
}

function crmRestoreBlockTimeEditorV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return;

    const appointmentModal = document.getElementById("appointmentModal");
    if (appointmentModal && appointmentModal.style.display !== "none") {
        crmMinimizeAppointmentEditorV7();
    }

    modal.dataset.crmMinimized = "0";
    modal.style.display = "flex";
    crmV172ClearDockItem("block");
}

window.crmMinimizeBlockTimeEditorV172 = crmMinimizeBlockTimeEditorV172;
window.crmRestoreBlockTimeEditorV172 = crmRestoreBlockTimeEditorV172;

/* Każde otwarcie Blokady ma już przycisk minimalizacji. */
if (typeof openBlockTimeModal === "function") {
    const crmV172OpenBlockTimeBefore = openBlockTimeModal;
    openBlockTimeModal = function() {
        const result = crmV172OpenBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        crmEnsureBlockTimeMinimizeButtonV172();
        return result;
    };
}

if (typeof openEditBlockTimeModal === "function") {
    const crmV172OpenEditBlockTimeBefore = openEditBlockTimeModal;
    openEditBlockTimeModal = function() {
        const result = crmV172OpenEditBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        crmEnsureBlockTimeMinimizeButtonV172();
        return result;
    };
}

/* Anuluj/zapis Blokady usuwa jej kartę z docka. */
if (typeof closeBlockTimeModal === "function") {
    const crmV172CloseBlockTimeBefore = closeBlockTimeModal;
    closeBlockTimeModal = function() {
        const result = crmV172CloseBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        return result;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureBlockTimeMinimizeButtonV172();
    }, 100);
});

window.crmAdminPanelsVersionV172 = "17.2-details-insights-block-dock";

/* KONIEC ADMIN UX V17.2 */

/* ==========================================================================
   ADMIN UX V17.3 — INTELIGENTNY UKŁAD PRAWYCH PANELI
   2026-08-19

   Zasady:
   - kliknięcie dnia w Miesiącu zawsze pokazuje „Dane z dnia”;
   - „Dane z dnia” mają własny X;
   - 2 otwarte panele: obok siebie;
   - 3 otwarte panele:
       [Wszystkie wizyty] [Szczegóły wizyty]
                          [Dane z dnia]
   - zamknięcie dowolnego panelu automatycznie przelicza układ.
   ========================================================================== */

let crmV173InsightsUserHidden = false;

function crmV173IsVisible(node) {
    if (!node) return false;
    if (node.hidden) return false;
    if (node.style.display === "none") return false;
    return true;
}

function crmV173InsightsPanel() {
    if (typeof crmEnsureCalendarInsights === "function") {
        return crmEnsureCalendarInsights();
    }
    return document.getElementById("crmCalendarInsights");
}

function crmV173EnsureInsightsClose() {
    const panel = crmV173InsightsPanel();
    if (!panel) return null;

    panel.classList.add("crm-v173-insights-panel");

    let button = document.getElementById("crmInsightsCloseV173");
    if (button) return button;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmInsightsCloseV173";
    button.className = "crm-v173-insights-close";
    button.textContent = "×";
    button.title = "Zamknij dane z dnia";
    button.setAttribute("aria-label", "Zamknij dane z dnia");

    button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        crmV173SetInsightsVisible(false, true);
    };

    panel.appendChild(button);
    return button;
}

function crmV173SetInsightsVisible(visible, userAction = false) {
    const panel = crmV173InsightsPanel();
    if (!panel) return;

    if (visible) {
        crmV173InsightsUserHidden = false;
        panel.hidden = false;
        panel.classList.remove("crm-v173-user-hidden");
        document.body.classList.remove("crm-v173-insights-hidden");
        document.body.classList.add("crm-v173-insights-open");
        crmV173EnsureInsightsClose();
    } else {
        if (userAction) crmV173InsightsUserHidden = true;
        panel.classList.add("crm-v173-user-hidden");
        document.body.classList.remove("crm-v173-insights-open");
        document.body.classList.add("crm-v173-insights-hidden");
    }

    crmV173UpdateRightPanels();
}

function crmV173UpdateRightPanels() {
    const body = document.body;
    if (!body) return;

    const details = document.getElementById("appointmentDetailsModal");
    const dayOverlay = document.getElementById("crmDayVisitsOverlay");
    const insights = document.getElementById("crmCalendarInsights");

    const detailsOpen = crmV173IsVisible(details);
    const dayListOpen = crmV173IsVisible(dayOverlay);
    const insightsOpen =
        crmV173IsVisible(insights) &&
        !insights?.classList.contains("crm-v173-user-hidden");

    body.classList.toggle("crm-v173-details-open", detailsOpen);
    body.classList.toggle("crm-v173-day-list-open", dayListOpen);
    body.classList.toggle("crm-v173-insights-open", insightsOpen);
    body.classList.toggle("crm-v173-insights-hidden", !insightsOpen);
    body.classList.toggle(
        "crm-v173-three-right-panels",
        detailsOpen && dayListOpen && insightsOpen
    );
}

function crmV173MarkSelectedMonthCell(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return;

    const pad = value => String(value).padStart(2, "0");
    const key =
        date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate());

    document.querySelectorAll(".crm-month-cell.is-selected")
        .forEach(node => node.classList.remove("is-selected"));

    const cell = document.querySelector(
        `.crm-month-cell[data-date="${key}"]`
    );
    if (cell) cell.classList.add("is-selected");
}

function crmV173SelectDateForInsights(date, options = {}) {
    const next = new Date(date);
    if (Number.isNaN(next.getTime())) return;

    selectedCalendarDate = new Date(next);

    if (typeof miniMonthDate !== "undefined") {
        miniMonthDate = new Date(next);
    }

    crmV173SetInsightsVisible(true);

    if (typeof crmFinalV3RenderInsights === "function") {
        crmFinalV3RenderInsights();
    } else if (typeof crmRenderCalendarInsights === "function") {
        crmRenderCalendarInsights();
    }

    if (typeof renderMiniMonthCalendar === "function") {
        renderMiniMonthCalendar();
    }

    crmV173MarkSelectedMonthCell(next);

    if (options.renderCalendar && typeof renderBooksyCalendar === "function") {
        renderBooksyCalendar();
    }

    requestAnimationFrame(() => {
        crmV173EnsureInsightsClose();
        crmV173UpdateRightPanels();
    });
}

/* Kliknięcie zwykłego dnia w Miesiącu: panel dnia musi się pojawić. */
if (typeof crmFinalV3SelectDate === "function") {
    const crmV173SelectDateBefore = crmFinalV3SelectDate;
    crmFinalV3SelectDate = function(date) {
        crmV173SetInsightsVisible(true);
        const result = crmV173SelectDateBefore.apply(this, arguments);
        requestAnimationFrame(() => {
            crmV173EnsureInsightsClose();
            crmV173UpdateRightPanels();
        });
        return result;
    };
}

/* Przełączenie na Miesiąc również przywraca panel wybranego dnia. */
if (typeof setCalendarView === "function") {
    const crmV173SetCalendarViewBefore = setCalendarView;
    setCalendarView = function(mode) {
        const result = crmV173SetCalendarViewBefore.apply(this, arguments);

        if (String(mode || "").toLowerCase() === "month") {
            crmV173SetInsightsVisible(true);
            requestAnimationFrame(() => {
                if (typeof crmFinalV3RenderInsights === "function") {
                    crmFinalV3RenderInsights();
                }
                crmV173EnsureInsightsClose();
                crmV173UpdateRightPanels();
            });
        }

        return result;
    };
}

/*
 * +N pozostałe / Wszystkie wizyty:
 * oprócz otwarcia listy wybieramy ten sam dzień dla „Danych z dnia”.
 */
if (typeof crmOpenDayVisitsList === "function") {
    const crmV173OpenDayVisitsBefore = crmOpenDayVisitsList;
    crmOpenDayVisitsList = function(date) {
        crmV173SelectDateForInsights(date);
        const result = crmV173OpenDayVisitsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

if (typeof crmCloseDayVisitsList === "function") {
    const crmV173CloseDayVisitsBefore = crmCloseDayVisitsList;
    crmCloseDayVisitsList = function() {
        const result = crmV173CloseDayVisitsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

/* Szczegóły wizyty / zewnętrznego wydarzenia przeliczają układ po otwarciu. */
if (typeof openAppointmentDetailsModal === "function") {
    const crmV173OpenDetailsBefore = openAppointmentDetailsModal;
    openAppointmentDetailsModal = function(item) {
        if (item?.date) {
            const date = typeof crmDayEventDate === "function"
                ? crmDayEventDate(item)
                : new Date(item.date);

            if (date && !Number.isNaN(date.getTime())) {
                crmV173SelectDateForInsights(date);
            }
        }

        const result = crmV173OpenDetailsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

if (typeof closeAppointmentModal === "function") {
    const crmV173CloseDetailsBefore = closeAppointmentModal;
    closeAppointmentModal = function() {
        const result = crmV173CloseDetailsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

/* Każde odświeżenie danych dnia przywraca X i poprawny układ. */
if (typeof crmFinalV3RenderInsights === "function") {
    const crmV173RenderInsightsBefore = crmFinalV3RenderInsights;
    crmFinalV3RenderInsights = function() {
        const result = crmV173RenderInsightsBefore.apply(this, arguments);
        crmV173EnsureInsightsClose();
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmV173EnsureInsightsClose();
        crmV173UpdateRightPanels();
    }, 300);
});

window.crmAdminRightPanelsVersionV173 =
    "17.3-month-day-data-smart-right-panels";

/* KONIEC ADMIN UX V17.3 */

/* ==========================================================================
   ADMIN UX V17.6 — ŹRÓDŁO WIZYTY W WIERSZU KLIENTA
   2026-08-19
   ========================================================================== */

/*
 * Oryginalna logika tworzy #crmVisitSourceBadge w zielonym nagłówku.
 * Po uproszczeniu karty klienta badge nie powinien już wisieć pod nagłówkiem.
 * Przenosimy go do wiersza klienta po każdym odświeżeniu panelu.
 */
if (typeof crmApplyVisitPanelBusinessRules === "function") {
    const crmV176ApplyVisitPanelBusinessRulesBefore =
        crmApplyVisitPanelBusinessRules;

    crmApplyVisitPanelBusinessRules = function(app) {
        const result =
            crmV176ApplyVisitPanelBusinessRulesBefore.apply(this, arguments);

        const badge = document.getElementById("crmVisitSourceBadge");
        const clientCard = document.querySelector(
            "#appointmentDetailsModal .crm-safe-client-card"
        );

        if (badge && clientCard) {
            badge.classList.add("crm-v176-source-badge");
            clientCard.appendChild(badge);
        }

        return result;
    };
}

window.crmAdminDetailsVersionV176 =
    "17.6-source-badge-client-row";

/* KONIEC ADMIN UX V17.6 */

/* ==========================================================================
   ADMIN PANELS — CLEAN FINAL
   2026-08-19

   JEDYNA ZASADA:
   - Dodaj wizytę / Zablokuj czas: panel po prawej;
   - Szczegóły wizyty: panel po lewej;
   - żadnego automatycznego zwijania Szczegółów;
   - dolny dock tylko dla ręcznie zwijanych formularzy.
   ========================================================================== */

function crmPanelsCleanIsVisible(node) {
    if (!node || node.hidden) return false;
    const style = getComputedStyle(node);
    return style.display !== "none" &&
           style.visibility !== "hidden" &&
           Number(style.opacity || 1) !== 0;
}

function crmPanelsCleanUpdateLayout() {
    const details = document.getElementById("appointmentDetailsModal");
    const appointment = document.getElementById("appointmentModal");
    const block = document.getElementById("blockTimeModal");

    const detailsOpen = crmPanelsCleanIsVisible(details);
    const actionOpen =
        crmPanelsCleanIsVisible(appointment) ||
        crmPanelsCleanIsVisible(block);

    document.body.classList.toggle(
        "crm-final2-action-details",
        detailsOpen && actionOpen
    );

    /*
     * „Szczegóły wizyty” nie są już elementem automatycznego docka.
     * Jeśli po starej wersji istnieje taka karta w DOM, usuń ją.
     */
    const staleDetailsDock =
        document.getElementById("crmMinimizedDock_details_V172");

    if (staleDetailsDock) {
        staleDetailsDock.remove();
    }
}

/* Szczegóły: po otwarciu tylko przelicz układ. */
if (typeof openAppointmentDetailsModal === "function") {
    const crmPanelsCleanOpenDetailsBefore =
        openAppointmentDetailsModal;

    openAppointmentDetailsModal = function() {
        const result =
            crmPanelsCleanOpenDetailsBefore.apply(this, arguments);

        requestAnimationFrame(() => {
            crmPanelsCleanUpdateLayout();
        });

        return result;
    };
}

/* Szczegóły: po zamknięciu tylko przelicz układ. */
if (typeof closeAppointmentModal === "function") {
    const crmPanelsCleanCloseDetailsBefore =
        closeAppointmentModal;

    closeAppointmentModal = function() {
        const result =
            crmPanelsCleanCloseDetailsBefore.apply(this, arguments);

        requestAnimationFrame(() => {
            crmPanelsCleanUpdateLayout();
        });

        return result;
    };
}

function crmPanelsCleanWatch(node) {
    if (!node || node.dataset.crmPanelsCleanWatch === "1") return;

    node.dataset.crmPanelsCleanWatch = "1";

    new MutationObserver(() => {
        requestAnimationFrame(
            crmPanelsCleanUpdateLayout
        );
    }).observe(node, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
    });
}

window.addEventListener("resize", () => {
    requestAnimationFrame(
        crmPanelsCleanUpdateLayout
    );
});

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmPanelsCleanWatch(
            document.getElementById("appointmentDetailsModal")
        );
        crmPanelsCleanWatch(
            document.getElementById("appointmentModal")
        );
        crmPanelsCleanWatch(
            document.getElementById("blockTimeModal")
        );

        crmPanelsCleanUpdateLayout();
    }, 250);
});

window.crmAdminPanelsCleanFinal =
    "details-left-action-right-no-auto-dock";

/* KONIEC ADMIN PANELS — CLEAN FINAL */

/* ==========================================================================
   ADMIN V30.21 — BOOKSY: DOMYŚLNY PODGLĄD + ŚWIADOME ODBLOKOWANIE EDYCJI
   ========================================================================== */

window.crmAppointmentPriceSourceV3021 = window.crmAppointmentPriceSourceV3021 || "DOM";

function crmIsBooksyVisitV3021(app) {
    const raw = String(app?.bookingSource || app?.source || app?.createdBy || "").trim().toUpperCase();
    return raw.includes("BOOKSY");
}
window.crmIsBooksyVisitV3021 = crmIsBooksyVisitV3021;

function crmBooksyServicesForAppointmentV3021() {
    let list = [];
    try {
        if (typeof crmAdminBooksyPricesV29 !== "undefined" && Array.isArray(crmAdminBooksyPricesV29)) {
            list = crmAdminBooksyPricesV29;
        }
    } catch (ignore) {}

    if ((!Array.isArray(list) || !list.length)) {
        try {
            if (
                typeof CRM_ADMIN_BOOKSY_FALLBACK_V28 !== "undefined" &&
                Array.isArray(CRM_ADMIN_BOOKSY_FALLBACK_V28)
            ) {
                list = typeof crmBooksyNormalizeItemsV29 === "function"
                    ? crmBooksyNormalizeItemsV29(CRM_ADMIN_BOOKSY_FALLBACK_V28)
                    : CRM_ADMIN_BOOKSY_FALLBACK_V28;
            }
        } catch (ignore) {}
    }

    return (Array.isArray(list) ? list : [])
        .filter(item => item && String(item.name || "").trim());
}
window.crmBooksyServicesForAppointmentV3021 = crmBooksyServicesForAppointmentV3021;

function crmSetAppointmentPriceSourceV3021(source) {
    const normalized = String(source || "DOM").trim().toUpperCase() === "BOOKSY"
        ? "BOOKSY"
        : "DOM";
    window.crmAppointmentPriceSourceV3021 = normalized;

    const modal = document.getElementById("appointmentModal");
    if (modal) modal.dataset.crmPriceSource = normalized;

    const badge = document.getElementById("crmAppointmentPriceSourceBadgeV3021");
    if (badge) {
        badge.hidden = normalized !== "BOOKSY";
        if (normalized === "BOOKSY") {
            badge.innerHTML =
                '<strong>BOOKSY — edycja tylko CRM</strong>' +
                '<span>Usługi i ceny pochodzą wyłącznie z Cennika Booksy. Zapis nie aktualizuje Booksy ani Gmaila.</span>';
        }
    }
    return normalized;
}
window.crmSetAppointmentPriceSourceV3021 = crmSetAppointmentPriceSourceV3021;

const crmAppointmentServicesBeforeBooksyV3021 = crmAppointmentServicesV3015;
crmAppointmentServicesV3015 = function() {
    if (String(window.crmAppointmentPriceSourceV3021 || "DOM").toUpperCase() === "BOOKSY") {
        return crmBooksyServicesForAppointmentV3021();
    }
    return crmAppointmentServicesBeforeBooksyV3021();
};

async function crmEnsureBooksyAppointmentServicesV3021() {
    if (crmBooksyServicesForAppointmentV3021().length) return true;

    if (typeof crmLoadBooksyPricesV29 === "function") {
        let timer = null;
        try {
            await Promise.race([
                Promise.resolve(crmLoadBooksyPricesV29()).catch(() => null),
                new Promise(resolve => {
                    timer = window.setTimeout(() => resolve(null), 12000);
                })
            ]);
        } finally {
            if (timer) window.clearTimeout(timer);
        }
    }

    return crmBooksyServicesForAppointmentV3021().length > 0;
}
window.crmEnsureBooksyAppointmentServicesV3021 = crmEnsureBooksyAppointmentServicesV3021;

function crmEnsureAppointmentPriceSourceBadgeV3021() {
    const modal = document.getElementById("appointmentModal");
    const surface = modal?.querySelector(".modal-content");
    if (!surface) return null;

    let badge = document.getElementById("crmAppointmentPriceSourceBadgeV3021");
    if (!badge) {
        badge = document.createElement("div");
        badge.id = "crmAppointmentPriceSourceBadgeV3021";
        badge.className = "crm-booksy-editor-warning-v3021";
        badge.hidden = true;

        const header = surface.querySelector(".modal-header");
        if (header && header.nextSibling) {
            surface.insertBefore(badge, header.nextSibling);
        } else {
            surface.insertBefore(badge, surface.firstChild);
        }
    }
    return badge;
}

function crmEnsureBooksyVisitEditGuardV3021() {
    const host = document.getElementById("crmVisitTabContent");
    if (!host) return null;

    let guard = document.getElementById("crmBooksyVisitEditGuardV3021");
    if (!guard) {
        guard = document.createElement("div");
        guard.id = "crmBooksyVisitEditGuardV3021";
        guard.className = "crm-booksy-edit-guard-v3021";
        guard.hidden = true;
        guard.innerHTML = `
          <label class="crm-booksy-edit-check-v3021">
            <input id="crmBooksyVisitEditUnlockV3021"
                   type="checkbox"
                   onchange="crmToggleBooksyVisitEditV3021(this.checked)">
            <span>Edytuj dane CRM tej wizyty Booksy</span>
          </label>
          <small id="crmBooksyVisitEditHintV3021">
            Tryb podglądu. Zmiany w CRM nie aktualizują Booksy ani wiadomości Gmail.
          </small>`;

        const dateHeading = document.getElementById("crmVisitDateHeading");
        if (dateHeading?.nextSibling) {
            host.insertBefore(guard, dateHeading.nextSibling);
        } else {
            host.insertBefore(guard, host.firstChild);
        }
    }
    return guard;
}

function crmBooksyVisitEditUnlockedV3021() {
    const modal = document.getElementById("appointmentDetailsModal");
    return modal?.dataset.crmBooksyEditUnlockedV3021 === "1";
}
window.crmBooksyVisitEditUnlockedV3021 = crmBooksyVisitEditUnlockedV3021;

function crmApplyBooksyVisitEditStateV3021(app) {
    const isBooksy = crmIsBooksyVisitV3021(app);
    const modal = document.getElementById("appointmentDetailsModal");
    const guard = crmEnsureBooksyVisitEditGuardV3021();
    const checkbox = document.getElementById("crmBooksyVisitEditUnlockV3021");
    const hint = document.getElementById("crmBooksyVisitEditHintV3021");

    if (guard) guard.hidden = !isBooksy;
    if (!modal) return;

    if (!isBooksy) {
        delete modal.dataset.crmBooksyEditUnlockedV3021;
        delete modal.dataset.crmBooksyPreviewV3021;
        return;
    }

    const unlocked = crmBooksyVisitEditUnlockedV3021();
    modal.dataset.crmBooksyPreviewV3021 = unlocked ? "0" : "1";
    if (checkbox) checkbox.checked = unlocked;
    if (hint) {
        hint.textContent = unlocked
            ? "Edycja CRM odblokowana. Usługi pochodzą z Cennika Booksy. Zmiany nie są wysyłane do Booksy ani Gmaila."
            : "Tryb podglądu. Zaznacz pole wyżej, aby świadomie odblokować edycję CRM.";
    }

    const serviceCard = document.querySelector("#appointmentDetailsModal .crm-safe-service-card");
    if (serviceCard) {
        serviceCard.classList.toggle("crm-service-editable-v3015", unlocked);
        serviceCard.classList.toggle("is-readonly", !unlocked);
        serviceCard.title = unlocked
            ? "Kliknij, aby zmienić usługę Booksy tylko w CRM"
            : "Podgląd Booksy — najpierw zaznacz „Edytuj dane CRM”";
        serviceCard.setAttribute("role", unlocked ? "button" : "article");
        serviceCard.tabIndex = unlocked ? 0 : -1;
        serviceCard.onclick = unlocked
            ? () => openEditAppointmentModal({ changeService:true })
            : null;
        serviceCard.onkeydown = unlocked
            ? event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openEditAppointmentModal({ changeService:true });
                }
            }
            : null;
    }

    const clientCard = document.querySelector("#appointmentDetailsModal .crm-safe-client-card");
    if (clientCard) {
        clientCard.classList.toggle("is-readonly", !unlocked);
        clientCard.title = unlocked
            ? "Otwórz edycję CRM wizyty Booksy"
            : "Podgląd Booksy — najpierw zaznacz „Edytuj dane CRM”";
        clientCard.onclick = unlocked ? () => openEditAppointmentModal() : null;
        clientCard.onkeydown = unlocked
            ? event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openEditAppointmentModal();
                }
            }
            : null;
        clientCard.tabIndex = unlocked ? 0 : -1;
    }

    const statusButton = document.getElementById("crmVisitStatusButton");
    const trashButton = document.getElementById("crmVisitTrashButton");
    const repeatButton = document.getElementById("crmRepeatVisitBtn");
    const addServiceButton = document.querySelector("#appointmentDetailsModal .crm-safe-add-service");

    if (statusButton) statusButton.hidden = !unlocked;
    if (trashButton) trashButton.hidden = !unlocked;
    if (repeatButton) repeatButton.hidden = !unlocked;
    if (addServiceButton) addServiceButton.hidden = true;
}
window.crmApplyBooksyVisitEditStateV3021 = crmApplyBooksyVisitEditStateV3021;

function crmToggleBooksyVisitEditV3021(checked) {
    const app = currentEditingAppointment;
    if (!crmIsBooksyVisitV3021(app)) return;

    const modal = document.getElementById("appointmentDetailsModal");
    if (modal) modal.dataset.crmBooksyEditUnlockedV3021 = checked ? "1" : "0";
    crmApplyBooksyVisitEditStateV3021(app);

    if (typeof crmToast === "function") {
        crmToast(
            checked
                ? "Edycja CRM wizyty Booksy została odblokowana."
                : "Wizyta Booksy wróciła do trybu podglądu.",
            checked ? "success" : "info"
        );
    }
}
window.crmToggleBooksyVisitEditV3021 = crmToggleBooksyVisitEditV3021;

function crmBooksyEditSourceMetadataV3021(app) {
    const raw = String(app?.bookingSource || app?.source || "BOOKSY_GMAIL").trim().toUpperCase();
    return {
        preserveBookingSource: raw.includes("BOOKSY") ? raw : "BOOKSY_GMAIL",
        sourceRequestId: String(
            app?.requestId ||
            app?.sourceRequestId ||
            app?.gmailMessageId ||
            app?.operationId ||
            ""
        ).trim(),
        appointmentId: String(app?.appointmentId || app?.id || "").trim(),
        eventId: String(app?.eventId || "").trim()
    };
}
window.crmBooksyEditSourceMetadataV3021 = crmBooksyEditSourceMetadataV3021;

const crmFindServiceForVisitBeforeBooksyV3021 = crmFindServiceForVisit;
crmFindServiceForVisit = function(app) {
    if (crmIsBooksyVisitV3021(app)) {
        const name = String(app?.service || "").trim().toLocaleLowerCase("pl-PL");
        return crmBooksyServicesForAppointmentV3021().find(item =>
            String(item?.name || "").trim().toLocaleLowerCase("pl-PL") === name
        ) || null;
    }
    return crmFindServiceForVisitBeforeBooksyV3021(app);
};

const crmOpenDetailsBeforeBooksyV3021 = openAppointmentDetailsModal;
openAppointmentDetailsModal = function(app) {
    const result = crmOpenDetailsBeforeBooksyV3021.apply(this, arguments);
    const modal = document.getElementById("appointmentDetailsModal");

    if (crmIsBooksyVisitV3021(app)) {
        if (modal) modal.dataset.crmBooksyEditUnlockedV3021 = "0";
    } else if (modal) {
        delete modal.dataset.crmBooksyEditUnlockedV3021;
    }

    crmApplyBooksyVisitEditStateV3021(app);

    if (crmIsBooksyVisitV3021(app)) {
        Promise.resolve(crmEnsureBooksyAppointmentServicesV3021())
            .then(ok => {
                if (!ok || currentEditingAppointment !== app) return;
                try { crmPopulateNewVisitPanel(app); } catch (ignore) {}
                crmApplyBooksyVisitEditStateV3021(app);
            })
            .catch(() => {});
    }

    return result;
};

const crmOpenEditBeforeBooksyV3021 = openEditAppointmentModal;
openEditAppointmentModal = async function(options) {
    const app = currentEditingAppointment;
    const isBooksy = crmIsBooksyVisitV3021(app);

    if (isBooksy && !crmBooksyVisitEditUnlockedV3021()) {
        if (typeof crmToast === "function") {
            crmToast("Najpierw zaznacz „Edytuj dane CRM tej wizyty Booksy”.", "error");
        }
        return;
    }

    crmEnsureAppointmentPriceSourceBadgeV3021();
    crmSetAppointmentPriceSourceV3021(isBooksy ? "BOOKSY" : "DOM");

    if (isBooksy) {
        const ready = await crmEnsureBooksyAppointmentServicesV3021();
        if (!ready) {
            if (typeof crmToast === "function") {
                crmToast("Nie udało się załadować Cennika Booksy.", "error");
            } else {
                alert("Nie udało się załadować Cennika Booksy.");
            }
            return;
        }
    }

    const result = await crmOpenEditBeforeBooksyV3021.apply(this, arguments);

    const title = document.getElementById("modalTitleAppointment");
    if (isBooksy && title) {
        title.textContent = options?.changeService
            ? "Zmień usługę Booksy — tylko CRM"
            : "Edytuj wizytę Booksy — tylko CRM";
    }

    crmSetAppointmentPriceSourceV3021(isBooksy ? "BOOKSY" : "DOM");
    return result;
};

window.crmBooksyAppointmentEditorDebugV3021 = function(app) {
    const source = crmIsBooksyVisitV3021(app) ? "BOOKSY" : "DOM";
    const services = source === "BOOKSY"
        ? crmBooksyServicesForAppointmentV3021()
        : crmAppointmentServicesBeforeBooksyV3021();
    const categories = [];
    const seen = new Set();
    services.forEach(item => {
        const category = String(item?.category || "").trim();
        if (!category) return;
        const key = category.toLocaleLowerCase("pl-PL");
        if (seen.has(key)) return;
        seen.add(key);
        categories.push(category);
    });
    return {
        source,
        count:services.length,
        categories,
        metadata: crmBooksyEditSourceMetadataV3021(app)
    };
};

