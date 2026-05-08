package controllers

import (
	"el-cafe-backend/config"
	"el-cafe-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Fungsi untuk Login
func Login(c *gin.Context) {
    var input struct {
        Username string `json:"username"`
        Password string `json:"password"`
        Role     string `json:"role"` // Tambahkan field role di sini
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
        return
    }

    var user models.User
    // SEKARANG KITA CEK JUGA ROLE-NYA DI DATABASE
    if err := config.DB.Where("username = ? AND password = ? AND role = ?", input.Username, input.Password, input.Role).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Akun tidak ditemukan atau salah pilih Role (Kasir/Owner)!"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "role":     user.Role,
        "username": user.Username,
    })
}

// Fungsi ini yang mungkin bikin merah kalau belum ada atau salah ketik
func CreateUser(c *gin.Context) {
	var newUser models.User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	if err := config.DB.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User berhasil dibuat!"})
}

func GetUsers(c *gin.Context) {
    var users []models.User
    // Kita tarik semua data user dari database
    if err := config.DB.Find(&users).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data staff"})
        return
    }
    c.JSON(http.StatusOK, users)
}

func UpdateUserCredentials(c *gin.Context) {
    // Kita tangkap role mana yang mau diubah (kasir atau owner)
    role := c.Param("role") 
    
    var input struct {
        NewUsername string `json:"new_username"`
        NewPassword string `json:"new_password"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
        return
    }

    // Cari user berdasarkan rolenya dan update
    if err := config.DB.Model(&models.User{}).Where("role = ?", role).Updates(map[string]interface{}{
        "username": input.NewUsername,
        "password": input.NewPassword,
    }).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui akun"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Akun " + role + " berhasil diperbarui!"})
}