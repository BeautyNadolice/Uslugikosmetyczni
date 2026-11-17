/* ========================================================================== 
   CRM TEST LIGHT 8.4 — KATEGORIE + BOOKSY PODGLĄD/EDYCJA — HARNESS FIX
   2026-08-30

   CEL:
   Znaleźć źródło różnicy między:
   1) zwykłym wejściem do „Edytuj wizytę” przez kartę klienta,
   2) wejściem przez kliknięcie karty usługi,
   3) późniejszym „Dodaj wizytę”, które wg zgłoszenia potrafi odziedziczyć
      tylko kategorię z ostatniej próby edycji.

   BEZPIECZEŃSTWO:
   - test NICZEGO nie zapisuje,
   - nie tworzy/nie usuwa wizyt,
   - nie zmienia klienta ani Google Calendar,
   - nie pobiera Cennika z backendu przed pierwszym snapshotem,
   - zapisuje i odtwarza stan pól formularza oraz currentEditingAppointment.
   ========================================================================== */

const CRM_TEST_LIGHT_VERSION = "8.4.0";
const CRM_TEST_LIGHT_SCOPE = "APPOINTMENT_CATEGORY_AND_BOOKSY_EDIT_GUARD_HARNESS_FIX";

function crmLiteAddV81(report, ok, name, details) {
    crmTestAdd(report, ok ? "OK" : "BLAD", name, details);
    return Boolean(ok);
}

function crmLiteSafeJsonV81(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch (ignore) { return null; }
}

function crmLiteServicesSummaryV81(list) {
    const services = Array.isArray(list) ? list : [];
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
        count: services.length,
        categories,
        categoryCount: categories.length,
        sample: services.slice(0, 8).map(item => ({
            category: String(item?.category || ""),
            name: String(item?.name || "")
        }))
    };
}

function crmLiteCurrentServicesV81() {
    try {
        if (typeof currentServices !== "undefined" && Array.isArray(currentServices)) return currentServices;
    } catch (ignore) {}
    try {
        if (Array.isArray(window.currentServices)) return window.currentServices;
    } catch (ignore) {}
    return [];
}

function crmLiteCacheSnapshotsV81() {
    let picker = null;
    let bootSessionRaw = null;
    let bootPersistentRaw = null;
    let bootV18 = null;
    let bootV19 = null;

    try { picker = crmLiteSafeJsonV81(sessionStorage.getItem("crm_appointment_services_v3017")); } catch (ignore) {}
    try { bootSessionRaw = crmLiteSafeJsonV81(sessionStorage.getItem("crm_admin_bootstrap_v18")); } catch (ignore) {}
    try { bootPersistentRaw = crmLiteSafeJsonV81(localStorage.getItem("crm_admin_bootstrap_persist_v19")); } catch (ignore) {}
    try { if (typeof crmPerfReadCacheV18 === "function") bootV18 = crmPerfReadCacheV18(); } catch (ignore) {}
    try { if (typeof crmPerfReadPersistentCacheV19 === "function") bootV19 = crmPerfReadPersistentCacheV19(); } catch (ignore) {}

    return {
        pickerSession: crmLiteServicesSummaryV81(picker),
        bootstrapV18Function: crmLiteServicesSummaryV81(bootV18?.services),
        bootstrapV18Raw: crmLiteServicesSummaryV81(bootSessionRaw?.data?.services),
        bootstrapV19Function: crmLiteServicesSummaryV81(bootV19?.data?.services),
        bootstrapV19Raw: crmLiteServicesSummaryV81(bootPersistentRaw?.data?.services)
    };
}

function crmLiteSelectSnapshotV81(id) {
    const select = document.getElementById(id);
    if (!select) return null;
    return {
        value: String(select.value || ""),
        disabled: Boolean(select.disabled),
        options: Array.from(select.options || []).map(option => ({
            value: String(option.value || ""),
            text: String(option.textContent || "").trim()
        })).slice(0, 40)
    };
}

function crmLiteEditorSnapshotV81(label) {
    const duration = document.getElementById("appointmentDuration");
    return {
        label,
        category: crmLiteSelectSnapshotV81("appointmentServiceCategory"),
        service: crmLiteSelectSnapshotV81("appointmentService"),
        duration: duration ? {
            value: String(duration.value || ""),
            disabled: Boolean(duration.disabled),
            placeholder: String(duration.placeholder || "")
        } : null,
        currentServices: crmLiteServicesSummaryV81(crmLiteCurrentServicesV81()),
        pickerSource: String(window.crmAppointmentPickerSourceV3018 || "")
    };
}

function crmLiteSaveDomV81() {
    const ids = [
        "appointmentName",
        "appointmentPhone",
        "appointmentServiceCategory",
        "appointmentService",
        "appointmentDuration",
        "appointmentDateTime",
        "modalTitleAppointment"
    ];
    const saved = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        saved[id] = {
            innerHTML: "innerHTML" in el ? el.innerHTML : undefined,
            value: "value" in el ? String(el.value || "") : undefined,
            disabled: "disabled" in el ? Boolean(el.disabled) : undefined,
            readOnly: "readOnly" in el ? Boolean(el.readOnly) : undefined,
            placeholder: "placeholder" in el ? String(el.placeholder || "") : undefined,
            text: id === "modalTitleAppointment" ? String(el.innerText || "") : undefined
        };
    });
    ["appointmentModal", "appointmentDetailsModal", "crmDayVisitsOverlay"].forEach(id => {
        const el = document.getElementById(id);
        if (el) saved[`display:${id}`] = el.style.display;
    });
    return saved;
}

function crmLiteRestoreDomV81(saved) {
    Object.entries(saved || {}).forEach(([id, state]) => {
        if (id.startsWith("display:")) {
            const el = document.getElementById(id.slice(8));
            if (el) el.style.display = state;
            return;
        }
        const el = document.getElementById(id);
        if (!el || !state) return;
        if (state.innerHTML !== undefined) el.innerHTML = state.innerHTML;
        if (state.value !== undefined && "value" in el) el.value = state.value;
        if (state.disabled !== undefined && "disabled" in el) el.disabled = state.disabled;
        if (state.readOnly !== undefined && "readOnly" in el) el.readOnly = state.readOnly;
        if (state.placeholder !== undefined && "placeholder" in el) el.placeholder = state.placeholder;
        if (state.text !== undefined) el.innerText = state.text;
    });
}

function crmLiteFindServiceV81(categoryPattern) {
    const list = crmLiteCurrentServicesV81();
    const regex = categoryPattern instanceof RegExp ? categoryPattern : new RegExp(String(categoryPattern || ""), "i");
    return list.find(item => regex.test(String(item?.category || ""))) || null;
}

