package handlers

import (
	"db"
	"encoding/json"
	"fmt"
	"middlewares"
	"net/http"
	"strconv"
)

func LikesDislikesValidationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"success": false, "message": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		http.Error(w, `{"success": false, "message": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	postID, commentID, likeDislike := r.FormValue("post_id"), r.FormValue("comment_id"), r.FormValue("like_dislike")
	intPostID, intCommentID := -1, -1

	if postID == "" {
		intCommentID, _ = strconv.Atoi(commentID)
	} else {
		intPostID, _ = strconv.Atoi(postID)
	}

	isLike := likeDislike == "like"

	err := db.LikesInsert(session.UserID, intPostID, intCommentID, isLike)
	if err != nil {
		fmt.Printf("Error while creating a like/dislike: %v\n", err)
		response := Response{Success: false, Message: "Error processing like/dislike"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	
	newCount := 10 

	response := Response{Success: true, NewCount: newCount}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
