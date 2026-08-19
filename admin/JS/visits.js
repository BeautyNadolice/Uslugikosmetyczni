/* ==========================================================================
   VIS. WIZYTY I PRAWY PANEL
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- VIS.1. appointmentsData (oryginalna linia 24) ----- */
let appointmentsData = [];

/* ----- VIS.2. currentEditingAppointment (oryginalna linia 30) ----- */
let currentEditingAppointment = null;

/* ----- VIS.3. isDeletingAppointment (oryginalna linia 36) ----- */
let isDeletingAppointment = false;

/* ----- VIS.4. isSavingAppointment (oryginalna linia 37) ----- */
let isSavingAppointment = false;

/* ----- VIS.5. renderAppointmentCard (oryginalna linia 998) ----- */
/* ==========================================================
   EVENT CARD
   ========================================================== */

function renderAppointmentCard(app,container){

    const card =
        document.createElement("div");

    card.className =
        "booksy-event-card";

    let color =
        "#b05c75";

    const isBlock = app.eventType === "block";
    const isWorkShift = app.eventType === "work_shift";

    const isExternal =
        app.eventType === "external" ||
        (app.phone === "Google Calendar" && !isBlock && !isWorkShift);

    if (isBlock) {
        color = "#8c6b4f";
        card.classList.add("booksy-block-card");
    }
    else if(isExternal){
        color = "#555555";
    }
    else if(isWorkShift){
        color = "#f2c94c";
        card.style.color = "#111";
        card.classList.add("booksy-work-shift-card");
    }
    else{

        const service =
            currentServices.find(
                s =>
                s.name &&
                app.service &&
                s.name.trim()
                .toLowerCase()
                ===
                app.service.trim()
                .toLowerCase()
            );

        if(
            service &&
            globalColors[
                service.category
            ]
        ){

            color =
                globalColors[
                    service.category
                ];

        }

    }

    card.style.background =
        color;

    if (isWorkShift) {
        card.innerHTML = `<strong>${app.name || "Brak"}</strong>`;
        card.onclick = null;
        card.style.cursor = "default";
    } else {
        card.innerHTML = `
            <strong>${app.name}</strong>
            <br>
            ${app.service}
            <br>
            ${app.date}
        `;
        card.onclick = () => openAppointmentDetailsModal(app);
    }

    container.appendChild(
        card
    );

}

/* ----- VIS.6. populateAppointmentDropdowns (oryginalna linia 1086) ----- */
/* ==========================================================
   APPOINTMENT AUTOCOMPLETE / DATALISTS
   ========================================================== */

function populateAppointmentDropdowns() {

    populateAppointmentDatalists();

}

/* ----- VIS.7. populateAppointmentDatalists (oryginalna linia 1092) ----- */
function populateAppointmentDatalists() {

    populateClientNameDatalist();

    populateClientPhoneDatalist();

    populateServiceNameDatalist();

}

/* ----- VIS.8. handleAppointmentNameInput (oryginalna linia 1248) ----- */
function handleAppointmentNameInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedName =
        nameInput.value
            .trim()
            .toLowerCase();

    if (!typedName) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.name &&
                item.name
                    .toString()
                    .trim()
                    .toLowerCase() === typedName
            );
        });

    if (client) {
        phoneInput.value =
            client.phone || "";
    }

}

/* ----- VIS.9. handleAppointmentPhoneInput (oryginalna linia 1291) ----- */
function handleAppointmentPhoneInput() {

    const nameInput =
        document.getElementById(
            "appointmentName"
        );

    const phoneInput =
        document.getElementById(
            "appointmentPhone"
        );

    if (!nameInput || !phoneInput) {
        return;
    }

    const typedPhone =
        phoneInput.value.trim();

    if (!typedPhone) {
        return;
    }

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone
                    .toString()
                    .trim() === typedPhone
            );
        });

    if (client) {
        nameInput.value =
            client.name || "";
    }

}

/* ----- VIS.10. handleAppointmentServiceInput (oryginalna linia 1331) ----- */
function handleAppointmentServiceInput() {

    const serviceInput =
        document.getElementById(
            "appointmentService"
        );

    const durationInput =
        document.getElementById(
            "appointmentDuration"
        );

    if (!serviceInput || !durationInput) {
        return;
    }

    const typedService =
        serviceInput.value
            .trim()
            .toLowerCase();

    if (!typedService) {
        return;
    }

    const service =
        currentServices.find(item => {
            return (
                item.name &&
                item.name
                    .toString()
                    .trim()
                    .toLowerCase() === typedService
            );
        });

    if (service) {
        durationInput.value =
            service.duration || 45;
    }

}

/* ----- VIS.11. saveAppointment (oryginalna linia 1376) ----- */
/* ==========================================================
   CREATE APPOINTMENT
   ========================================================== */
async function saveAppointment() {

    if (isSavingAppointment) {
        return;
    }

    const name =
        document.getElementById(
            "appointmentName"
        ).value.trim();

    const phone =
        document.getElementById(
            "appointmentPhone"
        ).value.trim();

    const service =
        document.getElementById(
            "appointmentService"
        ).value.trim();

    const duration =
        Number(
            document.getElementById(
                "appointmentDuration"
            ).value
        ) || 45;

    const dateValue =
        document.getElementById(
            "appointmentDateTime"
        ).value;

    if (
        !name ||
        !phone ||
        !service ||
        !dateValue
    ) {
        alert(
            "Uzupełnij wszystkie pola wizyty."
        );
        return;
    }

    const saveBtn =
        document.getElementById(
            "saveAppointmentBtn"
        );

    isSavingAppointment = true;

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText =
            currentEditingAppointment
                ? "Aktualizowanie..."
                : "Zapisywanie...";
    }

    const payload = {
        action:
        "createBooking",

        bookingSource:
        "ADMIN",

        phone:
        phone,

        name:
        name,

        service:
        service,

        date:
        dateValue,

        duration:
        duration,

        rodo:
        currentEditingAppointment
            ? "Edytowano z CRM"
            : "Dodano z CRM"
    };

    /*
     * Rezerwacja uruchomiona ze Skrzynki ADMIN.
     * ID zgłoszenia jedzie w tym samym żądaniu co zapis wizyty,
     * więc zgłoszenie zostanie oznaczone OBSŁUŻONE dopiero po sukcesie.
     */
    const pendingContactRequest =
        (!currentEditingAppointment &&
         window.crmPendingContactRequestForBooking &&
         window.crmPendingContactRequestForBooking.id)
            ? window.crmPendingContactRequestForBooking
            : null;

    if (pendingContactRequest) {
        payload.contactRequestId = pendingContactRequest.id;
        payload.bookingSource = "FORM_FIRST";
        payload.sourceRequestId = pendingContactRequest.id;
    } else if (!currentEditingAppointment) {
        payload.bookingSource = "ADMIN";
    }

    if (
        currentEditingAppointment
    ) {

        const oldEventId =
            currentEditingAppointment.eventId || "";

        if (
            !oldEventId
        ) {
            alert(
                "Nie można edytować wizyty, bo brakuje Event ID. Odśwież kalendarz i spróbuj ponownie."
            );

            isSavingAppointment = false;

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = "Zapisz wizytę";
            }

            return;
        }

        payload.editFlag =
            true;

        payload.oldEventId =
            oldEventId;

        payload.oldDate =
            currentEditingAppointment.date;

        payload.oldName =
            currentEditingAppointment.name;

    }

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify(
                        payload
                    )
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            const successMessage =
                currentEditingAppointment
                    ? "Wizyta została zaktualizowana."
                    : "Wizyta została dodana.";

            currentEditingAppointment =
                null;

            /*
             * Po sukcesie zamykamy formularz bez pytania o niezapisane zmiany.
             * Wcześniej asynchroniczna ochrona formularza mogła zostawić modal
             * widoczny mimo poprawnego zapisu.
             */
            await closeCreateAppointmentModal(true);

            if (pendingContactRequest) {
                window.crmPendingContactRequestForBooking = null;

                // Skrzynka odświeża się w tle; nie blokuje zamknięcia modala.
                Promise.resolve().then(() => {
                    if (typeof crmLoadUnifiedInbox === "function") {
                        return crmLoadUnifiedInbox({ silent: true, force: true });
                    }
                    return null;
                }).catch(error => console.error("Odświeżanie Skrzynki po zapisie wizyty:", error));
            }

            if (typeof crmToast === "function") {
                crmToast(successMessage);
            }

            await loadSettings();
            if (typeof crmRememberAppointmentsAsSeen === "function") crmRememberAppointmentsAsSeen();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd zapisu wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas zapisu wizyty."
        );

    } finally {

        isSavingAppointment = false;

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = "Zapisz wizytę";
        }

    }

}

/* ----- VIS.12. openEditAppointmentModal (oryginalna linia 1628) ----- */
function openEditAppointmentModal() {

    if (isDeletingAppointment) {
        return;
    }

    if (currentEditingAppointment && currentEditingAppointment.eventType === "block") {
        openEditBlockTimeModal(currentEditingAppointment);
        return;
    }

    if (!currentEditingAppointment) {
        alert(
            "Nie wybrano wizyty do edycji."
        );
        return;
    }

    populateAppointmentDropdowns();

    document.getElementById(
        "modalTitleAppointment"
    ).innerText =
        "Edytuj wizytę";

    document.getElementById(
        "appointmentName"
    ).value =
        currentEditingAppointment.name || "";

    document.getElementById(
        "appointmentPhone"
    ).value =
        currentEditingAppointment.phone || "";

    document.getElementById(
        "appointmentService"
    ).value =
        currentEditingAppointment.service || "";

    document.getElementById(
        "appointmentDuration"
    ).value =
        currentEditingAppointment.duration || 45;

    document.getElementById(
        "appointmentDateTime"
    ).value =
        formatDateTimeLocalValue(
            currentEditingAppointment.date
        );

    closeAppointmentModal();

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "flex";

}

/* ----- VIS.13. closeCreateAppointmentModal (oryginalna linia 1728) ----- */
function crmAppointmentFormHasUnsavedChanges() {
    const value = id => {
        const element = document.getElementById(id);
        return element ? String(element.value || "").trim() : "";
    };

    /* Pola tekstowe i data oznaczaja rzeczywiste rozpoczecie formularza. */
    if (value("appointmentName")) return true;
    if (value("appointmentPhone")) return true;
    if (value("appointmentService")) return true;
    if (value("appointmentDateTime")) return true;
    if (value("appointmentDate")) return true;

    /* Domyslny czas trwania nowej wizyty to 45 minut. */
    const duration = value("appointmentDuration");
    if (duration && duration !== "45") return true;

    /* W rozdzielonym wyborze godziny domyslne wartosci to 12:00. */
    const hour = value("appointmentHour");
    const minute = value("appointmentMinute");
    if (hour && hour !== "12") return true;
    if (minute && minute !== "00" && minute !== "0") return true;

    return false;
}

async function closeCreateAppointmentModal(forceClose) {
    const modal = document.getElementById("appointmentModal");
    if (!modal || modal.style.display === "none") return;

    const mayCloseImmediately =
        forceClose === true ||
        isSavingAppointment ||
        isDeletingAppointment ||
        !crmAppointmentFormHasUnsavedChanges();

    if (!mayCloseImmediately) {
        const message = "Masz niezapisane zmiany. Czy na pewno chcesz zamknąć formularz?";
        const confirmed = typeof crmConfirm === "function"
            ? await crmConfirm(message, "Niezapisane zmiany")
            : window.confirm(message);
        if (!confirmed) return;
    }

    modal.style.display = "none";
    if (!isSavingAppointment && window.crmPendingContactRequestForBooking) {
        window.crmPendingContactRequestForBooking = null;
    }
    if (!isSavingAppointment && window.crmPendingFirstVisitRequestForBooking) {
        window.crmPendingFirstVisitRequestForBooking = null;
        if (typeof window.crmFirstVisitClearSelectionModeV8 === "function") {
            window.crmFirstVisitClearSelectionModeV8();
        }
    }
}

/* ----- VIS.14. openAppointmentDetailsModal (oryginalna linia 1741) ----- */
/* ==========================================================
   DETAILS MODAL
   ========================================================== */

function openAppointmentDetailsModal(app){
    currentEditingAppointment = app;
    const isBlock = app.eventType === "block";
    const isExternal = app.eventType === "external";
    const isWorkShift = app.eventType === "work_shift";
    setText("appointmentDetailsTitle", isWorkShift ? "Szczegóły grafiku pracy" : (isBlock ? "Szczegóły blokady czasu" : (isExternal ? "Szczegóły wydarzenia zewnętrznego" : "Szczegóły rezerwacji")));
    setText("details-name-label", isWorkShift ? "Wpis grafiku:" : (isBlock ? "Nazwa blokady:" : "Klient:"));
    setText("details-service-label", isWorkShift ? "Rodzaj:" : (isBlock ? "Typ:" : "Zabieg:"));
    setText("details-name", app.name || "");
    setText("details-phone", app.phone || "");
    setText("details-service", app.service || "");
    setText("details-datetime", app.date || "");
    setText("details-duration", app.duration || 45);
    const phoneRow = document.getElementById("details-phone-row");
    if (phoneRow) phoneRow.style.display = (isBlock || isWorkShift) ? "none" : "block";
    const deleteBtn = document.getElementById("deleteAppointmentBtn");
    const editBtn = document.getElementById("editAppointmentBtn");
    if (deleteBtn) {
        deleteBtn.style.display = (isExternal || isWorkShift) ? "none" : "inline-block";
        deleteBtn.innerText = isBlock ? "Usuń blokadę 🗑️" : "Usuń wizytę 🗑️";
    }
    if (editBtn) {
        editBtn.style.display = (isExternal || isWorkShift) ? "none" : "inline-block";
        editBtn.innerText = isBlock ? "Edytuj blokadę" : "Edytuj wizytę";
    }
    document.getElementById("appointmentDetailsModal").style.display = "flex";
}

