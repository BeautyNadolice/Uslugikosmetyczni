// WERSJA LOGIKI INDEX: 2026-07-27-18-40
 const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz__JS6RJOB8VwEvbmXc4J_22k3bpBLr-oCiogTIhzz3sXc5DzXfbggnfa8VhInwuWP2g/exec";
  let iti; 
let allAvailableSlots = []; 
let appointmentsData = []; 
let adminSettings = {
  buffer_hours: 1,
  safety_range_hours: 5,
  slot_interval_minutes: 45,
  work_start_hour: "09:00",
  work_end_hour: "18:00",
  start_offset_minutes: 0 
};
let flatpickrInstance = null;
let isClientApproved = false; 

// ==========================================================
// INDEX: KONTAKT DLA NOWEGO KLIENTA - GOOGLE FORM
// Stabilna wersja bez osadzonego formularza Google.
// Odpowiedź nadal zapisuje się do tego samego Google Form,
// ale formularz jest wyświetlany natywnie w naszej stronie.
// ==========================================================
const CONTACT_FORM_PUBLIC_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdyZSEXo8-qMeIaOgvT_qgT4AtAmOYV---sgo9V_qGdE3HF0w/viewform";
const CONTACT_FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdyZSEXo8-qMeIaOgvT_qgT4AtAmOYV---sgo9V_qGdE3HF0w/formResponse";
const CONTACT_FORM_ENTRY_NAME = "entry.565415087";
const CONTACT_FORM_ENTRY_PHONE = "entry.165109377";
const CONTACT_FORM_ENTRY_QUESTION = "entry.1372241831";

let contactFormAutoCloseTimer = null;
let contactFormSubmissionPending = false;

function crmContactFormStyles() {
  if (document.getElementById("crmContactFormNativeStyles")) return;

  const style = document.createElement("style");
  style.id = "crmContactFormNativeStyles";
  style.textContent = `
    #crmContactFormNative {
      padding: 18px 6px 6px;
      color: #2c2c2c;
      font-family: inherit;
    }
    #crmContactFormNative h2 {
      margin: 0 34px 20px 0;
      color: #c2a383;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      line-height: 1.2;
    }
    #crmContactFormNative .crm-contact-help {
      margin: -8px 0 20px;
      color: #6e6e6e;
      font-size: 13px;
      line-height: 1.45;
    }
    #crmContactFormNative .crm-contact-field {
      margin-bottom: 16px;
      text-align: left;
    }
    #crmContactFormNative label {
      display: block;
      margin-bottom: 7px;
      font-weight: 700;
      font-size: 14px;
    }
    #crmContactFormNative input,
    #crmContactFormNative textarea {
      width: 100%;
      border: 1px solid #dcdcdc;
      border-radius: 7px;
      background: #fff;
      color: #2c2c2c;
      font: inherit;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    #crmContactFormNative input {
      height: 42px;
      padding: 8px 12px;
    }
    #crmContactFormNative textarea {
      min-height: 120px;
      padding: 11px 12px;
      resize: vertical;
    }
    #crmContactFormNative input:focus,
    #crmContactFormNative textarea:focus {
      border-color: #c2a383;
      box-shadow: 0 0 0 2px rgba(194,163,131,.12);
    }
    #crmContactFormSubmitBtn {
      width: 100%;
      padding: 13px 16px;
      border: 0;
      border-radius: 7px;
      background: #c2a383;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }
    #crmContactFormSubmitBtn:disabled {
      opacity: .6;
      cursor: wait;
    }
    #crmContactFormSuccess {
      display: none;
      min-height: 240px;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 35px 20px;
    }
    #crmContactFormSuccess .crm-contact-success-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: #eef8f0;
      color: #27823a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 700;
    }
    #crmContactFormSuccess strong {
      display: block;
      margin-bottom: 8px;
      font-size: 18px;
    }
    #crmContactFormSuccess p {
      margin: 0;
      color: #6e6e6e;
      font-size: 14px;
      line-height: 1.45;
    }
  `;
  document.head.appendChild(style);
}

function crmGetContactFormNodes() {
  const modal = document.getElementById("contact-form-modal");
  if (!modal) return {};

  const wrapper = modal.firstElementChild;
  return {
    modal,
    wrapper,
    form: document.getElementById("crmContactFormNativeForm"),
    name: document.getElementById("crmContactName"),
    phone: document.getElementById("crmContactPhone"),
    question: document.getElementById("crmContactQuestion"),
    submit: document.getElementById("crmContactFormSubmitBtn"),
    success: document.getElementById("crmContactFormSuccess"),
    fields: document.getElementById("crmContactFormFields")
  };
}

function crmResetNativeContactForm({ clearValues = true } = {}) {
  const nodes = crmGetContactFormNodes();

  contactFormSubmissionPending = false;

  if (contactFormAutoCloseTimer) {
    clearTimeout(contactFormAutoCloseTimer);
    contactFormAutoCloseTimer = null;
  }

  if (nodes.submit) {
    nodes.submit.disabled = false;
    nodes.submit.textContent = "Wyślij zapytanie";
  }

  if (nodes.fields) nodes.fields.style.display = "block";
  if (nodes.success) nodes.success.style.display = "none";

  if (clearValues) {
    if (nodes.form) nodes.form.reset();
    if (nodes.name) nodes.name.value = "";
    if (nodes.phone) nodes.phone.value = "";
    if (nodes.question) nodes.question.value = "";
  }
}

function crmCloseContactFormModal({ reset = true } = {}) {
  const { modal } = crmGetContactFormNodes();
  if (modal) modal.style.display = "none";
  if (reset) crmResetNativeContactForm({ clearValues: true });
}

window.crmCloseContactFormModal = crmCloseContactFormModal;

function crmEnsureNativeContactForm() {
  const modal = document.getElementById("contact-form-modal");
  if (!modal) return null;

  crmContactFormStyles();

  const wrapper = modal.firstElementChild;
  if (!wrapper) return null;

  const originalIframe = wrapper.querySelector("iframe:not(#crmContactFormSubmitTarget)");
  if (originalIframe) originalIframe.style.display = "none";

  let native = document.getElementById("crmContactFormNative");
  if (native) return native;

  native = document.createElement("div");
  native.id = "crmContactFormNative";
  native.innerHTML = `
    <div id="crmContactFormFields">
      <h2>Zapytanie o pierwszą wizytę</h2>
      <p class="crm-contact-help">Wyślij krótkie zapytanie o pierwszą wizytę. Odpowiemy na podany numer telefonu.</p>

      <form id="crmContactFormNativeForm"
            action="${CONTACT_FORM_RESPONSE_URL}"
            method="POST"
            target="crmContactFormSubmitTarget"
            autocomplete="on">
        <div class="crm-contact-field">
          <label for="crmContactName">Imię i nazwisko *</label>
          <input id="crmContactName"
                 name="${CONTACT_FORM_ENTRY_NAME}"
                 type="text"
                 autocomplete="name"
                 required>
        </div>

        <div class="crm-contact-field">
          <label for="crmContactPhone">Numer telefonu *</label>
          <input id="crmContactPhone"
                 name="${CONTACT_FORM_ENTRY_PHONE}"
                 type="tel"
                 autocomplete="tel"
                 required>
        </div>

        <div class="crm-contact-field">
          <label for="crmContactQuestion">Twoje pytanie *</label>
          <textarea id="crmContactQuestion"
                    name="${CONTACT_FORM_ENTRY_QUESTION}"
                    required></textarea>
        </div>

        <button id="crmContactFormSubmitBtn" type="submit">Wyślij zapytanie</button>
      </form>
    </div>

    <div id="crmContactFormSuccess">
      <div>
        <div class="crm-contact-success-icon">✓</div>
        <strong>Dziękujemy!</strong>
        <p>Twoje zapytanie zostało wysłane.<br>To okno zamknie się automatycznie.</p>
      </div>
    </div>

    <iframe id="crmContactFormSubmitTarget"
            name="crmContactFormSubmitTarget"
            title="Wysyłanie formularza"
            style="display:none;width:0;height:0;border:0;"></iframe>
  `;

  wrapper.appendChild(native);

  const form = document.getElementById("crmContactFormNativeForm");
  const submitTarget = document.getElementById("crmContactFormSubmitTarget");

  if (form) {
    form.addEventListener("submit", () => {
      contactFormSubmissionPending = true;

      const submit = document.getElementById("crmContactFormSubmitBtn");
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Wysyłanie...";
      }
    });
  }

  if (submitTarget) {
    submitTarget.addEventListener("load", () => {
      if (!contactFormSubmissionPending) return;

      contactFormSubmissionPending = false;

      const fields = document.getElementById("crmContactFormFields");
      const success = document.getElementById("crmContactFormSuccess");
      const submit = document.getElementById("crmContactFormSubmitBtn");

      if (fields) fields.style.display = "none";
      if (success) success.style.display = "flex";
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Wyślij zapytanie";
      }

      if (contactFormAutoCloseTimer) {
        clearTimeout(contactFormAutoCloseTimer);
      }

      contactFormAutoCloseTimer = setTimeout(() => {
        crmCloseContactFormModal({ reset: true });
      }, 3000);
    });
  }

  return native;
}

function crmInstallContactFormModalBehavior() {
  const modal = document.getElementById("contact-form-modal");
  if (!modal || modal.dataset.crmNativeBehaviorInstalled === "1") return;

  modal.dataset.crmNativeBehaviorInstalled = "1";
  crmEnsureNativeContactForm();

  // Zamknięcie kliknięciem w X z istniejącego HTML też czyści formularz.
  const observer = new MutationObserver(() => {
    const hidden = window.getComputedStyle(modal).display === "none";
    if (hidden) {
      crmResetNativeContactForm({ clearValues: true });
    } else {
      crmEnsureNativeContactForm();
    }
  });

  observer.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
}

// Google Form nie jest już uruchamiany jako formularz pierwszej wizyty.
// document.addEventListener("DOMContentLoaded", crmInstallContactFormModalBehavior);

function openContactFormPrefilled(phone = "", name = "", question = "") {
  const modal = document.getElementById("contact-form-modal");
  if (!modal) return;

  crmEnsureNativeContactForm();
  crmResetNativeContactForm({ clearValues: true });

  // Najpierw zamykamy i resetujemy modal rezerwacji,
  // żeby formularz kontaktowy nie otwierał się nad drugim oknem.
  if (typeof closeBookingModal === "function") {
    closeBookingModal();
  } else {
    const bookingModal = document.getElementById("bookingModal");
    if (bookingModal) bookingModal.style.display = "none";
  }

  const nodes = crmGetContactFormNodes();
  if (nodes.name) nodes.name.value = name || "";
  if (nodes.phone) nodes.phone.value = phone || "";
  if (nodes.question) nodes.question.value = question || "";

  modal.style.display = "block";

  window.setTimeout(() => {
    if (nodes.name && !nodes.name.value) nodes.name.focus();
    else if (nodes.question) nodes.question.focus();
  }, 80);
}

window.openContactFormPrefilled = openContactFormPrefilled;

function renderUnknownClientContact(statusEl, phone) {
  if (!statusEl) return;

  statusEl.style.color = "#7a4c00";
  statusEl.innerHTML = `
    <div style="padding:10px 12px;border:1px solid #e3b341;border-radius:8px;background:#fffaf0;line-height:1.45;">
      <div style="font-weight:700;margin-bottom:8px;">Nie znaleźliśmy tego numeru w bazie klientów.</div>
      <div style="font-weight:400;margin-bottom:10px;">Jeżeli chcesz umówić pierwszą wizytę, wyślij krótkie zapytanie. Numer telefonu wpiszemy do formularza automatycznie.</div>
      <button type="button"
              id="openNewClientContactFormBtn"
              class="verify-btn"
              style="height:auto;padding:10px 14px;">Wyślij zapytanie</button>
    </div>`;

  const button = document.getElementById("openNewClientContactFormBtn");
  if (button) {
    button.onclick = () => openContactFormPrefilled(phone);
  }
}


function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    const separator = url.includes('?') ? '&' : '?';
    const script = document.createElement('script');
    script.src = `${url}${separator}callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error("JSONP request failed"));
    };
    document.body.appendChild(script);
  });
}

async function loadPortfolio() {
  const container = document.getElementById("portfolio-container");
  if (!container) return;

  container.innerHTML = '<p class="portfolio-loading">Ładowanie galerii…</p>';

  try {
    const data = await fetchJSONP(`${APPS_SCRIPT_URL}?getPortfolio=true`);
    container.innerHTML = "";

    let loadedAny = false;

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(category => {
        const images = Array.isArray(category?.images) ? category.images : [];
        if (!images.length) return;

        const section = document.createElement("section");
        section.className = "portfolio-section";

        const rawCategory = String(category?.category || "Portfolio").trim();
        const slug = rawCategory
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        if (slug) section.dataset.category = slug;

        const title = document.createElement("h3");
        title.textContent = rawCategory;

        const titleLine = document.createElement("span");
        titleLine.className = "portfolio-title-line";
        titleLine.setAttribute("aria-hidden", "true");
        title.appendChild(titleLine);

        const grid = document.createElement("div");
        grid.className = "gallery-grid";
        if (images.length === 1) grid.classList.add("gallery-grid--single");

        images.forEach(img => {
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.className = "gallery-item";
          imgEl.alt = img.name || rawCategory;
          imgEl.loading = "lazy";
          imgEl.decoding = "async";
          imgEl.onerror = function() {
            this.src = "https://via.placeholder.com/600x400?text=Daria";
          };
          grid.appendChild(imgEl);
          loadedAny = true;
        });

        section.appendChild(title);
        section.appendChild(grid);
        container.appendChild(section);
      });
    }

    if (!loadedAny) {
      container.innerHTML = '<p class="portfolio-empty">Brak zdjęć w galerii.</p>';
    }
  } catch (error) {
    console.error("Błąd ładowania portfolio:", error);
    container.innerHTML = '<p class="portfolio-error">Nie udało się załadować galerii.</p>';
  }
}

let crmIndexServicesV12 = [];

function crmIndexPublishedV12(item) {
  return ["OPUBLIKOWANY", "AKTYWNY", "PUBLISHED", "ACTIVE"]
    .includes(String(item?.status || "").trim().toUpperCase());
}

function crmIndexIconGuessV12(categoryName) {
  const name = String(categoryName || "").toLowerCase();
  if (/twarz|face|kosmet/.test(name)) return "face";
  if (/oko|oczu|rzęs|rzes|brw|henna/.test(name)) return "eyes";
  if (/manicure|paznok|nail/.test(name)) return "manicure";
  if (/pedicure|stop/.test(name)) return "pedicure";
  if (/depil|wosk/.test(name)) return "depilation";
  if (/laser/.test(name)) return "laser";
  if (/makija|makeup/.test(name)) return "makeup";
  if (/masa/.test(name)) return "face-massage";
  if (/spa|wellness/.test(name)) return "spa";
  return "universal";
}

function crmIndexIconPathV12(icon, categoryName) {
  const clean = String(icon || crmIndexIconGuessV12(categoryName) || "universal")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  return `../admin/Icons/Cennik/${clean || "universal"}.png`;
}

function crmIndexServiceMetaV12(item) {
  const parts = [];
  const showPrice = !["NIE", "NO", "FALSE", "0"].includes(
    String(item?.showPrice ?? "Tak").trim().toUpperCase()
  );
  const showDuration = !["NIE", "NO", "FALSE", "0"].includes(
    String(item?.showDuration ?? "Tak").trim().toUpperCase()
  );

  if (showPrice && item?.price !== "" && Number.isFinite(Number(item?.price))) {
    parts.push(`${Number(item.price)} zł`);
  }

  if (showDuration && Number(item?.duration) > 0) {
    parts.push(`${Number(item.duration)} min`);
  }

  return parts.join(" · ");
}

function crmIndexRenderServicePickerV12() {
  const select = document.getElementById("serviceType");
  if (!select) return;

  let host = document.getElementById("crmIndexServicePickerV12");
  if (!host) {
    host = document.createElement("div");
    host.id = "crmIndexServicePickerV12";
    host.className = "crm-index-service-picker-v12";
    select.insertAdjacentElement("afterend", host);
  }

  const published = crmIndexServicesV12
    .filter(crmIndexPublishedV12)
    .sort((a, b) =>
      (Number(a?.categoryOrder) || 0) - (Number(b?.categoryOrder) || 0) ||
      (Number(a?.serviceOrder) || 0) - (Number(b?.serviceOrder) || 0) ||
      String(a?.name || "").localeCompare(String(b?.name || ""), "pl")
    );

  if (!published.length) {
    host.innerHTML = '<div class="crm-index-service-empty-v12">Brak opublikowanych usług.</div>';
    return;
  }

  const groups = new Map();
  published.forEach(item => {
    const category = String(item?.category || "Inne").trim() || "Inne";
    const key = String(item?.categoryId || category).trim() || category;
    if (!groups.has(key)) {
      groups.set(key, {
        name: category,
        order: Number(item?.categoryOrder) || 0,
        color: String(item?.categoryColor || "#b05c75"),
        icon: String(item?.categoryIcon || ""),
        items: []
      });
    }
    groups.get(key).items.push(item);
  });

  host.innerHTML = Array.from(groups.values())
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "pl"))
    .map(group => `
      <section class="crm-index-service-group-v12" style="--crm-cat:${crmFirstVisitEscapeV9(group.color)}">
        <div class="crm-index-service-group-head-v12">
          <span class="crm-index-service-accent-v12" aria-hidden="true"></span>
          <img
            class="crm-index-service-icon-v12"
            src="${crmIndexIconPathV12(group.icon, group.name)}"
            alt=""
            loading="lazy"
            onerror="this.style.display='none'">
          <strong>${crmFirstVisitEscapeV9(group.name)}</strong>
        </div>
        <div class="crm-index-service-options-v12">
          ${group.items.map(item => {
            const meta = crmIndexServiceMetaV12(item);
            const selected = select.value === String(item.name || "");
            return `
              <button
                type="button"
                class="crm-index-service-option-v12${selected ? " is-selected" : ""}"
                data-crm-service="${crmFirstVisitEscapeV9(item.name || "")}"
                aria-pressed="${selected ? "true" : "false"}">
                <span>${crmFirstVisitEscapeV9(item.name || "")}</span>
                ${meta ? `<small>${crmFirstVisitEscapeV9(meta)}</small>` : ""}
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");

  host.querySelectorAll("[data-crm-service]").forEach(button => {
    button.addEventListener("click", () => {
      if (select.disabled) return;

      select.value = button.dataset.crmService || "";
      select.dispatchEvent(new Event("change", { bubbles: true }));

      host.querySelectorAll("[data-crm-service]").forEach(other => {
        const active = other === button;
        other.classList.toggle("is-selected", active);
        other.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });
}

async function loadServicesIntoSelect() {
  const serviceSelect = document.getElementById("serviceType");
  if (!serviceSelect) return;

  try {
    const services = await fetchJSONP(
      `${APPS_SCRIPT_URL}?getPrices=true&_cennikV12=${Date.now()}`
    );

    crmIndexServicesV12 = Array.isArray(services) ? services : [];

    const published = crmIndexServicesV12
      .filter(crmIndexPublishedV12)
      .sort((a, b) =>
        (Number(a?.categoryOrder) || 0) - (Number(b?.categoryOrder) || 0) ||
        (Number(a?.serviceOrder) || 0) - (Number(b?.serviceOrder) || 0)
      );

    serviceSelect.innerHTML =
      '<option value="" disabled selected>-- Wybierz zabieg --</option>';

    const grouped = new Map();
    published.forEach(item => {
      const category = String(item?.category || "Inne").trim() || "Inne";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(item);
    });

    grouped.forEach((items, category) => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = category;

      items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.name;
        opt.textContent = item.name;
        opt.setAttribute("data-price", item.price ?? "");
        opt.setAttribute("data-duration", item.duration ?? 45);
        opt.setAttribute("data-category", category);
        optGroup.appendChild(opt);
      });

      serviceSelect.appendChild(optGroup);
    });

    crmIndexRenderServicePickerV12();
  } catch (error) {
    console.error("Błąd ładowania usług:", error);
    crmIndexServicesV12 = [];
    serviceSelect.innerHTML =
      '<option value="" disabled>Błąd ładowania usług</option>';
    crmIndexRenderServicePickerV12();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPortfolio();
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl",
      preferredCountries: ["pl", "ua", "by"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
  }

  const serviceSelect = document.getElementById("serviceType");
  if (serviceSelect) { serviceSelect.addEventListener("change", onServiceChange); }
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) { bookingForm.addEventListener("submit", submitForm); }

  toggleFormState(false); 
});

function toggleFormState(enabled) {
  const submitBtn = document.getElementById("submitBookingBtn");
  const serviceSelect = document.getElementById("serviceType");
  const calendarInput = document.getElementById("calendarInput");
  const slotsContainer = document.getElementById("timeSlotsContainer");
  const rodoConsent = document.getElementById("rodoConsent");

  if (submitBtn) {
    submitBtn.disabled = !enabled;
    submitBtn.style.opacity = enabled ? "1" : "0.5";
    submitBtn.style.cursor = enabled ? "pointer" : "not-allowed";
  }
  if (serviceSelect) {
    serviceSelect.disabled = !enabled;
    serviceSelect.style.opacity = enabled ? "1" : "0.5";
    serviceSelect.style.cursor = enabled ? "default" : "not-allowed";
    if (!enabled) {
      serviceSelect.innerHTML = '<option value="" disabled selected>-- Najpierw zweryfikuj telefon --</option>';
      document.getElementById("priceDisplay").innerText = "";
    }
  }

  const servicePickerV12 = document.getElementById("crmIndexServicePickerV12");
  if (servicePickerV12) {
    servicePickerV12.classList.toggle("is-disabled", !enabled);
  }
  if (calendarInput) {
    calendarInput.disabled = !enabled;
    calendarInput.style.opacity = enabled ? "1" : "0.5";
    calendarInput.style.cursor = enabled ? "pointer" : "not-allowed";
    if (!enabled) {
      calendarInput.value = "";
      if (flatpickrInstance) { flatpickrInstance.clear(); }
    }
  }
  if (rodoConsent) {
    rodoConsent.disabled = !enabled;
    if (!enabled) { rodoConsent.checked = false; }
  }
  if (slotsContainer) {
    if (!enabled) {
      slotsContainer.innerHTML = '<p style="color: #c2a383; font-size: 14px; font-weight: bold;">Najpierw zweryfikuj numer telefonu...</p>';
    } else if (!calendarInput.value) {
      slotsContainer.innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
    }
  }
  if (!enabled) { document.getElementById("finalDateTime").value = ""; }
}

function onServiceChange() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
  const durationInput = document.getElementById("selectedDuration");
  if (!serviceSelect) return;
  
  const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
  if (!selectedOption) return;

  const foundPrice = selectedOption.getAttribute("data-price") || "";
  const rawDuration = selectedOption.getAttribute("data-duration") || "45";
  let foundDuration = 45;

  const durStr = String(rawDuration).trim().toLowerCase();
  if (durStr.includes(":")) {
    const parts = durStr.split(":");
    foundDuration = (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
  } else {
    foundDuration = parseInt(durStr.replace(/[^0-9]/g, ""), 10) || 45;
  }

  if (priceDisplay) { priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice + " zł" : ""; }
  if (durationInput) { durationInput.value = foundDuration; }

  const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
  initCalendar(savedDate);
  if (savedDate) { displayTimeSlots(savedDate); }
}

async function loadFreeSlots() {
  try {
    const data = await fetchJSONP(`${APPS_SCRIPT_URL}?checkBusy=true`); 
    allAvailableSlots = data.busySlots || [];
    appointmentsData = data.appointments || []; 
    if (data.settings) { adminSettings = { ...adminSettings, ...data.settings }; }
    const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
    initCalendar(savedDate);
    if (savedDate) { displayTimeSlots(savedDate); }
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    const container = document.getElementById("timeSlotsContainer");
    if (container) { container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów.</p>'; }
  }
}

function getBaseWorkingHours() {
  const baseWorkingHours = [];
  const startStr = adminSettings.work_start_hour || "09:00";
  const endStr = adminSettings.work_end_hour || "18:00";
  const step = 5; 
  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);
  let currentTotalMinutes = (startH * 60) + startM;
  const totalEndMinutes = (endH * 60) + endM;
  while (currentTotalMinutes < totalEndMinutes) {
    const h = Math.floor(currentTotalMinutes / 60);
    const m = currentTotalMinutes % 60;
    baseWorkingHours.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    currentTotalMinutes += step;
  }
  return baseWorkingHours;
}

function getFreeSlotsForService(dateStr) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const baseWorkingHours = getBaseWorkingHours();
  const durationInput = document.getElementById("selectedDuration");
  const serviceDurationMinutes = durationInput ? parseInt(durationInput.value, 10) : 45;
  const startOffsetMs = (parseInt(adminSettings.start_offset_minutes, 10) || 0) * 60 * 1000;

  const busyIntervalsOnThisDay = appointmentsData
    .filter(app => app.date && app.date.startsWith(dateStr))
    .map(app => {
      return { start: new Date(app.date), end: new Date(app.endDate) };
    });

  const slotsFound = [];
  baseWorkingHours.forEach(time => {
    const slotStartDateTime = new Date(`${dateStr}T${time}`);
    const slotEndDateTime = new Date(slotStartDateTime.getTime() + (serviceDurationMinutes * 60 * 1000));

    if (dateStr === todayStr) {
      const timeDifferenceMs = slotStartDateTime.getTime() - now.getTime();
      const bufferMs = adminSettings.buffer_hours * 60 * 60 * 1000; 
      if (timeDifferenceMs < bufferMs) return; 
    }

    const endStr = String(adminSettings.work_end_hour || "18:00").trim();
    const formattedEndStr = endStr.includes(":") ? endStr.substring(0, 5) : endStr + ":00";
    const endHourLimit = new Date(`${dateStr}T${formattedEndStr}`);
    if (slotEndDateTime.getTime() > endHourLimit.getTime()) return;

    let conflictsWithBusy = false;
    for (let i = 0; i < busyIntervalsOnThisDay.length; i++) {
      const busy = busyIntervalsOnThisDay[i];
      const allowedStartAfterBusy = new Date(busy.end.getTime() + startOffsetMs);
      if (slotStartDateTime.getTime() < allowedStartAfterBusy.getTime() && slotEndDateTime.getTime() > busy.start.getTime()) {
        conflictsWithBusy = true;
        break;
      }
    }
    if (!conflictsWithBusy) { slotsFound.push(time); }
  });

  const uiStep = Math.max(5, parseInt(adminSettings.slot_interval_minutes, 10) || 45);
  const [configuredStartH, configuredStartM] = String(adminSettings.work_start_hour || "09:00")
    .split(":")
    .map(Number);
  const configuredStartMinutes = (configuredStartH * 60) + configuredStartM;

  return slotsFound.filter(time => {
    const [h, m] = time.split(":").map(Number);
    const slotMinutes = (h * 60) + m;
    return slotMinutes >= configuredStartMinutes &&
      ((slotMinutes - configuredStartMinutes) % uiStep === 0);
  });
}

function initCalendar(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput) return;
  if (flatpickrInstance) { flatpickrInstance.destroy(); }
  const disabledDates = [];
  const now = new Date();

  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date();
    checkDate.setDate(now.getDate() + i);
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const slots = getFreeSlotsForService(dateStr);
    if (slots.length === 0) { disabledDates.push(dateStr); }
  }

  flatpickrInstance = flatpickr("#calendarInput", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: true,
    disable: disabledDates, 
    defaultDate: defaultDate || null, 
    onChange: function(selectedDates, dateStr) { displayTimeSlots(dateStr); }
  });
}

function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  if (!container) return;
  container.innerHTML = ""; 
  document.getElementById("finalDateTime").value = ""; 

  const freeHours = getFreeSlotsForService(selectedDateStr);
  if (freeHours.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px;">Brak wolnych godzin dla wybranego zabiegu.</p>';
    return;
  }
  freeHours.forEach(time => {
    const slotDiv = document.createElement("div");
    slotDiv.className = "time-slot";
    slotDiv.innerText = time;
    slotDiv.onclick = function() {
      document.querySelectorAll(".time-slot").forEach(el => el.classList.remove("selected"));
      slotDiv.classList.add("selected");
      document.getElementById("finalDateTime").value = `${selectedDateStr}T${time}`;
    };
    container.appendChild(slotDiv);
  });
}

async function crmLegacyCheckExistingClientUnusedV1() {
  const statusEl = document.getElementById("clientStatus");
  const phoneInput = document.getElementById("clientPhone");
  if (!statusEl || !phoneInput) return;

  let rawPhone = phoneInput.value.replace(/\s+/g, '').replace(/-/g, '');
  let fullPhoneNumber = "";

  if (iti && iti.isValidNumber()) {
    fullPhoneNumber = iti.getNumber().replace(/\s+/g, '');
  } else if (/^\d{9}$/.test(rawPhone)) {
    fullPhoneNumber = "+48" + rawPhone;
  } else if (/^\+\d{11,15}$/.test(rawPhone)) {
    fullPhoneNumber = rawPhone;
  } else {
    statusEl.style.display = "block";
    statusEl.style.color = "red";
    statusEl.innerHTML = "Wpisz poprawny numer telefonu (np. 9 cyfr)!";
    isClientApproved = false;
    toggleFormState(false);
    return;
  }

  statusEl.style.display = "block";
  statusEl.style.color = "#2C2C2C";
  statusEl.innerHTML = "Sprawdzanie danych...";

  try {
    const data = await fetchJSONP(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(fullPhoneNumber)}`);
    if (data && data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      statusEl.style.color = "green";
      statusEl.innerHTML = "Klient zweryfikowany pomyślnie!";
      isClientApproved = true;
      toggleFormState(true); 
      loadServicesIntoSelect().then(() => { return loadFreeSlots(); });
    } else {
      document.getElementById("clientName").value = "";
      renderUnknownClientContact(statusEl, fullPhoneNumber);
      isClientApproved = false;
      toggleFormState(false); 
    }
  } catch (error) {
    console.error("Błąd:", error);
    statusEl.style.color = "red";
    statusEl.innerHTML = "Nie udało się połączyć z systemem. Kliknij „Sprawdź” ponownie.";
    isClientApproved = false;
    toggleFormState(false);
  }
}

