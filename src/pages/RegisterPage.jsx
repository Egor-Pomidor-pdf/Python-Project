import axios from "axios";
import React, { useState } from "react";
import './RegisterPage.css';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userData = {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    username: username,
    phone_number: phoneNumber,
    email: email,
    password: password,
  };


  const RegisterFormSend = async (e) => {
    e.preventDefault();
    await axios
      .post("http://26.65.201.207:8000/auth/register", userData)
      .then((response) => {
        console.log("данные успешно отправлены");
      })
      .catch((error) => {
        console.error("ошибка", error);
      });

    setLastName("");
    setFirstName("");
    setMiddleName("");
    setUsername("");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
  };
  return (
    <div>
      <h1>Введите свои данные для регистрации</h1>
      <form
        onSubmit={RegisterFormSend}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          type="text"
          placeholder="Имя"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          type="text"
          placeholder="Фамилия"
        />
        <input
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          type="text"
          placeholder="Отчество"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Логин"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Почта"
        />
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          type="text"
          placeholder="Телефон"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Пароль"
        />
        <button>Зарeгистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterPage;
