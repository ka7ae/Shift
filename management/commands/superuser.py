from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a superuser non-interactively if it does not exist'

    def handle(self, *args, **options):
        username = settings.SUPERUSER_NAME
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                last_name=settings.SUPERUSER_LAST_NAME,
                first_name=settings.SUPERUSER_FIRST_NAME,
                password=settings.SUPERUSER_PASSWORD
            )
            self.stdout.write(self.style.SUCCESS(f'Superuser {username} created successfully'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser {username} already exists'))