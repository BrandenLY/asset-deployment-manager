from rest_framework import serializers
from assets.models import Asset, AssetModel, Location, Shipment
from api.serializers.event_serializer import EventSerializer

class LockedAssetsField(serializers.Field):
    
    # Should receive a
    
    def to_representation(self, value):
        pass

    def to_internal_value(self, data):
        pass

class AssetSerializer(serializers.ModelSerializer):

    class Meta:
        model = Asset
        fields = [
            "id",
            "model",
            "code",
            "serial_number",
            "iccid",
            "imei",
            "knox_id",
            "note",
            "date_created",
            "created_by",
            "last_modified",
            "modified_by",
            "location",
            "current_shipment",
            "is_container",
        ]

class AssetModelSerializer(serializers.ModelSerializer):

    class Meta:
        model = AssetModel
        fields = [
            "id",
            "name",
            "description",
            "manufacturer",
            "model_code",
            "image"
        ]

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "country",
            "zipcode",
            "longitude",
            "latitude"
        ]

class ShipmentSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True)
    origin = LocationSerializer()
    destination = LocationSerializer()
    event = EventSerializer()
    class Meta:
        model = Shipment
        fields = [
            "id",
            "assets",
            "origin",
            "destination",
            "event",
            "carrier",
            "status",
            "departure_date",
            "arrival_date",
            "locked_assets",
        ]