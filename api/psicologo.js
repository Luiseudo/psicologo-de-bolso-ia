import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS – libera para qualquer origem (você pode restringir depois ao domínio do app)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res
      .status(405)
      .json({ error: "Método não permitido. Use POST para conversar com a IA." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { mensagem, historico } = body;

    if (!mensagem || typeof mensagem !== "string") {
      return res
        .status(400)
        .json({ error: "Campo 'mensagem' é obrigatório." });
    }

    const systemMessage = {
      role: "system",
      content:
        "Você é uma IA do app Psicólogo de Bolso. Seu papel é acolher, validar sentimentos, " +
        "falar de forma gentil e simples, e sugerir pequenas ações saudáveis (respiração, pausa, journaling). " +
        "Nunca faça diagnóstico, não fale como se fosse médico ou psicólogo humano. Sempre responda em português brasileiro.",
    };

    const messages = [
      systemMessage,
      ...(historico || []),
      { role: "user", content: mensagem },
    ];

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
    });

    let texto = "Desculpe, não consegui responder agora.";
    try {
      const out = response.output?.[0]?.content?.[0];
      if (out?.text?.value) {
        texto = out.text.value;
      } else if (typeof out === "string") {
        texto = out;
      }
    } catch (e) {
      console.warn("Falha ao extrair texto da resposta:", e);
    }

    return res.status(200).json({ resposta: texto });
  } catch (error) {
    console.error("Erro na IA:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao falar com a IA." });
  }
}
