/* ==========================================================================
   FIN. FINANSE RAPORTY I STATYSTYKI
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- FIN.1. calculateFinanceReport (oryginalna linia 2841) ----- */
/* ==========================================================
   FINANCE
   ========================================================== */

function calculateFinanceReport(){

    let todaySum = 0;

    let weekSum = 0;

    let monthSum = 0;

    const now =
        new Date();

    const servicePriceMap = typeof crmGetServicePriceMapV25 === "function"
        ? crmGetServicePriceMapV25()
        : new Map((Array.isArray(currentServices) ? currentServices : []).map(service => [
            String(service?.name || "").trim().toLowerCase(),
            Number(service?.price) || 0
        ]));

    const firstDayOfWeek =
        new Date(now);

    const currentDay =
        now.getDay();

    const offset =
        currentDay === 0
        ? 6
        : currentDay - 1;

    firstDayOfWeek.setDate(
        now.getDate() - offset
    );

    firstDayOfWeek.setHours(
        0,0,0,0
    );

    const lastDayOfWeek =
        new Date(
            firstDayOfWeek
        );

    lastDayOfWeek.setDate(
        firstDayOfWeek.getDate()
        + 6
    );

    lastDayOfWeek.setHours(
        23,59,59,999
    );


    appointmentsData.forEach(app=>{

        if(
            !app.date ||
            !app.service
        ){
            return;
        }

        const serviceKey = String(app.service || "").trim().toLowerCase();
        const price = servicePriceMap.get(serviceKey) || 0;

        const appDate =
            new Date(app.date);

        if(
            appDate.toDateString()
            ===
            now.toDateString()
        ){

            todaySum += price;

        }

        if(
            appDate >= firstDayOfWeek &&
            appDate <= lastDayOfWeek
        ){

            weekSum += price;

        }

        if(
            appDate.getMonth()
            ===
            now.getMonth()
            &&
            appDate.getFullYear()
            ===
            now.getFullYear()
        ){

            monthSum += price;

        }

    });


    setText(
        "finance-today",
        todaySum.toFixed(2)
        + " zł"
    );

    setText(
        "finance-week",
        weekSum.toFixed(2)
        + " zł"
    );

    setText(
        "finance-month",
        monthSum.toFixed(2)
        + " zł"
    );

}
