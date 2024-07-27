from rest_framework import serializers
from main.models import Event
from tasklist.models import Project
from .base_serializers import CustomBaseSerializer


class ProjectSerializer(CustomBaseSerializer):

    class Meta:
        model = Project
        fields = [
            "label",
            "printer_type",
            "production_redwood_id",
            "production_show_code",
            "test_redwood_id",
            "test_show_code",
            "account_manager",
            "lead_retrieval_specialist",
            "project_manager",
            "solutions_specialist",
            "milestones",
            "services"
        ]

class EventSerializer(CustomBaseSerializer):
    project = ProjectSerializer(read_only=True)
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
            "project"
        ]
        read_only_fields=["date_created", "last_modified"]

    def create(self, validated_data):
        new_event = Event(**validated_data)
        return new_event