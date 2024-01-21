import json
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from assets.models import Asset, AssetModel, Location, Shipment
from api.serializers.event_serializer import EventSerializer


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

class AssetSerializer(serializers.ModelSerializer):
    assets = ContentAssetsField()
    parent_content_type = serializers.SerializerMethodField()

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
    
    assets = ContentAssetsField()
    packed_assets = serializers.SerializerMethodField()
    asset_counts = serializers.SerializerMethodField()

    class Meta:
        model = Shipment
        fields = [
            "id",
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
        ]

    def get_packed_assets(self, obj):

        return json.loads(obj.packed_assets)
    
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

# [<QuerySet [<Asset: APL002 - Apple Iphone>]>, 
#  <QuerySet [<Asset: BBS002 - Windows PC>]>, 
#  <Asset: APL001 - Apple Iphone>, 
#  <Asset: BBS001 - Windows PC>]

# [
#     [<Asset: APL002 - Apple Iphone>], 
#     [<Asset: BBS002 - Windows PC>], 
#     <Asset: APL001 - Apple Iphone>, 
#     <Asset: BBS001 - Windows PC>
# ]
