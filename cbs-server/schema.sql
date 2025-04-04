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

--Added name column to users table
ALTER TABLE users
ADD COLUMN name VARCHAR(255);

-- Added phone number and address columns to customers table
ALTER TABLE users
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN address TEXT;

-- Transactions table with FK reference to users(both customers and employees)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- makking accoumt_number unique in customers table
ALTER TABLE customers ADD CONSTRAINT unique_account_number UNIQUE (account_number);

-- adding account_number to transactions table
ALTER TABLE transactions 
ADD COLUMN account_number VARCHAR(20) REFERENCES customers(account_number) ON DELETE SET NULL;
ALTER TABLE transactions DROP CONSTRAINT transactions_transaction_type_check;

ALTER TABLE transactions ADD CONSTRAINT transactions_transaction_type_check 
CHECK (transaction_type IN ('deposit', 'withdraw'));
