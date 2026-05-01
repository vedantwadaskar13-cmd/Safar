import json
from langchain.tools import tool


def create_generate_plan_tool(llm):

    @tool
    def generate_plan_tool(input_json: str) -> str:
        """
        Generate premium structured itinerary (frontend friendly).
        """

        try:
            data = json.loads(input_json)

            preferences = data.get("preferences", {})
            ranked_clusters = data.get("ranked_clusters", [])
            routes = data.get("routes", [])

            # ✅ FIXED KEYS
            days = preferences.get("days", 3)
            user_city = preferences.get("user_city", "your city")
            budget = preferences.get("budget", "Medium")
            travelers = preferences.get("num_people", 1)
            trip_style = preferences.get("type", "General")

            destination = (
                ranked_clusters[0]["city"]
                if ranked_clusters else "Destination"
            )

            # ✅ Build place context
            all_clusters_info = []
            suggested_places = []

            for cluster in ranked_clusters[:2]:
                cluster_entry = {
                    "city": cluster.get("city"),
                    "places": []
                }

                for p in cluster.get("places", [])[:3]:
                    place = {
                        "name": p.get("name"),
                        "description": p.get("description", "")
                    }
                    cluster_entry["places"].append(place)
                    suggested_places.append(place)

                all_clusters_info.append(cluster_entry)

            # ✅ ROUTE SUMMARY
            routes_summary = ""
            if routes:
                route_lines = []
                for r in routes[:2]:
                    route_lines.append(
                        f"{r.get('mode')} - {r.get('duration')} - {r.get('cost')}"
                    )
                routes_summary = "\n".join(route_lines)
            else:
                routes_summary = "Suggest best route"

            # =========================
            # 🔥 IMPROVED PROMPT
            # =========================
            prompt = f """
You are a premium travel planner like MakeMyTrip.

Create a HIGH QUALITY travel plan.

TRIP DETAILS:
From: {user_city}
To: {destination}
Days: {days}
Travelers: {travelers}
Budget: {budget}
Type: {trip_style}

PLACES:
{json.dumps(all_clusters_info, indent=2)}

ROUTES:
{routes_summary}

RULES:
- Do NOT leave any field empty
- Be specific (no generic text)
- Use real place names
- Add transport details
- Add food suggestions
- Keep it realistic

RETURN STRICT JSON:

{{
  "trip_summary": {{
    "title": "",
    "destination": "{destination}",
    "duration": "{days} Days",
    "budget": "{budget}"
  }},
  "itinerary": [
    {{
      "day": 1,
      "theme": "",
      "activities": [
        {{
          "time": "Morning",
          "title": "",
          "description": "",
          "location": "",
          "transport": ""
        }},
        {{
          "time": "Afternoon",
          "title": "",
          "description": "",
          "location": "",
          "food": ""
        }},
        {{
          "time": "Evening",
          "title": "",
          "description": "",
          "location": "",
          "dinner": ""
        }}
      ]
    }}
  ],
  "recommendations": [
    "",
    "",
    ""
  ]
}}
"""

            # =========================
            # 🤖 LLM CALL
            # =========================
            response = llm.invoke(prompt)
            text = response.content.strip()

            # DEBUG
            print("\n========= LLM OUTPUT =========")
            print(text)
            print("==============================\n")

            # CLEAN MARKDOWN
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            # =========================
            # ✅ SAFE PARSE
            # =========================
            try:
                parsed = json.loads(text)
            except Exception:
                print("⚠️ JSON failed → using fallback")

                parsed = {
                    "trip_summary": {
                        "title": f"{destination} Trip",
                        "destination": destination,
                        "duration": f"{days} Days",
                        "budget": budget
                    },
                    "itinerary": [
                        {
                            "day": 1,
                            "theme": "Explore",
                            "activities": [
                                {
                                    "time": "Morning",
                                    "title": "Visit top attraction",
                                    "description": f"Explore popular place in {destination}",
                                    "location": destination,
                                    "transport": "Local cab"
                                },
                                {
                                    "time": "Afternoon",
                                    "title": "Lunch",
                                    "description": "Enjoy local food",
                                    "location": destination,
                                    "food": "Local cuisine"
                                },
                                {
                                    "time": "Evening",
                                    "title": "Relax",
                                    "description": "Walk and explore markets",
                                    "location": destination,
                                    "dinner": "Nearby restaurant"
                                }
                            ]
                        }
                    ],
                    "recommendations": [
                        "Start early",
                        "Try local food",
                        "Carry cash"
                    ]
                }

            # =========================
            # FINAL OUTPUT
            # =========================
            result = {
                "suggested_places": suggested_places,
                "trip_summary": parsed.get("trip_summary", {}),
                "itinerary": parsed.get("itinerary", []),
                "recommendations": parsed.get("recommendations", [])
            }

            return json.dumps(result, indent=2)

        except Exception as e:
            return json.dumps({
                "error": str(e)
            })

    return generate_plan_tool
