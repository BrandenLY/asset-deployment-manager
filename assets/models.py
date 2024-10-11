import json
from django.db import models, transaction, IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _


# Constants - Changing these values may affect the database schema. It's advised to run migrations after changing.
SMALL_TEXT_FIELD_SIZE = 150
LARGE_TEXT_FIELD_SIZE = 300
ALPHANUMERIC_VALIDATOR = RegexValidator("^[A-Za-z0-9]*$", "Enter an alphanumeric value")

# Base Models
class TrackedModel(models.Model):
    date_created = models.DateTimeField(_("Date Created"), auto_now_add=True)
    last_modified = models.DateTimeField(_("Last Modified"), auto_now=True)
    created_by = models.ForeignKey(get_user_model(), related_name="%(app_label)s_%(class)s_created", on_delete=models.CASCADE, null=True, editable=False)
    modified_by = models.ForeignKey(get_user_model(), related_name="%(app_label)s_%(class)s_modified", on_delete=models.CASCADE, null=True)

    class Meta:
        abstract=True

# Create your models here.
class Asset(TrackedModel):
    CONDITION_OPTIONS = (
        (0, "Working"),
        (1, "Damaged"),
        (2, "Faulty"),
        (3, "Lost"),
    )
    
    model = models.ForeignKey("Model", related_name="model", on_delete=models.PROTECT)
    code = models.CharField(_("Code"), max_length=25, validators=[ALPHANUMERIC_VALIDATOR,], unique=True)
    serial_number = models.CharField(_("Serial Number"), max_length=50, blank=True, null=True)
    iccid = models.CharField(_("ICCID"), max_length=20, blank=True, null=True)
    imei = models.CharField(_("IMEI"), max_length=15, blank=True, null=True)
    knox_id = models.CharField(_("Knox ID"), max_length=20, blank=True, null=True)
    note = models.TextField(_("Note"), blank=True, null=True)
    location = models.ForeignKey("Location", on_delete=models.SET_NULL, blank=True, null=True)
    condition = models.PositiveSmallIntegerField(_("Condition"), default=0, choices=CONDITION_OPTIONS)
    is_container = models.BooleanField(_("Is a Container"), default=False)
    parent_content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, blank=True, null=True)
    parent_object_id = models.PositiveIntegerField(blank=True, null=True)
    parent_object = GenericForeignKey('parent_content_type', 'parent_object_id')
    assets = GenericRelation(to="Asset",content_type_field="parent_content_type",object_id_field="parent_object_id")

    class Meta:
        ordering = ["code"]
        indexes  = [models.Index(fields=["code", "model"])]
        permissions = [
            ("scan_to_parent", "Can move this asset via Scan API")
        ]

    def __str__(self):
        return f"{self.code} - {self.model}"
    
    def __repr__(self):
        return str(self)
    
    def clean(self):

        # Verify the Asset Code starts with the Model Code.
        if not self.code.startswith(self.model.model_code):
            raise ValidationError("Asset Codes must start with their Model's model_code.")

        parent_content_type = getattr(self.parent_content_type, "model", None)
        
        # Verify any parent elements are containers or shipments.
        if parent_content_type == "asset":
            # Verify the Parent Asset is a container
            if not self.parent_object.is_container:
                raise ValidationError("Only container assets can contain other assets.")
        
        # Verify parent is valid (either a shipment or blank)
        elif parent_content_type != "shipment" and parent_content_type is not None:
                raise ValidationError("Assets can only exist within shipments or container assets.")
        
        # Enforce maximum recursion depth.
        try:
            if self.parent_object:
                parent_level = self.parent_object.parent_object
                if parent_level:
                    grandparent_level = parent_level.parent_object
                    if grandparent_level:
                        raise ValidationError("Maximum recursion depth of 2 exceeded.")
                    
        except AttributeError:
            pass # If we run into an attribute error before reaching grandparent_level then we are
                 # good to go since the only attribute we're accessing is 'parent_object'.
        
    def save(self, *args, **kwargs):
        # Call clean method to perform validation
        self.clean()
        super().save(*args, **kwargs)
    
    def can_accept_scan_entries(self):
        
        # Asset must exist within a shipment to be able to accept other assets as contents.
        if not self.parent_content_type.model == 'shipment':
            return False
        
        # The Shipment must also be accepting contents
        return self.parent_object.can_accept_scan_entries()

