import { RegisterPage } from "/static/js/register.js";
import { loginPage } from "/static/js/login.js";
import { homePage } from "/static/js/home.js";
import { adminPanel } from "/static/js/admin.js";
import { profilePage } from "/static/js/profile.js";
import { showHiddenButton } from "/static/js/navbar.js";
import { connectWebSocket } from "/static/js/websocket.js";
import { fetchAndUpdatePosts } from "/static/js/lastposts.js";
import { LoadAllPost } from "/static/js/newPost.js";
import { chatManager } from "/static/js/chat.js";

//les routes pour les éléments
const routes = {
  register: RegisterPage,
  login: loginPage,
  home: homePage,
  admin: adminPanel,
  profile: profilePage,
};

// Vérifie si une connexion WebSocket existe déjà dans window
if (!window.socket || window.socket.readyState !== WebSocket.OPEN) {
  window.socket = null;
}

async function loadPage() {
  let redirection = "login";
  let hash = window.location.hash.substring(1) || redirection;
  console.log("Changement de page vers :", hash);

  const app = document.getElementById("app");
  app.innerHTML = ""; // ⚠️ S'assurer que l'ancien contenu est bien supprimé

  let userData = await fetchUserData();
  if (userData && userData.username) {

    if (hash === "login") hash = "home";
    showHiddenButton(userData);
    chatManager(userData);
    // Vérifier si le WebSocket est déjà connecté, sinon le connecter
    if (!window.socket || window.socket.readyState !== WebSocket.OPEN) {
      window.socket = connectWebSocket(userData.username);
      console.log("✅ WebSocket connecté !");
    } else {
      console.log("⚠️ WebSocket déjà actif, aucune nouvelle connexion.");
    }
  }

  if (routes[hash]) {
    try {
      const page = await routes[hash]();

      if (page instanceof Node) {
        app.innerHTML = "";
        app.appendChild(page);
        if (hash == "home") {
          LoadAllPost();
          fetchAndUpdatePosts();
        }
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
    app.innerHTML = "";
    app.appendChild(homePage);
  }
}


// Écoute les changements d'URL
window.addEventListener("hashchange", loadPage);

document.addEventListener("DOMContentLoaded", loadPage())

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