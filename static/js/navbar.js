document.addEventListener("DOMContentLoaded", function () {
  const navHTML = `
        <table id="nav">
          <tr>
            <td id="logo-container">
              <a href="/" id="logo-link">
                <img id="logo" src="/static/assets/img/4.png" width="100px" />
              </a>
            </td>
            <td id="site-name">
              <h2>mood.</h2>
            </td>
            <td id="spacer"></td>
            <td id="profile-button">
              <button onclick="window.location.href='/profile'">Profile</button>
            </td>
            <td id="notifications-button">
              <button onclick="window.location.href='/notifications'">🔔</button>
            </td>
            <td id="login-button">
              <button onclick="window.location.href='/login'">Login</button>
            </td>
            <td id="register-button">
              <button onclick="window.location.href='/register'">Register</button>
            </td>
            <td id="moderator-panel-button">
              <button onclick="window.location.href='/mod'">Moderator Panel</button>
            </td>
            <td id="admin-panel-button">
              <button onclick="window.location.href='/admin'">Admin Panel</button>
            </td>
            <td id="chat-button">
              <button id="open-chat">chat 💬</button>
            </td>
            <td id="logout-button">
              <button onclick="window.location.href='/logout'">Logout</button>
            </td>
          </tr>
        </table>
      `;

  const navContainer = document.getElementById("navbar");
  navContainer.innerHTML = navHTML;
});
