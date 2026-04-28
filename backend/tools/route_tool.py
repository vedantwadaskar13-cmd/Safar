import json
import requests
from langchain.tools import tool


# =========================================================
# 1. GEOCODING (CITY → LAT/LNG)
# =========================================================
def get_coords(city):
    try:
        if not city:
            return None

        url = "https://nominatim.openstreetmap.org/search"

        params = {
            "q": city,
            "format": "json",
            "limit": 1
        }

        headers = {
            "User-Agent": "SafarAI/1.0 (contact: safar.ai@gmail.com)"
        }

        res = requests.get(url, params=params, headers=headers, timeout=10)

        if res.status_code != 200:
            print("GEOCODING FAILED STATUS:", res.status_code)
            return None

        data = res.json()

        print("GEOCODING RESPONSE:", data)

        if not data:
            return None

        lat = float(data[0]["lat"])
        lon = float(data[0]["lon"])

        return [lat, lon]

    except Exception as e:
        print("GEOCODING ERROR:", e)
        return None



# =========================================================
# 2. OSRM ROUTE ENGINE
# =========================================================
def get_route_osrm(lat1, lon1, lat2, lon2):
    try:
        url = (
            "http://router.project-osrm.org/route/v1/driving/"
            f"{lon1},{lat1};{lon2},{lat2}"
            "?overview=full&geometries=geojson"
        )

        res = requests.get(url, timeout=10)
        data = res.json()

        # 🔥 FIX: proper validation
        if data.get("code") != "Ok":
            print("OSRM ERROR:", data)
            return None

        route = data["routes"][0]

        coords = route["geometry"]["coordinates"]

        geometry = [
            {"lat": lat, "lng": lng} for lng, lat in coords
        ]

        return {
            "distance_km": round(route["distance"] / 1000, 1),
            "travel_time": round(route["duration"] / 3600, 2),
            "geometry": geometry
        }

    except Exception as e:
        print("OSRM exception:", e)
        return None


# =========================================================
# 3. TOOL WRAPPER
# =========================================================
def create_osm_route_tool(llm):

    @tool
    def route_tool(input_json: str) -> str:
        """
        OpenStreetMap + OSRM Route Generator with Auto Geocoding
        """

        try:
            data = json.loads(input_json)

            preferences = data.get("preferences", {})
            user_city = preferences.get("user_city")

            cluster = (data.get("ranked_clusters") or [{}])[0]
            destination = cluster.get("city")
            places = cluster.get("places", [])

            routes = []

            # =====================================================
            # MAIN ROUTE (USER → DESTINATION)
            # =====================================================
            user_coords = data.get("user_coords")
            dest_coords = data.get("dest_coords")

            # 🔥 AUTO GEOCODING IF MISSING
            if not user_coords and user_city:
                user_coords = get_coords(user_city)

            if not dest_coords and destination:
                dest_coords = get_coords(destination)

            print("DEBUG USER COORDS:", user_coords)
            print("DEBUG DEST COORDS:", dest_coords)

            if user_coords and dest_coords:

                route = get_route_osrm(
                    user_coords[0], user_coords[1],
                    dest_coords[0], dest_coords[1]
                )

                if route:
                    routes.append({
                        "from": user_city,
                        "to": destination,
                        "distance_km": route["distance_km"],
                        "travel_time": route["travel_time"],
                        "geometry": route["geometry"]
                    })

            # =====================================================
            # LOCAL ROUTES (PLACE TO PLACE)
            # =====================================================
            prev = destination

            for p in places:
                name = p.get("name")
                if not name:
                    continue

                c1 = p.get("coords_from")
                c2 = p.get("coords_to")

                # 🔥 AUTO GEOCODE IF MISSING
                if not c1:
                    c1 = get_coords(prev)

                if not c2:
                    c2 = get_coords(name)

                if c1 and c2:
                    route = get_route_osrm(c1[0], c1[1], c2[0], c2[1])

                    if route:
                        routes.append({
                            "from": prev,
                            "to": name,
                            "distance_km": route["distance_km"],
                            "travel_time": route["travel_time"],
                            "geometry": route["geometry"]
                        })

                prev = name

            return json.dumps({
                "status": "success",
                "provider": "OpenStreetMap + OSRM + Nominatim",
                "routes": routes
            })

        except Exception as e:
            return json.dumps({
                "status": "error",
                "routes": [],
                "error": str(e)
            })

    return route_tool
