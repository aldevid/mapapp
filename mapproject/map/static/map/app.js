// 座標とズームレベルを指定 例：東京
const map = L.map('map').setView([35.681167, 139.767052], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    const marker = L.marker([lat, lng]).addTo(map).bindPopup(`📍スポット`);
    marker.openPopup();

    fetch(`/map/${MAP_ID}/spots/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken() 
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            name: "スポット"
        })
    }).then(res => console.log('追加完了'));
});

fetch(`/map/${MAP_ID}/spots/`)
    .then(response => response.json())
    .then(data => {
        data.forEach(spot => {
            L.marker([spot.lat, spot.lng])
            .addTo(map)
            .bindPopup(spot.name);
        });
    });

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');

}
