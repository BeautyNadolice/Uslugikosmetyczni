const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6jc0ZJuCUVnFrXJ2Mqhec4NrNI7wu4N1g2lQyWhJHwlcfh9PKxFs1x2xVMelROfzPQQ/exec"; 

let iti; 
let allAvailableSlots = []; 
let flatpickrInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  // Настройка ввода телефона с флагами
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl",
      preferredCountries: ["pl", "ua", "by"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    phoneInput.addEventListener("blur", checkExistingClient);
  }

  // Заполнение услуг из prices.js (массив cennikData)
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

  // Сразу загружаем доступное время с сервера
  loadFreeSlots();
});

// Функция обновления цены под выпадающим списком услуг
function updatePrice() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
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

// Загрузка слотов времени и запуск календаря
async function loadFreeSlots() {
  const container = document.getElementById("timeSlotsContainer");
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const slots = await response.json(); 
    
    // Фильтруем прошедшие даты (чтобы не показывать слоты в прошлом)
    const now = new Date();
    allAvailableSlots = slots.filter(slotStr => {
      const slotDate = new Date(slotStr.replace(' ', 'T'));
      return slotDate > now;
    });

    initCalendar();
  } catch (error) {
    console.error("Błąd ładowania terminów:", error);
    container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd ładowania terminów. Spróbuj później.</p>';
  }
}

// Инициализация красивого календаря
function initCalendar() {
  // Создаем массив уникальных дат, в которых есть свободное время (формат YYYY-MM-DD)
  const availableDates = [...new Set(allAvailableSlots.map(slot => slot.split(" ")[0] || slot.split("T")[0]))];

  flatpickrInstance = flatpickr("#calendarInput", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: "true", // Оставляем красивый вид календаря и на телефонах
    enable: availableDates, // Кликнуть можно только на те дни, где есть свободные часы!
    onChange: function(selectedDates, dateStr) {
      displayTimeSlots(dateStr);
    }
  });
}

// Показ доступного времени в виде плиток под календарем
function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  container.innerHTML = ""; 
  document.getElementById("finalDateTime").value = ""; // Сбрасываем старый выбор

  // Находим часы именно для этого дня
  const daySlots = allAvailableSlots
    .filter(slot => slot.startsWith(selectedDateStr))
    .map(slot => {
      const parts = slot.split(/[ T]/);
      return parts[1] ? parts[1].substring(0, 5) : ""; // берем только HH:MM
    })
    .filter(time => time !== "");

  if (daySlots.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px;">Brak wolnych godzin na ten dzień.</p>';
    return;
  }

  // Рендерим стильные кнопки для времени
  daySlots.forEach(time => {
    const slotDiv = document.createElement("div");
    slotDiv.className = "time-slot";
    slotDiv.innerText = time;
    
    slotDiv.onclick = function() {
      // Снимаем выделение со всех остальных плиток
      document.querySelectorAll(".time-slot").forEach(el => el.classList.remove("selected"));
      // Выделяем текущую
      slotDiv.classList.add("selected");
      // Записываем финальные дату+время в скрытый input для отправки в базу
      document.getElementById("finalDateTime").value = `${selectedDateStr}T${time}:00`;
    };

    container.appendChild(slotDiv);
  });
}

// Проверка существующего клиента по номеру телефона
async function checkExistingClient() {
  if (!iti.isValidNumber()) return;

  const fullPhoneNumber = iti.getNumber();
  const statusEl = document.getElementById("clientStatus");
  statusEl.style.display = "block";
  statusEl.innerHTML = "Sprawdzanie danych...";

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(fullPhoneNumber)}`);
    const data = await response.json();

    if (data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      statusEl.style.color = "green";
      statusEl.innerHTML = "Znaleziono klienta!";
    } else {
      statusEl.style.color = "#777";
      statusEl.innerHTML = "Nowy klient.";
    }
  } catch (error) {
    statusEl.style.display = "none";
  }
}

// Отправка формы на сервер
async function submitForm(event) {
  event.preventDefault();

  const finalDateTimeValue = document.getElementById("finalDateTime").value;
  const submitBtn = document.querySelector(".submit-booking-btn");
  
  if (!finalDateTimeValue) {
    alert("Proszę wybrać godzinę wizyty!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Wysyłanie...";

  const payload = {
    phone: iti.getNumber(),
    name: document.getElementById("clientName").value,
    service: document.getElementById("serviceType").value,
    date: finalDateTimeValue // отправляем выбранное в календаре время
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    closeBookingModal();
    // Очистка формы
    document.getElementById("bookingForm").reset();
    document.getElementById("priceDisplay").innerText = "";
    document.getElementById("timeSlotsContainer").innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
    loadFreeSlots(); // Обновляем занятое время
  } catch (error) {
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}

// Функции модального окна
function openBookingModal() {
  document.getElementById("bookingModal").style.display = "flex";
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}
