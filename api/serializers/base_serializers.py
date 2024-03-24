from rest_framework import serializers

class CustomBaseSerializer(serializers.ModelSerializer):

    label = serializers.SerializerMethodField()

    def get_label(self, obj):
        print(obj)
        return str(obj)