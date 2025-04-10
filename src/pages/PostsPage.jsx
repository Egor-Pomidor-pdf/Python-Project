import React, { useEffect, useState } from "react";
import PostWithTitle from "../components/PostWithTitle";
import PostService from "../API/PostService";
import MySelect from "../UI/MySelect/MySelect";
import Filter from "../components/Filter";
import BookingTicket from "./BookingTicketPage";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState({ sort: "", query: "" });

  //первоначальная подгрузка постов

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  //подгрузка постов на основе фильтра
  const fetchPosts = async () => {
    const response = await PostService.getAll();
    const responseData = response.data
    if (filter.sort || filter.query) {
      setPosts(selectAndSearchedPost(responseData));
    } else {
      setPosts([...responseData]);
    }
  };

  //функции, реализующие фильтровку
  const selectPost = (posts) => {
    let s = [];
    if (filter.sort === "price") {
      s = [...posts].sort((a, b) => a[filter.sort] - b[filter.sort]);
    } else if (filter.sort === "") {
      s = [...posts];
    } else {
      s = [...posts].sort((a, b) =>
        a[filter.sort].localeCompare(b[filter.sort])
      );
    }
    return s;
  };

  const selectAndSearchedPost = (posts) => {
    return selectPost(posts).filter((post) =>
      post.name.toUpperCase().includes(filter.query.toUpperCase())
    );
  };

  //рендер функции
  return (
    <div className="App">
      <Filter filter={filter} setFilter={setFilter} />

      <PostWithTitle posts={posts} />
    </div>
  );
};

export default PostsPage;
