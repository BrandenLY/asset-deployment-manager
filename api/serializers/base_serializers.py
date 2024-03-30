from rest_framework import serializers

class CustomBaseSerializer(serializers.ModelSerializer):

    label = serializers.SerializerMethodField()

    def get_label(self, obj):
        return str(obj)