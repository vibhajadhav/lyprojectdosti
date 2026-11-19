/**
 * BERT embedding generation, running DistilBERT locally via transformers.js
 * (an ONNX build of the same "distilbert-base-uncased" model the Python
 * prototype used). This file is only ever imported from convex/embeddings.ts,
 * which is a "use node" action file — transformers.js needs Node's runtime,
 * not Convex's default V8 isolate.
 *
 * This intentionally mirrors app.py's bert_embedding():
 *   1. Tokenize the text
 *   2. Run it through DistilBERT to get per-token hidden states
 *   3. Mean-pool across tokens (using the attention mask, so padding doesn't
 *      skew the average)
 *   4. L2-normalize the resulting vector so cosine similarity == dot product
 */

import { pipeline } from "@huggingface/transformers";

// Xenova's ONNX conversion of distilbert-base-uncased — same weights/model
// as the Python prototype, just exported to a format transformers.js can run.
const MODEL_NAME = "Xenova/distilbert-base-uncased";
const EMBEDDING_DIMENSIONS = 768; // DistilBERT hidden size

type FeatureExtractor = (
  text: string,
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array | number[] }>;

let extractorPromise: Promise<FeatureExtractor> | null = null;

async function getExtractor(): Promise<FeatureExtractor> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      MODEL_NAME,
    ) as unknown as Promise<FeatureExtractor>;
  }
  return extractorPromise;
}

/**
 * Deterministic fallback embedding (hash-based), used only if the DistilBERT
 * model fails to load (e.g. no network access to download weights on first
 * run). Keeps the app functional — with much lower match quality — instead
 * of throwing and blocking onboarding entirely. Same idea as the Python
 * prototype's fallback_embedding().
 */
function fallbackEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:()[\]{}"']/g, ""))
    .filter(Boolean);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS;
    const sign = hash % 2 === 0 ? 1 : -1;
    vector[index] += sign * (1 + Math.min(word.length, 12) / 12);
  }

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Generate a 768-dim BERT embedding for the given profile text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data as Float32Array);
  } catch (error) {
    console.error(
      "BERT model unavailable, using local fallback embedding:",
      error,
    );
    return fallbackEmbedding(text);
  }
}
