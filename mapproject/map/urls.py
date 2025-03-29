from django.urls import path
from . import views

app_name = 'map'
urlpatterns = [
    path('', views.index, name='index'),
    # <map_id>対応ルーティングを追加
    path('create/', views.create_map, name='create_map'),
    path('<str:map_id>/', views.map_view, name='map_view'),
]