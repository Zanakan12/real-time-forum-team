import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
import { homePage } from "/static/js/home.js";
import { adminPanel } from "/static/js/admin.js";
import { profilePage } from "/static/js/profile.js";
import { showHiddenButton } from "/static/js/navbar.js";

//les routes pour les éléments
const routes = {
  register: RegisterPage,
  login: loginPage,
  home: homePage,
  admin: adminPanel,
  profile: profilePage,
};

async function loadPage(input) {
  let redirection = input;
  if(!input){
    redirection="login"
  }
  
  const hash = window.location.hash.substring(1) || redirection;
  console.log(hash)
  const app = document.getElementById("app");
  app.innerHTML = ""; // On vide le contenu actuel
  let userData = await fetchUserData();
  if (userData.username) showHiddenButton(userData);

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

window.addEventListener("DOMContentLoaded", async () => {
  loadPage("login")
});

export async function fetchUserData() {
  try {
    const response = await fetch("https://localhost:8080/api/get-user");
    const data = await response.json();
    if (data) {
      return data
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'utilisateur :",
      error
    );
  }
}