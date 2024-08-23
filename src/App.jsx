import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedOffices, setSortedOffices] = useState([]);
  const [zipCode, setZipCode] = useState("");

  const offices = [
    {
      name: "New York Office",
      location: [-73.935242, 40.73061],
      url: "https://www.ny-office.com",
    },
    {
      name: "Los Angeles Office",
      location: [-118.243683, 34.052235],
      url: "https://www.la-office.com",
    },
    {
      name: "Chicago Office",
      location: [-87.623177, 41.881832],
      url: "https://www.chi-office.com",
    },
    {
      name: "Houston Office",
      location: [-95.369804, 29.760427],
      url: "https://www.hou-office.com",
    },
    {
      name: "San Francisco Office",
      location: [-122.419418, 37.774929],
      url: "https://www.sf-office.com",
    },
    {
      name: "Miami Office",
      location: [-80.191788, 25.761681],
      url: "https://www.miami-office.com",
    },
    {
      name: "St. Louis Office",
      location: [-90.199402, 38.627003],
      url: "https://www.stl-office.com",
    },
    {
      name: "Austin Office",
      location: [-97.743057, 30.267153],
      url: "https://www.austin-office.com",
    },
  ];

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZGFuczIxNyIsImEiOiJjbTAwOXNqaDUxbTdkMmpweHJ6bWVyMmdwIn0.65Lxy8UPm2Xd1o11WdH0Pg";

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11", // style URL
      center: [-98.35, 39.5], // center of the USA
      zoom: 4, // starting zoom
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = [longitude, latitude];
        setUserLocation(userCoords);

        // Center the map on the user's location
        mapRef.current.setCenter(userCoords);
        mapRef.current.setZoom(12); // Adjust the zoom level as desired

        // Add marker for user's location
        new mapboxgl.Marker({ color: "red" })
          .setLngLat(userCoords)
          .addTo(mapRef.current);

        // Sort offices by proximity to user's location
        const sorted = offices
          .map((office) => ({
            ...office,
            distance: calculateDistance(userCoords, office.location),
          }))
          .sort((a, b) => a.distance - b.distance);

        setSortedOffices(sorted);
      });
    } else {
      alert("Geolocation is not supported by your browser");
    }

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []); // Empty dependency array to ensure this runs only once

  useEffect(() => {
    if (userLocation && sortedOffices.length > 0) {
      // Add markers and popups for office locations
      sortedOffices.forEach((office) => {
        const marker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat(office.location)
          .addTo(mapRef.current);

        // Add popup to the marker
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="text-align: center;">
            <strong>${office.name}</strong><br />
            <a href="${office.url}" target="_blank" style="color: blue; text-decoration: underline;">Visit Website</a>
          </div>`
        );
        marker.setPopup(popup);

        // Add click handler to focus map on the marker
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
  }, [sortedOffices]); // Run this effect only when sortedOffices is updated

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (coords1, coords2) => {
    const [lng1, lat1] = coords1;
    const [lng2, lat2] = coords2;
    const toRad = (x) => (x * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in km
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

  // Handle click on office in the list
  const handleOfficeClick = (office) => {
    mapRef.current.flyTo({
      center: office.location,
      zoom: 14,
      essential: true,
    });
  };

  // Handle recentering the map to user's location
  const handleRecenter = () => {
    if (userLocation) {
      mapRef.current.flyTo({
        center: userLocation,
        zoom: 12,
        essential: true,
      });
    }
  };

  // Handle ZIP code lookup
  const handleZipCodeLookup = () => {
    if (zipCode) {
      // Use a geocoding API to get coordinates for the ZIP code
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipCode}.json?access_token=${mapboxgl.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            const newCoords = [longitude, latitude];

            // Center the map on the new coordinates
            mapRef.current.flyTo({
              center: newCoords,
              zoom: 12,
              essential: true,
            });

            // Sort offices by proximity to the new location
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
    <div className="h-screen flex flex-col bg-blue-100">
      <div className="flex justify-between items-center p-4 bg-blue-300">
        <h1 className="text-2xl font-bold text-white">Office Locator</h1>
        <div className="flex items-center">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP Code"
            className="mr-2 py-2 px-4 rounded border"
          />
          <button
            onClick={handleZipCodeLookup}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button
            onClick={handleRecenter}
            className="ml-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Recenter
          </button>
        </div>
      </div>
      <div className="flex flex-grow">
        <div
          ref={mapContainerRef}
          className="w-3/4 h-full"
          style={{ position: "relative" }}
        />
        <div className="w-1/4 h-full overflow-y-auto">
          <h2 className="text-xl font-semibold p-4">Offices</h2>
          <ul>
            {sortedOffices.map((office) => (
              <li
                key={office.name}
                onClick={() => handleOfficeClick(office)}
                className="cursor-pointer p-4 border-b"
              >
                <h3 className="font-semibold">{office.name}</h3>
                <p>{office.distance.toFixed(2)} km away</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
