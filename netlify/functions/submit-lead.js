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
    const { email, prenom, nom, company } = payload;

    if (!email) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Email manquant" }) };
    }

    // ÉTAPE 1 : Créer ou mettre à jour le contact
    const resContact = await fetch(`${BASE_URL}/contacts`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email,
        firstName: prenom || "",
        surname:   nom || "",
        fields: [{ slug: "company", value: company || "" }]
      })
    });

    const dataContact = await resContact.json();
    const contactId = dataContact?.id;

    if (!contactId) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Contact ID non récupéré", detail: dataContact }) };
    }

    // ÉTAPE 2 : PATCH les champs du diagnostic
    await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "X-API-Key": SYSTEME_API_KEY, "Content-Type": "application/merge-patch+json" },
      body: JSON.stringify({
        fields: [
          { slug: "score_notoriete",        value: String(payload.score_notoriete || 0) },
          { slug: "score_fidelisation",     value: String(payload.score_fidelisation || 0) },
          { slug: "score_differenciation",  value: String(payload.score_differenciation || 0) },
          { slug: "niveau_notoriete",       value: payload.niveau_notoriete || "" },
          { slug: "niveau_fidelisation",    value: payload.niveau_fidelisation || "" },
          { slug: "niveau_differenciation", value: payload.niveau_differenciation || "" },
          { slug: "profil_rapport",         value: payload.profil_rapport || "" }
        ]
      })
    });

    // ÉTAPE 3 : Assigner le tag "quiz-diagnostic"
    const resTags = await fetch(`${BASE_URL}/tags`, { headers: HEADERS });
    const dataTags = await resTags.json();
    const tag = dataTags?.items?.find(t => t.name === "quiz-diagnostic");

    if (tag) {
      await fetch(`${BASE_URL}/contacts/${contactId}/tags`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ tagId: tag.id })
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, contactId, profil_rapport: payload.profil_rapport })
    };

  } catch (err) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
