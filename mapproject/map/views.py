from django.shortcuts import render

def index(request):
    return render(request, 'map/index.html')

def map_view(request, map_id):
    context = {'map_id': map_id}
    return render(request, 'map/map.html', context)  # ← これから作るテンプレート
