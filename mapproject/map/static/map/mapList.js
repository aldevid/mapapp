// mapList.js

export function setupMapListUI() {
  const toggle = document.getElementById('my-map-toggle');
  const list = document.getElementById('my-map-list');

  toggle?.addEventListener('click', () => {
    const isVisible = list.style.display === 'block';
    list.style.display = isVisible ? 'none' : 'block';
    toggle.innerText = isVisible ? 'Myマップ ▾' : 'Myマップ ▴';
  });

  document.getElementById('show-create-map-form')?.addEventListener('click', () => {
    const form = document.getElementById('create-map-form');
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
  });

  document.getElementById('submit-new-map')?.addEventListener('click', () => {
    const name = document.getElementById('new-map-name').value;
    if (!name.trim()) {
      alert('マップ名を入力してください');
      return;
    }

    fetch("/map/create/ajax/", {
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
        // ✅ 作成後、そのマップに即座に遷移！
        window.location.href = `/map/${data.map_id}/`;
      } else {
        alert('マップの作成に失敗しました。');
      }
    })
    .catch(() => {
      alert('通信エラーが発生しました。');
    });
  });
}
