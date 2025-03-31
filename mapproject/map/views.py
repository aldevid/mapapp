# map/views.py
import random
import string
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import CustomMap, Spot

def index(request):
    maps = CustomMap.objects.order_by('-created_at')  
    return render(request, 'map/index.html', {'maps': maps})  

def map_view(request, map_id):
    custom_map = get_object_or_404(CustomMap, id=map_id)
    spots = Spot.objects.filter(map=custom_map)
    other_maps = CustomMap.objects.exclude(id=map_id)  
    return render(request, 'map/map.html', {
        'custom_map': custom_map,
        'spots': spots,
        'other_maps': other_maps,
        'map_id': map_id,
    })

def default_map_view(request):
    spots = Spot.objects.all()
    maps = CustomMap.objects.order_by('-created_at')
    return render(request, 'map/default_map.html', {
        'spots': spots,
        'all_maps': maps,
    })


def create_map(request):
    if request.method == 'POST':
        name = request.POST['name']
        map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        CustomMap.objects.create(id=map_id, name=name)
        return JsonResponse({'status': 'ok', 'map_id': map_id}) 

@csrf_exempt
def add_spot(request, map_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        map_obj = CustomMap.objects.get(id=map_id)
        spot = Spot.objects.create(
            map=map_obj,
            name=data.get('name', ''),
            lat=data['lat'],
            lng=data['lng'],
            memo=data.get('memo', ''),
            genre=data.get('genre', ''),
            url=data.get('url', ''),
            hours=data.get('hours', ''),
            icon=data.get('icon', 'default')
        )
        return JsonResponse({
            'status': 'okay',
            'id': spot.id
        })


def get_spots(request, map_id):
    spots = Spot.objects.filter(map__id=map_id)
    spots_data = [
        {
            'id': s.id,
            'name': s.name,
            'lat': s.lat,
            'lng': s.lng,
            'memo': s.memo,
            'genre': s.genre,
            'url': s.url,
            'hours': s.hours,
            'icon': s.icon,
        }
        for s in spots
    ]
    return JsonResponse(spots_data, safe=False)

# spot detail
@csrf_exempt
@require_http_methods(["PUT"])
def update_spot(request, map_id, spot_id):
    data = json.loads(request.body)
    spot = Spot.objects.get(id=spot_id, map__id=map_id)
    spot.name = data.get('name', spot.name)
    spot.memo = data.get('memo', spot.memo)
    spot.genre = data.get('genre', spot.genre)
    spot.url = data.get('url', spot.url)
    spot.hours = data.get('hours', spot.hours),
    spot.icon = data.get('icon', spot.icon)
    spot.save()
    return JsonResponse({'status': 'updated'})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_spot(request, map_id, spot_id):
    try:
        spot = Spot.objects.get(id=spot_id, map__id=map_id)
        spot.delete()
        return JsonResponse({'status': 'deleted'})
    except Spot.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Spot not found'}, status=404)