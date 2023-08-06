import logging
from django.apps import AppConfig
from django.db.models.signals import pre_save, post_save


LOGGER = logging.getLogger(__name__)

def create_service_tasks(sender, instance, created, **kwargs):
    LOGGER.debug('Signal trigger')
    instance.build_tasks_from_services()

class TasklistConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tasklist'

    def ready(self) -> None:
        super().ready()
        from .models import Project
        LOGGER.debug("Attempting to attach signals within 'tasklist' app config.")
        post_save.connect(create_service_tasks, Project, dispatch_uid='cv-create-service-tasks')
