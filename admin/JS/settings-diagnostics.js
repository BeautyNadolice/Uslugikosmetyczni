/* ==========================================================================
   DIA. USTAWIENIA I DIAGNOSTYKA
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- DIA.1. settingsData (oryginalna linia 26) ----- */
let settingsData = {};

/* ----- DIA.2. loginTest (oryginalna linia 100) ----- */
function loginTest() {

    localStorage.setItem(
        "admin_email",
        "test_admin@test.com"
    );

    showAdminPanel();

}

/* ----- DIA.3. loadSettings (oryginalna linia 226) ----- */
async function loadSettings() {

    try {

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?checkBusy=true"
            );

        const data =
            await response.json();

        settingsData =
            data.settings || {};

        appointmentsData =
            data.appointments || [];

        globalColors = {};

        if (settingsData.colors) {

            Object.keys(
                settingsData.colors
            ).forEach(key => {

                globalColors[key] =
                    settingsData.colors[key];

            });

        }

        allCategories =
            settingsData.all_categories || [];

       populateSettingsForm();
renderMiniMonthCalendar();
renderBooksyCalendar();
    }

    catch(err) {

        console.error(
            "Settings error",
            err
        );

    }

}

/* ----- DIA.4. populateSettingsForm (oryginalna linia 3044) ----- */
function populateSettingsForm() {
    setInputValue(
        "work_start_hour",
        settingsData.work_start_hour || "09:00"
    );

    setInputValue(
        "work_end_hour",
        settingsData.work_end_hour || "18:00"
    );

    setInputValue(
        "buffer_hours",
        settingsData.buffer_hours !== undefined
            ? settingsData.buffer_hours
            : 1
    );

    setInputValue(
        "slot_interval_minutes",
        settingsData.slot_interval_minutes !== undefined
            ? settingsData.slot_interval_minutes
            : 45
    );

    setInputValue(
        "start_offset_minutes",
        settingsData.start_offset_minutes !== undefined
            ? settingsData.start_offset_minutes
            : 0
    );

    setInputValue(
        "cleanup_buffer_minutes",
        settingsData.cleanup_buffer_minutes !== undefined
            ? settingsData.cleanup_buffer_minutes
            : 0
    );

    setInputValue(
        "schedule_cycle",
        settingsData.schedule_cycle || "4x4"
    );
}

/* ----- DIA.5. saveSettings (oryginalna linia 3092) ----- */
/* ==========================================================
   SAVE SETTINGS
   ========================================================== */

async function saveSettings(){

    const categoryColors =
        {};

    document
        .querySelectorAll(
            "#categories-colors-list input[type='color']"
        )
        .forEach(input=>{

            categoryColors[
                input.dataset.category
            ] =
            input.value;

        });

    try{

        await fetch(
            APPS_SCRIPT_URL,
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "text/plain"
                },

                body:
                JSON.stringify({

                    action:
                    "updateSettings",

                   payload: {
    work_start_hour:
        document.getElementById(
            "work_start_hour"
        ).value,

    work_end_hour:
        document.getElementById(
            "work_end_hour"
        ).value,

    buffer_hours:
        document.getElementById("buffer_hours")
            ? Math.max(0, Number(document.getElementById("buffer_hours").value) || 0)
            : 1,

    slot_interval_minutes:
        Math.max(5, Number(document.getElementById("slot_interval_minutes").value) || 45),

    start_offset_minutes:
        Math.max(0, Number(document.getElementById("start_offset_minutes").value) || 0),

    cleanup_buffer_minutes:
        Math.max(0, Number(document.getElementById("cleanup_buffer_minutes").value) || 0),

    schedule_cycle:
        (document.getElementById("schedule_cycle")
            ? document.getElementById("schedule_cycle").value.trim()
            : (settingsData.schedule_cycle || "4x4")) || "4x4",

    colors:
        categoryColors

                    }

                })

            }
        );

        alert(
            "Ustawienia zapisane"
        );

        await loadSettings();

    }

    catch(error){

        console.error(
            error
        );

        alert(
            "Błąd zapisu"
        );

    }

}

/* ----- DIA.6. saveFamilyScheduleEntry (oryginalna linia 3761) ----- */
async function saveFamilyScheduleEntry(entry) {
    const response = await crmExtendedPost("saveFamilySchedule", { entry: entry || {} });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zapisać grafiku rodzinnego");
    }
    return response;
}

/* ----- DIA.7. loadFamilySchedule (oryginalna linia 3769) ----- */
async function loadFamilySchedule(fromDate, toDate) {
    const response = await crmExtendedPost("getFamilySchedule", {
        fromDate: fromDate || "",
        toDate: toDate || ""
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się pobrać grafiku rodzinnego");
    }
    return response.entries || [];
}

/* ----- DIA.8. saveScheduleCorrectionFromPanel (oryginalna linia 3818) ----- */
async function saveScheduleCorrectionFromPanel() {
    const entry = {
        date: document.getElementById("sch-date").value,
        dayType: document.getElementById("sch-type").value,
        husbandShift: document.getElementById("sch-shift").value,
        availableFrom: document.getElementById("sch-from").value,
        availableTo: document.getElementById("sch-to").value,
        fullDayBlocked: false,
        reason: document.getElementById("sch-reason").value,
        source: "RECZNA_KOREKTA"
    };
    const response = await crmExtendedPost("saveScheduleCorrection", { entry });
    if (!response.success) throw new Error(response.error || "Błąd korekty");
    alert("Ręczna korekta została zapisana. Nie zostanie nadpisana przez oficjalny grafik.");
    await refreshSchedulePanel();
    await renderWorkScheduleCalendar();
}

/* ----- DIA.9. generateSchedule4x4FromPanel (oryginalna linia 3836) ----- */
async function generateSchedule4x4FromPanel() {
    const response = await crmExtendedPost("generateSchedule4x4", {
        year: Number(document.getElementById("sch-year").value),
        startDate: document.getElementById("sch-start").value
    });
    if (!response.success) throw new Error(response.error || "Błąd generowania");
    alert("Prognoza 4×4 utworzona: 1, 1, 2, 2, W, W, W, W.");
    await refreshSchedulePanel();
    await renderWorkScheduleCalendar();
}

/* ----- DIA.10. refreshSchedulePanel (oryginalna linia 3847) ----- */
async function refreshSchedulePanel() {
    const output = document.getElementById("sch-output");
    const month = document.getElementById("sch-month");
    if (!output || !month) return;
    const response = await crmExtendedPost("getEffectiveSchedule", { month: month.value });
    if (!response.success) throw new Error(response.error || "Błąd odczytu grafiku");
    output.innerHTML = response.entries.map(item =>
        `<div style="padding:6px;border-bottom:1px solid #ddd"><strong>${item.date}</strong> | ${item.code || item.dayType} | źródło: ${item.source} | ${item.reason || ""}</div>`
    ).join("") || "Brak wpisów";
}

/* ----- DIA.11. checkScheduleDriveFolderNow (oryginalna linia 3858) ----- */
async function checkScheduleDriveFolderNow() {
    const button = document.getElementById("sch-check-folder-btn");
    const status = document.getElementById("sch-folder-status");
    if (button) button.disabled = true;
    if (status) status.textContent = "Sprawdzanie folderu...";
    try {
        const response = await crmExtendedPost("checkScheduleDriveFolder", { manual: true });
        if (!response.success) throw new Error(response.error || "Błąd sprawdzania folderu");
        if (status) status.textContent = `Ostatnie sprawdzenie: ${response.checkedAt}. Nowe: ${response.newFiles}, zmienione: ${response.changedFiles}, bez zmian: ${response.unchangedFiles}.`;
        await refreshSchedulePanel();
        await renderWorkScheduleCalendar();
    } finally {
        if (button) button.disabled = false;
    }
}

/* ----- DIA.12. installScheduleFolderTriggers (oryginalna linia 3874) ----- */
async function installScheduleFolderTriggers() {
    const response = await crmExtendedPost("installScheduleFolderTriggers");
    if (!response.success) throw new Error(response.error || "Błąd instalacji harmonogramu");
    alert("Kontrola folderu została ustawiona: poniedziałek, czwartek i ostatni dzień miesiąca.");
}

/* ----- DIA.13. synchronizeWorkScheduleWithGoogleCalendar (oryginalna linia 3880) ----- */
async function synchronizeWorkScheduleWithGoogleCalendar() {
    const month = document.getElementById("sch-month").value;
    const response = await crmExtendedPost("syncWorkScheduleToGoogleCalendar", { month });
    if (!response.success) throw new Error(response.error || "Błąd synchronizacji Google Calendar");
    alert(`Zaktualizowano oznaczenia Google Calendar: ${response.created} utworzono, ${response.removed} usunięto.`);
}

/* ----- DIA.14. scheduleCodeColor (oryginalna linia 3887) ----- */
function scheduleCodeColor(code) {
    const value = String(code || "W").toUpperCase();
    if (value === "1") return { bg: "#fff200", fg: "#111" };
    if (value === "2") return { bg: "#8bc34a", fg: "#111" };
    if (["UW", "OP", "BHP"].includes(value)) return { bg: "#82b1d8", fg: "#111" };
    if (["SW", "ŚW"].includes(value)) return { bg: "#ef5350", fg: "#fff" };
    return { bg: "#fff", fg: "#111" };
}

/* ----- DIA.15. renderWorkScheduleCalendar (oryginalna linia 3896) ----- */
async function renderWorkScheduleCalendar() {
    const host = document.getElementById("work-schedule-calendar");
    if (!host) return;
    const year = selectedCalendarDate.getFullYear();
    const monthIndex = selectedCalendarDate.getMonth();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const response = await crmExtendedPost("getEffectiveSchedule", { month: monthKey });
    if (!response.success) {
        host.textContent = response.error || "Nie udało się pobrać grafiku.";
        return;
    }
    const byDate = {};
    response.entries.forEach(item => { byDate[item.date] = item; });
    const names = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];
    const monthName = new Date(year, monthIndex, 1).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    let html = `<h3 style="margin:0 0 12px">${monthName}</h3><div class="work-schedule-grid" style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:5px">`;
    names.forEach(name => { html += `<div style="font-weight:700;text-align:center;padding:5px">${name}</div>`; });
    const first = new Date(year, monthIndex, 1);
    const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
    for (let i = 0; i < leading; i++) html += "<div></div>";
    const days = new Date(year, monthIndex + 1, 0).getDate();
    for (let day = 1; day <= days; day++) {
        const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const entry = byDate[dateKey] || {};
        const code = entry.code || "";
        const color = scheduleCodeColor(code);
        const title = entry.source ? `Kod: ${code}; źródło: ${entry.source}; ${entry.reason || ""}` : "Brak danych";
        html += `<button type="button" title="${title.replace(/"/g, "&quot;")}" style="min-height:58px;border:1px solid #d8cec6;border-radius:7px;background:${color.bg};color:${color.fg};cursor:pointer"><span style="display:block;font-size:12px">${day}</span><strong style="font-size:17px">${code}</strong></button>`;
    }
    host.innerHTML = html + "</div><p style=\"font-size:12px;color:#666\">1 = zmiana dzienna, 2 = zmiana nocna. Grafik ma charakter informacyjny i sam nie blokuje wizyt.</p>";
}

