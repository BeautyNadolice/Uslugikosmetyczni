const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwILKK37Yp6NIw529QdbZWcVQjyecBB1tZjY2hdm0in0d-DprrdVnuCNdbguL2I9BrZ7Q/exec";
  
let iti; 
let allAvailableSlots = []; 
let adminSettings = {
  buffer_hours: 1,
  safety_range_hours: 5,
  slot_interval_minutes: 45,
  work_start_hour: "09:00",
  work_end_hour: "18:00"
};
let flatpickrInstance = null;
let isClientApproved = false; 

// Загрузка галереи/портфолио из Google Диска
async function loadPortfolio() {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;

  grid.innerHTML = '<p style="grid-column: span 2; color: var(--text-muted); font-size: 14px; text-align: center;">Ładowanie galerii...</p>';

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?getPortfolio=true`);
    const data = await response.json();

    grid.innerHTML = "";
    let loadedAny = false;

    if (data && data.length > 0) {
      data.forEach(category => {
        category.images.forEach(img => {
          const item = document.createElement("div");
          item.className = "portfolio-item";
          
          const imgEl = document.createElement("img");
          imgEl.src = img.url;
          imgEl.alt = img.name || category.category;
          imgEl.onerror = function() {
            this.src = "https://via.placeholder.com/300"; // Заглушка, если фото не загрузилось
          };
          
          item.appendChild(imgEl);
          grid.appendChild(item);
          loadedAny = true;
        });
      });
    }

    if (!loadedAny) {
      grid.innerHTML = '<p style="grid-column: span 2; color: var(--text-muted); font-size: 14px; text-align: center;">Brak zdjęć w galerii.</p>';
    }
  } catch (error) {
    console.error("Błąd ładowania portfolio:", error);
    grid.innerHTML = '<p style="grid-column: span 2; color: red; font-size: 14px; text-align: center;">Nie udało się załadować galerii.</p>';
  }
}

async function loadServicesIntoSelect() {
  const serviceSelect = document.getElementById("serviceType");
  if (!serviceSelect) return;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?getPrices=true`);
    const services = await response.json();

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
  // Инициализируем динамическую галерею
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
  if (verifyBtn) {
    verifyBtn.addEventListener("click", checkExistingClient);
  }

  const serviceSelect = document.getElementById("serviceType");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", onServiceChange);
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", submitForm);
  }

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
      if (flatpickrInstance) {
        flatpickrInstance.clear();
      }
    }
  }

  if (rodoConsent) {
    rodoConsent.disabled = !enabled;
    if (!enabled) {
      rodoConsent.checked = false;
    }
  }

  if (slotsContainer) {
    if (!enabled) {
      slotsContainer.innerHTML = '<p style="color: #c2a383; font-size: 14px; font-weight: bold;">Najpierw zweryfikuj numer telefonu...</p>';
    } else {
      if (!calendarInput.value) {
        slotsContainer.innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
      }
    }
  }

  if (!enabled) {
    document.getElementById("finalDateTime").value = "";
  }
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

  if (priceDisplay) {
    priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice + " zł" : "";
  }
  
  if (durationInput) {
    durationInput.value = foundDuration;
  }

  const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
  initCalendar(savedDate);

  if (savedDate) {
    displayTimeSlots(savedDate);
  }
}

async function loadFreeSlots() {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const data = await response.json(); 
    
    allAvailableSlots = data.busySlots || [];
    if (data.settings) {
      adminSettings = { ...adminSettings, ...data.settings }; 
    }

    const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
    initCalendar(savedDate);
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    const container = document.getElementById("timeSlotsContainer");
    if (container) {
      container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów.</p>';
    }
  }
}

