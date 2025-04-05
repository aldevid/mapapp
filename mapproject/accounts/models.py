from django.contrib.auth.models import User
from django.db import models
from cloudinary.models import CloudinaryField

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = CloudinaryField('image', blank=True, null=True)

    def __str__(self):
        return self.user.username
