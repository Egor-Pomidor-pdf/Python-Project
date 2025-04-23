import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context";
import cl from "./Navabar.module.css";
import logo from "./image/NavabarLogo.svg";

const Navabar = () => {
  const { isAuth, setIsAuth } = useContext(AuthContext);
  return (
    <div className={cl.navabar}>
      <div className={cl.navabar__links}>
        <Link сlassName={`${cl.navabar__links__item} ${cl.navabar__links__item_post}`} to="/posts">
          <div className={cl.navabar__logo}>
            <img className={cl.navabar__logo__img} src={logo} />
            <h3 className={cl.navabar__logo__title}>ZibenАфиша</h3>
          </div>
        </Link>
        <div className={cl.navabar__links__logAndReg}>
            <Link className={`${cl.navabar__links__item} ${cl.navabar__links__item_reg}`} to="/register">
              регистрация
            </Link>
            <Link className={`${cl.navabar__links__item} ${cl.navabar__links__item_log}`} to="/login">
              вход
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Navabar;

// Страница "главная", будет ли использоваться?
{
  /* <Link className="nav__link" to="/home">Главная</Link> */
}
