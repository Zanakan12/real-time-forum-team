
document.addEventListener("DOMContentLoaded", async () => {
  let socket;
  let username;
  let recipientSelect;
  let onlineUser;

  function checkChatElements() {
    const reduceBtn = document.getElementById("reduce-chat");
    const closeBtn = document.getElementById("close-chat");
    if (reduceBtn && closeBtn) {
      reduceBtn.addEventListener("click", () => {
        close("chat");
        const chat = document.getElementById("chat-messages");
        const bubbleBox = document.createElement("div");
        bubbleBox.id = "bubble-box";
        bubbleBox.classList.add("selectUser");
        chat.appendChild(bubbleBox);
        bubbleBox.addEventListener("click", (event) => {
          handleUserSelection(event);
          bubbleBox.remove();
        });
      });

      closeBtn.addEventListener("click", () => {
        close("chat");
      });
    } else {
      // Réessayer après 100ms
    }
  }
  checkChatElements();

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

  function checkChatButton() {
    const openChatBtn = document.getElementById("chat-messages");
    if (openChatBtn) {
      openChatBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const element = document.getElementById("all-users");
        open("all-users");

        // Gérer la fermeture du chat en cliquant à l'extérieur
        document.addEventListener("click", (event) => {
          if (!element.contains(event.target) && event.target !== openChatBtn) {
            close("all-users");
          }
        });
      });
    } else {
      console.warn(
        "⚠️ L'élément #open-chat n'existe pas encore, nouvelle tentative..."
      );
    }
  }
  checkChatButton();

  function checkUserLists() {
    const usersOnline = document.getElementById("users-online");
    const usersOffline = document.getElementById("users-offline");

    if (usersOnline && usersOffline) {
      usersOnline.addEventListener("click", handleUserSelection);
      usersOffline.addEventListener("click", handleUserSelection);
    } else {
      console.warn(
        "⚠️ Les éléments #users-online ou #users-offline n'existent pas encore, nouvelle tentative..."
      );
    }
  }
  checkUserLists();

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
    photochat.style.backgroundImage =
      "url('/static/assets/img/rafta74/profileImage.jpg')";
  }

  function checkMessageInput() {
    const messageInput = document.getElementById("message");
    const sendMessageButton = document.getElementById("send-msg-button");

    if (messageInput && sendMessageButton) {
      messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          sendMessageButton.click();
        }
      });
      console.log("✅ Événement 'keydown' ajouté à #message !");
    } else {
      console.warn(
        "⚠️ #message ou #send-msg-button n'existe pas encore, nouvelle tentative..."
      );
      // Réessaye après 100ms
    }
  }
  checkMessageInput();

  function checkMessagesContainer() {
    const messagesContainer = document.getElementById("messages");

    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", function () {
        if (this.scrollTop === 0) {
          // loadOlderMessages(); // Fonction pour récupérer les anciens messages
        }
      });
      console.log("✅ Événement 'scroll' ajouté à #messages !");
    } else {
      console.warn("⚠️ #messages n'existe pas encore, nouvelle tentative...");
    }
  }
  checkMessagesContainer();

  /*function loadOlderMessages() {
      const messagesList = document.getElementById("messages");
  
      for (let i = 0; i < 5; i++) {
        // Simulation de chargement de 5 anciens messages
        let oldMessage = document.createElement("li");
        oldMessage.textContent = "Ancien message " + (i + 1);
        oldMessage.classList.add("received");
        messagesList.prepend(oldMessage);
      }
    }*/

  function checkSendMessageButton() {
    const sendMessageButton = document.getElementById("send-msg-button");

    if (sendMessageButton) {
      sendMessageButton.addEventListener("click", () => sendMessage());
      console.log("✅ Événement 'click' ajouté à #send-msg-button !");
    } else {
      console.warn(
        "⚠️ #send-msg-button n'existe pas encore, nouvelle tentative..."
      );
      // Réessaye après 100ms
    }
  }
  checkSendMessageButton();

  // Récupérer les infos utilisateur
  async function fetchUserData() {
    try {
      const response = await fetch("https://localhost:8080/api/get-user");
      const data = await response.json();
      if (data.username) {
        username = data.username;
        connectWebSocket();
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur :",
        error
      );
      window.location.href = "/login";
    }
  }

  // Récupérer les anciens messages
  async function fetchMessages(recipientSelect) {
    if (recipientSelect === undefined) return;
    try {
      const response = await fetch(
        `https://localhost:8080/api/chat?recipient=${recipientSelect}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      let messages = await response.json();
      messages = JSON.parse(messages);

      if (!Array.isArray(messages)) {
        return console.warn("⚠️ Aucun message disponible.");
      }
      const messagesList = document.getElementById("messages");
      messagesList.innerHTML = "";
      messages.forEach((msg) => {
        let isSender = false;
        if (msg.username === username) {
          isSender = true;
        }
        appendMessage(
          msg.type,
          msg.username,
          msg.recipient,
          msg.content,
          msg.created_at,
          isSender
        );
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des messages :", error);
    }
  }

  // Récupérer la liste des utilisateurs connectés
  async function fetchConnectedUsers() {
    try {
      const response = await fetch("https://localhost:8080/api/users-connected");
      const users = await response.json();
      onlineUser = await JSON.parse(users);
      updateUserList(await JSON.parse(users));
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs connectés :",
        error
      );
    }
  }

  // input texte detection
  let typingTimer;

  function checkMessageInput() {
    const TYPING_DELAY = 100;
    const messageInput = document.getElementById("message");

    if (messageInput) {
      messageInput.addEventListener("input", () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          messageDetectInput();
        }, TYPING_DELAY);
      });
      console.log("✅ Événement 'input' ajouté à #message !");
    } else {
      console.warn("⚠️ #message n'existe pas encore, nouvelle tentative...");
      setTimeout(checkMessageInput, 100); // Réessaye après 100ms
    }
  }
  checkMessageInput();

  function messageDetectInput() {
    if (socket.readyState === WebSocket.OPEN) {
      const typingObj = {
        type: "typing",
        username: username,
        recipient: recipientSelect,
      };

      socket.send(JSON.stringify(typingObj));
      console.log("Typing envoyé :", typingObj);
    } else {
      console.warn("WebSocket non connecté !");
    }
  }

  // Connexion WebSocket
  function connectWebSocket() {
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

  // Envoi de message
  function sendMessage() {
    const messageInput = document.getElementById("message");
    const recipient = recipientSelect;
    const message = messageInput.value.trim();
    const date = new Date();
    const hour = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;

    if (!recipient || !message) {
      alert("Veuillez entrer un destinataire et un message !");
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      const msgObj = {
        type: "message",
        username: username,
        recipient: recipient,
        content: message,
        created_at: hour,
      };
      console.log(socket);
      socket.send(JSON.stringify(msgObj));
      appendMessage("", username, recipient, message, hour, true); // Affichage immédiat
      messageInput.value = "";
    } else {
      alert("WebSocket non connecté !");
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
      if (user === username) li.style.setProperty("--before-content", '"Vous"');
      else li.style.setProperty("--before-content", `"${user}"`);
      usersList.appendChild(li);
    });
  }

  // Ajouter un message dans le chat
  function appendMessage(
    type,
    username,
    recipient,
    content,
    createdAt,
    isSender
  ) {
    const messagesList = document.getElementById("messages");

    const li = document.createElement("li");

    li.classList.add("message");

    if (li.classList.contains("message")) {
      if (isSender) {
        li.classList.add("sent");
      } else {
        li.classList.add("received");
      }
    }

    let typingTimeout; // Variable pour stocker le timer

    if (type === "typing") {
      const checkTyping = document.getElementById("typing");

      if (!checkTyping) {
        // Si l'indicateur "typing" n'existe pas, on le crée
        li.id = "typing";
        li.innerHTML = `
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        `;
        messagesList.appendChild(li);
        scrollToBottom("messages");
      }

      // Réinitialiser le timer pour éviter une suppression prématurée
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        const typingElement = document.getElementById("typing");
        if (typingElement) typingElement.remove();
      }, 2000); // Disparaît après 2 secondes si aucune nouvelle frappe
    } else {
      // Cas normal : afficher le message
      li.innerHTML = `${content} <small>${createdAt}</small>`;
      messagesList.appendChild(li);
      scrollToBottom("messages");
    }

    // Vérifier si l'utilisateur est en bas avant de scroller
    let isScrolledToBottom =
      messagesList.scrollHeight - messagesList.clientHeight <=
      messagesList.scrollTop + 1;

    if (isScrolledToBottom) {
      messagesList.scrollTop = messagesList.scrollHeight; // Scroll en bas seulement si l'utilisateur est déjà en bas
    }
  }

  function scrollToBottom(arg) {
    const chatBox = document.getElementById(arg);
    chatBox.scrollTo({
      top: chatBox.scrollHeight,
      behavior: "smooth",
    });
  }

  async function fetchAllUsers() {
    try {
      const response = await fetch("https://localhost:8080/api/all-user");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      let filtredUser;
      const users = await response.json();
      console.log(users);

      filtredUser = users.sort((a, b) => a.username.localeCompare(b.username));

      // Affichage sur la page HTML (si nécessaire)
      const userList = document.getElementById("users-offline");
      userList.innerHTML = "";
      filtredUser.forEach((user) => {
        if (user.username !== username) {
          const li = document.createElement("li");
          li.classList.add("selectUser", "offline", "short");
          li.id = `${user.Username}`;
          li.style.setProperty("--before-content", `"${user.username}"`);
          userList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Erreur :", error);
    }
  }

  console.log("🚀 - Page chargée !");
});