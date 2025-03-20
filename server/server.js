const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');


dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


app.use(cors());
app.use(express.json());


const validateUserData = (username, password) => {
  if (!username || !password) {
    return { error: 'Имя пользователя и пароль обязательны' };
  }
  if (password.length < 6) {
    return { error: 'Пароль должен быть не менее 6 символов' };
  }
  return null;
};

app.post('/register', async (req, res) => {
  const { username, password } = req.body;


  const validationError = validateUserData(username, password);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {

    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Имя пользователя уже занято' });
    }

 
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );


    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });


    res.status(201).json({ token });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

 
  const validationError = validateUserData(username, password);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    
    if (!user) {
      return res.status(400).json({ error: 'Пользователь не найден' });
    }

 
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

 
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }


  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}


app.get('/tasks', authenticateToken, async (req, res) => {
  try {
  
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении задач:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении задач' });
  }
});


app.post('/tasks', authenticateToken, async (req, res) => {
  const { title } = req.body;

 
  if (!title) {
    return res.status(400).json({ error: 'Название задачи обязательно' });
  }

  try {
   
    const result = await pool.query(
      'INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании задачи:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании задачи' });
  }
});


app.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const taskId = req.params.id;


  if (!title) {
    return res.status(400).json({ error: 'Название задачи обязательно' });
  }

  try {
  
    const result = await pool.query(
      'UPDATE tasks SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, taskId, req.user.userId]
    );

    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при обновлении задачи:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении задачи' });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;

  try {
  
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, req.user.userId]
    );

  
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json({ message: 'Задача удалена' });
  } catch (err) {
    console.error('Ошибка при удалении задачи:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении задачи' });
  }
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});