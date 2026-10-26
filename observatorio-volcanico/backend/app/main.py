from typing import Literal

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .service import ALERT_LEVELS, Observatory, ObservatoryError

app = FastAPI(title="Volcano Observatory API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

observatory = Observatory()


class VolcanoIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    altitude: int = Field(ge=0, le=9000)
    alert_level: Literal[ALERT_LEVELS]
    department: str = Field(default="", max_length=40)


@app.exception_handler(ObservatoryError)
def observatory_error_handler(_: Request, error: ObservatoryError):
    return JSONResponse(status_code=error.status_code, content={"detail": error.message})


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/state")
def get_state():
    return observatory.state()


@app.post("/api/volcanoes")
def upsert_volcano(volcano: VolcanoIn):
    result = observatory.upsert(**volcano.model_dump())
    return {**result, "state": observatory.state()}


@app.delete("/api/volcanoes/{name}")
def remove_volcano(name: str):
    result = observatory.remove(name)
    return {**result, "state": observatory.state()}


@app.get("/api/search")
def search_volcano(name: str = Query(min_length=1, max_length=60)):
    return observatory.search(name)


@app.get("/api/altitude-range")
def altitude_range(low: int = Query(ge=0, le=9000), high: int = Query(ge=0, le=9000)):
    return observatory.altitude_range(low, high)


@app.post("/api/reset")
def reset():
    observatory.reset()
    return observatory.state()
