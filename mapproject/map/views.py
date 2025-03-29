import random
import string
import json
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import CustomMap, Spot

def index(request):
    maps = CustomMap.objects.order_by('-created_at')  
    return render(request, 'map/index.html', {'maps': maps})  

def map_view(request, map_id):
    context = {'map_id': map_id}
    return render(request, 'map/map.html', context)  

def create_map(request):
    if request.method == 'POST':
        name =request.POST['name']
        map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        CustomMap.objects.create(id=map_id, name=name)
        return redirect('map:map_view', map_id=map_id)


def add_spot(request, map_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        map_obj = CustomMap.objects.get(id=map_id)
        Spot.objects.create(
            map=map_obj,
            name=data.get('name', ''),
            lat=data['lat'],
            lng=data['lng']
        )
        return JsonResponse({'status': 'okay'})

def get_spots(request, map_id):
    spots = Spot.objects.filter(map__id=map_id)
    spots_data = [
        {
            'name': s.name,
            'lat': s.lat,
            'lng': s.lng
        }
        for s in spots
    ]
    return JsonResponse(spots_data, safe=False)