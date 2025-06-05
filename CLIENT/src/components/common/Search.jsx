import { useState, useEffect, useMemo } from "react";
import '../../style/Search.css';

const Search = ({ data, setFilteredData, searchFields = [], placeholder = "search...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const memoizedSearchFields = useMemo(
    () => searchFields,
    [JSON.stringify(searchFields)]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    return data.filter((item) => {
      return memoizedSearchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [searchTerm, data, memoizedSearchFields]);

  useEffect(() => {
    setFilteredData(filteredData);
  }, [filteredData, setFilteredData]);

  return (
    <div className={`search-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="clear-button"
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