function crmLiteSyntheticAppointmentV81(service) {
    if (!service) return null;
    return {
        name: `CRM LITE ${String(service.category || "USŁUGA")}`,
        phone: "",
        service: String(service.name || ""),
        category: String(service.category || ""),
        duration: Number(service.duration || 45),
        date: "2026-08-30T12:00",
        eventType: "appointment",
        eventId: "CRM_LITE_NO_SAVE"
    };
}

function crmLiteRunPath1V81(appointment) {
    if (!appointment) return null;
    try { currentEditingAppointment = appointment; } catch (ignore) {}

    if (typeof crmPrimeAppointmentServiceFieldsV3019 === "function") {
        crmPrimeAppointmentServiceFieldsV3019(appointment);
    }
    const afterPrime = crmLiteEditorSnapshotV81("PATH1_AFTER_PRIME");

    if (typeof populateAppointmentDropdowns === "function") populateAppointmentDropdowns();
    if (typeof crmSetAppointmentServiceSelectionV3015 === "function") {
        const preferred = typeof crmInferAppointmentCategoryV3019 === "function"
            ? crmInferAppointmentCategoryV3019(appointment)
            : String(appointment.category || "");
        crmSetAppointmentServiceSelectionV3015(appointment.service || "", {
            clear:false,
            preferredCategory:preferred
        });
    }
    const afterPopulate = crmLiteEditorSnapshotV81("PATH1_AFTER_POPULATE");

    return { afterPrime, afterPopulate };
}

function crmLiteRunAddVisitV81() {
    if (typeof openCreateModal !== "function") return {error:"Brak openCreateModal()"};
    openCreateModal();
    return crmLiteEditorSnapshotV81("ADD_VISIT_AFTER_OPEN");
}

function crmLiteRunPath2V81(appointment) {
    if (!appointment) return null;
    try { currentEditingAppointment = appointment; } catch (ignore) {}
    if (typeof populateAppointmentDropdowns === "function") populateAppointmentDropdowns();
    if (typeof crmSetAppointmentServiceSelectionV3015 === "function") {
        crmSetAppointmentServiceSelectionV3015(appointment.service || "", {clear:true});
    }
    return crmLiteEditorSnapshotV81("PATH2_CHANGE_SERVICE_CLEAR");
}

function crmLiteCategoryOptionValuesV81(snapshot) {
    return (snapshot?.category?.options || [])
        .map(x => String(x.value || "").trim())
        .filter(Boolean);
}

function crmLiteDiagnoseV81(report, baseline, sequences, cachesBefore, cachesAfter) {
    const currentSummary = baseline?.currentServices || {categoryCount:0,categories:[]};
    const addSnapshots = [];
    Object.values(sequences || {}).forEach(seq => {
        if (seq?.addAfterPath1) addSnapshots.push(seq.addAfterPath1);
    });

    const narrowedAdds = addSnapshots.filter(s => crmLiteCategoryOptionValuesV81(s).length === 1);
    const fullCurrent = currentSummary.categoryCount > 1;

    if (!fullCurrent) {
        crmTestAdd(report, "BLAD", "DIAGNOZA: currentServices jest już zawężone", {
            currentServices: currentSummary,
            cachesBefore,
            cachesAfter,
            conclusion:"Źródło jest wyżej niż sam select: globalna lista currentServices/cache nie zawiera pełnego Cennika DOM."
        });
        return;
    }

    if (narrowedAdds.length) {
        crmTestAdd(report, "BLAD", "DIAGNOZA: Add wizytę dziedziczy stan selecta mimo pełnego currentServices", {
            currentServices: currentSummary,
            narrowedAdds,
            conclusion:"Dane Cennika są pełne, ale stan DOM/formularza po ścieżce edycji nie jest poprawnie odbudowywany przed Dodaj wizytę."
        });
        return;
    }

    const cacheSummaries = Object.values(cachesBefore || {});
    const poisonedCache = cacheSummaries.find(x => x?.count > 0 && x?.categoryCount === 1);
    if (poisonedCache) {
        crmTestAdd(report, "BLAD", "DIAGNOZA: co najmniej jeden cache ma tylko jedną kategorię", {
            cachesBefore,
            cachesAfter,
            conclusion:"Możliwe skażenie cache kategorią z poprzedniej edycji."
        });
        return;
    }

    crmTestAdd(report, "OK", "REGRESJA: formularze odbudowują pełną listę kategorii", {
        baseline,
        sequences,
        cachesBefore,
        cachesAfter,
        conclusion:"currentServices jest pełne, a kontrolowane ścieżki nie dziedziczą już zawężonego selecta kategorii."
    });
}


function crmLiteBooksySummaryV83() {
    let services = [];
    try {
        if (typeof crmBooksyServicesForAppointmentV3021 === "function") {
            services = crmBooksyServicesForAppointmentV3021();
        }
    } catch (ignore) {}
    return crmLiteServicesSummaryV81(services);
}

function crmLiteVisibleV83(element) {
    if (!element) return false;
    if (element.hidden) return false;
    try { return getComputedStyle(element).display !== "none"; } catch (ignore) { return true; }
}

