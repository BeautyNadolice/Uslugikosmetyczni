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
        document.getElementById("schedule_cycle").value.trim() || "4x4",

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

/* ----- DIA.55. crmArrangeDiagnosticsPanel (oryginalna linia 4504) ----- */
function crmArrangeDiagnosticsPanel() {
    const panel = document.getElementById("crm-diagnostics-panel");
    if (!panel || panel.dataset.finalLayout === "1") return;
    panel.dataset.finalLayout = "1";
    const buttons = Array.from(panel.querySelectorAll("button"));
    const host = document.createElement("div");
    host.style.cssText = "display:block";
    const definitions = [
        ["Szybki test", b => /Szybki test/i.test(b.textContent)],
        ["Pełny test CRM", b => /Pełny test/i.test(b.textContent)],
        ["Raport diagnostyczny", b => /Kopiuj raport/i.test(b.textContent)],
        ["Historia testów", b => /Historia testów/i.test(b.textContent)]
    ];
    definitions.forEach(([title, match]) => {
        const button = buttons.find(match);
        if (!button) return;
        const row = document.createElement("div");
        row.appendChild(button);
        host.appendChild(crmCreateProcedure(title, row));
    });
    const firstDetails = panel.querySelector("details");
    if (firstDetails) firstDetails.before(host); else panel.appendChild(host);
    Array.from(panel.querySelectorAll("details")).forEach(d => d.open = false);
    crmWrapSectionAsDetails(panel, "Diagnostyka systemu CRM");
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

/* ----- DIA.58. CRM_TESTER_VERSION (oryginalna linia 4760) ----- */
/* KONIEC ADMIN V13 */

/* ==========================================================
   DIAGNOSTYKA SYSTEMU CRM - MODUL STALY
   WERSJA TESTERA: 1.0.1

   TEN BLOK MUSI POZOSTAC NA SAMYM KONCU ADMIN.JS.
   POD NIM NIE DODAJEMY INNEGO KODU.
   ABY USUNAC TESTER, USUN CALY BLOK OD TEGO KOMENTARZA
   DO KOMENTARZA "KONIEC DIAGNOSTYKI SYSTEMU CRM".
   ========================================================== */

const CRM_TESTER_VERSION = "1.0.1";

/* ----- DIA.59. crmTestIsRunning (oryginalna linia 4761) ----- */
let crmTestIsRunning = false;

/* ----- DIA.60. crmLastTestReport (oryginalna linia 4762) ----- */
let crmLastTestReport = null;

/* ----- DIA.61. crmTestCreateReport (oryginalna linia 4764) ----- */
function crmTestCreateReport(testType) {
    const now = new Date();
    return {
        testId: "CRM_TEST_" + now.getTime(),
        testerVersion: CRM_TESTER_VERSION,
        testType: testType,
        startedAt: now.toISOString(),
        finishedAt: "",
        durationSeconds: 0,
        status: "W TRAKCIE",
        passed: 0,
        warnings: 0,
        errors: 0,
        currentStage: "Przygotowanie testu",
        tests: [],
        testData: {}
    };
}

/* ----- DIA.62. crmTestAdd (oryginalna linia 4783) ----- */
function crmTestAdd(report, status, name, details) {
    report.tests.push({
        status: status,
        name: name,
        details: details === undefined ? "" : details
    });
    if (status === "OK") report.passed += 1;
    else if (status === "OSTRZEZENIE") report.warnings += 1;
    else report.errors += 1;
    crmTestRenderReport(report);
}

/* ----- DIA.63. crmTestWait (oryginalna linia 4795) ----- */
function crmTestWait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ----- DIA.64. crmTestSetProgress (oryginalna linia 4799) ----- */
function crmTestSetProgress(percent, text) {
    const wrapper = document.getElementById("crm-test-progress-wrapper");
    const bar = document.getElementById("crm-test-progress-bar");
    const label = document.getElementById("crm-test-progress-text");
    if (wrapper) wrapper.style.display = "block";
    if (bar) bar.style.width = Math.max(0, Math.min(100, percent)) + "%";
    if (label) label.textContent = text;
    if (crmLastTestReport) crmLastTestReport.currentStage = text;
}

/* ----- DIA.65. crmTestSetRunning (oryginalna linia 4809) ----- */
function crmTestSetRunning(running) {
    crmTestIsRunning = running;
    ["runQuickCRMTestBtn", "runFullCRMTestBtn"].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = running;
    });
}

