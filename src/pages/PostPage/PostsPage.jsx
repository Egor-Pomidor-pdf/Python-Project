import React, { useEffect, useState } from "react";
import PostWithTitle from "../../components/PostWithTitle/PostWithTitle";
import MySelect from "../../UI/MySelect/MySelect";
import Filter from "../../components/Filter/Filter";
import BookingTicket from "../BookingTicketPage";
import SearchBar from "../../components/SearchBar/SearchBar";
import Neo from "./image/HomeNeoZone.svg";
import cl from "./PostPage.module.css";
import axios from "axios";
import MyInput from "../../UI/MyInput/MyInput";
import sImg from "./image/searchImg.png"; // Импортируйте иконку поиска
import { CircularProgress } from "@mui/material";


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
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [posts, setPosts] = useState([{},{},{},{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  const getRequestParams = () => {
    const params = {
      page: currentPage,
      page_size: pageSize
    };

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
        setIsLoading(true); // Включаем загрузку
        const params = getRequestParams();
        const response = await axios.get('/events/filter', { params });

        setPosts(response.data.events);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setIsLoading(false); // Выключаем загрузку независимо от результата
      }
    };

    fetchPosts();
  }, [currentPage, pageSize, filters]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

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
       {isLoading ? (
        <div className={cl.loaderContainer}>
          <CircularProgress size={80} thickness={4} color="primary" />
        </div>
      ) : (
      <div className="Post">
        {/* Основной заголовок и изображение */}
        <section className={cl.PostTitleWithImage}>
          <h1 className={cl.PostTitleWithImage__title}>
            Билеты на яркие впечатления — всего лишь в один клик!
          </h1>
          <img className={cl.PostTitleWithImage__img} src={Neo} alt="Neo Zone" />
        </section>

        {/* Поиск и кнопка фильтров */}
        <section className={cl.searchSection}>
          <div className={cl.searchContainer}>
            <SearchBar
              name="name"
              placeholder="Поиск по названию"
              value={filters.name}
              onChange={handleFilterChange}
            />
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={cl.filterButton}
            >
              Фильтры
            </button>
          </div>
        </section>

        {/* Модальное окно фильтров */}
        {isFilterModalOpen && (
          <div className={cl.modalOverlay}>
            <div className={cl.modalContent}>
              <h2>Фильтры</h2>
              <div className={cl.modalFilters}>
                <div className={cl.filterGroup}>
                  <label>Город</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Город"
                    value={filters.city}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className={cl.filterGroup}>
                  <label>Цена</label>
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
                </div>

                <div className={cl.filterGroup}>
                  <label>Дата</label>
                  <div className={cl.dateFilter}>
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
                  </div>
                </div>

                <div className={cl.filterGroup}>
                  <label>Жанр</label>
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
                </div>
              </div>

              <div className={cl.modalButtons}>
                <button onClick={resetFilters} className={cl.resetButton}>
                  Сбросить фильтры
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className={cl.applyButton}
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Пагинация и заголовок мероприятий */}
        <section className={cl.paginationSection}>
          <label className={cl.pageSizeSelector}>
            Элементов на странице:
            <select value={pageSize} onChange={handlePageChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <div className={cl.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
                className={page === currentPage ? cl.activePage : ''}
              >
                {page}
              </button>
            ))}
          </div>

          <h3 className={cl.eventsTitle}>Мероприятия</h3>
        </section>

        <PostWithTitle posts={posts} />
      </div>)}
    </div>
  );
};

export default PostsPage;