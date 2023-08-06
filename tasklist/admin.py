from django.contrib import admin

# Register your models here.
from .models import Task

class TaskAdmin(admin.ModelAdmin):

    list_display = ["title", "status", "due_date", "priority"]
    ordering = ["priority", "-due_date"]
    fields = [("title","description"), ('status', 'due_date', 'priority'), 'related_product', 'parent_project', 'responsible_to']
    
admin.site.register(Task, TaskAdmin)