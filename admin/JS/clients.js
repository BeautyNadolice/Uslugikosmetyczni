/* ==========================================================================
   CLI. KLIENCI
   Plik wygenerowany zachowawczo z admin.js. Kolejnosc elementow wewnatrz
   modulu odpowiada kolejnosci w monolicie. Nie zmieniac nazw globalnych.
   ========================================================================== */

/* ----- CLI.1. customersData (oryginalna linia 25) ----- */
let customersData = [];

/* ----- CLI.2. populateClientNameDatalist (oryginalna linia 1102) ----- */
function populateClientNameDatalist() {

    const list =
        document.getElementById(
            "appointmentClientNameList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.name) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.name || "";

        option.label =
            client.phone || "";

        list.appendChild(
            option
        );

    });

}

/* ----- CLI.3. populateClientPhoneDatalist (oryginalna linia 1147) ----- */
function populateClientPhoneDatalist() {

    const list =
        document.getElementById(
            "appointmentClientPhoneList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (
        !customersData ||
        customersData.length === 0
    ) {
        return;
    }

    customersData.forEach(client => {

        if (!client.phone) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.phone || "";

        option.label =
            client.name || "";

        list.appendChild(
            option
        );

    });

}

/* ----- CLI.4. loadClients (oryginalna linia 2288) ----- */
/* ==========================================================
   CLIENTS
   CRM V2
   ========================================================== */

async function loadClients(){

    try{

        const response =
            await fetch(
                APPS_SCRIPT_URL +
                "?getClients=true"
            );

        customersData =
            await response.json();
        renderClients();
    }

    catch(error){

        console.error(
            "Clients error",
            error
        );

        customersData = [];

    }

}

/* ----- CLI.5. normalizeClientCounter (oryginalna linia 2317) ----- */
function normalizeClientCounter(value) {
    if (typeof value === "number" && isFinite(value)) {
        return Math.max(0, Math.trunc(value));
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        return Math.max(0, parseInt(value.trim(), 10));
    }

    return 0;
}

