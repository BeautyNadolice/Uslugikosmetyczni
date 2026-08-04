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

            alert(
                currentEditingAppointment
                    ? "Wizyta została zaktualizowana."
                    : "Wizyta została dodana."
            );

            currentEditingAppointment =
                null;

            closeCreateAppointmentModal();

            await loadSettings();

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
function closeCreateAppointmentModal(){

    document.getElementById(
        "appointmentModal"
    ).style.display =
        "none";

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
    if (editBtn) editBtn.style.display = (isBlock || isExternal || isWorkShift) ? "none" : "inline-block";
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
                        "blockTime",
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
            alert(
                "Czas został zablokowany."
            );

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
    await loadSystem();
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
        await crmRefreshAllViews();
        crmToast(successText);
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

/* ----- VIS.37. crmFindServiceForVisit (oryginalna linia 4579) ----- */
function crmFindServiceForVisit(item) {
    const wanted = crmNormalizeServiceName(item && item.service);
    if (!wanted) return null;
    return currentServices.find(service => crmNormalizeServiceName(service && service.name) === wanted) || null;
}

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

/* ----- VIS.51. crmPopulateNewVisitPanel (oryginalna linia 5754) ----- */
function crmPopulateNewVisitPanel(app) {
    const isAppointment = app?.eventType === "appointment";
    const isExternal = app?.eventType === "external";
    const date = crmParseVisitDate(app?.date);
    const duration = Math.max(0, Number(app?.duration) || 0);
    const end = date ? new Date(date.getTime() + duration * 60000) : null;
    const service = crmFindServiceForVisit(app);
    const name = crmEscapePanelValue(app?.name, isAppointment ? "Klient" : "Wydarzenie");

    setText("details-name", name);
    setText("details-phone", crmEscapePanelValue(app?.phone || app?.phoneNumber || app?.clientPhone, isAppointment ? "Brak numeru telefonu" : "Dane kontaktowe niedostępne"));
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
    if (raw.includes("BOOKSY")) return { code:"BOOKSY", label:"Wizyta zaimportowana z Booksy", manual:false };
    if (raw.includes("GOOGLE") || phone === "GOOGLE CALENDAR") return { code:"GOOGLE", label:"Wizyta dodana ręcznie w Google Calendar", manual:true };
    if (raw.includes("ADMIN") || raw.includes("MISTRZYNI") || raw.includes("MASTER")) return { code:"ADMIN", label:"Wizyta dodana ręcznie w ADMIN", manual:true };
    if (raw.includes("INDEX") || raw.includes("ONLINE") || raw.includes("CLIENT") || raw.includes("KLIENT")) return { code:"ONLINE", label:"Klient zarezerwował online", manual:false };
    return { code:"ONLINE", label:"Klient zarezerwował online", manual:false };
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
    if (sourceNode) sourceNode.textContent = source.label;
    const reservationId = document.getElementById("crmVisitReservationId");
    if (reservationId) reservationId.hidden = true;
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
          <button type="button" onclick="crmVisitStatusAction('CANCEL_CLIENT')">Anulowana przez klienta</button>
          <button type="button" onclick="crmVisitStatusAction('CANCEL_SALON')">Anulowana przez salon</button>
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
          <div><i class="crm-info-icon" data-icon="client" aria-hidden="true"></i><span>KLIENT</span><strong id="crmInfoClient">—</strong></div>
          <div><i class="crm-info-icon" data-icon="service" aria-hidden="true"></i><span>USŁUGA</span><strong id="crmInfoService">—</strong></div>
          <div><i class="crm-info-icon" data-icon="date" aria-hidden="true"></i><span>DATA I GODZINA</span><strong id="details-datetime">—</strong></div>
          <div><i id="crmInfoSourceIcon" class="crm-info-icon" data-icon="online" aria-hidden="true"></i><span>ŹRÓDŁO REZERWACJI</span><strong id="crmInfoSource" class="crm-info-source-pill">—</strong></div>
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
openAppointmentDetailsModal = function(app) {
    const calendarTab = document.getElementById("tab-kalendarz");
    if (!calendarTab || getComputedStyle(calendarTab).display === "none") return;
    crmInstallSafeRightVisitPanel();
    crmSafeOpenAppointmentOriginal(app);
    if (typeof crmPopulateNewVisitPanel === "function") crmPopulateNewVisitPanel(app);
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
   ADMIN FINAL 2026-08-04: STATUS WIZYTY, KOSZ I BLOKADY
   ========================================================================== */
function crmFinalTrashSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path></svg>';}
function crmFinalCloseMenus(){document.querySelectorAll(".crm-final-trash-menu").forEach(x=>x.remove());}
async function crmFinalLifecycle(operation,initiator,deleteCalendarEvent){
  const a=currentEditingAppointment;if(!a||a.eventType!=="appointment")return;
  const key="lifecycle:"+(a.eventId||a.date)+":"+operation+":"+initiator;if(!crmOperationStart(key))return;
  try{const ok=await crmConfirm(operation==="ANULOWANIE"?"Potwierdzić anulowanie tej wizyty?":"Potwierdzić zmianę statusu wizyty?","Potwierdź");if(!ok)return;
    const r=await crmExtendedPost("recordAppointmentLifecycle",{eventId:a.eventId,phone:a.phone,clientName:a.name,service:a.service,operation,initiator,oldDate:a.date,newDate:"",reason:"",deleteCalendarEvent:Boolean(deleteCalendarEvent)});if(!r||!r.success)throw new Error(r?.error||"Operacja nie została zapisana");crmToast("Operacja została zapisana.");crmSetUnsavedChanges(false);closeAppointmentModal();await loadSettings();}
  catch(e){crmToast(e.message||String(e),"error");}finally{crmOperationEnd(key);}
}
function crmFinalOpenTrashMenu(button,item){crmFinalCloseMenus();const menu=document.createElement("div");menu.className="crm-final-trash-menu";
  if(item.eventType==="appointment")menu.innerHTML='<button type="button" data-client>Anulowana przez klienta</button><button type="button" data-salon>Anulowana przez salon</button>';
  else if(item.eventType==="block")menu.innerHTML='<button type="button" data-block>Usuń blokadę</button>';
  button.parentElement.appendChild(menu);menu.querySelector("[data-client]")?.addEventListener("click",()=>crmFinalLifecycle("ANULOWANIE","KLIENT",true));menu.querySelector("[data-salon]")?.addEventListener("click",()=>crmFinalLifecycle("ANULOWANIE","SALON",true));menu.querySelector("[data-block]")?.addEventListener("click",()=>crmFinalDeleteBlockOnce());
}
function crmFinalDecorateVisitPanel(item){
  const header=document.querySelector("#appointmentDetailsModal .crm-safe-header,#appointmentDetailsModal .crm-visit-panel__header");if(!header||!item)return;
  header.querySelector(".crm-final-trash")?.remove();crmFinalCloseMenus();
  const statusBtn=header.querySelector("#crmVisitStatusButton,.crm-safe-status-btn,.crm-status-button");
  if(item.eventType==="appointment"&&statusBtn){statusBtn.textContent="Status wizyty";const menu=header.querySelector(".crm-safe-status-menu,.crm-status-menu");if(menu){menu.innerHTML='<button type="button" data-noshow>Nieobecność</button><button type="button" data-move>Przenieś na inny termin</button>';menu.querySelector("[data-noshow]").onclick=()=>crmFinalLifecycle("NIEOBECNOSC","SALON",false);menu.querySelector("[data-move]").onclick=()=>{closeAppointmentModal();openCreateAppointmentModal();setTimeout(()=>{document.getElementById("appointmentName").value=item.name||"";document.getElementById("appointmentPhone").value=item.phone||"";document.getElementById("appointmentService").value=item.service||"";crmSetUnsavedChanges(true,"przenoszeniu wizyty");crmToast("Wybierz nowy termin. Stary termin pozostanie bez zmian do zapisu.");},0);};}}
  if(item.eventType!=="appointment"&&statusBtn)statusBtn.hidden=true;
  if(item.eventType==="appointment"||item.eventType==="block"){const b=document.createElement("button");b.type="button";b.className="crm-final-trash";b.setAttribute("aria-label",item.eventType==="block"?"Usuń blokadę":"Anuluj wizytę");b.innerHTML=crmFinalTrashSvg();b.onclick=()=>crmFinalOpenTrashMenu(b,item);header.appendChild(b);}
  document.querySelector("#appointmentDetailsModal .crm-safe-add-service")?.setAttribute("hidden","");
}
const crmFinalOpenAppointmentDetailsOriginal=openAppointmentDetailsModal;
openAppointmentDetailsModal=function(item){const r=crmFinalOpenAppointmentDetailsOriginal.apply(this,arguments);setTimeout(()=>crmFinalDecorateVisitPanel(item),0);return r;};
/* KONIEC ADMIN FINAL: STATUS WIZYTY, KOSZ I BLOKADY */


/* ========================================================================== ADMIN FINAL V2: KOREKTY PO TESTACH ========================================================================== */
async function crmFinalDeleteBlockOnce(){
  const block=currentEditingAppointment;if(!block||block.eventType!=="block")return;
  crmFinalCloseMenus();const key="delete-block:"+(block.eventId||block.date);if(!crmOperationStart(key))return;
  try{const ok=await crmConfirm(`Usunąć blokadę czasu ${crmFormatVisitTime(crmParseVisitDate(block.date))}–${crmFormatVisitTime(crmParseVisitDate(block.endDate))}?`,"Usuń blokadę");if(!ok)return;
    const response=await fetch(APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify({action:"deleteBlockTime",eventId:block.eventId||"",start:block.date||"",end:block.endDate||"",title:block.name||""})});
    const data=await response.json();if(!data.success)throw new Error(data.error||"Nieznany błąd");appointmentsData=appointmentsData.filter(x=>!(block.eventId&&x.eventId===block.eventId));currentEditingAppointment=null;closeAppointmentModal();crmToast("Blokada czasu została usunięta.");await loadSettings();
  }catch(error){crmToast("Błąd usuwania blokady: "+(error.message||error),"error");}finally{crmOperationEnd(key);}
}
function crmFinalInfoIconSvg(kind){const paths={client:'<circle cx="12" cy="8" r="3"></circle><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"></path><path d="m17 10 1.7 1.7L22 8.5"></path>',service:'<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z"></path><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"></path>',date:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path><circle cx="15.5" cy="15.5" r="2.5"></circle><path d="M15.5 14v1.7l1 .6"></path>',online:'<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"></path>',admin:'<circle cx="9" cy="8" r="3"></circle><path d="M3 20c.7-4 2.7-6 6-6 2 0 3.5.7 4.5 2"></path><path d="m15 18 2 2 4-5"></path>',google:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18M15 15h4M17 13v4"></path>',booksy:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path><path d="M12 18s-3-1.7-3-3.7c0-2 2.5-2.5 3-.7.5-1.8 3-1.3 3 .7 0 2-3 3.7-3 3.7z"></path>'};return `<svg viewBox="0 0 24 24">${paths[kind]||paths.online}</svg>`;}
function crmFinalEnhanceInfoTab(app){document.querySelectorAll("#crmInfoTabContent .crm-info-icon").forEach(i=>i.innerHTML=crmFinalInfoIconSvg(i.dataset.icon));const source=crmVisitSourceInfo(app);const icon=document.getElementById("crmInfoSourceIcon");if(icon){icon.dataset.icon=source.code==="BOOKSY"?"booksy":source.code==="GOOGLE"?"google":source.code==="ADMIN"?"admin":"online";icon.innerHTML=crmFinalInfoIconSvg(icon.dataset.icon);}const date=document.getElementById("details-datetime");const d=crmParseVisitDate(app?.date);if(date&&d)date.textContent=new Intl.DateTimeFormat("pl-PL",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
const crmFinalOpenAfterTests=openAppointmentDetailsModal;
openAppointmentDetailsModal=function(item){const r=crmFinalOpenAfterTests.apply(this,arguments);setTimeout(()=>crmFinalEnhanceInfoTab(item),0);return r;};
document.addEventListener("pointerdown",event=>{const status=document.getElementById("crmVisitStatusMenu");const statusBtn=document.getElementById("crmVisitStatusButton");if(status&&!status.hidden&&!status.contains(event.target)&&!statusBtn?.contains(event.target))status.hidden=true;const trash=document.querySelector(".crm-final-trash-menu");if(trash&&!trash.contains(event.target)&&!event.target.closest(".crm-final-trash"))trash.remove();},true);
document.addEventListener("keydown",event=>{if(event.key!=="Escape")return;crmToggleVisitStatusMenu(false);crmFinalCloseMenus();});
/* KONIEC ADMIN FINAL V2 */
