from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os

from database import get_db_connection, init_db
from agent.trip_agent import run_trip_agent
from chatbot.travel_chatbot import ask_travel_chatbot

app = FastAPI(title="Safar Tourism Backend")

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://safar-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Load dataset
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
# Init DB
# -------------------------
init_db()

# -------------------------
# Request Models
# -------------------------
class TripRequest(BaseModel):
    userId: str
    state: str
    destination_city: str = ""
    user_city: str
    type: str
    ageGroup: str
    days: int
    budget: str
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
# PLAN TRIP
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

        result = run_trip_agent(preferences, PLACES_DATA)

        # Save trip to DB
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO trips 
            (userId, destination, days, people, budget, travelType, plan)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            request.userId,
            request.destination_city or request.state,
            request.days,
            request.num_people,
            request.budget,
            request.type,
            json.dumps(result)
        ))

        conn.commit()
        conn.close()

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
# CHAT API
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

# -------------------------
# GET USER TRIPS
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

    return {"trips": trips}

# -------------------------
# GET PROFILE
# -------------------------
@app.get("/profile/{userId}")
def get_profile(userId: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM user_profiles WHERE userId=?", (userId,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)

    return {}
