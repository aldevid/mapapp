// mapCore.js

let map;
let currentTempMarker = null;

export function initMap() {
  map = L.map('map').setView([35.181446, 136.906398], 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  map.on('click', handleMapClick);
}

export function loadSpots() {
  fetch(`/map/${MAP_ID}/spots/`)
    .then(response => response.json())
    .then(data => {
      data.forEach(spot => {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: getColoredIcon(spot.icon || 'default')
        }).addTo(map);

        marker.spotData = spot;
        marker.on('click', function () {
          closeMapListIfOpen();
          openSidebarWithSpot(this.spotData);
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
  if (mapList.style.display === 'block') {
    mapList.style.display = 'none';
    const toggle = document.getElementById('my-map-toggle');
    if (toggle) toggle.innerText = 'Myマップ ▾';
  }
}

function openSidebarWithSpot(spot) {
  const isNew = !spot.id || spot.id === "null";
  const sidebar = document.getElementById('sidebar-main');
  sidebar.style.display = 'block';

  document.getElementById('spot-name').value = spot.name || '';
  document.getElementById('spot-memo').value = spot.memo || '';
  document.getElementById('spot-genre').value = spot.genre || '';
  document.getElementById('spot-url').value = spot.url || '';
  document.getElementById('spot-hours').value = spot.hours || '';
  document.getElementById('spot-icon').value = spot.icon || 'default';

  sidebar.dataset.spotId = spot.id && spot.id !== 'null' ? String(spot.id) : '';

  if (isNew) {
    enterEditMode();
  } else {
    showViewMode(spot);
  }
}

function enterEditMode() {
  document.querySelectorAll('.edit-field').forEach(el => el.style.display = 'inline');
  document.querySelectorAll('#sidebar-main span, #sidebar-main a').forEach(el => el.style.display = 'none');
  document.getElementById('edit-spot-btn').style.display = 'none';
  document.getElementById('save-spot-btn').style.display = 'inline';
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
      "></div>`

  document.getElementById('disp-genre').textContent = spot.genre;
  document.getElementById('disp-url').textContent = spot.url;
  document.getElementById('disp-url').href = spot.url;
  document.getElementById('disp-hours').textContent = spot.hours;
  document.getElementById("disp-memo").innerHTML = spot.memo.replace(/\n/g, "<br>");

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

  const payload = { name, genre, url, hours, memo, icon };

  if (!spotId || spotId === "null") {
    if (!latLng) return;
    payload.lat = latLng.lat;
    payload.lng = latLng.lng;

    fetch(`/map/${MAP_ID}/spots/add/`, {
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
    fetch(`/map/${MAP_ID}/spots/${spotId}/update/`, {
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

document.getElementById('delete-spot-btn').addEventListener('click', function () {
  const spotId = document.getElementById('sidebar-main').dataset.spotId;
  if (!spotId || spotId === 'null' || !confirm("このスポットを削除しますか？")) return;

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
  