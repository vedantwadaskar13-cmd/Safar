import json
from langchain.tools import tool


def create_rank_places_tool(llm):

    @tool
    def rank_places_tool(input_json: str) -> str:
        """
        Rank places with STRICT geographic control + LLM ranking.
        """

        try:
            data = json.loads(input_json)
        except json.JSONDecodeError as e:
            return json.dumps({
                "error": "Invalid input JSON",
                "details": str(e)
            })

        if "preferences" not in data or "matches" not in data:
            return json.dumps({"error": "Missing preferences or matches"})

        preferences = data["preferences"]
        matches = data["matches"][:15]

        user_city = (preferences.get("user_city") or "").lower()
        state = (preferences.get("state") or "").lower()

        # =====================================================
        # 🔥 STEP 1: HARD STATE FILTER (IMPORTANT FIX)
        # =====================================================
        filtered_matches = []
        for p in matches:
            if p.get("state", "").lower() != state:
                continue  # ❌ REMOVE Mahabaleshwar-type noise

            # city boost flag
            p["city_boost"] = 0
            if user_city and user_city in p.get("city", "").lower():
                p["city_boost"] = 1

            filtered_matches.append(p)

        if not filtered_matches:
            filtered_matches = matches  # fallback safety

        # =====================================================
        # PROMPT
        # =====================================================
        prompt = f"""
You are a strict travel ranking engine.

IMPORTANT RULES:
- Only rank given places
- DO NOT introduce new locations
- Respect priority_boost field if present

User preferences:
{json.dumps(preferences, indent=2)}

Places:
{json.dumps(filtered_matches, indent=2)}

Return JSON:
{{
  "ranked_places": [
    {{
      "name": "",
      "state": "",
      "city": "",
      "type": "",
      "matchScore": 0,
      "reason": ""
    }}
  ]
}}

Return TOP 10 only.
"""

        try:
            response = llm.invoke(prompt)
            text = response.content.strip().replace("```json", "").replace("```", "")

            parsed = json.loads(text)
            ranked = parsed.get("ranked_places", [])

            # =====================================================
            # 🔥 STEP 2: POST LLM GEOGRAPHY FIX (CRITICAL)
            # =====================================================
            cleaned = []

            for p in ranked:

                # FORCE STATE LOCK
                if p.get("state", "").lower() != state:
                    continue  # ❌ removes Mahabaleshwar again

                score = float(p.get("matchScore", 0))

                # CITY BOOST
                if user_city and user_city in p.get("city", "").lower():
                    score += 50

                # apply score boost from preprocessing
                if p.get("city_boost", 0) == 1:
                    score += 40

                p["matchScore"] = score
                cleaned.append(p)

            # sort safely
            cleaned = sorted(cleaned, key=lambda x: x["matchScore"], reverse=True)[:10]

            # assign rank
            for i, p in enumerate(cleaned):
                p["rank"] = i + 1

            return json.dumps({
                "preferences": preferences,
                "ranked_places": cleaned
            })

        except Exception as e:

            # =====================================================
            # FALLBACK (SAFE VERSION)
            # =====================================================
            fallback = []

            for place in filtered_matches:

                score = float(place.get("matchScore", 0))

                if place.get("city_boost", 0) == 1:
                    score += 50

                fallback.append({
                    "name": place.get("name"),
                    "state": place.get("state"),
                    "city": place.get("city"),
                    "type": place.get("type"),
                    "matchScore": score,
                    "reason": "Fallback ranking"
                })

            fallback = sorted(fallback, key=lambda x: x["matchScore"], reverse=True)[:10]

            for i, p in enumerate(fallback):
                p["rank"] = i + 1

            return json.dumps({
                "preferences": preferences,
                "ranked_places": fallback,
                "note": f"fallback used: {str(e)}"
            })

    return rank_places_tool
