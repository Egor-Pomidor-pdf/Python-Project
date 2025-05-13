import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      middle_name: formData.middleName,
      username: formData.username,
      phone_number: formData.phoneNumber,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post(
        "http://26.65.201.207:8000/auth/register",
        userData
      );
      console.log("Регистрация успешна", response.data);
      navigate("/success");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      console.error("Ошибка регистрации:", errorMsg);
      alert("Ошибка регистрации: " + errorMsg);
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="register-page">
      <button className="home-button" onClick={goToHome}>
        
      </button>
      
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1 className="register-title">Регистрация</h1>

          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Имя"
            required
          />
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Фамилия"
            required
          />
          <Input
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Отчество"
          />
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Логин"
            required
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Почта"
            required
          />
          <Input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Телефон"
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            required
            minLength={6}
          />

          <button className="register-button" type="submit">
            Зарегистрироваться
          </button>

          <div className="login-link">
            Уже есть аккаунт? <a href="/login">Войти</a>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  minLength,
}) => (
  <div className="form-group">
    <input
      className="register-input"
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
    />
  </div>
);

export default RegisterPage;