function resetBookingForm() {
  const form = document.getElementById("bookingForm");
  if (form) { form.reset(); }
  isClientApproved = false;
  const statusEl = document.getElementById("clientStatus");
  if (statusEl) { statusEl.innerHTML = ""; statusEl.style.display = "none"; }
  toggleFormState(false);
}

async function submitForm(event) {
  event.preventDefault();
  const finalDateTimeValue = document.getElementById("finalDateTime").value; 
  const submitBtn = document.getElementById("submitBookingBtn");
  const rodoConsent = document.getElementById("rodoConsent");
  const durationInput = document.getElementById("selectedDuration");
  
  if (!isClientApproved) { alert("Rezerwacja niemożliwa. Twój numer telefonu nie został zweryfikowany."); return; }
  if (!finalDateTimeValue) { alert("Proszę wybrać godzinę wizyty!"); return; }

  submitBtn.disabled = true;
  submitBtn.innerText = "Sprawdzanie terminu...";

  try {
    const serviceDuration = durationInput ? parseInt(durationInput.value, 10) : 60;
    const result = await fetchJSONP(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(finalDateTimeValue)}&duration=${serviceDuration}`);

    if (!result.isFree) {
      alert("Wybrana godzina jest już zajęta w kalendarzu. Proszę wybrać inny termin.");
      await loadFreeSlots();
      const selectedDateStr = document.getElementById("calendarInput").value;
      if (selectedDateStr) {
        initCalendar(selectedDateStr);
        displayTimeSlots(selectedDateStr); 
      }
      return; 
    }

    let phoneToSubmit = (iti && iti.isValidNumber()) ? iti.getNumber().replace(/\s+/g, '') : phoneInput.value.replace(/\s+/g, '');
    submitBtn.innerText = "Zapisywanie...";
    
    const payload = {
      action: "createBooking",
      phone: phoneToSubmit,
      name: document.getElementById("clientName").value,
      service: document.getElementById("serviceType").value,
      date: finalDateTimeValue,
      duration: serviceDuration,
      rodo: rodoConsent && rodoConsent.checked ? "Tak" : "Nie"
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    closeBookingModal();
    await loadFreeSlots(); 
  } catch (error) {
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}

function openBookingModal() { document.getElementById("bookingModal").style.display = "flex"; }
function closeBookingModal() { document.getElementById("bookingModal").style.display = "none"; resetBookingForm(); }
window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("bookingModal")) {
    // Formularz zamyka się wyłącznie przyciskiem X.
    e.preventDefault();
  }
});


// ==========================================================
// INDEX V2: polityka rodzinna, potwierdzenie i termin alternatywny
// ==========================================================
let selectedSlotPolicy = null;
let alternativeFlatpickr = null;
let bookingSubmissionLocked = false;

function minutesOfDate(d){ return d.getHours()*60+d.getMinutes(); }
function dateKeyLocal(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function getScheduleEntry(dateStr){
  return (window.familyScheduleEntries||[]).find(e=>e.date===dateStr)||null;
}
function isPolishHoliday(dateStr){ return (window.polishHolidayDates||[]).includes(dateStr); }
function shiftDateKey(dateStr, dayOffset){
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + dayOffset);
  return dateKeyLocal(d);
}

function getScheduleCode(dateStr){
  const entry = getScheduleEntry(dateStr);
  return String(entry && (entry.code || entry.husbandShift) || "W").toUpperCase();
}

function getNightContext(dateStr){
  const entry = getScheduleEntry(dateStr) || {};
  const todayCode = getScheduleCode(dateStr);
  const yesterdayCode = getScheduleCode(shiftDateKey(dateStr, -1));
  const twoDaysAgoCode = getScheduleCode(shiftDateKey(dateStr, -2));
  const explicitPosition = String(entry.nightPosition || "").toUpperCase();

  const isNight = todayCode.startsWith("2");
  const firstNight = isNight && (
    explicitPosition === "FIRST" ||
    entry.firstNight === true ||
    (!yesterdayCode.startsWith("2") && explicitPosition !== "SECOND" && entry.secondNight !== true)
  );
  const secondNight = isNight && (
    explicitPosition === "SECOND" ||
    entry.secondNight === true ||
    yesterdayCode.startsWith("2")
  );
  const afterLastNight = entry.afterLastNight === true || (
    !isNight && yesterdayCode.startsWith("2") && twoDaysAgoCode.startsWith("2")
  );

  return { firstNight, secondNight, afterLastNight };
}

function classifyFamilySlot(dateStr,time,duration){
  const start = new Date(dateStr + "T" + time);
  const end = new Date(start.getTime() + duration * 60000);
  const entry = getScheduleEntry(dateStr);
  const code = getScheduleCode(dateStr);
  const dayOfWeek = start.getDay();
  const childHome = Boolean(entry && entry.childHome) ||
    dayOfWeek === 0 ||
    dayOfWeek === 6 ||
    isPolishHoliday(dateStr) ||
    /DH|DZIECKO/.test(code);
  const working = /^[12]/.test(code);
  const { firstNight, secondNight, afterLastNight } = getNightContext(dateStr);
  const startMinutes = minutesOfDate(start);
  const endMinutes = minutesOfDate(end);

  // Najwyższy priorytet: Oleksandr pracuje, a dziecko jest w domu.
  if (working && childHome) {
    return { mode:'MANUAL_ONLY', reason:'Rezerwacja online w tym dniu jest niedostępna.' };
  }

// Pierwsza nocna:
// do 17:30 zwykła rezerwacja,
// po 17:30 do 18:00 wymagane potwierdzenie,
// po 18:00 brak rezerwacji online.
if (firstNight) {
  const firstNightConfirmationFrom = 17 * 60 + 30;
  const firstNightLatestEnd = 18 * 60;

  if (endMinutes > firstNightLatestEnd) {
    return {
      mode: "MANUAL_ONLY",
      reason: "Termin jest niedostępny online."
    };
  }

  if (endMinutes > firstNightConfirmationFrom) {
    return {
      mode: "CONFIRM",
      reason: "Wybrany termin wymaga potwierdzenia."
    };
  }

  return {
    mode: "STANDARD",
    reason: ""
  };
}

  // Druga nocna: przed 09:00 wymagane jest potwierdzenie. Później obowiązują
  // ograniczenia końca wizyty takie jak w dniu zmiany dziennej.
  if (secondNight) {
    if (startMinutes < 9 * 60) {
      return { mode:'CONFIRM', reason:'Wybrany termin wymaga potwierdzenia.' };
    }
    if (endMinutes > 16 * 60 + 30) {
      return { mode:'MANUAL_ONLY', reason:'Termin jest niedostępny online.' };
    }
    if (endMinutes > 16 * 60) {
      return { mode:'CONFIRM', reason:'Wybrany termin wymaga potwierdzenia.' };
    }
    return { mode:'STANDARD', reason:'' };
  }

  // Dzień po ostatniej nocnej: tylko poranne terminy przed 09:00 wymagają
  // potwierdzenia. Po 09:00 nie nakładamy ograniczeń popołudniowych.
  if (afterLastNight) {
    if (startMinutes < 9 * 60) {
      return { mode:'CONFIRM', reason:'Wybrany termin wymaga potwierdzenia.' };
    }
    return { mode:'STANDARD', reason:'' };
  }

  // Zmiana dzienna: termin przed 08:30 pozostaje niewidoczny online,
  // 08:30-08:59 wymaga potwierdzenia, od 09:00 działa standardowo.
  if (code.startsWith('1')) {
    if (startMinutes < 8 * 60 + 30) {
      return { mode:'MANUAL_ONLY', reason:'Termin jest niedostępny online.' };
    }
    if (startMinutes < 9 * 60) {
      return { mode:'CONFIRM', reason:'Wybrany termin wymaga potwierdzenia.' };
    }

    if (endMinutes > 16 * 60 + 30) {
      return { mode:'MANUAL_ONLY', reason:'Termin jest niedostępny online.' };
    }
    if (endMinutes > 16 * 60) {
      return { mode:'CONFIRM', reason:'Wybrany termin wymaga potwierdzenia.' };
    }
  }

  return { mode:'STANDARD', reason:'' };
}

const _loadFreeSlotsBase=loadFreeSlots;
loadFreeSlots=async function(){
  try{
    const data=await fetchJSONP(`${APPS_SCRIPT_URL}?checkBusy=true&includeFamilyPolicy=true`);
    allAvailableSlots=data.busySlots||[]; appointmentsData=data.appointments||[];
    window.familyScheduleEntries=data.familySchedule||[]; window.polishHolidayDates=data.holidays||[];
    if(data.settings) adminSettings={...adminSettings,...data.settings};
    const d=document.getElementById('calendarInput')?.value||''; initCalendar(d); if(d) displayTimeSlots(d);
  }catch(e){ console.error(e); await _loadFreeSlotsBase(); }
};

const _displayTimeSlotsBase=displayTimeSlots;
displayTimeSlots=function(dateStr){
  const c=document.getElementById('timeSlotsContainer'); if(!c)return; c.innerHTML='';
  document.getElementById('finalDateTime').value=''; selectedSlotPolicy=null;
  const dur=parseInt(document.getElementById('selectedDuration').value,10)||45;
  const free=getFreeSlotsForService(dateStr);
  let shown=0;
  free.forEach(time=>{
    const policy=classifyFamilySlot(dateStr,time,dur); if(policy.mode==='MANUAL_ONLY')return;
    const el=document.createElement('div'); el.className='time-slot'+(policy.mode==='CONFIRM'?' requires-confirmation':'');
    el.innerText=time+(policy.mode==='CONFIRM'?' *':''); el.title=policy.reason;
    el.onclick=()=>{ document.querySelectorAll('#timeSlotsContainer .time-slot').forEach(x=>x.classList.remove('selected')); el.classList.add('selected');
      document.getElementById('finalDateTime').value=`${dateStr}T${time}`; selectedSlotPolicy=policy; updateAlternativeSection(); };
    c.appendChild(el); shown++;
  });
  if(!shown)c.innerHTML='';
};
function updateAlternativeSection(){
  const sec=document.getElementById('alternativeBookingSection'), note=document.getElementById('bookingPolicyNotice');
  const need=selectedSlotPolicy&&selectedSlotPolicy.mode==='CONFIRM';
  sec.style.display=need?'block':'none'; note.style.display=need?'block':'none'; note.textContent=need?'Ten termin wymaga potwierdzenia. Prosimy wybrać dodatkowy termin na wypadek odrzucenia pierwszego.':'';
  if(!need){ document.getElementById('alternativeDateTime').value=''; return; }
  if(alternativeFlatpickr)alternativeFlatpickr.destroy();
  alternativeFlatpickr=flatpickr('#alternativeCalendarInput',{locale:'pl',dateFormat:'Y-m-d',minDate:'today',disableMobile:true,onChange:(ds,date)=>renderAlternativeSlots(date)});
}
function renderAlternativeSlots(dateStr){
  const c=document.getElementById('alternativeTimeSlotsContainer'); c.innerHTML='';
  const dur=parseInt(document.getElementById('selectedDuration').value,10)||45;
  getFreeSlotsForService(dateStr).forEach(time=>{
    const value=`${dateStr}T${time}`; if(value===document.getElementById('finalDateTime').value)return;
    const p=classifyFamilySlot(dateStr,time,dur); if(p.mode==='MANUAL_ONLY')return;
    const el=document.createElement('div'); el.className='time-slot'; el.textContent=time+(p.mode==='CONFIRM'?' *':'');
    el.onclick=()=>{c.querySelectorAll('.time-slot').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');document.getElementById('alternativeDateTime').value=value;}; c.appendChild(el);
  });
}
submitForm=async function(event){
  event.preventDefault(); if(bookingSubmissionLocked)return;
  const main=document.getElementById('finalDateTime').value, alt=document.getElementById('alternativeDateTime').value;
  if(!isClientApproved||!main){alert('Zweryfikuj telefon i wybierz termin.');return;}
  const requires=selectedSlotPolicy&&selectedSlotPolicy.mode==='CONFIRM'; if(requires&&!alt){alert('Wybierz termin alternatywny.');return;}
  bookingSubmissionLocked=true; const btn=document.getElementById('submitBookingBtn'); btn.disabled=true; btn.textContent='Wysyłanie...';
  try{
    const opt=document.getElementById('serviceType').selectedOptions[0], duration=parseInt(document.getElementById('selectedDuration').value,10)||45;
    const payload={action:requires?'createBookingRequest':'createBooking',phone:iti.getNumber().replace(/\s+/g,''),name:document.getElementById('clientName').value,service:document.getElementById('serviceType').value,date:main,alternativeDate:alt||'',duration,rodo:document.getElementById('rodoConsent').checked?'Tak':'Nie',confirmationReason:selectedSlotPolicy?.reason||'',bookingSource:'INDEX'};
    const result=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)}).then(r=>r.json());
    if(!result.success)throw new Error(result.error||'Nie udało się zapisać');
    alert(requires?'Prośba z terminem głównym i alternatywnym została wysłana.':'Wizyta została zarezerwowana.'); closeBookingModal(); await loadFreeSlots();
  }catch(e){alert(e.message||'Wystąpił błąd.');}finally{bookingSubmissionLocked=false;btn.disabled=false;btn.textContent='Zarezerwuj wizytę';}
};


// ==========================================================
// POPRAWKA STANU MODALU I KALENDARZA
// ==========================================================
const _openBookingModalStateFix = openBookingModal;
openBookingModal = function(){
  selectedSlotPolicy = null;
  const alt = document.getElementById('alternativeDateTime'); if(alt) alt.value='';
  const altDate = document.getElementById('alternativeCalendarInput'); if(altDate) altDate.value='';
  const altSlots = document.getElementById('alternativeTimeSlotsContainer'); if(altSlots) altSlots.innerHTML='';
  const section = document.getElementById('alternativeBookingSection'); if(section) section.style.display='none';
  const notice = document.getElementById('bookingPolicyNotice'); if(notice){notice.style.display='none';notice.textContent='';}
  _openBookingModalStateFix();
};
const _closeBookingModalStateFix = closeBookingModal;
closeBookingModal = function(){
  selectedSlotPolicy = null;
  if(alternativeFlatpickr){alternativeFlatpickr.destroy();alternativeFlatpickr=null;}
  const alt = document.getElementById('alternativeDateTime'); if(alt) alt.value='';
  const section = document.getElementById('alternativeBookingSection'); if(section) section.style.display='none';
  const notice = document.getElementById('bookingPolicyNotice'); if(notice){notice.style.display='none';notice.textContent='';}
  _closeBookingModalStateFix();
};

// Bez wybranego zabiegu kalendarz pokazuje również dzień dzisiejszy.
const _initCalendarServiceFix = initCalendar;
initCalendar = function(defaultDate=''){
  const select=document.getElementById('serviceType');
  if(select && !select.value){
    const input=document.getElementById('calendarInput'); if(!input)return;
    if(flatpickrInstance) flatpickrInstance.destroy();
    flatpickrInstance=flatpickr('#calendarInput',{locale:'pl',dateFormat:'Y-m-d',minDate:'today',disableMobile:true,defaultDate:defaultDate||null,onChange:function(ds,dateStr){displayTimeSlots(dateStr);}});
    return;
  }
  _initCalendarServiceFix(defaultDate);
};
const _displayTimeSlotsServiceFix = displayTimeSlots;
displayTimeSlots = function(dateStr){
  const select=document.getElementById('serviceType');
  if(select && !select.value){
    const c=document.getElementById('timeSlotsContainer'); if(c)c.innerHTML='<p>Najpierw prosimy wybrać zabieg.</p>';
    return;
  }
  _displayTimeSlotsServiceFix(dateStr);
};

// ==========================================================
// FINALNA DOSTEPNOSC DNI W KALENDARZU
// Dzien bez ani jednego widocznego slotu nie moze byc wybrany.
// ==========================================================
function getBookableSlotsForDate(dateStr) {
  const serviceSelect = document.getElementById("serviceType");
  if (!serviceSelect || !serviceSelect.value) return [];

  const duration = parseInt(
    document.getElementById("selectedDuration")?.value,
    10
  ) || 45;

  return getFreeSlotsForService(dateStr).filter(time => {
    return classifyFamilySlot(dateStr, time, duration).mode !== "MANUAL_ONLY";
  });
}

function buildDisabledBookingDates(daysAhead = 60) {
  const disabledDates = [];
  const today = new Date();

  for (let index = 0; index <= daysAhead; index += 1) {
    const checkedDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + index
    );
    const dateStr = dateKeyLocal(checkedDate);

    if (getBookableSlotsForDate(dateStr).length === 0) {
      disabledDates.push(dateStr);
    }
  }

  return disabledDates;
}

initCalendar = function(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput) return;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
    flatpickrInstance = null;
  }

  const serviceSelect = document.getElementById("serviceType");
  const serviceSelected = Boolean(serviceSelect && serviceSelect.value);
  const disabledDates = serviceSelected
    ? buildDisabledBookingDates(60)
    : [];

  const selectedDateAvailable = Boolean(
    defaultDate && !disabledDates.includes(defaultDate)
  );

  if (defaultDate && !selectedDateAvailable) {
    calendarInput.value = "";
    document.getElementById("finalDateTime").value = "";
    selectedSlotPolicy = null;
    updateAlternativeSection();
  }

  flatpickrInstance = flatpickr("#calendarInput", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: true,
    allowInput: false,
    disable: disabledDates,
    defaultDate: selectedDateAvailable ? defaultDate : null,
    onChange: function(selectedDates, dateStr) {
      if (!dateStr || getBookableSlotsForDate(dateStr).length === 0) {
        calendarInput.value = "";
        document.getElementById("finalDateTime").value = "";
        return;
      }
      displayTimeSlots(dateStr);
    }
  });
};

const _displayTimeSlotsWithDisabledDays = displayTimeSlots;
displayTimeSlots = function(dateStr) {
  if (!dateStr || getBookableSlotsForDate(dateStr).length === 0) {
    const calendarInput = document.getElementById("calendarInput");
    const finalDateTime = document.getElementById("finalDateTime");
    const slotsContainer = document.getElementById("timeSlotsContainer");

    if (calendarInput) calendarInput.value = "";
    if (finalDateTime) finalDateTime.value = "";
    if (slotsContainer) slotsContainer.innerHTML = "";

    selectedSlotPolicy = null;
    updateAlternativeSection();
    return;
  }

  _displayTimeSlotsWithDisabledDays(dateStr);
};

// ==========================================================
// INDEX V3: RESET PO WERYFIKACJI I ZWYKLY TERMIN ALTERNATYWNY
// ==========================================================
const _submitFormBeforeAlternativeFix = submitForm;

function resetBookingDependentStateV3() {
  isClientApproved = false;
  selectedSlotPolicy = null;
  ["clientName","calendarInput","finalDateTime","alternativeCalendarInput","alternativeDateTime"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.value = "";
  });
  const service = document.getElementById("serviceType");
  if (service) service.innerHTML = '<option value="" disabled selected>-- Najpierw zweryfikuj telefon --</option>';
  const altSlots = document.getElementById("alternativeTimeSlotsContainer");
  if (altSlots) altSlots.innerHTML = "";
  const altSection = document.getElementById("alternativeBookingSection");
  if (altSection) altSection.style.display = "none";
  const notice = document.getElementById("bookingPolicyNotice");
  if (notice) { notice.style.display = "none"; notice.textContent = ""; }
  const price = document.getElementById("priceDisplay");
  if (price) price.textContent = "";
  const consent = document.getElementById("rodoConsent");
  if (consent) consent.checked = false;
  if (flatpickrInstance) flatpickrInstance.clear();
  if (alternativeFlatpickr) { alternativeFlatpickr.destroy(); alternativeFlatpickr = null; }
  toggleFormState(false);
}

let phoneVerificationInProgressV3 = false;

renderAlternativeSlots = function(dateStr) {
  const container = document.getElementById("alternativeTimeSlotsContainer");
  if (!container) return;
  container.innerHTML = "";
  document.getElementById("alternativeDateTime").value = "";
  const duration = parseInt(document.getElementById("selectedDuration").value, 10) || 45;
  getFreeSlotsForService(dateStr).forEach(time => {
    const value = `${dateStr}T${time}`;
    if (value === document.getElementById("finalDateTime").value) return;
    if (classifyFamilySlot(dateStr, time, duration).mode !== "STANDARD") return;
    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.textContent = time;
    slot.onclick = () => {
      container.querySelectorAll(".time-slot").forEach(node => node.classList.remove("selected"));
      slot.classList.add("selected");
      document.getElementById("alternativeDateTime").value = value;
    };
    container.appendChild(slot);
  });
  if (!container.children.length) {
    container.innerHTML = "<p>Brak zwykłego terminu alternatywnego w tym dniu. Wybierz inną datę.</p>";
  }
};

submitForm = async function(event) {
  const main = document.getElementById("finalDateTime").value;
  const alt = document.getElementById("alternativeDateTime").value;
  const requires = selectedSlotPolicy && selectedSlotPolicy.mode === "CONFIRM";
  if (requires && alt) {
    const duration = parseInt(document.getElementById("selectedDuration").value, 10) || 45;
    const policy = classifyFamilySlot(alt.slice(0,10), alt.slice(11,16), duration);
    if (main === alt || policy.mode !== "STANDARD") {
      event.preventDefault();
      document.getElementById("alternativeDateTime").value = "";
      alert("Termin alternatywny musi być innym, zwykłym terminem bez gwiazdki.");
      return;
    }
  }
  return _submitFormBeforeAlternativeFix(event);
};

// KONIEC INDEX V3

// ==========================================================
// INDEX V4: CZYSTY STAN DRUGIEJ REZERWACJI W TEJ SAMEJ SESJI
// ==========================================================
function resetBookingSessionV4(options = {}) {
  const keepPhone = options.keepPhone === true;
  const phone = document.getElementById("clientPhone");
  const currentPhone = keepPhone && phone ? phone.value : "";

  isClientApproved = false;
  selectedSlotPolicy = null;
  bookingSubmissionLocked = false;
  phoneVerificationInProgressV3 = false;

  const form = document.getElementById("bookingForm");
  if (form) form.reset();
  if (phone) phone.value = currentPhone;

  ["clientName", "calendarInput", "finalDateTime", "alternativeCalendarInput", "alternativeDateTime", "selectedDuration"].forEach(id => {
    const node = document.getElementById(id);
    if (node) node.value = "";
  });

  const status = document.getElementById("clientStatus");
  if (status) {
    status.textContent = "";
    status.style.display = "none";
  }

  const service = document.getElementById("serviceType");
  if (service) {
    service.innerHTML = '<option value="" disabled selected>-- Najpierw zweryfikuj telefon --</option>';
    service.value = "";
  }

  const slots = document.getElementById("timeSlotsContainer");
  if (slots) slots.innerHTML = '<div class="no-slots">Najpierw zweryfikuj numer telefonu...</div>';

  const alternativeSlots = document.getElementById("alternativeTimeSlotsContainer");
  if (alternativeSlots) alternativeSlots.innerHTML = "";

  const alternativeSection = document.getElementById("alternativeBookingSection");
  if (alternativeSection) alternativeSection.style.display = "none";

  const notice = document.getElementById("bookingPolicyNotice");
  if (notice) {
    notice.style.display = "none";
    notice.textContent = "";
  }

  const price = document.getElementById("priceDisplay");
  if (price) price.textContent = "";

  const submit = document.getElementById("submitBookingBtn");
  if (submit) {
    submit.disabled = false;
    submit.textContent = "Zarezerwuj wizytę";
  }

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
    flatpickrInstance = null;
  }
  if (alternativeFlatpickr) {
    alternativeFlatpickr.destroy();
    alternativeFlatpickr = null;
  }

  toggleFormState(false);
}

const _openBookingModalBeforeSessionV4 = openBookingModal;
openBookingModal = function() {
  resetBookingSessionV4();
  _openBookingModalBeforeSessionV4();
};

const _closeBookingModalBeforeSessionV4 = closeBookingModal;
closeBookingModal = function() {
  _closeBookingModalBeforeSessionV4();
  resetBookingSessionV4();
};

/* V21.1: obsługę telefonu przejmuje jeden kontroler poniżej. */
// KONIEC INDEX V4

// ==========================================================
// INDEX V5: STABILNA WERYFIKACJA TELEFONU PRZY KOLEJNEJ REZERWACJI
// ==========================================================
let crmVerifiedPhoneTokenV5 = "";

function crmNormalizePhoneTokenV5() {
  const phone = document.getElementById("clientPhone");
  try {
    if (iti && iti.isValidNumber()) return iti.getNumber().replace(/\D/g, "");
  } catch (ignore) {}
  return String(phone?.value || "").replace(/\D/g, "");
}

function crmClearVerifiedPhoneV5() {
  crmVerifiedPhoneTokenV5 = "";
  isClientApproved = false;
}


const _submitFormBeforeV5 = submitForm;
submitForm = async function(event) {
  const currentPhoneToken = crmNormalizePhoneTokenV5();
  if (crmVerifiedPhoneTokenV5 && currentPhoneToken === crmVerifiedPhoneTokenV5) {
    isClientApproved = true;
  }
  return _submitFormBeforeV5(event);
};

/* Starsze anonimowe listenery mogą wyzerować flagę po technicznym
   formatowaniu numeru przez intl-tel-input. Po zdarzeniu przywracamy
   zatwierdzenie tylko wtedy, gdy numer faktycznie się nie zmienił. */
document.addEventListener("DOMContentLoaded", () => {
  const phone = document.getElementById("clientPhone");
  if (!phone) return;
  phone.addEventListener("input", () => {
    window.setTimeout(() => {
      const currentPhoneToken = crmNormalizePhoneTokenV5();
      if (crmVerifiedPhoneTokenV5 && currentPhoneToken === crmVerifiedPhoneTokenV5) {
        isClientApproved = true;
      } else if (crmVerifiedPhoneTokenV5 && currentPhoneToken !== crmVerifiedPhoneTokenV5) {
        crmClearVerifiedPhoneV5();
      }
    }, 0);
  });
});

/* Nowe otwarcie albo zamknięcie formularza wymaga nowej świadomej
   weryfikacji, ale wybór usługi i terminu nie może kasować tokenu. */
const _openBookingModalBeforeV5 = openBookingModal;
openBookingModal = function() {
  crmClearVerifiedPhoneV5();
  return _openBookingModalBeforeV5();
};

const _closeBookingModalBeforeV5 = closeBookingModal;
closeBookingModal = function() {
  const result = _closeBookingModalBeforeV5();
  crmClearVerifiedPhoneV5();
  return result;
};
// KONIEC INDEX V5

// ==========================================================
// INDEX V6: STABILNE SPRAWDZANIE TELEFONU + LIMIT CYFR
// ==========================================================
function crmFetchJSONPAttemptV6(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_callback_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    const separator = url.includes("?") ? "&" : "?";
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      try { delete window[callbackName]; } catch (ignore) { window[callbackName] = undefined; }
    };

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      handler(value);
    };

    window[callbackName] = data => finish(resolve, data);
    script.async = true;
    script.src = `${url}${separator}callback=${encodeURIComponent(callbackName)}&_crmts=${Date.now()}`;
    script.onerror = () => finish(reject, new Error("JSONP_NETWORK_ERROR"));

    const timer = window.setTimeout(
      () => finish(reject, new Error("JSONP_TIMEOUT")),
      Math.max(4000, Number(timeoutMs) || 9000)
    );

    document.body.appendChild(script);
  });
}

fetchJSONP = async function(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await crmFetchJSONPAttemptV6(url, 9000);
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => window.setTimeout(resolve, 350));
    }
  }
  throw lastError || new Error("JSONP_FAILED");
};

function crmPhoneCountryV6() {
  try {
    return iti && typeof iti.getSelectedCountryData === "function"
      ? (iti.getSelectedCountryData() || {})
      : {};
  } catch (ignore) {
    return {};
  }
}

function crmPhoneNationalDigitsV6() {
  const phone = document.getElementById("clientPhone");
  if (!phone) return "";

  const country = crmPhoneCountryV6();
  const dialCode = String(country.dialCode || "").replace(/\D/g, "");
  const raw = String(phone.value || "").trim();
  let digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+") && dialCode && digits.startsWith(dialCode)) {
    digits = digits.slice(dialCode.length);
  }
  return digits;
}

function crmPhoneExpectedDigitsV6() {
  const phone = document.getElementById("clientPhone");
  const country = crmPhoneCountryV6();
  const iso2 = String(country.iso2 || "pl").toLowerCase();

  // Najczęściej używane kraje w tym formularzu.
  if (["pl", "ua", "by"].includes(iso2)) return 9;

  try {
    if (window.intlTelInputUtils && typeof window.intlTelInputUtils.getExampleNumber === "function") {
      const type = window.intlTelInputUtils.numberType &&
                   window.intlTelInputUtils.numberType.MOBILE !== undefined
        ? window.intlTelInputUtils.numberType.MOBILE
        : 1;
      const example = window.intlTelInputUtils.getExampleNumber(iso2, true, type);
      const count = String(example || "").replace(/\D/g, "").length;
      if (count >= 5 && count <= 15) return count;
    }
  } catch (ignore) {}

  const placeholderCount = String(phone?.getAttribute("placeholder") || "")
    .replace(/\D/g, "").length;
  return placeholderCount >= 5 && placeholderCount <= 15 ? placeholderCount : 15;
}

function crmPhoneSlotsV6(current, expected) {
  const count = Math.max(1, Number(expected) || 9);
  const filled = Math.min(count, Math.max(0, Number(current) || 0));
  const chars = Array.from({ length: count }, (_, i) => i < filled ? "●" : "_");

  if (count === 9) {
    return `${chars.slice(0,3).join("")} ${chars.slice(3,6).join("")} ${chars.slice(6,9).join("")}`;
  }
  return chars.join("");
}

function crmEnsurePhoneLengthHintV6() {
  const phone = document.getElementById("clientPhone");
  if (!phone) return null;

  let hint = document.getElementById("crmPhoneLengthHintV6");
  if (hint) return hint;

  hint = document.createElement("div");
  hint.id = "crmPhoneLengthHintV6";
  hint.setAttribute("aria-live", "polite");
  hint.style.cssText =
    "margin-top:6px;font-size:12px;line-height:1.35;color:#777;" +
    "display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;";

  const group = phone.closest(".form-group");
  const status = group?.querySelector("#clientStatus");
  if (group && status) group.insertBefore(hint, status);
  else if (group) group.appendChild(hint);
  else phone.insertAdjacentElement("afterend", hint);

  return hint;
}

function crmUpdatePhoneLengthHintV6() {
  const hint = crmEnsurePhoneLengthHintV6();
  if (!hint) return;

  const current = crmPhoneNationalDigitsV6().length;
  const expected = crmPhoneExpectedDigitsV6();
  const remaining = Math.max(0, expected - current);
  const complete = current === expected;

  let message = "";
  if (remaining === 0) message = "Numer kompletny";
  else if (remaining === 1) message = "Pozostała 1 cyfra";
  else if (remaining >= 2 && remaining <= 4) message = `Pozostały ${remaining} cyfry`;
  else message = `Pozostało ${remaining} cyfr`;

  hint.style.color = complete ? "#26823a" : "#777";
  hint.innerHTML =
    `<span>${current}/${expected} cyfr · ${message}</span>` +
    `<span style="font-family:monospace;letter-spacing:1px;font-weight:700;">` +
    `${crmPhoneSlotsV6(current, expected)}${complete ? " ✓" : ""}</span>`;
}

function crmPhoneSanitizeDigitsOnlyV19(phone) {
  if (!phone) return;

  const raw = String(phone.value || "");
  const digits = raw.replace(/\D/g, "");
  if (raw === digits) return;

  let start = null;
  try { start = phone.selectionStart; } catch (ignore) {}

  phone.value = digits;

  if (start !== null) {
    const removedBefore = raw.slice(0, start).replace(/\d/g, "").length;
    const caret = Math.max(0, start - removedBefore);
    try { phone.setSelectionRange(caret, caret); } catch (ignore) {}
  }
}

function crmPhoneBlockNonDigitsBeforeInputV19(event) {
  if (!event || event.target?.id !== "clientPhone") return;
  if (typeof event.data === "string" && /\D/.test(event.data)) {
    event.preventDefault();
  }
}

function crmLimitPhoneDigitsV6() {
  const phone = document.getElementById("clientPhone");
  if (!phone) return;

  crmPhoneSanitizeDigitsOnlyV19(phone);

  const expected = crmPhoneExpectedDigitsV6();
  let digits = crmPhoneNationalDigitsV6();

  if (digits.length > expected) {
    digits = digits.slice(0, expected);
    phone.value = digits;
  }

  crmUpdatePhoneLengthHintV6();
}

function crmShowIncompletePhoneV6() {
  const status = document.getElementById("clientStatus");
  if (!status) return;

  const current = crmPhoneNationalDigitsV6().length;
  const expected = crmPhoneExpectedDigitsV6();
  const remaining = Math.max(0, expected - current);

  status.style.display = "block";
  status.style.color = "#b3261e";
  status.textContent = remaining === 1
    ? "Brakuje jeszcze 1 cyfry numeru telefonu."
    : `Brakuje jeszcze ${remaining} cyfr numeru telefonu.`;

  isClientApproved = false;
  if (typeof crmClearVerifiedPhoneV5 === "function") crmClearVerifiedPhoneV5();
  toggleFormState(false);
}


/* V21.1: listenery telefonu V6 scalono w jednym kontrolerze. */

// KONIEC INDEX V6


// ==========================================================================
// ==========================================================================
// INDEX FIRST VISIT UI V9 2026-08-22
// Pierwsza wizyta:
// - klient wybiera KATEGORIĘ, nie konkretną usługę,
// - ceny nie są pokazywane,
// - czas bierze się z ustawienia kategorii AUTO/MANUAL,
// - obowiązkowe: imię i nazwisko, telefon, kategoria, opis potrzeby,
//   preferowane widełki czasowe i sposób kontaktu,
// - konkretne dni/godziny są opcjonalne.
// ==========================================================================
const CRM_FIRST_VISIT_MAX_DAYS_V9 = 3;
const CRM_FIRST_VISIT_MAX_TIMES_PER_DAY_V9 = 2;

let crmFirstVisitDaysV9 = [];
let crmFirstVisitServicesV9 = [];
let crmFirstVisitCategoriesV9 = [];
let crmFirstVisitBusyLoadedV9 = false;

function crmFirstVisitEscapeV9(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function crmFirstVisitPublishedV9(item) {
  return ["OPUBLIKOWANY", "AKTYWNY", "PUBLISHED", "ACTIVE"]
    .includes(String(item?.status || "").trim().toUpperCase());
}

function crmFirstVisitModeV9(value) {
  return String(value || "AUTO").trim().toUpperCase() === "MANUAL"
    ? "MANUAL"
    : "AUTO";
}

function crmFirstVisitBuildCategoriesV9(services) {
  const map = new Map();

  (Array.isArray(services) ? services : [])
    .filter(crmFirstVisitPublishedV9)
    .forEach(item => {
      const category = String(item?.category || "").trim();
      if (!category) return;

      const categoryId = String(item?.categoryId || category).trim();
      const key = categoryId || category;

      if (!map.has(key)) {
        map.set(key, {
          id: categoryId || category,
          name: category,
          order: Number(item?.categoryOrder) || 0,
          mode: crmFirstVisitModeV9(item?.firstVisitMode),
          manualMinutes: Math.max(0, Number(item?.firstVisitManualMinutes) || 0),
          color: String(item?.categoryColor || "#b05c75"),
          icon: String(item?.categoryIcon || crmIndexIconGuessV12(category)),
          services: []
        });
      }

      const group = map.get(key);
      group.services.push(item);

      if (
        group.mode === "AUTO" &&
        crmFirstVisitModeV9(item?.firstVisitMode) === "MANUAL"
      ) {
        group.mode = "MANUAL";
        group.manualMinutes = Math.max(
          0,
          Number(item?.firstVisitManualMinutes) || 0
        );
      }
    });

  return Array.from(map.values())
    .map(group => {
      const autoMinutes = group.services.reduce(
        (max, item) => Math.max(max, Number(item?.duration) || 0),
        0
      );

      const effectiveMinutes =
        group.mode === "MANUAL"
          ? group.manualMinutes
          : autoMinutes;

      return {
        ...group,
        autoMinutes,
        effectiveMinutes
      };
    })
    .filter(group => group.services.length > 0 && group.effectiveMinutes >= 5)
    .sort((a, b) =>
      Number(a.order || 0) - Number(b.order || 0) ||
      a.name.localeCompare(b.name, "pl")
    );
}

async function crmFirstVisitEnsureDataV9() {
  if (!crmFirstVisitServicesV9.length) {
    const services = await fetchJSONP(
      `${APPS_SCRIPT_URL}?getPrices=true&_firstVisit=${Date.now()}`
    );

    crmFirstVisitServicesV9 = Array.isArray(services) ? services : [];
    crmFirstVisitCategoriesV9 =
      crmFirstVisitBuildCategoriesV9(crmFirstVisitServicesV9);
  }

  // Dostępność jest pobierana przy każdym otwarciu.
  const data = await fetchJSONP(
    `${APPS_SCRIPT_URL}?checkBusy=true&_firstVisit=${Date.now()}`
  );

  allAvailableSlots = data?.busySlots || [];
  appointmentsData = data?.appointments || [];

  if (data?.settings) {
    adminSettings = { ...adminSettings, ...data.settings };
  }

  if (Array.isArray(data?.familySchedule)) {
    window.familyScheduleEntries = data.familySchedule;
  }

  if (Array.isArray(data?.holidays)) {
    window.polishHolidayDates = data.holidays;
  }

  crmFirstVisitBusyLoadedV9 = true;
}

function crmFirstVisitSelectedCategoryV9() {
  const select = document.getElementById("crmFirstVisitCategoryV9");
  const option = select?.options?.[select.selectedIndex];

  if (!option || !option.value) return null;

  const id = String(option.value || "");
  return crmFirstVisitCategoriesV9.find(item => item.id === id) || null;
}

function crmFirstVisitDurationV9() {
  const category = crmFirstVisitSelectedCategoryV9();
  return Math.max(5, Number(category?.effectiveMinutes) || 45);
}

function crmFirstVisitFreeSlotsV9(dateStr) {
  if (!dateStr || !crmFirstVisitSelectedCategoryV9()) return [];

  const duration = crmFirstVisitDurationV9();
  const now = new Date();
  const today =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const startStr =
    String(adminSettings.work_start_hour || "09:00").substring(0, 5);
  const endStr =
    String(adminSettings.work_end_hour || "18:00").substring(0, 5);

  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);

  const regularStart = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const regularStep = Math.max(
    5,
    Number(adminSettings.slot_interval_minutes) || 45
  );
  const earlyStep = 15;
  const startOffsetMs =
    (Number(adminSettings.start_offset_minutes) || 0) * 60000;

  const dayBusy = (appointmentsData || [])
    .filter(item => item.date && String(item.date).startsWith(dateStr))
    .map(item => {
      const start = new Date(item.date);
      const end = new Date(
        item.endDate ||
        item.end ||
        new Date(
          start.getTime() +
          (Number(item.duration) || 45) * 60000
        )
      );

      return { start, end };
    })
    .filter(
      item =>
        !isNaN(item.start.getTime()) &&
        !isNaN(item.end.getTime())
    );

  function candidateIsFree(minuteOfDay, isEarlyCandidate) {
    const time =
      `${String(Math.floor(minuteOfDay / 60)).padStart(2, "0")}:${String(minuteOfDay % 60).padStart(2, "0")}`;

    const slotStart = new Date(`${dateStr}T${time}`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    if (
      slotEnd.getHours() * 60 + slotEnd.getMinutes() >
      endMinutes
    ) {
      return false;
    }

    if (dateStr === today) {
      const buffer =
        (Number(adminSettings.buffer_hours) || 0) * 3600000;

      if (slotStart.getTime() - now.getTime() < buffer) {
        return false;
      }
    }

    const conflict = dayBusy.some(busy => {
      const allowedAfter =
        new Date(busy.end.getTime() + startOffsetMs);

      return slotStart < allowedAfter && slotEnd > busy.start;
    });

    if (conflict) return false;

    let policy = { mode: "STANDARD", reason: "" };

    if (typeof classifyFamilySlot === "function") {
      policy =
        classifyFamilySlot(dateStr, time, duration) ||
        policy;

      if (policy.mode === "MANUAL_ONLY") {
        return false;
      }
    }

    if (
      isEarlyCandidate &&
      policy.mode !== "CONFIRM"
    ) {
      return false;
    }

    return true;
  }

  const result = [];
  const seen = new Set();

  const earlyFrom = Math.min(regularStart, 8 * 60);

  for (
    let minute = earlyFrom;
    minute < regularStart;
    minute += earlyStep
  ) {
    if (!candidateIsFree(minute, true)) continue;

    const value =
      `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  for (
    let minute = regularStart;
    minute < endMinutes;
    minute += regularStep
  ) {
    if (!candidateIsFree(minute, false)) continue;

    const value =
      `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
}

function crmFirstVisitCategoryOptionsV9() {
  if (!crmFirstVisitCategoriesV9.length) {
    return '<option value="" disabled>Brak dostępnych kategorii</option>';
  }

  return crmFirstVisitCategoriesV9
    .map(category => `
      <option
        value="${crmFirstVisitEscapeV9(category.id)}"
        data-category-name="${crmFirstVisitEscapeV9(category.name)}"
        data-duration="${Number(category.effectiveMinutes) || 0}">
        ${crmFirstVisitEscapeV9(category.name)}
      </option>
    `)
    .join("");
}


function crmFirstVisitCategoryCardsMarkupV12() {
  if (!crmFirstVisitCategoriesV9.length) {
    return '<div class="crm-first-visit-category-empty-v12">Brak dostępnych kategorii.</div>';
  }

  return crmFirstVisitCategoriesV9
    .slice()
    .sort((a, b) =>
      (Number(a?.order) || 0) - (Number(b?.order) || 0) ||
      String(a?.name || "").localeCompare(String(b?.name || ""), "pl")
    )
    .map(category => `
      <button
        type="button"
        class="crm-first-visit-category-card-v12"
        data-fv-category-v12="${crmFirstVisitEscapeV9(category.id)}"
        style="--crm-cat:${crmFirstVisitEscapeV9(category.color || "#b05c75")}"
        aria-pressed="false">
        <span class="crm-first-visit-category-accent-v12" aria-hidden="true"></span>
        <img
          src="${crmIndexIconPathV12(category.icon, category.name)}"
          alt=""
          loading="lazy"
          onerror="this.style.display='none'">
        <span class="crm-first-visit-category-copy-v12">
          <strong>${crmFirstVisitEscapeV9(category.name)}</strong>
          <small>Opcjonalnie</small>
        </span>
        <span class="crm-first-visit-category-check-v12" aria-hidden="true">✓</span>
      </button>
    `)
    .join("");
}

function crmFirstVisitSyncCategoryCardsV12(root = document) {
  const select = document.getElementById("crmFirstVisitCategoryV9");
  if (!select) return;

  root.querySelectorAll("[data-fv-category-v12]").forEach(button => {
    const active = String(button.dataset.fvCategoryV12 || "") === String(select.value || "");
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function crmFirstVisitInstallCategoryCardsV12(root = document) {
  const select = document.getElementById("crmFirstVisitCategoryV9");
  if (!select) return;

  root.querySelectorAll("[data-fv-category-v12]").forEach(button => {
    button.addEventListener("click", () => {
      const value = button.dataset.fvCategoryV12 || "";
      select.value = String(select.value || "") === String(value) ? "" : value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      crmFirstVisitSyncCategoryCardsV12(root);
    });
  });

  crmFirstVisitSyncCategoryCardsV12(root);
}

function crmFirstVisitContactMethodMarkupV9() {
  return `
    <fieldset class="crm-first-visit-contact-method-v9">
      <legend>Jak mamy się z Tobą skontaktować? *</legend>

      <div class="crm-first-visit-contact-options-v9">
        <label>
          <input type="radio" name="crmFirstVisitContactV9" value="WHATSAPP" required>
          <span>
            <b>WhatsApp</b>
            <small>na podany numer telefonu</small>
          </span>
        </label>
        <label>
          <input type="radio" name="crmFirstVisitContactV9" value="EMAIL" required>
          <span>
            <b>E-mail</b>
            <small>podaj adres poniżej</small>
          </span>
        </label>
      </div>

      <label
        id="crmFirstVisitEmailWrapV9"
        class="crm-first-visit-field crm-first-visit-email-dependent-v9"
        hidden>
        <span>E-mail *</span>
        <input
          id="crmFirstVisitEmailV9"
          type="email"
          autocomplete="email"
          placeholder="np. anna@email.pl">
      </label>
    </fieldset>
  `;
}

function crmFirstVisitFormMarkupV9() {
  return `
  <div id="crmFirstVisitV9" class="crm-first-visit-form crm-first-visit-v9">
    <div class="crm-first-visit-head">
      <div>
        <span class="crm-first-visit-eyebrow">PIERWSZA WIZYTA</span>
        <h2>Wyślij prośbę o termin</h2>
        <p>
          Opisz, czego potrzebujesz i kiedy zwykle Ci pasuje.
          Konkretne dni i godziny możesz dodać opcjonalnie.
        </p>
      </div>

      <button
        type="button"
        class="crm-first-visit-close"
        aria-label="Zamknij">
        ×
      </button>
    </div>

    <form id="crmFirstVisitFormV9" autocomplete="on">
      <div class="crm-first-visit-grid">
        <label>
          <span>Imię i nazwisko *</span>
          <input
            id="crmFirstVisitNameV9"
            type="text"
            autocomplete="name"
            required>
        </label>

        <label>
          <span>Telefon *</span>
          <input
            id="crmFirstVisitPhoneV9"
            type="tel"
            autocomplete="tel"
            required>
        </label>
      </div>

      <label class="crm-first-visit-field">
        <span>Kategoria *</span>
        <select id="crmFirstVisitCategoryV9" required>
          <option value="">— Wybierz kategorię —</option>
          ${crmFirstVisitCategoryOptionsV9()}
        </select>
      </label>

      <label class="crm-first-visit-field">
        <span>Opisz, czego potrzebujesz *</span>
        <textarea
          id="crmFirstVisitMessageV9"
          rows="4"
          minlength="5"
          required
          placeholder="Np. mam przebarwienia i zależy mi na zabiegu nawilżającym..."></textarea>
      </label>

      <label class="crm-first-visit-field">
        <span>Kiedy zwykle Ci pasuje? *</span>
        <textarea
          id="crmFirstVisitWindowV9"
          rows="2"
          minlength="3"
          required
          placeholder="Np. pon.–pt. po 16:00, sobota rano"></textarea>
        <small>
          To pole jest wymagane nawet wtedy, gdy niżej wskażesz konkretny dzień lub godzinę.
        </small>
      </label>

      ${crmFirstVisitContactMethodMarkupV9()}

      <section class="crm-first-visit-preferences">
        <div class="crm-first-visit-section-title">
          <div>
            <strong>Konkretne dni / godziny</strong>
            <small>
              Opcjonalnie. Maks. 3 dni i maks. 2 godziny na każdy dzień.
            </small>
          </div>

          <button
            type="button"
            id="crmFirstVisitAddDayV9"
            class="crm-first-visit-add-day">
            + Dodaj dzień
          </button>
        </div>

        <div id="crmFirstVisitDaysV9"></div>
      </section>

      <label class="crm-first-visit-consent">
        <input
          id="crmFirstVisitContactConsentV9"
          type="checkbox"
          required>
        <span>
          Zgadzam się na kontakt wybranym sposobem w celu ustalenia pierwszej wizyty. *
        </span>
      </label>

      <label class="crm-first-visit-consent">
        <input
          id="crmFirstVisitRodoV9"
          type="checkbox"
          required>
        <span>
          Wyrażam zgodę na przetwarzanie danych w celu obsługi mojego zapytania o wizytę.
          Szczegóły w
          <a href="polityka-prywatnosci.html" target="_blank">
            Polityce Prywatności
          </a>. *
        </span>
      </label>

      <div
        id="crmFirstVisitErrorV9"
        class="crm-first-visit-error"
        hidden>
      </div>

      <button
        id="crmFirstVisitSubmitV9"
        type="submit"
        class="crm-first-visit-submit">
        Wyślij prośbę o pierwszą wizytę
      </button>
    </form>

    <div
      id="crmFirstVisitSuccessV9"
      class="crm-first-visit-success"
      hidden>
      <b>✓</b>
      <strong>Prośba została wysłana</strong>
      <p>
        Salon sprawdzi informacje i zaproponowane terminy,
        a następnie skontaktuje się z Tobą wybranym sposobem.
      </p>
    </div>
  </div>`;
}

function crmFirstVisitDayStateV9(id) {
  return crmFirstVisitDaysV9.find(item => item.id === id);
}

function crmFirstVisitRemoveDayV9(id) {
  crmFirstVisitDaysV9 =
    crmFirstVisitDaysV9.filter(item => item.id !== id);

  crmFirstVisitRenderDaysV9();
}

function crmFirstVisitToggleTimeV9(id, time) {
  const item = crmFirstVisitDayStateV9(id);
  if (!item) return;

  item.times ||= [];

  if (item.times.includes(time)) {
    item.times =
      item.times.filter(value => value !== time);
  } else {
    if (
      item.times.length >=
      CRM_FIRST_VISIT_MAX_TIMES_PER_DAY_V9
    ) {
      const error =
        document.getElementById("crmFirstVisitErrorV9");

      if (error) {
        error.hidden = false;
        error.textContent =
          "Na jeden dzień możesz wybrać maksymalnie 2 godziny.";
      }

      return;
    }

    item.times.push(time);
  }

  crmFirstVisitRenderDaysV9();
}

function crmFirstVisitRenderDaysV9() {
  const host =
    document.getElementById("crmFirstVisitDaysV9");

  const add =
    document.getElementById("crmFirstVisitAddDayV9");

  if (!host) return;

  const categorySelected =
    Boolean(crmFirstVisitSelectedCategoryV9());

  if (add) {
    add.disabled =
      !categorySelected ||
      crmFirstVisitDaysV9.length >=
        CRM_FIRST_VISIT_MAX_DAYS_V9;
  }

  if (!categorySelected) {
    host.innerHTML =
      '<div class="crm-first-visit-empty">Najpierw wybierz kategorię. Potem możesz opcjonalnie dodać konkretne dni lub godziny.</div>';
    return;
  }

  if (!crmFirstVisitDaysV9.length) {
    host.innerHTML =
      '<div class="crm-first-visit-empty">Nie musisz wybierać konkretnego terminu. Wystarczy obowiązkowo opisać wyżej, kiedy zwykle Ci pasuje.</div>';
    return;
  }

  host.innerHTML =
    crmFirstVisitDaysV9
      .map((item, index) => {
        const free =
          item.date
            ? crmFirstVisitFreeSlotsV9(item.date)
            : [];

        return `
          <article
            class="crm-first-visit-day-card"
            data-day-id="${item.id}">

            <div class="crm-first-visit-day-head">
              <strong>Dzień ${index + 1}</strong>
              <button
                type="button"
                data-remove-day="${item.id}">
                Usuń
              </button>
            </div>

            <input
              type="text"
              class="crm-first-visit-date"
              data-day-date="${item.id}"
              value="${crmFirstVisitEscapeV9(item.date || "")}"
              placeholder="Wybierz datę"
              readonly>

            <div class="crm-first-visit-day-hint">
              ${
                item.date
                  ? (
                      free.length
                        ? "Możesz wybrać maks. 2 godziny albo zostawić sam dzień."
                        : "Brak standardowych godzin — możesz zostawić sam dzień."
                    )
                  : "Najpierw wybierz dzień."
              }
            </div>

            <div class="crm-first-visit-times">
              ${free
                .map(time => `
                  <button
                    type="button"
                    class="${item.times?.includes(time) ? "is-selected" : ""}"
                    data-day-time="${item.id}"
                    data-time="${time}">
                    ${time}
                  </button>
                `)
                .join("")}
            </div>
          </article>
        `;
      })
      .join("");

  host
    .querySelectorAll("[data-remove-day]")
    .forEach(button => {
      button.onclick = () =>
        crmFirstVisitRemoveDayV9(
          button.dataset.removeDay
        );
    });

  host
    .querySelectorAll("[data-day-time]")
    .forEach(button => {
      button.onclick = () =>
        crmFirstVisitToggleTimeV9(
          button.dataset.dayTime,
          button.dataset.time
        );
    });

  host
    .querySelectorAll("[data-day-date]")
    .forEach(input => {
      const id = input.dataset.dayDate;
      const item = crmFirstVisitDayStateV9(id);

      flatpickr(input, {
        locale: "pl",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: crmEndOfNextMonthV14(),
        disableMobile: true,
        defaultDate: item?.date || null,

        onChange: (selected, dateStr) => {
          const row = crmFirstVisitDayStateV9(id);
          if (!row) return;

          row.date = dateStr;
          row.times = [];

          crmFirstVisitRenderDaysV9();
        }
      });
    });
}

function crmFirstVisitAddDayV9() {
  if (!crmFirstVisitSelectedCategoryV9()) return;

  if (
    crmFirstVisitDaysV9.length >=
    CRM_FIRST_VISIT_MAX_DAYS_V9
  ) {
    return;
  }

  crmFirstVisitDaysV9.push({
    id:
      "D" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 6),
    date: "",
    times: []
  });

  crmFirstVisitRenderDaysV9();
}

function crmFirstVisitSyncContactMethodV9() {
  const selected = document.querySelector(
    'input[name="crmFirstVisitContactV9"]:checked'
  );

  const emailWrap =
    document.getElementById("crmFirstVisitEmailWrapV9");

  const email =
    document.getElementById("crmFirstVisitEmailV9");

  const useEmail =
    selected?.value === "EMAIL";

  if (emailWrap) {
    emailWrap.hidden = !useEmail;
  }

  if (email) {
    email.required = useEmail;

    if (!useEmail) {
      email.value = "";
    }
  }
}

async function openFirstVisitRequestFormV9(
  phone = "",
  name = ""
) {
  const modal =
    document.getElementById("contact-form-modal");

  if (!modal) return;

  const wrapper = modal.firstElementChild;
  if (!wrapper) return;

  const bookingModal =
    document.getElementById("bookingModal");

  if (bookingModal) {
    bookingModal.style.display = "none";
  }

  wrapper.innerHTML =
    '<div class="crm-first-visit-loading">Ładowanie formularza pierwszej wizyty…</div>';

  modal.style.display = "flex";

  try {
    await crmFirstVisitEnsureDataV9();

    crmFirstVisitDaysV9 = [];
    wrapper.innerHTML =
      crmFirstVisitFormMarkupV9();

    document.getElementById(
      "crmFirstVisitNameV9"
    ).value = name || "";

    document.getElementById(
      "crmFirstVisitPhoneV9"
    ).value = phone || "";

    wrapper.querySelector(
      ".crm-first-visit-close"
    ).onclick = () => {
      modal.style.display = "none";
    };

    document.getElementById(
      "crmFirstVisitAddDayV9"
    ).onclick = crmFirstVisitAddDayV9;

    document.getElementById(
      "crmFirstVisitCategoryV9"
    ).onchange = () => {
      crmFirstVisitDaysV9.forEach(
        item => item.times = []
      );

      crmFirstVisitRenderDaysV9();
    };

    wrapper
      .querySelectorAll(
        'input[name="crmFirstVisitContactV9"]'
      )
      .forEach(input => {
        input.addEventListener(
          "change",
          crmFirstVisitSyncContactMethodV9
        );
      });

    document.getElementById(
      "crmFirstVisitFormV9"
    ).onsubmit =
      crmFirstVisitSubmitV9;

    crmFirstVisitSyncContactMethodV9();
    crmFirstVisitRenderDaysV9();
  } catch (error) {
    wrapper.innerHTML = `
      <div class="crm-first-visit-loading crm-first-visit-load-error">
        <strong>Nie udało się załadować formularza.</strong>
        <p>${crmFirstVisitEscapeV9(error?.message || error)}</p>
        <button type="button" class="verify-btn">
          Spróbuj ponownie
        </button>
      </div>
    `;

    wrapper.querySelector("button").onclick =
      () => openFirstVisitRequestFormV9(phone, name);
  }
}

async function crmFirstVisitSubmitV9(event) {
  event.preventDefault();

  const submit =
    document.getElementById("crmFirstVisitSubmitV9");

  const error =
    document.getElementById("crmFirstVisitErrorV9");

  if (error) {
    error.hidden = true;
    error.textContent = "";
  }

  const name =
    String(
      document.getElementById(
        "crmFirstVisitNameV9"
      )?.value || ""
    ).trim();

  const phone =
    String(
      document.getElementById(
        "crmFirstVisitPhoneV9"
      )?.value || ""
    ).trim();

  const category =
    crmFirstVisitSelectedCategoryV9();

  const message =
    String(
      document.getElementById(
        "crmFirstVisitMessageV9"
      )?.value || ""
    ).trim();

  const preferredWindow =
    String(
      document.getElementById(
        "crmFirstVisitWindowV9"
      )?.value || ""
    ).trim();

  const contactMethod =
    String(
      document.querySelector(
        'input[name="crmFirstVisitContactV9"]:checked'
      )?.value || ""
    ).trim();

  const email =
    String(
      document.getElementById(
        "crmFirstVisitEmailV9"
      )?.value || ""
    ).trim();

  const contactConsent =
    Boolean(
      document.getElementById(
        "crmFirstVisitContactConsentV9"
      )?.checked
    );

  const rodo =
    Boolean(
      document.getElementById(
        "crmFirstVisitRodoV9"
      )?.checked
    );

  const proposals =
    crmFirstVisitDaysV9
      .filter(item => item.date)
      .slice(0, 3)
      .map(item => ({
        date: item.date,
        times:
          (item.times || []).slice(0, 2)
      }));

  const phoneDigits =
    phone.replace(/\D/g, "");

  function fail(text) {
    if (error) {
      error.hidden = false;
      error.textContent = text;
    }
  }

  if (!name || !phone || !category) {
    fail(
      "Uzupełnij imię i nazwisko, telefon oraz kategorię."
    );
    return;
  }

  if (
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    fail("Wpisz poprawny numer telefonu.");
    return;
  }

  if (message.length < 5) {
    fail(
      "Napisz krótko, czego potrzebujesz."
    );
    return;
  }

  if (preferredWindow.length < 3) {
    fail(
      "Napisz, kiedy zwykle Ci pasuje."
    );
    return;
  }

  if (!contactMethod) {
    fail(
      "Wybierz sposób kontaktu: WhatsApp lub E-mail."
    );
    return;
  }

  if (
    contactMethod === "EMAIL" &&
    !email
  ) {
    fail("Podaj adres e-mail.");
    return;
  }

  if (!contactConsent || !rodo) {
    fail("Zaznacz obie wymagane zgody.");
    return;
  }

  if (submit) {
    submit.disabled = true;
    submit.textContent = "Wysyłanie…";
  }

  try {
    const response =
      await fetch(
        APPS_SCRIPT_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify({
            action: "createFirstVisitRequest",
            phone,
            name,
            categoryId: category.id,
            category: category.name,
            duration:
              category.effectiveMinutes,
            message,
            preferredWindow,
            contactMethod,
            email:
              contactMethod === "EMAIL"
                ? email
                : "",
            contactConsent: "TAK",
            rodo: "TAK",
            proposals:
              JSON.stringify(proposals)
          })
        }
      );

    const data =
      await response.json();

    if (!data?.success) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Nie udało się wysłać prośby."
      );
    }

    document.getElementById(
      "crmFirstVisitFormV9"
    ).hidden = true;

    const success =
      document.getElementById(
        "crmFirstVisitSuccessV9"
      );

    if (success) {
      success.hidden = false;
    }

    setTimeout(() => {
      const modal =
        document.getElementById(
          "contact-form-modal"
        );

      if (modal) {
        modal.style.display = "none";
      }
    }, 4200);
  } catch (err) {
    fail(
      err?.message ||
      String(err)
    );

    if (submit) {
      submit.disabled = false;
      submit.textContent =
        "Wyślij prośbę o pierwszą wizytę";
    }
  }
}

// Zgodność z istniejącymi wywołaniami.
window.openFirstVisitRequestFormV9 =
  openFirstVisitRequestFormV9;

window.openFirstVisitRequestFormV8 =
  openFirstVisitRequestFormV9;

window.openFirstVisitRequestForm =
  openFirstVisitRequestFormV9;

renderUnknownClientContact =
  function(statusEl, phone) {
    if (!statusEl) return;

    statusEl.style.color = "#7a4c00";
    statusEl.innerHTML = `
      <div class="crm-first-visit-unknown">
        <strong>Nie znaleźliśmy tego numeru w bazie klientów.</strong>
        <span>
          Jeśli to Twoja pierwsza wizyta, wyślij prośbę:
          wybierz kategorię, opisz czego potrzebujesz i kiedy zwykle Ci pasuje.
        </span>
        <button
          type="button"
          id="openNewClientContactFormBtn"
          class="verify-btn">
          Poproś o pierwszą wizytę
        </button>
      </div>
    `;

    const button =
      document.getElementById(
        "openNewClientContactFormBtn"
      );

    if (button) {
      button.onclick =
        () => openFirstVisitRequestFormV9(phone);
    }
  };

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const button =
      document.getElementById(
        "openFirstVisitRequestStandaloneV8"
      );

    if (button) {
      button.onclick =
        () => openFirstVisitRequestFormV9();
    }
  }
);

// KONIEC INDEX FIRST VISIT UI V9

// ==========================================================================
// INDEX V23.1 — FORMULARZ ZWYKŁEJ REZERWACJI DOPIERO PO WERYFIKACJI TELEFONU
// 2026-08-22
//
// Przed weryfikacją:
// - widoczny tylko telefon + Sprawdź + status,
// - imię/usługa/data/godzina/RODO/przycisk są całkowicie schowane.
//
// Po znalezieniu istniejącego klienta:
// - cały dalszy formularz pojawia się,
// - imię jest tylko z bazy i pozostaje nieedytowalne.
//
// Nieznany numer:
// - dalszy formularz pozostaje schowany,
// - widoczna jest wyłącznie karta „Poproś o pierwszą wizytę”.
// ==========================================================================

function crmSetBookingVerifiedFieldsVisibleV231(visible) {
  const block = document.getElementById("bookingVerifiedFields");
  if (!block) return;

  const show = visible === true;

  block.hidden = !show;
  block.style.display = show ? "block" : "none";
  block.setAttribute("aria-hidden", show ? "false" : "true");
}

function crmSyncBookingVerifiedFieldsV231() {
  crmSetBookingVerifiedFieldsVisibleV231(Boolean(isClientApproved));
}

/* V21.1: widocznością pól po weryfikacji steruje jeden kontroler telefonu. */

/*
 * Każde nowe otwarcie zaczyna od samego telefonu.
 */
const _openBookingModalBeforeProgressiveV231 = openBookingModal;
openBookingModal = function() {
  crmSetBookingVerifiedFieldsVisibleV231(false);
  return _openBookingModalBeforeProgressiveV231();
};

/*
 * Po zamknięciu również wracamy do stanu początkowego.
 */
const _closeBookingModalBeforeProgressiveV231 = closeBookingModal;
closeBookingModal = function() {
  const result = _closeBookingModalBeforeProgressiveV231();
  crmSetBookingVerifiedFieldsVisibleV231(false);
  return result;
};

document.addEventListener("DOMContentLoaded", () => {
  crmSetBookingVerifiedFieldsVisibleV231(false);

  const phone = document.getElementById("clientPhone");
  if (!phone || phone.dataset.crmProgressiveV231 === "1") return;

  phone.dataset.crmProgressiveV231 = "1";

  /*
   * Przy realnej zmianie numeru starsza logika kasuje weryfikację.
   * setTimeout daje istniejącemu V5 chwilę na zachowanie zatwierdzenia
   * przy technicznym formatowaniu intl-tel-input tego samego numeru.
   */
  phone.addEventListener("input", () => {
    window.setTimeout(() => {
      crmSyncBookingVerifiedFieldsV231();
    }, 0);
  });
});

// KONIEC INDEX V23.1

// ======================================================================
// INDEX FIRST VISIT UI V10 — 4 KROKI + PODSUMOWANIE
// 2026-08-22
//
// KROK 1: dane kontaktowe
// KROK 2: kategoria / opis / kiedy zwykle pasuje / sposób kontaktu
// KROK 3: opcjonalne konkretne dni i godziny
// KROK 4: pełne podsumowanie + Edytuj + zgody + wysyłka
//
// Backend i format createFirstVisitRequest pozostają bez zmian.
// ======================================================================

let crmFirstVisitStepV10 = 1;

function crmFirstVisitClearErrorV10() {
  const error =
    document.getElementById("crmFirstVisitErrorV9");

  if (!error) return;

  error.hidden = true;
  error.textContent = "";
}

function crmFirstVisitShowErrorV10(text) {
  const error =
    document.getElementById("crmFirstVisitErrorV9");

  if (!error) return;

  error.hidden = false;
  error.textContent = text;

  try {
    error.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (_) {}
}

function crmFirstVisitContactLabelV10(value) {
  const key = String(value || "").toUpperCase();

  if (key === "WHATSAPP") return "WhatsApp";
  if (key === "EMAIL") return "E-mail";

  return "—";
}

function crmFirstVisitFormatDateV10(value) {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "pl-PL",
    {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );
}

function crmFirstVisitProgressMarkupV10() {
  const steps = [
    {
      no: 1,
      title: "Dane kontaktowe",
      copy: "Imię i nazwisko, telefon"
    },
    {
      no: 2,
      title: "Szczegóły wizyty",
      copy: "Kategoria, opis, kontakt"
    },
    {
      no: 3,
      title: "Preferowane terminy",
      copy: "Wybierz dogodny czas"
    },
    {
      no: 4,
      title: "Sprawdź i wyślij",
      copy: "Podsumowanie danych"
    }
  ];

  return `
    <nav
      id="crmFirstVisitProgressV10"
      class="crm-first-visit-progress-v10"
      aria-label="Etapy pierwszej wizyty">

      ${steps.map((step, index) => `
        <div
          class="crm-first-visit-progress-item-v10"
          data-progress-step="${step.no}">
          <span class="crm-first-visit-progress-no-v10">
            ${step.no}
          </span>

          <span class="crm-first-visit-progress-copy-v10">
            <b>${step.title}</b>
            <small>${step.copy}</small>
          </span>
        </div>

        ${
          index < steps.length - 1
            ? '<span class="crm-first-visit-progress-arrow-v10" aria-hidden="true">→</span>'
            : ""
        }
      `).join("")}
    </nav>
  `;
}

function crmFirstVisitStepFooterV10({
  back = false,
  next = false,
  nextLabel = "Dalej",
  step = 1
} = {}) {
  return `
    <div class="crm-first-visit-nav-v10">
      ${
        back
          ? `
            <button
              type="button"
              class="crm-first-visit-back-v10"
              data-fv-back="${Math.max(1, step - 1)}">
              ← Wstecz
            </button>
          `
          : '<span></span>'
      }

      ${
        next
          ? `
            <button
              type="button"
              class="crm-first-visit-next-v10"
              data-fv-next="${Math.min(4, step + 1)}">
              ${nextLabel}
              <span aria-hidden="true">→</span>
            </button>
          `
          : ""
      }
    </div>
  `;
}

function crmFirstVisitFormMarkupV10() {
  return `
  <div
    id="crmFirstVisitV10"
    class="crm-first-visit-form crm-first-visit-v9 crm-first-visit-v10">

    <div class="crm-first-visit-head crm-first-visit-head-v10">
      <div>
        <span class="crm-first-visit-eyebrow">
          PIERWSZA WIZYTA
        </span>

        <h2>Wyślij prośbę o termin</h2>

        <p>
          Wypełnij 3 krótkie kroki, a na końcu sprawdź wszystko przed wysłaniem.
        </p>
      </div>

      <button
        type="button"
        class="crm-first-visit-close"
        aria-label="Zamknij">
        ×
      </button>
    </div>

    ${crmFirstVisitProgressMarkupV10()}

    <form
      id="crmFirstVisitFormV9"
      class="crm-first-visit-wizard-form-v10"
      autocomplete="on">

      <!-- KROK 1 -->
      <section
        class="crm-first-visit-step-v10"
        data-fv-step="1">

        <div class="crm-first-visit-step-head-v10">
          <span>KROK 1 Z 4</span>
          <h3>Dane kontaktowe</h3>
          <p>Podaj podstawowe dane, żeby salon wiedział, z kim się kontaktuje.</p>
        </div>

        <div class="crm-first-visit-grid">
          <label>
            <span>Imię i nazwisko *</span>
            <input
              id="crmFirstVisitNameV9"
              type="text"
              autocomplete="name"
              placeholder="Wpisz swoje imię i nazwisko"
              required>
          </label>

          <label>
            <span>Telefon *</span>
            <input
              id="crmFirstVisitPhoneV9"
              type="tel"
              autocomplete="tel"
              placeholder="+48 512 345 678"
              required>
          </label>
        </div>

        ${crmFirstVisitStepFooterV10({
          next: true,
          nextLabel: "Dalej",
          step: 1
        })}
      </section>

      <!-- KROK 2 -->
      <section
        class="crm-first-visit-step-v10"
        data-fv-step="2"
        hidden>

        <div class="crm-first-visit-step-head-v10">
          <span>KROK 2 Z 4</span>
          <h3>Szczegóły wizyty</h3>
          <p>Wybierz kategorię, opisz potrzebę i sposób kontaktu.</p>
        </div>

        <label class="crm-first-visit-field">
          <span>Kategoria *</span>
          <select id="crmFirstVisitCategoryV9" required>
            <option value="">— Wybierz kategorię —</option>
            ${crmFirstVisitCategoryOptionsV9()}
          </select>
        </label>

        <label class="crm-first-visit-field">
          <span>Opisz, czego potrzebujesz *</span>
          <textarea
            id="crmFirstVisitMessageV9"
            rows="5"
            minlength="5"
            required
            placeholder="Napisz, z czym przychodzisz, czego oczekujesz albo jaki efekt chcesz uzyskać..."></textarea>
        </label>

        <label class="crm-first-visit-field">
          <span>Kiedy zwykle Ci pasuje? *</span>
          <textarea
            id="crmFirstVisitWindowV9"
            rows="2"
            minlength="3"
            required
            placeholder="Np. pon.–pt. po 16:00, sobota rano"></textarea>
          <small>
            Ogólna informacja jest obowiązkowa. Konkretne dni możesz dodać w kolejnym kroku.
          </small>
        </label>

        ${crmFirstVisitContactMethodMarkupV9()}

        ${crmFirstVisitStepFooterV10({
          back: true,
          next: true,
          nextLabel: "Dalej",
          step: 2
        })}
      </section>

      <!-- KROK 3 -->
      <section
        class="crm-first-visit-step-v10"
        data-fv-step="3"
        hidden>

        <div class="crm-first-visit-step-head-v10">
          <span>KROK 3 Z 4</span>
          <h3>Preferowane terminy</h3>
          <p>
            Ten krok jest opcjonalny. Możesz dodać maksymalnie 3 dni
            i maksymalnie 2 godziny na każdy dzień.
          </p>
        </div>

        <section class="crm-first-visit-preferences crm-first-visit-preferences-v10">
          <div class="crm-first-visit-section-title">
            <div>
              <strong>Konkretne dni / godziny</strong>
              <small>
                Możesz wskazać sam dzień bez wybierania konkretnej godziny.
              </small>
            </div>

            <button
              type="button"
              id="crmFirstVisitAddDayV9"
              class="crm-first-visit-add-day">
              + Dodaj dzień
            </button>
          </div>

          <div id="crmFirstVisitDaysV9"></div>
        </section>

        ${crmFirstVisitStepFooterV10({
          back: true,
          next: true,
          nextLabel: "Sprawdź dane",
          step: 3
        })}
      </section>

      <!-- KROK 4 -->
      <section
        class="crm-first-visit-step-v10"
        data-fv-step="4"
        hidden>

        <div class="crm-first-visit-step-head-v10">
          <span>KROK 4 Z 4</span>
          <h3>Sprawdź i wyślij</h3>
          <p>
            Sprawdź wszystkie dane. Jeśli coś jest nie tak, kliknij „Edytuj”.
          </p>
        </div>

        <div
          id="crmFirstVisitReviewV10"
          class="crm-first-visit-review-v10">
        </div>

        <div class="crm-first-visit-consents-v10">
          <label class="crm-first-visit-consent">
            <input
              id="crmFirstVisitContactConsentV9"
              type="checkbox"
              required>
            <span>
              Zgadzam się na kontakt wybranym sposobem
              w celu ustalenia pierwszej wizyty. *
            </span>
          </label>

          <label class="crm-first-visit-consent">
            <input
              id="crmFirstVisitRodoV9"
              type="checkbox"
              required>
            <span>
              Wyrażam zgodę na przetwarzanie danych
              w celu obsługi mojego zapytania o wizytę.
              Szczegóły w
              <a
                href="polityka-prywatnosci.html"
                target="_blank">
                Polityce Prywatności
              </a>. *
            </span>
          </label>
        </div>

        <div class="crm-first-visit-nav-v10 crm-first-visit-final-nav-v10">
          <button
            type="button"
            class="crm-first-visit-back-v10"
            data-fv-back="3">
            ← Wstecz
          </button>

          <button
            id="crmFirstVisitSubmitV9"
            type="submit"
            class="crm-first-visit-submit">
            Wyślij prośbę o termin
          </button>
        </div>
      </section>

      <div
        id="crmFirstVisitErrorV9"
        class="crm-first-visit-error"
        hidden>
      </div>
    </form>

    <div
      id="crmFirstVisitSuccessV9"
      class="crm-first-visit-success"
      hidden>
      <b>✓</b>
      <strong>Prośba została wysłana</strong>
      <p>
        Salon sprawdzi informacje i zaproponowane terminy,
        a następnie skontaktuje się z Tobą wybranym sposobem.
      </p>
    </div>
  </div>`;
}

function crmFirstVisitValidateStepV10(step) {
  crmFirstVisitClearErrorV10();

  const name =
    String(
      document.getElementById("crmFirstVisitNameV9")?.value || ""
    ).trim();

  const phone =
    String(
      document.getElementById("crmFirstVisitPhoneV9")?.value || ""
    ).trim();

  const phoneDigits =
    phone.replace(/\D/g, "");

  if (step === 1) {
    if (!name) {
      crmFirstVisitShowErrorV10(
        "Wpisz imię i nazwisko."
      );
      return false;
    }

    if (
      phoneDigits.length < 8 ||
      phoneDigits.length > 15
    ) {
      crmFirstVisitShowErrorV10(
        "Wpisz poprawny numer telefonu."
      );
      return false;
    }

    return true;
  }

  if (step === 2) {
    const category =
      crmFirstVisitSelectedCategoryV9();

    const message =
      String(
        document.getElementById("crmFirstVisitMessageV9")?.value || ""
      ).trim();

    const preferredWindow =
      String(
        document.getElementById("crmFirstVisitWindowV9")?.value || ""
      ).trim();

    const contactMethod =
      String(
        document.querySelector(
          'input[name="crmFirstVisitContactV9"]:checked'
        )?.value || ""
      ).trim();

    const email =
      String(
        document.getElementById("crmFirstVisitEmailV9")?.value || ""
      ).trim();

    if (!category) {
      crmFirstVisitShowErrorV10(
        "Wybierz kategorię."
      );
      return false;
    }

    if (message.length < 5) {
      crmFirstVisitShowErrorV10(
        "Napisz krótko, czego potrzebujesz."
      );
      return false;
    }

    if (preferredWindow.length < 3) {
      crmFirstVisitShowErrorV10(
        "Napisz, kiedy zwykle Ci pasuje."
      );
      return false;
    }

    if (!contactMethod) {
      crmFirstVisitShowErrorV10(
        "Wybierz sposób kontaktu: WhatsApp lub E-mail."
      );
      return false;
    }

    if (contactMethod === "EMAIL") {
      const emailInput =
        document.getElementById("crmFirstVisitEmailV9");

      if (
        !email ||
        (emailInput && !emailInput.checkValidity())
      ) {
        crmFirstVisitShowErrorV10(
          "Podaj poprawny adres e-mail."
        );
        return false;
      }
    }

    return true;
  }

  return true;
}

function crmFirstVisitReviewMarkupV10() {
  const name =
    String(
      document.getElementById("crmFirstVisitNameV9")?.value || ""
    ).trim();

  const phone =
    String(
      document.getElementById("crmFirstVisitPhoneV9")?.value || ""
    ).trim();

  const category =
    crmFirstVisitSelectedCategoryV9();

  const message =
    String(
      document.getElementById("crmFirstVisitMessageV9")?.value || ""
    ).trim();

  const preferredWindow =
    String(
      document.getElementById("crmFirstVisitWindowV9")?.value || ""
    ).trim();

  const contactMethod =
    String(
      document.querySelector(
        'input[name="crmFirstVisitContactV9"]:checked'
      )?.value || ""
    ).trim();

  const email =
    String(
      document.getElementById("crmFirstVisitEmailV9")?.value || ""
    ).trim();

  const proposals =
    crmFirstVisitDaysV9
      .filter(item => item.date)
      .slice(0, 3);

  const contactValue =
    contactMethod === "EMAIL"
      ? `${crmFirstVisitContactLabelV10(contactMethod)} · ${email || "—"}`
      : `${crmFirstVisitContactLabelV10(contactMethod)} · ${phone || "—"}`;

  const termsMarkup =
    proposals.length
      ? proposals.map(item => {
          const times =
            Array.isArray(item.times) && item.times.length
              ? item.times.join(", ")
              : "bez konkretnej godziny";

          return `
            <div class="crm-first-visit-review-term-v10">
              <b>${crmFirstVisitEscapeV9(crmFirstVisitFormatDateV10(item.date))}</b>
              <span>${crmFirstVisitEscapeV9(times)}</span>
            </div>
          `;
        }).join("")
      : `
          <div class="crm-first-visit-review-empty-v10">
            Nie wskazano konkretnych dni — salon oprze się na informacji:
            <b>${crmFirstVisitEscapeV9(preferredWindow || "—")}</b>
          </div>
        `;

  return `
    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div>
          <span>1</span>
          <strong>Dane kontaktowe</strong>
        </div>

        <button
          type="button"
          data-fv-edit="1">
          Edytuj
        </button>
      </div>

      <dl>
        <div>
          <dt>Imię i nazwisko</dt>
          <dd>${crmFirstVisitEscapeV9(name || "—")}</dd>
        </div>

        <div>
          <dt>Telefon</dt>
          <dd>${crmFirstVisitEscapeV9(phone || "—")}</dd>
        </div>
      </dl>
    </article>

    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div>
          <span>2</span>
          <strong>Szczegóły wizyty</strong>
        </div>

        <button
          type="button"
          data-fv-edit="2">
          Edytuj
        </button>
      </div>

      <dl>
        <div>
          <dt>Kategoria</dt>
          <dd>${crmFirstVisitEscapeV9(category?.name || "—")}</dd>
        </div>

        <div>
          <dt>Opis</dt>
          <dd>${crmFirstVisitEscapeV9(message || "—")}</dd>
        </div>

        <div>
          <dt>Kiedy zwykle pasuje</dt>
          <dd>${crmFirstVisitEscapeV9(preferredWindow || "—")}</dd>
        </div>

        <div>
          <dt>Kontakt</dt>
          <dd>${crmFirstVisitEscapeV9(contactValue)}</dd>
        </div>
      </dl>
    </article>

    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div>
          <span>3</span>
          <strong>Preferowane terminy</strong>
        </div>

        <button
          type="button"
          data-fv-edit="3">
          Edytuj
        </button>
      </div>

      <div class="crm-first-visit-review-terms-v10">
        ${termsMarkup}
      </div>
    </article>
  `;
}

function crmFirstVisitRenderReviewV10() {
  const host =
    document.getElementById("crmFirstVisitReviewV10");

  if (!host) return;

  host.innerHTML =
    crmFirstVisitReviewMarkupV10();

  host
    .querySelectorAll("[data-fv-edit]")
    .forEach(button => {
      button.onclick = () => {
        crmFirstVisitGoToStepV10(
          Number(button.dataset.fvEdit) || 1,
          {
            validateCurrent: false
          }
        );
      };
    });
}

function crmFirstVisitUpdateProgressV10() {
  document
    .querySelectorAll(
      "#crmFirstVisitProgressV10 [data-progress-step]"
    )
    .forEach(node => {
      const step =
        Number(node.dataset.progressStep) || 1;

      node.classList.toggle(
        "is-active",
        step === crmFirstVisitStepV10
      );

      node.classList.toggle(
        "is-complete",
        step < crmFirstVisitStepV10
      );
    });
}

function crmFirstVisitGoToStepV10(
  targetStep,
  {
    validateCurrent = true
  } = {}
) {
  const next =
    Math.max(
      1,
      Math.min(4, Number(targetStep) || 1)
    );

  if (
    validateCurrent &&
    next > crmFirstVisitStepV10 &&
    !crmFirstVisitValidateStepV10(
      crmFirstVisitStepV10
    )
  ) {
    return false;
  }

  crmFirstVisitStepV10 = next;
  crmFirstVisitClearErrorV10();

  document
    .querySelectorAll(
      "#crmFirstVisitFormV9 [data-fv-step]"
    )
    .forEach(section => {
      section.hidden =
        Number(section.dataset.fvStep) !==
        crmFirstVisitStepV10;
    });

  if (crmFirstVisitStepV10 === 3) {
    crmFirstVisitRenderDaysV9();
  }

  if (crmFirstVisitStepV10 === 4) {
    crmFirstVisitRenderReviewV10();
  }

  crmFirstVisitUpdateProgressV10();

  const form =
    document.getElementById("crmFirstVisitFormV9");

  try {
    form?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (_) {}

  return true;
}

function crmFirstVisitInstallWizardEventsV10(wrapper) {
  wrapper
    .querySelectorAll("[data-fv-next]")
    .forEach(button => {
      button.onclick = () =>
        crmFirstVisitGoToStepV10(
          Number(button.dataset.fvNext)
        );
    });

  wrapper
    .querySelectorAll("[data-fv-back]")
    .forEach(button => {
      button.onclick = () =>
        crmFirstVisitGoToStepV10(
          Number(button.dataset.fvBack),
          {
            validateCurrent: false
          }
        );
    });

  wrapper
    .querySelectorAll(
      "#crmFirstVisitFormV9 input, #crmFirstVisitFormV9 textarea, #crmFirstVisitFormV9 select"
    )
    .forEach(control => {
      control.addEventListener(
        "input",
        crmFirstVisitClearErrorV10
      );

      control.addEventListener(
        "change",
        crmFirstVisitClearErrorV10
      );
    });
}

async function openFirstVisitRequestFormV10(
  phone = "",
  name = ""
) {
  const modal =
    document.getElementById("contact-form-modal");

  if (!modal) return;

  const wrapper = modal.firstElementChild;
  if (!wrapper) return;

  const bookingModal =
    document.getElementById("bookingModal");

  if (bookingModal) {
    bookingModal.style.display = "none";
  }

  modal.classList.add("is-loading-v12");
  wrapper.innerHTML = `
    <div class="crm-first-visit-loading crm-first-visit-loading-v12" role="status" aria-live="polite">
      <span class="crm-first-visit-spinner-v12" aria-hidden="true"></span>
      <span>Ładowanie…</span>
    </div>
  `;

  modal.style.display = "flex";

  try {
    await crmFirstVisitEnsureDataV9();

    modal.classList.remove("is-loading-v12");
    crmFirstVisitDaysV9 = [];
    crmFirstVisitStepV10 = 1;

    wrapper.innerHTML =
      crmFirstVisitFormMarkupV10();

    const nameInput =
      document.getElementById(
        "crmFirstVisitNameV9"
      );

    const phoneInput =
      document.getElementById(
        "crmFirstVisitPhoneV9"
      );

    if (nameInput) {
      nameInput.value = name || "";
    }

    if (phoneInput) {
      phoneInput.value = phone || "";
    }

    wrapper.querySelector(
      ".crm-first-visit-close"
    ).onclick = () => {
      modal.classList.remove("is-loading-v12");
      modal.style.display = "none";
    };

    document.getElementById(
      "crmFirstVisitAddDayV9"
    ).onclick = crmFirstVisitAddDayV9;

    document.getElementById(
      "crmFirstVisitCategoryV9"
    ).onchange = () => {
      crmFirstVisitDaysV9.forEach(
        item => item.times = []
      );

      crmFirstVisitRenderDaysV9();
      crmFirstVisitClearErrorV10();
      crmFirstVisitSyncCategoryCardsV12(wrapper);
    };

    crmFirstVisitInstallCategoryCardsV12(wrapper);

    wrapper
      .querySelectorAll(
        'input[name="crmFirstVisitContactV9"]'
      )
      .forEach(input => {
        input.addEventListener(
          "change",
          () => {
            crmFirstVisitSyncContactMethodV9();
            crmFirstVisitClearErrorV10();
          }
        );
      });

    const form =
      document.getElementById(
        "crmFirstVisitFormV9"
      );

    if (form) {
      form.onsubmit = event => {
        if (
          crmFirstVisitStepV10 !== 4
        ) {
          event.preventDefault();

          crmFirstVisitGoToStepV10(4);
          return;
        }

        crmFirstVisitSubmitV9(event);
      };
    }

    crmFirstVisitInstallWizardEventsV10(
      wrapper
    );

    crmFirstVisitSyncContactMethodV9();
    crmFirstVisitRenderDaysV9();
    crmFirstVisitGoToStepV10(
      1,
      {
        validateCurrent: false
      }
    );
  } catch (error) {
    modal.classList.remove("is-loading-v12");
    wrapper.innerHTML = `
      <div class="crm-first-visit-loading crm-first-visit-load-error">
        <strong>Nie udało się załadować formularza.</strong>
        <p>${crmFirstVisitEscapeV9(error?.message || error)}</p>
        <button type="button" class="verify-btn">
          Spróbuj ponownie
        </button>
      </div>
    `;

    wrapper.querySelector("button").onclick =
      () =>
        openFirstVisitRequestFormV10(
          phone,
          name
        );
  }
}

/*
 * V10 staje się jedynym aktywnym wejściem do pierwszej wizyty.
 * Zachowujemy stare nazwy dla zgodności z resztą INDEX.
 */
window.openFirstVisitRequestFormV10 =
  openFirstVisitRequestFormV10;

window.openFirstVisitRequestFormV9 =
  openFirstVisitRequestFormV10;

window.openFirstVisitRequestFormV8 =
  openFirstVisitRequestFormV10;

window.openFirstVisitRequestForm =
  openFirstVisitRequestFormV10;

/*
 * Nadpisanie karty dla nieznanego numeru:
 * wejście zawsze prowadzi do nowego wizardu V10.
 */
renderUnknownClientContact =
  function(statusEl, phone) {
    if (!statusEl) return;

    statusEl.style.color = "#7a4c00";

    statusEl.innerHTML = `
      <div class="crm-first-visit-unknown">
        <strong>
          Nie znaleźliśmy tego numeru w bazie klientów.
        </strong>

        <span>
          Jeśli to Twoja pierwsza wizyta,
          przejdź przez 4 krótkie kroki i sprawdź dane przed wysłaniem.
        </span>

        <button
          type="button"
          id="openNewClientContactFormBtn"
          class="verify-btn">
          Poproś o pierwszą wizytę
        </button>
      </div>
    `;

    const button =
      document.getElementById(
        "openNewClientContactFormBtn"
      );

    if (button) {
      button.onclick =
        () =>
          openFirstVisitRequestFormV10(
            phone
          );
    }
  };

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const button =
      document.getElementById(
        "openFirstVisitRequestStandaloneV8"
      );

    if (button) {
      button.onclick =
        () =>
          openFirstVisitRequestFormV10();
    }
  }
);

// KONIEC INDEX FIRST VISIT UI V10

// ======================================================================
// INDEX V24.1 — SPÓJNA WALIDACJA TELEFONU
// 2026-08-22
//
// Naprawa rozjazdu:
// - pasek V6 potrafił pokazać „8/8 cyfr · Numer kompletny”,
// - a checkExistingClient chwilę później odrzucał numer komunikatem „np. 9 cyfr”.
//
// Od teraz:
// - liczba cyfr służy tylko jako informacja o długości,
// - „✓ Numer poprawny” pojawia się dopiero, gdy intl-tel-input uzna
//   numer za prawidłowy dla wybranego kraju,
// - jeśli długość jest pełna, ale format/prefix jest zły, pokazujemy
//   jednoznaczny komunikat bez fałszywego „9 cyfr”.
// ======================================================================

function crmPhoneValidationStateV241() {
  const phone =
    document.getElementById("clientPhone");

  const country =
    typeof crmPhoneCountryV6 === "function"
      ? crmPhoneCountryV6()
      : {};

  const iso2 =
    String(country?.iso2 || "pl")
      .toLowerCase();

  const countryName =
    String(country?.name || "")
      .trim();

  const current =
    typeof crmPhoneNationalDigitsV6 === "function"
      ? crmPhoneNationalDigitsV6().length
      : String(phone?.value || "")
          .replace(/\D/g, "")
          .length;

  const expected =
    typeof crmPhoneExpectedDigitsV6 === "function"
      ? crmPhoneExpectedDigitsV6()
      : 9;

  let canValidate = false;
  let valid = false;

  try {
    canValidate =
      !!iti &&
      typeof iti.isValidNumber === "function" &&
      !!window.intlTelInputUtils;

    if (canValidate) {
      valid = !!iti.isValidNumber();
    }
  } catch (_) {
    canValidate = false;
    valid = false;
  }

  return {
    phone,
    country,
    iso2,
    countryName,
    current,
    expected,
    completeLength: current === expected,
    canValidate,
    valid
  };
}

function crmPhoneCountryLabelV241(state) {
  const iso2 =
    String(state?.iso2 || "")
      .toUpperCase();

  if (iso2 === "PL") return "Polska";
  if (iso2 === "UA") return "Ukraina";
  if (iso2 === "BY") return "Białoruś";

  return state?.countryName || iso2 || "wybrany kraj";
}

function crmUpdatePhoneLengthHintV241() {
  const hint =
    typeof crmEnsurePhoneLengthHintV6 === "function"
      ? crmEnsurePhoneLengthHintV6()
      : null;

  if (!hint) return;

  const state =
    crmPhoneValidationStateV241();

  const remaining =
    Math.max(
      0,
      state.expected - state.current
    );

  let message = "";
  let color = "#777";
  let marker = "";

  if (state.current < state.expected) {
    if (remaining === 1) {
      message = "Pozostała 1 cyfra";
    } else if (
      remaining >= 2 &&
      remaining <= 4
    ) {
      message =
        `Pozostały ${remaining} cyfry`;
    } else {
      message =
        `Pozostało ${remaining} cyfr`;
    }
  } else if (state.current > state.expected) {
    message =
      `Za dużo cyfr — maks. ${state.expected}`;
    color = "#b3261e";
  } else if (
    state.canValidate &&
    state.valid
  ) {
    message = "Numer poprawny";
    color = "#26823a";
    marker = " ✓";
  } else if (state.canValidate) {
    message =
      `Nieprawidłowy format dla: ${crmPhoneCountryLabelV241(state)}`;
    color = "#b3261e";
  } else {
    /*
     * Gdy utils jeszcze się ładują, nie pokazujemy fałszywego „✓”.
     * Sama długość może być poprawna, ale format nie został jeszcze sprawdzony.
     */
    message = "Długość kompletna — sprawdzanie formatu";
    color = "#8a6a22";
  }

  hint.style.color = color;

  hint.innerHTML =
    `<span>${state.current}/${state.expected} cyfr · ${message}</span>` +
    `<span style="font-family:monospace;letter-spacing:1px;font-weight:700;">` +
    `${crmPhoneSlotsV6(state.current, state.expected)}${marker}</span>`;
}

/*
 * crmLimitPhoneDigitsV6() wywołuje crmUpdatePhoneLengthHintV6()
 * po każdym wpisaniu znaku. Podmieniamy więc samą funkcję aktualizacji,
 * bez dokładania drugiego konkurującego listenera.
 */
crmUpdatePhoneLengthHintV6 =
  crmUpdatePhoneLengthHintV241;

function crmShowInvalidPhoneV241() {
  const status =
    document.getElementById(
      "clientStatus"
    );

  if (!status) return;

  const state =
    crmPhoneValidationStateV241();

  status.style.display = "block";
  status.style.color = "#b3261e";

  status.textContent =
    `Numer ma prawidłową długość, ale nie jest poprawnym numerem dla kraju: ` +
    `${crmPhoneCountryLabelV241(state)}. Sprawdź cyfry albo wybierz właściwy kraj.`;

  isClientApproved = false;

  if (
    typeof crmClearVerifiedPhoneV5 === "function"
  ) {
    crmClearVerifiedPhoneV5();
  }

  toggleFormState(false);
}

/* V21.1: walidacja V24.1 jest używana przez jeden kontroler telefonu. */

/* V21.1: odświeżanie walidacji telefonu obsługuje jeden kontroler. */

// KONIEC INDEX V24.1

// ======================================================================
// INDEX FIRST VISIT UI V11 — DOCZELOWY FLOW 4 KROKI
// 2026-08-22
//
// KROK 1: dane kontaktowe
// KROK 2: kategoria + opis potrzeb + sposób kontaktu
// KROK 3: preferowane terminy (do 3 dni, przedział max 2h),
//         wiadomość opcjonalna + zgody
// KROK 4: pełne podsumowanie + „Edytuj” + finalna wysyłka
//
// Zachowujemy istniejący backend createFirstVisitRequest i identyfikatory V9/V10,
// żeby nie naruszać działającej integracji ADMIN/Google Apps Script.
// ======================================================================

function crmFirstVisitTimeMinutesV11(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

function crmFirstVisitProposalRowsV11() {
  return (crmFirstVisitDaysV9 || [])
    .filter(item => String(item?.date || "").trim())
    .slice(0, CRM_FIRST_VISIT_MAX_DAYS_V9)
    .map(item => ({
      date: String(item.date || "").trim(),
      start: String(item.start || "").trim(),
      end: String(item.end || "").trim()
    }));
}

function crmFirstVisitPreferredWindowV11(rows = crmFirstVisitProposalRowsV11()) {
  return rows
    .map(item => {
      const date = crmFirstVisitFormatDateV10(item.date) || item.date;
      const range = item.start && item.end
        ? `${item.start}–${item.end}`
        : "bez godzin";
      return `${date}: ${range}`;
    })
    .join("; ");
}

function crmFirstVisitDescriptionV11() {
  return String(
    document.getElementById("crmFirstVisitMessageV9")?.value || ""
  ).trim();
}

function crmFirstVisitOptionalNoteV11() {
  return String(
    document.getElementById("crmFirstVisitNoteV11")?.value || ""
  ).trim();
}

function crmFirstVisitBackendMessageV11() {
  const description = crmFirstVisitDescriptionV11();
  const note = crmFirstVisitOptionalNoteV11();
  if (!note) return description;
  return `${description}\n\nWiadomość dodatkowa: ${note}`;
}

function crmFirstVisitFormMarkupV11() {
  return `
  <div
    id="crmFirstVisitV10"
    class="crm-first-visit-form crm-first-visit-v9 crm-first-visit-v10 crm-first-visit-v11">

    <div class="crm-first-visit-head crm-first-visit-head-v10">
      <div>
        <span class="crm-first-visit-eyebrow">PIERWSZA WIZYTA</span>
        <h2>Wyślij prośbę o termin</h2>
        <p>
          Podaj dane w 3 krótkich krokach, a w kroku 4 sprawdź wszystko przed wysłaniem.
        </p>
      </div>

      <button
        type="button"
        class="crm-first-visit-close"
        aria-label="Zamknij">
        ×
      </button>
    </div>

    ${crmFirstVisitProgressMarkupV10()}

    <form
      id="crmFirstVisitFormV9"
      class="crm-first-visit-wizard-form-v10"
      autocomplete="on">

      <!-- KROK 1 -->
      <section class="crm-first-visit-step-v10" data-fv-step="1">
        <div class="crm-first-visit-step-head-v10">
          <span>KROK 1 Z 4</span>
          <h3>Dane kontaktowe</h3>
          <p>Podaj imię i numer telefonu.</p>
        </div>

        <div class="crm-first-visit-grid">
          <label>
            <span>Imię i nazwisko *</span>
            <input
              id="crmFirstVisitNameV9"
              type="text"
              autocomplete="name"
              placeholder="Wpisz swoje imię i nazwisko"
              required>
          </label>

          <label>
            <span>Telefon *</span>
            <input
              id="crmFirstVisitPhoneV9"
              type="tel"
              autocomplete="tel"
              placeholder="+48 512 345 678"
              required>
          </label>
        </div>

        ${crmFirstVisitStepFooterV10({ next: true, nextLabel: "Dalej", step: 1 })}
      </section>

      <!-- KROK 2 -->
      <section class="crm-first-visit-step-v10" data-fv-step="2" hidden>
        <div class="crm-first-visit-step-head-v10">
          <span>KROK 2 Z 4</span>
          <h3>Szczegóły wizyty</h3>
          <p>Jeśli chcesz, wybierz kategorię. Następnie opisz, czego potrzebujesz i wybierz sposób kontaktu.</p>
        </div>

        <div class="crm-first-visit-field crm-first-visit-category-field-v12">
          <span>Wybierz kategorię <small>(opcjonalnie)</small></span>

          <select
            id="crmFirstVisitCategoryV9"
            class="crm-first-visit-native-select-v12"
            aria-label="Wybierz kategorię">
            <option value="">— Wybierz kategorię —</option>
            ${crmFirstVisitCategoryOptionsV9()}
          </select>

          <div
            id="crmFirstVisitCategoryCardsV12"
            class="crm-first-visit-category-cards-v12">
            ${crmFirstVisitCategoryCardsMarkupV12()}
          </div>
        </div>

        <label class="crm-first-visit-field">
          <span>Opisz, czego potrzebujesz *</span>
          <textarea
            id="crmFirstVisitMessageV9"
            rows="5"
            minlength="5"
            required
            placeholder="Napisz, z czym przychodzisz, czego oczekujesz albo jaki efekt chcesz uzyskać..."></textarea>
        </label>

        ${crmFirstVisitContactMethodMarkupV9()}

        ${crmFirstVisitStepFooterV10({ back: true, next: true, nextLabel: "Dalej", step: 2 })}
      </section>

      <!-- KROK 3 -->
      <section class="crm-first-visit-step-v10" data-fv-step="3" hidden>
        <div class="crm-first-visit-step-head-v10">
          <span>KROK 3 Z 4</span>
          <h3>Preferowane terminy</h3>
          <p>
            Wybierz od 1 do 3 dni i podaj dogodny przedział godzin.
            To tylko propozycje terminów. Potwierdzenie otrzymasz poprzez wybrany wcześniej sposób kontaktu.
          </p>
        </div>

        <section class="crm-first-visit-preferences crm-first-visit-preferences-v10">
          <div class="crm-first-visit-section-title">
            <div>
              <strong>Preferowane dni i godziny</strong>
            </div>

            <button
              type="button"
              id="crmFirstVisitAddDayV9"
              class="crm-first-visit-add-day">
              + Dodaj dzień
            </button>
          </div>

          <div id="crmFirstVisitDaysV9"></div>
        </section>

        <label class="crm-first-visit-field crm-first-visit-note-v11">
          <span>Wiadomość <small>(opcjonalnie)</small></span>
          <textarea
            id="crmFirstVisitNoteV11"
            rows="3"
            maxlength="700"
            placeholder="Napisz, jeśli jest coś, o czym powinnam wiedzieć przed wizytą…"></textarea>
        </label>

        <div class="crm-first-visit-consents-v10 crm-first-visit-consents-step3-v11">
          <label class="crm-first-visit-consent">
            <input id="crmFirstVisitContactConsentV9" type="checkbox" required>
            <span>
              Zgadzam się na kontakt wybranym sposobem w celu ustalenia pierwszej wizyty. *
            </span>
          </label>

          <label class="crm-first-visit-consent">
            <input id="crmFirstVisitRodoV9" type="checkbox" required>
            <span>
              Wyrażam zgodę na przetwarzanie danych w celu obsługi mojego zapytania o wizytę.
              Szczegóły w
              <a href="polityka-prywatnosci.html" target="_blank">Polityce Prywatności</a>. *
            </span>
          </label>
        </div>

        ${crmFirstVisitStepFooterV10({ back: true, next: true, nextLabel: "Podsumowanie", step: 3 })}
      </section>

      <!-- KROK 4 -->
      <section class="crm-first-visit-step-v10" data-fv-step="4" hidden>
        <div class="crm-first-visit-step-head-v10">
          <span>KROK 4 Z 4</span>
          <h3>Podsumowanie</h3>
          <p>
            Sprawdź wszystkie informacje. Przy każdej sekcji możesz kliknąć „Zmień”.
            Nic nie zostanie wysłane, dopóki nie naciśniesz przycisku na dole.
          </p>
        </div>

        <div id="crmFirstVisitReviewV10" class="crm-first-visit-review-v10"></div>

        <div class="crm-first-visit-nav-v10 crm-first-visit-final-nav-v10">
          <button type="button" class="crm-first-visit-back-v10" data-fv-back="3">
            ← Wstecz
          </button>

          <button
            id="crmFirstVisitSubmitV9"
            type="submit"
            class="crm-first-visit-submit">
            Wyślij prośbę o termin
          </button>
        </div>
      </section>

      <div id="crmFirstVisitErrorV9" class="crm-first-visit-error" hidden></div>
    </form>

    <div id="crmFirstVisitSuccessV9" class="crm-first-visit-success" hidden>
      <b>✓</b>
      <strong>Prośba została wysłana</strong>
      <p>
        Salon sprawdzi informacje i zaproponowane terminy,
        a następnie skontaktuje się z Tobą wybranym sposobem.
      </p>
    </div>
  </div>`;
}

crmFirstVisitFormMarkupV10 = crmFirstVisitFormMarkupV11;

crmFirstVisitAddDayV9 = function() {
  if ((crmFirstVisitDaysV9 || []).length >= CRM_FIRST_VISIT_MAX_DAYS_V9) return;

  crmFirstVisitDaysV9.push({
    id: "D" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    date: "",
    start: "",
    end: ""
  });

  crmFirstVisitRenderDaysV9();
};

crmFirstVisitRenderDaysV9 = function() {
  const host = document.getElementById("crmFirstVisitDaysV9");
  const add = document.getElementById("crmFirstVisitAddDayV9");
  if (!host) return;

  if (add) {
    add.disabled =
      (crmFirstVisitDaysV9 || []).length >= CRM_FIRST_VISIT_MAX_DAYS_V9;
  }

  if (!(crmFirstVisitDaysV9 || []).length) {
    host.innerHTML =
      '<div class="crm-first-visit-empty">Dodaj przynajmniej jeden preferowany dzień.</div>';
    return;
  }

  host.innerHTML = crmFirstVisitDaysV9.map((item, index) => `
    <article class="crm-first-visit-day-card crm-first-visit-range-card-v11" data-day-id="${item.id}">
      <div class="crm-first-visit-day-head">
        <strong>Dzień ${index + 1}</strong>
        <button type="button" data-remove-day="${item.id}">Usuń</button>
      </div>

      <div class="crm-first-visit-range-row-v11">
        <label class="crm-first-visit-range-date-v11">
          <span>Data</span>
          <input
            type="text"
            class="crm-first-visit-date"
            data-day-date="${item.id}"
            value="${crmFirstVisitEscapeV9(item.date || "")}"
            placeholder="Wybierz datę"
            readonly>
        </label>

        <label>
          <span>Od</span>
          <input
            type="time"
            data-day-start="${item.id}"
            value="${crmFirstVisitEscapeV9(item.start || "")}">
        </label>

        <label>
          <span>Do</span>
          <input
            type="time"
            data-day-end="${item.id}"
            value="${crmFirstVisitEscapeV9(item.end || "")}">
        </label>
      </div>

      <div class="crm-first-visit-day-hint">
        Przedział musi być dłuższy niż 0 i nie może przekraczać 2 godzin.
      </div>
    </article>
  `).join("");

  host.querySelectorAll("[data-remove-day]").forEach(button => {
    button.onclick = () => crmFirstVisitRemoveDayV9(button.dataset.removeDay);
  });

  host.querySelectorAll("[data-day-start]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayStart);
      if (row) row.start = input.value || "";
      crmFirstVisitClearErrorV10();
    };
  });

  host.querySelectorAll("[data-day-end]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayEnd);
      if (row) row.end = input.value || "";
      crmFirstVisitClearErrorV10();
    };
  });

  host.querySelectorAll("[data-day-date]").forEach(input => {
    const id = input.dataset.dayDate;
    const item = crmFirstVisitDayStateV9(id);

    if (typeof flatpickr === "function") {
      flatpickr(input, {
        locale: "pl",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: crmEndOfNextMonthV14(),
        disableMobile: true,
        defaultDate: item?.date || null,
        onChange: (_selected, dateStr) => {
          const row = crmFirstVisitDayStateV9(id);
          if (!row) return;
          row.date = dateStr;
          crmFirstVisitClearErrorV10();
        }
      });
    }
  });
};

const crmFirstVisitValidateStepV10BeforeV11 = crmFirstVisitValidateStepV10;
crmFirstVisitValidateStepV10 = function(step) {
  crmFirstVisitClearErrorV10();

  if (step === 1) {
    const name = String(document.getElementById("crmFirstVisitNameV9")?.value || "").trim();
    const phone = String(document.getElementById("crmFirstVisitPhoneV9")?.value || "").trim();
    const phoneDigits = phone.replace(/\D/g, "");

    if (!name) {
      crmFirstVisitShowErrorV10("Wpisz imię i nazwisko.");
      return false;
    }

    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      crmFirstVisitShowErrorV10("Wpisz poprawny numer telefonu.");
      return false;
    }

    return true;
  }

  if (step === 2) {
    const category = crmFirstVisitSelectedCategoryV9();
    const description = crmFirstVisitDescriptionV11();
    const contactMethod = String(
      document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || ""
    ).trim();
    const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();

    if (description.length < 5) {
      crmFirstVisitShowErrorV10("Napisz krótko, czego potrzebujesz.");
      return false;
    }

    if (!contactMethod) {
      crmFirstVisitShowErrorV10("Wybierz sposób kontaktu: WhatsApp lub E-mail.");
      return false;
    }

    if (contactMethod === "EMAIL") {
      const input = document.getElementById("crmFirstVisitEmailV9");
      if (!email || (input && !input.checkValidity())) {
        crmFirstVisitShowErrorV10("Podaj poprawny adres e-mail.");
        return false;
      }
    }

    return true;
  }

  if (step === 3) {
    const rows = crmFirstVisitProposalRowsV11();
    const contactConsent = Boolean(document.getElementById("crmFirstVisitContactConsentV9")?.checked);
    const rodo = Boolean(document.getElementById("crmFirstVisitRodoV9")?.checked);

    if (!rows.length) {
      crmFirstVisitShowErrorV10("Dodaj przynajmniej jeden preferowany dzień.");
      return false;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.date || !row.start || !row.end) {
        crmFirstVisitShowErrorV10(`Uzupełnij datę oraz godziny „od–do” dla dnia ${i + 1}.`);
        return false;
      }

      const start = crmFirstVisitTimeMinutesV11(row.start);
      const end = crmFirstVisitTimeMinutesV11(row.end);
      const duration = end - start;

      if (!Number.isFinite(start) || !Number.isFinite(end) || duration <= 0) {
        crmFirstVisitShowErrorV10(`Godzina końcowa w dniu ${i + 1} musi być późniejsza niż początkowa.`);
        return false;
      }

      if (duration > 120) {
        crmFirstVisitShowErrorV10(`Przedział w dniu ${i + 1} może mieć maksymalnie 2 godziny.`);
        return false;
      }
    }

    if (!contactConsent || !rodo) {
      crmFirstVisitShowErrorV10("Zaznacz obie wymagane zgody.");
      return false;
    }

    return true;
  }

  return true;
};

crmFirstVisitReviewMarkupV10 = function() {
  const name = String(document.getElementById("crmFirstVisitNameV9")?.value || "").trim();
  const phone = String(document.getElementById("crmFirstVisitPhoneV9")?.value || "").trim();
  const category = crmFirstVisitSelectedCategoryV9();
  const description = crmFirstVisitDescriptionV11();
  const note = crmFirstVisitOptionalNoteV11();
  const contactMethod = String(
    document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || ""
  ).trim();
  const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();
  const rows = crmFirstVisitProposalRowsV11();

  const contactValue = contactMethod === "EMAIL"
    ? `${crmFirstVisitContactLabelV10(contactMethod)} · ${email || "—"}`
    : `${crmFirstVisitContactLabelV10(contactMethod)} · ${phone || "—"}`;

  const termsMarkup = rows.map(item => `
    <div class="crm-first-visit-review-term-v10 crm-first-visit-review-range-v11">
      <b>${crmFirstVisitEscapeV9(crmFirstVisitFormatDateV10(item.date) || item.date)}</b>
      <span>${crmFirstVisitEscapeV9(`${item.start}–${item.end}`)}</span>
    </div>
  `).join("");

  return `
    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div><span>1</span><strong>Dane kontaktowe</strong></div>
        <button type="button" data-fv-edit="1">Zmień</button>
      </div>
      <dl>
        <div><dt>Imię i nazwisko</dt><dd>${crmFirstVisitEscapeV9(name || "—")}</dd></div>
        <div><dt>Telefon</dt><dd>${crmFirstVisitEscapeV9(phone || "—")}</dd></div>
      </dl>
    </article>

    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div><span>2</span><strong>Szczegóły wizyty</strong></div>
        <button type="button" data-fv-edit="2">Zmień</button>
      </div>
      <dl>
        <div><dt>Kategoria</dt><dd>${crmFirstVisitEscapeV9(category?.name || "Nie wybrano")}</dd></div>
        <div><dt>Opis potrzeb</dt><dd>${crmFirstVisitEscapeV9(description || "—")}</dd></div>
        <div><dt>Sposób kontaktu</dt><dd>${crmFirstVisitEscapeV9(contactValue)}</dd></div>
      </dl>
    </article>

    <article class="crm-first-visit-review-card-v10">
      <div class="crm-first-visit-review-head-v10">
        <div><span>3</span><strong>Preferowane terminy</strong></div>
        <button type="button" data-fv-edit="3">Zmień</button>
      </div>
      <div class="crm-first-visit-review-terms-v10">${termsMarkup}</div>
      <dl class="crm-first-visit-review-note-v11">
        <div><dt>Wiadomość</dt><dd>${crmFirstVisitEscapeV9(note || "Brak")}</dd></div>
        <div><dt>Zgody</dt><dd>Zaakceptowane</dd></div>
      </dl>
    </article>
  `;
};

const crmFirstVisitSubmitV9BeforeV11 = crmFirstVisitSubmitV9;
crmFirstVisitSubmitV9 = async function(event) {
  event.preventDefault();

  if (!crmFirstVisitValidateStepV10(1) ||
      !crmFirstVisitValidateStepV10(2) ||
      !crmFirstVisitValidateStepV10(3)) {
    return;
  }

  const submit = document.getElementById("crmFirstVisitSubmitV9");
  const error = document.getElementById("crmFirstVisitErrorV9");

  if (error) {
    error.hidden = true;
    error.textContent = "";
  }

  const name = String(document.getElementById("crmFirstVisitNameV9")?.value || "").trim();
  const phone = String(document.getElementById("crmFirstVisitPhoneV9")?.value || "").trim();
  const category = crmFirstVisitSelectedCategoryV9();
  const contactMethod = String(
    document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || ""
  ).trim();
  const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();
  const rows = crmFirstVisitProposalRowsV11();

  const proposals = rows.map(item => ({
    date: item.date,
    times: [item.start, item.end]
  }));

  const preferredWindow = crmFirstVisitPreferredWindowV11(rows);
  const message = crmFirstVisitBackendMessageV11();

  if (submit) {
    submit.disabled = true;
    submit.textContent = "Wysyłanie…";
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "createFirstVisitRequest",
        phone,
        name,
        categoryId: category?.id || "",
        category: category?.name || "",
        service: category?.name || "",
        duration: category?.effectiveMinutes || 45,
        message,
        preferredWindow,
        contactMethod,
        email: contactMethod === "EMAIL" ? email : "",
        contactConsent: "TAK",
        rodo: "TAK",
        proposals: JSON.stringify(proposals)
      })
    });

    const data = await response.json();

    if (!data?.success) {
      throw new Error(data?.message || data?.error || "Nie udało się wysłać prośby.");
    }

    const form = document.getElementById("crmFirstVisitFormV9");
    if (form) form.hidden = true;

    const success = document.getElementById("crmFirstVisitSuccessV9");
    if (success) success.hidden = false;

    window.setTimeout(() => {
      const modal = document.getElementById("contact-form-modal");
      if (modal) modal.style.display = "none";
    }, 4200);
  } catch (err) {
    if (error) {
      error.hidden = false;
      error.textContent = err?.message || String(err);
    }

    if (submit) {
      submit.disabled = false;
      submit.textContent = "Wyślij prośbę o termin";
    }
  }
};

window.crmFirstVisitUiVersionV11 = "11.0-4-step-summary-range";

// KONIEC INDEX FIRST VISIT UI V11

// ============================================================================
// INDEX V13 — MOBILE-FIRST / PWA / 4-STEP STANDARD BOOKING
// 2026-08-23
// - zwykła rezerwacja: 4 osobne kroki,
// - FIRST_VISIT: godziny propozycji wyłącznie w godzinach pracy salonu,
// - PWA: instalacja na telefonie + service worker,
// - brak starego formularza w HTML.
// ============================================================================

let crmBookingStepV13 = 1;
let crmPwaInstallPromptV13 = null;

function crmBookingWizardErrorV13(message = "") {
  const box = document.getElementById("bookingWizardErrorV13");
  if (!box) return;
  box.hidden = !message;
  box.textContent = message || "";
}

function crmBookingUpdateVerifiedNameV13() {
  const preview = document.getElementById("bookingVerifiedNamePreviewV13");
  const input = document.getElementById("clientName");
  if (preview) preview.textContent = String(input?.value || "—").trim() || "—";
}

function crmBookingFormatDateV13(value) {
  const raw = String(value || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : raw;
}

function crmBookingSelectedServiceV13() {
  const select = document.getElementById("serviceType");
  const option = select?.options?.[select.selectedIndex];
  if (!select?.value || !option) return null;
  return {
    name: select.value,
    price: option.getAttribute("data-price") || "",
    duration: option.getAttribute("data-duration") || document.getElementById("selectedDuration")?.value || "",
    category: option.getAttribute("data-category") || ""
  };
}

function crmBookingReviewV13() {
  const host = document.getElementById("bookingReviewV13");
  if (!host) return;

  const service = crmBookingSelectedServiceV13();
  const main = String(document.getElementById("finalDateTime")?.value || "");
  const alt = String(document.getElementById("alternativeDateTime")?.value || "");
  const name = String(document.getElementById("clientName")?.value || "").trim();
  const phone = typeof iti !== "undefined" && iti?.isValidNumber?.()
    ? iti.getNumber()
    : String(document.getElementById("clientPhone")?.value || "").trim();

  const mainDate = main.slice(0, 10);
  const mainTime = main.slice(11, 16);
  const altDate = alt.slice(0, 10);
  const altTime = alt.slice(11, 16);
  const meta = [];
  if (service?.price !== "" && Number.isFinite(Number(service?.price))) meta.push(`${Number(service.price)} zł`);
  if (Number(service?.duration) > 0) meta.push(`${Number(service.duration)} min`);

  host.innerHTML = `
    <article class="booking-review-card-v13">
      <div><span>Klient</span><strong>${crmFirstVisitEscapeV9(name || "—")}</strong></div>
      <small>${crmFirstVisitEscapeV9(phone || "—")}</small>
      <button type="button" data-booking-edit="1">Zmień</button>
    </article>
    <article class="booking-review-card-v13">
      <div><span>Zabieg</span><strong>${crmFirstVisitEscapeV9(service?.name || "—")}</strong></div>
      <small>${crmFirstVisitEscapeV9([service?.category, meta.join(" · ")].filter(Boolean).join(" · ") || "—")}</small>
      <button type="button" data-booking-edit="2">Zmień</button>
    </article>
    <article class="booking-review-card-v13">
      <div><span>Termin</span><strong>${crmFirstVisitEscapeV9(mainDate ? `${crmBookingFormatDateV13(mainDate)} · ${mainTime}` : "—")}</strong></div>
      ${alt ? `<small>Alternatywny: ${crmFirstVisitEscapeV9(`${crmBookingFormatDateV13(altDate)} · ${altTime}`)}</small>` : `<small>Termin standardowy</small>`}
      <button type="button" data-booking-edit="3">Zmień</button>
    </article>
  `;

  host.querySelectorAll("[data-booking-edit]").forEach(button => {
    button.onclick = () => crmBookingGoStepV13(Number(button.dataset.bookingEdit), false);
  });
}

function crmBookingValidateStepV13(step) {
  crmBookingWizardErrorV13("");

  if (step === 1) {
    if (!isClientApproved) {
      crmBookingWizardErrorV13("Najpierw zweryfikuj numer telefonu.");
      return false;
    }
    if (!String(document.getElementById("clientName")?.value || "").trim()) {
      crmBookingWizardErrorV13("Nie udało się pobrać danych klienta. Sprawdź numer ponownie.");
      return false;
    }
  }

  if (step === 2) {
    if (!document.getElementById("serviceType")?.value) {
      crmBookingWizardErrorV13("Wybierz kategorię i zabieg.");
      return false;
    }
  }

  if (step === 3) {
    const main = String(document.getElementById("finalDateTime")?.value || "");
    if (!main) {
      crmBookingWizardErrorV13("Wybierz dzień i godzinę wizyty.");
      return false;
    }
    const requiresAlt = selectedSlotPolicy && selectedSlotPolicy.mode === "CONFIRM";
    if (requiresAlt && !String(document.getElementById("alternativeDateTime")?.value || "")) {
      crmBookingWizardErrorV13("Ten termin wymaga potwierdzenia. Wybierz termin alternatywny.");
      return false;
    }
  }

  return true;
}

function crmBookingUpdateProgressV13() {
  document.querySelectorAll("[data-booking-progress]").forEach(node => {
    const step = Number(node.dataset.bookingProgress) || 1;
    node.classList.toggle("is-active", step === crmBookingStepV13);
    node.classList.toggle("is-complete", step < crmBookingStepV13);
  });
}

function crmBookingGoStepV13(target, validate = true) {
  const next = Math.max(1, Math.min(4, Number(target) || 1));
  if (validate && next > crmBookingStepV13 && !crmBookingValidateStepV13(crmBookingStepV13)) return false;

  crmBookingStepV13 = next;
  crmBookingWizardErrorV13("");

  document.querySelectorAll("#bookingForm [data-booking-step]").forEach(section => {
    section.hidden = Number(section.dataset.bookingStep) !== crmBookingStepV13;
  });

  // Krok 1 jest rodzicem pozostałych kroków w celu zachowania zgodności z bookingVerifiedFields.
  const first = document.querySelector('#bookingForm [data-booking-step="1"]');
  if (first) first.hidden = false;
  if (crmBookingStepV13 > 1) {
    const ownIntro = first?.querySelector(":scope > .booking-step-title-v13");
    const ownPhone = first?.querySelector(":scope > .form-group");
    if (ownIntro) ownIntro.hidden = true;
    if (ownPhone) ownPhone.hidden = true;
    const verified = first?.querySelector(":scope > #bookingVerifiedFields > .booking-verified-client-v13");
    const step1Nav = first?.querySelector(":scope > #bookingVerifiedFields > .booking-nav-end-v13");
    if (verified) verified.hidden = true;
    if (step1Nav) step1Nav.hidden = true;
  } else {
    const ownIntro = first?.querySelector(":scope > .booking-step-title-v13");
    const ownPhone = first?.querySelector(":scope > .form-group");
    if (ownIntro) ownIntro.hidden = false;
    if (ownPhone) ownPhone.hidden = false;
    const verified = first?.querySelector(":scope > #bookingVerifiedFields > .booking-verified-client-v13");
    const step1Nav = first?.querySelector(":scope > #bookingVerifiedFields > .booking-nav-end-v13");
    if (verified) verified.hidden = false;
    if (step1Nav) step1Nav.hidden = false;
  }

  if (crmBookingStepV13 === 4) crmBookingReviewV13();
  crmBookingUpdateProgressV13();

  const shell = document.querySelector("#bookingModal .booking-app-shell-v13");
  if (shell) shell.scrollTop = 0;
  return true;
}

function crmBookingInstallWizardV13() {
  document.querySelectorAll("[data-booking-next]").forEach(button => {
    button.onclick = () => crmBookingGoStepV13(Number(button.dataset.bookingNext), true);
  });
  document.querySelectorAll("[data-booking-back]").forEach(button => {
    button.onclick = () => crmBookingGoStepV13(Number(button.dataset.bookingBack), false);
  });

  const status = document.getElementById("clientStatus");
  if (status) {
    new MutationObserver(() => {
      crmBookingUpdateVerifiedNameV13();
      crmBookingWizardErrorV13("");
    }).observe(status, { childList: true, subtree: true, characterData: true });
  }

  const name = document.getElementById("clientName");
  if (name) new MutationObserver(crmBookingUpdateVerifiedNameV13).observe(name, { attributes: true, attributeFilter: ["value"] });

  crmBookingGoStepV13(1, false);
}

// Kategorie -> usługi. Na telefonie nie pokazujemy wszystkich usług naraz.
crmIndexRenderServicePickerV12 = function() {
  const select = document.getElementById("serviceType");
  const host = document.getElementById("crmIndexServicePickerV12");
  if (!select || !host) return;

  const published = (crmIndexServicesV12 || [])
    .filter(crmIndexPublishedV12)
    .sort((a, b) =>
      (Number(a?.categoryOrder) || 0) - (Number(b?.categoryOrder) || 0) ||
      (Number(a?.serviceOrder) || 0) - (Number(b?.serviceOrder) || 0) ||
      String(a?.name || "").localeCompare(String(b?.name || ""), "pl")
    );

  if (!published.length) {
    host.innerHTML = '<div class="crm-index-service-empty-v12">Brak opublikowanych usług.</div>';
    return;
  }

  const groups = new Map();
  published.forEach(item => {
    const category = String(item?.category || "Inne").trim() || "Inne";
    const key = String(item?.categoryId || category).trim() || category;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: category,
        order: Number(item?.categoryOrder) || 0,
        color: String(item?.categoryColor || "#b05c75"),
        icon: String(item?.categoryIcon || ""),
        items: []
      });
    }
    groups.get(key).items.push(item);
  });

  const list = Array.from(groups.values()).sort((a,b) => a.order - b.order || a.name.localeCompare(b.name, "pl"));
  const selectedService = select.value;
  let activeKey = host.dataset.activeCategoryV13 || "";
  if (selectedService) {
    const found = list.find(group => group.items.some(item => String(item.name || "") === selectedService));
    if (found) activeKey = found.key;
  }
  const active = list.find(group => group.key === activeKey) || null;

  host.innerHTML = `
    <div class="booking-category-grid-v13">
      ${list.map(group => `
        <button type="button" class="booking-category-card-v13${active?.key === group.key ? " is-selected" : ""}"
          data-booking-category-v13="${crmFirstVisitEscapeV9(group.key)}"
          style="--crm-cat:${crmFirstVisitEscapeV9(group.color)}">
          <span class="booking-category-accent-v13"></span>
          <img src="${crmIndexIconPathV12(group.icon, group.name)}" alt="" loading="lazy" onerror="this.style.display='none'">
          <span><strong>${crmFirstVisitEscapeV9(group.name)}</strong><small>${group.items.length} ${group.items.length === 1 ? "zabieg" : "zabiegi"}</small></span>
          <b aria-hidden="true">›</b>
        </button>
      `).join("")}
    </div>
    ${active ? `
      <div class="booking-service-list-v13">
        <div class="booking-service-list-head-v13"><strong>${crmFirstVisitEscapeV9(active.name)}</strong><span>Wybierz zabieg</span></div>
        ${active.items.map(item => {
          const meta = crmIndexServiceMetaV12(item);
          const selected = selectedService === String(item.name || "");
          return `
            <button type="button" class="booking-service-card-v13${selected ? " is-selected" : ""}" data-crm-service="${crmFirstVisitEscapeV9(item.name || "")}">
              <span><strong>${crmFirstVisitEscapeV9(item.name || "")}</strong>${meta ? `<small>${crmFirstVisitEscapeV9(meta)}</small>` : ""}</span>
              <b aria-hidden="true">${selected ? "✓" : "›"}</b>
            </button>`;
        }).join("")}
      </div>` : '<div class="booking-category-hint-v13">Wybierz kategorię, aby zobaczyć zabiegi.</div>'}
  `;

  host.querySelectorAll("[data-booking-category-v13]").forEach(button => {
    button.onclick = () => {
      host.dataset.activeCategoryV13 = button.dataset.bookingCategoryV13 || "";
      crmIndexRenderServicePickerV12();
    };
  });

  host.querySelectorAll("[data-crm-service]").forEach(button => {
    button.onclick = () => {
      if (select.disabled) return;
      select.value = button.dataset.crmService || "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      crmIndexRenderServicePickerV12();
      crmBookingWizardErrorV13("");
    };
  });
};

// Po zmianie usługi utrzymujemy nowy picker i czyścimy ewentualny błąd kroku.
const crmOnServiceChangeBeforeV13 = onServiceChange;
onServiceChange = function() {
  const result = crmOnServiceChangeBeforeV13();
  crmBookingWizardErrorV13("");
  window.setTimeout(crmIndexRenderServicePickerV12, 0);
  return result;
};

// FIRST_VISIT — wyłącznie godziny pracy salonu. Jeśli ustawienie jest niepoprawne,
// bezpieczny fallback 09:00–18:00.
function crmFirstVisitWorkBoundsV13() {
  const valid = value => /^\d{2}:\d{2}$/.test(String(value || "").slice(0,5));
  let start = String(adminSettings?.work_start_hour || "09:00").slice(0,5);
  let end = String(adminSettings?.work_end_hour || "18:00").slice(0,5);
  if (!valid(start) || !valid(end)) return { start: "09:00", end: "18:00", startMin: 540, endMin: 1080 };
  const toMin = value => {
    const [h,m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  let startMin = toMin(start), endMin = toMin(end);
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
    start = "09:00"; end = "18:00"; startMin = 540; endMin = 1080;
  }
  return { start, end, startMin, endMin };
}

function crmFirstVisitTimeOptionsV13(fromMin, toMin, selected = "", step = 15) {
  const out = ['<option value="">—:—</option>'];
  for (let minute = fromMin; minute <= toMin; minute += step) {
    const value = `${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
    out.push(`<option value="${value}"${value === selected ? " selected" : ""}>${value}</option>`);
  }
  return out.join("");
}

crmFirstVisitRenderDaysV9 = function() {
  const host = document.getElementById("crmFirstVisitDaysV9");
  const add = document.getElementById("crmFirstVisitAddDayV9");
  if (!host) return;

  if (add) add.disabled = (crmFirstVisitDaysV9 || []).length >= CRM_FIRST_VISIT_MAX_DAYS_V9;
  if (!(crmFirstVisitDaysV9 || []).length) {
    host.innerHTML = '<div class="crm-first-visit-empty">Dodaj przynajmniej jeden preferowany dzień.</div>';
    return;
  }

  const work = crmFirstVisitWorkBoundsV13();
  host.innerHTML = crmFirstVisitDaysV9.map((item, index) => {
    const startMin = item.start ? crmFirstVisitTimeMinutesV11(item.start) : NaN;
    const endFrom = Number.isFinite(startMin) ? startMin + 15 : work.startMin + 15;
    const endTo = Number.isFinite(startMin) ? Math.min(startMin + 120, work.endMin) : work.endMin;
    return `
      <article class="crm-first-visit-day-card crm-first-visit-range-card-v11" data-day-id="${item.id}">
        <div class="crm-first-visit-day-head"><strong>Dzień ${index + 1}</strong><button type="button" data-remove-day="${item.id}">Usuń</button></div>
        <div class="crm-first-visit-range-row-v11 crm-first-visit-range-row-v13">
          <label class="crm-first-visit-range-date-v11"><span>Data</span><input type="text" class="crm-first-visit-date" data-day-date="${item.id}" value="${crmFirstVisitEscapeV9(item.date || "")}" placeholder="Wybierz datę" readonly></label>
          <label><span>Od</span><select data-day-start="${item.id}">${crmFirstVisitTimeOptionsV13(work.startMin, work.endMin - 15, item.start || "")}</select></label>
          <label><span>Do</span><select data-day-end="${item.id}" ${item.start ? "" : "disabled"}>${crmFirstVisitTimeOptionsV13(endFrom, endTo, item.end || "")}</select></label>
        </div>
      </article>`;
  }).join("");

  host.querySelectorAll("[data-remove-day]").forEach(button => {
    button.onclick = () => crmFirstVisitRemoveDayV9(button.dataset.removeDay);
  });
  host.querySelectorAll("[data-day-start]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayStart);
      if (row) { row.start = input.value || ""; row.end = ""; }
      crmFirstVisitClearErrorV10();
      crmFirstVisitRenderDaysV9();
    };
  });
  host.querySelectorAll("[data-day-end]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayEnd);
      if (row) row.end = input.value || "";
      crmFirstVisitClearErrorV10();
    };
  });
  host.querySelectorAll("[data-day-date]").forEach(input => {
    const id = input.dataset.dayDate;
    const item = crmFirstVisitDayStateV9(id);
    if (typeof flatpickr === "function") {
      flatpickr(input, {
        locale: "pl", dateFormat: "Y-m-d", minDate: "today", maxDate: crmEndOfNextMonthV14(), disableMobile: true,
        defaultDate: item?.date || null,
        onChange: (_selected, dateStr) => {
          const row = crmFirstVisitDayStateV9(id);
          if (row) row.date = dateStr;
          crmFirstVisitClearErrorV10();
        }
      });
    }
  });
};

