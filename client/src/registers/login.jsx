import { useState } from 'react';
import { useLoginMutation } from '../app/api';
import { useNavigate } from 'react-router-dom';
import styles from './access.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка данных
    if (!username || !password) {
      alert('Имя пользователя и пароль обязательны');
      return;
    }

    try {
      const response = await login({ username, password }).unwrap();
      localStorage.setItem('token', response.token); // Сохраняем токен
      navigate('/todos'); // Перенаправляем на страницу задач
    } catch (err) {
      alert('Ошибка входа: ' + (err.data?.error || 'Неизвестная ошибка'));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Вход</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.button}>
          Войти
        </button>
      </form>
    </div>
  );
}