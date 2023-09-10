from rest_framework import viewsets
from rest_framework import status
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.settings import api_settings
from .serializers import UserSerializer
from .serializers import EventSerializer
from .serializers import MilestoneSerializer
from .serializers import ServiceSerializer
from main.models import User
from main.models import Event
from tasklist.models import Milestone
from tasklist.models import Service
from tasklist.models import Task

# Create your views here.
class UserView(viewsets.ViewSetMixin, generics.GenericAPIView):
    """
    Simple Viewset for Viewing User & Project Information
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

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
            _event = self.get_queryset().get(id=pk)
            serializer = EventSerializer(_event)
        
        except Event.DoesNotExist as e:
            return Response({"error" : f"Event with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)
        
class EventView(viewsets.ViewSetMixin, generics.GenericAPIView):
    """
    Simple Viewset for Viewing Event & Project Information
    """

    queryset = Event.objects.all()
    serializer_class = EventSerializer

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
            _event = self.get_queryset().get(id=pk)
            serializer = EventSerializer(_event)
        
        except Event.DoesNotExist as e:
            return Response({"error" : f"Event with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

class MilestoneView(viewsets.ViewSetMixin, generics.GenericAPIView):
    """
    Simple Viewset for Viewing Milestone & Project Information
    """

    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer

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
            _Milestone = self.get_queryset().get(id=pk)
            serializer = MilestoneSerializer(_Milestone)
        
        except Milestone.DoesNotExist as e:
            return Response({"error" : f"Milestone with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

class ServiceView(viewsets.ViewSetMixin, generics.GenericAPIView):
    """
    Simple Viewset for Viewing Service & Project Information
    """

    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

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
            return Response({"error" : f"Service with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)