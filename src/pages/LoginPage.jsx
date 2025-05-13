import React, { useContext, useState } from "react";
import { AuthContext } from "../context";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const userData = {
    login,
    password,
  };

  const loginFormSend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://26.65.201.207:8000/auth/login", userData);
      console.log("Вход успешно совершен");
      setIsAuth(true);
      localStorage.setItem("auth", "true");
      navigate("/"); 
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Неверный логин или пароль");
    }
  };

  const goToHome = (e) => {
    e.preventDefault();
    navigate("/"); 
  };

  return (
    <div className="login-page">
      <button className="home-button" onClick={goToHome}>⌂</button>
      
      <div className="login-container">
        <h1 className="login-title">Вход</h1>
        
        <form onSubmit={loginFormSend}>
          <div className="form-group">
            <input
              className="login-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              type="text"
              placeholder="Логин"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Пароль"
              required
            />
          </div>
          
          <button type="submit" className="login-button">Войти</button>
        </form>
        
        <div className="register-link">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </div>
      </div>
    </div>
  );
};

export default Login;