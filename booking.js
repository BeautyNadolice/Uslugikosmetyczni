const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSrELqde8dHnDlmpD7hM6CERmOm0FcwR8pgnNhQwZ_U04OfQKZgE9aHj_wo03L2wfofw/exec"; 

let iti; // Переменная для флагов стран

// Инициализация флагов стран при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("clientPhone");
  if (phoneInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "pl", // По умолчанию Польша
      preferredCountries: ["pl", "ua", "by", "is"], // Сначала самые частые страны
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
    
    // Запускаем проверку базы, когда пользователь уводит курсор с поля ввода телефона
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

// Закрыть форму при клике на темный фон вокруг нее
window.onclick = function(event) {
  const modal = document.getElementById("bookingModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

// Автозаполнение по телефону + вывод истории визита
async function checkExistingClient() {
  const fullPhoneNumber = iti.getNumber(); // Берем полный международный номер (+48...)
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
      
      // Если пришел последний визит — красиво выводим его под полем телефона
      if (data.lastVisit) {
        statusText += `<br><span style="color: #2e7d32; font-size: 0.9em; display: inline-block; margin-top: 4px;">Ostatnia wizyta: ${data.lastVisit.date} (${data.lastVisit.service})</span>`;
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

// Отправка формы в базу данных и календарь Google
async function submitForm(event) {
  event.preventDefault();

  const submitBtn = document.querySelector(".submit-booking-btn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Wysyłanie...";

  const fullPhoneNumber = iti.getNumber(); // Полный номер с кодом страны

  const payload = {
    phone: fullPhoneNumber,
    name: document.getElementById("clientName").value,
    service: document.getElementById("serviceType").value,
    date: document.getElementById("appointmentDate").value
  };

  try {
    // Отправляем POST запрос в режиме no-cors, чтобы обойти блокировки браузера
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    // Поскольку при no-cors мы не можем прочитать ответ сервера,
    // но если fetch не упал в ошибку — значит запрос успешно ушел в Google Таблицу!
    alert("Wizyta została pomyślnie zarezerwowana!");
    document.getElementById("appointmentForm").reset();
    document.getElementById("loadingStatus").style.display = "none";
    closeBookingModal();
    
  } catch (error) {
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}
