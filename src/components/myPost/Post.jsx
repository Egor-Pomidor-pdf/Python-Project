import React from "react";
import { Link, useNavigate } from "react-router-dom";
import MyBytton from "../../UI/MyButton/MyBytton";
import cl from "./Post.module.css";
import im from "./image.png";
import MyImage from "../../UI/MyImage/MyImage";
import MyTooltip from "../../UI/Tooltip/MyTooltip";
import TicketBookForm from "../TicketBookForm";






const Post = ({
  id,
  name,
  date,
  body,
  city,
  price,
  available_tickets,
  tit,
  description,
  average_rating
}) => {
  return (
    <div className={cl.post}>
      <img src={im} className={cl.post__image} />

      <div className={cl.post__content}>
        <h2 className={cl.post__title}>{name}</h2>
        <p className={cl.post__desc}>
          {description}
        </p>
        <div className={cl.post__block}>
          <div className={cl.post__block__item}>
            <MyTooltip text={"Дата мероприятия"}>
              <p>{date}</p>
            </MyTooltip>
          </div>
          <div className={cl.post__block__item}>
            <MyTooltip text={"Город проведения"}>
              <p>{city}</p>
            </MyTooltip>
          </div>
          <div className={cl.post__block__item}>
            <MyTooltip text={"Цена"}>
              <p>{price}</p>
            </MyTooltip>
          </div>
          <div className={cl.post__block__item}>
            <MyTooltip text={"Количество билетов"}>
              <p>{available_tickets}</p>
            </MyTooltip>
          </div>
          <div className={cl.post__block__item}>
            <MyTooltip text={"оценка"}>
              <p>{average_rating}</p>
            </MyTooltip>
          </div>
          <Link
            to={`/event/${id}`}
            state={{
              id,
              name,
              date,
              body,
              city,
              price,
              available_tickets,
              tit,
              description,
              average_rating,
            }}>
            <MyBytton className={cl.post__btn} >Купить Билет</MyBytton>
          </Link>
        </div>
      </div>
    </div>
  );
};



export default Post;
