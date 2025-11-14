const mysql = require('mysql2/promise');

async function testConnection() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'g_empire'
  });

  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Connexion réussie ! Test SQL:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('Erreur de connexion :', err);
    process.exit(1);
  }
}

testConnection();
