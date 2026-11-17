/* ==========================================================================
   CEN. CENNIK I KATEGORIE
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CEN.1. currentServices (oryginalna linia 23) ----- */
/* ==========================================================
   GLOBAL STATE
   ========================================================== */

let currentServices = [];

/* ----- CEN.2. loadServices (oryginalna linia 125) ----- */
/* ==========================================================
   SYSTEM LOAD
   ========================================================== */

async function loadServices() {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getPrices=true"
            );

        currentServices =
            await response.json();

        renderServicesTable();

    }

    catch(err) {

        console.error(err);

    }

}

/* ----- CEN.3. renderServicesTable (oryginalna linia 149) ----- */
function renderServicesTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;

    crmPreparePriceStructure();

    const table = tbody.closest("table");
    if (table) {
        const head = table.querySelector("thead tr");
        if (head) head.innerHTML = "<th>Kategoria i usługi</th>";
    }

    tbody.innerHTML = "";
    const categories = crmCategoriesFromPrices();

    if (!categories.length) {
        tbody.innerHTML = '<tr><td style="text-align:center">Brak kategorii i usług</td></tr>';
        return;
    }

    categories.forEach((category, categoryIndex) => {
        const categoryRow = document.createElement("tr");
        categoryRow.className = "crm-price-category-row";
        categoryRow.innerHTML = `<td>
          <details class="crm-price-category" data-category-id="${category.id}">
            <summary style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 0">
              <span style="width:16px;height:16px;border-radius:4px;background:${category.color};display:inline-block"></span>
              <strong style="flex:1">${category.name}</strong>
              <span>${category.services.length} usług</span>
              <button type="button" class="btn-secondary" ${categoryIndex === 0 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',-1)">↑</button>
              <button type="button" class="btn-secondary" ${categoryIndex === categories.length - 1 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',1)">↓</button>
              <input type="color" value="${category.color}" title="Kolor kategorii" onclick="event.stopPropagation()" onchange="crmChangeCategoryColor('${category.id}',this.value)">
              <button type="button" class="btn-secondary" onclick="event.preventDefault();crmEditCategory('${category.id}')">Edytuj kategorię</button>
            </summary>

            ${crmFirstVisitCategoryControlHtmlV267(category)}

            <div style="overflow:auto">
              <table style="width:100%">
                <thead><tr><th>Kolejność</th><th>Usługa</th><th>Cena</th><th>Czas</th><th>Status</th><th>Akcje</th></tr></thead>
                <tbody>${category.services.map((item, serviceIndex) => `<tr>
                  <td>
                    <button type="button" class="btn-secondary" ${serviceIndex === 0 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',-1)">↑</button>
                    <button type="button" class="btn-secondary" ${serviceIndex === category.services.length - 1 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',1)">↓</button>
                  </td>
                  <td>${item.service.name || ""}</td>
                  <td>${Number(item.service.price || 0)} zł</td>
                  <td>${Number(item.service.duration || 0)} min</td>
                  <td>${item.service.status || ""}</td>
                  <td>
                    <button class="btn-secondary" onclick="editService(${item.serviceIndex})">Edytuj</button>
                    <button class="btn-danger" onclick="deleteService(${item.serviceIndex})">Usuń</button>
                  </td>
                </tr>`).join("")}</tbody>
              </table>
            </div>
          </details>
        </td>`;
        tbody.appendChild(categoryRow);
    });
}

/* ----- CEN.4. populateServiceNameDatalist (oryginalna linia 1192) ----- */
function populateServiceNameDatalist() {

    const list =
        document.getElementById(
            "appointmentServiceNameList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !currentServices ||
        currentServices.length === 0
    ) {
        return;
    }

    currentServices.forEach(service => {

        if (!service.name) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            service.name || "";

        option.label =
            (
                service.category || "Inne"
            ) +
            " / " +
            (
                service.duration || 45
            ) +
            " min / " +
            (
                service.price || 0
            ) +
            " zł";

        list.appendChild(
            option
        );

    });

}

/* ----- CEN.5. openAddServiceModal (oryginalna linia 3235) ----- */
/* ==========================================================
   CENNIK - ADD / EDIT SERVICE
   ========================================================== */

function openAddServiceModal() {
    document.getElementById("editServiceIndex").value = "-1";
    document.getElementById("serviceModalTitle").innerText = "Dodaj usługę";

    document.getElementById("serviceCategory").value = "";
    document.getElementById("serviceName").value = "";
    document.getElementById("servicePrice").value = "";
    document.getElementById("serviceDuration").value = "60";
    document.getElementById("serviceStatus").value = "Szkic";

    document.getElementById("serviceModal").style.display = "flex";
}

/* ----- CEN.6. closeServiceModal (oryginalna linia 3248) ----- */
function closeServiceModal() {
    document.getElementById("serviceModal").style.display = "none";
}

/* ----- CEN.7. editService (oryginalna linia 3252) ----- */
function editService(index) {
    const service = currentServices[index];

    if (!service) {
        alert("Nie znaleziono usługi do edycji.");
        return;
    }

    document.getElementById("editServiceIndex").value = index;
    document.getElementById("serviceModalTitle").innerText = "Edytuj usługę";

    document.getElementById("serviceCategory").value = service.category || "";
    document.getElementById("serviceName").value = service.name || "";
    document.getElementById("servicePrice").value = service.price || "";
    document.getElementById("serviceDuration").value = service.duration || 60;
    document.getElementById("serviceStatus").value = service.status || "Szkic";

    document.getElementById("serviceModal").style.display = "flex";
}

/* ----- CEN.8. saveServiceModalData (oryginalna linia 3272) ----- */
function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value, 10);
    const previous = index >= 0 ? currentServices[index] : null;
    const categoryName = document.getElementById("serviceCategory").value.trim();
    const category = crmCategoriesFromPrices().find(item => item.name === categoryName);

    const serviceData = {
        ...(previous || {}),
        serviceId: previous?.serviceId || crmPriceId("srv"),
        category: categoryName,
        categoryId: category?.id || previous?.categoryId || crmPriceId("cat"),
        categoryOrder: category?.order || previous?.categoryOrder || crmCategoriesFromPrices().length + 1,
        categoryColor: category?.color || previous?.categoryColor || "#b05c75",
        serviceOrder:
            previous?.categoryId === category?.id
                ? previous.serviceOrder
                : ((category?.services.length || 0) + 1),

        firstVisitMode:
            category
                ? crmNormalizeFirstVisitModeV267(category.firstVisitMode)
                : (
                    previous?.category === categoryName
                        ? crmNormalizeFirstVisitModeV267(previous?.firstVisitMode)
                        : "AUTO"
                ),

        firstVisitManualMinutes:
            category
                ? Math.max(0, Number(category.firstVisitManualMinutes) || 0)
                : (
                    previous?.category === categoryName
                        ? Math.max(0, Number(previous?.firstVisitManualMinutes) || 0)
                        : 0
                ),

        name: document.getElementById("serviceName").value.trim(),
        price: Number(document.getElementById("servicePrice").value) || 0,
        duration: Number(document.getElementById("serviceDuration").value) || 60,
        showPrice: "Tak",
        showDuration: "Tak",
        status: document.getElementById("serviceStatus").value || "Szkic"
    };

    if (!serviceData.category || !serviceData.name) {
        return alert("Wpisz kategorię i nazwę usługi.");
    }

    if (index >= 0) currentServices[index] = serviceData;
    else currentServices.push(serviceData);

    crmNormalizePriceOrder();
    crmSyncFirstVisitMetaV267();
    renderServicesTable();
    closeServiceModal();

    alert("Usługa zapisana lokalnie. Zapisz szkic, a następnie opublikuj cennik.");
}

/* ----- CEN.9. getUniqueServiceCategories (oryginalna linia 3311) ----- */
/* ==========================================================
   CENNIK - CATEGORY MANAGEMENT
   ========================================================== */

function getUniqueServiceCategories() {
    const categories = [];

    currentServices.forEach(service => {
        const category =
            service.category
                ? service.category.trim()
                : "";

        if (
            category &&
            !categories.includes(category)
        ) {
            categories.push(category);
        }
    });

    return categories.sort();
}

/* ----- CEN.10. openCategoryModal (oryginalna linia 3331) ----- */
function openCategoryModal() {
    renderCategoryModalList();
    document.getElementById("categoryModal").style.display = "flex";
}

/* ----- CEN.11. closeCategoryModal (oryginalna linia 3336) ----- */
function closeCategoryModal() {
    document.getElementById("categoryModal").style.display = "none";
}

/* ----- CEN.12. renderCategoryModalList (oryginalna linia 3340) ----- */
function renderCategoryModalList() {
    const select =
        document.getElementById("categorySelectForEdit");

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const categories =
        getUniqueServiceCategories();

    if (categories.length === 0) {
        const option =
            document.createElement("option");

        option.value = "";
        option.textContent = "Brak kategorii";

        select.appendChild(option);
        return;
    }

    categories.forEach(category => {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        select.appendChild(option);
    });
}

/* ----- CEN.13. addNewCategoryFromModal (oryginalna linia 3375) ----- */
function addNewCategoryFromModal() {
    const input =
        document.getElementById("categoryCreateName");

    const newCategory =
        input.value.trim();

    if (!newCategory) {
        alert("Wpisz nazwę nowej kategorii.");
        return;
    }

    const categories =
        getUniqueServiceCategories();

    if (categories.includes(newCategory)) {
        alert("Taka kategoria już istnieje.");
        return;
    }

    currentServices.push({
        category: newCategory,
        name: "Nowa usługa",
        price: 0,
        duration: 60,
        showPrice: "Tak",
        showDuration: "Tak",
        status: "Szkic"
    });

    input.value = "";

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Kategoria została dodana lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}

/* ----- CEN.14. renameCategoryFromModal (oryginalna linia 3417) ----- */
function renameCategoryFromModal() {
    const select =
        document.getElementById("categorySelectForEdit");

    const input =
        document.getElementById("categoryNewName");

    const oldCategory =
        select.value;

    const newCategory =
        input.value.trim();

    if (!oldCategory) {
        alert("Wybierz kategorię.");
        return;
    }

    if (!newCategory) {
        alert("Wpisz nową nazwę kategorii.");
        return;
    }

    currentServices.forEach(service => {
        if (service.category === oldCategory) {
            service.category = newCategory;
        }
    });

    input.value = "";

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Nazwa kategorii została zmieniona lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}

/* ----- CEN.15. deleteCategoryFromModal (oryginalna linia 3458) ----- */
function deleteCategoryFromModal() {
    const select =
        document.getElementById("categorySelectForEdit");

    const category =
        select.value;

    if (!category) {
        alert("Wybierz kategorię.");
        return;
    }

    const servicesInCategory =
        currentServices.filter(service => {
            return service.category === category;
        });

    if (servicesInCategory.length > 0) {
        const confirmDelete =
            confirm(
                "Ta kategoria zawiera " +
                servicesInCategory.length +
                " usług.\n\n" +
                "Usunięcie kategorii usunie też wszystkie usługi w tej kategorii.\n\n" +
                "Kontynuować?"
            );

        if (!confirmDelete) {
            return;
        }
    }

    currentServices =
        currentServices.filter(service => {
            return service.category !== category;
        });

    renderServicesTable();
    renderCategoryModalList();
    buildColorsEditor();

    alert(
        "Kategoria została usunięta lokalnie.\n\n" +
        "Kliknij „Zapisz szkic”, a potem „Publikuj”, żeby zapisać zmiany."
    );
}


function crmPriceListTouchCacheV25() {
    try {
        if (typeof crmPerfMarkFreshV18 === "function") crmPerfMarkFreshV18(["services"]);
    } catch (ignore) {}
    try {
        if (typeof crmPerfWriteCacheV18 === "function") crmPerfWriteCacheV18({});
    } catch (ignore) {}
    try {
        if (typeof crmPerfWritePersistentCacheV19 === "function") crmPerfWritePersistentCacheV19({});
    } catch (ignore) {}
}

/* ----- CEN.16. saveDraftsToCloud (oryginalna linia 3508) ----- */
/* ==========================================================
   CENNIK - SAVE DRAFT / PUBLISH
   ========================================================== */

async function saveDraftsToCloud() {
    try {
        if (!currentServices || currentServices.length === 0) {
            alert("Brak usług do zapisania.");
            return;
        }

        crmSyncFirstVisitMetaV267();

        const payload = {
            action: "saveDraftPrices",
            prices: currentServices
        };

        const data = typeof crmPost === "function"
            ? await crmPost(payload)
            : await (async () => {
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify(payload)
                });
                return response.json();
            })();

        if (data && data.success) {
            /* currentServices jest dokładnie tym szkicem, który przed chwilą
               zapisaliśmy. Nie pobieramy więc ponownie całego Cennika z Google. */
            crmPriceListTouchCacheV25();
            if (typeof renderServicesTable === "function") renderServicesTable();
            alert("Szkic cennika zapisany.");
        } else {
            alert(
                "Błąd zapisu szkicu: " +
                (data?.error || "Nieznany błąd")
            );
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia podczas zapisu szkicu.");
    }
}

/* ----- CEN.17. publishDrafts (oryginalna linia 3546) ----- */
async function publishDrafts() {
    if (!confirm("Opublikować aktualny szkic cennika na stronie klienta?")) {
        return;
    }

    try {
        const payload = { action: "publishDraftToPublic" };
        const data = typeof crmPost === "function"
            ? await crmPost(payload)
            : await (async () => {
                const response = await fetch(APPS_SCRIPT_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain" },
                    body: JSON.stringify(payload)
                });
                return response.json();
            })();

        if (data && data.success) {
            /* Publikacja kopiuje zapisany szkic; lokalny Cennik się nie zmienia,
               więc drugi GET po sukcesie był zbędny. */
            crmPriceListTouchCacheV25();
            alert("Cennik opublikowany.");
        } else {
            alert(
                "Błąd publikacji: " +
                (data?.error || "Nieznany błąd")
            );
        }
    } catch (error) {
        console.error(error);
        alert("Błąd połączenia podczas publikacji.");
    }
}

/* ----- CEN.18. deleteService (oryginalna linia 3581) ----- */
function deleteService(index) {
    const service = currentServices[index];

    if (!service) {
        alert("Nie znaleziono usługi do usunięcia.");
        return;
    }

    const confirmDelete = confirm(
        "Usunąć usługę?\n\n" +
        (service.name || "Bez nazwy")
    );

    if (!confirmDelete) {
        return;
    }

    currentServices.splice(index, 1);

    renderServicesTable();
    buildColorsEditor();

    alert(
        "Usługa usunięta lokalnie.\n\n" +
        "Kliknij teraz „Zapisz szkic”, a potem „Publikuj”, żeby usunąć ją z arkusza i strony klienta."
    );
}

/* ----- CEN.19. syncCategoryColorsAndRefresh (oryginalna linia 3810) ----- */
/* ==========================================================
   KONIEC DUZEGO PAKIETU CRM 3.3E-3.3H
   ========================================================== */


/* ==========================================================
   ROZSZERZENIE: KATEGORIE, GRAFIK 4X4, KOREKTY I IMPORT
   ========================================================== */
async function syncCategoryColorsAndRefresh() {
    const response = await crmExtendedPost("syncCategoryColors", { categories: getUniqueServiceCategories() });
    if (!response.success) throw new Error(response.error || "Błąd synchronizacji kategorii");
    globalColors = Object.assign({}, globalColors, response.colors || {});
    buildColorsEditor();
    renderBooksyCalendar();
    return response;
}

/* ----- CEN.20. crmNormalizeServiceName (oryginalna linia 4575) ----- */
/* KONIEC FINALNEGO UKLADU I AKTUALIZACJI */


/* ==========================================================
   ADMIN V13: SPOJNE KOLORY I PELNE KARTY TYGODNIA
   Jedno zrodlo koloru kategorii dla wszystkich widokow.
   Tydzien pokazuje tylko pelne karty i przycisk +N pozostale.
   ========================================================== */
function crmNormalizeServiceName(value) {
    return String(value || "").trim().toLocaleLowerCase("pl-PL").replace(/\s+/g, " ");
}

/* ----- CEN.21. crmResolveCategoryColor (oryginalna linia 4585) ----- */
function crmResolveCategoryColor(item) {
    if (item && item.eventType === "block") return "#8c6b4f";
    if (item && item.eventType === "external") return "#6f737b";
    if (item && item.eventType === "work_shift") return "#f2c94c";

    const service = crmFindServiceForVisit(item);
    const category = String((service && service.category) || (item && item.category) || "").trim();

    return String(
        (service && service.categoryColor) ||
        (category && globalColors[category]) ||
        (item && item.categoryColor) ||
        "#b05c75"
    ).trim();
}

/* ----- CEN.22. crmApplyCategoryColors (oryginalna linia 4613) ----- */
function crmApplyCategoryColors(element, item) {
    if (!element) return "#b05c75";
    const color = crmResolveCategoryColor(item);
    element.style.setProperty("--event-stripe", color);
    element.style.setProperty("--event-fill", crmColorToSoftRgba(color, 0.16));
    element.style.setProperty("--crm-event-color", color);
    element.style.setProperty("--crm-event-soft", crmColorToSoftRgba(color, 0.16));
    element.style.borderLeftColor = color;
    element.style.background = `linear-gradient(100deg, ${crmColorToSoftRgba(color, 0.18)}, rgba(255,255,255,.94))`;
    return color;
}

/* ----- CEN.23. crmPriceId (oryginalna linia 5281) ----- */
/* ==========================================================
   KONIEC DIAGNOSTYKI SYSTEMU CRM
   TEN KOMENTARZ MUSI POZOSTAC NA SAMYM KONCU ADMIN.JS.
   ========================================================== */


/* ==========================================================
   CENNIK: KATEGORIE, KOLORY I KOLEJNOSC
   ========================================================== */
function crmPriceId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}


/* ==========================================================================
   CENNIK V26.7 — CZAS PIERWSZEJ WIZYTY W KATEGORII
   AUTO = najdłuższa opublikowana/aktywna usługa w kategorii.
   MANUAL = czas ustawiony ręcznie.
   ========================================================================== */
function crmNormalizeFirstVisitModeV267(value) {
    return String(value || "AUTO").trim().toUpperCase() === "MANUAL" ? "MANUAL" : "AUTO";
}

function crmFirstVisitServiceIsPublishedV267(service) {
    const status = String(service?.status || "").trim().toUpperCase();
    return ["OPUBLIKOWANY", "AKTYWNY", "PUBLISHED", "ACTIVE"].includes(status);
}

function crmCategoryAutoDurationV267(category) {
    const durations = (Array.isArray(category?.services) ? category.services : [])
        .map(item => item?.service || item)
        .filter(crmFirstVisitServiceIsPublishedV267)
        .map(service => Number(service?.duration) || 0)
        .filter(value => value > 0);
    return durations.length ? Math.max(...durations) : 0;
}

function crmCategoryFirstVisitEffectiveDurationV267(category) {
    const mode = crmNormalizeFirstVisitModeV267(category?.firstVisitMode);
    if (mode === "MANUAL") {
        return Math.max(0, Number(category?.firstVisitManualMinutes) || 0);
    }
    return crmCategoryAutoDurationV267(category);
}

function crmApplyCategoryFirstVisitMetaV267(categoryId, mode, manualMinutes) {
    const normalizedMode = crmNormalizeFirstVisitModeV267(mode);
    const normalizedMinutes = Math.max(0, Math.round(Number(manualMinutes) || 0));
    currentServices
        .filter(service => service.categoryId === categoryId)
        .forEach(service => {
            service.firstVisitMode = normalizedMode;
            service.firstVisitManualMinutes = normalizedMinutes;
        });
}

function crmSyncFirstVisitMetaV267() {
    crmCategoriesFromPrices().forEach(category => {
        crmApplyCategoryFirstVisitMetaV267(
            category.id,
            category.firstVisitMode,
            category.firstVisitManualMinutes
        );
    });
}

function crmToggleCategoryFirstVisitAutoV267(categoryId, checked) {
    const category = crmCategoriesFromPrices().find(item => item.id === categoryId);
    if (!category) return;

    if (checked) {
        crmApplyCategoryFirstVisitMetaV267(categoryId, "AUTO", category.firstVisitManualMinutes);
    } else {
        const autoDuration = crmCategoryAutoDurationV267(category);
        const startingManual =
            Number(category.firstVisitManualMinutes) > 0
                ? Number(category.firstVisitManualMinutes)
                : autoDuration;
        crmApplyCategoryFirstVisitMetaV267(categoryId, "MANUAL", startingManual);
    }
    renderServicesTable();
}

function crmSetCategoryFirstVisitMinutesV267(categoryId, value) {
    const minutes = Math.max(5, Math.min(480, Math.round(Number(value) || 0)));
    if (!minutes) return;
    crmApplyCategoryFirstVisitMetaV267(categoryId, "MANUAL", minutes);
    renderServicesTable();
}

function crmFirstVisitCategoryControlHtmlV267(category) {
    const mode = crmNormalizeFirstVisitModeV267(category.firstVisitMode);
    const autoDuration = crmCategoryAutoDurationV267(category);
    const effectiveDuration = crmCategoryFirstVisitEffectiveDurationV267(category);
    const isAuto = mode === "AUTO";

    const hint = isAuto
        ? (
            autoDuration > 0
                ? `AUTO • najdłuższa opublikowana usługa: ${autoDuration} min`
                : "AUTO • brak opublikowanych usług — kategoria nie będzie widoczna przy pierwszej wizycie"
        )
        : "MANUAL • system używa dokładnie wpisanego czasu";

    return `
      <section class="crm-first-visit-category-v267">
        <div class="crm-first-visit-category-head-v267">
          <div>
            <strong>Czas pierwszej wizyty</strong>
            <small>${hint}</small>
          </div>
          <label class="crm-first-visit-auto-v267">
            <input type="checkbox"
                   ${isAuto ? "checked" : ""}
                   onchange="crmToggleCategoryFirstVisitAutoV267('${category.id}', this.checked)">
            <span>Automatycznie dobieraj czas</span>
          </label>
        </div>

        <div class="crm-first-visit-category-time-v267">
          <label>Czas</label>
          <div class="crm-first-visit-time-field-v267">
            <input type="number"
                   min="5"
                   max="480"
                   step="5"
                   inputmode="numeric"
                   value="${effectiveDuration > 0 ? effectiveDuration : ""}"
                   placeholder="${isAuto && !autoDuration ? "—" : ""}"
                   ${isAuto ? "disabled" : ""}
                   onchange="crmSetCategoryFirstVisitMinutesV267('${category.id}', this.value)">
            <span>min</span>
          </div>
          <span class="crm-first-visit-effective-v267">
            Używany przez system:
            <b>${effectiveDuration > 0 ? `${effectiveDuration} min` : "—"}</b>
          </span>
        </div>
      </section>`;
}
/* KONIEC CENNIK V26.7 */


/* ----- CEN.24. crmPreparePriceStructure (oryginalna linia 5285) ----- */
function crmPreparePriceStructure() {
    const seenCategories = new Map();

    currentServices.forEach((service, index) => {
        service.serviceId = service.serviceId || crmPriceId("srv");
        service.serviceOrder = Number(service.serviceOrder) > 0 ? Number(service.serviceOrder) : index + 1;

        const name = String(service.category || "Inne").trim() || "Inne";
        service.category = name;

        if (!seenCategories.has(name)) {
            seenCategories.set(name, {
                categoryId: service.categoryId || crmPriceId("cat"),
                categoryOrder: Number(service.categoryOrder) > 0 ? Number(service.categoryOrder) : seenCategories.size + 1,
                categoryColor: service.categoryColor || globalColors[name] || "#b05c75",
                firstVisitMode: crmNormalizeFirstVisitModeV267(service.firstVisitMode),
                firstVisitManualMinutes: Math.max(0, Number(service.firstVisitManualMinutes) || 0)
            });
        }

        const meta = seenCategories.get(name);

        if (
            meta.firstVisitMode === "AUTO" &&
            crmNormalizeFirstVisitModeV267(service.firstVisitMode) === "MANUAL"
        ) {
            meta.firstVisitMode = "MANUAL";
            meta.firstVisitManualMinutes = Math.max(0, Number(service.firstVisitManualMinutes) || 0);
        }

        service.categoryId = meta.categoryId;
        service.categoryOrder = meta.categoryOrder;
        service.categoryColor = meta.categoryColor;
        service.firstVisitMode = meta.firstVisitMode;
        service.firstVisitManualMinutes = meta.firstVisitManualMinutes;

        globalColors[name] = meta.categoryColor;
    });

    currentServices.sort(
        (a, b) =>
            Number(a.categoryOrder) - Number(b.categoryOrder) ||
            Number(a.serviceOrder) - Number(b.serviceOrder)
    );
}

