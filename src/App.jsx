import React, { useMemo, useState } from "react";

function sma(values, len) {
  if (values.length < len) return null;
  return values.slice(-len).reduce((a, b) => a + b, 0) / len;
}

function analyze(candles) {
  if (!candles.length) return { score: 0, color: "yellow", reason: "אין נתונים עדיין", volRatio: 0 };

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2] || last;
  const closes = candles.map(c => c.close);
  const vols = candles.map(c => c.volume || 0);

  const ma20 = sma(closes, 20);
  const ma50 = sma(closes, 50) || ma20;
  const avgVol = sma(vols, 20) || last.volume || 1;
  const volRatio = last.volume / avgVol;

  let score = 35;
  if (ma20 && last.close > ma20) score += 20;
  if (ma50 && last.close > ma50) score += 15;
  if (last.close > prev.close) score += 10;
  if (volRatio > 1.2) score += 20;

  score = Math.min(100, Math.round(score));
  const color = score >= 70 ? "green" : score >= 45 ? "yellow" : "red";

  const reason =
    color === "green" ? "מבנה ווליום תומכים" :
    color === "yellow" ? "מתקרבת, צריך אישור נוסף" :
    "לא מתאים כרגע";

  return { score, color, reason, volRatio };
}

function Chart({ candles }) {
  const data = candles.slice(-70);
  if (!data.length) return null;

  const max = Math.max(...data.map(c => c.high));
  const min = Math.min(...data.map(c => c.low));
  const maxVol = Math.max(...data.map(c => c.volume || 1));
  const scale = n => 75 - ((n - min) / (max - min || 1)) * 65;
  const step = 92 / data.length;

  return (
    <div className="chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.map((c, i) => {
          const x = 4 + i * step;
          const w = Math.max(0.4, step * 0.55);
          const up = c.close >= c.open;
          const top = scale(Math.max(c.open, c.close));
          const bot = scale(Math.min(c.open, c.close));
          const volH = ((c.volume || 1) / maxVol) * 14;

          return (
            <g key={i}>
              <rect x={x} y={96 - volH} width={w} height={volH} fill={up ? "#166534" : "#7f1d1d"} />
              <line x1={x + w / 2} y1={scale(c.high)} x2={x + w / 2} y2={scale(c.low)} stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="0.5" />
              <rect x={x} y={top} width={w} height={Math.max(0.8, bot - top)} fill={up ? "#22c55e" : "#ef4444"} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function App() {
  const [symbol, setSymbol] = useState("UUUU");
  const [candles, setCandles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const result = useMemo(() => analyze(candles), [candles]);
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const change = last && prev ? ((last.close - prev.close) / prev.close) * 100 : 0;

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/candles?symbol=${symbol}`);
      const json = await res.json();

      if (!json.candles?.length) {
        setError("לא נמצאו נתונים לטיקר הזה");
        setCandles([]);
        return;
      }

      setCandles(json.candles);
    } catch {
      setError("שגיאה במשיכת נתונים");
    } finally {
      setLoading(false);
    }
  }

  const border =
    result.color === "green" ? "#22c55e" :
    result.color === "yellow" ? "#facc15" :
    "#ef4444";

  return (
    <div className="page">
      <h1>Freedom Trade Fit Engine</h1>
      <p className="subtitle">נתוני אמת: מחיר, ווליום, גרף נרות וציון התאמה לשיטה שלך</p>

      <div className="controls">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
        <button onClick={loadData}>{loading ? "Loading..." : "Load Real Data"}</button>
      </div>

      {error && <div className="error">{error}</div>}

      {last && (
        <div className="card" style={{ borderColor: border }}>
          <div>
            <h2>{symbol}</h2>
            <h3>{result.color.toUpperCase()} / Score {result.score}/100</h3>
            <p>{result.reason}</p>
          </div>

          <div className="stats">
            <div>Last Close: ${last.close.toFixed(2)}</div>
            <div className={change >= 0 ? "pos" : "neg"}>Change: {change.toFixed(2)}%</div>
            <div>Volume: {last.volume.toLocaleString()}</div>
            <div>Volume Ratio: {result.volRatio.toFixed(2)}x</div>
          </div>
        </div>
      )}

      <Chart candles={candles} />
    </div>
  );
}
