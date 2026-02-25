const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at INTEGER
        )`);

        // Habits table
        db.run(`CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Completions table
        db.run(`CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits (id),
            UNIQUE(habit_id, date)
        )`);

        // User Settings (Theme)
        db.run(`CREATE TABLE IF NOT EXISTS user_settings (
            user_id INTEGER PRIMARY KEY,
            theme TEXT DEFAULT 'light',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Jobs table
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
            updated_at INTEGER
        )`);
    });
}

module.exports = db;
