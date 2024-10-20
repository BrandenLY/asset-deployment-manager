import django_filters

from assets.models import Asset

class AssetFilter(django_filters.FilterSet):
    
    class Meta:
        model = Asset
        fields = [
            'model',
            'location',
            'condition',
            'is_container'
        ]