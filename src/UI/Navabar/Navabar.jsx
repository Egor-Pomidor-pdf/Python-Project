import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context"
import cl from "./Navabar.module.css"

const Navabar = () => {
    const {isAuth, setIsAuth} = useContext(AuthContext)
    return (
        <div className="cl.navabar">
            <div style={{display: "flex", justifyContent: "space-between", color: 'teal'}} className="navabar__links">
                <Link className="nav__link" to="/register">регистрация</Link>
                <Link className="nav__link" to="/home">Главная</Link>
                <Link className="nav__link" to="/posts">Посты</Link>
                <Link className="nav__link" to="/login">Вход</Link>
            </div>
        </div>
    )
}

export default Navabar