/* ----- DIA.16. ensureScheduleCalendarUnderMainCalendar (oryginalna linia 3928) ----- */
function ensureScheduleCalendarUnderMainCalendar() {
    if (document.getElementById("work-schedule-calendar")) return;
    const grid = document.getElementById("booksy-grid");
    if (!grid || !grid.parentNode) return;
    const host = document.createElement("section");
    host.id = "work-schedule-calendar";
    host.style.cssText = "margin-top:22px;padding:18px;border:1px solid #e3d8cf;border-radius:12px;background:#fff";
    grid.parentNode.insertBefore(host, grid.nextSibling);
}

/* ----- DIA.17. ensureSchedulePanel (oryginalna linia 3938) ----- */
function ensureSchedulePanel() {
    const tab = document.getElementById("tab-ustawienia");
    if (!tab || document.getElementById("schedule-full-panel")) return;
    const now = new Date();
    const panel = document.createElement("section");
    panel.id = "schedule-full-panel";
    panel.style.cssText = "margin-top:30px;padding:18px;border:2px solid #c2a383;border-radius:12px;background:#fffaf6";
    panel.innerHTML = `<h2 style="margin-top:0">Grafik pracy</h2>
      <details><summary style="cursor:pointer;font-weight:700">Prognoza 4×4</summary><p>Schemat stały: 1, 1, 2, 2, W, W, W, W. Wskaż pierwszy dzień zmiany dziennej.</p><input id="sch-year" type="number" value="${now.getFullYear()}"><input id="sch-start" type="date"><button type="button" class="btn-primary" onclick="generateSchedule4x4FromPanel()">Generuj prognozę</button></details>
      <details><summary style="cursor:pointer;font-weight:700">Ręczna korekta dnia</summary><input id="sch-date" type="date"><select id="sch-type"><option value="WOLNE">Dzień wolny</option><option value="PRACA">Dzień pracy</option><option value="UW">Urlop wypoczynkowy</option><option value="OP">Opieka nad dzieckiem</option><option value="BHP">BHP</option><option value="SW">Dzień świąteczny</option></select><select id="sch-shift"><option value="WOLNE">Wolne</option><option value="1">1</option><option value="2">2</option><option value="BHP">BHP</option></select><input id="sch-from" type="time" step="300"><input id="sch-to" type="time" step="300"><input id="sch-reason" placeholder="Powód korekty"><button type="button" class="btn-primary" onclick="saveScheduleCorrectionFromPanel()">Zapisz korektę</button></details>
      <details open><summary style="cursor:pointer;font-weight:700">Oficjalny grafik z Google Drive</summary><p>Folder: Grafik. Nazwa pliku: RRRR-MM. Pracownik: Oleksandr Strelnkov.</p><button id="sch-check-folder-btn" type="button" class="btn-primary" onclick="checkScheduleDriveFolderNow()">Sprawdź folder teraz</button><button type="button" class="btn-secondary" onclick="installScheduleFolderTriggers()">Ustaw kontrolę automatyczną</button><button type="button" class="btn-secondary" onclick="synchronizeWorkScheduleWithGoogleCalendar()">Synchronizuj z Google Calendar</button><p id="sch-folder-status">Automatycznie: poniedziałek, czwartek i ostatni dzień miesiąca. OCR tylko dla nowego lub zmienionego pliku.</p></details>
      <details><summary style="cursor:pointer;font-weight:700">Podgląd danych i historii</summary><input id="sch-month" type="month" value="${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}" onchange="refreshSchedulePanel()"><button type="button" class="btn-secondary" onclick="refreshSchedulePanel()">Odśwież</button><div id="sch-output"></div></details>`;
    tab.insertBefore(panel, document.getElementById("crm-diagnostics-panel") || null);
}

/* ----- DIA.18. runPoint35Diagnostics (oryginalna linia 3974) ----- */
async function runPoint35Diagnostics() {
    const response=await crmExtendedPost("runPoint35Diagnostics");
    if(!response.success)throw new Error(response.error||"Diagnostyka 3.5 zakończona błędem");
    return response;
}

/* ----- DIA.19. createFinalAdminBackup (oryginalna linia 3979) ----- */
async function createFinalAdminBackup() {
    const response=await crmExtendedPost("createFinalAdminBackup",{description:"Finalny backup po etapach 3.4 i 3.5"});
    if(!response.success)throw new Error(response.error||"Nie udało się utworzyć backupu");
    alert("Backup ADMIN zapisany: "+response.version);
    return response;
}

