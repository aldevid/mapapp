// mapCore.js
const isDefaultMap = String(IS_DEFAULT_MAP) === "true";
const loadedSpots = [];
let map;
let currentTempMarker = null;

export function initMap() {
  map = L.map('map').setView([35.181446, 136.906398], 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // 自分のマップ or ホームマップのときだけ、クリックでピン追加を許可
  if (IS_OWNER || isDefaultMap) {
    map.on('click', handleMapClick);
  }
}


export function loadSpots() {
  const url = MAP_ID ? `/map/${MAP_ID}/spots/` : `/map/default/spots/`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      loadedSpots.length = 0;

      data.forEach(spot => {
        loadedSpots.push(spot);

        const marker = L.marker([spot.lat, spot.lng], {
          icon: getColoredIcon(spot.icon || 'default')
        }).addTo(map);

        marker.spotData = spot;

        // ✅ 毎回最新のスポットを渡すように
        marker.on('click', () => {
          closeMapListIfOpen();
          openSidebarWithSpot(marker.spotData);  // ← this → marker
        });
      });
    });
}




function handleMapClick(e) {
  const { lat, lng } = e.latlng;
  closeMapListIfOpen();

  if (currentTempMarker) {
    map.removeLayer(currentTempMarker);
    currentTempMarker = null;
  }

  const marker = L.marker([lat, lng], {
    icon: getColoredIcon('default')
  }).addTo(map);

  marker.isSaved = false;
  marker.spotData = {
    id: null,
    lat, lng,
    name: '',
    memo: '',
    genre: '',
    url: '',
    hours: '',
    icon: 'default'
  };

  currentTempMarker = marker;
  openSidebarWithSpot(marker.spotData);
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function closeMapListIfOpen() {
  const mapList = document.getElementById('my-map-list');
  if (mapList && mapList.style.display === 'block') {
    mapList.style.display = 'none';
    const toggle = document.getElementById('my-map-toggle');
    if (toggle) toggle.innerText = 'Myマップ ▾';
  }
}

function openSidebarWithSpot(spot) {
  window.openSidebar();

  const sidebar = document.getElementById('sidebar-main');
  const sidebarWrapper = document.getElementById('sidebar');
  sidebarWrapper.classList.remove('hidden');
  sidebar.style.display = 'block';
  sidebar.classList.add('visible');

  // Spot IDを更新
  sidebar.dataset.spotId = spot.id ? String(spot.id) : '';
  sidebar.dataset.mapId = spot.map_id || '';

  // 各フォームに反映
  document.getElementById('spot-name').value = spot.name || '';
  document.getElementById('spot-memo').value = spot.memo || '';
  document.getElementById('spot-genre').value = spot.genre || '';
  document.getElementById('spot-url').value = spot.url || '';
  document.getElementById('spot-hours').value = spot.hours || '';
  document.getElementById('spot-icon').value = spot.icon || 'default';

  // 🔧 新規ピンかどうかでモード切り替え
  if (!spot.id) {
    enterEditMode();
  } else {
    showViewMode(spot);
  }

  // デフォルトマップの場合の切り替え表示
  setTimeout(() => {
    const mapSelectWrapper = document.getElementById('map-select-wrapper');
    const savedMapName = document.getElementById('saved-map-name');  // ← HTMLに追加するやつ（後述）
    const mapNameText = document.getElementById('map-name-text');

    if (isDefaultMap) {
      if (!spot.id) {
        // 新規ピン → セレクト表示、マップ名非表示
        if (mapSelectWrapper) mapSelectWrapper.style.display = 'block';
        if (savedMapName) savedMapName.style.display = 'none';
      } else {
        // 保存済みピン → セレクト非表示、マップ名表示
        if (mapSelectWrapper) mapSelectWrapper.style.display = 'none';
        if (savedMapName) {
          savedMapName.style.display = 'block';
          mapNameText.textContent = spot.map_name || 'ホーム'; // ← Djangoから受け取った値
        }
      }
    }
  }, 0);

  // 編集・削除ボタンの制御
  const editBtn = document.getElementById('edit-spot-btn');
  const saveBtn = document.getElementById('save-spot-btn');
  const deleteBtn = document.getElementById('delete-spot-btn');

  if (!IS_OWNER && !isDefaultMap) {
    editBtn?.classList.add('hidden');
    saveBtn?.classList.add('hidden');
    deleteBtn?.classList.add('hidden');
  } else {
    editBtn?.classList.remove('hidden');
    deleteBtn?.classList.remove('hidden');
  }
}




function enterEditMode() {
  document.querySelectorAll('.edit-field').forEach(el => el.style.display = 'inline');
  document.querySelectorAll('#sidebar-main span, #sidebar-main a').forEach(el => el.style.display = 'none');
  document.getElementById('edit-spot-btn').style.display = 'none';
  document.getElementById('save-spot-btn').style.display = 'inline';

  // 🔽 ここから追加
  if (isDefaultMap) {
    const mapSelectWrapper = document.getElementById('map-select-wrapper');
    const savedMapName = document.getElementById('saved-map-name');

    if (mapSelectWrapper) mapSelectWrapper.style.display = 'block';
    if (savedMapName) savedMapName.style.display = 'none';

    // 🔽 セレクトボックスに現在のマップIDを反映
    const select = document.getElementById('select-map-id');
    const sidebar = document.getElementById('sidebar-main');
    const currentMapId = sidebar.dataset.mapId;

    if (select && currentMapId) {
      select.value = currentMapId;
    }
  }
  // 🔼 ここまで追加
}



function showViewMode(spot) {
  const spotId = spot.id || document.getElementById('sidebar-main').dataset.spotId;
  if (!spotId || spotId === "null") return;

  document.querySelectorAll('.edit-field').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#sidebar-main span, #sidebar-main a').forEach(el => el.style.display = 'inline');
  document.getElementById('edit-spot-btn').style.display = 'inline';
  document.getElementById('save-spot-btn').style.display = 'none';

  document.getElementById('disp-name').textContent = spot.name;

  const iconEl = document.getElementById('icon-display');
  iconEl.innerHTML = `
    <div style="
      background-color: ${getPinColor(spot.icon)};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 2px rgba(0,0,0,0.3);
    "></div>`;

  document.getElementById('disp-genre').textContent = spot.genre;
  document.getElementById('disp-url').textContent = spot.url;
  document.getElementById('disp-url').href = spot.url;
  document.getElementById('disp-hours').textContent = spot.hours;
  document.getElementById("disp-memo").innerHTML = spot.memo.replace(/\n/g, "<br>");

  const savedMapName = document.getElementById('saved-map-name');
  const mapNameText = document.getElementById('map-name-text');

  if (isDefaultMap && savedMapName &&mapNameText) {
    savedMapName.style.display = 'block';
    mapNameText.textContent = spot.map_name || 'ホーム'; // ← Djangoから受け取った値
  }

  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer.spotData && String(layer.spotData.id) === String(spotId)) {
      layer.spotData = { ...spot };
      layer.setIcon(getColoredIcon(spot.icon || 'default'));
      layer.bindPopup(spot.name);
    }
  });
}

