# Core Banking System

## Overview
This is a **Core Banking System** developed to demonstrate proficiency in the MERN stack (MongoDB, Express.js, React, Node.js) and knowledge of banking operations gained during an internship at City Bank PLC. The application supports core banking functionalities such as account opening, balance checking, transactions, and fund transfers, with role-based access for different user types.

## Features
- **User Roles**:
  - **Customer**: Can check account balance, make transactions, and transfer funds.
  - **Employee**: Can open accounts for customers and perform operations on their behalf.
  - **Admin**: Has full access to perform all operations within the application.
- **Core Operations**:
  - Account creation and management
  - Transaction processing
  - Fund transfers
- Additional features tailored to enhance user experience and operational efficiency.

## Tech Stack
- **Frontend**:
  - React.js
  - Tailwind CSS
  - Daisy UI
  - Vite (for fast development and build)
- **Backend**:
  - Node.js
  - Express.js
- **Database**:
  - PostgreSQL
- **Styling**:
  - Tailwind CSS for responsive and modern UI design
  - Daisy UI for pre-built components

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mainul21/Core-Banking-System.git
   cd Core-Banking-System
   ```

2. **Install dependencies**:
   - For the backend:
     ```bash
     cd backend
     npm install
     ```
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Set up the database**:
   - Install PostgreSQL and create a database.
   - Update the database configuration in the backend with your PostgreSQL credentials (e.g., in a `.env` file):
     ```env
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASS=your_password
     DB_NAME=core_banking
     ```

4. **Run the application**:
   - Start the backend server:
     ```bash
     cd backend
     npm start
     ```
   - Start the frontend:
     ```bash
     cd frontend
     npm run dev
     ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Usage
- **Customer**: Log in to view account details, check balances, and initiate transactions or fund transfers.
- **Employee**: Log in to create new customer accounts and manage customer-related operations.
- **Admin**: Log in to access all features, including user management and system-wide operations.

## Live Demo
**Live Link**: https://core-banking-system-850t.onrender.com

## Deployment
**Frontend** is deployed using render static site and **Backend** is deployed as render static service. **Database** is managed with Neon

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or feedback, please reach out via [GitHub Issues](https://github.com/Mainul21/Core-Banking-System/issues).

---

© 2025 Mainul21