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

async function loadServicesIntoSelect() {
  const serviceSelect = document.getElementById("serviceType");
  if (!serviceSelect) return;
  try {
    const services = await fetchJSONP(`${APPS_SCRIPT_URL}?getPrices=true`);
    serviceSelect.innerHTML = '<option value="" disabled selected>-- Wybierz zabieg --</option>';
    if (services && services.length > 0) {
      const grouped = {};
      services.forEach(s => {
        if (s.status === "Opublikowany") {
          const cat = s.category || "Inne";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(s);
        }
      });
      for (const category in grouped) {
        const optGroup = document.createElement("optgroup");
        optGroup.label = category;
        grouped[category].forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.name;
          opt.textContent = `${item.name} (${item.price} zł)`;
          opt.setAttribute("data-price", item.price);
          opt.setAttribute("data-duration", item.duration);
          optGroup.appendChild(opt);
        });
        serviceSelect.appendChild(optGroup);
      }
    }
  } catch (error) {
    console.error("Błąd ładowania usług:", error);
    serviceSelect.innerHTML = '<option value="" disabled>Błąd ładowania usług</option>';
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
    phoneInput.addEventListener("blur", checkExistingClient);
    phoneInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkExistingClient();
      }
    });
    phoneInput.addEventListener("input", () => {
      isClientApproved = false;
      document.getElementById("clientName").value = "";
      const statusEl = document.getElementById("clientStatus");
      if (statusEl) {
        statusEl.innerHTML = "";
        statusEl.style.display = "none";
      }
      toggleFormState(false); 
    });
  }

  const verifyBtn = document.getElementById("verifyPhoneBtn");
  if (verifyBtn) { verifyBtn.addEventListener("click", checkExistingClient); }
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

