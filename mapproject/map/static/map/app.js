// 地図を名古屋に初期表示
const map = L.map('map').setView([35.181446, 136.906398], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 地図クリックで仮ピン＋保存ボタン表示
map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    const marker = L.marker([lat, lng]).addTo(map);
    const markerId = marker._leaflet_id;

    const popupContent = `
        <div style="text-align: center; min-width: 80px;">
            <button class="save-btn" onclick="saveSpot(${lat}, ${lng}, this, ${markerId})">保存</button>
        </div>
    `;
    marker.bindPopup(popupContent).openPopup();

    marker.on('popupclose', function () {
        if (!marker.isSaved) {
            map.removeLayer(marker);
        }
    });

    window._tempMarkers = window._tempMarkers || [];
    window._tempMarkers[markerId] = marker;
});

// CSRFトークン取得（Django用）
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// ピン保存処理
function saveSpot(lat, lng, button, markerId) {
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
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'okay') {
            button.innerText = "保存しました";
            const marker = window._tempMarkers[markerId];
            if (marker) {
                marker.isSaved = true;
                marker.spotData = {
                    id: data.id,
                    name: "📍スポット",
                    memo: "",
                    genre: "",
                    url: "",
                    hours: ""
                };
                marker.bindPopup("📍スポット");
                marker.on('click', function () {
                    openSidebarWithSpot(this.spotData);
                });
            }
        } else {
            button.innerText = "保存失敗";
            button.disabled = false;
        }
    });
}

// サイドバーにスポット情報を表示
function openSidebarWithSpot(spot) {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.display = 'block';

    document.getElementById('spot-name').value = spot.name || '';
    document.getElementById('spot-memo').value = spot.memo || '';
    document.getElementById('spot-genre').value = spot.genre || '';
    document.getElementById('spot-url').value = spot.url || '';
    document.getElementById('spot-hours').value = spot.hours || '';

    sidebar.dataset.spotId = spot.id;
}

// 初期ロード時に保存済みスポットを読み込む
fetch(`/map/${MAP_ID}/spots/`)
    .then(response => response.json())
    .then(data => {
        data.forEach(spot => {
            const marker = L.marker([spot.lat, spot.lng])
                .addTo(map)
                .bindPopup(spot.name);

            marker.spotData = spot;

            marker.on('click', function () {
                openSidebarWithSpot(this.spotData);
            });
        });
    });

// サイドバーのフォーム送信でスポット更新
document.getElementById('spot-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const spotId = document.getElementById('sidebar').dataset.spotId;
    const name = document.getElementById('spot-name').value;
    const memo = document.getElementById('spot-memo').value;
    const genre = document.getElementById('spot-genre').value;
    const url = document.getElementById('spot-url').value;
    const hours = document.getElementById('spot-hours').value;

    fetch(`/map/${MAP_ID}/spots/${spotId}/update/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name, memo, genre, url, hours })
    })
    .then(res => res.json())
    .then(data => {
        // マップ上のポップアップとデータ更新
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker && layer.spotData && layer.spotData.id == spotId) {
                layer.bindPopup(name);
                layer.spotData = { id: spotId, name, memo, genre, url, hours };
            }
        });

        // 軽い保存完了フィードバック
        const sidebar = document.getElementById('sidebar');
        sidebar.style.backgroundColor = "#d1ffd1";
        setTimeout(() => sidebar.style.backgroundColor = "#f9f9f9", 500);
    });
});
