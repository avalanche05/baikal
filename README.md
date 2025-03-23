# Baikal Backend

Backend сервер для проекта Baikal, написанный на Go с использованием Gin и Swagger.

## Требования

- Go 1.21 или выше
- PostgreSQL
- Docker и Docker Compose (опционально)

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/avalanche05/baikal.git
cd baikal
```

2. Установите зависимости:
```bash
cd backend
go mod download
```

3. Создайте файл .env на основе .env.example:
```bash
cp .env.example .env
```

4. Сгенерируйте Swagger документацию:
```bash
swag init -g cmd/api/main.go
```

## Запуск

### Без Docker

1. Убедитесь, что PostgreSQL запущен и доступен
2. Запустите сервер:
```bash
cd backend
go run cmd/api/main.go
```

### С Docker

```bash
docker-compose up --build
```

## API Документация

После запуска сервера, Swagger документация доступна по адресу:
http://localhost:8080/swagger/index.html

## Основные эндпоинты

- POST /api/v1/auth/register - Регистрация нового пользователя
- POST /api/v1/auth/login - Вход в систему
- GET /api/v1/profile - Получение профиля пользователя (требует авторизации) 