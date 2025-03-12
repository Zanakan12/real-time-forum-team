package db

import (
	"database/sql"
)

type User struct {
	ID        int
	Email     string
	Username  string
	Password  string
	Role      string
	CreatedAt string
}

type Post struct {
	ID            int
	UserID        int
	Title         string
	Body          string
	Status        string
	CreatedAt     string
	UpdatedAt     string
	User          User
	ImagePath     string
	Categories    []Category
	Comments      []Comment
	LikesDislikes []LikesDislikes
	LikesCount    int
	DislikesCount int
}

type Comment struct {
	ID            int
	PostID        int
	UserID        int
	Content       string
	CreatedAt     string
	UpdatedAt     string
	LikesDislikes []LikesDislikes
	Username      string
	LikesCount    int
	DislikesCount int
	PostTitle     string
}

type Category struct {
	ID   int
	Name string
}

type PostCategory struct {
	PostID     int
	CategoryId int
}

type LikesDislikes struct {
	ID        int
	UserID    int
	PostID    sql.NullInt64
	CommentID sql.NullInt64
	IsLike    bool
	CreatedAt string
	PostTitle string
	Username  string
}

type Images struct {
	ID        int
	PostID    int
	FilePath  string
	FileSize  int
	CreatedAt string
}

type Notification struct {
	ID            int64
	UserID        int64
	CommentID     sql.NullInt64
	LikeDislikeID sql.NullInt64
	IsRead        bool
	CreatedAt     string
}

type Activity struct {
	Type      string
	Content   string
	Timestamp string
}

type PostTendance struct {
	PostID int64
	Count  int
}
type ModeratorRequest struct {
	PostID           int
	Title            string
	ModeratorRequest string
	AdminResponse    sql.NullString
}

// Structure d'un message WebSocket
type WebSocketMessage struct {
	Type      string `json:"type"`       // "message" ou "user_list"
	Username  string `json:"username"`   // Expéditeur
	Recipient string `json:"recipient"`  // Destinataire
	Content   string `json:"content"`    // Contenu du message
	Read      bool   `json:"read"`       // Indique si le message a été lu
	CreatedAt string `json:"created_at"` // Timestamp
}
