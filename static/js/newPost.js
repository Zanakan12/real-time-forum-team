import { Categories } from "./categories.js";

export function NewPost(moods, errorMsgs = "") {
    const form = document.createElement("form");
    form.action = "/post-validation";
    form.method = "post";
    form.enctype = "multipart/form-data";

    const table = document.createElement("table");
    
    if (errorMsgs) {
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="4">${errorMsgs}</td>`;
        table.appendChild(errorRow);
    }

    table.appendChild(Categories(moods));

    table.innerHTML += `
        <tr><td colspan="4"><hr width="100%"></td></tr>
        <tr>
            <td><label for="body">Post content:</label></td>
            <td colspan="2"><input id="body" name="body" type="text" required/></td>
        </tr>
        <tr>
            <td><label for="image">Select an image:</label></td>
            <td colspan="2"><input id="image" name="image" type="file" accept="image/*"/></td>
        </tr>
        <tr>
            <td colspan="4"><input type="submit" value="Submit" /></td>
        </tr>
    `;

    form.appendChild(table);
    return form;
}
