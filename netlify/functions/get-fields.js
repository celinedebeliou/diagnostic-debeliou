const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";

exports.handler = async () => {
  const res = await fetch("https://api.systeme.io/api/contact-fields", {
    headers: {
      "X-API-Key": SYSTEME_API_KEY,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data, null, 2)
  };
};
