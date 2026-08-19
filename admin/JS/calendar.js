/* ==========================================================================
   CAL. KALENDARZ
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CAL.1. globalColors (oryginalna linia 27) ----- */
let globalColors = {};

/* ----- CAL.2. selectedCalendarDate (oryginalna linia 32) ----- */
let selectedCalendarDate = new Date();

/* Miesiac ogladany niezaleznie od swiadomie wybranego dnia. */
let displayedCalendarMonth = new Date(selectedCalendarDate);

/* ----- CAL.3. miniMonthDate (oryginalna linia 33) ----- */
let miniMonthDate = new Date();

/* ----- CAL.4. calendarViewMode (oryginalna linia 34) ----- */
let calendarViewMode = "day";

/* ----- CAL.5. getFormattedISOBlockDate (oryginalna linia 462) ----- */
function getFormattedISOBlockDate(dateObj){

    return (
        dateObj.getFullYear()
        +
        "-"
        +
        String(
            dateObj.getMonth()+1
        ).padStart(2,"0")
        +
        "-"
        +
        String(
            dateObj.getDate()
        ).padStart(2,"0")
    );

}

/* ----- CAL.6. setCalendarView (oryginalna linia 485) ----- */
/* ==========================================================
   CALENDAR VIEW
   ========================================================== */

function setCalendarView(mode){

    const normalizedMode = ["day", "week", "month"].includes(mode) ? mode : "day";
    const viewChanged = calendarViewMode !== normalizedMode;

    /* CAL.6.1. Zmiana Dzien / Tydzien / Miesiac zamyka kontekst
       poprzedniego widoku: liste dnia, szczegoly wizyty i menu statusu. */
    if (viewChanged) {
        if (typeof crmCloseDayVisitsList === "function") crmCloseDayVisitsList();
        if (typeof crmToggleVisitStatusMenu === "function") crmToggleVisitStatusMenu(false);
        if (typeof closeAppointmentModal === "function") closeAppointmentModal();
        else {
            const detailsPanel = document.getElementById("appointmentDetailsModal");
            if (detailsPanel) detailsPanel.style.display = "none";
            document.body.classList.remove("crm-v3-details-open");
        }
        currentEditingAppointment = null;
    }

    calendarViewMode = normalizedMode;
    mode = normalizedMode;
    if (viewChanged && mode === "month") {
        displayedCalendarMonth = new Date(selectedCalendarDate);
        miniMonthDate = new Date(displayedCalendarMonth);
    }

    document
        .querySelectorAll(
            ".btn-toggle"
        )
        .forEach(btn=>{

            btn.classList.remove(
                "active"
            );

        });

    if(mode==="day"){

        document
            .getElementById(
                "view-day-btn"
            )
            .classList.add(
                "active"
            );

    }

    if(mode==="week"){

        document
            .getElementById(
                "view-week-btn"
            )
            .classList.add(
                "active"
            );

    }

    if(mode==="month"){

        document
            .getElementById(
                "view-month-btn"
            )
            .classList.add(
                "active"
            );

    }

    renderBooksyCalendar();

}

/* ----- CAL.7. changeSelectedDate (oryginalna linia 546) ----- */
/* ==========================================================
   DATE NAVIGATION
   ========================================================== */

function changeSelectedDate(days){

    if(calendarViewMode==="week"){

        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate()
            +
            (days*7)
        );

    }
    else if(calendarViewMode==="month"){

        selectedCalendarDate.setMonth(
            selectedCalendarDate.getMonth()
            +
            days
        );

    }
    else{

        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate()
            +
            days
        );

    }

    renderBooksyCalendar();

}

/* ----- CAL.8. changeMiniMonth (oryginalna linia 581) ----- */
function changeMiniMonth(months){

    /*
     * Zmieniamy miesiac od pierwszego dnia miesiaca.
     * Zapobiega to przeskokom typu 31 stycznia -> 3 marca.
     * selectedCalendarDate pozostaje bez zmian, dopoki uzytkownik
     * swiadomie nie kliknie konkretnego dnia.
     */
    miniMonthDate = new Date(miniMonthDate);
    miniMonthDate.setDate(1);
    miniMonthDate.setMonth(
        miniMonthDate.getMonth()
        +
        Number(months || 0)
    );

    /* W widoku Miesiac oba kalendarze pokazuja ten sam ogladany miesiac. */
    if (calendarViewMode === "month") {
        displayedCalendarMonth = new Date(miniMonthDate);
    }

    renderMiniMonthCalendar();

    if (calendarViewMode === "month") {
        updateCalendarRangeTitle();
        renderBooksyCalendar();
    }

}

/* ----- CAL.9. renderMiniMonthCalendar (oryginalna linia 598) ----- */
/* ==========================================================
   MINI CALENDAR
   ========================================================== */

function renderMiniMonthCalendar(){

    const grid =
        document.getElementById(
            "mini-month-days-grid"
        );

    const title =
        document.getElementById(
            "mini-month-title"
        );

    if(!grid) return;

    grid.innerHTML = "";

    const monthNames = [

        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień"

    ];

    title.innerText =
        `${monthNames[
            miniMonthDate.getMonth()
        ]} ${miniMonthDate.getFullYear()}`;

    const firstDay =
        new Date(
            miniMonthDate.getFullYear(),
            miniMonthDate.getMonth(),
            1
        );

    let startDay =
        firstDay.getDay();

    if(startDay===0){

        startDay = 7;

    }

    const daysInMonth =
        new Date(
            miniMonthDate.getFullYear(),
            miniMonthDate.getMonth()+1,
            0
        ).getDate();

    for(let i=1;i<startDay;i++){

        grid.appendChild(
            document.createElement("div")
        );

    }

    for(let day=1;day<=daysInMonth;day++){

        const cell =
            document.createElement("div");

        cell.className =
            "mini-date-cell";

        cell.innerText =
            day;

        const date =
            new Date(
                miniMonthDate.getFullYear(),
                miniMonthDate.getMonth(),
                day
            );

        if(
            date.toDateString()
            ===
            new Date().toDateString()
        ){

            cell.classList.add(
                "today"
            );

        }

        if(
            date.toDateString()
            ===
            selectedCalendarDate.toDateString()
        ){

            cell.classList.add(
                "selected"
            );

        }

        cell.onclick=()=>{

            selectedCalendarDate = date;

            renderBooksyCalendar();

        };

        grid.appendChild(
            cell
        );

    }

}

/* ----- CAL.10. renderBooksyCalendar (oryginalna linia 730) ----- */
/* ==========================================================
   MAIN CALENDAR
   ========================================================== */

function renderBooksyCalendar(){
    const grid = document.getElementById("booksy-grid");
    if (document.getElementById("work-schedule-calendar")) renderWorkScheduleCalendar().catch(console.error);
    if (!grid) return;

    updateCalendarRangeTitle();

    if (calendarViewMode === "week") {
        renderWeekCalendar(grid);
        return;
    }

    if (calendarViewMode === "month") {
        renderMonthCalendar(grid);
        return;
    }

    renderDayCalendar(grid);
}

/* ----- CAL.11. getCalendarEventsForDate (oryginalna linia 750) ----- */
function getCalendarEventsForDate(date) {
    const dateKey = getFormattedISOBlockDate(date);
    return appointmentsData
        .filter(item => item.date && item.date.startsWith(dateKey))
        .sort((a, b) => {
            const pa = a.eventType === "work_shift" ? 0 : 1;
            const pb = b.eventType === "work_shift" ? 0 : 1;
            return pa - pb || a.date.localeCompare(b.date);
        });
}

/* ----- CAL.12. formatCalendarTime (oryginalna linia 761) ----- */
function formatCalendarTime(dateValue) {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0");
}

/* ----- CAL.13. getMondayOfWeek (oryginalna linia 768) ----- */
function getMondayOfWeek(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + distance);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/* ----- CAL.14. formatPolishShortDate (oryginalna linia 777) ----- */
function formatPolishShortDate(date) {
    return date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

/* ----- CAL.15. updateCalendarRangeTitle (oryginalna linia 785) ----- */
function updateCalendarRangeTitle() {
    const title = document.getElementById("calendar-current-date-title");
    if (!title) return;

    if (calendarViewMode === "week") {
        const monday = getMondayOfWeek(selectedCalendarDate);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        title.innerText = formatPolishShortDate(monday) + " – " + formatPolishShortDate(sunday);
        return;
    }

    if (calendarViewMode === "month") {
        title.innerText = selectedCalendarDate.toLocaleDateString("pl-PL", {
            month: "long",
            year: "numeric"
        });
        return;
    }

    title.innerText = selectedCalendarDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

/* ----- CAL.16. renderDayCalendar (oryginalna linia 813) ----- */
function renderDayCalendar(grid) {
    grid.innerHTML = "";
    grid.style.display = "block";
    grid.style.gridTemplateColumns = "";
    grid.style.gap = "";
    grid.style.overflowX = "";
    grid.dataset.calendarView = "day";
    const events = getCalendarEventsForDate(selectedCalendarDate);

    if (events.length === 0) {
        grid.innerHTML = '<div style="padding:40px;text-align:center;color:#777;">Brak wizyt i blokad</div>';
        return;
    }

    events.forEach(item => renderAppointmentCard(item, grid));
}

/* ----- CAL.17. renderCompactCalendarEvent (oryginalna linia 830) ----- */
function renderCompactCalendarEvent(item, container, mode) {
    const event = document.createElement("button");
    event.type = "button";
    event.className = "calendar-compact-event";
    event.style.cssText = [
        "display:block",
        "width:100%",
        "margin:4px 0",
        "padding:6px 7px",
        "border:0",
        "border-radius:6px",
        "text-align:left",
        "color:#fff",
        "cursor:pointer",
        "font-size:" + (mode === "month" ? "11px" : "12px"),
        "line-height:1.25",
        "overflow:hidden"
    ].join(";");

    let color = "#b05c75";
    if (item.eventType === "block") color = "#8c6b4f";
    else if (item.eventType === "external") color = "#555555";
    else if (item.eventType === "work_shift") color = "#f2c94c";
    else {
        const service = currentServices.find(value =>
            value.name && item.service &&
            value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
        );
        if (service && globalColors[service.category]) color = globalColors[service.category];
    }

    event.style.background = color;
    const time = formatCalendarTime(item.date);
    if (item.eventType === "work_shift") {
        event.style.color = "#111";
        event.style.fontWeight = "700";
        event.innerHTML = item.name || "Brak";
        event.title = item.name || "Grafik pracy";
        event.onclick = null;
    } else {
        event.innerHTML = "<strong>" + time + "</strong> " + (item.name || item.service || "Wpis");
        event.title = time + " " + (item.name || "") + " " + (item.service || "");
        event.onclick = () => openAppointmentDetailsModal(item);
    }
    container.appendChild(event);
}



/* ----- CAL.20. formatDateTimeLocalValue (oryginalna linia 1581) ----- */
function formatDateTimeLocalValue(dateString) {
    const date =
        new Date(dateString);

    if (
        !date ||
        isNaN(date.getTime())
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hours +
        ":" +
        minutes
    );
}

/* ----- CAL.21. deleteSelectedCalendarItemFromAdmin (oryginalna linia 1778) ----- */
/* ==========================================================
   USUWANIE BLOKADY CZASU
   ========================================================== */
function deleteSelectedCalendarItemFromAdmin() {
    if (!currentEditingAppointment) return;
    if (currentEditingAppointment.eventType === "block") return deleteBlockTimeFromAdmin();
    deleteAppointmentFromAdmin();
}

/* ----- CAL.22. buildColorsEditor (oryginalna linia 2979) ----- */
/* ==========================================================
   CATEGORY COLOR SYSTEM
   ========================================================== */

function buildColorsEditor(){

    const container =
        document.getElementById(
            "categories-colors-list"
        );

    if(!container) return;

    container.innerHTML = "";

    allCategories.forEach(cat=>{

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "category-color-row";

        const color =
            globalColors[cat]
            ||
            "#b05c75";

        row.innerHTML = `

            <label>

                ${cat}

            </label>

            <input
                type="color"
                data-category="${cat}"
                value="${color}">

        `;

        container.appendChild(
            row
        );

    });

}

/* ----- CAL.23. loadCalendarSyncHistory (oryginalna linia 3969) ----- */
/* KONIEC ROZSZERZENIA GRAFIKU I KATEGORII */


/* ==========================================================
   ETAP 3.4 I 3.5: SYNCHRONIZACJA, TESTY I BACKUP ADMIN
   ========================================================== */
async function loadCalendarSyncHistory() {
    const response=await crmExtendedPost("getCalendarSyncHistory",{limit:30});
    if(!response.success)throw new Error(response.error||"Błąd historii synchronizacji");
    return response.entries||[];
}

/* ----- CAL.24. crmFormatDateTime (oryginalna linia 4039) ----- */
function crmFormatDateTime(value) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value || "") : date.toLocaleString("pl-PL", {dateStyle:"short",timeStyle:"short"});
}

/* ----- CAL.25. crmInstallFiveMinuteDateTimePicker (oryginalna linia 4124) ----- */
function crmInstallFiveMinuteDateTimePicker() {
    const input = document.getElementById("appointmentDateTime");
    if (!input || document.getElementById("appointmentDateTimeFiveMinute")) return;
    input.type = "hidden";
    const box = document.createElement("div");
    box.id = "appointmentDateTimeFiveMinute";
    box.style.cssText = "display:grid;grid-template-columns:minmax(145px,1fr) 86px 86px;gap:8px";
    box.innerHTML = `<input type="date" data-date><select data-hour>${Array.from({length:24},(_,i)=>`<option value="${String(i).padStart(2,"0")}">${String(i).padStart(2,"0")}</option>`).join("")}</select><select data-minute>${Array.from({length:12},(_,i)=>`<option value="${String(i*5).padStart(2,"0")}">${String(i*5).padStart(2,"0")}</option>`).join("")}</select>`;
    input.parentNode.insertBefore(box,input.nextSibling);
    box.addEventListener("change", crmSyncHiddenDateTimeFromFiveMinuteControls);
    crmSyncFiveMinuteControlsFromHidden();
}

/* ----- CAL.26. crmSyncHiddenDateTimeFromFiveMinuteControls (oryginalna linia 4136) ----- */
function crmSyncHiddenDateTimeFromFiveMinuteControls() {
    const input=document.getElementById("appointmentDateTime"),box=document.getElementById("appointmentDateTimeFiveMinute");
    if(!input||!box)return;
    const d=box.querySelector("[data-date]").value,h=box.querySelector("[data-hour]").value,m=box.querySelector("[data-minute]").value;
    input.value=d?`${d}T${h}:${m}`:"";
}

/* ----- CAL.27. crmAverageCellColor (oryginalna linia 4255) ----- */
function crmAverageCellColor(ctx,x,y,w,h){
    const sx=Math.round(x+w*0.22),sy=Math.round(y+h*0.22),sw=Math.max(2,Math.round(w*0.56)),sh=Math.max(2,Math.round(h*0.56));
    const data=ctx.getImageData(sx,sy,sw,sh).data;let r=0,g=0,b=0,n=0;
    for(let i=0;i<data.length;i+=4){if(data[i+3]<100)continue;r+=data[i];g+=data[i+1];b+=data[i+2];n++;}
    return n?{r:Math.round(r/n),g:Math.round(g/n),b:Math.round(b/n)}:{r:255,g:255,b:255};
}

