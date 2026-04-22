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

let students = [
  { id: 1, msv: '4651050001', name: 'Nguyen Van A', class: 'CNTT 46A', department: 'Công nghệ thông tin' },
  { id: 2, msv: '4651050002', name: 'Tran Thi B',   class: 'CNTT 46B', department: 'Công nghệ thông tin' },
  { id: 3, msv: '4651050003', name: 'Le Van C',      class: 'CNTT 46C', department: 'Công nghệ thông tin' },
  { id: 4, msv: '4651050004', name: 'Pham Thi D',   class: 'CNTT 46A', department: 'Công nghệ thông tin' },
  { id: 5, msv: '4651050005', name: 'Hoang Van E',  class: 'CNTT 46B', department: 'Công nghệ thông tin' },
  { id: 6, msv: '4651050006', name: 'Nguyen Thi F', class: 'CNTT 46C', department: 'Công nghệ thông tin' },
  { id: 7, msv: '4651050007', name: 'Tran Van G',   class: 'CNTT 46A', department: 'Công nghệ thông tin' }
];
let nextId = 8;

// ===== VIEWS =====
app.get('/',           (_req, res) => res.redirect('/dashboard'));
app.get('/dashboard',  (req, res) => res.render('dashboard', { user: req.session.user || null }));
app.get('/io',         (_req, res) => res.render('io'));

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login');
});

app.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/dashboard'));
});

app.get('/api/students', (req, res) => {
  const { page, limit } = req.query;
  if (page && limit) {
    const p = parseInt(page);
    const l = parseInt(limit);
    if (isNaN(p) || isNaN(l) || p < 1 || l < 1)
      return res.status(400).json({ error: 'page va limit phai la so nguyen duong' });
    const totalPages = Math.ceil(students.length / l);
    const start = (p - 1) * l;
    const data = students.slice(start, start + l);
    return res.json({
      page: p,
      limit: l,
      total: students.length,
      totalPages,
      data
    });
  }
  res.json(students);
});

app.get('/api/students/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Vui long nhap ten can tim' });
  res.json(students.filter(s => s.name.toLowerCase().includes(name.toLowerCase())));
});

app.get('/api/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Khong tim thay sinh vien' });
  res.json(student);
});

app.post('/api/students', (req, res) => {
  const { msv, name, class: className, department } = req.body;
  if (!msv || msv.trim().length === 0)
    return res.status(400).json({ error: 'MSV khong duoc de trong' });
  if (!name || name.trim().length < 2)
    return res.status(400).json({ error: 'Ten phai co it nhat 2 ky tu' });
  if (!className || className.trim().length === 0)
    return res.status(400).json({ error: 'Lop khong duoc de trong' });
  if (!department || department.trim().length === 0)
    return res.status(400).json({ error: 'Khoa khong duoc de trong' });
  if (students.some(s => s.msv === msv))
    return res.status(400).json({ error: 'MSV da ton tai' });
  const newStudent = { id: nextId++, msv: msv.trim(), name: name.trim(), class: className.trim(), department: department.trim() };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Khong tim thay sinh vien' });
  const { msv, name, class: className, department } = req.body;
  if (msv && msv.trim().length === 0)
    return res.status(400).json({ error: 'MSV khong duoc de trong' });
  if (name && name.trim().length < 2)
    return res.status(400).json({ error: 'Ten phai co it nhat 2 ky tu' });
  if (className && className.trim().length === 0)
    return res.status(400).json({ error: 'Lop khong duoc de trong' });
  if (department && department.trim().length === 0)
    return res.status(400).json({ error: 'Khoa khong duoc de trong' });
  if (msv && students.some(s => s.msv === msv && s.id !== parseInt(req.params.id)))
    return res.status(400).json({ error: 'MSV da ton tai' });
  students[idx] = {
    ...students[idx],
    msv: msv ? msv.trim() : students[idx].msv,
    name: name ? name.trim() : students[idx].name,
    class: className ? className.trim() : students[idx].class,
    department: department ? department.trim() : students[idx].department
  };
  res.json(students[idx]);
});

app.delete('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Khong tim thay sinh vien' });
  const deleted = students.splice(idx, 1)[0];
  res.json({ message: 'Xoa thanh cong', student: deleted });
});


app.get('/sync', (req, res) => {
  console.log('[SYNC] Bat dau doc file (blocking)...');
  const data = fs.readFileSync('./data.txt', 'utf8');
  console.log('[SYNC] Doc file xong!');
  res.json({ method: 'readFileSync (Blocking)', data });
});

app.get('/async', (req, res) => {
  console.log('[ASYNC] Bat dau doc file (non-blocking)...');
  fs.readFile('./data.txt', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Loi doc file' });
    console.log('[ASYNC] Callback: Doc file xong!');
    res.json({ method: 'readFile (Non-blocking)', data });
  });
  console.log('[ASYNC] Da gui lenh doc, server tiep tuc xu ly...');
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    req.session.user = { username: 'admin', role: 'admin' };
    return res.json({ message: 'Dang nhap thanh cong', user: req.session.user });
  }
  res.status(401).json({ error: 'Sai ten dang nhap hoac mat khau' });
});

app.listen(PORT, () => {
  console.log(`Server chay tai http://localhost:${PORT}`);
});
