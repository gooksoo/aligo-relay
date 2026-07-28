const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apps Script에서만 호출할 수 있도록 간단한 비밀키로 보호
const RELAY_SECRET = process.env.RELAY_SECRET || "";

app.post('/relay', async (req, res) => {
  if (RELAY_SECRET && req.headers['x-relay-secret'] !== RELAY_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const params = new URLSearchParams();
    Object.entries(req.body).forEach(([k, v]) => params.append(k, v));

    const response = await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const text = await response.text();
    res.type('application/json').send(text);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 상태 확인용 (브라우저로 접속하면 이게 떠야 정상)
app.get('/', (req, res) => res.send('relay ok'));

// 실제 발신 IP 확인용 (문제 진단용)
app.get('/whatismyip', async (req, res) => {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('listening on ' + PORT));
