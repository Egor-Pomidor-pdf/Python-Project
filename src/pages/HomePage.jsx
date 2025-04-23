import React from 'react';
import "../styles/App.css"

const HomePage = () => {
  return (
    <div className='Home' style={{padding: 15,
        background: "red"
    }}>
      <h1>Добро пожаловать в Ziben Афишу</h1>
      <img className='Home__Img' />
    </div>
  );
};

export default HomePage;