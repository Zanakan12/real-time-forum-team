export function renderLikesDislikes(post) {
    return `
        <tr>
            <td colspan="2">
                <hr width="100%">
            </td>
            <td class="likesbuttons">
                <button class="like-button" data-post-id="${post.id}" data-type="like">
                    ${post.likesCount}
                    <img src="/static/assets/img/like.png" alt="Like" style="width: 15px; vertical-align: middle;">
                </button>
                <button class="dislike-button" data-post-id="${post.id}" data-type="dislike">
                    ${post.dislikesCount}
                    <img src="/static/assets/img/dislike.png" alt="Dislike" style="width: 15px; vertical-align: middle;">
                </button>
            </td>
        </tr>
    `;
}

document.addEventListener("click", function(event) {
    if (event.target.closest(".like-button, .dislike-button")) {
        const button = event.target.closest("button");
        const postId = button.dataset.postId;
        const type = button.dataset.type;
        
        fetch("/likes-dislikes-validation", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `post_id=${postId}&like_dislike=${type}`
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  button.innerHTML = `${data.count} <img src="/static/assets/img/${type}.png" alt="${type}">`;
              }
          });
    }
});