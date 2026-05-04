package main

import (
	"el-cafe-backend/config"
	"el-cafe-backend/models"
	"el-cafe-backend/routes"
)

func main() {
	// 1. Koneksi ke Database MySQL
	config.ConnectDatabase()

	// 2. Sinkronisasi Tabel (AutoMigrate)
	config.DB.AutoMigrate(&models.Order{})

	// 3. Jalankan Server di Port 8080
	r := routes.SetupRouter()
	r.Run(":8080")
}