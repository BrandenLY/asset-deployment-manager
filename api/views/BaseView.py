from django.db import transaction
from django.db.models import ProtectedError
from django.utils.encoding import force_str
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth.models import Permission
from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntryManager, LogEntry
from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import generics
from rest_framework import mixins
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.utils.field_mapping import ClassLookupDict
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from ..serializers import ContentAssetsField
from ..exceptions import InvalidData

SERIALIZER_FIELD_LABEL_LOOKUP = ClassLookupDict({
        serializers.Field: 'field',
        serializers.BooleanField: 'boolean',
        serializers.CharField: 'string',
        serializers.UUIDField: 'string',
        serializers.URLField: 'url',
        serializers.EmailField: 'email',
        serializers.RegexField: 'regex',
        serializers.SlugField: 'slug',
        serializers.IntegerField: 'integer',
        serializers.FloatField: 'float',
        serializers.DecimalField: 'decimal',
        serializers.DateField: 'date',
        serializers.DateTimeField: 'datetime',
        serializers.TimeField: 'time',
        serializers.DurationField: 'duration',
        serializers.ChoiceField: 'choice',
        serializers.MultipleChoiceField: 'multiple choice',
        serializers.FileField: 'file upload',
        serializers.ImageField: 'image upload',
        serializers.ListField: 'list',
        serializers.DictField: 'related object',
        serializers.Serializer: 'related object',
        serializers.PrimaryKeyRelatedField: 'related object',
        serializers.RelatedField: 'related object',
        serializers.SerializerMethodField: 'computed value',
        ContentAssetsField: 'computed value',
    })

# Standard Functionality for all views to share
class BaseView(viewsets.GenericViewSet, 
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
    ):
    
    def __init__(self, *args, **kwargs):
        
        self.AdminLog = LogEntryManager()

        super().__init__(*args, **kwargs)

    serializer_field_label_lookup = SERIALIZER_FIELD_LABEL_LOOKUP
    
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer, request)
    
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer, request):

        with transaction.atomic():

            serializerClass = self.get_serializer_class()()
            serializerFields = serializerClass.get_fields()

            if 'created_by' in serializerFields and 'modified_by' in serializerFields:
                instance = serializer.save(created_by=request.user, modified_by=None)
            else:
                instance = serializer.save()

            instance_content_type = ContentType.objects.get(model=instance.__class__.__name__.lower())

            # FIXME: Deprecated, use LogEntryManager.log_actions()
            LogEntry.objects.log_action(
                request.user.id,
                instance_content_type.id,
                instance.id,
                repr(instance),
                ADDITION, 
                change_message=[{"added": {}}]
            )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer, request)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
      
    def perform_update(self, serializer, request):
        
        change_map = {} 

        for field in serializer.instance.__class__._meta.get_fields():
            change_map[field.name] = (getattr(serializer.instance, field.name, None), )

        instance_content_type = ContentType.objects.get(model=serializer.instance.__class__.__name__.lower())

        for field in serializer.instance.__class__._meta.get_fields():
            change_map[field.name] = (change_map[field.name][0], getattr(serializer.instance, field.name, None))
        
        changed_fields = [field for field, changes in change_map.items() if changes[0] != changes[1] and field != 'last_modified' and field != 'modified_by']
            
        with transaction.atomic():
            serializer.save()
            
            # FIXME: Deprecated, use LogEntryManager.log_actions()
            LogEntry.objects.log_action(
                request.user.id,
                instance_content_type.id,
                serializer.instance.id,
                repr(serializer.instance),
                CHANGE, 
                change_message=[{"changed": {"fields" : changed_fields}}]
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance, request)

        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance, request):

        with transaction.atomic():
            
            instance_content_type = ContentType.objects.get(model=instance.__class__.__name__.lower())
            
            try:
                payload = instance.delete()

                LogEntry.objects.log_action(
                    request.user.id,
                    instance_content_type.id,
                    instance.id,
                    repr(instance),
                    DELETION,
                )
                
            except ProtectedError as e:
                raise InvalidData(e)

            

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

    @action(detail=False, methods=['post'])
    def validate(self, request):

        data = request.data
        
        # Verify single object
        if (type(data) is dict):
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)

            return Response(status=status.HTTP_200_OK)

        # Verify multiple objects
        if (type(data) is list):

            for obj in data:
                serializer = self.get_serializer(data=obj)
                if not serializer.is_valid():
                    # Increment by 1 because spreadsheet rows use 1-based indexes.
                    # Increment by 1 because the first row (header row) is not expected.
                    row_number = data.index(obj) + 1 + 1 

                    issues = {'row': row_number, 'errors': serializer.errors}

                    return Response(issues, status=status.HTTP_400_BAD_REQUEST)

            return Response(status=status.HTTP_200_OK)
        
        raise InvalidData(f'Request body must contain JSON array or Object. Instead body contained {type(data)}')