// Dodatkowa walidacja zakresu FIRST_VISIT przeciw godzinom pracy salonu.
const crmFirstVisitValidateStepBeforeV13 = crmFirstVisitValidateStepV10;
crmFirstVisitValidateStepV10 = function(step) {
  if (step !== 3) return crmFirstVisitValidateStepBeforeV13(step);
  const base = crmFirstVisitValidateStepBeforeV13(step);
  if (!base) return false;
  const work = crmFirstVisitWorkBoundsV13();
  const rows = crmFirstVisitProposalRowsV11();
  for (let i = 0; i < rows.length; i++) {
    const start = crmFirstVisitTimeMinutesV11(rows[i].start);
    const end = crmFirstVisitTimeMinutesV11(rows[i].end);
    if (start < work.startMin || end > work.endMin) {
      crmFirstVisitShowErrorV10(`Dzień ${i + 1}: wybierz godziny w czasie pracy salonu ${work.start}–${work.end}.`);
      return false;
    }
  }
  return true;
};

// PWA
function crmIsStandaloneV13() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function crmIsMobileV13() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 900;
}

function crmSetupPwaV13() {
  const btn = document.getElementById("pwaInstallBtn");
  const iosHelp = document.getElementById("pwaIosHelpV13");
  const iosClose = document.getElementById("pwaIosCloseV13");
  if (!btn || crmIsStandaloneV13() || !crmIsMobileV13()) return;

  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari = /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(navigator.userAgent);

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    crmPwaInstallPromptV13 = event;
    btn.hidden = false;
  });

  if (isIos && isSafari) btn.hidden = false;

  btn.onclick = async () => {
    if (crmPwaInstallPromptV13) {
      crmPwaInstallPromptV13.prompt();
      try { await crmPwaInstallPromptV13.userChoice; } catch (_) {}
      crmPwaInstallPromptV13 = null;
      btn.hidden = true;
      return;
    }
    if (isIos && iosHelp) iosHelp.hidden = false;
  };

  if (iosClose && iosHelp) iosClose.onclick = () => { iosHelp.hidden = true; };
  window.addEventListener("appinstalled", () => { btn.hidden = true; });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js?v=21.1").catch(error => console.warn("PWA service worker:", error));
  }
}

