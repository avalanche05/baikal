package main

import (
	"log"
	"os"

	_ "baikal/backend/docs"
	"baikal/backend/internal/handler"
	"baikal/backend/internal/middleware"
	"baikal/backend/internal/model"
	"baikal/backend/pkg/config"
	"baikal/backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"
)

// @title           Baikal API
// @version         1.0
// @description     API сервер для проекта Baikal
// @host           localhost:8080
// @BasePath       /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Инициализация логгера
	logger, err := logger.NewLogger()
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// Инициализация базы данных
	db, err := config.NewDatabase()
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// Миграция базы данных
	if err := db.AutoMigrate(&model.User{}); err != nil {
		logger.Fatal("Failed to migrate database", zap.Error(err))
	}

	// Инициализация Gin
	router := gin.Default()

	// Инициализация обработчиков
	authHandler := handler.NewAuthHandler(db)

	// Роуты для аутентификации
	auth := router.Group("/api/v1/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Защищенные роуты
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", authHandler.Profile)
	}

	// Swagger
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}
