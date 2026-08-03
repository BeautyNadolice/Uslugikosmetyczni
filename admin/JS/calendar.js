/* ==========================================================================
   CAL. KALENDARZ
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CAL.1. globalColors (oryginalna linia 27) ----- */
let globalColors = {};

/* ----- CAL.2. selectedCalendarDate (oryginalna linia 32) ----- */
let selectedCalendarDate = new Date();

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

    calendarViewMode = mode;

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

    miniMonthDate.setMonth(
        miniMonthDate.getMonth()
        +
        months
    );

    renderMiniMonthCalendar();

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

/* ----- CAL.18. renderWeekCalendar (oryginalna linia 877) ----- */
function renderWeekCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "week";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
    grid.style.gap = "6px";
    grid.style.alignItems = "stretch";
    grid.style.width = "100%";
    grid.style.minWidth = "0";
    grid.style.overflowX = "hidden";

    const monday = getMondayOfWeek(selectedCalendarDate);
    const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

    for (let index = 0; index < 7; index++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const column = document.createElement("section");
        column.className = "calendar-week-day";
        column.dataset.date = getFormattedISOBlockDate(date);
        column.style.cssText = "min-width:0;min-height:260px;padding:7px;border:1px solid #e3d8cf;border-radius:9px;background:#fff;box-sizing:border-box;overflow:hidden;";

        if (date.toDateString() === new Date().toDateString()) {
            column.style.borderColor = "#b05c75";
            column.style.boxShadow = "0 0 0 2px rgba(176,92,117,.12)";
        }

        const header = document.createElement("button");
        header.type = "button";
        header.style.cssText = "width:100%;padding:5px;border:0;background:transparent;font-weight:700;cursor:pointer;color:#3d3330;";
        header.innerText = dayNames[index] + " " + date.getDate() + "." + (date.getMonth() + 1);
        header.onclick = () => {
            selectedCalendarDate = new Date(date);
            setCalendarView("day");
        };
        column.appendChild(header);

        const events = getCalendarEventsForDate(date);
        if (events.length === 0) {
            const empty = document.createElement("div");
            empty.style.cssText = "padding:20px 4px;text-align:center;color:#aaa;font-size:12px;";
            empty.innerText = "Brak wpisów";
            column.appendChild(empty);
        } else {
            events.forEach(item => renderCompactCalendarEvent(item, column, "week"));
        }
        grid.appendChild(column);
    }
}

/* ----- CAL.19. renderMonthCalendar (oryginalna linia 927) ----- */
function renderMonthCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "month";

    // Widok miesiąca zawsze zaczyna się od poniedziałku.
    // Poprzednia wersja zachowywała poziome przewinięcie kontenera,
    // dlatego po przejściu do miesiąca były widoczne tylko Pt–Ndz.
    grid.scrollLeft = 0;
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
    grid.style.width = "100%";
    grid.style.minWidth = "0";
    grid.style.maxWidth = "100%";
    grid.style.gap = "6px";
    grid.style.overflowX = "hidden";

    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();
    const weekdayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

    weekdayNames.forEach(name => {
        const header = document.createElement("div");
        header.style.cssText = "padding:8px;text-align:center;font-weight:700;color:#5c504a;";
        header.innerText = name;
        grid.appendChild(header);
    });

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const dayNumber = cellIndex - leading + 1;
        const date = new Date(year, month, dayNumber);
        const inCurrentMonth = date.getMonth() === month;
        const cell = document.createElement("section");
        cell.className = "calendar-month-day";
        cell.dataset.date = getFormattedISOBlockDate(date);
        cell.style.cssText = "min-height:120px;padding:7px;border:1px solid #e3d8cf;border-radius:8px;background:" +
            (inCurrentMonth ? "#fff" : "#f7f3f0") + ";opacity:" + (inCurrentMonth ? "1" : ".58") + ";box-sizing:border-box;";

        if (date.toDateString() === new Date().toDateString()) {
            cell.style.borderColor = "#b05c75";
            cell.style.boxShadow = "0 0 0 2px rgba(176,92,117,.12)";
        }
        if (date.toDateString() === selectedCalendarDate.toDateString()) {
            cell.style.background = "#fff4f7";
        }

        const dayButton = document.createElement("button");
        dayButton.type = "button";
        dayButton.style.cssText = "min-width:30px;padding:3px 6px;border:0;border-radius:15px;background:transparent;font-weight:700;cursor:pointer;";
        dayButton.innerText = date.getDate();
        dayButton.onclick = () => {
            selectedCalendarDate = new Date(date);
            miniMonthDate = new Date(date);
            setCalendarView("day");
            renderMiniMonthCalendar();
        };
        cell.appendChild(dayButton);

        getCalendarEventsForDate(date).forEach(item => renderCompactCalendarEvent(item, cell, "month"));
        grid.appendChild(cell);
    }
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

