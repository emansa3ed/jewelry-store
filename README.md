# 💍 Jewelry Store Backend API

A comprehensive RESTful API built with Node.js, handling user authentication, product management, cart operations, orders, favorites, and category-based browsing for a jewelry store.

🛠️ Tech Stack
Node.js

Express.js

MongoDB

Mongoose

JWT (Authentication)

RESTful API Design
---

## 📦 Features

### 👤 User

- `POST /register` – Register a new user  
- `POST /login` – Login and receive authentication token  
- `GET /verify` – Verify user token  
- `GET /users` – Get all users  
- `GET /users/:id` – Get user profile  
- `DELETE /users/:id` – Delete user  

### ⭐ Favorite

- `GET /favorites/:userId` – Get user's favorite products  
- `POST /favorites/:userId/add/:productId` – Add product to favorites  
- `DELETE /favorites/:userId/remove/:productId` – Remove product from favorites  

### 📦 Product

- `POST /products` – Create new product  
- `GET /products` – Get all products  
- `GET /products/:id` – Get product by ID  
- `GET /products/search?name=...` – Search products by name  
- `GET /products/filter?price=...` – Filter products by price  
- `PUT /products/:id` – Update product  
- `DELETE /products/:id` – Delete product  
- `POST /products/validate` – Validate product input  
- `POST /products/validate-update` – Validate updated product input  

### 🏷️ Category

- `GET /categories` – Get all categories  
- `POST /categories` – Create a new category  
- `GET /categories/:name/products` – Get products by category name  
- `PUT /categories/:id` – Update category  
- `DELETE /categories/:id` – Delete category  

### 🛒 Cart

- `GET /cart/:userId` – Get user's cart  
- `POST /cart/:userId/add` – Add product to cart  
- `PUT /cart/:userId/update/:productId` – Update item quantity in cart  
- `DELETE /cart/:userId/remove/:productId` – Remove item from cart  
- `DELETE /cart/:userId/clear` – Clear cart  

### 📦 Order

- `POST /orders` – Create new order  
- `GET /orders` – Get all orders  
- `GET /orders/:id` – Get order by ID  
- `GET /orders/user/:userId` – Get all orders by a specific user  
- `DELETE /orders/:id` – Delete order  

---

## 🚀 Getting Started

### Prerequisites

- Node.js  
- MongoDB or your preferred database  
- npm or yarn  

### Installation

```bash
git clone https://github.com/emansa3ed/jewelry-store.git
cd jewelry-store
npm install