/* ----- VIS.15. closeAppointmentModal (oryginalna linia 1765) ----- */
function closeAppointmentModal(){

    document.getElementById(
        "appointmentDetailsModal"
    ).style.display =
        "none";

}

/* ----- VIS.16. deleteBlockTimeFromAdmin (oryginalna linia 1783) ----- */
async function deleteBlockTimeFromAdmin() {
    if (!currentEditingAppointment || currentEditingAppointment.eventType !== "block") return alert("Nie wybrano blokady czasu.");
    if (isDeletingAppointment || !confirm("Usunąć wybraną blokadę czasu?")) return;
    const block = currentEditingAppointment;
    const btn = document.getElementById("deleteAppointmentBtn");
    isDeletingAppointment = true;
    if (btn) { btn.disabled = true; btn.innerText = "Usuwanie blokady..."; }
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST", headers: {"Content-Type":"text/plain"},
            body: JSON.stringify({action:"deleteBlockTime", eventId:block.eventId||"", start:block.date||"", end:block.endDate||"", title:block.name||""})
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Nieznany błąd");
        appointmentsData = appointmentsData.filter(x => !(block.eventId && x.eventId === block.eventId));
        currentEditingAppointment = null;
        closeAppointmentModal();
        await loadSettings();
        alert("Blokada czasu została usunięta.");
    } catch(error) { console.error(error); alert("Błąd usuwania blokady czasu: " + (error.message || error)); }
    finally { isDeletingAppointment = false; if (btn) {btn.disabled=false;btn.innerText="Usuń blokadę 🗑️";} }
}

/* ----- VIS.17. deleteAppointmentFromAdmin (oryginalna linia 1810) ----- */
/* ==========================================================
   DELETE FIX
   ========================================================== */

async function deleteAppointmentFromAdmin() {

    if (
        !currentEditingAppointment
    ) {
        return;
    }

    if (
        isDeletingAppointment
    ) {
        return;
    }

    if (
        !confirm(
            "Usunąć wizytę?"
        )
    ) {
        return;
    }

    const deleteBtn =
        document.getElementById(
            "deleteAppointmentBtn"
        );
const editBtn =
    document.getElementById(
        "editAppointmentBtn"
    );
    isDeletingAppointment =
        true;

    if (
        deleteBtn
    ) {
        deleteBtn.disabled =
            true;

        deleteBtn.innerText =
            "Usuwanie...";
    }
if (
    editBtn
) {
    editBtn.disabled =
        true;

    editBtn.innerText =
        "Edycja zablokowana";
}
    const appointmentToDelete =
        currentEditingAppointment;

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",

                    headers: {
                        "Content-Type":
                        "text/plain"
                    },

                    body:
                    JSON.stringify({
                        action:
                        "createBooking",

                        deleteFlag:
                        true,

                        eventId:
                        appointmentToDelete.eventId || "",

                        date:
                        new Date(
                            appointmentToDelete.date
                        )
                        .toISOString(),

                        name:
                        appointmentToDelete.name
                    })
                }
            );

        const data =
            await response.json();

        if (
            data.success
        ) {

            const deletedEventId =
                appointmentToDelete.eventId || "";

            const deletedDate =
                appointmentToDelete.date || "";

            const deletedName =
                appointmentToDelete.name || "";

            appointmentsData =
                appointmentsData.filter(app => {

                    if (
                        deletedEventId &&
                        app.eventId === deletedEventId
                    ) {
                        return false;
                    }

                    if (
                        !deletedEventId &&
                        app.date === deletedDate &&
                        app.name === deletedName
                    ) {
                        return false;
                    }

                    return true;

                });

            currentEditingAppointment =
                null;

            closeAppointmentModal();

            closeCreateAppointmentModal();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

            alert(
                "Wizyta usunięta."
            );

            await loadSettings();

            renderBooksyCalendar();

            renderDashboard();

            calculateFinanceReport();

        } else {

            alert(
                "Błąd usuwania wizyty: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );

        }

    } catch(error) {

        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas usuwania wizyty."
        );

    } finally {

        isDeletingAppointment =
            false;

        if (
            deleteBtn
        ) {
            deleteBtn.disabled =
                false;

            deleteBtn.innerText =
                "Usuń wizytę 🗑️";
        }
if (
    editBtn
) {
    editBtn.disabled =
        false;

    editBtn.innerText =
        "Edytuj wizytę";
}
    }

}

/* ----- VIS.18. openBlockTimeModal (oryginalna linia 2018) ----- */
/* ==========================================================
   BLOCK TIME
   ========================================================== */

function openBlockTimeModal() {

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    if (blockDateInput) {
        blockDateInput.value =
            getFormattedISOBlockDate(
                selectedCalendarDate
            );
    }

    if (blockTypeInput) {
        blockTypeInput.value =
            "hours";
    }

    if (blockStartInput) {
        blockStartInput.value =
            "09:00";
    }

    if (blockEndInput) {
        blockEndInput.value =
            "18:00";
    }

    if (blockTitleInput) {
        blockTitleInput.value =
            "Zablokowane";
    }

    toggleBlockTimeFields();

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "flex";

}

function crmLocalBlockParts(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return {date:"", time:""};
    const pad = number => String(number).padStart(2, "0");
    return {
        date: date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()),
        time: pad(date.getHours()) + ":" + pad(date.getMinutes())
    };
}

function openEditBlockTimeModal(block) {
    if (!block || block.eventType !== "block") return;
    const start = crmLocalBlockParts(block.date);
    const end = crmLocalBlockParts(block.endDate || new Date(new Date(block.date).getTime() + Number(block.duration || 60) * 60000));

    closeAppointmentModal();
    const dateInput = document.getElementById("block-date");
    const typeInput = document.getElementById("block-type");
    const startInput = document.getElementById("block-start-time");
    const endInput = document.getElementById("block-end-time");
    const titleInput = document.getElementById("block-title");
    const submitBtn = document.getElementById("blockTimeSubmitBtn");

    if (dateInput) dateInput.value = start.date;
    if (typeInput) typeInput.value = "hours";
    if (startInput) startInput.value = start.time;
    if (endInput) endInput.value = end.time;
    if (titleInput) titleInput.value = block.name || "Zablokowane";
    if (submitBtn) submitBtn.innerText = "Zapisz blokadę";
    toggleBlockTimeFields();
    document.getElementById("blockTimeModal").style.display = "flex";
}

/* ----- VIS.19. closeBlockTimeModal (oryginalna linia 2082) ----- */
function closeBlockTimeModal() {

    document.getElementById(
        "blockTimeModal"
    ).style.display =
        "none";

}

/* ----- VIS.20. toggleBlockTimeFields (oryginalna linia 2092) ----- */
function toggleBlockTimeFields() {

    const blockType =
        document.getElementById(
            "block-type"
        ).value;

    const group =
        document.getElementById(
            "block-hours-group"
        );

    if (!group) {
        return;
    }

    group.style.display =
        blockType === "hours"
            ? "block"
            : "none";

}

/* ----- VIS.21. submitBlockTime (oryginalna linia 2116) ----- */
async function submitBlockTime() {
    if (isBlockingTime) {
        return;
    }

    const blockTypeInput =
        document.getElementById(
            "block-type"
        );

    const blockDateInput =
        document.getElementById(
            "block-date"
        );

    const blockStartInput =
        document.getElementById(
            "block-start-time"
        );

    const blockEndInput =
        document.getElementById(
            "block-end-time"
        );

    const blockTitleInput =
        document.getElementById(
            "block-title"
        );

    const blockType =
        blockTypeInput
            ? blockTypeInput.value
            : "hours";

    const blockDate =
        blockDateInput
            ? blockDateInput.value
            : "";

    const blockStart =
        blockStartInput
            ? blockStartInput.value
            : "09:00";

    const blockEnd =
        blockEndInput
            ? blockEndInput.value
            : "18:00";

    const blockTitle =
        blockTitleInput
            ? blockTitleInput.value.trim()
            : "Zablokowane";

    if (!blockDate) {
        alert(
            "Wybierz datę blokady."
        );
        return;
    }

    if (
        blockType === "hours" &&
        (
            !blockStart ||
            !blockEnd
        )
    ) {
        alert(
            "Wybierz godzinę rozpoczęcia i zakończenia."
        );
        return;
    }

    if (
        blockType === "hours" &&
        blockStart >= blockEnd
    ) {
        alert(
            "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia."
        );
        return;
    }

    const submitBtn =
        document.getElementById(
            "blockTimeSubmitBtn"
        );

    isBlockingTime = true;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Blokowanie...";
    }

    try {
        const response =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method:
                    "POST",
                    headers: {
                        "Content-Type":
                        "text/plain"
                    },
                    body:
                    JSON.stringify({
                        action:
                        currentEditingAppointment && currentEditingAppointment.eventType === "block"
                            ? "updateBlockTime"
                            : "blockTime",
                        eventId:
                        currentEditingAppointment && currentEditingAppointment.eventType === "block"
                            ? (currentEditingAppointment.eventId || "")
                            : "",
                        blockType:
                        blockType,
                        date:
                        blockDate,
                        startTime:
                        blockStart,
                        endTime:
                        blockEnd,
                        title:
                        blockTitle || "Zablokowane"
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {
            const wasEditingBlock = currentEditingAppointment && currentEditingAppointment.eventType === "block";
            if (typeof crmToast === "function") {
                crmToast(wasEditingBlock ? "Blokada została zaktualizowana." : "Czas został zablokowany.");
            }
            currentEditingAppointment = null;
            closeBlockTimeModal();

            await loadSettings();

            renderBooksyCalendar();
            renderDashboard();
            calculateFinanceReport();
        } else {
            alert(
                "Błąd blokowania czasu: " +
                (
                    data.error ||
                    "Nieznany błąd"
                )
            );
        }
    } catch(error) {
        console.error(
            error
        );

        alert(
            "Błąd połączenia podczas blokowania czasu."
        );
    } finally {
        isBlockingTime = false;

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Zablokuj czas 🔒";
        }
    }
}

/* ----- VIS.22. recordAppointmentLifecycle (oryginalna linia 3659) ----- */
async function recordAppointmentLifecycle(options) {
    const response = await crmExtendedPost("recordAppointmentLifecycle", options || {});
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zapisać historii wizyty");
    }

    /*
     * Nie odświeżamy tutaj całego CRM. Funkcja jest używana przez kilka
     * operacji cyklu życia wizyty, a ciężkie loadSystem() powodowało
     * podwójne pobieranie danych i ponad 30 sekund oczekiwania.
     * Widok odświeża funkcja wywołująca, zależnie od rodzaju operacji.
     */
    return response;
}

/* ----- VIS.23. cancelAppointmentWithHistory (oryginalna linia 3668) ----- */
async function cancelAppointmentWithHistory(initiator, reason) {
    if (!currentEditingAppointment) return;
    if (!confirm("Anulować wizytę i zapisać zdarzenie w historii?")) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ANULOWANIE",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: initiator || "MISTRZYNI",
            reason: reason || "",
            deleteCalendarEvent: true
        });
        closeAppointmentModal();
        alert("Wizyta została anulowana, a zdarzenie zapisane w historii.");
    } catch (error) {
        alert("Błąd anulowania wizyty: " + (error.message || error));
    }
}

/* ----- VIS.24. completeCurrentAppointment (oryginalna linia 3690) ----- */
async function completeCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "ZREALIZOWANA",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "MISTRZYNI"
        });
        closeAppointmentModal();
        alert("Wizyta została oznaczona jako zrealizowana.");
    } catch (error) {
        alert("Błąd zmiany statusu: " + (error.message || error));
    }
}

/* ----- VIS.25. markCurrentAppointmentNoShow (oryginalna linia 3709) ----- */
async function markCurrentAppointmentNoShow() {
    if (!currentEditingAppointment) return;
    try {
        await recordAppointmentLifecycle({
            operation: "NIEOBECNOSC",
            eventId: currentEditingAppointment.eventId || "",
            phone: currentEditingAppointment.phone || "",
            clientName: currentEditingAppointment.name || "",
            service: currentEditingAppointment.service || "",
            oldDate: currentEditingAppointment.date || "",
            initiator: "KLIENT"
        });
        closeAppointmentModal();
        alert("Nieobecność została zapisana.");
    } catch (error) {
        alert("Błąd zapisu nieobecności: " + (error.message || error));
    }
}

/* ----- VIS.26. getSmartNextVisitSuggestion (oryginalna linia 3728) ----- */
async function getSmartNextVisitSuggestion(phone, service, baseDate, preference) {
    const response = await crmExtendedPost("getSmartNextVisit", {
        phone: phone,
        service: service,
        baseDate: baseDate || new Date().toISOString(),
        preference: preference || "REKOMENDOWANY"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się wyznaczyć kolejnej wizyty");
    }
    return response;
}

/* ----- VIS.27. planNextVisitFromCurrentAppointment (oryginalna linia 3741) ----- */
async function planNextVisitFromCurrentAppointment() {
    if (!currentEditingAppointment) return;
    try {
        const suggestion = await getSmartNextVisitSuggestion(
            currentEditingAppointment.phone,
            currentEditingAppointment.service,
            currentEditingAppointment.date,
            "REKOMENDOWANY"
        );
        const hours = (suggestion.availableSlots || []).slice(0, 6).join(", ");
        alert(
            "Rekomendowana data: " + suggestion.recommendedDate + "\n" +
            "Dostępne godziny: " + (hours || "brak automatycznych propozycji") + "\n\n" +
            "Termin można zmienić ręcznie w formularzu wizyty."
        );
    } catch (error) {
        alert("Błąd planowania kolejnej wizyty: " + (error.message || error));
    }
}

/* ----- VIS.28. ensureAppointmentLifecycleButtons (oryginalna linia 3780) ----- */
function ensureAppointmentLifecycleButtons() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal || document.getElementById("crm-lifecycle-actions")) return;
    const content = modal.querySelector(".modal-content") || modal;
    const box = document.createElement("div");
    box.id = "crm-lifecycle-actions";
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5;";
    box.innerHTML = `
        <button type="button" class="btn-secondary" onclick="completeCurrentAppointment()">Oznacz jako zrealizowaną</button>
        <button type="button" class="btn-secondary" onclick="markCurrentAppointmentNoShow()">Nieobecność</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('KLIENT', '')">Anuluj przez klienta</button>
        <button type="button" class="btn-secondary" onclick="cancelAppointmentWithHistory('MISTRZYNI', '')">Anuluj przez salon</button>
        <button type="button" class="btn-primary" onclick="planNextVisitFromCurrentAppointment()">Zaplanuj następny wizyt</button>
    `;
    content.appendChild(box);
}

