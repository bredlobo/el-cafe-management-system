package controllers

import (
	"el-cafe-backend/_config"
	"el-cafe-backend/_models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Ambil semua data pesanan untuk Dashboard
func GetOrders(c *gin.Context) {
	var orders []models.Order
	// Mengambil data dari DB menggunakan GORM
	if err := config.DB.Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// Tambah pesanan baru (dari Kasir/Pengunjung)
func CreateOrder(c *gin.Context) {
	var input models.Order
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesanan"})
		return
	}
	c.JSON(http.StatusCreated, input)
}

// Taruh di bagian bawah file order_controller.go
func UpdateStatusOrder(c *gin.Context) {
    id := c.Param("id") // Mengambil ID dari URL
    var order models.Order

    // Cari data di database berdasarkan ID
    if err := config.DB.First(&order, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Pesanan tidak ditemukan"})
        return
    }

    // Update field status menjadi 'completed'
    config.DB.Model(&order).Update("status", "completed")

    c.JSON(200, gin.H{"message": "Pesanan berhasil diselesaikan", "data": order})
}

func UpdateStatusProcessed(c *gin.Context) {
    id := c.Param("id")
    var order models.Order

    if err := config.DB.First(&order, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Pesanan tidak ditemukan"})
        return
    }

    // Mengubah status menjadi 'processed' (diproses)
    config.DB.Model(&order).Update("status", "processed")

    c.JSON(200, gin.H{"message": "Pembayaran diterima, pesanan diproses", "data": order})
}

// 1. Fungsi saat Kasir menerima uang (Uang masuk, makanan disiapkan)
func UpdateStatusPaid(c *gin.Context) {
    id := c.Param("id")
    var order models.Order
    if err := config.DB.First(&order, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Pesanan tidak ditemukan"})
        return
    }
    config.DB.Model(&order).Update("status", "paid")
    c.JSON(200, gin.H{"message": "Pembayaran diterima, pesanan disiapkan", "data": order})
}

// 2. Fungsi saat makanan diantar ke meja
func UpdateStatusServed(c *gin.Context) {
    id := c.Param("id")
    var order models.Order
    if err := config.DB.First(&order, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Pesanan tidak ditemukan"})
        return
    }
    config.DB.Model(&order).Update("status", "served")
    c.JSON(200, gin.H{"message": "Pesanan diantar ke meja", "data": order})
}

// Fungsi membatalkan pesanan (Ubah status jadi 'cancelled')
func UpdateStatusCancelled(c *gin.Context) {
    id := c.Param("id")
    var order models.Order

    if err := config.DB.First(&order, id).Error; err != nil {
        c.JSON(404, gin.H{"error": "Pesanan tidak ditemukan"})
        return
    }

    // Ubah status jadi cancelled, bukan dihapus
    config.DB.Model(&order).Update("status", "cancelled")

    c.JSON(200, gin.H{"message": "Pesanan berhasil dibatalkan", "data": order})
}

func CheckAvailability(c *gin.Context) {
    table := c.Query("table_number")
    startStr := c.Query("start") // Contoh: 2026-05-04 20:00:00
    endStr := c.Query("end")     // Contoh: 2026-05-04 21:00:00

    var count int64
    // Cek apakah ada order di meja yang sama, status tidak batal, dan waktunya bertabrakan
    config.DB.Model(&models.Order{}).
        Where("table_number = ? AND status != 'cancelled'", table).
        Where("start_time < ? AND end_time > ?", endStr, startStr).
        Count(&count)

    if count > 0 {
        c.JSON(200, gin.H{"available": false, "message": "Meja sudah dipesan pada jam tersebut"})
    } else {
        c.JSON(200, gin.H{"available": true})
    }
}