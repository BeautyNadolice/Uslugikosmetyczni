const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1GVocAldQxrudzp3VyzoFGrmE5nVl88uWJ2VWh1B04HYXHQdTmmcrIgDwyLcHMdZErA/exec"; 

let iti; 
let allAvailableSlots = []; 
let flatpickrInstance = null;
let isClientApproved = false; // Флаг: найден ли клиент в базе данных

document.addEventListener("DOMContentLoaded", () => {
  // Загружаем прайс-лист для витрины и выпадающего списка
  loadServicesAndPriceList();

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

    // Сброс авторизации и блокировка формы, если телефон начали менять
    phoneInput.addEventListener("input", () => {
      isClientApproved = false;
      document.getElementById("clientName").value = "";
      document.getElementById("clientName").disabled = true;
      document.getElementById("serviceType").disabled = true;
      document.getElementById("serviceType").selectedIndex = 0;
      document.getElementById("bookingDate").disabled = true;
      document.getElementById("bookingDate").value = "";
      if (flatpickrInstance) {
        flatpickrInstance.clear();
      }
      document.getElementById("timeSlotsContainer").innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
      document.getElementById("finalDateTime").value = "";
      document.getElementById("rodoConsent").disabled = true;
      document.getElementById("rodoConsent").checked = false;
      document.getElementById("submitBookingBtn").disabled = true;
      document.getElementById("priceDisplay").innerText = "";
    });
  }
});