// Reset wizarda razem z dotychczasowym resetem formularza.
const crmOpenBookingBeforeV13 = openBookingModal;
openBookingModal = function() {
  crmBookingStepV13 = 1;
  crmBookingWizardErrorV13("");
  const host = document.getElementById("crmIndexServicePickerV12");
  if (host) host.dataset.activeCategoryV13 = "";
  crmOpenBookingBeforeV13();
  crmBookingGoStepV13(1, false);
};

const crmCloseBookingBeforeV13 = closeBookingModal;
closeBookingModal = function() {
  crmBookingStepV13 = 1;
  crmBookingWizardErrorV13("");
  return crmCloseBookingBeforeV13();
};

document.addEventListener("DOMContentLoaded", () => {
  crmBookingInstallWizardV13();
  crmSetupPwaV13();
});

// KONIEC INDEX V13


// ============================================================================
// INDEX V14 — UZGODNIONE POPRAWKI UX 2026-08-23
// - stały klient: telefon jako weryfikacja przed właściwymi 3 krokami,
// - pasek 1–2–3 dopiero po pozytywnej weryfikacji,
// - kalendarz stałego klienta zawsze widoczny, bieżący + następny miesiąc,
// - FIRST_VISIT: kategoria opcjonalna, termin max do końca następnego miesiąca.
// ============================================================================
function crmEndOfNextMonthV14() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
}

