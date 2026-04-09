
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve HTML

// Connect to SQLite Database
const db = new sqlite3.Database('./gestioadmin.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the SQLite database.');
});

// Initialize Tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        intitule TEXT,
        categorie TEXT,
        montant REAL,
        montant_ht REAL,
        tva REAL,
        taux_tva REAL,
        mois TEXT,
        annee TEXT
    )`);
    // More tables can be added here for Planning, Documents, etc.
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions ORDER BY date DESC`, [], (err, rows) => {
        if (err) return res.status(400).json({error: err.message});
        res.json(rows);
    });
});

// Add a transaction
app.post('/api/transactions', (req, res) => {
    const { date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee } = req.body;
    db.run(`INSERT INTO transactions (date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee], 
        function(err) {
            if (err) return res.status(400).json({error: err.message});
            res.json({ id: this.lastID });
    });
});

// Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
    db.run(`DELETE FROM transactions WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(400).json({error: err.message});
        res.json({ deleted: this.changes });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
