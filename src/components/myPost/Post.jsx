import React from "react";
import { Link } from "react-router-dom";
import MyBytton from "../../UI/MyButton/MyBytton";
import cl from "./Post.module.css";
import im from "./image.png";
import MyImage from "../../UI/MyImage/MyImage";
import MyTooltip from "../../UI/Tooltip/MyTooltip";
import TicketBookForm from "../TicketBookForm";
{/* <TicketBookForm id={id}/>
const popo = (e) => {
  return <TicketBookForm id={e.target.value}/>
} */}


const Post = ({
  id,
  name,
  date,
  body,
  city,
  price,
  available_tickets,
  tit,
}) => {
  return (
    <div className={cl.post}>
      <img src={im} className={cl.post__image} />

      <div className={cl.post__content}>
        <h2 className={cl.post__title}>{name}</h2>
        <p className={cl.post__desc}>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores,
          culpa porro. Voluptatem dolor aliquam quam qui modi, unde accusamus
          dolorem est, possimus, doloremque iste maiores ipsum aspernatur
          dignissimos vel suscipit.
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
            <MyBytton className={cl.post__btn}>Купить Билет</MyBytton>
        </div>
      </div>
    </div>
  );
};

{
  /* <button className="post__btn">
          Купить билет
        </button> */
}

export default Post;