async function crmLiteRunBooksyV83(report) {
    crmTestSetProgress(82, "Lite: Booksy — sprawdzam tryb podglądu i Cennik Booksy…");

    const apiOk = typeof crmEnsureBooksyAppointmentServicesV3021 === "function";
    crmLiteAddV81(report, apiOk, "BOOKSY: funkcje edytora V30.21 są dostępne", {
        ensure: typeof crmEnsureBooksyAppointmentServicesV3021,
        guard: typeof crmApplyBooksyVisitEditStateV3021,
        source: typeof crmSetAppointmentPriceSourceV3021
    });
    if (!apiOk) return;

    const ready = await crmEnsureBooksyAppointmentServicesV3021();
    const booksySummary = crmLiteBooksySummaryV83();
    crmLiteAddV81(report, ready && booksySummary.count > 0 && booksySummary.categoryCount > 0,
        "BOOKSY: Cennik Booksy jest dostępny dla edytora", booksySummary);

    let booksyServices = [];
    try { booksyServices = crmBooksyServicesForAppointmentV3021(); } catch (ignore) {}
    const chosen = booksyServices.find(item => /laminacja|manicure|pedicure/i.test(String(item?.name || ""))) || booksyServices[0];
    if (!chosen) {
        crmTestAdd(report, "BLAD", "BOOKSY: brak usługi do testu", booksySummary);
        return;
    }

    const app = {
        name:"CRM LITE BOOKSY",
        phone:"",
        service:String(chosen.name || ""),
        category:String(chosen.category || ""),
        duration:Number(chosen.duration || 45),
        date:"2026-08-30T12:00",
        eventType:"appointment",
        eventId:"CRM_LITE_BOOKSY_NO_SAVE",
        bookingSource:"BOOKSY_GMAIL",
        source:"BOOKSY_GMAIL",
        requestId:"CRM_LITE_BOOKSY_SOURCE_ID"
    };

    const appointmentModal = document.getElementById("appointmentModal");
    if (appointmentModal) appointmentModal.style.display = "none";

    /*
     * Lite 8.4 nie korzysta z publicznego openAppointmentDetailsModal(), bo finalna
     * warstwa ADMINA celowo ignoruje otwieranie szczegółów poza zakładką Kalendarz.
     * Test uruchamiany jest z Ustawień, więc poprzednia wersja 8.3 badała czasem
     * stary stan panelu zamiast syntetycznej wizyty Booksy.
     */
    try { currentEditingAppointment = app; } catch (ignore) {}
    if (typeof crmInstallSafeRightVisitPanel === "function") crmInstallSafeRightVisitPanel();
    const detailsModal = document.getElementById("appointmentDetailsModal");
    if (detailsModal) {
        detailsModal.style.display = "flex";
        detailsModal.dataset.crmBooksyEditUnlockedV3021 = "0";
        detailsModal.dataset.crmBooksyPreviewV3021 = "1";
    }
    if (typeof crmPopulateNewVisitPanel === "function") crmPopulateNewVisitPanel(app);
    if (typeof crmApplyBooksyVisitEditStateV3021 === "function") crmApplyBooksyVisitEditStateV3021(app);
    await new Promise(resolve => setTimeout(resolve, 0));

    const guard = document.getElementById("crmBooksyVisitEditGuardV3021");
    const checkbox = document.getElementById("crmBooksyVisitEditUnlockV3021");
    const serviceCard = document.querySelector("#appointmentDetailsModal .crm-safe-service-card");
    const clientCard = document.querySelector("#appointmentDetailsModal .crm-safe-client-card");
    const statusButton = document.getElementById("crmVisitStatusButton");
    const trashButton = document.getElementById("crmVisitTrashButton");

    crmLiteAddV81(report,
        crmLiteVisibleV83(guard) && checkbox && checkbox.checked === false,
        "BOOKSY: wizyta otwiera się domyślnie w trybie PODGLĄD",
        {
            guardVisible:crmLiteVisibleV83(guard),
            checked:Boolean(checkbox?.checked),
            preview:document.getElementById("appointmentDetailsModal")?.dataset?.crmBooksyPreviewV3021 || ""
        }
    );

    crmLiteAddV81(report,
        !serviceCard?.onclick && !clientCard?.onclick && Boolean(statusButton?.hidden) && Boolean(trashButton?.hidden),
        "BOOKSY: bez ptaszka pola krytyczne nie są edytowalne",
        {
            serviceClickable:Boolean(serviceCard?.onclick),
            clientClickable:Boolean(clientCard?.onclick),
            statusHidden:Boolean(statusButton?.hidden),
            trashHidden:Boolean(trashButton?.hidden)
        }
    );

    const matched = typeof crmFindServiceForVisit === "function" ? crmFindServiceForVisit(app) : null;
    crmLiteAddV81(report,
        Boolean(matched) && String(matched?.category || "") === String(chosen.category || "") && Number(matched?.price) === Number(chosen.price),
        "BOOKSY: podgląd dopasowuje usługę/cenę z Cennika Booksy, nie DOM",
        {chosen, matched}
    );

    crmLiteAddV81(report,
        typeof crmIsBooksyVisitV3021 === "function" && crmIsBooksyVisitV3021(currentEditingAppointment),
        "BOOKSY: test pracuje na właściwej syntetycznej wizycie Booksy",
        currentEditingAppointment
    );

    if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", {bubbles:true}));
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    crmLiteAddV81(report,
        Boolean(checkbox?.checked) && Boolean(serviceCard?.onclick) && Boolean(clientCard?.onclick) && !statusButton?.hidden && !trashButton?.hidden,
        "BOOKSY: ptaszek świadomie odblokowuje edycję CRM",
        {
            checked:Boolean(checkbox?.checked),
            dataset:document.getElementById("appointmentDetailsModal")?.dataset?.crmBooksyEditUnlockedV3021 || "",
            serviceClickable:Boolean(serviceCard?.onclick),
            clientClickable:Boolean(clientCard?.onclick),
            statusHidden:Boolean(statusButton?.hidden),
            trashHidden:Boolean(trashButton?.hidden)
        }
    );

    if (typeof openEditAppointmentModal === "function") await openEditAppointmentModal();

    const category = crmLiteSelectSnapshotV81("appointmentServiceCategory");
    const service = crmLiteSelectSnapshotV81("appointmentService");
    const booksyCategoryValues = (category?.options || []).map(x => x.value).filter(Boolean);
    const expectedCategories = booksySummary.categories || [];

    crmLiteAddV81(report,
        String(window.crmAppointmentPriceSourceV3021 || "") === "BOOKSY" &&
        booksyCategoryValues.length > 0 &&
        expectedCategories.every(value => booksyCategoryValues.includes(value)),
        "BOOKSY: po odblokowaniu edytor korzysta z pełnego Cennika Booksy",
        {
            priceSource:String(window.crmAppointmentPriceSourceV3021 || ""),
            category,
            service,
            expectedCategories
        }
    );

    crmLiteAddV81(report,
        category?.value === String(chosen.category || "") && service?.value === String(chosen.name || ""),
        "BOOKSY: zwykła edycja zachowuje bieżącą kategorię i usługę Booksy",
        {category,service,chosen}
    );

    const meta = typeof crmBooksyEditSourceMetadataV3021 === "function"
        ? crmBooksyEditSourceMetadataV3021(app)
        : null;
    crmLiteAddV81(report,
        meta?.preserveBookingSource === "BOOKSY_GMAIL" && meta?.sourceRequestId === "CRM_LITE_BOOKSY_SOURCE_ID",
        "BOOKSY: frontend zachowuje źródło Gmail i ID źródłowe przy zapisie CRM",
        meta || "Brak metadanych"
    );

    /* Backend probe — wyłącznie GET, zero zapisu. */
    try {
        const separator = String(APPS_SCRIPT_URL || "").includes("?") ? "&" : "?";
        const url = `${APPS_SCRIPT_URL}${separator}booksyEditPolicyV4719=true&_lite=${Date.now()}`;
        let data = null;
        if (typeof crmFetchJsonV12 === "function") {
            data = await crmFetchJsonV12(url, {timeoutMs:12000});
        } else {
            const response = await fetch(url, {method:"GET",cache:"no-store"});
            data = await response.json();
        }
        crmLiteAddV81(report,
            data?.success === true && data?.version === "4.7.19" && data?.preservesBooksySource === true && data?.servicePriceSource === "BOOKSY",
            "BOOKSY: backend V4.7.19 potwierdza bezpieczną politykę edycji CRM",
            data
        );
    } catch (error) {
        crmTestAdd(report, "BLAD", "BOOKSY: backend V4.7.19 nie jest jeszcze aktywny / probe nie odpowiada", error?.message || String(error));
    }
}