function crmDaysUntilEndOfNextMonthV14() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = crmEndOfNextMonthV14();
  end.setHours(0,0,0,0);
  return Math.max(0, Math.ceil((end - today) / 86400000));
}

const crmBookingUpdateProgressBeforeV14 = crmBookingUpdateProgressV13;
crmBookingUpdateProgressV13 = function() {
  crmBookingUpdateProgressBeforeV14();
  const progress = document.getElementById("bookingProgressV14");
  if (progress) progress.hidden = !(isClientApproved && crmBookingStepV13 >= 2);
};

// V21.1: przejście po weryfikacji oraz klik/Enter obsługuje jeden kontroler telefonu.

// Kalendarz zwykłej rezerwacji: pełny, stale widoczny, tylko bieżący i następny miesiąc.
initCalendar = function(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput || typeof flatpickr !== "function") return;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
    flatpickrInstance = null;
  }

  const serviceSelect = document.getElementById("serviceType");
  const serviceSelected = Boolean(serviceSelect && serviceSelect.value);
  const horizon = crmDaysUntilEndOfNextMonthV14();
  const disabledDates = serviceSelected ? buildDisabledBookingDates(horizon) : [];
  const maxDate = crmEndOfNextMonthV14();

  const selectedDateAvailable = Boolean(
    defaultDate && !disabledDates.includes(defaultDate) && new Date(defaultDate + "T12:00:00") <= maxDate
  );

  if (defaultDate && !selectedDateAvailable) {
    calendarInput.value = "";
    const finalDateTime = document.getElementById("finalDateTime");
    if (finalDateTime) finalDateTime.value = "";
    selectedSlotPolicy = null;
    updateAlternativeSection();
  }

  flatpickrInstance = flatpickr(calendarInput, {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate,
    disableMobile: true,
    allowInput: false,
    inline: true,
    monthSelectorType: "static",
    disable: disabledDates,
    defaultDate: selectedDateAvailable ? defaultDate : null,
    onChange: function(_selectedDates, dateStr) {
      if (!dateStr || getBookableSlotsForDate(dateStr).length === 0) {
        calendarInput.value = "";
        const finalDateTime = document.getElementById("finalDateTime");
        if (finalDateTime) finalDateTime.value = "";
        return;
      }
      displayTimeSlots(dateStr);
    }
  });
};

