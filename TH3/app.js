const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

const elections = [
  {
    id: 1,
    name: 'Bầu cử ban cán sự lớp',
    candidates: [
      { id: 1, name: 'Lê Tuấn Thành', votes: 0 },
      { id: 2, name: 'Trần Minh Vương', votes: 0 },
      { id: 3, name: 'Trương Thị Thùy Trang', votes: 0 }
    ]
  },
  {
    id: 2,
    name: 'Bầu cử BCH Chi Đoàn',
    candidates: [
      { id: 1, name: 'Nguyễn Tiên', votes: 0 },
      { id: 2, name: 'Trương Thị Uyên Trang', votes: 0 },
      { id: 3, name: 'Nguyễn Văn Minh', votes: 0 }
    ]
  }
];

app.get('/', (req, res) => {
  res.render('index', { title: 'Trang chủ' });
});

app.get('/elections', (req, res) => {
  res.render('elections', {
    title: 'Danh sách bầu cử',
    elections: elections
  });
});

app.get('/election/:id', (req, res) => {
  const election = elections.find(e => e.id == req.params.id);

  res.render('candidates', {
    title: 'Ứng viên',
    election: election
  });
});

app.get('/vote/:electionId/:candidateId', (req, res) => {
  const election = elections.find(e => e.id == req.params.electionId);
  const candidate = election.candidates.find(c => c.id == req.params.candidateId);

  candidate.votes++;

  res.redirect('/result/' + election.id);
});

app.get('/result/:id', (req, res) => {
  const election = elections.find(e => e.id == req.params.id);

  res.render('result', {
    title: 'Kết quả',
    election: election
  });
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});