/* ----- DIA.66. crmTestSafeText (oryginalna linia 4817) ----- */
function crmTestSafeText(value) {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); }
    catch (error) { return String(value); }
}

/* ----- DIA.67. buildCRMTestTextReport (oryginalna linia 4824) ----- */
function buildCRMTestTextReport(report) {
    if (!report) return "Brak raportu.";
    const lines = [
        "CRM TEST REPORT",
        "ID testu: " + report.testId,
        "Wersja testera: " + report.testerVersion,
        "Rodzaj testu: " + report.testType,
        "Status: " + report.status,
        "Rozpoczecie: " + report.startedAt,
        "Zakonczenie: " + (report.finishedAt || "test trwa"),
        "Czas: " + report.durationSeconds + " s",
        "Zaliczone: " + report.passed,
        "Ostrzezenia: " + report.warnings,
        "Bledy: " + report.errors,
        "",
        "SZCZEGOLY:"
    ];
    report.tests.forEach((test, index) => {
        const icon = test.status === "OK" ? "[OK]" :
            (test.status === "OSTRZEZENIE" ? "[OSTRZEZENIE]" : "[BLAD]");
        lines.push((index + 1) + ". " + icon + " " + test.name);
        const details = crmTestSafeText(test.details);
        if (details) lines.push("   " + details);
    });
    return lines.join("\n");
}

/* ----- DIA.68. crmTestRenderReport (oryginalna linia 4851) ----- */
function crmTestRenderReport(report) {
    const output = document.getElementById("crm-test-report-output");
    if (output) output.textContent = buildCRMTestTextReport(report);
}

/* ----- DIA.69. crmTestRenderSummary (oryginalna linia 4856) ----- */
function crmTestRenderSummary(report) {
    const box = document.getElementById("crm-test-summary");
    if (!box) return;
    const isError = report.errors > 0;
    const isWarning = !isError && report.warnings > 0;
    const color = isError ? "#b42318" : (isWarning ? "#a15c00" : "#198754");
    const title = isError ? "Test wykryl bledy" :
        (isWarning ? "Test zakonczony z ostrzezeniami" : "Test zakonczony pomyslnie");
    box.style.display = "block";
    box.style.borderLeft = "6px solid " + color;
    box.innerHTML =
        '<h3 style="color:' + color + ';margin-top:0;">' + title + '</h3>' +
        '<p><strong>ID testu:</strong> ' + report.testId + '</p>' +
        '<p>OK: <strong>' + report.passed + '</strong> &nbsp; ' +
        'Ostrzezenia: <strong>' + report.warnings + '</strong> &nbsp; ' +
        'Bledy: <strong>' + report.errors + '</strong></p>' +
        '<p>Czas: <strong>' + report.durationSeconds + ' s</strong></p>';
}

/* ----- DIA.70. crmTestGet (oryginalna linia 4875) ----- */
async function crmTestGet(parameters) {
    const query = Object.keys(parameters).map(key =>
        encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
    ).join("&");
    const response = await fetch(APPS_SCRIPT_URL + "?" + query, {
        method: "GET",
        cache: "no-store"
    });
    const text = await response.text();
    if (!response.ok) throw new Error("HTTP " + response.status + ": " + text);
    try { return JSON.parse(text); }
    catch (error) { throw new Error("API nie zwrocilo JSON: " + text.substring(0, 500)); }
}

