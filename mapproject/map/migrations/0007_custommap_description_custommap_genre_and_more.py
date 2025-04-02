# Generated by Django 5.1.7 on 2025-04-01 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map', '0006_merge_0004_spot_icon_0005_alter_custommap_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='custommap',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='custommap',
            name='genre',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='custommap',
            name='is_public',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='custommap',
            name='is_recommended',
            field=models.BooleanField(default=False),
        ),
    ]
