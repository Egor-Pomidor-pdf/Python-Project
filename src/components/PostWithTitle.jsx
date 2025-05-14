import React from "react";
import Post from "../components/myPost/Post.jsx";

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
          />
        );
      }
      })}
    </div>
  );
};

export default PostWithTitle;
