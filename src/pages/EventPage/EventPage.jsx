import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import cl from "./EventPage.module.css"
import def from "./image/telegram-cloud-photo-size-2-5206223897693908661-y.jpg"


const EventPage = () => {
    const location = useLocation();
    const eventData = location.state;

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
                <p className={cl.descriptionText}>{eventData.body}</p>
            </section>
            
            <section className={cl.eventReview}>
                <h1 className={cl.sectionTitle}>ОТЗЫВЫ</h1>
                <p className={cl.descriptionText}>СЮДА БУДУИ ЗАКИДЫВАТЬ ОТЗЫВЫLorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus quas officiis, facere quaerat asperiores, fugiat, dolorum possimus dolorem in magni aliquam distinctio quam. Vel laborum neque, dicta beatae voluptatem perspiciatis!</p>
            </section>
        </div>

        <div className={cl.eventActions}>
            <button className={cl.buyButton}>Купить билет</button>
            <button className={cl.buyButton}>Оставить отзыв</button>
        </div>
    </div>
);
};

export default EventPage;
