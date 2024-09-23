from django.db import transaction
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
# App Related Imports : Assets
from assets.models import Asset
from assets.models import AssetModel
from assets.models import Location
from assets.models import Shipment
from .serializers import AssetSerializer
from .serializers import AssetModelSerializer
from .serializers import LocationSerializer
from .serializers import ShipmentSerializer
from .serializers import ContentAssetsField
from .serializers import LogEntrySerializer
# App Related Imports : Main
from main.models import User
from main.models import Event
from .serializers import UserSerializer
from .serializers import EventSerializer
# App Related Imports : Tasklist
# from tasklist.models import Milestone
# from tasklist.models import Service
# from tasklist.models import Task
# from .serializers import MilestoneSerializer
# from .serializers import ServiceSerializer
# Custom Permissions
from .permissions import ScanToolPermission
from .exceptions import InvalidData

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

    serializer_field_label_lookup = ClassLookupDict({
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
    
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer, request)
    
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer, request):

        with transaction.atomic():

            instance = serializer.save(created_by=request.user, modified_by=None)
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
        
        with transaction.atomic():
            
            change_map = {} 

            for field in serializer.instance.__class__._meta.get_fields():
                change_map[field.name] = (getattr(serializer.instance, field.name, None), )

            instance = serializer.save(modified_by=request.user)
            instance_content_type = ContentType.objects.get(model=instance.__class__.__name__.lower())

            for field in instance.__class__._meta.get_fields():
                change_map[field.name] = (change_map[field.name][0], getattr(instance, field.name, None))
            
            changed_fields = [field for field, changes in change_map.items() if changes[0] != changes[1] and field is not 'last_modified' and field is not 'modified_by']

            # FIXME: Deprecated, use LogEntryManager.log_actions()
            LogEntry.objects.log_action(
                request.user.id,
                instance_content_type.id,
                instance.id,
                repr(instance),
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
            
            # FIXME: Deprecated, use LogEntryManager.log_actions()
            LogEntry.objects.log_action(
                request.user.id,
                instance_content_type.id,
                instance.id,
                repr(instance),
                DELETION,
            )
            
            instance.delete()

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

        # try:
        #     object_contenttype = ContentType.objects.get(id=object_contenttype_id)
        #     object = object_contenttype.get_object_for_this_type(id=object_id)
        # except ContentType.DoesNotExist:
        #     raise InvalidData(f"'{object_contenttype_id}' is not a valid contenttype id.")
        # except ObjectDoesNotExist:
        #     raise InvalidData(f"Could not locate a '{object_contenttype.name}' object with id '{object_id}'. ")
        
        queryset = LogEntry.objects.filter(object_id=object_id, content_type_id=object_contenttype_id)
        payload =  LogEntrySerializer(queryset, many=True)

        return Response(payload.data)

        
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

class ShipmentView(BaseView):
    """
    Simple Viewset for Viewing Shipment Information
    """
    model = Shipment
    queryset = model.objects.all()
    serializer_class = ShipmentSerializer

    @action(methods=['get'], detail=True, url_path="mark-shipment-packed", url_name="mark_shipment_packed")
    def mark_shipment_packed(self, request, pk=None):
        shipment_id = pk

        ## Check for shipment id in url.
        shipment_id = pk
        if not shipment_id:
            return Response(
                {
                    "error": f"Unable to lock {self.model.__name__} with id:{shipment_id}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ## Retrieve Shipment instance.
            shipment = self.get_queryset().get(id=shipment_id)

            ## Serialize Shipment's current assets.
            assets_serializer = AssetSerializer(shipment.assets, many=True)

            ## Save serialized assets to 'Locked Assets' field.
            shipment.locked_assets = assets_serializer.data

            ## Progress Shipment's status to 'Packed'.
            statuses = [ s[1] for s in shipment.STATUS_OPTIONS ]
            shipment.status = statuses.index('Packed')
            
            try:
                # Save and serialize the Shipment before returning it to the user.
                shipment.save()
                serializer = self.get_serializer_class()(shipment)
                return Response(serializer.data)

            except Exception as E:
                raise(E)

        except self.model.DoesNotExist:
            return Response(
                {
                    "error": f"{self.model.__name__} with id:{shipment_id} does not exist."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as E:
            return Response(
                {
                    "error": f"Encountered an error locking shipment with id:{shipment_id}",
                    "details": str(E),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class ScanView(APIView):
    """
    Simple View for entering assets into shipments/container assets.
    """
    permission_classes = [IsAuthenticated, ScanToolPermission]
    models_that_can_contain_assets = {
        'shipment' : Shipment,
        'asset' : Asset
    }
    model_serializer_map = {
        'shipment' : ShipmentSerializer,
        'asset' : AssetSerializer
    }

    def post(self, request):

        # Validate request data
        try:
            assert 'destination_content_type' in request.data
            assert 'destination_object_id' in request.data
            assert 'asset_code' in request.data
            assert 'shipment' in request.data
        except AssertionError:
            raise InvalidData()
        
        # Perform 'Scan'
        if request.data['destination_content_type'] in self.models_that_can_contain_assets:
            
            destination_model = self.models_that_can_contain_assets[request.data['destination_content_type']]
            destination_id = request.data['destination_object_id']
            entry_asset_code = request.data['asset_code']
            shipment = Shipment.objects.get(id=request.data['shipment'])
            
            # Retrieve Destination Object
            try:
                destination_object = destination_model.objects.get(id=destination_id)
            except ObjectDoesNotExist:
                raise InvalidData(f"A scan destination of type '{destination_model.__name__}' with id '{destination_id}' does not exist.")
            
            # Retrieve Entry Object
            try:
                entry = Asset.objects.get(code=entry_asset_code)
            except Asset.DoesNotExist:
                raise InvalidData(f"An asset with code '{entry_asset_code}' does not exist.")


            # Verify Entry Parent is Blank
            if entry.parent_object != None:

                # Allow users to re-select container objects if they already exist within the shipment
                if not ( getattr(entry, 'is_container', False) and entry.parent_object == shipment ):
                    raise InvalidData(f"This asset is already locked to '{entry.parent_object}'.")
            
            # Verify Entry and Destination are NOT both containers.
            if getattr(destination_object, 'is_container', False) and getattr(entry, 'is_container', False):
               # Silently scan the entry object into the shipment rather than the provided destination
               destination_object = shipment
            
            # Update the Entry Object
            if destination_object.can_accept_scan_entries():
                entry.parent_object = destination_object

                try:
                    entry.clean() # Perform Model Validation

                    try:
                        entry.save() # Perform Save
                        serializer = AssetSerializer(entry)

                        return Response(serializer.data)
                    
                    except Exception as e:
                        raise InvalidData(e)
                    
                except ValidationError as e:
                    raise InvalidData(e)
            
            else:
                raise InvalidData(f"{destination_object} cannot accept scan entries.")
            
        else:
            # Unknown Destination Content Type
            raise InvalidData("The provided destination content-type is not permitted.")

        return Response({'request': str(request.data)})

#    _____         _    _ _     _     _       _             __                     
#   |_   _|_ _ ___| | _| (_)___| |_  (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#     | |/ _` / __| |/ / | / __| __| | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#     | | (_| \__ \   <| | \__ \ |_  | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#     |_|\__,_|___/_|\_\_|_|___/\__| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                                  

# class MilestoneView(BaseView):
#     """
#     Simple Viewset for Viewing Milestone Information
#     """
#     model = Milestone
#     queryset = model.objects.all()
#     serializer_class = MilestoneSerializer

# class ServiceView(BaseView):
#     """
#     Simple Viewset for Viewing Service Information
#     """
#     model = Service
#     queryset = model.objects.all()
#     serializer_class = ServiceSerializer        
                
#   __        ___ _    _   _       _             __                     
#   \ \      / (_) | _(_) (_)_ __ | |_ ___ _ __ / _| __ _  ___ ___  ___ 
#    \ \ /\ / /| | |/ / | | | '_ \| __/ _ \ '__| |_ / _` |/ __/ _ \/ __|
#     \ V  V / | |   <| | | | | | | ||  __/ |  |  _| (_| | (_|  __/\__ \
#      \_/\_/  |_|_|\_\_| |_|_| |_|\__\___|_|  |_|  \__,_|\___\___||___/
#                                                                       
