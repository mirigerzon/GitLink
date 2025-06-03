/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const Search = ({
  data,
  setFilteredData,
  searchFields = [],
  placeholder = "search...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });

    setFilteredData(filtered);
  }, [searchTerm, data, searchFields]);

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

      <style jsx>{`
        .search-container {
          margin-bottom: 20px;
        }

        .search-input-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .clear-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 20px;
          color: #666;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .clear-button:hover {
          background-color: #f0f0f0;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default Search;
