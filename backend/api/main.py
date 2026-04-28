from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
from backend.database import get_db_connection,init_db
from backend.agent.trip_agent import run_trip_agent
from backend.chatbot.travel_chatbot import ask_travel_chatbot

app = FastAPI(title="Safar Tourism Backend")

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Load dataset ONCE
# -------------------------
DATA_PATH = os.path.join("backend", "data", "enriched_places.json")

def load_places():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("Error loading dataset:", e)
        return []

PLACES_DATA = load_places()

# -------------------------
# Request Models
# -------------------------
class TripRequest(BaseModel):
    state: str
    destination_city: Optional[str] = None
    type: Optional[str] = None
    budget: str
    ageGroup: str
    days: int
    user_city: str
    num_people: int


class ChatRequest(BaseModel):
    message: str
    trip_context: dict = {}
    history: list = []


# -------------------------
# Root Route
# -------------------------
@app.get("/")
def root():
    return {"message": "Safar Backend Running"}

# -------------------------
# Trip Planning API
# -------------------------
@app.post("/plan-trip")
def plan_trip(request: TripRequest):
    try:
        preferences = {
            "state": request.state,
            "destination_city": request.destination_city,
            "type": request.type,
            "budget": request.budget,
            "group": request.ageGroup,
            "days": request.days,
            "user_city": request.user_city,
            "num_people": request.num_people
        }

        if not PLACES_DATA:
            return {
                "success": False,
                "error": "Places dataset not loaded"
            }

        result = run_trip_agent(preferences, PLACES_DATA)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# -------------------------
# Chat API
# -------------------------
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = ask_travel_chatbot(
            question=request.message,
            trip_context=request.trip_context
        )

        return {
            "success": True,
            "response": response
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

init_db()


# -------------------------
# PLAN TRIP (UPDATED WITH DB)
# -------------------------
@app.post("/plan-trip")
def plan_trip(data: dict):

    # 🔥 YOUR EXISTING AI LOGIC HERE
    result = run_trip_agent(data)  # <-- replace with your AI function

    # -------------------------
    # SAVE TO SQLITE DATABASE
    # -------------------------
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO trips (
            userId,
            destination,
            days,
            people,
            budget,
            travelType,
            plan
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("userId", "guest"),
        data.get("state"),
        int(data.get("days", 0)),
        int(data.get("num_people", 1)),
        data.get("budget"),
        data.get("type"),
        str(result)
    ))

    conn.commit()
    conn.close()

    # RETURN RESPONSE TO FRONTEND
    return {
        "status": "success",
        "data": result
    }


# -------------------------
# GET USER TRIPS (PROFILE PAGE)
# -------------------------
@app.get("/user-trips/{userId}")
def get_user_trips(userId: str):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM trips
        WHERE userId = ?
        ORDER BY createdAt DESC
    """, (userId,))

    rows = cursor.fetchall()
    conn.close()

    trips = [dict(row) for row in rows]

    return {
        "trips": trips
    }

@app.get("/profile/{userId}")
def get_profile(userId: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM user_profiles WHERE userId = ?
    """, (userId,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)
    return None
    

