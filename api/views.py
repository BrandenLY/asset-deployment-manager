from django.shortcuts import render
from rest_framework import generics
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from .serializers import EventSerializer
from main.models import User
from main.models import Event

# Create your views here.
class UserView(viewsets.ViewSet):
    """
    Simple Viewset for Viewing User Information
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        serializer = UserSerializer(self.queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass

class EventView(viewsets.ViewSet):
    """
    Simple Viewset for Viewing Event & Project Information
    """

    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def list(self, request):
        serializer = EventSerializer(self.queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass

@api_view(('GET',))
def ModelCounts(request):
    """
    Simple View for Viewing Database Row Counts
    """
    return Response(
        {
            'events': Event.objects.all().count(),
            'users' : User.objects.all().count()
        },
        status=status.HTTP_201_CREATED
    )