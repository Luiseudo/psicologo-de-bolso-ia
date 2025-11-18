import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // 🔹 CORS – libera o acesso do seu app (por enquanto, liberando geral)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { mensagem, historico } = body || {};

    if (!mensagem) {
      return res.status(400).json({ error: "Mensagem não enviada" });
    }

    const messages = [
      {
        role: "system",
        content:
          "Você é uma IA acolhedora chamada Psicólogo de Bolso. " +
          "Você não substitui um psicólogo humano, não faz diagnósticos e não dá conselhos perigosos. " +
          "Seu foco é ouvir, acolher, validar sentimentos e sugerir passos saudáveis. " +
          "Responda SEMPRE em português do Brasil, em tom calmo e humano.",
      },
      ...(historico || []),
      { role: "user", content: mensagem },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 250,
      temperature: 0.8,
    });

    const resposta = completion.choices?.[0]?.message?.content || 
      "Desculpe, não consegui responder agora. Podemos tentar de novo em alguns instantes?";

    return res.status(200).json({ resposta });
  } catch (erro) {
    console.error("Erro na IA:", erro);
    return res.status(500).json({ error: "Erro no servidor da IA" });
  }
}

    return response.status(500).json({ error: "Erro no servidor da IA" });
  }
}

