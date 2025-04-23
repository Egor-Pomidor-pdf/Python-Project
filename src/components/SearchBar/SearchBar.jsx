import React from 'react';
import MyInput from '../../UI/MyInput/MyInput';
import sImg from "./searchImg.png"
import cl from "./SearchBar.module.css"

const SearchBar = ({...props}) => {
  return (
    <div className={cl.searchBar}>
        <div className={cl.searchBar__img}><img className={cl.searchBar__img} src={sImg}/></div>
        <MyInput {...props} className={cl.searchBar__input}/></div>
    
  );
};

export default SearchBar;