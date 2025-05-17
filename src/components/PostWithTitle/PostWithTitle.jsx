import React from "react";
import Post from "../myPost/Post.jsx";
import cl from "./PostWithTitle.module.css"

const PostWithTitle = ({ posts, title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {posts.map((p, i) => { {
        
        return (
          <Post
            id={p.id}
            name={p.name}
            date={p.date}
            city={p.city}
            price={p.price}
            available_tickets={p.available_tickets}
            tit={p.title}
            description={p.description}
            average_rating={p.average_rating}
            image_url={p.image_url}
          />
        );
      }
      })}
    </div>
  );
};

export default PostWithTitle;