// Termin alternatywny — ten sam ograniczony kalendarz, ale pojawia się tylko gdy jest wymagany.
updateAlternativeSection = function() {
  const sec = document.getElementById("alternativeBookingSection");
  const note = document.getElementById("bookingPolicyNotice");
  const need = selectedSlotPolicy && selectedSlotPolicy.mode === "CONFIRM";
  if (sec) sec.style.display = need ? "block" : "none";
  if (note) {
    note.style.display = need ? "block" : "none";
    note.textContent = need ? "Ten termin wymaga potwierdzenia. Wybierz dodatkowy termin na wypadek odrzucenia pierwszego." : "";
  }
  if (!need) {
    const alt = document.getElementById("alternativeDateTime");
    if (alt) alt.value = "";
    if (alternativeFlatpickr) { alternativeFlatpickr.destroy(); alternativeFlatpickr = null; }
    return;
  }

  const input = document.getElementById("alternativeCalendarInput");
  if (!input || typeof flatpickr !== "function") return;
  if (alternativeFlatpickr) alternativeFlatpickr.destroy();
  alternativeFlatpickr = flatpickr(input, {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: crmEndOfNextMonthV14(),
    disableMobile: true,
    allowInput: false,
    inline: true,
    monthSelectorType: "static",
    onChange: (_ds, dateStr) => renderAlternativeSlots(dateStr)
  });
};

