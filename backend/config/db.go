package config

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Ganti sesuai kredensial MySQL lokal kamu
	username := "root"
	password := ""
	host := "127.0.0.1"
	port := "3306"
	dbName := "el_cafe_db"

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", 
		username, password, host, port, dbName)
	
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("Gagal terhubung ke database!")
	}

	DB = database
	fmt.Println("Koneksi Database Berhasil!")
}