/* ----- VIS.29. crmUpdateLifecycleVisibility (oryginalna linia 4043) ----- */
function crmUpdateLifecycleVisibility(app) {
    const box = document.getElementById("crm-lifecycle-actions");
    if (!box) return;
    const external = app && app.eventType === "external";
    const block = app && app.eventType === "block";
    const workShift = app && app.eventType === "work_shift";
    box.style.display = (external || block || workShift) ? "none" : "flex";
    let externalBox = document.getElementById("crm-external-actions");
    if (!externalBox) {
        externalBox = document.createElement("div");
        externalBox.id = "crm-external-actions";
        externalBox.style.cssText = "display:none;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #eadfd5";
        externalBox.innerHTML = `<button type="button" class="btn-primary" onclick="window.open('https://calendar.google.com/calendar/u/0/r','_blank','noopener')">Otwórz Google Calendar</button><button type="button" class="btn-secondary" onclick="convertExternalToCRMAppointment()">Przekształć w wizytę CRM</button>`;
        box.parentNode.appendChild(externalBox);
    }
    externalBox.style.display = external ? "flex" : "none";
}

/* ----- VIS.30. crmOriginalOpenAppointmentDetailsModal (oryginalna linia 4077) ----- */
const crmOriginalOpenAppointmentDetailsModal = openAppointmentDetailsModal;

/* ----- VIS.31. openAppointmentDetailsModal (oryginalna linia 4078) ----- */
openAppointmentDetailsModal = function(app) {
    crmOriginalOpenAppointmentDetailsModal(app);
    setText("details-datetime", crmFormatDateTime(app.date));
    crmUpdateLifecycleVisibility(app);
};

/* ----- VIS.32. crmRunLifecycleOperation (oryginalna linia 4084) ----- */
async function crmRunLifecycleOperation(operation, initiator, deleteCalendarEvent, successText, button) {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    const affectedAppointment = currentEditingAppointment;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, button, "Zapisywanie...");
    try {
        await recordAppointmentLifecycle({operation, eventId:affectedAppointment.eventId||"", phone:affectedAppointment.phone||"", clientName:affectedAppointment.name||"", service:affectedAppointment.service||"", oldDate:affectedAppointment.date||"", initiator:initiator||"MISTRZYNI", deleteCalendarEvent:Boolean(deleteCalendarEvent)});
        if (deleteCalendarEvent) {
            const affectedEventId = affectedAppointment.eventId || "";
            const affectedDate = affectedAppointment.date || "";
            const affectedName = affectedAppointment.name || "";
            appointmentsData = (appointmentsData || []).filter(item => {
                if (affectedEventId && item.eventId === affectedEventId) return false;
                return !(!affectedEventId && item.date === affectedDate && item.name === affectedName);
            });
        }
        currentEditingAppointment = null;
        closeAppointmentModal();

        if (deleteCalendarEvent) {
            /*
             * Anulowana wizyta znika natychmiast z lokalnego widoku.
             * Pełna synchronizacja z backendem odbywa się później w tle,
             * więc użytkownik nie czeka na loadSystem(), klientów i grafik.
             */
            if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            crmToast(successText);

            Promise.resolve()
                .then(() => {
                    if (typeof crmLightSyncCalendarData === "function") {
                        return crmLightSyncCalendarData("anulowanie-wizyty");
                    }
                    return typeof crmRefreshAllViews === "function"
                        ? crmRefreshAllViews()
                        : null;
                })
                .catch(error => {
                    console.error("Synchronizacja po anulowaniu wizyty nie powiodła się:", error);
                });
        } else {
            const localStatus = operation === "NIEOBECNOSC" ? "NIEOBECNOSC" : (operation === "ZREALIZOWANA" ? "ZREALIZOWANA" : operation);
            affectedAppointment.status = localStatus;
            affectedAppointment.crmStatus = localStatus;
            if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
            crmToast(successText);
            Promise.resolve().then(() => typeof crmLightSyncCalendarData === "function" ? crmLightSyncCalendarData("status-wizyty") : null)
                .catch(error => console.error("Lekka synchronizacja statusu wizyty nie powiodła się:", error));
        }
    } catch (error) {
        crmToast(error.message || String(error), "error");
    } finally {
        crmUiOperationLock = false;
        crmSetActionGroupBusy(false);
    }
}

/* ----- VIS.33. completeCurrentAppointment (oryginalna linia 4100) ----- */
completeCurrentAppointment = async function() {
    return crmRunLifecycleOperation("ZREALIZOWANA", "MISTRZYNI", false, "Wizyta została oznaczona jako zrealizowana.", document.activeElement);
};

/* ----- VIS.34. markCurrentAppointmentNoShow (oryginalna linia 4103) ----- */
markCurrentAppointmentNoShow = async function() {
    const ok = await crmConfirm("Czy zapisać nieobecność klienta?", "Zapisz nieobecność");
    if (!ok) return;
    return crmRunLifecycleOperation("NIEOBECNOSC", "KLIENT", false, "Nieobecność została zapisana.", document.activeElement);
};

/* ----- VIS.35. cancelAppointmentWithHistory (oryginalna linia 4108) ----- */
cancelAppointmentWithHistory = async function(initiator) {
    const ok = await crmConfirm("Czy na pewno anulować tę wizytę?", initiator === "KLIENT" ? "Anuluj przez klienta" : "Anuluj przez salon");
    if (!ok) return;
    return crmRunLifecycleOperation("ANULOWANIE", initiator || "MISTRZYNI", true, "Wizyta została anulowana.", document.activeElement);
};

/* ----- VIS.36. planNextVisitFromCurrentAppointment (oryginalna linia 4113) ----- */
planNextVisitFromCurrentAppointment = async function() {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;
    crmUiOperationLock = true;
    crmSetActionGroupBusy(true, document.activeElement, "Wyszukiwanie...");
    try {
        const suggestion = await getSmartNextVisitSuggestion(currentEditingAppointment.phone,currentEditingAppointment.service,currentEditingAppointment.date,"REKOMENDOWANY");
        crmToast(`Rekomendowana data: ${suggestion.recommendedDate}. Godziny: ${(suggestion.availableSlots||[]).slice(0,6).join(", ") || "brak propozycji"}`);
    } catch (error) { crmToast(error.message || String(error), "error"); }
    finally { crmUiOperationLock=false; crmSetActionGroupBusy(false); }
};


/* ----- VIS.38. crmV3RenderAppointmentCardOriginal (oryginalna linia 5612) ----- */
const crmV3RenderAppointmentCardOriginal = renderAppointmentCard;

/* ----- VIS.39. renderAppointmentCard (oryginalna linia 5613) ----- */
renderAppointmentCard = function(app, container) {
    const before = container.children.length;
    crmV3RenderAppointmentCardOriginal(app, container);
    crmV3ApplyStatusToElement(container.children[before], app);
};

/* ----- VIS.39.1. Referencje bazowego panelu przed warstwa V3 ----- */
const crmV3OpenDetailsOriginal = openAppointmentDetailsModal;
const crmV3CloseDetailsOriginal = closeAppointmentModal;

/* ----- VIS.40. openAppointmentDetailsModal (oryginalna linia 5637) ----- */
openAppointmentDetailsModal = function(item) {
    crmV3OpenDetailsOriginal(item);
    crmV3UpdateDetailsStatus(item);
    document.body.classList.add("crm-v3-details-open");
};

/* ----- VIS.41. closeAppointmentModal (oryginalna linia 5644) ----- */
closeAppointmentModal = function() {
    crmV3CloseDetailsOriginal();
    document.body.classList.remove("crm-v3-details-open");
};

/* ----- VIS.42. crmParseVisitDate (oryginalna linia 5696) ----- */
function crmParseVisitDate(value) {
    const raw = String(value || "");
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const match = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4}).*?(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2])-1, Number(match[1]), Number(match[4]), Number(match[5]));
}

/* ----- VIS.43. crmFormatVisitDay (oryginalna linia 5704) ----- */
function crmFormatVisitDay(date) {
    if (!date) return "Data wizyty";
    const text = date.toLocaleDateString("pl-PL", {weekday:"short",day:"numeric",month:"short"});
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, "");
}

/* ----- VIS.44. crmFormatVisitTime (oryginalna linia 5709) ----- */
function crmFormatVisitTime(date) {
    return date ? date.toLocaleTimeString("pl-PL", {hour:"2-digit",minute:"2-digit"}) : "—";
}

/* ----- VIS.45. crmFindServiceForVisit (oryginalna linia 5712) ----- */
function crmFindServiceForVisit(app) {
    const name = String(app?.service || "").trim().toLowerCase();
    return (Array.isArray(currentServices) ? currentServices : []).find(item => String(item.name || "").trim().toLowerCase() === name) || null;
}

/* ----- VIS.46. crmGetVisitWorker (oryginalna linia 5723) ----- */
function crmGetVisitWorker(app) {
    return crmEscapePanelValue(app?.worker || app?.employee || app?.master || app?.staffName, "Nie przypisano");
}

/* ----- VIS.47. crmGetVisitEquipment (oryginalna linia 5726) ----- */
function crmGetVisitEquipment(app) {
    return crmEscapePanelValue(app?.equipment || app?.room || app?.cabinet, "Nie przypisano");
}

/* ----- VIS.48. crmSwitchVisitPanelTab (oryginalna linia 5733) ----- */
function crmSwitchVisitPanelTab(tab) {
    const visit = tab !== "info";
    document.getElementById("crmVisitTabVisit")?.classList.toggle("active", visit);
    document.getElementById("crmVisitTabInfo")?.classList.toggle("active", !visit);
    const visitContent = document.getElementById("crmVisitTabContent");
    const infoContent = document.getElementById("crmInfoTabContent");
    if (visitContent) visitContent.hidden = !visit;
    if (infoContent) infoContent.hidden = visit;
}

/* ----- VIS.49. crmToggleVisitStatusMenu (oryginalna linia 5742) ----- */
function crmToggleVisitStatusMenu(force) {
    const menu = document.getElementById("crmVisitStatusMenu");
    if (!menu) return;
    menu.hidden = typeof force === "boolean" ? !force : !menu.hidden;
}

/* ----- VIS.50. crmVisitStatusAction (oryginalna linia 5747) ----- */
async function crmVisitStatusAction(action) {
    crmToggleVisitStatusMenu(false);
    if (action === "COMPLETED") return completeCurrentAppointment();
    if (action === "NO_SHOW") return markCurrentAppointmentNoShow();
    if (action === "CANCEL_CLIENT") return cancelAppointmentWithHistory("KLIENT", "");
    if (action === "CANCEL_SALON") return cancelAppointmentWithHistory("MISTRZYNI", "");
}

function crmToggleVisitTrashMenu(force) {
    const menu = document.getElementById("crmVisitTrashMenu");
    if (!menu) return;
    const shouldOpen = typeof force === "boolean" ? force : menu.hidden;
    const statusMenu = document.getElementById("crmVisitStatusMenu");
    if (statusMenu) statusMenu.hidden = true;
    menu.hidden = !shouldOpen;
}

async function crmVisitTrashAction(initiator) {
    crmToggleVisitTrashMenu(false);
    return cancelAppointmentWithHistory(initiator === "KLIENT" ? "KLIENT" : "MISTRZYNI");
}

