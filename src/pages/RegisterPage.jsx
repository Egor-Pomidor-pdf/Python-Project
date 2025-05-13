import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './RegisterPage.css';

const AuthPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Номер отправлен:", phoneNumber);
    setPhoneNumber("");
  };

  return (
    <div className="auth-page">
      {/* Кнопка назад */}
      <button className="back-button" onClick={() => navigate("/")}>
        ← Назад
      </button>
      
      <div className="auth-logo">Регистрация</div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label className="input-label">Номер</label>
          <input
            className="auth-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="tel"
            placeholder="Введите ваш номер"
            required
          />
        </div>
        
        <button className="auth-button" type="submit">
          Далее
        </button>
      </form>
    </div>
  );
};

export default AuthPage;