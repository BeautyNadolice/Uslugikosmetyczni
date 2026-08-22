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
          <details open class="crm-price-category" data-category-id="${category.id}">
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
          <details open class="crm-price-category" data-category-id="${category.id}">
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
