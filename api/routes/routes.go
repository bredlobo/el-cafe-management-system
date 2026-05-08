package routes

import (
    "el-cafe-backend/controllers" // Pastikan nama module sesuai dengan go.mod kamu
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
    // 1. PENGATURAN CORS EKSPLISIT (Dijamin lolos DELETE)
    r.Use(cors.New(cors.Config{
        AllowAllOrigins: true,
        AllowMethods:    []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:    []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
    }))

    // 2. GRUP RUTE YANG RAPI
    api := r.Group("/api")
    {
        api.GET("/orders", controllers.GetOrders)
        api.POST("/orders", controllers.CreateOrder)
        api.PUT("/orders/:id/complete", controllers.UpdateStatusOrder)
        api.PUT("/orders/:id/process", controllers.UpdateStatusProcessed)
        api.PUT("/orders/:id/pay", controllers.UpdateStatusPaid)
        api.PUT("/orders/:id/serve", controllers.UpdateStatusServed)
		api.PUT("/orders/:id/cancel", controllers.UpdateStatusCancelled)
        api.POST("/members", controllers.RegisterMember)
        api.GET("/members", controllers.GetMembers)
        api.GET("/members/:phone", controllers.GetMemberByPhone)
        api.POST("/login", controllers.Login)
        api.POST("/users", controllers.CreateUser)
        api.GET("/users", controllers.GetUsers)
        api.PUT("/users/update/:role", controllers.UpdateUserCredentials)
    }
}