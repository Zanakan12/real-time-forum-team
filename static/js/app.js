import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
////import { loadPosts } from "/static/js/posts.js"

//import { footerPage } from "/static/js/footer.js";
//import { headerPage } from "/static/js/header.js";

//import des pages d'erreurs

//les routes pour les éléments
const routes = {
  home: () => {
    const div = document.createElement("div");
    div.innerHTML = "<h2>Bienvenue sur le forum</h2>";
    return div;
  },
  register: RegisterPage,
  login: loginPage,

};

async function loadPage() {
    const hash = window.location.hash.substring(1) || "home";
    const page = routes[hash] ? routes[hash]() : routes["home"]();
    const app = document.getElementById("app");
    app.innerHTML = ""; // On vide le contenu actuel
    app.appendChild(page); // On affiche la nouvelle page.innerHTML = "<h2>Page introuvable</h2>";
    }




// ensemble des fonctions d'erreurs

// Écoute les changements d'URL
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
window.addEventListener("DOMContentLoaded", () => {});
//document.addEventListener("DOMContentLoaded", loadFooter);

//appel des fonction handleErreur en cas d'erreur détectée
