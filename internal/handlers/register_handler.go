package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// Récupérer le message d'erreur s'il existe
	errorMsg := r.URL.Query().Get("error")
	if errorMsg != "" {
		errorMsg, _ = url.QueryUnescape(errorMsg)
	}

	// Répondre avec un JSON contenant le message d'erreur (si existant)
	response := map[string]string{
		"error": errorMsg,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
