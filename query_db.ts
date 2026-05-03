import Database from "better-sqlite3";
const db = new Database("doctorian.db");

const userId = 'user_abc123';
const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);

if (!userExists) {
  console.log("User 'user_abc123' not found. Creating...");
  db.prepare("INSERT INTO users (id, email, password, displayName, createdAt, photoURL) VALUES (?, ?, ?, ?, ?, ?)")
    .run(userId, 'abc@example.com', 'hashed_pass', 'John Doe Abc', new Date().toISOString(), 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop');
  
  console.log("Creating sample records for 'user_abc123'...");
  const records = [
    { type: 'Heart Rate', value: '72', unit: 'bpm', date: '2026-05-01', notes: 'Normal resting heart rate' },
    { type: 'Blood Pressure', value: '120/80', unit: 'mmHg', date: '2026-05-02', notes: 'Perfectly normal' },
    { type: 'Temperature', value: '36.6', unit: '°C', date: '2026-05-03', notes: 'Feeling well' },
    { type: 'Diagnostic Imaging', value: 'Chest X-Ray', unit: 'Scan', date: '2026-05-03', notes: 'Clear lungs, no issues detected.', attachmentURL: 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?w=400&h=400&fit=crop' }
  ];

  for (const r of records) {
    const id = Math.random().toString(36).substring(2, 11);
    db.prepare("INSERT INTO records (id, userId, type, value, unit, date, notes, attachmentURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, userId, r.type, r.value, r.unit, r.date, r.notes, (r as any).attachmentURL || null);
  }
}

const user = db.prepare("SELECT id, email, displayName FROM users WHERE id = ?").get(userId);
const records = db.prepare("SELECT * FROM records WHERE userId = ? ORDER BY date DESC").all(userId);

console.log("User Details:", user);
console.log("Health Records:", records);
