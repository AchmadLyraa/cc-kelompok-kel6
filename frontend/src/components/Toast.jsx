import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{ ...styles.toast, ...styles[type] }}>
      <span>
        {type === "success" ? "✅" : "❌"} {message}
      </span>
      <button onClick={onClose} style={styles.close}>
        ✕
      </button>
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    padding: "0.8rem 1.2rem",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 9999,
    fontSize: "0.95rem",
    fontWeight: "bold",
    minWidth: "250px",
  },
  success: { backgroundColor: "#E2EFDA", color: "#548235" },
  error: { backgroundColor: "#FBE5D6", color: "#C00000" },
  close: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "inherit",
  },
};

export default Toast;
