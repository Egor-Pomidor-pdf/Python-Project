import React, { Children } from 'react';
import cl from "./MyBytton.module.css"

const MyBytton = ({children, className, ...props}) => {
  return (
    <button {...props} className={`${className} ${cl.myBytton}`}>{children}</button>
  );
};

export default MyBytton;