/* ----- CAL.28. crmGuessCodeFromColor (oryginalna linia 4261) ----- */
function crmGuessCodeFromColor(c){
    // Kolor daje bezpieczną podpowiedź kategorii. Użytkownik nadal zatwierdza kod tekstowy.
    if(c.r>190&&c.g>185&&c.b<105)return{code:"1",confidence:"wysoka",kind:"żółta"};
    if(c.g>135&&c.r<190&&c.b<150)return{code:"2",confidence:"wysoka",kind:"zielona"};
    if(c.b>145&&c.r<190&&c.g>125)return{code:"UW",confidence:"średnia",kind:"niebieska"};
    if(c.r>205&&c.g>205&&c.b>205)return{code:"W",confidence:"średnia",kind:"biała"};
    return{code:"?",confidence:"niska",kind:"nieznana"};
}

/* ----- CAL.29. crmColorToSoftRgba (oryginalna linia 4601) ----- */
function crmColorToSoftRgba(color, alpha) {
    const source = String(color || "#b05c75").trim();
    const short = source.match(/^#([0-9a-f]{3})$/i);
    const full = source.match(/^#([0-9a-f]{6})$/i);
    let hex = full ? full[1] : (short ? short[1].split("").map(char => char + char).join("") : "b05c75");
    const number = parseInt(hex, 16);
    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha == null ? 0.14 : alpha})`;
}

/* ----- CAL.30. crmV13RecolorCalendar (oryginalna linia 4625) ----- */
function crmV13RecolorCalendar() {
    document.querySelectorAll(".crm-3day-event, .crm-day-event, .crm-week-visit-card, .crm-month-visit-card, .calendar-compact-event, .booksy-event-card").forEach(element => {
        const id = element.dataset.eventId || element.dataset.visitKey || "";
        const item = appointmentsData.find(value =>
            (id && (String(value.eventId || "") === id || (typeof crmVisitStableKey === "function" && crmVisitStableKey(value) === id))) ||
            (element.dataset.date && value.date === element.dataset.date)
        );
        if (item) crmApplyCategoryColors(element, item);
    });
}

/* ----- CAL.31. crmV13CreateWeekCard (oryginalna linia 4636) ----- */
function crmV13CreateWeekCard(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crm-week-visit-card crm-category-event";
    button.dataset.eventId = String(item.eventId || "");
    button.dataset.visitKey = typeof crmVisitStableKey === "function" ? crmVisitStableKey(item) : String(item.eventId || item.date || "");
    crmApplyCategoryColors(button, item);

    const start = new Date(item.date);
    const duration = Math.max(5, Number(item.duration) || 45);
    const end = new Date(start.getTime() + duration * 60000);
    const time = `${formatCalendarTime(start)}–${formatCalendarTime(end)}`;
    const service = String(item.service || item.name || "Wizyta");
    const client = item.eventType === "appointment" ? String(item.name || "Klient") : String(item.name || "Wpis");
    const icon = typeof crmStatusIcon === "function" ? crmStatusIcon(item) : "✓";

    button.innerHTML = `<span class="crm-week-visit-time"><i>${icon}</i>${time}</span><strong>${service}</strong><small>${client}</small>`;
    button.title = `${time} ${service} ${client}`;
    button.addEventListener("click", () => openAppointmentDetailsModal(item));
    return button;
}

/* ----- CAL.32. crmV13OpenDayList (oryginalna linia 4658) ----- */
function crmV13OpenDayList(date) {
    if (typeof crmOpenDayVisitsList === "function") {
        crmOpenDayVisitsList(date);
        return;
    }
    selectedCalendarDate = new Date(date);
    setCalendarView("day");
}

/* ----- CAL.33. crmV13RenderWeekColumn (oryginalna linia 4667) ----- */
function crmV13RenderWeekColumn(column, date, events) {
    const list = column.querySelector(".crm-week-events");
    if (!list) return;
    list.innerHTML = "";
    if (!events.length) return;

    const styles = getComputedStyle(list);
    const gap = parseFloat(styles.rowGap || styles.gap) || 6;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;
    const available = Math.max(0, list.clientHeight - paddingTop - paddingBottom);
    const cardHeight = 64;
    const moreHeight = 28;

    // Najpierw obliczamy pojemność bez przycisku. Jeśli istnieje przepełnienie,
    // ponownie liczymy pojemność z pełnym miejscem dla +N pozostałe.
    let visibleCount = Math.min(events.length, Math.max(0, Math.floor((available + gap) / (cardHeight + gap))));
    if (events.length > visibleCount) {
        visibleCount = Math.max(0, Math.floor((available - moreHeight) / (cardHeight + gap)));
    }

    events.slice(0, visibleCount).forEach(item => list.appendChild(crmV13CreateWeekCard(item)));
    const hidden = events.length - visibleCount;
    if (hidden > 0) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "crm-week-more";
        more.textContent = `+${hidden} ${hidden === 1 ? "pozostała" : "pozostałe"}`;
        more.addEventListener("click", () => crmV13OpenDayList(date));
        list.appendChild(more);
    }
}


/* ----- CAL.35. crmV13OriginalRenderBooksyCalendar (oryginalna linia 4735) ----- */
const crmV13OriginalRenderBooksyCalendar = renderBooksyCalendar;

/* ----- CAL.36. renderBooksyCalendar (oryginalna linia 4736) ----- */
renderBooksyCalendar = function() {
    const result = crmV13OriginalRenderBooksyCalendar.apply(this, arguments);
    requestAnimationFrame(crmV13RecolorCalendar);
    return result;
};

/* ----- CAL.37. crmV3RenderCompactEventOriginal (oryginalna linia 5619) ----- */
const crmV3RenderCompactEventOriginal = renderCompactCalendarEvent;

/* ----- CAL.38. renderCompactCalendarEvent (oryginalna linia 5620) ----- */
renderCompactCalendarEvent = function(item, container, mode) {
    const before = container.children.length;
    crmV3RenderCompactEventOriginal(item, container, mode);
    crmV3ApplyStatusToElement(container.children[before], item);
};

/* ----- CAL.39. crmV3UpdateDetailsStatus (oryginalna linia 5626) ----- */
function crmV3UpdateDetailsStatus(item) {
    const modal = document.getElementById("appointmentDetailsModal");
    if (!modal) return;
    const key = crmV3NormalizeStatus(item);
    const meta = CRM_V3_STATUS_META[key];
    modal.dataset.crmStatus = meta.css;
    const title = document.getElementById("appointmentDetailsTitle");
    if (title && item?.eventType === "appointment") title.textContent = meta.icon + " " + meta.label;
}

/* ----- CAL.40. crmV3MoveRequestsToCalendar (oryginalna linia 5672) ----- */
function crmV3MoveRequestsToCalendar() {
    const panel = document.getElementById("booking-requests-panel");
    const sidebar = document.querySelector("#tab-kalendarz .calendar-sidebar");
    if (panel && sidebar && panel.parentNode !== sidebar) sidebar.appendChild(panel);
}

/* ----- CAL.41. crmInitial (oryginalna linia 5729) ----- */
function crmInitial(name) {
    const value = String(name || "K").trim();
    return (Array.from(value)[0] || "K").toUpperCase();
}

/* ----- CAL.42. crmDayMinutes (oryginalna linia 5810) ----- */
/* KONIEC ADMIN V4 */

/* ==========================================================
   ADMIN V5: WIDOK DNIA NA OSI CZASU
   ========================================================== */
function crmDayMinutes(value, fallback) {
    const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : fallback;
}

/* ----- CAL.43. crmDayEventDate (oryginalna linia 5819) ----- */
function crmDayEventDate(item) {
    if (typeof crmParseVisitDate === "function") return crmParseVisitDate(item?.date);
    const date = new Date(item?.date || "");
    return Number.isNaN(date.getTime()) ? null : date;
}

/* ----- CAL.44. crmDayEventColor (oryginalna linia 5824) ----- */
function crmDayEventColor(item) {
    if (item?.eventType === "block") return "#ddd6dc";
    if (item?.eventType === "external") return "#d9dde4";
    if (item?.eventType === "work_shift") return "#f5d976";
    const service = (Array.isArray(currentServices) ? currentServices : []).find(value =>
        value.name && item?.service && value.name.trim().toLowerCase() === item.service.trim().toLowerCase()
    );
    return item?.color || (service && globalColors[service.category]) || "#e8bfd0";
}

/* ----- CAL.45. crmDayPastelColor (oryginalna linia 5833) ----- */
function crmDayPastelColor(color) {
    const source = String(color || "#e8bfd0").trim();
    if (!/^#[0-9a-f]{6}$/i.test(source)) return {background:"#f5dfe8", border:"#d8799e"};
    const red = parseInt(source.slice(1,3),16);
    const green = parseInt(source.slice(3,5),16);
    const blue = parseInt(source.slice(5,7),16);
    const mix = component => Math.round(component * .28 + 255 * .72);
    return {
        background:`rgb(${mix(red)},${mix(green)},${mix(blue)})`,
        border:`rgb(${Math.round(red*.7)},${Math.round(green*.7)},${Math.round(blue*.7)})`
    };
}

/* ----- CAL.46. crmDayAssignLanes (oryginalna linia 5845) ----- */
function crmDayAssignLanes(items) {
    const sorted = [...items].sort((a,b) => a.start - b.start || a.end - b.end);
    const laneEnds = [];
    sorted.forEach(entry => {
        let lane = laneEnds.findIndex(end => end <= entry.start);
        if (lane < 0) lane = laneEnds.length;
        laneEnds[lane] = entry.end;
        entry.lane = lane;
    });
    sorted.forEach(entry => {
        const overlapping = sorted.filter(other => other.start < entry.end && other.end > entry.start);
        entry.laneCount = Math.max(1, ...overlapping.map(other => other.lane + 1));
    });
    return sorted;
}

/* ----- CAL.47. crmRenderDayTimelineCard (oryginalna linia 5860) ----- */
function crmRenderDayTimelineCard(entry, layer, rangeStart, pixelsPerMinute) {
    const item = entry.item;
    const palette = crmDayPastelColor(crmDayEventColor(item));
    const card = document.createElement("button");
    card.type = "button";
    card.className = "crm-day-event";
    card.dataset.crmStatus = typeof crmV3NormalizeStatus === "function" ? CRM_V3_STATUS_META[crmV3NormalizeStatus(item)].css : "confirmed";
    const width = 100 / entry.laneCount;
    card.style.top = `${(entry.start - rangeStart) * pixelsPerMinute}px`;
    card.style.height = `${Math.max(42, (entry.end - entry.start) * pixelsPerMinute - 4)}px`;
    card.style.left = `calc(${entry.lane * width}% + 8px)`;
    card.style.width = `calc(${width}% - 14px)`;
    card.style.background = palette.background;
    card.style.borderLeftColor = palette.border;

    const startText = crmFormatVisitTime(entry.date);
    const endText = crmFormatVisitTime(entry.endDate);
    const icon = item.eventType === "appointment" && typeof crmV3NormalizeStatus === "function"
        ? CRM_V3_STATUS_META[crmV3NormalizeStatus(item)].icon : "";
    const title = item.eventType === "work_shift" ? (item.name || "Grafik pracy") : (item.service || item.name || "Wpis");
    const client = item.eventType === "appointment" ? (item.name || "") : "";
    card.innerHTML = `
      <span class="crm-day-event__time">${icon ? `<span class="crm-day-event__status">${icon}</span>` : ""}${startText} – ${endText}</span>
      <strong>${title}</strong>
      ${item.serviceDescription ? `<span>${item.serviceDescription}</span>` : ""}
      ${client ? `<span>${client}</span>` : ""}
    `;
    card.title = `${startText}–${endText} ${title} ${client}`.trim();
    if (item.eventType !== "work_shift") card.onclick = () => openAppointmentDetailsModal(item);
    else card.disabled = true;
    layer.appendChild(card);
}

/* ----- CAL.48. renderDayCalendar (oryginalna linia 5903) ----- */
renderDayCalendar = function(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "day";
    grid.style.cssText = "";
    grid.className = "crm-day-timeline";

    const {start, end} = crmDaySettingsRange();
    const pixelsPerMinute = 1.12;
    const timelineHeight = (end - start) * pixelsPerMinute;
    const shell = document.createElement("div");
    shell.className = "crm-day-timeline__shell";

    const labels = document.createElement("div");
    labels.className = "crm-day-timeline__labels";
    labels.style.height = `${timelineHeight}px`;
    const canvas = document.createElement("div");
    canvas.className = "crm-day-timeline__canvas";
    canvas.style.height = `${timelineHeight}px`;
    const layer = document.createElement("div");
    layer.className = "crm-day-timeline__events";

    for (let minute = start; minute <= end; minute += 30) {
        const hour = Math.floor(minute / 60) % 24;
        const mins = minute % 60;
        const top = (minute - start) * pixelsPerMinute;
        const line = document.createElement("div");
        line.className = mins === 0 ? "crm-day-grid-line is-hour" : "crm-day-grid-line is-half";
        line.style.top = `${top}px`;
        canvas.appendChild(line);
        if (mins === 0 && minute < end) {
            const label = document.createElement("span");
            label.className = "crm-day-time-label";
            label.style.top = `${top}px`;
            label.textContent = `${String(hour).padStart(2,"0")}:00`;
            labels.appendChild(label);
        }
    }

    const dayItems = getCalendarEventsForDate(selectedCalendarDate);
    const allDayInfo = dayItems.filter(item => item.eventType === "work_shift");
    const entries = dayItems
        .filter(item => item.eventType !== "work_shift")
        .map(item => {
            const date = crmDayEventDate(item);
            if (!date) return null;
            const itemStart = date.getHours() * 60 + date.getMinutes();
            const duration = Math.max(15, Number(item.duration) || 45);
            return {item, date, endDate:new Date(date.getTime()+duration*60000), start:Math.max(start,itemStart), end:Math.min(end,itemStart+duration)};
        })
        .filter(entry => entry && entry.end > start && entry.start < end);

    crmDayAssignLanes(entries).forEach(entry => crmRenderDayTimelineCard(entry, layer, start, pixelsPerMinute));
    crmRenderCurrentTimeLine(layer, selectedCalendarDate, start, end, pixelsPerMinute);
    canvas.appendChild(layer);
    shell.append(labels, canvas);

    if (allDayInfo.length) {
        const infoBar = document.createElement("div");
        infoBar.className = "crm-day-all-day-info";
        infoBar.innerHTML = allDayInfo.map(item =>
            `<span title="Informacyjny wpis grafiku">${String(item.name || "Brak")}</span>`
        ).join("");
        grid.appendChild(infoBar);
    }
    grid.appendChild(shell);

    if (!entries.length) {
        const empty = document.createElement("div");
        empty.className = "crm-day-empty";
        empty.textContent = "Brak wizyt i blokad w tym dniu";
        canvas.appendChild(empty);
    }
};

/* ----- CAL.49. crmJumpCalendarDays (oryginalna linia 5982) ----- */
function crmJumpCalendarDays(days) {
    selectedCalendarDate = new Date(selectedCalendarDate);
    selectedCalendarDate.setDate(selectedCalendarDate.getDate() + Number(days || 0));
    miniMonthDate = new Date(selectedCalendarDate);
    updateCalendarRangeTitle();
    renderMiniMonthCalendar();
    renderBooksyCalendar();
}

/* ----- CAL.50. crmGoToToday (oryginalna linia 5990) ----- */
function crmGoToToday() {
    selectedCalendarDate = new Date();
    miniMonthDate = new Date();
    updateCalendarRangeTitle();
    renderMiniMonthCalendar();
    renderBooksyCalendar();
}

/* ----- CAL.51. crmFocusMiniCalendar (oryginalna linia 5997) ----- */
function crmFocusMiniCalendar() {
    const grid = document.getElementById("mini-month-days-grid");
    if (!grid) return;
    grid.scrollIntoView({behavior:"smooth",block:"nearest"});
    grid.classList.remove("crm-mini-calendar-pulse");
    requestAnimationFrame(() => grid.classList.add("crm-mini-calendar-pulse"));
    setTimeout(() => grid.classList.remove("crm-mini-calendar-pulse"), 900);
}

/* ----- CAL.52. crmGetCalendarEventsForDateOriginalV6 (oryginalna linia 6015) ----- */
const crmGetCalendarEventsForDateOriginalV6 = getCalendarEventsForDate;

/* ----- CAL.53. getCalendarEventsForDate (oryginalna linia 6016) ----- */
getCalendarEventsForDate = function(date) {
    const rows = crmGetCalendarEventsForDateOriginalV6(date);
    if (crmPaymentFilter === "all") return rows;
    return rows.filter(item => item.eventType !== "appointment" || crmPaymentState(item) === crmPaymentFilter);
};

/* ----- CAL.54. crmUpdateLeftPendingBadge (oryginalna linia 6021) ----- */
function crmUpdateLeftPendingBadge() {
    const list = document.getElementById("bookingRequestsList");
    const badge = document.getElementById("crmLeftPendingBadge");
    const topCount = document.getElementById("crmPendingRequestsCount");
    if (!badge || !list) return;
    const count = list.querySelectorAll(":scope > .dashboard-card").length;
    badge.textContent = String(count);
    badge.classList.toggle("has-items", count > 0);
    if (topCount) topCount.textContent = String(count);
}

/* ----- CAL.55. CRM_THREE_DAY_COUNT (oryginalna linia 6091) ----- */
/* KONIEC ADMIN V6.2 */


/* ==========================================================
   ADMIN V8: TERMINARZ 3-DNIOWY I STAŁY PANEL INFORMACJI
   ========================================================== */
const CRM_THREE_DAY_COUNT = 3;

/* ----- CAL.56. crmRenderThreeDayEvent (oryginalna linia 6126) ----- */
function crmRenderThreeDayEvent(entry, layer, rangeStart, ppm) {
    const item=entry.item, palette=crmCategoryPalette(item);
    const card=document.createElement("button");
    card.type="button"; card.className="crm-3day-event";
    const exactTop = Math.round((entry.start - rangeStart) * ppm);
    const durationMinutes = Math.max(5, entry.end - entry.start);
    // Wysokość jest proporcjonalna do czasu. Nie zwiększamy krótkich wizyt,
    // ponieważ powodowałoby to nachodzenie na następny termin.
    const exactHeight = Math.max(10, Math.round(durationMinutes * ppm) - 2);
    card.style.top = `${exactTop}px`;
    card.style.height = `${exactHeight}px`;
    card.dataset.durationMinutes = String(durationMinutes);
    if (durationMinutes <= 20) card.classList.add("is-very-short");
    else if (durationMinutes <= 35) card.classList.add("is-short");
    card.style.setProperty("--event-stripe",palette.stripe);
    card.style.setProperty("--event-fill",palette.fill);
    const statusKey=typeof crmV3NormalizeStatus==="function"?crmV3NormalizeStatus(item):"CONFIRMED";
    const meta=typeof CRM_V3_STATUS_META!=="undefined"?CRM_V3_STATUS_META[statusKey]:null;
    const service=crmSafeText(item.service||item.name||"Wpis");
    const client=item.eventType==="appointment"?crmSafeText(item.name||""):"";
    card.innerHTML=`<span class="crm-3day-event__time">${meta?`<i>${meta.icon}</i>`:""}${crmFormatVisitTime(entry.date)} – ${crmFormatVisitTime(entry.endDate)}</span><strong>${service}</strong>${client?`<span>${client}</span>`:""}`;
    card.title=`${crmFormatVisitTime(entry.date)}–${crmFormatVisitTime(entry.endDate)} ${service} ${client}`;
    if(item.eventType!=="work_shift") card.onclick=()=>openAppointmentDetailsModal(item); else card.disabled=true;
    layer.appendChild(card);
}

/* ----- CAL.57. crmRenderThreeDayCalendar (oryginalna linia 6151) ----- */
function crmRenderThreeDayCalendar(grid) {
    const {start,end}=crmDaySettingsRange(), ppm=1.08, height=(end-start)*ppm;
    grid.innerHTML=""; grid.className="crm-three-day-calendar"; grid.dataset.calendarView="day";
    const shell=document.createElement("div"); shell.className="crm-3day-shell";
    const labels=document.createElement("div"); labels.className="crm-3day-labels"; labels.style.height=`${height+48}px`;
    const spacer=document.createElement("div"); spacer.className="crm-3day-corner"; labels.appendChild(spacer);
    for(let minute=start;minute<end;minute+=60){const label=document.createElement("span");label.style.top=`${48+(minute-start)*ppm}px`;label.textContent=`${String(Math.floor(minute/60)).padStart(2,"0")}:00`;labels.appendChild(label);}
    shell.appendChild(labels);
    for(let dayIndex=0;dayIndex<CRM_THREE_DAY_COUNT;dayIndex++){
        const date=new Date(selectedCalendarDate); date.setDate(date.getDate()+dayIndex);
        const col=document.createElement("section"); col.className="crm-3day-column";
        const header=document.createElement("button"); header.type="button"; header.className="crm-3day-header";
        header.innerHTML=`<b>${date.getDate()}</b><span>${date.toLocaleDateString("pl-PL",{weekday:"short",day:"numeric",month:"short"})}</span>`;
        if(date.toDateString()===new Date().toDateString()) header.classList.add("is-today");
        header.onclick=()=>{selectedCalendarDate=new Date(date);crmRenderCalendarInsights();renderMiniMonthCalendar();};
        const canvas=document.createElement("div"); canvas.className="crm-3day-canvas"; canvas.style.height=`${height}px`;
        for(let minute=start;minute<=end;minute+=30){const line=document.createElement("div");line.className=minute%60===0?"crm-3day-line is-hour":"crm-3day-line";line.style.top=`${(minute-start)*ppm}px`;canvas.appendChild(line);}
        const layer=document.createElement("div"); layer.className="crm-3day-events";
        getCalendarEventsForDate(date).filter(x=>x.eventType!=="work_shift").map(x=>crmVisitEntry(x,start,end)).filter(Boolean).forEach(e=>crmRenderThreeDayEvent(e,layer,start,ppm));
        crmRenderCurrentTimeLine(layer,date,start,end,ppm);
        canvas.appendChild(layer); col.append(header,canvas); shell.appendChild(col);
    }
    grid.appendChild(shell); crmRenderCalendarInsights();
}

/* ----- CAL.58. crmEnsureCalendarInsights (oryginalna linia 6175) ----- */
function crmEnsureCalendarInsights() {
    let panel = document.getElementById("crmCalendarInsights");
    if (panel) return panel;

    const layout = document.querySelector("#tab-kalendarz .calendar-three-columns");
    if (!layout) return null;

    panel = document.createElement("aside");
    panel.id = "crmCalendarInsights";
    panel.className = "crm-calendar-insights";
    panel.setAttribute("aria-label", "Podsumowanie kalendarza");
    panel.innerHTML = `
        <header class="crm-insights-header">
            <div>
                <span id="crmInsightsEyebrow">Podsumowanie terminarza</span>
                <h3 id="crmInsightsTitle">Wybrany okres</h3>
            </div>
        </header>
        <div id="crmInsightsMetrics" class="crm-insights-metrics"></div>
        <div id="crmInsightsNext" class="crm-insights-next"></div>
        <div class="crm-insights-actions">
            <p>Kliknij wizytę w kalendarzu, aby zobaczyć szczegóły.</p>
        </div>`;

    layout.appendChild(panel);
    return panel;
}

/* ----- CAL.59. crmInsightRange (oryginalna linia 6203) ----- */
function crmInsightRange() {
    const from=new Date(selectedCalendarDate); from.setHours(0,0,0,0);
    const to=new Date(from);
    if(calendarViewMode==="month") to.setMonth(to.getMonth()+1,0);
    else if(calendarViewMode==="week") to.setDate(to.getDate()+6);
    else to.setDate(to.getDate()+CRM_THREE_DAY_COUNT-1);
    to.setHours(23,59,59,999); return {from,to};
}

/* ----- CAL.60. crmInsightAppointments (oryginalna linia 6211) ----- */
function crmInsightAppointments() {
    const {from,to}=crmInsightRange();
    return (appointmentsData||[]).filter(x=>x.eventType==="appointment").filter(x=>{const d=crmDayEventDate(x);return d&&d>=from&&d<=to;});
}

/* ----- CAL.61. crmRenderCalendarInsights (oryginalna linia 6215) ----- */
function crmRenderCalendarInsights() {
    const panel = crmEnsureCalendarInsights();
    if (!panel) return;
    const rows=crmInsightAppointments(), {from,to}=crmInsightRange();
    const totalMinutes=rows.reduce((sum,x)=>sum+(Number(x.duration)||45),0);
    const revenue=rows.reduce((sum,x)=>{const srv=(currentServices||[]).find(s=>s.name&&x.service&&s.name.trim().toLowerCase()===x.service.trim().toLowerCase());return sum+(Number(x.price??srv?.price)||0);},0);
    const cancelled=rows.filter(x=>/ANUL|CANCEL/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const pending=rows.filter(x=>/OCZEK|PENDING/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const chronological=[...rows].sort((a,b)=>crmDayEventDate(a)-crmDayEventDate(b));
    const title=calendarViewMode==="month"?from.toLocaleDateString("pl-PL",{month:"long",year:"numeric"}):calendarViewMode==="week"?`${formatPolishShortDate(from)} – ${formatPolishShortDate(to)}`:`${formatPolishShortDate(from)} – ${formatPolishShortDate(to)}`;
    document.getElementById("crmInsightsEyebrow").textContent=calendarViewMode==="month"?"Podsumowanie miesiąca":calendarViewMode==="week"?"Podsumowanie tygodnia":"Podsumowanie terminarza";
    document.getElementById("crmInsightsTitle").textContent=title;
    const metric=(icon,label,value)=>`<div><i>${icon}</i><span>${label}</span><strong>${value}</strong></div>`;
    document.getElementById("crmInsightsMetrics").innerHTML=[metric("▣","Liczba wizyt",rows.length),metric("◷","Łączny czas",`${Math.floor(totalMinutes/60)} h ${totalMinutes%60} min`),metric("○","Wolne terminy","wg grafiku"),metric("▤","Przewidywany obrót",`${revenue.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} zł`),metric("☆","Oczekujące prośby",pending),metric("⊗","Anulowane wizyty",cancelled)].join("");
    const next=chronological.find(x=>crmDayEventDate(x)>=new Date())||chronological[0];
    document.getElementById("crmInsightsNext").innerHTML=next?`<h4>Następna wizyta</h4><button type="button"><b>${crmFormatVisitTime(crmDayEventDate(next))}</b><span><strong>${crmSafeText(next.service||"Wizyta")}</strong>${crmSafeText(next.name||"")}</span></button>`:"<h4>Brak wizyt w wybranym okresie</h4>";
}

/* ----- CAL.62. crmRenderBooksyCalendarV8 (oryginalna linia 6232) ----- */
const crmRenderBooksyCalendarV8=renderBooksyCalendar;

/* ----- CAL.63. renderBooksyCalendar (oryginalna linia 6233) ----- */
renderBooksyCalendar=function(){
    if(calendarViewMode==="day"){
        const grid=document.getElementById("booksy-grid"); if(!grid)return;
        updateCalendarRangeTitle(); crmRenderThreeDayCalendar(grid); return;
    }
    crmRenderBooksyCalendarV8(); crmRenderCalendarInsights();
};

/* ----- CAL.64. crmChangeSelectedDateV8 (oryginalna linia 6240) ----- */
const crmChangeSelectedDateV8=changeSelectedDate;

/* ----- CAL.65. changeSelectedDate (oryginalna linia 6241) ----- */
changeSelectedDate = function(days) {
    const direction = Number(days) || 0;

    // Duzy kalendarz dzienny porusza sie niezaleznie od mini-kalendarza.
    if (calendarViewMode === "day") {
        selectedCalendarDate = new Date(selectedCalendarDate);
        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate() + direction * CRM_THREE_DAY_COUNT
        );
        updateCalendarRangeTitle();
        renderBooksyCalendar();
        return;
    }

    // Duzy kalendarz tygodniowy porusza sie niezaleznie od mini-kalendarza.
    if (calendarViewMode === "week") {
        selectedCalendarDate = new Date(selectedCalendarDate);
        selectedCalendarDate.setDate(
            selectedCalendarDate.getDate() + direction * 7
        );
        updateCalendarRangeTitle();
        renderBooksyCalendar();
        return;
    }

    // Duzy kalendarz miesieczny zmienia ogladany miesiac, ale nie wybrany dzien.
    if (calendarViewMode === "month") {
        const visibleMonth = displayedCalendarMonth instanceof Date
            ? displayedCalendarMonth
            : selectedCalendarDate;

        displayedCalendarMonth = new Date(visibleMonth);
        displayedCalendarMonth.setDate(1);
        displayedCalendarMonth.setMonth(
            displayedCalendarMonth.getMonth() + direction
        );

        /* Mini-kalendarz ma pokazywac ten sam ogladany miesiac. */
        miniMonthDate = new Date(displayedCalendarMonth);

        updateCalendarRangeTitle();
        renderMiniMonthCalendar();
        renderBooksyCalendar();
        return;
    }

    crmChangeSelectedDateV8(direction);
};
/* ----- CAL.66. crmUpdateCalendarRangeTitleV8 (oryginalna linia 6248) ----- */
const crmUpdateCalendarRangeTitleV8=updateCalendarRangeTitle;

/* ----- CAL.67. updateCalendarRangeTitle (oryginalna linia 6249) ----- */
updateCalendarRangeTitle=function(){
    if(calendarViewMode!=="day")return crmUpdateCalendarRangeTitleV8();
    const title=document.getElementById("calendar-current-date-title");if(!title)return;
    const end=new Date(selectedCalendarDate);end.setDate(end.getDate()+2);
    title.textContent=`${selectedCalendarDate.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"short"})} – ${end.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"short",year:"numeric"})}`;
};

/* ----- CAL.68. crmRenderCalendarInsightsV81 (oryginalna linia 6271) ----- */
const crmRenderCalendarInsightsV81 = crmRenderCalendarInsights;

/* ----- CAL.69. crmRenderCalendarInsights (oryginalna linia 6272) ----- */
crmRenderCalendarInsights = function() {
    crmRenderCalendarInsightsV81();
    const nextButton = document.querySelector('#crmInsightsNext button');
    if (nextButton) {
        const rows = crmInsightAppointments().sort((a,b) => crmDayEventDate(a)-crmDayEventDate(b));
        const next = rows.find(x => crmDayEventDate(x) >= new Date()) || rows[0];
        if (next) {
            const palette = crmCategoryPalette(next);
            nextButton.style.borderLeftColor = palette.stripe;
            nextButton.onclick = () => openAppointmentDetailsModal(next);
        }
    }
};

/* ----- CAL.70. crmCompactEventStatusMeta (oryginalna linia 6291) ----- */
/* KONIEC ADMIN V8.1 */


/* ==========================================================
   ADMIN V9: ZEBRANE POPRAWKI WIDOKÓW I PODSUMOWANIA
   ========================================================== */
function crmCompactEventStatusMeta(item) {
    if (item?.eventType !== "appointment" || typeof crmV3NormalizeStatus !== "function") return null;
    return CRM_V3_STATUS_META[crmV3NormalizeStatus(item)] || null;
}

/* ----- CAL.71. crmCompactEventEnd (oryginalna linia 6295) ----- */
function crmCompactEventEnd(item) {
    const start = crmDayEventDate(item);
    if (!start) return null;
    return new Date(start.getTime() + Math.max(15, Number(item.duration) || 45) * 60000);
}

/* ----- CAL.72. renderCompactCalendarEvent (oryginalna linia 6300) ----- */
renderCompactCalendarEvent = function(item, container, mode) {
    if (item.eventType === "work_shift") {
        const info = document.createElement("div");
        info.className = "crm-schedule-info";
        info.textContent = item.name || "BRAK";
        info.title = "Informacyjny wpis grafiku";
        container.appendChild(info);
        return;
    }
    const palette = crmCategoryPalette(item);
    const event = document.createElement("button");
    event.type = "button";
    event.className = "calendar-compact-event crm-category-event";
    event.style.setProperty("--event-stripe", palette.stripe);
    event.style.setProperty("--event-fill", palette.fill);
    const start = crmDayEventDate(item);
    const end = crmCompactEventEnd(item);
    const meta = crmCompactEventStatusMeta(item);
    const time = start ? crmFormatVisitTime(start) : "";
    const endTime = end ? crmFormatVisitTime(end) : "";
    const service = crmSafeText(item.service || item.name || "Wpis");
    const client = item.eventType === "appointment" ? crmSafeText(item.name || "") : "";
    const timeText = mode === "week" && endTime ? `${time}–${endTime}` : time;
    event.innerHTML = `<span class="crm-compact-time">${meta ? `<i>${meta.icon}</i>` : ""}${timeText}</span><strong>${service}</strong>${client ? `<span class="crm-compact-client">${client}</span>` : ""}`;
    event.title = `${timeText} ${service} ${client}`.trim();
    event.onclick = () => openAppointmentDetailsModal(item);
    container.appendChild(event);
};

/* ----- CAL.73. crmRenderInsightsMetricsWithoutAvailability (oryginalna linia 6329) ----- */
function crmRenderInsightsMetricsWithoutAvailability() {
    const panel = document.getElementById("crmCalendarInsights");
    if (!panel) return;
    const rows = crmInsightAppointments();
    const totalMinutes = rows.reduce((sum,x)=>sum+(Number(x.duration)||45),0);
    const revenue = rows.reduce((sum,x)=>{
        const srv=(currentServices||[]).find(s=>s.name&&x.service&&s.name.trim().toLowerCase()===x.service.trim().toLowerCase());
        return sum+(Number(x.price ?? srv?.price)||0);
    },0);
    const cancelled=rows.filter(x=>/ANUL|CANCEL/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const pending=rows.filter(x=>/OCZEK|PENDING/.test(String(x.status||x.crmStatus||"").toUpperCase())).length;
    const icon=(path)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
    const metric=(svg,label,value)=>`<div><i>${svg}</i><span>${label}</span><strong>${value}</strong></div>`;
    document.getElementById("crmInsightsMetrics").innerHTML=[
      metric(icon("M5 5h14v14H5zM9 9h6M9 13h6"),"Liczba wizyt",rows.length),
      metric(icon("M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"),"Łączny czas",`${Math.floor(totalMinutes/60)} h ${totalMinutes%60} min`),
      metric(icon("M5 19V9M10 19V5M15 19v-7M4 20h16"),"Przewidywany obrót",`${revenue.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2})} zł`),
      metric(icon("M12 3 14 9h6l-5 3.5 2 6L12 15l-5 3.5 2-6L4 9h6Z"),"Oczekujące prośby",pending),
      metric(icon("M8 8l8 8M16 8l-8 8M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"),"Anulowane wizyty",cancelled)
    ].join("");
}

/* ----- CAL.74. crmRenderCalendarInsightsV9 (oryginalna linia 6350) ----- */
const crmRenderCalendarInsightsV9 = crmRenderCalendarInsights;

/* ----- CAL.75. crmRenderCalendarInsights (oryginalna linia 6351) ----- */
crmRenderCalendarInsights = function() {
    crmRenderCalendarInsightsV9();
    crmRenderInsightsMetricsWithoutAvailability();
    const actions = document.querySelector('.crm-insights-actions');
    actions?.querySelector('button')?.remove();
};

/* ----- CAL.76. crmRenderThreeDayCalendarV9 (oryginalna linia 6359) ----- */
/* Gęstość osi: około 74 px na godzinę. */
const crmRenderThreeDayCalendarV9 = crmRenderThreeDayCalendar;

/* ----- CAL.77. crmRenderThreeDayCalendar (oryginalna linia 6360) ----- */
crmRenderThreeDayCalendar = function(grid) {
    crmRenderThreeDayCalendarV9(grid);
    document.documentElement.style.setProperty('--crm-hour-height','74px');
};

/* ----- CAL.78. crmOpenDayListDate (oryginalna linia 6466) ----- */
/* KONIEC ADMIN V10-SAFE */


/* ==========================================================
   ADMIN V11: TYDZIEN DYNAMICZNY I STALA LISTA DNIA
   - 7 dni w jednym rzedzie
   - liczba kart zalezy od dostepnej wysokosci
   - lista dnia pozostaje otwarta po wyborze wizyty
   ========================================================== */
let crmOpenDayListDate = null;

/* ----- CAL.79. crmOpenDayListSelectedKey (oryginalna linia 6467) ----- */
let crmOpenDayListSelectedKey = "";

/* ----- CAL.80. crmWeekResizeTimer (oryginalna linia 6468) ----- */
let crmWeekResizeTimer = null;

/* ----- CAL.81. crmCreateWeekVisitCard (oryginalna linia 6532) ----- */
function crmCreateWeekVisitCard(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crm-week-visit-card";
    const color = crmVisitCategoryColor(item);
    button.style.setProperty("--crm-event-color", color);
    button.style.setProperty("--crm-event-soft", crmHexToSoftBackground(color));
    button.dataset.visitKey = crmVisitStableKey(item);
    button.innerHTML = `
      <span class="crm-week-visit-time"><i>${crmEscapeText(crmStatusIcon(item))}</i>${crmEscapeText(crmVisitEndTime(item))}</span>
      <strong>${crmEscapeText(crmVisitService(item))}</strong>
      <small>${crmEscapeText(crmVisitClient(item))}</small>`;
    button.title = `${crmVisitEndTime(item)} ${crmVisitService(item)} ${crmVisitClient(item)}`;
    button.addEventListener("click", () => openAppointmentDetailsModal(item));
    return button;
}

/* ----- CAL.82. crmWeekVisibleCapacity (oryginalna linia 6549) ----- */
function crmWeekVisibleCapacity(grid) {
    const rect = grid.getBoundingClientRect();
    const viewportBottom = window.innerHeight - 18;
    const available = Math.max(300, viewportBottom - rect.top);
    const header = 64;
    const moreButton = 34;
    const cardWithGap = 72;
    return Math.max(2, Math.floor((available - header - moreButton) / cardWithGap));
}

/* ----- CAL.83. crmRenderWeekColumnEvents (oryginalna linia 6559) ----- */
function crmRenderWeekColumnEvents(column, date, events, capacity) {
    const list = column.querySelector(".crm-week-events");
    if (!list) return;
    list.innerHTML = "";
    const visible = events.slice(0, capacity);
    visible.forEach(item => list.appendChild(crmCreateWeekVisitCard(item)));
    const hidden = Math.max(0, events.length - visible.length);
    if (hidden > 0) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "crm-week-more";
        more.textContent = `+${hidden} pozostałe`;
        more.addEventListener("click", () => crmOpenDayVisitsList(date));
        list.appendChild(more);
    }
}

/* ----- CAL.84. renderWeekCalendar (oryginalna linia 6576) ----- */
function renderWeekCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "week";
    grid.className = "crm-week-grid";
    grid.style.cssText = "";
    const monday = getMondayOfWeek(selectedCalendarDate);
    const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
    const dayData = [];

    for (let index = 0; index < 7; index++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const events = getCalendarEventsForDate(date).filter(item => item.eventType !== "work_shift");
        const column = document.createElement("section");
        column.className = "calendar-week-day crm-week-column";
        column.dataset.date = getFormattedISOBlockDate(date);
        if (date.toDateString() === new Date().toDateString()) column.classList.add("is-today");

        const header = document.createElement("div");
        header.className = "crm-week-day-header";
        const dateButton = document.createElement("button");
        dateButton.type = "button";
        const monthName = date.toLocaleDateString("pl-PL", {month:"long"});
        const visitCount = events.filter(item => item.eventType === "appointment").length;
        const visitLabel = visitCount === 0 ? "Brak wizyt" : `${visitCount} ${visitCount === 1 ? "wizyta" : visitCount < 5 ? "wizyty" : "wizyt"}`;
        dateButton.innerHTML = `<strong>${dayNames[index]}, ${date.getDate()} ${monthName}</strong><span>${visitLabel}</span>`;
        dateButton.addEventListener("click", () => crmOpenDayVisitsList(date));
        header.appendChild(dateButton);
        const presentation = crmV6DayPresentation(date);
        const weekBadges = document.createElement("span");
        weekBadges.className = "crm-week-header-badges";
        if (presentation.hasFirstShiftBrak) weekBadges.appendChild(crmV6Badge("Brak", "brak first-shift"));
        if (presentation.hasNightShiftBrak) weekBadges.appendChild(crmV6Badge("BRAK", "brak night-shift"));
        if (presentation.holidayName) weekBadges.appendChild(crmV6Badge("ŚWIĘTO", "holiday", presentation.holidayName));
        if (presentation.isDayOff) weekBadges.appendChild(crmV6Badge("WOLNE", "off"));
        if (weekBadges.children.length) header.appendChild(weekBadges);
        column.appendChild(header);

        const list = document.createElement("div");
        list.className = "crm-week-events";
        column.appendChild(list);
        grid.appendChild(column);
        dayData.push({column, date, events});
    }

    requestAnimationFrame(() => {
        const capacity = crmWeekVisibleCapacity(grid);
        dayData.forEach(data => crmRenderWeekColumnEvents(data.column, data.date, data.events, capacity));
    });
}

/* ----- CAL.85. crmMonthSortEvents (oryginalna linia 6720) ----- */
/* KONIEC ADMIN V11 */

/* ==========================================================
   ADMIN V12: MIESIAC KOMPAKTOWY JAK BOOKSY
   - czas i skrocona nazwa uslugi
   - dynamiczna liczba widocznych kart
   - +N pozostale otwiera trwala liste dnia
   - klik karty otwiera prawy panel bez zmiany widoku
   ========================================================== */
function crmMonthSortEvents(events) {
    return [...events].sort((a, b) => {
        const aTime = new Date(a?.date || 0).getTime();
        const bTime = new Date(b?.date || 0).getTime();
        return aTime - bTime;
    });
}

/* ----- CAL.86. crmCreateMonthVisitCard (oryginalna linia 6728) ----- */
function crmCreateMonthVisitCard(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crm-month-visit-card";
    const color = crmVisitCategoryColor(item);
    button.style.setProperty("--crm-event-color", color);
    button.style.setProperty("--crm-event-soft", crmHexToSoftBackground(color));
    button.dataset.visitKey = crmVisitStableKey(item);

    const start = new Date(item?.date);
    const time = Number.isNaN(start.getTime()) ? "" : formatCalendarTime(start);
    const service = crmVisitService(item);
    button.innerHTML = `
      <span class="crm-month-visit-main">
        <i>${crmEscapeText(crmStatusIcon(item))}</i>
        <b>${crmEscapeText(time)}</b>
        <span>${crmEscapeText(service)}</span>
      </span>`;
    button.title = `${crmVisitEndTime(item)} ${service} ${crmVisitClient(item)}`;
    button.addEventListener("click", event => {
        event.stopPropagation();
        openAppointmentDetailsModal(item);
    });
    return button;
}

/* ----- CAL.87. crmMonthCellCapacity (oryginalna linia 6754) ----- */
function crmMonthCellCapacity(body, eventCount) {
    const styles = getComputedStyle(body);
    const gap = parseFloat(styles.rowGap || styles.gap) || 4;
    const available = Math.max(0, body.clientHeight);
    const cardHeight = 31;
    const moreHeight = 25;
    let capacity = Math.max(1, Math.floor((available + gap) / (cardHeight + gap)));
    if (Number(eventCount) > capacity) {
        capacity = Math.max(1, Math.floor((available - moreHeight) / (cardHeight + gap)));
    }
    return capacity;
}

/* ----- CAL.88. crmRenderMonthCellEvents (oryginalna linia 6767) ----- */
function crmRenderMonthCellEvents(cell, date, events, workShifts) {
    const body = cell.querySelector(".crm-month-events");
    const count = cell.querySelector(".crm-month-count");
    const shift = cell.querySelector(".crm-month-shift");
    if (!body || !count || !shift) return;

    const crmVisitCount = events.filter(item => item.eventType === "appointment").length;
    count.textContent = crmVisitCount ? `${crmVisitCount} ${crmVisitCount === 1 ? "wizyta" : crmVisitCount < 5 ? "wizyty" : "wizyt"}` : "";
    count.hidden = !crmVisitCount;

    shift.innerHTML = "";
    workShifts.forEach(item => {
        const badge = document.createElement("span");
        const exactShiftLabel = String(item?.name || "").trim();
        badge.textContent = exactShiftLabel;
        badge.classList.toggle("is-first-shift", exactShiftLabel === "Brak");
        badge.classList.toggle("is-night-shift", exactShiftLabel === "BRAK");
        /* CSS starszej warstwy wymusza uppercase dla wszystkich wpisów miesiąca.
         * Nadpisujemy to tylko dla kodów grafiku, aby zachować znaczenie:
         * Brak = pierwsza zmiana, BRAK = nocna zmiana.
         */
        badge.style.setProperty("text-transform", "none", "important");
        badge.title = "Informacyjny wpis grafiku";
        shift.appendChild(badge);
    });
    shift.hidden = !workShifts.length;

    body.innerHTML = "";
    if (!events.length) return;

    const capacity = crmMonthCellCapacity(body, events.length);
    const reserveMore = events.length > capacity;
    const visibleCount = reserveMore ? Math.max(1, capacity) : events.length;
    events.slice(0, visibleCount).forEach(item => body.appendChild(crmCreateMonthVisitCard(item)));

    const hiddenCount = Math.max(0, events.length - visibleCount);
    if (hiddenCount > 0) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "crm-month-more";
        more.textContent = `+${hiddenCount} pozostałe`;
        more.addEventListener("click", event => {
            event.stopPropagation();
            crmOpenDayVisitsList(date);
        });
        body.appendChild(more);
    }
}

/* ----- CAL.89. renderMonthCalendar (oryginalna linia 6809) ----- */
function renderMonthCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "month";
    grid.className = "crm-month-grid";
    grid.style.cssText = "";
    grid.scrollLeft = 0;

    const monthContext = displayedCalendarMonth || selectedCalendarDate;
    const year = monthContext.getFullYear();
    const month = monthContext.getMonth();
    const weekdayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

    weekdayNames.forEach(name => {
        const header = document.createElement("div");
        header.className = "crm-month-weekday";
        header.textContent = name;
        grid.appendChild(header);
    });

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;
    const weekRows = totalCells / 7;
    grid.style.setProperty("--crm-month-weeks", weekRows);

    const cells = [];
    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const dayNumber = cellIndex - leading + 1;
        const date = new Date(year, month, dayNumber);
        const inCurrentMonth = date.getMonth() === month;
        const allDayEvents = crmMonthSortEvents(getCalendarEventsForDate(date));
        const workShifts = allDayEvents.filter(item => item.eventType === "work_shift");
        const events = allDayEvents.filter(item => item.eventType !== "work_shift");

        const cell = document.createElement("section");
        cell.className = "calendar-month-day crm-month-cell";
        cell.dataset.date = getFormattedISOBlockDate(date);
        if (!inCurrentMonth) cell.classList.add("is-outside");
        if (date.toDateString() === new Date().toDateString()) cell.classList.add("is-today");
        if (date.toDateString() === selectedCalendarDate.toDateString()) cell.classList.add("is-selected");

        const top = document.createElement("div");
        top.className = "crm-month-cell-top";

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.className = "crm-month-day-number";
        dayButton.textContent = date.getDate();
        dayButton.title = "Pokaż wszystkie wizyty tego dnia";
        dayButton.addEventListener("click", () => crmOpenDayVisitsList(date));

        const count = document.createElement("button");
        count.type = "button";
        count.className = "crm-month-count";
        count.hidden = true;
        count.addEventListener("click", () => crmOpenDayVisitsList(date));

        const shift = document.createElement("div");
        shift.className = "crm-month-shift";
        shift.hidden = true;
        top.append(dayButton, shift, count);

        /* shift utworzony w górnym wierszu obok numeru dnia */
        const shiftPlaceholder = null;

        /* */
        
        const body = document.createElement("div");
        body.className = "crm-month-events";

        cell.append(top, body);
        grid.appendChild(cell);
        cells.push({ cell, date, events, workShifts });
    }

    requestAnimationFrame(() => {
        cells.forEach(data => crmRenderMonthCellEvents(data.cell, data.date, data.events, data.workShifts));
    });
}

/* ----- CAL.90. crmRenderThreeDayEvent (oryginalna linia 6895) ----- */
/* KONIEC ADMIN V12 */



/* ==========================================================
   ADMIN V13.3: CZYTELNE KROTKIE WIZYTY I PEWNE +N POZOSTALE
   - 15 min: jedna linia na cala szerokosc
   - 30 min: czas + nazwa uslugi w drugiej linii
   - 45+ min: pelna karta
   - Tydzien: tylko pelne karty i zawsze widoczne +N pozostale
   ========================================================== */
crmRenderThreeDayEvent = function(entry, layer, rangeStart, ppm) {
    const item = entry.item;
    const palette = crmCategoryPalette(item);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "crm-3day-event";

    const exactTop = Math.round((entry.start - rangeStart) * ppm);
    const durationMinutes = Math.max(5, entry.end - entry.start);
    const exactHeight = Math.max(10, Math.round(durationMinutes * ppm) - 2);
    card.style.top = `${exactTop}px`;
    card.style.height = `${exactHeight}px`;
    card.dataset.durationMinutes = String(durationMinutes);
    card.style.setProperty("--event-stripe", palette.stripe);
    card.style.setProperty("--event-fill", palette.fill);

    const statusKey = typeof crmV3NormalizeStatus === "function" ? crmV3NormalizeStatus(item) : "CONFIRMED";
    const meta = typeof CRM_V3_STATUS_META !== "undefined" ? CRM_V3_STATUS_META[statusKey] : null;
    const startText = crmFormatVisitTime(entry.date);
    const endText = crmFormatVisitTime(entry.endDate);
    const timeText = `${startText} – ${endText}`;
    const serviceText = String(item.service || item.name || "Wpis");
    const clientText = item.eventType === "appointment" ? String(item.name || "") : "";
    const iconHtml = meta ? `<i>${crmSafeText(meta.icon)}</i>` : "";

    if (durationMinutes <= 20) {
        card.classList.add("is-very-short");
        const details = [clientText, serviceText].filter(Boolean).join(" · ");
        card.innerHTML = `<span class="crm-3day-event__single">${iconHtml}<b>${crmSafeText(timeText)}</b>${details ? `<span>${crmSafeText(details)}</span>` : ""}</span>`;
    } else if (durationMinutes <= 35) {
        card.classList.add("is-short");
        card.innerHTML = `<span class="crm-3day-event__time">${iconHtml}${crmSafeText(timeText)}</span><strong>${crmSafeText(serviceText)}</strong>`;
    } else {
        card.innerHTML = `<span class="crm-3day-event__time">${iconHtml}${crmSafeText(timeText)}</span><strong>${crmSafeText(serviceText)}</strong>${clientText ? `<span>${crmSafeText(clientText)}</span>` : ""}`;
    }

    card.title = `${timeText} ${clientText} ${serviceText}`.trim();
    if (item.eventType !== "work_shift") card.onclick = () => openAppointmentDetailsModal(item);
    else card.disabled = true;
    layer.appendChild(card);
};

/* ----- CAL.91. crmRenderWeekColumnEvents (oryginalna linia 6937) ----- */
crmRenderWeekColumnEvents = function(column, date, events) {
    const list = column.querySelector(".crm-week-events");
    if (!list) return;
    list.innerHTML = "";
    if (!events.length) return;

    /* CAL.91.1. Pomiar rzeczywistego miejsca do dolnej krawędzi kolumny. */
    const columnRect = column.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const listStyles = getComputedStyle(list);
    const paddingBottom = parseFloat(listStyles.paddingBottom) || 0;
    const originalGap = parseFloat(listStyles.rowGap || listStyles.gap) || 6;
    const gap = Math.min(originalGap, 3);
    list.style.setProperty("row-gap", `${gap}px`, "important");

    /* CAL.91.1. Wysokość kolumny nie może wynikać z jej obecnej zawartości.
       Liczymy do dolnej krawędzi widocznego obszaru roboczego przeglądarki.
       To obejmuje wolne miejsce pod białą kolumną widoczne na ekranie. */
    const viewportBottom = window.innerHeight - 18;
    const available = Math.max(0, viewportBottom - listRect.top - paddingBottom);
    const fullColumnHeight = Math.max(columnRect.height, viewportBottom - columnRect.top);
    column.style.height = `${fullColumnHeight}px`;
    column.style.minHeight = `${fullColumnHeight}px`;

    /* CAL.91.2. Tworzenie i pomiar prawdziwych kart. */
    const fragment = document.createDocumentFragment();
    const cards = events.map(item => {
        const card = crmCreateWeekVisitCard(item);
        fragment.appendChild(card);
        return card;
    });
    list.appendChild(fragment);

    const probeMore = document.createElement("button");
    probeMore.type = "button";
    probeMore.className = "crm-week-more";
    probeMore.textContent = "+99 pozostałych";
    probeMore.style.visibility = "hidden";
    list.appendChild(probeMore);
    const moreHeight = Math.ceil(probeMore.getBoundingClientRect().height || 28);
    probeMore.remove();

    const heights = cards.map(card => Math.ceil(card.getBoundingClientRect().height || 64));
    const allCardsHeight = heights.reduce((sum, height) => sum + height, 0)
        + gap * Math.max(0, heights.length - 1);

    let visibleCount = events.length;
    if (allCardsHeight > available) {
        visibleCount = 0;
        let used = moreHeight;
        for (let index = 0; index < heights.length; index += 1) {
            /* Rezerwujemy przerwę między ostatnią kartą i przyciskiem +N. */
            const cardGap = visibleCount > 0 ? gap : 0;
            const moreGap = gap;
            const nextUsed = used + cardGap + heights[index] + moreGap;
            if (nextUsed > available) break;
            used += cardGap + heights[index];
            visibleCount += 1;
        }
    }

    /* hidden bywa nadpisywane przez display:flex!important, dlatego używamy
       jawnego display:none z priorytetem important. */
    cards.forEach((card, index) => {
        if (index >= visibleCount) card.style.setProperty("display", "none", "important");
        else card.style.removeProperty("display");
    });

    const hiddenCount = Math.max(0, events.length - visibleCount);
    if (hiddenCount > 0) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "crm-week-more";
        const ending = hiddenCount === 1 ? "pozostała" : (hiddenCount >= 2 && hiddenCount <= 4 ? "pozostałe" : "pozostałych");
        more.textContent = `+${hiddenCount} ${ending}`;
        more.addEventListener("click", () => crmOpenDayVisitsList(date));
        list.appendChild(more);

        /* CAL.91.3. Odstęp pozostaje kompaktowy. Wolnego miejsca nie
           rozciągamy, ponieważ ma służyć do zmieszczenia kolejnej karty. */
    }
};

/* ==========================================================
   CAL.92. ETAP 1: DYNAMICZNY WIDOK DNIA I TRESC KART
   - skala czasu wynika z miejsca na ekranie i godzin pracy
   - godzina koncowa jest zawsze widoczna
   - tresc zalezy od faktycznej wysokosci karty, nie od minut
   ========================================================== */
function crmEtap1Clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function crmEtap1EventEndMinute(item, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const startDate = new Date(item?.date || item?.start || "");
    if (Number.isNaN(startDate.getTime())) return 0;
    const explicitEnd = new Date(item?.endDate || item?.end || "");
    const duration = Math.max(1, Number(item?.duration) || 45);
    const endDate = Number.isNaN(explicitEnd.getTime())
        ? new Date(startDate.getTime() + duration * 60000)
        : explicitEnd;
    return Math.ceil((endDate.getTime() - dayStart.getTime()) / 60000);
}

function crmEtap1DisplayRange(configuredStart, configuredEnd) {
    let latestEnd = configuredEnd;
    for (let dayIndex = 0; dayIndex < CRM_THREE_DAY_COUNT; dayIndex += 1) {
        const date = new Date(selectedCalendarDate);
        date.setDate(date.getDate() + dayIndex);
        getCalendarEventsForDate(date)
            .filter(item => item.eventType !== "work_shift")
            .forEach(item => {
                latestEnd = Math.max(latestEnd, crmEtap1EventEndMinute(item, date));
            });
    }
    const displayEnd = latestEnd > configuredEnd
        ? Math.ceil(latestEnd / 30) * 30
        : configuredEnd;
    return { start: configuredStart, end: displayEnd };
}

function crmEtap1DayScale(grid, rangeStart, rangeEnd) {
    const totalMinutes = Math.max(60, rangeEnd - rangeStart);
    const totalHours = totalMinutes / 60;
    const rect = grid.getBoundingClientRect();
    const viewportSpace = Math.max(520, window.innerHeight - rect.top - 18);
    const headerHeight = 42;
    const usableHeight = Math.max(420, viewportSpace - headerHeight);
    const minimumHourHeight = 62;
    const maximumHourHeight = 88;
    const hourHeight = crmEtap1Clamp(usableHeight / totalHours, minimumHourHeight, maximumHourHeight);
    return { hourHeight, pixelsPerMinute: hourHeight / 60, totalMinutes };
}

crmRenderThreeDayEvent = function(entry, layer, rangeStart, pixelsPerMinute) {
    const item = entry.item;
    const palette = crmCategoryPalette(item);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "crm-3day-event crm-day-card-adaptive";

    const exactTop = Math.round((entry.start - rangeStart) * pixelsPerMinute);
    const durationMinutes = Math.max(5, entry.end - entry.start);
    const exactHeight = Math.max(8, Math.round(durationMinutes * pixelsPerMinute) - 2);
    card.style.top = `${exactTop}px`;
    card.style.height = `${exactHeight}px`;
    card.dataset.durationMinutes = String(durationMinutes);
    card.dataset.renderedHeight = String(exactHeight);
    card.style.setProperty("--event-stripe", palette.stripe);
    card.style.setProperty("--event-fill", palette.fill);

    const statusKey = typeof crmV3NormalizeStatus === "function" ? crmV3NormalizeStatus(item) : "CONFIRMED";
    const meta = typeof CRM_V3_STATUS_META !== "undefined" ? CRM_V3_STATUS_META[statusKey] : null;
    const timeText = `${crmFormatVisitTime(entry.date)} – ${crmFormatVisitTime(entry.endDate)}`;
    const serviceText = String(item.service || item.name || "Wpis");
    const clientText = item.eventType === "appointment" ? String(item.name || "") : "";
    const iconHtml = meta ? `<i>${crmSafeText(meta.icon)}</i>` : "";

    if (exactHeight < 30) {
        card.classList.add("has-one-row");
        card.innerHTML = `<span class="crm-day-card-line">${iconHtml}<b>${crmSafeText(timeText)}</b>${clientText ? `<span class="crm-day-card-line__client">${crmSafeText(clientText)}</span>` : ""}<span class="crm-day-card-line__service">${crmSafeText(serviceText)}</span></span>`;
    } else if (exactHeight < 52) {
        card.classList.add("has-two-rows");
        card.innerHTML = `<span class="crm-3day-event__time">${iconHtml}${crmSafeText(timeText)}</span><strong>${crmSafeText(serviceText)}</strong>${clientText ? `<span class="crm-day-card-client-inline">${crmSafeText(clientText)}</span>` : ""}`;
    } else {
        card.classList.add("has-full-content");
        card.innerHTML = `<span class="crm-3day-event__time">${iconHtml}${crmSafeText(timeText)}</span><strong>${crmSafeText(serviceText)}</strong>${clientText ? `<span class="crm-day-card-client">${crmSafeText(clientText)}</span>` : ""}`;
    }

    card.title = `${timeText} ${clientText} ${serviceText}`.trim();
    if (item.eventType !== "work_shift") card.onclick = () => openAppointmentDetailsModal(item);
    else card.disabled = true;
    layer.appendChild(card);
};

crmRenderThreeDayCalendar = function(grid) {
    const configuredRange = crmDaySettingsRange();
    const baseDisplayRange = crmEtap1DisplayRange(configuredRange.start, configuredRange.end);
    const adjustedDisplayRange =
        typeof crmFirstVisitAdjustCalendarRangeV8 === "function"
            ? crmFirstVisitAdjustCalendarRangeV8(baseDisplayRange)
            : baseDisplayRange;
    const {start, end} = adjustedDisplayRange;
    const scale = crmEtap1DayScale(grid, start, end);
    const ppm = scale.pixelsPerMinute;
    const timelineHeight = scale.totalMinutes * ppm;
    const bottomVisualPadding = 20;
    const height = timelineHeight + bottomVisualPadding;

    document.documentElement.style.setProperty("--crm-hour-height", `${scale.hourHeight.toFixed(2)}px`);
    grid.innerHTML = "";
    grid.className = "crm-three-day-calendar";
    grid.dataset.calendarView = "day";
    grid.dataset.extendedAfterHours = end > configuredRange.end ? "true" : "false";

    const shell = document.createElement("div");
    shell.className = "crm-3day-shell";
    const labels = document.createElement("div");
    labels.className = "crm-3day-labels";
    labels.style.height = `${height + 42}px`;
    const spacer = document.createElement("div");
    spacer.className = "crm-3day-corner";
    labels.appendChild(spacer);

    for (let minute = start; minute <= end; minute += 60) {
        const label = document.createElement("span");
        label.style.top = `${42 + (minute - start) * ppm}px`;
        label.textContent = `${String(Math.floor(minute / 60)).padStart(2, "0")}:00`;
        labels.appendChild(label);
    }
    if ((end - start) % 60 !== 0) {
        const finalLabel = document.createElement("span");
        finalLabel.className = "is-workday-end";
        finalLabel.style.top = `${42 + (end - start) * ppm}px`;
        finalLabel.textContent = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
        labels.appendChild(finalLabel);
    }
    shell.appendChild(labels);

    for (let dayIndex = 0; dayIndex < CRM_THREE_DAY_COUNT; dayIndex++) {
        const date = new Date(selectedCalendarDate);
        date.setDate(date.getDate() + dayIndex);
        const column = document.createElement("section");
        column.className = "crm-3day-column";
        const header = document.createElement("button");
        header.type = "button";
        header.className = "crm-3day-header";
        header.innerHTML = `<b>${date.getDate()}</b><span>${date.toLocaleDateString("pl-PL", {weekday:"short", month:"short"})}</span>`;
        if (date.toDateString() === new Date().toDateString()) header.classList.add("is-today");
        header.onclick = () => {
            selectedCalendarDate = new Date(date);
            crmRenderCalendarInsights();
            renderMiniMonthCalendar();
        };

        const canvas = document.createElement("div");
        canvas.className = "crm-3day-canvas";
        canvas.style.setProperty("height", `${height}px`, "important");
        canvas.style.setProperty("min-height", `${height}px`, "important");
        for (let minute = start; minute <= end; minute += 30) {
            const line = document.createElement("div");
            line.className = minute % 60 === 0 ? "crm-3day-line is-hour" : "crm-3day-line";
            line.style.top = `${(minute - start) * ppm}px`;
            canvas.appendChild(line);
        }

        const layer = document.createElement("div");
        layer.className = "crm-3day-events";
        getCalendarEventsForDate(date)
            .filter(item => item.eventType !== "work_shift")
            .map(item => crmVisitEntry(item, start, end))
            .filter(Boolean)
            .forEach(entry => crmRenderThreeDayEvent(entry, layer, start, ppm));
        crmRenderCurrentTimeLine(layer, date, start, end, ppm);
        canvas.appendChild(layer);
        column.append(header, canvas);
        shell.appendChild(column);
    }

    grid.appendChild(shell);
    crmRenderCalendarInsights();
};



/* ========================================================================== 
   ADMIN FINAL V3: JEDEN PAS, WYBRANY DZIEN I IKONY PODSUMOWANIA
   ========================================================================== */
function crmFinalV3FormatDuration(totalMinutes){
    const minutes=Math.max(0,Number(totalMinutes)||0);
    const hours=Math.floor(minutes/60),rest=minutes%60;
    if(!hours)return `${rest} min`;
    if(!rest)return `${hours} godz.`;
    return `${hours} godz. ${rest} min`;
}
function crmFinalV3Icon(kind){
    const paths={
      visits:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h5"></path>',
      clock:'<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
      revenue:'<path d="M4 19V9M9 19v-6M14 19V5M3 20h18"></path><path d="m5 8 5-4 4 3 6-5"></path>',
      pending:'<path d="M7 3h10M7 21h10M8 3c0 5 2 6 4 9-2 3-4 4-4 9M16 3c0 5-2 6-4 9 2 3 4 4 4 9"></path>',
      cancelled:'<circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6M15 9l-6 6"></path>',
      next:'<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path><circle cx="15.5" cy="15.5" r="2.5"></circle><path d="M15.5 14v1.7l1 .6"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind]||paths.visits}</svg>`;
}
function crmFinalV3SelectedDayRows(){
    const start=new Date(selectedCalendarDate);start.setHours(0,0,0,0);
    const end=new Date(start);end.setHours(23,59,59,999);
    return (appointmentsData||[]).filter(item=>item.eventType==="appointment").filter(item=>{const date=crmDayEventDate(item);return date&&date>=start&&date<=end;});
}
function crmFinalV3RenderInsights(){
    const panel=crmEnsureCalendarInsights();if(!panel)return;
    const rows=crmFinalV3SelectedDayRows();
    const totalMinutes=rows.reduce((sum,item)=>sum+(Number(item.duration)||45),0);
    const revenue=rows.reduce((sum,item)=>{const service=(currentServices||[]).find(x=>x.name&&item.service&&x.name.trim().toLowerCase()===item.service.trim().toLowerCase());return sum+(Number(item.price??service?.price)||0);},0);
    const cancelled=rows.filter(item=>/ANUL|CANCEL/.test(String(item.status||item.crmStatus||"").toUpperCase())).length;
    const pending=rows.filter(item=>/OCZEK|PENDING/.test(String(item.status||item.crmStatus||"").toUpperCase())).length;
    const title=new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(selectedCalendarDate);
    const eyebrow=document.getElementById('crmInsightsEyebrow'),heading=document.getElementById('crmInsightsTitle');
    if(eyebrow)eyebrow.textContent='WYBRANY DZIEŃ';if(heading)heading.textContent=title.charAt(0).toUpperCase()+title.slice(1);
    const metric=(kind,label,value,extra='')=>`<div class="crm-insight-metric ${extra}"><i>${crmFinalV3Icon(kind)}</i><span>${label}</span><strong>${value}</strong></div>`;
    const metrics=[metric('visits','Liczba wizyt',rows.length),metric('clock','Łączny czas',crmFinalV3FormatDuration(totalMinutes)),metric('revenue','Przewidywany obrót',`${revenue.toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2})} zł`)];
    if(pending>0)metrics.push(metric('pending','Oczekujące prośby',pending,'is-clickable'));
    metrics.push(metric('cancelled','Anulowane wizyty',cancelled));
    const target=document.getElementById('crmInsightsMetrics');if(target)target.innerHTML=metrics.join('');
    const ordered=[...rows].filter(item=>!/ANUL|CANCEL/.test(String(item.status||item.crmStatus||'').toUpperCase())).sort((a,b)=>crmDayEventDate(a)-crmDayEventDate(b));
    const now=new Date();const next=ordered.find(item=>crmDayEventDate(item)>=now)||ordered[0];
    const nextBox=document.getElementById('crmInsightsNext');
    if(nextBox){nextBox.innerHTML=next?`<h4><i>${crmFinalV3Icon('next')}</i>Następna wizyta</h4><button type="button"><b>${crmFormatVisitTime(crmDayEventDate(next))}</b><span><strong>${crmSafeText(next.service||'Wizyta')}</strong>${crmSafeText(next.name||'')}</span></button>`:'<h4>Brak wizyt w wybranym dniu</h4>';const btn=nextBox.querySelector('button');if(btn){const palette=crmCategoryPalette(next);btn.style.borderLeftColor=palette.stripe;btn.onclick=()=>openAppointmentDetailsModal(next);}}
    const actions=panel.querySelector('.crm-insights-actions');if(actions)actions.hidden=Boolean(next);
    const pendingRow=target?.querySelector('.is-clickable');if(pendingRow)pendingRow.onclick=()=>crmFocusPendingRequests();
}
const crmFinalV3RenderOriginal=renderBooksyCalendar;
renderBooksyCalendar=function(){const result=crmFinalV3RenderOriginal.apply(this,arguments);requestAnimationFrame(crmFinalV3RenderInsights);return result;};
function crmFinalV3SelectDate(date){selectedCalendarDate=new Date(date);displayedCalendarMonth=new Date(date);miniMonthDate=new Date(date);renderMiniMonthCalendar();renderBooksyCalendar();}
document.addEventListener('click',event=>{
    const cell=event.target.closest('.crm-month-cell');
    if(cell&&!event.target.closest('.crm-month-visit-card,.crm-month-more,.crm-month-count,.crm-month-day-number')&&cell.dataset.date){crmFinalV3SelectDate(new Date(cell.dataset.date+'T12:00:00'));return;}
    const number=event.target.closest('.crm-month-day-number');
    if(number){const selectedCell=number.closest('.crm-month-cell');if(selectedCell?.dataset.date){event.preventDefault();event.stopImmediatePropagation();crmFinalV3SelectDate(new Date(selectedCell.dataset.date+'T12:00:00'));}}
},true);
function crmFinalV3InstallToolbar(){
    const header=document.querySelector('#tab-kalendarz .calendar-layout-header');if(!header)return;
    const actions=header.querySelector('.crm-calendar-toolbar-actions')||Array.from(header.children).find(child=>child.querySelector('.crm-add-appointment-btn,#openBlockTimeBtn'));
    if(actions)actions.classList.add('crm-calendar-toolbar-actions');
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(crmFinalV3InstallToolbar,250));
/* KONIEC ADMIN FINAL V3 */


