const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztmereZ5tJPpdKxl2B0oibnwJhDYLOqW0IlIt56P3ZV9UZ73KiGWKfwANONFe4zTTyew/exec"; 

let iti; 
let allAvailableSlots = []; 
let flatpickrInstance = null;
let isClientApproved = false; // Флаг: найден ли клиент в базе данных

document.addEventListener("DOMContentLoaded", () => {
  // Настройка ввода телефона с флагами
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl",
      preferredCountries: ["pl", "ua", "by"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    
    // Проверка при потере фокуса
    phoneInput.addEventListener("blur", checkExistingClient);
    
    // Проверка при нажатии Enter внутри поля телефона
    phoneInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Предотвращаем отправку всей формы
        checkExistingClient();
      }
    });

    // Сброс авторизации и блокировка формы при изменении телефона
    phoneInput.addEventListener("input", () => {
      isClientApproved = false;
      document.getElementById("clientName").value = "";
      const statusEl = document.getElementById("clientStatus");
      if (statusEl) statusEl.innerHTML = "";
      toggleFormState(false); // Блокируем форму обратно
    });
  }

  // Привязка новой кнопки "Sprawdź" рядом с телефоном
  const verifyBtn = document.getElementById("verifyPhoneBtn");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", checkExistingClient);
  }

  // Заполнение услуг из prices.js
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

  // Привязка отправки формы
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", submitForm);
  }

  // Первичная загрузка слотов
  loadFreeSlots();
  toggleFormState(false); // Изначально вся форма заблокирована
});

// Управление состоянием всей формы
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

// Обновление отображаемой цены услуги
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

// Получение свободных слотов
async function loadFreeSlots() {
  const container = document.getElementById("timeSlotsContainer");
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const slots = await response.json(); 
    allAvailableSlots = slots;

    const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";
    initCalendar(savedDate);
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    if (container) {
      container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów. Spróbuj później.</p>';
    }
  }
}

// Инициализация календаря (все дни недели, включая воскресенье, активны)
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
    // Теперь нет никаких ограничений по дням недели — все дни открыты!
    defaultDate: defaultDate || null, 
    onChange: function(selectedDates, dateStr) {
      displayTimeSlots(dateStr);
    }
  });
}

// Показ плиток времени
function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  if (!container) return;
  container.innerHTML = ""; 
  document.getElementById("finalDateTime").value = ""; 

  const daySlots = allAvailableSlots
    .filter(slot => slot.startsWith(selectedDateStr))
    .map(slot => {
      const parts = slot.split("T");
      return parts[1] ? parts[1].substring(0, 5) : ""; 
    })
    .filter(time => time !== "");

  if (daySlots.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px;">Brak wolnych godzin na ten dzień.</p>';
    return;
  }

  daySlots.forEach(time => {
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

// Проверка телефона по базе данных
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
      toggleFormState(true); // Разблокируем форму
    } else {
      document.getElementById("clientName").value = "";
      statusEl.style.color = "red";
      statusEl.innerHTML = "Rejestracja niemożliwa. Skontaktuj się z administratorem.";
      isClientApproved = false;
      toggleFormState(false); // Оставляем заблокированной
    }
  } catch (error) {
    statusEl.style.color = "red";
    statusEl.innerHTML = "Błąd połączenia z bazą danych.";
    isClientApproved = false;
    toggleFormState(false);
  }
}

// Сброс формы
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

// Отправка формы с защитой от наложений
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
    // 1. Быстрая проверка слота
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(finalDateTimeValue)}`);
    const result = await checkResponse.json();

    if (!result.isFree) {
      alert("Przepraszamy, ten termin został właśnie zajęty! Wybierz inną godzinę.");
      const selectedDateStr = document.getElementById("calendarInput").value;
      await loadFreeSlots();
      if (selectedDateStr) {
        displayTimeSlots(selectedDateStr);
      }
      submitBtn.disabled = false;
      submitBtn.innerText = "Zarezerwuj wizytę";
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
    alert("Wystąpiл błąd podczas rezerwacji. Spróbuj ponownie.");
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
