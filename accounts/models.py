#from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from django.contrib.auth.models import (BaseUserManager,
                                        AbstractBaseUser,
                                        PermissionsMixin)
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def _create_user(self,  account_id, password, **extra_fields):
        user = self.model(account_id=account_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, account_id, password=None, **extra_fields):
            extra_fields.setdefault('is_staff', False)
            extra_fields.setdefault('is_superuser', False)
            return self._create_user(
                account_id=account_id,
                password=password,
                **extra_fields,
            )

    def create_superuser(self, account_id, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(
            account_id=account_id,
            password=password,
            **extra_fields,
        )
    
class User(AbstractBaseUser, PermissionsMixin):

    last_name = models.CharField(
        verbose_name=_("last_name"),
        # unique=True,
        max_length=10,
        blank=True
    )
        
    first_name = models.CharField(
        verbose_name=_("first_name"),
        # unique=True,
        max_length=10,
        blank=True
    )

    account_id = models.CharField(
        verbose_name=_("account_id"),
        unique=True,
        max_length=10
    )

    
    is_staff = models.BooleanField(
        verbose_name=_('staff status'),
        default=False,
    )

    is_superuser = models.BooleanField(
        verbose_name=_("is_superuer"),
        default=False
    )

    is_active = models.BooleanField(
        verbose_name=_('active'),
        default=True,
    )

    objects = UserManager()

    USERNAME_FIELD = 'account_id' # ログイン時、ユーザー名の代わりにaccount_idを使用
    REQUIRED_FIELDS = ['last_name','first_name']  # スーパーユーザー作成時にemailも設定する

    def __str__(self):
        # return self.account_id
        return f" {self.last_name}:{self.first_name}: {self.account_id}"
    
    def get_full_name(self):
        return f"{self.last_name} {self.first_name}"

    def get_short_name(self):
        return self.first_name


class Shift(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    shift_type = models.CharField(max_length=10, choices=(
        ('△', '△'),
        ('◯', '◯'),
        ('11~', '11~'),
        ('17~', '17~'),
        ('☆', '☆'),
        ('◎','◎'),
        ('✕','✕'),
    ))

    def __str__(self):
        return f"{self.user}: {self.date} ({self.shift_type})"
        # return f"{self.date}: {self.shift} ({self.shift_type})"

    
class Post(models.Model):
    title = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}: {self.title}: {self.message} ({self.message})"
    
    class Meta:
        ordering = ["-created_at"] #投稿順にクエリを取得