/* ========================================================================== 
   ADMIN FINAL V4: SYNCHRONIZACJA MINI KALENDARZA I DATA PODSUMOWANIA
   ========================================================================== */
const crmFinalV4MiniRenderOriginal = renderMiniMonthCalendar;
renderMiniMonthCalendar = function(){
    crmFinalV4MiniRenderOriginal.apply(this, arguments);
    const grid=document.getElementById('mini-month-days-grid');
    if(!grid)return;
    const year=miniMonthDate.getFullYear(),month=miniMonthDate.getMonth();
    const cells=[...grid.querySelectorAll('.mini-date-cell')];
    cells.forEach((cell,index)=>{
        const day=Number(cell.textContent||0);if(!day)return;
        const date=new Date(year,month,day,12,0,0,0);
        cell.dataset.date=getFormattedISOBlockDate(date);
        cell.onclick=event=>{
            event.preventDefault();event.stopPropagation();
            selectedCalendarDate=new Date(date);
            displayedCalendarMonth=new Date(date);
            miniMonthDate=new Date(date);
            renderMiniMonthCalendar();
            renderBooksyCalendar();
        };
    });
};
function crmFinalV4EnsureInsightsHeader(){
    const panel=crmEnsureCalendarInsights();if(!panel)return;
    let header=panel.querySelector('.crm-insights-header');
    if(!header){
        header=document.createElement('header');header.className='crm-insights-header';
        header.innerHTML='<div><span id="crmInsightsEyebrow">WYBRANY DZIEŃ</span><h3 id="crmInsightsTitle">—</h3></div>';
        panel.prepend(header);
    }
    const title=header.querySelector('#crmInsightsTitle');
    const eyebrow=header.querySelector('#crmInsightsEyebrow');
    const value=new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(selectedCalendarDate);
    if(eyebrow)eyebrow.textContent='WYBRANY DZIEŃ';
    if(title)title.textContent=value.charAt(0).toUpperCase()+value.slice(1);
}
const crmFinalV4InsightsOriginal=crmFinalV3RenderInsights;
crmFinalV3RenderInsights=function(){crmFinalV4InsightsOriginal.apply(this,arguments);crmFinalV4EnsureInsightsHeader();renderMiniMonthCalendar();};
function crmFinalV4FitToolbar(){
    const header=document.querySelector('#tab-kalendarz .calendar-layout-header');
    const actions=header?.querySelector('.crm-calendar-toolbar-actions');
    const insights=document.getElementById('crmCalendarInsights');
    if(!header||!actions)return;
    actions.classList.add('crm-toolbar-before-insights');
    if(insights)insights.classList.add('crm-insights-has-own-header');
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{crmFinalV4FitToolbar();renderMiniMonthCalendar();crmFinalV4EnsureInsightsHeader();},350));
/* KONIEC ADMIN FINAL V4 */

