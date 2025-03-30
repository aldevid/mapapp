const MAP_ID = "{{ map_id }}";

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

    document.getElementById('show-create-map-form').addEventListener('click', () => {
      const form = document.getElementById('create-map-form');
      form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
    });

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