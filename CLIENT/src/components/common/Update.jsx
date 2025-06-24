import { useState, useEffect } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
import Modal from "./Modal.jsx";
import { useLogout } from "../../hooks/LogOut.js";
import "../../style/Update.css";
import Swal from 'sweetalert2';

function Update({ type, itemId, setIsChange, inputs, role = null, initialData = {} }) {
  const logOut = useLogout();
  const fetchData = useFetchData();
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal && initialData) {
      setFormData(initialData);
    }
  }, [showModal, initialData]);

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
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Update completed successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
          setIsChange((prev) => prev + 1);
        },
        onError: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Update failed. Please try again.',
          });
        },
        logOut,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Edit
      </button>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {inputs.map((inputName, index) => (
            <input
              key={index}
              type="text"
              name={inputName}
              placeholder={inputName}
              value={formData[inputName] || ""}
              onChange={handleInputChange}
            />
          ))}
          <button onClick={updateFunc}>OK</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </Modal>
      )}
    </>
  );
}

export default Update;