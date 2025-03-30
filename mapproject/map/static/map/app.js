// 地図を名古屋に初期表示
const map = L.map('map').setView([35.181446, 136.906398], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 地図クリックで仮ピン＋保存ボタン表示
let currentTempMarker = null;

map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    // 既存の仮ピンがあれば削除
    if (currentTempMarker) {
        map.removeLayer(currentTempMarker);
        currentTempMarker = null;
    }

    // 新しい仮ピンを立てる
    const marker = L.marker([lat, lng]).addTo(map);
    marker.isSaved = false;
    marker.spotData = {
        id: null,
        lat, lng,
        name: '',
        memo: '',
        genre: '', 
        url: '',
        hours: ''
    };

    currentTempMarker = marker;

    openSidebarWithSpot(marker.spotData);
});


// CSRFトークン取得（Django用）
function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}



// サイドバーにスポット情報を表示
function openSidebarWithSpot(spot) {
    const sidebar = document.getElementById('sidebar-main');
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

    

// sidebar add button
document.getElementById('spot-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const spotId = document.getElementById('sidebar-main').dataset.spotId;
    const name = document.getElementById('spot-name').value;
    const memo = document.getElementById('spot-memo').value;
    const genre = document.getElementById('spot-genre').value;
    const url = document.getElementById('spot-url').value;
    const hours = document.getElementById('spot-hours').value;
  
    if (!spotId || spotId === "null") {
        if (!currentTempMarker) return;
      
        const { lat, lng } = currentTempMarker.getLatLng();
      
        fetch(`/map/${MAP_ID}/spots/add/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
          },
          body: JSON.stringify({ name, memo, genre, url, hours, lat, lng })
        })
        .then(res => res.json())
        .then(data => {
          location.reload(); // 保存後はとりあえずリロードでもOK
        });      
  
    } else {
      // ⭐️ 既存スポットを更新
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
        // UI更新
        map.eachLayer(function(layer) {
          if (layer instanceof L.Marker && layer.spotData && layer.spotData.id == spotId) {
            layer.bindPopup(name);
            layer.spotData = { id: spotId, name, memo, genre, url, hours };
          }
        });
  
        const sidebar = document.getElementById('sidebar-main');
        sidebar.style.backgroundColor = "#d1ffd1";
        setTimeout(() => sidebar.style.backgroundColor = "#f9f9f9", 500);
      });
    }
  });
  

// sidebar delete button
document.getElementById('delete-spot-btn').addEventListener('click', function() {
    const spotId = document.getElementById('sidebar-main').dataset.spotId;

    if (!spotId || !confirm("このスポットを削除しますか？")) return;

    fetch(`/map/${MAP_ID}/spots/${spotId}/delete/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken()
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'deleted') {
            map.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.spotData && layer.spotData.id == spotId) {
                    map.removeLayer(layer);
                }
            });

            document.getElementById('sidebar-main').style.display = 'none';

        }
    });
});
// sidebar modify


// 展開/非表示処理（そのままでOK）
function toggleMapList() {
  const list = document.getElementById('my-map-list');
  const toggle = document.getElementById('my-map-toggle');
  if (list.style.display === 'none' || list.style.display === '') {
    list.style.display = 'block';
    toggle.innerText = 'Myマップ ▴';
  } else {
    list.style.display = 'none';
    toggle.innerText = 'Myマップ ▾';
  }
}
// 作成フォーム表示
document.getElementById('show-create-map-form').addEventListener('click', () => {
  const form = document.getElementById('create-map-form');
  form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
});
// Ajaxでマップ作成
document.getElementById('submit-new-map').addEventListener('click', () => {
  const name = document.getElementById('new-map-name').value;
  if (!name.trim()) {
    alert('マップ名を入力してください');
    return;
  }
  fetch("{% url 'map:create_map' %}", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
    },
    body: `name=${encodeURIComponent(name)}`
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      window.location.href = `/map/${data.map_id}/`;
    }
  });
});
