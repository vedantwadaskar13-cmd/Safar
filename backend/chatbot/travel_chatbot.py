import json
from dotenv import load_dotenv

from langchain_mistralai import ChatMistralAI
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

load_dotenv()

# =========================
# LLM
# =========================
llm = ChatMistralAI(
    model="mistral-small-2506",
    temperature=0.4
)

# =========================
# MEMORY STORE
# =========================
store = {}
session_context = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# =========================
# TRIP CONTEXT HANDLER (FIXED)
# =========================
def build_context(trip_context=None):
    try:
        if not trip_context:
            return "No trip context provided."

        return json.dumps(trip_context, indent=2)

    except Exception:
        return "Invalid trip context."

def set_trip_context(session_id, trip_context):
    session_context[session_id] = build_context(trip_context)

def get_trip_context(session_id):
    return session_context.get(session_id, "No trip context provided.")

# =========================
# PROMPT (IMPROVED)
# =========================
prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a Smart Eco & Cultural Travel Assistant.

You help users with:
- itineraries (day-wise plans)
- travel routes
- transport suggestions
- food recommendations
- cultural insights
- eco-friendly travel advice

RULES:
- Always use Trip Context JSON when available
- If itinerary exists, refer to it EXACTLY
- If routes exist, use them for travel answers
- Do NOT invent cities or routes not in context
- If context is missing, respond generally
- Keep answers structured and easy to read
"""
    ),
    MessagesPlaceholder(variable_name="history"),
    ("system", "TRIP CONTEXT (JSON):\n{context}"),
    ("human", "{input}")
])

chain = prompt | llm

chatbot = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

# =========================
# CHAT FUNCTION (FIXED)
# =========================
def ask_travel_chatbot(question, trip_context=None, session_id="default"):

    set_trip_context(session_id, trip_context)

    context = get_trip_context(session_id)

    response = chatbot.invoke(
        {
            "input": question,
            "context": context
        },
        config={"configurable": {"session_id": session_id}}
    )

    return response.content

# =========================
# RESET SESSION
# =========================
def reset_session(session_id="default"):
    store.pop(session_id, None)
    session_context.pop(session_id, None)
