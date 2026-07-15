// Вставь сюда URL веб-приложения, который ты скопировал на Шаге 2 (в кавычках)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfcFEYAXHDAdR8XGSm2apyf4ThqJ3I99Z1KJhhrZCgK32dUAIeCExNFzp2oSUrBQ2Dmw/exec";

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

// Закрыть при клике на серый фон вокруг формы
window.onclick = function(event) {
  const modal = document.getElementById("bookingModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

// Автозаполнение по телефону
async function checkExistingClient() {
  const phoneInput = document.getElementById("clientPhone").value.trim();
  if (phoneInput.length < 9) return; 

  const statusEl = document.getElementById("loadingStatus");
  statusEl.style.display = "block";
  statusEl.style.color = "#666";
  statusEl.innerText = "Sprawdzanie danych...";

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?phone=${encodeURIComponent(phoneInput)}`);
    const data = await response.json();

    if (data.found && data.name) {
      document.getElementById("clientName").value = data.name;
      statusEl.style.color = "green";
      statusEl.innerText = "Znaleziono klienta! Dane uzupełnione.";
    } else {
      statusEl.style.color = "#777";
      statusEl.innerText = "Nowy klient. Wpisz imię ręcznie.";
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

  const payload = {
    phone: document.getElementById("clientPhone").value,
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
    alert("Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Zarezerwuj wizytę";
  }
}