/* ========================================================================== 
   ADMIN FINAL V6 SAFE: PELNE DATY, SWIETO, WOLNE I SYNCHRONIZACJA
   Zmiana bez zastępowania rendererów Kalendarza.
   ========================================================================== */
function crmV6SameCalendarDay(first, second) {
    return first instanceof Date && second instanceof Date &&
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
}

function crmV6PolishDate(date, includeYear = false) {
    return new Intl.DateTimeFormat("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        ...(includeYear ? { year: "numeric" } : {})
    }).format(date);
}

function crmV6EasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

function crmV6HolidayName(date) {
    const fixed = new Map([
        ["1-1", "Nowy Rok"],
        ["1-6", "Święto Trzech Króli"],
        ["5-1", "Święto Pracy"],
        ["5-3", "Święto Konstytucji 3 Maja"],
        ["8-15", "Wniebowzięcie Najświętszej Maryi Panny"],
        ["11-1", "Wszystkich Świętych"],
        ["11-11", "Narodowe Święto Niepodległości"],
        ["12-24", "Wigilia Bożego Narodzenia"],
        ["12-25", "Boże Narodzenie"],
        ["12-26", "Drugi dzień Bożego Narodzenia"]
    ]);
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    if (fixed.has(key)) return fixed.get(key);

    const easter = crmV6EasterSunday(date.getFullYear());
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = Math.round((current.getTime() - easter.getTime()) / 86400000);
    if (offset === 0) return "Wielkanoc";
    if (offset === 1) return "Poniedziałek Wielkanocny";
    if (offset === 49) return "Zielone Świątki";
    if (offset === 60) return "Boże Ciało";
    return "";
}

