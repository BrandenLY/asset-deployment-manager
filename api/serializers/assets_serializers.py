from rest_framework import serializers
from assets.models import Asset, AssetModel, Location

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
            "modified_by"
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
            "logntitude",
            "latitude"
        ]