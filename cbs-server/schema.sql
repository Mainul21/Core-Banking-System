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

-- fund transfer table with FK reference to users(both customers and employees)
CREATE TABLE fund_transfers (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    receiver_account_number VARCHAR(20) NOT NULL REFERENCES customers(account_number) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP
);

ALTER TABLE fund_transfers
ADD COLUMN sender_account_number VARCHAR(20) REFERENCES customers(account_number) ON DELETE CASCADE;


-- audit_logs table to track changes in transactions and fund transfers
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,      -- e.g., 'loan', 'transaction', 'account'
  target_id UUID,                 -- optional if you want to link the affected row
  metadata JSONB DEFAULT '{}'::jsonb,  -- to store dynamic details like amount, status
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
-- Drop UUID columns
ALTER TABLE audit_logs DROP COLUMN id;
ALTER TABLE audit_logs DROP COLUMN target_id;

-- Add INTEGER columns instead
ALTER TABLE audit_logs ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE audit_logs ADD COLUMN target_id INTEGER;

-- (Assumes user_id is already changed to INTEGER as you did earlier)

