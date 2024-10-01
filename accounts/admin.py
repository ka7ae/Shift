#rom django.contrib import admin
# Register your models here.

from django.contrib import admin
from django.contrib.auth.models import Group

from .models import User


class UserAdmin(admin.ModelAdmin):
    list_display = ("account_id", "email","first_name", "last_name", "is_superuser", "is_active")
    # exclude = ("username", )

    fieldsets = (
        (None, {"fields": ("account_id", "email", "first_name", "last_name"
                           )}),

        ("Permissions", {
           "fields": ("is_superuser", "is_staff", "is_active")
         }),
    )

admin.site.register(User, UserAdmin)  # Userモデルを登録
admin.site.unregister(Group)  # Groupモデルは不要のため非表示にします

# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import User, Shift

# class CustomUserAdmin(UserAdmin):
#     model = User
#     list_display = ('account_id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active',)
#     list_filter = ('is_staff', 'is_active',)
#     fieldsets = (
#         (None, {'fields': ('account_id', 'email', 'password')}),
#         ('Personal info', {'fields': ('first_name', 'last_name')}),
#         ('Permissions', {'fields': ('is_staff', 'is_active')}),
#     )
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('account_id', 'email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_active')}
#         ),
#     )
#     search_fields = ('account_id', 'email',)
#     ordering = ('account_id',)

# admin.site.register(User, CustomUserAdmin)
# admin.site.register(Shift)

