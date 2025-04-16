const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const DATA_FILE = './data.json';

function loadData() {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/encrypt', (req, res) => {
    const { type, data } = req.body;
    const passkey = Math.random().toString(36).slice(2, 10).toUpperCase();
    const db = loadData();
    db[passkey] = { type, data };
    saveData(db);
    res.json({ passkey });
});

app.post('/decrypt', (req, res) => {
    const { passkey } = req.body;
    const db = loadData();

    if (db[passkey]) {
        const result = db[passkey];
        delete db[passkey]; // Optional: one-time access
        saveData(db);
        res.json({ success: true, data: result });
    } else {
        res.json({ success: false, error: "Invalid Passkey" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
