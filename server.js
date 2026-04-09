const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base de données PostgreSQL de Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Obligatoire pour Render
    }
});

// Création automatique de la table au démarrage
pool.query(`CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date TEXT,
    intitule TEXT,
    categorie TEXT,
    montant REAL,
    montant_ht REAL,
    tva REAL,
    taux_tva REAL,
    mois TEXT,
    annee TEXT
)`, (err, res) => {
    if (err) console.error('Erreur de création de table:', err.stack);
    else console.log('Base de données PostgreSQL prête !');
});

// 1. Lire toutes les transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM transactions ORDER BY date DESC`);
        res.json(result.rows);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// 2. Ajouter une transaction
app.post('/api/transactions', async (req, res) => {
    const { date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO transactions (date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [date, intitule, categorie, montant, montant_ht, tva, taux_tva, mois, annee]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

// 3. Supprimer une transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const result = await pool.query(`DELETE FROM transactions WHERE id = $1`, [req.params.id]);
        res.json({ deleted: result.rowCount });
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});