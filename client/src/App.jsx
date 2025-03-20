import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './registers/registers.jsx';
import Login from './registers/login';
import Todos from './registers/Todos';
import styles from './router.module.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); 

  return (
    <BrowserRouter>
      <nav className={styles.nav}>
        <Link to="/register" className={styles.link}>
          Регистрация
        </Link>
        <Link to="/login" className={styles.link}>
          Вход
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/todos"
          element={isAuthenticated ? <Todos /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;