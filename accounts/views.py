#from django.shortcuts import render

# Create your views here.
from django.forms import BaseModelForm
from django.shortcuts import render, redirect
from .models import User, Shift, Post
from django.views import View
from django.views.generic import  CreateView, TemplateView,ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.views import LoginView as BaseLoginView, LogoutView as BaseLogoutView, PasswordChangeView, PasswordChangeDoneView
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
    success_url = reverse_lazy("accounts:registar")


# ログインビューを作成
class LoginView(BaseLoginView):
    form_class = LoginFrom
    template_name = "accounts/login.html"


class LogoutView(BaseLogoutView):
    success_url = reverse_lazy("index")


class PasswordChange(LoginRequiredMixin, PasswordChangeView):
    """パスワード変更ビュー"""
    success_url = reverse_lazy('accounts:password_change_done')
    template_name = 'accounts/password_change.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs) # 継承元のメソッドCALL
        context["form_name"] = "password_change"
        return context
    

class PasswordChangeDone(LoginRequiredMixin,PasswordChangeDoneView):
    """パスワード変更完了"""
    template_name = 'accounts/password_change_done.html'



class ProfileView(LoginRequiredMixin, ListView):
    model = get_user_model()
    template_name = "profile.html"
    context_object_name = "accounts"
    paginate_by = 20  # 1ページあたりの表示数

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_accounts'] = self.model.objects.count()
        return context


class Create_shiftView(View, LoginRequiredMixin):
    def get(self, request, *args, **kwargs):
        shifts = Shift.objects.all()
        shift_data = {shift.date.strftime('%Y-%m-%d'): {'shift_type': shift.shift_type} for shift in shifts}
        return render(request, 'create_shift.html', {'shift_data': json.dumps(shift_data)})


class ShiftView(TemplateView, LoginRequiredMixin):
    template_name = "shift.html"


class TableView(TemplateView, LoginRequiredMixin):
    # template_name = "table.html"
    def get(self, request, *args, **kwargs):
        shifts = Shift.objects.all()
        shift_data = {shift.date.strftime('%Y-%m-%d'): {'shift_type': shift.shift_type} for shift in shifts}
        return render(request, 'table.html', {'shift_data': json.dumps(shift_data)})


class BoardView(ListView, LoginRequiredMixin):
    model = Post
    template_name = "board.html"


class CreatePostView(CreateView, LoginRequiredMixin):
    model = Post
    form_class = PostForm
    template_name = "create_post.html"
    # fields = ['title','message']
    success_url = reverse_lazy("accounts:board")

@csrf_exempt 
def shift_edit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            shift_date = data['date']
            shift_type = data['shift_type']
            user_id = data['user_id']

            print(f"Received data for admin edit: {data}")
            
            try:
                shift_date = datetime.datetime.strptime(shift_date, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'Invalid date format'}, status=400)


            shift_instance = Shift.objects.filter(date=shift_date).first() #同じ日付とユーザーのシフトが存在するか確認
            print(f"shift_instance :{shift_instance}")
            shift_instance.shift_type = shift_type
            print(f"既存のシフトを更新: {shift_instance}")

            shift_instance.save()

            return JsonResponse({'status': 'success'})
        except Exception as e:
            print(f"Error: {str(e)}")  # コンソールにエラーメッセージを表示
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

    
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

            # shift_instance = Shift(user=user,date=shift_date, shift_type=shift_type)

            shift_instance = Shift.objects.filter(user=user, date=shift_date).first() #同じ日付とユーザーのシフトが存在するか確認

            if shift_instance:
                shift_instance.shift_type = shift_type
                print(f"既存のシフトを更新: {shift_instance}")
            else:
                shift_instance = Shift(user=user, date=shift_date, shift_type=shift_type)
                print(f"新しいシフトを作成: {shift_instance}")

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
            accounts = User.objects.exclude(account_id='0000').order_by('account_id').values('account_id', 'first_name')
    return JsonResponse({'accounts': list(accounts)})