/* ----- DIA.71. crmTestFrontendChecks (oryginalna linia 4901) ----- */
function crmTestFrontendChecks(report) {
    [
        "admin-panel-wrapper", "tab-dashboard", "tab-kalendarz", "tab-klienci",
        "tab-cennik", "tab-finanse", "tab-ustawienia", "booksy-grid",
        "clientsTableBody", "adminServicesTableBody", "settingsForm",
        "work_start_hour", "work_end_hour", "buffer_hours", "slot_interval_minutes",
        "start_offset_minutes", "cleanup_buffer_minutes", "schedule_cycle", "appointmentModal",
        "appointmentDetailsModal", "blockTimeModal", "clientModal", "serviceModal",
        "categoryModal", "crm-diagnostics-panel"
    ].forEach(id => {
        const exists = Boolean(document.getElementById(id));
        crmTestAdd(report, exists ? "OK" : "BLAD", "Element HTML #" + id,
            exists ? "Znaleziono" : "Nie znaleziono");
    });
    [
        "loadSystem", "loadServices", "loadSettings", "loadClients",
        "renderDashboard", "renderBooksyCalendar", "renderMiniMonthCalendar",
        "renderDayCalendar", "renderWeekCalendar", "renderMonthCalendar",
        "normalizeClientCounter", "renderClients", "renderServicesTable", "calculateFinanceReport",
        "saveSettings", "saveAppointment", "deleteAppointmentFromAdmin",
        "deleteBlockTimeFromAdmin", "deleteSelectedCalendarItemFromAdmin",
        "recordAppointmentLifecycle", "loadClientCRMProfile", "saveClientBookingMode",
        "getSmartNextVisitSuggestion", "saveFamilyScheduleEntry",
        "submitBlockTime", "saveClientModalData", "deleteClient",
        "saveDraftsToCloud", "publishDrafts"
    ].forEach(name => {
        const exists = typeof window[name] === "function";
        crmTestAdd(report, exists ? "OK" : "BLAD", "Funkcja " + name + "()",
            exists ? "Dostepna" : "Brak funkcji");
    });
}

/* ----- DIA.72. crmTestApiChecks (oryginalna linia 4933) ----- */
async function crmTestApiChecks(report) {
    const busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
    const validBusy = busy && typeof busy === "object" && busy.settings &&
        typeof busy.settings === "object" && Array.isArray(busy.appointments);
    crmTestAdd(report, validBusy ? "OK" : "BLAD", "Odczyt ustawien i kalendarza",
        validBusy ? "Poprawna odpowiedz" : busy);
    if (!validBusy) throw new Error("Nieprawidlowa odpowiedz checkBusy");

    [
        "work_start_hour", "work_end_hour", "buffer_hours", "slot_interval_minutes",
        "start_offset_minutes", "cleanup_buffer_minutes", "schedule_cycle",
        "calendar_id", "colors", "all_categories"
    ].forEach(key => {
        const exists = Object.prototype.hasOwnProperty.call(busy.settings, key);
        crmTestAdd(report, exists ? "OK" : "OSTRZEZENIE", "Ustawienie " + key,
            exists ? busy.settings[key] : "Brak ustawienia");
    });
    const services = await crmTestGet({ getPrices: "true", testTimestamp: Date.now() });
    crmTestAdd(report, Array.isArray(services) ? "OK" : "BLAD", "Odczyt cennika",
        Array.isArray(services) ? "Liczba uslug: " + services.length : services);
    const clients = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
    crmTestAdd(report, Array.isArray(clients) ? "OK" : "BLAD", "Odczyt klientow",
        Array.isArray(clients) ? "Liczba klientow: " + clients.length : clients);
    return busy;
}

/* ----- DIA.73. crmTestLocalDate (oryginalna linia 4959) ----- */
function crmTestLocalDate(daysForward, hour, minute) {
    const date = new Date();
    date.setDate(date.getDate() + daysForward);
    date.setHours(hour, minute, 0, 0);
    const p = value => String(value).padStart(2, "0");
    return date.getFullYear() + "-" + p(date.getMonth() + 1) + "-" + p(date.getDate()) +
        "T" + p(date.getHours()) + ":" + p(date.getMinutes());
}

/* ----- DIA.74. crmTestLocalDay (oryginalna linia 4968) ----- */
function crmTestLocalDay(daysForward) {
    return crmTestLocalDate(daysForward, 0, 0).substring(0, 10);
}

/* ----- DIA.75. crmTestFinish (oryginalna linia 4972) ----- */
function crmTestFinish(report, startedAtMs) {
    report.finishedAt = new Date().toISOString();
    report.durationSeconds = Math.round((Date.now() - startedAtMs) / 1000);
    report.status = report.errors > 0 ? "BLEDY" :
        (report.warnings > 0 ? "OSTRZEZENIA" : "ZALICZONY");
    crmTestRenderReport(report);
    crmTestRenderSummary(report);
}

