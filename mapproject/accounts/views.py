from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('map:index')  # ログイン後にリダイレクト
        else:
            # ログイン失敗時にエラーメッセージを表示
            messages.error(request, 'ユーザー名またはパスワードが違います')
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']

            form.save()
            messages.success(request, 'アカウントが作成されました。ログインしてください。')
            return redirect('accounts:login')  # 登録後にログインページにリダイレクト
        else:
            username = form.data.get('username', '')  # フォームの入力値を取得（note!: もともとform.cleaned_data['username']を利用していたが、cleanedはvalid->trueのみ。）
            email = form.data.get('email', '')  # フォームの入力値を取得
            # ユーザー名とメールアドレスがすでに存在するかチェック
            username_exists = User.objects.filter(username=username).exists()
            email_exists = User.objects.filter(email=email).exists()

            if username_exists and email_exists:
                messages.error(request, 'そのユーザー名とメールアドレスはすでに使用されています。')
            elif username_exists:
                messages.error(request, 'そのユーザー名はすでに使用されています。')
            elif email_exists:
                messages.error(request, 'そのメールアドレスはすでに使用されています。')
            else:
                messages.error(request, 'フォームにエラーがあります。')

    else:
        form = CustomUserCreationForm()

    return render(request, 'accounts/register.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('accounts:login')  # ログアウト後にログインページにリダイレクト
