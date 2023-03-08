(function(){ // start iife

    //create map in leaflet and tie it to the div called 'theMap'
    const map = L.map('theMap').setView([44.65496816087739, -63.595840174183564], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    // Create variable to hold the Buses API 
    const apiURL = 'https://prog2700.onrender.com/hrmbuses';

    // Create a global layer for the leaflet map, undefined for the moment
    let markerLayer = undefined;

    // Create a function to hold our fetch function and other code
    const fetchBuses = () => {
        // Fetch the data
        fetch(apiURL)
        .then(response => response.json())
        .then((json) =>{
            // console log the json data
            console.log(json);
            // grab the json date related to buses in HRM
            const routes = json.entity
            // filter the json data to only include routes 1 through 10 
            .filter((route) => {
                return route.vehicle.trip.routeId <= 10;
            })
            // Now we want to format our route information into geoJSON
            .map((route) => {
                return {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates":[route.vehicle.position.longitude, route.vehicle.position.latitude]    // [long, lat] of the JSON 
                    },
                    "properties": {
                        // Properties from the JSON that we want to have on the bus markers
                        "busRoute": route.vehicle.trip.routeId,
                        "busSpeed": route.vehicle.position.speed,
                        "busLabel": route.vehicle.vehicle.label,
                        "bearing": route.vehicle.position.bearing
                    }
                };
            });
            
            // Check if the markerLayer has any markers, if it does, remove the markers on refresh

            if(markerLayer != undefined){
                map.removeLayer(markerLayer);
            }

            // Now add the markerLayer to the map
            markerLayer = L.layerGroup().addTo(map);

            // Now plot the geoSON on the markerLayer
            L.geoJSON(routes, {
                // Use pointToLayer (https://leafletjs.com/examples/geojson/) function 
                pointToLayer: function(feature, latlng) {
                    // Create the plane icon to be displayed as a marker
                    let busIcon = L.icon({
                        iconUrl: 'bus.png',
                        iconSize: [20, 20],
                    });
                    
                    // this function now will return the L.marker method that includes the plane icon, and the direction the plane is headed (bearing)
                    return L.marker(latlng, {icon: busIcon, rotationAngle: feature.properties.bearing})
                    .bindPopup(
                        // Now we can add the properties we want to display in the HTML
                        'Bus Speed: ' + feature.properties.busSpeed + '</br>' +
                        'Bus Label: ' + feature.properties.busLabel + '</br>' +
                        'Bus Route: ' + feature.properties.busRoute + '</br>'
                    );
                }
                // Lastly - add all this to the marker Layer
            }).addTo(markerLayer); 
        }) // End of Fetch
    } // End of Fetch Function
    
    fetchBuses();
    setInterval(fetchBuses, 15000);



})() // END OF IIFE