async function checkExistingClient() {
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
const _checkExistingClientBeforeStateFix = checkExistingClient;
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
checkExistingClient = async function() {
  if (phoneVerificationInProgressV3) return;
  phoneVerificationInProgressV3 = true;
  resetBookingDependentStateV3();
  try { await _checkExistingClientBeforeStateFix(); }
  finally { phoneVerificationInProgressV3 = false; }
};

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

document.addEventListener("DOMContentLoaded", () => {
  const phone = document.getElementById("clientPhone");
  const verify = document.getElementById("verifyPhoneBtn");
  if (phone) {
    phone.removeEventListener("blur", _checkExistingClientBeforeStateFix);
    phone.addEventListener("input", resetBookingDependentStateV3);
  }
  if (verify) {
    verify.removeEventListener("click", _checkExistingClientBeforeStateFix);
    verify.addEventListener("click", checkExistingClient);
  }
});
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

/* Jedno stabilne podpiecie przycisku. Wczesniejsze referencje funkcji mogly
   pozostac po nadpisaniu checkExistingClient i blokowac druga weryfikacje. */
document.addEventListener("DOMContentLoaded", () => {
  const verifyButton = document.getElementById("verifyPhoneBtn");
  const phone = document.getElementById("clientPhone");

  if (verifyButton) {
    const cleanButton = verifyButton.cloneNode(true);
    verifyButton.replaceWith(cleanButton);
    cleanButton.addEventListener("click", event => {
      event.preventDefault();
      checkExistingClient();
    });
  }

  if (phone) {
    phone.onblur = null;
    phone.addEventListener("input", () => resetBookingSessionV4({ keepPhone: true }));
  }
});
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

const _checkExistingClientBeforeV5 = checkExistingClient;
checkExistingClient = async function() {
  await _checkExistingClientBeforeV5();
  if (isClientApproved) crmVerifiedPhoneTokenV5 = crmNormalizePhoneTokenV5();
  else crmVerifiedPhoneTokenV5 = "";
};

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

function crmLimitPhoneDigitsV6() {
  const phone = document.getElementById("clientPhone");
  if (!phone) return;

  const expected = crmPhoneExpectedDigitsV6();
  let digits = crmPhoneNationalDigitsV6();

  if (digits.length > expected) {
    digits = digits.slice(0, expected);
    const country = crmPhoneCountryV6();
    const dialCode = String(country.dialCode || "").replace(/\D/g, "");

    try {
      if (iti && dialCode && typeof iti.setNumber === "function") {
        iti.setNumber("+" + dialCode + digits);
      } else {
        phone.value = digits;
      }
    } catch (ignore) {
      phone.value = digits;
    }
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

const _checkExistingClientBeforeV6 = checkExistingClient;
checkExistingClient = async function() {
  crmLimitPhoneDigitsV6();

  const current = crmPhoneNationalDigitsV6().length;
  const expected = crmPhoneExpectedDigitsV6();

  if (current !== expected) {
    crmShowIncompletePhoneV6();
    return;
  }

  return _checkExistingClientBeforeV6();
};

document.addEventListener("DOMContentLoaded", () => {
  const phone = document.getElementById("clientPhone");
  if (!phone || phone.dataset.crmPhoneLimitV6 === "1") return;

  phone.dataset.crmPhoneLimitV6 = "1";
  phone.setAttribute("inputmode", "numeric");
  phone.setAttribute("autocomplete", "tel");

  crmEnsurePhoneLengthHintV6();
  crmUpdatePhoneLengthHintV6();

  phone.addEventListener("input", crmLimitPhoneDigitsV6);
  phone.addEventListener("paste", () => window.setTimeout(crmLimitPhoneDigitsV6, 0));

  phone.addEventListener("countrychange", () => {
    if (typeof crmClearVerifiedPhoneV5 === "function") crmClearVerifiedPhoneV5();
    if (typeof resetBookingSessionV4 === "function") resetBookingSessionV4({ keepPhone: true });
    crmLimitPhoneDigitsV6();
  });
});

// KONIEC INDEX V6


// ==========================================================================
// INDEX FIRST VISIT UI V8 2026-08-12
// Jedna prośba o pierwszą wizytę, bez wysylania do Google Form.
// ==========================================================================
const CRM_FIRST_VISIT_MAX_DAYS_V8 = 3;
const CRM_FIRST_VISIT_MAX_TIMES_PER_DAY_V8 = 2;
let crmFirstVisitDaysV8 = [];
let crmFirstVisitServicesV8 = [];
let crmFirstVisitBusyLoadedV8 = false;

function crmFirstVisitEscapeV8(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

async function crmFirstVisitEnsureDataV8(){
  if(!crmFirstVisitServicesV8.length){
    const services=await fetchJSONP(`${APPS_SCRIPT_URL}?getPrices=true&_firstVisit=${Date.now()}`);
    crmFirstVisitServicesV8=Array.isArray(services)
      ? services.filter(item=>String(item.status||"").toUpperCase()==="OPUBLIKOWANY")
      : [];
  }
  {
    // Dostępność jest pobierana przy każdym otwarciu, żeby propozycje były aktualne.
    const data=await fetchJSONP(`${APPS_SCRIPT_URL}?checkBusy=true&_firstVisit=${Date.now()}`);
    allAvailableSlots=data?.busySlots||[];
    appointmentsData=data?.appointments||[];
    if(data?.settings) adminSettings={...adminSettings,...data.settings};
    if(Array.isArray(data?.familySchedule)) window.familyScheduleEntries=data.familySchedule;
    if(Array.isArray(data?.holidays)) window.polishHolidayDates=data.holidays;
    crmFirstVisitBusyLoadedV8=true;
  }
}

function crmFirstVisitDurationV8(){
  const select=document.getElementById("crmFirstVisitServiceV8");
  const option=select?.options?.[select.selectedIndex];
  return Math.max(5,Number(option?.dataset?.duration)||45);
}

function crmFirstVisitFreeSlotsV8(dateStr){
  if(!dateStr)return[];

  const duration=crmFirstVisitDurationV8();
  const now=new Date();
  const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  const startStr=String(adminSettings.work_start_hour||"09:00").substring(0,5);
  const endStr=String(adminSettings.work_end_hour||"18:00").substring(0,5);
  const [startH,startM]=startStr.split(":").map(Number);
  const [endH,endM]=endStr.split(":").map(Number);

  const regularStart=startH*60+startM;
  const endMinutes=endH*60+endM;
  const regularStep=Math.max(5,Number(adminSettings.slot_interval_minutes)||45);
  const earlyStep=15;
  const startOffsetMs=(Number(adminSettings.start_offset_minutes)||0)*60000;

  const dayBusy=(appointmentsData||[])
    .filter(item=>item.date&&String(item.date).startsWith(dateStr))
    .map(item=>{
      const s=new Date(item.date);
      const e=new Date(
        item.endDate||
        item.end||
        new Date(s.getTime()+(Number(item.duration)||45)*60000)
      );
      return{start:s,end:e};
    })
    .filter(item=>!isNaN(item.start.getTime())&&!isNaN(item.end.getTime()));

  function candidateIsFree(minuteOfDay,isEarlyCandidate){
    const time=`${String(Math.floor(minuteOfDay/60)).padStart(2,"0")}:${String(minuteOfDay%60).padStart(2,"0")}`;
    const slotStart=new Date(`${dateStr}T${time}`);
    const slotEnd=new Date(slotStart.getTime()+duration*60000);

    if(slotEnd.getHours()*60+slotEnd.getMinutes()>endMinutes)return false;

    if(dateStr===today){
      const buffer=(Number(adminSettings.buffer_hours)||0)*3600000;
      if(slotStart.getTime()-now.getTime()<buffer)return false;
    }

    const conflict=dayBusy.some(busy=>{
      const allowedAfter=new Date(busy.end.getTime()+startOffsetMs);
      return slotStart<allowedAfter&&slotEnd>busy.start;
    });
    if(conflict)return false;

    let policy={mode:"STANDARD",reason:""};
    if(typeof classifyFamilySlot==="function"){
      policy=classifyFamilySlot(dateStr,time,duration)||policy;
      if(policy.mode==="MANUAL_ONLY")return false;
    }

    // Przed zwykłym startem pokazujemy tylko wyjątki z grafiku rodzinnego,
    // które wymagają potwierdzenia salonu.
    if(isEarlyCandidate&&policy.mode!=="CONFIRM")return false;

    return true;
  }

  const result=[];
  const seen=new Set();

  // Wyjątkowe godziny poranne — nie wcześniej niż 08:00.
  const earlyFrom=Math.min(regularStart,8*60);
  for(let minute=earlyFrom;minute<regularStart;minute+=earlyStep){
    if(!candidateIsFree(minute,true))continue;
    const value=`${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
    if(!seen.has(value)){seen.add(value);result.push(value);}
  }

  // Normalne sloty zachowują krok skonfigurowany dla strony klienta.
  for(let minute=regularStart;minute<endMinutes;minute+=regularStep){
    if(!candidateIsFree(minute,false))continue;
    const value=`${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
    if(!seen.has(value)){seen.add(value);result.push(value);}
  }

  return result;
}

function crmFirstVisitServiceOptionsV8(){
  const grouped={};
  crmFirstVisitServicesV8.forEach(item=>(grouped[item.category||"Inne"]??=[]).push(item));
  return Object.entries(grouped).map(([category,items])=>`
    <optgroup label="${crmFirstVisitEscapeV8(category)}">
      ${items.map(item=>`
        <option value="${crmFirstVisitEscapeV8(item.name)}" data-duration="${Number(item.duration)||45}" data-price="${Number(item.price)||0}">
          ${crmFirstVisitEscapeV8(item.name)}${item.showPrice==="Nie"?"":` (${Number(item.price)||0} zl)`}
        </option>`).join("")}
    </optgroup>`).join("");
}

function crmFirstVisitFormMarkupV8(){
  return `
  <div id="crmFirstVisitV8" class="crm-first-visit-form">
    <div class="crm-first-visit-head">
      <div>
        <span class="crm-first-visit-eyebrow">PIERWSZA WIZYTA</span>
        <h2>Wyślij prośbę o termin</h2>
        <p>Możesz podać do 3 preferowanych dni i maksymalnie 2 godziny na każdy dzień. To są propozycje — salon potwierdzi wybrany termin.</p>
      </div>
      <button type="button" class="crm-first-visit-close" aria-label="Zamknij">×</button>
    </div>
    <form id="crmFirstVisitFormV8" autocomplete="on">
      <div class="crm-first-visit-grid">
        <label><span>Imię i nazwisko *</span><input id="crmFirstVisitNameV8" type="text" autocomplete="name" required></label>
        <label><span>Telefon *</span><input id="crmFirstVisitPhoneV8" type="tel" autocomplete="tel" required></label>
      </div>
      <label class="crm-first-visit-field"><span>E-mail <small>(opcjonalnie)</small></span><input id="crmFirstVisitEmailV8" type="email" autocomplete="email" placeholder="np. anna@email.pl"></label>
      <label class="crm-first-visit-field"><span>Jaki zabieg Cię interesuje? *</span>
        <select id="crmFirstVisitServiceV8" required><option value="">- Wybierz zabieg -</option>${crmFirstVisitServiceOptionsV8()}</select>
      </label>
      <section class="crm-first-visit-preferences">
        <div class="crm-first-visit-section-title">
          <div><strong>Preferowane terminy</strong><small>Opcjonalnie. Możesz też wybrać sam dzień bez godziny.</small></div>
          <button type="button" id="crmFirstVisitAddDayV8" class="crm-first-visit-add-day">+ Dodaj dzień</button>
        </div>
        <div id="crmFirstVisitDaysV8"></div>
      </section>
      <label class="crm-first-visit-field"><span>Wiadomość <small>(opcjonalnie, jesli podajesz termin)</small></span>
        <textarea id="crmFirstVisitMessageV8" rows="4" placeholder="Np. najlepiej po 16:00, zalezy mi na konkretnym zdobieniu..."></textarea>
      </label>
      <label class="crm-first-visit-consent"><input id="crmFirstVisitContactConsentV8" type="checkbox" required>
        <span>Jeśli żaden z proponowanych terminów nie będzie możliwy, zgadzam się na kontakt telefoniczny/SMS lub e-mail w celu ustalenia innego terminu. *</span>
      </label>
      <label class="crm-first-visit-consent"><input id="crmFirstVisitRodoV8" type="checkbox" required>
        <span>Wyrażam zgodę na przetwarzanie danych w celu obsługi mojego zapytania o wizytę. Szczegóły w <a href="polityka-prywatnosci.html" target="_blank">Polityce Prywatności</a>. *</span>
      </label>
      <div id="crmFirstVisitErrorV8" class="crm-first-visit-error" hidden></div>
      <button id="crmFirstVisitSubmitV8" type="submit" class="crm-first-visit-submit">Wyślij prośbę o pierwszą wizytę</button>
    </form>
    <div id="crmFirstVisitSuccessV8" class="crm-first-visit-success" hidden>
      <b>✓</b><strong>Prośba została wysłana</strong>
      <p>Salon sprawdzi zaproponowane terminy i potwierdzi wizytę lub skontaktuje się z Tobą.</p>
    </div>
  </div>`;
}

function crmFirstVisitDayStateV8(id){return crmFirstVisitDaysV8.find(item=>item.id===id);}
function crmFirstVisitRemoveDayV8(id){crmFirstVisitDaysV8=crmFirstVisitDaysV8.filter(item=>item.id!==id);crmFirstVisitRenderDaysV8();}
function crmFirstVisitToggleTimeV8(id,time){
  const item=crmFirstVisitDayStateV8(id);if(!item)return;item.times||=[];
  if(item.times.includes(time))item.times=item.times.filter(v=>v!==time);
  else{
    if(item.times.length>=CRM_FIRST_VISIT_MAX_TIMES_PER_DAY_V8){
      const e=document.getElementById("crmFirstVisitErrorV8");if(e){e.hidden=false;e.textContent="Na jeden dzień możesz wybrać maksymalnie 2 godziny.";}return;
    }
    item.times.push(time);
  }
  crmFirstVisitRenderDaysV8();
}

function crmFirstVisitRenderDaysV8(){
  const host=document.getElementById("crmFirstVisitDaysV8"),add=document.getElementById("crmFirstVisitAddDayV8");
  if(!host)return;if(add)add.disabled=crmFirstVisitDaysV8.length>=CRM_FIRST_VISIT_MAX_DAYS_V8;
  if(!crmFirstVisitDaysV8.length){
    host.innerHTML='<div class="crm-first-visit-empty">Nie musisz wybierać terminu. Możesz po prostu opisać, kiedy zwykle Ci pasuje.</div>';return;
  }
  host.innerHTML=crmFirstVisitDaysV8.map((item,index)=>{
    const free=item.date?crmFirstVisitFreeSlotsV8(item.date):[];
    return `<article class="crm-first-visit-day-card" data-day-id="${item.id}">
      <div class="crm-first-visit-day-head"><strong>Dzień ${index+1}</strong><button type="button" data-remove-day="${item.id}">Usuń</button></div>
      <input type="text" class="crm-first-visit-date" data-day-date="${item.id}" value="${crmFirstVisitEscapeV8(item.date||"")}" placeholder="Wybierz datę" readonly>
      <div class="crm-first-visit-day-hint">${item.date?(free.length?"Wybierz maks. 2 godziny lub zostaw bez godziny.":"Brak standardowych godzin — możesz zostawić sam dzień."):"Najpierw wybierz dzień."}</div>
      <div class="crm-first-visit-times">${free.map(time=>`<button type="button" class="${item.times?.includes(time)?"is-selected":""}" data-day-time="${item.id}" data-time="${time}">${time}</button>`).join("")}</div>
    </article>`;
  }).join("");
  host.querySelectorAll("[data-remove-day]").forEach(btn=>btn.onclick=()=>crmFirstVisitRemoveDayV8(btn.dataset.removeDay));
  host.querySelectorAll("[data-day-time]").forEach(btn=>btn.onclick=()=>crmFirstVisitToggleTimeV8(btn.dataset.dayTime,btn.dataset.time));
  host.querySelectorAll("[data-day-date]").forEach(input=>{
    const id=input.dataset.dayDate,item=crmFirstVisitDayStateV8(id);
    flatpickr(input,{locale:"pl",dateFormat:"Y-m-d",minDate:"today",maxDate:new Date().fp_incr(120),disableMobile:true,defaultDate:item?.date||null,
      onChange:(selected,dateStr)=>{const row=crmFirstVisitDayStateV8(id);if(!row)return;row.date=dateStr;row.times=[];crmFirstVisitRenderDaysV8();}
    });
  });
}

function crmFirstVisitAddDayV8(){
  if(crmFirstVisitDaysV8.length>=CRM_FIRST_VISIT_MAX_DAYS_V8)return;
  crmFirstVisitDaysV8.push({id:"D"+Date.now()+"_"+Math.random().toString(36).slice(2,6),date:"",times:[]});
  crmFirstVisitRenderDaysV8();
}

async function openFirstVisitRequestFormV8(phone="",name=""){
  const modal=document.getElementById("contact-form-modal");if(!modal)return;
  const wrapper=modal.firstElementChild;if(!wrapper)return;
  const bookingModal=document.getElementById("bookingModal");if(bookingModal)bookingModal.style.display="none";
  wrapper.innerHTML='<div class="crm-first-visit-loading">Ładowanie formularza pierwszej wizyty…</div>';modal.style.display="flex";
  try{
    await crmFirstVisitEnsureDataV8();crmFirstVisitDaysV8=[];wrapper.innerHTML=crmFirstVisitFormMarkupV8();
    document.getElementById("crmFirstVisitNameV8").value=name||"";
    document.getElementById("crmFirstVisitPhoneV8").value=phone||"";
    wrapper.querySelector(".crm-first-visit-close").onclick=()=>{modal.style.display="none";};
    document.getElementById("crmFirstVisitAddDayV8").onclick=crmFirstVisitAddDayV8;
    document.getElementById("crmFirstVisitServiceV8").onchange=()=>{crmFirstVisitDaysV8.forEach(item=>item.times=[]);crmFirstVisitRenderDaysV8();};
    document.getElementById("crmFirstVisitFormV8").onsubmit=crmFirstVisitSubmitV8;
    crmFirstVisitRenderDaysV8();
  }catch(error){
    wrapper.innerHTML=`<div class="crm-first-visit-loading crm-first-visit-load-error"><strong>Nie udało się załadować formularza.</strong><p>${crmFirstVisitEscapeV8(error?.message||error)}</p><button type="button" class="verify-btn">Spróbuj ponownie</button></div>`;
    wrapper.querySelector("button").onclick=()=>openFirstVisitRequestFormV8(phone,name);
  }
}
window.openFirstVisitRequestFormV8=openFirstVisitRequestFormV8;
window.openFirstVisitRequestForm=openFirstVisitRequestFormV8;

async function crmFirstVisitSubmitV8(event){
  event.preventDefault();
  const submit=document.getElementById("crmFirstVisitSubmitV8"),error=document.getElementById("crmFirstVisitErrorV8");
  if(error){error.hidden=true;error.textContent="";}
  const name=String(document.getElementById("crmFirstVisitNameV8")?.value||"").trim();
  const phone=String(document.getElementById("crmFirstVisitPhoneV8")?.value||"").trim();
  const email=String(document.getElementById("crmFirstVisitEmailV8")?.value||"").trim();
  const service=String(document.getElementById("crmFirstVisitServiceV8")?.value||"").trim();
  const duration=crmFirstVisitDurationV8();
  const message=String(document.getElementById("crmFirstVisitMessageV8")?.value||"").trim();
  const contactConsent=Boolean(document.getElementById("crmFirstVisitContactConsentV8")?.checked);
  const rodo=Boolean(document.getElementById("crmFirstVisitRodoV8")?.checked);
  const proposals=crmFirstVisitDaysV8.filter(item=>item.date).slice(0,3).map(item=>({date:item.date,times:(item.times||[]).slice(0,2)}));
  const phoneDigits=phone.replace(/\D/g,"");
  if(!name||!phone||!service){if(error){error.hidden=false;error.textContent="Uzupełnij imię, telefon i zabieg.";}return;}
  if(phoneDigits.length<8||phoneDigits.length>15){if(error){error.hidden=false;error.textContent="Wpisz poprawny numer telefonu.";}return;}
  if(!proposals.length&&!message){if(error){error.hidden=false;error.textContent="Wybierz przynajmniej jeden preferowany dzień albo napisz krótką wiadomość.";}return;}
  if(!contactConsent||!rodo){if(error){error.hidden=false;error.textContent="Zaznacz obie wymagane zgody.";}return;}
  if(submit){submit.disabled=true;submit.textContent="Wysyłanie…";}
  try{
    const response=await fetch(APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({
      action:"createFirstVisitRequest",phone,name,email,service,duration,message,contactConsent:"TAK",rodo:"TAK",proposals:JSON.stringify(proposals)
    })});
    const data=await response.json();if(!data?.success)throw new Error(data?.message||data?.error||"Nie udało się wysłać prośby.");
    document.getElementById("crmFirstVisitFormV8").hidden=true;
    const success=document.getElementById("crmFirstVisitSuccessV8");if(success)success.hidden=false;
    setTimeout(()=>{const m=document.getElementById("contact-form-modal");if(m)m.style.display="none";},4200);
  }catch(err){
    if(error){error.hidden=false;error.textContent=err?.message||String(err);}
    if(submit){submit.disabled=false;submit.textContent="Wyślij prośbę o pierwszą wizytę";}
  }
}

renderUnknownClientContact=function(statusEl,phone){
  if(!statusEl)return;
  statusEl.style.color="#7a4c00";
  statusEl.innerHTML=`<div class="crm-first-visit-unknown"><strong>Nie znaleźliśmy tego numeru w bazie klientów.</strong><span>Jeśli to Twoja pierwsza wizyta, możesz wysłać prośbę o termin i wskazać do 3 pasujących dni.</span><button type="button" id="openNewClientContactFormBtn" class="verify-btn">Poproś o pierwszą wizytę</button></div>`;
  const button=document.getElementById("openNewClientContactFormBtn");if(button)button.onclick=()=>openFirstVisitRequestFormV8(phone);
};

document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("openFirstVisitRequestStandaloneV8");if(b)b.onclick=()=>openFirstVisitRequestFormV8();});
// KONIEC INDEX FIRST VISIT UI V8
