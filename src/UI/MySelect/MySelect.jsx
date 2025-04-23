import React from "react";
import cl from "./MySelect.module.css"

const MySelect = ({ value, onChange, options, defaultValue}) => {
  return (
    <div className={cl.select}>
      <select className={cl.select__all} value={value} onChange={onChange}>
        <option className={cl.select__item}  value=''>{defaultValue}</option>
      {options.map((option) => (
        <option className={cl.select__item} value={option.value}>{option.name}</option>
      ))}
    </select>
    </div>
    
    
  );
};

export default MySelect;
