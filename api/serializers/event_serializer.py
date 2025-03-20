from rest_framework import serializers
from main.models import Event
from .base_serializers import CustomBaseSerializer


class EventSerializer(CustomBaseSerializer):
    class Meta:
        model = Event
        fields = [
            "label",
            "id",
            "name",
            "date_created",
            "last_modified",
            "start_date",
            "end_date",
            "travel_in_date",
            "travel_out_date",
            "timetracking_url",
            "external_project_url",
            "sharepoint_url",
        ]
        read_only_fields=["date_created", "last_modified"]

    def create(self, validated_data):
        new_event = Event(**validated_data)
        return new_event