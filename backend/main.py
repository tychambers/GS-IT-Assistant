import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pinecone import Pinecone
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# --- Config ---
OPENAI_API_KEY = "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"
PINECONE_API_KEY = "pcsk_6xTzeP_Tzy3KhUu5KrpcU9ia5Suy7onSWVtkSSoBFZEvT84yZGdua5zezn88Zs6Qq2rCVM"
INDEX_NAME = "eft-docs"

# OpenAI + Pinecone clients
client = OpenAI(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# --- FastAPI App ---
app = FastAPI(title="IT Assistant")

# Allow frontend requests (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request model ---
class Question(BaseModel):
    query: str

# --- Retrieval helper ---
def retrieve_chunks(question, top_k=3):
    q_emb = client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    ).data[0].embedding

    res = index.query(vector=q_emb, top_k=top_k, include_metadata=True)
    return [
        {
            "text": match["metadata"]["text"],
            "url": match["metadata"].get("url", "")
        }
        for match in res["matches"]
    ]

# --- API endpoint ---
@app.post("/ask")
def ask_question(q: Question):
    try:
        chunks = retrieve_chunks(q.query)

        # Build context for AI with URLs
        context_text = "\n\n".join([f"{c['text']}\nSource: {c['url']}" for c in chunks])

        prompt = f"""
        You are an IT assistant. Answer the question concisely using the documentation below.
        Structure your answer in clear paragraphs.
        For each paragraph, clearly indicate which source it came from in the form of a link.
        Context:
        {context_text}

        Question:
        {q.query}
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        answer_text = response.choices[0].message.content

        # Return both the answer and structured references
        return {
            "answer": answer_text,
            "references": [
                {"snippet": c["text"][:200], "url": c["url"]} for c in chunks
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))