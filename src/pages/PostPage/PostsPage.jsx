import React, { useEffect, useState } from "react";
import PostWithTitle from "../../components/PostWithTitle";
import PostService from "../../API/PostService";
import MySelect from "../../UI/MySelect/MySelect";
import Filter from "../../components/Filter/Filter";
import BookingTicket from "../BookingTicketPage";
import SearchBar from "../../components/SearchBar/SearchBar";
import Neo from "./image/HomeNeoZone.svg";
import cl from "./PostPage.module.css";


const PostsPage = () => {
  const [posts, setPosts] = useState([{}, {}, {}, {}]);
  const [filter, setFilter] = useState({ sort: "", query: "" });

  //первоначальная подгрузка постов

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  //подгрузка постов на основе фильтра
  const fetchPosts = async () => {
    const response = await PostService.getAll();
    const responseData = response.data;
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
      <div className="Post">
        {/* оснвой заголовок и изображение */}
        <section className={cl.PostTitleWithImage}>
          <h1 className={cl.PostTitleWithImage__title}>
            Билеты на яркие впечатления — всего лишь в один клик!
          </h1>
          <img className={cl.PostTitleWithImage__img} src={Neo} />
        </section>

        {/* фильтр и заголовок "мероприятия" */}
        <section className={cl.Filter}>
          <Filter
            styleForFilter={cl.Filter__SearchAndSelect}
            filter={filter}
            setFilter={setFilter}
          />
          <h3 className={cl.Filter__blotTitle__title}>Мероприятия</h3>
        </section>

        <PostWithTitle posts={posts} />
      </div>
      <div className={cl.test}></div>
    </div>
  );
};

export default PostsPage;

{
  /* <div className={cl.Filter__blotTitle}>
        <div className={cl.Filter__blotTitle__Stars}>
            <img src={FIlterStars}/>
            <img src={pinStar}/>
            <img className={`${cl.Filter__blotTitle__Blot} ${cl.Filter__blotTitle__Blot__Big}`} src={left}/>
            <img src={pinStar}/>
          </div>
        
          <img className={cl.Filter__blotTitle__Blot} src={left}/>
          <h2 className={cl.Filter__blotTitle__title}>Мероприятия</h2>
          <img className={cl.Filter__blotTitle__Blot} src={right}/>
          
          <div className={cl.Filter__blotTitle__Stars}>
            <img src={pinStar}/>
            
            <img className={`${cl.Filter__blotTitle__Blot} ${cl.Filter__blotTitle__Blot__Big}`} src={right}/>
            <img src={pinStar}/>
            <img src={pinStar}/>
          </div>

        </div>
         */
}
