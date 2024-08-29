import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Papa from "papaparse";
import { FaSearchLocation, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Map() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedOffices, setSortedOffices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [zipCode, setZipCode] = useState("");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

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
          `<div style="background-color: #1E1E1E; border-radius: 12px; padding: 15px; color: white; max-width: 300px; font-family: Arial, sans-serif;">
          <div style="display: flex; align-items: center;">
            <img src="${office.image || "placeholder.webp"}" alt="${
            office.name
          }" style="width: 50px; height: 50px; border-radius: 8px; margin-right: 15px;" />
            <div style="flex-grow: 1;">
              <strong style="font-size: 18px;">${office.name}</strong><br />
             
            </div>
          </div>
          <div style="margin-top: 10px; text-align: left;">
            <a href="${
              office.url
            }" target="_blank" style="color: #1E90FF; text-decoration: none; font-size: 14px;">Visit Website</a><br /><br />
            <button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              Book Now
            </button>
          </div>
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
    <div className="relative h-screen bg-gray-900">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex absolute top-4 left-4 w-80 md:w-96 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg p-4 z-10">
        <div className="flex flex-col w-full">
          <div className="flex">
            <button
              onClick={handleBack}
              className="flex items-center mb-4 text-white text-sm md:text-base"
            >
              <FaArrowLeft className="mr-2" />
            </button>
            <h2 className="text-lg md:text-2xl font-semibold text-white mb-4">
              Office Locations
            </h2>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP Code"
              className="w-full py-2 px-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearchLocation
              onClick={handleZipCodeLookup}
              className="absolute right-3 top-3 text-blue-500 cursor-pointer"
              size={24}
            />
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
            <ul className="divide-y divide-gray-700">
              {sortedOffices.map((office) => (
                <li
                  key={office.name}
                  onClick={() => handleOfficeClick(office)}
                  className="cursor-pointer p-4 hover:bg-gray-700 transition duration-200"
                >
                  <h3 className="font-medium text-white">{office.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {office.distance.toFixed(2)} miles away
                    </p>
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm mr-1">
                        ★★★★★
                      </span>
                      <span className="text-gray-400 text-sm">(123)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Open 9 AM - 5 PM</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-screen">
        {/* Top half with the map */}
        <div
          ref={mapContainerRef}
          className="flex-grow w-full h-1/2 md:h-1/2 bg-gray-700"
        >
          {/* Mapbox's GeolocateControl will handle recentering */}
        </div>

        {/* Bottom half with the list */}
        <div className="flex md:hidden w-full h-1/2 overflow-auto bg-gray-800 bg-opacity-90 rounded-t-lg shadow-lg p-4 z-10">
          <div className="flex flex-col w-full h-full">
            <div className="flex">
              <button
                onClick={handleBack}
                className="flex items-center mb-4 text-white text-sm"
              >
                <FaArrowLeft className="mr-2" />
              </button>
              <h2 className="text-lg font-semibold text-white mb-4">
                Office Locations
              </h2>
            </div>

            <div className="flex-grow h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
              <div className="relative mb-4">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP Code"
                  className="w-full py-2 px-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearchLocation
                  onClick={handleZipCodeLookup}
                  className="absolute right-3 top-3 text-blue-500 cursor-pointer"
                  size={24}
                />
              </div>
              <ul className="divide-y divide-gray-700">
                {sortedOffices.map((office) => (
                  <li
                    key={office.name}
                    onClick={() => handleOfficeClick(office)}
                    className="cursor-pointer p-4 hover:bg-gray-700 transition duration-200"
                  >
                    <h3 className="font-medium text-white">{office.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        {office.distance.toFixed(2)} miles away
                      </p>
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-sm mr-1">
                          ★★★★★
                        </span>
                        <span className="text-gray-400 text-sm">(123)</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Open 9 AM - 5 PM</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;
