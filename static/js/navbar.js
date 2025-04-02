

document.addEventListener("DOMContentLoaded", function () {
  const navHTML = `
        <nav id="nav">
    <div id="logo-container">
      <a href="/#home" id="logo-link">
        <img id="logo" src="/static/assets/img/4.png" width="100px" />
      </a>
    </div>
    <div id="site-name">
      <h2>mood.</h2>
    </div>
    <div id="nav-buttons">
      <button onclick="window.location.href='#profile'" class="hidden" id="profile-button">Profile</button>
      <button onclick="window.location.href='#notifications'" class="hidden" id="notifications-button">🔔</button>
      <button onclick="window.location.href='#login'" id="login-button">Login</button>
      <button onclick="window.location.href='#register'" id="register-button">Register</button>
      <button onclick="window.location.href='#mod'" class="hidden" id="moderator-panel-button">Moderator Panel</button>
      <button onclick="window.location.href='#admin'" class="hidden" id="admin-panel-button">Admin Panel</button>
      <button class="hidden" id="open-chat">💬 <span id="notification-messages" class="notication-messages">0</span></button>
      
      <button onclick="window.location.href='/logout'" class="hidden" id="logout-button">Logout</button>
    </div>
  </nav>
      `;

  const navContainer = document.getElementById("navstick");
  navContainer.innerHTML = navHTML;
});

export function showHiddenButton(userData) {
  const profileButton = document.getElementById("profile-button");
  const notificationsButton = document.getElementById("notifications-button");
  const moderatorPanelButton = document.getElementById("moderation-panel-button");
  const adminPanelButton = document.getElementById("admin-panel-button");
  const chatButton = document.getElementById("open-chat");
  const logoutButton = document.getElementById("logout-button");

  // ✅ Vérifie que userData existe et a une propriété "role"
  if (!userData || !userData.role) {
    console.error("❌ Erreur : userData est invalide !");
    return;
  }
  hide("login-button");
  hide("register-button");

  // ✅ Vérifie que chaque élément existe avant d'agir dessus
  if (userData.role === "admin") {
    if (adminPanelButton) adminPanelButton.classList.remove("hidden");
    if (moderatorPanelButton) moderatorPanelButton.classList.remove("hidden");
  } else if (userData.role === "moderator") {
    if (moderatorPanelButton) moderatorPanelButton.classList.remove("hidden");
  }

  if (chatButton) chatButton.classList.remove("hidden");
  if (logoutButton) logoutButton.classList.remove("hidden");
  if (profileButton) profileButton.classList.remove("hidden");
  //if (notificationsButton) notificationsButton.classList.remove("hidden");
}

export function hide(arg) {
  const element = document.getElementById(arg);
  element.classList.add("hidden")
}