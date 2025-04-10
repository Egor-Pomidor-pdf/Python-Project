import React from "react";
import image from "../image/image.png";
import { Link } from "react-router-dom";
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
    <div className="post">
      <div className="post__content">
        <h2>{name}</h2>
        <h3>{date}</h3>
        <h4>{city}</h4>
        <h4>{price}</h4>
        <p>{tit}</p>
        <h4>{available_tickets}</h4>
      </div>
      <Link to="/booking"
      state={{id}}>
        <button className="post__btn">
          Купить билет
        </button>
      </Link>
    </div>
  );
};



export default Post;
