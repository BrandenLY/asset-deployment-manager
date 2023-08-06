from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Event
from .models import User
from tasklist.models import Project

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
                    ("insignia_requirement", "checkin_requirement", "portal_requirement", "sentinel_requirement")
                ]
            }
        ),
        (
            'Stakeholders',
            {
                "fields": [
                    ("account_manager", "project_manager"),
                    ("solutions_specialist", "lead_retrieval_specialist")
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
            }
        ),
    ]

admin.site.register(Event, EventAdmin)
admin.site.register(User, UserAdmin)