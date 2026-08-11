const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";
const BASE_URL = "https://api.systeme.io/api";

const HEADERS = {
  "X-API-Key":    SYSTEME_API_KEY,
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  // CORS — autorise les appels depuis n'importe quelle origine
  const corsHeaders = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);

    // ÉTAPE 1 : Créer le contact
    const resContact = await fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email:     payload.email,
        firstName: payload.name || "",
        fields: [
          { slug: "company",               value: payload.company || "" },
          { slug: "score_notoriete",        value: String(payload.score_notoriete || 0) },
          { slug: "score_fidelisation",     value: String(payload.score_fidelisation || 0) },
          { slug: "score_differenciation",  value: String(payload.score_differenciation || 0) },
          { slug: "niveau_notoriete",       value: payload.niveau_notoriete || "" },
          { slug: "niveau_fidelisation",    value: payload.niveau_fidelisation || "" },
          { slug: "niveau_differenciation", value: payload.niveau_differenciation || "" },
          { slug: "secteur",                value: payload.secteur || "" }
        ]
      })
    });

    const dataContact = await resContact.json();
    const contactId = dataContact?.id;

    if (!contactId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Contact ID non récupéré", detail: dataContact })
      };
    }

    // ÉTAPE 2 : Récupérer l'ID du tag "quiz-diagnostic"
    const resTags = await fetch(`${BASE_URL}/tags`, { headers: HEADERS });
    const dataTags = await resTags.json();
    const tag = dataTags?.items?.find(t => t.name === "quiz-diagnostic");

    if (!tag) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Tag 'quiz-diagnostic' introuvable" })
      };
    }

    // ÉTAPE 3 : Assigner le tag au contact
    await fetch(`${BASE_URL}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ tagId: tag.id })
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, contactId })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
