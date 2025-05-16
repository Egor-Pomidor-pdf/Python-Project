import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import cl from "./Navabar.module.css";
import logo from "./image/NavabarLogo.svg";
import axios from "axios";

const Navabar = () => {
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Очищаем данные авторизации
    setIsAuth(false);
    localStorage.removeItem("auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common['Authorization'];
    
    // Перенаправляем на страницу входа
    navigate("/login");
  };

  return (
    <div className={cl.navabar}>
      <div className={cl.navabar__links}>
        <Link className={`${cl.navabar__links__item} ${cl.navabar__links__item_post}`} to="/posts">
          <div className={cl.navabar__logo}>
            <img className={cl.navabar__logo__img} src={logo} alt="Логотип" />
            <h3 className={cl.navabar__logo__title}>ZibenАфиша</h3>
          </div>
        </Link>
        <div className={cl.navabar__links__logAndReg}>
          {/* Для авторизованных пользователей */}
          {isAuth && (
            <>
              <Link 
                className={`${cl.navabar__links__item} ${cl.navabar__links__item_reg}`} 
                to="/lkabinet"
              >
                Личный кабинет
              </Link>
              <Link 
                className={`${cl.navabar__links__item} ${cl.navabar__links__item_log}`} 
                to="/notifs"
              >
                Уведомления
              </Link>
              <button 
                onClick={handleLogout}
                className={`${cl.navabar__links__item} ${cl.navabar__links__item_logout}`}
              >
                Выйти
              </button>
            </>
          )}
          
          {/* Для неавторизованных пользователей */}
          {!isAuth && (
            <>
              <Link 
                className={`${cl.navabar__links__item} ${cl.navabar__links__item_reg}`} 
                to="/register"
              >
                Регистрация
              </Link>
              <Link 
                className={`${cl.navabar__links__item} ${cl.navabar__links__item_log}`} 
                to="/login"
              >
                Вход
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navabar;