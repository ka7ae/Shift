from django.contrib.auth.forms import UserCreationForm, AuthenticationForm# 追加
# from django.contrib.auth import get_user_model

from .models import User, Shift
# from .models import Shift
from django import forms

# User = get_user_model()

class RegistarForm(UserCreationForm):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "account_id",
            "email",
        ]


# ログインフォームを追加
class LoginFrom(AuthenticationForm):
    class Meta:
        model = User


# class ShiftForm(forms.ModelForm):
#     class Meta:
#         model = Shift
#         fields = ['first_name','last_name', 'date', 'shift', 'shift_type']
#         widgets = {
#             'date': forms.DateInput(attrs={'type': 'date'}),
#         }


class ShiftForm(forms.ModelForm):
    class Meta:
        model = Shift
        fields = ['user', 'date', 'shift', 'shift_type']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['user'].queryset = User.objects.all()
        self.fields['user'].label_from_instance = lambda obj: f"{obj.first_name} {obj.last_name}"
