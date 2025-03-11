export function renderNewComment(post) {
    return `
        <form action="/comment-validation" method="post">
            <input type="hidden" name="post_id" value="${post.id}">
            <tr>
                <td><label for="content">Comment :</label></td>
                <td><input id="content" name="content" type="text" required></td>
                <td colspan="2"><input type="submit" value="Send"></td>
            </tr>
        </form>
    `;
}