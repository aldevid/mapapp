// 地図を初期表示（例：東京）
const map = L.map('map').setView([35.681167, 139.767052], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// クリックで仮ピンを立てて「保存」ボタン表示
map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    const marker = L.marker([lat, lng]).addTo(map);

    const popupContent = `
      <div style="text-align: center;">
        <strong>📍保存しますか？</strong><br>
        <button onclick="saveSpot(${lat}, ${lng}, this)">保存</button>
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();
});

// ピンを保存
function saveSpot(lat, lng, button) {
    button.disabled = true;
    button.innerText = "保存中...";

    fetch(`/map/${MAP_ID}/spots/add/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            lat: lat,
            lng: lng,
            name: "📍スポット"
        })
    }).then(res => {
        if (res.ok) {
            button.innerText = "保存しました";
        } else {
            button.innerText = "保存失敗";
            button.disabled = false;
        }
    });
}

// 画面読み込み時：すでに保存されたピンを全て表示
fetch(`/map/${MAP_ID}/spots/`)
    .then(response => response.json())
    .then(data => {
        data.forEach(spot => {
            L.marker([spot.lat, spot.lng])
            .addTo(map)
            .bindPopup(spot.name);
        });
    });

// CSRFトークンを取得（Django用）
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}
