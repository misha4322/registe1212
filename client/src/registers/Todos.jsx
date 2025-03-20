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
  const [editingTaskId, setEditingTaskId] = useState(null); 
  const [editedTitle, setEditedTitle] = useState(''); 
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
      await createTask({ title: newTodo }).unwrap();
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

  const toggleTodo = async (id, completed) => {
    try {
      await updateTask({ id, completed: !completed }).unwrap();
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

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
  };

  const saveEditedTodo = async (id) => {
    if (!editedTitle.trim()) {
      alert('Название задачи не может быть пустым');
      return;
    }

    try {
      await updateTask({ id, title: editedTitle }).unwrap();
      setEditingTaskId(null); 
      refetch(); 
    } catch (err) {
      alert('Ошибка при обновлении задачи: ' + (err.data?.error || 'Неизвестная ошибка'));
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
        Выйти
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
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTodo(task.id, task.completed)}
              className={styles.checkbox}
            />
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={() => saveEditedTodo(task.id)} className={styles.saveButton}>
                  Сохранить
                </button>
              </>
            ) : (
              <>
                <span
                  className={styles.taskTitle}
                  style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => startEditing(task)}
                >
                  {task.title}
                </span>
                <button onClick={() => removeTodo(task.id)} className={styles.deleteButton}>
                  Удалить
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}