// FIRST_VISIT: kategoria jest opcjonalna.
const crmFirstVisitValidateStepBeforeV14 = crmFirstVisitValidateStepV10;
crmFirstVisitValidateStepV10 = function(step) {
  if (step !== 2) return crmFirstVisitValidateStepBeforeV14(step);
  crmFirstVisitClearErrorV10();

  const description = crmFirstVisitDescriptionV11();
  const contactMethod = String(
    document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || ""
  ).trim();
  const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();

  if (description.length < 5) {
    crmFirstVisitShowErrorV10("Napisz krótko, czego potrzebujesz.");
    return false;
  }
  if (!contactMethod) {
    crmFirstVisitShowErrorV10("Wybierz sposób kontaktu: WhatsApp lub E-mail.");
    return false;
  }
  if (contactMethod === "EMAIL") {
    const input = document.getElementById("crmFirstVisitEmailV9");
    if (!email || (input && !input.checkValidity())) {
      crmFirstVisitShowErrorV10("Podaj poprawny adres e-mail.");
      return false;
    }
  }
  return true;
};

// FIRST_VISIT: można dodawać preferowane dni także bez wskazania kategorii.
crmFirstVisitAddDayV9 = function() {
  if ((crmFirstVisitDaysV9 || []).length >= CRM_FIRST_VISIT_MAX_DAYS_V9) return;
  crmFirstVisitDaysV9.push({
    id: "D" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    date: "",
    start: "",
    end: ""
  });
  crmFirstVisitRenderDaysV9();
};

// Po wejściu w krok preferowanych terminów od razu dodaj pierwszy dzień, jeśli lista jest pusta.
const crmFirstVisitGoToStepBeforeV14 = crmFirstVisitGoToStepV10;
crmFirstVisitGoToStepV10 = function(targetStep, options = {}) {
  const result = crmFirstVisitGoToStepBeforeV14(targetStep, options);
  if (result && Number(targetStep) === 3 && !(crmFirstVisitDaysV9 || []).length) {
    crmFirstVisitAddDayV9();
  }
  return result;
};

window.crmIndexUiVersionV14 = "14.0-mobile-calendar-optional-category";
// KONIEC INDEX V14


// ============================================================================
// INDEX V15 — stabilny blur bez backdrop-filter + widoczność stanu modala
// ============================================================================
(function crmInstallModalBackdropV15(){
  function sync(){
    const booking = document.getElementById('bookingModal');
    const first = document.getElementById('contact-form-modal');
    const isVisible = (el) => !!el && el.style.display !== 'none' && getComputedStyle(el).display !== 'none';
    document.body.classList.toggle('crm-modal-open-v15', isVisible(booking) || isVisible(first));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const targets = [
      document.getElementById('bookingModal'),
      document.getElementById('contact-form-modal')
    ].filter(Boolean);

    const observer = new MutationObserver(sync);
    targets.forEach(el => observer.observe(el, {attributes:true, attributeFilter:['style','class']}));
    sync();
  });
})();
// KONIEC INDEX V15

// ============================================================================
// INDEX V16 — FIRST_VISIT: pełny kalendarz w kroku 3
// ============================================================================
crmFirstVisitRenderDaysV9 = function() {
  const host = document.getElementById("crmFirstVisitDaysV9");
  const add = document.getElementById("crmFirstVisitAddDayV9");
  if (!host) return;

  if (add) add.disabled = (crmFirstVisitDaysV9 || []).length >= CRM_FIRST_VISIT_MAX_DAYS_V9;
  if (!(crmFirstVisitDaysV9 || []).length) {
    host.innerHTML = '<div class="crm-first-visit-empty">Dodaj przynajmniej jeden preferowany dzień.</div>';
    return;
  }

  const work = crmFirstVisitWorkBoundsV13();
  host.innerHTML = crmFirstVisitDaysV9.map((item, index) => {
    const startMin = item.start ? crmFirstVisitTimeMinutesV11(item.start) : NaN;
    const endFrom = Number.isFinite(startMin) ? startMin + 15 : work.startMin + 15;
    const endTo = Number.isFinite(startMin) ? Math.min(startMin + 120, work.endMin) : work.endMin;

    return `
      <article class="crm-first-visit-day-card crm-first-visit-range-card-v11 crm-first-visit-day-card-v16" data-day-id="${item.id}">
        <div class="crm-first-visit-day-head">
          <strong>Dzień ${index + 1}</strong>
          <button type="button" data-remove-day="${item.id}">Usuń</button>
        </div>

        <div class="crm-first-visit-calendar-field-v16">
          <span class="crm-first-visit-calendar-label-v16">Data</span>
          <input type="text"
                 class="crm-first-visit-date crm-first-visit-date-v16"
                 data-day-date="${item.id}"
                 value="${crmFirstVisitEscapeV9(item.date || "")}"
                 aria-label="Wybierz datę dla dnia ${index + 1}"
                 readonly>
        </div>

        <div class="crm-first-visit-range-row-v11 crm-first-visit-range-row-v13 crm-first-visit-time-row-v16">
          <label><span>Od</span><select data-day-start="${item.id}">${crmFirstVisitTimeOptionsV13(work.startMin, work.endMin - 15, item.start || "")}</select></label>
          <label><span>Do</span><select data-day-end="${item.id}" ${item.start ? "" : "disabled"}>${crmFirstVisitTimeOptionsV13(endFrom, endTo, item.end || "")}</select></label>
        </div>
      </article>`;
  }).join("");

  host.querySelectorAll("[data-remove-day]").forEach(button => {
    button.onclick = () => crmFirstVisitRemoveDayV9(button.dataset.removeDay);
  });

  host.querySelectorAll("[data-day-start]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayStart);
      if (row) {
        row.start = input.value || "";
        row.end = "";
      }
      crmFirstVisitClearErrorV10();
      crmFirstVisitRenderDaysV9();
    };
  });

  host.querySelectorAll("[data-day-end]").forEach(input => {
    input.onchange = () => {
      const row = crmFirstVisitDayStateV9(input.dataset.dayEnd);
      if (row) row.end = input.value || "";
      crmFirstVisitClearErrorV10();
    };
  });

  host.querySelectorAll("[data-day-date]").forEach(input => {
    const id = input.dataset.dayDate;
    const item = crmFirstVisitDayStateV9(id);
    if (typeof flatpickr !== "function") return;

    flatpickr(input, {
      locale: "pl",
      dateFormat: "Y-m-d",
      minDate: "today",
      maxDate: crmEndOfNextMonthV14(),
      disableMobile: true,
      allowInput: false,
      inline: true,
      showMonths: 1,
      monthSelectorType: "static",
      defaultDate: item?.date || null,
      onChange: (_selected, dateStr) => {
        const row = crmFirstVisitDayStateV9(id);
        if (row) row.date = dateStr;
        crmFirstVisitClearErrorV10();
      }
    });
  });
};

window.crmIndexUiVersionV16 = "16.0-first-visit-inline-calendar";
// KONIEC INDEX V16

// ============================================================================
// INDEX V20 — STATUS KLIENTA / KONTAKT / STABILNE ŁADOWANIE ZABIEGÓW
// 2026-08-23
// - STANDARDOWY: zwykła rezerwacja,
// - WYMAGA_POTWIERDZENIA: każda rezerwacja trafia jako prośba do ADMIN,
// - TYLKO_KONTAKT: istniejący klient dostaje flow podobny do FIRST_VISIT,
// - normalna rezerwacja pamięta preferowany WhatsApp/E-mail na tym urządzeniu,
// - picker usług jest ukryty do końca ładowania danych.
// ============================================================================
let crmClientBookingModeV20 = "STANDARDOWY";
let crmClientRestrictionReasonV20 = "";
let crmExistingClientContactV20 = null;
let crmServicesLoadingV20 = false;

function crmNormalizeBookingModeV20(value) {
  const mode = String(value || "STANDARDOWY").trim().toUpperCase();
  if (mode === "TYLKO_KONTAKT") return "TYLKO_KONTAKT";
  if (mode === "STANDARDOWY") return "STANDARDOWY";
  return "WYMAGA_POTWIERDZENIA";
}

function crmBookingModeBannerV20(mode = crmClientBookingModeV20) {
  const box = document.getElementById("bookingModeBannerV20");
  if (!box) return;
  const normalized = crmNormalizeBookingModeV20(mode);
  if (normalized !== "WYMAGA_POTWIERDZENIA") {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  box.hidden = false;
  box.innerHTML = `
    <strong>Rezerwacja wymaga potwierdzenia</strong>
    <span>Twój numer został zweryfikowany. Wybrany termin zostanie przesłany do salonu do zatwierdzenia.</span>
  `;
}


function crmContactStorageKeyV20(phone = "") {
  return "nailArtContactPrefsV20:" + String(phone || "").replace(/\D/g, "");
}

function crmReadContactPrefsV20(phone = "") {
  const fallback = { whatsapp: true, email: false, emailAddress: "" };
  try {
    const raw = localStorage.getItem(crmContactStorageKeyV20(phone));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) || {};
    const whatsapp = parsed.whatsapp === true;
    const email = parsed.email === true;
    return {
      whatsapp: whatsapp || !email,
      email,
      emailAddress: String(parsed.emailAddress || "")
    };
  } catch (_) { return fallback; }
}

function crmWriteContactPrefsV20(phone = "", prefs = {}) {
  try {
    localStorage.setItem(crmContactStorageKeyV20(phone), JSON.stringify({
      whatsapp: prefs.whatsapp === true,
      email: prefs.email === true,
      emailAddress: String(prefs.emailAddress || "").trim()
    }));
  } catch (_) {}
}

