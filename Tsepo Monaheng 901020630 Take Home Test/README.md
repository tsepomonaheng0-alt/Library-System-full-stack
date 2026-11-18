# Library Desk

Library management app: React (Vite) frontend + Express API + MySQL.

## 1. Database
```
mysql -u root -p < backend/schema.sql
```

## 2. Backend
```
cd backend
cp .env.example .env      # then fill in your MySQL password and a JWT secret
npm install
npm run seed              # creates sample books and two accounts
npm run dev               # http://localhost:4000
```
Seeded logins: `ADMIN001 / admin123` (admin), `MEM001 / member123` (member).

## 3. Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## API
| Route | Methods | Access |
|---|---|---|
| `/books` | GET, POST, PUT /:id, DELETE /:id | read: any user, write: admin |
| `/transactions` | GET, GET /:id, POST, PUT /:id (note), DELETE /:id (undo) | POST: any user (restock: admin) |
| `/users` | GET, POST, PUT /:id, DELETE /:id | admin |
| `/users/login` | POST | public |
