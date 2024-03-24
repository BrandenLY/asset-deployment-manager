from rest_framework import serializers
from assets.models import Asset, AssetModel, Location, Shipment
from .base_serializers import CustomBaseSerializer


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
    parent_content_type = serializers.SerializerMethodField()

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
        ]

    def get_parent_content_type(self, obj):
        return {
            'id' : obj.parent_content_type.id,
            'name' : obj.parent_content_type.model
        }

class AssetModelSerializer(CustomBaseSerializer):

    class Meta:
        model = AssetModel
        fields = [
            "id",
            "label",
            "name",
            "description",
            "manufacturer",
            "model_code",
            "image"
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

