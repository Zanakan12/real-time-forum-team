export function RegisterPage() {
    const div = document.createElement("div");
    div.innerHTML = `
        <form id="register-form">
            <table class="post">
                <tr></tr>
                <tr>
                    <td><label for="first_name">First Name</label></td>
                    <td><input type="text" id="first_name" name="first_name" required></td>
                </tr>
                <tr>
                    <td><label for="last_name">Last Name</label></td>
                    <td><input type="text" id="last_name" name="last_name" required></td>
                </tr>
                <tr>
                    <td><label for="username">Username</label></td>
                    <td><input type="text" id="username" name="username" required></td>
                </tr>
                <tr>
                    <td><label for="email">Email</label></td>
                    <td><input type="email" id="email" name="email" required></td>
                </tr>
                <tr>
                    <td><label for="genre">Genre</label></td> 
                    <td>
                        <select id="genre" name="genre">
                            <option value="">-------------</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td><label for="password">Password</label></td>
                    <td><input type="password" id="password" name="password" required></td>
                </tr>
                <tr>
                    <td></td>
                    <td style="text-align: right;">
                        <input type="submit" value="Submit">
                    </td>
                </tr>
            </table>
            <p id="error-message" style="color: red;"></p>
        </form>
    `;

    const form = div.querySelector("#register-form");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch("/register-validation", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "/#login";
            } else {
                div.querySelector("#error-message").innerText = data.error;
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
            div.querySelector("#error-message").innerText = "Une erreur est survenue, veuillez réessayer.";
        }
    });

    return div;
}