/* ----- CEN.25. crmCategoriesFromPrices (oryginalna linia 5308) ----- */
function crmCategoriesFromPrices() {
    crmPreparePriceStructure();
    const map = new Map();

    currentServices.forEach((service, serviceIndex) => {
        if (!map.has(service.categoryId)) {
            map.set(service.categoryId, {
                id: service.categoryId,
                name: service.category,
                color: service.categoryColor,
                order: Number(service.categoryOrder),
                firstVisitMode: crmNormalizeFirstVisitModeV267(service.firstVisitMode),
                firstVisitManualMinutes: Math.max(0, Number(service.firstVisitManualMinutes) || 0),
                services: []
            });
        }

        const category = map.get(service.categoryId);
        category.services.push({ service, serviceIndex });

        if (
            category.firstVisitMode === "AUTO" &&
            crmNormalizeFirstVisitModeV267(service.firstVisitMode) === "MANUAL"
        ) {
            category.firstVisitMode = "MANUAL";
            category.firstVisitManualMinutes = Math.max(0, Number(service.firstVisitManualMinutes) || 0);
        }
    });

    return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

/* ----- CEN.26. crmNormalizePriceOrder (oryginalna linia 5326) ----- */
function crmNormalizePriceOrder() {
    const categories = crmCategoriesFromPrices();
    categories.forEach((category, categoryIndex) => {
        category.services.sort((a, b) => Number(a.service.serviceOrder) - Number(b.service.serviceOrder));
        category.services.forEach((item, serviceIndex) => {
            item.service.categoryOrder = categoryIndex + 1;
            item.service.serviceOrder = serviceIndex + 1;
            item.service.category = category.name;
            item.service.categoryId = category.id;
            item.service.categoryColor = category.color;
        });
    });
    currentServices.sort((a, b) => Number(a.categoryOrder) - Number(b.categoryOrder) || Number(a.serviceOrder) - Number(b.serviceOrder));
}

/* ----- CEN.27. crmMoveCategory (oryginalna linia 5341) ----- */
function crmMoveCategory(categoryId, direction) {
    const categories = crmCategoriesFromPrices();
    const index = categories.findIndex(category => category.id === categoryId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= categories.length) return;
    const firstOrder = categories[index].order;
    categories[index].services.forEach(item => item.service.categoryOrder = categories[target].order);
    categories[target].services.forEach(item => item.service.categoryOrder = firstOrder);
    crmNormalizePriceOrder();
    renderServicesTable();
}

/* ----- CEN.28. crmMoveService (oryginalna linia 5353) ----- */
function crmMoveService(serviceId, direction) {
    crmPreparePriceStructure();
    const service = currentServices.find(item => item.serviceId === serviceId);
    if (!service) return;
    const siblings = currentServices.filter(item => item.categoryId === service.categoryId)
        .sort((a, b) => Number(a.serviceOrder) - Number(b.serviceOrder));
    const index = siblings.findIndex(item => item.serviceId === serviceId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= siblings.length) return;
    const oldOrder = siblings[index].serviceOrder;
    siblings[index].serviceOrder = siblings[target].serviceOrder;
    siblings[target].serviceOrder = oldOrder;
    crmNormalizePriceOrder();
    renderServicesTable();
}

/* ----- CEN.29. crmChangeCategoryColor (oryginalna linia 5369) ----- */
function crmChangeCategoryColor(categoryId, color) {
    currentServices.filter(service => service.categoryId === categoryId).forEach(service => service.categoryColor = color);
    renderServicesTable();
}

/* ----- CEN.30. crmEditCategory (oryginalna linia 5374) ----- */
function crmEditCategory(categoryId) {
    const category = crmCategoriesFromPrices().find(item => item.id === categoryId);
    if (!category) return;
    const newName = prompt("Nazwa kategorii:", category.name);
    if (newName === null) return;
    const cleanName = newName.trim();
    if (!cleanName) return alert("Nazwa kategorii nie może być pusta.");
    const duplicate = crmCategoriesFromPrices().some(item => item.id !== categoryId && item.name.toLowerCase() === cleanName.toLowerCase());
    if (duplicate) return alert("Taka kategoria już istnieje.");
    currentServices.filter(service => service.categoryId === categoryId).forEach(service => service.category = cleanName);
    renderServicesTable();
}

/* ----- CEN.31. renderServicesTable (oryginalna linia 5387) ----- */
function renderServicesTable() {
    const tbody = document.getElementById("adminServicesTableBody");
    if (!tbody) return;
    crmPreparePriceStructure();
    const table = tbody.closest("table");
    if (table) {
        const head = table.querySelector("thead tr");
        if (head) head.innerHTML = "<th>Kategoria i usługi</th>";
    }
    tbody.innerHTML = "";
    const categories = crmCategoriesFromPrices();
    if (!categories.length) {
        tbody.innerHTML = '<tr><td style="text-align:center">Brak kategorii i usług</td></tr>';
        return;
    }
    categories.forEach((category, categoryIndex) => {
        const categoryRow = document.createElement("tr");
        categoryRow.className = "crm-price-category-row";
        categoryRow.innerHTML = `<td>
          <details class="crm-price-category" data-category-id="${category.id}">
            <summary style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 0">
              <span style="width:16px;height:16px;border-radius:4px;background:${category.color};display:inline-block"></span>
              <strong style="flex:1">${category.name}</strong>
              <span>${category.services.length} usług</span>
              <button type="button" class="btn-secondary" ${categoryIndex === 0 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',-1)">↑</button>
              <button type="button" class="btn-secondary" ${categoryIndex === categories.length - 1 ? "disabled" : ""} onclick="event.preventDefault();crmMoveCategory('${category.id}',1)">↓</button>
              <input type="color" value="${category.color}" title="Kolor kategorii" onclick="event.stopPropagation()" onchange="crmChangeCategoryColor('${category.id}',this.value)">
              <button type="button" class="btn-secondary" onclick="event.preventDefault();crmEditCategory('${category.id}')">Edytuj kategorię</button>
            </summary>
            <div style="overflow:auto">
              <table style="width:100%"><thead><tr><th>Kolejność</th><th>Usługa</th><th>Cena</th><th>Czas</th><th>Status</th><th>Akcje</th></tr></thead>
              <tbody>${category.services.map((item, serviceIndex) => `<tr>
                <td><button type="button" class="btn-secondary" ${serviceIndex === 0 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',-1)">↑</button> <button type="button" class="btn-secondary" ${serviceIndex === category.services.length - 1 ? "disabled" : ""} onclick="crmMoveService('${item.service.serviceId}',1)">↓</button></td>
                <td>${item.service.name || ""}</td><td>${Number(item.service.price || 0)} zł</td><td>${Number(item.service.duration || 0)} min</td><td>${item.service.status || ""}</td>
                <td><button class="btn-secondary" onclick="editService(${item.serviceIndex})">Edytuj</button> <button class="btn-danger" onclick="deleteService(${item.serviceIndex})">Usuń</button></td>
              </tr>`).join("")}</tbody></table>
            </div>
          </details>
        </td>`;
        tbody.appendChild(categoryRow);
    });
}

/* ----- CEN.32. saveServiceModalData (oryginalna linia 5430) ----- */
function saveServiceModalData() {
    const index = parseInt(document.getElementById("editServiceIndex").value, 10);
    const previous = index >= 0 ? currentServices[index] : null;
    const categoryName = document.getElementById("serviceCategory").value.trim();
    const category = crmCategoriesFromPrices().find(item => item.name === categoryName);
    const serviceData = {
        ...(previous || {}),
        serviceId: previous?.serviceId || crmPriceId("srv"),
        category: categoryName,
        categoryId: category?.id || previous?.categoryId || crmPriceId("cat"),
        categoryOrder: category?.order || previous?.categoryOrder || crmCategoriesFromPrices().length + 1,
        categoryColor: category?.color || previous?.categoryColor || "#b05c75",
        serviceOrder: previous?.categoryId === category?.id ? previous.serviceOrder : ((category?.services.length || 0) + 1),
        name: document.getElementById("serviceName").value.trim(),
        price: Number(document.getElementById("servicePrice").value) || 0,
        duration: Number(document.getElementById("serviceDuration").value) || 60,
        showPrice: "Tak", showDuration: "Tak",
        status: document.getElementById("serviceStatus").value || "Szkic"
    };
    if (!serviceData.category || !serviceData.name) return alert("Wpisz kategorię i nazwę usługi.");
    if (index >= 0) currentServices[index] = serviceData; else currentServices.push(serviceData);
    crmNormalizePriceOrder();
    renderServicesTable();
    closeServiceModal();
    alert("Usługa zapisana lokalnie. Zapisz szkic, a następnie opublikuj cennik.");
}

/* ----- CEN.33. crmReplaceServiceFormInputs (oryginalna linia 5473) ----- */
/* KONIEC CENNIKA */

/* ==========================================================
   CENNIK: WYBOR KATEGORII I ZABIEGU W FORMULARZU
   ========================================================== */
function crmReplaceServiceFormInputs() {
    const categoryInput = document.getElementById("serviceCategory");
    const serviceInput = document.getElementById("serviceName");
    if (!categoryInput || !serviceInput) return;

    if (categoryInput.tagName !== "SELECT") {
        const select = document.createElement("select");
        Array.from(categoryInput.attributes).forEach(attribute => select.setAttribute(attribute.name, attribute.value));
        select.id = "serviceCategory";
        select.name = categoryInput.name || "serviceCategory";
        select.innerHTML = '<option value="">Wybierz kategorię</option>';
        categoryInput.replaceWith(select);
    }

    const currentServiceInput = document.getElementById("serviceName");
    if (currentServiceInput && !currentServiceInput.getAttribute("list")) {
        currentServiceInput.setAttribute("list", "crmServiceNamesList");
        currentServiceInput.setAttribute("autocomplete", "off");
        currentServiceInput.placeholder = "Wybierz lub wpisz nazwę zabiegu";
        const datalist = document.createElement("datalist");
        datalist.id = "crmServiceNamesList";
        currentServiceInput.after(datalist);
    }

    crmRefreshServiceFormChoices();
}

/* ----- CEN.34. crmRefreshServiceFormChoices (oryginalna linia 5500) ----- */
function crmRefreshServiceFormChoices(selectedCategory, selectedService) {
    const select = document.getElementById("serviceCategory");
    if (!select || select.tagName !== "SELECT") return;
    const current = selectedCategory !== undefined ? selectedCategory : select.value;
    const categories = crmCategoriesFromPrices();
    select.innerHTML = '<option value="">Wybierz kategorię</option>' + categories
        .map(category => `<option value="${category.name.replace(/"/g, "&quot;")}">${category.name}</option>`)
        .join("");
    if (current && !categories.some(category => category.name === current)) {
        const option = document.createElement("option");
        option.value = current;
        option.textContent = current;
        select.appendChild(option);
    }
    select.value = current || "";

    const list = document.getElementById("crmServiceNamesList");
    if (list) {
        const names = [...new Set(currentServices
            .filter(service => !select.value || service.category === select.value)
            .map(service => String(service.name || "").trim())
            .filter(Boolean))];
        list.innerHTML = names.map(name => `<option value="${name.replace(/"/g, "&quot;")}"></option>`).join("");
    }
    if (selectedService !== undefined) document.getElementById("serviceName").value = selectedService || "";
}

/* ----- CEN.35. crmOriginalOpenAddServiceModal (oryginalna linia 5531) ----- */
const crmOriginalOpenAddServiceModal = openAddServiceModal;

/* ----- CEN.36. openAddServiceModal (oryginalna linia 5532) ----- */
openAddServiceModal = function() {
    crmOriginalOpenAddServiceModal();
    crmReplaceServiceFormInputs();
    crmRefreshServiceFormChoices("", "");
};

/* ----- CEN.37. crmOriginalEditService (oryginalna linia 5538) ----- */
const crmOriginalEditService = editService;

/* ----- CEN.38. editService (oryginalna linia 5539) ----- */
editService = function(index) {
    const service = currentServices[index];
    crmReplaceServiceFormInputs();
    crmOriginalEditService(index);
    if (service) crmRefreshServiceFormChoices(service.category || "", service.name || "");
};

/* ----- CEN.39. crmOriginalLoadServicesForChoices (oryginalna linia 5546) ----- */
const crmOriginalLoadServicesForChoices = loadServices;

/* ----- CEN.40. loadServices (oryginalna linia 5547) ----- */
loadServices = async function() {
    await crmOriginalLoadServicesForChoices();
    crmReplaceServiceFormInputs();
    crmRefreshServiceFormChoices();
};

/* ----- CEN.41. crmGetServicePriceText (oryginalna linia 5716) ----- */
function crmGetServicePriceText(app) {
    const service = crmFindServiceForVisit(app);
    const value = app?.price ?? service?.price;
    if (value === undefined || value === null || value === "") return "—";
    const number = Number(String(value).replace(",","."));
    return Number.isFinite(number) ? number.toLocaleString("pl-PL", {minimumFractionDigits:2,maximumFractionDigits:2}) + " zł" : String(value);
}

/* ----- CEN.42. crmCategoryColor (oryginalna linia 6103) ----- */
function crmCategoryColor(item) {
    if (item?.eventType === "block") return "#b8afb4";
    if (item?.eventType === "external") return "#9ba8ba";
    if (item?.eventType === "work_shift") return "#d9b43b";
    const service = (Array.isArray(currentServices) ? currentServices : []).find(value =>
        value.name && item?.service && value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    return item?.categoryColor || item?.color || service?.categoryColor || globalColors?.[service?.category] || globalColors?.[item?.category] || "#bb6f8f";
}

/* ----- CEN.43. crmCategoryPalette (oryginalna linia 6112) ----- */
function crmCategoryPalette(item) {
    const color = crmCategoryColor(item);
    const [r,g,b] = crmHexToRgb(color);
    return {stripe:color, fill:`rgba(${r},${g},${b},.16)`, hover:`rgba(${r},${g},${b},.22)`};
}

/* ----- CEN.44. crmApplyCategoryVisualsToLegacyCards (oryginalna linia 6260) ----- */
/* KONIEC ADMIN V8 */

/* ==========================================================
   ADMIN V8.1: HARMONIJNY TERMINARZ I KOLORY KATEGORII
   ========================================================== */
function crmApplyCategoryVisualsToLegacyCards() {
    document.querySelectorAll('.calendar-compact-event,.booksy-event-card,.crm-day-event').forEach(card => {
        const item = card.__crmItem;
        if (!item) return;
        const palette = crmCategoryPalette(item);
        card.style.setProperty('--event-stripe', palette.stripe);
        card.style.setProperty('--event-fill', palette.fill);
        card.style.background = palette.fill;
        card.style.borderLeftColor = palette.stripe;
    });
}


/* ==========================================================================
   CENNIK PREMIUM V27.4 — FLOATING CLIENT PREVIEW
   2026-08-23
   - ikona kategorii: categoryIcon
   - widoczność ikony dla klienta per kategoria: categoryIconClientVisible
   - globalna widoczność ikon klienta: clientIconsGlobalVisible
   - podgląd kolejności kategorii i usług dla klienta
   - responsywna siatka 3 / 2 / 1
   ========================================================================== */

/* V30.6: ścieżki assetów działają zarówno w /admin/admin.html, jak i /admin/dev/dev.html. */
function crmAdminAssetPathV306(path){
  const clean=String(path||"").replace(/^\.\//,"");
  const inDev=/\/admin\/dev(?:\/|$)/i.test(String(window.location.pathname||""));
  return (inDev ? "../" : "") + clean;
}
const CRM_PRICE_ICON_BASE_V27 = crmAdminAssetPathV306("Icons/Cennik/");
const CRM_PRICE_ICON_FALLBACK_V27 = "universal";

const CRM_PRICE_ICON_CATALOG_V27 = [
  ["face","Twarz","face.png"],
  ["skin","Skóra","skin.png"],
  ["mask","Maska","mask.png"],
  ["eyes","Oczy","eyes.png"],
  ["lashes","Rzęsy","lashes.png"],
  ["brows","Brwi","brows.png"],
  ["lips","Usta","lips.png"],
  ["makeup","Makijaż","makeup.png"],
  ["brush","Pędzel","brush.png"],
  ["manicure","Manicure","manicure.png"],
  ["pedicure","Pedicure","pedicure.png"],
  ["nails","Paznokcie","nails.png"],
  ["face-massage","Masaż twarzy","face-massage.png"],
  ["depilation","Depilacja","depilation.png"],
  ["laser","Laser","laser.png"],
  ["laser-hair-removal","Depilacja laserowa","laser-hair-removal.png"],
  ["hair","Włosy","hair.png"],
  ["scissors","Nożyczki","scissors.png"],
  ["body","Ciało","body.png"],
  ["spa","SPA","spa.png"],
  ["peeling","Peeling","peeling.png"],
  ["microneedling","Mikronakłuwanie","microneedling.png"],
  ["mesotherapy","Mezoterapia","mesotherapy.png"],
  ["device","Aparatura","device.png"],
  ["hifu","HIFU","hifu.png"],
  ["rf","RF","rf.png"],
  ["acne","Trądzik","acne.png"],
  ["consultation","Konsultacja","consultation.png"],
  ["appointment","Wizyta","appointment.png"],
  ["wellness","Wellness","wellness.png"],
  ["universal","Uniwersalna","universal.png"],
  ["glow","Blask","glow.png"],
  ["package","Pakiet / Zestaw usług","package.png"]
].map(([id,label,file]) => ({id,label,file}));

function crmEscapeHtmlV27(value) {
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function crmNormTextV27(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ");
}

function crmGuessCategoryIconV27(name) {
  const n = crmNormTextV27(name);
  const rules = [
    [/(depilacj.*laser|laser.*depilacj)/,"laser-hair-removal"],
    [/(radiofrekw|(^|\s)rf(\s|$))/,"rf"],
    [/hifu|ultradzw/,"hifu"],
    [/mikronak|dermapen/,"microneedling"],
    [/mezoter|igl/,"mesotherapy"],
    [/tradz|acne|problem.*skor/,"acne"],
    [/konsult|doradztw/,"consultation"],
    [/pakiet|zestaw|seria|voucher/,"package"],
    [/masaz.*twarz|twarz.*masaz/,"face-massage"],
    [/(pielegnacja.*dlon|dlon.*pielegnacja|manicure)/,"manicure"],
    [/(pielegnacja.*stop|stop.*pielegnacja|pedicure)/,"pedicure"],
    [/paznok|nail/,"nails"],
    [/rz[eę]s|lashes/,"lashes"],
    [/oczy|oko|eye/,"eyes"],
    [/brwi|brow/,"brows"],
    [/usta|lip/,"lips"],
    [/makij|makeup|wizaz/,"makeup"],
    [/pedzel|brush/,"brush"],
    [/depil|wosk|wax/,"depilation"],
    [/laser/,"laser"],
    [/wlos|fryz|hair/,"hair"],
    [/nozycz|scissor/,"scissors"],
    [/spa|relaks/,"spa"],
    [/peeling|scrub/,"peeling"],
    [/aparat|urzadz|technolog/,"device"],
    [/cialo|body/,"body"],
    [/maska|masecz/,"mask"],
    [/skor|dermat/,"skin"],
    [/twarz|kosmetyka.*twar|pielegnacja.*twar/,"face"],
    [/wizyta|termin|kalendar/,"appointment"],
    [/wellness|lotos/,"wellness"],
    [/blask|rozswiet|glow/,"glow"]
  ];
  for (const [rx,id] of rules) if (rx.test(n)) return id;
  return CRM_PRICE_ICON_FALLBACK_V27;
}

function crmGetIconMetaV27(iconId) {
  return CRM_PRICE_ICON_CATALOG_V27.find(item => item.id === iconId)
    || CRM_PRICE_ICON_CATALOG_V27.find(item => item.id === CRM_PRICE_ICON_FALLBACK_V27);
}

function crmPriceIconSrcV27(iconId) {
  return CRM_PRICE_ICON_BASE_V27 + crmGetIconMetaV27(iconId).file;
}

function crmServiceCountTextV27(count) {
  const n = Number(count) || 0;
  if (n === 1) return "1 usługa";
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return `${n} usługi`;
  return `${n} usług`;
}


function crmBoolV272(value, fallback = true) {
  if (value === undefined || value === null || value === "") return Boolean(fallback);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const n = crmNormTextV27(value);
  if (["nie","false","0","off","wyl","wył","ukryj","hidden"].includes(n)) return false;
  if (["tak","true","1","on","wl","wł","pokaz","pokaż","visible"].includes(n)) return true;
  return Boolean(fallback);
}

function crmClientIconsGlobalVisibleV272() {
  const row = (currentServices || []).find(service =>
    service && service.clientIconsGlobalVisible !== undefined &&
    service.clientIconsGlobalVisible !== null &&
    service.clientIconsGlobalVisible !== ""
  );
  return crmBoolV272(row?.clientIconsGlobalVisible, true);
}

function crmSetClientIconsGlobalVisibleV272(value) {
  const next = Boolean(value);
  (currentServices || []).forEach(service => {
    service.clientIconsGlobalVisible = next;
  });
  crmEnsureClientPreviewControlsV272();
  crmRenderClientPreviewV272();
}

function crmSetCategoryIconClientVisibleV272(categoryId, value) {
  const next = Boolean(value);
  (currentServices || [])
    .filter(service => service.categoryId === categoryId)
    .forEach(service => service.categoryIconClientVisible = next);
  crmSyncCategoryEditorV27();
  crmRenderClientPreviewV272();
}

/* V27: pełna normalizacja metadanych kategorii, z zachowaniem V26.7. */
crmPreparePriceStructure = function() {
  const seenCategories = new Map();
  const iconSeeds = new Map();

  currentServices.forEach(service => {
    const name = String(service.category || "Inne").trim() || "Inne";
    const icon = String(service.categoryIcon || "").trim();
    if (!icon) return;
    const order = Number(service.serviceOrder) > 0 ? Number(service.serviceOrder) : Number.MAX_SAFE_INTEGER;
    const previous = iconSeeds.get(name);
    if (!previous || order < previous.order) iconSeeds.set(name, {icon, order});
  });

  currentServices.forEach((service, index) => {
    service.serviceId = service.serviceId || crmPriceId("srv");
    service.serviceOrder = Number(service.serviceOrder) > 0 ? Number(service.serviceOrder) : index + 1;

    const name = String(service.category || "Inne").trim() || "Inne";
    service.category = name;

    if (!seenCategories.has(name)) {
      seenCategories.set(name, {
        categoryId: service.categoryId || crmPriceId("cat"),
        categoryOrder: Number(service.categoryOrder) > 0 ? Number(service.categoryOrder) : seenCategories.size + 1,
        categoryColor: service.categoryColor || globalColors[name] || "#b05c75",
        categoryIcon: iconSeeds.get(name)?.icon || crmGuessCategoryIconV27(name),
        categoryIconClientVisible: crmBoolV272(service.categoryIconClientVisible, true),
        clientIconsGlobalVisible: crmBoolV272(service.clientIconsGlobalVisible, crmClientIconsGlobalVisibleV272()),
        firstVisitMode: crmNormalizeFirstVisitModeV267(service.firstVisitMode),
        firstVisitManualMinutes: Math.max(0, Number(service.firstVisitManualMinutes) || 0)
      });
    }

    const meta = seenCategories.get(name);

    if (!meta.categoryIcon && service.categoryIcon) {
      meta.categoryIcon = String(service.categoryIcon).trim();
    }

    if (
      meta.firstVisitMode === "AUTO" &&
      crmNormalizeFirstVisitModeV267(service.firstVisitMode) === "MANUAL"
    ) {
      meta.firstVisitMode = "MANUAL";
      meta.firstVisitManualMinutes = Math.max(0, Number(service.firstVisitManualMinutes) || 0);
    }

    service.categoryId = meta.categoryId;
    service.categoryOrder = meta.categoryOrder;
    service.categoryColor = meta.categoryColor;
    service.categoryIcon = meta.categoryIcon || crmGuessCategoryIconV27(name);
    service.categoryIconClientVisible = crmBoolV272(meta.categoryIconClientVisible, true);
    service.clientIconsGlobalVisible = crmBoolV272(meta.clientIconsGlobalVisible, true);
    service.firstVisitMode = meta.firstVisitMode;
    service.firstVisitManualMinutes = meta.firstVisitManualMinutes;

    globalColors[name] = meta.categoryColor;
  });

  currentServices.sort(
    (a,b) =>
      Number(a.categoryOrder) - Number(b.categoryOrder) ||
      Number(a.serviceOrder) - Number(b.serviceOrder)
  );
};

crmCategoriesFromPrices = function() {
  crmPreparePriceStructure();
  const map = new Map();

  currentServices.forEach((service, serviceIndex) => {
    if (!map.has(service.categoryId)) {
      map.set(service.categoryId, {
        id: service.categoryId,
        name: service.category,
        color: service.categoryColor,
        icon: service.categoryIcon || crmGuessCategoryIconV27(service.category),
        iconClientVisible: crmBoolV272(service.categoryIconClientVisible, true),
        clientIconsGlobalVisible: crmBoolV272(service.clientIconsGlobalVisible, true),
        order: Number(service.categoryOrder),
        firstVisitMode: crmNormalizeFirstVisitModeV267(service.firstVisitMode),
        firstVisitManualMinutes: Math.max(0, Number(service.firstVisitManualMinutes) || 0),
        services: []
      });
    }

    const category = map.get(service.categoryId);
    category.services.push({service, serviceIndex});

    if (
      category.firstVisitMode === "AUTO" &&
      crmNormalizeFirstVisitModeV267(service.firstVisitMode) === "MANUAL"
    ) {
      category.firstVisitMode = "MANUAL";
      category.firstVisitManualMinutes = Math.max(0, Number(service.firstVisitManualMinutes) || 0);
    }
  });

  return Array.from(map.values()).sort((a,b) => a.order - b.order);
};

crmNormalizePriceOrder = function() {
  const categories = crmCategoriesFromPrices();
  categories.forEach((category, categoryIndex) => {
    category.services.sort((a,b) => Number(a.service.serviceOrder) - Number(b.service.serviceOrder));
    category.services.forEach((item, serviceIndex) => {
      item.service.categoryOrder = categoryIndex + 1;
      item.service.serviceOrder = serviceIndex + 1;
      item.service.category = category.name;
      item.service.categoryId = category.id;
      item.service.categoryColor = category.color;
      item.service.categoryIcon = category.icon || crmGuessCategoryIconV27(category.name);
      item.service.categoryIconClientVisible = crmBoolV272(category.iconClientVisible, true);
      item.service.clientIconsGlobalVisible = crmClientIconsGlobalVisibleV272();
      item.service.firstVisitMode = crmNormalizeFirstVisitModeV267(category.firstVisitMode);
      item.service.firstVisitManualMinutes = Math.max(0, Number(category.firstVisitManualMinutes) || 0);
    });
  });

  currentServices.sort(
    (a,b) =>
      Number(a.categoryOrder) - Number(b.categoryOrder) ||
      Number(a.serviceOrder) - Number(b.serviceOrder)
  );
};

function crmSetCategoryIconV27(categoryId, iconId) {
  const valid = crmGetIconMetaV27(iconId)?.id || CRM_PRICE_ICON_FALLBACK_V27;
  currentServices
    .filter(service => service.categoryId === categoryId)
    .forEach(service => service.categoryIcon = valid);
  renderServicesTable();
  crmSyncCategoryEditorV27();
}

function crmSetCategoryColorV27(categoryId, color) {
  crmChangeCategoryColor(categoryId, color);
  crmSyncCategoryEditorV27();
}

function crmToggleCategorySettingsV27(categoryId) {
  const panel = document.getElementById(`crm-price-advanced-${categoryId}`);
  if (!panel) return;
  panel.hidden = !panel.hidden;
}

function crmOpenCategoryEditorV27(categoryId) {
  const category = crmCategoriesFromPrices().find(item => item.id === categoryId);
  if (!category) return;

  openCategoryModal();
  const select = document.getElementById("categorySelectForEdit");
  if (select) {
    select.value = category.name;
    select.dispatchEvent(new Event("change", {bubbles:true}));
  }
  crmEnsureIconPickerV27();
  crmSyncCategoryEditorV27();
}

function crmCurrentCategoryForEditorV27() {
  const select = document.getElementById("categorySelectForEdit");
  const name = String(select?.value || "").trim();
  return crmCategoriesFromPrices().find(item => item.name === name) || null;
}

function crmEnsureIconPickerV27() {
  const modal = document.querySelector("#categoryModal .modal-content");
  const select = document.getElementById("categorySelectForEdit");
  if (!modal || !select) return;

  if (!document.getElementById("crmCategoryLookV27")) {
    const block = document.createElement("section");
    block.id = "crmCategoryLookV27";
    block.className = "crm-category-look-v27";
    block.innerHTML = `
      <div class="crm-category-look-head-v27">
        <div>
          <strong>Wygląd kategorii</strong>
          <small>Ikona i kolor paska</small>
        </div>
        <label class="crm-category-color-v27">
          <span>Kolor</span>
          <input type="color" id="crmCategoryColorV27" value="#b05c75">
        </label>
      </div>
      <label class="crm-category-client-icon-v272">
        <span>
          <b>Pokaż ikonę klientom</b>
          <small>Działa, gdy globalne „Ikony klienta” są włączone.</small>
        </span>
        <span class="crm-switch-v272">
          <input type="checkbox" id="crmCategoryIconClientVisibleV272" checked>
          <i aria-hidden="true"></i>
        </span>
      </label>
      <div class="crm-category-icon-search-v27">
        <input type="search" id="crmCategoryIconSearchV27"
               placeholder="Szukaj ikony, np. brwi, laser, manicure…"
               autocomplete="off">
      </div>
      <div id="crmCategoryIconGridV27" class="crm-category-icon-grid-v27"></div>
      <div class="crm-category-look-note-v27">
        Zmiana jest lokalna. Użyj potem „Zapisz szkic”, aby zapisać ją w Cenniku.
      </div>
    `;
    select.closest(".form-group")?.after(block);

    const colorInput = block.querySelector("#crmCategoryColorV27");
    colorInput?.addEventListener("change", () => {
      const category = crmCurrentCategoryForEditorV27();
      if (category) crmSetCategoryColorV27(category.id, colorInput.value);
    });

    const visibleInput = block.querySelector("#crmCategoryIconClientVisibleV272");
    visibleInput?.addEventListener("change", () => {
      const category = crmCurrentCategoryForEditorV27();
      if (category) crmSetCategoryIconClientVisibleV272(category.id, visibleInput.checked);
    });

    const search = block.querySelector("#crmCategoryIconSearchV27");
    search?.addEventListener("input", () => crmRenderIconGridV27(search.value));

    select.addEventListener("change", crmSyncCategoryEditorV27);
  }

}

function crmRenderIconGridV27(filterText = "") {
  const grid = document.getElementById("crmCategoryIconGridV27");
  if (!grid) return;

  const category = crmCurrentCategoryForEditorV27();
  const selected = category?.icon || CRM_PRICE_ICON_FALLBACK_V27;
  const q = crmNormTextV27(filterText);

  const catalog = CRM_PRICE_ICON_CATALOG_V27.filter(item => {
    if (!q) return true;
    return crmNormTextV27(`${item.label} ${item.id}`).includes(q);
  });

  grid.innerHTML = catalog.map(item => `
    <button type="button"
            class="crm-category-icon-choice-v27 ${item.id === selected ? "is-selected" : ""}"
            data-icon-id="${crmEscapeHtmlV27(item.id)}"
            title="${crmEscapeHtmlV27(item.label)}">
      <img src="${crmEscapeHtmlV27(crmPriceIconSrcV27(item.id))}" alt="">
      <span>${crmEscapeHtmlV27(item.label)}</span>
    </button>
  `).join("");

  grid.querySelectorAll(".crm-category-icon-choice-v27").forEach(button => {
    button.addEventListener("click", () => {
      const current = crmCurrentCategoryForEditorV27();
      if (!current) return;
      crmSetCategoryIconV27(current.id, button.dataset.iconId);
    });
  });
}

function crmSyncCategoryEditorV27() {
  crmEnsureIconPickerV27();
  const category = crmCurrentCategoryForEditorV27();
  const colorInput = document.getElementById("crmCategoryColorV27");
  const visibleInput = document.getElementById("crmCategoryIconClientVisibleV272");
  const search = document.getElementById("crmCategoryIconSearchV27");

  if (colorInput && category) colorInput.value = category.color || "#b05c75";
  if (visibleInput && category) visibleInput.checked = crmBoolV272(category.iconClientVisible, true);
  crmRenderIconGridV27(search?.value || "");
}

const crmRenderCategoryModalListBeforeV27 = renderCategoryModalList;
renderCategoryModalList = function() {
  crmRenderCategoryModalListBeforeV27();
  crmEnsureIconPickerV27();
  crmSyncCategoryEditorV27();
};

const crmOpenCategoryModalBeforeV27 = openCategoryModal;
openCategoryModal = function() {
  crmOpenCategoryModalBeforeV27();
  crmEnsureIconPickerV27();
  crmSyncCategoryEditorV27();
};

crmEditCategory = function(categoryId) {
  crmOpenCategoryEditorV27(categoryId);
};


function crmEnsureClientPreviewControlsV272() {
  const tab = document.getElementById("tab-cennik");
  const actionHost = tab?.querySelector(".page-header > div");
  if (!actionHost) return;

  let globalBtn = document.getElementById("crmClientIconsGlobalToggleV272");
  if (!globalBtn) {
    globalBtn = document.createElement("button");
    globalBtn.type = "button";
    globalBtn.id = "crmClientIconsGlobalToggleV272";
    globalBtn.className = "crm-client-icons-toggle-v272";
    globalBtn.addEventListener("click", () => {
      crmSetClientIconsGlobalVisibleV272(!crmClientIconsGlobalVisibleV272());
    });
  }

  let previewBtn = document.getElementById("crmClientPreviewOpenV272");
  if (!previewBtn) {
    previewBtn = document.createElement("button");
    previewBtn.type = "button";
    previewBtn.id = "crmClientPreviewOpenV272";
    previewBtn.className = "crm-client-preview-open-v272";
    previewBtn.textContent = "◉ Podgląd klienta";
    previewBtn.addEventListener("click", crmOpenClientPreviewV272);
  }

  const saveBtn = Array.from(actionHost.querySelectorAll("button"))
    .find(btn => /zapisz szkic/i.test(btn.textContent || ""));

  if (!globalBtn.isConnected) {
    if (saveBtn) actionHost.insertBefore(globalBtn, saveBtn);
    else actionHost.appendChild(globalBtn);
  }

  if (!previewBtn.isConnected) {
    if (saveBtn) actionHost.insertBefore(previewBtn, saveBtn);
    else actionHost.appendChild(previewBtn);
  }

  const on = crmClientIconsGlobalVisibleV272();
  globalBtn.textContent = `Ikony klienta: ${on ? "WŁ" : "WYŁ"}`;
  globalBtn.classList.toggle("is-on", on);
  globalBtn.classList.toggle("is-off", !on);
  globalBtn.title = on
    ? "Kliknij, aby ukryć wszystkie ikony kategorii klientom"
    : "Kliknij, aby włączyć ikony kategorii klientom";
}

function crmEnsureClientPreviewModalV272() {
  let windowEl = document.getElementById("crmClientPreviewBackdropV272");
  if (windowEl) return windowEl;

  windowEl = document.createElement("section");
  windowEl.id = "crmClientPreviewBackdropV272";
  windowEl.className = "crm-client-preview-window-v274";
  windowEl.hidden = true;
  windowEl.setAttribute("role", "dialog");
  windowEl.setAttribute("aria-label", "Podgląd klienta");
  windowEl.innerHTML = `
    <header class="crm-client-preview-head-v272" data-drag-handle-v274>
      <div>
        <h2>Podgląd rejestracji klienta</h2>
        <p>Kolejność kategorii i usług jest dokładnie taka jak w Cenniku.</p>
      </div>
      <div class="crm-client-preview-window-actions-v274">
        <button type="button"
                class="crm-client-preview-minimize-v274"
                aria-label="Zwiń podgląd"
                title="Zwiń">—</button>
        <button type="button"
                class="crm-client-preview-close-v272"
                aria-label="Zamknij"
                title="Zamknij">×</button>
      </div>
    </header>
    <div class="crm-client-preview-body-v272">
      <div class="crm-client-preview-phone-v272">
        <section class="crm-client-preview-step-v272">
          <h3>1. Wybierz kategorię</h3>
          <p id="crmClientPreviewIconStateV272"></p>
          <div id="crmClientPreviewCategoriesV272"
               class="crm-client-preview-categories-v272"></div>
        </section>
        <section class="crm-client-preview-step-v272">
          <h3>2. Wybierz usługę</h3>
          <p id="crmClientPreviewSelectedCategoryV272">
            Wybierz kategorię powyżej.
          </p>
          <div id="crmClientPreviewServicesV272"
               class="crm-client-preview-services-v272"></div>
        </section>
      </div>
    </div>`;

  document.body.appendChild(windowEl);

  const closeBtn = windowEl.querySelector(".crm-client-preview-close-v272");
  const minimizeBtn = windowEl.querySelector(".crm-client-preview-minimize-v274");
  const dragHandle = windowEl.querySelector("[data-drag-handle-v274]");

  closeBtn?.addEventListener("click", crmCloseClientPreviewV272);

  minimizeBtn?.addEventListener("click", () => {
    const minimized = windowEl.classList.toggle("is-minimized-v274");
    minimizeBtn.textContent = minimized ? "▢" : "—";
    minimizeBtn.title = minimized ? "Rozwiń" : "Zwiń";
    minimizeBtn.setAttribute(
      "aria-label",
      minimized ? "Rozwiń podgląd" : "Zwiń podgląd"
    );
    try {
      localStorage.setItem(
        "crmClientPreviewMinimizedV274",
        minimized ? "1" : "0"
      );
    } catch (ignore) {}
  });

  let dragState = null;

  dragHandle?.addEventListener("pointerdown", event => {
    if (
      event.button !== 0 ||
      event.target.closest("button, input, select, textarea, a")
    ) {
      return;
    }

    const rect = windowEl.getBoundingClientRect();
    dragState = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top
    };

    windowEl.classList.add("is-dragging-v274");
    dragHandle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  dragHandle?.addEventListener("pointermove", event => {
    if (!dragState) return;

    const width = windowEl.offsetWidth;
    const height = windowEl.offsetHeight;
    const maxLeft = Math.max(8, window.innerWidth - Math.min(width, window.innerWidth) - 8);
    const maxTop = Math.max(8, window.innerHeight - Math.min(height, window.innerHeight) - 8);

    const left = Math.max(
      8,
      Math.min(maxLeft, event.clientX - dragState.dx)
    );
    const top = Math.max(
      8,
      Math.min(maxTop, event.clientY - dragState.dy)
    );

    windowEl.style.left = `${left}px`;
    windowEl.style.top = `${top}px`;
    windowEl.style.right = "auto";
    windowEl.style.bottom = "auto";
  });

  const stopDrag = event => {
    if (!dragState) return;
    dragState = null;
    windowEl.classList.remove("is-dragging-v274");

    try {
      const rect = windowEl.getBoundingClientRect();
      localStorage.setItem(
        "crmClientPreviewPositionV274",
        JSON.stringify({ left: rect.left, top: rect.top })
      );
    } catch (ignore) {}

    try {
      dragHandle.releasePointerCapture?.(event.pointerId);
    } catch (ignore) {}
  };

  dragHandle?.addEventListener("pointerup", stopDrag);
  dragHandle?.addEventListener("pointercancel", stopDrag);

  try {
    const saved = JSON.parse(
      localStorage.getItem("crmClientPreviewPositionV274") || "null"
    );
    if (
      saved &&
      Number.isFinite(Number(saved.left)) &&
      Number.isFinite(Number(saved.top))
    ) {
      windowEl.style.left = `${Math.max(8, Number(saved.left))}px`;
      windowEl.style.top = `${Math.max(8, Number(saved.top))}px`;
      windowEl.style.right = "auto";
      windowEl.style.bottom = "auto";
    }
  } catch (ignore) {}

  try {
    const minimized =
      localStorage.getItem("crmClientPreviewMinimizedV274") === "1";
    windowEl.classList.toggle("is-minimized-v274", minimized);
    if (minimizeBtn) {
      minimizeBtn.textContent = minimized ? "▢" : "—";
      minimizeBtn.title = minimized ? "Rozwiń" : "Zwiń";
    }
  } catch (ignore) {}

  return windowEl;
}

let crmClientPreviewSelectedCategoryIdV272 = "";

function crmOpenClientPreviewV272() {
  const windowEl = crmEnsureClientPreviewModalV272();
  const categories = crmCategoriesFromPrices();

  if (!crmClientPreviewSelectedCategoryIdV272 && categories.length) {
    crmClientPreviewSelectedCategoryIdV272 = categories[0].id;
  }

  windowEl.hidden = false;
  crmRenderClientPreviewV272();
}

function crmCloseClientPreviewV272() {
  const windowEl = document.getElementById("crmClientPreviewBackdropV272");
  if (windowEl) windowEl.hidden = true;
}


function crmClampClientPreviewWindowV274() {
  const windowEl = document.getElementById("crmClientPreviewBackdropV272");
  if (!windowEl || windowEl.hidden) return;

  const rect = windowEl.getBoundingClientRect();
  const left = Math.max(
    8,
    Math.min(rect.left, Math.max(8, window.innerWidth - Math.min(rect.width, window.innerWidth) - 8))
  );
  const top = Math.max(
    8,
    Math.min(rect.top, Math.max(8, window.innerHeight - Math.min(rect.height, window.innerHeight) - 8))
  );

  windowEl.style.left = `${left}px`;
  windowEl.style.top = `${top}px`;
  windowEl.style.right = "auto";
  windowEl.style.bottom = "auto";
}

window.addEventListener("resize", () => {
  window.requestAnimationFrame(crmClampClientPreviewWindowV274);
});

function crmRenderClientPreviewV272() {
  const windowEl = document.getElementById("crmClientPreviewBackdropV272");
  if (!windowEl || windowEl.hidden) {
    crmEnsureClientPreviewControlsV272();
    return;
  }

  const categories = crmCategoriesFromPrices();
  const globalIcons = crmClientIconsGlobalVisibleV272();
  const catHost = document.getElementById("crmClientPreviewCategoriesV272");
  const serviceHost = document.getElementById("crmClientPreviewServicesV272");
  const iconState = document.getElementById("crmClientPreviewIconStateV272");
  const selectedLabel = document.getElementById("crmClientPreviewSelectedCategoryV272");

  if (iconState) {
    iconState.textContent = globalIcons
      ? "Ikony są globalnie włączone. Ustawienie każdej kategorii może je osobno ukryć."
      : "Ikony są globalnie wyłączone — klient zobaczy same nazwy.";
  }

  if (!categories.length) {
    if (catHost) catHost.innerHTML = '<div class="crm-client-preview-empty-v272">Brak kategorii.</div>';
    if (serviceHost) serviceHost.innerHTML = "";
    return;
  }

  if (!categories.some(c => c.id === crmClientPreviewSelectedCategoryIdV272)) {
    crmClientPreviewSelectedCategoryIdV272 = categories[0].id;
  }

  if (catHost) {
    catHost.innerHTML = categories.map((category, index) => {
      const showIcon = globalIcons && crmBoolV272(category.iconClientVisible, true);
      const selected = category.id === crmClientPreviewSelectedCategoryIdV272;
      return `
        <button type="button"
                class="crm-client-preview-cat-v272 ${selected ? "is-selected" : ""} ${showIcon ? "" : "no-icon"}"
                style="--client-cat-color:${crmEscapeHtmlV27(category.color || "#b05c75")}"
                data-category-id="${crmEscapeHtmlV27(category.id)}">
          ${showIcon ? `<img src="${crmEscapeHtmlV27(crmPriceIconSrcV27(category.icon))}" alt="">` : ""}
          <span>
            <strong>${crmEscapeHtmlV27(category.name)}</strong>
            <small>${crmEscapeHtmlV27(crmServiceCountTextV27(category.services.length))}</small>
          </span>
        </button>`;
    }).join("");

    catHost.querySelectorAll("[data-category-id]").forEach(button => {
      button.addEventListener("click", () => {
        crmClientPreviewSelectedCategoryIdV272 = button.dataset.categoryId;
        crmRenderClientPreviewV272();
      });
    });
  }

  const category = categories.find(c => c.id === crmClientPreviewSelectedCategoryIdV272) || categories[0];
  if (selectedLabel) {
    selectedLabel.textContent = category
      ? `Kategoria: ${category.name}`
      : "Wybierz kategorię powyżej.";
  }

  if (serviceHost) {
    if (!category?.services?.length) {
      serviceHost.innerHTML = '<div class="crm-client-preview-empty-v272">Brak usług w tej kategorii.</div>';
    } else {
      const ordered = [...category.services]
        .sort((a,b) => Number(a.service?.serviceOrder) - Number(b.service?.serviceOrder));

      serviceHost.innerHTML = ordered.map((item, index) => {
        const service = item.service || {};
        return `
          <div class="crm-client-preview-service-v272">
            <b>${crmEscapeHtmlV27(service.name || "")}</b>
            <span>${Number(service.price || 0)} zł</span>
            <small>${Number(service.duration || 0)} min</small>
          </div>`;
      }).join("");
    }
  }

  crmEnsureClientPreviewControlsV272();
}

function crmServiceStatusClassV27(status) {
  const n = crmNormTextV27(status);
  return /(opublik|aktywn|published|active)/.test(n) ? "is-published" : "is-draft";
}

renderServicesTable = function() {
  const tbody = document.getElementById("adminServicesTableBody");
  if (!tbody) return;

  crmPreparePriceStructure();

  const table = tbody.closest("table");
  if (table) {
    table.classList.add("crm-price-table-v27");
    const head = table.querySelector("thead");
    if (head) head.style.display = "none";
  }

  tbody.innerHTML = "";
  const categories = crmCategoriesFromPrices();

  if (!categories.length) {
    tbody.innerHTML = '<tr class="crm-price-empty-v27"><td>Brak kategorii i usług</td></tr>';
    crmEnsureClientPreviewControlsV272();
    crmRenderClientPreviewV272();
    return;
  }

  categories.forEach((category, categoryIndex) => {
    const row = document.createElement("tr");
    row.className = "crm-price-category-row crm-price-category-row-v27";

    const icon = category.icon || crmGuessCategoryIconV27(category.name);
    const firstVisitHtml =
      typeof crmFirstVisitCategoryControlHtmlV267 === "function"
        ? crmFirstVisitCategoryControlHtmlV267(category)
        : "";

    row.innerHTML = `
      <td>
        <article class="crm-price-card-v27" style="--crm-cat-color:${crmEscapeHtmlV27(category.color || "#b05c75")}">
          <header class="crm-price-card-head-v27">
            <span class="crm-price-stripe-v27" aria-hidden="true"></span>
            <img class="crm-price-category-icon-v27"
                 src="${crmEscapeHtmlV27(crmPriceIconSrcV27(icon))}"
                 alt="">
            <h3>${crmEscapeHtmlV27(category.name)}</h3>
            <span class="crm-price-count-v27">${crmEscapeHtmlV27(crmServiceCountTextV27(category.services.length))}</span>
            <div class="crm-price-head-actions-v27">
              <button type="button" class="crm-price-icon-btn-v27"
                      ${categoryIndex === 0 ? "disabled" : ""}
                      title="Przesuń kategorię wyżej"
                      aria-label="Przesuń kategorię wyżej"
                      onclick="crmMoveCategory('${category.id}',-1)">↑</button>
              <button type="button" class="crm-price-icon-btn-v27"
                      ${categoryIndex === categories.length - 1 ? "disabled" : ""}
                      title="Przesuń kategorię niżej"
                      aria-label="Przesuń kategorię niżej"
                      onclick="crmMoveCategory('${category.id}',1)">↓</button>
              <button type="button" class="crm-price-icon-btn-v27"
                      title="Edytuj kategorię"
                      aria-label="Edytuj kategorię"
                      onclick="crmOpenCategoryEditorV27('${category.id}')">⚙</button>
              <button type="button" class="crm-price-icon-btn-v27 crm-price-more-v27"
                      title="Ustawienia pierwszej wizyty"
                      aria-label="Ustawienia pierwszej wizyty"
                      onclick="crmToggleCategorySettingsV27('${category.id}')">⋮</button>
            </div>
          </header>

          <div class="crm-price-advanced-v27" id="crm-price-advanced-${category.id}" hidden>
            ${firstVisitHtml}
          </div>

          <div class="crm-price-services-v27">
            <div class="crm-price-service-head-v27">
              <span>Kolejność</span><span>Usługa</span><span>Cena</span>
              <span>Czas</span><span>Status</span><span>Akcje</span>
            </div>

            ${category.services.map((item, serviceIndex) => {
              const service = item.service || {};
              const status = service.status || "Szkic";
              return `
                <div class="crm-price-service-row-v27">
                  <div class="crm-price-order-v27">
                    <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                            ${serviceIndex === 0 ? "disabled" : ""}
                            title="Przesuń usługę wyżej"
                            onclick="crmMoveService('${service.serviceId}',-1)">↑</button>
                    <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                            ${serviceIndex === category.services.length - 1 ? "disabled" : ""}
                            title="Przesuń usługę niżej"
                            onclick="crmMoveService('${service.serviceId}',1)">↓</button>
                  </div>
                  <div class="crm-price-service-name-v27">${crmEscapeHtmlV27(service.name || "")}</div>
                  <div>${Number(service.price || 0)} zł</div>
                  <div>${Number(service.duration || 0)} min</div>
                  <div><span class="crm-price-status-v27 ${crmServiceStatusClassV27(status)}">${crmEscapeHtmlV27(status)}</span></div>
                  <div class="crm-price-row-actions-v27">
                    <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                            title="Edytuj usługę" aria-label="Edytuj usługę"
                            onclick="editService(${item.serviceIndex})">✎</button>
                    <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27 is-danger"
                            title="Usuń usługę" aria-label="Usuń usługę"
                            onclick="deleteService(${item.serviceIndex})">⌫</button>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </article>
      </td>`;

    tbody.appendChild(row);
  });

  crmEnsureClientPreviewControlsV272();
  crmRenderClientPreviewV272();
};

/* Zachowaj ikonę przy tworzeniu / przenoszeniu usługi. */
const crmSaveServiceModalDataBeforeV27 = saveServiceModalData;
saveServiceModalData = function() {
  const categoryName = String(document.getElementById("serviceCategory")?.value || "").trim();
  const categoryBefore = crmCategoriesFromPrices().find(item => item.name === categoryName);
  const index = parseInt(document.getElementById("editServiceIndex")?.value || "-1", 10);

  crmSaveServiceModalDataBeforeV27();

  if (index >= 0 && currentServices[index] && categoryBefore) {
    currentServices[index].categoryIcon = categoryBefore.icon || crmGuessCategoryIconV27(categoryBefore.name);
    currentServices[index].categoryIconClientVisible = crmBoolV272(categoryBefore.iconClientVisible, true);
    currentServices[index].clientIconsGlobalVisible = crmClientIconsGlobalVisibleV272();
  }

  crmPreparePriceStructure();
  renderServicesTable();
};

/* Nowa kategoria od razu dostaje sugerowaną ikonę. */
const crmAddNewCategoryFromModalBeforeV27 = addNewCategoryFromModal;
addNewCategoryFromModal = function() {
  const input = document.getElementById("categoryCreateName");
  const name = String(input?.value || "").trim();
  crmAddNewCategoryFromModalBeforeV27();

  if (name) {
    const category = crmCategoriesFromPrices().find(item => item.name === name);
    if (category) {
      const icon = crmGuessCategoryIconV27(name);
      currentServices
        .filter(service => service.categoryId === category.id)
        .forEach(service => {
          service.categoryIcon = icon;
          service.categoryIconClientVisible = true;
          service.clientIconsGlobalVisible = crmClientIconsGlobalVisibleV272();
        });
      renderServicesTable();
      crmSyncCategoryEditorV27();
    }
  }
};

/* Po zmianie nazwy sugeruj ikonę tylko wtedy, gdy kategoria nadal ma fallback. */
const crmRenameCategoryFromModalBeforeV27 = renameCategoryFromModal;
renameCategoryFromModal = function() {
  const select = document.getElementById("categorySelectForEdit");
  const nameInput = document.getElementById("categoryNewName");
  const oldName = String(select?.value || "").trim();
  const requestedNewName = String(nameInput?.value || "").trim();
  const oldCategory = crmCategoriesFromPrices().find(item => item.name === oldName);
  const oldIcon = oldCategory?.icon || CRM_PRICE_ICON_FALLBACK_V27;

  crmRenameCategoryFromModalBeforeV27();

  if (oldCategory && oldIcon === CRM_PRICE_ICON_FALLBACK_V27) {
    const newName = requestedNewName;
    const category = crmCategoriesFromPrices().find(item => item.id === oldCategory.id);
    if (category && newName) {
      const icon = crmGuessCategoryIconV27(newName);
      currentServices
        .filter(service => service.categoryId === category.id)
        .forEach(service => service.categoryIcon = icon);
    }
  }

  renderServicesTable();
  crmEnsureIconPickerV27();
};

/* KONIEC CENNIK PREMIUM V27 */



/* ==========================================================================
   CENNIK ADMIN V28 — DOM + BOOKSY W JEDNYM MIEJSCU
   Booksy jest podglądem; DOM pozostaje edytowalny przez istniejące akcje.
   Oba główne cenniki i kategorie Booksy są domyślnie zwinięte.
   ========================================================================== */
const CRM_ADMIN_BOOKSY_FALLBACK_V28 = [{"category":"Pielęgnacja dłoni","name":"Manicure hybrydowy jeden kolor","price":180.0,"duration":70.0},{"category":"Pielęgnacja dłoni","name":"Manicure klasyczny z malowaniem","price":120.0,"duration":40.0},{"category":"Pielęgnacja dłoni","name":"Manicure żelowy na naturalnej płytce","price":190.0,"duration":70.0},{"category":"Pielęgnacja dłoni","name":"Manicure hybrydowy + french","price":200.0,"duration":80.0},{"category":"Pielęgnacja dłoni","name":"Manicure hybrydowy jeden kolor + baza proteinowa","price":200.0,"duration":80.0},{"category":"Pielęgnacja dłoni","name":"Manicure hybrydowy z nadbudową bazą + french","price":220.0,"duration":90.0},{"category":"Pielęgnacja dłoni","name":"IBX Samodzielny zabieg + manicure zwykły","price":140.0,"duration":60.0},{"category":"Pielęgnacja dłoni","name":"IBX system + manicure hybrydowy","price":240.0,"duration":90.0},{"category":"Pielęgnacja dłoni","name":"IBX System + manicure hybrydowy z nadbudową bazą","price":260.0,"duration":90.0},{"category":"Pielęgnacja dłoni","name":"IBX system + manicure hybrydowy z nadbudową bazą + french","price":280.0,"duration":105.0},{"category":"Pielęgnacja dłoni","name":"Zabieg SPA dla dłoni + manicure","price":150.0,"duration":70.0},{"category":"Pielęgnacja dłoni","name":"Masaż dłoni","price":50.0,"duration":15.0},{"category":"Pielęgnacja stóp","name":"Pedicure hybrydowy lub zwykły lakier","price":200.0,"duration":60.0},{"category":"Pielęgnacja stóp","name":"Pedicure klasyczny z odżywką","price":180.0,"duration":50.0},{"category":"Pielęgnacja stóp","name":"Masaż stóp","price":50.0,"duration":15.0},{"category":"Pielęgnacja stóp","name":"Pedicure - zabieg SPA","price":250.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Laminacja brwi/laminacja rzęs","price":270.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Laminacja brwi + henna + regulacja","price":160.0,"duration":40.0},{"category":"Kosmetyka twarzy zabiegi","name":"Lifting rzęs + henna + botox","price":150.0,"duration":50.0},{"category":"Kosmetyka twarzy zabiegi","name":"Lifting rzęs + henna + laminacja brwi z henną","price":280.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Henna brwi i rzęs z regulacją","price":100.0,"duration":30.0},{"category":"Kosmetyka twarzy zabiegi","name":"Henna brwi z regulacja","price":80.0,"duration":20.0},{"category":"Kosmetyka twarzy zabiegi","name":"Henna rzęs","price":50.0,"duration":20.0},{"category":"Kosmetyka twarzy zabiegi","name":"Regulacja brwi wosk lub pęseta","price":30.0,"duration":15.0},{"category":"Kosmetyka twarzy zabiegi","name":"Architektura brwi + koloryzacja henną","price":120.0,"duration":45.0},{"category":"Depilacja woskiem","name":"Depilacja woskiem - wąsik","price":30.0,"duration":15.0},{"category":"Depilacja woskiem","name":"Depilacja woskiem - broda","price":30.0,"duration":15.0},{"category":"Depilacja woskiem","name":"Depilacja woskiem - policzki","price":30.0,"duration":15.0},{"category":"Depilacja woskiem","name":"Depilacja woskiem - szyja","price":40.0,"duration":15.0},{"category":"Depilacja woskiem","name":"Depilacja woskiem - cała twarz","price":100.0,"duration":40.0},{"category":"Kosmetyka twarzy zabiegi","name":"Masaż twarzy (autorski zabieg pielęgnacyjny)","price":180.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Masaż twarzy + peeling + maska","price":250.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny + ampułka + maska","price":180.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny + kwas migdałowy + maska","price":250.0,"duration":70.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny + sonoforeza + maska","price":250.0,"duration":80.0},{"category":"Kosmetyka twarzy zabiegi","name":"Sonoforeza + ampułka + maska","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem migdałowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem glikolowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem mlekowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem pirogronowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem azelainowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z kwasem salicylowym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling chemiczny BioRePeel Cl3","price":280.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling chemiczny BioRePeel Cl3 + mezoterapia mikroigłowa","price":500.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg bankietowy PRX-T33","price":350.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie manualne","price":250.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe 6-etapowe","price":300.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe 6-etapowe + kwas","price":350.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Infuzja tlenowa","price":300.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz","price":300.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz+szyja+dekolt","price":350.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg z witaminą C","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg intensywnie nawilżający","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg przeciwzmarszczkowy","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg dla cery naczyniowej","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg dla cery trądzikowej","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg przeciw przebarwieniom","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg dla cery z trądzikiem różowatym","price":200.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Retix C Retinol + Witamina C","price":300.0,"duration":45.0},{"category":"Kosmetyka twarzy zabiegi","name":"Kwasy PRX-T33","price":300.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Retix C Eye","price":200.0,"duration":45.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + egzosomy ASCE+","price":800.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz, szyja, dekolt + egzosomy ASCE+","price":900.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling PRX-T33 + mezoterapia mikroigłowa twarz","price":550.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + kwas migdałowy","price":450.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling chemiczny BioRePeel Cl3 + mikronakłuwanie","price":450.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Eksfoliacja kwasami","price":250.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg odmładzający z retinolem Retix C","price":300.0,"duration":45.0},{"category":"Kosmetyka twarzy zabiegi","name":"PQ Age Evolution Plus","price":300.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa","price":300.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Infuzja tlenowa - twarz","price":250.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Infuzja tlenowa - twarz + szyja + dekolt","price":300.0,"duration":75.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny","price":100.0,"duration":30.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny z maską","price":150.0,"duration":45.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling kawitacyjny z ampułką i maską","price":180.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg pielęgnacyjny twarzy","price":200.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Masaż twarzy","price":100.0,"duration":45.0},{"category":"Kosmetyka twarzy zabiegi","name":"Masaż twarzy + maska algowa","price":150.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Masaż twarzy + peeling kawitacyjny + maska algowa","price":200.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe","price":250.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe + kwas","price":300.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe + masaż twarzy","price":300.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Oczyszczanie wodorowe + infuzja tlenowa","price":400.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + szyja","price":350.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + szyja + dekolt","price":400.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + peeling kwasowy","price":400.0,"duration":120.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling BioRePeel Cl3","price":280.0,"duration":60.0},{"category":"Kosmetyka twarzy zabiegi","name":"Peeling BioRePeel Cl3 + mezoterapia mikroigłowa","price":500.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Zabieg bankietowy PRX-T33 + mezoterapia mikroigłowa","price":550.0,"duration":90.0},{"category":"Kosmetyka twarzy zabiegi","name":"Mezoterapia mikroigłowa twarz + kwas pirogronowy","price":450.0,"duration":90.0}];

function crmAdminEscapeV28(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}


let crmAdminBooksyPricesV29 = [];
let crmBooksyLoadedV29 = false;
let crmBooksyDirtyV29 = false;
let crmBooksyBackendStateV29 = "loading";

function crmBooksyNormV29(value){
    return String(value || "")
      .trim()
      .toLocaleLowerCase("pl-PL")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ");
}

function crmBooksyLocalIdV29(category,name){
    const text=`${crmBooksyNormV29(category)}|${crmBooksyNormV29(name)}`;
    let hash=2166136261;
    for(let i=0;i<text.length;i++){
        hash^=text.charCodeAt(i);
        hash=Math.imul(hash,16777619);
    }
    return `BKS-${(hash>>>0).toString(16).padStart(8,"0")}`;
}

function crmBooksyNormalizeItemsV29(source){
    const rows=Array.isArray(source)?source:[];
    const catOrders=new Map();
    const catCounts=new Map();
    let nextCat=1;
    const out=[];
    const seen=new Set();

    rows.forEach((raw,index)=>{
        const category=String(raw?.category||"Inne").trim()||"Inne";
        const name=String(raw?.name||"").trim();
        if(!name) return;

        if(!catOrders.has(category)){
            const explicit=Number(raw?.categoryOrder)||0;
            catOrders.set(category,explicit>0?explicit:nextCat++);
        }
        const fallbackService=(catCounts.get(category)||0)+1;
        catCounts.set(category,fallbackService);

        const adminId=String(raw?.adminId||crmBooksyLocalIdV29(category,name)).trim();
        if(seen.has(adminId)) return;
        seen.add(adminId);

        out.push({
            adminId,
            category,
            name,
            price: raw?.price==="" ? "" : (Number(raw?.price)||0),
            duration: Math.max(0,Number(raw?.duration)||0),
            categoryOrder: Number(raw?.categoryOrder)||catOrders.get(category)||1,
            serviceOrder: Number(raw?.serviceOrder)||fallbackService,
            icon: String(raw?.icon||crmGuessCategoryIconV27(category)||CRM_PRICE_ICON_FALLBACK_V27)
        });
    });

    return out;
}

function crmBooksyCategoriesV29(){
    const map=new Map();
    crmAdminBooksyPricesV29.forEach(service=>{
        const key=service.category||"Inne";
        if(!map.has(key)){
            map.set(key,{
                name:key,
                order:Number(service.categoryOrder)||9999,
                icon:service.icon||crmGuessCategoryIconV27(key),
                services:[]
            });
        }
        const cat=map.get(key);
        cat.order=Math.min(cat.order,Number(service.categoryOrder)||cat.order);
        cat.services.push(service);
    });
    return [...map.values()]
      .sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,"pl"))
      .map(cat=>{
          cat.services.sort((a,b)=>(Number(a.serviceOrder)||9999)-(Number(b.serviceOrder)||9999)||a.name.localeCompare(b.name,"pl"));
          return cat;
      });
}

function crmBooksySetDirtyV29(value=true){
    crmBooksyDirtyV29=Boolean(value);
    const state=document.getElementById("crmBooksySaveStateV29");
    if(state){
        if(crmBooksyDirtyV29){
            state.textContent="Niezapisane zmiany";
            state.className="crm-booksy-save-state-v29 is-dirty";
        }else if(crmBooksyBackendStateV29==="error"){
            state.textContent="Brak połączenia z edytorem";
            state.className="crm-booksy-save-state-v29 is-error";
        }else{
            state.textContent="Zapisano";
            state.className="crm-booksy-save-state-v29 is-saved";
        }
    }
}

function crmBooksyRenumberV29(){
    const cats=crmBooksyCategoriesV29();
    cats.forEach((cat,catIndex)=>{
        cat.services.forEach((service,serviceIndex)=>{
            service.categoryOrder=catIndex+1;
            service.serviceOrder=serviceIndex+1;
        });
    });
}

async function crmLoadBooksyPricesV29(){
    crmBooksyBackendStateV29="loading";
    try{
        const separator=String(APPS_SCRIPT_URL||"").includes("?")?"&":"?";
        const url=`${APPS_SCRIPT_URL}${separator}getBooksyPricesAdmin=true&_booksy=${Date.now()}`;
        const response=await fetch(url,{method:"GET",cache:"no-store"});
        const text=await response.text();
        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        const data=JSON.parse(text);
        if(!data || data.success!==true || !Array.isArray(data.items)){
            throw new Error(data?.error||"Brak danych Cennika Booksy");
        }
        crmAdminBooksyPricesV29=crmBooksyNormalizeItemsV29(data.items);
        crmBooksyLoadedV29=true;
        crmBooksyBackendStateV29="ready";
        crmBooksySetDirtyV29(false);
        crmRenderAdminBooksyPriceListV28();
        return crmAdminBooksyPricesV29;
    }catch(error){
        console.warn("Cennik Booksy: backend edytora niedostępny, używam podglądu awaryjnego.",error);
        if(!crmBooksyLoadedV29){
            crmAdminBooksyPricesV29=crmBooksyNormalizeItemsV29(CRM_ADMIN_BOOKSY_FALLBACK_V28);
        }
        crmBooksyBackendStateV29="error";
        crmRenderAdminBooksyPriceListV28();
        crmBooksySetDirtyV29(false);
        throw error;
    }
}

function crmBooksyEditorToolbarV29(){
    return `
      <div class="crm-booksy-editor-toolbar-v29">
        <div class="crm-booksy-editor-title-v29">
          <strong>Edytor Booksy</strong>
          <small>Oddzielny od Cennika DOM — zmiany zapisują się wyłącznie do „Cennik Booksy”.</small>
        </div>
        <div class="crm-booksy-editor-actions-v29">
          <button type="button" class="btn-secondary" onclick="crmBooksyOpenAddServiceV29()">➕ Usługa Booksy</button>
          <button type="button" class="btn-secondary" onclick="crmBooksyAddCategoryV29()">🏷️ Kategoria Booksy</button>
          <button type="button" class="btn-secondary" onclick="crmLoadBooksyPricesV29().catch(()=>{})">↻ Odśwież</button>
          <button type="button" class="btn-primary" id="crmBooksySaveButtonV29" onclick="crmBooksySaveAllV29()">💾 Zapisz Booksy</button>
        </div>
        <span id="crmBooksySaveStateV29" class="crm-booksy-save-state-v29 ${crmBooksyDirtyV29?'is-dirty':crmBooksyBackendStateV29==='error'?'is-error':'is-saved'}">
          ${crmBooksyDirtyV29?'Niezapisane zmiany':crmBooksyBackendStateV29==='error'?'Brak połączenia z edytorem':'Zapisano'}
        </span>
      </div>`;
}

function crmRenderAdminBooksyPriceListV28(){
    const host=document.getElementById("crmAdminBooksyPriceListV28");
    if(!host) return;

    if(!crmAdminBooksyPricesV29.length && !crmBooksyLoadedV29){
        crmAdminBooksyPricesV29=crmBooksyNormalizeItemsV29(CRM_ADMIN_BOOKSY_FALLBACK_V28);
    }

    const cats=crmBooksyCategoriesV29();
    const count=document.getElementById("crmAdminBooksyPriceCountV28");
    if(count) count.textContent=`${crmAdminBooksyPricesV29.length} usług`;

    const categoriesHtml=cats.map((category,catIndex)=>`
      <details class="crm-booksy-category-v28" data-booksy-category="${crmAdminEscapeV28(category.name)}">
        <summary>
          <span class="crm-booksy-summary-main-v289">
            <img class="crm-booksy-category-icon-v289"
                 src="${crmAdminEscapeV28(crmPriceIconSrcV27(category.icon||crmGuessCategoryIconV27(category.name)))}"
                 alt="">
            <strong>${crmAdminEscapeV28(category.name)}</strong>
          </span>
          <span class="crm-booksy-category-meta-v29">
            <em>${category.services.length} usług</em>
            <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="cat-up"
                    data-category="${encodeURIComponent(category.name)}" ${catIndex===0?"disabled":""}>↑</button>
            <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="cat-down"
                    data-category="${encodeURIComponent(category.name)}" ${catIndex===cats.length-1?"disabled":""}>↓</button>
            <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="cat-edit"
                    data-category="${encodeURIComponent(category.name)}" title="Edytuj kategorię">✎</button>
            <button type="button" class="crm-booksy-mini-btn-v29 is-danger" data-booksy-action="cat-delete"
                    data-category="${encodeURIComponent(category.name)}" title="Usuń kategorię">×</button>
          </span>
        </summary>
        <div class="crm-booksy-table-wrap-v289">
          <table class="crm-booksy-table-v28 crm-booksy-editor-table-v29">
            <thead><tr><th>Kolejność</th><th>Usługa</th><th>Cena</th><th>Czas</th><th>Akcje</th></tr></thead>
            <tbody>${category.services.map((service,serviceIndex)=>`<tr>
              <td class="crm-booksy-order-v29">
                <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="srv-up"
                        data-id="${crmAdminEscapeV28(service.adminId)}" ${serviceIndex===0?"disabled":""}>↑</button>
                <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="srv-down"
                        data-id="${crmAdminEscapeV28(service.adminId)}" ${serviceIndex===category.services.length-1?"disabled":""}>↓</button>
              </td>
              <td>${crmAdminEscapeV28(service.name)}</td>
              <td>${service.price!==""?`${Number(service.price)} zł`:"—"}</td>
              <td>${Number(service.duration)>0?`${Number(service.duration)} min`:"—"}</td>
              <td class="crm-booksy-row-actions-v29">
                <button type="button" class="crm-booksy-mini-btn-v29" data-booksy-action="srv-edit"
                        data-id="${crmAdminEscapeV28(service.adminId)}" title="Edytuj">✎</button>
                <button type="button" class="crm-booksy-mini-btn-v29 is-danger" data-booksy-action="srv-delete"
                        data-id="${crmAdminEscapeV28(service.adminId)}" title="Usuń">×</button>
              </td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </details>`).join("");

    host.innerHTML=`
      ${crmBooksyEditorToolbarV29()}
      <div id="crmBooksyCategoryColumnsV29">${categoriesHtml || '<div class="crm-booksy-empty-v29">Brak usług Booksy.</div>'}</div>
    `;
}

function crmBooksyFindServiceV29(adminId){
    return crmAdminBooksyPricesV29.find(item=>String(item.adminId)===String(adminId));
}

function crmBooksyMoveCategoryV29(categoryName,delta){
    const cats=crmBooksyCategoriesV29();
    const index=cats.findIndex(cat=>cat.name===categoryName);
    const target=index+Number(delta||0);
    if(index<0 || target<0 || target>=cats.length) return;
    const a=cats[index], b=cats[target];
    crmAdminBooksyPricesV29.forEach(item=>{
        if(item.category===a.name) item.categoryOrder=b.order;
        else if(item.category===b.name) item.categoryOrder=a.order;
    });
    crmBooksyRenumberV29();
    crmBooksySetDirtyV29(true);
    crmRenderAdminBooksyPriceListV28();
}

function crmBooksyMoveServiceV29(adminId,delta){
    const service=crmBooksyFindServiceV29(adminId);
    if(!service) return;
    const list=crmBooksyCategoriesV29().find(cat=>cat.name===service.category)?.services||[];
    const index=list.findIndex(item=>item.adminId===service.adminId);
    const target=index+Number(delta||0);
    if(index<0 || target<0 || target>=list.length) return;
    const other=list[target];
    const old=service.serviceOrder;
    service.serviceOrder=other.serviceOrder;
    other.serviceOrder=old;
    crmBooksyRenumberV29();
    crmBooksySetDirtyV29(true);
    crmRenderAdminBooksyPriceListV28();
}

function crmBooksyRenameCategoryV29(categoryName){
    const next=window.prompt("Nowa nazwa kategorii Booksy:",categoryName);
    if(next===null) return;
    const clean=String(next||"").trim();
    if(!clean || clean===categoryName) return;
    if(crmBooksyCategoriesV29().some(cat=>crmBooksyNormV29(cat.name)===crmBooksyNormV29(clean))){
        return alert("Taka kategoria Booksy już istnieje.");
    }
    crmAdminBooksyPricesV29.forEach(item=>{
        if(item.category===categoryName) item.category=clean;
    });
    crmBooksySetDirtyV29(true);
    crmRenderAdminBooksyPriceListV28();
}

function crmBooksyDeleteCategoryV29(categoryName){
    const count=crmAdminBooksyPricesV29.filter(item=>item.category===categoryName).length;
    if(!window.confirm(`Usunąć kategorię Booksy „${categoryName}” i ${count} usług?`)) return;
    crmAdminBooksyPricesV29=crmAdminBooksyPricesV29.filter(item=>item.category!==categoryName);
    crmBooksyRenumberV29();
    crmBooksySetDirtyV29(true);
    crmRenderAdminBooksyPriceListV28();
}

function crmBooksyDeleteServiceV29(adminId){
    const service=crmBooksyFindServiceV29(adminId);
    if(!service) return;
    if(!window.confirm(`Usunąć z Cennika Booksy: „${service.name}”?`)) return;
    crmAdminBooksyPricesV29=crmAdminBooksyPricesV29.filter(item=>item.adminId!==adminId);
    crmBooksyRenumberV29();
    crmBooksySetDirtyV29(true);
    crmRenderAdminBooksyPriceListV28();
}

function crmEnsureBooksyServiceModalV29(){
    let modal=document.getElementById("crmBooksyServiceModalV29");
    if(modal) return modal;

    modal=document.createElement("div");
    modal.id="crmBooksyServiceModalV29";
    modal.className="crm-booksy-modal-backdrop-v29";
    modal.hidden=true;
    modal.innerHTML=`
      <div class="crm-booksy-modal-v29" role="dialog" aria-modal="true">
        <div class="crm-booksy-modal-head-v29">
          <strong id="crmBooksyModalTitleV29">Usługa Booksy</strong>
          <button type="button" class="crm-booksy-mini-btn-v29" onclick="crmBooksyCloseServiceModalV29()">×</button>
        </div>
        <input type="hidden" id="crmBooksyEditIdV29">
        <label>Kategoria Booksy
          <input id="crmBooksyServiceCategoryV29" list="crmBooksyCategoryListV29" autocomplete="off">
          <datalist id="crmBooksyCategoryListV29"></datalist>
        </label>
        <label>Nazwa usługi
          <input id="crmBooksyServiceNameV29" autocomplete="off">
        </label>
        <div class="crm-booksy-modal-grid-v29">
          <label>Cena (zł)
            <input id="crmBooksyServicePriceV29" type="number" min="0" step="1">
          </label>
          <label>Czas (min)
            <input id="crmBooksyServiceDurationV29" type="number" min="0" step="5">
          </label>
        </div>
        <div class="crm-booksy-modal-actions-v29">
          <button type="button" class="btn-secondary" onclick="crmBooksyCloseServiceModalV29()">Anuluj</button>
          <button type="button" class="btn-primary" onclick="crmBooksySaveServiceModalV29()">Zapisz usługę Booksy</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
}

function crmBooksyFillCategoryListV29(){
    const list=document.getElementById("crmBooksyCategoryListV29");
    if(!list) return;
    list.innerHTML=crmBooksyCategoriesV29()
      .map(cat=>`<option value="${crmAdminEscapeV28(cat.name)}"></option>`)
      .join("");
}

function crmBooksyOpenAddServiceV29(categoryName=""){
    const modal=crmEnsureBooksyServiceModalV29();
    document.getElementById("crmBooksyModalTitleV29").textContent="Dodaj usługę Booksy";
    document.getElementById("crmBooksyEditIdV29").value="";
    document.getElementById("crmBooksyServiceCategoryV29").value=categoryName||"";
    document.getElementById("crmBooksyServiceNameV29").value="";
    document.getElementById("crmBooksyServicePriceV29").value="";
    document.getElementById("crmBooksyServiceDurationV29").value="60";
    crmBooksyFillCategoryListV29();
    modal.hidden=false;
}

function crmBooksyOpenEditServiceV29(adminId){
    const service=crmBooksyFindServiceV29(adminId);
    if(!service) return;
    const modal=crmEnsureBooksyServiceModalV29();
    document.getElementById("crmBooksyModalTitleV29").textContent="Edytuj usługę Booksy";
    document.getElementById("crmBooksyEditIdV29").value=service.adminId;
    document.getElementById("crmBooksyServiceCategoryV29").value=service.category;
    document.getElementById("crmBooksyServiceNameV29").value=service.name;
    document.getElementById("crmBooksyServicePriceV29").value=service.price;
    document.getElementById("crmBooksyServiceDurationV29").value=service.duration;
    crmBooksyFillCategoryListV29();
    modal.hidden=false;
}

function crmBooksyCloseServiceModalV29(){
    const modal=document.getElementById("crmBooksyServiceModalV29");
    if(modal) modal.hidden=true;
}

function crmBooksySaveServiceModalV29(){
    const adminId=String(document.getElementById("crmBooksyEditIdV29")?.value||"");
    const category=String(document.getElementById("crmBooksyServiceCategoryV29")?.value||"").trim();
    const name=String(document.getElementById("crmBooksyServiceNameV29")?.value||"").trim();
    const priceValue=String(document.getElementById("crmBooksyServicePriceV29")?.value??"").trim();
    const duration=Math.max(0,Number(document.getElementById("crmBooksyServiceDurationV29")?.value)||0);

    if(!category || !name) return alert("Wpisz kategorię i nazwę usługi Booksy.");

    const duplicate=crmAdminBooksyPricesV29.find(item=>
        item.adminId!==adminId &&
        crmBooksyNormV29(item.category)===crmBooksyNormV29(category) &&
        crmBooksyNormV29(item.name)===crmBooksyNormV29(name)
    );
    if(duplicate) return alert("Taka usługa już istnieje w Cenniku Booksy.");

    const existing=adminId?crmBooksyFindServiceV29(adminId):null;
    const categoryExisting=crmBooksyCategoriesV29().find(cat=>crmBooksyNormV29(cat.name)===crmBooksyNormV29(category));
    const categoryOrder=categoryExisting?.order || (crmBooksyCategoriesV29().length+1);
    const maxServiceOrder=Math.max(0,...crmAdminBooksyPricesV29.filter(item=>crmBooksyNormV29(item.category)===crmBooksyNormV29(category)).map(item=>Number(item.serviceOrder)||0));

    const data={
        adminId: existing?.adminId || crmBooksyLocalIdV29(category,`${name}|${Date.now()}`),
        category,
        name,
        price: priceValue===""?"":(Number(priceValue)||0),
        duration,
        categoryOrder,
        serviceOrder: existing && crmBooksyNormV29(existing.category)===crmBooksyNormV29(category)
            ? existing.serviceOrder
            : maxServiceOrder+1,
        icon: categoryExisting?.icon || existing?.icon || crmGuessCategoryIconV27(category)
    };

    if(existing){
        Object.assign(existing,data);
    }else{
        crmAdminBooksyPricesV29.push(data);
    }

    crmBooksyRenumberV29();
    crmBooksySetDirtyV29(true);
    crmBooksyCloseServiceModalV29();
    crmRenderAdminBooksyPriceListV28();
}

function crmBooksyAddCategoryV29(){
    const name=window.prompt("Nazwa nowej kategorii Booksy:");
    if(name===null) return;
    const clean=String(name||"").trim();
    if(!clean) return;
    if(crmBooksyCategoriesV29().some(cat=>crmBooksyNormV29(cat.name)===crmBooksyNormV29(clean))){
        return alert("Taka kategoria Booksy już istnieje.");
    }
    crmBooksyOpenAddServiceV29(clean);
}

async function crmBooksySaveAllV29(){
    if(crmBooksyBackendStateV29==="error"){
        return alert("Backend edytora Booksy nie jest jeszcze aktywny. Wgraj wersję Apps Script V4.7.7 i wdroż ją jako nową wersję aplikacji TEST.");
    }

    const button=document.getElementById("crmBooksySaveButtonV29");
    if(button) button.disabled=true;
    try{
        crmBooksyRenumberV29();
        const response=await fetch(APPS_SCRIPT_URL,{
            method:"POST",
            headers:{"Content-Type":"text/plain;charset=utf-8"},
            body:JSON.stringify({
                action:"saveBooksyPricesAdminV477",
                prices:crmAdminBooksyPricesV29.map(item=>({
                    adminId:item.adminId,
                    category:item.category,
                    name:item.name,
                    price:item.price,
                    duration:item.duration,
                    categoryOrder:item.categoryOrder,
                    serviceOrder:item.serviceOrder,
                    icon:item.icon||CRM_PRICE_ICON_FALLBACK_V27
                }))
            })
        });
        const text=await response.text();
        const data=JSON.parse(text);
        if(!data || data.success!==true) throw new Error(data?.error||"Nie udało się zapisać Cennika Booksy");
        crmBooksyBackendStateV29="ready";
        crmBooksySetDirtyV29(false);
        await crmLoadBooksyPricesV29();
        alert(`Cennik Booksy zapisany. Aktywne usługi: ${data.activeCount ?? crmAdminBooksyPricesV29.length}.`);
    }catch(error){
        console.error(error);
        alert(`Błąd zapisu Cennika Booksy: ${error.message||error}`);
    }finally{
        if(button) button.disabled=false;
    }
}

function crmInstallBooksyEditorEventsV29(){
    if(window.crmBooksyEditorEventsInstalledV29) return;
    window.crmBooksyEditorEventsInstalledV29=true;

    document.addEventListener("click",event=>{
        const button=event.target.closest("[data-booksy-action]");
        if(!button) return;
        event.preventDefault();
        event.stopPropagation();

        const action=button.dataset.booksyAction;
        const category=decodeURIComponent(button.dataset.category||"");
        const id=button.dataset.id||"";

        if(action==="cat-up") crmBooksyMoveCategoryV29(category,-1);
        else if(action==="cat-down") crmBooksyMoveCategoryV29(category,1);
        else if(action==="cat-edit") crmBooksyRenameCategoryV29(category);
        else if(action==="cat-delete") crmBooksyDeleteCategoryV29(category);
        else if(action==="srv-up") crmBooksyMoveServiceV29(id,-1);
        else if(action==="srv-down") crmBooksyMoveServiceV29(id,1);
        else if(action==="srv-edit") crmBooksyOpenEditServiceV29(id);
        else if(action==="srv-delete") crmBooksyDeleteServiceV29(id);
    });
}

let crmDomPriceLoadPromiseV284=null;
let crmDomPriceLoadStateV284='idle';

function crmAdminSyncDomPriceCountV28(){
    const el=document.getElementById('crmAdminDomPriceCountV28');
    if(!el) return;
    const count=Array.isArray(currentServices)?currentServices.length:0;

    if(count>0){
        crmDomPriceLoadStateV284='loaded';
        el.textContent=`${count} usług`;
        return;
    }

    el.textContent=crmDomPriceLoadStateV284==='error'?'Błąd ładowania':'Ładowanie…';
}

async function crmLoadDomPricesSingleV284(){
    if(Array.isArray(currentServices) && currentServices.length){
        crmDomPriceLoadStateV284='loaded';
        crmAdminSyncDomPriceCountV28();
        return currentServices;
    }

    if(crmDomPriceLoadPromiseV284) return crmDomPriceLoadPromiseV284;

    crmDomPriceLoadStateV284='loading';
    crmAdminSyncDomPriceCountV28();

    crmDomPriceLoadPromiseV284=(async()=>{
        const controller=typeof AbortController!=='undefined'?new AbortController():null;
        const timer=window.setTimeout(()=>{
            try{controller?.abort();}catch(ignore){}
        },30000);

        try{
            const separator=String(APPS_SCRIPT_URL||'').includes('?')?'&':'?';
            const url=`${APPS_SCRIPT_URL}${separator}getPrices=true&_dom=${Date.now()}`;
            const response=await fetch(url,{
                method:'GET',
                cache:'no-store',
                signal:controller?controller.signal:undefined
            });
            const text=await response.text();
            if(!response.ok) throw new Error(`HTTP ${response.status}`);
            const data=JSON.parse(text);
            if(!Array.isArray(data)) throw new Error('Cennik DOM nie zwrócił listy usług');

            currentServices=data;
            crmDomPriceLoadStateV284='loaded';
            if(typeof renderServicesTable==='function') renderServicesTable();
            crmAdminSyncDomPriceCountV28();
            return data;
        }catch(error){
            crmDomPriceLoadStateV284='error';
            crmAdminSyncDomPriceCountV28();
            console.warn('Cennik DOM: nie udało się pobrać danych:',error);
            throw error;
        }finally{
            window.clearTimeout(timer);
            crmDomPriceLoadPromiseV284=null;
        }
    })();

    return crmDomPriceLoadPromiseV284;
}

function crmInstallDomCategoryCollapseV284(){
    if(document.getElementById('crm-cat-collapse-style-v284')) return;

    const style=document.createElement('style');
    style.id='crm-cat-collapse-style-v284';
    style.textContent=`
      #crmAdminDomPriceGroupV28 .crm-price-card-v27 .crm-price-services-v27,
      #crmAdminDomPriceGroupV28 .crm-price-card-v27 .crm-price-advanced-v27{display:none}
      #crmAdminDomPriceGroupV28 .crm-price-card-v27.crm-cat-open-v284 .crm-price-services-v27{display:block}
      #crmAdminDomPriceGroupV28 .crm-price-card-v27.crm-cat-open-v284 .crm-price-advanced-v27:not([hidden]){display:block}
      #crmAdminDomPriceGroupV28 .crm-price-card-head-v27{cursor:pointer}

      /* V28.7 — niezależna wysokość kart DOM.
         CSS columns daje efekt masonry: rozwinięcie Manicure nie rozciąga Pedicure,
         a Dodatki układają się bezpośrednio pod kartą w lewej kolumnie. */
      #crmAdminDomPriceGroupV28 .crm-price-table-v27 tbody{
        display:block !important;
        column-count:2;
        column-gap:12px;
      }
      #crmAdminDomPriceGroupV28 .crm-price-category-row-v27{
        display:inline-table !important;
        width:100% !important;
        margin:0 0 12px 0 !important;
        break-inside:avoid;
        -webkit-column-break-inside:avoid;
        page-break-inside:avoid;
        vertical-align:top;
      }
      #crmAdminDomPriceGroupV28 .crm-price-category-row-v27 > td{
        display:block;
        width:100%;
        padding:0;
      }
      #crmAdminDomPriceGroupV28 .crm-price-card-v27{
        height:auto !important;
        min-height:0 !important;
      }
      /* V28.9 — dwie kolumny także na laptopie 1366 px.
         Zamiast przełączać na 1 kolumnę, ściskamy kontrolki i pilnujemy,
         żeby zawartość kart nigdy nie wychodziła do sąsiedniej kolumny. */
      #crmAdminDomPriceGroupV28 .crm-price-table-v27 tbody{
        column-count:2;
        column-gap:12px;
      }
      #crmAdminDomPriceGroupV28 .crm-price-category-row-v27,
      #crmAdminDomPriceGroupV28 .crm-price-category-row-v27 > td,
      #crmAdminDomPriceGroupV28 .crm-price-card-v27,
      #crmAdminDomPriceGroupV28 .crm-price-services-v27{
        min-width:0 !important;
        max-width:100% !important;
        box-sizing:border-box !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-card-v27{
        overflow:hidden !important;
      }

      /* Kompaktowy układ wierszy DOM — mieści 6 kolumn w połowie ekranu. */
      #crmAdminDomPriceGroupV28 .crm-price-service-head-v27,
      #crmAdminDomPriceGroupV28 .crm-price-service-row-v27{
        display:grid !important;
        grid-template-columns:52px minmax(0,1fr) 48px 52px 88px 58px !important;
        gap:6px !important;
        align-items:center !important;
        min-width:0 !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-service-row-v27 > *,
      #crmAdminDomPriceGroupV28 .crm-price-service-head-v27 > *{
        min-width:0 !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-service-name-v27{
        overflow-wrap:anywhere;
        line-height:1.22;
      }
      #crmAdminDomPriceGroupV28 .crm-price-order-v27,
      #crmAdminDomPriceGroupV28 .crm-price-row-actions-v27{
        display:flex !important;
        gap:3px !important;
        flex-wrap:nowrap !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-icon-btn-v27{
        width:28px !important;
        min-width:28px !important;
        height:28px !important;
        min-height:28px !important;
        padding:0 !important;
        font-size:12px !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-row-btn-v27{
        width:25px !important;
        min-width:25px !important;
        height:25px !important;
        min-height:25px !important;
        font-size:11px !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-status-v27{
        padding:4px 6px !important;
        font-size:10px !important;
        white-space:nowrap;
      }
      #crmAdminDomPriceGroupV28 .crm-price-card-head-v27{
        gap:7px !important;
        min-width:0 !important;
      }
      #crmAdminDomPriceGroupV28 .crm-price-card-head-v27 h3{
        min-width:0 !important;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      #crmAdminDomPriceGroupV28 .crm-price-head-actions-v27{
        gap:3px !important;
        flex:0 0 auto;
      }

      /* Booksy: dwie niezależne kolumny + ikony kategorii. */
      #crmAdminBooksyPriceListV28{
        display:block !important;
        column-count:auto !important;
      }
      #crmBooksyCategoryColumnsV29{
        display:block !important;
        column-count:2;
        column-gap:12px;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-category-v28{
        display:inline-block;
        width:100%;
        margin:0 0 12px 0 !important;
        break-inside:avoid;
        -webkit-column-break-inside:avoid;
        vertical-align:top;
        box-sizing:border-box;
        overflow:hidden;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-category-v28 > summary{
        min-width:0;
        align-items:center;
        padding:10px 12px;
      }
      .crm-booksy-summary-main-v289{
        display:flex;
        align-items:center;
        gap:9px;
        min-width:0;
      }
      .crm-booksy-summary-main-v289 strong{
        min-width:0;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .crm-booksy-category-icon-v289{
        width:30px;
        height:30px;
        object-fit:contain;
        flex:0 0 30px;
      }
      .crm-booksy-table-wrap-v289{
        overflow-x:auto;
        max-width:100%;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-table-v28{
        width:100%;
        min-width:0 !important;
        table-layout:fixed;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 th:nth-child(1),
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 td:nth-child(1){
        width:58px;white-space:nowrap;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 th:nth-child(2),
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 td:nth-child(2){
        width:auto;overflow-wrap:anywhere;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 th:nth-child(3),
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 td:nth-child(3){
        width:64px;white-space:nowrap;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 th:nth-child(4),
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 td:nth-child(4){
        width:66px;white-space:nowrap;
      }
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 th:nth-child(5),
      #crmAdminBooksyPriceListV28 .crm-booksy-editor-table-v29 td:nth-child(5){
        width:58px;white-space:nowrap;
      }
      .crm-booksy-editor-toolbar-v29{
        display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 12px;
        padding:10px 12px;border:1px solid #eadfe3;border-radius:12px;background:#fffafb;
      }
      .crm-booksy-editor-title-v29{display:grid;gap:2px;min-width:220px;flex:1}
      .crm-booksy-editor-title-v29 strong{font-size:13px}
      .crm-booksy-editor-title-v29 small{font-size:10px;color:#8c7d84}
      .crm-booksy-editor-actions-v29{display:flex;gap:6px;flex-wrap:wrap}
      .crm-booksy-editor-actions-v29 button{padding:7px 9px;min-height:32px;font-size:11px;white-space:nowrap}
      .crm-booksy-save-state-v29{font-size:10px;border-radius:999px;padding:5px 8px;white-space:nowrap}
      .crm-booksy-save-state-v29.is-saved{background:#edf8ed;color:#37753d}
      .crm-booksy-save-state-v29.is-dirty{background:#fff4dd;color:#9b6615}
      .crm-booksy-save-state-v29.is-error{background:#fff0f0;color:#b14141}
      .crm-booksy-category-meta-v29{display:flex!important;align-items:center;gap:4px;color:#8c7d84}
      .crm-booksy-category-meta-v29 em{font-style:normal;font-size:10px;white-space:nowrap;margin-right:3px}
      .crm-booksy-mini-btn-v29{
        width:25px;min-width:25px;height:25px;min-height:25px;padding:0;border:1px solid #eadfe3;
        border-radius:8px;background:#fff;color:#8d5365;font-size:11px;line-height:1;cursor:pointer
      }
      .crm-booksy-mini-btn-v29:hover{background:#fff3f6}
      .crm-booksy-mini-btn-v29:disabled{opacity:.35;cursor:default}
      .crm-booksy-mini-btn-v29.is-danger{color:#c94e68}
      .crm-booksy-order-v29,.crm-booksy-row-actions-v29{display:flex;gap:3px;align-items:center}
      .crm-booksy-modal-backdrop-v29{
        position:fixed;inset:0;z-index:99999;background:rgba(37,24,33,.32);
        display:flex;align-items:center;justify-content:center;padding:18px
      }
      .crm-booksy-modal-backdrop-v29[hidden]{display:none!important}
      .crm-booksy-modal-v29{
        width:min(520px,96vw);background:#fff;border:1px solid #eadfe3;border-radius:16px;
        box-shadow:0 20px 55px rgba(67,38,49,.22);padding:16px;display:grid;gap:12px
      }
      .crm-booksy-modal-head-v29{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .crm-booksy-modal-head-v29 strong{font-size:18px}
      .crm-booksy-modal-v29 label{display:grid;gap:5px;font-size:11px;font-weight:700;color:#5f4e56}
      .crm-booksy-modal-v29 input{
        width:100%;box-sizing:border-box;border:1px solid #e7d9de;border-radius:10px;
        padding:10px 11px;font:inherit;background:#fff
      }
      .crm-booksy-modal-grid-v29{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .crm-booksy-modal-actions-v29{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}

      /* Górne akcje Cennika też są kompaktowe na laptopie. */
      @media (max-width:1500px){
        #tab-cennik .page-header{
          align-items:flex-start;
          gap:8px;
          flex-wrap:wrap;
        }
        #tab-cennik .page-header > div{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          justify-content:flex-end;
        }
        #tab-cennik .page-header button{
          padding:7px 10px;
          min-height:34px;
          font-size:12px;
          white-space:nowrap;
        }
      }

      /* Dopiero telefon / bardzo wąski tablet dostaje jedną kolumnę. */
      @media (max-width:820px){
        #crmAdminDomPriceGroupV28 .crm-price-table-v27 tbody,
        #crmBooksyCategoryColumnsV29{
          column-count:1;
        }
        #tab-cennik .page-header{
          display:block;
        }
        #tab-cennik .page-header > div{
          justify-content:flex-start;
          margin-top:8px;
        }
      }
    `;
    document.head.appendChild(style);

    document.addEventListener('click',event=>{
        const head=event.target.closest('#crmAdminDomPriceGroupV28 .crm-price-card-head-v27');
        if(!head) return;
        if(event.target.closest('button,input,select,a')) return;
        head.closest('.crm-price-card-v27')?.classList.toggle('crm-cat-open-v284');
    });
}

(function(){
    const originalRender=renderServicesTable;
    renderServicesTable=function(){
        const result=originalRender.apply(this,arguments);
        crmAdminSyncDomPriceCountV28();
        crmRenderAdminBooksyPriceListV28();
        return result;
    };
    window.renderServicesTable=renderServicesTable;

    document.addEventListener('DOMContentLoaded',()=>{
        crmInstallDomCategoryCollapseV284();
        crmInstallBooksyEditorEventsV29();
        crmRenderAdminBooksyPriceListV28();
        crmAdminSyncDomPriceCountV28();
        crmLoadBooksyPricesV29().catch(()=>{});

        const domGroup=document.getElementById('crmAdminDomPriceGroupV28');
        if(domGroup){
            domGroup.addEventListener('toggle',()=>{
                if(Array.isArray(currentServices) && currentServices.length){
                    crmAdminSyncDomPriceCountV28();
                }
            });
        }

        // V28.5: pobierz Cennik DOM automatycznie po wejściu do panelu.
        // Single-flight z V28.4 nadal gwarantuje tylko jeden request.
        crmLoadDomPricesSingleV284().catch(()=>{});
    });
})();

/* ==========================================================
   CENNIK BOOKSY V29.3
   - ten sam wygląd/szerokość kart jak Cennik DOM
   - osobny edytor usług i kategorii
   - kolor, ikona, widoczność ikony dla klienta
   - BEZ numeracji 1./2./3. w podglądzie klienta
   ========================================================== */

function crmBooksyBoolV291(value, fallback=true){
  if(value===undefined || value===null || value==="") return Boolean(fallback);
  if(typeof value==="boolean") return value;
  if(typeof value==="number") return value!==0;
  const n=crmBooksyNormV29(value);
  if(["nie","false","0","off","wyl","wył","ukryj","hidden"].includes(n)) return false;
  if(["tak","true","1","on","wl","wł","pokaz","pokaż","visible"].includes(n)) return true;
  return Boolean(fallback);
}

const crmBooksyNormalizeItemsBeforeV291 = crmBooksyNormalizeItemsV29;
crmBooksyNormalizeItemsV29 = function(source){
  const rows=Array.isArray(source)?source:[];
  const base=crmBooksyNormalizeItemsBeforeV291(source);
  const rawById=new Map();

  rows.forEach(raw=>{
    const category=String(raw?.category||"Inne").trim()||"Inne";
    const name=String(raw?.name||"").trim();
    if(!name) return;
    const id=String(raw?.adminId||crmBooksyLocalIdV29(category,name)).trim();
    rawById.set(id,raw);
  });

  const categoryMeta=new Map();
  base.forEach(item=>{
    const raw=rawById.get(item.adminId)||{};
    const name=item.category;
    if(!categoryMeta.has(name)){
      categoryMeta.set(name,{
        color:String(raw?.color||"#b05c75").trim()||"#b05c75",
        icon:String(raw?.icon||item.icon||CRM_PRICE_ICON_FALLBACK_V27).trim()||CRM_PRICE_ICON_FALLBACK_V27,
        iconClientVisible:crmBooksyBoolV291(raw?.iconClientVisible,true)
      });
    }
    const meta=categoryMeta.get(name);
    item.color=meta.color;
    item.icon=meta.icon;
    item.iconClientVisible=meta.iconClientVisible;
  });

  return base;
};

const crmBooksyCategoriesBeforeV291 = crmBooksyCategoriesV29;
crmBooksyCategoriesV29 = function(){
  const cats=crmBooksyCategoriesBeforeV291();
  cats.forEach(cat=>{
    const first=cat.services?.[0]||{};
    cat.color=String(first.color||"#b05c75");
    cat.icon=String(first.icon||crmGuessCategoryIconV27(cat.name)||CRM_PRICE_ICON_FALLBACK_V27);
    cat.iconClientVisible=crmBooksyBoolV291(first.iconClientVisible,true);
  });
  return cats;
};

function crmBooksyApplyCategoryMetaV291(categoryName, patch){
  crmAdminBooksyPricesV29
    .filter(item=>item.category===categoryName)
    .forEach(item=>{
      if(patch.color!==undefined) item.color=patch.color;
      if(patch.icon!==undefined) item.icon=patch.icon;
      if(patch.iconClientVisible!==undefined) item.iconClientVisible=Boolean(patch.iconClientVisible);
    });
  crmBooksySetDirtyV29(true);
  crmRenderAdminBooksyPriceListV28();
}

function crmBooksyOpenCategoryEditorV291(categoryName=""){
  const modal=crmEnsureBooksyCategoryModalV291();
  crmBooksyRenderCategorySelectV291(categoryName);
  crmBooksySyncCategoryEditorV291();
  modal.style.display="flex";
}

function crmBooksyCloseCategoryEditorV291(){
  const modal=document.getElementById("crmBooksyCategoryModalV291");
  if(modal) modal.style.display="none";
}

function crmEnsureBooksyCategoryModalV291(){
  let modal=document.getElementById("crmBooksyCategoryModalV291");
  if(modal) return modal;

  modal=document.createElement("div");
  modal.id="crmBooksyCategoryModalV291";
  modal.className="modal-overlay";
  modal.style.display="none";
  modal.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h4>Zarządzaj kategoriami Booksy</h4>
        <button class="modal-close" type="button" onclick="crmBooksyCloseCategoryEditorV291()">&times;</button>
      </div>

      <div class="form-group">
        <label>Wybierz kategorię:</label>
        <select id="crmBooksyCategorySelectV291"></select>
      </div>

      <section class="crm-category-look-v27" id="crmBooksyCategoryLookV291">
        <div class="crm-category-look-head-v27">
          <div>
            <strong>Wygląd kategorii</strong>
            <small>Ikona i kolor paska</small>
          </div>
          <label class="crm-category-color-v27">
            <span>Kolor</span>
            <input type="color" id="crmBooksyCategoryColorV291" value="#b05c75">
          </label>
        </div>

        <label class="crm-category-client-icon-v272">
          <span>
            <b>Pokaż ikonę klientom</b>
            <small>Ustawienie zapisujemy osobno dla Cennika Booksy.</small>
          </span>
          <span class="crm-switch-v272">
            <input type="checkbox" id="crmBooksyCategoryIconClientVisibleV291" checked>
            <i aria-hidden="true"></i>
          </span>
        </label>

        <div class="crm-category-icon-search-v27">
          <input type="search" id="crmBooksyCategoryIconSearchV291"
                 placeholder="Szukaj ikony, np. twarz, pedicure, spa…"
                 autocomplete="off">
        </div>
        <div id="crmBooksyCategoryIconGridV291" class="crm-category-icon-grid-v27"></div>
        <div class="crm-category-look-note-v27">
          Zmiana jest lokalna. Użyj potem „Zapisz Booksy”, aby zapisać ją w Cenniku Booksy.
        </div>
      </section>

      <div class="form-group">
        <label>Nowa nazwa kategorii:</label>
        <input type="text" id="crmBooksyCategoryNewNameV291" placeholder="Np. Pielęgnacja dłoni">
      </div>

      <div class="modal-footer">
        <button class="btn-primary" type="button" onclick="crmBooksyRenameCategoryFromModalV291()">Zmień nazwę</button>
        <button class="btn-danger" type="button" onclick="crmBooksyDeleteCategoryFromModalV291()">Usuń kategorię</button>
      </div>

      <hr style="margin:25px 0;border:none;border-top:1px solid #eee">

      <div class="form-group">
        <label>Dodaj nową kategorię:</label>
        <input type="text" id="crmBooksyCategoryCreateNameV291" placeholder="Nazwa nowej kategorii">
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" type="button" onclick="crmBooksyAddCategoryFromModalV291()">Dodaj kategorię</button>
        <button class="btn-secondary" type="button" onclick="crmBooksyCloseCategoryEditorV291()">Zamknij</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelector("#crmBooksyCategorySelectV291")?.addEventListener("change",crmBooksySyncCategoryEditorV291);
  modal.querySelector("#crmBooksyCategoryColorV291")?.addEventListener("change",event=>{
    const cat=crmBooksyCurrentCategoryV291();
    if(cat) crmBooksyApplyCategoryMetaV291(cat.name,{color:event.target.value});
    crmBooksySyncCategoryEditorV291();
  });
  modal.querySelector("#crmBooksyCategoryIconClientVisibleV291")?.addEventListener("change",event=>{
    const cat=crmBooksyCurrentCategoryV291();
    if(cat) crmBooksyApplyCategoryMetaV291(cat.name,{iconClientVisible:event.target.checked});
    crmBooksySyncCategoryEditorV291();
  });
  modal.querySelector("#crmBooksyCategoryIconSearchV291")?.addEventListener("input",event=>{
    crmBooksyRenderIconGridV291(event.target.value);
  });

  return modal;
}

function crmBooksyRenderCategorySelectV291(selectedName=""){
  const select=document.getElementById("crmBooksyCategorySelectV291");
  if(!select) return;
  const cats=crmBooksyCategoriesV29();
  select.innerHTML=cats.map(cat=>`<option value="${crmAdminEscapeV28(cat.name)}">${crmAdminEscapeV28(cat.name)}</option>`).join("");
  if(selectedName && cats.some(cat=>cat.name===selectedName)) select.value=selectedName;
}

function crmBooksyCurrentCategoryV291(){
  const name=String(document.getElementById("crmBooksyCategorySelectV291")?.value||"").trim();
  return crmBooksyCategoriesV29().find(cat=>cat.name===name)||null;
}

function crmBooksyRenderIconGridV291(filterText=""){
  const grid=document.getElementById("crmBooksyCategoryIconGridV291");
  if(!grid) return;

  const cat=crmBooksyCurrentCategoryV291();
  const selected=cat?.icon||CRM_PRICE_ICON_FALLBACK_V27;
  const q=crmNormTextV27(filterText);

  const catalog=CRM_PRICE_ICON_CATALOG_V27.filter(item=>{
    if(!q) return true;
    return crmNormTextV27(`${item.label} ${item.id}`).includes(q);
  });

  grid.innerHTML=catalog.map(item=>`
    <button type="button"
            class="crm-category-icon-choice-v27 ${item.id===selected?"is-selected":""}"
            data-booksy-icon-id="${crmEscapeHtmlV27(item.id)}"
            title="${crmEscapeHtmlV27(item.label)}">
      <img src="${crmEscapeHtmlV27(crmPriceIconSrcV27(item.id))}" alt="">
      <span>${crmEscapeHtmlV27(item.label)}</span>
    </button>
  `).join("");

  grid.querySelectorAll("[data-booksy-icon-id]").forEach(button=>{
    button.addEventListener("click",()=>{
      const current=crmBooksyCurrentCategoryV291();
      if(!current) return;
      crmBooksyApplyCategoryMetaV291(current.name,{icon:button.dataset.booksyIconId});
      crmBooksySyncCategoryEditorV291();
    });
  });
}

function crmBooksySyncCategoryEditorV291(){
  const cat=crmBooksyCurrentCategoryV291();
  const color=document.getElementById("crmBooksyCategoryColorV291");
  const visible=document.getElementById("crmBooksyCategoryIconClientVisibleV291");
  const search=document.getElementById("crmBooksyCategoryIconSearchV291");

  if(color && cat) color.value=cat.color||"#b05c75";
  if(visible && cat) visible.checked=crmBooksyBoolV291(cat.iconClientVisible,true);
  crmBooksyRenderIconGridV291(search?.value||"");
}

function crmBooksyRenameCategoryFromModalV291(){
  const cat=crmBooksyCurrentCategoryV291();
  const input=document.getElementById("crmBooksyCategoryNewNameV291");
  const next=String(input?.value||"").trim();
  if(!cat) return alert("Wybierz kategorię Booksy.");
  if(!next) return alert("Wpisz nową nazwę kategorii.");
  if(next!==cat.name && crmBooksyCategoriesV29().some(item=>crmBooksyNormV29(item.name)===crmBooksyNormV29(next))){
    return alert("Taka kategoria Booksy już istnieje.");
  }

  crmAdminBooksyPricesV29.forEach(item=>{
    if(item.category===cat.name) item.category=next;
  });
  if(input) input.value="";
  crmBooksyRenumberV29();
  crmBooksySetDirtyV29(true);
  crmRenderAdminBooksyPriceListV28();
  crmBooksyRenderCategorySelectV291(next);
  crmBooksySyncCategoryEditorV291();
}

function crmBooksyDeleteCategoryFromModalV291(){
  const cat=crmBooksyCurrentCategoryV291();
  if(!cat) return alert("Wybierz kategorię Booksy.");
  if(!confirm(`Ta kategoria zawiera ${cat.services.length} usług.\n\nUsunięcie kategorii usunie też wszystkie usługi z Cennika Booksy.\n\nKontynuować?`)) return;

  crmAdminBooksyPricesV29=crmAdminBooksyPricesV29.filter(item=>item.category!==cat.name);
  crmBooksyRenumberV29();
  crmBooksySetDirtyV29(true);
  crmRenderAdminBooksyPriceListV28();
  crmBooksyRenderCategorySelectV291();
  crmBooksySyncCategoryEditorV291();
}

function crmBooksyAddCategoryFromModalV291(){
  const input=document.getElementById("crmBooksyCategoryCreateNameV291");
  const name=String(input?.value||"").trim();
  if(!name) return alert("Wpisz nazwę nowej kategorii Booksy.");
  if(crmBooksyCategoriesV29().some(cat=>crmBooksyNormV29(cat.name)===crmBooksyNormV29(name))){
    return alert("Taka kategoria Booksy już istnieje.");
  }
  if(input) input.value="";
  crmBooksyCloseCategoryEditorV291();
  crmBooksyOpenAddServiceV29(name);
}

function crmEnsureBooksyServiceModalV291(){
  let modal=document.getElementById("crmBooksyServiceModalV291");
  if(modal) return modal;

  modal=document.createElement("div");
  modal.id="crmBooksyServiceModalV291";
  modal.className="modal-overlay";
  modal.style.display="none";
  modal.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h4 id="crmBooksyServiceModalTitleV291">Dodaj usługę Booksy</h4>
        <button class="modal-close" type="button" onclick="crmBooksyCloseServiceModalV29()">&times;</button>
      </div>

      <input type="hidden" id="crmBooksyEditIdV291">

      <div class="form-group">
        <label>Kategoria:</label>
        <input type="text" id="crmBooksyServiceCategoryV291" list="crmBooksyCategoryListV291" placeholder="Np. Pielęgnacja dłoni">
        <datalist id="crmBooksyCategoryListV291"></datalist>
      </div>

      <div class="form-group">
        <label>Nazwa usługi:</label>
        <input type="text" id="crmBooksyServiceNameV291" placeholder="Np. Manicure hybrydowy">
      </div>

      <div class="form-group">
        <label>Cena (zł):</label>
        <input type="number" id="crmBooksyServicePriceV291" min="0" step="1" placeholder="0">
      </div>

      <div class="form-group">
        <label>Czas trwania (min):</label>
        <input type="number" id="crmBooksyServiceDurationV291" min="0" step="5" placeholder="60">
      </div>

      <div class="form-group">
        <label>Status:</label>
        <select disabled><option>Aktywny</option></select>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" type="button" onclick="crmBooksyCloseServiceModalV29()">Anuluj</button>
        <button class="btn-primary" type="button" onclick="crmBooksySaveServiceModalV29()">Zapisz Booksy</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

crmEnsureBooksyServiceModalV29 = crmEnsureBooksyServiceModalV291;

crmBooksyFillCategoryListV29 = function(){
  const list=document.getElementById("crmBooksyCategoryListV291");
  if(!list) return;
  list.innerHTML=crmBooksyCategoriesV29().map(cat=>`<option value="${crmAdminEscapeV28(cat.name)}"></option>`).join("");
};

crmBooksyOpenAddServiceV29 = function(categoryName=""){
  const modal=crmEnsureBooksyServiceModalV291();
  document.getElementById("crmBooksyServiceModalTitleV291").textContent="Dodaj usługę Booksy";
  document.getElementById("crmBooksyEditIdV291").value="";
  document.getElementById("crmBooksyServiceCategoryV291").value=categoryName||"";
  document.getElementById("crmBooksyServiceNameV291").value="";
  document.getElementById("crmBooksyServicePriceV291").value="";
  document.getElementById("crmBooksyServiceDurationV291").value="60";
  crmBooksyFillCategoryListV29();
  modal.style.display="flex";
};

crmBooksyOpenEditServiceV29 = function(adminId){
  const service=crmBooksyFindServiceV29(adminId);
  if(!service) return;
  const modal=crmEnsureBooksyServiceModalV291();
  document.getElementById("crmBooksyServiceModalTitleV291").textContent="Edytuj usługę Booksy";
  document.getElementById("crmBooksyEditIdV291").value=service.adminId;
  document.getElementById("crmBooksyServiceCategoryV291").value=service.category;
  document.getElementById("crmBooksyServiceNameV291").value=service.name;
  document.getElementById("crmBooksyServicePriceV291").value=service.price;
  document.getElementById("crmBooksyServiceDurationV291").value=service.duration;
  crmBooksyFillCategoryListV29();
  modal.style.display="flex";
};

crmBooksyCloseServiceModalV29 = function(){
  const modal=document.getElementById("crmBooksyServiceModalV291");
  if(modal) modal.style.display="none";
};

crmBooksySaveServiceModalV29 = function(){
  const adminId=String(document.getElementById("crmBooksyEditIdV291")?.value||"");
  const category=String(document.getElementById("crmBooksyServiceCategoryV291")?.value||"").trim();
  const name=String(document.getElementById("crmBooksyServiceNameV291")?.value||"").trim();
  const priceRaw=String(document.getElementById("crmBooksyServicePriceV291")?.value??"").trim();
  const duration=Math.max(0,Number(document.getElementById("crmBooksyServiceDurationV291")?.value)||0);

  if(!category || !name) return alert("Wpisz kategorię i nazwę usługi Booksy.");

  const duplicate=crmAdminBooksyPricesV29.find(item=>
    item.adminId!==adminId &&
    crmBooksyNormV29(item.category)===crmBooksyNormV29(category) &&
    crmBooksyNormV29(item.name)===crmBooksyNormV29(name)
  );
  if(duplicate) return alert("Taka usługa już istnieje w Cenniku Booksy.");

  const existing=adminId?crmBooksyFindServiceV29(adminId):null;
  const categoryExisting=crmBooksyCategoriesV29().find(cat=>crmBooksyNormV29(cat.name)===crmBooksyNormV29(category));
  const categoryOrder=categoryExisting?.order || (crmBooksyCategoriesV29().length+1);
  const maxServiceOrder=Math.max(0,...crmAdminBooksyPricesV29
    .filter(item=>crmBooksyNormV29(item.category)===crmBooksyNormV29(category))
    .map(item=>Number(item.serviceOrder)||0));

  const data={
    adminId:existing?.adminId || crmBooksyLocalIdV29(category,`${name}|${Date.now()}`),
    category,
    name,
    price:priceRaw===""?"":(Number(priceRaw)||0),
    duration,
    categoryOrder,
    serviceOrder:existing && crmBooksyNormV29(existing.category)===crmBooksyNormV29(category)
      ? existing.serviceOrder
      : maxServiceOrder+1,
    icon:categoryExisting?.icon || existing?.icon || CRM_PRICE_ICON_FALLBACK_V27,
    color:categoryExisting?.color || existing?.color || "#b05c75",
    iconClientVisible:categoryExisting
      ? crmBooksyBoolV291(categoryExisting.iconClientVisible,true)
      : crmBooksyBoolV291(existing?.iconClientVisible,true)
  };

  if(existing) Object.assign(existing,data);
  else crmAdminBooksyPricesV29.push(data);

  crmBooksyRenumberV29();
  crmBooksySetDirtyV29(true);
  crmBooksyCloseServiceModalV29();
  crmRenderAdminBooksyPriceListV28();
};

crmBooksyEditorToolbarV29 = function(){
  return `
    <div class="crm-booksy-editor-toolbar-v29 crm-booksy-editor-toolbar-v291">
      <div class="crm-booksy-editor-title-v29">
        <strong>Edytor Booksy</strong>
        <small>Osobny od Cennika DOM — zapis tylko do „Cennik Booksy”.</small>
      </div>
      <div class="crm-booksy-editor-actions-v29">
        <button type="button" class="btn-primary" onclick="crmBooksyOpenAddServiceV29()">＋ Usługa Booksy</button>
        <button type="button" class="btn-secondary" onclick="crmBooksyOpenCategoryEditorV291()">🏷 Kategorie Booksy</button>
        <button type="button" class="btn-secondary" onclick="crmLoadBooksyPricesV29().catch(()=>{})">↻ Odśwież</button>
        <button type="button" class="btn-primary" id="crmBooksySaveButtonV29" onclick="crmBooksySaveAllV29()">💾 Zapisz Booksy</button>
      </div>
      <span id="crmBooksySaveStateV29"
            class="crm-booksy-save-state-v29 ${crmBooksyDirtyV29?'is-dirty':crmBooksyBackendStateV29==='error'?'is-error':'is-saved'}">
        ${crmBooksyDirtyV29?'Niezapisane zmiany':crmBooksyBackendStateV29==='error'?'Brak połączenia z edytorem':'Zapisano'}
      </span>
    </div>`;
};

crmRenderAdminBooksyPriceListV28 = function(){
  const host=document.getElementById("crmAdminBooksyPriceListV28");
  if(!host) return;

  if(!crmAdminBooksyPricesV29.length && !crmBooksyLoadedV29){
    crmAdminBooksyPricesV29=crmBooksyNormalizeItemsV29(CRM_ADMIN_BOOKSY_FALLBACK_V28);
  }

  const cats=crmBooksyCategoriesV29();
  const count=document.getElementById("crmAdminBooksyPriceCountV28");
  if(count) count.textContent=`${crmAdminBooksyPricesV29.length} usług`;

  const cards=cats.map((category,catIndex)=>{
    const icon=category.icon||CRM_PRICE_ICON_FALLBACK_V27;
    return `
      <div class="crm-booksy-category-row-v291">
        <article class="crm-price-card-v27 crm-booksy-price-card-v291"
                 style="--crm-cat-color:${crmEscapeHtmlV27(category.color||"#b05c75")}">
          <header class="crm-price-card-head-v27 crm-booksy-card-head-v291">
            <span class="crm-price-stripe-v27" aria-hidden="true"></span>
            <img class="crm-price-category-icon-v27"
                 src="${crmEscapeHtmlV27(crmPriceIconSrcV27(icon))}"
                 alt="">
            <h3>${crmAdminEscapeV28(category.name)}</h3>
            <span class="crm-price-count-v27">${crmEscapeHtmlV27(crmServiceCountTextV27(category.services.length))}</span>
            <div class="crm-price-head-actions-v27">
              <button type="button" class="crm-price-icon-btn-v27"
                      ${catIndex===0?"disabled":""}
                      title="Przesuń kategorię wyżej"
                      data-booksy-action="cat-up"
                      data-category="${encodeURIComponent(category.name)}">↑</button>
              <button type="button" class="crm-price-icon-btn-v27"
                      ${catIndex===cats.length-1?"disabled":""}
                      title="Przesuń kategorię niżej"
                      data-booksy-action="cat-down"
                      data-category="${encodeURIComponent(category.name)}">↓</button>
              <button type="button" class="crm-price-icon-btn-v27"
                      title="Edytuj kategorię Booksy"
                      onclick="event.preventDefault();event.stopPropagation();crmBooksyOpenCategoryEditorV291(decodeURIComponent('${encodeURIComponent(category.name)}'))">⚙</button>
            </div>
          </header>

          <div class="crm-price-services-v27 crm-booksy-services-v291">
            <div class="crm-price-service-head-v27">
              <span>Kolejność</span><span>Usługa</span><span>Cena</span>
              <span>Czas</span><span>Status</span><span>Akcje</span>
            </div>

            ${category.services.map((service,serviceIndex)=>`
              <div class="crm-price-service-row-v27">
                <div class="crm-price-order-v27">
                  <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                          ${serviceIndex===0?"disabled":""}
                          title="Przesuń usługę wyżej"
                          data-booksy-action="srv-up"
                          data-id="${crmAdminEscapeV28(service.adminId)}">↑</button>
                  <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                          ${serviceIndex===category.services.length-1?"disabled":""}
                          title="Przesuń usługę niżej"
                          data-booksy-action="srv-down"
                          data-id="${crmAdminEscapeV28(service.adminId)}">↓</button>
                </div>
                <div class="crm-price-service-name-v27">${crmAdminEscapeV28(service.name)}</div>
                <div>${service.price!==""?`${Number(service.price)} zł`:"—"}</div>
                <div>${Number(service.duration)>0?`${Number(service.duration)} min`:"—"}</div>
                <div><span class="crm-price-status-v27 is-published">Aktywny</span></div>
                <div class="crm-price-row-actions-v27">
                  <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27"
                          title="Edytuj usługę Booksy"
                          data-booksy-action="srv-edit"
                          data-id="${crmAdminEscapeV28(service.adminId)}">✎</button>
                  <button type="button" class="crm-price-icon-btn-v27 crm-price-row-btn-v27 is-danger"
                          title="Usuń usługę Booksy"
                          data-booksy-action="srv-delete"
                          data-id="${crmAdminEscapeV28(service.adminId)}">⌫</button>
                </div>
              </div>`).join("")}
          </div>
        </article>
      </div>`;
  }).join("");

  host.innerHTML=`
    ${crmBooksyEditorToolbarV29()}
    <div id="crmBooksyCategoryColumnsV291">${cards || '<div class="crm-booksy-empty-v29">Brak usług Booksy.</div>'}</div>
  `;
};

function crmInstallBooksyLayoutV291(){
  if(document.getElementById("crm-booksy-layout-style-v291")) return;

  const style=document.createElement("style");
  style.id="crm-booksy-layout-style-v291";
  style.textContent=`
    #crmAdminBooksyPriceListV28{display:block!important;max-width:100%!important;overflow:visible!important}
    #crmBooksyCategoryColumnsV291{
      display:block!important;
      column-count:2;
      column-gap:12px;
      width:100%;
      max-width:100%;
      box-sizing:border-box;
    }
    #crmBooksyCategoryColumnsV291 .crm-booksy-category-row-v291{
      display:inline-block!important;
      width:100%!important;
      margin:0 0 12px 0!important;
      break-inside:avoid;
      -webkit-column-break-inside:avoid;
      vertical-align:top;
      box-sizing:border-box;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-card-v27,
    #crmBooksyCategoryColumnsV291 .crm-price-services-v27{
      min-width:0!important;
      max-width:100%!important;
      box-sizing:border-box!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-card-v27{
      overflow:hidden!important;
      height:auto!important;
      min-height:0!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-services-v27{display:none}
    #crmBooksyCategoryColumnsV291 .crm-booksy-price-card-v291.crm-booksy-open-v291 .crm-price-services-v27{display:block}
    #crmBooksyCategoryColumnsV291 .crm-price-card-head-v27{
      cursor:pointer;
      gap:7px!important;
      min-width:0!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-card-head-v27 h3{
      min-width:0!important;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-head-actions-v27{
      gap:3px!important;
      flex:0 0 auto;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-service-head-v27,
    #crmBooksyCategoryColumnsV291 .crm-price-service-row-v27{
      display:grid!important;
      grid-template-columns:52px minmax(0,1fr) 48px 52px 70px 58px!important;
      gap:6px!important;
      align-items:center!important;
      min-width:0!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-service-row-v27>*,
    #crmBooksyCategoryColumnsV291 .crm-price-service-head-v27>*{min-width:0!important}
    #crmBooksyCategoryColumnsV291 .crm-price-service-name-v27{
      overflow-wrap:anywhere;
      line-height:1.22;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-order-v27,
    #crmBooksyCategoryColumnsV291 .crm-price-row-actions-v27{
      display:flex!important;
      gap:3px!important;
      flex-wrap:nowrap!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-icon-btn-v27{
      width:28px!important;
      min-width:28px!important;
      height:28px!important;
      min-height:28px!important;
      padding:0!important;
      font-size:12px!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-row-btn-v27{
      width:25px!important;
      min-width:25px!important;
      height:25px!important;
      min-height:25px!important;
      font-size:11px!important;
    }
    #crmBooksyCategoryColumnsV291 .crm-price-status-v27{
      padding:4px 6px!important;
      font-size:10px!important;
      white-space:nowrap;
    }
    .crm-booksy-editor-toolbar-v291{width:100%;box-sizing:border-box}
    @media(max-width:820px){
      #crmBooksyCategoryColumnsV291{column-count:1}
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("click",event=>{
    const head=event.target.closest("#crmBooksyCategoryColumnsV291 .crm-booksy-card-head-v291");
    if(!head) return;
    if(event.target.closest("button,input,select,a")) return;
    head.closest(".crm-booksy-price-card-v291")?.classList.toggle("crm-booksy-open-v291");
  });
}

const crmBooksySaveAllBeforeV291 = crmBooksySaveAllV29;
crmBooksySaveAllV29 = async function(){
  crmBooksyRenumberV29();
  const button=document.getElementById("crmBooksySaveButtonV29");
  if(button) button.disabled=true;

  try{
    if(crmBooksyBackendStateV29==="error"){
      return alert("Backend edytora Booksy nie jest jeszcze aktywny. Wdróż Apps Script V4.7.8 w aplikacji TEST.");
    }

    const response=await fetch(APPS_SCRIPT_URL,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({
        action:"saveBooksyPricesAdminV478",
        prices:crmAdminBooksyPricesV29.map(item=>({
          adminId:item.adminId,
          category:item.category,
          name:item.name,
          price:item.price,
          duration:item.duration,
          categoryOrder:item.categoryOrder,
          serviceOrder:item.serviceOrder,
          icon:item.icon||CRM_PRICE_ICON_FALLBACK_V27,
          color:item.color||"#b05c75",
          iconClientVisible:crmBooksyBoolV291(item.iconClientVisible,true)
        }))
      })
    });

    const text=await response.text();
    const data=JSON.parse(text);
    if(!data || data.success!==true) throw new Error(data?.error||"Nie udało się zapisać Cennika Booksy");

    crmBooksyBackendStateV29="ready";
    crmBooksySetDirtyV29(false);
    await crmLoadBooksyPricesV29();
    alert(`Cennik Booksy zapisany. Aktywne usługi: ${data.activeCount ?? crmAdminBooksyPricesV29.length}.`);
  }catch(error){
    console.error(error);
    alert(`Błąd zapisu Cennika Booksy: ${error.message||error}`);
  }finally{
    if(button) button.disabled=false;
  }
};

document.addEventListener("DOMContentLoaded",()=>{
  crmInstallBooksyLayoutV291();
  crmRenderAdminBooksyPriceListV28();
});
/* KONIEC CENNIK BOOKSY V29.3 */


/* ==========================================================
   BOOKSY PANEL STYLE V29.3
   Styl panelu Booksy wstrzykiwany z JS, żeby był identyczny
   z DOM bez zależności od osobnej synchronizacji CSS.
   ========================================================== */
(function crmInstallBooksyExactDomStyleV293(){
  if(document.getElementById("crm-booksy-exact-dom-style-v293")) return;
  const style=document.createElement("style");
  style.id="crm-booksy-exact-dom-style-v293";
  style.textContent='\n@media (min-width: 761px) {\n  html body #crmBooksyCategoryModalV291.modal-overlay,\n  html body #crmBooksyServiceModalV291.modal-overlay {\n    background: transparent !important;\n    backdrop-filter: none !important;\n    -webkit-backdrop-filter: none !important;\n    pointer-events: none !important;\n    align-items: flex-start !important;\n    justify-content: flex-end !important;\n    padding-top: 12px !important;\n    padding-right: 8px !important;\n    padding-bottom: 12px !important;\n    padding-left: 12px !important;\n    box-sizing: border-box !important;\n    z-index: 11140 !important;\n  }\n\n  html body #crmBooksyCategoryModalV291.modal-overlay > .modal-content,\n  html body #crmBooksyServiceModalV291.modal-overlay > .modal-content {\n    pointer-events: auto !important;\n    width: var(--crm-action-panel-width, 320px) !important;\n    min-width: var(--crm-action-panel-width, 320px) !important;\n    max-width: var(--crm-action-panel-width, 320px) !important;\n    height: calc(100vh - 24px) !important;\n    max-height: calc(100vh - 24px) !important;\n    margin: 0 !important;\n    box-sizing: border-box !important;\n    overflow-x: hidden !important;\n    overflow-y: auto !important;\n    border-radius: 18px !important;\n    box-shadow: 0 16px 42px rgba(48,35,42,.18) !important;\n    min-width: 0 !important;\n  }\n\n  html body #crmBooksyCategoryModalV291 input,\n  html body #crmBooksyCategoryModalV291 select,\n  html body #crmBooksyCategoryModalV291 textarea,\n  html body #crmBooksyServiceModalV291 input,\n  html body #crmBooksyServiceModalV291 select,\n  html body #crmBooksyServiceModalV291 textarea {\n    max-width: 100% !important;\n    min-width: 0 !important;\n  }\n}\n\n@media (max-width: 760px) {\n  html body #crmBooksyCategoryModalV291.modal-overlay,\n  html body #crmBooksyServiceModalV291.modal-overlay {\n    pointer-events: auto !important;\n  }\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-v27 {\n  margin: 14px 0 4px;\n  padding: 14px;\n  border: 1px solid rgba(197,150,168,.22);\n  border-radius: 14px;\n  background: rgba(255,249,251,.74);\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-head-v27 {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 10px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-head-v27 > div {\n  display: grid;\n  gap: 2px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-head-v27 strong {\n  font-size: 14px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-head-v27 small {\n  color: #8a7b83;\n  font-size: 11px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-color-v27 {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  color: #7f7078;\n  font-size: 11px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-color-v27 input[type="color"] {\n  width: 34px;\n  height: 30px;\n  padding: 2px;\n  border: 1px solid rgba(197,150,168,.26);\n  border-radius: 9px;\n  background: #fff;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-search-v27 input {\n  width: 100%;\n  min-height: 40px;\n  margin-bottom: 10px;\n  border-radius: 10px;\n  font-size: 13px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-grid-v27 {\n  display: grid;\n  grid-template-columns: repeat(5,minmax(0,1fr));\n  gap: 7px;\n  max-height: 282px;\n  overflow: auto;\n  padding: 2px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-choice-v27 {\n  display: grid;\n  justify-items: center;\n  align-content: center;\n  gap: 5px;\n  min-height: 78px;\n  padding: 7px 4px !important;\n  border: 1px solid rgba(197,150,168,.18) !important;\n  border-radius: 11px !important;\n  background: rgba(255,255,255,.82) !important;\n  color: #5f5359 !important;\n  box-shadow: none !important;\n  cursor: pointer;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-choice-v27 img {\n  width: 33px;\n  height: 33px;\n  object-fit: contain;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-choice-v27 span {\n  max-width: 100%;\n  font-size: 9px;\n  line-height: 1.15;\n  text-align: center;\n  overflow-wrap: anywhere;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-icon-choice-v27.is-selected {\n  border-color: rgba(211,87,131,.58) !important;\n  background: rgba(255,239,245,.96) !important;\n  box-shadow: inset 0 0 0 1px rgba(211,87,131,.08) !important;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-look-note-v27 {\n  margin-top: 9px;\n  color: #9a8991;\n  font-size: 10px;\n  line-height: 1.35;\n}\n\n@media (max-width: 1180px) {\n#crmBooksyCategoryModalV291 .crm-category-client-icon-v272 {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin: 10px 0 2px;\n  padding: 10px 11px;\n  border: 1px solid rgba(197,150,168,.18);\n  border-radius: 11px;\n  background: rgba(255,255,255,.66);\n}\n\n#crmBooksyCategoryModalV291 .crm-category-client-icon-v272 > span {\n  display: grid;\n  gap: 2px;\n  color: #61545b;\n  font-size: 12px;\n}\n\n#crmBooksyCategoryModalV291 .crm-category-client-icon-v272 small {\n  color: #9a8991;\n  font-size: 10px;\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 {\n  position: relative;\n  width: 42px;\n  height: 24px;\n  flex: 0 0 auto;\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 input {\n  position: absolute;\n  opacity: 0;\n  pointer-events: none;\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 i {\n  position: absolute;\n  inset: 0;\n  border-radius: 999px;\n  background: #eadde2;\n  transition: .16s ease;\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 i::after {\n  content: "";\n  position: absolute;\n  width: 18px;\n  height: 18px;\n  top: 3px;\n  left: 3px;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 2px 7px rgba(85,50,64,.16);\n  transition: .16s ease;\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 input:checked + i {\n  background: linear-gradient(135deg,#e97b96,#ca537b);\n}\n\n#crmBooksyCategoryModalV291 .crm-switch-v272 input:checked + i::after {\n  transform: translateX(18px);\n}\n\n/* ==========================================================================';
  document.head.appendChild(style);
})();
/* KONIEC BOOKSY PANEL STYLE V29.3 */


/* ==========================================================================
   V30.0 — JEDNO ŹRÓDŁO KOLORÓW DLA CENNIKA I KALENDARZA
   DOM + BOOKSY + wszystkie widoki kalendarza.
   Kolor zapisany w starej wizycie NIE ma pierwszeństwa nad aktualnym Cennikiem.
   ========================================================================== */
const CRM_COLOR_META_STORAGE_V294 = "crm_booksy_category_meta_v294";

function crmColorNormV294(value){
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ");
}

function crmColorHexV294(value, fallback="#b05c75"){
  const source=String(value||"").trim();
  if(/^#[0-9a-f]{6}$/i.test(source)) return source.toLowerCase();
  if(/^#[0-9a-f]{3}$/i.test(source)){
    return ("#"+source.slice(1).split("").map(c=>c+c).join("")).toLowerCase();
  }
  return fallback;
}

function crmBooksyLocalMetaReadV294(){
  try{
    const raw=localStorage.getItem(CRM_COLOR_META_STORAGE_V294);
    const parsed=raw?JSON.parse(raw):{};
    return parsed && typeof parsed==="object" ? parsed : {};
  }catch(_){ return {}; }
}

function crmBooksyLocalMetaWriteV294(){
  try{
    const meta={};
    (typeof crmBooksyCategoriesV29==="function" ? crmBooksyCategoriesV29() : []).forEach(cat=>{
      meta[crmColorNormV294(cat.name)]={
        name:cat.name,
        color:crmColorHexV294(cat.color||"#b05c75"),
        icon:String(cat.icon||CRM_PRICE_ICON_FALLBACK_V27),
        iconClientVisible:cat.iconClientVisible!==false
      };
    });
    localStorage.setItem(CRM_COLOR_META_STORAGE_V294,JSON.stringify(meta));
  }catch(_){}
}

function crmBooksyApplyLocalMetaV294(){
  const stored=crmBooksyLocalMetaReadV294();
  if(!stored || !Object.keys(stored).length || !Array.isArray(crmAdminBooksyPricesV29)) return;
  crmAdminBooksyPricesV29.forEach(item=>{
    const meta=stored[crmColorNormV294(item.category)];
    if(!meta) return;
    if(!item.color || item.color==="#b05c75") item.color=meta.color||item.color;
    if(!item.icon || item.icon===CRM_PRICE_ICON_FALLBACK_V27) item.icon=meta.icon||item.icon;
    if(item.iconClientVisible===undefined || item.iconClientVisible===null){
      item.iconClientVisible=meta.iconClientVisible!==false;
    }
  });
}

function crmBooksyFindServiceV294(item){
  const serviceName=crmColorNormV294(item?.service||item?.serviceName||"");
  const categoryName=crmColorNormV294(item?.category||"");
  const list=Array.isArray(crmAdminBooksyPricesV29)?crmAdminBooksyPricesV29:[];
  if(serviceName){
    const exact=list.find(s=>crmColorNormV294(s?.name)===serviceName);
    if(exact) return exact;
  }
  if(categoryName){
    const byCategory=list.find(s=>crmColorNormV294(s?.category)===categoryName);
    if(byCategory) return byCategory;
  }
  return null;
}

function crmDomFindServiceV294(item){
  const serviceName=crmColorNormV294(item?.service||item?.serviceName||"");
  const categoryName=crmColorNormV294(item?.category||"");
  const list=Array.isArray(currentServices)?currentServices:[];
  if(serviceName){
    const exact=list.find(s=>crmColorNormV294(s?.name)===serviceName);
    if(exact) return exact;
  }
  if(categoryName){
    const byCategory=list.find(s=>crmColorNormV294(s?.category)===categoryName);
    if(byCategory) return byCategory;
  }
  return null;
}

function crmVisitIsBooksyV294(item){
  const source=crmColorNormV294([
    item?.bookingSource,item?.source,item?.origin,item?.sourceType,item?.channel
  ].filter(Boolean).join(" "));
  return source.includes("booksy");
}

function crmVisitIsWifeCalendarV295(item){
  const source=crmColorNormV294([
    item?.bookingSource,item?.source,item?.origin,item?.sourceType,item?.channel
  ].filter(Boolean).join(" "));
  return source.includes("wife_calendar") || source.includes("wife calendar");
}

function crmWifeDomCategoryV295(item){
  if(!crmVisitIsWifeCalendarV295(item)) return "";
  const cat=crmColorNormV294(item?.category||"");
  const service=crmColorNormV294(item?.service||"");
  if(cat==="manicure" || cat.includes("pielegnacja dloni") || /manicure|zel|hybryd|uzupelnienie/.test(service)) return "Manicure";
  if(cat==="pedicure" || cat.includes("pielegnacja stop") || /pedicure|stopy|stop/.test(service)) return "Pedicure";
  if(cat==="dodatki" || /naprawa|zdobienie|french|baby boomer|gradient|ombre|masaz dloni|masaz stop/.test(service)) return "Dodatki";
  return "";
}

function crmCanonicalCategoryMetaV294(item){
  if(item?.eventType==="block"){
    return {source:"SYSTEM",category:"Blokada",color:"#aaa2a7",icon:"universal"};
  }
  if(item?.eventType==="external"){
    const needsReview=Boolean(item?.reviewRequired||item?.canEditReview||String(item?.category||"").toUpperCase()==="DO_WERYFIKACJI");
    if(needsReview) return {source:"SYSTEM_REVIEW",category:"Do sprawdzenia",color:"#d79a16",icon:"universal"};
    return {source:"SYSTEM",category:"Kalendarz zewnętrzny",color:"#9aa2af",icon:"universal"};
  }
  if(item?.eventType==="work_shift"){
    return {source:"SYSTEM",category:"Grafik",color:"#d9b43b",icon:"universal"};
  }

  crmBooksyApplyLocalMetaV294();

  const booksy=crmBooksyFindServiceV294(item);
  const dom=crmDomFindServiceV294(item);
  const preferBooksy=crmVisitIsBooksyV294(item);
  const wifeDomCategory=crmWifeDomCategoryV295(item);

  /* WIFE_CALENDAR: manicure/pedicure ma używać kolorów DOM,
     nawet gdy historyczny importer zapisał nazwę usługi podobną do Booksy. */
  if(wifeDomCategory){
    const domByCategory=(Array.isArray(currentServices)?currentServices:[])
      .find(s=>crmColorNormV294(s?.category)===crmColorNormV294(wifeDomCategory));
    if(domByCategory){
      const category=String(domByCategory.category||wifeDomCategory);
      return {
        source:"DOM",
        category,
        color:crmColorHexV294(domByCategory.categoryColor||globalColors?.[category]||"#b05c75"),
        icon:String(domByCategory.categoryIcon||domByCategory.icon||CRM_PRICE_ICON_FALLBACK_V27)
      };
    }
  }

  let chosen=null;
  let source="";

  if(preferBooksy && booksy){ chosen=booksy; source="BOOKSY"; }
  else if(dom){ chosen=dom; source="DOM"; }
  else if(booksy){ chosen=booksy; source="BOOKSY"; }

  if(chosen){
    const category=String(chosen.category||item?.category||"").trim();
    let color="";
    if(source==="BOOKSY"){
      color=chosen.color||chosen.categoryColor||"";
      if(!color && typeof crmBooksyCategoriesV29==="function"){
        const cat=crmBooksyCategoriesV29().find(c=>crmColorNormV294(c.name)===crmColorNormV294(category));
        color=cat?.color||"";
      }
    }else{
      color=chosen.categoryColor||chosen.color||globalColors?.[category]||"";
    }
    return {
      source,
      category,
      color:crmColorHexV294(color||"#b05c75"),
      icon:String(chosen.icon||chosen.categoryIcon||CRM_PRICE_ICON_FALLBACK_V27)
    };
  }

  const category=String(item?.category||"").trim();
  const liveGlobal=category && globalColors ? globalColors[category] : "";
  return {
    source:"FALLBACK",
    category,
    // Cennik ma pierwszeństwo; kolor historyczny z wizyty jest tylko awaryjny.
    color:crmColorHexV294(liveGlobal||item?.categoryColor||item?.color||"#b05c75"),
    icon:"universal"
  };
}

function crmCanonicalCategoryColorV294(item){
  return crmCanonicalCategoryMetaV294(item).color;
}

/* Nadpisujemy wszystkie stare rozproszone resolvery kolorów. */
crmResolveCategoryColor = function(item){ return crmCanonicalCategoryColorV294(item); };
crmCategoryColor = function(item){ return crmCanonicalCategoryColorV294(item); };
crmVisitCategoryColor = function(item){ return crmCanonicalCategoryColorV294(item); };
crmSafeVisitCategoryColor = function(item){ return crmCanonicalCategoryColorV294(item); };
crmDayEventColor = function(item){ return crmCanonicalCategoryColorV294(item); };

crmCategoryPalette = function(item){
  const color=crmCanonicalCategoryColorV294(item);
  const [r,g,b]=crmHexToRgb(color);
  return {stripe:color,fill:`rgba(${r},${g},${b},.16)`,hover:`rgba(${r},${g},${b},.22)`};
};

function crmRefreshAllCalendarColorsV294(){
  try{
    if(typeof renderBooksyCalendar==="function") renderBooksyCalendar();
    if(typeof renderMiniMonthCalendar==="function") renderMiniMonthCalendar();
    if(typeof crmV13RecolorCalendar==="function") crmV13RecolorCalendar();
    if(typeof crmApplyCategoryVisualsToLegacyCards==="function") crmApplyCategoryVisualsToLegacyCards();
  }catch(error){
    console.warn("V29.4: odświeżenie kolorów kalendarza",error);
  }
}

/* Kolor DOM -> od razu cały kalendarz. */
if(typeof crmChangeCategoryColor==="function"){
  const crmChangeCategoryColorBeforeV294=crmChangeCategoryColor;
  crmChangeCategoryColor=function(categoryId,color){
    const result=crmChangeCategoryColorBeforeV294(categoryId,color);
    setTimeout(crmRefreshAllCalendarColorsV294,0);
    return result;
  };
}

/* Kolor / ikona Booksy -> lokalny draft + cały kalendarz. */
if(typeof crmBooksyApplyCategoryMetaV291==="function"){
  const crmBooksyApplyCategoryMetaBeforeV294=crmBooksyApplyCategoryMetaV291;
  crmBooksyApplyCategoryMetaV291=function(categoryName,patch){
    const result=crmBooksyApplyCategoryMetaBeforeV294(categoryName,patch);
    crmBooksyLocalMetaWriteV294();
    setTimeout(crmRefreshAllCalendarColorsV294,0);
    return result;
  };
}

/* Po pobraniu Booksy z backendu scalamy lokalny draft i odświeżamy kalendarz. */
if(typeof crmLoadBooksyPricesV29==="function"){
  const crmLoadBooksyPricesBeforeV294=crmLoadBooksyPricesV29;
  crmLoadBooksyPricesV29=async function(){
    const result=await crmLoadBooksyPricesBeforeV294.apply(this,arguments);
    crmBooksyApplyLocalMetaV294();
    crmRenderAdminBooksyPriceListV28();
    crmRefreshAllCalendarColorsV294();
    return result;
  };
}

/* Po zapisie Booksy zostawiamy lokalny meta-cache zgodny z zapisanym stanem. */
if(typeof crmBooksySaveAllV29==="function"){
  const crmBooksySaveAllBeforeV294=crmBooksySaveAllV29;
  crmBooksySaveAllV29=async function(){
    crmBooksyLocalMetaWriteV294();
    const result=await crmBooksySaveAllBeforeV294.apply(this,arguments);
    crmBooksyLocalMetaWriteV294();
    crmRefreshAllCalendarColorsV294();
    return result;
  };
}

/* Stary dzień używa renderAppointmentCard — po wyrenderowaniu narzucamy kolor z Cennika. */
if(typeof renderAppointmentCard==="function"){
  const crmRenderAppointmentCardBeforeV294=renderAppointmentCard;
  renderAppointmentCard=function(item,container){
    const before=container?.children?.length||0;
    const result=crmRenderAppointmentCardBeforeV294(item,container);
    const card=container?.children?.[before]||container?.lastElementChild;
    if(card && item?.eventType!=="work_shift"){
      const color=crmCanonicalCategoryColorV294(item);
      if(typeof crmColorToSoftRgba==="function"){
        card.style.setProperty("--crm-event-color",color);
        card.style.setProperty("--crm-event-soft",crmColorToSoftRgba(color,.16));
      }
      card.style.borderLeftColor=color;
    }
    return result;
  };
}

document.addEventListener("DOMContentLoaded",()=>{
  crmBooksyApplyLocalMetaV294();
  setTimeout(crmRefreshAllCalendarColorsV294,300);
});
/* KONIEC V30.0 — JEDNO ŹRÓDŁO KOLORÓW */

/* KONIEC CENNIK ADMIN V28 */


/* ==========================================================================
   V30.1 — IKONA ŹRÓDŁA W KALENDARZU ADMINA
   DOM / WIFE_CALENDAR => 🏠
   BOOKSY              => ✦
   Nie zastępuje ikony statusu (zielona kropka itp.) — pokazuje się obok niej.
   ========================================================================== */
function crmCalendarSourceIconV301(item){
  if(!item || item.eventType!=="appointment") return "";
  try{
    const meta=typeof crmCanonicalCategoryMetaV294==="function"
      ? crmCanonicalCategoryMetaV294(item)
      : null;
    if(meta?.source==="BOOKSY") return "BOOKSY";
    if(meta?.source==="DOM") return "🏠";
  }catch(ignore){}

  const source=String([
    item?.bookingSource,item?.source,item?.origin,item?.sourceType,item?.channel
  ].filter(Boolean).join(" ")).toLocaleLowerCase("pl-PL");

  if(source.includes("booksy")) return "BOOKSY";
  if(source.includes("wife_calendar") || source.includes("wife calendar") || source.includes("dom")) return "🏠";
  return "";
}

function crmCalendarSourceIconHtmlV301(item){
  const icon=crmCalendarSourceIconV301(item);
  if(!icon) return "";
  if(icon==="BOOKSY"){
    return `<span class="crm-calendar-source-icon-v301 is-booksy"
                  aria-label="Booksy" title="Booksy">
              <img src="${crmAdminAssetPathV306("Icons/booksy-b.png")}" alt="">
            </span>`;
  }
  return `<span class="crm-calendar-source-icon-v301"
                aria-label="DOM" title="DOM / kalendarz żony">${icon}</span>`;
}

function crmInjectCalendarSourceIconV301(card,item){
  if(!card || card.querySelector(".crm-calendar-source-icon-v301")) return;
  const html=crmCalendarSourceIconHtmlV301(item);
  if(!html) return;

  const target=
    card.querySelector(".crm-month-visit-main") ||
    card.querySelector(".crm-week-visit-time") ||
    card.querySelector(".crm-day-card-line") ||
    card.querySelector(".crm-3day-event__time") ||
    card.querySelector(".crm-3day-event__single") ||
    card.querySelector(".crm-day-event__time") ||
    card.querySelector(".crm-compact-time");

  if(target){
    target.insertAdjacentHTML("afterbegin",html);
  }
}

/* Miesiąc */
if(typeof crmCreateMonthVisitCard==="function"){
  const crmCreateMonthVisitCardBeforeV301=crmCreateMonthVisitCard;
  crmCreateMonthVisitCard=function(item){
    const card=crmCreateMonthVisitCardBeforeV301(item);
    crmInjectCalendarSourceIconV301(card,item);
    return card;
  };
}

/* Tydzień */
if(typeof crmCreateWeekVisitCard==="function"){
  const crmCreateWeekVisitCardBeforeV301=crmCreateWeekVisitCard;
  crmCreateWeekVisitCard=function(item){
    const card=crmCreateWeekVisitCardBeforeV301(item);
    crmInjectCalendarSourceIconV301(card,item);
    return card;
  };
}

/* Dzień — finalny renderer tworzy kartę bez zwracania elementu. */
if(typeof crmRenderThreeDayEvent==="function"){
  const crmRenderThreeDayEventBeforeV301=crmRenderThreeDayEvent;
  crmRenderThreeDayEvent=function(entry,layer,rangeStart,pixelsPerMinute){
    const before=layer?.children?.length||0;
    const result=crmRenderThreeDayEventBeforeV301.apply(this,arguments);
    const card=layer?.children?.[before] || layer?.lastElementChild;
    crmInjectCalendarSourceIconV301(card,entry?.item);
    return result;
  };
}

/* Starszy kompaktowy renderer — zabezpieczenie dla innych układów. */
if(typeof crmAppendCompactEvent==="function"){
  const crmAppendCompactEventBeforeV301=crmAppendCompactEvent;
  crmAppendCompactEvent=function(){
    const container=arguments[1] || arguments[0];
    const item=arguments[0]?.eventType ? arguments[0] : arguments[1]?.eventType ? arguments[1] : null;
    const before=container?.children?.length||0;
    const result=crmAppendCompactEventBeforeV301.apply(this,arguments);
    const card=container?.children?.[before] || container?.lastElementChild;
    crmInjectCalendarSourceIconV301(card,item);
    return result;
  };
}

(function crmInstallCalendarSourceIconStyleV301(){
  if(document.getElementById("crmCalendarSourceIconStyleV301")) return;
  const style=document.createElement("style");
  style.id="crmCalendarSourceIconStyleV301";
  style.textContent=`
    .crm-calendar-source-icon-v301{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      flex:0 0 auto;
      width:15px;
      height:15px;
      margin-right:3px;
      font-size:11px;
      line-height:1;
      vertical-align:middle;
    }
    .crm-month-visit-main .crm-calendar-source-icon-v301{
      width:14px;
      height:14px;
      margin-right:1px;
      font-size:10px;
    }
    .crm-calendar-source-icon-v301.is-booksy{
      width:15px;
      height:15px;
      margin-right:3px;
    }
    .crm-calendar-source-icon-v301.is-booksy img{
      display:block;
      width:14px;
      height:14px;
      object-fit:contain;
    }
  `;
  document.head.appendChild(style);
})();

/* Po załadowaniu cenników odśwież kalendarz, żeby źródło/kolor/ikona
   były liczone już z aktualnego DOM + Booksy. */
window.addEventListener("load",()=>{
  setTimeout(()=>{
    try{
      if(typeof renderBooksyCalendar==="function") renderBooksyCalendar();
    }catch(error){
      console.warn("V30.1: nie udało się odświeżyć ikon źródła kalendarza",error);
    }
  },700);
});

/* KONIEC V30.1 — IKONY ŹRÓDŁA KALENDARZA */

/* BUILD V30.3 — BOOKSY MARK + WORK-SCHEDULE FRONTEND */


/* ==========================================================================
   V30.4 — CZYTELNY KALENDARZ: ŹRÓDŁO + STATUS + CZAS / KLIENT
   - mała karta miesiąca ma 2 prawdziwe wiersze;
   - Booksy = znak Booksy;
   - DOM = domek + sposób utworzenia (Google / CRM / strona);
   - ikona kategorii zabiegu w drugim wierszu;
   - te same informacje w tygodniu, liście "+N pozostałe" i szczegółach wizyty.
   ========================================================================== */

function crmV304Norm(value){
  return String(value||"")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[\s-]+/g,"_");
}

function crmV304RawSource(item){
  return crmV304Norm([
    item?.bookingSource,item?.source,item?.origin,item?.sourceType,item?.channel
  ].filter(Boolean).join(" "));
}

function crmV304OriginMeta(item){
  const raw=crmV304RawSource(item);
  const eventType=String(item?.eventType||"").toLowerCase();

  if(eventType==="external"){
    return {kind:"GOOGLE",label:"Google Calendar",primary:"google",origin:""};
  }
  if(eventType==="block"){
    return {kind:"GOOGLE_BLOCK",label:"Google Calendar · blokada",primary:"google",origin:""};
  }
  if(eventType==="work_shift"){
    return {kind:"WORK_SHIFT",label:"Grafik pracy",primary:"schedule",origin:""};
  }

  if(raw.includes("booksy")){
    return {kind:"BOOKSY",label:"Booksy",primary:"booksy",origin:""};
  }

  let dom=false;
  try{
    dom=crmCanonicalCategoryMetaV294(item)?.source==="DOM";
  }catch(ignore){}

  if(
    dom ||
    raw.includes("wife_calendar") ||
    raw.includes("google") ||
    raw.includes("admin") ||
    raw.includes("mistrzyni") ||
    raw.includes("master") ||
    raw.includes("index") ||
    raw.includes("online") ||
    raw.includes("client") ||
    raw.includes("klient") ||
    raw.includes("form") ||
    raw.includes("request")
  ){
    let origin="crm";
    let originLabel="CRM";

    if(raw.includes("wife_calendar") || raw.includes("google")){
      origin="google"; originLabel="Google Calendar";
    }else if(raw.includes("index") || raw.includes("online") || raw.includes("client") || raw.includes("klient") || raw.includes("form") || raw.includes("request")){
      origin="web"; originLabel="Strona";
    }else if(raw.includes("admin") || raw.includes("mistrzyni") || raw.includes("master")){
      origin="crm"; originLabel="CRM";
    }

    return {
      kind:"DOM",
      label:`DOM · ${originLabel}`,
      primary:"dom",
      origin:origin
    };
  }

  return {kind:"LEGACY",label:"CRM / starszy wpis",primary:"crm",origin:""};
}

function crmV304GoogleIconHtml(size="small"){
  return `<span class="crm-v304-origin-icon is-google ${size}" title="Google Calendar" aria-label="Google Calendar"><b>31</b></span>`;
}
function crmV304CrmIconHtml(size="small"){
  return `<span class="crm-v304-origin-icon is-crm ${size}" title="CRM" aria-label="CRM">C</span>`;
}
function crmV304WebIconHtml(size="small"){
  return `<span class="crm-v304-origin-icon is-web ${size}" title="Rezerwacja przez stronę" aria-label="Strona">◎</span>`;
}
function crmV304BooksyIconHtml(size="small"){
  return `<span class="crm-v304-source-icon is-booksy ${size}" title="Booksy" aria-label="Booksy"><img src="${crmAdminAssetPathV306("Icons/booksy-b.png")}" alt=""></span>`;
}
function crmV304DomIconHtml(size="small"){
  return `<span class="crm-v304-source-icon is-dom ${size}" title="DOM" aria-label="DOM">🏠</span>`;
}
function crmV304ScheduleIconHtml(size="small"){
  return `<span class="crm-v304-source-icon is-schedule ${size}" title="Grafik pracy" aria-label="Grafik">▦</span>`;
}

function crmV304SourceIconsHtml(item,size="small"){
  const meta=crmV304OriginMeta(item);
  if(meta.primary==="booksy") return crmV304BooksyIconHtml(size);
  if(meta.primary==="google") return crmV304GoogleIconHtml(size);
  if(meta.primary==="schedule") return crmV304ScheduleIconHtml(size);
  if(meta.primary==="crm") return crmV304CrmIconHtml(size);

  if(meta.primary==="dom"){
    let origin="";
    if(meta.origin==="google") origin=crmV304GoogleIconHtml(size);
    else if(meta.origin==="web") origin=crmV304WebIconHtml(size);
    else if(meta.origin==="crm") origin=crmV304CrmIconHtml(size);
    return crmV304DomIconHtml(size)+origin;
  }
  return "";
}

function crmV304CategoryIconHtml(item,size="small"){
  if(!item || item.eventType!=="appointment") return "";
  try{
    const meta=crmCanonicalCategoryMetaV294(item);
    const icon=String(meta?.icon||CRM_PRICE_ICON_FALLBACK_V27||"universal");
    const src=crmPriceIconSrcV27(icon);
    const title=String(meta?.category||"Kategoria");
    return `<img class="crm-v304-category-icon ${size}" src="${crmAdminEscapeV28(src)}" alt="" title="${crmAdminEscapeV28(title)}">`;
  }catch(ignore){
    return "";
  }
}

function crmV304StatusHtml(item,size="small"){
  const icon=typeof crmStatusIcon==="function" ? crmStatusIcon(item) : "●";
  return `<i class="crm-v304-status ${size}" title="Status">${crmEscapeText(icon)}</i>`;
}

function crmV304ClientLabel(item){
  const client=String(typeof crmVisitClient==="function" ? crmVisitClient(item) : (item?.name||"")).trim();
  if(client && client!=="Google Calendar") return client;
  const name=String(item?.name||"").trim();
  if(name) return name;
  return String(typeof crmVisitService==="function" ? crmVisitService(item) : (item?.service||"Wizyta"));
}

function crmV304TopLineHtml(item,timeText,size="small"){
  return `<span class="crm-v304-top ${size}">
    <span class="crm-v304-source-pack">${crmV304SourceIconsHtml(item,size)}</span>
    ${crmV304StatusHtml(item,size)}
    <b>${crmEscapeText(timeText||"")}</b>
  </span>`;
}

/* MIESIĄC: dwa rzeczywiste wiersze. */
crmCreateMonthVisitCard = function(item){
  const button=document.createElement("button");
  button.type="button";
  button.className="crm-month-visit-card crm-v304-month-card";
  const color=crmVisitCategoryColor(item);
  button.style.setProperty("--crm-event-color",color);
  button.style.setProperty("--crm-event-soft",crmHexToSoftBackground(color));
  button.dataset.visitKey=crmVisitStableKey(item);

  const start=new Date(item?.date);
  const time=Number.isNaN(start.getTime())?"":formatCalendarTime(start);
  const client=crmV304ClientLabel(item);
  const service=crmVisitService(item);

  button.innerHTML=`
    ${crmV304TopLineHtml(item,time,"small")}
    <span class="crm-v304-bottom">
      ${crmV304CategoryIconHtml(item,"small")}
      <span class="crm-v304-client">${crmEscapeText(client)}</span>
    </span>`;

  button.title=`${crmVisitEndTime(item)} · ${client} · ${service} · ${crmV304OriginMeta(item).label}`;
  button.addEventListener("click",event=>{
    event.stopPropagation();
    openAppointmentDetailsModal(item);
  });
  return button;
};

crmMonthCellCapacity = function(body,eventCount){
  const styles=getComputedStyle(body);
  const gap=parseFloat(styles.rowGap||styles.gap)||4;
  const available=Math.max(0,body.clientHeight);
  const cardHeight=43;
  const moreHeight=24;
  let capacity=Math.max(1,Math.floor((available+gap)/(cardHeight+gap)));
  if(Number(eventCount)>capacity){
    capacity=Math.max(1,Math.floor((available-moreHeight)/(cardHeight+gap)));
  }
  return capacity;
};

/* TYDZIEŃ: źródło/status/czas + klient + usługa. */
crmCreateWeekVisitCard = function(item){
  const button=document.createElement("button");
  button.type="button";
  button.className="crm-week-visit-card crm-v304-week-card";
  const color=crmVisitCategoryColor(item);
  button.style.setProperty("--crm-event-color",color);
  button.style.setProperty("--crm-event-soft",crmHexToSoftBackground(color));
  button.dataset.visitKey=crmVisitStableKey(item);

  const client=crmV304ClientLabel(item);
  const service=crmVisitService(item);
  const time=crmVisitEndTime(item);

  button.innerHTML=`
    ${crmV304TopLineHtml(item,time,"medium")}
    <span class="crm-v304-week-client">${crmV304CategoryIconHtml(item,"medium")}<strong>${crmEscapeText(client)}</strong></span>
    <small class="crm-v304-week-service">${crmEscapeText(service)}</small>`;
  button.title=`${time} · ${client} · ${service} · ${crmV304OriginMeta(item).label}`;
  button.addEventListener("click",()=>openAppointmentDetailsModal(item));
  return button;
};

/* DZIEŃ: metadane są zawsze w pierwszym wierszu. */
crmRenderThreeDayEvent = function(entry,layer,rangeStart,pixelsPerMinute){
  const item=entry.item;
  const palette=crmCategoryPalette(item);
  const card=document.createElement("button");
  card.type="button";
  card.className="crm-3day-event crm-day-card-adaptive crm-v304-day-card";

  const exactTop=Math.round((entry.start-rangeStart)*pixelsPerMinute);
  const durationMinutes=Math.max(5,entry.end-entry.start);
  const exactHeight=Math.max(8,Math.round(durationMinutes*pixelsPerMinute)-2);
  card.style.top=`${exactTop}px`;
  card.style.height=`${exactHeight}px`;
  card.dataset.durationMinutes=String(durationMinutes);
  card.dataset.renderedHeight=String(exactHeight);
  card.style.setProperty("--event-stripe",palette.stripe);
  card.style.setProperty("--event-fill",palette.fill);

  const timeText=`${crmFormatVisitTime(entry.date)} – ${crmFormatVisitTime(entry.endDate)}`;
  const serviceText=String(item.service||item.name||"Wpis");
  const clientText=item.eventType==="appointment" ? String(item.name||"") : crmV304ClientLabel(item);

  if(exactHeight<30){
    card.classList.add("has-one-row");
    card.innerHTML=`<span class="crm-day-card-line">
      ${crmV304SourceIconsHtml(item,"small")}${crmV304StatusHtml(item,"small")}
      <b>${crmSafeText(timeText)}</b>
      <span class="crm-day-card-line__client">${crmSafeText(clientText)}</span>
    </span>`;
  }else if(exactHeight<52){
    card.classList.add("has-two-rows");
    card.innerHTML=`
      ${crmV304TopLineHtml(item,timeText,"small")}
      <strong class="crm-v304-day-client">${crmV304CategoryIconHtml(item,"small")}${crmSafeText(clientText||serviceText)}</strong>`;
  }else{
    card.classList.add("has-full-content");
    card.innerHTML=`
      ${crmV304TopLineHtml(item,timeText,"medium")}
      <strong class="crm-v304-day-client">${crmV304CategoryIconHtml(item,"medium")}${crmSafeText(clientText||serviceText)}</strong>
      <span class="crm-v304-day-service">${crmSafeText(serviceText)}</span>`;
  }

  card.title=`${timeText} · ${clientText} · ${serviceText} · ${crmV304OriginMeta(item).label}`.trim();
  if(item.eventType!=="work_shift") card.onclick=()=>openAppointmentDetailsModal(item);
  else card.disabled=true;
  layer.appendChild(card);
};

/* +N POZOSTAŁE: ta sama hierarchia informacji. */
crmRenderDayVisitsList = function(){
  if(!crmOpenDayListDate) return;
  const title=document.getElementById("crmDayVisitsTitle");
  const body=document.getElementById("crmDayVisitsBody");
  if(!title||!body) return;

  title.textContent=crmOpenDayListDate.toLocaleDateString("pl-PL",{
    weekday:"long",day:"numeric",month:"long",year:"numeric"
  });

  const events=getCalendarEventsForDate(crmOpenDayListDate).filter(item=>item.eventType!=="work_shift");
  body.innerHTML="";

  if(!events.length){
    const empty=document.createElement("p");
    empty.className="crm-day-list-empty";
    empty.textContent="Brak wizyt w tym dniu.";
    body.appendChild(empty);
    return;
  }

  events.forEach(item=>{
    const key=crmVisitStableKey(item);
    const button=document.createElement("button");
    button.type="button";
    button.className="crm-day-list-item crm-v304-day-list-item"+(key===crmOpenDayListSelectedKey?" is-selected":"");

    const palette=typeof crmCategoryPalette==="function"?crmCategoryPalette(item):null;
    const color=palette?.stripe||crmVisitCategoryColor(item);
    const softColor=palette?.fill||crmHexToSoftBackground(color);
    button.style.setProperty("--crm-event-color",color);
    button.style.setProperty("--crm-event-soft",softColor);

    const client=crmV304ClientLabel(item);
    const service=crmVisitService(item);

    button.innerHTML=`
      <span class="crm-v304-day-list-top">
        ${crmV304SourceIconsHtml(item,"medium")}
        ${crmV304StatusHtml(item,"medium")}
        <b>${crmEscapeText(crmVisitEndTime(item))}</b>
      </span>
      <strong class="crm-v304-day-list-client">${crmV304CategoryIconHtml(item,"medium")}${crmEscapeText(client)}</strong>
      <small class="crm-v304-day-list-service">${crmEscapeText(service)}</small>`;

    button.title=`${client} · ${service} · ${crmV304OriginMeta(item).label}`;
    button.addEventListener("click",()=>{
      crmOpenDayListSelectedKey=key;
      body.querySelectorAll(".crm-day-list-item").forEach(node=>node.classList.remove("is-selected"));
      button.classList.add("is-selected");
      openAppointmentDetailsModal(item);
    });
    body.appendChild(button);
  });
};

function crmV304ApplyDetailsSource(item){
  const source=crmV304OriginMeta(item);
  const badge=document.getElementById("crmVisitSourceBadge");
  const infoSource=document.getElementById("crmInfoSource");

  const iconPack=crmV304SourceIconsHtml(item,"large");
  const category=crmV304CategoryIconHtml(item,"large");
  const rich=`<span class="crm-v304-details-icons">${iconPack}${category}</span><span>${crmAdminEscapeV28(source.label)}</span>`;

  if(badge){
    badge.innerHTML=rich;
    badge.classList.add("crm-v304-details-source");
    badge.title=source.label;
    badge.style.display="inline-flex";
  }
  if(infoSource){
    infoSource.innerHTML=rich;
    infoSource.classList.add("crm-v304-details-source");
    infoSource.title=source.label;
  }
}

if(typeof openAppointmentDetailsModal==="function"){
  const crmV304OpenDetailsBefore=openAppointmentDetailsModal;
  openAppointmentDetailsModal=function(item){
    const result=crmV304OpenDetailsBefore.apply(this,arguments);
    requestAnimationFrame(()=>crmV304ApplyDetailsSource(item));
    return result;
  };
}

(function crmInstallV304Styles(){
  if(document.getElementById("crmCalendarV304Styles")) return;
  const style=document.createElement("style");
  style.id="crmCalendarV304Styles";
  style.textContent=`
    .crm-v304-source-pack,
    .crm-v304-details-icons{
      display:inline-flex;align-items:center;gap:2px;flex:0 0 auto;min-width:0;
    }
    .crm-v304-source-icon,
    .crm-v304-origin-icon{
      display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;
      box-sizing:border-box;overflow:hidden;
    }
    .crm-v304-source-icon.small,.crm-v304-origin-icon.small{width:14px;height:14px;font-size:11px}
    .crm-v304-source-icon.medium,.crm-v304-origin-icon.medium{width:17px;height:17px;font-size:12px}
    .crm-v304-source-icon.large,.crm-v304-origin-icon.large{width:21px;height:21px;font-size:14px}
    .crm-v304-source-icon.is-booksy img{display:block;width:100%;height:100%;object-fit:contain}
    .crm-v304-source-icon.is-dom{font-size:12px}
    .crm-v304-source-icon.is-schedule{
      border:1px solid #d5b54d;border-radius:4px;background:#fff8d9;color:#9a7b18;font-weight:800
    }
    .crm-v304-origin-icon{border-radius:4px;font-weight:900;line-height:1}
    .crm-v304-origin-icon.is-google{
      border:1px solid #bfc7d2;background:#fff;color:#4b5563;font-family:Arial,sans-serif;
    }
    .crm-v304-origin-icon.is-google b{font-size:.66em;letter-spacing:-.04em}
    .crm-v304-origin-icon.is-crm{
      background:#d55278;color:#fff;border:1px solid #c9466d;font-family:Arial,sans-serif;
    }
    .crm-v304-origin-icon.is-web{
      background:#eef6ff;color:#3e6f9f;border:1px solid #bfd8ef;font-weight:900;
    }
    .crm-v304-status{
      display:inline-flex!important;align-items:center;justify-content:center!important;
      margin:0!important;flex:0 0 auto!important;
    }
    .crm-v304-status.small{width:13px!important;height:13px!important;font-size:10px!important}
    .crm-v304-status.medium{width:16px!important;height:16px!important;font-size:11px!important}
    .crm-v304-category-icon{
      object-fit:contain;flex:0 0 auto;display:block;
    }
    .crm-v304-category-icon.small{width:14px;height:14px}
    .crm-v304-category-icon.medium{width:18px;height:18px}
    .crm-v304-category-icon.large{width:22px;height:22px}

    .crm-month-visit-card.crm-v304-month-card{
      min-height:43px!important;height:43px!important;
      padding:4px 5px!important;
      display:grid!important;
      grid-template-rows:16px 17px!important;
      gap:2px!important;
      align-content:center!important;
      overflow:hidden!important;
    }
    .crm-v304-top{
      display:flex!important;align-items:center!important;gap:3px!important;min-width:0!important;
      width:100%!important;white-space:nowrap!important;overflow:hidden!important;
    }
    .crm-v304-top b{
      font-size:10px!important;line-height:1!important;white-space:nowrap!important;flex:0 0 auto!important;
    }
    .crm-v304-bottom{
      display:flex!important;align-items:center!important;gap:4px!important;min-width:0!important;
      width:100%!important;overflow:hidden!important;
    }
    .crm-v304-client{
      display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;
      white-space:nowrap!important;font-size:10px!important;line-height:1.1!important;font-weight:700!important;
    }

    .crm-week-visit-card.crm-v304-week-card{
      min-height:76px!important;display:grid!important;grid-template-rows:auto auto auto!important;gap:4px!important;
      padding:7px 8px!important;overflow:hidden!important;
    }
    .crm-v304-week-client,.crm-v304-day-client{
      display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important;
      overflow:hidden!important;
    }
    .crm-v304-week-client strong,.crm-v304-day-client{
      min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
    }
    .crm-v304-week-service,.crm-v304-day-service{
      display:block!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
    }

    .crm-v304-day-card .crm-v304-top{padding:0 2px}
    .crm-v304-day-card .crm-v304-day-client{padding:0 2px}
    .crm-v304-day-card .crm-v304-day-service{padding:0 2px}

    .crm-day-list-item.crm-v304-day-list-item{
      display:grid!important;
      grid-template-columns:1fr!important;
      grid-template-rows:auto auto auto!important;
      gap:5px!important;
      align-items:start!important;
      min-height:78px!important;
      padding:10px 12px!important;
    }
    .crm-v304-day-list-top{
      display:flex;align-items:center;gap:4px;min-width:0;
    }
    .crm-v304-day-list-top b{font-size:12px;white-space:nowrap}
    .crm-v304-day-list-client{
      display:flex;align-items:center;gap:6px;min-width:0;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;
    }
    .crm-v304-day-list-service{
      display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      font-size:11px;opacity:.78;
    }

    #appointmentDetailsModal .crm-v304-details-source{
      display:inline-flex!important;align-items:center!important;gap:6px!important;
      max-width:100%!important;white-space:nowrap!important;
    }
    #appointmentDetailsModal .crm-v304-details-icons{gap:4px}
    #appointmentDetailsModal #crmVisitSourceBadge.crm-v304-details-source{
      padding:5px 8px!important;font-size:10px!important;
    }

    @media (max-width:1100px){
      .crm-month-visit-card.crm-v304-month-card{padding-left:4px!important;padding-right:4px!important}
      .crm-v304-source-icon.small,.crm-v304-origin-icon.small{width:13px;height:13px}
      .crm-v304-category-icon.small{width:13px;height:13px}
      .crm-v304-client{font-size:9.5px!important}
      .crm-v304-top b{font-size:9.5px!important}
    }
  `;
  document.head.appendChild(style);
})();

setTimeout(()=>{
  try{ if(typeof renderBooksyCalendar==="function") renderBooksyCalendar(); }catch(ignore){}
},0);

window.crmCalendarReadabilityVersionV304="30.4-source-origin-status-client-category";
/* KONIEC V30.4 */


/* ==========================================================================
   V30.5 — IKONY ŹRÓDŁA BEZ TEKSTU + OCHRONA PRZED NAKŁADANIEM TYPOGRAFII
   ========================================================================== */

function crmV305GoogleIconSrc(){
  return crmAdminAssetPathV306("Icons/google-calendar.svg");
}

crmV304GoogleIconHtml = function(size="small"){
  return `<span class="crm-v304-origin-icon is-google ${size}" title="Google Calendar" aria-label="Google Calendar"><img src="${crmV305GoogleIconSrc()}" alt=""></span>`;
};

crmV304ApplyDetailsSource = function(item){
  const source=crmV304OriginMeta(item);
  const badge=document.getElementById("crmVisitSourceBadge");
  const infoSource=document.getElementById("crmInfoSource");
  const rich=`<span class="crm-v304-details-icons" aria-label="${crmAdminEscapeV28(source.label)}">${crmV304SourceIconsHtml(item,"large")}${crmV304CategoryIconHtml(item,"large")}</span>`;

  [badge,infoSource].forEach(node=>{
    if(!node) return;
    node.innerHTML=rich;
    node.classList.add("crm-v304-details-source","crm-v305-icons-only");
    node.title=source.label;
    node.setAttribute("aria-label",source.label);
  });
  if(badge) badge.style.display="inline-flex";
};

(function crmInstallV305Styles(){
  if(document.getElementById("crmCalendarV305Styles")) return;
  const style=document.createElement("style");
  style.id="crmCalendarV305Styles";
  style.textContent=`
    .crm-v304-origin-icon.is-google{
      border:0!important;background:transparent!important;padding:0!important;
      border-radius:3px!important;overflow:visible!important;
    }
    .crm-v304-origin-icon.is-google img{
      display:block!important;width:100%!important;height:100%!important;
      object-fit:contain!important;margin:0!important;padding:0!important;
    }
    .crm-v304-origin-icon.is-google b{display:none!important}

    .crm-v304-month-card .crm-v304-top,
    .crm-v304-month-card .crm-v304-bottom,
    .crm-v304-month-card .crm-v304-client,
    .crm-v304-week-card .crm-v304-top,
    .crm-v304-week-card .crm-v304-week-client,
    .crm-v304-week-card .crm-v304-week-service,
    .crm-v304-day-card .crm-v304-top,
    .crm-v304-day-card .crm-v304-day-client,
    .crm-v304-day-card .crm-v304-day-service,
    .crm-v304-day-card .crm-day-card-line,
    .crm-v304-day-card .crm-day-card-line__client,
    .crm-v304-day-list-item .crm-v304-day-list-top,
    .crm-v304-day-list-item .crm-v304-day-list-client,
    .crm-v304-day-list-item .crm-v304-day-list-service,
    .crm-v304-details-source,
    .crm-v304-details-source .crm-v304-details-icons{
      position:static!important;inset:auto!important;transform:none!important;
      float:none!important;margin:0!important;box-sizing:border-box!important;
    }

    .crm-v304-source-pack,.crm-v304-details-icons{
      display:inline-flex!important;align-items:center!important;flex-wrap:nowrap!important;
      gap:3px!important;min-width:0!important;line-height:1!important;
    }

    .crm-month-visit-card.crm-v304-month-card{
      min-height:44px!important;height:44px!important;padding:4px 5px!important;
      display:grid!important;grid-template-columns:minmax(0,1fr)!important;
      grid-template-rows:16px 18px!important;gap:2px!important;align-content:center!important;
      overflow:hidden!important;white-space:normal!important;
    }
    .crm-v304-top{
      display:flex!important;align-items:center!important;gap:3px!important;
      width:100%!important;min-width:0!important;max-width:100%!important;
      height:16px!important;line-height:16px!important;white-space:nowrap!important;
      overflow:hidden!important;
    }
    .crm-v304-top b{
      display:block!important;flex:0 0 auto!important;margin:0!important;padding:0!important;
      font-size:10px!important;line-height:16px!important;white-space:nowrap!important;
      position:static!important;transform:none!important;
    }
    .crm-v304-status{
      position:static!important;transform:none!important;margin:0!important;line-height:1!important;
    }
    .crm-v304-bottom{
      display:flex!important;align-items:center!important;gap:4px!important;
      width:100%!important;min-width:0!important;max-width:100%!important;
      height:18px!important;line-height:18px!important;overflow:hidden!important;
    }
    .crm-v304-client{
      display:block!important;flex:1 1 auto!important;min-width:0!important;max-width:100%!important;
      height:18px!important;margin:0!important;padding:0!important;overflow:hidden!important;
      text-overflow:ellipsis!important;white-space:nowrap!important;font-size:10px!important;
      font-weight:700!important;line-height:18px!important;
    }

    .crm-week-visit-card.crm-v304-week-card{
      min-height:74px!important;padding:7px 8px!important;display:grid!important;
      grid-template-columns:minmax(0,1fr)!important;grid-template-rows:18px 20px 16px!important;
      gap:3px!important;align-content:start!important;overflow:hidden!important;
    }
    .crm-v304-week-client{
      display:flex!important;align-items:center!important;gap:5px!important;
      min-width:0!important;height:20px!important;line-height:20px!important;overflow:hidden!important;
    }
    .crm-v304-week-client strong{
      display:block!important;min-width:0!important;overflow:hidden!important;
      text-overflow:ellipsis!important;white-space:nowrap!important;line-height:20px!important;
    }
    .crm-v304-week-service{
      display:block!important;min-width:0!important;height:16px!important;margin:0!important;
      overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
      line-height:16px!important;
    }

    .crm-v304-day-card{overflow:hidden!important;padding-top:3px!important;padding-bottom:3px!important}
    .crm-v304-day-card.has-one-row{display:flex!important;align-items:center!important}
    .crm-v304-day-card.has-two-rows,
    .crm-v304-day-card.has-full-content{
      display:grid!important;grid-template-columns:minmax(0,1fr)!important;
      align-content:start!important;row-gap:2px!important;
    }
    .crm-v304-day-card.has-two-rows{grid-template-rows:18px 20px!important}
    .crm-v304-day-card.has-full-content{grid-template-rows:18px 20px minmax(14px,auto)!important}
    .crm-v304-day-card .crm-day-card-line{
      display:flex!important;align-items:center!important;gap:3px!important;min-width:0!important;
      width:100%!important;overflow:hidden!important;white-space:nowrap!important;line-height:16px!important;
    }
    .crm-v304-day-card .crm-day-card-line b{flex:0 0 auto!important;line-height:16px!important}
    .crm-v304-day-card .crm-day-card-line__client{
      flex:1 1 auto!important;min-width:0!important;overflow:hidden!important;
      text-overflow:ellipsis!important;white-space:nowrap!important;line-height:16px!important;
    }
    .crm-v304-day-card .crm-v304-day-client{
      display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important;
      height:20px!important;overflow:hidden!important;text-overflow:ellipsis!important;
      white-space:nowrap!important;line-height:20px!important;
    }
    .crm-v304-day-card .crm-v304-day-service{
      display:block!important;min-width:0!important;overflow:hidden!important;
      text-overflow:ellipsis!important;white-space:nowrap!important;line-height:16px!important;
    }

    .crm-day-list-item.crm-v304-day-list-item{
      display:grid!important;grid-template-columns:minmax(0,1fr)!important;
      grid-template-rows:20px 22px minmax(16px,auto)!important;
      align-content:start!important;align-items:start!important;row-gap:4px!important;column-gap:0!important;
      min-height:86px!important;height:auto!important;padding:10px 12px!important;
      overflow:hidden!important;white-space:normal!important;
    }
    .crm-day-list-item.crm-v304-day-list-item > *{
      min-width:0!important;width:100%!important;max-width:100%!important;
    }
    .crm-v304-day-list-top{
      display:flex!important;align-items:center!important;gap:4px!important;
      height:20px!important;min-width:0!important;overflow:hidden!important;
      white-space:nowrap!important;line-height:20px!important;
    }
    .crm-v304-day-list-top b{
      display:block!important;flex:0 0 auto!important;margin:0!important;padding:0!important;
      font-size:12px!important;line-height:20px!important;white-space:nowrap!important;
    }
    .crm-v304-day-list-client{
      display:flex!important;align-items:center!important;gap:6px!important;height:22px!important;
      min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;
      white-space:nowrap!important;font-size:13px!important;line-height:22px!important;
    }
    .crm-v304-day-list-service{
      display:block!important;min-width:0!important;min-height:16px!important;margin:0!important;padding:0!important;
      overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
      font-size:11px!important;line-height:16px!important;opacity:.78!important;
    }

    #appointmentDetailsModal .crm-v304-details-source.crm-v305-icons-only{
      display:inline-flex!important;align-items:center!important;justify-content:center!important;
      width:auto!important;min-width:0!important;max-width:max-content!important;height:30px!important;
      padding:4px 7px!important;gap:0!important;overflow:hidden!important;white-space:nowrap!important;
      line-height:1!important;transform:none!important;
    }
    #appointmentDetailsModal #crmVisitSourceBadge.crm-v304-details-source.crm-v305-icons-only{
      transform:none!important;font-size:0!important;min-width:0!important;
    }
    #appointmentDetailsModal .crm-v304-details-source.crm-v305-icons-only > span:not(.crm-v304-details-icons){
      display:none!important;
    }
    #appointmentDetailsModal .crm-v304-details-icons{
      display:inline-flex!important;align-items:center!important;justify-content:center!important;
      width:auto!important;max-width:100%!important;height:22px!important;
      gap:4px!important;line-height:1!important;overflow:hidden!important;
    }

    @media (max-width:1100px){
      .crm-v304-source-icon.small,.crm-v304-origin-icon.small{width:13px!important;height:13px!important}
      .crm-v304-category-icon.small{width:13px!important;height:13px!important}
      .crm-v304-client{font-size:9.5px!important}
      .crm-v304-top b{font-size:9.5px!important}
    }
  `;
  document.head.appendChild(style);
})();

setTimeout(()=>{
  try{ if(typeof renderBooksyCalendar==="function") renderBooksyCalendar(); }catch(ignore){}
},0);

window.crmCalendarReadabilityVersionV305="30.6-icons-only-no-overlap-dev-paths";
/* KONIEC V30.5 / poprawka V30.6: ścieżki assetów ADMIN+DEV */


/* ==========================================================================
   V30.7 — WSZYSTKIE WIZYTY: KOMPAKTOWE 3 WIERSZE + BOOKSY PHONE RULE
   ========================================================================== */

function crmV307HasRealPhone(item){
  const raw=String(item?.phone||item?.phoneNumber||"").trim();
  if(!raw) return false;
  const normalized=raw.toLocaleLowerCase("pl-PL");
  return !["—","-","brak","brak numeru","numer telefonu","google calendar","google kalendarz"].includes(normalized);
}

function crmV307ApplyBooksyPhoneRule(item){
  const row=document.getElementById("details-phone-row");
  if(!row) return;
  const isBooksy=typeof crmVisitIsBooksyV294==="function" ? crmVisitIsBooksyV294(item) : /booksy/i.test(String(item?.bookingSource||item?.source||""));
  if(isBooksy && !crmV307HasRealPhone(item)){
    row.hidden=true;
    row.style.setProperty("display","none","important");
    return;
  }
  /* Pozostałe źródła zostają zgodne z istniejącymi regułami panelu. */
  if(item?.eventType!=="block" && item?.eventType!=="work_shift"){
    row.hidden=false;
    row.style.removeProperty("display");
  }
}

if(typeof openAppointmentDetailsModal==="function"){
  const crmV307OpenDetailsBefore=openAppointmentDetailsModal;
  openAppointmentDetailsModal=function(item){
    const result=crmV307OpenDetailsBefore.apply(this,arguments);
    requestAnimationFrame(()=>{
      try{ crmV307ApplyBooksyPhoneRule(item); }catch(ignore){}
      if(item?.eventType==="external"){
        const description=document.getElementById("crmServiceDescription");
        if(description) description.textContent="Wydarzenie zewnętrzne";
      }
    });
    return result;
  };
}

(function crmInstallV307Styles(){
  if(document.getElementById("crmCalendarV307Styles")) return;
  const style=document.createElement("style");
  style.id="crmCalendarV307Styles";
  style.textContent=`
    #crmDayVisitsOverlay .crm-day-list-panel{
      --crm-day-list-card-min-height:66px;
      --crm-day-list-card-pad-y:8px;
      --crm-day-list-card-pad-x:10px;
      --crm-day-list-card-gap:2px;
      --crm-day-list-card-radius:12px;
      --crm-day-list-stripe-width:5px;
      --crm-day-list-time-size:11px;
      --crm-day-list-client-size:13px;
      --crm-day-list-service-size:10.5px;
      --crm-day-list-text-color:#3b3338;
      --crm-day-list-service-color:#746a70;
      --crm-day-list-icon-size:16px;
    }

    #crmDayVisitsOverlay .crm-day-list-body{
      gap:7px!important;
      padding:10px 12px 14px!important;
    }

    #crmDayVisitsOverlay .crm-day-list-item.crm-v304-day-list-item{
      display:flex!important;
      flex-direction:column!important;
      align-items:stretch!important;
      justify-content:center!important;
      width:100%!important;
      min-width:0!important;
      min-height:var(--crm-day-list-card-min-height)!important;
      height:auto!important;
      padding:var(--crm-day-list-card-pad-y) var(--crm-day-list-card-pad-x)!important;
      gap:var(--crm-day-list-card-gap)!important;
      border-radius:var(--crm-day-list-card-radius)!important;
      border-left-width:var(--crm-day-list-stripe-width)!important;
      overflow:hidden!important;
      white-space:normal!important;
      text-align:left!important;
    }

    #crmDayVisitsOverlay .crm-day-list-item.crm-v304-day-list-item > *{
      position:static!important;
      inset:auto!important;
      transform:none!important;
      float:none!important;
      flex:none!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:0!important;
      padding:0!important;
      box-sizing:border-box!important;
    }

    #crmDayVisitsOverlay .crm-v304-day-list-top{
      order:1!important;
      display:flex!important;
      align-items:center!important;
      gap:4px!important;
      height:18px!important;
      min-height:18px!important;
      overflow:hidden!important;
      white-space:nowrap!important;
      line-height:18px!important;
    }
    #crmDayVisitsOverlay .crm-v304-day-list-top .crm-v304-status{
      display:none!important;
    }
    #crmDayVisitsOverlay .crm-v304-day-list-top b{
      display:block!important;
      flex:0 0 auto!important;
      font-size:var(--crm-day-list-time-size)!important;
      line-height:18px!important;
      color:var(--crm-day-list-text-color)!important;
      white-space:nowrap!important;
    }

    #crmDayVisitsOverlay .crm-v304-day-list-client{
      order:2!important;
      display:flex!important;
      align-items:center!important;
      gap:5px!important;
      height:20px!important;
      min-height:20px!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      font-size:var(--crm-day-list-client-size)!important;
      line-height:20px!important;
      font-weight:750!important;
      color:var(--crm-day-list-text-color)!important;
    }
    #crmDayVisitsOverlay .crm-v304-day-list-client .crm-v304-category-icon{
      width:var(--crm-day-list-icon-size)!important;
      height:var(--crm-day-list-icon-size)!important;
      flex:0 0 var(--crm-day-list-icon-size)!important;
    }

    #crmDayVisitsOverlay .crm-v304-day-list-service{
      order:3!important;
      display:block!important;
      height:16px!important;
      min-height:16px!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      font-size:var(--crm-day-list-service-size)!important;
      line-height:16px!important;
      font-weight:500!important;
      color:var(--crm-day-list-service-color)!important;
      opacity:1!important;
    }

    #crmDayVisitsOverlay .crm-v304-source-pack{
      flex:0 0 auto!important;
      width:auto!important;
      max-width:max-content!important;
      gap:3px!important;
    }

    #crmDayVisitsOverlay .crm-day-list-panel > header{
      min-height:78px!important;
    }
    #crmDayVisitsOverlay .crm-day-list-panel > header span{
      line-height:1.1!important;
    }
    #crmDayVisitsOverlay .crm-day-list-panel > header h3{
      line-height:1.2!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
    }
  `;
  document.head.appendChild(style);
})();

window.crmCalendarReadabilityVersionV307="30.7-compact-day-list-booksy-phone";
/* KONIEC V30.7 */

/* ========================================================================== 
   ADMIN V30.9 — STATUS CENNIKA DOM: zapis + publikacja
   ========================================================================== */
let crmDomLastSavedFingerprintV309="";
let crmDomLastPublishedFingerprintV309="";
let crmDomServerUnpublishedV309=false;
let crmDomStatusV309="published";

function crmDomFingerprintV309(){
  try{
    return JSON.stringify((Array.isArray(currentServices)?currentServices:[]).map(item=>({
      category:item?.category||"",name:item?.name||"",price:item?.price??"",duration:item?.duration??"",
      status:item?.status||"",categoryId:item?.categoryId||"",serviceId:item?.serviceId||"",
      categoryOrder:item?.categoryOrder??"",serviceOrder:item?.serviceOrder??"",categoryColor:item?.categoryColor||"",
      categoryIcon:item?.categoryIcon||"",firstVisitMode:item?.firstVisitMode||"",firstVisitManualMinutes:item?.firstVisitManualMinutes??""
    })));
  }catch(_){return String(Date.now());}
}
function crmEnsureDomStatusV309(){
  let badge=document.getElementById("crmDomSaveStateV309");
  if(badge) return badge;
  const header=document.querySelector("#tab-cennik .page-header > div");
  if(!header) return null;
  badge=document.createElement("span");
  badge.id="crmDomSaveStateV309";
  header.appendChild(badge);
  return badge;
}
function crmDomSetStatusV309(state,message){
  crmDomStatusV309=state;
  const badge=crmEnsureDomStatusV309();
  if(!badge) return;
  const map={
    published:["is-published","Zapisano i opublikowano"],
    dirty:["is-dirty","Niezapisane zmiany"],
    saved:["is-saved","Zapisano — nieopublikowane zmiany"],
    saving:["is-busy","Zapisywanie…"],
    publishing:["is-busy","Publikowanie…"],
    saveError:["is-error","Błąd zapisu"],
    publishError:["is-error","Błąd publikacji"],
    unknown:["is-saved","Zapisano — stan publikacji nieznany"]
  };
  const cfg=map[state]||map.published;
  badge.className=cfg[0];
  badge.textContent=message||cfg[1];
  badge.dataset.state=state;
}
function crmDomDetectDirtyV309(){
  if(!crmDomLastSavedFingerprintV309) return;
  const fp=crmDomFingerprintV309();
  if(fp!==crmDomLastSavedFingerprintV309) crmDomSetStatusV309("dirty");
  else if(crmDomServerUnpublishedV309) crmDomSetStatusV309("saved");
  else if(fp===crmDomLastPublishedFingerprintV309) crmDomSetStatusV309("published");
  else crmDomSetStatusV309("saved");
}

if(typeof loadServices==="function"){
  const crmDomLoadBeforeV309=loadServices;
  loadServices=async function(){
    const result=await crmDomLoadBeforeV309.apply(this,arguments);
    const fp=crmDomFingerprintV309();
    crmDomLastSavedFingerprintV309=fp;
    crmDomLastPublishedFingerprintV309=fp;
    crmDomServerUnpublishedV309=false;
    crmDomSetStatusV309("unknown");
    try{
      let state;
      if(typeof crmGet==="function") state=await crmGet({getDomPriceState:"true"});
      else{
        const sep=String(APPS_SCRIPT_URL||"").includes("?")?"&":"?";
        const response=await fetch(String(APPS_SCRIPT_URL||"")+sep+"getDomPriceState=true&_="+Date.now());
        state=await response.json();
      }
      if(state?.success){
        crmDomServerUnpublishedV309=!Boolean(state.isPublished);
        crmDomSetStatusV309(state.isPublished?"published":"saved");
      }
    }catch(error){
      console.warn("Cennik DOM: nie udało się potwierdzić stanu publikacji",error);
      crmDomSetStatusV309("unknown");
    }
    return result;
  };
  window.loadServices=loadServices;
}
if(typeof renderServicesTable==="function"){
  const crmDomRenderBeforeV309=renderServicesTable;
  renderServicesTable=function(){
    const result=crmDomRenderBeforeV309.apply(this,arguments);
    queueMicrotask(()=>crmDomDetectDirtyV309());
    return result;
  };
  window.renderServicesTable=renderServicesTable;
}

saveDraftsToCloud=async function(){
  if(!currentServices||currentServices.length===0){alert("Brak usług do zapisania.");return false;}
  crmDomSetStatusV309("saving");
  try{
    crmSyncFirstVisitMetaV267();
    const payload={action:"saveDraftPrices",prices:currentServices};
    const data=typeof crmPost==="function"?await crmPost(payload):await (async()=>{
      const response=await fetch(APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(payload)});
      return response.json();
    })();
    if(!data?.success) throw new Error(data?.error||"Nieznany błąd");
    crmPriceListTouchCacheV25();
    crmDomLastSavedFingerprintV309=crmDomFingerprintV309();
    crmDomServerUnpublishedV309=crmDomLastSavedFingerprintV309!==crmDomLastPublishedFingerprintV309;
    crmDomSetStatusV309(crmDomServerUnpublishedV309?"saved":"published");
    if(typeof renderServicesTable==="function") renderServicesTable();
    alert("Szkic cennika zapisany.");
    return true;
  }catch(error){
    console.error(error);crmDomSetStatusV309("saveError");alert("Błąd zapisu szkicu: "+(error.message||error));return false;
  }
};
window.saveDraftsToCloud=saveDraftsToCloud;

publishDrafts=async function(){
  if(!confirm("Opublikować aktualny zapisany szkic cennika na stronie klienta?")) return false;
  if(crmDomFingerprintV309()!==crmDomLastSavedFingerprintV309){
    crmDomSetStatusV309("dirty");
    alert("Najpierw kliknij „Zapisz DOM”, aby zapisać bieżące zmiany, a dopiero potem publikuj.");
    return false;
  }
  crmDomSetStatusV309("publishing");
  try{
    const data=typeof crmPost==="function"?await crmPost({action:"publishDraftToPublic"}):await (async()=>{
      const response=await fetch(APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({action:"publishDraftToPublic"})});
      return response.json();
    })();
    if(!data?.success) throw new Error(data?.error||"Nieznany błąd");
    crmPriceListTouchCacheV25();
    crmDomLastPublishedFingerprintV309=crmDomLastSavedFingerprintV309;
    crmDomServerUnpublishedV309=false;
    crmDomSetStatusV309("published");
    alert("Cennik opublikowany.");
    return true;
  }catch(error){console.error(error);crmDomSetStatusV309("publishError");alert("Błąd publikacji: "+(error.message||error));return false;}
};
window.publishDrafts=publishDrafts;

document.addEventListener("DOMContentLoaded",()=>{crmEnsureDomStatusV309();setTimeout(crmDomDetectDirtyV309,0);});
window.crmDomPriceStatusV309={fingerprint:crmDomFingerprintV309,setStatus:crmDomSetStatusV309,getState:()=>crmDomStatusV309};
window.crmPriceListVersionV309="30.9";
