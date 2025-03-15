  // Connexion WebSocket
  export function connectWebSocket(username) {
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