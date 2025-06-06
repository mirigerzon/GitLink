import '../../style/Sort.css'

function Sort({ type, setUserData, originalData }) {
  function filterByField(field, value) {
    if (!value || value === "all") {
      setUserData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) => {
      const fieldValue = item[field];

      // Handle different field types
      if (field === "is_active") {
        return fieldValue.toString() === value;
      }
      if (field === "experience") {
        const exp = Number(fieldValue);
        if (value === "junior") return exp <= 2;
        if (value === "mid") return exp >= 3 && exp <= 5;
        if (value === "senior") return exp >= 6;
      }
      if (field === "rating") {
        const rating = Number(fieldValue);
        if (value === "high") return rating >= 4;
        if (value === "medium") return rating >= 2 && rating < 4;
        if (value === "low") return rating < 2;
      }
      if (field === "languages") {
        return (
          fieldValue && fieldValue.toLowerCase().includes(value.toLowerCase())
        );
      }
      if (field === "role") {
        return (
          fieldValue && fieldValue.toLowerCase().includes(value.toLowerCase())
        );
      }

      return (
        fieldValue &&
        fieldValue.toString().toLowerCase().includes(value.toLowerCase())
      );
    });

    setUserData(filteredData);
  }

  if (type === "developers") {
    return (
      <div className="filter-container">
        <div className="filter-group">
          <label>Filter by Experience:</label>
          <select onChange={(e) => filterByField("experience", e.target.value)}>
            <option value="all">All Levels</option>
            <option value="junior">Junior (0-2 years)</option>
            <option value="mid">Mid (3-5 years)</option>
            <option value="senior">Senior (6+ years)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Role:</label>
          <select onChange={(e) => filterByField("role", e.target.value)}>
            <option value="all">All Roles</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Rating:</label>
          <select onChange={(e) => filterByField("rating", e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="high">High (4-5)</option>
            <option value="medium">Medium (2-3)</option>
            <option value="low">Low (0-1)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Language:</label>
          <select onChange={(e) => filterByField("languages", e.target.value)}>
            <option value="all">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="react">React</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>
      </div>
    );
  }

  // Jobs filters
  if (type === "jobs") {
    return (
      <div className="filter-container">
        <div className="filter-group">
          <label>Filter by Experience:</label>
          <select onChange={(e) => filterByField("experience", e.target.value)}>
            <option value="all">All Levels</option>
            <option value="junior">Junior (0-2 years)</option>
            <option value="mid">Mid (3-5 years)</option>
            <option value="senior">Senior (6+ years)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Technology:</label>
          <select onChange={(e) => filterByField("languages", e.target.value)}>
            <option value="all">All Technologies</option>
            <option value="react">React</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Views:</label>
          <select
            onChange={(e) => {
              if (e.target.value === "all") {
                setUserData(originalData);
                return;
              }
              const filtered = originalData.filter((item) => {
                const views = Number(item.views);
                if (e.target.value === "high") return views >= 50;
                if (e.target.value === "medium")
                  return views >= 10 && views < 50;
                if (e.target.value === "low") return views < 10;
              });
              setUserData(filtered);
            }}
          >
            <option value="all">All Views</option>
            <option value="high">High (50+)</option>
            <option value="medium">Medium (10-49)</option>
            <option value="low">Low (0-9)</option>
          </select>
        </div>
      </div>
    );
  }

  // Projects filters
  if (type === "projects") {
    return (
      <div className="filter-container">
        <div className="filter-group">
          <label>Filter by Technology:</label>
          <select onChange={(e) => filterByField("languages", e.target.value)}>
            <option value="all">All Technologies</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
            <option value="react">React</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by Rating:</label>
          <select onChange={(e) => filterByField("rating", e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="high">High (4-5)</option>
            <option value="medium">Medium (2-3)</option>
            <option value="low">Low (0-1)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter by forks:</label>
          <select
            onChange={(e) => {
              if (e.target.value === "all") {
                setUserData(originalData);
                return;
              }
              const filtered = originalData.filter((item) => {
                const forks_count = Number(item.forks_count);
                if (e.target.value === "high") return forks_count >= 50;
                if (e.target.value === "medium")
                  return forks_count >= 10 && forks_count < 50;
                if (e.target.value === "low") return forks_count < 10;
              });
              setUserData(filtered);
            }}
          >
            <option value="all">All forks</option>
            <option value="high">High (50+)</option>
            <option value="medium">Medium (10-49)</option>
            <option value="low">Low (0-9)</option>
          </select>
        </div>
      </div>
    );
  }

  return null;
}

export default Sort;
