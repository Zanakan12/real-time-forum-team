export function ModeratorInterfacePage(moderatorRequests = []) {
    const div = document.createElement("div");
    div.innerHTML = `
        <h1>Moderator Interface</h1>
        <table border="1">
            <thead>
                <tr>
                    <th>Post ID</th>
                    <th>Title</th>
                    <th>Moderator Request</th>
                    <th>Admin Response</th>
                </tr>
            </thead>
            <tbody id="moderator-requests-body">
                ${moderatorRequests.length > 0 ? moderatorRequests.map(request => `
                    <tr>
                        <td>${request.PostID}</td>
                        <td>${request.Title}</td>
                        <td>${request.ModeratorRequest}</td>
                        <td>${request.AdminResponse?.Valid ? request.AdminResponse.String : "No Response Yet"}</td>
                    </tr>
                `).join("") : `
                    <tr>
                        <td colspan="4">No moderator requests available.</td>
                    </tr>
                `}
            </tbody>
        </table>
    `;

    return div;
}
