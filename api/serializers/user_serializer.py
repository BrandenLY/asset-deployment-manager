from rest_framework import serializers
from api.serializers.base_serializers import CustomBaseSerializer
from main.models import User
from django.contrib.auth.models import Permission

class PermissionSerializer(CustomBaseSerializer):

    class Meta:
        model=Permission
        fields=["id", "label", "codename", "name"]


class UserSerializer(CustomBaseSerializer):
    user_permissions = PermissionSerializer(many=True)
    class Meta:
        model = User
        fields = [
            "id",
            "label",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "password",
            "groups",
            "user_permissions"
        ]
        read_only_fields = ["date_joined","last_login",]
        extra_kwargs = {"password": {"write_only": True} }

    def create(self, validated_data):
        user = User(
            **validated_data
        )
        user.set_password(validated_data['password'])
        user.save()
        return user