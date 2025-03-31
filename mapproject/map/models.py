from django.db import models
from django.contrib.auth.models import User  # 追加

class CustomMap(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ←★追加！
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Spot(models.Model):
    GENERE_CHOICES = [
        ('food', 'グルメ'),
        ('cafe', 'カフェ'),
        ('sightseeing', '観光'),
        ('shopping', 'ショッピング'),
        ('hotel', '宿泊'),
        ('other', 'その他'),
    ]
    
    map = models.ForeignKey(CustomMap, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    memo = models.TextField(blank=True)
    genre = models.CharField(max_length=100, blank=True)
    url = models.URLField(blank=True)
    hours = models.CharField(max_length=100, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.lat}, {self.lng})"