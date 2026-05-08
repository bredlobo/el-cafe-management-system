package controllers

import (
	"el-cafe-backend/_config"
	"el-cafe-backend/_models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// 1. DAFTAR MEMBER BARU (Input dari Kasir)
func RegisterMember(c *gin.Context) {
    // 1. Ambil data teks dari Form
    name := c.PostForm("full_name")
    phone := c.PostForm("phone_number")

    // 2. Ambil File Foto
    file, err := c.FormFile("photo")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Foto wajib diupload"})
        return
    }

    // 3. Tentukan lokasi simpan (uploads/nomorhp.jpg)
    filepath := "uploads/" + phone + ".jpg"
    if err := c.SaveUploadedFile(file, filepath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan foto"})
        return
    }

    // 4. Simpan ke Database
    newMember := models.Member{
        PhoneNumber: phone,
        FullName:    name,
        PhotoURL:    "http://localhost:8080/" + filepath, // Agar bisa diakses Frontend
        ExpiredAt:   time.Now().AddDate(0, 1, 0),
    }

    if err := config.DB.Create(&newMember).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Nomor HP sudah ada"})
        return
    }

    c.JSON(http.StatusCreated, newMember)
}

// 2. CEK MEMBER (Untuk Validasi Wajah di Kasir)
func GetMemberByPhone(c *gin.Context) {
	phone := c.Param("phone")
	var member models.Member

	if err := config.DB.Where("phone_number = ?", phone).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member tidak ditemukan"})
		return
	}

	// Cek apakah member masih aktif
	isExpired := time.Now().After(member.ExpiredAt)
	
	c.JSON(http.StatusOK, gin.H{
		"member":     member,
		"is_active":  !isExpired,
	})
}

// 3. AMBIL SEMUA MEMBER
func GetMembers(c *gin.Context) {
	var members []models.Member
	if err := config.DB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menarik data member"})
		return
	}
	c.JSON(http.StatusOK, members)
}