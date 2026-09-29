/* =========================================================
   AEGIS DASHBOARD ENGINE

   DATA SOURCE:
   aegisLatestWellness
   aegisWellnessHistory

   NO EXTERNAL DATA
   NO POWER BI
   NO SERVER
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

function getStoredData(key) {

    try {

        const value = localStorage.getItem(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "AEGIS local data error:",
            error
        );

        return null;
    }
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function number(value, fallback = 0) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : fallback;
}


/* =========================================================
   LOAD WELLNESS DATA
========================================================= */

function loadWellnessData() {

    const latest =
        getStoredData("aegisLatestWellness");

    let history =
        getStoredData("aegisWellnessHistory");


    if (!Array.isArray(history)) {
        history = [];
    }


    return {
        latest,
        history
    };
}


/* =========================================================
   NORMALIZE WELLNESS OBJECT
========================================================= */

function normalizeWellness(data) {

    if (!data || typeof data !== "object") {
        return null;
    }


    return {

        sleep: clamp(
            number(data.sleep),
            0,
            10
        ),

        energy: clamp(
            number(data.energy),
            0,
            10
        ),

        fatigue: clamp(
            number(data.fatigue),
            0,
            10
        ),

        mood: clamp(
            number(data.mood),
            0,
            10
        ),

        stress: clamp(
            number(data.stress),
            0,
            10
        ),

        duty:
            data.duty ||
            data.dutyStatus ||
            "Not specified",

        notes:
            data.notes ||
            data.note ||
            "",

        timestamp:
            data.timestamp ||
            data.date ||
            data.createdAt ||
            null
    };
}


/* =========================================================
   WELLNESS SCORE
   SAME CORE LOGIC AS WELLNESS PAGE
========================================================= */

function calculateWellness(data) {

    return Math.round(

        (
            data.sleep +
            data.energy +
            (10 - data.fatigue) +
            data.mood +
            (10 - data.stress)
        ) * 2

    );
}


/* =========================================================
   STRESS INDEX

   Higher number = more stress
========================================================= */

function calculateStress(data) {

    return Math.round(

        (
            (data.stress * 0.65) +
            ((10 - data.mood) * 0.20) +
            ((10 - data.energy) * 0.15)
        ) * 10

    );
}


/* =========================================================
   HEALTH READINESS

   IMPORTANT:
   This is NOT medical health data.

   It is a wellness-derived readiness indicator.
========================================================= */

function calculateHealthReadiness(data) {

    return Math.round(

        (
            data.sleep * 0.40 +
            data.energy * 0.30 +
            (10 - data.fatigue) * 0.30
        ) * 10

    );
}


/* =========================================================
   MENTAL WELLNESS

   Derived only from wellness inputs.
========================================================= */

function calculateMentalWellness(data) {

    return Math.round(

        (
            data.mood * 0.45 +
            (10 - data.stress) * 0.30 +
            data.energy * 0.15 +
            data.sleep * 0.10
        ) * 10

    );
}


/* =========================================================
   RECOVERY
========================================================= */

function calculateRecovery(data) {

    return Math.round(

        (
            data.sleep * 0.30 +
            data.energy * 0.25 +
            data.mood * 0.20 +
            (10 - data.fatigue) * 0.15 +
            (10 - data.stress) * 0.10
        ) * 10

    );
}


/* =========================================================
   STATUS HELPERS
========================================================= */

function wellnessStatus(score) {

    if (score >= 80) {
        return "STABLE / READY";
    }

    if (score >= 60) {
        return "MONITOR / MODERATE";
    }

    return "ATTENTION REQUIRED";
}


function stressStatus(score) {

    if (score < 30) {
        return "LOW";
    }

    if (score < 60) {
        return "MODERATE";
    }

    return "ELEVATED";
}


function healthStatus(score) {

    if (score >= 80) {
        return "GOOD READINESS";
    }

    if (score >= 60) {
        return "MONITOR";
    }

    return "LOW READINESS";
}


function mentalStatus(score) {

    if (score >= 80) {
        return "STABLE";
    }

    if (score >= 60) {
        return "MONITOR";
    }

    return "NEEDS ATTENTION";
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "Not recorded";
    }


    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }


    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   UPDATE METRIC CARD
========================================================= */

