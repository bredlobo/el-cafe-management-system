package handler // Pastikan nama package-nya handler

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"el-cafe-backend/config" // SESUAIKAN: ganti 'el-cafe' dengan nama module di go.mod kamu
	"el-cafe-backend/routes"
)

// Handler adalah fungsi yang akan dipanggil Vercel setiap ada request masuk
func Handler(w http.ResponseWriter, r *http.Request) {
	// Pastikan database terkoneksi
	if config.DB == nil {
		config.ConnectDatabase()
	}

	// Buat instance Gin
	app := gin.New() // Pakai gin.New() agar lebih ringan di Vercel
	
	// Daftarkan routes kamu
	routes.SetupRoutes(app)

	// Perintahkan Gin untuk melayani request
	app.ServeHTTP(w, r)
}