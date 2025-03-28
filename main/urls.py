"""
URL configuration for Sleipnir project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, re_path
from .views import HomePageView, LoginView, LogoutView

urlpatterns = [
    path('login/', LoginView, name="login"),
    path('logout/', LogoutView, name="logout"),
    path('',  HomePageView.as_view(), name="home"),
    re_path(r'^.*/$', HomePageView.as_view())
] 