async function runCRMTestLight() {
    if (crmTestIsRunning) {
        if (typeof crmToast === "function") crmToast("Inny test jest już uruchomiony.", "error");
        return;
    }

    window.crmCurrentTestKind = "CRM_TEST_LIGHT_CATEGORY_BOOKSY";
    crmResetTestPanelForRun("CRM Lite 8.4 — Kategorie + Booksy");
    crmTestSetRunning(true);

    const report = crmTestCreateReport("CRM_TEST_LIGHT_CATEGORY_BOOKSY", CRM_TEST_LIGHT_VERSION);
    report.scope = CRM_TEST_LIGHT_SCOPE;
    crmLastTestReport = report;
    const startedAt = Date.now();

    const savedDom = crmLiteSaveDomV81();
    let savedEditing = null;
    try { savedEditing = currentEditingAppointment; } catch (ignore) {}

    try {
        crmTestSetProgress(10, "Lite: zapisuję stan PRZED testem…");

        const visitsScript = Array.from(document.scripts || [])
            .map(script => String(script.src || ""))
            .find(src => /\/JS\/visits\.js/i.test(src)) || "";

        crmTestAdd(report, "OK", "Wersje diagnostyczne", {
            lite:"8.4.0",
            visitsScript,
            fullTest: typeof CRM_TEST_FULL_VERSION !== "undefined" ? CRM_TEST_FULL_VERSION : ""
        });

        /* DOM część testu zawsze startuje ze źródłem DOM — niezależnie od tego,
           jaką wizytę użytkownik oglądał przed wejściem do Ustawień. */
        if (typeof crmSetAppointmentPriceSourceV3021 === "function") crmSetAppointmentPriceSourceV3021("DOM");

        const cachesBefore = crmLiteCacheSnapshotsV81();
        const baseline = crmLiteEditorSnapshotV81("BASELINE_BEFORE_ANY_ACTION");
        crmTestAdd(report, "OK", "SNAPSHOT 0 — currentServices i cache PRZED akcją", {
            baseline,
            caches:cachesBefore,
            freshBootstrapPending:Boolean(window.crmPerfFreshBootstrapPromiseV191 && typeof window.crmPerfFreshBootstrapPromiseV191.then === "function")
        });

        crmLiteAddV81(
            report,
            baseline.currentServices.categoryCount > 1,
            "Pełny Cennik w currentServices ma więcej niż 1 kategorię",
            baseline.currentServices
        );

        const manicure = crmLiteFindServiceV81(/manicure/i);
        const pedicure = crmLiteFindServiceV81(/pedicure/i);
        crmLiteAddV81(report, Boolean(manicure), "Próbka Manicure do testu", manicure || "Brak");
        crmLiteAddV81(report, Boolean(pedicure), "Próbka Pedicure do testu", pedicure || "Brak");

        const sequences = {};

        crmTestSetProgress(30, "Lite: sekwencja Manicure → Dodaj wizytę…");
        if (manicure) {
            if (typeof crmSetAppointmentPriceSourceV3021 === "function") crmSetAppointmentPriceSourceV3021("DOM");
            const appointment = crmLiteSyntheticAppointmentV81(manicure);
            const path1 = crmLiteRunPath1V81(appointment);
            const addAfterPath1 = crmLiteRunAddVisitV81();
            const path2 = crmLiteRunPath2V81(appointment);
            sequences.manicure = {appointment,path1,addAfterPath1,path2};
            crmTestAdd(report, "OK", "SEKWENCJA MANICURE — pełny stan", sequences.manicure);
            crmLiteAddV81(report, crmLiteCategoryOptionValuesV81(path1.afterPrime).length > 1,
                "MANICURE → zwykła edycja ma pełną listę kategorii", path1.afterPrime?.category);
            crmLiteAddV81(report, crmLiteCategoryOptionValuesV81(path2).length > 1 && !path2?.category?.value,
                "MANICURE → zmiana usługi czyści wybór, ale zachowuje pełną listę kategorii", path2?.category);
            crmLiteAddV81(
                report,
                crmLiteCategoryOptionValuesV81(addAfterPath1).length > 1,
                "MANICURE → Dodaj wizytę: pełna lista kategorii odbudowana",
                addAfterPath1?.category
            );
        }

        crmTestSetProgress(55, "Lite: sekwencja Pedicure → Dodaj wizytę…");
        if (pedicure) {
            if (typeof crmSetAppointmentPriceSourceV3021 === "function") crmSetAppointmentPriceSourceV3021("DOM");
            const appointment = crmLiteSyntheticAppointmentV81(pedicure);
            const path1 = crmLiteRunPath1V81(appointment);
            const addAfterPath1 = crmLiteRunAddVisitV81();
            const path2 = crmLiteRunPath2V81(appointment);
            sequences.pedicure = {appointment,path1,addAfterPath1,path2};
            crmTestAdd(report, "OK", "SEKWENCJA PEDICURE — pełny stan", sequences.pedicure);
            crmLiteAddV81(report, crmLiteCategoryOptionValuesV81(path1.afterPrime).length > 1,
                "PEDICURE → zwykła edycja ma pełną listę kategorii", path1.afterPrime?.category);
            crmLiteAddV81(report, crmLiteCategoryOptionValuesV81(path2).length > 1 && !path2?.category?.value,
                "PEDICURE → zmiana usługi czyści wybór, ale zachowuje pełną listę kategorii", path2?.category);
            crmLiteAddV81(
                report,
                crmLiteCategoryOptionValuesV81(addAfterPath1).length > 1,
                "PEDICURE → Dodaj wizytę: pełna lista kategorii odbudowana",
                addAfterPath1?.category
            );
        }

        crmTestSetProgress(75, "Lite: porównuję ścieżkę 1 i 2…");
        ["manicure","pedicure"].forEach(key => {
            const seq = sequences[key];
            if (!seq) return;
            crmTestAdd(report, "OK", `${key.toUpperCase()} — różnica ścieżka 1 vs 2`, {
                path1Prime:seq.path1?.afterPrime?.category,
                path1AfterPopulate:seq.path1?.afterPopulate?.category,
                path2:seq.path2?.category,
                addAfterPath1:seq.addAfterPath1?.category,
                currentServicesAfter:seq.path2?.currentServices
            });
        });

        const cachesAfter = crmLiteCacheSnapshotsV81();
        crmTestSetProgress(76, "Lite: sprawdzam regresję kategorii…");
        crmLiteDiagnoseV81(report, baseline, sequences, cachesBefore, cachesAfter);

        await crmLiteRunBooksyV83(report);

    } catch (error) {
        crmTestAdd(report, "BLAD", "CRM Lite 8.4 — wyjątek regresji", error?.stack || error?.message || String(error));
    } finally {
        try {
            if (typeof crmSetAppointmentPriceSourceV3021 === "function") crmSetAppointmentPriceSourceV3021("DOM");
            const details = document.getElementById("appointmentDetailsModal");
            if (details) {
                delete details.dataset.crmBooksyEditUnlockedV3021;
                delete details.dataset.crmBooksyPreviewV3021;
            }
            const guard = document.getElementById("crmBooksyVisitEditGuardV3021");
            if (guard) guard.hidden = true;
        } catch (ignore) {}
        crmLiteRestoreDomV81(savedDom);
        try { currentEditingAppointment = savedEditing; } catch (ignore) {}
        crmTestSetProgress(100, "CRM Lite 8.4 — gotowe");
        crmTestFinish(report, startedAt);
        crmTestSetRunning(false);
    }
}