function crmCurrentVerifiedPhoneV20() {
  try {
    if (iti?.isValidNumber?.()) return iti.getNumber().replace(/\s+/g, "");
  } catch (_) {}
  const raw = String(document.getElementById("clientPhone")?.value || "").replace(/\D/g, "");
  return raw.length === 9 ? "+48" + raw : raw;
}

function crmSyncContactPrefsUiV20(loadSaved = false) {
  const wa = document.getElementById("bookingContactWhatsappV20");
  const mail = document.getElementById("bookingContactEmailV20");
  const emailField = document.getElementById("bookingContactEmailFieldV20");
  const emailInput = document.getElementById("bookingContactEmailAddressV20");
  if (!wa || !mail) return;
  if (loadSaved) {
    const saved = crmReadContactPrefsV20(crmCurrentVerifiedPhoneV20());
    wa.checked = saved.whatsapp;
    mail.checked = saved.email;
    if (emailInput) emailInput.value = saved.emailAddress;
  }
  if (!wa.checked && !mail.checked) wa.checked = true;
  if (emailField) emailField.hidden = !mail.checked;
}

function crmGetContactPrefsV20() {
  const wa = document.getElementById("bookingContactWhatsappV20")?.checked === true;
  const mail = document.getElementById("bookingContactEmailV20")?.checked === true;
  const emailAddress = String(document.getElementById("bookingContactEmailAddressV20")?.value || "").trim();
  return { whatsapp: wa, email: mail, emailAddress };
}

function crmValidateContactPrefsV20() {
  const prefs = crmGetContactPrefsV20();
  if (!prefs.whatsapp && !prefs.email) {
    crmBookingWizardErrorV13("Wybierz co najmniej jeden sposób kontaktu: WhatsApp lub E-mail.");
    return null;
  }
  if (prefs.email) {
    const input = document.getElementById("bookingContactEmailAddressV20");
    if (!prefs.emailAddress || (input && !input.checkValidity())) {
      crmBookingWizardErrorV13("Podaj poprawny adres e-mail albo odznacz E-mail.");
      return null;
    }
  }
  return prefs;
}

function crmSetServicesLoadingV20(loading) {
  crmServicesLoadingV20 = !!loading;
  const loader = document.getElementById("bookingServicesLoadingV20");
  const picker = document.getElementById("crmIndexServicePickerV12");
  if (loader) loader.hidden = !crmServicesLoadingV20;
  if (picker) picker.hidden = crmServicesLoadingV20;
}

const crmLoadServicesBeforeV20 = loadServicesIntoSelect;
loadServicesIntoSelect = async function() {
  crmSetServicesLoadingV20(true);
  try {
    const result = await crmLoadServicesBeforeV20();
    crmSetServicesLoadingV20(false);
    // Podczas ładowania renderer V20 celowo nic nie rysuje.
    // Po pobraniu danych trzeba więc wykonać render jeszcze raz.
    crmIndexRenderServicePickerV12();
    return result;
  } catch (error) {
    crmSetServicesLoadingV20(false);
    throw error;
  }
};

const crmRenderServicePickerBeforeV20 = crmIndexRenderServicePickerV12;
crmIndexRenderServicePickerV12 = function() {
  const host = document.getElementById("crmIndexServicePickerV12");
  if (crmServicesLoadingV20) {
    if (host) host.hidden = true;
    return;
  }
  const result = crmRenderServicePickerBeforeV20();
  if (host) host.hidden = false;
  return result;
};

async function crmOpenExistingClientContactV20(phone, name) {
  crmExistingClientContactV20 = { phone, name, bookingMode: "TYLKO_KONTAKT" };
  await openFirstVisitRequestFormV10(phone, name);

  const root = document.getElementById("crmFirstVisitV10");
  if (!root) return;
  root.classList.add("crm-existing-client-contact-v20");

  const eyebrow = root.querySelector(".crm-first-visit-head-v10 .crm-first-visit-eyebrow");
  const title = root.querySelector(".crm-first-visit-head-v10 h2");
  const intro = root.querySelector(".crm-first-visit-head-v10 p");
  if (eyebrow) eyebrow.textContent = "KLIENT";
  if (title) title.textContent = "Poproś o umówienie wizyty";
  if (intro) intro.textContent = "Twój numer jest w bazie klientów. Wyślij propozycję terminu, a salon skontaktuje się z Tobą wybranym sposobem.";

  const step1 = root.querySelector('[data-fv-step="1"] .crm-first-visit-step-head-v10');
  if (step1) {
    const h3 = step1.querySelector("h3");
    const p = step1.querySelector("p");
    if (h3) h3.textContent = "Twoje dane";
    if (p) p.textContent = "Dane zostały rozpoznane na podstawie numeru telefonu.";
  }

  // TYLKO_KONTAKT: tekst kroku 2 jest neutralny dla istniejącego klienta,
  // a nie jak formularz pierwszej wizyty.
  const step2 = root.querySelector('[data-fv-step="2"]');
  if (step2) {
    const step2Intro = step2.querySelector(".crm-first-visit-step-head-v10 p");
    if (step2Intro) {
      step2Intro.textContent = "Jeśli chcesz, wybierz kategorię i dodaj wiadomość dotyczącą wizyty lub terminu.";
    }

    const message = document.getElementById("crmFirstVisitMessageV9");
    if (message) {
      const messageField = message.closest(".crm-first-visit-field");
      const messageLabel = messageField ? messageField.querySelector("span") : null;
      if (messageLabel) messageLabel.textContent = "Wiadomość do salonu *";
      message.placeholder = "Dodaj informacje dotyczące wizyty lub terminu.";
    }
  }

  const nameInput = document.getElementById("crmFirstVisitNameV9");
  const phoneInput = document.getElementById("crmFirstVisitPhoneV9");
  if (nameInput) nameInput.readOnly = true;
  if (phoneInput) phoneInput.readOnly = true;

  // Dla znanego klienta przywracamy ostatnio używany sposób kontaktu.
  const savedContact = crmReadContactPrefsV20(phone);
  const preferredMethod = savedContact.email && !savedContact.whatsapp ? "EMAIL" : "WHATSAPP";
  const preferredRadio = root.querySelector(`input[name="crmFirstVisitContactV9"][value="${preferredMethod}"]`);
  if (preferredRadio) {
    preferredRadio.checked = true;
    preferredRadio.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const fvEmail = document.getElementById("crmFirstVisitEmailV9");
  if (fvEmail && savedContact.emailAddress) fvEmail.value = savedContact.emailAddress;

  const success = document.getElementById("crmFirstVisitSuccessV9");
  if (success) {
    const strong = success.querySelector("strong");
    const p = success.querySelector("p");
    if (strong) strong.textContent = "Prośba została wysłana";
    if (p) p.textContent = "Salon otrzymał Twoją prośbę i skontaktuje się z Tobą wybranym sposobem.";
  }
}

/* V21.1: status klienta pobiera bezpośrednio Booking Apps Script w jednym zapytaniu. */

const crmBookingGoStepBeforeV20 = crmBookingGoStepV13;
crmBookingGoStepV13 = function(target, validate = true) {
  const result = crmBookingGoStepBeforeV20(target, validate);
  if (result) {
    crmBookingModeBannerV20(crmClientBookingModeV20);
    if (Number(target) === 4) crmSyncContactPrefsUiV20(false);
  }
  return result;
};

// Normalna rezerwacja: respektuje tryb klienta oraz zapisuje wybór kontaktu.
submitForm = async function(event) {
  event.preventDefault();
  if (bookingSubmissionLocked) return;

  const currentPhoneToken = typeof crmNormalizePhoneTokenV5 === "function" ? crmNormalizePhoneTokenV5() : "";
  if (crmVerifiedPhoneTokenV5 && currentPhoneToken === crmVerifiedPhoneTokenV5) isClientApproved = true;
  if (!isClientApproved) {
    crmBookingWizardErrorV13("Najpierw zweryfikuj numer telefonu.");
    return;
  }

  const main = String(document.getElementById("finalDateTime")?.value || "");
  const alt = String(document.getElementById("alternativeDateTime")?.value || "");
  if (!main) {
    crmBookingWizardErrorV13("Wybierz dzień i godzinę wizyty.");
    return;
  }

  const slotNeedsConfirmation = selectedSlotPolicy?.mode === "CONFIRM";
  if (slotNeedsConfirmation && !alt) {
    crmBookingWizardErrorV13("Ten termin wymaga potwierdzenia. Wybierz termin alternatywny.");
    return;
  }

  const prefs = crmValidateContactPrefsV20();
  if (!prefs) return;
  const rodo = document.getElementById("rodoConsent");
  if (!rodo?.checked) {
    crmBookingWizardErrorV13("Zaznacz zgodę na przetwarzanie danych potrzebną do realizacji rezerwacji.");
    return;
  }

  const duration = parseInt(document.getElementById("selectedDuration")?.value, 10) || 45;
  const forceRequest = crmClientBookingModeV20 === "WYMAGA_POTWIERDZENIA" || slotNeedsConfirmation;
  const action = forceRequest ? "createBookingRequest" : "createBooking";
  const reasons = [];
  if (crmClientBookingModeV20 === "WYMAGA_POTWIERDZENIA") reasons.push("Klient ma ustawiony tryb WYMAGA_POTWIERDZENIA");
  if (selectedSlotPolicy?.reason) reasons.push(selectedSlotPolicy.reason);

  const btn = document.getElementById("submitBookingBtn");
  bookingSubmissionLocked = true;
  if (btn) { btn.disabled = true; btn.textContent = forceRequest ? "Wysyłanie prośby…" : "Zapisywanie…"; }

  try {
    const payload = {
      action,
      phone: crmCurrentVerifiedPhoneV20(),
      name: document.getElementById("clientName")?.value || "",
      service: document.getElementById("serviceType")?.value || "",
      date: main,
      alternativeDate: alt || "",
      duration,
      rodo: "Tak",
      confirmationReason: reasons.join(" · "),
      bookingSource: forceRequest ? "INDEX_REQUEST" : "INDEX",
      bookingMode: crmClientBookingModeV20,
      contactMethods: [prefs.whatsapp ? "WHATSAPP" : "", prefs.email ? "EMAIL" : ""].filter(Boolean).join(","),
      contactEmail: prefs.email ? prefs.emailAddress : ""
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data?.success) throw new Error(data?.error || data?.message || "Nie udało się zapisać rezerwacji.");

    crmWriteContactPrefsV20(payload.phone, prefs);
    alert(forceRequest ? "Prośba o rezerwację została wysłana do potwierdzenia." : "Wizyta została zarezerwowana.");
    closeBookingModal();
    await loadFreeSlots();
  } catch (error) {
    crmBookingWizardErrorV13(error?.message || "Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
  } finally {
    bookingSubmissionLocked = false;
    if (btn) { btn.disabled = false; btn.textContent = "Zarezerwuj wizytę"; }
  }
};

// Flow TYLKO_KONTAKT: korzysta z tego samego wizarda co FIRST_VISIT,
// ale wysyła zwykłą prośbę rezerwacyjną, więc ADMIN widzi klienta istniejącego,
// a nie nową pierwszą wizytę.
const crmFirstVisitSubmitBeforeV20 = crmFirstVisitSubmitV9;
crmFirstVisitSubmitV9 = async function(event) {
  if (!crmExistingClientContactV20) {
    const phone = String(document.getElementById("crmFirstVisitPhoneV9")?.value || "").trim();
    const method = String(document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || "").trim();
    const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();
    const result = await crmFirstVisitSubmitBeforeV20(event);
    if (phone && method) {
      crmWriteContactPrefsV20(phone, {
        whatsapp: method === "WHATSAPP",
        email: method === "EMAIL",
        emailAddress: method === "EMAIL" ? email : ""
      });
    }
    return result;
  }

  event.preventDefault();
  if (!crmFirstVisitValidateStepV10(1) || !crmFirstVisitValidateStepV10(2) || !crmFirstVisitValidateStepV10(3)) return;

  const submit = document.getElementById("crmFirstVisitSubmitV9");
  const error = document.getElementById("crmFirstVisitErrorV9");
  if (error) { error.hidden = true; error.textContent = ""; }

  const name = crmExistingClientContactV20.name;
  const phone = crmExistingClientContactV20.phone;
  const category = crmFirstVisitSelectedCategoryV9();
  const description = crmFirstVisitDescriptionV11();
  const note = crmFirstVisitOptionalNoteV11();
  const contactMethod = String(document.querySelector('input[name="crmFirstVisitContactV9"]:checked')?.value || "").trim();
  const email = String(document.getElementById("crmFirstVisitEmailV9")?.value || "").trim();
  const rows = crmFirstVisitProposalRowsV11();
  if (!rows.length) {
    crmFirstVisitShowErrorV10("Dodaj przynajmniej jeden preferowany termin.");
    return;
  }

  const first = rows[0];
  const second = rows[1] || null;
  const main = `${first.date}T${first.start}`;
  const alternative = second ? `${second.date}T${second.start}` : "";
  const windows = rows.map(row => `${row.date} ${row.start}–${row.end}`).join("; ");
  const contactLabel = contactMethod === "EMAIL" ? `E-mail: ${email}` : `WhatsApp: ${phone}`;
  const reason = [
    "TYLKO_KONTAKT — klient istniejący",
    description,
    note ? `Wiadomość: ${note}` : "",
    `Preferencje: ${windows}`,
    `Kontakt: ${contactLabel}`
  ].filter(Boolean).join(" · ");

  if (submit) { submit.disabled = true; submit.textContent = "Wysyłanie…"; }
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "createBookingRequest",
        phone,
        name,
        service: category?.name || "Prośba o umówienie wizyty",
        duration: category?.effectiveMinutes || 45,
        date: main,
        alternativeDate: alternative,
        confirmationReason: reason,
        bookingSource: "INDEX_TYLKO_KONTAKT",
        bookingMode: "TYLKO_KONTAKT",
        existingClient: "TAK",
        contactMethod,
        email: contactMethod === "EMAIL" ? email : "",
        rodo: "Tak"
      })
    });
    const data = await response.json();
    if (!data?.success) throw new Error(data?.error || data?.message || "Nie udało się wysłać prośby.");

    crmWriteContactPrefsV20(phone, {
      whatsapp: contactMethod === "WHATSAPP",
      email: contactMethod === "EMAIL",
      emailAddress: contactMethod === "EMAIL" ? email : ""
    });

    const form = document.getElementById("crmFirstVisitFormV9");
    if (form) form.hidden = true;
    const success = document.getElementById("crmFirstVisitSuccessV9");
    if (success) success.hidden = false;
    crmExistingClientContactV20 = null;
    window.setTimeout(() => {
      const modal = document.getElementById("contact-form-modal");
      if (modal) modal.style.display = "none";
    }, 4200);
  } catch (err) {
    if (error) { error.hidden = false; error.textContent = err?.message || String(err); }
    if (submit) { submit.disabled = false; submit.textContent = "Wyślij prośbę o termin"; }
  }
};

const crmOpenBookingBeforeV20 = openBookingModal;
openBookingModal = function() {
  crmClientBookingModeV20 = "STANDARDOWY";
  crmClientRestrictionReasonV20 = "";
  crmExistingClientContactV20 = null;
  crmBookingModeBannerV20("STANDARDOWY");
  crmSetServicesLoadingV20(false);
  return crmOpenBookingBeforeV20();
};

const crmCloseBookingBeforeV20 = closeBookingModal;
closeBookingModal = function() {
  crmBookingModeBannerV20("STANDARDOWY");
  crmClientBookingModeV20 = "STANDARDOWY";
  crmClientRestrictionReasonV20 = "";
  return crmCloseBookingBeforeV20();
};

document.addEventListener("DOMContentLoaded", () => {
  const wa = document.getElementById("bookingContactWhatsappV20");
  const mail = document.getElementById("bookingContactEmailV20");
  const sync = () => crmSyncContactPrefsUiV20(false);
  wa?.addEventListener("change", sync);
  mail?.addEventListener("change", sync);
  crmSyncContactPrefsUiV20(true);
});


// ============================================================================
// INDEX V21.1 — JEDEN KONTROLER TELEFONU I STATUSU KLIENTA
// 2026-08-23
// Źródło prawdy: Booking Apps Script -> arkusz Klienci + najnowszy wpis
// z arkusza „Ograniczenia klientów”. Bez fallbacku do STANDARDOWY przy błędzie.
// ============================================================================
let crmPhoneVerificationRunV211 = 0;
let crmPhoneVerificationBusyV211 = false;

function crmPhoneStatusV211(message, kind = "neutral") {
  const status = document.getElementById("clientStatus");
  if (!status) return;
  status.style.display = message ? "block" : "none";
  status.style.color =
    kind === "error" ? "#b3261e" :
    kind === "success" ? "#26823a" :
    "#746b65";
  status.textContent = message || "";
}

function crmPhoneResetVerificationV211(options = {}) {
  const keepPhone = options.keepPhone !== false;
  const phone = document.getElementById("clientPhone");
  const value = keepPhone && phone ? phone.value : "";

  crmPhoneVerificationRunV211 += 1;
  crmPhoneVerificationBusyV211 = false;
  isClientApproved = false;
  crmClientBookingModeV20 = "STANDARDOWY";
  crmClientRestrictionReasonV20 = "";
  crmExistingClientContactV20 = null;
  crmVerifiedPhoneTokenV5 = "";

  if (typeof resetBookingDependentStateV3 === "function") {
    resetBookingDependentStateV3();
  } else {
    toggleFormState(false);
  }

  if (phone && keepPhone) phone.value = value;
  crmSetBookingVerifiedFieldsVisibleV231(false);
  crmBookingModeBannerV20("STANDARDOWY");
  crmPhoneStatusV211("");
  crmBookingUpdateProgressV13();
}

function crmPhoneSanitizeAndLimitV211() {
  const phone = document.getElementById("clientPhone");
  if (!phone) return "";

  const raw = String(phone.value || "");
  let digits = raw.replace(/\D/g, "");
  const expected = Math.max(1, Number(crmPhoneExpectedDigitsV6()) || 9);
  if (digits.length > expected) digits = digits.slice(0, expected);

  if (phone.value !== digits) phone.value = digits;
  crmUpdatePhoneLengthHintV241();
  return digits;
}

function crmPhoneValidatedNumberV211() {
  crmPhoneSanitizeAndLimitV211();
  const state = crmPhoneValidationStateV241();

  if (state.current !== state.expected) {
    crmShowIncompletePhoneV6();
    crmSetBookingVerifiedFieldsVisibleV231(false);
    return null;
  }

  if (state.canValidate && !state.valid) {
    crmShowInvalidPhoneV241();
    crmSetBookingVerifiedFieldsVisibleV231(false);
    return null;
  }

  try {
    if (iti && typeof iti.getNumber === "function") {
      const number = String(iti.getNumber() || "").replace(/\s+/g, "");
      if (/^\+\d{7,15}$/.test(number)) return number;
    }
  } catch (_) {}

  const country = crmPhoneCountryV6();
  const dial = String(country?.dialCode || "").replace(/\D/g, "");
  const digits = crmPhoneNationalDigitsV6();
  if (dial && digits) return `+${dial}${digits}`;
  return null;
}

async function checkExistingClient() {
  if (crmPhoneVerificationBusyV211) return;

  const phone = crmPhoneValidatedNumberV211();
  if (!phone) return;

  const run = ++crmPhoneVerificationRunV211;
  crmPhoneVerificationBusyV211 = true;

  const verify = document.getElementById("verifyPhoneBtn");
  if (verify) {
    verify.disabled = true;
    verify.textContent = "Sprawdzanie…";
  }

  crmPhoneResetVerificationV211({ keepPhone: true });
  // reset podbija licznik, więc ten request dostaje własny aktualny token
  const requestRun = ++crmPhoneVerificationRunV211;
  crmPhoneVerificationBusyV211 = true;
  crmPhoneStatusV211("Sprawdzanie danych i uprawnień rezerwacji…");

  try {
    const data = await fetchJSONP(
      `${APPS_SCRIPT_URL}?phone=${encodeURIComponent(phone)}&_clientV211=${Date.now()}`
    );

    if (requestRun !== crmPhoneVerificationRunV211) return;

    if (!data || data.success === false) {
      throw new Error(data?.error || "Nie udało się sprawdzić klienta.");
    }

    if (!data.found || !data.name) {
      const status = document.getElementById("clientStatus");
      document.getElementById("clientName").value = "";
      isClientApproved = false;
      crmSetBookingVerifiedFieldsVisibleV231(false);
      toggleFormState(false);
      renderUnknownClientContact(status, phone);
      return;
    }

    const modeRaw = String(data.bookingMode || "").trim();
    if (!modeRaw) {
      throw new Error("System nie zwrócił statusu rezerwacji klienta.");
    }

    const mode = crmNormalizeBookingModeV20(modeRaw);
    crmClientBookingModeV20 = mode;
    crmClientRestrictionReasonV20 = String(data.restrictionReason || "").trim();

    document.getElementById("clientName").value = String(data.name || "").trim();
    crmVerifiedPhoneTokenV5 = String(phone).replace(/\D/g, "");
    crmBookingUpdateVerifiedNameV13();

    if (mode === "TYLKO_KONTAKT") {
      isClientApproved = false;
      crmSetBookingVerifiedFieldsVisibleV231(false);
      toggleFormState(false);
      crmPhoneStatusV211("Numer został zweryfikowany. Rezerwacja wymaga kontaktu z salonem.", "success");
      await crmOpenExistingClientContactV20(phone, String(data.name || "").trim());
      return;
    }

    isClientApproved = true;
    toggleFormState(true);
    crmSetBookingVerifiedFieldsVisibleV231(true);
    crmBookingModeBannerV20(mode);
    crmSyncContactPrefsUiV20(true);

    crmPhoneStatusV211(
      mode === "WYMAGA_POTWIERDZENIA"
        ? "Numer zweryfikowany."
        : "Klient zweryfikowany pomyślnie!",
      "success"
    );

    crmSetServicesLoadingV20(true);
    await Promise.all([
      loadServicesIntoSelect(),
      loadFreeSlots()
    ]);

    if (requestRun !== crmPhoneVerificationRunV211) return;

    // Jednoznacznie odblokuj ukryty select i karty dopiero po pełnej weryfikacji.
    const select = document.getElementById("serviceType");
    const picker = document.getElementById("crmIndexServicePickerV12");
    if (select) select.disabled = false;
    if (picker) {
      picker.classList.remove("is-disabled");
      picker.hidden = false;
      picker.style.pointerEvents = "auto";
    }
    crmSetServicesLoadingV20(false);
    crmIndexRenderServicePickerV12();

    crmBookingGoStepV13(2, false);
    crmBookingUpdateProgressV13();
  } catch (error) {
    if (requestRun !== crmPhoneVerificationRunV211) return;
    isClientApproved = false;
    crmClientBookingModeV20 = "";
    crmSetBookingVerifiedFieldsVisibleV231(false);
    toggleFormState(false);
    crmBookingModeBannerV20("STANDARDOWY");
    crmPhoneStatusV211(
      error?.message || "Nie udało się sprawdzić uprawnień rezerwacji. Spróbuj ponownie.",
      "error"
    );
  } finally {
    if (requestRun === crmPhoneVerificationRunV211) {
      crmPhoneVerificationBusyV211 = false;
      if (verify) {
        verify.disabled = false;
        verify.textContent = "Sprawdź";
      }
    }
  }
}

function crmInstallPhoneControllerV211() {
  const phone = document.getElementById("clientPhone");
  const verify = document.getElementById("verifyPhoneBtn");
  if (!phone || !verify || phone.dataset.crmPhoneControllerV211 === "1") return;

  phone.dataset.crmPhoneControllerV211 = "1";
  phone.setAttribute("inputmode", "numeric");
  phone.setAttribute("pattern", "[0-9]*");
  phone.setAttribute("autocomplete", "tel");
  phone.setAttribute("aria-describedby", "crmPhoneLengthHintV6");

  // Przycisk klonujemy raz, żeby usunąć wszystkie stare listenery z kolejnych wersji.
  const cleanVerify = verify.cloneNode(true);
  verify.replaceWith(cleanVerify);

  cleanVerify.addEventListener("click", event => {
    event.preventDefault();
    checkExistingClient();
  });

  phone.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkExistingClient();
    }
  });

  phone.addEventListener("beforeinput", event => {
    if (typeof event.data === "string" && /\D/.test(event.data)) {
      event.preventDefault();
    }
  });

  phone.addEventListener("input", () => {
    crmPhoneSanitizeAndLimitV211();
    if (isClientApproved || crmExistingClientContactV20 || crmClientBookingModeV20 !== "STANDARDOWY") {
      crmPhoneResetVerificationV211({ keepPhone: true });
    }
  });

  phone.addEventListener("paste", () => {
    window.setTimeout(() => {
      crmPhoneSanitizeAndLimitV211();
      crmPhoneResetVerificationV211({ keepPhone: true });
    }, 0);
  });

  phone.addEventListener("countrychange", () => {
    crmPhoneSanitizeAndLimitV211();
    crmPhoneResetVerificationV211({ keepPhone: true });
  });

  crmPhoneSanitizeAndLimitV211();
  crmPhoneResetVerificationV211({ keepPhone: true });
}

document.addEventListener("DOMContentLoaded", crmInstallPhoneControllerV211);

window.crmIndexUiVersionV211 = "21.1-clean-phone-client-status";

window.crmIndexUiVersionV20 = "21.1-clean-phone-client-status";
// KONIEC INDEX V20
