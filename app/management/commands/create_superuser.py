from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class Command(BaseCommand):
    def handle(self, *args, **options):
        if not User.objects.filter(username=settings.SUPERUSER_NAME).exists():
            User.objects.create_superuser(
                username=settings.SUPERUSER_NAME,
                last_name=settings.SUPERUSER_LAST_NAME,
                first_name=settings.SUPERUSER_FIRST_NAME,
                password=settings.SUPERUSER_PASSWORD
            )
            print("スーパーユーザー作成")