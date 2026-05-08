package handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"el-cafe-backend/config" 
	"el-cafe-backend/routes"
)

// Handler adalah entry point untuk Vercel Serverless
func Handler(w http.ResponseWriter, r *http.Request) {
	// Pastikan database terkoneksi (Singleton pattern)
	if config.DB == nil {
		config.ConnectDatabase()
	}

	// Gunakan mode release agar lebih ringan di Vercel
	gin.SetMode(gin.ReleaseMode)
	app := gin.New()
	
	// Daftarkan routes yang sudah kamu buat
	routes.SetupRoutes(app)

	// Biarkan Gin menangani request dari Vercel
	app.ServeHTTP(w, r)
}