function updateMetric(
    valueId,
    statusId,
    score,
    status
) {

    const value =
        document.getElementById(valueId);

    const label =
        document.getElementById(statusId);


    if (value) {
        value.textContent = score;
    }

    if (label) {
        label.textContent = status;
    }
}


/* =========================================================
   UPDATE BAR
========================================================= */

function updateBar(
    valueId,
    barId,
    value,
    maximum = 10
) {

    const valueElement =
        document.getElementById(valueId);

    const bar =
        document.getElementById(barId);


    if (valueElement) {

        valueElement.textContent =
            `${value}/10`;
    }


    if (bar) {

        const percentage =
            clamp(
                (value / maximum) * 100,
                0,
                100
            );

        bar.style.width =
            `${percentage}%`;
    }
}


/* =========================================================
   RENDER CURRENT DATA
========================================================= */

function renderCurrentDashboard(data) {

    const wellness =
        calculateWellness(data);

    const stress =
        calculateStress(data);

    const health =
        calculateHealthReadiness(data);

    const mental =
        calculateMentalWellness(data);


    /* METRIC CARDS */

    updateMetric(
        "wellnessScore",
        "wellnessStatus",
        wellness,
        wellnessStatus(wellness)
    );


    updateMetric(
        "stressScore",
        "stressStatus",
        stress,
        stressStatus(stress)
    );


    updateMetric(
        "healthScore",
        "healthStatus",
        health,
        healthStatus(health)
    );


    updateMetric(
        "mentalScore",
        "mentalStatus",
        mental,
        mentalStatus(mental)
    );


    /* CURRENT WELLNESS */

    updateBar(
        "sleepValue",
        "sleepBar",
        data.sleep
    );


    updateBar(
        "energyValue",
        "energyBar",
        data.energy
    );


    updateBar(
        "fatigueValue",
        "fatigueBar",
        data.fatigue
    );


    updateBar(
        "moodValue",
        "moodBar",
        data.mood
    );


    updateBar(
        "checkStressValue",
        "stressBar",
        data.stress
    );


    /* OVERVIEW */

    setOverview(
        "overviewWellness",
        "overviewWellnessBar",
        wellness
    );


    setOverview(
        "overviewStress",
        "overviewStressBar",
        100 - stress
    );


    setOverview(
        "overviewHealth",
        "overviewHealthBar",
        health
    );


    setOverview(
        "overviewMental",
        "overviewMentalBar",
        mental
    );


    /* CHECK-IN INFORMATION */

    const dateElement =
        document.getElementById("checkDate");

    const dutyElement =
        document.getElementById("dutyStatus");

    const statusElement =
        document.getElementById("latestStatus");

    const noteElement =
        document.getElementById("latestNote");


    if (dateElement) {

        dateElement.textContent =
            formatDate(data.timestamp);
    }


    if (dutyElement) {

        dutyElement.textContent =
            data.duty;
    }


    if (statusElement) {

        statusElement.textContent =
            wellnessStatus(wellness);
    }


    if (noteElement) {

        noteElement.textContent =
            data.notes ||
            "No observation was added during the latest check-in.";
    }
}


/* =========================================================
   OVERVIEW
========================================================= */

function setOverview(
    valueId,
    barId,
    score
) {

    const value =
        document.getElementById(valueId);

    const bar =
        document.getElementById(barId);


    const safeScore =
        clamp(
            Math.round(score),
            0,
            100
        );


    if (value) {
        value.textContent =
            safeScore;
    }


    if (bar) {
        bar.style.width =
            `${safeScore}%`;
    }
}


/* =========================================================
   SVG TREND CHART
========================================================= */

