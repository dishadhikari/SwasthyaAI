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
};

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
    <main style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>📍</span>
          </div>
          <div>
            <h1 style={styles.title}>Nearby Gyms</h1>
            <p style={styles.subtitle}>
              Find the 5 nearest gyms from your location
            </p>
          </div>
        </div>
        <Link href="/" style={styles.backButton}>
          ← Back to home
        </Link>
      </div>

      {/* Action Button */}
      <button
        style={{
          ...styles.findButton,
          ...(loading && styles.findButtonLoading),
        }}
        onClick={handleRequestLocation}
        type="button"
        disabled={loading}
        className="find-button"
      >
        {loading ? (
          <>
            <span style={styles.spinner}></span>
            Loading location...
          </>
        ) : (
          "🔍 Find nearby gyms"
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div style={styles.errorContainer} className="slide-down">
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Map Container */}
        <div style={styles.mapWrapper}>
          <div style={styles.mapContainer} ref={mapContainerRef}>
            {!location && !loading && (
              <div style={styles.mapPlaceholder}>
                <span style={styles.mapPlaceholderIcon}>🗺️</span>
                <p style={styles.mapPlaceholderText}>
                  Click "Find nearby gyms" to see gyms on the map
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gym List */}
        <div style={styles.gymList}>
          <h2 style={styles.gymListTitle}>
            Nearest Gyms
            {location && gyms.length > 0 && (
              <span style={styles.gymCount}>({gyms.length})</span>
            )}
          </h2>

          {location ? (
            gyms.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyStateText}>No gyms found nearby</p>
              </div>
            ) : (
              <ul style={styles.gymListItems}>
                {gyms.map((gym, index) => (
                  <li
                    key={gym.id}
                    style={{
                      ...styles.gymItem,
                      animationDelay: `${index * 0.1}s`,
                    }}
                    className="gym-item"
                  >
                    <div style={styles.gymRank}>{index + 1}</div>
                    <div style={styles.gymInfo}>
                      <h3 style={styles.gymName}>{gym.name}</h3>
                      <p style={styles.gymAddress}>{gym.address}</p>
                      <div style={styles.gymDistance}>
                        <span style={styles.distanceIcon}>📏</span>
                        <span>{gym.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div style={styles.placeholder}>
              <span style={styles.placeholderIcon}>🏋️</span>
              <p style={styles.placeholderText}>
                Allow location access to find nearby gyms
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .slide-down {
          animation: slideDown 0.4s ease-out;
        }

        .gym-item {
          animation: fadeInUp 0.5s ease-out both;
          transition: all 0.3s ease;
        }

        .gym-item:hover {
          transform: translateX(8px);
          background: #f5f5f5;
        }

        .find-button {
          transition: all 0.3s ease;
        }

        .find-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .find-button:active {
          transform: scale(0.98);
        }

        .find-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
    minHeight: "100vh",
    background: "#fafafa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "2px solid #000",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#000",
    fontSize: 24,
  },
  icon: {
    color: "#fff",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "4px 0 0 0",
  },
  backButton: {
    padding: "10px 20px",
    border: "2px solid #000",
    borderRadius: 8,
    background: "#fff",
    color: "#000",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    transition: "all 0.3s ease",
    display: "inline-block",
  },
  findButton: {
    padding: "14px 32px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    transition: "all 0.3s ease",
    minHeight: 52,
  },
  findButtonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2px solid #fff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: "#fff5f5",
    border: "1px solid #cc0000",
    borderRadius: 10,
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  errorText: {
    fontSize: "0.95rem",
    color: "#cc0000",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.9fr",
    gap: 24,
    marginTop: 8,
  },
  mapWrapper: {
    position: "relative" as const,
  },
  mapContainer: {
    height: "520px",
    minHeight: "420px",
    border: "2px solid #000",
    borderRadius: 12,
    background: "#f0f0f0",
    position: "relative" as const,
    overflow: "hidden",
  },
  mapPlaceholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 16,
    color: "#999",
  },
  mapPlaceholderIcon: {
    fontSize: "3rem",
  },
  mapPlaceholderText: {
    fontSize: "0.95rem",
    margin: 0,
    textAlign: "center" as const,
    maxWidth: 250,
  },
  gymList: {
    border: "2px solid #000",
    borderRadius: 12,
    padding: 24,
    background: "#fff",
    display: "flex",
    flexDirection: "column" as const,
  },
  gymListTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  gymCount: {
    fontSize: "0.9rem",
    fontWeight: 400,
    color: "#666",
    marginLeft: "auto",
  },
  gymListItems: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    flex: 1,
  },
  gymItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    background: "#fff",
    transition: "all 0.3s ease",
  },
  gymRank: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#000",
    margin: "0 0 4px 0",
  },
  gymAddress: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0 0 6px 0",
  },
  gymDistance: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.85rem",
    color: "#000",
    fontWeight: 500,
  },
  distanceIcon: {
    fontSize: "0.9rem",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 12,
    color: "#999",
    padding: "40px 20px",
  },
  placeholderIcon: {
    fontSize: "2.5rem",
  },
  placeholderText: {
    fontSize: "0.95rem",
    margin: 0,
    textAlign: "center" as const,
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    color: "#999",
    fontSize: "0.95rem",
  },
  emptyStateText: {
    margin: 0,
  },
} as const;