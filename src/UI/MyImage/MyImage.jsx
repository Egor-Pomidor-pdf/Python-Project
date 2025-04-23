import React from 'react';
import cl from "./MyImage.module.css"

const MyImage = ({src}) => {
  return (
    <img className={cl.image} src={src} alt="" />
  );
};

export default MyImage;