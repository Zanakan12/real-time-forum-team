
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
    fetchAllUsers(JSON.parse(users));
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
    checkProfileImage(user, li);
    if (user === username.username) li.style.setProperty("--before-content", '"Vous"');
    else li.style.setProperty("--before-content", `"${user}"`);
    usersList.appendChild(li);
  });
}

export async function fetchAllUsers(connectedUsers) {
  try {
    const response = await fetch("https://localhost:8080/api/last-messages");
    if (!response.ok) throw new Error("Erreur lors du fetch");

    const users = await response.json();
    const currentUser = await fetchUserData();

    const usersOfflineList = document.getElementById("users-offline");

    console.log(users)

    usersOfflineList.innerHTML = "";

    users
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


            console.log(connectedUsers,users);
            li.classList.add("offline");
            usersOfflineList.appendChild(li);
        


      });


  } catch (err) {
    console.error("Erreur lors du fetch last messages :", err);
  }
}