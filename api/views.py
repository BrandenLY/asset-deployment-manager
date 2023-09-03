from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .serializers import UserSerializer
from .serializers import EventSerializer
from main.models import User
from main.models import Event

class SmallPageLimitOffsetPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 10000
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
        try:
            _user = self.queryset.get(id=pk)
            serializer = UserSerializer(_user)
        
        except User.DoesNotExist as e:
            return Response({"error" : f"User with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

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
    pagination_class = SmallPageLimitOffsetPagination

    def list(self, request):
        serializer = EventSerializer(self.queryset, many=True, context={'request':request})
        
        return Response(serializer.data)
    
    def create(self, request):
        serializer = EventSerializer(data=request.data, context={'request':request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def retrieve(self, request, pk=None):
        try:
            _event = self.queryset.get(id=pk)
            serializer = EventSerializer(_event)
        
        except Event.DoesNotExist as e:
            return Response({"error" : f"Event with ID '{pk}' does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

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