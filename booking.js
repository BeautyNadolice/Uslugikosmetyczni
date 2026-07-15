const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOymjhYgQXmgROTxvjGKV_ZAJFZ9vhweNdYUG1dXGj7W7dndhER7g3hxsxOEr7OwdZ0g/exec"; 

let iti; 
let busySlots = []; // Глобальный массив для хранения занятого времени

document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("clientPhone");
  const dateInput = document.getElementById("appointmentDate");

  // 1. Инициализация флагов стран
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl",
      preferredCountries: ["pl", "ua", "by", "is"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    phoneInput.addEventListener("blur", checkExistingClient);
  }

  // 2. Загружаем занятые слоты из Google при открытии страницы
  loadBusySlots();

  // 3. Блокировка выбора занятого времени
  if (dateInput) {
    dateInput.addEventListener("change", function() {
      const selectedDateTime = this.value; // формат "YYYY-MM-DDTHH:MM"
      
      if (busySlots.includes(selectedDateTime)) {
        alert("Ten termin jest już zajęty! Proszę wybrać inną godzinę.");
        this.value = ""; // Сбрасываем выбор
      }
    });
  }
});

// Загрузка занятых интервалов из Google Apps Script
async function loadBusySlots() {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?checkBusy=true`);
    busySlots = await response.json(); 
  } catch (e) {
    console.error("Ошибка загрузки занятых слотов:", e);
  }
}

// Открытие модального окна
function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.style.display = "flex";
}

// Закрытие модального окна
function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.style.display = "none";
