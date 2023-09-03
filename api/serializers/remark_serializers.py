from rest_framework.serializers import ModelSerializer
from tasklist.models import Task
from tasklist.models import Milestone

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
        