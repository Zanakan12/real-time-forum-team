package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
)

type LoginResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Récupérer le message d'erreur s'il existe
	errorMsg := r.URL.Query().Get("error")
	if errorMsg != "" {
		errorMsg, _ = url.QueryUnescape(errorMsg)
	}

	// Construire la réponse JSON
	response := LoginResponse{
		Error:   errorMsg,
		Message: "Veuillez entrer vos identifiants",
	}

	// Envoyer la réponse en JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
