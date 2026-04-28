# backend/tools/match_tool.py

import json
from langchain.tools import tool


def create_match_places_tool(llm):

    @tool
    def match_places_tool(preferences_json: str, places_json: str) -> str:
        """
        Match destinations using LLM-based scoring with validation + fallback.
        """

        try:
            preferences = json.loads(preferences_json)
            places = json.loads(places_json)
        except Exception as e:
            return json.dumps({"error": f"Invalid JSON input: {str(e)}"})

        # 🔹 Pre-filter (VERY IMPORTANT to reduce LLM load)
        filtered_places = []
        for place in places:
            if preferences.get("budget") and place.get("budget"):
                if place["budget"].lower() != preferences["budget"].lower():
                    continue

            if preferences.get("group") == "family":
                if "Family" not in place.get("ageGroup", []):
                    continue

            filtered_places.append(place)

        # Limit input to avoid token explosion
        filtered_places = filtered_places[:25]

        prompt = f"""
You are a travel recommendation engine.

User Preferences:
{json.dumps(preferences, indent=2)}

Candidate Destinations:
{json.dumps(filtered_places, indent=2)}

Evaluate each destination based on:
- state match
- type match
- budget match
- age group suitability
- trip duration suitability

Instructions:
- Score each destination from 0 to 100
- Keep explanations short (1 line)
- Return ONLY valid JSON (no markdown, no text)

Output format:
{{
  "preferences": {{}},
  "matches": [
    {{
      "name": "...",
      "state": "...",
      "city": "...",
      "type": "...",
      "matchScore": 85,
      "reason": "short reason"
    }}
  ]
}}

Return ONLY top 10 matches sorted by matchScore DESC.
"""

        try:
            response = llm.invoke(prompt)
            text = response.content.strip()

            # 🔹 Clean LLM formatting
            text = text.replace("```json", "").replace("```", "").strip()

            # 🔹 Validate JSON
            parsed = json.loads(text)

            if "matches" not in parsed:
                raise ValueError("Missing 'matches' key")

            # 🔹 Ensure max 10
            parsed["matches"] = sorted(
                parsed["matches"],
                key=lambda x: x.get("matchScore", 0),
                reverse=True
            )[:10]

            return json.dumps(parsed)

        except Exception as e:
            # 🔥 FALLBACK (rule-based scoring if LLM fails)
            fallback = []

            for place in filtered_places:
                score = 0

                if preferences.get("state") == place.get("state"):
                    score += 25

                if preferences.get("type") == place.get("type"):
                    score += 25

                if preferences.get("budget") == place.get("budget"):
                    score += 20

                if preferences.get("group") == "family" and "Family" in place.get("ageGroup", []):
                    score += 15

                if place.get("daysRequired", 1) <= preferences.get("days", 3):
                    score += 15

                fallback.append({
                    "name": place.get("name"),
                    "state": place.get("state"),
                    "city": place.get("city"),
                    "type": place.get("type"),
                    "matchScore": score,
                    "reason": "Fallback scoring used"
                })

            fallback = sorted(fallback, key=lambda x: x["matchScore"], reverse=True)[:10]

            return json.dumps({
                "preferences": preferences,
                "matches": fallback,
                "note": f"LLM failed, fallback used: {str(e)}"
            })

    return match_places_tool