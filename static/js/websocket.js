
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
const FETCH_INTERVAL = 5000; // 5 secondes minimum entre chaque appel

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

    updateUserList(JSON.parse(users));
  } catch (error) {
    console.error("❌ Erreur lors du fetch :", error);
  }
}



// Mettre à jour la liste des utilisateurs connectés
async function updateUserList(users) {
  console.log("👥 Mise à jour de la liste des utilisateurs :", users);
  const usersList = document.getElementById("users-online");
  usersList.innerHTML = "";
  let username = await fetchUserData()
  if (!username) {
    return
  }
  users.forEach((user) => {
    const li = document.createElement("li");
    li.classList.add("selectUser", "online");
    li.id = `${user}`;
    li.style.backgroundImage =
      `url('/static/assets/img/${user}/profileImage.jpg')`
    if (user === username.username) li.style.setProperty("--before-content", '"Vous"');
    else li.style.setProperty("--before-content", `"${user}"`);
    usersList.appendChild(li);
  });
}
