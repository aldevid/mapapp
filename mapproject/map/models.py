from django.db import models

class CustomMap(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
