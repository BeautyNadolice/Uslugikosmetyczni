const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhPcJ84Qzz1QCEimcROvDAAqm8CGJXJiw63gvux5FMdC1r2I2zUNuD0zUR8xm6FZjZjg/exec"; 

let iti; 
let allAvailableSlots = []; 
let adminSettings = {
  buffer_hours: 1,
  safety_range_hours: 5,
  slot_interval_minutes: 45
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
    serviceSelect.addEventListener("change", updatePrice);
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", submitForm);
  }

  loadFreeSlots();
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

function updatePrice() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
  if (!serviceSelect || !priceDisplay) return;
  const selectedService = serviceSelect.value;

  let foundPrice = "";
  if (typeof cennikData !== "undefined") {
    cennikData.forEach(cat => {
      cat.items.forEach(item => {
        if (item.name === selectedService) {
          foundPrice = item.price;
        }
      });
    });
  }
  priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice : "";
}

// Загрузка занятых слотов и динамических настроек из админки
async function loadFreeSlots() {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const data = await response.json(); 
    
    allAvailableSlots = data.busySlots || [];
    if (data.settings) {
      adminSettings = data.settings; // Обновляем настройки из Google Таблицы
    }

    const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
    initCalendar(savedDate);
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    const container = document.getElementById("timeSlotsContainer");
    if (container) {
      container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów. Spróbuj później.</p>';
    }
  }
}

// Инициализация календаря (Все дни, включая воскресенье, открыты)
function initCalendar(defaultDate = "") {
  const calendarInput = document.getElementById("calendarInput");
  if (!calendarInput) return;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
  }

  flatpickrInstance = flatpickr("#calendarInput", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: true,
    defaultDate: defaultDate || null, 
    onChange: function(selectedDates, dateStr) {
      displayTimeSlots(dateStr);
    }
  });
}

// Генерация сетки часов на основе интервала и проверка буфера из таблицы Settings
function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  if (!container) return;
  container.innerHTML = ""; 
  document.getElementById("finalDateTime").value = ""; 

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Генерируем базовые часы работы динамически на основе шага slot_interval_minutes (например, каждые 45 минут)
  const baseWorkingHours = [];
  let currentHour = 9;  // С 09:00
  let currentMinute = 0;
  const endHour = 18;   // До 18:00 (последний слот может начаться в 17:15)

  const step = adminSettings.slot_interval_minutes || 45;

  while (currentHour < endHour) {
    const hStr = String(currentHour).padStart(2, '0');
    const mStr = String(currentMinute).padStart(2, '0');
    baseWorkingHours.push(`${hStr}:${mStr}`);
    
    currentMinute += step;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  // Фильтруем занятые в календаре слоты на выбранный день
  const busyTimesOnThisDay = allAvailableSlots
    .filter(slot => slot.startsWith(selectedDateStr))
    .map(slot => {
      const parts = slot.split("T");
      return parts[1] ? parts[1].substring(0, 5) : ""; 
    });

  // Фильтрация: убираем занятые, убираем прошлое и учитываем буфер buffer_hours
  const freeHours = baseWorkingHours.filter(time => {
    if (busyTimesOnThisDay.includes(time)) {
      return false;
    }

    if (selectedDateStr === todayStr) {
      const [hours, minutes] = time.split(":").map(Number);
      const slotDateTime = new Date();
      slotDateTime.setHours(hours, minutes, 0, 0);

      const timeDifferenceMs = slotDateTime.getTime() - now.getTime();
      // Буфер берется динамически из настроек Settings (переводим часы в мс)
      const bufferMs = adminSettings.buffer_hours * 60 * 60 * 1000; 

      if (timeDifferenceMs < bufferMs) {
        return false; // Скрываем слот, если он прошел или находится в зоне буфера
      }
    }

    return true;
  });

  if (freeHours.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px;">Brak wolnych godzin na ten dzień.</p>';
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
    } else {
      document.getElementById("clientName").value = "";
      statusEl.style.color = "red";
      statusEl.innerHTML = "Rejestracja niemożliwa. Skontaktuj się z administratorem.";
      isClientApproved = false;
      toggleFormState(false); 
    }
  } catch (error) {
    statusEl.style.color = "red";
    statusEl.innerHTML = "Błąd połączenia z bazą danych.";
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

// Отправка формы с глубокой проверкой
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
    // 1. Быстрая глубокая проверка перед отправкой (берет safety_range_hours из настроек)
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(finalDateTimeValue)}`);
    const result = await checkResponse.json();

    if (!result.isFree) {
      let alertMessage = "Przepraszamy, ten termin (lub termin blisko niego) został właśnie zajęty!";
      if (result.conflictingTime) {
        alertMessage += ` Wykryto inną rezerwację o godzinie ${result.conflictingTime}. Wybierz inną godzinę.`;
      } else {
        alertMessage += " Wybierz inną godzinę.";
      }
      
      alert(alertMessage);

      const selectedDateStr = document.getElementById("calendarInput").value;
      await loadFreeSlots();
      if (selectedDateStr) {
        displayTimeSlots(selectedDateStr);
      }
      return; 
    }

    // 2. Отправка записи
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
  } finally {
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
