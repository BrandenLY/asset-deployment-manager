from typing import Any, Dict
import random
import json
from django.db import transaction
from django.forms import modelformset_factory
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView

from .models import Event
from .forms import CreateEventForm
from tasklist.models import Service
from tasklist.models import Project
from tasklist.models import Task
from tasklist.forms import CreateProjectForm

user_model = get_user_model()

class HomePageView(TemplateView):
    template_name = "home.html"

    def get_workload_chart(self):
        data = {
            "labels"  : [],
            "datasets": [{
                'backgroundColor':[],
                'data':[]
            }]
        }

        usrs = user_model.objects.all()
        for u in usrs:
            data['datasets'][0]['backgroundColor'].append(f"rgb({random.randrange(1, 255)},{random.randrange(1, 255)},{random.randrange(1, 255)})")
            data['datasets'][0]['data'].append(u.assigned_tasks.filter(status__lt=5).count())
            data['labels'].append(u.first_name)
        return json.dumps(data)

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        ctx = super().get_context_data(**kwargs)

        ctx['forms'] = {
            'addEvent' : CreateEventForm(),
            'addProject' : CreateProjectForm(),
            'addTask' : None,
        }
        ctx['objects'] = {
            'events' : Event.objects.all(),
            'upcomingTasks' : Task.objects.filter(status__lt = 5)
        }
        ctx['theme'] = 'dark'
        ctx['workloadData'] = self.get_workload_chart()

        ctx['counts'] = json.dumps({
            'Events' : Event.objects.all().count(),
            'Event Configs' : Project.objects.all().count(),
            'Tasks' : Task.objects.all().count()
        })
        if kwargs['request'].user.is_authenticated:

            q1 = Project.objects.filter(account_manager = kwargs['request'].user)
            q2 = q1.union(Project.objects.filter(project_manager = kwargs['request'].user))
            q3 = q2.union(Project.objects.filter(solutions_specialist = kwargs['request'].user))
            q4 = q3.union(Project.objects.filter(lead_retrieval_specialist = kwargs['request'].user))

            ctx['userData'] = json.dumps({
                'taskCount' : Task.objects.filter(status__lt = 5).filter(responsible_to=kwargs['request'].user).count(),
                'eventCount': q4.count()
            })
        return ctx
    
    def get(self, request, **kwargs):
        ctx = self.get_context_data(request=request)
        return render(request, self.template_name, context=ctx)
    
    def post(self, request, **kwargs):

        ctx = self.get_context_data(request=request)

        if 'addEventForm' in request.POST:

            _project_form_data = CreateProjectForm(request.POST)

            with transaction.atomic():
                ## Save the Event
                _event_form_data = CreateEventForm(request.POST)
                if _event_form_data.is_valid():
                    _e = _event_form_data.save()
                else:
                    ctx['forms']['addEvent'] = _event_form_data

                ## Save the Project
                if _project_form_data.is_valid():
                    _project_form_data = _project_form_data.save(commit=False)
                    _project_form_data.parent_event = _e
                    _p = _project_form_data.save()
                else:
                    ctx['forms']['addProject'] = _project_form_data


        return render(request, self.template_name, context=ctx)
    
class EventDetailView(DetailView):
    model = Event
    template_name = "tasklist/event_detail.html"
    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['objects'] = None
        print(kwargs)
        return ctx