window.runCRMTestLight = runCRMTestLight;


/* ========================================================================== 
   CRM LITE 8.5 — REPARSE REVIEW WIFE — DIAGNOSTYKA READ ONLY
   Nie naprawia kolejki. Nie zapisuje danych. Nie modyfikuje kalendarza żony.
   ========================================================================== */
const CRM_REPARSE_DIAG_VERSION = "8.5.0";

async function crmLitePostV85(payload) {
    if (typeof crmPost === "function") return await crmPost(payload);
    const response = await fetch(APPS_SCRIPT_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify(payload || {}),
        cache:"no-store"
    });
    return await response.json();
}

function crmLiteFirstLineV85(value) {
    return String(value || "").split(/\r?\n/)[0].trim();
}

async function runCRMReviewReparseDiagnostic() {
    if (crmTestIsRunning) {
        if (typeof crmToast === "function") crmToast("Inny test jest już uruchomiony.", "error");
        return;
    }

    window.crmCurrentTestKind = "CRM_TEST_LIGHT_REVIEW_REPARSE";
    crmResetTestPanelForRun("CRM Lite 8.5 — REPARSE review");
    crmTestSetRunning(true);

    const report = crmTestCreateReport("CRM_TEST_LIGHT_REVIEW_REPARSE", CRM_REPARSE_DIAG_VERSION);
    report.scope = "CURRENT_WIFE_REVIEW_QUEUE_REPARSE_READ_ONLY";
    crmLastTestReport = report;
    const startedAt = Date.now();

    try {
        crmTestSetProgress(15, "REPARSE: pobieram bieżącą kolejkę bez zapisu…");
        const data = await crmLitePostV85({action:"crmReviewReparseDiagnosticV4720",max:30});

        crmLiteAddV81(
            report,
            data?.success === true && data?.version === "4.7.20",
            "REPARSE: backend diagnostyczny V4.7.20 odpowiada",
            {success:data?.success,version:data?.version,diagnostic:data?.diagnostic,error:data?.error || ""}
        );

        crmLiteAddV81(
            report,
            data?.readOnly === true && data?.wifeCalendarReadOnly === true &&
            data?.sourceCalendarTouched === false && data?.crmCalendarTouched === false && data?.databaseTouched === false,
            "REPARSE: test jest w 100% READ ONLY",
            {
                readOnly:data?.readOnly,wifeCalendarReadOnly:data?.wifeCalendarReadOnly,
                sourceCalendarTouched:data?.sourceCalendarTouched,crmCalendarTouched:data?.crmCalendarTouched,
                databaseTouched:data?.databaseTouched
            }
        );

        const items = Array.isArray(data?.items) ? data.items : [];
        crmLiteAddV81(
            report,
            Number(data?.queueCount || 0) === items.length,
            `REPARSE: przeanalizowano całą bieżącą kolejkę (${items.length})`,
            {queueCount:data?.queueCount,diagnosed:data?.diagnosed,counts:data?.counts || {}}
        );

        crmTestSetProgress(45, `REPARSE: analizuję ${items.length} realnych wpisów…`);
        items.forEach((item,index) => {
            const raw = crmLiteFirstLineV85(item?.old?.raw || item?.current?.title || item?.sourceId);
            crmTestAdd(report, "OK", `REPARSE ${index+1}/${items.length} — ${item?.classification || "BRAK_KLASYFIKACJI"} — ${raw}`, {
                sourceId:item?.sourceId || "",
                parserInputSource:item?.parserInputSource || "",
                sourceEventFound:Boolean(item?.sourceEventFound),
                old:item?.old || {},
                current:item?.current || {},
                clientEvidence:item?.clientEvidence || {},
                allServicesExact:Boolean(item?.allServicesExact),
                classification:item?.classification || ""
            });
        });

        crmTestSetProgress(85, "REPARSE: podsumowanie klasyfikacji…");
        crmTestAdd(report, "OK", "REPARSE — PODSUMOWANIE", {
            queueCount:Number(data?.queueCount || 0),
            diagnosed:Number(data?.diagnosed || 0),
            counts:data?.counts || {},
            interpretation:{
                AUTO_OK_NOW:"obecny parser potrafi już bezpiecznie rozpoznać wpis",
                DO_UZUPELNIENIA_USLUGI:"klient rozpoznany, ale procedura nadal wymaga uzupełnienia",
                DO_ZIDENTYFIKOWANIA_KLIENTA:"obecny parser nadal nie rozpoznaje klienta",
                REVIEW_PO_AKTUALNYM_PARSERZE:"klient/usługa są rozpoznane, ale pozostaje inny powód review",
                DO_ZIDENTYFIKOWANIA:"parser nadal blokuje automatyczny import"
            }
        });

    } catch (error) {
        crmTestAdd(report, "BLAD", "CRM Lite 8.5 — wyjątek diagnostyki REPARSE", error?.stack || error?.message || String(error));
    } finally {
        crmTestSetProgress(100, "CRM Lite 8.5 — REPARSE gotowe");
        crmTestFinish(report, startedAt);
        crmTestSetRunning(false);
    }
}

window.runCRMReviewReparseDiagnostic = runCRMReviewReparseDiagnostic;


/* ========================================================================== 
   CRM LITE 8.6 — REVIEW FIX: parser + klasyfikacja + żółty kafelek
   READ ONLY: nie zapisuje bazy i nie modyfikuje żadnego kalendarza.
   ========================================================================== */
const CRM_REVIEW_FIX_VERSION_V86 = "8.6.0";

function crmLiteFindReviewCaseV86(items, pattern){
    const re=pattern instanceof RegExp?pattern:new RegExp(String(pattern||""),"i");
    return (Array.isArray(items)?items:[]).find(item=>re.test(String(item?.old?.raw||item?.current?.title||"")))||null;
}

