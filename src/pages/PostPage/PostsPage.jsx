import React, { useEffect, useState } from "react";
import PostWithTitle from "../../components/PostWithTitle/PostWithTitle";
import MySelect from "../../UI/MySelect/MySelect";
import Filter from "../../components/Filter/Filter";
import BookingTicket from "../NoUsedPages/BookingTicketPage";
import SearchBar from "../../components/SearchBar/SearchBar";
import Neo from "./image/HomeNeoZone.svg";
import cl from "./PostPage.module.css";
import axios from "axios";
import MyInput from "../../UI/MyInput/MyInput";
import sImg from "./image/searchImg.png";
import { CircularProgress } from "@mui/material";
import MyBytton from "../../UI/MyButton/MyBytton";

const PostsPage = () => {
  // Состояния для формы создания мероприятия
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState(0);
  const [availableTickets, setAvailableTickets] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [genre, setGenre] = useState('');

  // Состояния для фильтрации и пагинации
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
  const [posts, setPosts] = useState([{}, {}, {}, {}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isModerator, setIsModerator] = useState(false);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
  
    // Проверка токена
    if (!token) {
      alert("Токен отсутствует. Пожалуйста, войдите в систему.");
      return;
    }
  
    // Проверка на пустые строки
    if (!name || !date || !city || !genre || !description || !imageUrl) {
      alert("Все поля обязательны и не могут быть пустыми!");
      return;
    }
  
    // Проверка формата даты
    if (!date || new Date(date).toString() === "Invalid Date") {
      alert("Пожалуйста, выберите корректную дату!");
      return;
    }
  
    // Проверка на положительные значения
    if (price <= 0 || availableTickets <= 0) {
      alert("Цена и количество билетов должны быть больше нуля!");
      return;
    }
  
    // Проверка формата image_url
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(imageUrl)) {
      alert("Пожалуйста, укажите валидный URL для изображения (начинается с http:// или https://)!");
      return;
    }
  
    // Логирование отправляемых данных
    console.log("Отправляемые данные:", {
      name,
      date,
      city,
      price,
      available_tickets: availableTickets,
      description,
      image_url: imageUrl,
      genre,
    });
  
    try {
      const response = await axios.post(
        "/events/create",
        {
          name,
          date,
          city,
          price,
          available_tickets: availableTickets,
          description,
          image_url: imageUrl,
          genre,
        },
        { params: {
          token: token,
      },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      alert("Мероприятие успешно создано!");
      setName("");
      setDate("");
      setCity("");
      setPrice(0);
      setAvailableTickets(0);
      setDescription("");
      setImageUrl("");
      setGenre("");
  
      const params = getRequestParams();
      const updatedResponse = await axios.get("/events/filter", { params });
      setPosts(updatedResponse.data.events);
    } catch (error) {
      console.error("Полный ответ сервера:", error.response);
      console.error("Данные ошибки:", error.response?.data);
      alert(error.response?.data?.message || "Ошибка создания мероприятия");
    }
  }; 

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
        if (isInitialLoad) {
          setIsLoading(true);
        }
        const params = getRequestParams();
        const response = await axios.get('/events/filter', { params });

        setPosts(response.data.events);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchPosts();
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    const checkModeratorStatus = async () => {
      try {
        const spec = localStorage.getItem("is_specialist");
        if (spec) { setIsModerator(true); }
      } catch (error) {
        console.error("Ошибка проверки прав модератора:", error);
      }
    };

    checkModeratorStatus();
  }, []);

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
          <section className={cl.PostTitleWithImage}>
            <h1 className={cl.PostTitleWithImage__title}>
              Билеты на яркие впечатления — всего лишь в один клик!
            </h1>
            <img className={cl.PostTitleWithImage__img} src={Neo} alt="Neo Zone" />
          </section>

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
                      <span>от</span>
                      <input
                        type="date"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleFilterChange}
                        placeholder="Дата от"
                      />
                      <span>до</span>
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

          {isModerator && (
            <div className={cl.createEventForm}>
              <h3>Создать новое мероприятие</h3>
              <form onSubmit={handleCreateEvent}>
                <MyInput
                  placeholder="Название мероприятия"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <MyInput
                  type="date"
                  placeholder="Дата мероприятия"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <MyInput
                  placeholder="Город"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <MyInput
                  type="number"
                  placeholder="Цена"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min="0"
                  required
                />
                <MyInput
                  type="number"
                  placeholder="Количество билетов"
                  value={availableTickets}
                  onChange={(e) => setAvailableTickets(Number(e.target.value))}
                  min="0"
                  required
                />
                <MyInput
                  placeholder="Описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <MyInput
                  placeholder="Ссылка на изображение"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className={cl.selectInput}
                  required
                >
                  <option value="">Выберите жанр</option>
                  <option value="концерт">Концерт</option>
                  <option value="театр">Театр</option>
                  <option value="кино">Кино</option>
                  <option value="спорт">Спорт</option>
                  <option value="выставка">Выставка</option>
                  <option value="фестиваль">Фестиваль</option>
                </select>
                <MyBytton type="submit">Создать мероприятие</MyBytton>
              </form>
            </div>
          )}

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
        </div>
      )}
    </div>
  );
};

export default PostsPage;