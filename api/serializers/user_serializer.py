from rest_framework import serializers
from api.serializers.base_serializers import CustomBaseSerializer
from main.models import User
from django.contrib.auth.models import Permission, Group

class UserSerializer(CustomBaseSerializer):
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
        read_only_fields = ["date_joined","last_login","created_by", "modified_by"]
        extra_kwargs = {"password": {"write_only": True, "required": False} }

    def create(self, validated_data):
        password = validated_data.pop('password', None)  # Remove password if not provided
        user = User(
            **validated_data
        )
        if password:
            user.set_password(validated_data['password']) # Set hashed password
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        user_permissions = validated_data.pop('user_permissions', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password)
        if groups is not None:
            instance.groups.set(groups)
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)

        instance.save()
        return instance

class PermissionSerializer(CustomBaseSerializer):

    class Meta:
        model=Permission
        fields=["id", "label", "codename", "name"]

class GroupSerializer(CustomBaseSerializer):

    class Meta:
        model=Group
        fields=["id", "label", "name", "permissions"]