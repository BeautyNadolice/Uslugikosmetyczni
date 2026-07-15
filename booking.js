const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfcFEYAXHDAdR8XGSm2apyf4ThqJ3I99Z1KJhhrZCgK32dUAIeCExNFzp2oSUrBQ2Dmw/exec"; 

let iti; // Переменная для хранения объекта выбора страны

// Инициализация флагов при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl", // По умолчанию Польша
      preferredCountries: ["pl", "ua", "by", "is"], // Самые частые страны в топе списка
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    
    // При изменении номера — проверяем клиента в базе
    phoneInput.addEventListener("blur", checkExistingClient);
  }
});

// Открыть форму
function openBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

// Закрыть форму
function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Автозаполнение по телефону + вывод последнего визита
async function checkExistingClient() {
  // Получаем полный номер с кодом страны (например, +48111222333)
  const fullPhoneNumber = iti.getNumber(); 
  if (fullPhoneNumber.length < 9) return; 

  const statusEl = document.getElementById("loadingStatus");
  statusEl.style.display = "block";
  statusEl.style.color = "#666";
  statusEl.innerHTML = "Sprawdzanie danych...";

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(fullPhoneNumber)}`);
    const data = await response.json();

    if (data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      
      let statusText = "<strong>Znaleziono klienta! Dane uzupełnione.</strong>";
      
      // Если у нас есть данные о последнем визите — показываем их!
      if (data.lastVisit) {
        statusText += `<br><span style="color: #444; font-size: 0.9em;">Ostatnia wizyta: ${data.lastVisit.date} (${data.lastVisit.service})</span>`;
      }
      
      statusEl.style.color = "green";
      statusEl.innerHTML = statusText;
    } else {
      statusEl.style.color = "#777";
      statusEl.innerHTML = "Nowy klient. Wpisz imię ręcznie.";
    }
  } catch (error) {
    console.error("Błąd autouzupełniania:", error);
    statusEl.style.display = "none";
  }
}

// Отправка формы в Google
async function submitForm(event) {
  event.preventDefault();

  const submitBtn = document.querySelector(".submit-booking-btn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Wysyłanie...";

  // Берем форматированный международный номер
  const fullPhoneNumber = iti.getNumber(); 

  const payload = {
    phone: fullPhoneNumber,
    name: document.getElementById("clientName").value,
    service: document.getElementById("serviceType").value,
    date: document.getElementById("appointmentDate").value
  };

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    
    if (result.success) {
      alert("Wizyta została pomyślnie zarezerwowana!");
      document.getElementById("appointmentForm").reset();
      document.getElementById("loadingStatus").style.display = "none";
      closeBookingModal();
    } else {
      alert("Wystąpił problem z rezerwacją. Spróbuj ponownie.");
    }
  } catch (error) {
    alert("Wystąpiл błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}
