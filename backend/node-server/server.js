const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id TEXT,
            date TEXT,
            FOREIGN KEY(habit_id) REFERENCES habits(id),
            UNIQUE(habit_id, date)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT,
            company TEXT,
            location TEXT,
            date TEXT,
            link TEXT,
            logo TEXT,
            lat REAL,
            lng REAL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Routes

// Login / Register
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            res.json(row);
        } else {
            db.run('INSERT INTO users (username) VALUES (?)', [username], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, username });
            });
        }
    });
});

// Get Habits
app.get('/api/habits', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'UserId required' });

    db.all('SELECT * FROM habits WHERE user_id = ?', [userId], (err, habits) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get completions for these habits
        // This is a naive implementation, could be optimized with JOIN
        const habitIds = habits.map(h => h.id);
        if (habitIds.length === 0) return res.json([]);

        const placeholders = habitIds.map(() => '?').join(',');
        db.all(`SELECT * FROM completions WHERE habit_id IN (${placeholders})`, habitIds, (err, completions) => {
            if (err) return res.status(500).json({ error: err.message });

            // Structure response
            const result = habits.map(habit => {
                const habitCompletions = completions
                    .filter(c => c.habit_id === habit.id)
                    .reduce((acc, c) => ({ ...acc, [c.date]: true }), {});

                return {
                    ...habit,
                    completions: habitCompletions
                };
            });
            res.json(result);
        });
    });
});

// Create Habit
app.post('/api/habits', (req, res) => {
    const { userId, name, id } = req.body;
    const habitId = id || Math.random().toString(36).substring(2, 15);

    db.run('INSERT INTO habits (id, user_id, name) VALUES (?, ?, ?)', [habitId, userId, name], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: habitId, user_id: userId, name });
    });
});

// Update Habit
app.put('/api/habits/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    db.run('UPDATE habits SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Delete Habit
app.delete('/api/habits/:id', (req, res) => {
    const { id } = req.params;

    db.serialize(() => {
        db.run('DELETE FROM completions WHERE habit_id = ?', [id]);
        db.run('DELETE FROM habits WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Toggle Completion
app.post('/api/habits/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    db.get('SELECT * FROM completions WHERE habit_id = ? AND date = ?', [id, date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            db.run('DELETE FROM completions WHERE id = ?', [row.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ completed: false });
            });
        } else {
            db.run('INSERT INTO completions (habit_id, date) VALUES (?, ?)', [id, date], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ completed: true });
            });
        }
    });
});

// Get Jobs
app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs ORDER BY date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Trigger Job Fetch
app.post('/api/fetch-jobs', (req, res) => {
    console.log('Starting job fetch worker...');
    const pythonProcess = spawn('python3', [path.join(__dirname, '../python-worker/fetch_jobs.py')]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Worker: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Worker Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Worker process exited with code ${code}`);
    });

    res.json({ message: 'Job fetch triggered' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