/* ----- VIS.51. crmPopulateNewVisitPanel (oryginalna linia 5754) ----- */
function crmPopulateNewVisitPanel(app) {
    const isAppointment = app?.eventType === "appointment";
    const isBlock = app?.eventType === "block";
    const isExternal = app?.eventType === "external";
    const date = crmParseVisitDate(app?.date);
    const duration = Math.max(0, Number(app?.duration) || 0);
    const end = date ? new Date(date.getTime() + duration * 60000) : null;
    const service = crmFindServiceForVisit(app);
    const name = crmEscapePanelValue(app?.name, isAppointment ? "Klient" : "Wydarzenie");

    setText("details-name", name);
    setText("details-phone", crmEscapePanelValue(app?.phone, "Numer telefonu jest ukryty"));
    setText("details-service", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("details-duration", duration || 0);
    setText("details-datetime", crmFormatDateTime(app?.date));
    setText("crmInfoClient", name);
    setText("crmInfoService", crmEscapePanelValue(app?.service, "Brak usługi"));
    setText("crmInfoSource", crmEscapePanelValue(app?.source || app?.eventType, "CRM"));
    setText("crmClientAvatar", crmInitial(name));
    setText("crmVisitReservationId", "ID rezerwacji klienta: " + crmEscapePanelValue(app?.requestId || app?.eventId || app?.id, "—"));
    setText("crmVisitDateHeading", crmFormatVisitDay(date));
    setText("crmVisitStart", crmFormatVisitTime(date));
    setText("crmVisitEnd", crmFormatVisitTime(end));
    setText("crmVisitWorker", crmGetVisitWorker(app));
    setText("crmVisitEquipment", crmGetVisitEquipment(app));
    const serviceDescription = isExternal
        ? "Wydarzenie zewnętrzne z Google Calendar"
        : crmEscapePanelValue(app?.serviceDescription || service?.description, "Usługa salonowa");
    setText("crmServiceDescription", serviceDescription);
    setText("crmServicePrice", isExternal ? "—" : crmGetServicePriceText(app));

    const stripe = document.getElementById("crmServiceStripe");
    if (stripe) stripe.style.background = app?.color || service?.color || "#d6df73";
    const group = document.getElementById("crmVisitGroupFlag");
    const recurring = document.getElementById("crmVisitRecurringFlag");
    if (group) group.hidden = !(app?.group || app?.isGroup);
    if (recurring) recurring.hidden = !(app?.recurring || app?.isRecurring);
    const statusButton = document.getElementById("crmVisitStatusButton");
    const repeatButton = document.getElementById("crmRepeatVisitBtn");
    const settleButton = document.getElementById("crmSettleVisitBtn");
    if (statusButton) statusButton.hidden = !isAppointment;
    if (repeatButton) repeatButton.hidden = !isAppointment;
    if (settleButton) settleButton.hidden = !isAppointment;

    const addServiceButton = document.querySelector("#appointmentDetailsModal .crm-safe-add-service");
    if (addServiceButton) addServiceButton.hidden = !isAppointment;

    const trashButton = document.getElementById("crmVisitTrashButton");
    if (trashButton) {
        trashButton.hidden = !(isAppointment || isBlock);
        trashButton.title = isBlock ? "Usuń blokadę" : "Anuluj wizytę";
        trashButton.setAttribute("aria-label", isBlock ? "Usuń blokadę" : "Anuluj wizytę");
        trashButton.onclick = isBlock
            ? function(event) {
                event.preventDefault();
                event.stopPropagation();
                deleteBlockTimeFromAdmin();
            }
            : function(event) {
                event.preventDefault();
                event.stopPropagation();
                crmToggleVisitTrashMenu();
            };
    }
    const trashMenu = document.getElementById("crmVisitTrashMenu");
    if (trashMenu) trashMenu.hidden = true;

    const clientCard = document.querySelector("#appointmentDetailsModal .crm-safe-client-card");
    if (clientCard) {
        clientCard.classList.toggle("is-readonly", isExternal);
        clientCard.title = isExternal ? "Wydarzenie zewnętrzne z Google Calendar" : "Otwórz edycję wizyty";
        clientCard.onclick = isExternal ? null : () => openEditAppointmentModal();
        clientCard.onkeydown = isExternal ? null : event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEditAppointmentModal();
            }
        };
        clientCard.tabIndex = isExternal ? -1 : 0;
    }

    crmSwitchVisitPanelTab("visit");
    crmToggleVisitStatusMenu(false);
}

/* ----- VIS.51.1. Referencja panelu V3 przed warstwa V4 ----- */
const crmV4OpenDetailsOriginal = openAppointmentDetailsModal;

/* ----- VIS.52. openAppointmentDetailsModal (oryginalna linia 5796) ----- */
openAppointmentDetailsModal = function(app) {
    crmV4OpenDetailsOriginal(app);
    crmPopulateNewVisitPanel(app);
};

/* ----- VIS.53. crmVisitSourceInfo (oryginalna linia 6049) ----- */
/* KONIEC ADMIN V6 */

/* ==========================================================
   ADMIN V6.2: ŹRÓDŁO WIZYTY I UPROSZCZENIE PANELU
   ========================================================== */
function crmVisitSourceInfo(app) {
    const raw = String(app?.bookingSource || app?.source || app?.createdBy || "").trim().toUpperCase();
    const phone = String(app?.phone || "").trim().toUpperCase();

    if (raw.includes("FORM")) return {
        code:"FORM_FIRST", label:"Pierwsza wizyta – zapytanie online",
        badge:"PIERWSZA WIZYTA · ONLINE", manual:false,
        background:"#fbf1f5", border:"#d9a6b9", text:"#7c4860"
    };

    if (raw.includes("INDEX_REQUEST") || raw.includes("REQUEST")) return {
        code:"INDEX_REQUEST", label:"Prośba o termin przez stronę",
        badge:"PROŚBA PRZEZ STRONĘ", manual:false,
        background:"#f1f6fb", border:"#a8bfd5", text:"#48657d"
    };

    if (raw.includes("INDEX") || raw.includes("ONLINE") || raw.includes("CLIENT") || raw.includes("KLIENT")) return {
        code:"INDEX", label:"Rezerwacja przez stronę",
        badge:"REZERWACJA PRZEZ STRONĘ", manual:false,
        background:"#f1f6fb", border:"#a8bfd5", text:"#48657d"
    };

    if (raw.includes("GOOGLE") || phone === "GOOGLE CALENDAR") return {
        code:"GOOGLE", label:"Google Kalendarz",
        badge:"GOOGLE KALENDARZ", manual:true,
        background:"#f3f4f6", border:"#c4cad1", text:"#59616b"
    };

    if (raw.includes("ADMIN") || raw.includes("MISTRZYNI") || raw.includes("MASTER")) return {
        code:"ADMIN", label:"Dodana przeze mnie",
        badge:"DODANA PRZEZE MNIE", manual:true,
        background:"#f7f2f5", border:"#ccb8c1", text:"#67545e"
    };

    if (raw.includes("BOOKSY")) return {
        code:"BOOKSY", label:"Wizyta zaimportowana z Booksy",
        badge:"BOOKSY", manual:false,
        background:"#f4f4f4", border:"#c9c9c9", text:"#555"
    };

    return {
        code:"LEGACY", label:"Starsza wizyta – źródło nie zapisane",
        badge:"STARSZA WIZYTA", manual:false,
        background:"#f6f6f6", border:"#d3d3d3", text:"#666"
    };
}

/* ----- VIS.54. crmApplyVisitPanelBusinessRules (oryginalna linia 6058) ----- */
function crmApplyVisitPanelBusinessRules(app) {
    const source = crmVisitSourceInfo(app);
    const note = document.getElementById("crmWorkerNote");
    if (note) {
        note.hidden = !source.manual;
        note.textContent = source.manual ? "Pracownik wybrany ręcznie" : "";
    }
    const sourceNode = document.getElementById("crmInfoSource");
    if (sourceNode) {
        sourceNode.textContent = source.label;
        sourceNode.style.display = "inline-flex";
        sourceNode.style.width = "fit-content";
        sourceNode.style.padding = "5px 8px";
        sourceNode.style.border = `1px solid ${source.border}`;
        sourceNode.style.borderRadius = "999px";
        sourceNode.style.background = source.background;
        sourceNode.style.color = source.text;
        sourceNode.style.fontSize = "11px";
        sourceNode.style.fontWeight = "800";
    }

    const modal = document.getElementById("appointmentDetailsModal");
    if (modal) modal.dataset.crmSource = String(source.code || "").toLowerCase();

    const reservationId = document.getElementById("crmVisitReservationId");
    if (reservationId) reservationId.hidden = true;

    const statusCopy = document.querySelector("#appointmentDetailsModal .crm-safe-status-copy");
    if (statusCopy) {
        let badge = document.getElementById("crmVisitSourceBadge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "crmVisitSourceBadge";
            statusCopy.appendChild(badge);
        }
        badge.textContent = source.badge;
        badge.style.display = "inline-flex";
        badge.style.marginTop = "5px";
        badge.style.padding = "4px 7px";
        badge.style.border = `1px solid ${source.border}`;
        badge.style.borderRadius = "999px";
        badge.style.background = source.background;
        badge.style.color = source.text;
        badge.style.fontSize = "9px";
        badge.style.fontWeight = "800";
        badge.style.letterSpacing = ".03em";
    }
    const fields = document.querySelectorAll("#appointmentDetailsModal .crm-visit-field");
    fields.forEach(field => {
        const label = field.querySelector("span")?.textContent?.trim();
        if (label === "Pracownik" || label === "Sprzęt") field.hidden = true;
    });
    document.querySelector("#appointmentDetailsModal .crm-client-choice")?.setAttribute("hidden", "");
    const settle = document.getElementById("crmSettleVisitBtn");
    if (settle) settle.hidden = true;
    const repeat = document.getElementById("crmRepeatVisitBtn");
    if (repeat) repeat.textContent = "UMÓW PONOWNIE";
}

/* ----- VIS.55. crmPopulateNewVisitPanelV62 (oryginalna linia 6080) ----- */
const crmPopulateNewVisitPanelV62 = crmPopulateNewVisitPanel;

/* ----- VIS.56. crmPopulateNewVisitPanel (oryginalna linia 6081) ----- */
crmPopulateNewVisitPanel = function(app) {
    crmPopulateNewVisitPanelV62(app);
    crmApplyVisitPanelBusinessRules(app);
};

/* ----- VIS.57. crmVisitEntry (oryginalna linia 6117) ----- */
function crmVisitEntry(item, rangeStart, rangeEnd) {
    const date = crmDayEventDate(item);
    if (!date) return null;
    const start = date.getHours()*60 + date.getMinutes();
    const duration = Math.max(15,Number(item.duration)||45);
    const end = start + duration;
    if (end <= rangeStart || start >= rangeEnd) return null;
    return {item,date,endDate:new Date(date.getTime()+duration*60000),start:Math.max(rangeStart,start),end:Math.min(rangeEnd,end)};
}

/* ----- VIS.58. crmInstallSafeRightVisitPanel (oryginalna linia 6370) ----- */
/* KONIEC ADMIN V9 */


/* ==========================================================
   ADMIN V10-SAFE: PRAWY PANEL BEZ ZMIANY HTML
   ========================================================== */
function crmInstallSafeRightVisitPanel() {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal || modal.dataset.crmSafePanel === "1") return;
    const surface = modal.querySelector(".modal-content");
    if (!surface) return;

    modal.dataset.crmSafePanel = "1";
    modal.classList.add("crm-safe-visit-panel");
    surface.classList.add("crm-safe-visit-surface");

    surface.innerHTML = `
      <header class="crm-safe-header">
        <button type="button" class="crm-safe-close" onclick="closeAppointmentModal()" aria-label="Zamknij">×</button>
        <div class="crm-safe-status-copy">
          <h4 id="appointmentDetailsTitle">✓ POTWIERDZONO</h4>
          <small id="crmVisitReservationId"></small>
        </div>
        <button id="crmVisitStatusButton" type="button" class="crm-safe-status-btn" onclick="crmToggleVisitStatusMenu()">Zmień status</button>
        <div id="crmVisitStatusMenu" class="crm-safe-status-menu" hidden>
          <button type="button" onclick="crmVisitStatusAction('COMPLETED')">Zrealizowana</button>
          <button type="button" onclick="crmVisitStatusAction('NO_SHOW')">Nieobecność</button>
        </div>
        <button id="crmVisitTrashButton" type="button" class="crm-final-trash" onclick="crmToggleVisitTrashMenu()" aria-label="Anuluj wizytę" title="Anuluj wizytę">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>
        </button>
        <div id="crmVisitTrashMenu" class="crm-final-trash-menu" hidden>
          <button type="button" onclick="crmVisitTrashAction('KLIENT')">Anulowana przez klienta</button>
          <button type="button" onclick="crmVisitTrashAction('MISTRZYNI')">Anulowana przez salon</button>
        </div>
      </header>
      <div id="appointment-details-view" class="crm-safe-body">
        <section class="crm-safe-client-card" role="button" tabindex="0" title="Otwórz edycję wizyty" onclick="openEditAppointmentModal()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openEditAppointmentModal();}">
          <div id="crmClientAvatar" class="crm-safe-avatar">K</div>
          <div class="crm-safe-client-copy">
            <strong id="details-name">Klient</strong>
            <span id="details-phone-row">☎ <span id="details-phone">—</span></span>
          </div>
        </section>
        <nav class="crm-safe-tabs">
          <button id="crmVisitTabVisit" type="button" class="active" onclick="crmSwitchVisitPanelTab('visit')">WIZYTA</button>
          <button id="crmVisitTabInfo" type="button" onclick="crmSwitchVisitPanelTab('info')">INFORMACJE</button>
        </nav>
        <section id="crmVisitTabContent" class="crm-safe-tab-content">
          <strong id="crmVisitDateHeading" class="crm-safe-date">Data wizyty</strong>
          <article class="crm-safe-service-card">
            <span id="crmServiceStripe" class="crm-safe-service-stripe"></span>
            <div class="crm-safe-service-copy">
              <strong id="details-service">Usługa</strong>
              <span id="crmServiceDescription">Usługa salonowa</span>
              <small><span id="details-duration">0</span> min</small>
            </div>
            <strong id="crmServicePrice" class="crm-safe-price">—</strong>
          </article>
          <div class="crm-safe-time-grid">
            <div><span>Początek</span><strong id="crmVisitStart">—</strong></div>
            <div><span>Koniec</span><strong id="crmVisitEnd">—</strong></div>
          </div>
          <span id="crmVisitWorker" hidden></span><span id="crmVisitEquipment" hidden></span>
          <button type="button" class="crm-safe-add-service">DODAJ KOLEJNĄ USŁUGĘ <b>+</b></button>
          <button id="crmRepeatVisitBtn" type="button" class="crm-safe-repeat" onclick="planNextVisitFromCurrentAppointment()">UMÓW PONOWNIE</button>
        </section>
        <section id="crmInfoTabContent" class="crm-safe-info" hidden>
          <div><span>Klient</span><strong id="crmInfoClient">—</strong></div>
          <div><span>Usługa</span><strong id="crmInfoService">—</strong></div>
          <div><span>Data i godzina</span><strong id="details-datetime">—</strong></div>
          <div><span>Źródło</span><strong id="crmInfoSource">—</strong></div>
        </section>
        <button id="deleteAppointmentBtn" type="button" hidden onclick="deleteSelectedCalendarItemFromAdmin()"></button>
        <button id="editAppointmentBtn" type="button" hidden onclick="openEditAppointmentModal()"></button>
        <button id="crmSettleVisitBtn" type="button" hidden></button>
      </div>`;
}

