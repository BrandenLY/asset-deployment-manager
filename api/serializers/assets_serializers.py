from rest_framework import serializers
from assets.models import Asset, Model, AssetIcon, Location, Shipment, EquipmentHold
from .base_serializers import CustomBaseSerializer, ContentTypeSerializer


class ContentAssetsField(serializers.ReadOnlyField):
    """
    Generic Foreign Key relations are serialized into an appropriate
    JSON representation.
    """

    def get_attribute(self, instance):
        return instance # Returning the entire instance rather than just one of its attributes.

    def to_representation(self, value):
        related_objects = value.assets.all()
        return [AssetSerializer(object).data for object in related_objects]

class AssetSerializer(CustomBaseSerializer):
    assets = ContentAssetsField()
    is_container = serializers.BooleanField(default=False)

    class Meta:
        model = Asset
        fields = [
            "id",
            "label",
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
            "is_container",
            "parent_content_type",
            "parent_object_id",
            "assets",
            "condition"
        ]

class AssetIconSerializer(CustomBaseSerializer):

    class Meta:
        model = AssetIcon
        fields = [
            "id",
            "label",
            "name",
            "source_name"
        ]

class ModelSerializer(CustomBaseSerializer):

    class Meta:
        model = Model
        fields = [
            "id",
            "label",
            "name",
            "description",
            "manufacturer",
            "model_code",
            "icon",
        ]

class LocationSerializer(CustomBaseSerializer):

    class Meta:
        model = Location
        fields = [
            "id",
            "label",
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

class ShipmentSerializer(CustomBaseSerializer):
    
    assets = ContentAssetsField()
    packed_assets = serializers.SerializerMethodField()
    asset_counts = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            "id",
            "label",
            "status",
            "carrier",
            "origin",
            "destination",
            "event",
            "departure_date",
            "arrival_date",
            "asset_counts",
            "assets",
            "packed_assets",
            "send_back_shipment",
        ]

    def get_packed_assets(self, obj):

        return obj.packed_assets
    
    def get_asset_counts(self, obj):
        children=obj.assets.all()

        direct_child_count = children.count()
        extended_child_count = 0
        for child in children:
            extended_child_count+= child.assets.count()

        return {
            'total_assets' : direct_child_count + extended_child_count,
            'direct_children' : direct_child_count,
            'extended_children' : extended_child_count
        }

class EquipmentHoldSerializer(CustomBaseSerializer):

    class Meta:
        model = EquipmentHold
        fields = [
            'model',
            'quantity',
            'start_date',
            'end_date',
            'event'
        ]