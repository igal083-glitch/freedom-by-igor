export default async function handler(req, res) {
  try {
    const key = process.env.FINNHUB_API_KEY;
    const symbols = (req.query.symbols || "SPY").split(",");

    const data = [];

    for (const s of symbols) {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${key}`);
      const j = await r.json();

      data.push({
        symbol: s,
        price: j.c || 0,
        previousClose: j.pc || 0,
        change: (j.c || 0) - (j.pc || 0),
        changePercent: j.pc ? (((j.c - j.pc) / j.pc) * 100) : 0
      });
    }

    // דולר / שקל דרך API חיצוני
    const fx = await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS");
    const fxj = await fx.json();

    data.push({
      symbol: "USDILS",
      price: fxj.rates.ILS || 3.6
    });

    res.status(200).json({ data });

  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
}
