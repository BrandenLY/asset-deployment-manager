from django.db import models, transaction, IntegrityError
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

# Constants - Changing these values may affect the database schema. It's advised to run migrations after changing.
SMALL_TEXT_FIELD_SIZE = 150
LARGE_TEXT_FIELD_SIZE = 300
ALPHANUMERIC_VALIDATOR = RegexValidator("^[A-Za-z0-9]*$", "Enter an alphanumeric value")

# Create your models here.
class Asset(models.Model):
    CONDITION_OPTIONS = (
        (0, "Damaged"),
        (1, "Lost"),
        (2, "Needs Label"),
        (3, "Requires Testing"),
        (4, "Working"),
        (5, "Faulty"),
    )
    model = models.ForeignKey("AssetModel", on_delete=models.PROTECT)
    code = models.CharField(_("Code"), max_length=25, validators=[ALPHANUMERIC_VALIDATOR,], unique=True)
    serial_number = models.CharField(_("Serial Number"), max_length=50, blank=True, null=True)
    iccid = models.CharField(_("ICCID"), max_length=20, blank=True, null=True)
    imei = models.CharField(_("IMEI"), max_length=15, blank=True, null=True)
    knox_id = models.CharField(_("Knox ID"), max_length=20, blank=True, null=True)
    note = models.TextField(_("Note"), blank=True, null=True)
    date_created = models.DateTimeField(_("Date Created"), auto_now_add=True, blank=True, null=True)
    created_by = models.ForeignKey(get_user_model(), related_name="created_assets", on_delete=models.CASCADE, blank=True, null=True)
    last_modified = models.DateTimeField(_("Last Modified"), auto_now=True, blank=True, null=True)
    modified_by = models.ForeignKey(get_user_model(), related_name="modified_assets", on_delete=models.CASCADE, blank=True, null=True)
    parent = models.ForeignKey("self", related_name="children", on_delete = models.PROTECT, blank=True, null=True)
    location = models.ForeignKey("Location", on_delete=models.CASCADE, blank=True, null=True)
    current_shipment = models.ForeignKey("Shipment", related_name='assets', on_delete=models.CASCADE, blank=True, null=True )
    is_container = models.BooleanField(_("Is a Container"), default=False)
    
    class Meta:
        ordering = ["code"]
        indexes  = [models.Index(fields=["code", "model"])]

    def __str__(self):
        return f"{self.code} - {self.model}"
    
class AssetModel(models.Model):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    description = models.CharField(_("Description"), max_length=LARGE_TEXT_FIELD_SIZE, blank=True, null=True)
    manufacturer = models.CharField(_("Manufacturer"), max_length=SMALL_TEXT_FIELD_SIZE)
    model_code = models.CharField(_("Model Code"), max_length=10)
    image = models.ImageField(_("Image"), blank=True, null=True, upload_to="assets/models")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
    
class Location(models.Model):
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
    
class Shipment(models.Model):
    STATUS_OPTIONS = (
        (0, "Scheduled"),
        (1, "Packed"),
        (2, "In Transit"),
        (3, "Delivered"),
        (4, "Canceled"),
    )
    event = models.ForeignKey("main.Event", on_delete=models.CASCADE, blank=True, null=True)
    status = models.SmallIntegerField(_("Status"), choices=STATUS_OPTIONS, default=0)
    origin = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="shipments_out")
    destination = models.ForeignKey(Location, on_delete=models.PROTECT, related_name="shipments_in")
    carrier = models.CharField(_("Carrier"), max_length=85)
    locked_assets = models.JSONField(_("Assets"), blank=True, null=True)
    departure_date = models.DateTimeField(_("Departure Date"), blank=True, null=True)
    arrival_date = models.DateTimeField(_("Arrival Date"), blank=True, null=True)
    
    class Meta:
        ordering = [ "status", "arrival_date" ]
        indexes = [ models.Index(fields=["departure_date", "arrival_date"]), ]

    def lock_assets(self):
        try: 
            assets = self.locked_assets.all()
            print(f'Str: {str(assets)}, Repr: {repr(assets)}, Type: {type(assets)}')
            with transaction.atomic():
                ## SAVE SNAPSHOT OF LOCKED ASSETS TO THIS INSTANCE'S 'ASSETS' FIELD
                pass
        
        except IntegrityError as e:

            print(e)
            raise(IntegrityError)