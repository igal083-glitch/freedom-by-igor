export default async function handler(req, res) {
  const symbol = (req.query.symbol || "uuuu").toLowerCase();

  const url = `https://stooq.com/q/d/l/?s=${symbol}.us&i=d`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    const rows = text.trim().split("\n").slice(1);

    const candles = rows
      .map((row) => {
        const [date, open, high, low, close, volume] = row.split(",");

        return {
          date,
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: Number(volume)
        };
      })
      .filter((x) => x.date && Number.isFinite(x.close));

    res.status(200).json({
      symbol: symbol.toUpperCase(),
      candles
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch data"
    });
  }
}
