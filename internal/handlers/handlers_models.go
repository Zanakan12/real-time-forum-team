package handlers

import (
	"db"
)

// One structure for each page.
type RegisterPage struct {
	Title             string
	Register          RegisterTmpl
	NotificationCount int
	UserRole          string
	CurrentPage       string
}

// One structure for each template.
type RegisterTmpl struct {
	Message       string
	EmailLabel    string
	UsernameLabel string
	PasswordLabel string
	Error         string
}

type IndexPage struct {
	Title             string
	NewPost           NewPostTmpl
	Moods             []db.Category
	MostRecentPosts   []db.Post
	UserID            int
	UserUsername      string
	UserRole          string
	NotificationCount int
	CurrentPage       string
	ErrorMsgs         string
}

// Because each time we need the register template we need the same infos.
var RegisterData RegisterTmpl = RegisterTmpl{
	Message:       "Please register",
	EmailLabel:    "Email: ",
	UsernameLabel: "Username: ",
	PasswordLabel: "Password: ",
}

type LoginPage struct {
	Title             string
	Login             LoginTmpl
	Moods             []db.Category
	NotificationCount int
	UserRole          string
	CurrentPage       string
}

type LoginTmpl struct {
	Message       string
	EmailLabel    string
	PasswordLabel string
	Error         string
}

var LoginData LoginTmpl = LoginTmpl{
	Message:       "Please login",
	EmailLabel:    "Email: ",
	PasswordLabel: "Password: ",
}

type NewPostTmpl struct {
	Message string
}

var NewPostData NewPostTmpl = NewPostTmpl{
	Message: ",tell us a story...",
}

type Link struct {
	Label string
	Href  string
}
