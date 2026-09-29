/*

AEGIS AUTHENTICATION GUARD

Include this file on every protected AEGIS page.

Example:

<script src="auth-guard.js"></script>

The guard:

Checks whether an AEGIS account exists
Checks whether a valid session exists
Redirects unauthenticated users to login.html
Maintains session activity
Provides logout functionality
Provides access to the current user profile

=========================================================
*/

(function () {

"use strict";


/* -----------------------------------------------------
   STORAGE KEYS
   ----------------------------------------------------- */

const ACCOUNT_KEY = "aegisLocalAccount";
const SESSION_KEY = "aegisSession";


/* -----------------------------------------------------
   CONFIGURATION
   ----------------------------------------------------- */

/*
 * Session timeout:
 *
 * 30 minutes of inactivity.
 *
 * You can change this later.
 */

const SESSION_TIMEOUT = 30 * 60 * 1000;


/* -----------------------------------------------------
   READ ACCOUNT
   ----------------------------------------------------- */

function getAccount() {

    const raw =
        localStorage.getItem(ACCOUNT_KEY);

    if (!raw) {
        return null;
    }

    try {

        return JSON.parse(raw);

    } catch (error) {

        return null;

    }

}


/* -----------------------------------------------------
   READ SESSION
   ----------------------------------------------------- */

function getSession() {

    const raw =
        sessionStorage.getItem(SESSION_KEY);

    if (!raw) {
        return null;
    }

    try {

        return JSON.parse(raw);

    } catch (error) {

        return null;

    }

}


/* -----------------------------------------------------
   SAVE SESSION
   ----------------------------------------------------- */

function saveSession(session) {

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );

}


/* -----------------------------------------------------
   CLEAR SESSION
   ----------------------------------------------------- */

function clearSession() {

    sessionStorage.removeItem(
        SESSION_KEY
    );

}


/* -----------------------------------------------------
   REDIRECT TO LOGIN
   ----------------------------------------------------- */

function redirectToLogin(reason) {

    clearSession();

    /*
     * Don't create redirect loops if we're already
     * on the authentication page.
     */

    if (
        window.location.pathname
            .toLowerCase()
            .endsWith("login.html")
    ) {

        return;

    }


    /*
     * Store the reason so login.html can optionally
     * display an appropriate message later.
     */

    if (reason) {

        sessionStorage.setItem(
            "aegisAuthMessage",
            reason
        );

    }


    window.location.replace(
        "login.html"
    );

}


/* -----------------------------------------------------
   VALIDATE SESSION
   ----------------------------------------------------- */

function validateSession() {

    const account = getAccount();

    const session = getSession();


    /*
     * No local account.
     */

    if (!account) {

        redirectToLogin(
            "No AEGIS account was found on this device."
        );

        return false;

    }


    /*
     * No active session.
     */

    if (!session) {

        redirectToLogin(
            "Please sign in to access AEGIS."
        );

        return false;

    }


    /*
     * Session must be authenticated.
     */

    if (session.authenticated !== true) {

        redirectToLogin(
            "Your AEGIS session is not valid."
        );

        return false;

    }


    /*
     * Verify that the session belongs to the
     * currently stored account.
     */

    if (
        session.personnelId !==
        account.personnelId
    ) {

        redirectToLogin(
            "Your AEGIS session could not be verified."
        );

        return false;

    }


    /*
     * Session timeout.
     */

    const lastActivity =
        Number(session.lastActivity || 0);

    const now = Date.now();


    if (
        !lastActivity ||
        now - lastActivity >
        SESSION_TIMEOUT
    ) {

        redirectToLogin(
            "Your AEGIS session expired due to inactivity."
        );

        return false;

    }


    /*
     * Refresh activity timestamp.
     */

    session.lastActivity = now;

    saveSession(session);


    return true;

}


/* -----------------------------------------------------
   UPDATE ACTIVITY
   ----------------------------------------------------- */

function updateActivity() {

    const session = getSession();

    if (!session) {
        return;
    }


    session.lastActivity =
        Date.now();

    saveSession(session);

}


/* -----------------------------------------------------
   LOGOUT
   ----------------------------------------------------- */

function logout() {

    clearSession();

    window.location.replace(
        "login.html"
    );

}


/* -----------------------------------------------------
   CURRENT USER
   ----------------------------------------------------- */

function getCurrentUser() {

    const account = getAccount();

    if (!account) {
        return null;
    }

    return account.profile || null;

}


/* -----------------------------------------------------
   SESSION INFORMATION
   ----------------------------------------------------- */

function getSessionInfo() {

    return getSession();

}


/* -----------------------------------------------------
   EXPOSE AEGIS AUTH API
   ----------------------------------------------------- */

window.AEGIS_AUTH = {

    isAuthenticated: validateSession,

    getCurrentUser,

    getSession: getSessionInfo,

    logout,

    updateActivity,

    sessionTimeout:
        SESSION_TIMEOUT

};


/* -----------------------------------------------------
   INITIAL PAGE PROTECTION
   ----------------------------------------------------- */

const authenticated =
    validateSession();


/*
 * If authentication failed, stop further execution.
 */

if (!authenticated) {
    return;
}


/* -----------------------------------------------------
   ACTIVITY TRACKING
   ----------------------------------------------------- */

let activityTimer = null;


function registerActivity() {

    clearTimeout(activityTimer);


    activityTimer =
        setTimeout(
            updateActivity,
            500
        );

}


[
    "click",
    "keydown",
    "mousemove",
    "scroll",
    "touchstart"
].forEach(eventName => {

    window.addEventListener(
        eventName,
        registerActivity,
        {
            passive: true
        }
    );

});


/* -----------------------------------------------------
   PERIODIC SESSION CHECK
   ----------------------------------------------------- */

setInterval(() => {

    validateSession();

}, 60 * 1000);

})();
