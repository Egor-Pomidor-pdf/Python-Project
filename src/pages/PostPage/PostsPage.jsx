import React, { useEffect, useState } from "react";
import PostWithTitle from "../../components/PostWithTitle";
import PostService from "../../API/PostService";
import MySelect from "../../UI/MySelect/MySelect";
import Filter from "../../components/Filter/Filter";
import BookingTicket from "../BookingTicketPage";
import SearchBar from "../../components/SearchBar/SearchBar";
import Neo from "./image/HomeNeoZone.svg";
import cl from "./PostPage.module.css";
import axios from "axios";


const PostsPage = () => {
  const [filters, setFilters] = useState({
    name: '',
    date_from: '',
    date_to: '',
    city: '',
    genre: '',
    min_rating: '',
    price_min: '',
    price_max: ''
  });
  const [priceRange, setPriceRange] = useState([0, 10000]); // Для ползунка
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);


  const getRequestParams = () => {
    const params = {
      page: currentPage,
      page_size: pageSize
    };

    // Добавляем только заполненные фильтры
    if (filters.name) params.name = filters.name;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.city) params.city = filters.city;
    if (filters.genre) params.genre = filters.genre;
    if (filters.min_rating) params.min_rating = filters.min_rating;
    if (filters.price_min) params.price_min = filters.price_min;
    if (filters.price_max) params.price_max = filters.price_max;
    return params;
  };



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = getRequestParams();
        const response = await axios.get('/events/filter', { params });

        setPosts(response.data.events);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };

    fetchPosts();
  }, [currentPage, pageSize, filters]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      name: '',
      date_from: '',
      date_to: '',
      city: '',
      genre: '',
      min_rating: '',
      price_min: '',
      price_max: ''
    });
  };

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
          <div>
            <div className={cl.filters}>
              <input
                type="text"
                name="name"
                placeholder="Название"
                value={filters.name}
                onChange={handleFilterChange}
              />

              <input
                type="text"
                name="city"
                placeholder="Город"
                value={filters.city}
                onChange={handleFilterChange}
              />

              {/* Поля для цены */}
              <div className={cl.priceFilter}>
                <input
                  type="number"
                  name="price_min"
                  placeholder="Цена от"
                  value={filters.price_min}
                  onChange={handleFilterChange}
                  min="0"
                />

                <input
                  type="number"
                  name="price_max"
                  placeholder="Цена до"
                  value={filters.price_max}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>

              {/* Другие фильтры */}
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                placeholder="Дата от"
              />

              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                placeholder="Дата до"
              />

              <select
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
              >
                <option value="">Все жанры</option>
                <option value="спорт">Спорт</option>
                <option value="кино">Кино</option>
                <option value="театр">Театр</option>
                <option value="музыка">Музыка</option>
                <option value="магия">Магия</option>
                <option value="перфоманс">Перфоманс</option>
              </select>

              <button onClick={resetFilters} className={cl.resetButton}>
                Сбросить фильтры
              </button>
            </div>
            <label>
              Элементов на странице:
              <select value={pageSize} onChange={handlePageChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage}
              >
                {page}
              </button>
            ))}
          </div>

          <h3 className={cl.Filter__blotTitle__title}>Мероприятия</h3>
        </section>

        <PostWithTitle posts={posts} />
      </div>
      <div className={cl.test}></div>
    </div>
  );
};

export default PostsPage;
