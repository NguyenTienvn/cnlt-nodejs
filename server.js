const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'my-secret-key-123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// ===== Helper =====
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function validateStudent(body, isNew, currentId) {
  const { msv, name, email, class: cls, department } = body;
  if (isNew) {
    if (!msv || !msv.trim())           return 'MSV khong duoc de trong';
    if (!name || name.trim().length < 2) return 'Ten phai co it nhat 2 ky tu';
    if (!email || !isValidEmail(email.trim())) return 'Email khong dung dinh dang';
    if (!cls || !cls.trim())           return 'Lop khong duoc de trong';
    if (!department || !department.trim()) return 'Khoa khong duoc de trong';
    if (students.some(s => s.msv === msv.trim()))   return 'MSV da ton tai';
    if (students.some(s => s.email === email.trim())) return 'Email da ton tai';
  } else {
    if (name !== undefined && name.trim().length < 2) return 'Ten phai co it nhat 2 ky tu';
    if (email !== undefined && !isValidEmail(email.trim())) return 'Email khong dung dinh dang';
    if (msv   !== undefined && students.some(s => s.msv   === msv.trim()   && s.id !== currentId)) return 'MSV da ton tai';
    if (email !== undefined && students.some(s => s.email === email.trim() && s.id !== currentId)) return 'Email da ton tai';
  }
  return null;
}

//Data
let students = [
  { id: 1, msv: '4651050001', name: 'Nguyen Van A', email: 'a@gmail.com', class: 'CNTT 46A', department: 'Cong nghe thong tin' },
  { id: 2, msv: '4651050002', name: 'Tran Thi B',   email: 'b@gmail.com', class: 'CNTT 46B', department: 'Cong nghe thong tin' },
  { id: 3, msv: '4651050003', name: 'Le Van C',      email: 'c@gmail.com', class: 'CNTT 46C', department: 'Cong nghe thong tin' },
  { id: 4, msv: '4651050004', name: 'Pham Thi D',   email: 'd@gmail.com', class: 'CNTT 46A', department: 'Cong nghe thong tin' },
  { id: 5, msv: '4651050005', name: 'Hoang Van E',  email: 'e@gmail.com', class: 'CNTT 46B', department: 'Cong nghe thong tin' },
  { id: 6, msv: '4651050006', name: 'Nguyen Thi F', email: 'f@gmail.com', class: 'CNTT 46C', department: 'Cong nghe thong tin' },
  { id: 7, msv: '4651050007', name: 'Tran Van G',   email: 'g@gmail.com', class: 'CNTT 46A', department: 'Cong nghe thong tin' }
];
let nextId = 8;

// ===== VIEWS (giao dien EJS) =====
app.get('/',          (_req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res)  => res.render('dashboard', { user: req.session.user || null }));
app.get('/io',        (_req, res) => res.render('io'));

// Trang login EJS
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login');
});

// Trang profile EJS
app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});

// Logout cho giao dien (redirect)
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/dashboard'));
});

app.get('/students', (req, res) => {
  const { page, limit, name } = req.query;

  if (name !== undefined) {
    return res.json(students.filter(s => s.name.toLowerCase().includes(name.toLowerCase())));
  }

  if (page !== undefined || limit !== undefined) {
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 2;
    if (p < 1 || l < 1)
      return res.status(400).json({ error: 'page va limit phai la so nguyen duong' });
    const start = (p - 1) * l;
    return res.json({
      page: p, limit: l,
      total: students.length,
      totalPages: Math.ceil(students.length / l),
      data: students.slice(start, start + l)
    });
  }

  res.json(students);
});

// GET /students/search?name=...
app.get('/students/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Vui long nhap ten can tim' });
  res.json(students.filter(s => s.name.toLowerCase().includes(name.toLowerCase())));
});

// GET /students/:id
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Khong tim thay sinh vien' });
  res.json(student);
});

// POST /students
app.post('/students', (req, res) => {
  const err = validateStudent(req.body, true);
  if (err) return res.status(400).json({ error: err });

  const { msv, name, email, class: cls, department } = req.body;
  const newStudent = { id: nextId++, msv: msv.trim(), name: name.trim(), email: email.trim(), class: cls.trim(), department: department.trim() };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PUT /students/:id
app.put('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Khong tim thay sinh vien' });

  const err = validateStudent(req.body, false, id);
  if (err) return res.status(400).json({ error: err });

  const { msv, name, email, class: cls, department } = req.body;
  students[idx] = {
    ...students[idx],
    ...(msv        !== undefined && { msv: msv.trim() }),
    ...(name       !== undefined && { name: name.trim() }),
    ...(email      !== undefined && { email: email.trim() }),
    ...(cls        !== undefined && { class: cls.trim() }),
    ...(department !== undefined && { department: department.trim() })
  };
  res.json(students[idx]);
});

// DELETE /students/:id
app.delete('/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Khong tim thay sinh vien' });
  const deleted = students.splice(idx, 1)[0];
  res.json({ message: 'Xoa thanh cong', student: deleted });
});

app.get('/sync', (_req, res) => {
  console.log('[SYNC] Bat dau doc file (blocking)...');
  const data = fs.readFileSync('./data.txt', 'utf8');
  console.log('[SYNC] Doc file xong!');
  res.json({ method: 'readFileSync (Blocking)', data });
});

app.get('/async', (_req, res) => {
  console.log('[ASYNC] Bat dau doc file (non-blocking)...');
  fs.readFile('./data.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Loi doc file' });
    console.log('[ASYNC] Callback: Doc file xong!');
    res.json({ method: 'readFile (Non-blocking)', data });
  });
  console.log('[ASYNC] Da gui lenh doc, server tiep tuc xu ly...');
});

// ===== BÀI 3: SESSION (JSON API theo đề) =====

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    req.session.user = { username: 'admin', role: 'admin' };
    return res.status(200).json({ message: 'Dang nhap thanh cong', user: req.session.user });
  }
  res.status(401).json({ error: 'Sai ten dang nhap hoac mat khau' });
});

// GET /api/profile
app.get('/api/profile', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: 'Chua dang nhap' });
  res.status(200).json({ user: req.session.user });
});

// GET /api/logout
app.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Dang xuat thanh cong' });
  });
});

app.listen(PORT, () => {
  console.log(`Server chay tai http://localhost:${PORT}`);
});
