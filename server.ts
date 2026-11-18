import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT || process.env.FASTGEM_PORT || 8000);
const MODEL = process.env.FASTGEM_MODEL || 'gemini-3.8-flash';
const DATA_DIR = path.resolve(process.env.FASTGEM_DATA_DIR || '.fastgem');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

type Agent = {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  model: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
};

type Message = {
  role: 'user' | 'model';
  text: string;
  createdAt: string;
};

type Session = {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

type Store = { agents: Agent[]; sessions: Session[] };

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 12)}`;

async function loadStore(): Promise<Store> {
  try {
    const store = JSON.parse(await fs.readFile(DATA_FILE, 'utf8')) as Store;
    let migrated = false;
    for (const agent of store.agents) {
      if (agent.model === 'gemini-2.5-flash') {
        agent.model = MODEL;
        agent.updatedAt = now();
        migrated = true;
      }
    }
    if (migrated) await saveStore(store);
    return store;
  } catch {
    const timestamp = now();
    const seed: Agent = {
      id: 'researcher',
      name: 'Gemini Researcher',
      description: 'A long-context research agent for technical analysis.',
      systemInstruction: 'You are a careful technical researcher. Explain assumptions, cite uncertainty, and return concise Markdown.',
      model: MODEL,
      tools: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const store = { agents: [seed], sessions: [] };
    await saveStore(store);
    return store;
  }
}

async function saveStore(store: Store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

function requireApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured. Copy .env.example to .env and add your Gemini key.');
  return key;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'fastgem-runtime', model: MODEL }));

app.get('/api/agents', async (_req, res) => {
  const store = await loadStore();
  res.json({ agents: store.agents });
});

app.post('/api/agents', async (req, res) => {
  const store = await loadStore();
  const timestamp = now();
  const agent: Agent = {
    id: id('agt'),
    name: String(req.body?.name || 'New Gemini Agent'),
    description: String(req.body?.description || ''),
    systemInstruction: String(req.body?.systemInstruction || 'You are a helpful Gemini agent.'),
    model: String(req.body?.model || MODEL),
    tools: Array.isArray(req.body?.tools) ? req.body.tools.map(String) : [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.agents.unshift(agent);
  await saveStore(store);
  res.status(201).json({ agent });
});

app.get('/api/agents/:agentId/sessions', async (req, res) => {
  const store = await loadStore();
  res.json({ sessions: store.sessions.filter((session) => session.agentId === req.params.agentId) });
});

app.post('/api/agents/:agentId/sessions', async (req, res) => {
  const store = await loadStore();
  if (!store.agents.some((agent) => agent.id === req.params.agentId)) return res.status(404).json({ error: 'Agent not found' });
  const timestamp = now();
  const session: Session = { id: id('ses'), agentId: req.params.agentId, messages: [], createdAt: timestamp, updatedAt: timestamp };
  store.sessions.unshift(session);
  await saveStore(store);
  res.status(201).json({ session });
});

async function runAgent(agentId: string, sessionId: string, prompt: string) {
  const store = await loadStore();
  const agent = store.agents.find((candidate) => candidate.id === agentId);
  if (!agent) throw new Error('Agent not found');
  let session = store.sessions.find((candidate) => candidate.id === sessionId && candidate.agentId === agentId);
  if (!session) {
    const timestamp = now();
    session = { id: sessionId, agentId, messages: [], createdAt: timestamp, updatedAt: timestamp };
    store.sessions.unshift(session);
  }
  session.messages.push({ role: 'user', text: prompt, createdAt: now() });
  const ai = new GoogleGenAI({ apiKey: requireApiKey() });
  const response = await ai.models.generateContent({
    model: agent.model || MODEL,
    contents: session.messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] })),
    config: { systemInstruction: agent.systemInstruction, temperature: 0.4 },
  });
  const text = response.text || 'Gemini returned an empty response.';
  session.messages.push({ role: 'model', text, createdAt: now() });
  session.updatedAt = now();
  await saveStore(store);
  return { text, session, model: agent.model || MODEL };
}

app.post('/api/agents/:agentId/runs', async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const sessionId = String(req.body?.sessionId || id('ses'));
    res.json({ ...(await runAgent(req.params.agentId, sessionId, prompt)), sessionId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Run failed' });
  }
});

app.get('/api/agents/:agentId/runs/stream', async (req, res) => {
  const prompt = String(req.query.prompt || '').trim();
  const sessionId = String(req.query.sessionId || id('ses'));
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  try {
    if (!prompt) throw new Error('prompt is required');
    res.write(`event: status\ndata: ${JSON.stringify({ status: 'running', model: MODEL })}\n\n`);
    const result = await runAgent(req.params.agentId, sessionId, prompt);
    for (const chunk of result.text.match(/.{1,80}/g) || []) {
      res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write(`event: done\ndata: ${JSON.stringify({ sessionId, model: result.model })}\n\n`);
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Run failed' })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FastGem runtime listening on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL}`);
});
