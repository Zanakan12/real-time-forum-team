
import { fetchUserData } from "/static/js/app.js";


// Connexion WebSocket
export async function connectWebSocket(username) {
  let socket
  console.log("fucking username",username)
  socket = new WebSocket(`wss://localhost:8080/ws?username=${username}`);

  socket.onopen = () => {
    console.log("✅ Connexion WebSocket établie !");
    fetchConnectedUsers();
  };

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data); // Convertir en objet JavaScript
      appendMessage(
        message.type,
        message.username,
        message.recipient,
        message.content,
        message.created_at,
        false
      );
      // Traiter le message comme nécessaire
    } catch (error) {
      console.error("Erreur lors de la réception du message :", error);
    }
  });
  socket.onclose = () => console.warn("⚠️ Connexion WebSocket fermée.");
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
function updateUserList(users) {
  console.log("👥 Mise à jour de la liste des utilisateurs :", users);
  const usersList = document.getElementById("users-online");
  usersList.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.classList.add("selectUser", "online");
    li.id = `${user}`;
    if (user === fetchUserData()) li.style.setProperty("--before-content", '"Vous"');
    else li.style.setProperty("--before-content", `"${user}"`);
    usersList.appendChild(li);
  });
}