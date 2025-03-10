import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
//import { footerPage } from "/static/js/footer.js";
//import { headerPage } from "/static/js/header.js";

//import des pages d'erreurs 

//les routes pour les éléments 
const routes = {
    "home": () => {
        const div = document.createElement("div");
        div.innerHTML = "<h2>Bienvenue sur le forum</h2>";
        return div;
    },
    "register": RegisterPage,
    "login": loginPage,
    "about": () => {
        const div = document.createElement("div");
        div.innerHTML = "<h2>À propos du forum</h2><p>Bienvenue dans notre forum en temps réel.</p>";
        return div;
    },
    "contact": () => {
        const div = document.createElement("div");
        div.innerHTML = "<h2>Contact</h2><p>Contactez-nous pour toute question.</p>";
        return div;
    }
};

function loadPage() {
    const hash = window.location.hash.substring(1) || "home"; // Récupère l'URL après #
    const page = routes[hash] ? routes[hash]() : routes["home"]();
    const app = document.getElementById("app");
    app.innerHTML = ""; // On vide le contenu actuel
    app.appendChild(page); // On affiche la nouvelle page
}

//fonction pour le footer
/*function loadFooter() {
    document.getElementById("footer-container").innerHTML = footerPage();
}*/
//fonction pour le header

// ensemble des fonctions d'erreurs

// Écoute les changements d'URL
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
window.addEventListener("DOMContentLoaded", ()  => {
    headerPage();
    footerPage();
});
//document.addEventListener("DOMContentLoaded", loadFooter);


//appel des fonction handleErreur en cas d'erreur détectée
