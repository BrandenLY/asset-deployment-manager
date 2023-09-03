from rest_framework import serializers
from tasklist.models import Service

class ServiceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "icon",
        ]