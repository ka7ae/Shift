from django.urls import path
#from django.contrib.auth.views import LoginView, LogoutView 
from . import views
#from .views import RegistarView, IndexView, LoginView, LogoutView

app_name = "accounts"

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path('registar/', views.RegistarView.as_view(), name="registar"),
    path('login/', views.LoginView.as_view(), name="login"),
    path('logout/', views.LogoutView.as_view(), name="logout"),
    path('home/', views.HomeView.as_view(), name="home"),
    path('home/profile/', views.ProfileView.as_view(), name="profile"),
    path('home/create_shift/', views.Create_shiftView.as_view(), name="create_shift"),
    path('home/shift/', views.ShiftView.as_view(), name="shift"),
    path('home/table/', views.TableView.as_view(), name="table"),
    path('shift_form/', views.shift_form, name='shift_form'),
    path('shift_delete/', views.shift_delete, name='shift_delete'),
    path('get_shifts/', views.get_shifts, name='get_shifts'),
    path('get_allshifts/', views.get_allshifts, name='get_allshifts'),
    path('get_allaccounts/', views.get_allaccounts, name='get_allaccounts'),
]
