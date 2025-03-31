const map = L.map('map').setView([35.181446, 136.906398], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let currentTempMarker = null;

map.on('click', function (e) {
  const { lat, lng } = e.latlng;

  if (currentTempMarker) {
    map.removeLayer(currentTempMarker);
    currentTempMarker = null;
  }

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

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
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
  document.getElementById('disp-genre').textContent = spot.genre;
  document.getElementById('disp-url').textContent = spot.url;
  document.getElementById('disp-url').href = spot.url;
  document.getElementById('disp-hours').textContent = spot.hours;
  document.getElementById('disp-memo').textContent = spot.memo;

  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker && layer.spotData && String(layer.spotData.id) === String(spotId)) {
      layer.spotData = {
        id: spotId,
        name: spot.name,
        genre: spot.genre,
        url: spot.url,
        hours: spot.hours,
        memo: spot.memo
      };
      layer.bindPopup(spot.name);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
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

    const latLng = currentTempMarker ? currentTempMarker.getLatLng() : null;

    if (!spotId || spotId === "null") {
      if (!latLng) return;

      fetch(`/map/${MAP_ID}/spots/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name, genre, url, hours, memo, lat: latLng.lat, lng: latLng.lng })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.status === 'okay') {
            const newId = String(data.id);
            document.getElementById('sidebar-main').dataset.spotId = newId;
        
            if (currentTempMarker) {
              // 保存されたピンとして更新
              currentTempMarker.spotData = {
                id: newId,
                lat: latLng.lat,
                lng: latLng.lng,
                name, genre, url, hours, memo
              };
        
              currentTempMarker.bindPopup(name);
              currentTempMarker.on('click', function () {
                openSidebarWithSpot(this.spotData);
              });
        
              // currentTempMarker はもう仮ではなくなるので、nullにして消さないようにする
              currentTempMarker = null;
            }
        
            // 表示モードに切り替え
            showViewMode({ id: newId, name, genre, url, hours, memo });
          }
        })
        
        .catch(err => {
          console.error('保存エラー:', err);
        });

    } else {
      fetch(`/map/${MAP_ID}/spots/${spotId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ name, genre, url, hours, memo })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'updated') {
            showViewMode({ id: spotId, name, genre, url, hours, memo });
          }
        });
    }
  });
});

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
