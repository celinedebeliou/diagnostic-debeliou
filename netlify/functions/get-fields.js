const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";

exports.handler = async () => {
  try {
    // Récupérer les champs custom disponibles
    const res = await fetch("https://api.systeme.io/api/contacts?limit=10", {
      headers: {
        "X-API-Key": SYSTEME_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    // Extraire les champs du premier contact pour voir les slugs
    const firstContact = data?.items?.[0];

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        first_contact: firstContact,
        all_field_keys: firstContact ? Object.keys(firstContact) : [],
        custom_fields: firstContact?.fields || []
      }, null, 2)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
