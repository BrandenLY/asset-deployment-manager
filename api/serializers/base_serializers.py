from rest_framework import serializers
from django.contrib.admin.models import LogEntry
from django.contrib.contenttypes.models import ContentType

class CustomBaseSerializer(serializers.ModelSerializer):

    label = serializers.SerializerMethodField()

    def get_label(self, obj):
        return str(obj)
    
class ContentTypeSerializer(CustomBaseSerializer):

    class Meta:
        model=ContentType
        fields=[
            "label",
            "id",
            "app_label",
            "model"
        ]

class LogEntrySerializer(CustomBaseSerializer):
    class Meta:
        model=LogEntry
        fields=[
            "id",
            "label",
            "object_id",
            "object_repr",
            "action_flag",
            "change_message",
            "content_type_id",
            "user_id",
            "action_time"
        ]