// Загрузка услуг из Google Таблицы и построение прайс-листа на сайте
async function loadServicesAndPriceList() {
  const serviceSelect = document.getElementById("serviceType");
  const priceListContainer = document.getElementById("priceListContainer");
  
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?getPrices=true`);
    const prices = await response.json();
    
    // 1. Заполняем выпадающий список (Select) в модалке
    serviceSelect.innerHTML = '<option value="" disabled selected>-- Wybierz zabieg --</option>';
    prices.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.name;
      
      // Формируем красивый текст опции с учетом настроек видимости
      let durationText = item.showDuration ? ` (${item.duration} min)` : '';
      let priceText = item.showPrice ? ` - ${item.price} zł` : '';
      opt.textContent = `${item.name}${durationText}${priceText}`;
      
      opt.dataset.price = item.price;
      opt.dataset.duration = item.duration;
      opt.dataset.showPrice = item.showPrice;
      opt.dataset.showDuration = item.showDuration;
      serviceSelect.appendChild(opt);
    });

    // 2. Строим визуальный прайс-лист на главной странице сайта
    if (priceListContainer) {
      priceListContainer.innerHTML = "";
      
      // Группируем по категориям
      const categories = {};
      prices.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });

      for (const catName in categories) {
        let catHtml = `<div class="price-category">`;
        catHtml += `<div class="category-title">${catName}</div>`;
        
        categories[catName].forEach(item => {
          let priceVal = item.showPrice ? `${item.price} zł` : "Cena ustalana ind.";
          let durationVal = item.showDuration ? `<span class="price-duration" style="font-size: 12px; color: var(--text-muted); display: block;">Czas: ${item.duration} min</span>` : "";
          
          catHtml += `
            <div class="price-item" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span class="price-name" style="font-weight: 500;">${item.name}</span>
                    <span class="price-value" style="font-weight: bold; color: var(--accent-color); white-space: nowrap; margin-left: 10px;">${priceVal}</span>
                </div>
                ${durationVal}
            </div>
          `;
        });
        catHtml += `</div>`;
        priceListContainer.innerHTML += catHtml;
      }
    }
  } catch (error) {
    console.error("Błąd ładowania usług:", error);
    if (serviceSelect) {
      serviceSelect.innerHTML = '<option value="" disabled>Błąd ładowania usług</option>';
    }
    if (priceListContainer) {
      priceListContainer.innerHTML = '<p style="text-align: center; color: red;">Nie udało się załadować cennika. Spróbuj później.</p>';
    }
  }
}

// Изменение выбора услуги
function updatePrice() {
  const serviceSelect = document.getElementById("serviceType");
  const priceDisplay = document.getElementById("priceDisplay");
  const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
  
  if (selectedOption) {
    const showPrice = selectedOption.dataset.showPrice === "true";
    const showDuration = selectedOption.dataset.showDuration === "true";
    const priceVal = selectedOption.dataset.price;
    const durationVal = selectedOption.dataset.duration;

    // Сохраняем длительность в скрытое поле
    document.getElementById("selectedDuration").value = durationVal;

    let displayTxt = "";
    if (showPrice) displayTxt += `Cena: ${priceVal} zł`;
    if (showDuration) displayTxt += displayTxt ? ` | Czas: ${durationVal} min` : `Czas: ${durationVal} min`;
    
    priceDisplay.innerText = displayTxt;

    // Перезагружаем календарь, если дата уже выбрана (так как свободные слоты зависят от времени процедуры!)
    const dateInput = document.getElementById("bookingDate");
    if (dateInput && dateInput.value) {
      loadFreeSlots();
    }
  }
}

// Проверка наличия клиента по номеру телефона
async function checkExistingClient() {
  const phoneInput = document.getElementById("clientPhone");
  const nameInput = document.getElementById("clientName");
  const serviceSelect = document.getElementById("serviceType");
  
  if (!phoneInput.value.trim()) return;

  const rawPhone = iti.getNumber(); 
  
  phoneInput.disabled = true;
  nameInput.placeholder = "Sprawdzanie bazy danych...";

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(rawPhone)}`);
    const data = await response.json();

    if (data.found) {
      nameInput.value = data.name;
      nameInput.disabled = true; 
      isClientApproved = true;
      
      // Разблокируем выбор услуги
      serviceSelect.disabled = false;
      document.getElementById("bookingDate").disabled = false;
      document.getElementById("rodoConsent").disabled = false;
      
      initFlatpickr(); 
    } else {
      nameInput.value = "";
      nameInput.disabled = false; 
      nameInput.placeholder = "Wpisz swoje imię i nazwisko";
      nameInput.focus();
      isClientApproved = true; 
      
      // Разблокируем выбор услуги
      serviceSelect.disabled = false;
      document.getElementById("bookingDate").disabled = false;
      document.getElementById("rodoConsent").disabled = false;
      
      initFlatpickr();
    }
  } catch (error) {
    console.error(error);
    alert("Wystąpił błąd podczas sprawdzania telefonu. Spróbuj ponownie.");
    nameInput.placeholder = "Wpisz swoje imię";
  } finally {
    phoneInput.disabled = false;
  }
}

// Инициализация календаря
function initFlatpickr() {
  if (flatpickrInstance) return; 

  flatpickrInstance = flatpickr("#bookingDate", {
    locale: "pl",
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(30), 
    disable: [
      function(date) {
        return (date.getDay() === 0); // Отключаем воскресенья (0)
      }
    ],
    onChange: function(selectedDates, dateStr) {
      if (dateStr) {
        loadFreeSlots();
      }
    }
  });
}

