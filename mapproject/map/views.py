# map/views.py
import random
import string
import json
from django.urls import reverse  # ← これを先頭で追加！
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponseForbidden
from django.shortcuts import render, redirect, get_object_or_404
import xml.etree.ElementTree as ET
from django.db.models import Q
from django.http import JsonResponse
from .models import CustomMap, Spot

#indexはもう不必要
# @login_required
# def index(request):
#     maps = CustomMap.objects.filter(user=request.user).order_by('-created_at')
#     return render(request, 'map/index.html', {'maps': maps})
# @login_required

@login_required
def map_view(request, map_id):
    try:
        custom_map = CustomMap.objects.get(id=map_id)
    except CustomMap.DoesNotExist:
        return HttpResponseForbidden("このマップは存在しません。")

    # 自分のマップか、公開されているものだけ表示OK
    if custom_map.user != request.user and not custom_map.is_public:
        return HttpResponseForbidden("このマップにはアクセスできません。")

    spots = Spot.objects.filter(map=custom_map)
    other_maps = CustomMap.objects.filter(user=request.user, is_system_default=False).exclude(id=map_id)

    return render(request, 'map/map.html', {
        'custom_map': custom_map,
        'spots': spots,
        'map_id': map_id,
        'other_maps': other_maps,
        'username': request.user.username, # <-この１行を追加
        'email': request.user.email,  # ←★追加
        'display_map_name': custom_map.name,        # ← ここを追加
        'is_owner': custom_map.user == request.user,
        'is_default': False,  
    })

@login_required
def default_map_view(request):
    user_maps = CustomMap.objects.filter(user=request.user)
    return render(request, 'map/map.html', {
        'custom_map': None,        # 表示されるマップ名は空
        'map_id': '',              # map_id が空 → JS側で「デフォルトモード」だと判定
        'other_maps': user_maps,   # サイドバーに表示するマイマップ一覧
        'username': request.user.username,          # ← ユーザー名を渡す
        'email': request.user.email,  # ←★追加
        'display_map_name': 'ホーム',                # ← 表示用マップ名を追加
        "is_owner": True,        # 自分のマップなので、true
        "is_default": True,     # デフォルトモードなので、true
    })

@login_required
def get_default_spots(request):
    user_maps = CustomMap.objects.filter(user=request.user)
    spots = Spot.objects.filter(map__in=user_maps)

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


@login_required
def create_map(request):
    """ 通常のフォームからのPOSTでマップ作成してページ遷移する用 """
    if request.method == 'POST':
        name = request.POST['name']
        map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        CustomMap.objects.create(id=map_id, name=name, user=request.user)
        return redirect('map:map_view', map_id=map_id)

@login_required
def create_map_ajax(request):
    if request.method == 'POST':
        name = request.POST['name']
        map_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        CustomMap.objects.create(id=map_id, name=name, user=request.user)
        return JsonResponse({'status': 'ok', 'map_id': map_id})

def recommended_maps_view(request):
    query = request.GET.get('q', '')
    maps = CustomMap.objects.filter(is_recommended=True, is_public=True)

    if query:
        maps = maps.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(genre__icontains=query)
        )

    return render(request, 'map/recommendations.html', {
        'maps': maps,
        'query': query
    })

def recommended_maps_json(request):
    maps = CustomMap.objects.filter(is_recommended=True, is_public=True)
    data = [
        {
            'id': m.id,
            'name': m.name,
            'genre': m.genre,
            'user': m.user.username,
        }
        for m in maps
    ]
    return JsonResponse({'maps': data})


@csrf_exempt
@login_required
def update_map_settings(request, map_id):
    if request.method == 'POST':
        try:
            m = CustomMap.objects.get(id=map_id, user=request.user)
        except CustomMap.DoesNotExist:
            return JsonResponse({'status': 'not_found'})

        data = json.loads(request.body)
        m.is_recommended = data.get('is_recommended', False)
        m.is_public = True if m.is_recommended else False  # ✅ 自動で公開ON/OFF
        m.genre = data.get('genre', '')
        m.description = data.get('description', '')
        m.save()

        return JsonResponse({'status': 'ok'})



@csrf_exempt
@login_required
def add_spot_default(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        map_id = data.get("map_id", "")

        if map_id:
            map_obj = get_object_or_404(CustomMap, id=map_id, user=request.user)
        else:
            # 複数あっても最初の1つを使うようにする
            map_obj = CustomMap.objects.filter(user=request.user, name="デフォルト保存スポット").first()
            if not map_obj:
                map_obj = CustomMap.objects.create(
                    user=request.user,
                    name="デフォルト保存スポット",
                    id="default-" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)),
                )

        spot = Spot.objects.create(
            map=map_obj,
            name=data.get('name', ''),
            lat=data['lat'],
            lng=data['lng'],
            memo=data.get('memo', ''),
            genre=data.get('genre', ''),
            url=data.get('url', ''),
            hours=data.get('hours', ''),
            icon=data.get('icon', 'default'),
        )
        return JsonResponse({'status': 'okay', 'id': spot.id})



@csrf_exempt
@require_http_methods(["PUT"])
def update_spot_default(request, spot_id):
    data = json.loads(request.body)
    spot = get_object_or_404(Spot, id=spot_id, map__user=request.user)
    spot.name = data.get('name', spot.name)
    spot.memo = data.get('memo', spot.memo)
    spot.genre = data.get('genre', spot.genre)
    spot.url = data.get('url', spot.url)
    spot.hours = data.get('hours', spot.hours)
    spot.icon = data.get('icon', spot.icon)
    spot.save()
    return JsonResponse({'status': 'updated'})

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_spot_default(request, spot_id):
    spot = get_object_or_404(Spot, id=spot_id, map__user=request.user)
    spot.delete()
    return JsonResponse({'status': 'deleted'})

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

@login_required
def get_spots(request, map_id):
    custom_map = get_object_or_404(CustomMap, id=map_id, user=request.user)
    spots = Spot.objects.filter(map=custom_map)
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
    spot.hours = data.get('hours', spot.hours)
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


# mapdata import kml

@login_required
def kml_upload_view(request):
    if request.method == "POST" and request.FILES.get("kml_file"):
        kml_file = request.FILES["kml_file"]
        tree = ET.parse(kml_file)
        root = tree.getroot()
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        placemarks = root.findall('.//kml:Placemark', ns)

        # ✅ デフォルトマップ（is_default=True）を取得
        default_map, _ = CustomMap.objects.get_or_create(
            user=request.user,
            is_system_default=True,
            defaults={
                "id": "default-" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8)),
                "name": "デフォルト保存スポット",
            }
        )
        for placemark in placemarks:
            name_el = placemark.find('kml:name', ns)
            coords_el = placemark.find('.//kml:coordinates', ns)
            if name_el is not None and coords_el is not None:
                try:
                    lon, lat, *_ = coords_el.text.strip().split(',')
                    Spot.objects.create(
                        map=default_map,
                        name=name_el.text,
                        lat=float(lat),
                        lng=float(lon),
                        memo="(KMLから追加)"
                    )
                except Exception as e:
                    print("KML解析エラー:", e)

        print('アップロード完了/mapにリダイレクトしました')
        return redirect(reverse("map:default_map"))
    print('getアクセスきたため/mapにリダイレクト')
    return redirect(reverse("map:default_map"))


