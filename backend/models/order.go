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