/* ----- VIS.59. crmSafeVisitCategoryColor (oryginalna linia 6439) ----- */
function crmSafeVisitCategoryColor(app) {
    const service = typeof crmFindServiceForVisit === "function" ? crmFindServiceForVisit(app) : null;
    const category = app?.category || service?.category || "";
    return app?.categoryColor || service?.categoryColor || globalColors?.[category] || app?.color || "#b05c75";
}

/* ----- VIS.60. crmSafeOpenAppointmentOriginal (oryginalna linia 6445) ----- */
const crmSafeOpenAppointmentOriginal = openAppointmentDetailsModal;

/* ----- VIS.61. openAppointmentDetailsModal (oryginalna linia 6446) ----- */
function crmVisitReadableStatus(app) {
    const normalized = typeof crmV3NormalizeStatus === "function" ? crmV3NormalizeStatus(app) : String(app?.crmStatus || app?.status || "CONFIRMED").trim().toUpperCase();
    if (normalized === "NO_SHOW") return {key:"no-show", icon:"❗", label:"NIEOBECNOŚĆ", info:"Klient nie przyszedł"};
    if (normalized === "COMPLETED") return {key:"completed", icon:"✓", label:"ZREALIZOWANA", info:"Zrealizowana"};
    if (normalized === "IN_PROGRESS") return {key:"in-progress", icon:"▶", label:"W TRAKCIE", info:"Wizyta trwa"};
    if (normalized === "CANCELLED_CLIENT" || normalized === "CANCELLED_SALON") return {key:"cancelled", icon:"×", label:"ANULOWANA", info:"Anulowana"};
    if (normalized === "PENDING") return {key:"pending", icon:"⌛", label:"OCZEKUJE", info:"Oczekuje"};
    return {key:"confirmed", icon:"●", label:"POTWIERDZONO", info:"Potwierdzono"};
}

function crmApplyReadableVisitStatus(app) {
    if (!app || app.eventType !== "appointment") return;

    const status = crmVisitReadableStatus(app);
    const modal = document.getElementById("appointmentDetailsModal");
    const title = document.getElementById("appointmentDetailsTitle");

    if (modal) modal.dataset.crmStatus = status.key;
    if (title) title.textContent = status.icon + " " + status.label;

    const info = document.getElementById("crmInfoTabContent");
    if (!info) return;

    let row = document.getElementById("crmInfoVisitStatusRow");
    if (!row) {
        row = document.createElement("div");
        row.id = "crmInfoVisitStatusRow";
        row.innerHTML = '<span>Status</span><strong id="crmInfoVisitStatus">—</strong>';
        info.appendChild(row);
    }

    const value = document.getElementById("crmInfoVisitStatus");
    if (value) value.textContent = status.info;
}

openAppointmentDetailsModal = function(app) {
    const calendarTab = document.getElementById("tab-kalendarz");
    if (!calendarTab || getComputedStyle(calendarTab).display === "none") return;
    crmInstallSafeRightVisitPanel();
    crmSafeOpenAppointmentOriginal(app);
    if (typeof crmPopulateNewVisitPanel === "function") crmPopulateNewVisitPanel(app);

    /* Status nakladamy jako ostatni krok, po zbudowaniu i wypelnieniu panelu. */
    crmApplyReadableVisitStatus(app);

    const stripe = document.getElementById("crmServiceStripe");
    if (stripe) stripe.style.background = crmSafeVisitCategoryColor(app);
};

/* ----- VIS.62. crmVisitStableKey (oryginalna linia 6476) ----- */
function crmVisitStableKey(item) {
    return String(item?.eventId || [item?.date, item?.phone, item?.name, item?.service].join("|"));
}

/* ----- VIS.63. crmVisitEndTime (oryginalna linia 6480) ----- */
function crmVisitEndTime(item) {
    const start = new Date(item?.date);
    if (Number.isNaN(start.getTime())) return "";
    const explicit = new Date(item?.endDate || item?.end || "");
    const end = !Number.isNaN(explicit.getTime())
        ? explicit
        : new Date(start.getTime() + (Math.max(5, Number(item?.duration) || 45) * 60000));
    return formatCalendarTime(start) + "–" + formatCalendarTime(end);
}

/* ----- VIS.64. crmVisitService (oryginalna linia 6490) ----- */
function crmVisitService(item) {
    return String(item?.service || item?.name || (item?.eventType === "block" ? "Zablokowany czas" : "Wizyta"));
}

