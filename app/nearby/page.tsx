"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface GymLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  distance: number;
}

const defaultIconOptions = {
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
};

const userIconOptions = {
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
}
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const buildOverpassQuery = (lat: number, lon: number) => {
  return `
[out:json][timeout:25];
(
  node["amenity"="gym"](around:5000,${lat},${lon});
  node["leisure"="fitness_centre"](around:5000,${lat},${lon});
  node["sport"="gym"](around:5000,${lat},${lon});
  way["amenity"="gym"](around:5000,${lat},${lon});
  way["leisure"="fitness_centre"](around:5000,${lat},${lon});
  way["sport"="gym"](around:5000,${lat},${lon});
);
out center;`;
};

const parseAddress = (tags: Record<string, string> | undefined) => {
  if (!tags) return "Address not available";
  return (
    tags["addr:full"] ||
    `${tags["addr:street"] || ""}${tags["addr:housenumber"] ? " " + tags["addr:housenumber"] : ""}`.trim() ||
    tags["addr:city"] ||
    tags["addr:suburb"] ||
    tags["name"] ||
    "Address not available"
  );
};

export default function NearbyGymsPage() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [gyms, setGyms] = useState<GymLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const clearMarkers = () => {
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    }
  };

  const renderMap = async (lat: number, lon: number) => {
    if (!mapContainerRef.current) return;

    const { default: L } = await import("leaflet");

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 14,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lon], 14);
    }

    clearMarkers();

    if (layerGroupRef.current) {
      L.marker([lat, lon], { icon: L.icon(userIconOptions) })
        .bindPopup("You are here")
        .addTo(layerGroupRef.current);
    }
  };

  const loadNearbyGyms = async (lat: number, lon: number) => {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: buildOverpassQuery(lat, lon),
    });

    if (!response.ok) {
      throw new Error("Failed to load nearby gyms from Overpass.");
    }

    const data = await response.json();
    const gymsData = (data.elements ?? [])
      .map((element: any) => {
        const latValue = element.lat ?? element.center?.lat;
        const lonValue = element.lon ?? element.center?.lon;
        if (!latValue || !lonValue) return null;

        return {
          id: `${element.type}-${element.id}`,
          name: (element.tags?.name as string) || "Gym",
          lat: latValue,
          lon: lonValue,
          address: parseAddress(element.tags),
          distance: calculateDistance(lat, lon, latValue, lonValue),
        } as GymLocation;
      })
      .filter(Boolean) as GymLocation[];

    return gymsData
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  };

  const placeGymMarkers = async (gymLocations: GymLocation[]) => {
    const { default: L } = await import("leaflet");
    clearMarkers();

    if (layerGroupRef.current) {
      gymLocations.forEach((gym) => {
        const marker = L.marker([gym.lat, gym.lon], { icon: L.icon(defaultIconOptions) })
          .bindPopup(`<strong>${gym.name}</strong><br/>${gym.address}<br/>${gym.distance.toFixed(1)} km away`)
          .addTo(layerGroupRef.current);

        marker.on("click", () => {
          marker.openPopup();
        });
      });
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });

        try {
          renderMap(lat, lon);
          const nearbyGyms = await loadNearbyGyms(lat, lon);
          setGyms(nearbyGyms);
          placeGymMarkers(nearbyGyms);

          if (nearbyGyms.length === 0) {
            setError("No gyms found nearby. Try expanding your search area.");
          }
        } catch (fetchError: any) {
          setError(fetchError.message || "Unable to load nearby gyms.");
          setGyms([]);
        } finally {
          setLoading(false);
        }
      },
      (positionError) => {
        setLoading(false);
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setError("Location permission denied. Please allow location access.");
        } else {
          setError("Unable to determine your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );
  };

  useEffect(() => {
    if (location && mapRef.current) {
      renderMap(location.lat, location.lon);
      placeGymMarkers(gyms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nearby Gyms</h1>
          <p className="text-sm text-muted-foreground">
            Click the button to allow location access and show the 5 nearest gyms on a free map.
          </p>
        </div>
        <Link href="/" className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted">
          Back to home
        </Link>
      </div>

      <button
        className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        onClick={handleRequestLocation}
        type="button"
      >
        {loading ? "Loading location…" : "Find nearby gyms"}
      </button>

      {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="h-[520px] min-h-[420px] rounded-lg border border-border" ref={mapContainerRef} />

        <div className="space-y-4 rounded-lg border border-border bg-background p-4">
          <h2 className="text-xl font-semibold">Nearest gyms</h2>
          {location ? (
            gyms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gyms found yet. Click the button above to load nearby gyms.</p>
            ) : (
              <ul className="space-y-4">
                {gyms.map((gym) => (
                  <li key={gym.id} className="rounded-lg border border-muted/30 p-3">
                    <h3 className="font-semibold">{gym.name}</h3>
                    <p className="text-sm text-muted-foreground">{gym.address}</p>
                    <p className="text-sm">{gym.distance.toFixed(1)} km away</p>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
              Tap "Find nearby gyms" to allow location access and show gyms on the map.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
