// 座標とズームレベルを指定 例：東京
const map = L.map('map').setView([35.681167, 139.767052], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // 右下にクレジットを表示
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
