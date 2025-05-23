import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import "./styles/App.css";
import PostWithTitle from "./components/PostWithTitle/PostWithTitle";
import PostService from "./API/PostService";
import Navabar from "./UI/Navabar/Navabar";
import HomePage from "./pages/HomePage";
import AppRouter from "./components/AppRouter";
import { AuthContext } from "./context";
function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if(localStorage.getItem("auth")) {
      setIsAuth(true)
    } 
    setIsLoading(false)
  })

  return (
    <AuthContext.Provider value={{
      isAuth,
      setIsAuth,
      isLoading
    }}>
    <BrowserRouter>
    <Navabar/>
    <AppRouter/>
    </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;

