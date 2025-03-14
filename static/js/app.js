import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
import { homePage } from "/static/js/home.js";
import { adminPanel } from "/static/js/admin.js";
import { profilePage } from "/static/js/profile.js";
////import { loadPosts } from "/static/js/posts.js"

//import { footerPage } from "/static/js/footer.js";
//import { headerPage } from "/static/js/header.js";

//import des pages d'erreurs

//les routes pour les éléments
const routes = {
  register: RegisterPage,
  login: loginPage,
  home: homePage,
  admin: adminPanel,
  profile: profilePage,
};

async function loadPage() {
  const hash = window.location.hash.substring(1) || "home";
  const app = document.getElementById("app");
  app.innerHTML = ""; // On vide le contenu actuel

  console.log("Changement de page vers :", hash);

  if (routes[hash]) {
    try {
      const page = await routes[hash](); // ✅ On attend la page asynchrone
      console.log("Page retournée :", page);

      if (page instanceof Node) {
        app.appendChild(page); // ✅ Ajout uniquement si c'est un élément DOM
      } else {
        throw new Error("Le module retourné n'est pas un élément DOM !");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la page :", error);
      app.innerHTML = "<h2>Erreur : Impossible de charger la page</h2>";
    }
  } else {
    console.warn("Route inconnue, affichage de la page d'accueil.");
    const homePage = await routes["home"]();
    app.appendChild(homePage);
  }
}

// ensemble des fonctions d'erreurs

// Écoute les changements d'URL
window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
window.addEventListener("DOMContentLoaded", () => {});
//document.addEventListener("DOMContentLoaded", loadFooter);

//appel des fonction handleErreur en cas d'erreur détectée
