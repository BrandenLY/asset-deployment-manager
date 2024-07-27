from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType

class CustomBaseSerializer(serializers.ModelSerializer):

    label = serializers.SerializerMethodField()

    def get_label(self, obj):
        return str(obj)
    
class ContentTypeSerialzer(CustomBaseSerializer):

    class Meta:
        model=ContentType
        fields=[
            "label",
            "id",
            "app_label",
            "model"
        ]