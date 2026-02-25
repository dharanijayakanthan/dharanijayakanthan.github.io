const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        checkData();
    }
});

function checkData() {
    db.serialize(() => {
        db.each("SELECT count(*) as count FROM users", (err, row) => {
            console.log(`Users: ${row.count}`);
        });
        db.each("SELECT count(*) as count FROM habits", (err, row) => {
            console.log(`Habits: ${row.count}`);
        });
        db.each("SELECT count(*) as count FROM completions", (err, row) => {
            console.log(`Completions: ${row.count}`);
        });
        db.each("SELECT count(*) as count FROM jobs", (err, row) => {
            console.log(`Jobs: ${row.count}`);
        });

        console.log('\n--- First 5 Jobs ---');
        db.all("SELECT title, company, location FROM jobs LIMIT 5", (err, rows) => {
            if (err) {
                console.error(err.message);
            } else {
                rows.forEach((row, i) => {
                    console.log(`${i+1}. ${row.title} at ${row.company} (${row.location})`);
                });
            }
        });
    });
}
