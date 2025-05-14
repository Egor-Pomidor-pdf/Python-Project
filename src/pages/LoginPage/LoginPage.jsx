import React, { useContext, useState } from "react";
import { AuthContext } from "../../context";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate
import cl from "./LoginPage.module.css";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate(); // Хук для навигации

  const userData = {
    username: login,
    password,
    grant_type: "password",
    scope: "сука",
    client_id: "сука",
    client_secret: "сука"
  };

  const loginFormSend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", userData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", 
        },
      });
      
      // Сохраняем токен из ответа сервера
      const accessToken = response.data.access_token || response.data.token;
      const userIdentificator = response.data.user_id;
      
      if (accessToken) {
        console.log("Вход успешно совершен");
        setIsAuth(true);
        localStorage.setItem("auth", "true");
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", userIdentificator);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        navigate("./posts")
        
      }
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      alert("Ошибка входа. Проверьте логин и пароль.");
    }
  };

  const exitFromAccount = (e) => {
    e.preventDefault();
    setIsAuth(false);
    localStorage.removeItem("auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common['Authorization'];
    navigate("/login"); // Перенаправляем обратно на страницу входа
  };

  return (
    <div className={cl.container}>
      <h1 className={cl.title}>Вход в систему</h1>
      <form onSubmit={loginFormSend} className={cl.form}>
        <input
          className={cl.input}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          type="text"
          placeholder="Введите логин"
          required
        />
        <input
          className={cl.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Введите пароль"
          required
        />
        <button type="submit" className={cl.button}>Войти</button>
      </form>
      {isAuth && (
        <button onClick={exitFromAccount} className={`${cl.button} ${cl.exitButton}`}>
          Выйти из аккаунта
        </button>
      )}
    </div>
  );
};

export default Login;