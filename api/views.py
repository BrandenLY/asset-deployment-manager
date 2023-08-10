from django.shortcuts import render
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import UserSerializer
from main.models import User

# Create your views here.
class UserView(viewsets.ViewSet):
    """
    Simple Viewset for viewing User Information
    """

    queryset = User.objects.all()

    def list(self, request):
        serializer = UserSerializer(self.queryset, many=True)
        return Response(serializer.data)