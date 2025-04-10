import React from 'react';
import MySelect from '../UI/MySelect/MySelect';

const Filter = ({filter, setFilter}) => {
    
  return (
    <div>
      <input
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