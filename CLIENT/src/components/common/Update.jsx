import { useState } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
import Modal from "./Modal.jsx";
import { useLogout } from "../../hooks/LogOut.js";
import "../../style/Update.css";

function Update({ type, itemId, setIsChange, inputs, role = null }) {
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function updateFunc() {
    setShowModal(false);
    try {
      await fetchData({
        type: `${type}/${itemId}`,
        method: "PUT",
        body: formData,
        role: role,
        onSuccess: (result) => {
          console.log("Update successful:", result);
          setIsChange((prev) => prev + 1);
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

  return (
    <>
      <button className="update-btn" onClick={() => setShowModal(true)}>
        Edit
      </button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {inputs.map((inputName, index) => (
            <input
              key={index}
              name={inputName}
              placeholder={`Enter ${inputName}`}
              onChange={handleInputChange}
            />
          ))}
          <button value="OK" onClick={updateFunc}>OK</button>
          <button value="cancel" onClick={() => setShowModal(false)}>Cancel</button>
        </Modal>
      )}
    </>
  );
}

export default Update;
