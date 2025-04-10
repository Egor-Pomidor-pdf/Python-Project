import React from "react";
import Post from "./Post";

const PostWithTitle = ({ posts, title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {posts.map((p) => {
        return <Post id={p.id} name={p.name} date={p.date} city={p.city} price={p.price} available_tickets={p.available_tickets} tit={p.title}/>;
      })}
    </div>
  );
};

export default PostWithTitle;

// id: 1, id, name, date, body, city, price, available_tickets 
//       name: "Шаман",
//       date: "22.02.25 19:00:00",
//       body: "Вынос мозга",
//       city: "Киев",
//       price: 777,
//       available_tickets: 1,
