import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import cl from "./EventPage.module.css";
import def from "./image/Снимок экрана 2025-05-20 в 21.11.02 (2).png";

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

                const responseRev = await axios.get(`/events/reviews/${eventData.id}`);
                setReviews(responseRev.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchReviews();
    }, [eventData?.id, navigate]);

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

            const reviewData = {
                event_id: eventData.id,
                comment: comment,
            };

            await axios.post("/events/review", reviewData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: { user_id: userId }
            });

            setReviewNotification('Отзыв успешно отправлен!');
            setTimeout(() => setReviewNotification(''), 3000);
            
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
            setNotification('Билет успешно куплен!');
            setTimeout(() => setNotification(''), 3000);
            closeModal();
        } catch (error) {
            console.error("Ошибка:", error);
            setNotification(error.response?.data?.message || 'Ошибка при покупке билета');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    if (!eventData) {
        return (
            <div className={cl.errorContainer}>
                <div className={cl.errorContent}>
                    <h2>Данные не загружены</h2>
                    <p>Пожалуйста, перейдите к событию через главную страницу</p>
                    <Link to="/home" className={cl.homeLink}>На главную</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cl.background}>
            <div className={cl.eventContainer}>
                <header className={cl.eventHeader}>
                    <h1 className={cl.eventTitle}>{eventData.name}</h1>
                    <p className={cl.eventSubtitle}>{eventData.tit}</p>
                </header>

                <div className={cl.eventImageContainer}>
                    <img
                        src={eventData.image_url || def}
                        alt={eventData.name}
                        className={cl.eventImage}
                    />
                </div>

                <div className={cl.eventDetails}>
                    <section className={cl.eventInfo}>
                        <h2 className={cl.sectionTitle}>Информация</h2>
                        <div className={cl.infoGrid}>
                            <div className={cl.infoItem}>
                                <span className={cl.infoLabel}>Дата:</span>
                                <span className={cl.infoValue}>
                                    {new Date(eventData.date).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
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
                                <span className={cl.infoLabel}>Доступно:</span>
                                <span className={cl.infoValue}>{eventData.available_tickets} билетов</span>
                            </div>
                        </div>
                    </section>

                    <section className={cl.eventDescription}>
                        <h2 className={cl.sectionTitle}>Описание</h2>
                        <p className={cl.descriptionText}>{eventData.description}</p>
                    </section>

                    <section className={cl.eventReview}>
                        <div className={cl.reviewHeader}>
                            <h2 className={cl.sectionTitle}>Отзывы</h2>
                            <button onClick={openReviewModal} className={cl.addReviewButton}>
                                Оставить отзыв
                            </button>
                        </div>
                        
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
                                            <div className={cl.reviewAuthorInfo}>
                                                <span className={cl.reviewAuthor}>{review.username || "Аноним"}</span>
                                                <div className={cl.reviewStars}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.score ? cl.starFilled : cl.starEmpty}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className={cl.reviewDate}>
                                                {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div className={cl.reviewContent}>{review.comment}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={cl.noReviews}>Пока нет отзывов. Будьте первым!</div>
                        )}
                    </section>
                </div>

                <div className={cl.eventActions}>
                    <button onClick={ticketBook} className={cl.buyButton}>
                        Купить билет
                    </button>
                </div>

                {isReviewModalOpen && (
                    <div className={cl.modalOverlay}>
                        <div className={cl.modal}>
                            <button className={cl.closeButton} onClick={closeReviewModal}>×</button>
                            <h2 className={cl.modalTitle}>Оставить отзыв</h2>
                            <form onSubmit={sendReview} className={cl.modalForm}>
                                <div className={cl.formGroup}>
                                    <label className={cl.formLabel}>Ваша оценка</label>
                                    <div className={cl.starsInput}>
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <React.Fragment key={num}>
                                                <input
                                                    type="radio"
                                                    id={`star-${num}`}
                                                    name="rating"
                                                    value={num}
                                                    checked={score === num}
                                                    onChange={() => setScore(num)}
                                                    className={cl.radioInput}
                                                />
                                                <label
                                                    htmlFor={`star-${num}`}
                                                    className={cl.starLabel}
                                                >
                                                    ★
                                                </label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={cl.formGroup}>
                                    <label htmlFor="comment" className={cl.formLabel}>Комментарий</label>
                                    <textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className={cl.textarea}
                                        rows="5"
                                        required
                                    />
                                </div>
                                
                                <div className={cl.modalActions}>
                                    <button
                                        type="button"
                                        onClick={closeReviewModal}
                                        className={cl.secondaryButton}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className={cl.primaryButton}
                                    >
                                        Отправить отзыв
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className={cl.modalOverlay}>
                        <div className={cl.modal}>
                            <button className={cl.closeButton} onClick={closeModal}>×</button>
                            <h2 className={cl.modalTitle}>Покупка билетов</h2>
                            <p className={cl.modalSubtitle}>{eventData.name}</p>
                            
                            {notification && (
                                <div className={cl.notification}>
                                    {notification}
                                </div>
                            )}
                            
                            <form onSubmit={bookFormSend} className={cl.modalForm}>
                                <div className={cl.formGroup}>
                                    <label htmlFor="ticketCount" className={cl.formLabel}>Количество билетов</label>
                                    <input
                                        id="ticketCount"
                                        type="number"
                                        min="1"
                                        max={eventData.available_tickets}
                                        value={ticketCount}
                                        onChange={(e) => setTicketCount(Number(e.target.value))}
                                        className={cl.input}
                                        required
                                    />
                                </div>
                                
                                <div className={cl.paymentDetails}>
                                    <h3 className={cl.paymentTitle}>Данные карты</h3>
                                    
                                    <div className={cl.formGroup}>
                                        <label htmlFor="cardNumber" className={cl.formLabel}>Номер карты</label>
                                        <input
                                            id="cardNumber"
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="1234 5678 9012 3456"
                                            className={cl.input}
                                            required
                                        />
                                    </div>
                                    
                                    <div className={cl.cardInfoRow}>
                                        <div className={cl.formGroup}>
                                            <label htmlFor="expiryDate" className={cl.formLabel}>Срок действия</label>
                                            <input
                                                id="expiryDate"
                                                type="text"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                placeholder="ММ/ГГ"
                                                className={cl.input}
                                                required
                                            />
                                        </div>
                                        
                                        <div className={cl.formGroup}>
                                            <label htmlFor="cvv" className={cl.formLabel}>CVV</label>
                                            <input
                                                id="cvv"
                                                type="text"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                placeholder="123"
                                                className={`${cl.input} ${cl.input_mod}`}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={cl.formGroup}>
                                        <label htmlFor="cardHolder" className={cl.formLabel}>Имя владельца</label>
                                        <input
                                            id="cardHolder"
                                            type="text"
                                            value={cardHolder}
                                            onChange={(e) => setCardHolder(e.target.value)}
                                            placeholder="IVAN IVANOV"
                                            className={cl.input}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className={cl.totalPrice}>
                                    Итого: <span>{eventData.price * ticketCount} ₽</span>
                                </div>
                                
                                <div className={cl.modalActions}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={cl.secondaryButton}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className={cl.primaryButton}
                                    >
                                        Подтвердить покупку
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventPage;