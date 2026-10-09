const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Database of 3 Employees + 1 Admin
const users = {
  emp1: {
    id: 'emp1',
    password: 'password123',
    name: 'John Doe',
    role: 'employee',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    salary: '$60,000 / year',
    email: 'john.doe@company.com',
    phone: '+1-555-0101',
    ssn: '***-**-4411',
    privateNotes: 'Annual review completed: Meets expectations. Eligible for Q4 training program.'
  },
  emp2: {
    id: 'emp2',
    password: 'password123',
    name: 'Sarah Smith',
    role: 'employee',
    department: 'Sales',
    jobTitle: 'Senior Account Executive',
    salary: '$85,000 / year',
    email: 'sarah.smith@company.com',
    phone: '+1-555-0102',
    ssn: '***-**-8822',
    privateNotes: 'CONFIDENTIAL: Performance bonus of $12,000 approved. Scheduled for promotion to Team Lead.'
  },
  emp3: {
    id: 'emp3',
    password: 'password123',
    name: 'Alex Johnson',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Developer',
    salary: '$92,000 / year',
    email: 'alex.j@company.com',
    phone: '+1-555-0103',
    ssn: '***-**-9933',
    privateNotes: 'HR WARNING: Placed on probation for unauthorized database access attempt.'
  },
  admin: {
    id: 'admin',
    password: 'adminpass',
    name: 'Super Admin',
    role: 'admin',
    department: 'IT Security & Infrastructure',
    jobTitle: 'System Administrator',
    salary: '$180,000 / year',
    email: 'admin@company.com',
    phone: '+1-555-0999',
    ssn: '***-**-0001',
    privateNotes: 'INTERNAL SYSTEM SECRET: Server root password = MasterKey#2026! Database backup host: 10.0.0.5'
  }
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Login endpoint
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid ID or Password' });
  }

  // Set cookie for logged in user
  res.cookie('user_id', user.id, { httpOnly: false });

  // Redirect to profile page with the user's ID in the URL
  if (user.role === 'admin') {
    return res.json({ success: true, redirect: '/admin' });
  } else {
    return res.json({ success: true, redirect: `/profile?id=${user.id}` });
  }
});

// Logout endpoint
app.get('/api/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/');
});

// Current session status
app.get('/api/current-session', (req, res) => {
  const currentUserId = req.cookies.user_id;
  const currentUser = users[currentUserId] || null;
  res.json({ loggedIn: !!currentUser, user: currentUser });
});

// ==========================================
// VULNERABILITY 1: HORIZONTAL BROKEN ACCESS CONTROL (IDOR)
// ==========================================
// Flaw: Looks up employee data strictly by `req.query.id`.
// Does NOT check if the logged in user is actually allowed to view this ID!
// Any employee can change ?id=emp1 to ?id=emp2 or ?id=emp3 or ?id=admin in the URL!
app.get('/api/employee', (req, res) => {
  const targetId = req.query.id;
  const targetUser = users[targetId];

  if (!targetUser) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  // VULNERABLE: No authorization check! Returns full confidential employee info to anyone.
  const loggedInId = req.cookies.user_id || 'anonymous';
  const isUnauthorized = loggedInId !== targetId && loggedInId !== 'admin';

  res.json({
    employee: targetUser,
    viewerId: loggedInId,
    isAccessControlBroken: isUnauthorized
  });
});

// ==========================================
// VULNERABILITY 2: VERTICAL BROKEN ACCESS CONTROL (ADMIN BYPASS)
// ==========================================
// Flaw: Returns confidential admin data without checking if `role === 'admin'`.
// Any employee can visit `/admin` directly via URL!
app.get('/api/admin-data', (req, res) => {
  const loggedInId = req.cookies.user_id;
  const loggedInUser = users[loggedInId];

  // VULNERABLE: Does NOT check `loggedInUser.role === 'admin'`!
  // Any logged in user (or direct visitor) gets admin privileges and all employee salaries.
  const isUnauthorized = !loggedInUser || loggedInUser.role !== 'admin';

  res.json({
    allEmployees: Object.values(users),
    serverStatus: 'Online (Production)',
    dbHost: '10.0.0.5',
    adminSecret: 'SECRET_PAYROLL_BUDGET_APPROVED_2026',
    viewer: loggedInUser ? loggedInUser.name : 'Unauthenticated Visitor',
    viewerRole: loggedInUser ? loggedInUser.role : 'none',
    isAccessControlBroken: isUnauthorized
  });
});

// ==========================================
// PAGE ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
