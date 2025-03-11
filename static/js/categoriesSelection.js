import { Categories } from "./categories.js";

export function CategoriesSelection(moods) {
    const form = document.createElement("form");
    form.action = "/";
    form.method = "post";

    const table = document.createElement("table");
    
    table.innerHTML = `
        <tr><td colspan="4"><hr width="100%"></td></tr>
        <tr><td colspan="4" style="text-align: center;">You can filter last stories by moods:</td></tr>
    `;

    table.appendChild(Categories(moods));
    
    const submitRow = document.createElement("tr");
    const submitTd = document.createElement("td");
    submitTd.colSpan = 4;

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Let's blend this...";
    submitButton.id = "submit-button";

    submitTd.appendChild(submitButton);
    submitRow.appendChild(submitTd);
    table.appendChild(submitRow);

    table.innerHTML += '<tr><td colspan="4"><hr width="100%"></td></tr>';

    form.appendChild(table);
    return form;
}