// Загрузка занятых и свободных слотов
async function loadFreeSlots() {
  const dateInput = document.getElementById("bookingDate");
  const container = document.getElementById("timeSlotsContainer");
  const duration = document.getElementById("selectedDuration").value;

  if (!dateInput.value) return;

  container.innerHTML = '<p style="color: #888; font-size: 14px;">Ładowanie wolnych godzin...</p>';

  try {
    // Передаем динамическую длительность выбранного zabiegu
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true&duration=${duration}`);
    allAvailableSlots = await response.json();
    
    displayTimeSlots(dateInput.value);
  } catch (error) {
    container.innerHTML = '<p style="color: red; font-size: 14px;">Błąd pobierania godzin.</p>';
    console.error(error);
  }
}

// Отображение плиток со временем
function displayTimeSlots(selectedDateStr) {
  const container = document.getElementById("timeSlotsContainer");
  container.innerHTML = "";

  // Фильтруем слоты только для выбранного дня
  const daySlots = allAvailableSlots.filter(slot => slot.startsWith(selectedDateStr));

  if (daySlots.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px; grid-column: 1/-1; text-align: center;">Brak wolnych godzin na ten dzień.</p>';
    return;
  }

  daySlots.forEach(dateTimeStr => {
    const timeOnly = dateTimeStr.split("T")[1]; // Получаем "HH:mm"
    
    const slotBtn = document.createElement("button");
    slotBtn.type = "button";
    slotBtn.className = "time-slot";
    slotBtn.innerText = timeOnly;
    slotBtn.onclick = () => selectTimeSlot(slotBtn, dateTimeStr);
    
    container.appendChild(slotBtn);
  });
}

// Выбор конкретного времени
function selectTimeSlot(buttonElement, dateTimeStr) {
  document.querySelectorAll(".time-slot").forEach(btn => btn.classList.remove("selected"));
  buttonElement.classList.add("selected");

  document.getElementById("finalDateTime").value = dateTimeStr;
  
  // Активируем кнопку подтверждения записи
  document.getElementById("submitBookingBtn").disabled = false;
}

// Обработка отправки формы
async function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBookingBtn");
  const finalDateTimeValue = document.getElementById("finalDateTime").value;
  const duration = document.getElementById("selectedDuration").value;

  if (!finalDateTimeValue) {
    alert("Proszę wybrać godzinę wizyty!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Sprawdzanie slotu...";

  try {
    // 1. МОМЕНТАЛЬНАЯ ПРОВЕРКА СЛОТА НА ЗАНЯТОСТЬ
    const checkParams = JSON.stringify({ date: finalDateTimeValue, duration: duration });
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(checkParams)}`);
    const checkData = await checkResponse.json();

    if (!checkData.isFree) {
      alert("Niestety, ta godzina została właśnie zajęta. Proszę wybrać inną godzinę.");
      // Перезагружаем слоты
      await loadFreeSlots();
      submitBtn.disabled = false;
      submitBtn.innerText = "Zarezerwuj wizytę";
      return; 
    }

    // 2. ЕСЛИ СЛОТ СВОБОДЕН — ОТПРАВЛЯЕМ ЗАПИСЬ
    submitBtn.innerText = "Zapisywanie...";
    const payload = {
      phone: iti ? iti.getNumber() : document.getElementById("clientPhone").value,
      name: document.getElementById("clientName").value,
      service: document.getElementById("serviceType").value,
      date: finalDateTimeValue,
      duration: duration // Передаем длительность процедуры на бэкенд
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Сохраняем ваш режим
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    closeBookingModal();
    // Обновляем слоты на сайте
    loadFreeSlots(); 
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
  resetBookingForm();
}

function closeBookingModalOnOutsideClick(event) {
  if (event.target.id === "bookingModal") {
    closeBookingModal();
  }
}

function resetBookingForm() {
  document.getElementById("bookingForm").reset();
  isClientApproved = false;
  
  // Приводим поля в исходное заблокированное состояние
  document.getElementById("clientName").disabled = true;
  document.getElementById("serviceType").disabled = true;
  document.getElementById("bookingDate").disabled = true;
  document.getElementById("rodoConsent").disabled = true;
  document.getElementById("submitBookingBtn").disabled = true;
  
  document.getElementById("timeSlotsContainer").innerHTML = '<p style="color: #888; font-size: 14px;">Najpierw wybierz dzień...</p>';
  document.getElementById("finalDateTime").value = "";
  document.getElementById("priceDisplay").innerText = "";
  
  if (flatpickrInstance) {
    flatpickrInstance.destroy();
    flatpickrInstance = null;
  }
}
