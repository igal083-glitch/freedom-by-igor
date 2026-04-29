import React, { useState } from "react";

export default function App() {
  const [ticker, setTicker] = useState("UUUU");

  return (
    <div style={{
      background: "#000",
      color: "white",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1 style={{
        color: "#facc15",
        fontSize: "52px",
        marginBottom: "20px"
      }}>
        Freedom Trade Fit Engine
      </h1>

      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "30px"
      }}>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          style={{
            padding: "14px",
            fontSize: "20px",
            borderRadius: "12px",
            background: "#111",
            color: "white",
            border: "1px solid #333"
          }}
        />

        <button style={{
          padding: "14px 24px",
          background: "#facc15",
          color: "black",
          fontWeight: "bold",
          borderRadius: "12px",
          border: "none"
        }}>
          Load
        </button>
      </div>

      <div style={{
        border: "1px solid #22c55e",
        borderRadius: "24px",
        padding: "30px",
        background: "#111"
      }}>
        <h2 style={{fontSize:"42px"}}>{ticker}</h2>
        <p>GREEN / מתאים</p>
        <p>Trade Fit Score: 84/100</p>
        <p>כאן נחבר גרף אמיתי בשלב הבא</p>
      </div>
    </div>
  );
}
