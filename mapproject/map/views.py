from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.

def index(request):
    """
    地図表示画面
    """

    template = loader.get_template('map/index.html')
    return HttpResponse(template.render(None, request))