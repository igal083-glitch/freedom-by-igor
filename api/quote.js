export default async function handler(req, res) {
  try {
    const symbols = (req.query.symbols || "SPY,QQQM,VTI,VXUS,SPMO")
      .split(",")
      .map(s => s.trim().toUpperCase());

    const key = process.env.FINNHUB_API_KEY;

    if (!key) {
      return res.status(500).json({ error: "Missing FINNHUB_API_KEY" });
    }

    const data = await Promise.all(
      symbols.map(async symbol => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`;
        const r = await fetch(url);
        const q = await r.json();

        return {
          symbol,
          price: q.c || 0,
          previousClose: q.pc || 0,
          change: q.d || 0,
          changePercent: q.dp || 0
        };
      })
    );

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: "Quote fetch failed" });
  }
}
