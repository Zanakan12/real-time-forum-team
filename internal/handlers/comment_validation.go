package handlers

import (
	"db"
	"encoding/json"
	"fmt"
	"middlewares"
	"net/http"
	"strconv"
)

type CommentResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type CommentListResponse struct {
	Success  bool         `json:"success"`
	Comments []db.Comment `json:"comments"`
	Message  string       `json:"message,omitempty"`
}

func CommentValidationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Method not allowed"})
		return
	}

	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Unauthorized access"})
		return
	}

	postID, content := r.FormValue("post_id"), r.FormValue("content")
	convPostID, err := strconv.Atoi(postID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Invalid post ID"})
		return
	}

	err = db.CommentInsert(session.UserID, convPostID, content)
	if err != nil {
		fmt.Printf("Error while creating a comment: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Failed to create comment"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CommentResponse{Success: true, Message: "Comment added successfully"})
}

func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(CommentListResponse{Success: false, Message: "Method not allowed"})
		return
	}

	postID := r.URL.Query().Get("post_id")
	if postID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CommentListResponse{Success: false, Message: "Missing post_id parameter"})
		return
	}
	postIDInt, err := strconv.Atoi(postID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CommentListResponse{Success: false, Message: "Invalid post_id parameter"})
		return
	}

	comments, err := db.CommentSelectByPostID(postIDInt)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CommentListResponse{Success: false, Message: "Error retrieving comments"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CommentListResponse{Success: true, Comments: comments})
}
