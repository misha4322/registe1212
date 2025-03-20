import { useState } from 'react';
import { useRegisterMutation } from '../app/api';
import { useNavigate } from 'react-router-dom';
import styles from './access.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [register] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!username || !password) {
      alert('Имя пользователя и пароль обязательны');
      return;
    }

    try {
      const response = await register({ username, password }).unwrap();
      localStorage.setItem('token', response.token); 
      navigate('/todos'); 
    } catch (err) {
      alert('Ошибка регистрации: ' + (err.data?.error || 'Неизвестная ошибка'));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Регистрация</h2>
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
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}