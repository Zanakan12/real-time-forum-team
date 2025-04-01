
import { fetchConnectedUsers } from "/static/js/websocket.js";
import { fetchUserData } from "/static/js/app.js";
import { socket } from "/static/js/websocket.js";
import { checkProfileImage } from "/static/js/imagepath.js";
import { fetchAllUsers } from "/static/js/websocket.js";

export async function chatManager() {
  let recipientSelect;
  const user = await fetchUserData();

  const reduceBtn = document.getElementById("reduce-chat");
  const closeBtn = document.getElementById("close-chat");

  reduceBtn.addEventListener("click", () => {
    close("chat");
    const chat = document.getElementById("chat-messages");
    const bubbleBox = document.createElement("div");
    bubbleBox.id = "bubble-box";
    bubbleBox.classList.add("selectUser");
    chat.appendChild(bubbleBox);
    document.getElementById("bubble-box").addEventListener("click", (event) => {
      handleUserSelection(event);
      bubbleBox.remove();
    });
  });

  closeBtn.addEventListener("click", () => {
    close("chat");
  });

  // Fonction pour ouvrir la liste
  function open(arg) {
    const element = document.getElementById(arg);
    if (element.classList.contains("hidden")) {
      element.classList.remove("hidden"); // Ouvre la liste
      fetchAllUsers();

      fetchConnectedUsers();
      if (element.classList.contains("all-users")) updateUserList();
      if (element.classList.contains("chat")) fetchMessages(recipientSelect);

      console.log("Téléchargement des statuts des utilisateurs terminé !");
    } else {
      if (arg === "all-users") element.classList.add("hidden"); // Ferme la liste
    }
  }

  // Fonction pour fermer la liste
  function close(arg) {
    const element = document.getElementById(arg);
    element.classList.add("hidden");
  }

  const openChatBtn = document.getElementById("open-chat");
  // Gérer l'ouverture du chat
  if (openChatBtn) {
    // Gérer l'ouverture du chat
    openChatBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Empêche la fermeture immédiate

      const element = document.getElementById("all-users");
      if (!element) {
        console.error("❌ Erreur : #all-users introuvable !");
        return;
      }

      open("all-users");

      // Gérer la fermeture du chat en cliquant à l'extérieur
      document.addEventListener("click", (event) => {
        if (!element.contains(event.target) && event.target !== openChatBtn) {
          close("all-users");
        }
      });
    });
  } else {
    console.warn("⚠️ L'élément #open-chat est introuvable !");
  };

  document
    .getElementById("users-online")
    .addEventListener("click", handleUserSelection);

  document
    .getElementById("users-offline")
    .addEventListener("click", handleUserSelection);

  function handleUserSelection(event) {
    if (event.target.classList.contains("selectUser")) {
      if (event.target.id !== "bubble-box") recipientSelect = event.target.id;
      let isOnline = event.target.classList.contains("online");

      console.log(
        `Utilisateur sélectionné : ${recipientSelect}, En ligne : ${isOnline}`
      );

      // Envoyer l'ID au backend Go
      fetch(`/api/chat?recipient=${recipientSelect}`).catch((error) =>
        console.error("Erreur lors de la récupération des messages :", error)
      );
      const messagesList = document.getElementById("messages");
      messagesList.innerHTML = "";
      open("chat");
      manageHeader(recipientSelect);
      fetchMessages(recipientSelect);
      close("all-users");
    }
  }

  function manageHeader(recipient) {
    const recipientLabel = document.getElementById("name-chat");
    recipientLabel.textContent = `${recipient}`;

    const photochat = document.getElementById("photo-chat");
    checkProfileImage(recipient, photochat);
  }

  const messageInput = document.getElementById("message");
  document
    .getElementById("message")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        document.getElementById("send-msg-button").click();
      }
    });



  // input texte detection
  let typingTimer;
  const TYPING_DELAY = 100; // Délai avant d'envoyer "typing"

  messageInput.addEventListener("input", () => {
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      messageDetectInput();
    }, TYPING_DELAY);
  });

  function messageDetectInput() {
    if (socket.readyState === WebSocket.OPEN) {
      const typingObj = {
        type: "typing",
        username: user.username,
        recipient: recipientSelect,
      };

      socket.send(JSON.stringify(typingObj));
    } else {
      console.warn("WebSocket non connecté !");
    }
  }

  const sendMessageButton = document.getElementById("send-msg-button");
  sendMessageButton.addEventListener("click", () => sendMessage());

  // Envoi de message
  async function sendMessage() {
    const recipient = recipientSelect;
    const message = messageInput.value.trim();
    const date = new Date();


    if (!recipient || !message) {
      alert("Veuillez entrer un destinataire et un message !");
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      const msgObj = {
        type: "message",
        username: user.username,
        recipient: recipient,
        content: message,
        created_at: date,
      };

      socket.send(JSON.stringify(msgObj));
      appendMessage("", user.username, recipient, message, date, true); // Affichage immédiat
      messageInput.value = "";
    } else {
      alert("WebSocket non connecté !");
    }
  }


  let lastMessageDate = ""; // 🧠 Mémorise la dernière date affichée

  function appendMessage(type, sender, recipient, content, createdAt, isSender) {
    const messagesList = document.getElementById("messages");
    const li = document.createElement("li");

    // 🔒 Sécurité : conversion Date
    let dateString = "";
    let hourString = "";

    try {
      const parsed = new Date(createdAt);
      if (isNaN(parsed)) throw new Error("Invalid date");

      dateString = parsed.toISOString().split("T")[0];         // ex: "2025-03-28"
      hourString = parsed.toTimeString().substring(0, 5);       // ex: "13:23"
    } catch (e) {
      console.warn("Date invalide, fallback utilisée :", createdAt);
      const now = new Date();
      dateString = now.toISOString().split("T")[0];
      hourString = now.toTimeString().substring(0, 5);
    }

    // 🎯 Affichage de la date (si différente de la précédente)
    if (dateString !== lastMessageDate) {
      const dateSeparator = document.createElement("div");
      dateSeparator.classList.add("date-separator");

      const readableDate = new Date(dateString).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      dateSeparator.textContent = readableDate;
      messagesList.appendChild(dateSeparator);
      lastMessageDate = dateString;
    }

    // 👤 Style d'envoi
    isSender = sender === user.username;

    li.classList.add("message", isSender ? "sent" : "received");

    // 💬 Contenu avec l’heure à droite
    li.innerHTML = `
      <div class="bubble">
        <span class="text">${content}</span>
        <span class="time">${hourString}</span>
      </div>
    `;

    // 🟡 Gestion du "typing"
    let typingTimeout;
    if (type === "typing") {
      const checkTyping = document.getElementById("typing");
      if (!checkTyping) {
        li.id = "typing";
        li.innerHTML = `
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        `;
        messagesList.appendChild(li);
        scrollToBottom("messages");
      }

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        const typingElement = document.getElementById("typing");
        if (typingElement) typingElement.remove();
      }, 1000);
    } else {
      messagesList.appendChild(li);
    }

    // 🧭 Scroll auto si bas
    const isScrolledToBottom =
      messagesList.scrollHeight - messagesList.clientHeight <=
      messagesList.scrollTop + 1;

    if (isScrolledToBottom) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }



  function scrollToBottom(arg) {
    const chatBox = document.getElementById(arg);
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: "smooth",
    });
  }



  let limitMessage = 10; // Nombre de messages à charger
  let totalMessages = 0; // Stocke le nombre total de messages pour éviter des erreurs

  async function fetchMessages(recipientSelect) {
    if (!recipientSelect) return;
    lastMessageDate = ""; // ⬅️ important pour forcer l'affichage de la date au début

    const loader = document.getElementById("loader-messages");
    loader.classList.remove("hidden"); // 👈 Affiche le loader

    const startTime = Date.now(); // ⏱️ Temps de début

    try {
      const response = await fetch(
        `https://localhost:8080/api/chat?recipient=${recipientSelect}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      let messages = await response.json();
      messages = JSON.parse(messages);

      if (typeof messages === "object") {
        messages = Object.values(messages);
      }

      totalMessages = messages.length;

      if (limitMessage > totalMessages) {
        limitMessage = totalMessages;
      }

      const paginatedMessages = messages.slice(-limitMessage);

      const messagesList = document.getElementById("messages");

      const scrollPosition = messagesList.scrollHeight - messagesList.scrollTop;

      messagesList.innerHTML = ""; // Efface les anciens messages

      paginatedMessages.forEach((msg) => {
        let isSender = msg.username === user.username;
        appendMessage(msg.type, msg.username, msg.recipient, msg.content, msg.created_at, isSender);
      });

      messagesList.scrollTop = messagesList.scrollHeight - scrollPosition;

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des messages :", error);
    } finally {
      const elapsed = Date.now() - startTime;
      const MIN_DISPLAY_TIME = 600; // en ms, ajustable

      const remaining = MIN_DISPLAY_TIME - elapsed;
      if (remaining > 0) {
        setTimeout(() => {
          loader.classList.add("hidden");
        }, remaining);
      } else {
        loader.classList.add("hidden");
      }
    }
  }


  document.getElementById("messages").addEventListener("scroll", throttle(() => {
    const messagesList = document.getElementById("messages");

    if (messagesList.scrollTop === 0) {
      limitMessage += 10;
      fetchMessages(recipientSelect);
    }
  }, 10)); // Utilisation d’un throttle pour éviter le spam

  function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) return;
      lastCall = now;
      func(...args);
    };
  }


  //message reçu par le destinataire
  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      const notification = document.getElementById("notification-messages");
      const chat = document.getElementById("chat");
      let seen = chat && !chat.classList.contains("hidden");

      if (seen) {
        appendMessage(
          message.type,
          message.username,
          message.recipient,
          message.content,
          message.created_at,
          false
        );
      } else if (notification && message.type === "message") {
        let count = parseInt(notification.textContent || "0", 10);
        notification.textContent = count + 1;
        const notificationOnUserPhoto = document.getElementById(`${message.username}`);

        if (notificationOnUserPhoto) {
          let userNotifCount = parseInt(notificationOnUserPhoto.textContent || "0", 10);
          notificationOnUserPhoto.textContent = userNotifCount + 1;
        } else {
          console.error("L'élément de notification pour l'utilisateur n'existe pas !");
        }

      }
    } catch (error) {
      console.error("Erreur lors de la réception du message :", error);
    }
  });
}