from django.urls import path
from django.contrib import admin
#from django.contrib.auth.views import LoginView, LogoutView 
from . import views
#from .views import RegistarView, IndexView, LoginView, LogoutView

app_name = "accounts"

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path('registar/', views.RegistarView.as_view(), name="registar"),
    path('login/', views.LoginView.as_view(), name="login"),
    path('logout/', views.LogoutView.as_view(), name="logout"),
    # path('home/', views.HomeView.as_view(), name="home"),
    path('profile/', views.ProfileView.as_view(), name="profile"),
    path('create_shift/', views.Create_shiftView.as_view(), name="create_shift"),
    path('shift/', views.ShiftView.as_view(), name="shift"),
    path('table/', views.TableView.as_view(), name="table"),
    path('board/', views.BoardView.as_view(), name="board"),
    path('create/', views.CreatePostView.as_view(), name="create"),
    path('shift_form/', views.shift_form, name='shift_form'),
    path('shift_delete/', views.shift_delete, name='shift_delete'),
    path('get_shifts/', views.get_shifts, name='get_shifts'),
    path('get_allshifts/', views.get_allshifts, name='get_allshifts'),
    path('get_allaccounts/', views.get_allaccounts, name='get_allaccounts'),
    path('password_change/', views.PasswordChange.as_view(), name='password_change'), #追加
    path('password_change/done/', views.PasswordChangeDone.as_view(), name='password_change_done'),
    path('admin/', admin.site.urls),

]
