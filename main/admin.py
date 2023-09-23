from django.contrib import admin
from .models import Event
from .models import User
from tasklist.models import Project
from tasklist.models import Service

# Register your models here.
class ProjectInline(admin.StackedInline):
    model = Project
    fieldsets = [
        (
            'Service Information',
            {
                "fields": [
                    "printer_type",
                    ("production_redwood_id", "production_show_code"),
                    ("test_redwood_id", "test_show_code"),
                    "services"
                ]
            }
        ),
        (
            'Team',
            {
                "fields": [
                    ("account_manager", "project_manager"),
                    ("solutions_specialist", "lead_retrieval_specialist"),
                ]
            }
        )
    ]

class EventAdmin(admin.ModelAdmin):

    date_hierarchy = 'travel_in_date'
    empty_value_display = "-None-"

    list_display = (
        "id", "name", "start_date", "end_date",
    )
    inlines = [ ProjectInline, ]
    fieldsets = [
        (
            'Event Information',
            {
                "fields": [
                    "name", 
                    ("start_date", "end_date"),
                    ("travel_in_date", "travel_out_date")
                ]
            },
        ),
        (
            'Links',
            {
                "fields": [
                    "timetracking_url", 
                    "external_project_url", 
                    "sharepoint_url" 
                ]
            },
        )
    ]

class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id", "email", "first_name", "last_name",
    )
    fields = ["email", "first_name", "last_name", "groups", "user_permissions", "is_active", "is_staff", "is_superuser", "date_joined", "last_login"]
    readonly_fields = ["date_joined", "last_login"]

admin.site.register(Event, EventAdmin)
admin.site.register(User, UserAdmin)