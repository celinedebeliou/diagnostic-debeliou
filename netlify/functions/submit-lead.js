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
    const { email } = payload;

    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Email manquant" })
      };
    }

    // ÉTAPE 1 : Trouver le contact existant par email
    const resSearch = await fetch(
      `${BASE_URL}/contacts?email=${encodeURIComponent(email)}&limit=10`,
      { headers: HEADERS }
    );
    const dataSearch = await resSearch.json();
    const contact = dataSearch?.items?.find(c => c.email === email);

    if (!contact) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Contact introuvable pour ${email}` })
      };
    }

    const contactId = contact.id;

    // ÉTAPE 2 : PATCH les champs du diagnostic
    const resPatch = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: "PATCH",
      headers: {
        "X-API-Key":    SYSTEME_API_KEY,
        "Content-Type": "application/merge-patch+json"
      },
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

    const patchData = await resPatch.json();

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
      body: JSON.stringify({
        success: true,
        contactId,
        patch_status: resPatch.status,
        profil_rapport: payload.profil_rapport
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message })
    };
  }
};
