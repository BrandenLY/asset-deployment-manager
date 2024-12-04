from django.db import transaction
from rest_framework import serializers
from assets.models import Asset, Model, AssetIcon, Location, Shipment, Reservation, ReservationItem
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
            "latitude",
            "is_warehouse"
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

class ReservationItemSerializer(CustomBaseSerializer):

    class Meta:
        model = ReservationItem
        fields = ['id', 'model', 'quantity']

class ReservationSerializer(CustomBaseSerializer):
    reservation_items = ReservationItemSerializer(many=True)  # Nested ReservationItem serializer

    class Meta:
        model = Reservation
        fields = [
            'id',
            'label',
            'start_date',
            'end_date',
            'event',
            'reservation_items',
        ]

    def create(self, validated_data):
        """
        Custom create method to handle nested reservation items.
        """
        reservation_items_data = self.initial_data.get('reservation_items')  # Use initial_data

        reservation = Reservation.objects.create(
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
        )

        # Create ReservationItems
        if reservation_items_data:
            for item_data in reservation_items_data:
                model_id = item_data['model']
                quantity = item_data['quantity']
                model = Model.objects.get(pk=model_id)
                ReservationItem.objects.create(reservation=reservation, model=model, quantity=quantity)

        return reservation

    def update(self, instance, validated_data):
        """
        Custom update method to handle nested reservation items.
        """
        reservation_items_data = self.initial_data.get('reservation_items')

        # Update the instance fields
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        if reservation_items_data:
            # Clear and re-add reservation items
            instance.reservation_items.all().delete()
            for item_data in reservation_items_data:
                model_id = item_data['model']
                quantity = item_data['quantity']
                model = Model.objects.get(pk=model_id)
                ReservationItem.objects.create(reservation=instance, model=model, quantity=quantity)

        return instance