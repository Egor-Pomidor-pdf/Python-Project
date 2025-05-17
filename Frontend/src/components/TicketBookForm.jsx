import axios from "axios";
import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const TicketBookForm = (event_id) => {
  const [ticket_count, setTicket_count] = useState(0);
  const [card_number, setCard_number] = useState("");
  const [expiry_date, setExpiry_date] = useState("");
  const [card_holder, setCard_holder] = useState("");
  const [cvv, setCvv] = useState("");
  const navigate = useNavigate();
  const bookingTicket = {
    book_data: {
      event_id,
      ticket_count,
    },
    payment_data: {
      card_number,
      expiry_date,
      card_holder,
      cvv,
    },
  };
  const bookFormSend = async (e) => {
    e.preventDefault();
    console.log(bookingTicket);
    await axios
      .post("http://26.65.201.207:8000/booking/book-ticket", bookingTicket)
      .then((response) => {
        console.log("Билет куплен");
        navigate("/ticketGood");
      })
      .catch((error) => {
        console.error("ОШИБКА", error);
        if (error.response) {
          console.log("Ответ от сервера:", error.response.data);
          console.error(error.response.data.detail[0].msg);
          navigate("/ticketBad");
        }
      });

    setTicket_count(0);
    setCard_number("");
    setExpiry_date("");
    setCard_holder("");
    setCvv("");
  };

  return (
    <div>
      <form
        onSubmit={bookFormSend}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          value={ticket_count}
          onChange={(e) => setTicket_count(Number(e.target.value))}
          type="number"
          placeholder="введите количестов билетов"
        />
        <input
          value={card_number}
          onChange={(e) => setCard_number(e.target.value)}
          type="text"
          placeholder="введите номер карты"
        />
        <input
          value={expiry_date}
          onChange={(e) => setExpiry_date(e.target.value)}
          type="text"
          placeholder="введите срок действия"
        />
        <input
          value={card_holder}
          onChange={(e) => setCard_holder(e.target.value)}
          type="text"
          placeholder="введите имя и фамилию, указанные на карте"
        />
        <input
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          type="text"
          placeholder="введите cvv код"
        />
        <button>Купить</button>
      </form>
    </div>
  );
};

export default TicketBookForm;
