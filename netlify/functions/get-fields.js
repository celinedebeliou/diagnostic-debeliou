const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";
const CONTACT_ID = 437676454; // le contact test existant

exports.handler = async () => {
  try {
    // Récupérer le contact par son ID pour voir ses champs
    const res = await fetch(`https://api.systeme.io/api/contacts/${CONTACT_ID}`, {
      headers: {
        "X-API-Key": SYSTEME_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

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
