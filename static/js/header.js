function headerPage() {
    const header = document.querySelector("header"); // Récupère le header existant
    header.innerHTML = ""; // Vide le contenu actuel

    // Création du titre
    const title = document.createElement("h1");
    title.textContent = "Real_time_forum";
    header.appendChild(title);

    // Espacement entre le titre et le menu
    const spacer = document.createElement("div");
    spacer.style.flexGrow = "1";
    header.appendChild(spacer);

    // Création de la navigation
    const nav = document.createElement("nav");
    const ul = document.createElement("ul");

    const links = [
        {href: "#home", text:"Accueil"},
        {href: "#register", text:"Register"},
        { href: "#login", text: "Login" },  
        { href: "#about", text: "À propos" },  
        { href: "#contact", text: "Contact" }
    ];

    links.forEach(linkData => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = linkData.href;
        a.textContent = linkData.text;
        li.appendChild(a);
        ul.appendChild(li);
    });

    nav.appendChild(ul);
    header.appendChild(nav);
}

document.addEventListener("DOMContentLoaded", headerPage);
