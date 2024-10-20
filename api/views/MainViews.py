from rest_framework import status
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import mixins
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils.encoding import force_str
from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntryManager, LogEntry
from django.contrib.contenttypes.models import ContentType
from .BaseView import BaseView
from main.models import User
from main.models import Event
from ..serializers import UserSerializer
from ..serializers import EventSerializer
from ..serializers import LogEntrySerializer
from ..serializers import ContentTypeSerializer
from .BaseView import SERIALIZER_FIELD_LABEL_LOOKUP
#    __  __       _         _       _             __                     
#   |  \/  | __ _(_)_ __   (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#   | |\/| |/ _` | | '_ \  | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#   | |  | | (_| | | | | | | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#   |_|  |_|\__,_|_|_| |_| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                        
class ContentTypeView(viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    ):
    """
    Simple Viewset for Viewing ContentType Information
    """
    model = ContentType
    queryset = model.objects.all()
    serializer_class = ContentTypeSerializer

    def __init__(self, *args, **kwargs):
        
        self.AdminLog = LogEntryManager()

        super().__init__(*args, **kwargs)

    serializer_field_label_lookup = SERIALIZER_FIELD_LABEL_LOOKUP

    def retrieve(self, request, pk=None):
        try:
            _model_instance = self.get_queryset().get(id=pk)
            serializer = self.get_serializer_class()(_model_instance)
        
        except self.model.DoesNotExist as e:
            return Response({"error" : f"{self.model.__name__} with id:{pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        else:
            return Response(serializer.data, status=status.HTTP_200_OK)

    def options(self, request, *args, **kwargs):
        """
        Don't include the view description in OPTIONS responses.
        """
        data = self.metadata_class().determine_metadata(request, self)
        data['model'] = self.model.__name__.lower()
        data['contenttype_id'] = ContentType.objects.get(model=data['model']).id
        data['actions'] = None

        _fields = self.model._meta.get_fields()
        # If user has appropriate permissions for the view, include
        # appropriate metadata about the fields that should be supplied.
        serializer = self.get_serializer()
        if hasattr(serializer, 'child'):
            # If this is a `ListSerializer` then we want to examine the
            # underlying child serializer instance instead.
            serializer = serializer.child

        data['model_fields'] = { 
            field_name: self.get_field_info(field)
            for field_name, field in serializer.fields.items()
            if not isinstance(field, serializers.HiddenField)
        }

        for field in _fields:
            if field.related_model and field.name in data['model_fields']:
                data['model_fields'][field.name] = {**data['model_fields'][field.name], 'related_model_name': field.related_model.__name__.lower() }

        return Response(data=data, status=status.HTTP_200_OK)
    
    def get_field_info(self, field):
        """
        Given an instance of a serializer field, return a dictionary
        of metadata about it.
        """
        field_info = {
            "type": self.serializer_field_label_lookup[field],
            "required": getattr(field, "required", False),
        }

        attrs = [
            'read_only', 'label', 'help_text',
            'min_length', 'max_length',
            'min_value', 'max_value',
            'max_digits', 'decimal_places',
        ]

        for attr in attrs:
            value = getattr(field, attr, None)
            if value is not None and value != '':
                field_info[attr] = force_str(value, strings_only=True)

        if getattr(field, 'child', None):
            field_info['child'] = self.get_field_info(field.child)

        ## FIXME: I Removed this because it wasn't working and I didn't know what it did. Was causing issues with option requests to /api/assets.
        # elif getattr(field, 'fields', None):
        #     print(field)
        #     print(getattr(field, 'fields', None))
        #     field_info['children'] = self.get_serializer_info(field)

        if (not field_info.get('read_only') and
            not isinstance(field, (serializers.RelatedField, serializers.ManyRelatedField)) and
                hasattr(field, 'choices')):
            field_info['choices'] = [
                {
                    'value': choice_value,
                    'display_name': force_str(choice_name, strings_only=True)
                }
                for choice_value, choice_name in field.choices.items()
            ]

        return field_info

class UserView(BaseView):
    """
    Simple Viewset for Viewing User Information
    """
    model = User
    queryset = model.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=["get"], url_name='current-user', url_path='current-user')
    def get_current_user(self, request):
        user = self.get_queryset().filter(id=request.user.id)
        try:
            _model_instance = self.get_queryset().get(id=request.user.id)
            serializer = self.get_serializer_class()(_model_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except self.model.DoesNotExist as e:
            return Response({"error" : f"{self.model.__name__} with id:{id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
class EventView(BaseView):
    """
    Simple Viewset for Viewing Event & Project Information
    """
    model = Event
    queryset = model.objects.all()
    serializer_class = EventSerializer

## FIXME: Setup as a custom action under the user view.
class CurrentUserView(generics.GenericAPIView, mixins.RetrieveModelMixin):

    serializer_class = UserSerializer
    lookup_field = 'id'

    def get_queryset(self):
        """
        This view should return the currently authenticated user.
        """
        user = self.request.user
        return User.objects.filter(id = self.request.user.id)
    
    def get(self, request, id=None):
        """
        This view should return the currently authenticated user.
        """
        try:
            _model_instance = self.get_queryset().get(id=request.user.id)
            serializer = self.get_serializer_class()(_model_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except self.model.DoesNotExist as e:
            return Response({"error" : f"{self.model.__name__} with id:{id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

class LogEntryView(BaseView):
    """
    Simple Viewset for Viewing Log Entries
    """
    model = LogEntry
    queryset = model.objects.all()
    serializer_class = LogEntrySerializer
    permission_classes = [IsAdminUser]

class ObjectAdminLogEntries(APIView):
    """
    Simple View for retrieving admin logs for a specific object.
    """
    permission_classes = [IsAuthenticated]
    def get(self, request, object_contenttype_id, object_id):
        
        queryset = LogEntry.objects.filter(object_id=object_id, content_type_id=object_contenttype_id)
        payload =  LogEntrySerializer(queryset, many=True)

        return Response(payload.data)
