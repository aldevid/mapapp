from django.urls import path
from . import views

app_name = 'map'
urlpatterns = [
    path('', views.index, name='index'),
    # <map_id>対応ルーティングを追加
    path('create/', views.create_map, name='create_map'),
    path('create/ajax/', views.create_map_ajax, name='create_map_ajax'),
    path('<str:map_id>/', views.map_view, name='map_view'),
    path('<str:map_id>/spots/', views.get_spots, name='get_spots'),
    path('<str:map_id>/spots/add/', views.add_spot, name='add_spot'),
    path('<str:map_id>/spots/<int:spot_id>/delete/', views.delete_spot, name='delete_spot'),
    path('<str:map_id>/spots/<int:spot_id>/update/', views.update_spot, name='update_spot'),

]