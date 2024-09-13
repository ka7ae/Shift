#rom django.contrib import admin
# Register your models here.

from django.contrib import admin
from django.contrib.auth.models import Group

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ("account_id", "email", "is_superuser")
    exclude = ("username", )

    fieldsets = (
        (None, {"fields": ("account_id", "email"
                           )}),

        ("Permissions", {
           "fields": ("is_superuser", "is_staff",)
         }),
    )

admin.site.register(User, UserAdmin)  # Userモデルを登録
admin.site.unregister(Group)  # Groupモデルは不要のため非表示にします



