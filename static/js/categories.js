export function Categories(moods) {
    const tableRow = document.createElement("tr");

    moods.forEach(mood => {
        const td = document.createElement("td");
        const label = document.createElement("label");
        
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "moods";
        input.id = "moods";
        input.value = mood.ID;
        
        const span = document.createElement("span");
        span.className = "mood";
        span.textContent = mood.Name;
        
        label.appendChild(input);
        label.appendChild(span);
        td.appendChild(label);
        tableRow.appendChild(td);
    });

    return tableRow;
}
