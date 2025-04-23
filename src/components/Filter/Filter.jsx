import React from "react";
import MySelect from "../../UI/MySelect/MySelect";
import MyInput from "../../UI/MyInput/MyInput";
import SearchBar from "../SearchBar/SearchBar";

const Filter = ({ filter, setFilter, styleForFilter }) => {
  return (
    <div className={styleForFilter}>
      <SearchBar
        value={filter.query}
        onChange={(e) => setFilter({ ...filter, query: e.target.value })}
        type="text"
        placeholder="Поиск по названию"
      />

      <MySelect
        onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
        value={filter.sort}
        defaultValue={"Сортировка по"}
        options={[
          { value: "name", name: "по названию" },
          { value: "price", name: "по цене" },
          { value: "date", name: "по дате" },
        ]}
      />
    </div>
  );
};

export default Filter;
