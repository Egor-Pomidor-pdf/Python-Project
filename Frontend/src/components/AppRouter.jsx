import React, { useContext, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PostsPage from "../pages/PostPage/PostsPage";
import { AuthContext } from "../context";
import Loader from "../UI/Loader/Loader";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import BookingTicket from "../pages/BookingTicketPage";
import TicketGoodPage from "../pages/TIcketGoodPage";
import TicketBadPage from "../pages/TicketBadPage";
import EventPage from "../pages/EventPage/EventPage";
import LkPage from "../pages/LkPage/LkPage";
import Login from "../pages/LoginPage/LoginPage";
import NotificationsPage from "../pages/NotificationsPage/NotificationsPage";

const AppRouter = () => {
  const { isAuth, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <Loader />;
  }


  const authRoutes = [
    // { path: "/home", element: <HomePage /> },
    { path: "/posts", element: <PostsPage /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/booking", element: <BookingTicket /> },
    { path: "/ticketGood", element: <TicketGoodPage /> },
    { path: "/ticketBad", element: <TicketBadPage /> },
    { path: "/event/:id", element: <EventPage /> },
    { path: "*", element: <Navigate to="/posts" replace /> },
    {path: "/lkabinet", element: <LkPage/>},
    {path: "/notifs", element: <NotificationsPage/>}
  ]

  const publicRoutes = [
    { path: "/posts", element: <PostsPage /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "*", element: <Navigate to="/posts" replace /> }
  ];


  return (
    <Routes>
     {(isAuth ? authRoutes : publicRoutes).map((route, index) => (
      <Route key={index} path={route.path} element={route.element}/>
     ))}
    </Routes>
  );
};

export default AppRouter;
