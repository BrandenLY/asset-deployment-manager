from django.contrib import admin
from .models import Asset
from .models import AssetModel
from .models import AssetIcon
from .models import Location
from .models import Shipment
# Register your models here.

class AssetAdmin(admin.ModelAdmin):
    @admin.display(description="Name")
    def name(obj):
        return str(obj)
    
    list_display = [
        name,
        "code",
        "model",
        "parent_object",
        "location"
    ]

class AssetModelAdmin(admin.ModelAdmin):
    
    list_display = [
        "name",
        "manufacturer",
        "model_code",
    ]


admin.site.register(Asset, AssetAdmin)
admin.site.register(AssetModel, AssetModelAdmin)
admin.site.register(AssetIcon)
admin.site.register(Location)
admin.site.register(Shipment)