import axios from "axios";
import React, { useState } from "react";
import cl from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferences, setPreferences] = useState([]);

  const preferenceOptions = [
    "Спорт",
    "Кино",
    "Музыка",
    "Книги",
    "Путешествия",
    "Технологии",
    "Кулинария",
    "Искусство"
  ];

  const handlePreferenceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions)
      .map(option => option.value);
    setPreferences(selectedOptions);
  };

  const userData = {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    username: username,
    phone_number: phoneNumber,
    email: email,
    password: password,
    preferences: preferences
  };

  const RegisterFormSend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/register", userData);
      console.log("Данные успешно отправлены", response.data);
      
      setLastName("");
      setFirstName("");
      setMiddleName("");
      setUsername("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setPreferences([]);
    } catch (error) {
      console.error("Ошибка", error.response?.data || error.message);
    }
  };

  return (
    <div className={cl.container}>
      <h1 className={cl.title}>Регистрация</h1>
      <form onSubmit={RegisterFormSend} className={cl.form}>
        <input
          className={cl.input}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          type="text"
          placeholder="Имя"
          required
        />
        <input
          className={cl.input}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          type="text"
          placeholder="Фамилия"
          required
        />
        <input
          className={cl.input}
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          type="text"
          placeholder="Отчество"
        />
        <input
          className={cl.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Логин"
          required
        />
        <input
          className={cl.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Почта"
          required
        />
        <input
          className={cl.input}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          type="tel"
          placeholder="Телефон"
        />
        <input
          className={cl.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Пароль"
          required
        />
        
        <label htmlFor="preferences" className={cl.label}>Предпочтения:</label>
        <select
          id="preferences"
          className={cl.select}
          multiple
          value={preferences}
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
        
        <button type="submit" className={cl.button}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;