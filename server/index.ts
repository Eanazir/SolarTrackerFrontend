import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('Hello, PERN stack with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});