/* ----- CLI.6. renderClients (oryginalna linia 2329) ----- */
function renderClients(){

    const tbody =
        document.getElementById(
            "clientsTableBody"
        );

    if(!tbody) return;

    tbody.innerHTML = "";

    if(
        !customersData ||
        customersData.length === 0
    ){

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    style="text-align:center;">

                    Brak klientów

                </td>

            </tr>

        `;

        return;

    }

    customersData.forEach(client=>{

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `

            <td>
                ${client.name || ""}
            </td>

            <td>
                ${client.phone || ""}
            </td>

            <td>
                ${normalizeClientCounter(client.visits)}
            </td>

            <td>
                ${normalizeClientCounter(client.cancelled)}
            </td>

            <td>
                ${client.lastVisit || "-"}
            </td>

            <td>

                <button
                    class="btn-secondary"
                    onclick="editClient('${client.phone}')">

                    Edytuj

                </button>

                <button
                    class="btn-danger"
                    onclick="deleteClient('${client.phone}')">

                    Usuń

                </button>

            </td>

        `;

        tbody.appendChild(
            tr
        );

    });

}

/* ----- CLI.7. openAddClientModal (oryginalna linia 2427) ----- */
/* ==========================================================
   CLIENT CRUD - MODAL
   ========================================================== */

function openAddClientModal() {

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Dodaj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        "";

    document.getElementById(
        "clientModalName"
    ).value =
        "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        "";

    document.getElementById(
        "clientModalVisits"
    ).value =
        "0";

    document.getElementById(
        "clientModalCancelled"
    ).value =
        "0";

    document.getElementById(
        "clientModalLastVisit"
    ).value =
        "";

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

/* ----- CLI.8. closeClientModal (oryginalna linia 2471) ----- */
function closeClientModal() {

    document.getElementById(
        "clientModal"
    ).style.display =
        "none";

}

/* ----- CLI.9. formatClientDateForInput (oryginalna linia 2480) ----- */
function formatClientDateForInput(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

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

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}

/* ----- CLI.10. editClient (oryginalna linia 2519) ----- */
function editClient(phone) {

    const client =
        customersData.find(item => {
            return (
                item.phone &&
                item.phone.toString().trim() ===
                phone.toString().trim()
            );
        });

    if (!client) {
        alert(
            "Nie znaleziono klienta."
        );
        return;
    }

    document.getElementById(
        "clientModalTitle"
    ).innerText =
        "Edytuj klienta";

    document.getElementById(
        "editClientPhone"
    ).value =
        client.phone || "";

    document.getElementById(
        "clientModalName"
    ).value =
        client.name || "";

    document.getElementById(
        "clientModalPhone"
    ).value =
        client.phone || "";

    document.getElementById(
        "clientModalVisits"
    ).value =
        client.visits || 0;

    document.getElementById(
        "clientModalCancelled"
    ).value =
        client.cancelled || 0;

    document.getElementById(
        "clientModalLastVisit"
    ).value =
        formatClientDateForInput(
            client.lastVisit
        );

    document.getElementById(
        "clientModal"
    ).style.display =
        "flex";

}

/* ----- CLI.11. saveClientModalData (oryginalna linia 2581) ----- */
function saveClientModalData() {

    const oldPhone =
        document.getElementById(
            "editClientPhone"
        ).value.trim();

    const name =
        document.getElementById(
            "clientModalName"
        ).value.trim();

    const phone =
        document.getElementById(
            "clientModalPhone"
        ).value.trim();

    const visits =
        Number(
            document.getElementById(
                "clientModalVisits"
            ).value
        ) || 0;

    const cancelled =
        Number(
            document.getElementById(
                "clientModalCancelled"
            ).value
        ) || 0;

    const lastVisit =
        document.getElementById(
            "clientModalLastVisit"
        ).value;

    if (!name || !phone) {
        alert(
            "Wpisz imię i telefon klienta."
        );
        return;
    }

    const clientData = {
        name:
        name,

        phone:
        phone,

        visits:
        visits,

        cancelled:
        cancelled,

        lastVisit:
        lastVisit
    };

    if (oldPhone) {

        const index =
            customersData.findIndex(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    oldPhone
                );
            });

        if (index !== -1) {
            customersData[index] =
                clientData;
        } else {
            customersData.push(
                clientData
            );
        }

    } else {

        const alreadyExists =
            customersData.some(item => {
                return (
                    item.phone &&
                    item.phone.toString().trim() ===
                    phone
                );
            });

        if (alreadyExists) {
            alert(
                "Klient z takim telefonem już istnieje."
            );
            return;
        }

        customersData.push(
            clientData
        );

    }

    renderClients();

    closeClientModal();

   saveClientToCloud(clientData, oldPhone);

}

/* ----- CLI.12. saveClientToCloud (oryginalna linia 2692) ----- */
async function saveClientToCloud(clientData, oldPhone) {

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
                        "saveClient",

                        oldPhone:
                        oldPhone || "",

                        client:
                        clientData
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {

            alert(
                "Klient zapisany."
            );

            closeClientModal();

            await loadClients();

            renderDashboard();

        } else {

            alert(
                "Błąd zapisu klienta: " +
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
            "Błąd połączenia podczas zapisu klienta."
        );

    }

}

/* ----- CLI.13. deleteClient (oryginalna linia 2762) ----- */
async function deleteClient(phone) {

    if (
        !confirm(
            "Usunąć klienta?"
        )
    ) {
        return;
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
                        "deleteClient",

                        phone:
                        phone
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {

            alert(
                "Klient usunięty."
            );

            await loadClients();

            renderDashboard();

        } else {

            alert(
                "Błąd usuwania klienta: " +
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
            "Błąd połączenia podczas usuwania klienta."
        );

    }

}

/* ----- CLI.14. loadClientCRMProfile (oryginalna linia 3637) ----- */
async function loadClientCRMProfile(phone) {
    const response = await crmExtendedPost("getClientCRMProfile", { phone: phone });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się pobrać profilu klienta");
    }
    return response.profile;
}

/* ----- CLI.15. saveClientBookingMode (oryginalna linia 3645) ----- */
async function saveClientBookingMode(phone, mode, reason) {
    const response = await crmExtendedPost("setClientBookingMode", {
        phone: phone,
        mode: mode,
        reason: reason || "",
        changedBy: "MISTRZYNI"
    });
    if (!response || !response.success) {
        throw new Error(response && response.error ? response.error : "Nie udało się zmienić trybu rezerwacji");
    }
    await loadClients();
    return response;
}

/* ----- CLI.16. crmVisitClient (oryginalna linia 6494) ----- */
function crmVisitClient(item) {
    if (item?.eventType === "block") return "Blokada";
    if (item?.eventType === "external") return "Google Calendar";
    return String(item?.name || "Klient");
}
