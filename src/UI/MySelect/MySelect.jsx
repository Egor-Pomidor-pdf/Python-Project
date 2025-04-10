import React from "react";

const MySelect = ({ value, onChange, options, defaultValue}) => {
  return (
    <select value={value} onChange={onChange}>
        <option  value=''>{defaultValue}</option>
      {options.map((option) => (
        <option value={option.value}>{option.name}</option>
      ))}
    </select>
  );
};

export default MySelect;