function crmLiteServiceNamesV86(item){
    return (item?.current?.services||[]).map(s=>String(s?.name||""));
}
function crmLiteServiceCategoriesV86(item){
    return (item?.current?.services||[]).map(s=>String(s?.category||""));
}

async function runCRMReviewParserFixV86(){
    if(crmTestIsRunning){ if(typeof crmToast==="function")crmToast("Inny test jest już uruchomiony.","error"); return; }
    window.crmCurrentTestKind="CRM_TEST_LIGHT_REVIEW_FIX";
    crmResetTestPanelForRun("CRM Lite 8.6 — Review fix");
    crmTestSetRunning(true);
    const report=crmTestCreateReport("CRM_TEST_LIGHT_REVIEW_FIX",CRM_REVIEW_FIX_VERSION_V86);
    report.scope="WIFE_REVIEW_PARSER_CLASSIFICATION_COLOR_READ_ONLY";
    crmLastTestReport=report;
    const startedAt=Date.now();
    try{
        crmTestSetProgress(12,"8.6: pobieram realne 12 wpisów READ ONLY…");
        const data=await crmLitePostV85({action:"crmReviewParserFixDiagnosticV4721",max:30});
        crmLiteAddV81(report,data?.success===true&&data?.version==="4.7.21","8.6: backend V4.7.21 odpowiada",{success:data?.success,version:data?.version,error:data?.error||""});
        crmLiteAddV81(report,data?.readOnly===true&&data?.wifeCalendarReadOnly===true&&data?.sourceCalendarTouched===false&&data?.crmCalendarTouched===false&&data?.databaseTouched===false,"8.6: diagnostyka jest w 100% READ ONLY",{readOnly:data?.readOnly,wifeCalendarReadOnly:data?.wifeCalendarReadOnly,sourceCalendarTouched:data?.sourceCalendarTouched,crmCalendarTouched:data?.crmCalendarTouched,databaseTouched:data?.databaseTouched});
        const items=Array.isArray(data?.items)?data.items:[];
        crmLiteAddV81(report,Number(data?.queueCount||0)===items.length,"8.6: przeanalizowano całą bieżącą kolejkę",{queueCount:data?.queueCount,diagnosed:data?.diagnosed,counts:data?.counts||{}});

        crmTestSetProgress(32,"8.6: sprawdzam naprawa + klient…");
        const repairA=crmLiteFindReviewCaseV86(items,/naprawa Aleksandra Więdłocha/i);
        const repairB=crmLiteFindReviewCaseV86(items,/naprawa Alicja Płoch/i);
        [repairA,repairB].forEach((item,index)=>{
            crmLiteAddV81(report,Boolean(item)&&/Aleksandra Więdłocha|Alicja Płoch/i.test(String(item?.current?.name||""))&&crmLiteServiceNamesV86(item).includes("Naprawa złamanego paznokcia"),`8.6: naprawa + klient ${index+1} rozpoznane bezpiecznie`,item||"Brak przypadku");
        });

        crmTestSetProgress(48,"8.6: sprawdzam pedicure z opracowaniem stóp…");
        const danuta=crmLiteFindReviewCaseV86(items,/Danuta Szwajkiewicz.*hybryda z opracowaniem stóp/i);
        crmLiteAddV81(report,Boolean(danuta)&&crmLiteServiceNamesV86(danuta).includes("Pedicure - pielęgnacja stóp + hybryda")&&danuta?.allServicesExact===true,"8.6: „hybryda z opracowaniem stóp” = dokładny Pedicure DOM",danuta||"Brak przypadku");

        crmTestSetProgress(62,"8.6: sprawdzam cyrylicę…");
        const cyr=items.filter(item=>/Кристина|манікюр|педикюр/i.test(String(item?.old?.raw||"")));
        crmLiteAddV81(report,cyr.length>=2&&cyr.every(item=>String(item?.current?.name||"").includes("Кристина")&&crmLiteServiceCategoriesV86(item).includes("Manicure")&&crmLiteServiceCategoriesV86(item).includes("Pedicure")&&item?.current?.forceReviewOnly===true),"8.6: cyrylica rozpoznaje Кристина + Manicure/Pedicure bez auto-łączenia",cyr);

        crmTestSetProgress(72,"8.6: sprawdzam polecenie od Ewy…");
        const referral=crmLiteFindReviewCaseV86(items,/hybryda od Ewy Budzowska/i);
        crmLiteAddV81(report,Boolean(referral)&&!String(referral?.current?.name||"").trim()&&String(referral?.current?.sourceNote||"").toLowerCase().includes("od ewy budzowska")&&crmLiteServiceNamesV86(referral).includes("Manicure hybrydowy - kolor")&&referral?.classification==="DO_ZIDENTYFIKOWANIA_KLIENTA","8.6: „hybryda od Ewy Budzowska” = usługa + polecenie, klient nadal nieznany",referral||"Brak przypadku");

        crmTestSetProgress(80,"8.6: sprawdzam niepewny termin…");
        const renata=crmLiteFindReviewCaseV86(items,/może być na rano Renata Mazur żel/i);
        crmLiteAddV81(report,Boolean(renata)&&renata?.classification==="DO_UZUPELNIENIA_TERMINU"&&String(renata?.current?.name||"")==="Renata Mazur","8.6: Renata z „może być na rano” trafia do sprawdzenia terminu, nie identyfikacji",renata||"Brak przypadku");

        crmTestSetProgress(88,"8.6: sprawdzam klasyfikację kolejki…");
        const queue=await crmLitePostV85({action:"getExternalReviewQueueStatusV4715"});
        crmLiteAddV81(report,queue?.success===true&&queue?.version==="4.7.21"&&Number(queue?.pendingTotal||0)===Number(data?.queueCount||0)&&Array.isArray(queue?.items)&&queue.items.every(x=>String(x?.queueClass||"").length>0),"8.6: kolejka ma rozdzielone typy Do sprawdzenia / Do uzupełnienia",{version:queue?.version,pendingTotal:queue?.pendingTotal,toIdentify:queue?.toIdentify,toComplete:queue?.toComplete,toCheck:queue?.toCheck,sample:(queue?.items||[]).slice(0,5)});

        crmTestSetProgress(94,"8.6: sprawdzam kolor kafelka review…");
        let reviewPalette=null,plainPalette=null;
        try{ if(typeof crmCategoryPalette==="function"){ reviewPalette=crmCategoryPalette({eventType:"external",reviewRequired:true,category:"DO_WERYFIKACJI"}); plainPalette=crmCategoryPalette({eventType:"external",reviewRequired:false}); } }catch(ignore){}
        crmLiteAddV81(report,Boolean(reviewPalette&&plainPalette&&String(reviewPalette.stripe||"").toLowerCase()==="#d79a16"&&String(reviewPalette.stripe||"").toLowerCase()!==String(plainPalette.stripe||"").toLowerCase()),"8.6: kafelek „Do sprawdzenia” jest żółto-bursztynowy, zwykła blokada pozostaje szara",{reviewPalette,plainPalette});

        crmTestAdd(report,"OK","8.6 — PODSUMOWANIE",{queueCount:data?.queueCount,counts:data?.counts||{},wifeCalendarTouched:false,databaseTouched:false});
    }catch(error){
        crmTestAdd(report,"BLAD","CRM Lite 8.6 — wyjątek",error?.stack||error?.message||String(error));
    }finally{
        crmTestSetProgress(100,"CRM Lite 8.6 — gotowe");
        crmTestFinish(report,startedAt);
        crmTestSetRunning(false);
    }
}
window.runCRMReviewParserFixV86=runCRMReviewParserFixV86;


