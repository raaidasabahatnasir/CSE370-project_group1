-- Database: garment_factory_safety
CREATE DATABASE IF NOT EXISTS garment_factory_safety;
USE garment_factory_safety;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: floors
CREATE TABLE IF NOT EXISTS floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    capacity INT NOT NULL,
    current_workers INT DEFAULT 0
);

-- Table: workers
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    floor_id INT,
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (floor_id) REFERENCES floors(id)
);

-- Table: incidents
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_id INT,
    type VARCHAR(100),
    severity VARCHAR(50),
    description TEXT,
    incident_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (floor_id) REFERENCES floors(id)
);

-- Seed Data for Floors
INSERT INTO floors (name, department, capacity, current_workers) VALUES 
('Ground Floor', 'Cutting Department', 5, 0),
('First Floor', 'Sewing Department', 5, 0),
('Second Floor', 'Finishing Department', 5, 0),
('Third Floor', 'Packaging & Storage', 5, 0);

-- Seed Default Admin (Password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@factory.com', '$2b$10$Vk5nA.nGJjU398gdFgWuQu.B9mUKE0H7O9G4/aumtxYDMtvNyTRPS', 'Admin');



