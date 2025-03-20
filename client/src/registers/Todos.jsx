import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../app/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './access.module.css';

export default function Todos() {
  const { data: tasks, isLoading, refetch } = useGetTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [newTodo, setNewTodo] = useState('');
  const navigate = useNavigate();

  const addTodo = async () => {
    
    if (!newTodo.trim()) {
      alert('Название задачи обязательно');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Токен отсутствует. Пожалуйста, войдите заново.');
      navigate('/login');
      return;
    }

    try {
      
      await createTask({ title: newTodo, description: '' }).unwrap();
      setNewTodo(''); 
      refetch(); 
    } catch (err) {
      if (err.status === 403) {
        alert('Токен истёк. Пожалуйста, войдите заново.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Ошибка при создании задачи: ' + (err.data?.error || 'Неизвестная ошибка'));
      }
    }
  };

  const toggleTodo = async (id) => {
    try {
      await updateTask({ id, completed: true }).unwrap();
      refetch(); 
    } catch (err) {
      alert('Ошибка при обновлении задачи: ' + (err.data?.error || 'Неизвестная ошибка'));
    }
  };

  const removeTodo = async (id) => {
    try {
      await deleteTask(id).unwrap();
      refetch(); 
    } catch (err) {
      alert('Ошибка при удалении задачи: ' + (err.data?.error || 'Неизвестная ошибка'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Список задач</h2>
      <button onClick={handleLogout} className={styles.button}>
        Выйти с акаунта
      </button>

      <div className={styles.todoForm}>
        <input
          className={styles.input}
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Введите задачу"
          required
        />
        <button onClick={addTodo} className={styles.button}>
          Добавить
        </button>
      </div>

      <ul className={styles.todoList}>
        {tasks?.map((task, index) => (
          <li key={task.id} className={styles.todoItem}>
            <span className={styles.taskNumber}>{index + 1}.</span>
            <span
              className={styles.taskTitle}
              style={{
                textDecoration: task.completed ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => toggleTodo(task.id)}
            >
              {task.title}
            </span>
            <button onClick={() => removeTodo(task.id)} className={styles.deleteButton}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}