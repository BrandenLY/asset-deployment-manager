from typing import Any, Dict
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

from .forms import LoginForm
user_model = get_user_model()

class HomePageView(LoginRequiredMixin, TemplateView):
    login_url = "/login/"
    template_name = "home.html"

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