from rest_framework.serializers import ModelSerializer
from main.models import Event
from tasklist.models import Project
from tasklist.models import Milestone
from tasklist.models import Task

class TaskSerializer(ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "is_system_task",
            "date_created",
            "description",
            "title",
            "status",
            "due_date",
            "priority",
            "sort_order",
            "created_by",
            "related_service",
            "responsible_to",
            "parent_milestone"
        ]

class MilestoneSerializer(ModelSerializer):
    tasks = TaskSerializer(many=True)
    class Meta:
        model = Milestone
        fields = [
            "id",
            "date_created",
            "description",
            "title",
            "status",
            "due_date",
            "priority",
            "sort_order",
            "created_by",
            "related_service",
            "responsible_to",
            "is_template",
            "parent_project",
            "tasks"
        ]

class ProjectSerializer(ModelSerializer):
    milestones = MilestoneSerializer(many=True)
    class Meta:
        model = Project
        fields = [
            "parent_event_id",
            "printer_type",
            "production_redwood_id",
            "production_show_code",
            "test_redwood_id",
            "test_show_code",
            "account_manager",
            "lead_retrieval_specialist",
            "project_manager",
            "solutions_specialist",
            "milestones"
        ]

class EventSerializer(ModelSerializer):
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