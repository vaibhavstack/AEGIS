/* =====================================
   AEGIS FRONTEND
   Main interaction controller
===================================== */


/* -------------------------------------
   MISSION BRIEF
------------------------------------- */

function openBrief() {

    const modal = document.getElementById("briefModal");

    modal.classList.add("active");

}


function closeBrief() {

    const modal = document.getElementById("briefModal");

    modal.classList.remove("active");

}


/* -------------------------------------
   ENTER SYSTEM
------------------------------------- */

function enterSystem() {

    document
        .querySelector(".modules-section")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* -------------------------------------
   MODULE NAVIGATION
------------------------------------- */

function openModule(module) {

    const moduleNames = {

        dashboard: "Command Dashboard",

        wellness: "Daily Wellness Check-In",

        stress: "AI Stress & Fatigue Monitor",

        health: "Health Screening",

        family: "Family Connection",

        mental: "Mental Wellness"

    };


    const selectedModule = moduleNames[module];


    alert(
        selectedModule +
        "\n\nModule interface will be connected here."
    );

}


/* -------------------------------------
   CLOSE MODAL WITH ESC
------------------------------------- */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeBrief();

        }

    }
);


/* -------------------------------------
   CLOSE MODAL WHEN CLICKING OUTSIDE
------------------------------------- */

document
    .getElementById("briefModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target === this
            ) {

                closeBrief();

            }

        }
    );