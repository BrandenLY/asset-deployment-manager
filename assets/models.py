from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

SMALL_TEXT_FIELD_SIZE = 150
LARGE_TEXT_FIELD_SIZE = 300

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
    code = models.CharField(_("Code"), max_length=25)
    serial_number = models.CharField(_("Serial Number"), max_length=50, blank=True, null=True)
    iccid = models.CharField(_("Integrated Circuit Card Identifier"), max_length=20, blank=True, null=True)
    imei = models.CharField(_("International Mobile Equipment Identity"), max_length=15, blank=True, null=True)
    knox_id = models.CharField(_("Knox ID"), max_length=20, blank=True, null=True)
    note = models.TextField(_("Note"), blank=True, null=True)
    date_created = models.DateTimeField(_("Date Created"), auto_now_add=True, blank=True, null=True)
    created_by = models.ForeignKey(get_user_model(), related_name="created_assets", on_delete=models.CASCADE, blank=True, null=True)
    last_modified = models.DateTimeField(_("Last Modified"), auto_now=True, blank=True, null=True)
    modified_by = models.ForeignKey(get_user_model(), related_name="modified_assets", on_delete=models.CASCADE, blank=True, null=True)

class AssetModel(models.Model):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    description = models.CharField(_("Description"), max_length=LARGE_TEXT_FIELD_SIZE, blank=True, null=True)
    manufacturer = models.CharField(_("Manufacturer"), max_length=SMALL_TEXT_FIELD_SIZE)
    model_code = models.CharField(_("Model Code"), max_length=10)
    image = models.ImageField(_("Image"), blank=True, null=True, upload_to="assets/models")

class Location(models.Model):
    name = models.CharField(_("Name"), max_length=SMALL_TEXT_FIELD_SIZE)
    address_line_1 = models.CharField(_("Address Line 1"), max_length=35)
    address_line_2 = models.CharField(_("Address Line 2"), max_length=35)
    city = models.CharField(_("City"), max_length=85)
    state = models.CharField(_("State"), max_length=85, blank=True, null=True)
    country = models.CharField(_("Country"), max_length=85)
    zipcode = models.CharField(_("Zipcode"), max_length=20)
    longitude = models.DecimalField(_("Longitude"), max_digits=13, decimal_places=8, blank=True, null=True)
    latitude = models.DecimalField(_("Latitude"), max_digits=12, decimal_places=8, blank=True, null=True)


# class Shipment(models.Model):
#     origin = None
#     destination = None
