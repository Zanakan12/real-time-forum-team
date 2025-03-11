document.addEventListener("DOMContentLoaded", function () {
  const navContainer = document.getElementById("navstick");

  if (!navContainer) return; // Vérification pour éviter une erreur si l'élément n'existe pas

  const table = document.createElement("table");
  table.id = "nav";

  const tr = document.createElement("tr");

  const navItems = [
    {
      id: "logo-container",
      html: `<a href="/" id="logo-link"><img id="logo" src="/static/assets/img/4.png" width="100px" /></a>`,
    },
    { id: "site-name", html: `<h2>mood.</h2>` },
    { id: "spacer", html: "" },
    {
      id: "profile-button",
      html: `<button onclick="window.location.href='/#profile'">Profile</button>`,
    },
    {
      id: "notifications-button",
      html: `<button onclick="window.location.href='/#notifications'">🔔</button>`,
    },
    {
      id: "login-button",
      html: `<button onclick="window.location.href='/#login'">Login</button>`,
    },
    {
      id: "register-button",
      html: `<button onclick="window.location.href='/#register'">Register</button>`,
    },
    {
      id: "moderator-panel-button",
      html: `<button onclick="window.location.href='/#mod'">Moderator Panel</button>`,
    },
    {
      id: "admin-panel-button",
      html: `<button onclick="window.location.href='/#admin'">Admin Panel</button>`,
    },
    { id: "chat-button", html: `<button id="open-chat">chat 💬</button>` },
    {
      id: "logout-button",
      html: `<button onclick="window.location.href='/logout'">Logout</button>`,
    },
  ];

  navItems.forEach((item) => {
    const td = document.createElement("td");
    td.id = item.id;
    td.innerHTML = item.html;
    tr.appendChild(td);
  });

  table.appendChild(tr);
  navContainer.appendChild(table);
});