/* ----- DIA.20. convertExternalToCRMAppointment (oryginalna linia 4060) ----- */
function convertExternalToCRMAppointment() {
    const app = currentEditingAppointment;
    if (!app || app.eventType !== "external") return;
    closeAppointmentModal();
    openCreateAppointmentModal();
    setTimeout(() => {
        const name = document.getElementById("appointmentName");
        const date = document.getElementById("appointmentDateTime");
        const duration = document.getElementById("appointmentDuration");
        if (name) name.value = app.name || "";
        if (date) date.value = String(app.date || "").slice(0,16);
        if (duration) duration.value = app.duration || 60;
        crmSyncFiveMinuteControlsFromHidden();
        crmToast("Uzupełnij klienta, telefon i usługę, a następnie zapisz wizytę.");
    }, 0);
}

/* ----- DIA.21. crmOldGenerateSchedule4x4 (oryginalna linia 4151) ----- */
const crmOldGenerateSchedule4x4 = generateSchedule4x4FromPanel;

/* ----- DIA.22. generateSchedule4x4FromPanel (oryginalna linia 4152) ----- */
generateSchedule4x4FromPanel = async function() {
    if (crmUiOperationLock) return;
    const button = document.querySelector('#schedule-full-panel button[onclick="generateSchedule4x4FromPanel()"]') || document.activeElement;
    crmUiOperationLock=true;
    if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent="Generowanie...";}
    try {
        const year=Number(document.getElementById("sch-year").value),startDate=document.getElementById("sch-start").value;
        if(!startDate) throw new Error("Wskaż pierwszy dzień zmiany 1.");
        const response=await crmExtendedPost("generateSchedule4x4",{year,startDate});
        if(!response.success)throw new Error(response.error||"Błąd generowania");
        selectedCalendarDate=new Date(year,Number(document.getElementById("sch-month").value.slice(5,7))-1,1);
        await refreshSchedulePanel(); await renderWorkScheduleCalendar();
        const verify=await crmExtendedPost("getEffectiveSchedule",{month:document.getElementById("sch-month").value});
        if(!verify.success||!verify.entries||!verify.entries.length)throw new Error("Prognoza została zapisana, ale nie udało się odświeżyć kalendarza.");
        crmToast(`Prognoza wygenerowana. Zapisano ${response.days || 365} dni.`);
    } catch(error){crmToast(error.message||String(error),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent=button.dataset.oldText||"Generuj prognozę";}}
};

/* ----- DIA.23. checkScheduleDriveFolderNow (oryginalna linia 4170) ----- */
checkScheduleDriveFolderNow = async function() {
    if(crmUiOperationLock)return; const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");
    crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");
      const names=(r.candidates||[]).map(x=>x.name).join(", ");
      const rejected=(r.rejected||[]).map(x=>x.name||"bez nazwy").join(", ");
      status.textContent=`Folder ${r.folderName||"Grafik"} (${r.folderId||""}). Pliki: ${r.totalFiles||0}, pasujące: ${r.matchingFiles||0}, nowe: ${r.newFiles||0}, zmienione: ${r.changedFiles||0}, bez zmian: ${r.unchangedFiles||0}.${names?" Rozpoznane: "+names+".":""}${rejected?" Pominięte: "+rejected+".":""}`;
      crmToast(r.matchingFiles?`Znaleziono ${r.matchingFiles} pasujący plik.`:"Folder dostępny, ale brak pasujących plików.",r.matchingFiles?"success":"error");
    }catch(e){crmToast(e.message||String(e),"error");}finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
};

/* ----- DIA.24. crmLastScheduleImport (oryginalna linia 4188) ----- */
/* KONIEC PAKIETU POPRAWEK PO ZYWYM TESCIE */


/* ==========================================================
   IMPORT OFICJALNEGO GRAFIKU Z OCR I WERYFIKACJA
   ========================================================== */
let crmLastScheduleImport = null;

/* ----- DIA.25. crmScheduleCodeOptions (oryginalna linia 4189) ----- */
function crmScheduleCodeOptions(selected){
    return ["?","1","2","W","WH","WN","UW","OP","SW","BHP"].map(code=>`<option value="${code}" ${code===selected?"selected":""}>${code}</option>`).join("");
}

/* ----- DIA.26. crmRenderScheduleImportReview (oryginalna linia 4192) ----- */
function crmRenderScheduleImportReview(data){
    const panel=document.getElementById("sch-import-review")||document.createElement("div");
    if(!panel.id){panel.id="sch-import-review";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-folder-status").after(panel);}
    if(data.alreadyApplied){panel.innerHTML=`<strong>${data.message}</strong>`;return;}
    crmLastScheduleImport=data;
    panel.innerHTML=`<h3 style="margin:0 0 8px">Sprawdź grafik: ${data.month}</h3><p>Pracownik: ${data.employeeFound?"znaleziony elastycznie":"nie znaleziony"}. Rozpoznano automatycznie ${data.recognized||0} z ${data.days||0} dni. Popraw znaki „?” przed zatwierdzeniem.</p><div style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:6px">${(data.codes||[]).map((code,i)=>`<label style="display:flex;flex-direction:column;gap:3px;font-size:12px">Dzień ${i+1}<select data-official-day="${i+1}">${crmScheduleCodeOptions(code)}</select></label>`).join("")}</div><div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="btn-primary" onclick="crmApplyOfficialSchedule()">Zatwierdź oficjalny grafik</button><button type="button" class="btn-secondary" onclick="crmProcessOfficialScheduleFile('${data.fileId||""}',true)">Przetwórz ponownie OCR</button></div><details style="margin-top:10px"><summary>Tekst rozpoznanego wiersza</summary><pre style="white-space:pre-wrap">${String(data.ocrLine||"").replace(/</g,"&lt;")}</pre></details>`;
}

/* ----- DIA.27. crmProcessOfficialScheduleFile (oryginalna linia 4199) ----- */
async function crmProcessOfficialScheduleFile(fileId,force){
    if(!fileId)return crmToast("Brak identyfikatora pliku do przetworzenia.","error");
    crmToast("Odczytywanie oficjalnego grafiku...");
    try{const r=await crmExtendedPost("processOfficialScheduleFile",{fileId:fileId,force:Boolean(force)});if(!r.success)throw new Error(r.error||"Błąd OCR");r.fileId=fileId;crmRenderScheduleImportReview(r);crmToast(r.alreadyApplied?"Plik był już zatwierdzony.":"OCR zakończony. Sprawdź rozpoznane dni.");}catch(e){crmToast(e.message||String(e),"error");}
}

/* ----- DIA.28. crmApplyOfficialSchedule (oryginalna linia 4204) ----- */
async function crmApplyOfficialSchedule(){
    if(!crmLastScheduleImport)return;
    const codes=Array.from(document.querySelectorAll("[data-official-day]")).map(x=>x.value);
    const unknown=codes.map((x,i)=>x==="?"?i+1:null).filter(Boolean);if(unknown.length)return crmToast("Popraw nierozpoznane dni: "+unknown.join(", "),"error");
    const btn=document.activeElement;if(btn){btn.disabled=true;btn.textContent="Zapisywanie...";}
    try{const r=await crmExtendedPost("applyOfficialSchedule",{importId:crmLastScheduleImport.importId,month:crmLastScheduleImport.month,codes:codes});if(!r.success)throw new Error(r.error||"Błąd zapisu");await refreshSchedulePanel();await renderWorkScheduleCalendar();crmToast("Oficjalny grafik został zastosowany.");}catch(e){crmToast(e.message||String(e),"error");}finally{if(btn){btn.disabled=false;btn.textContent="Zatwierdź oficjalny grafik";}}
}

/* ----- DIA.29. checkScheduleDriveFolderNow (oryginalna linia 4212) ----- */
checkScheduleDriveFolderNow=async function(){
    if(crmUiOperationLock)return;const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");const names=(r.candidates||[]).map(x=>x.name).join(", ");status.textContent=`Folder ${r.folderName||"Grafik"} (${r.folderId||""}). Pliki: ${r.totalFiles||0}, pasujące: ${r.matchingFiles||0}.${names?" Rozpoznane: "+names+".":""}`;if(r.candidates&&r.candidates.length){crmToast(`Znaleziono ${r.candidates.length} plik. Rozpoczynam OCR.`);await crmProcessOfficialScheduleFile(r.candidates[0].id,false);}else crmToast("Folder dostępny, ale brak pasujących plików.","error");}catch(e){crmToast(e.message||String(e),"error");}finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
};

/* ----- DIA.30. crmScheduleImageSource (oryginalna linia 4222) ----- */
/* KONIEC IMPORTU OFICJALNEGO GRAFIKU */


/* ==========================================================
   KADROWANIE WIERSZA GRAFIKU PRZED OCR
   ========================================================== */
let crmScheduleImageSource=null;

/* ----- DIA.31. crmDrawScheduleCrop (oryginalna linia 4224) ----- */
function crmDrawScheduleCrop(){
    if(!crmScheduleImageSource)return;const canvas=document.getElementById("sch-crop-canvas"),top=Number(document.getElementById("sch-crop-top").value),height=Number(document.getElementById("sch-crop-height").value),ctx=canvas.getContext("2d"),img=crmScheduleImageSource;
    const sy=Math.max(0,Math.round(img.naturalHeight*top/100)),sh=Math.max(12,Math.min(img.naturalHeight-sy,Math.round(img.naturalHeight*height/100)));
    canvas.width=img.naturalWidth;canvas.height=sh;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,sy,img.naturalWidth,sh,0,0,img.naturalWidth,sh);
    document.getElementById("sch-crop-info").textContent=`Kadrowanie: od ${top}% wysokości, wysokość ${height}% (${sy}-${sy+sh}px).`;
}

