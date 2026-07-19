/* ==========================================================
   NAIL-ART CRM DEV PANEL
   APP-DEV.JS
   ========================================================== */


/* ==========================================================
   STATE
   ========================================================== */

const themeState = {

    accent: "#b05c75",

    radius: 20,

    shadow: 0.05

};


/* ==========================================================
   INIT
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeDevPanel
);

function initializeDevPanel(){

    bindControls();

    updateDebug();

}


/* ==========================================================
   SIDEBAR
   ========================================================== */

function showSection(name){

    document
        .querySelectorAll(
            ".dev-content section"
        )
        .forEach(section=>{

            section.style.display =
                "none";

        });

    const section =
        document.getElementById(
            name + "-section"
        );

    if(section){

        section.style.display =
            "block";

    }

}


/* ==========================================================
   BIND EVENTS
   ========================================================== */

function bindControls(){

    const accent =
        document.getElementById(
            "accentColor"
        );

    const radius =
        document.getElementById(
            "radiusValue"
        );

    const shadow =
        document.getElementById(
            "shadowOpacity"
        );

    if(accent){

        accent.addEventListener(
            "input",
            e=>{

                themeState.accent =
                    e.target.value;

                applyTheme();

            }
        );

    }

    if(radius){

        radius.addEventListener(
            "input",
            e=>{

                themeState.radius =
                    Number(e.target.value);

                applyTheme();

            }
        );

    }

    if(shadow){

        shadow.addEventListener(
            "input",
            e=>{

                themeState.shadow =
                    Number(e.target.value);

                applyTheme();

            }
        );

    }

}


/* ==========================================================
   APPLY THEME
   ========================================================== */

function applyTheme(){

    document.documentElement
        .style
        .setProperty(
            "--accent",
            themeState.accent
        );

    document.documentElement
        .style
        .setProperty(
            "--radius",
            themeState.radius + "px"
        );

    document.documentElement
        .style
        .setProperty(

            "--shadow",

            `0 10px 35px rgba(
                0,
                0,
                0,
                ${themeState.shadow}
            )`

        );

    updateDebug();

}


/* ==========================================================
   PRESETS
   ========================================================== */

function loadPreset(type){

    switch(type){

        case "premium":

            themeState.accent =
                "#b05c75";

            themeState.radius =
                20;

            themeState.shadow =
                0.05;

            break;


        case "minimal":

            themeState.accent =
                "#5b6770";

            themeState.radius =
                8;

            themeState.shadow =
                0.02;

            break;


        case "glass":

            themeState.accent =
                "#9b59b6";

            themeState.radius =
                30;

            themeState.shadow =
                0.12;

            break;

    }

    syncControls();

    applyTheme();

}


/* ==========================================================
   SYNC UI
   ========================================================== */

function syncControls(){

    const accent =
        document.getElementById(
            "accentColor"
        );

    const radius =
        document.getElementById(
            "radiusValue"
        );

    const shadow =
        document.getElementById(
            "shadowOpacity"
        );

    if(accent){

        accent.value =
            themeState.accent;

    }

    if(radius){

        radius.value =
            themeState.radius;

    }

    if(shadow){

        shadow.value =
            themeState.shadow;

    }

}


/* ==========================================================
   EXPORT THEME
   ========================================================== */

function exportTheme(){

    const content =
        JSON.stringify(
            themeState,
            null,
            2
        );

    const blob =
        new Blob(
            [content],
            {
                type:
                "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "theme.json";

    link.click();

}


/* ==========================================================
   IMPORT THEME
   ========================================================== */

function importTheme(file){

    const reader =
        new FileReader();

    reader.onload =
        function(event){

            const data =
                JSON.parse(
                    event.target.result
                );

            themeState.accent =
                data.accent
                ||
                "#b05c75";

            themeState.radius =
                data.radius
                ||
                20;

            themeState.shadow =
                data.shadow
                ||
                0.05;

            syncControls();

            applyTheme();

        };

    reader.readAsText(file);

}


/* ==========================================================
   HARD RESET
   ========================================================== */

function resetTheme(){

    if(
        !confirm(
            "Przywrócić domyślny motyw?"
        )
    ){

        return;

    }

    loadPreset(
        "premium"
    );

}


/* ==========================================================
   DEBUG PANEL
   ========================================================== */

function updateDebug(){

    const output =
        document.getElementById(
            "debug-output"
        );

    if(!output){

        return;

    }

    output.textContent =

`Theme Debug

Accent:
${themeState.accent}

Radius:
${themeState.radius}px

Shadow:
${themeState.shadow}

Timestamp:
${new Date().toLocaleString()}
`;

}


/* ==========================================================
   AUTO REFRESH DEBUG
   ========================================================== */

setInterval(()=>{

    updateDebug();

},3000);