/* ----- DIA.76. saveCRMTestReport (oryginalna linia 4981) ----- */
async function saveCRMTestReport(report) {
    const result = await crmTestPost({ action: "saveTestReport", report: report });
    if (!result || !result.success) {
        throw new Error(result && result.error ? result.error : "Nie zapisano raportu");
    }
    return result;
}

/* ----- DIA.77. runCRMQuickTest (oryginalna linia 4989) ----- */
async function runCRMQuickTest() {
    if (crmTestIsRunning) return alert("Test CRM jest juz uruchomiony.");
    crmTestSetRunning(true);
    const report = crmTestCreateReport("SZYBKI");
    crmLastTestReport = report;
    const started = Date.now();
    try {
        crmTestSetProgress(15, "Sprawdzanie HTML i JavaScript...");
        crmTestFrontendChecks(report);
        crmTestSetProgress(55, "Sprawdzanie API i danych...");
        await crmTestApiChecks(report);
    } catch (error) {
        crmTestAdd(report, "BLAD", "Glowny przebieg szybkiego testu", error.message || String(error));
    } finally {
        crmTestFinish(report, started);
        crmTestSetProgress(90, "Zapisywanie raportu...");
        try { await saveCRMTestReport(report); }
        catch (error) { crmTestAdd(report, "BLAD", "Zapis raportu", error.message || String(error)); crmTestFinish(report, started); }
        crmTestSetProgress(100, "Szybki test zakonczony.");
        crmTestSetRunning(false);
    }
}

