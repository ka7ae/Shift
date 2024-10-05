from django.contrib.auth.forms import UserCreationForm, AuthenticationForm# 追加
# from django.contrib.auth import get_user_model

from .models import User, Shift, Post
# from .models import Shift
from django import forms


class RegistarForm(UserCreationForm):
    class Meta:
        model = User
        fields = [
            "last_name",
            "first_name",
            "account_id",
            "email",
        ]


# ログインフォームを追加
class LoginFrom(AuthenticationForm):
    # class Meta:
        # model = User
        username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Id'}))
        password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))


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
        fields = ['user', 'date', 'shift_type']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['user'].queryset = User.objects.all()
        self.fields['user'].label_from_instance = lambda obj: f"{obj.last_name} {obj.first_name}"


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["user", "title", "message"]
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Enter Title'}),
            'message': forms.Textarea(attrs={'placeholder': 'Enter Message'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['user'].queryset = User.objects.all()
        self.fields['user'].label_from_instance = lambda obj: f"{obj.last_name} {obj.first_name}"