/* ========================================================================== 
   CRM LITE 8.7 — SAFE REVIEW RECONCILE PREVIEW + EXPLICIT APPLY
   Preview jest READ ONLY. Apply wymaga uprzedniego preview i osobnego confirm().
   ========================================================================== */
const CRM_REVIEW_RECONCILE_VERSION_V87 = "8.7.1";
let crmReviewReconcilePreviewStateV87 = null;

function crmReviewReconcileSetApplyEnabledV87(enabled){
    const btn=document.getElementById("applyCRMReviewReconcileBtn");
    if(!btn)return;
    btn.disabled=!enabled;
    btn.title=enabled?"Zastosuj dokładnie plan pokazany w preview 8.7":"Najpierw uruchom preview 8.7";
}

function crmReviewReconcileFindV87(items,pattern){
    const re=pattern instanceof RegExp?pattern:new RegExp(String(pattern||""),"i");
    return (Array.isArray(items)?items:[]).find(item=>re.test(String(item?.old?.raw||item?.sourceId||"")))||null;
}

async function runCRMReviewReconcilePreviewV87(){
    if(crmTestIsRunning){ if(typeof crmToast==="function")crmToast("Inny test jest już uruchomiony.","error"); return; }
    crmReviewReconcilePreviewStateV87=null;
    crmReviewReconcileSetApplyEnabledV87(false);
    window.crmCurrentTestKind="CRM_TEST_LIGHT_REVIEW_RECONCILE_PREVIEW";
    crmResetTestPanelForRun("CRM Lite 8.7 — Reconcile preview");
    crmTestSetRunning(true);
    const report=crmTestCreateReport("CRM_TEST_LIGHT_REVIEW_RECONCILE_PREVIEW",CRM_REVIEW_RECONCILE_VERSION_V87);
    report.scope="WIFE_REVIEW_RECONCILE_PREVIEW_READ_ONLY";
    crmLastTestReport=report;
    const startedAt=Date.now();
    try{
        crmTestSetProgress(12,"8.7: buduję plan rekonsyliacji READ ONLY…");
        const data=await crmLitePostV85({action:"previewExternalReviewReconcileV4722",max:100});
        crmLiteAddV81(report,data?.success===true&&data?.version==="4.7.22","8.7: backend V4.7.22 odpowiada",{success:data?.success,version:data?.version,error:data?.error||""});
        crmLiteAddV81(report,data?.readOnly===true&&data?.wifeCalendarReadOnly===true&&data?.sourceCalendarTouched===false&&data?.crmCalendarTouched===false&&data?.databaseTouched===false,"8.7: PREVIEW jest w 100% READ ONLY",{readOnly:data?.readOnly,wifeCalendarReadOnly:data?.wifeCalendarReadOnly,sourceCalendarTouched:data?.sourceCalendarTouched,crmCalendarTouched:data?.crmCalendarTouched,databaseTouched:data?.databaseTouched});
        const items=Array.isArray(data?.items)?data.items:[];
        crmLiteAddV81(report,Number(data?.queueCount||0)===items.length,"8.7: plan obejmuje całą bieżącą kolejkę",{queueCount:data?.queueCount,diagnosed:data?.diagnosed,counts:data?.counts||{}});

        crmTestSetProgress(35,"8.7: sprawdzam co może zniknąć z historycznego review…");
        const auto=items.filter(x=>x?.action==="AUTO_CREATE_VISIT");
        const stale=items.filter(x=>x?.action==="REMOVE_STALE_REVIEW");
        const updates=items.filter(x=>x?.action==="UPDATE_REVIEW");
        crmTestAdd(report,"OK","8.7: PLAN RECONCILE — podział operacji",{autoCreateVisits:auto.length,removeStaleReview:stale.length,updateReviewOnly:updates.length,counts:data?.counts||{}});

        const danuta=crmReviewReconcileFindV87(items,/Danuta Szwajkiewicz.*hybryda z opracowaniem stóp/i);
        crmLiteAddV81(report,Boolean(danuta)&&danuta?.action==="AUTO_CREATE_VISIT"&&danuta?.current?.allServicesExact===true&&Number(danuta?.current?.exactClientCount||0)===1,"8.7: Danuta może zostać bezpiecznie zamieniona z historycznego review na normalną wizytę",danuta||"Brak przypadku");

        const repairA=crmReviewReconcileFindV87(items,/naprawa Aleksandra Więdłocha/i);
        const repairB=crmReviewReconcileFindV87(items,/naprawa Alicja Płoch/i);
        const hasRealDurationReviewV871=(item)=>{
            if(!item||item?.action!=="UPDATE_REVIEW")return false;
            const cur=item?.current||{};
            const m=String(cur?.matchReason||item?.reason||"");
            const start=Date.parse(cur?.start||"");
            const end=Date.parse(cur?.end||"");
            const sourceMinutes=Number.isFinite(start)&&Number.isFinite(end)?Math.round((end-start)/60000):0;
            const serviceMinutes=(Array.isArray(cur?.services)?cur.services:[]).reduce((sum,x)=>sum+(Number(x?.duration)||0),0);
            return cur?.matchReview===true&&/Czas wydarzenia/i.test(m)&&sourceMinutes>0&&serviceMinutes>0&&sourceMinutes!==serviceMinutes;
        };
        crmLiteAddV81(report,hasRealDurationReviewV871(repairA),"8.7: Aleksandra zostaje Do sprawdzenia przez REALNY czas wydarzenia",repairA||"Brak przypadku");
        crmLiteAddV81(report,hasRealDurationReviewV871(repairB),"8.7: Alicja zostaje Do sprawdzenia przez REALNY czas wydarzenia",repairB||"Brak przypadku");

        crmTestSetProgress(66,"8.7: sprawdzam, że niebezpieczne wpisy nie są auto-zamieniane…");
        const unsafePatterns=[/hybryda od Ewy Budzowska/i,/10:30 A\./i,/Кристина|манікюр|педикюр/i,/może być na rano Renata Mazur/i,/Paulina Mirosław Jurczyk/i];
        const unsafeAuto=items.filter(item=>item?.action==="AUTO_CREATE_VISIT"&&unsafePatterns.some(re=>re.test(String(item?.old?.raw||""))));
        crmLiteAddV81(report,unsafeAuto.length===0,"8.7: brak niebezpiecznych AUTO_CREATE_VISIT",unsafeAuto);

        crmTestSetProgress(80,"8.7: sprawdzam kolejkę z realnym czasem źródłowym…");
        const queue=await crmLitePostV85({action:"getExternalReviewQueueStatusV4715"});
        const qA=(queue?.items||[]).find(x=>/Aleksandra Więdłocha/i.test(String(x?.rawText||"")));
        crmLiteAddV81(report,queue?.success===true&&queue?.version==="4.7.22"&&Boolean(qA?.sourceEventFound)&&Number(qA?.sourceDurationMinutes||0)>0,"8.7: kolejka używa realnego wydarzenia WIFE, nie sztucznego 60 min",{version:queue?.version,aleksandra:qA||null});

        crmTestSetProgress(90,"8.7: sprawdzam brak poziomego scrolla panelu…");
        let ui={};
        let probe=null;
        try{
            if(typeof window.crmReviewUiV309?.refreshQueueBadgeV3011==="function") await window.crmReviewUiV309.refreshQueueBadgeV3011(true);
            let list=document.querySelector('.crm-review-queue-list-v3012');
            let item=document.querySelector('.crm-review-queue-item-v3012');
            if(!list){
                probe=document.createElement('div');
                probe.style.cssText='position:fixed;left:-9999px;top:-9999px;width:320px;height:100px;';
                list=document.createElement('div');
                list.className='crm-review-queue-list-v3012';
                item=document.createElement('button');
                item.type='button';
                item.className='crm-review-queue-item-v3012';
                item.textContent='TEST bardzo długiej treści wpisu kolejki WIFE bez poziomego przewijania';
                list.appendChild(item);
                probe.appendChild(list);
                document.body.appendChild(probe);
            }
            ui={listOverflowX:list?getComputedStyle(list).overflowX:"",itemBoxSizing:item?getComputedStyle(item).boxSizing:"",itemMaxWidth:item?getComputedStyle(item).maxWidth:"",listScrollWidth:list?.scrollWidth||0,listClientWidth:list?.clientWidth||0,synthetic:Boolean(probe)};
        }catch(ignore){}
        finally{ try{probe?.remove();}catch(ignore){} }
        crmLiteAddV81(report,ui.listOverflowX==="hidden"&&ui.itemBoxSizing==="border-box","8.7: panel kolejki nie ma poziomego przewijania",ui);

        crmReviewReconcilePreviewStateV87=data;
        crmReviewReconcileSetApplyEnabledV87(Boolean(data?.success));
        crmTestAdd(report,"OK","8.7 — PREVIEW GOTOWY DO ŚWIADOMEGO APPLY",{queueCount:data?.queueCount,counts:data?.counts||{},applyButtonEnabled:Boolean(data?.success)});
    }catch(error){
        crmTestAdd(report,"BLAD","CRM Lite 8.7 — wyjątek preview",error?.stack||error?.message||String(error));
        crmReviewReconcilePreviewStateV87=null;
        crmReviewReconcileSetApplyEnabledV87(false);
    }finally{
        crmTestSetProgress(100,"CRM Lite 8.7 — preview gotowy");
        crmTestFinish(report,startedAt);
        crmTestSetRunning(false);
    }
}
window.runCRMReviewReconcilePreviewV87=runCRMReviewReconcilePreviewV87;

