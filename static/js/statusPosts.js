export function renderStatusPosts(post) {
    return `
        <form method="POST" action="/moderator">
            <table>
                <tr>
                    <td><label for="status">Status:</label></td>
                    <td>
                        <select id="status" name="status" required>
                            <option value="published" ${post.status === "published" ? "selected" : ""}>Published</option>
                            <option value="draft" ${post.status === "draft" ? "selected" : ""}>Draft</option>
                            <option value="pending" ${post.status === "pending" ? "selected" : ""}>Pending</option>
                            <option value="irrelevant" ${post.status === "irrelevant" ? "selected" : ""}>Irrelevant</option>
                            <option value="obscene" ${post.status === "obscene" ? "selected" : ""}>Obscene</option>
                            <option value="illegal" ${post.status === "illegal" ? "selected" : ""}>Illegal</option>
                            <option value="insulting" ${post.status === "insulting" ? "selected" : ""}>Insulting</option>
                        </select>
                    </td>
                    <td><input type="submit" value="Update"></td>
                </tr>
            </table>
            <input type="hidden" name="post_id" value="${post.id}">
            <input type="hidden" name="title" value="${post.title}">
        </form>
    `;
}