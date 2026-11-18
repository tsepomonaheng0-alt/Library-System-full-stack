CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30)  NOT NULL UNIQUE,
  role          ENUM('admin','member') NOT NULL DEFAULT 'member',
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(150) NOT NULL,
  genre      VARCHAR(80),
  isbn       VARCHAR(13)  NOT NULL UNIQUE,
  quantity   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity >= 0)
);

-- Every stock change is a row here: restock adds copies, borrow removes them, return adds them back.
CREATE TABLE IF NOT EXISTS transactions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NOT NULL,
  user_id    INT NULL,
  type       ENUM('restock','borrow','return') NOT NULL,
  quantity   INT NOT NULL,
  note       VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity > 0),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
