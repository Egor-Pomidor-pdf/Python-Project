import React, { useContext, useState } from "react";
import { AuthContext } from "../../context";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import cl from "./LoginPage.module.css";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const userData = {
    username: login,
    password,
    grant_type: "password",
    scope: "",
    client_id: "",
    client_secret: ""
  };

  const loginFormSend = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post("/auth/login", userData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", 
        },
      });
      
      const accessToken = response.data.access_token || response.data.token;
      const userIdentificator = response.data.user_id;
      
      if (accessToken) {
        console.log("Вход успешно совершен");
        setIsAuth(true);
        localStorage.setItem("auth", "true");
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userId", userIdentificator);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        navigate("/posts");
      }
    } catch (error) {
      console.error("Ошибка:", error.response?.data || error.message);
      setError("Ошибка входа. Проверьте логин и пароль.");
    } finally {
      setIsLoading(false);
    }
  };

  const exitFromAccount = (e) => {
    e.preventDefault();
    setIsAuth(false);
    localStorage.removeItem("auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common['Authorization'];
    navigate("/login");
  };

  return (
    <div className={cl.background}>
      <div className={cl.container}>
        <div className={cl.header}>
          <h1 className={cl.title}>Добро пожаловать</h1>
          <p className={cl.subtitle}>Введите ваши данные для входа</p>
        </div>
        
        <form onSubmit={loginFormSend} className={cl.form}>
          <div className={cl.inputGroup}>
            <label htmlFor="login" className={cl.label}>Логин</label>
            <input
              id="login"
              className={cl.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              type="text"
              placeholder="Введите ваш логин"
              required
            />
          </div>
          
          <div className={cl.inputGroup}>
            <label htmlFor="password" className={cl.label}>Пароль</label>
            <input
              id="password"
              className={cl.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          
          {error && <div className={cl.errorMessage}>{error}</div>}
          
          <button 
            type="submit" 
            className={cl.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={cl.spinner}></span>
            ) : (
              "Войти"
            )}
          </button>
        </form>
        
        {isAuth && (
          <button 
            onClick={exitFromAccount} 
            className={`${cl.button} ${cl.exitButton}`}
          >
            Выйти из аккаунта
          </button>
        )}
        
        <div className={cl.footer}>
          <p className={cl.footerText}>Нет аккаунта? <a href="/register" className={cl.link}>Зарегистрируйтесь</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;