from django.db import transaction
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from api.exceptions import InvalidData
from api.views.BaseView import BaseView
from assets.models import Asset
from assets.models import AssetIcon
from assets.models import Model
from assets.models import Location
from assets.models import Shipment
from assets.models import Reservation
from api.serializers import AssetSerializer
from api.serializers import AssetIconSerializer
from api.serializers import ModelSerializer
from api.serializers import LocationSerializer
from api.serializers import ShipmentSerializer
from api.serializers import ReservationSerializer
from api.permissions import ScanToolPermission
from api.filters import AssetFilter, ReservationFilter, ShipmentFilter

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
    filterset_class = AssetFilter

class AssetIconView(BaseView):
    """
    Simple Viewset for Viewing Asset Icon Information
    """
    model = AssetIcon
    queryset = model.objects.all()
    serializer_class = AssetIconSerializer

class ModelView(BaseView):
    """
    Simple Viewset for Viewing Asset Model Information
    """
    model = Model
    queryset = model.objects.all()
    serializer_class = ModelSerializer

class LocationView(BaseView):
    """
    Simple Viewset for Viewing Location Information
    """
    model = Location
    queryset = model.objects.all()
    serializer_class = LocationSerializer

class ReservationView(BaseView):
    """
    Simple Viewset for Viewing Equipment Hold data
    """
    model = Reservation
    queryset = model.objects.all()
    serializer_class = ReservationSerializer
    filterset_class = ReservationFilter

class ShipmentView(BaseView):
    """
    Simple Viewset for Viewing Shipment Information
    """
    model = Shipment
    queryset = model.objects.all()
    serializer_class = ShipmentSerializer
    filterset_class = ShipmentFilter

    @action(methods=['get'], detail=True, url_path="mark-shipment-packed", url_name="mark_shipment_packed")
    def mark_shipment_packed(self, request, pk=None):

        ## Check for shipment id in url.
        if not pk:
            return Response(
                {
                    "error": f"Primary key is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ## Retrieve Shipment instance.
            shipment = self.get_queryset().get(id=pk)

            ## Serialize Shipment Assets
            assets = shipment.assets.all()
            serialized_assets = AssetSerializer(assets, many=True) 
            
            ## Perform model updates
            with transaction.atomic():
                ## Set shipment status to 'Packed'
                shipment.status = 1

                ## Update shipment packed_assets
                shipment.packed_assets = serialized_assets.data

            ## Serialize and return new modified object
            payload = self.get_serializer(instance=shipment).data
            return Response(payload, status=status.HTTP_200_OK)

        except self.model.DoesNotExist:
            return Response(
                {
                    "error": f"{self.model.__name__} with id:{pk} does not exist."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as E:
            return Response(
                {
                    "error": f"Encountered an error locking shipment with id:{pk}",
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
