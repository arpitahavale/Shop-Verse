const {
  searchProducts,
  getProductById,
  getAllProducts,
  compactProduct,
} = require('./aiCatalog');

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Search ShopVerse catalog by natural language, optional vibe, min/max price',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          vibe: {
            type: 'string',
            enum: ['focus', 'motion', 'nest', 'signal'],
          },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product',
      description: 'Get one product by id',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
    },
  },
];

function hasLlmConfig() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY);
}

function llmConfig() {
  if (process.env.GROQ_API_KEY) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    };
  }
  return {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  };
}

async function runTool(name, args = {}) {
  if (name === 'search_products') {
    const data = await searchProducts({
      query: args.query || '',
      vibe: args.vibe || null,
      minPrice: args.minPrice ?? null,
      maxPrice: args.maxPrice ?? null,
      limit: args.limit || 4,
    });
    return {
      vibe: data.vibe,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      priceLabel: data.priceLabel,
      products: data.results.map((r) => ({
        ...compactProduct(r.product),
        reason: r.reasons.join(', '),
        score: Math.round(r.score),
      })),
    };
  }
  if (name === 'get_product') {
    const product = await getProductById(args.id);
    return product ? compactProduct(product) : { error: 'Not found' };
  }
  return { error: `Unknown tool ${name}` };
}

async function localRecommend(query, limit = 4) {
  const data = await searchProducts({ query, limit });
  const products = data.results.map((r) => ({
    ...r.product,
    reason: r.reasons.join(', ') || 'good catalog match',
  }));

  const vibeBit = data.vibe ? ` with a ${data.vibe} vibe` : '';
  const priceBit = data.priceLabel ? ` ${data.priceLabel}` : '';
  const reply =
    products.length > 0
      ? `I found ${products.length} picks${vibeBit}${priceBit} for “${query}".`
      : `I couldn't find a strong match for “${query}". Try another need or vibe.`;

  return {
    mode: 'local-agent',
    reply,
    products,
    meta: {
      vibe: data.vibe,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      priceLabel: data.priceLabel,
    },
  };
}

async function localChat(message, history = []) {
  const lower = message.toLowerCase();
  if (
    /(hello|hi|hey)\b/.test(lower) &&
    !/(find|gift|need|want|under|above|over|buy)/.test(lower)
  ) {
    return {
      mode: 'local-agent',
      reply:
        'Hi — I’m the ShopVerse concierge. Tell me a need like “calm desk under $100” or “gift for a runner”, and I’ll pull real products from the catalog.',
      products: [],
      meta: {},
    };
  }

  const result = await localRecommend(message, 4);
  if (result.products.length) {
    const names = result.products.map((p) => p.name).join('; ');
    result.reply = `${result.reply} Top ideas: ${names}.`;
  }
  return result;
}

async function callChatCompletions(messages) {
  const { apiKey, baseUrl, model } = llmConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function llmChat(message, history = []) {
  const catalog = await getAllProducts();
  const catalogDigest = catalog
    .map(
      (p) =>
        `#${p.id} ${p.name} ($${p.price}, ${p.category}, rating ${p.rating})`
    )
    .join('\n');

  const system = {
    role: 'system',
    content: `You are ShopVerse AI Concierge, a helpful shopping agent.
Only recommend products that exist in the catalog tools.
Keep replies short (2-4 sentences).
After using tools, explain why picks fit the user need.
Known catalog snapshot:
${catalogDigest}`,
  };

  const prior = (history || [])
    .slice(-6)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || ''),
    }));

  const messages = [system, ...prior, { role: 'user', content: message }];

  let data = await callChatCompletions(messages);
  let choice = data.choices?.[0]?.message;
  const collectedIds = new Set();
  let guard = 0;

  while (choice?.tool_calls?.length && guard < 3) {
    messages.push(choice);
    for (const call of choice.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        args = {};
      }
      const toolResult = await runTool(call.function.name, args);
      if (Array.isArray(toolResult.products)) {
        toolResult.products.forEach((p) => collectedIds.add(p.id));
      } else if (toolResult.id) {
        collectedIds.add(toolResult.id);
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(toolResult),
      });
    }
    data = await callChatCompletions(messages);
    choice = data.choices?.[0]?.message;
    guard += 1;
  }

  const all = await getAllProducts();
  const products = all
    .filter((p) => collectedIds.has(p.id))
    .slice(0, 4)
    .map((p) => ({ ...p, reason: 'AI agent pick' }));

  // If model forgot tools, fall back to local search
  if (!products.length) {
    const fallback = await localRecommend(message, 4);
    return {
      mode: 'llm-agent+local-fallback',
      reply: choice?.content || fallback.reply,
      products: fallback.products,
      meta: fallback.meta,
    };
  }

  return {
    mode: 'llm-agent',
    reply: choice?.content || 'Here are products that fit your request.',
    products,
    meta: {},
  };
}

async function recommend(query, limit = 4) {
  if (!query?.trim()) {
    return {
      mode: 'local-agent',
      reply: 'Tell me what you need — for example “focus desk under $100”.',
      products: [],
      meta: {},
    };
  }
  // Recommend uses fast local ranking; LLM optional enhancement via chat
  return localRecommend(query.trim(), limit);
}

async function chat(message, history = []) {
  if (!message?.trim()) {
    return {
      mode: 'local-agent',
      reply: 'Ask me for gifts, vibes, or budget picks from the ShopVerse catalog.',
      products: [],
      meta: {},
    };
  }

  if (hasLlmConfig()) {
    try {
      return await llmChat(message.trim(), history);
    } catch (err) {
      console.error('LLM chat failed, using local agent:', err.message);
      const fallback = await localChat(message.trim(), history);
      fallback.mode = 'local-agent-fallback';
      fallback.reply = `${fallback.reply} (AI provider unavailable — used local agent.)`;
      return fallback;
    }
  }

  return localChat(message.trim(), history);
}

module.exports = { recommend, chat, hasLlmConfig };
