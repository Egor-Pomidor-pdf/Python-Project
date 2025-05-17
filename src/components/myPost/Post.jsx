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
    const checkSpecialistStatus = () => {
      if (!token) {
        setIsSpecialist(false);
        return;
      }
      
      // Проверяем статус модератора из localStorage
      const specialistStatus = localStorage.getItem("is_specialist") === "true";
      setIsSpecialist(specialistStatus);
    };

    checkSpecialistStatus();
  }, [token]);

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
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
        <span className={cl.ratingText}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Функция архивации события
  const handleArchive = async () => {
    if (!window.confirm("Вы уверены, что хотите архивировать это событие?")) {
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:8000/events/${id}/archive`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        onEventDeleted?.(id);
        alert("Событие успешно архивировано");
        window.location.reload();
      }
    } catch (error) {
      console.error("Archive error:", error);
      if (error.response?.status === 403) {
        alert("Ошибка: Нет прав для выполнения этого действия");
      } else if (error.response?.status === 404) {
        alert("Событие не найдено");
      } else {
        alert(`Ошибка архивации: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  // Функция удаления события
  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить это событие?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/events/${id}/delete`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        onEventDeleted?.(id);
        alert("Событие успешно удалено");
        navigate("/posts");
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response?.status === 403) {
        alert("Ошибка: Нет прав для выполнения этого действия");
      } else if (error.response?.status === 404) {
        alert("Событие не найдено");
      } else {
        alert(`Ошибка удаления: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  // Функция редактирования события
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
                <span className={cl.infoValue}>{new Date(date).toLocaleDateString()}</span>
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