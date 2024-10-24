import django_filters

from assets.models import Asset

class AssetFilter(django_filters.FilterSet):
    location__is_warehouse = django_filters.BooleanFilter(field_name="location", method="filter_assets_in_warehouse")

    def filter_assets_in_warehouse(self, queryset, name, value):
        return queryset.filter(location__is_warehouse=True)
    
    class Meta:
        model = Asset
        fields = [
            'model',
            'location',
            'condition',
            'is_container'
        ]