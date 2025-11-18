import OpenAI from "openai";

export default async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Método não permitido" });
    }

    const { mensagem, historico } = request.body;

    if (!mensagem) {
      return response.status(400).json({ error: "Mensagem não enviada" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um psicólogo acolhedor e empático. Responda de forma humana, calma, direta e com foco emocional.",
        },
        ...(historico || []),
        { role: "user", content: mensagem },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const resposta = completion.choices[0].message.content;

    return response.status(200).json({
      resposta,
    });
  } catch (erro) {
    console.error("Erro na IA:", erro);
    return response.status(500).json({ error: "Erro no servidor da IA" });
  }
}

