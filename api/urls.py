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
from django.urls import include
from rest_framework.routers import DefaultRouter

from .views import UserView
from .views import EventView
# from .views import MilestoneView
# from .views import ServiceView
from .views import AssetView
from .views import AssetModelView
from .views import LocationView
from .views import ShipmentView
from .views import CurrentUserView
from .views import ScanView

router = DefaultRouter()
router.register(r"user", UserView)
router.register(r"event", EventView)
# router.register(r"milestone", MilestoneView)
# router.register(r"service", ServiceView)
router.register(r"asset", AssetView)
router.register(r"model", AssetModelView)
router.register(r"location", LocationView)
router.register(r"shipment", ShipmentView)

urlpatterns = [
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    path('scan/', ScanView.as_view(), name='scan-api'),
] + router.urls