function getBaseWorkingHours() {
  const baseWorkingHours = [];
  
  const startStr = adminSettings.work_start_hour || "09:00";
  const endStr = adminSettings.work_end_hour || "18:00";
  const step = parseInt(adminSettings.slot_interval_minutes, 10) || 45;
  const offset = parseInt(adminSettings.start_offset_minutes, 10) || 0; 

  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);

  let currentTotalMinutes = (startH * 60) + startM + offset;
  const totalEndMinutes = (endH * 60) + endM;

  while (currentTotalMinutes < totalEndMinutes) {
    const h = Math.floor(currentTotalMinutes / 60);
    const m = currentTotalMinutes % 60;
    
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    
    baseWorkingHours.push(`${hStr}:${mStr}`);
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

  const busyTimesOnThisDay = allAvailableSlots
    .filter(slot => slot.startsWith(dateStr))
    .map(slot => {
      const parts = slot.split("T");
      return parts[1] ? parts[1].substring(0, 5) : ""; 
    });

  return baseWorkingHours.filter(time => {
    if (busyTimesOnThisDay.includes(time)) {
      return false;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const slotStartDateTime = new Date(`${dateStr}T${time}`);

    if (dateStr === todayStr) {
      const timeDifferenceMs = slotStartDateTime.getTime() - now.getTime();
      const bufferMs = adminSettings.buffer_hours * 60 * 60 * 1000; 

      if (timeDifferenceMs < bufferMs) {
        return false; 
      }
    }

    const slotEndDateTime = new Date(slotStartDateTime.getTime() + (serviceDurationMinutes * 60 * 1000));
    
    const endStr = String(adminSettings.work_end_hour || "18:00").trim();
    const formattedEndStr = endStr.includes(":") ? endStr.substring(0, 5) : endStr + ":00";
    const endHourLimit = new Date(`${dateStr}T${formattedEndStr}`);

    if (slotEndDateTime.getTime() > endHourLimit.getTime()) {
      return false;
    }

    let conflictsWithBusy = false;
    busyTimesOnThisDay.forEach(busyTime => {
      const busyStart = new Date(`${dateStr}T${busyTime}`);
      
      let busyStep = parseInt(adminSettings.slot_interval_minutes, 10);
      if (isNaN(busyStep) || busyStep <= 0) busyStep = 45;

      const busyEnd = new Date(busyStart.getTime() + (busyStep * 60 * 1000));

      if (slotStartDateTime.getTime() < busyEnd.getTime() && slotEndDateTime.getTime() > busyStart.getTime()) {
        conflictsWithBusy = true;
      }
    });

    if (conflictsWithBusy) {
      return false;
    }

    return true;
  });
}

function initCalendar(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput) return;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
  }

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
    if (slots.length === 0) {
      disabledDates.push(dateStr);
    }
  }

  flatpickrInstance = flatpickr("#calendarInput", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: true,
    disable: disabledDates, 
    defaultDate: defaultDate || null, 
    onChange: function(selectedDates, dateStr) {
      displayTimeSlots(dateStr);
    }
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
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(fullPhoneNumber)}`);
    const data = await response.json();

    if (data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      statusEl.style.color = "green";
      statusEl.innerHTML = "Klient zweryfikowany pomyślnie!";
      isClientApproved = true;
      toggleFormState(true); 
      
      loadServicesIntoSelect().then(() => {
         return loadFreeSlots();
      }).catch(err => console.error("Błąd ładowania danych: ", err));
      
    } else {
      document.getElementById("clientName").value = "";
      statusEl.style.color = "red";
      statusEl.innerHTML = "Rejestracja niemożliwa. Skontaktuj się z administratorem.";
      isClientApproved = false;
      toggleFormState(false); 
    }
  } catch (error) {
    statusEl.style.color = "red";
    statusEl.innerHTML = "Błąd połączenia z bazą данных.";
    isClientApproved = false;
    toggleFormState(false);
  }
}

function resetBookingForm() {
  const form = document.getElementById("bookingForm");
  if (form) {
    form.reset();
  }
  isClientApproved = false;
  const statusEl = document.getElementById("clientStatus");
  if (statusEl) {
    statusEl.innerHTML = "";
    statusEl.style.display = "none";
  }
  toggleFormState(false);
}

async function submitForm(event) {
  event.preventDefault();

  const finalDateTimeValue = document.getElementById("finalDateTime").value; 
  const submitBtn = document.getElementById("submitBookingBtn");
  const rodoConsent = document.getElementById("rodoConsent");
  const durationInput = document.getElementById("selectedDuration");
  
  if (!isClientApproved) {
    alert("Rezerwacja niemożliwa. Twój numer telefonu nie został zweryfikowany.");
    return;
  }

  if (!finalDateTimeValue) {
    alert("Proszę wybrać godzinę wizyty!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Sprawdzanie terminu w kalendarzu...";

  try {
    const serviceDuration = durationInput ? parseInt(durationInput.value, 10) : 60;
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(finalDateTimeValue)}&duration=${serviceDuration}`);
    const result = await checkResponse.json();

    if (!result.isFree) {
      alert("Wybrana godzina jest już zajęta w kalendarzu. Proszę wybrać inny termin.");
      await loadFreeSlots();
      
      const selectedDateStr = document.getElementById("calendarInput").value;
      if (selectedDateStr) {
        initCalendar(selectedDateStr);
        displayTimeSlots(selectedDateStr);
      }
      
      submitBtn.disabled = false;
      submitBtn.innerText = "Zarezerwuj wizytę";
      return; 
    }

    let phoneToSubmit = "";
    const phoneInput = document.getElementById("clientPhone");
    let rawPhone = phoneInput.value.replace(/\s+/g, '').replace(/-/g, '');

    if (iti && iti.isValidNumber()) {
      phoneToSubmit = iti.getNumber(intlTelInputUtils.numberFormat.E164).replace(/\s+/g, '');
    } else if (/^\d{9}$/.test(rawPhone)) {
      phoneToSubmit = "+48" + rawPhone;
    } else {
      phoneToSubmit = rawPhone;
    }

    submitBtn.innerText = "Zapisywanie...";
    
    const payload = {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    closeBookingModal();
    loadFreeSlots(); 
  } catch (error) {
    alert("Wystąpiл błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}

function openBookingModal() {
  document.getElementById("bookingModal").style.display = "flex";
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
  resetBookingForm(); 
}

window.addEventListener("click", (e) => {
  const modal = document.getElementById("bookingModal");
  if (e.target === modal) {
    closeBookingModal();
  }
});
