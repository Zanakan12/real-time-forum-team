export function RegisterPage() {
    // Création du conteneur principal
    const div = document.createElement("div");
    div.innerHTML = `
   <form action="/register-validation" method="post">
    <table class="post">
        <tr></tr>
        <tr>
            <td></td>
            <td style="display: flex; justify-content: space-between;">
                <button onclick="window.location.href='/google-login'" style="background-color: rgb(37, 37, 37);">
                    <img src="/static/assets/img/google_logo.png" alt="" style="height: 2em;">
                </button>
                <button onclick="window.location.href='/reddit-login'" style="background-color: rgb(37, 37, 37);">
                    <img src="/static/assets/img/reddit_logo.png" alt="" style="height: 2em;">
                </button>
                <button onclick="window.location.href='/dis-login'" style="background-color: rgb(37, 37, 37);">
                    <img src="/static/assets/img/discord-logo.png" alt="" style="height: 2em;">
                </button>
            </td>
        </tr>
        <tr>
            <td><label for="first_name">first_name</label></td>
            <td><input type="first_name" id="first_name" first_name="first_name" required></td>
        </tr>
        <tr>
            <td><label for="last_name">last_name</label></td>
            <td><input type="last_name" id="last_name" name="last_name" required></td>
        </tr>
        <tr>
            <td><label for="username">username</label></td>
            <td><input type="text" id="username" name="username" required></td>
        </tr>
        <tr>
            <td><label for="email">email</label></td>
            <td><input type="email" id="email" name="email" required></td>
        </tr>
        <tr>
            <td><label for="genre">Genre</label></td> 
            <td><select id="genre" name="genre">
                <option value="">-------------</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select></td>
        </tr>
        <tr>
            <td><label for="password">password</label></td>
            <td><input type="password" id="password" name="password" required></td>
        </tr>
        <tr>
            <td></td>
            <td style="text-align: right;"><input type="submit" value="Submit"></td>
        </tr>
    </table>
</form>
    `;

    return div;
}
