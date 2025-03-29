import random
import string
from django.shortcuts import render, redirect
from .models import CustomMap
def index(request):
    maps = CustomMap.objects.order_by('-created_at')  
    return render(request, 'map/index.html', {'maps': maps})  # ← これから作るテンプレート

def map_view(request, map_id):
    context = {'map_id': map_id}
    return render(request, 'map/map.html', context)  # ← これから作るテンプレート

# def create_map(request):
#     if request.method == 'POST':
#         name =request.POST['name']
#         map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
#         CustomMap.objects.create(id=map_id, name=name)
#         return redirect('map:map_view', map_id=map_id)

import random
import string
from django.shortcuts import render, redirect
from .models import CustomMap

def create_map(request):
    if request.method == 'POST':
        print("📌 POST受信OK")
        try:
            name = request.POST.get('name')
            print("✅ name = ", name)

            map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            print("✅ map_id = ", map_id)

            new_map = CustomMap.objects.create(id=map_id, name=name)
            print("✅ CustomMap保存成功: ", new_map)

            return redirect('map:map_view', map_id=map_id)
        except Exception as e:
            print("❌ 保存中にエラー発生:", e)

