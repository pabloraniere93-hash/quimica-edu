export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { tema, turma } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoParaIA = `
      Atue como um especialista em currículo e professor de Química. Crie um plano de aula completo e viável sobre o tema "${tema}" para a turma de "${turma}". 

      Siga EXATAMENTE estas diretrizes:
      1. Alinhamento BNCC: Forneça o código alfanumérico oficial (ex: EM13CNT101) e transcreva a habilidade correspondente da área de Ciências da Natureza.
      2. Contextualização: Relacione os conceitos químicos com a realidade cotidiana, ambiental ou social.
      3. Abordagem: Se a turma for EJA, priorize metodologias ativas que valorizem a vivência dos estudantes adultos.
      4. Referências Bibliográficas: Liste no mínimo duas fontes REAIS (ex: Ricardo Feltre, Martha Reis, Tito e Canto). 
      5. Formatação ABNT: Formate as referências ESTRITAMENTE no padrão ABNT (SOBRENOME EM CAIXA ALTA, Nome. Título em negrito...).
      6. Saída: Retorne a resposta APENAS em HTML (<h3>, <h4>, <p>, <ul>, <li>, <strong>). Não use formatação Markdown.
    `;

    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: instrucaoParaIA }] }] })
    });

    if (!resposta.ok) throw new Error("Falha na comunicação com a API do Gemini.");

    const dados = await resposta.json();
    let textoGerado = dados.candidates[0].content.parts[0].text;
    textoGerado = textoGerado.replace(/```html/g, '').replace(/```/g, '').trim();
    
    return res.status(200).json({ html: textoGerado });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao comunicar com a IA." });
  }
}
