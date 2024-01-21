from django.contrib import admin
from .models import Asset
from .models import AssetModel
from .models import Location
from .models import Shipment
# Register your models here.
@admin.display(description="Name")
def name(obj):
    return str(obj)

class AssetAdmin(admin.ModelAdmin):
    list_display = [
        name,
        "code",
        "parent_object",
        "location"
    ]

    @admin.display(description="Name")
    def name(obj):
        return str(obj)

admin.site.register(Asset, AssetAdmin)
admin.site.register(AssetModel)
admin.site.register(Location)
admin.site.register(Shipment)