/* ----- DIA.78. runCRMFullTest (oryginalna linia 5012) ----- */
async function runCRMFullTest() {
    if (crmTestIsRunning) return alert("Test CRM jest juz uruchomiony.");
    crmTestSetRunning(true);
    const report = crmTestCreateReport("PELNY");
    crmLastTestReport = report;
    const started = Date.now();
    const marker = Date.now();
    const phone = "TEST-" + marker;
    const clientName = "CRM_TEST_KLIENT_" + marker;
    const editedName = "CRM_TEST_EDYCJA_" + marker;
    const serviceName = "CRM_TEST_USLUGA_" + marker;
    const blockTitle = "CRM_TEST_BLOKADA_" + marker;
    const appointmentDate = crmTestLocalDate(20, 10, 15);
    const editedDate = crmTestLocalDate(20, 12, 30);
    let appointmentEventId = "";
    let blockEventId = "";
    report.testData = { marker, phone, clientName, editedName, serviceName, blockTitle };

    try {
        crmTestSetProgress(5, "Sprawdzanie HTML i JavaScript...");
        crmTestFrontendChecks(report);

        const savedViewMode = calendarViewMode;
        const savedSelectedDate = new Date(selectedCalendarDate);
        ["day", "week", "month"].forEach(mode => {
            setCalendarView(mode);
            const calendarGrid = document.getElementById("booksy-grid");
            crmTestAdd(
                report,
                calendarGrid && calendarGrid.dataset.calendarView === mode ? "OK" : "BLAD",
                "Renderowanie widoku " + mode,
                calendarGrid ? calendarGrid.dataset.calendarView : "Brak siatki kalendarza"
            );
        });
        selectedCalendarDate = savedSelectedDate;
        setCalendarView(savedViewMode);

        crmTestSetProgress(15, "Sprawdzanie API i ustawien...");
        await crmTestApiChecks(report);

        const extensionInit = await crmExtendedPost("initializeCRMExtensions");
        crmTestAdd(report, extensionInit && extensionInit.success ? "OK" : "BLAD",
            "Inicjalizacja modułów 3.3E-3.3H", extensionInit);

        const familyRead = await crmExtendedPost("getFamilySchedule", { fromDate: "", toDate: "" });
        crmTestAdd(report, familyRead && familyRead.success && Array.isArray(familyRead.entries) ? "OK" : "BLAD",
            "Odczyt grafiku rodzinnego", familyRead);

        const point35 = await crmExtendedPost("runPoint35Diagnostics");
        crmTestAdd(report, point35 && point35.success ? "OK" : "BLAD", "Diagnostyka końcowa 3.4 i 3.5", point35);
        crmTestAdd(report, point35 && point35.drive && point35.drive.folderAccessible ? "OK" : "BLAD", "Dostęp do folderu prawdziwego grafiku", point35 && point35.drive);
        crmTestAdd(report, point35 && point35.manualCorrectionHighestPriority ? "OK" : "BLAD", "Ręczna korekta ma najwyższy priorytet", point35);
        crmTestAdd(report, point35 && point35.privateCalendarProtection ? "OK" : "BLAD", "Ochrona prywatnych wydarzeń Google Calendar", point35);
        crmTestAdd(report, point35 && point35.smartVisitEngine ? "OK" : "BLAD", "Silnik inteligentnego kolejnego wizytu", point35);

        const backupResult = await crmExtendedPost("createFinalAdminBackup", { description: "Automatyczny backup testu " + report.testId });
        crmTestAdd(report, backupResult && backupResult.success ? "OK" : "BLAD", "Finalny backup ADMIN", backupResult);

        crmTestSetProgress(25, "Tworzenie klienta testowego...");
        const clientCreate = await crmTestPost({
            action: "saveClient", oldPhone: "",
            client: { name: clientName, phone, visits: 0, cancelled: 0, lastVisit: "" }
        });
        crmTestAdd(report, clientCreate.success ? "OK" : "BLAD", "Tworzenie klienta testowego", clientCreate);
        const clientEdit = await crmTestPost({
            action: "saveClient", oldPhone: phone,
            client: { name: editedName, phone, visits: 2, cancelled: 1, lastVisit: "" }
        });
        crmTestAdd(report, clientEdit.success ? "OK" : "BLAD", "Edycja klienta testowego", clientEdit);

        crmTestSetProgress(40, "Tworzenie wizyty testowej...");
        const appointmentCreate = await crmTestPost({
            action: "createBooking", phone, name: editedName, service: serviceName,
            date: appointmentDate, duration: 45, rodo: "Test automatyczny CRM"
        });
        crmTestAdd(report, appointmentCreate.success ? "OK" : "BLAD", "Tworzenie wizyty testowej", appointmentCreate);
        await crmTestWait(1500);
        let busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
        let appointment = busy.appointments.find(item =>
            String(item.phone) === phone && item.name === editedName && item.service === serviceName
        );
        if (appointment) appointmentEventId = appointment.eventId || "";
        crmTestAdd(report, appointment ? "OK" : "BLAD", "Odczyt utworzonej wizyty", appointment || "Nie znaleziono");
        crmTestAdd(report, appointmentEventId ? "OK" : "OSTRZEZENIE", "Event ID wizyty", appointmentEventId || "Brak Event ID");
        crmTestAdd(report, appointment && Number(appointment.duration) === 45 ? "OK" : "BLAD",
            "Czas trwania utworzonej wizyty", appointment ? appointment.duration + " min" : "Brak wizyty");

        let clientsAfterCreate = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
        let testClientStats = clientsAfterCreate.find(item => String(item.phone) === phone);
        crmTestAdd(report, testClientStats && Number(testClientStats.visits) === 1 ? "OK" : "BLAD",
            "Statystyka klienta po utworzeniu wizyty", testClientStats || "Nie znaleziono klienta");
        crmTestAdd(report, testClientStats && typeof testClientStats.visits === "number" ? "OK" : "BLAD",
            "Licznik wizyt klienta jest liczbą", testClientStats || "Nie znaleziono klienta");

        const conflictAttempt = await crmTestPost({
            action: "createBooking",
            phone: phone + "-KONFLIKT",
            name: "CRM_TEST_KONFLIKT_" + marker,
            service: serviceName + "_KONFLIKT",
            date: crmTestLocalDate(20, 11, 0),
            duration: 45,
            rodo: "Test konfliktu CRM"
        });
        const conflictRejected =
            conflictAttempt &&
            conflictAttempt.success === false &&
            conflictAttempt.code === "TIME_CONFLICT";
        crmTestAdd(report, conflictRejected ? "OK" : "BLAD",
            "Odrzucenie nakładającej się wizyty", conflictAttempt);

        crmTestSetProgress(52, "Edytowanie wizyty testowej...");
        if (appointmentEventId) {
            const appointmentEdit = await crmTestPost({
                action: "createBooking", editFlag: true, oldEventId: appointmentEventId,
                oldDate: appointmentDate, oldName: editedName, phone, name: editedName,
                service: serviceName + "_EDYCJA", date: editedDate, duration: 60,
                rodo: "Edycja automatyczna CRM"
            });
            crmTestAdd(report, appointmentEdit.success ? "OK" : "BLAD", "Edycja wizyty testowej", appointmentEdit);
            await crmTestWait(1500);
            busy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
            appointment = busy.appointments.find(item =>
                String(item.phone) === phone && item.service === serviceName + "_EDYCJA"
            );
            if (appointment) appointmentEventId = appointment.eventId || appointmentEventId;
            crmTestAdd(report, appointment ? "OK" : "BLAD", "Weryfikacja wizyty po edycji", appointment || "Nie znaleziono");
            crmTestAdd(report, appointment && Number(appointment.duration) === 60 ? "OK" : "BLAD",
                "Czas trwania wizyty po edycji", appointment ? appointment.duration + " min" : "Brak wizyty");

            const clientsAfterEdit = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
            testClientStats = clientsAfterEdit.find(item => String(item.phone) === phone);
            crmTestAdd(report, testClientStats && Number(testClientStats.visits) === 1 ? "OK" : "BLAD",
                "Edycja nie zwiększa licznika wizyt", testClientStats || "Nie znaleziono klienta");
        }

        crmTestSetProgress(65, "Tworzenie blokady testowej...");
        const blockCreate = await crmTestPost({
            action: "blockTime", blockType: "hours", date: crmTestLocalDay(21),
            startTime: "14:10", endTime: "15:20", title: blockTitle
        });
        if (blockCreate.success) blockEventId = blockCreate.eventId || "";
        crmTestAdd(report, blockCreate.success ? "OK" : "BLAD", "Tworzenie blokady testowej", blockCreate);
        crmTestAdd(report, blockEventId ? "OK" : "OSTRZEZENIE", "Event ID blokady", blockEventId || "Brak Event ID");

        crmTestSetProgress(78, "Sprzatanie danych testowych...");
        if (appointmentEventId) {
            const result = await crmTestPost({
                action: "createBooking", deleteFlag: true, eventId: appointmentEventId,
                date: editedDate, name: editedName
            });
            let deletionSucceeded = Boolean(result && result.success);
            if (!deletionSucceeded) {
                await crmTestWait(700);
                const verificationBusy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
                const stillExists = verificationBusy && Array.isArray(verificationBusy.appointments)
                    ? verificationBusy.appointments.some(item => item.eventId === appointmentEventId)
                    : true;
                deletionSucceeded = !stillExists;
            }
            crmTestAdd(report, deletionSucceeded ? "OK" : "BLAD", "Usuwanie wizyty testowej",
                deletionSucceeded && (!result || !result.success)
                    ? "Wizyta usunięta; odpowiedź API została utracona, stan potwierdzony odczytem"
                    : result);
            await crmTestWait(500);
            const clientsAfterAppointmentDelete = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
            testClientStats = clientsAfterAppointmentDelete.find(item => String(item.phone) === phone);
            const customerRemovedAfterCleanup = !testClientStats;
            const customerCounterReset = testClientStats && Number(testClientStats.visits) === 0;
            crmTestAdd(report, customerRemovedAfterCleanup || customerCounterReset ? "OK" : "BLAD",
                "Licznik klienta po usunięciu wizyty",
                customerRemovedAfterCleanup
                    ? "Klient testowy bez wizyt został automatycznie usunięty"
                    : testClientStats);
        }
        if (blockEventId) {
            const result = await crmTestPost({
                action: "deleteBlockTime", eventId: blockEventId,
                start: crmTestLocalDay(21) + "T14:10", end: crmTestLocalDay(21) + "T15:20", title: blockTitle
            });
            crmTestAdd(report, result.success ? "OK" : "BLAD", "Usuwanie blokady przez deleteBlockTime", result);
        }
        const clientDelete = await crmTestPost({ action: "deleteClient", phone });
        crmTestAdd(report, clientDelete.success ? "OK" : "BLAD", "Usuwanie klienta testowego", clientDelete);

        crmTestSetProgress(88, "Weryfikacja sprzatania...");
        await crmTestWait(1200);
        const finalClients = await crmTestGet({ getClients: "true", testTimestamp: Date.now() });
        const clientExists = Array.isArray(finalClients) && finalClients.some(item => String(item.phone) === phone);
        crmTestAdd(report, !clientExists ? "OK" : "BLAD", "Kontrola usuniecia klienta",
            !clientExists ? "Klient usuniety" : "Klient nadal istnieje");
        const finalBusy = await crmTestGet({ checkBusy: "true", testTimestamp: Date.now() });
        const appointmentExists = finalBusy.appointments.some(item => item.eventId === appointmentEventId || String(item.phone) === phone);
        const blockExists = finalBusy.appointments.some(item => item.eventId === blockEventId || item.name === blockTitle);
        crmTestAdd(report, !appointmentExists ? "OK" : "BLAD", "Kontrola usuniecia wizyty",
            !appointmentExists ? "Wizyta usunieta" : "Wizyta nadal istnieje");
        crmTestAdd(report, !blockExists ? "OK" : "BLAD", "Kontrola usuniecia blokady",
            !blockExists ? "Blokada usunieta" : "Blokada nadal istnieje");
    } catch (error) {
        crmTestAdd(report, "BLAD", "Glowny przebieg pelnego testu", error.message || String(error));
        try { await crmTestPost({ action: "deleteClient", phone }); } catch (cleanupError) { console.error(cleanupError); }
    } finally {
        crmTestFinish(report, started);
        crmTestSetProgress(95, "Zapisywanie raportu w Google Sheets...");
        try { await saveCRMTestReport(report); }
        catch (error) { crmTestAdd(report, "BLAD", "Zapis raportu", error.message || String(error)); crmTestFinish(report, started); }
        crmTestSetProgress(100, "Pelny test CRM zakonczony.");
        crmTestSetRunning(false);
        try { await loadSystem(); } catch (error) { console.error("Blad odswiezenia po tescie:", error); }
    }
}

