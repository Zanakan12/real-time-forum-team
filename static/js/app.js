import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
import { footerPage } from "/static/js/footer.js";
//import { headerPage } from "/static/js/header.js";

//import des pages d'erreurs 
import { erreur400 } from "/static/js/400.js";
import { erreur404 } from "/static/js/404.js";
import { erreur429 } from "/static/js/429.js";
import { erreur500 } from "/static/js/500.js";

//les routes pour les éléments 
const routes = {
    "home": () => {
        const div = document.createElement("div");
        div.innerHTML = "<h2>Bienvenue sur le forum</h2>";
        return div;
    },
    "register": RegisterPage,
    "login": loginPage,
};

function loadPage() {
    const hash = window.location.hash.substring(1) || "home"; // Récupère l'URL après #
    const page = routes[hash] ? routes[hash]() : routes["home"]();
    const app = document.getElementById("app");
    app.innerHTML = ""; // On vide le contenu actuel
    app.appendChild(page); // On affiche la nouvelle page
}

//fonction pour le footer
function loadFooter() {
    document.getElementById("footer-container").innerHTML = footerPage();
}
//fonction pour le header

// ensemble des fonctions d'erreurs
function handleErreur400() {
    document.body.innerHTML = erreur400();
}
function handleErreur404() {
    document.body.innerHTML = erreur404();
}
function handleErreur429() {
    document.body.innerHTML = erreur429();
}
function handleErreur500() {
    document.body.innerHTML = erreur500();
}

// Écoute les changements d'URL
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
document.addEventListener("DOMContentLoaded", loadFooter);


//appel des fonction handleErreur en cas d'erreur détectée
/*handleErreur400();
handleErreur404();
handleErreur429();
handleErreur500();*/