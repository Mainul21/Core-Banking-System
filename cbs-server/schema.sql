CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'employee', 'admin')),  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table with FK reference
CREATE TABLE customers (
    id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00
);

-- Employees table with FK reference
CREATE TABLE employees (
    id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100)
);

-- Admins table with FK reference
CREATE TABLE admins (
    id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    admin_id VARCHAR(20) UNIQUE NOT NULL,
    role_description TEXT
);
