package model

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `gorm:"-" json:"-"`
	UpdatedAt time.Time `gorm:"-" json:"-"`
	DeletedAt time.Time `gorm:"index" json:"-"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `json:"-"`
	Role      string    `gorm:"default:'user'" json:"role"`
	Name      string    `gorm:"not null" json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
