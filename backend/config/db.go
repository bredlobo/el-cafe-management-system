package config

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// 1. Masukkan data dari dashboard TiDB Cloud tadi
	username := "3vUPjF1Am6a3JYE.root"
	password := "1iYnXUCWWJ4zfj0J"
	host     := "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
	port     := "4000"
	database := "test"

	// 2. Format DSN khusus TiDB Cloud (Wajib ada ?tls=true)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=true",
		username, password, host, port, database)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		// Jika gagal, terminal akan memberi tahu alasannya
		fmt.Printf("Gagal koneksi ke TiDB Cloud: %v\n", err)
		panic(err)
	}

	DB = db
	fmt.Println("Koneksi Berhasil! Data EL CAFÉ sekarang tersimpan di Cloud Singapore.")
}