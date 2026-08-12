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
// INDEX: KONTAKT DLA NOWEGO KLIENTA - GOOGLE FORM PREFILL
// ==========================================================
const CONTACT_FORM_PUBLIC_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdyZSEXo8-qMeIaOgvT_qgT4AtAmOYV---sgo9V_qGdE3HF0w/viewform";
const CONTACT_FORM_ENTRY_NAME = "entry.565415087";
const CONTACT_FORM_ENTRY_PHONE = "entry.165109377";
const CONTACT_FORM_ENTRY_QUESTION = "entry.1372241831";

function openContactFormPrefilled(phone = "", name = "", question = "") {
  const modal = document.getElementById("contact-form-modal");
  const iframe = modal ? modal.querySelector("iframe") : null;
  if (!modal || !iframe) return;

  const params = new URLSearchParams();
  params.set("embedded", "true");
  params.set("usp", "pp_url");
  if (name) params.set(CONTACT_FORM_ENTRY_NAME, name);
  if (phone) params.set(CONTACT_FORM_ENTRY_PHONE, phone);
  if (question) params.set(CONTACT_FORM_ENTRY_QUESTION, question);

  iframe.src = `${CONTACT_FORM_PUBLIC_URL}?${params.toString()}`;

  // Najpierw zamykamy i resetujemy modal rezerwacji,
  // żeby Google Form nie otwierał się nad drugim oknem.
  if (typeof closeBookingModal === "function") {
    closeBookingModal();
  } else {
    const bookingModal = document.getElementById("bookingModal");
    if (bookingModal) bookingModal.style.display = "none";
  }

  modal.style.display = "block";
}

function renderUnknownClientContact(statusEl, phone) {
  if (!statusEl) return;
  statusEl.style.color = "#7a4c00";
  statusEl.innerHTML = `
    <div style="padding:10px 12px;border:1px solid #e3b341;border-radius:8px;background:#fffaf0;line-height:1.45;">
      <div style="font-weight:700;margin-bottom:8px;">Nie znaleźliśmy tego numeru w bazie klientów.</div>
      <div style="font-weight:400;margin-bottom:10px;">Jeżeli chcesz umówić pierwszą wizytę, wyślij krótkie zapytanie. Numer telefonu wpiszemy do formularza automatycznie.</div>
      <button type="button" id="openNewClientContactFormBtn" class="verify-btn" style="height:auto;padding:10px 14px;">Wyślij zapytanie</button>
    </div>`;
  const button = document.getElementById("openNewClientContactFormBtn");
  if (button) button.onclick = () => openContactFormPrefilled(phone);
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
  container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center;">Ładowanie galerii...</p>';
  try {
    const data = await fetchJSONP(`${APPS_SCRIPT_URL}?getPortfolio=true`);
    container.innerHTML = ""; 
    let loadedAny = false;
    if (data && data.length > 0) {
      data.forEach(category => {
        const title = document.createElement("h3");
        title.innerText = category.category;
        container.appendChild(title);
        const grid = document.createElement("div");
        grid.className = "gallery-grid";
        category.images.forEach(img => {
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.className = "gallery-item"; 
          imgEl.alt = img.name || category.category;
          imgEl.onerror = function() { this.src = "https://via.placeholder.com/300"; };
          grid.appendChild(imgEl);
          loadedAny = true;
        });
        container.appendChild(grid);
      });
    }
    if (!loadedAny) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center;">Brak zdjęć w galerii.</p>';
    }
  } catch (error) {
    console.error("Błąd ładowania portfolio:", error);
    container.innerHTML = '<p style="color: red; font-size: 14px; text-align: center;">Nie udało się załadować galerii.</p>';
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
    statusEl.innerHTML = "Rejestracja niemożliwa. Skontaktuj się z administratorem.";
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

