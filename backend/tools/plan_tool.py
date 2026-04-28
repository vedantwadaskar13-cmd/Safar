import json
import math
from langchain.tools import tool


def create_generate_plan_tool(llm):

    # ----------------------------------------------------
    # MAIN PLAN TOOL
    # ----------------------------------------------------
    @tool
    def generate_plan_tool(input_json: str) -> str:
        """
        Generate detailed itinerary, travel options, recommendations,
        and estimated trip budget.
        """

        try:
            data = json.loads(input_json)

            preferences = data.get("preferences", {})
            ranked_clusters = data.get("ranked_clusters", [])
            routes = data.get("routes", [])

            days = preferences.get("days", 3)
            user_city = preferences.get("user_city", "nearest city")
            destination = ranked_clusters[0]["city"] if ranked_clusters else "destination"

            # -------------------------
            # Suggested Places
            # -------------------------
            suggested_places = []

            for cluster in ranked_clusters[:3]:
                for p in cluster.get("places", [])[:2]:
                    suggested_places.append({
                        "place_name": p.get("name"),
                        "place_location_city": cluster.get("city")
                    })

            # -------------------------
            # Detailed itinerary prompt
            # -------------------------
            prompt = f"""
USER CITY: {user_city}
DESTINATION: {destination}

DESTINATION DETAILS:
{json.dumps(cluster, indent=2)}

PLACES TO COVER:
{json.dumps(suggested_places, indent=2)}

Instructions:
1. Create a day-wise itinerary.
2. Each day must include morning, afternoon, and evening.
3. Mention actual places from PLACES TO COVER.
4. Ensure travel order is geographically logical.
5. Avoid generic filler text.
6. Include transport suggestions.
7. Add 3 useful recommendations.

Return ONLY valid JSON.
{{
  "recommendations": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "travel_options": {{
    "to_destination": "How to reach",
    "local_transport": "Local transport options"
  }},
  "itinerary": {{
    "day1": "Detailed plan",
    "day2": "Detailed plan"
  }}
}}
"""

            response = llm.invoke(prompt)
            text = response.content.strip()

            # Remove markdown if any
            text = text.replace("```json", "").replace("```", "").strip()

            parsed = json.loads(text)

          
            
            # -------------------------
            # Final merged response
            # -------------------------
            result = {
                "Suggested_places": suggested_places,
                "recommendations": parsed.get("recommendations", []),
                "travel_options": parsed.get("travel_options", {}),

                "itinerary": parsed.get("itinerary", {})
            }

            return json.dumps(result)

        except Exception as e:
            return json.dumps({
                "error": f"Plan generation failed: {str(e)}"
            })

    return generate_plan_tool
