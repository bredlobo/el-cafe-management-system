package models

import (
	"time"
	"gorm.io/gorm"
)
type Order struct {
	gorm.Model
	TableNumber string  `json:"table_number"`
	Items       string  `json:"items"` 
	Total       float64 `json:"total"`
	Status      string  `json:"status"`
	StartTime   *time.Time `json:"start_time"` 
	EndTime     *time.Time `json:"end_time"` 
}

type Member struct {
    PhoneNumber string    `gorm:"primaryKey;type:varchar(15)" json:"phone_number"`
    FullName    string    `gorm:"type:varchar(100);not null" json:"full_name"`
    PhotoURL    string    `gorm:"type:text" json:"photo_url"`
    ExpiredAt   time.Time `gorm:"type:datetime" json:"expired_at"`
    CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type User struct {
    Username string `gorm:"primaryKey;type:varchar(50)" json:"username"`
    Password string `gorm:"type:varchar(100);not null" json:"password"`
    Role     string `gorm:"type:varchar(20);not null" json:"role"`
}