const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhPcJ84Qzz1QCEimcROvDAAqm8CGJXJiw63gvux5FMdC1r2I2zUNuD0zUR8xm6FZjZjg/exec"; 

let iti; 
let allAvailableSlots = []; 
let adminSettings = {
  buffer_hours: 1,
  safety_range_hours: 5,
  slot_interval_minutes: 45, // Шаг сетки по умолчанию
  work_start_hour: "09:00",  // Время начала работы по умолчанию
  work_end_hour: "18:00"     // Время окончания работы по умолчанию
};
let flatpickrInstance = null;
let isClientApproved = false; 

document.addEventListener("DOMContentLoaded", () => {
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
    serviceSelect.innerHTML = '<option value="" disabled selected>-- Wybierz zabieg --</option>';
    if (typeof cennikData !== "undefined") {
      cennikData.forEach(cat => {
        const optGroup = document.createElement("optgroup");
        optGroup.label = cat.categoryTitle;
        cat.items.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.name;
          opt.textContent = item.name;
          optGroup.appendChild(opt);
        });
        serviceSelect.appendChild(optGroup);
      });
    }
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
      serviceSelect.value = "";
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

// Извлечение длительности и переинициализация календаря под выбранную услугу
function onServiceChange() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
  const durationInput = document.getElementById("selectedDuration");
  if (!serviceSelect) return;
  
  const selectedService = serviceSelect.value;
  let foundPrice = "";
  let foundDuration = 45; // По умолчанию 45 минут, если в базе нет данных

  if (typeof cennikData !== "undefined") {
    cennikData.forEach(cat => {
      cat.items.forEach(item => {
        if (item.name === selectedService) {
          foundPrice = item.price;
          
          // Парсим длительность (например: "1:30", "2:00", "45 min")
          if (item.duration) {
            const durStr = String(item.duration).trim().toLowerCase();
            if (durStr.includes(":")) {
              const parts = durStr.split(":");
              foundDuration = (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
            } else {
              foundDuration = parseInt(durStr.replace(/[^0-9]/g, ""), 10) || 45;
            }
          }
        }
      });
    });
  }

  if (priceDisplay) {
    priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice : "";
  }
  
  if (durationInput) {
    durationInput.value = foundDuration;
  }

  // Перестраиваем календарь под новые лимиты времени процедуры
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
      // Объединяем настройки из Sheets с дефолтными
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

// Построение рабочей сетки на основе динамических настроек времени
function getBaseWorkingHours() {
  const baseWorkingHours = [];
  
  // Парсим часы начала и конца из настроек (работает с форматами "09:00", "9:00" или числом "9")
  const startStr = String(adminSettings.work_start_hour || "09:00").trim();
  const endStr = String(adminSettings.work_end_hour || "18:00").trim();
  
  let startHour = 9;
  let startMinute = 0;
  if (startStr.includes(":")) {
    const parts = startStr.split(":");
    startHour = parseInt(parts[0], 10);
    startMinute = parseInt(parts[1], 10);
  } else {
    startHour = parseInt(startStr, 10) || 9;
  }

  let endHour = 18;
  let endMinute = 0;
  if (endStr.includes(":")) {
    const parts = endStr.split(":");
    endHour = parseInt(parts[0], 10);
    endMinute = parseInt(parts[1], 10);
  } else {
    endHour = parseInt(endStr, 10) || 18;
  }

  let currentHour = startHour;
  let currentMinute = startMinute;
  const step = adminSettings.slot_interval_minutes || 45;

  const totalEndMinutes = (endHour * 60) + endMinute;

  while (true) {
    const currentTotalMinutes = (currentHour * 60) + currentMinute;
    if (currentTotalMinutes >= totalEndMinutes) {
      break; 
    }

    const hStr = String(currentHour).padStart(2, '0');
    const mStr = String(currentMinute).padStart(2, '0');
    baseWorkingHours.push(`${hStr}:${mStr}`);
    
    currentMinute += step;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  return baseWorkingHours;
}

// Умная генерация: возвращает массив ТОЛЬКО тех часов, куда процедура физически помещается
function getFreeSlotsForService(dateStr) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const baseWorkingHours = getBaseWorkingHours();
  const durationInput = document.getElementById("selectedDuration");
  const serviceDurationMinutes = durationInput ? parseInt(durationInput.value, 10) : 45;

  // Занятые слоты из Google Календаря на этот день
  const busyTimesOnThisDay = allAvailableSlots
    .filter(slot => slot.startsWith(dateStr))
    .map(slot => {
      const parts = slot.split("T");
      return parts[1] ? parts[1].substring(0, 5) : ""; 
    });

  return baseWorkingHours.filter(time => {
    // 1. Слот занят в календаре?
    if (busyTimesOnThisDay.includes(time)) {
      return false;
    }

    // 2. Прошедшее время и буфер для "сегодня"
    const [hours, minutes] = time.split(":").map(Number);
    const slotStartDateTime = new Date(`${dateStr}T${time}`);

    if (dateStr === todayStr) {
      const timeDifferenceMs = slotStartDateTime.getTime() - now.getTime();
      const bufferMs = adminSettings.buffer_hours * 60 * 60 * 1000; 

      if (timeDifferenceMs < bufferMs) {
        return false; 
      }
    }

    // 3. ПРОВЕРКА ПОМЕЩАЕМОСТИ ПРОЦЕДУРЫ
    const slotEndDateTime = new Date(slotStartDateTime.getTime() + (serviceDurationMinutes * 60 * 1000));
    
    // Динамический конец рабочего дня
    const endStr = String(adminSettings.work_end_hour || "18:00").trim();
    const endHourLimit = new Date(`${dateStr}T${endStr.includes(":") ? endStr : endStr + ":00"}`);

    // Если процедура выходит за рамки рабочего времени
    if (slotEndDateTime.getTime() > endHourLimit.getTime()) {
      return false;
    }

    // Проверяем, не накладывается ли процедура на другие занятые слоты этого дня
    let conflictsWithBusy = false;
    busyTimesOnThisDay.forEach(busyTime => {
      const busyStart = new Date(`${dateStr}T${busyTime}`);
      const busyEnd = new Date(busyStart.getTime() + (adminSettings.slot_interval_minutes * 60 * 1000));

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

// Инициализация календаря с учетом времени конкретной услуги
function initCalendar(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput) return;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
  }

  const disabledDates = [];
  const now = new Date();

  // Проверяем доступность каждого дня на 30 дней вперед
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

// Рендеринг сетки часов
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

// Проверка телефона по базе
async function checkExistingClient() {
  const statusEl = document.getElementById("clientStatus");
  if (!statusEl) return;

  if (!iti || !iti.isValidNumber()) {
    statusEl.style.display = "block";
    statusEl.style.color = "red";
    statusEl.innerHTML = "Wpisz poprawny numer telefonu!";
    isClientApproved = false;
    toggleFormState(false);
    return;
  }

  const fullPhoneNumber = iti.getNumber();
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
      
      await loadFreeSlots(); 
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

// Отправка формы с перепроверкой занятости "на лету" и чистой перерисовкой
async function submitForm(event) {
  event.preventDefault();

  const finalDateTimeValue = document.getElementById("finalDateTime").value; 
  const submitBtn = document.getElementById("submitBookingBtn");
  const rodoConsent = document.getElementById("rodoConsent");
  
  if (!isClientApproved) {
    alert("Rezerwacja niemożliwa. Twój numer telefonu nie został zweryfikowany.");
    return;
  }

  if (!finalDateTimeValue) {
    alert("Proszę wybrać godzinę wizyty!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Sprawdzanie terminu...";

  try {
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(finalDateTimeValue)}`);
    const result = await checkResponse.json();

    if (!result.isFree) {
      alert("Wybrana godzina została właśnie zajęta. Proszę wybrać inny wolny termin.");

      // Перезагружаем свежие занятые слоты с бэкенда Google Sheets
      await loadFreeSlots();
      
      const selectedDateStr = document.getElementById("calendarInput").value;
      if (selectedDateStr) {
        // Пересобираем календарь и начисто стираем уплывший слот
        initCalendar(selectedDateStr);
        displayTimeSlots(selectedDateStr);
      }
      
      submitBtn.disabled = false;
      submitBtn.innerText = "Zarezerwuj wizytę";
      return; 
    }

    submitBtn.innerText = "Zapisywanie...";
    const payload = {
      phone: iti ? iti.getNumber() : document.getElementById("clientPhone").value,
      name: document.getElementById("clientName").value,
      service: document.getElementById("serviceType").value,
      date: finalDateTimeValue,
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
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
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
