package handlers

import (
	"db"
	"encoding/json"
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

type CommentRequest struct {
	PostID  int    `json:"post_id"`
	Content string `json:"content"`
}

func CommentValidationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Vérifier la session utilisateur
	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		http.Error(w, "Unauthorized access", http.StatusUnauthorized)
		return
	}

	// Décoder le JSON
	var req CommentRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Insérer le commentaire dans la base de données
	err = db.CommentInsert(session.UserID, req.PostID, req.Content)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	// Récupérer les commentaires mis à jour
	comments, err := db.CommentSelectByPostID(req.PostID)
	if err != nil {
		http.Error(w, "Error retrieving updated comments", http.StatusInternalServerError)
		return
	}

	// Retourner la liste des commentaires
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(CommentListResponse{Success: true, Comments: comments})
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
