/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from "react";
import '../../style/Sort.css'
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

  const memoizedSortOptions = useMemo(
    () => sortOptions,
    [JSON.stringify(sortOptions)]
  );
  const memoizedFilterOptions = useMemo(
    () => filterOptions,
    [JSON.stringify(filterOptions)]
  );

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (memoizedFilterOptions.length > 0) {
      result = result.filter((item) => {
        return memoizedFilterOptions.every((filterOption) => {
          const selectedValues = selectedFilters[filterOption.key];
          if (!selectedValues || selectedValues.length === 0) {
            return true;
          }

          const itemValue = item[filterOption.key];

          if (filterOption.type === "multiSelect") {
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
            return selectedValues.includes(itemValue);
          }

          return true;
        });
      });
    }

    if (sortBy) {
      result.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }

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

    return result;
  }, [
    // data,
    sortBy,
    sortOrder,
    selectedFilters,
    memoizedSortOptions,
    memoizedFilterOptions,
  ]);

  useEffect(() => {
    setFilteredData(filteredAndSortedData);
  }, [filteredAndSortedData, setFilteredData]);

  const handleFilterChange = useCallback((filterKey, value, isChecked) => {
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
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters({});
    setSortBy("");
  }, []);

  const getFilterValues = useCallback(
    (filterOption) => {
      const values = new Set();
      data.forEach((item) => {
        const value = item[filterOption.key];
        if (filterOption.type === "multiSelect" && typeof value === "string") {
          value.split(",").forEach((lang) => {
            const trimmed = lang.trim();
            if (trimmed) values.add(trimmed);
          });
        } else if (value !== undefined && value !== null) {
          values.add(value);
        }
      });
      return Array.from(values).sort();
    },
    [data]
  );

  return (
    <div className={`sort-container ${className}`}>
      {sortOptions.length > 0 && (
        <div className="sort-section">
          <h4>sort</h4>
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value=""> type</option>
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

      {(sortBy ||
        Object.keys(selectedFilters).some(
          (key) => selectedFilters[key]?.length > 0
        )) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            clear
          </button>
        )}
    </div>
  );
};

export default Sort;
