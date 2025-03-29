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

def create_map(request):
    if request.method == 'POST':
        name =request.POST['name']
        map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        CustomMap.objects.create(id=map_id, name=name)
        return redirect('map:map_view', map_id=map_id)


