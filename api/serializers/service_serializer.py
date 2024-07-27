from rest_framework import serializers
from tasklist.models import Service
from .base_serializers import CustomBaseSerializer

class ServiceSerializer(CustomBaseSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "label",
            "name",
            "icon",
        ]