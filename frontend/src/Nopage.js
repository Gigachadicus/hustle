import React from "react";
import { Link } from "react-router-dom";

const NoPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <p style={styles.message}>Page Not Found</p>
      <Link to="/" style={styles.button}>
        Go to Home
      </Link>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9f9f9",
    color: "#333",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "6rem",
    margin: "0",
  },
  message: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};

export default NoPage;