function crmV6IsFullDayBlock(item) {
    if (String(item?.eventType || "") !== "block") return false;

    /* WOLNE może pochodzić wyłącznie z ręcznej blokady całego dnia.
       Jeśli backend przekazuje blockType=full_day, jest to rozstrzygające. */
    if (String(item?.blockType || "").toLowerCase() === "full_day") return true;

    /* Starsze wpisy blokad nie miały blockType w odpowiedzi API.
       Dla nich uznajemy wyłącznie dokładne 00:00 -> 00:00 następnego dnia.
       Nie stosujemy progu „>=23 h”, bo częściowa blokada nie może dawać WOLNE. */
    const start = crmDayEventDate(item);
    const end = item?.endDate ? new Date(item.endDate) : null;
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) return false;
    if (!(end instanceof Date) || Number.isNaN(end.getTime())) return false;

    if (
        start.getHours() !== 0 || start.getMinutes() !== 0 ||
        start.getSeconds() !== 0 || start.getMilliseconds() !== 0 ||
        end.getHours() !== 0 || end.getMinutes() !== 0 ||
        end.getSeconds() !== 0 || end.getMilliseconds() !== 0
    ) return false;

    const expectedEnd = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 1,
        0, 0, 0, 0
    );
    return end.getTime() === expectedEnd.getTime();
}

