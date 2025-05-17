import axios from "axios";
import React, { useContext, useState } from "react";
import cl from "./RegisterPage.module.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    city: "",
    preferences: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsAuth } = useContext(AuthContext);

  const preferenceOptions = [
    "спорт",
    "кино",
    "театр",
    "музыка",
    "магия",
    "перфоманс",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions)
      .map(option => option.value);
    setFormData(prev => ({
      ...prev,
      preferences: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      setIsAuth(false);
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      delete axios.defaults.headers.common['Authorization'];

      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName,
        username: formData.username,
        phone_number: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        preferences: formData.preferences,
        city: formData.city
      };

      const response = await axios.post("/auth/register", userData);
      console.log("Регистрация успешна", response.data);
      
      navigate("/login", {
        state: { registrationSuccess: true }
      });
      
    } catch (error) {
      console.error("Ошибка регистрации", error.response?.data || error.message);
      setError(error.response?.data?.message || "Произошла ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cl.background}>
      <div className={cl.container}>
        <div className={cl.header}>
          <h1 className={cl.title}>Создайте аккаунт</h1>
          <p className={cl.subtitle}>Заполните форму для регистрации</p>
        </div>
        
        {error && <div className={cl.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={cl.form}>
          <div className={cl.formGrid}>
            <div className={cl.inputGroup}>
              <label htmlFor="firstName" className={cl.label}>Имя*</label>
              <input
                id="firstName"
                name="firstName"
                className={cl.input}
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="Ваше имя"
                required
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="lastName" className={cl.label}>Фамилия*</label>
              <input
                id="lastName"
                name="lastName"
                className={cl.input}
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Ваша фамилия"
                required
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="middleName" className={cl.label}>Отчество</label>
              <input
                id="middleName"
                name="middleName"
                className={cl.input}
                value={formData.middleName}
                onChange={handleChange}
                type="text"
                placeholder="Ваше отчество"
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="username" className={cl.label}>Логин*</label>
              <input
                id="username"
                name="username"
                className={cl.input}
                value={formData.username}
                onChange={handleChange}
                type="text"
                placeholder="Придумайте логин"
                required
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="email" className={cl.label}>Email*</label>
              <input
                id="email"
                name="email"
                className={cl.input}
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Ваш email"
                required
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="phoneNumber" className={cl.label}>Телефон</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                className={cl.input}
                value={formData.phoneNumber}
                onChange={handleChange}
                type="tel"
                placeholder="Ваш телефон"
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="password" className={cl.label}>Пароль*</label>
              <input
                id="password"
                name="password"
                className={cl.input}
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Придумайте пароль"
                required
              />
            </div>
            
            <div className={cl.inputGroup}>
              <label htmlFor="city" className={cl.label}>Город</label>
              <input
                id="city"
                name="city"
                className={cl.input}
                value={formData.city}
                onChange={handleChange}
                type="text"
                placeholder="Ваш город"
              />
            </div>
          </div>
          
          <div className={cl.inputGroup}>
            <label htmlFor="preferences" className={cl.label}>Предпочтения</label>
            <select
              id="preferences"
              className={cl.select}
              multiple
              value={formData.preferences}
              onChange={handlePreferenceChange}
              size="5"
            >
              {preferenceOptions.map((option) => (
                <option key={option} value={option} className={cl.option}>
                  {option}
                </option>
              ))}
            </select>
            <small className={cl.hint}>
              Для выбора нескольких удерживайте Ctrl (Windows) или Command (Mac)
            </small>
          </div>
          
          <button 
            type="submit" 
            className={cl.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={cl.spinner}></span>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>
        
        <div className={cl.footer}>
          <p className={cl.footerText}>
            Уже есть аккаунт? <a href="/login" className={cl.link}>Войдите</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;