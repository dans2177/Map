import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Papa from "papaparse";
import { FaSearchLocation } from "react-icons/fa";

function Map() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedOffices, setSortedOffices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [zipCode, setZipCode] = useState("");

  // Fetch and parse the CSV file
  useEffect(() => {
    fetch("/offices.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const loadedOffices = result.data.map((office) => ({
              name: office.name?.trim() || "Unknown Office",
              location: [
                parseFloat(office.longitude?.trim()) || 0,
                parseFloat(office.latitude?.trim()) || 0,
              ],
              url: office.url?.trim() || "#",
            }));
            setOffices(loadedOffices);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          },
        });
      })
      .catch((error) => console.error("Error fetching CSV:", error));
  }, []);

  // Initialize the map and request user location on page load
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZGFuczIxNyIsImEiOiJjbTAwOXNqaDUxbTdkMmpweHJ6bWVyMmdwIn0.65Lxy8UPm2Xd1o11WdH0Pg";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98.35, 39.5], // Default center of the map
      zoom: 4,
    });

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    mapRef.current.addControl(geolocateControl);

    // Automatically trigger the geolocation when the map is ready
    mapRef.current.on("load", () => {
      geolocateControl.trigger();
    });

    geolocateControl.on("geolocate", (position) => {
      const { latitude, longitude } = position.coords;
      const userCoords = [longitude, latitude];
      setUserLocation(userCoords);

      mapRef.current.flyTo({
        center: userCoords,
        zoom: 12,
        essential: true,
      });

      const sorted = offices
        .map((office) => ({
          ...office,
          distance: calculateDistance(userCoords, office.location),
        }))
        .sort((a, b) => a.distance - b.distance);

      setSortedOffices(sorted);
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [offices]);

  useEffect(() => {
    if (userLocation && sortedOffices.length > 0) {
      sortedOffices.forEach((office) => {
        const marker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat(office.location)
          .addTo(mapRef.current);

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="text-align: center;">
          <strong>${office.name}</strong><br />
          <a href="${office.url}" target="_blank" style="color: blue; text-decoration: underline;">Visit Website</a>
        </div>`
        );
        marker.setPopup(popup);

        marker.getElement().addEventListener("click", () => {
          mapRef.current.flyTo({
            center: office.location,
            zoom: 14,
            essential: true,
          });
          popup.addTo(mapRef.current);
        });
      });
    }
  }, [sortedOffices, userLocation]);

  const calculateDistance = (coords1, coords2) => {
    const [lng1, lat1] = coords1;
    const [lng2, lat2] = coords2;
    const toRad = (x) => (x * Math.PI) / 180;

    const R = 3959; // Radius of the Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const handleOfficeClick = (office) => {
    mapRef.current.flyTo({
      center: office.location,
      zoom: 14,
      essential: true,
    });
  };

  const handleZipCodeLookup = () => {
    if (zipCode) {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipCode}.json?access_token=${mapboxgl.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            const newCoords = [longitude, latitude];

            mapRef.current.flyTo({
              center: newCoords,
              zoom: 12,
              essential: true,
            });

            const sorted = offices
              .map((office) => ({
                ...office,
                distance: calculateDistance(newCoords, office.location),
              }))
              .sort((a, b) => a.distance - b.distance);

            setUserLocation(newCoords);
            setSortedOffices(sorted);
          } else {
            alert("Invalid ZIP code or no results found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching geocoding data:", error);
          alert("An error occurred while looking up the ZIP code.");
        });
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-blue-100">
      <div className="md:w-1/3 md:h-full w-full h-2/5 flex flex-col bg-white shadow-lg m-4 md:m-0">
        <h2 className="text-2xl font-bold p-4 bg-blue-500 text-white text-center ">
          Office Locations
        </h2>
        <div className="p-4 flex flex-col">
          <div className="relative mb-2">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP Code"
              className="w-full py-2 px-4 rounded border pr-10"
            />
            <FaSearchLocation
              onClick={handleZipCodeLookup}
              className="absolute right-3 top-3 text-blue-500 cursor-pointer"
              size={20}
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <ul>
            {sortedOffices.map((office) => (
              <li
                key={office.name}
                onClick={() => handleOfficeClick(office)}
                className="cursor-pointer p-4 border-b"
              >
                <h3 className="font-semibold">{office.name}</h3>
                <p>{office.distance.toFixed(2)} miles away</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-grow w-full h-full relative">
        {/* Mapbox's GeolocateControl will handle recentering */}
      </div>
    </div>
  );
}

export default Map;
