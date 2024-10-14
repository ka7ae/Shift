#rom django.contrib import admin
# Register your models here.

from django.contrib import admin
from django.contrib.auth.models import Group

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ("account_id","first_name", "last_name", "password", "is_superuser", "is_active")
    # exclude = ("username", )

    fieldsets = (
        (None, {"fields": ("account_id", "first_name", "last_name", "password"
                           )}),

        ("Permissions", {
           "fields": ("is_superuser", "is_staff", "is_active")
         }),
    )

admin.site.register(User, UserAdmin)  # Userモデルを登録
admin.site.unregister(Group)  # Groupモデルは不要のため非表示にします


