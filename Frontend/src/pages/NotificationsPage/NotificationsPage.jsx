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

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/login");
                return;
            }
            const response = await axios.get('/profile/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при загрузке уведомлений');
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/login");
                return;
            }
            await axios.post(`/profile/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обновлении уведомления');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`/profile/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(
                notification => notification.id !== notificationId
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при удалении уведомления');
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            await axios.post('/profile/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(notification => ({
                ...notification,
                is_read: true
            })));
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обновлении уведомлений');
        }
    };

    useEffect(() => {
        if (!isAuth) {
            navigate('/login');
        } else {
            fetchNotifications();
        }
    }, [isAuth, navigate]);

    if (loading) {
        return (
            <div className={cl.background}>
                <div className={cl.container}>
                    <div className={cl.loading}>
                        <div className={cl.spinner}></div>
                        <p>Загрузка уведомлений...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cl.background}>
                <div className={cl.container}>
                    <div className={cl.error}>
                        <p>{error}</p>
                        <button onClick={fetchNotifications} className={cl.retryButton}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cl.background}>
            <div className={cl.container}>
                <div className={cl.header}>
                    <h1 className={cl.title}>Уведомления</h1>
                    {notifications.length > 0 && (
                        <button onClick={markAllAsRead} className={cl.markAllButton}>
                            Прочитать все
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className={cl.emptyState}>
                        <div className={cl.emptyIcon}>📭</div>
                        <h3>Нет уведомлений</h3>
                        <p>Здесь будут появляться ваши уведомления</p>
                    </div>
                ) : (
                    <ul className={cl.notificationsList}>
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`${cl.notification} ${notification.is_read ? '' : cl.unread}`}
                            >
                                <div className={cl.notificationContent}>
                                    <div className={cl.notificationHeader}>
                                        <h3 className={cl.notificationTitle}>{notification.title}</h3>
                                        <span className={cl.notificationTime}>
                                            {new Date(notification.created_at).toLocaleString('ru-RU', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className={cl.notificationMessage}>{notification.message}</p>
                                </div>

                                <div className={cl.notificationActions}>
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className={cl.readButton}
                                            title="Пометить как прочитанное"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className={cl.deleteButton}
                                        title="Удалить уведомление"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;