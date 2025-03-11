export function renderLikesDislikesCom(comment) {
    return `
        <tr>
            <td>
                <button class="like-button" data-comment-id="${comment.id}" data-type="like">
                    ${comment.likesCount}
                    <img src="/static/assets/img/like.png" alt="Like" style="width: 20px; height: 20px; vertical-align: middle;">
                </button>
                <button class="dislike-button" data-comment-id="${comment.id}" data-type="dislike">
                    ${comment.dislikesCount}
                    <img src="/static/assets/img/dislike.png" alt="Dislike" style="width: 20px; height: 20px; vertical-align: middle;">
                </button>
            </td>
            <td colspan="2">
                <hr width="100%">
            </td>
        </tr>
    `;
}

document.addEventListener("click", function(event) {
    if (event.target.closest(".like-button, .dislike-button")) {
        const button = event.target.closest("button");
        const commentId = button.dataset.commentId;
        const type = button.dataset.type;
        
        fetch("/likes-dislikes-validation", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `comment_id=${commentId}&like_dislike=${type}`
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  button.innerHTML = `${data.count} <img src="/static/assets/img/${type}.png" alt="${type}">`;
              }
          });
    }
});
