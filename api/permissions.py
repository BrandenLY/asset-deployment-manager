from rest_framework.permissions import BasePermission

class ScanToolPermission(BasePermission):
    """
    Allows a user to access the Scan API Endpoint
    """

    def has_permission(self, request, view):
        """
        Return `True` if permission is granted, `False` otherwise.
        """
        has_django_model_perms = request.user.has_perm("assets.scan_to_parent")
        return bool(has_django_model_perms)

    def has_object_permission(self, request, view, obj):
        """
        Return `True` if permission is granted, `False` otherwise.
        """
        return False
