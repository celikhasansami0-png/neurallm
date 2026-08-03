"""Thin wrapper around an embeddings provider for knowledge-base document chunking + retrieval.

In production this would call an embeddings API (e.g. Groq/OpenAI-compatible endpoint) and
write vectors into knowledge_chunks.embedding (pgvector). Kept provider-agnostic so it can be
swapped without touching callers.
"""
from typing import List

EMBEDDING_DIM = 1536


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c for c in chunks if c.strip()]


async def embed_text(text: str) -> List[float]:
    """TODO: replace with a real embeddings API call (Groq/OpenAI-compatible)."""
    # Deterministic placeholder vector so local dev doesn't require a live API key.
    seed = sum(ord(c) for c in text[:64]) or 1
    return [((seed * (i + 1)) % 1000) / 1000 for i in range(EMBEDDING_DIM)]
