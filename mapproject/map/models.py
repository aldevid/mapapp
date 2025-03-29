from django.db import models

class CustomMap(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Spot(models.Model):
    map = models.ForeignKey(CustomMap, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    memo = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.lat}, {self.lng})"