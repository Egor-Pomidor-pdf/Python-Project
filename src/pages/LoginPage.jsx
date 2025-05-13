import React, { useContext, useState } from "react";
import { AuthContext } from "../context";
import axios from "axios";
import PostService from "../API/PostService";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);

  const userData = {
    login,
    password,
  };

  const loginFormSend = async (e) => {
    e.preventDefault();

    
    await axios
      .post("http://26.65.201.207:8000/auth/login", userData)
      .then((response) => {
        console.log("Вход успешно совершен");
        setIsAuth(true);
        localStorage.setItem("auth", "true");
      })
      .catch((error) => console.error("ошибка:", error));
  };

  const exitFromAccount = (e) => {
    e.preventDefault();
    setIsAuth(false);
    localStorage.removeItem("auth");
  };

  return (
    <div>
      <h1>Страница для входа</h1>
      <form onSubmit={loginFormSend}>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          type="text"
          placeholder="введите логин"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="введите пароль"
        />
        <button>Вход</button>
      </form>
      <button onClick={exitFromAccount}>Выход</button>
    </div>
  );
};

export default Login;
