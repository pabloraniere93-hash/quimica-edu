export default async function handler(req, res) {
  // Bloqueia tentativas de acesso indevido (aceita apenas envios de formulário/POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { tema, turma } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Chave secreta puxada do painel da Vercel
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // O prompt completo, com todas as melhorias pedagógicas e acadêmicas
    const instrucaoParaIA = `
      Atue como um especialista em currículo e professor de Química. Crie um plano de aula completo e viável sobre o tema "${tema}" para a turma de "${turma}". 

      Siga EXATAMENTE estas diretrizes:
      1. Alinhamento BNCC: Forneça o código alfanumérico oficial (ex: EM13CNT101) e transcreva a habilidade correspondente da área de Ciências da Natureza.
      2. Contextualização: Relacione os conceitos químicos com a realidade cotidiana, ambiental ou social dos alunos.
      3. Abordagem: Se a turma for EJA, priorize metodologias ativas que valorizem a vivência dos estudantes adultos. Adapte a linguagem.
      4. Referências Bibliográficas (Regra Estrita): Liste no mínimo duas fontes REAIS e canônicas (ex: Ricardo Feltre, Martha Reis, Tito e Canto). 
      5. Formatação ABNT: Formate ESTRITAMENTE no padrão ABNT. Estrutura: SOBRENOME EM CAIXA ALTA, Nome. <strong>Título do livro em negrito</strong>: subtítulo sem negrito. Edição. Cidade: Editora, Ano.
      6. Saída: Retorne a resposta APENAS em HTML, utilizando as tags <h3>, <h4>, <p>, <ul>, <li> e <strong>. Não inclua Markdown como \`\`\`html.

      Divida o plano nas seções:
      - <h3>Alinhamento BNCC</h3>
      - <h3>Objetivos de Aprendizagem</h3>
      - <h3>Metodologia</h3>
      - <h3>Avaliação</h3>
      - <h3>Referências Bibliográficas</h3>
    `;

    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: instrucaoParaIA }] }] })
    });

    if (!resposta.ok) {
      throw new Error("Falha na comunicação com o Gemini.");
    }

    const dados = await resposta.json();
    
    // Limpa possíveis marcações de código markdown que a IA possa tentar colocar
    let textoGerado = dados.candidates[0].content.parts[0].text;
    textoGerado = textoGerado.replace(/```html/g, '').replace(/```/g, '').trim();
    
    // Devolve o HTML limpo para o frontend
    return res.status(200).json({ html: textoGerado });

  } catch (erro) {
    console.error("Erro interno no servidor:", erro);
    return res.status(500).json({ erro: "Erro ao gerar o plano de aula. Tente novamente." });
  }
}