function drawTrendChart(history) {

    const svg =
        document.getElementById(
            "wellnessChart"
        );

    const empty =
        document.getElementById(
            "chartEmpty"
        );


    if (!svg) {
        return;
    }


    svg.innerHTML = "";


    if (!Array.isArray(history) ||
        history.length === 0) {

        svg.style.display = "none";

        if (empty) {
            empty.style.display = "block";
        }

        return;
    }


    svg.style.display = "block";

    if (empty) {
        empty.style.display = "none";
    }


    const width = 900;
    const height = 300;

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    const entries =
        history
            .map(normalizeWellness)
            .filter(Boolean)
            .slice(-30);


    if (!entries.length) {
        return;
    }


    const values =
        entries.map(calculateWellness);


    const points =
        values.map(
            (value, index) => {

                const x =
                    paddingLeft +
                    (
                        entries.length === 1
                            ? chartWidth / 2
                            : (
                                index /
                                (entries.length - 1)
                            ) * chartWidth
                    );

                const y =
                    paddingTop +
                    chartHeight -
                    (
                        clamp(value, 0, 100) /
                        100
                    ) *
                    chartHeight;


                return {
                    x,
                    y,
                    value
                };
            }
        );


    /* GRID LINES */

    [0, 25, 50, 75, 100]
        .forEach(level => {

            const y =
                paddingTop +
                chartHeight -
                (
                    level / 100
                ) *
                chartHeight;


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );

            line.setAttribute(
                "x1",
                paddingLeft
            );

            line.setAttribute(
                "x2",
                width - paddingRight
            );

            line.setAttribute(
                "y1",
                y
            );

            line.setAttribute(
                "y2",
                y
            );

            line.setAttribute(
                "stroke",
                "#E5EBE5"
            );

            line.setAttribute(
                "stroke-width",
                "1"
            );

            svg.appendChild(line);


            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );

            text.setAttribute(
                "x",
                8
            );

            text.setAttribute(
                "y",
                y + 4
            );

            text.setAttribute(
                "fill",
                "#87928B"
            );

            text.setAttribute(
                "font-size",
                "10"
            );

            text.textContent =
                level;

            svg.appendChild(text);
        });


    /* AREA */

    let areaPath =
        `M ${points[0].x} ${height - paddingBottom}`;

    points.forEach(point => {

        areaPath +=
            ` L ${point.x} ${point.y}`;
    });

    areaPath +=
        ` L ${points[points.length - 1].x} ${height - paddingBottom} Z`;


    const area =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

    area.setAttribute(
        "d",
        areaPath
    );

    area.setAttribute(
        "fill",
        "#EAF0E8"
    );

    svg.appendChild(area);


    /* LINE */

    let linePath =
        `M ${points[0].x} ${points[0].y}`;


    points.slice(1)
        .forEach(point => {

            linePath +=
                ` L ${point.x} ${point.y}`;
        });


    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

    line.setAttribute(
        "d",
        linePath
    );

    line.setAttribute(
        "fill",
        "none"
    );

    line.setAttribute(
        "stroke",
        "#78927A"
    );

    line.setAttribute(
        "stroke-width",
        "4"
    );

    line.setAttribute(
        "stroke-linecap",
        "round"
    );

    line.setAttribute(
        "stroke-linejoin",
        "round"
    );

    svg.appendChild(line);


    /* POINTS */

    points.forEach(point => {

        const circle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        circle.setAttribute(
            "cx",
            point.x
        );

        circle.setAttribute(
            "cy",
            point.y
        );

        circle.setAttribute(
            "r",
            "5"
        );

        circle.setAttribute(
            "fill",
            "#FFFFFF"
        );

        circle.setAttribute(
            "stroke",
            "#78927A"
        );

        circle.setAttribute(
            "stroke-width",
            "3"
        );


        const title =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "title"
            );

        title.textContent =
            `Wellness: ${point.value}/100`;

        circle.appendChild(title);

        svg.appendChild(circle);
    });
}


/* =========================================================
   NO DATA STATE
========================================================= */

function showNoDataState() {

    const ids = [

        "wellnessScore",
        "stressScore",
        "healthScore",
        "mentalScore"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = "--";
        }
    });


    const statusIds = [

        "wellnessStatus",
        "stressStatus",
        "healthStatus",
        "mentalStatus"

    ];


    statusIds.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                "NO DATA";
        }
    });


    const note =
        document.getElementById(
            "latestNote"
        );

    if (note) {

        note.textContent =
            "No wellness check-in has been completed yet.";
    }


    drawTrendChart([]);
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeDashboard() {

    const {
        latest,
        history
    } = loadWellnessData();


    const normalizedLatest =
        normalizeWellness(latest);


    const normalizedHistory =
        Array.isArray(history)
            ? history
                .map(normalizeWellness)
                .filter(Boolean)
            : [];


    if (!normalizedLatest) {

        showNoDataState();

        return;
    }


    renderCurrentDashboard(
        normalizedLatest
    );


    drawTrendChart(
        normalizedHistory
    );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);