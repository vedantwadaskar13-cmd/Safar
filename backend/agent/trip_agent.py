import json
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI

from tools.match_tool import create_match_places_tool
from tools.rank_tool import create_rank_places_tool
from tools.plan_tool import create_generate_plan_tool
from tools.route_tool import create_osm_route_tool

load_dotenv()

# -------------------------
# LLM
# -------------------------
llm = ChatMistralAI(
    model="mistral-small-2506",
    temperature=0
)

# -------------------------
# TOOLS
# -------------------------
match_tool = create_match_places_tool(llm)
rank_tool = create_rank_places_tool(llm)
route_tool = create_osm_route_tool(llm)
plan_tool = create_generate_plan_tool(llm)


# =========================================================
# SMART FILTER (STATE + CITY PRIORITY)
# =========================================================
def filter_places_by_location(places, state, city):
    if not state:
        return places

    filtered = []

    for p in places:
        p_state = (p.get("state") or "").lower()
        p_city = (p.get("city") or "").lower()

        # ❌ must match state strictly
        if p_state != state.lower():
            continue

        # ⭐ add city match flag
        p["city_match"] = (p_city == (city or "").lower())

        filtered.append(p)

    # ⭐ CITY PRIORITY SORT (IMPORTANT FIX)
    filtered.sort(
        key=lambda x: x.get("city_match", False),
        reverse=True
    )

    return filtered


# =========================================================
# CLUSTER BY CITY
# =========================================================
def cluster_places_by_city(places):
    clusters = {}

    for place in places:
        city = place.get("city", "Unknown")

        if city not in clusters:
            clusters[city] = {
                "city": city,
                "places": [],
                "totalScore": 0
            }

        clusters[city]["places"].append(place)

        # ⭐ BOOST SCORE IF SAME CITY
        base_score = place.get("matchScore", 0)

        clusters[city]["totalScore"] += base_score

    cluster_list = list(clusters.values())

    return sorted(cluster_list, key=lambda x: x["totalScore"], reverse=True)


# =========================================================
# MAIN AGENT
# =========================================================
def run_trip_agent(preferences: dict, places: list):

    try:
        # -------------------------
        # STEP 1: SMART FILTER
        # -------------------------
        filtered_places = filter_places_by_location(
            places,
            preferences.get("state"),
            preferences.get("city")
        )

        if not filtered_places:
            return {
                "error": f"No places found for state: {preferences.get('state')}"
            }

        # -------------------------
        # STEP 2: MATCH TOOL
        # -------------------------
        matched_result = match_tool.invoke({
            "preferences_json": json.dumps(preferences),
            "places_json": json.dumps(filtered_places)
        })

        matched_data = json.loads(matched_result)

        if "matches" not in matched_data:
            return {
                "error": "Match tool failed",
                "data": matched_data
            }

        # -------------------------
        # STEP 3: RANK TOOL
        # -------------------------
        ranked_result = rank_tool.invoke({
            "input_json": json.dumps(matched_data)
        })

        ranked_data = json.loads(ranked_result)

        ranked_places = ranked_data.get("ranked_places", [])

        if not ranked_places:
            return {
                "error": "No ranked places found"
            }

        # -------------------------
        # STEP 4: CLUSTER BY CITY
        # -------------------------
       
        ranked_clusters = cluster_places_by_city(ranked_places)

        preferred_city = preferences.get("city", "").lower()

        ranked_clusters = [
            c for c in ranked_clusters
            if c["city"].lower() == preferred_city
        ]

        if not ranked_clusters:
            ranked_clusters = cluster_places_by_city(ranked_places)[:1]
        # -------------------------
        # STEP 5: ROUTE TOOL (FIXED)
        # -------------------------
        route_result = route_tool.invoke({
            "input_json": json.dumps({
                "preferences": preferences,
                "ranked_clusters": ranked_clusters
            })
        })

        route_data = json.loads(route_result)
        routes = route_data.get("routes", [])

        # -------------------------
        # STEP 6: PLAN TOOL
        # -------------------------
        merged_data = {
            "preferences": preferences,
            "ranked_clusters": ranked_clusters,
            "routes": routes
        }

        final_plan = plan_tool.invoke({
            "input_json": json.dumps(merged_data)
        })

        final_plan_data = json.loads(final_plan)

        # -------------------------
        # STEP 7: ATTACH ROUTES
        # -------------------------
        final_plan_data["routes"] = routes

        return final_plan_data

    except Exception as e:
        return {
            "error": "Trip agent failed",
            "details": str(e)
        }
