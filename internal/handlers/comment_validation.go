package handlers

import (
	"db"
	"encoding/json"
	"log"
	"middlewares"
	"net/http"
	"strconv"
)

// Réponse standard pour les commentaires
type CommentResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

// Réponse pour récupérer les commentaires
type CommentListResponse struct {
	Success  bool        `json:"success"`
	Comments interface{} `json:"comments,omitempty"`
	Message  string      `json:"message,omitempty"`
}

// Gestion unique des commentaires (GET pour récupérer, POST pour ajouter)
func CommentsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json") // ✅ Assure toujours une réponse en JSON

	switch r.Method {
	case http.MethodPost:
		CommentValidationHandler(w, r)
	case http.MethodGet:
		GetCommentsHandler(w, r)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Method not allowed"})
	}
}

// ✅ Handler pour ajouter un commentaire (POST)
func CommentValidationHandler(w http.ResponseWriter, r *http.Request) {
	session := middlewares.GetCookie(w, r) // Vérifie l'authentification
	if session.Username == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Unauthorized access"})
		return
	}

	postID, content := r.FormValue("post_id"), r.FormValue("content")
	if postID == "" || content == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "post_id and content are required"})
		return
	}

	convPostID, err := strconv.Atoi(postID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Invalid post ID"})
		return
	}

	err = db.CommentInsert(session.UserID, convPostID, content)
	if err != nil {
		log.Printf("❌ Error while creating a comment: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Failed to create comment"})
		return
	}

	// Retourner les commentaires mis à jour après insertion
	comments, err := db.CommentSelectByPostID(convPostID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CommentResponse{Success: false, Message: "Error retrieving updated comments"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CommentListResponse{Success: true, Comments: comments})
}

// ✅ Handler pour récupérer les commentaires (GET)
func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
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
		log.Printf("❌ Error retrieving comments: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(CommentListResponse{Success: false, Message: "Error retrieving comments"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(CommentListResponse{Success: true, Comments: comments})
}
