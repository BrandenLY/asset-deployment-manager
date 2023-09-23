from rest_framework import viewsets
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.settings import api_settings
# App Related Imports : Assets
from assets.models import Asset
from assets.models import AssetModel
from assets.models import Location
from .serializers import AssetSerializer
from .serializers import AssetModelSerializer
from .serializers import LocationSerializer
# App Related Imports : Main
from main.models import User
from main.models import Event
from .serializers import UserSerializer
from .serializers import EventSerializer
# App Related Imports : Tasklist
from tasklist.models import Milestone
from tasklist.models import Service
from tasklist.models import Task
from .serializers import MilestoneSerializer
from .serializers import ServiceSerializer

# Standard Functionality for all views to share
class BaseView(viewsets.ViewSetMixin, generics.GenericAPIView):
    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def get_success_headers(self, data):
        try:
            return {'Location': str(data[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            return {}
        
    def retrieve(self, request, pk=None):
        try:
            _Service = self.get_queryset().get(id=pk)
            serializer = ServiceSerializer(_Service)
        
        except Service.DoesNotExist as e:
            return Response({"error" : f"{self.model.__name__} with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

#       _                 _         _       _             __                     
#      / \   ___ ___  ___| |_ ___  (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#     / _ \ / __/ __|/ _ \ __/ __| | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#    / ___ \\__ \__ \  __/ |_\__ \ | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#   /_/   \_\___/___/\___|\__|___/ |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                                

class AssetView(BaseView):
    """
    Simple Viewset for Viewing Asset Information
    """
    model = Asset
    queryset = model.objects.all()
    serializer_class = AssetSerializer

class AssetModelView(BaseView):
    """
    Simple Viewset for Viewing Asset Model Information
    """
    model = AssetModel
    queryset = model.objects.all()
    serializer_class = AssetModelSerializer

class LocationView(BaseView):
    """
    Simple Viewset for Viewing Location Information
    """
    model = Location
    queryset = model.objects.all()
    serializer_class = LocationSerializer

#    _____         _    _ _     _     _       _             __                     
#   |_   _|_ _ ___| | _| (_)___| |_  (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#     | |/ _` / __| |/ / | / __| __| | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#     | | (_| \__ \   <| | \__ \ |_  | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#     |_|\__,_|___/_|\_\_|_|___/\__| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                                  

class MilestoneView(BaseView):
    """
    Simple Viewset for Viewing Milestone Information
    """
    model = Milestone
    queryset = model.objects.all()
    serializer_class = MilestoneSerializer


class ServiceView(BaseView):
    """
    Simple Viewset for Viewing Service Information
    """
    model = Service
    queryset = model.objects.all()
    serializer_class = ServiceSerializer

#    __  __       _         _       _             __                     
#   |  \/  | __ _(_)_ __   (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#   | |\/| |/ _` | | '_ \  | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#   | |  | | (_| | | | | | | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#   |_|  |_|\__,_|_|_| |_| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                        

class UserView(BaseView):
    """
    Simple Viewset for Viewing User Information
    """
    model = User
    queryset = model.objects.all()
    serializer_class = UserSerializer

        
class EventView(BaseView):
    """
    Simple Viewset for Viewing Event & Project Information
    """
    model = Event
    queryset = model.objects.all()
    serializer_class = EventSerializer
        
#   __        ___ _    _   _       _             __                     
#   \ \      / (_) | _(_) (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#    \ \ /\ / /| | |/ / | | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#     \ V  V / | |   <| | | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#      \_/\_/  |_|_|\_\_| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                       
