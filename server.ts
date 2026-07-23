import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory leads storage for demo CRM
  const leadsStore: any[] = [
    {
      id: 'lead-101',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      coupleName: 'Mariana & Lucas',
      email: 'mariana.lucas@email.com',
      phone: '(19) 99881-1122',
      whatsapp: '5519998811122',
      weddingDate: '2026-10-14',
      city: 'Piracicaba',
      state: 'SP',
      venueType: 'Campo / Fazenda',
      estimatedGuests: 120,
      budgetLimit: 6000,
      servicesNeeded: ['Foto', 'Vídeo', 'Drone'],
      stylePreference: 'Fine Art',
      photographerIds: ['p1'],
      message: 'Olá! Adoramos seu trabalho no Espaço Terras de Clara. Gostaria de saber a disponibilidade para outubro.',
      status: 'Novo'
    },
    {
      id: 'lead-102',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      coupleName: 'Camila & Fernando',
      email: 'camila.noiva@email.com',
      phone: '(11) 98765-0011',
      whatsapp: '5511987650011',
      weddingDate: '2026-11-20',
      city: 'São Paulo',
      state: 'SP',
      venueType: 'Espaço Elegante / Cidade',
      estimatedGuests: 150,
      budgetLimit: 8500,
      servicesNeeded: ['Foto', 'Vídeo', 'Álbum', 'Making Of'],
      stylePreference: 'Editorial',
      photographerIds: ['p2'],
      message: 'Gostaria de solicitar o orçamento completo do pacote Lumina Luxury com álbum.',
      status: 'Em Atendimento'
    }
  ];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get leads
  app.get('/api/leads', (req, res) => {
    const { photographerId } = req.query;
    if (photographerId) {
      const filtered = leadsStore.filter((l) =>
        Array.isArray(l.photographerIds)
          ? l.photographerIds.includes(String(photographerId))
          : l.photographerIds === photographerId
      );
      return res.json({ success: true, leads: filtered });
    }
    return res.json({ success: true, leads: leadsStore });
  });

  // Submit quote lead
  app.post('/api/leads', (req, res) => {
    try {
      const newLead = {
        id: `lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'Novo',
        ...req.body
      };
      leadsStore.unshift(newLead);
      return res.status(201).json({
        success: true,
        message: 'Solicitação de orçamento enviada com sucesso! O fotógrafo entrará em contato em breve.',
        lead: newLead
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Erro ao processar solicitação' });
    }
  });

  // AI Assistant for Wedding Photographers matching powered by Gemini API
  app.post('/api/ai-match', async (req, res) => {
    try {
      const { userPrompt, city, style, budget, guestCount } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `Você é a "NoivaBot AI", a consultora inteligente especialista em fotografia de casamento do portal "Só Fotógrafos de Casamento" no Brasil.
Suas respostas devem ser extremamente gentis, elegantes, entusiasmadas e práticas para os noivos.
Dê dicas valiosas de estilos (Fine Art, Documental, Boho, Clássico, Editorial), orçamento médio para a cidade do casal e sugira quais serviços incluir (Pré Wedding, Drone, Vídeo, Álbum).
Formate a resposta em tópicos claros com markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nDados do Casamento:\n- Cidade: ${city || 'Não especificada'}\n- Estilo: ${style || 'Aberto'}\n- Orçamento estimado: ${budget ? 'R$ ' + budget : 'A definir'}\n- Convidados: ${guestCount || 'Não informado'}\n- Detalhes adicionais do casal: ${userPrompt || 'Busco o fotógrafo ideal'}` }
              ]
            }
          ]
        });

        const textOutput = response.text || 'Analisando perfil do casamento...';
        return res.json({ success: true, advice: textOutput });
      } else {
        // Fallback intelligent response if GEMINI_API_KEY is not configured yet
        return res.json({
          success: true,
          advice: `✨ **Recomendações Personalizadas do Só Fotógrafos:**

1. **Estilo Ideal:** Para o seu estilo **${style || 'Fine Art / Boho'}**, recomendamos profissionais que dominam a iluminação natural e o fotojornalismo espontâneo.
2. **Orçamento Estimado:** Para um casamento em **${city || 'sua região'}**, a média ideal para cobertura com foto + álbum e pré-wedding varia entre R$ 3.500 e R$ 6.500.
3. **Dica de Ouro:** Solicite orçamento para ao menos 3 fotógrafos e verifique o portfólio completo do making of até a festa!`
        });
      }
    } catch (error: any) {
      console.error('Error in AI match route:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro na consultoria AI',
        advice: 'Tivemos uma oscilação momentânea no assistente AI, mas você pode usar nossos filtros de busca por cidade e preço!'
      });
    }
  });

  // Vite development middleware vs production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
