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

// フォームの表示・非表示切り替え
document.getElementById('show-create-map-form').addEventListener('click', () => {
  const form = document.getElementById('create-map-form');
  form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
});

// マップ作成処理
document.getElementById('submit-new-map').addEventListener('click', () => {
  const name = document.getElementById('new-map-name').value;
  if (!name.trim()) {
    alert('マップ名を入力してください');
    return;
  }

  fetch("/map/create/", {  // ← 必要に応じてURL修正
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
