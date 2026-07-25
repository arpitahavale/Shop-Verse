const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { recommend, chat, hasLlmConfig } = require('../services/aiAgent');

const router = express.Router();

router.get('/status', requireAuth, (_req, res) => {
  res.json({
    ok: true,
    providerConfigured: hasLlmConfig(),
    modes: hasLlmConfig()
      ? ['llm-agent', 'local-agent']
      : ['local-agent'],
  });
});

router.post('/recommend', requireAuth, async (req, res) => {
  try {
    const { query, limit } = req.body || {};
    const result = await recommend(query, Number(limit) || 4);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI recommend failed' });
  }
});

router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, history } = req.body || {};
    const result = await chat(message, history);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI chat failed' });
  }
});

module.exports = router;
