import json
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

            preferences     = data.get("preferences", {})
            ranked_clusters = data.get("ranked_clusters", [])
            routes          = data.get("routes", [])

            # ── Preferences ────────────────────────────────────────
            days         = preferences.get("days", 3)
            user_city    = preferences.get("user_city", "nearest city")
            budget       = preferences.get("budget", "not specified")
            travelers    = preferences.get("travelers", 1)
            trip_style   = preferences.get("trip_style", "general")
            destination  = ranked_clusters[0]["city"] if ranked_clusters else "destination"

            # ── Suggested Places (top 3 clusters, 2 places each) ───
            # FIX: `cluster` was only available inside the loop before;
            #      now we capture all clusters correctly.
            suggested_places = []
            all_clusters_info = []

            for cluster in ranked_clusters[:3]:
                cluster_entry = {
                    "city": cluster.get("city"),
                    "highlights": cluster.get("highlights", []),
                    "places": []
                }
                for p in cluster.get("places", [])[:2]:
                    place = {
                        "place_name": p.get("name"),
                        "place_location_city": cluster.get("city"),
                        "category": p.get("category", ""),
                        "description": p.get("description", ""),
                        "entry_fee": p.get("entry_fee", ""),
                        "best_time": p.get("best_time", "")
                    }
                    suggested_places.append(place)
                    cluster_entry["places"].append(place)
                all_clusters_info.append(cluster_entry)

            # ── Routes summary ─────────────────────────────────────
            routes_summary = ""
            if routes:
                route_lines = []
                for r in routes[:3]:
                    mode   = r.get("mode", "unknown")
                    dur    = r.get("duration", "")
                    cost   = r.get("cost", "")
                    desc   = r.get("description", "")
                    route_lines.append(f"- {mode}: {desc} | Duration: {dur} | Cost: {cost}")
                routes_summary = "\n".join(route_lines)
            else:
                routes_summary = "No route data provided — infer best transport options."

            # ── Day-slot builder (ensures correct number of days) ──
            day_schema = {}
            for d in range(1, days + 1):
                day_schema[f"day{d}"] = {
                    "theme": f"<theme for day {d}>",
                    "morning": {
                        "time": "08:00 – 12:00",
                        "activity": "<activity description>",
                        "place": "<place name>",
                        "transport": "<how to get there>"
                    },
                    "afternoon": {
                        "time": "12:00 – 17:00",
                        "activity": "<activity description>",
                        "place": "<place name>",
                        "food_stop": "<recommended lunch spot or cuisine>"
                    },
                    "evening": {
                        "time": "17:00 – 21:00",
                        "activity": "<activity description>",
                        "place": "<place name>",
                        "dinner": "<recommended dinner spot or cuisine>"
                    },
                    "estimated_daily_cost": "<₹ amount for this day>"
                }

            day_schema_str = json.dumps(day_schema, indent=2)

            # ── IMPROVED PROMPT ────────────────────────────────────
            prompt = f"""
You are an expert Indian travel planner with deep knowledge of local culture,
geography, transport, food, and hidden gems.

=== TRIP OVERVIEW ===
- Traveler's home city  : {user_city}
- Destination           : {destination}
- Number of days        : {days}
- Number of travelers   : {travelers}
- Total budget          : {budget}
- Trip style            : {trip_style}

=== DESTINATION & PLACES ===
{json.dumps(all_clusters_info, indent=2)}

=== AVAILABLE ROUTES FROM {user_city} TO {destination} ===
{routes_summary}

=== YOUR TASK ===
Generate a complete, detailed, day-wise travel plan. Follow every rule below exactly.

RULES:
1. Fill EVERY day from day1 to day{days}. Do NOT skip any day.
2. Each day MUST have: theme, morning, afternoon, evening, estimated_daily_cost.
3. Morning/afternoon/evening MUST each have: time, activity, place, and either
   transport (morning) or food_stop/dinner (afternoon/evening).
4. Use ONLY real places from the DESTINATION & PLACES section above.
   Do NOT invent fictional place names.
5. Activities must be specific and vivid — no generic phrases like
   "explore the area" or "enjoy the day". Describe exactly what to do and see.
6. Geographic logic: plan each day so travel between places is minimal.
   Group nearby places on the same day.
7. Budget logic: keep the daily costs realistic and consistent with the
   total budget of {budget}. Show per-day estimates.
8. Travel options: use the ROUTES data to give accurate to_destination advice.
   For local_transport, list 2–3 specific options (auto, cab, metro, etc.) with
   approximate costs.
9. Recommendations: give 3 highly specific, actionable tips for THIS destination
   (not generic travel advice). Each tip must be 2–3 sentences.
10. Return ONLY valid JSON. No markdown, no explanation text outside the JSON.

=== OUTPUT FORMAT (fill every field, keep all keys) ===
{{
  "trip_summary": {{
    "destination": "{destination}",
    "duration": "{days} days",
    "travelers": {travelers},
    "budget": "{budget}",
    "trip_style": "{trip_style}"
  }},
  "travel_options": {{
    "to_destination": "<detailed how-to-reach from {user_city} — mention mode, duration, cost, booking tips>",
    "local_transport": "<2–3 local transport options with approximate per-day cost>"
  }},
  "recommendations": [
    "<Specific tip 1 for {destination} — 2–3 sentences>",
    "<Specific tip 2 for {destination} — 2–3 sentences>",
    "<Specific tip 3 for {destination} — 2–3 sentences>"
  ],
  "itinerary": {day_schema_str},
  "total_estimated_cost": "<total ₹ for all {days} days for {travelers} traveler(s)>"
}}
"""

            # ── LLM call ───────────────────────────────────────────
            response = llm.invoke(prompt)
            text = response.content.strip()

            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            parsed = json.loads(text)

            # ── Final merged response ──────────────────────────────
            result = {
                "suggested_places":    suggested_places,
                "trip_summary":        parsed.get("trip_summary", {}),
                "travel_options":      parsed.get("travel_options", {}),
                "recommendations":     parsed.get("recommendations", []),
                "itinerary":           parsed.get("itinerary", {}),
                "total_estimated_cost": parsed.get("total_estimated_cost", "")
            }

            return json.dumps(result, ensure_ascii=False, indent=2)

        except json.JSONDecodeError as je:
            return json.dumps({
                "error": f"LLM returned invalid JSON: {str(je)}",
                "raw_text": text if 'text' in locals() else "no response"
            })
        except Exception as e:
            return json.dumps({
                "error": f"Plan generation failed: {str(e)}"
            })

    return generate_plan_tool