async function applyCRMReviewReconcileV87(){
    const preview=crmReviewReconcilePreviewStateV87;
    if(!preview?.success){
        if(typeof crmToast==="function")crmToast("Najpierw uruchom CRM Lite 8.7 — Reconcile preview.","error");
        return;
    }
    const counts=preview?.counts||{};
    const message=[
        "Zastosować bezpieczną rekonsyliację kolejki WIFE?",
        "",
        `AUTO_CREATE_VISIT: ${Number(counts.AUTO_CREATE_VISIT||0)}`,
        `UPDATE_REVIEW: ${Number(counts.UPDATE_REVIEW||0)}`,
        `REMOVE_STALE_REVIEW: ${Number(counts.REMOVE_STALE_REVIEW||0)}`,
        "",
        "Kalendarz żony pozostanie READ ONLY. Zmiany dotyczą tylko TEST DB / CRM TEST."
    ].join("\n");
    if(!window.confirm(message))return;
    const btn=document.getElementById("applyCRMReviewReconcileBtn");
    if(btn){btn.disabled=true;btn.textContent="Rekonsyliacja…";}
    try{
        const data=await crmLitePostV85({action:"applyExternalReviewReconcileV4722",confirm:"RECONCILE_WIFE_REVIEW_V4722",max:100});
        if(!data?.success)throw new Error(data?.error||"RECONCILE nie powiódł się");
        const report=crmTestCreateReport("CRM_REVIEW_RECONCILE_APPLY",CRM_REVIEW_RECONCILE_VERSION_V87);
        report.scope="WIFE_REVIEW_RECONCILE_APPLY_TEST_ONLY";
        crmLastTestReport=report;
        const start=Date.now();
        crmTestAdd(report,"OK","RECONCILE APPLY wykonany",data);
        crmLiteAddV81(report,data?.wifeCalendarTouched===false&&data?.sourceCalendarTouched===false,"RECONCILE: kalendarz żony pozostał nietknięty",{wifeCalendarTouched:data?.wifeCalendarTouched,sourceCalendarTouched:data?.sourceCalendarTouched});
        crmTestFinish(report,start);
        if(typeof window.crmRefreshReviewQueueBadgeV3011==="function")await window.crmRefreshReviewQueueBadgeV3011();
        if(typeof window.crmLightSyncCalendarData==="function")await window.crmLightSyncCalendarData("review-reconcile-v4722");
        if(typeof crmToast==="function")crmToast(`RECONCILE zakończony. Kolejka: ${data.beforePending} → ${data.afterPending}. Utworzone wizyty: ${data.createdVisits}.`);
        crmReviewReconcilePreviewStateV87=null;
        crmReviewReconcileSetApplyEnabledV87(false);
    }catch(error){
        if(typeof crmToast==="function")crmToast("Błąd RECONCILE: "+(error?.message||error),"error"); else alert(error?.message||error);
    }finally{
        if(btn){btn.textContent="🧹 Zastosuj bezpieczny RECONCILE";btn.disabled=true;}
    }
}
window.applyCRMReviewReconcileV87=applyCRMReviewReconcileV87;