/* ----- VIS.65. crmVisitCategoryColor (oryginalna linia 6500) ----- */
function crmVisitCategoryColor(item) {
    if (item?.eventType === "block") return "#aaa2a7";
    if (item?.eventType === "external") return "#9aa2af";
    const service = currentServices.find(value =>
        value?.name && item?.service &&
        value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    const category = item?.category || service?.category || "";
    return item?.categoryColor || service?.categoryColor || globalColors?.[category] || item?.color || service?.color || "#b05c75";
}

/* ----- VIS.66. crmEnsureDayVisitsList (oryginalna linia 6616) ----- */
function crmEnsureDayVisitsList() {
    let overlay = document.getElementById("crmDayVisitsOverlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "crmDayVisitsOverlay";
    overlay.className = "crm-day-list-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="crm-day-list-panel" role="dialog" aria-modal="false" aria-labelledby="crmDayVisitsTitle">
        <header>
          <div><span>Wszystkie wizyty</span><h3 id="crmDayVisitsTitle">Wybrany dzień</h3></div>
          <button type="button" class="crm-day-list-close" aria-label="Zamknij">×</button>
        </header>
        <div id="crmDayVisitsBody" class="crm-day-list-body"></div>
      </section>`;
    overlay.querySelector(".crm-day-list-close").addEventListener("click", crmCloseDayVisitsList);

    /* CDL.1.4. Panel listy pozostaje otwarty do świadomego zamknięcia.
       Kliknięcie kalendarza ani obszaru poza panelem nie zamyka listy. */
    document.body.appendChild(overlay);
    return overlay;
}

/* ----- VIS.67. crmOpenDayVisitsList (oryginalna linia 6639) ----- */
function crmOpenDayVisitsList(date) {
    const overlay = crmEnsureDayVisitsList();
    crmOpenDayListDate = new Date(date);
    overlay.hidden = false;
    crmRenderDayVisitsList();
}

/* ----- VIS.68. crmCloseDayVisitsList (oryginalna linia 6646) ----- */
function crmCloseDayVisitsList() {
    const overlay = document.getElementById("crmDayVisitsOverlay");
    if (overlay) overlay.hidden = true;
    crmOpenDayListDate = null;
    crmOpenDayListSelectedKey = "";
}

/* ----- VIS.69. crmRenderDayVisitsList (oryginalna linia 6653) ----- */
function crmRenderDayVisitsList() {
    if (!crmOpenDayListDate) return;
    const title = document.getElementById("crmDayVisitsTitle");
    const body = document.getElementById("crmDayVisitsBody");
    if (!title || !body) return;
    title.textContent = crmOpenDayListDate.toLocaleDateString("pl-PL", {
        weekday:"long", day:"numeric", month:"long", year:"numeric"
    });
    const events = getCalendarEventsForDate(crmOpenDayListDate).filter(item => item.eventType !== "work_shift");
    body.innerHTML = "";
    if (!events.length) {
        const empty = document.createElement("p");
        empty.className = "crm-day-list-empty";
        empty.textContent = "Brak wizyt w tym dniu.";
        body.appendChild(empty);
        return;
    }
    events.forEach(item => {
        const key = crmVisitStableKey(item);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "crm-day-list-item" + (key === crmOpenDayListSelectedKey ? " is-selected" : "");
        const palette = typeof crmCategoryPalette === "function" ? crmCategoryPalette(item) : null;
        const color = palette?.stripe || crmVisitCategoryColor(item);
        const softColor = palette?.fill || crmHexToSoftBackground(color);
        button.style.setProperty("--crm-event-color", color);
        button.style.setProperty("--crm-event-soft", softColor);
        button.innerHTML = `
          <span class="crm-day-list-time">${crmEscapeText(crmVisitEndTime(item))}</span>
          <strong class="crm-day-list-service">${crmEscapeText(crmVisitService(item))}</strong>
          <small class="crm-day-list-client">${crmEscapeText(crmVisitClient(item))}</small>
          <span class="crm-day-list-status">${crmEscapeText(crmStatusIcon(item))}</span>`;
        button.addEventListener("click", () => {
            crmOpenDayListSelectedKey = key;
            body.querySelectorAll(".crm-day-list-item").forEach(node => node.classList.remove("is-selected"));
            button.classList.add("is-selected");
            openAppointmentDetailsModal(item);
        });
        body.appendChild(button);
    });
}

/* ========================================================================== 
   ADMIN: ZAMYKANIE MENU STATUSU I KOSZA
   ========================================================================== */
(function crmInstallVisitMenuCloseBehavior() {
    document.addEventListener("click", event => {
        if (!event.target.closest("#crmVisitStatusButton, #crmVisitStatusMenu")) {
            const statusMenu = document.getElementById("crmVisitStatusMenu");
            if (statusMenu) statusMenu.hidden = true;
        }
        if (!event.target.closest("#crmVisitTrashButton, #crmVisitTrashMenu")) {
            const trashMenu = document.getElementById("crmVisitTrashMenu");
            if (trashMenu) trashMenu.hidden = true;
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const statusMenu = document.getElementById("crmVisitStatusMenu");
        const trashMenu = document.getElementById("crmVisitTrashMenu");
        if (statusMenu && !statusMenu.hidden) {
            event.stopImmediatePropagation();
            statusMenu.hidden = true;
        }
        if (trashMenu && !trashMenu.hidden) {
            event.stopImmediatePropagation();
            trashMenu.hidden = true;
        }
    }, true);
})();
/* KONIEC: ZAMYKANIE MENU STATUSU I KOSZA */

/* ==========================================================================
   ADMIN FINAL 2026-08-07: UMOW PONOWNIE, KOSZ BLOKADY I TOASTY
   ========================================================================== */

/* Otwiera istniejacy formularz nowej wizyty z danymi poprzedniej wizyty. */
planNextVisitFromCurrentAppointment = function() {
    if (crmUiOperationLock || !currentEditingAppointment || currentEditingAppointment.eventType !== "appointment") return;

    const sourceVisit = currentEditingAppointment;
    const service = typeof crmFindServiceForVisit === "function"
        ? crmFindServiceForVisit(sourceVisit)
        : null;

    const clientName = String(sourceVisit.name || "").trim();
    const clientPhone = String(
        sourceVisit.phone ||
        sourceVisit.phoneNumber ||
        sourceVisit.clientPhone ||
        ""
    ).trim();
    const serviceName = String(sourceVisit.service || service?.name || "").trim();
    const duration = Math.max(5, Number(sourceVisit.duration || service?.duration || 45));

    /* Nowa wizyta nie moze odziedziczyc Event ID ani starego statusu. */
    currentEditingAppointment = null;

    if (typeof populateAppointmentDropdowns === "function") {
        populateAppointmentDropdowns();
    }

    const title = document.getElementById("modalTitleAppointment");
    const nameInput = document.getElementById("appointmentName");
    const phoneInput = document.getElementById("appointmentPhone");
    const serviceInput = document.getElementById("appointmentService");
    const durationInput = document.getElementById("appointmentDuration");
    const dateTimeInput = document.getElementById("appointmentDateTime");
    const modal = document.getElementById("appointmentModal");

    if (title) title.textContent = "Umów ponownie";
    if (nameInput) {
        nameInput.value = clientName;
        nameInput.readOnly = true;
        nameInput.setAttribute("aria-readonly", "true");
        nameInput.title = "Klient przypisany do poprzedniej wizyty";
    }
    if (phoneInput) {
        phoneInput.value = clientPhone;
        phoneInput.readOnly = true;
        phoneInput.setAttribute("aria-readonly", "true");
        phoneInput.title = "Numer telefonu klienta z poprzedniej wizyty";
    }
    if (serviceInput) serviceInput.value = serviceName;
    if (durationInput) durationInput.value = String(duration);
    if (dateTimeInput) dateTimeInput.value = "";

    closeAppointmentModal();

    if (modal) modal.style.display = "flex";

    /* Odswiezenie kontrolki daty co 5 minut bez kopiowania starego terminu. */
    if (typeof crmSyncFiveMinuteControlsFromHidden === "function") {
        window.setTimeout(crmSyncFiveMinuteControlsFromHidden, 0);
    }

    if (dateTimeInput) {
        window.setTimeout(() => dateTimeInput.focus(), 0);
    }
};

/* Anulowanie zachowuje jedno potwierdzenie, a sukces pokazuje tylko toast. */
cancelAppointmentWithHistory = async function(initiator) {
    const title = initiator === "KLIENT" ? "Anuluj przez klienta" : "Anuluj przez salon";
    const ok = typeof crmConfirm === "function"
        ? await crmConfirm("Czy na pewno anulować tę wizytę?", title)
        : window.confirm("Czy na pewno anulować tę wizytę?");
    if (!ok) return;

    return crmRunLifecycleOperation(
        "ANULOWANIE",
        initiator || "MISTRZYNI",
        true,
        "Wizyta została anulowana.",
        document.activeElement
    );
};

/* Blokada korzysta z tego samego kosza w naglowku co wizyta klienta. */
const crmPopulatePanelBeforeBlockTrashPosition = crmPopulateNewVisitPanel;
crmPopulateNewVisitPanel = function(app) {
    crmPopulatePanelBeforeBlockTrashPosition.apply(this, arguments);

    const modal = document.getElementById("appointmentDetailsModal");
    const trashButton = document.getElementById("crmVisitTrashButton");
    const statusButton = document.getElementById("crmVisitStatusButton");
    const isBlock = app?.eventType === "block";

    if (modal) modal.classList.toggle("crm-panel-is-block", isBlock);

    if (statusButton && isBlock) statusButton.hidden = true;

    if (trashButton) {
        trashButton.style.gridColumn = "4";
        trashButton.style.gridRow = "1";
        trashButton.style.justifySelf = "end";
        trashButton.style.alignSelf = "center";
    }
};

/* Usuniecie blokady: jedno potwierdzenie i informacja w rogu, bez okna OK. */
deleteBlockTimeFromAdmin = async function() {
    if (!currentEditingAppointment || currentEditingAppointment.eventType !== "block") {
        if (typeof crmToast === "function") crmToast("Nie wybrano blokady czasu.", "error");
        return;
    }
    if (isDeletingAppointment) return;

    const confirmed = typeof crmConfirm === "function"
        ? await crmConfirm("Usunąć wybraną blokadę czasu?", "Usuń blokadę")
        : window.confirm("Usunąć wybraną blokadę czasu?");
    if (!confirmed) return;

    const block = currentEditingAppointment;
    const trashButton = document.getElementById("crmVisitTrashButton");
    isDeletingAppointment = true;
    if (trashButton) trashButton.disabled = true;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "deleteBlockTime",
                eventId: block.eventId || "",
                start: block.date || "",
                end: block.endDate || "",
                title: block.name || ""
            })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Nieznany błąd");

        const eventId = String(block.eventId || "");
        const blockDate = String(block.date || "");
        const blockName = String(block.name || "");

        appointmentsData = (appointmentsData || []).filter(item => {
            if (eventId && String(item.eventId || "") === eventId) return false;
            return !(!eventId && String(item.date || "") === blockDate && String(item.name || "") === blockName);
        });

        currentEditingAppointment = null;
        closeAppointmentModal();

        if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
        if (typeof renderDashboard === "function") renderDashboard();
        if (typeof calculateFinanceReport === "function") calculateFinanceReport();
        if (typeof crmToast === "function") crmToast("Blokada czasu została usunięta.");

        Promise.resolve()
            .then(() => typeof loadSettings === "function" ? loadSettings() : null)
            .then(() => {
                if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
            })
            .catch(error => console.error("Synchronizacja po usunięciu blokady:", error));
    } catch (error) {
        console.error(error);
        if (typeof crmToast === "function") {
            crmToast("Błąd usuwania blokady czasu: " + (error.message || error), "error");
        }
    } finally {
        isDeletingAppointment = false;
        if (trashButton) trashButton.disabled = false;
    }
};

/* KONIEC ADMIN FINAL 2026-08-07 */

/* ==========================================================================
   ADMIN FINAL 2026-08-07: BLOKADA KLIENTA W TRYBIE UMOW PONOWNIE
   ========================================================================== */
function crmSetRebookClientFieldsReadonly(enabled) {
    const nameInput = document.getElementById("appointmentName");
    const phoneInput = document.getElementById("appointmentPhone");

    [nameInput, phoneInput].forEach(input => {
        if (!input) return;
        input.readOnly = Boolean(enabled);
        if (enabled) {
            input.setAttribute("aria-readonly", "true");
            input.classList.add("crm-rebook-readonly");
        } else {
            input.removeAttribute("aria-readonly");
            input.classList.remove("crm-rebook-readonly");
            input.removeAttribute("title");
        }
    });
}

/* Edycja zwyklej wizyty zawsze przywraca mozliwosc edycji danych klienta. */
const crmOpenEditAppointmentBeforeRebookLock = openEditAppointmentModal;
openEditAppointmentModal = function() {
    crmSetRebookClientFieldsReadonly(false);
    return crmOpenEditAppointmentBeforeRebookLock.apply(this, arguments);
};

/* Po rzeczywistym zamknieciu formularza zdejmujemy blokade dla kolejnego
   zwyklego uzycia przycisku Dodaj wizyte. */
const crmCloseCreateAppointmentBeforeRebookLock = closeCreateAppointmentModal;
closeCreateAppointmentModal = async function() {
    const result = await crmCloseCreateAppointmentBeforeRebookLock.apply(this, arguments);
    const modal = document.getElementById("appointmentModal");
    if (!modal || modal.style.display === "none") {
        crmSetRebookClientFieldsReadonly(false);
    }
    return result;
};

/* KONIEC: BLOKADA KLIENTA W TRYBIE UMOW PONOWNIE */

/* ==========================================================================
   VISITS RELIABILITY V7 2026-08-12
   Nieblokujacy zapis, minimalizacja, retry i odzyskanie po odswiezeniu.
   ========================================================================== */
const CRM_PENDING_APPOINTMENT_SAVE_KEY_V7 = "crm_pending_appointment_save_v7";
let crmAppointmentSaveJobV7 = null;

function crmOperationIdV7() {
    if (window.crypto?.randomUUID) return "ADM_" + window.crypto.randomUUID();
    return "ADM_" + Date.now() + "_" + Math.random().toString(36).slice(2, 12);
}

function crmReadPendingSaveV7() {
    try {
        return JSON.parse(localStorage.getItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7) || "null");
    } catch (ignore) {
        return null;
    }
}

function crmWritePendingSaveV7(job) {
    try {
        if (!job) localStorage.removeItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7);
        else localStorage.setItem(CRM_PENDING_APPOINTMENT_SAVE_KEY_V7, JSON.stringify(job));
    } catch (ignore) {}
}

function crmEnsureAppointmentMinimizeButtonV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return null;

    let button = document.getElementById("crmAppointmentMinimizeBtnV7");
    if (button) return button;

    const header = modal.querySelector(".modal-header");
    const close = header?.querySelector(".modal-close");
    if (!header) return null;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmAppointmentMinimizeBtnV7";
    button.title = "Zwiń i wróć do Kalendarza";
    button.setAttribute("aria-label", "Zwiń");
    button.textContent = "—";
    button.style.cssText =
        "margin-left:auto;margin-right:5px;border:0;background:#f6f1f3;" +
        "width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer;color:#655b60;";

    button.onclick = () => crmMinimizeAppointmentEditorV7();

    if (close) header.insertBefore(button, close);
    else header.appendChild(button);

    return button;
}

function crmMinimizeAppointmentEditorV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return;
    modal.dataset.crmMinimized = "1";
    modal.style.display = "none";

    const text = isSavingAppointment
        ? "Zapisywanie wizyty w tle — kliknij, aby otworzyć"
        : "Niedokończona wizyta — kliknij, aby dokończyć";

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            isSavingAppointment ? "loading" : "pending",
            text,
            { onClick: crmRestoreAppointmentEditorV7, keep:true }
        );
    }
}

function crmRestoreAppointmentEditorV7() {
    const modal = document.getElementById("appointmentModal");
    if (!modal) return;
    modal.dataset.crmMinimized = "0";
    modal.style.display = "flex";
}

window.crmRestoreAppointmentEditorV7 = crmRestoreAppointmentEditorV7;

function crmCaptureAppointmentDraftV7() {
    const value = id => String(document.getElementById(id)?.value || "");
    return {
        name: value("appointmentName"),
        phone: value("appointmentPhone"),
        service: value("appointmentService"),
        duration: value("appointmentDuration"),
        date: value("appointmentDateTime")
    };
}

function crmApplyAppointmentDraftV7(draft) {
    if (!draft) return;
    const set = (id, value) => {
        const node = document.getElementById(id);
        if (node && value !== undefined && value !== null) node.value = value;
    };
    set("appointmentName", draft.name);
    set("appointmentPhone", draft.phone);
    set("appointmentService", draft.service);
    set("appointmentDuration", draft.duration || "45");
    set("appointmentDateTime", draft.date);
}

async function crmCheckBookingOperationV7(operationId, options = {}) {
    if (!operationId) return { success:true, found:false };

    const attempts = Math.max(1, Number(options.attempts) || 5);
    const delays = [0, 800, 1600, 3000, 5000];
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (attempt > 1) await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));

        if (typeof crmSetBackgroundTaskStatus === "function" && options.showStatus) {
            crmSetBackgroundTaskStatus(
                "save",
                attempt === 1 ? "loading" : "retry",
                `Sprawdzanie zapisu · próba ${attempt}/${attempts}`,
                { keep:true }
            );
        }

        try {
            const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
            const response = await fetch(
                `${APPS_SCRIPT_URL}${separator}bookingOperationStatus=${encodeURIComponent(operationId)}&_op=${Date.now()}`,
                { method:"GET", cache:"no-store" }
            );
            if (!response.ok) throw new Error("HTTP " + response.status);
            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Nie udało się sprawdzić zapisu");
}

async function crmPostBookingAttemptV7(payload, attempt, total) {
    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            attempt === 1 ? "loading" : "retry",
            `Zapisywanie wizyty · próba ${attempt}/${total}`,
            { onClick: crmRestoreAppointmentEditorV7, keep:true }
        );
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 22000) : null;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method:"POST",
            headers:{ "Content-Type":"text/plain" },
            body:JSON.stringify(payload),
            signal:controller ? controller.signal : undefined
        });

        const text = await response.text();
        if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);

        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error("Serwer zwrócił nieprawidłową odpowiedź");
        }
    } finally {
        if (timer) clearTimeout(timer);
    }
}

function crmLocalInsertSavedAppointmentV7(payload, data) {
    if (payload.editFlag) return;

    const exists = (appointmentsData || []).some(item =>
        data?.eventId && String(item?.eventId || "") === String(data.eventId)
    );
    if (exists) return;

    appointmentsData = appointmentsData || [];
    appointmentsData.push({
        eventType:"appointment",
        date:payload.date,
        phone:payload.phone,
        name:payload.name,
        service:payload.service,
        duration:Number(payload.duration) || 45,
        status:"POTWIERDZONA",
        crmStatus:"POTWIERDZONA",
        eventId:data?.eventId || "",
        appointmentId:data?.appointmentId || "",
        bookingSource:data?.bookingSource || payload.bookingSource || "ADMIN",
        source:data?.bookingSource || payload.bookingSource || "ADMIN",
        requestId:data?.sourceRequestId || payload.sourceRequestId || "",
        firstVisit:Boolean(data?.firstVisit)
    });

    if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
    if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
}

async function crmFinishSuccessfulAppointmentSaveV7(payload, data) {
    crmWritePendingSaveV7(null);
    crmAppointmentSaveJobV7 = null;
    window.crmPendingContactRequestForBooking = null;
    window.crmPendingFirstVisitRequestForBooking = null;
    if (payload.firstVisitRequestId && typeof window.crmFirstVisitClearSelectionModeV8 === "function") {
        window.crmFirstVisitClearSelectionModeV8();
    }

    crmLocalInsertSavedAppointmentV7(payload, data);

    currentEditingAppointment = null;
    await closeCreateAppointmentModal(true);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus("save", "success", "Wizyta zapisana ✓");
    }
    if (typeof crmToast === "function") crmToast(payload.editFlag ? "Wizyta została zaktualizowana." : "Wizyta została dodana.");

    // Odświeżenia są osobnym zadaniem. Ich błąd NIE oznacza błędu zapisu.
    Promise.resolve().then(async () => {
        try {
            if (typeof crmRetryCalendarLightSyncV6 === "function") {
                await crmRetryCalendarLightSyncV6("po-zapisie-wizyty");
            } else if (typeof crmLightSyncCalendarData === "function") {
                await crmLightSyncCalendarData("po-zapisie-wizyty");
            }
        } catch (error) {
            console.warn("Wizyta zapisana, ale odświeżenie Kalendarza wymaga ponowienia:", error);
        }

        try {
            if (typeof crmLoadUnifiedInbox === "function") {
                await crmLoadUnifiedInbox({ silent:true, force:true });
            }
        } catch (error) {
            console.warn("Wizyta zapisana, Skrzynka odświeży się później:", error);
        }

        try {
            if (typeof renderDashboard === "function") renderDashboard();
            if (typeof calculateFinanceReport === "function") calculateFinanceReport();
        } catch (ignore) {}
    });
}

async function crmRunAppointmentSaveJobV7(job) {
    if (!job?.payload) return;
    crmAppointmentSaveJobV7 = job;
    crmWritePendingSaveV7(job);

    const total = 3;
    let lastNetworkError = null;

    for (let attempt = 1; attempt <= total; attempt += 1) {
        try {
            job.attempt = attempt;
            job.state = "saving";
            crmWritePendingSaveV7(job);

            const data = await crmPostBookingAttemptV7(job.payload, attempt, total);

            if (data?.success) {
                await crmFinishSuccessfulAppointmentSaveV7(job.payload, data);
                return;
            }

            // Błąd biznesowy — ponowienie go nie naprawi. Zachowujemy formularz.
            job.state = "attention";
            job.error = data?.error || "Nieznany błąd zapisu";
            crmWritePendingSaveV7(job);

            if (typeof crmSetBackgroundTaskStatus === "function") {
                crmSetBackgroundTaskStatus(
                    "save",
                    "attention",
                    `Wymaga poprawy: ${job.error} — kliknij, aby dokończyć`,
                    { onClick: crmRestoreAppointmentEditorV7, keep:true }
                );
            }

            crmRestoreAppointmentEditorV7();
            return;
        } catch (error) {
            lastNetworkError = error;

            // Zanim ponowimy, sprawdzamy czy Google mimo utraty odpowiedzi już zapisał wizytę.
            try {
                const status = await crmCheckBookingOperationV7(job.payload.operationId, { attempts:1 });
                if (status?.found) {
                    await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
                    return;
                }
            } catch (ignore) {}

            if (attempt < total) {
                await new Promise(resolve => setTimeout(resolve, attempt * 1200));
            }
        }
    }

    job.state = "unknown";
    job.error = lastNetworkError?.message || "Nie udało się potwierdzić zapisu";
    crmWritePendingSaveV7(job);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "error",
            "Nie udało się potwierdzić zapisu — kliknij, aby sprawdzić i dokończyć",
            {
                keep:true,
                onClick: async () => {
                    try {
                        const status = await crmCheckBookingOperationV7(job.payload.operationId, { attempts:5, showStatus:true });
                        if (status?.found) {
                            await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
                            return;
                        }
                    } catch (error) {
                        console.warn(error);
                    }
                    crmRestoreAppointmentEditorV7();
                }
            }
        );
    }
}

saveAppointment = async function() {
    if (isSavingAppointment) return;

    const name = String(document.getElementById("appointmentName")?.value || "").trim();
    const phone = String(document.getElementById("appointmentPhone")?.value || "").trim();
    const service = String(document.getElementById("appointmentService")?.value || "").trim();
    const duration = Number(document.getElementById("appointmentDuration")?.value || 45) || 45;
    const dateValue = String(document.getElementById("appointmentDateTime")?.value || "").trim();

    if (!name || !phone || !service || !dateValue) {
        if (typeof crmToast === "function") crmToast("Uzupełnij wszystkie pola wizyty.", "error");
        else alert("Uzupełnij wszystkie pola wizyty.");
        return;
    }

    const pendingFirstVisitRequest =
        (!currentEditingAppointment &&
         window.crmPendingFirstVisitRequestForBooking?.id)
            ? window.crmPendingFirstVisitRequestForBooking
            : null;

    const pendingContactRequest =
        (!currentEditingAppointment &&
         window.crmPendingContactRequestForBooking?.id)
            ? window.crmPendingContactRequestForBooking
            : null;

    const previousJob = crmReadPendingSaveV7();
    const sameDraft =
        previousJob?.draft &&
        previousJob.draft.name === name &&
        previousJob.draft.phone === phone &&
        previousJob.draft.service === service &&
        previousJob.draft.date === dateValue &&
        String(previousJob.draft.duration || "") === String(duration);

    const operationId =
        sameDraft && previousJob?.payload?.operationId
            ? previousJob.payload.operationId
            : crmOperationIdV7();

    const payload = {
        action:"createBooking",
        bookingSource: (pendingFirstVisitRequest || pendingContactRequest) ? "FORM_FIRST" : "ADMIN",
        phone,
        name,
        service,
        date:dateValue,
        duration,
        rodo: currentEditingAppointment ? "Edytowano z CRM" : "Dodano z CRM",
        operationId
    };

    if (pendingFirstVisitRequest) {
        payload.firstVisitRequestId = pendingFirstVisitRequest.id;
        payload.sourceRequestId = pendingFirstVisitRequest.id;
    } else if (pendingContactRequest) {
        payload.contactRequestId = pendingContactRequest.id;
        payload.sourceRequestId = pendingContactRequest.id;
    }

    if (currentEditingAppointment) {
        const oldEventId = currentEditingAppointment.eventId || "";
        if (!oldEventId) {
            if (typeof crmToast === "function") crmToast("Brakuje Event ID. Odśwież Kalendarz i spróbuj ponownie.", "error");
            return;
        }
        payload.editFlag = true;
        payload.oldEventId = oldEventId;
        payload.oldDate = currentEditingAppointment.date;
        payload.oldName = currentEditingAppointment.name;
    }

    const job = {
        version:7,
        createdAt:Date.now(),
        state:"saving",
        attempt:0,
        draft:{ name, phone, service, duration:String(duration), date:dateValue },
        payload
    };

    isSavingAppointment = true;
    const saveBtn = document.getElementById("saveAppointmentBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Zapisywanie w tle…";
    }

    crmEnsureAppointmentMinimizeButtonV7();

    try {
        await crmRunAppointmentSaveJobV7(job);
    } finally {
        isSavingAppointment = false;
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Zapisz wizytę";
        }
    }
};

async function crmRecoverPendingAppointmentSaveV7() {
    const job = crmReadPendingSaveV7();
    if (!job?.payload?.operationId) return;

    crmAppointmentSaveJobV7 = job;

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "loading",
            "Sprawdzam niedokończony zapis po odświeżeniu…",
            { keep:true }
        );
    }

    try {
        const status = await crmCheckBookingOperationV7(job.payload.operationId, {
            attempts:5,
            showStatus:true
        });

        if (status?.found) {
            await crmFinishSuccessfulAppointmentSaveV7(job.payload, status);
            return;
        }
    } catch (error) {
        console.warn("Odzyskanie zapisu:", error);
    }

    crmApplyAppointmentDraftV7(job.draft);

    if (typeof crmSetBackgroundTaskStatus === "function") {
        crmSetBackgroundTaskStatus(
            "save",
            "pending",
            "Niedokończony zapis wizyty — kliknij, aby dokończyć",
            {
                keep:true,
                onClick: () => {
                    crmRestoreAppointmentEditorV7();
                    const title = document.getElementById("modalTitleAppointment");
                    if (title) title.textContent = "Dokończ zapis wizyty";
                }
            }
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureAppointmentMinimizeButtonV7();
        crmRecoverPendingAppointmentSaveV7().catch(console.error);
    }, 2600);
});

/* KONIEC VISITS RELIABILITY V7 */

/* VISITS FIRST VISIT V8 — zamknięcie formularza nie zamyka samego zgłoszenia. */
if (typeof closeCreateAppointmentModal === "function") {
    const crmCloseCreateAppointmentModalBeforeFirstVisitV8 = closeCreateAppointmentModal;
    closeCreateAppointmentModal = async function(forceClose) {
        const hadFirstVisit = Boolean(window.crmPendingFirstVisitRequestForBooking?.id);
        const result = await crmCloseCreateAppointmentModalBeforeFirstVisitV8.apply(this, arguments);
        const modal = document.getElementById("appointmentModal");
        const closed = !modal || modal.style.display === "none";
        if (hadFirstVisit && closed && !isSavingAppointment) {
            window.crmPendingFirstVisitRequestForBooking = null;
        }
        return result;
    };
}
/* KONIEC VISITS FIRST VISIT V8 */


/* ==========================================================================
   ADMIN UX V17.2 — PANELE + DOLNY DOCK 2026-08-19

   1) Minimalizacja Dodaj/Edytuj wizytę zostawia małą kartę na dole.
   2) Zablokuj czas / Dodaj wolne dostaje taki sam boczny panel i minimalizację.
   3) Można mieć dwa zachowane szkice; dock pokazuje osobne karty.
   ========================================================================== */

function crmV172EnsureMinimizedDock() {
    let dock = document.getElementById("crmMinimizedPanelDockV172");
    if (dock) return dock;

    dock = document.createElement("div");
    dock.id = "crmMinimizedPanelDockV172";
    dock.setAttribute("aria-live", "polite");
    document.body.appendChild(dock);
    return dock;
}

function crmV172SetDockItem(kind, title, detail, onClick) {
    const dock = crmV172EnsureMinimizedDock();
    const id = `crmMinimizedDock_${kind}_V172`;

    let button = document.getElementById(id);
    if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "crm-minimized-dock-item-v172";
        dock.appendChild(button);
    }

    button.innerHTML = "";

    const icon = document.createElement("span");
    icon.className = "crm-minimized-dock-icon-v172";
    icon.textContent = kind === "block" ? "🔒" : "📅";

    const copy = document.createElement("span");
    copy.className = "crm-minimized-dock-copy-v172";

    const strong = document.createElement("strong");
    strong.textContent = title || (kind === "block" ? "Blokowanie" : "Rezerwacja");

    const small = document.createElement("small");
    small.textContent = detail || "Kliknij, aby wrócić";

    copy.appendChild(strong);
    copy.appendChild(small);

    button.appendChild(icon);
    button.appendChild(copy);

    button.onclick = typeof onClick === "function" ? onClick : null;
    button.style.display = "flex";
    dock.hidden = false;

    return button;
}

function crmV172ClearDockItem(kind) {
    const button = document.getElementById(`crmMinimizedDock_${kind}_V172`);
    if (button) button.remove();

    const dock = document.getElementById("crmMinimizedPanelDockV172");
    if (dock && !dock.querySelector(".crm-minimized-dock-item-v172")) {
        dock.hidden = true;
    }
}

function crmV172ShortDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return raw;
    return `${match[3]}.${match[2]}.${match[1]}`;
}

function crmV172AppointmentDockDetail() {
    const name = String(document.getElementById("appointmentName")?.value || "").trim();
    const heading = String(document.getElementById("modalTitleAppointment")?.textContent || "").trim();
    if (name) return name;
    if (/edytuj/i.test(heading)) return "Edycja wizyty";
    return "Nowa wizyta";
}

function crmV172BlockDockDetail() {
    const date = crmV172ShortDate(document.getElementById("block-date")?.value);
    const start = String(document.getElementById("block-start-time")?.value || "").trim();
    const end = String(document.getElementById("block-end-time")?.value || "").trim();
    const title = String(document.getElementById("block-title")?.value || "").trim();

    const time = start && end ? `${start}–${end}` : (start || end);
    const parts = [date, time].filter(Boolean);
    if (parts.length) return parts.join(" · ");
    return title || "Blokada czasu";
}

/* --- REZERWACJA: nowy dock zamiast znikania formularza bez śladu. --- */
if (typeof crmMinimizeAppointmentEditorV7 === "function") {
    crmMinimizeAppointmentEditorV7 = function() {
        const modal = document.getElementById("appointmentModal");
        if (!modal) return;

        modal.dataset.crmMinimized = "1";
        modal.style.display = "none";

        const oldStatus = document.getElementById("crmTaskStatusSave");
        if (oldStatus) oldStatus.style.display = "none";

        crmV172SetDockItem(
            "appointment",
            isSavingAppointment ? "Rezerwacja · zapisywanie…" : "Rezerwacja",
            crmV172AppointmentDockDetail(),
            crmRestoreAppointmentEditorV7
        );
    };
    window.crmMinimizeAppointmentEditorV7 = crmMinimizeAppointmentEditorV7;
}

if (typeof crmRestoreAppointmentEditorV7 === "function") {
    crmRestoreAppointmentEditorV7 = function() {
        const modal = document.getElementById("appointmentModal");
        if (!modal) return;

        const blockModal = document.getElementById("blockTimeModal");
        if (blockModal && blockModal.style.display !== "none") {
            crmMinimizeBlockTimeEditorV172();
        }

        modal.dataset.crmMinimized = "0";
        modal.style.display = "flex";
        crmV172ClearDockItem("appointment");
    };
    window.crmRestoreAppointmentEditorV7 = crmRestoreAppointmentEditorV7;
}

/* Po realnym zamknięciu/zapisie usuwamy kartę Rezerwacja z dołu. */
if (typeof closeCreateAppointmentModal === "function") {
    const crmV172CloseCreateAppointmentBefore = closeCreateAppointmentModal;

    closeCreateAppointmentModal = async function() {
        const result = await crmV172CloseCreateAppointmentBefore.apply(this, arguments);
        const modal = document.getElementById("appointmentModal");
        const hidden = !modal || modal.style.display === "none";
        const minimized = modal?.dataset.crmMinimized === "1";

        if (hidden && (!minimized || !crmAppointmentSaveJobV7)) {
            if (modal) modal.dataset.crmMinimized = "0";
            crmV172ClearDockItem("appointment");
        }
        return result;
    };
}

/* --- BLOKADA: taki sam minus jak w Rezerwacji. --- */
function crmEnsureBlockTimeMinimizeButtonV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return null;

    let button = document.getElementById("crmBlockTimeMinimizeBtnV172");
    if (button) return button;

    const header = modal.querySelector(".modal-header");
    const close = header?.querySelector(".modal-close");
    if (!header) return null;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmBlockTimeMinimizeBtnV172";
    button.className = "crm-panel-minimize-v172";
    button.title = "Zwiń blokowanie czasu";
    button.setAttribute("aria-label", "Zwiń blokowanie czasu");
    button.textContent = "—";
    button.onclick = crmMinimizeBlockTimeEditorV172;

    if (close) header.insertBefore(button, close);
    else header.appendChild(button);

    return button;
}

function crmMinimizeBlockTimeEditorV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return;

    modal.dataset.crmMinimized = "1";
    modal.style.display = "none";

    crmV172SetDockItem(
        "block",
        "Blokowanie",
        crmV172BlockDockDetail(),
        crmRestoreBlockTimeEditorV172
    );
}

function crmRestoreBlockTimeEditorV172() {
    const modal = document.getElementById("blockTimeModal");
    if (!modal) return;

    const appointmentModal = document.getElementById("appointmentModal");
    if (appointmentModal && appointmentModal.style.display !== "none") {
        crmMinimizeAppointmentEditorV7();
    }

    modal.dataset.crmMinimized = "0";
    modal.style.display = "flex";
    crmV172ClearDockItem("block");
}

window.crmMinimizeBlockTimeEditorV172 = crmMinimizeBlockTimeEditorV172;
window.crmRestoreBlockTimeEditorV172 = crmRestoreBlockTimeEditorV172;

/* Każde otwarcie Blokady ma już przycisk minimalizacji. */
if (typeof openBlockTimeModal === "function") {
    const crmV172OpenBlockTimeBefore = openBlockTimeModal;
    openBlockTimeModal = function() {
        const result = crmV172OpenBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        crmEnsureBlockTimeMinimizeButtonV172();
        return result;
    };
}

if (typeof openEditBlockTimeModal === "function") {
    const crmV172OpenEditBlockTimeBefore = openEditBlockTimeModal;
    openEditBlockTimeModal = function() {
        const result = crmV172OpenEditBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        crmEnsureBlockTimeMinimizeButtonV172();
        return result;
    };
}

/* Anuluj/zapis Blokady usuwa jej kartę z docka. */
if (typeof closeBlockTimeModal === "function") {
    const crmV172CloseBlockTimeBefore = closeBlockTimeModal;
    closeBlockTimeModal = function() {
        const result = crmV172CloseBlockTimeBefore.apply(this, arguments);
        const modal = document.getElementById("blockTimeModal");
        if (modal) modal.dataset.crmMinimized = "0";
        crmV172ClearDockItem("block");
        return result;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmEnsureBlockTimeMinimizeButtonV172();
    }, 100);
});

window.crmAdminPanelsVersionV172 = "17.2-details-insights-block-dock";

/* KONIEC ADMIN UX V17.2 */


/* ==========================================================================
   ADMIN UX V17.3 — INTELIGENTNY UKŁAD PRAWYCH PANELI
   2026-08-19

   Zasady:
   - kliknięcie dnia w Miesiącu zawsze pokazuje „Dane z dnia”;
   - „Dane z dnia” mają własny X;
   - 2 otwarte panele: obok siebie;
   - 3 otwarte panele:
       [Wszystkie wizyty] [Szczegóły wizyty]
                          [Dane z dnia]
   - zamknięcie dowolnego panelu automatycznie przelicza układ.
   ========================================================================== */

let crmV173InsightsUserHidden = false;

function crmV173IsVisible(node) {
    if (!node) return false;
    if (node.hidden) return false;
    if (node.style.display === "none") return false;
    return true;
}

function crmV173InsightsPanel() {
    if (typeof crmEnsureCalendarInsights === "function") {
        return crmEnsureCalendarInsights();
    }
    return document.getElementById("crmCalendarInsights");
}

function crmV173EnsureInsightsClose() {
    const panel = crmV173InsightsPanel();
    if (!panel) return null;

    panel.classList.add("crm-v173-insights-panel");

    let button = document.getElementById("crmInsightsCloseV173");
    if (button) return button;

    button = document.createElement("button");
    button.type = "button";
    button.id = "crmInsightsCloseV173";
    button.className = "crm-v173-insights-close";
    button.textContent = "×";
    button.title = "Zamknij dane z dnia";
    button.setAttribute("aria-label", "Zamknij dane z dnia");

    button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        crmV173SetInsightsVisible(false, true);
    };

    panel.appendChild(button);
    return button;
}

function crmV173SetInsightsVisible(visible, userAction = false) {
    const panel = crmV173InsightsPanel();
    if (!panel) return;

    if (visible) {
        crmV173InsightsUserHidden = false;
        panel.hidden = false;
        panel.classList.remove("crm-v173-user-hidden");
        document.body.classList.remove("crm-v173-insights-hidden");
        document.body.classList.add("crm-v173-insights-open");
        crmV173EnsureInsightsClose();
    } else {
        if (userAction) crmV173InsightsUserHidden = true;
        panel.classList.add("crm-v173-user-hidden");
        document.body.classList.remove("crm-v173-insights-open");
        document.body.classList.add("crm-v173-insights-hidden");
    }

    crmV173UpdateRightPanels();
}

function crmV173UpdateRightPanels() {
    const body = document.body;
    if (!body) return;

    const details = document.getElementById("appointmentDetailsModal");
    const dayOverlay = document.getElementById("crmDayVisitsOverlay");
    const insights = document.getElementById("crmCalendarInsights");

    const detailsOpen = crmV173IsVisible(details);
    const dayListOpen = crmV173IsVisible(dayOverlay);
    const insightsOpen =
        crmV173IsVisible(insights) &&
        !insights?.classList.contains("crm-v173-user-hidden");

    body.classList.toggle("crm-v173-details-open", detailsOpen);
    body.classList.toggle("crm-v173-day-list-open", dayListOpen);
    body.classList.toggle("crm-v173-insights-open", insightsOpen);
    body.classList.toggle("crm-v173-insights-hidden", !insightsOpen);
    body.classList.toggle(
        "crm-v173-three-right-panels",
        detailsOpen && dayListOpen && insightsOpen
    );
}

function crmV173MarkSelectedMonthCell(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return;

    const pad = value => String(value).padStart(2, "0");
    const key =
        date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate());

    document.querySelectorAll(".crm-month-cell.is-selected")
        .forEach(node => node.classList.remove("is-selected"));

    const cell = document.querySelector(
        `.crm-month-cell[data-date="${key}"]`
    );
    if (cell) cell.classList.add("is-selected");
}

function crmV173SelectDateForInsights(date, options = {}) {
    const next = new Date(date);
    if (Number.isNaN(next.getTime())) return;

    selectedCalendarDate = new Date(next);

    if (typeof miniMonthDate !== "undefined") {
        miniMonthDate = new Date(next);
    }

    crmV173SetInsightsVisible(true);

    if (typeof crmFinalV3RenderInsights === "function") {
        crmFinalV3RenderInsights();
    } else if (typeof crmRenderCalendarInsights === "function") {
        crmRenderCalendarInsights();
    }

    if (typeof renderMiniMonthCalendar === "function") {
        renderMiniMonthCalendar();
    }

    crmV173MarkSelectedMonthCell(next);

    if (options.renderCalendar && typeof renderBooksyCalendar === "function") {
        renderBooksyCalendar();
    }

    requestAnimationFrame(() => {
        crmV173EnsureInsightsClose();
        crmV173UpdateRightPanels();
    });
}

/* Kliknięcie zwykłego dnia w Miesiącu: panel dnia musi się pojawić. */
if (typeof crmFinalV3SelectDate === "function") {
    const crmV173SelectDateBefore = crmFinalV3SelectDate;
    crmFinalV3SelectDate = function(date) {
        crmV173SetInsightsVisible(true);
        const result = crmV173SelectDateBefore.apply(this, arguments);
        requestAnimationFrame(() => {
            crmV173EnsureInsightsClose();
            crmV173UpdateRightPanels();
        });
        return result;
    };
}

/* Przełączenie na Miesiąc również przywraca panel wybranego dnia. */
if (typeof setCalendarView === "function") {
    const crmV173SetCalendarViewBefore = setCalendarView;
    setCalendarView = function(mode) {
        const result = crmV173SetCalendarViewBefore.apply(this, arguments);

        if (String(mode || "").toLowerCase() === "month") {
            crmV173SetInsightsVisible(true);
            requestAnimationFrame(() => {
                if (typeof crmFinalV3RenderInsights === "function") {
                    crmFinalV3RenderInsights();
                }
                crmV173EnsureInsightsClose();
                crmV173UpdateRightPanels();
            });
        }

        return result;
    };
}

/*
 * +N pozostałe / Wszystkie wizyty:
 * oprócz otwarcia listy wybieramy ten sam dzień dla „Danych z dnia”.
 */
if (typeof crmOpenDayVisitsList === "function") {
    const crmV173OpenDayVisitsBefore = crmOpenDayVisitsList;
    crmOpenDayVisitsList = function(date) {
        crmV173SelectDateForInsights(date);
        const result = crmV173OpenDayVisitsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

if (typeof crmCloseDayVisitsList === "function") {
    const crmV173CloseDayVisitsBefore = crmCloseDayVisitsList;
    crmCloseDayVisitsList = function() {
        const result = crmV173CloseDayVisitsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

/* Szczegóły wizyty / zewnętrznego wydarzenia przeliczają układ po otwarciu. */
if (typeof openAppointmentDetailsModal === "function") {
    const crmV173OpenDetailsBefore = openAppointmentDetailsModal;
    openAppointmentDetailsModal = function(item) {
        if (item?.date) {
            const date = typeof crmDayEventDate === "function"
                ? crmDayEventDate(item)
                : new Date(item.date);

            if (date && !Number.isNaN(date.getTime())) {
                crmV173SelectDateForInsights(date);
            }
        }

        const result = crmV173OpenDetailsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

if (typeof closeAppointmentModal === "function") {
    const crmV173CloseDetailsBefore = closeAppointmentModal;
    closeAppointmentModal = function() {
        const result = crmV173CloseDetailsBefore.apply(this, arguments);
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

/* Każde odświeżenie danych dnia przywraca X i poprawny układ. */
if (typeof crmFinalV3RenderInsights === "function") {
    const crmV173RenderInsightsBefore = crmFinalV3RenderInsights;
    crmFinalV3RenderInsights = function() {
        const result = crmV173RenderInsightsBefore.apply(this, arguments);
        crmV173EnsureInsightsClose();
        requestAnimationFrame(crmV173UpdateRightPanels);
        return result;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmV173EnsureInsightsClose();
        crmV173UpdateRightPanels();
    }, 300);
});

window.crmAdminRightPanelsVersionV173 =
    "17.3-month-day-data-smart-right-panels";

/* KONIEC ADMIN UX V17.3 */


/* ==========================================================================
   ADMIN UX V17.6 — ŹRÓDŁO WIZYTY W WIERSZU KLIENTA
   2026-08-19
   ========================================================================== */

/*
 * Oryginalna logika tworzy #crmVisitSourceBadge w zielonym nagłówku.
 * Po uproszczeniu karty klienta badge nie powinien już wisieć pod nagłówkiem.
 * Przenosimy go do wiersza klienta po każdym odświeżeniu panelu.
 */
if (typeof crmApplyVisitPanelBusinessRules === "function") {
    const crmV176ApplyVisitPanelBusinessRulesBefore =
        crmApplyVisitPanelBusinessRules;

    crmApplyVisitPanelBusinessRules = function(app) {
        const result =
            crmV176ApplyVisitPanelBusinessRulesBefore.apply(this, arguments);

        const badge = document.getElementById("crmVisitSourceBadge");
        const clientCard = document.querySelector(
            "#appointmentDetailsModal .crm-safe-client-card"
        );

        if (badge && clientCard) {
            badge.classList.add("crm-v176-source-badge");
            clientCard.appendChild(badge);
        }

        return result;
    };
}

window.crmAdminDetailsVersionV176 =
    "17.6-source-badge-client-row";

/* KONIEC ADMIN UX V17.6 */


/* ==========================================================================
   ADMIN PANELS — CLEAN FINAL
   2026-08-19

   JEDYNA ZASADA:
   - Dodaj wizytę / Zablokuj czas: panel po prawej;
   - Szczegóły wizyty: panel po lewej;
   - żadnego automatycznego zwijania Szczegółów;
   - dolny dock tylko dla ręcznie zwijanych formularzy.
   ========================================================================== */

function crmPanelsCleanIsVisible(node) {
    if (!node || node.hidden) return false;
    const style = getComputedStyle(node);
    return style.display !== "none" &&
           style.visibility !== "hidden" &&
           Number(style.opacity || 1) !== 0;
}

function crmPanelsCleanUpdateLayout() {
    const details = document.getElementById("appointmentDetailsModal");
    const appointment = document.getElementById("appointmentModal");
    const block = document.getElementById("blockTimeModal");

    const detailsOpen = crmPanelsCleanIsVisible(details);
    const actionOpen =
        crmPanelsCleanIsVisible(appointment) ||
        crmPanelsCleanIsVisible(block);

    document.body.classList.toggle(
        "crm-final2-action-details",
        detailsOpen && actionOpen
    );

    /*
     * „Szczegóły wizyty” nie są już elementem automatycznego docka.
     * Jeśli po starej wersji istnieje taka karta w DOM, usuń ją.
     */
    const staleDetailsDock =
        document.getElementById("crmMinimizedDock_details_V172");

    if (staleDetailsDock) {
        staleDetailsDock.remove();
    }
}

/* Szczegóły: po otwarciu tylko przelicz układ. */
if (typeof openAppointmentDetailsModal === "function") {
    const crmPanelsCleanOpenDetailsBefore =
        openAppointmentDetailsModal;

    openAppointmentDetailsModal = function() {
        const result =
            crmPanelsCleanOpenDetailsBefore.apply(this, arguments);

        requestAnimationFrame(() => {
            crmPanelsCleanUpdateLayout();
        });

        return result;
    };
}

/* Szczegóły: po zamknięciu tylko przelicz układ. */
if (typeof closeAppointmentModal === "function") {
    const crmPanelsCleanCloseDetailsBefore =
        closeAppointmentModal;

    closeAppointmentModal = function() {
        const result =
            crmPanelsCleanCloseDetailsBefore.apply(this, arguments);

        requestAnimationFrame(() => {
            crmPanelsCleanUpdateLayout();
        });

        return result;
    };
}

function crmPanelsCleanWatch(node) {
    if (!node || node.dataset.crmPanelsCleanWatch === "1") return;

    node.dataset.crmPanelsCleanWatch = "1";

    new MutationObserver(() => {
        requestAnimationFrame(
            crmPanelsCleanUpdateLayout
        );
    }).observe(node, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
    });
}

window.addEventListener("resize", () => {
    requestAnimationFrame(
        crmPanelsCleanUpdateLayout
    );
});

document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
        crmPanelsCleanWatch(
            document.getElementById("appointmentDetailsModal")
        );
        crmPanelsCleanWatch(
            document.getElementById("appointmentModal")
        );
        crmPanelsCleanWatch(
            document.getElementById("blockTimeModal")
        );

        crmPanelsCleanUpdateLayout();
    }, 250);
});

window.crmAdminPanelsCleanFinal =
    "details-left-action-right-no-auto-dock";

/* KONIEC ADMIN PANELS — CLEAN FINAL */

