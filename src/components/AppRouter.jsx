import React, { useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PostsPage from "../pages/PostPage/PostsPage";
import Login from "../pages/LoginPage";
import { AuthContext } from "../context";
import Loader from "../UI/Loader/Loader";
import RegisterPage from "../pages/RegisterPage";
import BookingTicket from "../pages/BookingTicketPage";
import TicketGoodPage from "../pages/TIcketGoodPage";
import TicketBadPage from "../pages/TicketBadPage";

const AppRouter = () => {
  const { isAuth, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <Loader />;
  }
  return isAuth ? (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/booking" element={<BookingTicket/>}/>
      <Route path="/ticketGood" element={<TicketGoodPage/>}/>
      <Route path="/ticketBad" element={<TicketBadPage/>}/>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;
