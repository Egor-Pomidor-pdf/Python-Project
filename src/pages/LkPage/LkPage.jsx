import axios from 'axios';
import React, { useEffect, useState } from 'react';
import cl from "./LkPage.module.css";
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiX, FiPlus, FiArrowLeft } from 'react-icons/fi';


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
        city: '',
        preferences: [],
        middle_name: "",
        phone_number: "",
        middle_name: "",
        phone_number: ""
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
        <div className={cl.appContainer}>
            <div className={cl.container}>
                <h1 className={cl.title}>Личный кабинет</h1>

                {notification && (
                    <div className={`${cl.notification} ${notification.includes('Ошибка') ? cl.error : cl.success}`}>
                        {notification}
                    </div>
                )}

                <section className={cl.section}>
                    <div className={cl.sectionHeader}>
                        <h2 className={cl.sectionTitle}>Личные данные</h2>
                        {!isEditing && (
                            <button 
                                className={cl.editButton}
                                onClick={() => setIsEditing(true)}
                            >
                                <FiEdit className={cl.icon} />
                                Редактировать
                            </button>
                        )}
                    </div>
                    
                    <div className={cl.card}>
                        {isEditing ? (
                            <>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Имя</label>
                                    <input
                                        className={cl.input}
                                        name="first_name"
                                        value={userData.first_name}
                                        onChange={handleInputChange}
                                        placeholder="Введите ваше имя"
                                    />
                                </div>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Фамилия</label>
                                    <input
                                        className={cl.input}
                                        name="last_name"
                                        value={userData.last_name}
                                        onChange={handleInputChange}
                                        placeholder="Введите вашу фамилию"
                                    />
                                </div>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Email</label>
                                    <input
                                        className={cl.input}
                                        name="email"
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        type="email"
                                        placeholder="Введите ваш email"
                                    />
                                </div>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Отчество</label>
                                    <input
                                        className={cl.input}
                                        name="middle_name"
                                        value={userData.middle_name}
                                        onChange={handleInputChange}
                                        placeholder="Введите ваше отчество"
                                    />
                                </div>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Номер телефона</label>
                                    <input
                                        className={cl.input}
                                        name="phone_number"
                                        value={userData.phone_number}
                                        onChange={handleInputChange}
                                        placeholder="+79991234567"
                                        required
                                    />
                                </div>
                                <div className={cl.formGroup}>
                        <label className={cl.label}>Город</label>
                        <input
                            className={cl.input}
                            name="city"
                            value={userData.city}
                            onChange={handleInputChange}
                            placeholder="Введите ваш город"
                        />
                    </div>
                                <div className={cl.formGroup}>
                                    <label className={cl.label}>Предпочтения</label>
                                    <div className={cl.preferencesContainer}>
                                        {userData.preferences.map((pref, index) => (
                                            <div key={index} className={cl.preferenceItem}>
                                                <span>{pref}</span>
                                                <button
                                                    type="button"
                                                    className={cl.removePreference}
                                                    onClick={() => handleRemovePreference(pref)}
                                                >
                                                    <FiX className={cl.icon} />
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
                                            <FiPlus className={cl.icon} />
                                            Добавить
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={cl.buttonGroup}>
                                    <button className={`${cl.button} ${cl.cancelButton}`} onClick={() => setIsEditing(false)}>
                                        <FiArrowLeft className={cl.icon} />
                                        Отмена
                                    </button>
                                    <button className={`${cl.button} ${cl.saveButton}`} onClick={handleSave}>
                                        Сохранить изменения
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Логин:</span>
                                    <span className={cl.infoValue}>{userData.username || 'Не указано'}</span>
                                </div>
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Имя:</span>
                                    <span className={cl.infoValue}>{userData.first_name || 'Не указано'}</span>
                                </div>
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Фамилия:</span>
                                    <span className={cl.infoValue}>{userData.last_name || 'Не указана'}</span>
                                </div>
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Отчество:</span>
                                    <span className={cl.infoValue}>{userData.middle_name || 'Не указана'}</span>
                                </div>
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Email:</span>
                                    <span className={cl.infoValue}>{userData.email}</span>
                                </div>
                               
                                <div className={cl.userInfoItem}>
                        <span className={cl.infoLabel}>Город:</span>
                        <span className={cl.infoValue}>{userData.city || 'Не указан'}</span>
                    </div>
                  
                                <div className={cl.userInfoItem}>
                                    <span className={cl.infoLabel}>Предпочтения:</span>
                                    <div className={cl.preferencesList}>
                                        {userData.preferences.length > 0 ? (
                                            userData.preferences.map((pref, i) => (
                                                <span key={i} className={cl.preferenceTag}>{pref}</span>
                                            ))
                                        ) : (
                                            <span className={cl.noPreferences}>Нет выбранных предпочтений</span>
                                        )}
                                    </div>
                                </div>
                                <div className={cl.userInfoItem}>
                                    <span className={`${cl.infoLabel} ${cl.infoLabel_mod}`}>Номер телефона:</span>
                                    <span className={cl.infoValue}>{userData.phone_number}</span>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className={cl.section}>
                    <h2 className={cl.sectionTitle}>Мои билеты</h2>
                    {tickets.length === 0 ? (
                        <div className={cl.emptyState}>
                            {/* <img src="/images/no-tickets.svg" alt="Нет билетов" className={cl.emptyImage} /> */}
                            <p className={cl.emptyText}>У вас пока нет купленных билетов</p>
                            <button 
                                className={cl.browseButton}
                                onClick={() => navigate('/events')}
                            >
                                Посмотреть мероприятия
                            </button>
                        </div>
                    ) : (
                        <div className={cl.ticketsGrid}>
                            {tickets.map(ticket => (
                                <div key={ticket.id} className={cl.ticketCard}>
                                    <div className={cl.ticketHeader}>
                                        <h3 className={cl.eventName}>{ticket.event_name}</h3>
                                        <span className={cl.ticketPrice}>{ticket.amount} ₽</span>
                                    </div>
                                    
                                    <div className={cl.ticketDetails}>
                                        <div className={cl.detailItem}>
                                            <span className={cl.detailLabel}>Дата мероприятия:</span>
                                            <span className={cl.detailValue}>{new Date(ticket.event_date).toLocaleString()}</span>
                                        </div>
                                        <div className={cl.detailItem}>
                                            <span className={cl.detailLabel}>Место:</span>
                                            <span className={cl.detailValue}>{ticket.event_city}</span>
                                        </div>
                                        <div className={cl.detailItem}>
                                            <span className={cl.detailLabel}>Дата покупки:</span>
                                            <span className={cl.detailValue}>{new Date(ticket.transaction_date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        className={cl.refundButton}
                                        onClick={() => handleRefund(ticket.transaction_id)}
                                    >
                                        Вернуть билет
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default LkPage;