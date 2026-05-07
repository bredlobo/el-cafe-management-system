package main

import (
	"el-cafe-backend/config"
	"el-cafe-backend/models"
	"el-cafe-backend/routes"
)

func main() {
	config.ConnectDatabase()

	// 2. Tambahkan models.User{} di sini
	config.DB.AutoMigrate(&models.Order{}, &models.Member{}, &models.User{})

	// SEEDING: Buat akun owner otomatis kalau DB kosong
	var count int64
	config.DB.Model(&models.User{}).Count(&count)
	if count == 0 {
    users := []models.User{
        {Username: "kasir", Password: "123", Role: "kasir"}, // Pakai "kasir" saja biar simpel
        {Username: "owner", Password: "999", Role: "owner"},
    }
    for _, u := range users {
        config.DB.Create(&u)
    }
}

	r := routes.SetupRouter()
	r.Static("/uploads", "./uploads")
	r.Run(":8080")
}