document.getElementById('edit-spot-btn')?.addEventListener('click', () => {
  enterEditMode();
});

document.getElementById('save-spot-btn')?.addEventListener('click', () => {
  const spotId = document.getElementById('sidebar-main').dataset.spotId;
  const name = document.getElementById('spot-name').value;
  const genre = document.getElementById('spot-genre').value;
  const url = document.getElementById('spot-url').value;
  const hours = document.getElementById('spot-hours').value;
  const memo = document.getElementById('spot-memo').value;
  const icon = document.getElementById('spot-icon').value;
  const latLng = currentTempMarker ? currentTempMarker.getLatLng() : null;
  const mapIdForSave = isDefaultMap ? document.getElementById('select-map-id')?.value : MAP_ID;

  const payload = { name, genre, url, hours, memo, icon };

  if (isDefaultMap) {
    payload.map_id = mapIdForSave;
  }

  if (!spotId || spotId === "null") {
    if (!latLng) return;
    payload.lat = latLng.lat;
    payload.lng = latLng.lng;
    if (mapIdForSave) {
      payload.map_id = mapIdForSave;
    }

    const postUrl = isDefaultMap
      ? '/map/default/spots/add/'
      : `/map/${MAP_ID}/spots/add/`;

    fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'okay') {
        const newId = String(data.id);
        document.getElementById('sidebar-main').dataset.spotId = newId;

        if (currentTempMarker) {
          currentTempMarker.spotData = { id: newId, ...payload, lat: latLng.lat, lng: latLng.lng };
          currentTempMarker.setIcon(getColoredIcon(icon));
          currentTempMarker.bindPopup(name);
          currentTempMarker.on('click', function () {
            openSidebarWithSpot(this.spotData);
          });
          currentTempMarker = null;
        }

        showViewMode({ id: newId, ...payload });
      }
    });

  } else {
    const updateUrl = isDefaultMap
      ? `/map/default/spots/${spotId}/update/`
      : `/map/${MAP_ID}/spots/${spotId}/update/`;

    fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'updated') {
        showViewMode({ id: spotId, ...payload });
      }
    });
  }
});


document.getElementById('delete-spot-btn')?.addEventListener('click', () => {
  const spotId = document.getElementById('sidebar-main').dataset.spotId;
  if (!spotId || !confirm("このスポットを削除しますか？")) return;

  const deleteUrl = isDefaultMap
    ? `/map/default/spots/${spotId}/delete/`
    : `/map/${MAP_ID}/spots/${spotId}/delete/`;

  fetch(deleteUrl, {
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


function getColoredIcon(color) {
  const pinColors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    orange: '#e67e22',
    purple: '#9b59b6',
    default: '#7f8c8d'
  };

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${pinColors[color] || pinColors.default};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 2px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

function getPinColor(icon) {
  const pinColors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    orange: '#e67e22',
    purple: '#9b59b6',
    default: '#7f8c8d'
  };
  return pinColors[icon] || pinColors.default;
}
// heatmap setting
let heatLayer = null;
let heatVisible = false;

document.getElementById("heatmap-toggle")?.addEventListener("click", () => {
  heatVisible = !heatVisible;

  if (heatLayer) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }

  if (heatVisible) {
    const heatPoints = loadedSpots.map(s => [s.lat, s.lng, 0.5]); // 0.5は強度
    heatLayer = L.heatLayer(heatPoints, { 
      radius: 25,
      blur: 25,
      gradient: {
        0.0: '#3B4CC0',
        0.5: '#ffffff',
        1.0: '#B40426'
       }
    }).addTo(map);
  }
});
