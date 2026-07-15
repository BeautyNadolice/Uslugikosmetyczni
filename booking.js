const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6jc0ZJuCUVnFrXJ2Mqhec4NrNI7wu4N1g2lQyWhJHwlcfh9PKxFs1x2xVMelROfzPQQ/exec"; 

let iti; 

document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("clientPhone");
  
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl",
      preferredCountries: ["pl", "ua", "by", "is"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    phoneInput.addEventListener("blur", checkExistingClient);
  }

  // Загружаем свободные слоты при загрузке страницы
  loadFreeSlots();
});

// Загрузка свободных слотов в выпадающий список
async function loadFreeSlots() {
  const select = document.getElementById("appointmentTime");
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    const slots = await response.json(); 
    
    select.innerHTML = '<option value="">-- Wybierz wolny termin --</option>';
    slots.forEach(slot => {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot.replace('T', ' '); // Красивый вывод даты и времени
      select.appendChild(option);
    });
  } catch (e) {
    console.error("Ошибка загрузки слотов:", e);
  }
}

function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.style.display = "flex";
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.style.display = "none";
}

// Автозаполнение клиента
async function checkExistingClient() {
  const fullPhoneNumber = iti.getNumber();
  if (fullPhoneNumber.length < 9) return;

  const statusEl = document.getElementById("loadingStatus");
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

// Отправка формы
async function submitForm(event) {
  event.preventDefault();

  const timeSelect = document.getElementById("appointmentTime");
  const submitBtn = document.querySelector(".submit-booking-btn");
  
  submitBtn.disabled = true;
  submitBtn.innerText = "Wysyłanie...";

  const payload = {
    phone: iti.getNumber(),
    name: document.getElementById("clientName").value,
    service: document.getElementById("serviceType").value,
    date: timeSelect.value // Берем выбранное время из списка
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    alert("Wizyta została pomyślnie zarezerwowana!");
    location.reload(); 
  } catch (error) {
    alert("Wystąpił błąd. Spróbuj ponownie.");
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}
// Функция обновления цены при выборе услуги
function updatePrice() {
    const serviceSelect = document.getElementById("serviceType");
    const priceDisplay = document.getElementById("priceDisplay");
    const selectedService = serviceSelect.value;

    let foundPrice = "";
    // Ищем цену в массиве cennikData из prices.js
    cennikData.forEach(cat => {
        cat.items.forEach(item => {
            if (item.name === selectedService) foundPrice = item.price;
        });
    });
    priceDisplay.innerText = foundPrice ? "Cena: " + foundPrice : "";
}

// Заполнение выпадающего списка при старте
document.addEventListener("DOMContentLoaded", () => {
    const serviceSelect = document.getElementById("serviceType");
    
    // Очищаем и заполняем
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
    
    loadFreeSlots();
});