/* PUNKT 4 PLANU: BRAK/WOLNE/ŚWIĘTO
   - BRAK/Brak: tylko eventType=work_shift zwrócony przez backend z markera grafiku,
   - WOLNE: tylko pełna ręczna blokada 00:00 -> 00:00 następnego dnia i brak innych wpisów,
   - ŚWIĘTO: niezależna informacja, może współistnieć z wizytą. */
function crmV6DayPresentation(date) {
    const items = getCalendarEventsForDate(date) || [];
    const shifts = items.filter(item => item?.eventType === "work_shift");
    const entries = items.filter(item => item?.eventType !== "work_shift");

    /*
     * Wielkość liter jest częścią kodu grafiku:
     * Brak = pierwsza zmiana (dniówka)
     * BRAK = druga zmiana (nocka)
     * Brak obu wpisów = dzień bez oznaczenia.
     */
    const shiftLabels = shifts.map(item =>
        String(item?.name || item?.code || "").trim()
    );
    const hasFirstShiftBrak = shiftLabels.includes("Brak");
    const hasNightShiftBrak = shiftLabels.includes("BRAK");

    const hasFullDayBlock = entries.some(crmV6IsFullDayBlock);
    const hasVisitOrExternal = entries.some(item => item?.eventType !== "block");
    return {
        hasFirstShiftBrak,
        hasNightShiftBrak,
        isDayOff: hasFullDayBlock && !hasVisitOrExternal,
        holidayName: crmV6HolidayName(date)
    };
}

