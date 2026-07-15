const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1tGRUXQeBZcU9qx9f8z9TPvMwxx9Dk3jLeiNDSJS6J3Hn8ugvtccB0-Owipd6bXX_RA/exec";
let iti; 
let allAvailableSlots = []; 
let flatpickrInstance = null;
let isClientApproved = false; // Флаг: найден ли клиент в базе данных

document.addEventListener("DOMContentLoaded", () => {
  // 1. Сначала железно настраиваем ввод телефона, чтобы он работал независимо от внешних сервисов
  initPhoneInput();

  // 2. И только потом пробуем загрузить прайс-лист из Google Таблицы
  loadServicesAndPriceList();
});

// Инициализация ввода телефона
function initPhoneInput() {
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    try {
      iti = window.intlTelInput(phoneInput, {
        initialCountry: "pl",
        preferredCountries: ["pl", "ua", "by"],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
      });
      
      // Проверка при потере фокуса (кликнули мимо поля)
      phoneInput.addEventListener("blur", checkExistingClient);
      
      // Проверка при нажатии Enter
      phoneInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          checkExistingClient();
        }
      });

      // Сброс при изменении номера
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
      
      console.log("Поле телефона успешно инициализировано.");
    } catch (err) {
      console.error("Ошибка инициализации телефона:", err);
    }
  }
}

// Безопасная загрузка услуг из Google Таблицы
async function loadServicesAndPriceList() {
  const serviceSelect = document.getElementById("serviceType");
  const priceListContainer = document.getElementById("priceListContainer");
  
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?getPrices=true`);
    if (!response.ok) throw new Error("Сеть ответила с ошибкой");
    const prices = await response.json();
    
    // Очищаем и разблокируем только при успешном получении данных
    if (prices && prices.length > 0) {
      // 1. Заполняем выпадающий список
      serviceSelect.innerHTML = '<option value="" disabled selected>-- Wybierz zabieg --</option>';
      prices.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.name;
        
        let durationText = item.showDuration ? ` (${item.duration} min)` : '';
        let priceText = item.showPrice ? ` - ${item.price} zł` : '';
        opt.textContent = `${item.name}${durationText}${priceText}`;
        
        opt.dataset.price = item.price;
        opt.dataset.duration = item.duration;
        opt.dataset.showPrice = item.showPrice;
        opt.dataset.showDuration = item.showDuration;
        serviceSelect.appendChild(opt);
      });

      // 2. Строим прайс-лист на самом сайте
      if (priceListContainer) {
        priceListContainer.innerHTML = "";
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
    }
  } catch (error) {
    console.error("Błąd ładowania usług:", error);
    // Используем дефолтные значения, если Google Таблица недоступна
    if (serviceSelect) {
      serviceSelect.innerHTML = '<option value="" disabled selected>Wybierz zabieg...</option>';
    }
    if (priceListContainer) {
      priceListContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Użyj przycisku rezerwacji, aby wybrać usługę.</p>';
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
    const durationVal = selectedOption.dataset.duration || "45";

    document.getElementById("selectedDuration").value = durationVal;

    let displayTxt = "";
    if (showPrice && priceVal) displayTxt += `Cena: ${priceVal} zł`;
    if (showDuration && durationVal) displayTxt += displayTxt ? ` | Czas: ${durationVal} min` : `Czas: ${durationVal} min`;
    
    priceDisplay.innerText = displayTxt;

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

  const rawPhone = iti ? iti.getNumber() : phoneInput.value; 
  
  phoneInput.disabled = true;
  nameInput.placeholder = "Sprawdzanie bazy danych...";

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(rawPhone)}`);
    const data = await response.json();

    if (data.found) {
      nameInput.value = data.name;
      nameInput.disabled = true; 
      isClientApproved = true;
      
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
      
      serviceSelect.disabled = false;
      document.getElementById("bookingDate").disabled = false;
      document.getElementById("rodoConsent").disabled = false;
      
      initFlatpickr();
    }
  } catch (error) {
    console.error(error);
    // Если скрипт упал или не развернут, всё равно даем пользователю ввести имя и записаться (отказоустойчивость!)
    nameInput.disabled = false;
    nameInput.placeholder = "Wpisz swoje imię";
    serviceSelect.disabled = false;
    document.getElementById("bookingDate").disabled = false;
    document.getElementById("rodoConsent").disabled = false;
    initFlatpickr();
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
        return (date.getDay() === 0); 
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
  const duration = document.getElementById("selectedDuration").value || "45";

  if (!dateInput.value) return;

  container.innerHTML = '<p style="color: #888; font-size: 14px;">Ładowanie wolnych godzin...</p>';

  try {
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

  const daySlots = allAvailableSlots.filter(slot => slot.startsWith(selectedDateStr));

  if (daySlots.length === 0) {
    container.innerHTML = '<p style="color: red; font-size: 14px; grid-column: 1/-1; text-align: center;">Brak wolnych godzin na ten dzień.</p>';
    return;
  }

  daySlots.forEach(dateTimeStr => {
    const timeOnly = dateTimeStr.split("T")[1]; 
    
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
  document.getElementById("submitBookingBtn").disabled = false;
}

// Обработка отправки формы
async function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBookingBtn");
  const finalDateTimeValue = document.getElementById("finalDateTime").value;
  const duration = document.getElementById("selectedDuration").value || "45";

  if (!finalDateTimeValue) {
    alert("Proszę wybrać godzinę wizyty!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerText = "Sprawdzanie slotu...";

  try {
    const checkParams = JSON.stringify({ date: finalDateTimeValue, duration: duration });
    const checkResponse = await fetch(`${APPS_SCRIPT_URL}?checkSingleSlot=${encodeURIComponent(checkParams)}`);
    const checkData = await checkResponse.json();

    if (!checkData.isFree) {
      alert("Niestety, ta godzina została właśnie zajęta. Proszę wybrać inną godzinę.");
      await loadFreeSlots();
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
      duration: duration 
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