class Model(TrackedModel):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    description = models.CharField(_("Description"), max_length=LARGE_TEXT_FIELD_SIZE, blank=True, null=True)
    manufacturer = models.CharField(_("Manufacturer"), max_length=SMALL_TEXT_FIELD_SIZE)
    model_code = models.CharField(_("Model Code"), max_length=10)
    icon = models.ForeignKey("AssetIcon", on_delete=models.PROTECT, blank=True, null=True)
    
    class Meta:
        ordering = ["name", "id"]

    def __str__(self):
        return self.name
    
    def __repr__(self):
        return str(self)
    
class AssetIcon(TrackedModel):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    source_name = models.CharField(_("Source Name"), max_length=SMALL_TEXT_FIELD_SIZE)

    def __str__(self):
        return self.name
    
    def __repr__(self):
        return str(self)
    
class Location(TrackedModel):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    address_line_1 = models.CharField(_("Address Line 1"), max_length=35)
    address_line_2 = models.CharField(_("Address Line 2"), max_length=35, blank=True, null=True)
    city = models.CharField(_("City"), max_length=85)
    state = models.CharField(_("State"), max_length=85, blank=True, null=True)
    country = models.CharField(_("Country"), max_length=85)
    zipcode = models.CharField(_("Zipcode"), max_length=20)
    longitude = models.DecimalField(_("Longitude"), max_digits=13, decimal_places=8, blank=True, null=True)
    latitude = models.DecimalField(_("Latitude"), max_digits=12, decimal_places=8, blank=True, null=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
    
    def __repr__(self):
        return str(self)
    
class Shipment(TrackedModel):
    STATUS_OPTIONS = (
        (0, "Scheduled"),
        (1, "Packed"),
        (2, "In Transit"),
        (3, "Delivered"),
        (4, "Canceled"),
    )
    assets = GenericRelation(to=Asset, content_type_field="parent_content_type", object_id_field="parent_object_id")
    event = models.ForeignKey("main.Event", on_delete=models.CASCADE, blank=True, null=True)
    status = models.SmallIntegerField(_("Status"), choices=STATUS_OPTIONS, default=0)
    origin = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="shipments_out")
    destination = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="shipments_in")
    carrier = models.CharField(_("Carrier"), max_length=85)
    packed_assets = models.JSONField(_("Packed Assets"), default=list)
    departure_date = models.DateTimeField(_("Departure Date"), blank=True, null=True)
    arrival_date = models.DateTimeField(_("Arrival Date"), blank=True, null=True)
    send_back_shipment = models.ForeignKey("assets.Shipment", on_delete=models.CASCADE, blank=True, null=True)
    
    class Meta:
        ordering = [ "status", "arrival_date", "id"]
        indexes = [ models.Index(fields=["departure_date", "arrival_date"]), ]
        permissions = [
            ("receive", "Can receive shipments"),
            ("progress", "Can progress a shipment's status"),
        ]

    def mark_shipment_packed(self):
        try: 
            assets = self.assets.all()
            with transaction.atomic():
                ## SAVE SNAPSHOT OF LOCKED ASSETS TO THIS INSTANCE'S 'PACKED ASSETS' FIELD
                self.status = 1
                pass
        
        except IntegrityError as e:

            raise(IntegrityError)
    
    def can_accept_scan_entries(self):
        
        # Shipment must be in an initial status to accept contents.
        if not self.status == 0:
            return False
        
        return True
    
    def __str__(self):
        return f"{self.carrier} | {self.origin} → {self.destination}"
    
    def __repr__(self):
        return str(self)
    
class EquipmentHold(TrackedModel):
    model = models.ForeignKey(Model, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField('Quantity', default=1)
    start_date = models.DateField('Start date')
    end_date = models.DateField('End date')
    event = models.ForeignKey('main.Event', on_delete=models.CASCADE, blank=True, null=True)