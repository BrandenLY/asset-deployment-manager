from django.contrib import admin
from .models import Event
from .models import User

class EventAdmin(admin.ModelAdmin):

    date_hierarchy = 'travel_in_date'
    empty_value_display = "-None-"

    list_display = (
        "id", "name", "start_date", "end_date",
    )
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