import React from 'react';
import cl from "./MyTooltip.module.css"

const MyTooltip = ({children, text}) => {
  return (
    <div className={cl.toltip}>
      {children}
      <div className={cl.toltip__text}>{text}</div>
    </div>
  );
};

export default MyTooltip;