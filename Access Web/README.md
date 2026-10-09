# 🏢 Simple Broken Access Control Demo

A straightforward and clear web project demonstrating **Broken Access Control (OWASP Top 10 - A01)**.

---

## 🔑 Login Credentials

The application includes **3 Employees** and **1 Admin**:

| Role | Employee ID | Password | Name |
|---|---|---|---|
| Employee 1 | `emp1` | `password123` | John Doe |
| Employee 2 | `emp2` | `password123` | Sarah Smith |
| Employee 3 | `emp3` | `password123` | Alex Johnson |
| **Admin** | `admin` | `adminpass` | Super Admin |

---

## 🚀 How to Run

1. Open a terminal in this folder and start the server:
   ```bash
   node server.js
   ```
2. Open your browser and go to:
   ```
   http://localhost:3000
   ```

---

## 🎯 How to Test the Vulnerabilities

### 1. Horizontal Broken Access Control (IDOR via URL)
1. Log in with Employee 1 (`emp1` / `password123`).
2. You will land on:
   ```
   http://localhost:3000/profile?id=emp1
   ```
3. Change the URL in your browser's address bar to:
   ```
   http://localhost:3000/profile?id=emp2
   ```
   or
   ```
   http://localhost:3000/profile?id=emp3
   ```
   or
   ```
   http://localhost:3000/profile?id=admin
   ```
4. **Result:** You can view other employees' and the admin's confidential salary, phone number, SSN, and HR notes because the server doesn't check if the logged-in user owns that profile ID!

---

### 2. Vertical Broken Access Control (Admin Page Access via URL)
1. Log in as any regular employee (e.g. `emp1`).
2. Type the admin URL directly into your browser's address bar:
   ```
   http://localhost:3000/admin
   ```
3. **Result:** You are able to access the Admin Dashboard, see everyone's salary list, and view the system database secret key even though you are not an administrator!