/* ----- DIA.32. crmRenderScheduleCropPanel (oryginalna linia 4230) ----- */
function crmRenderScheduleCropPanel(file){
    let panel=document.getElementById("sch-crop-panel");if(!panel){panel=document.createElement("div");panel.id="sch-crop-panel";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-folder-status").after(panel);}
    panel.innerHTML=`<h3 style="margin:0 0 8px">Kadrowanie wiersza pracownika</h3><p>Ramka pokazuje fragment wysyłany do OCR. Jeśli wiersz pracownika nie jest widoczny, przesuń zakres.</p><label>Położenie od góry: <input id="sch-crop-top" type="range" min="0" max="94" value="60" step="1"></label><label style="margin-left:16px">Wysokość wycinka: <input id="sch-crop-height" type="range" min="5" max="25" value="12" step="1"></label><div id="sch-crop-info" style="margin:8px 0"></div><div style="overflow:auto;max-height:240px;border:1px solid #ddd"><canvas id="sch-crop-canvas" style="max-width:100%;display:block"></canvas></div><div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn-primary" onclick="crmRunCroppedScheduleOCR()">Odczytaj ten wiersz</button><button type="button" class="btn-secondary" onclick="crmAutoFindScheduleRow()">Ustaw typowe położenie</button></div>`;
    document.getElementById("sch-crop-top").oninput=crmDrawScheduleCrop;document.getElementById("sch-crop-height").oninput=crmDrawScheduleCrop;
    const img=new Image();img.onload=()=>{crmScheduleImageSource=img;crmDrawScheduleCrop();};img.src=`data:${file.mimeType};base64,${file.base64Data}`;
}

/* ----- DIA.33. crmAutoFindScheduleRow (oryginalna linia 4236) ----- */
function crmAutoFindScheduleRow(){document.getElementById("sch-crop-top").value="60";document.getElementById("sch-crop-height").value="12";crmDrawScheduleCrop();}

/* ----- DIA.34. crmPrepareScheduleCrop (oryginalna linia 4237) ----- */
async function crmPrepareScheduleCrop(fileId){
    try{crmToast("Pobieranie obrazu grafiku...");const r=await crmExtendedPost("getScheduleImageData",{fileId:fileId});if(!r.success)throw new Error(r.error||"Błąd pobierania obrazu");crmRenderScheduleCropPanel(r);crmToast("Sprawdź, czy wycinek zawiera cały wiersz pracownika.");}catch(e){crmToast(e.message||String(e),"error");}
}

/* ----- DIA.35. crmRunCroppedScheduleOCR (oryginalna linia 4240) ----- */
async function crmRunCroppedScheduleOCR(){
    const canvas=document.getElementById("sch-crop-canvas"),button=document.activeElement;if(!canvas||!canvas.width)return;
    if(button){button.disabled=true;button.textContent="Odczytywanie...";}
    try{const top=Number(document.getElementById("sch-crop-top").value),height=Number(document.getElementById("sch-crop-height").value),r=await crmExtendedPost("processCroppedScheduleImage",{fileName:"2026-07.jpg",mimeType:"image/jpeg",base64Data:crmCanvasToBase64(canvas),crop:{topPercent:top,heightPercent:height}});if(!r.success)throw new Error(r.error||"Błąd OCR wycinka");r.fileId=crmLastScheduleImport&&crmLastScheduleImport.fileId||"";crmRenderScheduleImportReview(r);crmToast(`OCR wycinka rozpoznał ${r.recognized||0} z ${r.days||0} dni.`);}catch(e){crmToast(e.message||String(e),"error");}finally{if(button){button.disabled=false;button.textContent="Odczytaj ten wiersz";}}
}

/* ----- DIA.36. crmOldRenderScheduleImportReview (oryginalna linia 4246) ----- */
// Po nieudanym pełnym OCR pokaż narzędzie kadrowania zamiast 31 pustych pól bez wyjaśnienia.
const crmOldRenderScheduleImportReview=crmRenderScheduleImportReview;

/* ----- DIA.37. crmRenderScheduleImportReview (oryginalna linia 4247) ----- */
crmRenderScheduleImportReview=function(data){crmOldRenderScheduleImportReview(data);if((data.recognized||0)===0&&data.fileId)crmPrepareScheduleCrop(data.fileId);};

/* ----- DIA.38. crmSegmentedScheduleCells (oryginalna linia 4254) ----- */
/* KONIEC KADROWANIA WIERSZA GRAFIKU */


/* ==========================================================
   SEGMENTACJA 31 KOMOREK GRAFIKU I ANALIZA KOLORU
   ========================================================== */
let crmSegmentedScheduleCells=[];

/* ----- DIA.39. crmSegmentCurrentScheduleRow (oryginalna linia 4282) ----- */
function crmSegmentCurrentScheduleRow(){
    const canvas=document.getElementById("sch-crop-canvas");if(!canvas||!canvas.width)return crmToast("Najpierw ustaw widoczny wiersz grafiku.","error");
    const ctx=canvas.getContext("2d"),nameEnd=crmFindNameColumnBoundary(ctx,canvas.width,canvas.height),gridWidth=canvas.width-nameEnd,cellWidth=gridWidth/31;
    crmSegmentedScheduleCells=[];
    for(let i=0;i<31;i++){
        const x=Math.round(nameEnd+i*cellWidth),next=Math.round(nameEnd+(i+1)*cellWidth),w=Math.max(2,next-x),color=crmAverageCellColor(ctx,x,0,w,canvas.height),guess=crmGuessCodeFromColor(color);
        crmSegmentedScheduleCells.push({day:i+1,x:x,width:w,color:color,guess:guess,thumbnail:crmCellThumbnail(canvas,x,0,w,canvas.height)});
    }
    crmRenderSegmentedScheduleReview(nameEnd);
}

/* ----- DIA.40. crmRenderSegmentedScheduleReview (oryginalna linia 4292) ----- */
function crmRenderSegmentedScheduleReview(nameEnd){
    let panel=document.getElementById("sch-cell-review");if(!panel){panel=document.createElement("div");panel.id="sch-cell-review";panel.style.cssText="margin-top:14px;padding:14px;border:1px solid #d7baa0;border-radius:10px;background:#fff";document.getElementById("sch-crop-panel").after(panel);}
    const high=crmSegmentedScheduleCells.filter(x=>x.guess.confidence==="wysoka").length,medium=crmSegmentedScheduleCells.filter(x=>x.guess.confidence==="średnia").length;
    panel.innerHTML=`<h3 style="margin:0 0 8px">Analiza 31 komórek</h3><p>Granica nazwiska: ${nameEnd}px. Pewne kolory: ${high}. Wymagające kontroli tekstu: ${medium}. Każda miniatura pochodzi bezpośrednio z oficjalnego pliku.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px">${crmSegmentedScheduleCells.map(cell=>`<label style="border:1px solid #ddd;border-radius:8px;padding:6px;display:flex;flex-direction:column;gap:4px"><strong>Dzień ${cell.day}</strong><img src="${cell.thumbnail}" alt="Komórka dnia ${cell.day}" style="width:100%;height:54px;object-fit:contain;image-rendering:auto;background:#fff"><select data-segment-day="${cell.day}">${crmScheduleCodeOptions(cell.guess.code)}</select><small>${cell.guess.kind}, RGB ${cell.color.r}/${cell.color.g}/${cell.color.b}, pewność ${cell.guess.confidence}</small></label>`).join("")}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn-primary" onclick="crmUseSegmentedCodes()">Przenieś kody do formularza</button><button type="button" class="btn-secondary" onclick="crmSegmentCurrentScheduleRow()">Analizuj ponownie</button></div><p style="margin-bottom:0"><strong>Uwaga:</strong> żółte i zielone komórki są rozpoznawane jako 1 i 2. Białe oraz niebieskie wymagają wzrokowej kontroli, ponieważ kolor nie odróżnia W od WH/WN ani UW od OP/BHP.</p>`;
}

/* ----- DIA.41. crmAutoFindScheduleRow (oryginalna linia 4304) ----- */
// Zmieniamy domyślne ustawienie kadrowania na wartość potwierdzoną w żywym teście.
crmAutoFindScheduleRow=function(){document.getElementById("sch-crop-top").value="62";document.getElementById("sch-crop-height").value="5";crmDrawScheduleCrop();};

/* ----- DIA.42. crmRenderScheduleCropPanel (oryginalna linia 4306) ----- */
crmRenderScheduleCropPanel=function(file){crmOldRenderCropPanel(file);setTimeout(()=>{crmAutoFindScheduleRow();const actions=document.querySelector("#sch-crop-panel div:last-child");if(actions&&!document.getElementById("sch-segment-btn")){const btn=document.createElement("button");btn.id="sch-segment-btn";btn.type="button";btn.className="btn-primary";btn.textContent="Podziel na 31 komórek";btn.onclick=crmSegmentCurrentScheduleRow;actions.appendChild(btn);}},100);};

/* ----- DIA.43. crmWorkCalendarCleanupToken (oryginalna linia 4312) ----- */
/* KONIEC SEGMENTACJI 31 KOMOREK */

/* ==========================================================
   POPRAWKA ADMIN: CZYSZCZENIE I NOWA SYNCHRONIZACJA GRAFIKU
   ========================================================== */
let crmWorkCalendarCleanupToken = "";

/* ----- DIA.44. crmWorkCalendarOperationBusy (oryginalna linia 4313) ----- */
let crmWorkCalendarOperationBusy = false;

/* ----- DIA.45. scanOldWorkScheduleEventsFromAdmin (oryginalna linia 4314) ----- */
async function scanOldWorkScheduleEventsFromAdmin() {
    if (crmWorkCalendarOperationBusy) return;
    crmWorkCalendarOperationBusy = true;
    const status=document.getElementById("sch-calendar-cleanup-status"),button=document.getElementById("sch-scan-calendar-btn");
    if(button){button.disabled=true;button.textContent="Wyszukiwanie...";}
    try{
        const r=await crmExtendedPost("scanOldWorkScheduleEvents");
        if(!r.success)throw new Error(r.error||"Błąd wyszukiwania");
        crmWorkCalendarCleanupToken=r.token||"";
        if(status)status.textContent=`Znaleziono ${r.count||0} starych wpisów grafiku w zakresie ${r.from} - ${r.to}.`;
        const del=document.getElementById("sch-delete-calendar-btn");if(del)del.disabled=!(r.count>0&&crmWorkCalendarCleanupToken);
        crmToast(`Znaleziono ${r.count||0} wpisów grafiku.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.disabled=false;button.textContent="Znajdź stare wpisy grafiku";}}
}

/* ----- DIA.46. deleteOldWorkScheduleEventsFromAdmin (oryginalna linia 4329) ----- */
async function deleteOldWorkScheduleEventsFromAdmin() {
    if(crmWorkCalendarOperationBusy||!crmWorkCalendarCleanupToken)return;
    const ok=await crmConfirm("Usunąć znalezione automatyczne wpisy Wyjazd/Powrót ze zmiany z okresu 01.01.2026-31.01.2027? Wizyty klientów, blokady i prywatne wydarzenia nie będą usuwane.","Usuń wpisy grafiku");
    if(!ok)return;
    crmWorkCalendarOperationBusy=true;const button=document.getElementById("sch-delete-calendar-btn"),status=document.getElementById("sch-calendar-cleanup-status");
    if(button){button.disabled=true;button.textContent="Usuwanie...";}
    try{
        const r=await crmExtendedPost("deleteOldWorkScheduleEvents",{token:crmWorkCalendarCleanupToken});
        if(!r.success)throw new Error(r.error||"Błąd usuwania");
        crmWorkCalendarCleanupToken="";if(status)status.textContent=`Usunięto ${r.removed||0} starych wpisów grafiku.`;
        await loadSettings();crmToast(`Usunięto ${r.removed||0} wpisów. Teraz wygeneruj nową prognozę i uruchom synchronizację.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.textContent="Usuń stare wpisy grafiku";button.disabled=true;}}
}

/* ----- DIA.47. crmInstallCalendarCleanupControls (oryginalna linia 4343) ----- */
function crmInstallCalendarCleanupControls(){
    const syncButton=document.querySelector('#schedule-full-panel button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if(!syncButton||document.getElementById("sch-calendar-cleanup-box"))return;
    const box=document.createElement("div");box.id="sch-calendar-cleanup-box";box.style.cssText="margin-top:12px;padding:12px;border:1px solid #d8b38c;border-radius:9px;background:#fff";
    box.innerHTML='<strong>Jednorazowe czyszczenie starego grafiku</strong><p id="sch-calendar-cleanup-status">Najpierw wyszukaj stare wpisy. Usuwane są tylko automatyczne wpisy grafiku.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="sch-scan-calendar-btn" type="button" class="btn-secondary" onclick="scanOldWorkScheduleEventsFromAdmin()">Znajdź stare wpisy grafiku</button><button id="sch-delete-calendar-btn" type="button" class="btn-danger" onclick="deleteOldWorkScheduleEventsFromAdmin()" disabled>Usuń stare wpisy grafiku</button></div>';
    syncButton.parentNode.insertBefore(box,syncButton.nextSibling);
}

/* ----- DIA.48. crmOldSynchronizeWorkScheduleWithGoogleCalendar (oryginalna linia 4350) ----- */
const crmOldSynchronizeWorkScheduleWithGoogleCalendar=synchronizeWorkScheduleWithGoogleCalendar;

/* ----- DIA.49. synchronizeWorkScheduleWithGoogleCalendar (oryginalna linia 4351) ----- */
synchronizeWorkScheduleWithGoogleCalendar=async function(){
    if(crmWorkCalendarOperationBusy)return;crmWorkCalendarOperationBusy=true;
    const button=document.querySelector('#schedule-full-panel button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if(button){button.disabled=true;button.dataset.oldText=button.textContent;button.textContent="Synchronizacja...";}
    try{
        const month=document.getElementById("sch-month").value,r=await crmExtendedPost("syncWorkScheduleToGoogleCalendar",{month});
        if(!r.success)throw new Error(r.error||"Błąd synchronizacji");
        await loadSettings();crmToast(`Synchronizacja zakończona. Utworzono ${r.created||0}, usunięto ${r.removed||0}, duplikaty ${r.duplicates||0}.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmWorkCalendarOperationBusy=false;if(button){button.disabled=false;button.textContent=button.dataset.oldText||"Synchronizuj z Google Calendar";}}
};

/* ----- DIA.50. crmScheduleXlsxCandidate (oryginalna linia 4368) ----- */
/* KONIEC POPRAWKI ADMIN KALENDARZA */

/* ==========================================================
   POPRAWKA ADMIN: GOTOWY PLIK Grafik_Oleksandr.xlsx
   ========================================================== */
let crmScheduleXlsxCandidate=null;

/* ----- DIA.51. checkScheduleDriveFolderNow (oryginalna linia 4369) ----- */
checkScheduleDriveFolderNow=async function(){
    if(crmUiOperationLock)return;const button=document.getElementById("sch-check-folder-btn"),status=document.getElementById("sch-folder-status");
    crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Sprawdzanie...";}
    try{
        const r=await crmExtendedPost("checkScheduleDriveFolder",{manual:true});if(!r.success)throw new Error(r.error||"Błąd folderu");
        crmScheduleXlsxCandidate=r.candidates&&r.candidates.length?r.candidates[0]:null;
        if(status)status.textContent=`Folder ${r.folderName||"Grafik"}. Pliki: ${r.totalFiles||0}, pasujące XLSX: ${r.matchingFiles||0}. Oczekiwany plik: ${r.expectedFile||"Grafik_Oleksandr.xlsx"}.`;
        let importBtn=document.getElementById("sch-import-xlsx-btn");
        if(!importBtn&&button){importBtn=document.createElement("button");importBtn.id="sch-import-xlsx-btn";importBtn.type="button";importBtn.className="btn-primary";importBtn.textContent="Importuj Grafik_Oleksandr.xlsx";importBtn.onclick=importScheduleXlsxFromPanel;button.after(importBtn);}
        if(importBtn)importBtn.disabled=!crmScheduleXlsxCandidate;
        crmToast(crmScheduleXlsxCandidate?"Znaleziono Grafik_Oleksandr.xlsx. Można rozpocząć import.":"Folder dostępny, ale nie znaleziono Grafik_Oleksandr.xlsx.",crmScheduleXlsxCandidate?"success":"error");
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Sprawdź folder teraz";}}
}

/* ----- DIA.52. importScheduleXlsxFromPanel (oryginalna linia 4383) ----- */
async function importScheduleXlsxFromPanel(){
    if(crmUiOperationLock||!crmScheduleXlsxCandidate)return;
    const button=document.getElementById("sch-import-xlsx-btn");crmUiOperationLock=true;if(button){button.disabled=true;button.textContent="Importowanie XLSX...";}
    try{
        const r=await crmExtendedPost("importScheduleXlsx",{fileId:crmScheduleXlsxCandidate.id});if(!r.success)throw new Error(r.error||"Błąd importu XLSX");
        await refreshSchedulePanel();await renderWorkScheduleCalendar();
        crmToast(`Zaimportowano ${r.rows} dni z ${r.fileName}. Zakres ${r.from} - ${r.to}.`);
    }catch(e){crmToast(e.message||String(e),"error");}
    finally{crmUiOperationLock=false;if(button){button.disabled=false;button.textContent="Importuj Grafik_Oleksandr.xlsx";}}
}

/* ----- DIA.53. crmUpdateSchedulePanelForXlsx (oryginalna linia 4393) ----- */
function crmUpdateSchedulePanelForXlsx(){
    const panel=document.getElementById("schedule-full-panel");if(!panel)return;
    panel.dataset.scheduleVersion="XLSX-V4-BEZ-OCR";
    let badge=document.getElementById("sch-xlsx-version-badge");
    if(!badge){badge=document.createElement("div");badge.id="sch-xlsx-version-badge";badge.style.cssText="display:inline-block;margin:0 0 12px;padding:5px 9px;border-radius:14px;background:#e8f5e9;color:#1b5e20;font-size:12px;font-weight:700";badge.textContent="Grafik aktualny";panel.querySelector("h2").after(badge);}else{badge.textContent="Grafik aktualny";}
    const details=Array.from(panel.querySelectorAll("details")).find(d=>d.querySelector("summary")&&d.querySelector("summary").textContent.includes("Oficjalny grafik"));
    if(!details)return;const p=details.querySelector("p");if(p)p.textContent="Folder: Grafik. Plik: Grafik_Oleksandr.xlsx. Źródło danych: arkusz Dane CRM, kolumny Data i Kod końcowy.";
    const triggerBtn=details.querySelector('button[onclick="installScheduleFolderTriggers()"]');if(triggerBtn)triggerBtn.style.display="none";
    const status=document.getElementById("sch-folder-status");if(status)status.textContent="Sprawdź folder, a następnie zaimportuj gotowy plik XLSX. OCR zdjęć nie jest używany.";
}

/* ----- DIA.54. crmArrangeSchedulePanel (oryginalna linia 4446) ----- */
function crmArrangeSchedulePanel() {
    const panel = document.getElementById("schedule-full-panel");
    if (!panel || panel.dataset.finalLayout === "1") return;
    panel.dataset.finalLayout = "1";

    const details = Array.from(panel.querySelectorAll(":scope > details"));
    const forecast = details.find(d => /Prognoza 4x4|Prognoza 4×4/i.test(d.querySelector("summary")?.textContent || ""));
    const manual = details.find(d => /Ręczna korekta dnia/i.test(d.querySelector("summary")?.textContent || ""));
    const official = details.find(d => /Oficjalny grafik|Aktualizacja pliku/i.test(d.querySelector("summary")?.textContent || ""));
    const preview = details.find(d => /Podgląd danych i historii/i.test(d.querySelector("summary")?.textContent || ""));

    // Prognoza 4x4 pozostaje mechanizmem technicznym w backendzie.
    // Edycja grafiku odbywa się wyłącznie w Grafik_Oleksandr.xlsx.
    forecast?.remove();
    manual?.remove();

    const actions = document.createElement("div");
    actions.id = "sch-main-actions";
    actions.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 14px";

    const updateButton = document.createElement("button");
    updateButton.id = "sch-smart-update-btn";
    updateButton.type = "button";
    updateButton.className = "btn-primary";
    updateButton.textContent = "Sprawdź aktualizację";
    updateButton.onclick = crmSmartScheduleUpdateNow;
    actions.appendChild(updateButton);

    const syncButton = official?.querySelector('button[onclick="synchronizeWorkScheduleWithGoogleCalendar()"]');
    if (syncButton) {
        syncButton.textContent = "Synchronizuj z Google Calendar";
        actions.appendChild(syncButton);
    }
    official?.remove();

    const cleanup = document.getElementById("sch-calendar-cleanup-box");
    let cleanupDetails = null;
    if (cleanup) cleanupDetails = crmCreateProcedure("Czyszczenie wpisów grafiku", cleanup);

    if (preview) {
        preview.open = false;
        const summary = preview.querySelector(":scope > summary");
        if (summary) summary.textContent = "Podgląd danych i historii";
    }

    const badge = document.getElementById("sch-xlsx-version-badge");
    badge?.remove();

    // Usuń wszystkie pozostawione opisy techniczne poza podglądem.
    Array.from(panel.children).forEach(child => {
        if (child.tagName === "P" && !child.closest("details")) child.remove();
    });

    panel.insertBefore(actions, panel.firstChild?.nextSibling || null);
    if (cleanupDetails) panel.insertBefore(cleanupDetails, preview || null);
    crmWrapSectionAsDetails(panel, "Grafik męża");
}


/* ----- DIA.56. crmCollapseWorkCalendar (oryginalna linia 4529) ----- */
function crmCollapseWorkCalendar() {
    const host = document.getElementById("work-schedule-calendar");
    const panel = document.getElementById("schedule-full-panel");
    if (!host || !panel) return;
    const mainBody = panel.querySelector(":scope > details.crm-main-collapsible > div");
    if (!mainBody) return;
    host.style.cssText = "padding:4px 0 14px;border:0;background:transparent";
    mainBody.insertBefore(host, mainBody.firstChild);
}

/* ----- DIA.57. crmSmartScheduleUpdateNow (oryginalna linia 4539) ----- */
async function crmSmartScheduleUpdateNow() {
    const button = document.getElementById("sch-smart-update-btn");
    if (button) { button.disabled = true; button.textContent = "Sprawdzanie..."; }
    try {
        const response = await crmExtendedPost("smartScheduleUpdate", {manual:true});
        if (!response.success) throw new Error(response.error || "Błąd aktualizacji grafiku");
        const message = response.changed ? "Grafik zaktualizowany" : "Grafik aktualny";
        crmToast(message);
        await crmRefreshAllViews();
    } catch (error) { crmToast(error.message || String(error), "error"); }
    finally { if (button) { button.disabled = false; button.textContent = "Sprawdź aktualizację"; } }
}


/* ----- DIA.81. crmDaySettingsRange (oryginalna linia 5814) ----- */
function crmDaySettingsRange() {
    const start = crmDayMinutes(settingsData?.work_start_hour, 8 * 60);
    const end = crmDayMinutes(settingsData?.work_end_hour, 21 * 60);
    return {start: Math.min(start, end - 60), end: Math.max(end, start + 60)};
}


/* ==========================================================================
   SETTINGS LAZY DATA V12 2026-08-12
   Jedno getEffectiveSchedule na miesiąc, dopiero po wejściu do Ustawień.
   ========================================================================== */
const crmEffectiveScheduleCacheV12=new Map();
const crmEffectiveSchedulePromiseV12=new Map();

async function crmGetEffectiveScheduleV12(monthKey,options={}){
    const key=String(monthKey||"");
    const force=options.force===true;
    const cached=crmEffectiveScheduleCacheV12.get(key);
    if(!force && cached && Date.now()-cached.at<120000) return cached.data;
    if(crmEffectiveSchedulePromiseV12.has(key)) return crmEffectiveSchedulePromiseV12.get(key);

    const promise=(async()=>{
        const response=await crmExtendedPost("getEffectiveSchedule",{month:key});
        if(!response?.success) throw new Error(response?.error||"Błąd odczytu grafiku");
        crmEffectiveScheduleCacheV12.set(key,{at:Date.now(),data:response});
        return response;
    })().finally(()=>crmEffectiveSchedulePromiseV12.delete(key));

    crmEffectiveSchedulePromiseV12.set(key,promise);
    return promise;
}

function crmRenderScheduleListV12(response){
    const output=document.getElementById("sch-output");
    if(!output)return;
    output.innerHTML=(response?.entries||[]).map(item=>
        `<div style="padding:6px;border-bottom:1px solid #ddd"><strong>${item.date}</strong> | ${item.code||item.dayType} | źródło: ${item.source} | ${item.reason||""}</div>`
    ).join("")||"Brak wpisów";
}

function crmRenderWorkScheduleFromResponseV12(response,year,monthIndex){
    const host=document.getElementById("work-schedule-calendar");
    if(!host)return;
    const byDate={};
    (response?.entries||[]).forEach(item=>{byDate[item.date]=item;});
    const names=["Pon","Wt","Śr","Czw","Pt","Sob","Niedz"];
    const monthName=new Date(year,monthIndex,1).toLocaleDateString("pl-PL",{month:"long",year:"numeric"});
    let html=`<h3 style="margin:0 0 12px">${monthName}</h3><div class="work-schedule-grid" style="display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:5px">`;
    names.forEach(name=>{html+=`<div style="font-weight:700;text-align:center;padding:5px">${name}</div>`;});
    const first=new Date(year,monthIndex,1);
    const leading=first.getDay()===0?6:first.getDay()-1;
    for(let i=0;i<leading;i++)html+="<div></div>";
    const days=new Date(year,monthIndex+1,0).getDate();
    for(let day=1;day<=days;day++){
        const dateKey=`${year}-${String(monthIndex+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const entry=byDate[dateKey]||{};
        const code=entry.code||"";
        const color=scheduleCodeColor(code);
        const title=entry.source?`Kod: ${code}; źródło: ${entry.source}; ${entry.reason||""}`:"Brak danych";
        html+=`<button type="button" title="${title.replace(/"/g,"&quot;")}" style="min-height:58px;border:1px solid #d8cec6;border-radius:7px;background:${color.bg};color:${color.fg};cursor:pointer"><span style="display:block;font-size:12px">${day}</span><strong style="font-size:17px">${code}</strong></button>`;
    }
    host.innerHTML=html+"</div><p style=\"font-size:12px;color:#666\">1 = zmiana dzienna, 2 = zmiana nocna. Grafik ma charakter informacyjny i sam nie blokuje wizyt.</p>";
}

refreshSchedulePanel=async function(){
    const month=document.getElementById("sch-month");
    if(!month)return;
    const response=await crmGetEffectiveScheduleV12(month.value);
    crmRenderScheduleListV12(response);
    return response;
};

renderWorkScheduleCalendar=async function(){
    const year=selectedCalendarDate.getFullYear();
    const monthIndex=selectedCalendarDate.getMonth();
    const monthKey=`${year}-${String(monthIndex+1).padStart(2,"0")}`;
    const response=await crmGetEffectiveScheduleV12(monthKey);
    crmRenderWorkScheduleFromResponseV12(response,year,monthIndex);
    return response;
};

async function crmLoadEffectiveScheduleViewsV12(options={}){
    const year=selectedCalendarDate.getFullYear();
    const monthIndex=selectedCalendarDate.getMonth();
    const monthKey=`${year}-${String(monthIndex+1).padStart(2,"0")}`;
    const response=await crmGetEffectiveScheduleV12(monthKey,options);

    const monthInput=document.getElementById("sch-month");
    if(monthInput)monthInput.value=monthKey;
    crmRenderScheduleListV12(response);
    crmRenderWorkScheduleFromResponseV12(response,year,monthIndex);
    return response;
}
window.crmLoadEffectiveScheduleViewsV12=crmLoadEffectiveScheduleViewsV12;

/* ==========================================================================
   CRM TESTS — CLEAN LAUNCHER / REPORT CORE V1 2026-08-16

   Ten plik zawiera TYLKO:
   - normalną logikę Ustawień/Grafiku,
   - wspólny stan uruchamiania testów,
   - transport GET używany przez testy,
   - renderowanie postępu i raportu,
   - kopiowanie raportu.

   Właściwe testy są osobno:
   - crm-test-full.js
   - crm-test-light.js
   ========================================================================== */

const CRM_TEST_UI_VERSION = "1.0.0";
let crmTestIsRunning = false;
let crmLastTestReport = null;
window.crmDiagnosticsNetworkModeV11 = Boolean(window.crmDiagnosticsNetworkModeV11);

function crmTestCreateReport(testType, testerVersion) {
    const now = new Date();
    return {
        testId: "CRM_TEST_" + now.getTime(),
        testerVersion: testerVersion || CRM_TEST_UI_VERSION,
        testType: String(testType || "CRM_TEST"),
        status: "URUCHOMIONY",
        startedAt: now.toISOString(),
        finishedAt: "",
        durationSeconds: 0,
        passed: 0,
        warnings: 0,
        errors: 0,
        tests: [],
        currentStage: ""
    };
}

function crmTestAdd(report, status, name, details) {
    if (!report || !Array.isArray(report.tests)) return;
    const normalized =
        status === "OK" ? "OK" :
        status === "OSTRZEZENIE" ? "OSTRZEZENIE" :
        "BLAD";

    report.tests.push({
        status: normalized,
        name: String(name || ""),
        details: details === undefined ? "" : details
    });

    if (normalized === "OK") report.passed += 1;
    else if (normalized === "OSTRZEZENIE") report.warnings += 1;
    else report.errors += 1;

    crmTestRenderReport(report);
}

function crmTestWait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}

function crmTestSetProgress(percent, text) {
    const wrapper = document.getElementById("crm-test-progress-wrapper");
    const bar = document.getElementById("crm-test-progress-bar");
    const label = document.getElementById("crm-test-progress-text");

    if (wrapper) wrapper.style.display = "block";
    if (bar) bar.style.width = Math.max(0, Math.min(100, Number(percent) || 0)) + "%";
    if (label) label.textContent = String(text || "");

    if (crmLastTestReport) crmLastTestReport.currentStage = String(text || "");
}

function crmTestSetRunning(running) {
    crmTestIsRunning = Boolean(running);
    window.crmTestIsRunning = crmTestIsRunning;

    ["runCRMTestLightBtn", "runCRMTestFullBtn"].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = crmTestIsRunning;
    });
}

function crmTestSafeText(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); }
    catch (error) { return String(value); }
}

function buildCRMTestTextReport(report) {
    if (!report) return "Brak raportu.";

    const lines = [
        "CRM TEST REPORT",
        "ID testu: " + (report.testId || ""),
        "Wersja testera: " + (report.testerVersion || ""),
        "Rodzaj testu: " + (report.testType || ""),
        "Status: " + (report.status || ""),
        "Rozpoczecie: " + (report.startedAt || ""),
        "Zakonczenie: " + (report.finishedAt || ""),
        "Czas: " + (report.durationSeconds || 0) + " s",
        "Zaliczone: " + (report.passed || 0),
        "Ostrzezenia: " + (report.warnings || 0),
        "Bledy: " + (report.errors || 0),
        "",
        "SZCZEGOLY:"
    ];

    (report.tests || []).forEach((test, index) => {
        const icon =
            test.status === "OK" ? "[OK]" :
            test.status === "OSTRZEZENIE" ? "[OSTRZEZENIE]" :
            "[BLAD]";

        lines.push((index + 1) + ". " + icon + " " + (test.name || ""));
        const details = crmTestSafeText(test.details);
        if (details) lines.push("   " + details);
    });

    return lines.join("\n");
}

function crmTestRenderReport(report) {
    const output = document.getElementById("crm-test-report-output");
    if (output) output.textContent = buildCRMTestTextReport(report);
}

function crmTestRenderSummary(report) {
    const box = document.getElementById("crm-test-summary");
    if (!box || !report) return;

    const isError = report.errors > 0;
    const isWarning = !isError && report.warnings > 0;
    const color = isError ? "#b42318" : (isWarning ? "#a15c00" : "#198754");
    const title =
        isError ? "Test wykrył błędy" :
        isWarning ? "Test zakończony z ostrzeżeniami" :
        "Test zakończony pomyślnie";

    box.style.display = "block";
    box.style.borderLeft = "6px solid " + color;
    box.innerHTML =
        '<h3 style="color:' + color + ';margin-top:0;">' + title + '</h3>' +
        '<p><strong>Test:</strong> ' + String(report.testType || "") + '</p>' +
        '<p>OK: <strong>' + Number(report.passed || 0) + '</strong> &nbsp; ' +
        'Ostrzeżenia: <strong>' + Number(report.warnings || 0) + '</strong> &nbsp; ' +
        'Błędy: <strong>' + Number(report.errors || 0) + '</strong></p>' +
        '<p>Czas: <strong>' + Number(report.durationSeconds || 0) + ' s</strong></p>';
}

function crmTestFinish(report, startedAtMs) {
    if (!report) return;
    report.finishedAt = new Date().toISOString();
    report.durationSeconds = Math.round((Date.now() - Number(startedAtMs || Date.now())) / 1000);
    report.status =
        report.errors > 0 ? "BLEDY" :
        report.warnings > 0 ? "OSTRZEZENIA" :
        "ZALICZONY";

    crmTestRenderReport(report);
    crmTestRenderSummary(report);
}

/*
 * Jeden transport GET dla obu testów.
 * Przy lokalnym file:// korzysta z działającego transportu V13 przez
 * crmQueuedGetV11 / crmFetchJsonV12.
 */
async function crmTestGet(parameters, options = {}) {
    const params = Object.assign({}, parameters || {});

    const query = Object.keys(params)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        .join("&");

    const separator = APPS_SCRIPT_URL.includes("?") ? "&" : "?";
    const url = `${APPS_SCRIPT_URL}${separator}${query}`;
    const timeoutMs = Math.max(15000, Number(options.timeoutMs) || 45000);

    if (typeof crmQueuedGetV11 === "function") {
        return crmQueuedGetV11(url, {
            key: "crm-test:" + query.replace(/(?:testTimestamp|_diag|_t|_e2e)=[^&]*/g, ""),
            priority: 110,
            timeoutMs: timeoutMs
        });
    }

    if (typeof crmFetchJsonV12 === "function") {
        return crmFetchJsonV12(url, { timeoutMs: timeoutMs });
    }

    const response = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await response.text();
    if (!response.ok) throw new Error("HTTP " + response.status + ": " + text.slice(0, 500));
    try { return JSON.parse(text); }
    catch (error) { throw new Error("API nie zwróciło JSON: " + text.slice(0, 500)); }
}

async function saveCRMTestReport(report) {
    if (typeof crmTestPost !== "function") {
        throw new Error("Brak crmTestPost()");
    }
    const result = await crmTestPost(
        { action: "saveTestReport", report: report },
        { timeoutMs: 45000 }
    );
    if (!result || !result.success) {
        throw new Error(result?.error || "Nie zapisano raportu");
    }
    return result;
}

async function copyCRMTestReport() {
    if (!crmLastTestReport) {
        if (typeof crmToast === "function") crmToast("Nie ma jeszcze raportu do skopiowania.", "error");
        return;
    }

    const text = buildCRMTestTextReport(crmLastTestReport);

    try {
        await navigator.clipboard.writeText(text);
        if (typeof crmToast === "function") crmToast("Raport skopiowany.");
    } catch (error) {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
        if (typeof crmToast === "function") crmToast("Raport skopiowany.");
    }
}

/*
 * admin-core wywołuje tę funkcję podczas układania Ustawień.
 * Stara wersja przebudowywała panel i dokładała wiele procedur.
 * Clean V1 pozostawia dokładnie trzy elementy z admin.html.
 */
function crmArrangeDiagnosticsPanel() {
    const panel = document.getElementById("crm-diagnostics-panel");
    if (!panel) return;
    panel.dataset.finalLayout = "clean-v1";
}

function crmResetTestPanelForRun(label) {
    const summary = document.getElementById("crm-test-summary");
    const output = document.getElementById("crm-test-report-output");
    const wrapper = document.getElementById("crm-test-progress-wrapper");
    const bar = document.getElementById("crm-test-progress-bar");
    const text = document.getElementById("crm-test-progress-text");

    if (summary) {
        summary.style.display = "none";
        summary.innerHTML = "";
    }
    if (output) output.textContent = "Uruchamianie " + String(label || "testu") + "...";
    if (wrapper) wrapper.style.display = "block";
    if (bar) bar.style.width = "0%";
    if (text) text.textContent = "Przygotowanie " + String(label || "testu") + "...";
}

window.copyCRMTestReport = copyCRMTestReport;
window.crmTestCreateReport = crmTestCreateReport;
window.crmTestAdd = crmTestAdd;
window.crmTestWait = crmTestWait;
window.crmTestSetProgress = crmTestSetProgress;
window.crmTestSetRunning = crmTestSetRunning;
window.crmTestFinish = crmTestFinish;
window.crmTestGet = crmTestGet;
window.saveCRMTestReport = saveCRMTestReport;
window.crmResetTestPanelForRun = crmResetTestPanelForRun;

/* KONIEC CRM TESTS CLEAN LAUNCHER / REPORT CORE V1 */
