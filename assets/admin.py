from django.contrib import admin
from .models import Asset
from .models import AssetModel
from .models import Shipment
# Register your models here.

admin.site.register(Asset)
admin.site.register(AssetModel)
admin.site.register(Shipment)