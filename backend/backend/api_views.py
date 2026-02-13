from django.shortcuts import render
from django.http import JsonResponse
from .models import *
from serializers import *
from rest_framework.decorators import api_view