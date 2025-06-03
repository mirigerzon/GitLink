/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

const Sort = ({
  data,
  setFilteredData,
  sortOptions = [],
  filterOptions = [],
  className = "",
}) => {
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    let result = [...data];

    // Apply filters first
    if (filterOptions.length > 0) {
      result = result.filter((item) => {
        return filterOptions.every((filterOption) => {
          const selectedValues = selectedFilters[filterOption.key];
          if (!selectedValues || selectedValues.length === 0) {
            return true; // No filter applied
          }

          const itemValue = item[filterOption.key];

          if (filterOption.type === "multiSelect") {
            // For multi-select (like languages), check if any selected language exists in item
            if (typeof itemValue === "string") {
              const itemLanguages = itemValue
                .split(",")
                .map((lang) => lang.trim());
              return selectedValues.some((selected) =>
                itemLanguages.some((lang) =>
                  lang.toLowerCase().includes(selected.toLowerCase())
                )
              );
            }
          } else if (filterOption.type === "select") {
            // For single select
            return selectedValues.includes(itemValue);
          }

          return true;
        });
      });
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle numeric values
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Handle string values
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (sortOrder === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        return 0;
      });
    }

    setFilteredData(result);
  }, [data, sortBy, sortOrder, selectedFilters, sortOptions, filterOptions]);

  const handleFilterChange = (filterKey, value, isChecked) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterKey] || [];
      let newValues;

      if (isChecked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      return {
        ...prev,
        [filterKey]: newValues,
      };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSortBy("");
  };

  // Get unique values for filter options
  const getFilterValues = (filterOption) => {
    const values = new Set();
    data.forEach((item) => {
      const value = item[filterOption.key];
      if (filterOption.type === "multiSelect" && typeof value === "string") {
        // For languages, split by comma
        value.split(",").forEach((lang) => {
          const trimmed = lang.trim();
          if (trimmed) values.add(trimmed);
        });
      } else if (value !== undefined && value !== null) {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  return (
    <div className={`sort-container ${className}`}>
      {/* Sort Controls */}
      {sortOptions.length > 0 && (
        <div className="sort-section">
          <h4>מיון</h4>
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">בחר מיון</option>
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            {sortBy && (
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="order-select"
              >
                <option value="asc">עולה</option>
                <option value="desc">יורד</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      {filterOptions.length > 0 && (
        <div className="filter-section">
          <h4>Sort</h4>
          {filterOptions.map((filterOption) => (
            <div key={filterOption.key} className="filter-group">
              <label className="filter-label">{filterOption.label}:</label>
              <div className="filter-options">
                {getFilterValues(filterOption).map((value) => (
                  <label key={value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(
                        selectedFilters[filterOption.key] || []
                      ).includes(value)}
                      onChange={(e) =>
                        handleFilterChange(
                          filterOption.key,
                          value,
                          e.target.checked
                        )
                      }
                    />
                    <span className="checkbox-text">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Filters Button */}
      {(sortBy ||
        Object.keys(selectedFilters).some(
          (key) => selectedFilters[key]?.length > 0
        )) && (
        <button onClick={clearFilters} className="clear-filters-btn">
          נקה הכל
        </button>
      )}

      <style jsx>{`
        .sort-container {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .sort-section,
        .filter-section {
          margin-bottom: 20px;
        }

        .sort-section h4,
        .filter-section h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 16px;
        }

        .sort-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sort-select,
        .order-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .filter-group {
          margin-bottom: 15px;
        }

        .filter-label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #555;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .checkbox-label:hover {
          background-color: #f0f0f0;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .checkbox-text {
          font-size: 14px;
          color: #333;
        }

        .clear-filters-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }

        .clear-filters-btn:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default Sort;
