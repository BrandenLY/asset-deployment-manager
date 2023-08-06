from django.contrib import admin

# Register your models here.
from .models import Task
from .models import Service
from .models import Milestone

class TaskAdmin(admin.ModelAdmin):

    list_display = ["title", "status", "due_date", "priority"]
    ordering = ["priority", "-due_date"]
    fields = [("title","description"), ('status', 'due_date', 'priority'), 'parent_milestone']
    
admin.site.register(Task, TaskAdmin)
admin.site.register(Milestone)
admin.site.register(Service)