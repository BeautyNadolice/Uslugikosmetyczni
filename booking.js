const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6QPWF6zw17luqabtFpyH2LRDB6UVGq9vIiKf4N2hhFUZPmPn-qO9ZLc8ejWccaOgVKQ/exec"; 

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

    // Сброс авторизации, если телефон начали менять
    phoneInput.addEventListener("input", () => {
      isClientApproved = false;
      document.getElementById("clientName").value = "";
      document.getElementById("clientStatus").innerHTML = "";
      toggleSubmitButton();
    });
  }

  // Привязка кнопки "Sprawdź" рядом с телефоном
  const verifyBtn = document.getElementById("verifyPhoneBtn");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", checkExistingClient);
  }

  // Заполнение услуг из prices.js
  const serviceSelect = document.getElementById("serviceType");
  if (serviceSelect) {
    serviceSelect.innerHTML = '<option value="" disabled selected>-- Wybierz zabieg --</option>';
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

  // Привязка отправки формы
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", submitForm);
  }

  // Первичная загрузка слотов
  loadFreeSlots();
  toggleSubmitButton();
});

// Управление доступностью кнопки отправки формы
function toggleSubmitButton() {
  const submitBtn = document.querySelector(".submit-booking-btn");
  if (!submitBtn) return;
  
  if (isClientApproved) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
    submitBtn.style.cursor = "not-allowed";
  }
}

// Обновление отображаемой цены услуги
function updatePrice() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
  if (!serviceSelect || !priceDisplay) return;
  const selectedService = serviceSelect.value;

  let foundPrice = "";
  cennikData.forEach(cat => {
    cat.items.forEach(item => {
      if (item.name === selectedService) {
        foundPrice = item.price;
      }
    });
  });
  priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice : "";
}

// Получение свежих свободных слотов с сервера
async function loadFreeSlots() {
  const container = document.getElementById("timeSlotsContainer");
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const slots = await response.json(); 
    
    const now = new Date();
    allAvailableSlots = slots.filter(slotStr => {
      const slotDate = new Date(slotStr.replace(' ', 'T'));
      return slotDate > now;
    });

    // Сохраняем выбранную дату перед пересозданием календаря
    const savedDate = document.getElementById("calendarInput") ? document.getElementById("calendarInput").value : "";

    initCalendar(savedDate);
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    if (container) {
      container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów. Spróbuj później.</p>';
    }
  }
}

// Инициализация календаря Flatpickr (с сохранением выбранной даты, если она была)
function initCalendar(defaultDate = "") {
  const availableDates = [...new Set(allAvailableSlots.map(slot => slot.split(" ")[0] || slot.split("T")[0]))];
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
    enable: availableDates,
    defaultDate: defaultDate || null, // Восстанавливаем выбранную дату
    onChange: function(selectedDates, dateStr) {
      displayTimeSlots(dateStr);
    }
  });
}

// Показ плиток свободного времени для выбранного дня
function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  if (!container) return;
  container.innerHTML = ""; 
  document.getElementById("finalDateTime").value = ""; 

  const daySlots = allAvailableSlots
    .filter(slot => slot.startsWith(selectedDateStr))
    .map(slot => {
      const parts = slot.split(/[ T]/);
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
      document.getElementById("finalDateTime").value = `${selectedDateStr}T${time}:00`;
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
    toggleSubmitButton();
    return;
  }

  const fullPhoneNumber = iti.getNumber();
  statusEl.style.display = "block";
  statusEl.style.color = "#2C2C2C";
  statusEl.innerHTML = "Sprawdzanie danych..."

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(fullPhoneNumber)}`);
    const data = await response.json();

    if (data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      statusEl.style.color = "green";
      statusEl.innerHTML = "Klient zweryfikowany pomyślnie! Możesz dokonać rezerwacji.";
      isClientApproved = true;
    } else {
      document.getElementById("clientName").value = "";
      statusEl.style.color = "red";
      statusEl.innerHTML = "Brak numeru w bazie. Rezerwacja niemożliwa. Skontaktuj się z salonem w celu rejestracji.";
      isClientApproved = false;
    }
  } catch (error) {
    statusEl.style.color = "red";
    statusEl.innerHTML = "Błąd połączenia z bazą danych.";
    isClientApproved = false;
  }
  toggleSubmitButton();
}

// Полный сброс и очистка формы при закрытии модального окна
function resetBookingForm() {
  const form = document.getElementById("bookingForm");
  if (form) {
    form.reset();
  }
  
  // Очистка кастомных элементов и флагов проверки
  isClientApproved = false;
  document.getElementById("priceDisplay").innerText = "";
  
  const statusEl = document.getElementById("clientStatus");
  if (statusEl) {
    statusEl.innerHTML = "";
    statusEl.style.display = "none";
  }
  
  const slotsContainer = document.getElementById("timeSlotsContainer");
  if (slotsContainer) {
    slotsContainer.innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
  }
  
  document.getElementById("finalDateTime").value = "";
  
  if (flatpickrInstance) {
    flatpickrInstance.clear();
  }
  
  toggleSubmitButton();
}

// Отправка формы с защитой от наложения записей (Double Booking)
async function submitForm(event) {
  event.preventDefault();

  const finalDateTimeValue = document.getElementById("finalDateTime").value;
  const submitBtn = document.querySelector(".submit-booking-btn");
  
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
    // 1. ПОВТОРНАЯ ПРОВЕРКА: Свободен ли еще этот слот на сервере прямо сейчас?
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const freshSlots = await checkResponse.json();
    
    const optionFormat1 = finalDateTimeValue.replace('T', ' '); // "2026-07-16 12:00:00"
    const optionFormat2 = finalDateTimeValue;                   // "2026-07-16T12:00:00"

    const isStillFree = freshSlots.some(slot => slot === optionFormat1 || slot === optionFormat2);

    if (!isStillFree) {
      alert("Przepraszamy, ten termin został właśnie zajęty lub zablokowany! Proszę wybrać inną godzinę.");
      
      // Сохраняем дату, выбранную клиентом прямо сейчас
      const selectedDateStr = document.getElementById("calendarInput").value;

      // Срочно скачиваем свежие слоты (календарь пересоздастся, но сохранит выбранную дату!)
      await loadFreeSlots();
      
      // Автоматически перерисовываем плитки на экране для этой сохраненной даты
      if (selectedDateStr) {
        displayTimeSlots(selectedDateStr);
      }
      
      submitBtn.disabled = false;
      submitBtn.innerText = "Zarezerwuj wizytę";
      return; 
    }

    // 2. ЕСЛИ СЛОТ ВСЕ ЕЩЕ СВОБОДЕН — ОТПРАВЛЯЕМ ЗАПИСЬ
    submitBtn.innerText = "Zapisywanie...";
    const payload = {
      phone: iti ? iti.getNumber() : document.getElementById("clientPhone").value,
      name: document.getElementById("clientName").value,
      service: document.getElementById("serviceType").value,
      date: finalDateTimeValue
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    closeBookingModal();
    loadFreeSlots(); // Свежее обновление слотов
  } catch (error) {
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    toggleSubmitButton();
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}

// Функции модального окна
function openBookingModal() {
  document.getElementById("bookingModal").style.display = "flex";
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
  resetBookingForm(); // Сбрасываем форму при закрытии
}

// Закрытие окна при клике на серую область вне формы
window.addEventListener("click", (e) => {
  const modal = document.getElementById("bookingModal");
  if (e.target === modal) {
    closeBookingModal();
  }
});
