mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-123.1207, 49.2827], // Starting position 
    zoom: 15
});

map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        profile: 'mapbox/walking', // to show walking route first,
        unit: 'metric'
    }),
    'top-left'
);

// Add the image/icon to the map
map.loadImage(
    'https://cdn-icons-png.flaticon.com/512/61/61168.png',
    (error, image) => {
        if (error) throw error;

        // Add the image to the map style with width and height values
        map.addImage('userpin', image, { width: 10, height: 10 });

        // Adds user's current location as a source to the map
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = [position.coords.longitude, position.coords.latitude];

            if (userLocation) {
                map.addSource('userLocation', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [{
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': userLocation
                            },
                            'properties': {
                                'description': 'Your location'
                            }
                        }]
                    }
                });

                // Creates a layer above the map displaying the user's location
                map.addLayer({
                    'id': 'userLocation',
                    'type': 'symbol',
                    'source': 'userLocation',
                    'layout': {
                        'icon-image': 'userpin', // Pin Icon
                        'icon-size': 0.05, // Pin Size
                        'icon-allow-overlap': true // Allows icons to overlap
                    }
                });

                // Map On Click function that creates a popup displaying the user's location
                map.on('click', 'userLocation', (e) => {
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = e.features[0].properties.description;

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the userLocation layer.
                map.on('mouseenter', 'userLocation', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Defaults cursor when not hovering over the userLocation layer
                map.on('mouseleave', 'userLocation', () => {
                    map.getCanvas().style.cursor = '';
                });
            }
        });
    }
);


// declare some globally used variables
var userLocationMarker;
var searchLocationMarker;
var userLocation;
var searchLocation;

// Get the user's location
navigator.geolocation.getCurrentPosition(function (position) {
    userLocation = [position.coords.longitude, position.coords.latitude];

    // Add a marker to the map at the user's location
    userLocationMarker = new mapboxgl.Marker()
        .setLngLat(userLocation)
        .addTo(map);

    // Center the map on the user's location
    map.flyTo({
        center: userLocation
    });
});
