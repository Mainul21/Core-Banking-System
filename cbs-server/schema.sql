-- ========================================
-- CBS Project Schema for Neon PostgreSQL
-- ========================================

-- Use the public schema
SET search_path TO public;

-- ===============================
-- Users Table
-- ===============================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT
);

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('customer', 'employee', 'admin'));

-- ===============================
-- Branches Table
-- ===============================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- Admins Table
-- ===============================
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY,
    admin_id VARCHAR(20) UNIQUE NOT NULL,
    role_description TEXT,
    CONSTRAINT fk_admin_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- Employees Table
-- ===============================
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    branch_id INT REFERENCES branches(id),
    CONSTRAINT fk_employee_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- Customers Table
-- ===============================
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0,
    branch_id INT REFERENCES branches(id),
    CONSTRAINT fk_customer_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- Loans Table
-- ===============================
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL REFERENCES customers(account_number) ON DELETE CASCADE,
    requested_by VARCHAR(20) REFERENCES employees(employee_id) ON DELETE SET NULL,
    approved_by VARCHAR(20) REFERENCES admins(admin_id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL,
    term_months INT NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    monthly_due NUMERIC(15,2),
    penalty_rate NUMERIC(5,2) DEFAULT 0.20,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    purpose TEXT NOT NULL
);

ALTER TABLE loans
ADD CONSTRAINT loans_status_check
CHECK (status IN ('pending','approved','rejected','completed'));

ALTER TABLE loans
ADD CONSTRAINT loans_amount_check CHECK (amount > 0);

ALTER TABLE loans
ADD CONSTRAINT loans_term_months_check CHECK (term_months > 0);

ALTER TABLE loans
ADD CONSTRAINT loans_interest_rate_check CHECK (interest_rate >= 0);

ALTER TABLE loans
ADD CONSTRAINT loans_penalty_rate_check CHECK (penalty_rate >= 0);

-- ===============================
-- Loan Payments Table
-- ===============================
CREATE TABLE IF NOT EXISTS loan_payments (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    amount_due NUMERIC(15,2) NOT NULL,
    amount_paid NUMERIC(15,2),
    penalty NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'due'
);

ALTER TABLE loan_payments
ADD CONSTRAINT loan_payments_status_check
CHECK (status IN ('due','paid','late'));

-- ===============================
-- Transactions Table
-- ===============================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_number VARCHAR(20) REFERENCES customers(account_number) ON DELETE SET NULL
);

ALTER TABLE transactions
ADD CONSTRAINT transactions_amount_check CHECK (amount > 0);

ALTER TABLE transactions
ADD CONSTRAINT transactions_transaction_type_check
CHECK (transaction_type IN ('deposit','withdraw','withdrawal','transfer'));

-- ===============================
-- Fund Transfers Table
-- ===============================
CREATE TABLE IF NOT EXISTS fund_transfers (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    receiver_account_number VARCHAR(20) NOT NULL REFERENCES customers(account_number) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(20),
    approved_at TIMESTAMP,
    sender_account_number VARCHAR(20) REFERENCES customers(account_number) ON DELETE CASCADE
);

ALTER TABLE fund_transfers
ADD CONSTRAINT fund_transfers_amount_check CHECK (amount > 0);

ALTER TABLE fund_transfers
ADD CONSTRAINT fund_transfers_status_check
CHECK (status IN ('pending','approved','rejected'));

-- ===============================
-- Audit Logs Table
-- ===============================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);
