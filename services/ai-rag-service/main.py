from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from graphs.meeting_agent_graph import meeting_agent_app
from pipelines.rag_pipeline import rag_engine

app = FastAPI(
    title="Eulr AI LangGraph & RAG Microservice",
    version="2.0.0",
    description="Enterprise Agentic Meeting Intelligence with LangGraph & Vector RAG"
)

class AnalyzeMeetingRequest(BaseModel):
    meeting_id: str
    title: str
    utterances: List[Dict[str, Any]]

class RAGQueryRequest(BaseModel):
    meeting_id: str
    query: str
    top_k: Optional[int] = 4

@app.get("/health")
async def health_check():
    return {"status": "HEALTHY", "engine": "LangGraph + RAG"}

@app.post("/api/v1/ai/analyze-meeting")
async def analyze_meeting(req: AnalyzeMeetingRequest):
    """
    Executes the LangGraph multi-agent workflow on meeting utterances.
    """
    try:
        # Run LangGraph State Machine
        initial_state = {
            "meeting_id": req.meeting_id,
            "title": req.title,
            "raw_utterances": req.utterances,
            "cleaned_transcript": [],
            "executive_summary": "",
            "key_decisions": [],
            "action_items": [],
            "sentiment": ""
        }

        final_state = meeting_agent_app.invoke(initial_state)

        # Ingest cleaned transcript into RAG Vector Store
        rag_engine.ingest_transcript(req.meeting_id, final_state["cleaned_transcript"])

        return {
            "success": True,
            "meeting_id": req.meeting_id,
            "executive_summary": final_state["executive_summary"],
            "key_decisions": final_state["key_decisions"],
            "action_items": final_state["action_items"],
            "sentiment": final_state["sentiment"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ai/rag-query")
async def query_meeting_rag(req: RAGQueryRequest):
    """
    Answers questions grounded in meeting transcripts using RAG retrieval.
    """
    try:
        result = rag_engine.answer_query(req.meeting_id, req.query)
        return {"success": True, "meeting_id": req.meeting_id, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
