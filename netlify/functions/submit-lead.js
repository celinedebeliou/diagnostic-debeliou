const SYSTEME_API_KEY = "bso261tpln7ilky2mdgx8oqvd7x3px74y0h8o0lmv7zr4widg8cvjybz5gg2a3bz";
const BASE_URL = "https://api.systeme.io/api";

const HEADERS = {
  "X-API-Key":    SYSTEME_API_KEY,
  "Content-Type": "application/json"
};

exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);

    // ÉTAPE 1 : Créer le contact avec données essentielles uniquement
    const contactBody = {
      email:     payload.email,
      firstName: payload.name || "",
      surname:   payload.company || ""
    };

    const resContact = await fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(contactBody)
    });

    const dataContact = await resContact.json();
    console.log("Réponse Systeme.io contact:", JSON.stringify(dataContact));

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
