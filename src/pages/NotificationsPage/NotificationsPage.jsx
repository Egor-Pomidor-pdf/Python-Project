import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context';
import cl from "./NotificationsPage.module.css";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Получение уведомлений
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/profile/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке уведомлений');
      setLoading(false);
    }
  };

  // Пометить уведомление как прочитанное
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/profile/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении уведомления');
    }
  };

  // Удалить уведомление
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/profile/notifications/${notificationId}`);
      setNotifications(notifications.filter(
        notification => notification.id !== notificationId
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при удалении уведомления');
    }
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    } else {
      fetchNotifications();
    }
  }, [isAuth, navigate]);

  if (loading) {
    return <div className={cl.container}>Загрузка уведомлений...</div>;
  }

  if (error) {
    return <div className={cl.container}>{error}</div>;
  }

  return (
    <div className={cl.container}>
      <h1 className={cl.title}>Уведомления</h1>
      
      {notifications.length === 0 ? (
        <p className={cl.empty}>У вас нет уведомлений</p>
      ) : (
        <ul className={cl.notificationsList}>
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`${cl.notification} ${notification.is_read ? cl.read : cl.unread}`}
            >
              <div className={cl.notificationContent}>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </div>
              
              <div className={cl.notificationActions}>
                {!notification.is_read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className={cl.actionButton}
                  >
                    Прочитано
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className={`${cl.actionButton} ${cl.deleteButton}`}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;