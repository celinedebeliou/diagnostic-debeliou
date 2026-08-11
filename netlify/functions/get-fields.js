const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";

exports.handler = async () => {
  try {
    const res = await fetch("https://api.systeme.io/api/contacts?limit=1", {
      headers: {
        "X-API-Key": SYSTEME_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const text = await res.text();

    // Essaie de parser le premier contact pour voir ses champs
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data, null, 2)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
