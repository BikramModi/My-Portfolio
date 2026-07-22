import axios from "axios";

const OLLAMA_URL = process.env.OLLAMA_URL;


export async function healthCheck() {
  const res = await axios.get(`${OLLAMA_URL}/api/tags`);

  return {
    status: "online",
    models: res.data.models.length,
  };
}

export async function getModels() {
  const res = await axios.get(`${OLLAMA_URL}/api/tags`);

  return res.data.models;
}

export async function chat(model, prompt) {
  const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model,
    prompt,
    stream: false,
  });

  return res.data.response;
}