import React, { useEffect, useState } from "react";
import Post from "../myPost/Post.jsx";
import cl from "./PostWithTitle.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostWithTitle = ({ posts, title }) => {
  const [isModerator, setIsModerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkModeratorStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get("/api/auth/check-moderator", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsModerator(response.data.isModerator);
        localStorage.setItem("isModerator", response.data.isModerator);
      } catch (error) {
        console.error("Ошибка проверки прав модератора:", error);
      }
    };

    checkModeratorStatus();
  }, []);

  return (
    <div>
      <h1 className={cl.title}>{title}</h1>
      {posts.map((p) => (
        <Post
          key={p.id}
          id={p.id}
          name={p.name}
          date={p.date}
          city={p.city}
          price={p.price}
          available_tickets={p.available_tickets}
          description={p.description}
          average_rating={p.average_rating}
          image_url={p.image_url}
          isModerator={isModerator}
          onEventUpdated={() => window.location.reload()}
          onEventDeleted={(deletedId) => {
            navigate(0);
          }}
        />
      ))}
    </div>
  );
};

export default PostWithTitle;