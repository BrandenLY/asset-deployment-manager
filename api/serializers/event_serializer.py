from rest_framework import serializers
from main.models import Event
from tasklist.models import Project
from .service_serializer import ServiceSerializer
from .remark_serializers import MilestoneSerializer

class ProjectSerializer(serializers.ModelSerializer):

    services = ServiceSerializer(many=True)
    milestones = MilestoneSerializer(many=True)
    class Meta:
        model = Project
        fields = [
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

class EventSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()
    class Meta:
        model = Event
        fields = [
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