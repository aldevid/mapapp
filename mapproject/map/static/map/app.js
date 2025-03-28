// 座標とズームレベルを指定 例：東京
const map = L.map('map').setView([35.681167, 139.767052], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // 右下にクレジットを表示
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// スポットをクリックで追加（仮）
map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    L.marker([lat, lng]).addTo(map).bindPopup(`📍スポット<br>Lat: ${lat}<br>Lng: ${lng}`);
    console.log('保存対象:', {
        map_id: MAP_ID,
        lat,
        lng
    });
    // TODO: Ajaxでバックエンドに保存する処理を書く
});