/* ----- CAL.34. renderWeekCalendar (oryginalna linia 4700) ----- */
function renderWeekCalendar(grid) {
    grid.innerHTML = "";
    grid.dataset.calendarView = "week";
    grid.className = "crm-week-grid";
    grid.style.cssText = "";

    const monday = getMondayOfWeek(selectedCalendarDate);
    const names = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
    const columns = [];

    for (let index = 0; index < 7; index++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const events = getCalendarEventsForDate(date).filter(item => item.eventType !== "work_shift");

        const column = document.createElement("section");
        column.className = "calendar-week-day crm-week-column";
        if (date.toDateString() === new Date().toDateString()) column.classList.add("is-today");

        const header = document.createElement("button");
        header.type = "button";
        header.className = "crm-week-day-header";
        header.innerHTML = `<strong>${names[index]} ${date.getDate()}.${date.getMonth() + 1}</strong><span>${events.length} ${events.length === 1 ? "wizyta" : "wizyt"}</span>`;
        header.addEventListener("click", () => crmV13OpenDayList(date));

        const list = document.createElement("div");
        list.className = "crm-week-events";
        column.append(header, list);
        grid.appendChild(column);
        columns.push({ column, date, events });
    }

    requestAnimationFrame(() => columns.forEach(data => crmV13RenderWeekColumn(data.column, data.date, data.events)));
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
changeSelectedDate=function(days){
    if(calendarViewMode==="day"){
        selectedCalendarDate.setDate(selectedCalendarDate.getDate()+days*CRM_THREE_DAY_COUNT);
        miniMonthDate=new Date(selectedCalendarDate);renderMiniMonthCalendar();renderBooksyCalendar();return;
    }
    crmChangeSelectedDateV8(days);
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
        dateButton.innerHTML = `<strong>${dayNames[index]} ${date.getDate()}.${date.getMonth()+1}</strong><span>${events.length} ${events.length === 1 ? "wizyta" : "wizyt"}</span>`;
        dateButton.addEventListener("click", () => crmOpenDayVisitsList(date));
        header.appendChild(dateButton);
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

    count.textContent = events.length
        ? `${events.length} ${events.length === 1 ? "wizyta" : events.length < 5 ? "wizyty" : "wizyt"}`
        : "";
    count.hidden = !events.length;

    shift.innerHTML = "";
    workShifts.forEach(item => {
        const badge = document.createElement("span");
        badge.textContent = String(item?.name || "Brak");
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

    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();
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

        top.append(dayButton, count);

        const shift = document.createElement("div");
        shift.className = "crm-month-shift";
        shift.hidden = true;

        const body = document.createElement("div");
        body.className = "crm-month-events";

        cell.append(top, shift, body);
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

    const styles = getComputedStyle(list);
    const gap = parseFloat(styles.rowGap || styles.gap) || 6;
    const available = Math.max(0, list.clientHeight);
    const cardHeight = 64;
    const moreHeight = 28;
    const allCardsHeight = events.length > 0 ? events.length * cardHeight + Math.max(0, events.length - 1) * gap : 0;

    let visibleCount = events.length;
    if (allCardsHeight > available) {
        visibleCount = Math.max(0, Math.floor((available - moreHeight) / (cardHeight + gap)));
        while (visibleCount > 0) {
            const used = visibleCount * cardHeight + Math.max(0, visibleCount - 1) * gap + gap + moreHeight;
            if (used <= available) break;
            visibleCount -= 1;
        }
    }

    events.slice(0, visibleCount).forEach(item => list.appendChild(crmCreateWeekVisitCard(item)));
    const hidden = Math.max(0, events.length - visibleCount);
    if (hidden > 0) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = "crm-week-more";
        const ending = hidden === 1 ? "pozostała" : (hidden >= 2 && hidden <= 4 ? "pozostałe" : "pozostałych");
        more.textContent = `+${hidden} ${ending}`;
        more.addEventListener("click", () => crmOpenDayVisitsList(date));
        list.appendChild(more);
    }
};
