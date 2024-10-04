#from django.shortcuts import render

# Create your views here.
from django.forms import BaseModelForm
from django.shortcuts import render, redirect
from .models import User, Shift, Post
from django.views import View
from django.views.generic import  CreateView, TemplateView,ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login
from django.contrib.auth.views import LoginView as BaseLoginView, LogoutView as BaseLogoutView
from django.urls import reverse_lazy
from .forms import RegistarForm , LoginFrom, ShiftForm, PostForm
from django.http import HttpResponse, JsonResponse
import json
import datetime
from django.views.decorators.csrf import csrf_exempt



class IndexView(TemplateView, LoginRequiredMixin):
    template_name = "index.html"


class RegistarView(CreateView):
    model = User
    form_class = RegistarForm
    template_name = "accounts/registar.html"
    success_url = reverse_lazy("accounts:home")

    def form_valid(self, form): #ユーザー作成後そのままログイン状態にする
        # login after signup
        response = super().form_valid(form)
        account_id = form.cleaned_data.get("account_id")
        password = form.cleaned_data.get("password1")
        user = authenticate(account_id=account_id, password=password)
        login(self.request, user)
        return response

# ログインビューを作成
class LoginView(BaseLoginView):
    form_class = LoginFrom
    template_name = "accounts/login.html"


class LogoutView(BaseLogoutView):
    success_url = reverse_lazy("index")


class HomeView(TemplateView, LoginRequiredMixin):
    template_name = "home/home.html"

class ProfileView(TemplateView, LoginRequiredMixin):
    template_name = "home/profile.html"

# class CalendarView(TemplateView):
#     template_name = "calendar.html"
    
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         shifts = Shift.objects.all()
#         shift_data = {shift.date.strftime('%Y/%m/%d'): shift.shift for shift in shifts}
#         context['shifts'] = shift_data
#         return context

class Create_shiftView(View, LoginRequiredMixin):
    def get(self, request, *args, **kwargs):
        shifts = Shift.objects.all()
        shift_data = {shift.date.strftime('%Y-%m-%d'): {'shift_type': shift.shift_type} for shift in shifts}
        return render(request, 'home/create_shift.html', {'shift_data': json.dumps(shift_data)})

class ShiftView(TemplateView, LoginRequiredMixin):
    template_name = "home/shift.html"
    

class TableView(TemplateView, LoginRequiredMixin):
    template_name = "home/table.html"


class BoardView(ListView, LoginRequiredMixin):
    model = Post
    template_name = "home/board.html"

class CreatePostView(CreateView, LoginRequiredMixin):
    model = Post
    form_class = PostForm
    template_name = "home/create_post.html"
    # fields = ['title','message']
    success_url = reverse_lazy("accounts:board")

    # def form_valid(self, form):
    #     form.instance.user = self.request.user
    #     return super().form_valid(form)


# class LikeBase(View, LoginRequiredMixin):
#    """いいねのベース。リダイレクト先を以降で継承先で設定"""
#    def get(self, request, *args, **kwargs):
#        #記事の特定
#        pk = self.kwargs['pk']
#        related_post = Post.objects.get(pk=pk)
       
#        #いいねテーブル内にすでにユーザーが存在する場合   
#        if self.request.user in related_post.like.all(): 
#            #テーブルからユーザーを削除 
#            obj = related_post.like.remove(self.request.user)
#        #いいねテーブル内にすでにユーザーが存在しない場合
#        else:
#            #テーブルにユーザーを追加                           
#            obj = related_post.like.add(self.request.user)  
#        return obj


# class LikeHome(LikeBase):
#    """HOMEページでいいねした場合"""
#    def get(self, request, *args, **kwargs):
#        #LikeBaseでリターンしたobj情報を継承
#        super().get(request, *args, **kwargs)
#        #homeにリダイレクト
#        return redirect('accounts:board')


    
@csrf_exempt 
def shift_form(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            shift_date = data['date']
            shift_type = data['shift_type']
            user = request.user

            # デバッグメッセージ
            print(f"Received data: {data}")
            
            # 追記
            try:
                shift_date = datetime.datetime.strptime(shift_date, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'Invalid date format'}, status=400)
            
            # shift_instance = Shift(date=shift_date, shift=shift, shift_type=shift_type)
            shift_instance = Shift(user=user,date=shift_date, shift_type=shift_type)
# 追記
            print(f"Shift instance: {shift_instance}")

            shift_instance.save()

            return JsonResponse({'status': 'success'})
        except Exception as e:
            print(f"Error: {str(e)}")  # コンソールにエラーメッセージを表示
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def shift_delete(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            shift_date = data['date']
            shift_type = data['shift_type']
            user = request.user

            shift_date = datetime.datetime.strptime(shift_date, '%Y-%m-%d').date()

            # print(f"Deleting shift for date: {shift_date}")
            # print(f"Deleting shift for date: {shift_date}, shift_type: {shift_type}")

            # Shift.objects.filter(date=shift_date, shift=shift, shift_type=shift_type).delete()
            Shift.objects.filter(user=user, date=shift_date,  shift_type=shift_type).delete()

            # 追記
            return JsonResponse({'status': 'success'})  # JsonResponseを返却
        except KeyError as e:
            print(f"Missing key: {str(e)}")
            return JsonResponse({'status': 'error', 'message': f"Missing key: {str(e)}"}, status=400)

            # return JsonResponse({'status': 'success'})  # JsonResponseを返却
        except Exception as e:
            print(f"Error: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)



def get_shifts(request):
    if request.method == 'GET':
        user = request.user
        shifts = Shift.objects.filter(user=user)
        # shifts = Shift.objects.all()
        shift_list = []
        for shift in shifts:
            shift_list.append({
                'date': shift.date.strftime('%Y-%m-%d'),
                'shift_type': shift.shift_type,
            })
        return JsonResponse({'shifts': shift_list})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def get_allshifts(request):
    if request.method == 'GET':
        shifts = Shift.objects.all().select_related('user')
        shift_list = []
        for shift in shifts:
            shift_list.append({
                'date': shift.date.strftime('%Y-%m-%d'),
                # 'user': shift.user.last_name,
                'user': {
                    'account_id':shift.user.account_id,
                    'last_name': shift.user.last_name,
                    'first_name': shift.user.first_name,
                },
                'shift_type': shift.shift_type,
            })
        return JsonResponse({'shifts': shift_list})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def get_allaccounts(request):
    if request.method == 'GET':
            accounts = User.objects.all().values('account_id', 'first_name')
    return JsonResponse({'accounts': list(accounts)})






