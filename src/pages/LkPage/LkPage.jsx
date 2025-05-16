import axios from 'axios';
import React, { useEffect, useState } from 'react';
import cl from "./LkPage.module.css";
import { useNavigate } from 'react-router-dom';


const LkPage = () => {
    const [tickets, setTickets] = useState([]);
    const [notification, setNotification] = useState('');
    const [newPreference, setNewPreference] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const preferenceOptions = [
        "Спорт",
        "Кино",
        "Музыка",
        "Книги",
        "Путешествия",
        "Технологии"
    ];
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        preferences: [],
    })
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };
    //возврат билета
    const handleRefund = async (ticketId) => {
        try {
            const refundId = {
              transaction_id: ticketId
            }
          await axios.post(`/profile/refund`, refundId); //исправить надо
          setTickets(tickets.filter(ticket => ticket.transaction_id !== ticketId));
          setNotification('Возврат успешно оформлен');
          setTimeout(() => setNotification(''), 3000);
        } catch (error) {
          console.error('Ошибка возврата:', error);
          setNotification(error.response?.data?.message || 'Ошибка возврата билета');
        }
      };

    // Добавление нового предпочтения
    const handleAddPreference = () => {
        if (newPreference && !userData.preferences.includes(newPreference)) {
            setUserData({
                ...userData,
                preferences: [...userData.preferences, newPreference]
            });
            setNewPreference('');
        }
    };

    // Удаление предпочтения
    const handleRemovePreference = (prefToRemove) => {
        setUserData({
            ...userData,
            preferences: userData.preferences.filter(pref => pref !== prefToRemove)
        });
    };
    //сохраняем изменения
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              navigate("/login");
              return;
            }
            await axios.put('/profile/me', userData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            setIsEditing(false);
            setNotification('Данные успешно сохранены');
            setTimeout(() => setNotification(''), 3000);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setNotification('Ошибка сохранения данных');
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const userResponse = await axios.get('/profile/me');
            const ticketsResponse = await axios.get('/profile/transactions');
                setUserData(userResponse.data);
                setTickets(ticketsResponse.data);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    delete axios.defaults.headers.common['Authorization'];
                    navigate('/login');
                } else {
                    setNotification('Ошибка загрузки данных');
                }
            }
        }
        fetchData();
    }, [navigate])

    return (
        <div className={cl.container}>
            <h1 className={cl.title}>Личный кабинет</h1>

            {notification && (
                <div className={cl.notification}>
                    {notification}
                </div>
            )}

            <section className={cl.section}>
                <h2 className={cl.sectionTitle}>Личные данные</h2>
                <div className={cl.userData}>
                    {isEditing ? (
                        <>
                            <div className={cl.formGroup}>
                                <label className={cl.label}>Имя:</label>
                                <input
                                    className={cl.input}
                                    name="first_name"
                                    value={userData.first_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cl.formGroup}>
                                <label className={cl.label}>Фамилия:</label>
                                <input
                                    className={cl.input}
                                    name="last_name"
                                    value={userData.last_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cl.formGroup}>
                                <label className={cl.label}>Email:</label>
                                <input
                                    className={cl.input}
                                    name="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cl.formGroup}>
                                <label className={cl.label}>Предпочтения:</label>
                                <div className={cl.preferencesContainer}>
                                    {userData.preferences.map((pref, index) => (
                                        <div key={index} className={cl.preferenceItem}>
                                            <span>{pref}</span>
                                            <button
                                                type="button"
                                                className={cl.removePreference}
                                                onClick={() => handleRemovePreference(pref)}
                                            >
                                             
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className={cl.addPreference}>
                                    <select
                                        className={cl.preferenceSelect}
                                        value={newPreference}
                                        onChange={(e) => setNewPreference(e.target.value)}
                                    >
                                        <option value="">Выберите предпочтение</option>
                                        {preferenceOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className={cl.addButton}
                                        onClick={handleAddPreference}
                                    >
                                        Добавить
                                    </button>
                                </div>
                            </div>
                            <div className={cl.buttonGroup}>
                                <button className={`${cl.button} ${cl.saveButton}`} onClick={handleSave}>
                                    Сохранить
                                </button>
                                <button className={`${cl.button} ${cl.cancelButton}`} onClick={() => setIsEditing(false)}>
                                    Отмена
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className={cl.userInfo}><strong>Имя:</strong> {userData.first_name}</p>
                            <p className={cl.userInfo}><strong>Фамилия:</strong> {userData.last_name}</p>
                            <p className={cl.userInfo}><strong>Email:</strong> {userData.email}</p>
                            <p className={cl.userInfo}>
                                <strong>Предпочтения:</strong>
                                {userData.preferences.length > 0
                                    ? userData.preferences.join(', ')
                                    : 'Нет выбранных предпочтений'}
                            </p>
                            <button className={cl.button} onClick={() => setIsEditing(true)}>
                                Редактировать
                            </button>
                        </>
                    )}
                </div>
            </section>

            <section className={cl.section}>
                <h2 className={cl.sectionTitle}>Мои билеты</h2>
                    {tickets.length === 0 ? ( 
                        <p className={cl.noTickets}>У вас пока нет купленных билетов</p>
                    ):
                    (
                        <div className={cl.ticketsList}>
                        {tickets.map(ticket => (
                            <div key={ticket.id} className={cl.ticket}>
                                <div className={cl.ticketInfo}>
                                    <p><strong>Мероприятие:</strong> {ticket.event_name}</p>
                                    <p><strong>Дата:</strong> {new Date(ticket.event_date).toLocaleString()}</p>
                                    <p><strong>Место:</strong> {ticket.event_city}</p>
                                    <p><strong>Цена:</strong> {ticket.amount} ₽</p>
                                    <p><strong>Куплен:</strong> {new Date(ticket.transaction_date).toLocaleString()}</p>
                                </div>
            
                                    <button
                                        className={`${cl.button} ${cl.refundButton}`}
                                        onClick={() => handleRefund(ticket.transaction_id)}
                                    >
                                        Вернуть билет
                                    </button>
                        
                            </div>
                        ))}
                    </div>
                    )
                        
                    }
            </section>
        </div>
    );
};

export default LkPage;


