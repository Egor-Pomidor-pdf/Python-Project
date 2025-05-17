import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MyBytton from "../../UI/MyButton/MyBytton";
import cl from "./Post.module.css";
import MyTooltip from "../../UI/Tooltip/MyTooltip";
import { Star, Archive, Trash2, Edit } from "lucide-react";
import axios from "axios";

const Post = ({
  id,
  name,
  date,
  city,
  price,
  available_tickets,
  description,
  average_rating,
  image_url,
  onEventUpdated,
  onEventDeleted
}) => {
  const [isSpecialist, setIsSpecialist] = useState(false);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get("/api/auth/check-specialist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsSpecialist(response.data.is_specialist);
      } catch (error) {
        console.error("Ошибка проверки прав специалиста:", error);
      }
    };

    checkSpecialistStatus();
  }, [token]);

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = rating;
    
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
        <span className={cl.ratingText}>{rating}</span>
      </div>
    );
  };

  const handleArchive = async () => {
    try {
      await axios.patch(`/api/events/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onEventUpdated?.();
    } catch (error) {
      console.error("Ошибка при архивировании:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onEventDeleted?.(id);
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/event/${id}/edit`, {
      state: {
        id,
        name,
        date,
        city,
        price,
        available_tickets,
        description,
        image_url
      }
    });
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

          {isSpecialist && (
            <div className={cl.moderatorControls}>
              <MyTooltip text="Редактировать">
                <button onClick={handleEdit} className={cl.controlButton}>
                  <Edit size={18} />
                </button>
              </MyTooltip>
              
              <MyTooltip text="Архивировать">
                <button onClick={handleArchive} className={cl.controlButton}>
                  <Archive size={18} />
                </button>
              </MyTooltip>
              
              <MyTooltip text="Удалить">
                <button onClick={handleDelete} className={cl.controlButton}>
                  <Trash2 size={18} />
                </button>
              </MyTooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;