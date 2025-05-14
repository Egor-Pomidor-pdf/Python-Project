import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cl from "./EventPage.module.css";
import def from "./image/telegram-cloud-photo-size-2-5206223897693908661-y.jpg";
import PostWithTitle from '../../components/PostWithTitle';

const EventPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notification, setNotification] = useState('');
    const [reviewNotification, setReviewNotification] = useState('');
    const eventData = location.state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [cvv, setCvv] = useState("");
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState("");
    const [score, setScore] = useState(5);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    navigate('/login');
                    return;
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const responseRev = await axios.get(`/events/reviews/${eventData.id}`)

            } catch (error) {
                console.error(error);

            }
            
        }
        fetchReviews();
    }
    , [])

    const ticketBook = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTicketCount(1);
        setCardNumber("");
        setExpiryDate("");
        setCardHolder("");
        setCvv("");
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                
                if (!token) {
                    navigate('/login');
                    return;
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const responseRev = await axios.get(`/events/reviews/${eventData.id}`);
                setReviews(responseRev.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchReviews();
    }, [eventData.id, navigate]);


    const openReviewModal = () => {
        setIsReviewModalOpen(true);
    };
    const closeReviewModal = () => {
        setIsReviewModalOpen(false);
        setComment("");
        setScore(5);
    };

    const sendReview = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        
        try {
            const formData = new URLSearchParams();
            formData.append('user_id', userId); // user_id передается как form-data
            
            const reviewData = {
                event_id: eventData.id, // event_id передается в JSON
                comment: comment,      // comment передается в JSON
            };

            const rateData = {
                event_id: eventData.id,
                user_id: userId,
                score,
            }
    
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }
            await axios.post("/events/rate", null, {
                params: {
                    user_id: userId,
                    event_id: eventData.id,
                    score: score,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
    
            await axios.post("/events/review", reviewData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', // Основное тело - JSON
                },
                params: formData // user_id передается как параметр URL
            });
    
            setReviewNotification('Отзыв успешно отправлен!');
            setTimeout(() => setReviewNotification(''), 3000);
            
            // Обновляем список отзывов
            const responseRev = await axios.get(`/events/reviews/${eventData.id}`);
            setReviews(responseRev.data);
            
            closeReviewModal();
        } catch (error) {
            setReviewNotification('Ошибка при отправке отзыва');
            setTimeout(() => setReviewNotification(''), 3000);
            console.error(error);
        }
    };

    const bookFormSend = async (e) => {
        e.preventDefault();
        try {
            const bookingTicket = {
                book_data: {
                    event_id: eventData.id,
                    ticket_count: ticketCount,
                },
                payment_data: {
                    card_number: cardNumber,
                    expiry_date: expiryDate,
                    card_holder: cardHolder,
                    cvv: cvv,
                },
            };

            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            await axios.post("/booking/book-ticket", bookingTicket);
            setNotification('Билет куплен');
            setTimeout(() => setNotification(''), 3000);
        } catch (error) {
            console.error("ОШИБКА", error);
            if (error.response) {
                console.log("Ответ от сервера:", error.response.data);
                setNotification('ОШИБКА');
            }
        }
    };

    if (!eventData) {
        return <div className="error-message">
            <h2>Данные не загружены</h2>
            <p>Пожалуйста, перейдите к событию через главную страницу</p>
            <Link to="/home">На главную</Link>
        </div>
    }




    return (
        <div className={cl.eventContainer}>

            <header className={cl.eventHeader}>
                <h1 className={cl.eventTitle}>{eventData.name}</h1>
                <p className={cl.eventSubtitle}>{eventData.tit}</p>
            </header>

            <div className={cl.eventImage}>
                <img
                    src={eventData.image || def}
                    alt={eventData.name}
                    className={cl.eventImage}
                />
            </div>

            <div className={cl.eventDetails}>
                <section className={cl.eventInfo}>
                    <h2 className={cl.sectionTitle}>Информация о мероприятии</h2>
                    <div className={cl.infoGrid}>
                        <div className={cl.infoItem}>
                            <span className={cl.infoLabel}>Дата:</span>
                            <span className={cl.infoValue}>
                                {new Date(eventData.date).toLocaleDateString()}
                            </span>
                        </div>
                        <div className={cl.infoItem}>
                            <span className={cl.infoLabel}>Город:</span>
                            <span className={cl.infoValue}>{eventData.city}</span>
                        </div>
                        <div className={cl.infoItem}>
                            <span className={cl.infoLabel}>Цена:</span>
                            <span className={cl.infoValue}>{eventData.price} ₽</span>
                        </div>
                        <div className={cl.infoItem}>
                            <span className={cl.infoLabel}>Доступно билетов:</span>
                            <span className={cl.infoValue}>{eventData.available_tickets}</span>
                        </div>
                    </div>
                </section>

                <section className={cl.eventDescription}>
                    <h2 className={cl.sectionTitle}>Описание</h2>
                    <p className={cl.descriptionText}>{eventData.description}</p>
                </section>

                <section className={cl.eventReview}>
                <h2 className={cl.sectionTitle}>Отзывы</h2>
                {reviewNotification && (
                    <div className={cl.reviewNotification}>
                        {reviewNotification}
                    </div>
                )}
                {reviews.length > 0 ? (
                    <div className={cl.reviewList}>
                        {reviews.map((review) => (
                            <div key={review.id} className={cl.reviewItem}>
                                <div className={cl.reviewHeader}>
                                    <div>
                                        <span className={cl.reviewAuthor}>{review.username || "Аноним"}</span>
                                        <span className={cl.reviewScore}>Оценка: {review.score}5</span>
                                    </div>
                                    <span className={cl.reviewDate}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={cl.reviewContent}>{review.comment}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cl.noReviews}>Пока нет отзывов. Будьте первым!</div>
                )}
                <button onClick={openReviewModal} className={cl.addReviewButton}>Оставить отзыв</button>
            </section>
            </div>

            <div className={cl.eventActions}>
                <button onClick={ticketBook} className={cl.buyButton}>Купить билет</button>
            </div>

            {isReviewModalOpen && (
                <div className={cl.modalOverlay}>
                    <div className={cl.reviewModal}>
                        <h2>Оставить отзыв</h2>
                        <form onSubmit={sendReview} className={cl.reviewForm}>
                            <div className={cl.modalFormGroup}>
                                <label>Оценка (1-5):</label>
                                <select
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    className={cl.modalInput}
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={cl.modalFormGroup}>
                                <label>Комментарий:</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className={cl.modalTextarea}
                                    required
                                />
                            </div>
                            <div className={cl.modalActions}>
                                <button
                                    type="submit"
                                    className={cl.modalConfirmButton}
                                >
                                    Отправить
                                </button>
                                <button
                                    type="button"
                                    onClick={closeReviewModal}
                                    className={cl.modalCancelButton}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isModalOpen && (
                <div className={cl.modalOverlay}>
                    <div className={cl.modal}>
                        {notification && (
                            <div className={cl.notification}>
                                {notification}
                            </div>
                        )}
                        <h2>Покупка билетов</h2>
                        <p>Вы выбрали: {eventData.name}</p>

                        <form onSubmit={bookFormSend} className={cl.modalForm}>
                            <div className={cl.modalFormGroup}>
                                <label>Количество билетов:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={eventData.available_tickets}
                                    value={ticketCount}
                                    onChange={(e) => setTicketCount(Number(e.target.value))}
                                    className={cl.modalInput}
                                    required
                                />
                            </div>

                            <div className={cl.modalFormGroup}>
                                <label>Номер карты:</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="Введите номер карты"
                                    className={cl.modalInput}
                                    required
                                />
                            </div>

                            <div className={cl.modalFormGroup}>
                                <label>Срок действия:</label>
                                <input
                                    type="text"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    placeholder="ММ/ГГ"
                                    className={cl.modalInput}
                                    required
                                />
                            </div>

                            <div className={cl.modalFormGroup}>
                                <label>Имя владельца:</label>
                                <input
                                    type="text"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                    placeholder="Введите имя как на карте"
                                    className={cl.modalInput}
                                    required
                                />
                            </div>

                            <div className={cl.modalFormGroup}>
                                <label>CVV код:</label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    placeholder="CVV"
                                    className={cl.modalInput}
                                    required
                                />
                            </div>

                            <div className={cl.modalPrice}>
                                Итого: {eventData.price * ticketCount} ₽
                            </div>

                            <div className={cl.modalActions}>
                                <button
                                    type="submit"
                                    className={cl.modalConfirmButton}
                                >
                                    Подтвердить
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className={cl.modalCancelButton}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventPage;