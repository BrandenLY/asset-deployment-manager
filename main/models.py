from django.apps import apps
from django.db import models
from django.contrib import auth
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given username0, and password.
        """
        email = self.normalize_email(email)
        # Lookup the real model class from the global app registry so this
        # manager method can be used in migrations. This is fine because
        # managers are by definition working on the real model.
        GlobalUserModel = apps.get_model(
            self.model._meta.app_label, self.model._meta.object_name
        )
        user = self.model( email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

    def with_perm(
        self, perm, is_active=True, include_superusers=True, backend=None, obj=None
    ):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    "You have multiple authentication backends configured and "
                    "therefore must provide the `backend` argument."
                )
        elif not isinstance(backend, str):
            raise TypeError(
                "backend must be a dotted import path string (got %r)." % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, "with_perm"):
            return backend.with_perm(
                perm,
                is_active=is_active,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()

class User(AbstractUser):
    email = models.EmailField(_('Email Address'), unique=True)
    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

class Comment(models.Model):
    mentions = models.ManyToManyField(get_user_model())
    text = models.TextField(_("Text"))

class Event(models.Model):
    name = models.CharField(_("Name"), max_length=150)
    date_created = models.DateTimeField(_("Created at Date"), auto_now_add=True, editable=False)
    last_modified = models.DateTimeField(_("Last Modified Date"), auto_now=True)
    start_date = models.DateField(_("Start Date"))
    end_date = models.DateField(_("End Date"))
    travel_in_date = models.DateField(_("Travel In Date"))
    travel_out_date = models.DateField(_("Travel Out Date"))

    timetracking_url = models.URLField(_("Timetracking URL"), blank=True, null=True)
    external_project_url = models.URLField(_("External Project URL"), blank=True, null=True)
    sharepoint_url = models.URLField(_("Sharepoint URL"), blank=True, null=True)

    class Meta:
        ordering = ["travel_in_date"]

    def __str__(self):
        if hasattr(self, "project"):
            return f"[ {self.project.production_show_code} ] {self.name}, {self.start_date} - {self.end_date}"
        else:
            return f"[ - ] {self.name}, {self.start_date} - {self.end_date}"