function crmV6Badge(text, variant, title = "") {
    const badge = document.createElement("span");
    badge.className = `crm-v6-calendar-badge is-${variant}`;
    badge.textContent = text;
    if (title) badge.title = title;
    return badge;
}

function crmV6EnhanceMiniCalendar() {
    const grid = document.getElementById("mini-month-days-grid");
    if (!grid) return;
    const year = miniMonthDate.getFullYear();
    const month = miniMonthDate.getMonth();
    grid.querySelectorAll(".mini-date-cell").forEach(cell => {
        const day = Number(cell.textContent || 0);
        if (!day) return;
        const date = new Date(year, month, day, 12, 0, 0, 0);
        cell.classList.toggle("today", crmV6SameCalendarDay(date, new Date()));
        cell.classList.toggle("selected", crmV6SameCalendarDay(date, selectedCalendarDate));
        cell.classList.remove("has-day-off", "has-holiday");
        const presentation = crmV6DayPresentation(date);
        if (presentation.holidayName) cell.classList.add("has-holiday");
        else if (presentation.isDayOff) cell.classList.add("has-day-off");
    });
}

function crmV6EnhanceMonthCells() {
    document.querySelectorAll(".crm-month-cell[data-date]").forEach(cell => {
        const date = new Date(`${cell.dataset.date}T12:00:00`);
        if (Number.isNaN(date.getTime())) return;
        const presentation = crmV6DayPresentation(date);
        const shift = cell.querySelector(".crm-month-shift");
        if (!shift) return;

        shift.querySelectorAll(".crm-v6-calendar-badge").forEach(node => node.remove());
        shift.querySelectorAll("span").forEach(node => {
            const label = String(node.textContent || "").trim();
            node.classList.remove(
                "crm-v6-existing-brak",
                "is-first-shift",
                "is-night-shift"
            );
            if (label === "Brak") {
                node.textContent = "Brak";
                node.classList.add("crm-v6-existing-brak", "is-first-shift");
                node.style.setProperty("text-transform", "none", "important");
            } else if (label === "BRAK") {
                node.textContent = "BRAK";
                node.classList.add("crm-v6-existing-brak", "is-night-shift");
                node.style.setProperty("text-transform", "none", "important");
            }
        });
        if (presentation.holidayName) {
            shift.appendChild(crmV6Badge("ŚWIĘTO", "holiday", presentation.holidayName));
        }
        if (presentation.isDayOff) {
            shift.appendChild(crmV6Badge("WOLNE", "off", "Cały dzień zablokowany i bez wizyt"));
        }
        shift.hidden = !shift.children.length;
    });
}

function crmV6EnhanceThreeDayHeaders() {
    if (calendarViewMode !== "day") return;
    document.querySelectorAll(".crm-3day-column").forEach((column, index) => {
        const date = new Date(selectedCalendarDate);
        date.setDate(date.getDate() + index);
        const header = column.querySelector(".crm-3day-header");
        if (!header) return;
        const dayNumber = header.querySelector("b");
        const details = header.querySelector("span");
        if (dayNumber) dayNumber.textContent = date.toLocaleDateString("pl-PL", { weekday: "long" });
        if (details) details.textContent = date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });

        let badges = header.querySelector(".crm-v6-header-badges");
        if (!badges) {
            badges = document.createElement("span");
            badges.className = "crm-v6-header-badges";
            header.appendChild(badges);
        }
        badges.innerHTML = "";
        const presentation = crmV6DayPresentation(date);
        if (presentation.hasFirstShiftBrak) badges.appendChild(crmV6Badge("Brak", "brak first-shift"));
        if (presentation.hasNightShiftBrak) badges.appendChild(crmV6Badge("BRAK", "brak night-shift"));
        if (presentation.holidayName) badges.appendChild(crmV6Badge("ŚWIĘTO", "holiday", presentation.holidayName));
        if (presentation.isDayOff) badges.appendChild(crmV6Badge("WOLNE", "off"));
    });
}

function crmV6EnhanceRangeTitle() {
    const title = document.getElementById("calendar-current-date-title");
    if (!title) return;
    if (calendarViewMode === "month") {
        title.textContent = (displayedCalendarMonth || selectedCalendarDate).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
        return;
    }
    const start = calendarViewMode === "week" ? getMondayOfWeek(selectedCalendarDate) : new Date(selectedCalendarDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (calendarViewMode === "week" ? 6 : 2));
    title.textContent = `${crmV6PolishDate(start)} – ${crmV6PolishDate(end, true)}`;
}

function crmV6ApplySafeCalendarEnhancements() {
    crmV6EnhanceMiniCalendar();
    crmV6EnhanceMonthCells();
    crmV6EnhanceThreeDayHeaders();
    crmV6EnhanceRangeTitle();
}

const crmV6RenderBooksyCalendarOriginal = renderBooksyCalendar;
renderBooksyCalendar = function() {
    const result = crmV6RenderBooksyCalendarOriginal.apply(this, arguments);
    requestAnimationFrame(crmV6ApplySafeCalendarEnhancements);
    return result;
};

const crmV6RenderMiniMonthOriginal = renderMiniMonthCalendar;
renderMiniMonthCalendar = function() {
    const result = crmV6RenderMiniMonthOriginal.apply(this, arguments);
    crmV6EnhanceMiniCalendar();
    return result;
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(crmV6ApplySafeCalendarEnhancements, 450);
});
/* KONIEC ADMIN FINAL V6 SAFE */

/* ========================================================================== 
   ADMIN FINAL V7: CZYTELNE NAGLOWKI, DATA PANELU I PAS NARZEDZI
   ========================================================================== */
function crmV7CapitalizeFirst(text) {
    const value = String(text || "");
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
function crmV7RenderDayHeaders() {
    if (calendarViewMode !== "day") return;
    document.querySelectorAll(".crm-3day-column").forEach((column, index) => {
        const date = new Date(selectedCalendarDate);
        date.setDate(date.getDate() + index);
        const header = column.querySelector(".crm-3day-header");
        if (!header) return;
        const presentation = crmV6DayPresentation(date);
        header.classList.toggle("is-selected", crmV6SameCalendarDay(date, selectedCalendarDate));
        header.classList.toggle("is-today", crmV6SameCalendarDay(date, new Date()));
        header.innerHTML = "";

        const label = document.createElement("span");
        label.className = "crm-v7-day-label";
        label.textContent = crmV7CapitalizeFirst(new Intl.DateTimeFormat("pl-PL", {
            weekday: "long", day: "numeric", month: "long"
        }).format(date));

        const badges = document.createElement("span");
        badges.className = "crm-v7-day-badges";
        if (presentation.hasFirstShiftBrak) badges.appendChild(crmV6Badge("Brak", "brak first-shift"));
        if (presentation.hasNightShiftBrak) badges.appendChild(crmV6Badge("BRAK", "brak night-shift"));
        if (presentation.holidayName) badges.appendChild(crmV6Badge("ŚWIĘTO", "holiday", presentation.holidayName));
        if (presentation.isDayOff) badges.appendChild(crmV6Badge("WOLNE", "off"));
        header.append(label, badges);
    });
}

function crmV7RenderRangeTitle() {
    const title = document.getElementById("calendar-current-date-title");
    if (!title) return;
    if (calendarViewMode === "month") {
        title.textContent = crmV7CapitalizeFirst((displayedCalendarMonth || selectedCalendarDate).toLocaleDateString("pl-PL", { month: "long", year: "numeric" }));
        return;
    }
    const start = calendarViewMode === "week" ? getMondayOfWeek(selectedCalendarDate) : new Date(selectedCalendarDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (calendarViewMode === "week" ? 6 : 2));
    const first = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(start);
    const second = new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(end);
    title.textContent = `${crmV7CapitalizeFirst(first)} – ${second}`;
}

function crmV7Apply() {
    crmV7RenderDayHeaders();
    crmV7RenderRangeTitle();
    crmV6EnhanceMiniCalendar();
    crmV6EnhanceMonthCells();
}

const crmV7RenderCalendarOriginal = renderBooksyCalendar;
renderBooksyCalendar = function() {
    const result = crmV7RenderCalendarOriginal.apply(this, arguments);
    requestAnimationFrame(crmV7Apply);
    return result;
};

document.addEventListener("DOMContentLoaded", () => setTimeout(crmV7Apply, 550));
/* KONIEC ADMIN FINAL V7 */


/* ========================================================================== 
   ADMIN FINAL V8: TRWALA DATA PANELU I ODSUNIECIE PRZYCISKOW
   ========================================================================== */
function crmV8RenderSelectedDateHeader() {
    const panel = document.getElementById("crmCalendarInsights") || crmEnsureCalendarInsights();
    if (!panel) return;

    let box = panel.querySelector(".crm-v8-selected-date");
    if (!box) {
        box = document.createElement("div");
        box.className = "crm-v8-selected-date";
    }

    const value = new Intl.DateTimeFormat("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(selectedCalendarDate);

    box.innerHTML = `<span>WYBRANY DZIEŃ</span><strong>${crmV7CapitalizeFirst(value)}</strong>`;

    const firstContent = panel.querySelector(".crm-insights-metrics, #crmInsightsMetrics");
    if (firstContent) panel.insertBefore(box, firstContent);
    else panel.prepend(box);

    panel.querySelectorAll(".crm-insights-header").forEach(header => {
        header.hidden = true;
        header.setAttribute("aria-hidden", "true");
    });
}

const crmV8InsightsOriginal = crmRenderCalendarInsights;
crmRenderCalendarInsights = function() {
    const result = crmV8InsightsOriginal.apply(this, arguments);
    crmV8RenderSelectedDateHeader();
    requestAnimationFrame(crmV8RenderSelectedDateHeader);
    return result;
};

function crmV8FixCalendarToolbarWidth() {
    const tab = document.getElementById("tab-kalendarz");
    const header = tab?.querySelector(".calendar-layout-header");
    const insights = document.getElementById("crmCalendarInsights");
    if (!tab || !header) return;

    if (window.innerWidth >= 1121) {
        const panelWidth = insights ? Math.ceil(insights.getBoundingClientRect().width) : 330;
        header.style.setProperty("--crm-v8-panel-width", `${panelWidth}px`);
        header.classList.add("crm-v8-toolbar-constrained");
    } else {
        header.classList.remove("crm-v8-toolbar-constrained");
        header.style.removeProperty("--crm-v8-panel-width");
    }
}

window.addEventListener("resize", crmV8FixCalendarToolbarWidth);
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        crmV8RenderSelectedDateHeader();
        crmV8FixCalendarToolbarWidth();
    }, 700);
});
/* KONIEC ADMIN FINAL V8 */

/* ==========================================================================
   CAL.93. LEKKA SYNCHRONIZACJA CRM + GOOGLE CALENDAR
   - bez loadSystem()
   - bez pobierania klientów, cennika i finansów
   - po zmianie widoku lub zakresu
   - zachowuje selectedCalendarDate i aktualny wygląd
   ========================================================================== */
let crmCalendarLightSyncPromise = null;
let crmCalendarLightSyncQueued = false;
let crmCalendarLightSyncSequence = 0;

