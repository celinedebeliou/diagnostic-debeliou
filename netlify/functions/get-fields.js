const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";

exports.handler = async () => {
  try {
    // Tester plusieurs endpoints possibles pour les champs custom
    const endpoints = [
      "https://api.systeme.io/api/custom-fields",
      "https://api.systeme.io/api/contact-fields",
      "https://api.systeme.io/api/fields"
    ];

    const results = {};

    for (const url of endpoints) {
      const res = await fetch(url, {
        headers: {
          "X-API-Key": SYSTEME_API_KEY,
          "Content-Type": "application/json"
        }
      });
      const text = await res.text();
      try {
        results[url] = { status: res.status, data: JSON.parse(text) };
      } catch(e) {
        results[url] = { status: res.status, raw: text.slice(0, 200) };
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(results, null, 2)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
