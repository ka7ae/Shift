from django.contrib.auth.forms import UserCreationForm, AuthenticationForm# 追加

from .models import User, Shift
from django import forms



class RegistarForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            #'username',
            "account_id",
            "email",
            #"first_name",
            #"last_name",
            #"birth_date",
        )


# ログインフォームを追加
class LoginFrom(AuthenticationForm):
    class Meta:
        model = User


class ShiftForm(forms.ModelForm):
    class Meta:
        model = Shift
        fields = ['date', 'shift', 'shift_type']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }
