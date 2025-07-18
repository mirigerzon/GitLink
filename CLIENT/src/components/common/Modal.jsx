// components/common/Modal.jsx
import ReactDOM from "react-dom";
import "../../style/Modal.css";

const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
