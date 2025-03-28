package server

import (
	"crypto/tls"
	"fmt"
	"middlewares"
	"net/http"
	"time"
)

// Middleware defines a function that takes an http.HandlerFunc and returns an http.HandlerFunc.
type Middleware func(http.HandlerFunc) http.HandlerFunc

// Route represents a route in the server.
type Route struct {
	Path    string
	Handler http.HandlerFunc
}

// Server represents our HTTP server.
type Server struct {
	port              string
	routes            []Route
	middlewares       []Middleware
	readTimeout       time.Duration
	writeTimeout      time.Duration
	idleTimeout       time.Duration
	readHeaderTimeout time.Duration
	maxHeaderBytes    int
	certFile          string
	keyFile           string
	TLSConfig         tls.Config
}

// NewServer creates a new instance of Server with specified configurations.
func NewServer(port, certFile, keyFile string, readTimeout, writeTimeout, idleTimeout, readHeaderTimeout time.Duration, maxHeaderBytes int) *Server {
	return &Server{
		port:              port,
		routes:            []Route{},
		middlewares:       []Middleware{},
		readTimeout:       readTimeout,
		writeTimeout:      writeTimeout,
		idleTimeout:       idleTimeout,
		readHeaderTimeout: readHeaderTimeout,
		maxHeaderBytes:    maxHeaderBytes,
		certFile:          certFile,
		keyFile:           keyFile,
	}
}

// Use adds a middleware to the server.
func (s *Server) Use(middleware Middleware) {
	s.middlewares = append(s.middlewares, middleware)
}

// Handle adds a route to the server.
func (s *Server) Handle(path string, handler http.HandlerFunc) {
	s.routes = append(s.routes, Route{Path: path, Handler: handler})
	middlewares.Paths = append(middlewares.Paths, path)
}

// Start launches the server on the specified port with the defined settings.
func (s *Server) Start() error {
	for _, route := range s.routes {
		handler := route.Handler
		if route.Path != "/429" {
			// Apply all middlewares to the handler
			for _, mw := range s.middlewares {
				handler = mw(handler)
			}
		}
		// Register the final handler with all middlewares applied
		http.HandleFunc(route.Path, handler)
	}

	tlsConfig := &tls.Config{
		MinVersion:               tls.VersionTLS12,
		CurvePreferences:         []tls.CurveID{tls.CurveP521, tls.CurveP384, tls.CurveP256},
		PreferServerCipherSuites: true,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA,
			tls.TLS_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_RSA_WITH_AES_256_CBC_SHA,
		},
	}

	server := &http.Server{
		Addr:              s.port,
		ReadTimeout:       s.readTimeout,
		WriteTimeout:      s.writeTimeout,
		IdleTimeout:       s.idleTimeout,
		ReadHeaderTimeout: s.readHeaderTimeout,
		MaxHeaderBytes:    s.maxHeaderBytes,
		TLSConfig:         tlsConfig,
	}
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	fmt.Printf("Starting HTTPS server on https://localhost%s\n", s.port)
	return server.ListenAndServeTLS(s.certFile, s.keyFile)
}
