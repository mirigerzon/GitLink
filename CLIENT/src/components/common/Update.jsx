import { useState } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
// import { FaEdit } from "react-icons/fa"
import { useLogout } from "../../hooks/LogOut";

function Update({ type, itemId, setIsChange, inputs, role = null }) {
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [screen, setScreen] = useState(0);
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function updateFunc(e) {
    e.preventDefault();
    e.target.reset();
    setScreen(0);
    try {
      await fetchData({
        type: `${type}/${itemId}`,
        method: "PUT",
        body: formData,
        role: role,
        onSuccess: (result) => {
          console.log("Update successful:", result);
          setIsChange(1);
        },
        onError: (error) => {
          console.log("Update was unsuccessful:", error);
        },
        logOut,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  function handleCancel(e) {
    e.target.reset();
    setScreen(0);
  }

  return (
    <>
      {screen == 0 && (
        <button onClick={(e) => setScreen(1)} className="action-btn edit-btn">
          ✎
        </button>
      )}
      {screen == 1 && (
        <div>
          <form onSubmit={updateFunc}>
            {inputs.map((input, index) => (
              <div key={index}>
                <input
                  name={input}
                  placeholder={`Enter ${input}`}
                  value={formData[input] || ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}
            <button type="submit" value={"OK"}>
              OK
            </button>
            <button onClick={handleCancel} value={"cancel"}>
              cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Update;