function crmCalendarVisibleRange() {
    const start = new Date(selectedCalendarDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    if (calendarViewMode === "month") {
        const visibleMonth = displayedCalendarMonth instanceof Date
            ? displayedCalendarMonth
            : selectedCalendarDate;
        start.setFullYear(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
        end.setFullYear(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    } else if (calendarViewMode === "week") {
        const monday = getMondayOfWeek(selectedCalendarDate);
        start.setTime(monday.getTime());
        end.setTime(monday.getTime());
        end.setDate(end.getDate() + 6);
    } else {
        end.setDate(end.getDate() + Math.max(0, Number(CRM_THREE_DAY_COUNT || 3) - 1));
    }
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

async function crmLightSyncCalendarData(reason) {
    if (crmCalendarLightSyncPromise) return crmCalendarLightSyncPromise;
    if (window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11) return null;

    const sequence = ++crmCalendarLightSyncSequence;

    crmCalendarLightSyncPromise = (async () => {
        const range = crmCalendarVisibleRange();
        const from = getFormattedISOBlockDate(range.start);
        const to = getFormattedISOBlockDate(range.end);
        const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
        const query = [
            "checkBusy=true",
            `rangeStart=${encodeURIComponent(from)}`,
            `rangeEnd=${encodeURIComponent(to)}`,
            `_crmSync=${Date.now()}`
        ].join("&");
        const url = `${APPS_SCRIPT_URL}${separator}${query}`;

        const payload = typeof crmQueuedGetV11 === "function"
            ? await crmQueuedGetV11(url, {
                key:`calendar:${from}:${to}`,
                priority:90,
                timeoutMs:45000
              })
            : await (async () => {
                const response = await fetch(url, {method:"GET",cache:"no-store"});
                const text = await response.text();
                if(!response.ok) throw new Error(`Błąd synchronizacji Kalendarza: HTTP ${response.status}`);
                return JSON.parse(text);
              })();

        if (!payload || !Array.isArray(payload.appointments)) {
            throw new Error(payload?.error || "Backend nie zwrócił listy wizyt");
        }

        if (sequence !== crmCalendarLightSyncSequence) return payload;

        appointmentsData = payload.appointments;
        if (payload.settings && typeof payload.settings === "object") {
            settingsData = {...settingsData, ...payload.settings};
        }

        if (typeof renderBooksyCalendar === "function") renderBooksyCalendar();
        if (typeof renderMiniMonthCalendar === "function") renderMiniMonthCalendar();
        if (typeof crmRenderCalendarInsights === "function") crmRenderCalendarInsights();

        return payload;
    })().finally(() => {
        crmCalendarLightSyncPromise = null;
        crmCalendarLightSyncQueued = false;
    });

    return crmCalendarLightSyncPromise;
}

function crmScheduleCalendarLightSync(reason) {
    clearTimeout(crmScheduleCalendarLightSync.timer);
    crmScheduleCalendarLightSync.timer = setTimeout(() => {
        crmLightSyncCalendarData(reason).catch(error => {
            console.error("Lekka synchronizacja Kalendarza nie powiodła się:", error);
        });
    }, 80);
}
crmScheduleCalendarLightSync.timer = null;

const crmCalendarSyncSetViewOriginal = setCalendarView;
setCalendarView = function(mode) {
    const result = crmCalendarSyncSetViewOriginal.apply(this, arguments);
    crmScheduleCalendarLightSync(`widok:${mode}`);
    return result;
};

const crmCalendarSyncChangeDateOriginal = changeSelectedDate;
changeSelectedDate = function(days) {
    const result = crmCalendarSyncChangeDateOriginal.apply(this, arguments);
    crmScheduleCalendarLightSync(`zakres:${days}`);
    return result;
};

/* Po powrocie do karty odświeżamy tylko Kalendarz. */
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) crmScheduleCalendarLightSync("powrot-do-karty");
});

/* KONIEC CAL.93 */




/* ========================================================================== 
   ADMIN FINAL: LOKALNY CACHE PROSB, WYBRANY DZIEN, OZNACZENIA I ANULOWANIA
   ========================================================================== */
function crmRequestDateKey(value) {
    const text = String(value || "").trim();
    let match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? "" : getFormattedISOBlockDate(date);
}

function crmRequestKeys(request) {
    return new Set([
        crmRequestDateKey(request?.mainIso || request?.main),
        crmRequestDateKey(request?.alternativeIso || request?.alternative)
    ].filter(Boolean));
}

function crmPendingRequestsForDate(date) {
    const key = getFormattedISOBlockDate(date);
    return (Array.isArray(window.crmPendingRequestsData) ? window.crmPendingRequestsData : [])
        .filter(request => crmRequestKeys(request).has(key));
}

function crmPendingRequestDateCounts() {
    const counts = new Map();
    (Array.isArray(window.crmPendingRequestsData) ? window.crmPendingRequestsData : []).forEach(request => {
        crmRequestKeys(request).forEach(key => counts.set(key, (counts.get(key) || 0) + 1));
    });
    return counts;
}

function crmApplyPendingRequestDayMarkers() {
    const counts = crmPendingRequestDateCounts();
    document.querySelectorAll(".crm-month-cell[data-date], .crm-week-column[data-date], .mini-date-cell[data-date]").forEach(element => {
        const count = counts.get(element.dataset.date) || 0;
        element.classList.toggle("has-pending-request", count > 0);
        const number = element.querySelector?.(".crm-month-day-number");
        if (count > 0) {
            element.dataset.pendingRequestCount = String(count);
            if (number) number.dataset.pendingRequestCount = String(count);
        } else {
            delete element.dataset.pendingRequestCount;
            if (number) delete number.dataset.pendingRequestCount;
        }
    });

    if (calendarViewMode === "day") {
        document.querySelectorAll(".crm-3day-column").forEach((column, index) => {
            const date = new Date(selectedCalendarDate);
            date.setDate(date.getDate() + index);
            const count = counts.get(getFormattedISOBlockDate(date)) || 0;
            column.classList.toggle("has-pending-request", count > 0);
            if (count > 0) column.dataset.pendingRequestCount = String(count);
            else delete column.dataset.pendingRequestCount;
        });
    }
}

function crmFindInsightMetricByLabel(label) {
    return Array.from(document.querySelectorAll("#crmInsightsMetrics .crm-insight-metric, #crmInsightsMetrics > div"))
        .find(row => String(row.querySelector("span")?.textContent || "").trim() === label) || null;
}

function crmApplyDayRequestAndCancellationMetrics() {
    const metrics = document.getElementById("crmInsightsMetrics");
    if (!metrics) return;

    Array.from(metrics.children).forEach(row => {
        if (String(row.querySelector("span")?.textContent || "").trim() === "Oczekujące prośby") row.remove();
    });

    const selectedKey = getFormattedISOBlockDate(selectedCalendarDate);
    const pendingCount = crmPendingRequestsForDate(selectedCalendarDate).length;
    const cancelledCount = Math.max(0, Number(window.crmCancelledCountsByDate?.[selectedKey]) || 0);
    const cancelledRow = crmFindInsightMetricByLabel("Anulowane wizyty");

    if (cancelledRow) {
        const value = cancelledRow.querySelector("strong");
        if (value) value.textContent = String(cancelledCount);
    }

    if (pendingCount > 0) {
        const row = document.createElement("div");
        row.className = "crm-insight-metric is-clickable crm-pending-day-metric";
        row.innerHTML = `<i>${crmFinalV3Icon("pending")}</i><span>Oczekujące prośby</span><strong>${pendingCount}</strong>`;
        row.onclick = () => crmFocusPendingRequests();
        metrics.insertBefore(row, cancelledRow || null);
    }

    crmApplyPendingRequestDayMarkers();
}

const crmPendingDayRenderInsightsOriginal = crmRenderCalendarInsights;
crmRenderCalendarInsights = function() {
    const result = crmPendingDayRenderInsightsOriginal.apply(this, arguments);
    crmApplyDayRequestAndCancellationMetrics();
    requestAnimationFrame(crmApplyDayRequestAndCancellationMetrics);
    return result;
};

const crmPendingDayRenderCalendarOriginal = renderBooksyCalendar;
renderBooksyCalendar = function() {
    const result = crmPendingDayRenderCalendarOriginal.apply(this, arguments);
    requestAnimationFrame(crmApplyPendingRequestDayMarkers);
    return result;
};
/* KONIEC ADMIN FINAL: LOKALNY CACHE PROSB, WYBRANY DZIEN, OZNACZENIA I ANULOWANIA */



/* ==========================================================================
   CALENDAR FIRST VISIT V8 2026-08-12
   Propozycje klienta sa warstwa glownego kalendarza, nie prawdziwa wizyta.
   ========================================================================== */
function crmFirstVisitProposalRowsCalendarV8(){
    const item=window.crmFirstVisitSelectionModeV8?.item;
    if(!window.crmFirstVisitSelectionModeV8?.active||!item)return[];
    if(typeof crmFirstVisitNormalizeProposalsV8==="function")return crmFirstVisitNormalizeProposalsV8(item);
    return Array.isArray(item.proposals)?item.proposals:[];
}
function crmFirstVisitProposalMinutesV8(){
    const result=[];
    crmFirstVisitProposalRowsCalendarV8().forEach(row=>(row.times||[]).forEach(time=>{
        const [h,m]=String(time).split(":").map(Number);
        if(Number.isFinite(h)&&Number.isFinite(m))result.push(h*60+m);
    }));
    return result;
}
function crmFirstVisitAdjustCalendarRangeV8(baseRange){
    if(!window.crmFirstVisitSelectionModeV8?.active)return baseRange;
    const times=crmFirstVisitProposalMinutesV8();
    const duration=Number(window.crmFirstVisitSelectionModeV8?.item?.duration)||45;
    let start=Math.max(0,baseRange.start-60);
    let end=Math.min(24*60,baseRange.end+60);
    if(times.length){
        const earliest=Math.min(...times),latestEnd=Math.max(...times.map(v=>v+duration));
        start=Math.min(start,Math.floor(earliest/30)*30);
        end=Math.max(end,Math.ceil(latestEnd/30)*30);
    }
    return{start:start,end:end};
}
window.crmFirstVisitAdjustCalendarRangeV8=crmFirstVisitAdjustCalendarRangeV8;
function crmFirstVisitDateKeyCalendarV8(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function crmFirstVisitConflictCalendarV8(dateKey,time,duration){
    const start=new Date(`${dateKey}T${time}`),end=new Date(start.getTime()+(Number(duration)||45)*60000);
    return (appointmentsData||[]).filter(item=>item.eventType!=="work_shift").some(item=>{
        const itemStart=new Date(item.date||item.start||"");
        const itemEnd=new Date(item.endDate||item.end||new Date(itemStart.getTime()+(Number(item.duration)||45)*60000));
        if(Number.isNaN(itemStart.getTime())||Number.isNaN(itemEnd.getTime()))return false;
        return start<itemEnd&&end>itemStart;
    });
}
function crmFirstVisitOverlayForColumnV8(column,date,startMinute,pixelsPerMinute){
    const item=window.crmFirstVisitSelectionModeV8?.item;if(!item)return;
    const dateKey=crmFirstVisitDateKeyCalendarV8(date);
    const proposal=crmFirstVisitProposalRowsCalendarV8().find(row=>String(row.date)===dateKey);
    const header=column.querySelector(".crm-3day-header");
    if(proposal&&header){
        header.classList.add("crm-first-visit-proposed-day");
        const badge=document.createElement("em");badge.className="crm-first-visit-day-badge";badge.textContent=proposal.times?.length?"propozycje klienta":"preferowany dzien";header.appendChild(badge);
    }
    const layer=column.querySelector(".crm-3day-events");if(!layer||!proposal||!Array.isArray(proposal.times))return;
    const duration=Number(item.duration)||45;
    proposal.times.forEach(time=>{
        const [hour,minute]=String(time).split(":").map(Number);if(!Number.isFinite(hour)||!Number.isFinite(minute))return;
        const minuteOfDay=hour*60+minute,top=Math.round((minuteOfDay-startMinute)*pixelsPerMinute),height=Math.max(26,Math.round(duration*pixelsPerMinute)-2);
        if(top<-height)return;
        const conflict=crmFirstVisitConflictCalendarV8(dateKey,time,duration);
        const marker=document.createElement("button");marker.type="button";marker.className="crm-first-visit-proposal"+(conflict?" is-conflict":"");
        marker.style.top=`${top}px`;marker.style.height=`${height}px`;
        marker.innerHTML=`<span>${time} · ${duration} min</span><strong>${conflict?"Propozycja · termin obecnie zajety":"Propozycja klienta"}</strong>`;
        marker.title=conflict?"Klient zaproponowal ten termin, ale obecnie koliduje on z innym wpisem.":"Kliknij, aby przygotowac wizyte na ten termin.";
        marker.onclick=event=>{event.stopPropagation();if(typeof window.crmOpenFirstVisitAppointmentV8==="function")window.crmOpenFirstVisitAppointmentV8(item,`${dateKey}T${time}`);};
        layer.appendChild(marker);
    });
}
function crmFirstVisitInstallCanvasPickV8(column,date,startMinute,pixelsPerMinute,endMinute){
    const canvas=column.querySelector(".crm-3day-canvas");if(!canvas)return;
    canvas.classList.add("crm-first-visit-pick-canvas");
    canvas.addEventListener("click",event=>{
        if(!window.crmFirstVisitSelectionModeV8?.active)return;
        if(event.target.closest(".crm-3day-event,.crm-first-visit-proposal,.crm-current-time-line"))return;
        const rect=canvas.getBoundingClientRect();
        const raw=startMinute+((event.clientY-rect.top)/pixelsPerMinute);
        const rounded=Math.round(raw/5)*5;
        if(rounded<startMinute||rounded>endMinute)return;
        const hh=String(Math.floor(rounded/60)).padStart(2,"0"),mm=String(rounded%60).padStart(2,"0");
        const dateKey=crmFirstVisitDateKeyCalendarV8(date);
        if(typeof window.crmOpenFirstVisitAppointmentV8==="function")window.crmOpenFirstVisitAppointmentV8(window.crmFirstVisitSelectionModeV8.item,`${dateKey}T${hh}:${mm}`);
    });
}
const crmRenderThreeDayCalendarBeforeFirstVisitV8=crmRenderThreeDayCalendar;
crmRenderThreeDayCalendar=function(grid){
    crmRenderThreeDayCalendarBeforeFirstVisitV8(grid);
    if(!window.crmFirstVisitSelectionModeV8?.active)return;
    const configured=crmDaySettingsRange(),baseRange=crmEtap1DisplayRange(configured.start,configured.end),range=crmFirstVisitAdjustCalendarRangeV8(baseRange),scale=crmEtap1DayScale(grid,range.start,range.end);
    Array.from(grid.querySelectorAll(".crm-3day-column")).forEach((column,index)=>{
        const date=new Date(selectedCalendarDate);date.setDate(date.getDate()+index);
        crmFirstVisitOverlayForColumnV8(column,date,range.start,scale.pixelsPerMinute);
        crmFirstVisitInstallCanvasPickV8(column,date,range.start,scale.pixelsPerMinute,range.end);
    });
};
const renderMiniMonthCalendarBeforeFirstVisitV8=renderMiniMonthCalendar;
renderMiniMonthCalendar=function(){
    renderMiniMonthCalendarBeforeFirstVisitV8();
    if(!window.crmFirstVisitSelectionModeV8?.active)return;
    const proposalDates=new Set(crmFirstVisitProposalRowsCalendarV8().map(row=>String(row.date)));
    document.querySelectorAll("#mini-month-days-grid .mini-date-cell").forEach(cell=>{
        const day=Number(cell.textContent);if(!day)return;
        const date=new Date(miniMonthDate.getFullYear(),miniMonthDate.getMonth(),day),key=crmFirstVisitDateKeyCalendarV8(date);
        if(proposalDates.has(key))cell.classList.add("crm-first-visit-mini-proposed");
    });
};
/* KONIEC CALENDAR FIRST VISIT V8 */

/* ==========================================================================
   CALENDAR NETWORK V11 2026-08-12
   Widoczny zakres kalendarza korzysta ze wspólnej kolejki odczytów.
   ========================================================================== */
if(typeof crmLightSyncCalendarData==="function"){
    crmLightSyncCalendarData=async function(reason){
        if(window.crmBootInProgressV2 || window.crmDiagnosticsNetworkModeV11){
            return {skipped:true,reason:window.crmDiagnosticsNetworkModeV11?"diagnostyka":"boot"};
        }
        const range=crmCalendarVisibleRange();
        const from=getFormattedISOBlockDate(range.start);
        const to=getFormattedISOBlockDate(range.end);
        const separator=APPS_SCRIPT_URL.includes("?")?"&":"?";
        const url=`${APPS_SCRIPT_URL}${separator}checkBusy=true&rangeStart=${encodeURIComponent(from)}&rangeEnd=${encodeURIComponent(to)}&_crmSync=${Date.now()}`;
        const payload=await crmQueuedGetV11(url,{
            key:`calendar:${from}:${to}`,
            priority:80,
            timeoutMs:35000
        });
        if(!payload || !Array.isArray(payload.appointments)) throw new Error(payload?.error||"Backend nie zwrócił listy wizyt");
        appointmentsData=payload.appointments;
        if(payload.settings){
            settingsData={...settingsData,...payload.settings};
        }
        if(typeof renderBooksyCalendar==="function")renderBooksyCalendar();
        if(typeof renderMiniMonthCalendar==="function")renderMiniMonthCalendar();
        if(typeof crmRenderCalendarInsights==="function")crmRenderCalendarInsights();
        return payload;
    };
}
/* KONIEC CALENDAR NETWORK V11 */
