from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a superuser non-interactively'

    def handle(self, *args, **options):
        account_id = settings.SUPERUSER_ACCOUNT_ID
        if not User.objects.filter(account_id=account_id).exists():
            User.objects.create_superuser(
                account_id=account_id,
                last_name=settings.SUPERUSER_LAST_NAME,
                first_name=settings.SUPERUSER_FIRST_NAME,
                password=settings.SUPERUSER_PASSWORD
            )
            self.stdout.write(self.style.SUCCESS(f'Superuser with account_id {account_id} created successfully'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser with account_id {account_id} already exists'))