/* ----- DIA.79. copyCRMTestReport (oryginalna linia 5223) ----- */
async function copyCRMTestReport() {
    if (!crmLastTestReport) return alert("Nie ma jeszcze raportu do skopiowania.");
    const text = buildCRMTestTextReport(crmLastTestReport);
    try {
        await navigator.clipboard.writeText(text);
        alert("Raport zostal skopiowany.");
    } catch (error) {
        const field = document.createElement("textarea");
        field.value = text;
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
        alert("Raport zostal skopiowany.");
    }
}

/* ----- DIA.80. loadCRMTestHistory (oryginalna linia 5240) ----- */
async function loadCRMTestHistory() {
    const container = document.getElementById("crm-test-history");
    if (!container) return;
    container.style.display = "block";
    container.textContent = "Ladowanie historii testow...";
    try {
        const response = await crmTestPost({ action: "getTestReports", limit: 10 });
        if (!response.success || !Array.isArray(response.reports)) {
            throw new Error(response.error || "Nieprawidlowa odpowiedz");
        }
        if (response.reports.length === 0) {
            container.innerHTML = "<p>Brak zapisanych raportow.</p>";
            return;
        }
        let html = '<h3>Ostatnie testy CRM</h3><div style="overflow-x:auto;">' +
            '<table class="admin-table"><thead><tr><th>Data</th><th>ID</th><th>Typ</th>' +
            '<th>Status</th><th>OK</th><th>Ostrzezenia</th><th>Bledy</th><th>Czas</th>' +
            '</tr></thead><tbody>';
        response.reports.forEach(item => {
            html += "<tr><td>" + (item.date || "") + "</td><td>" + (item.testId || "") +
                "</td><td>" + (item.testType || "") + "</td><td>" + (item.status || "") +
                "</td><td>" + (item.passed || 0) + "</td><td>" + (item.warnings || 0) +
                "</td><td>" + (item.errors || 0) + "</td><td>" +
                (item.durationSeconds || 0) + " s</td></tr>";
        });
        container.innerHTML = html + "</tbody></table></div>";
    } catch (error) {
        container.innerHTML = '<p style="color:#b42318;">Blad historii: ' +
            String(error.message || error) + "</p>";
    }
}

/* ----- DIA.81. crmDaySettingsRange (oryginalna linia 5814) ----- */
function crmDaySettingsRange() {
    const start = crmDayMinutes(settingsData?.work_start_hour, 8 * 60);
    const end = crmDayMinutes(settingsData?.work_end_hour, 21 * 60);
    return {start: Math.min(start, end - 60), end: Math.max(end, start + 60)};
}
