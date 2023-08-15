from typing import Any, Dict
import random
import json
from django.db import transaction
from django.forms import modelformset_factory
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView
from django.views.generic.detail import DetailView

from .models import Event
from .forms import CreateEventForm, LoginForm
from tasklist.models import Service
from tasklist.models import Project
from tasklist.models import Task
from tasklist.forms import CreateProjectForm

user_model = get_user_model()


class HomePageView(LoginRequiredMixin, TemplateView):
    login_url = "/login/"
    template_name = "home.html"

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        ctx = super().get_context_data(**kwargs)

        ctx["forms"] = {
            "addEvent": CreateEventForm(),
            "addProject": CreateProjectForm(),
            "addTask": None,
        }
        ctx["objects"] = {
            "events": Event.objects.all(),
            "upcomingTasks": Task.objects.filter(status__lt=5),
        }
        ctx["theme"] = "dark"

        ctx["counts"] = json.dumps(
            {
                "Events": Event.objects.all().count(),
                "Event Configs": Project.objects.all().count(),
                "Tasks": Task.objects.all().count(),
            }
        )
        if kwargs["request"].user.is_authenticated:
            q1 = Project.objects.filter(account_manager=kwargs["request"].user)
            q2 = q1.union(
                Project.objects.filter(project_manager=kwargs["request"].user)
            )
            q3 = q2.union(
                Project.objects.filter(solutions_specialist=kwargs["request"].user)
            )
            q4 = q3.union(
                Project.objects.filter(lead_retrieval_specialist=kwargs["request"].user)
            )

            ctx["userData"] = json.dumps(
                {
                    "taskCount": Task.objects.filter(status__lt=5)
                    .filter(responsible_to=kwargs["request"].user)
                    .count(),
                    "eventCount": q4.count(),
                }
            )
        return ctx

    def get(self, request, **kwargs):
        ctx = self.get_context_data(request=request)
        return render(request, self.template_name, context=ctx)


def LoginView(request):
    if request.POST:
        login_form = LoginForm(request.POST)

        if login_form.is_valid():
            user = authenticate(
                request,
                username=login_form.cleaned_data["username"],
                password=login_form.cleaned_data["password"],
            )
            
            if user is not None:
                login(request, user)
                return redirect("home")

        # Return an 'invalid login' error message.
        return render(
            request,
            "login.html",
            {"msg": "Unable to login with these credentials.", "form": login_form},
        )
    
    else:
        login_form = LoginForm()
        return render(request, "login.html", {"form" : login_form})

def LogoutView(request):

    logout(request)
    login_form = LoginForm()
    return redirect("login")