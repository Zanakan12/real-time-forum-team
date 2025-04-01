
import { checkProfileImage } from "/static/js/imagepath.js";
import { fetchUserData } from "/static/js/app.js";
export let socket;

// Connexion WebSocket
export async function connectWebSocket(username) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket déjà connecté.");
    return;
  }

  socket = new WebSocket(`wss://localhost:8080/ws?username=${username}`);

  socket.onopen = () => {
    console.log("✅ Connexion WebSocket établie !");
    if (typeof fetchConnectedUsers === "function") {
      fetchConnectedUsers();
    }
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "user_list") {
        const users = JSON.parse(msg.content);
        updateUserList(users);
      } else if (msg.type === "message") {
        // Gère les messages normaux ici
      }
    } catch (error) {
      console.error("Erreur de parsing WebSocket :", error);
    }
  };

  socket.onclose = (event) => {
    console.warn("⚠️ Connexion WebSocket fermée.", event.reason);
    setTimeout(() => {
      console.log("🔄 Tentative de reconnexion...");
      connectWebSocket(username);
    }, 3000); // Tentative de reconnexion après 3 secondes
  };

  socket.onerror = (error) => {
    console.error("❌ Erreur WebSocket :", error);
    socket.close();
  };
}


let lastFetchTime = 0;
const FETCH_INTERVAL = 0; // 5 secondes minimum entre chaque appel

export async function fetchConnectedUsers() {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) {
    console.warn("⏳ Attente avant le prochain fetch...");
    return;
  }
  lastFetchTime = now;

  try {
    const response = await fetch("https://localhost:8080/api/users-connected");
    if (response.status === 429) {
      console.warn("⚠️ Trop de requêtes ! Attente...");
      return;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Réponse inattendue :", await response.text());
      return;
    }

    const users = await response.json();
    if (!users) return;

    fetchAllUsers(JSON.parse(users));
  } catch (error) {
    console.error("❌ Erreur lors du fetch :", error);
  }
}



export async function fetchAllUsers(connectedUsers = []) { // 👈 Par défaut, un tableau vide
  try {
    if (!Array.isArray(connectedUsers)) {
      console.error("❌ connectedUsers n'est pas un tableau :", connectedUsers);
      return;
    }

    const response = await fetch("https://localhost:8080/api/last-messages");
    if (!response.ok) throw new Error("Erreur lors du fetch");

    const allUsers = await response.json();
    const currentUser = await fetchUserData();

    const usersOfflineList = document.getElementById("users-offline");
    usersOfflineList.innerHTML = "";

    allUsers
      .filter((u) => u.username && u.username !== currentUser.username)
      .sort((a, b) => {
        if (!a.last_message) return 1;
        if (!b.last_message) return -1;
        return new Date(b.last_message) - new Date(a.last_message);
      })
      .forEach((user) => {
        const li = document.createElement("li");
        li.classList.add("selectUser", "short");
        li.id = user.username;

        checkProfileImage(user.username, li);
        li.style.setProperty("--before-content", `"${user.username}"`);

        // 🔑 Vérification des utilisateurs connectés
        if (connectedUsers.includes(user.username)) {
          li.classList.add("online");
        } else {
          li.classList.add("offline");
        }

        usersOfflineList.appendChild(li);
      });
  } catch (err) {
    console.error("Erreur lors du fetch last messages :", err);
  }
}
