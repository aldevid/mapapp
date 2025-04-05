from django.urls import path
from . import views

app_name = 'map'

urlpatterns = [
    
    path('', views.default_map_view, name='default_map'),
    path('default/spots/', views.get_default_spots, name='get_default_spots'),
    path('default/spots/add/', views.add_spot_default, name='add_spot_default'),
    path('default/spots/<int:spot_id>/update/', views.update_spot_default, name='update_spot_default'),
    path('default/spots/<int:spot_id>/delete/', views.delete_spot_default, name='delete_spot_default'),

    path('create/', views.create_map, name='create_map'),
    path('create/ajax/', views.create_map_ajax, name='create_map_ajax'),

    path("upload-kml/", views.kml_upload_view, name="upload_kml"),

    path('<str:map_id>/', views.map_view, name='map_view'),
    path('<str:map_id>/spots/', views.get_spots, name='get_spots'),
    path('<str:map_id>/spots/add/', views.add_spot, name='add_spot'),
    path('<str:map_id>/spots/<int:spot_id>/update/', views.update_spot, name='update_spot'),
    path('<str:map_id>/spots/<int:spot_id>/delete/', views.delete_spot, name='delete_spot'),

    path('<str:map_id>/update_settings/', views.update_map_settings, name='update_map_settings'),
    path('recommendations/', views.recommended_maps_view, name='recommended_maps'),
    path('recommendations/json/', views.recommended_maps_json, name='recommended_maps_json'),

    # urls.py
    path("<str:map_id>/like/", views.toggle_like_map, name="like_map"),
    path("<str:map_id>/favorite/", views.toggle_favorite_map, name="favorite_map"),
    path("mapinfo/", views.get_liked_favorite_info, name="mapinfo"),

]
