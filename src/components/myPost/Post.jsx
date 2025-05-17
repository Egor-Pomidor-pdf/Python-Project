import React from "react";
import { Link } from "react-router-dom";
import MyBytton from "../../UI/MyButton/MyBytton";
import cl from "./Post.module.css";
import im from "./image.png";
import MyTooltip from "../../UI/Tooltip/MyTooltip";
import { Star } from "lucide-react"; // Или используйте свою иконку звезды
const token = localStorage.getItem('accessToken');
const Post = ({
  id,
  name,
  date,
  city,
  price,
  available_tickets,
  description,
  average_rating,
  image_url
}) => {
  // Функция для отображения рейтинга звездами
  const token = localStorage.getItem("accessToken");
  
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = rating; // Так как rating всегда целый (1.0, 2.0 и т.д.)
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          fill={i < fullStars ? "#FFD700" : "none"} 
          color={i < fullStars ? "#FFD700" : "#D3D3D3"} 
        />
      );
    }
    
    return (
      <div className={cl.ratingContainer}>
        {stars}
        <span className={cl.ratingText}>{rating}</span> {/* Просто выводим число */}
      </div>
    );
  };

  return (
    <div className={cl.post}>
      <img src={image_url} className={cl.post__image} alt={name} />
      
      <div className={cl.post__content}>
        <div className={cl.post__header}>
          <h2 className={cl.post__title}>{name}</h2>
          {average_rating && renderRating(average_rating)}
        </div>
        
        <p className={cl.post__desc}>{description}</p>
        
        <div className={cl.post__block}>
          <div className={cl.post__block__item}>
            <MyTooltip text="Дата мероприятия">
              <div className={cl.infoItem}>
                <span className={cl.infoLabel}>Дата</span>
                <span className={cl.infoValue}>{date}</span>
              </div>
            </MyTooltip>
          </div>
          
          <div className={cl.post__block__item}>
            <MyTooltip text="Город проведения">
              <div className={cl.infoItem}>
                <span className={cl.infoLabel}>Город</span>
                <span className={cl.infoValue}>{city}</span>
              </div>
            </MyTooltip>
          </div>
          
          <div className={cl.post__block__item}>
            <MyTooltip text="Цена">
              <div className={cl.infoItem}>
                <span className={cl.infoLabel}>Цена</span>
                <span className={cl.infoValue}>{price} ₽</span>
              </div>
            </MyTooltip>
          </div>
          
          <div className={cl.post__block__item}>
            <MyTooltip text="Количество билетов">
              <div className={cl.infoItem}>
                <span className={cl.infoLabel}>Билеты</span>
                <span className={cl.infoValue}>{available_tickets}</span>
              </div>
            </MyTooltip>
          </div>
          
          <Link
          
        to={token ? `/event/${id}` : '/login'}
            state={{
              id,
              name,
              date,
              city,
              price,
              available_tickets,
              description,
              average_rating,
              image_url

            }}
            className={cl.post__btnLink}
          >
            <MyBytton className={cl.post__btn}>Купить Билет</MyBytton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Post;