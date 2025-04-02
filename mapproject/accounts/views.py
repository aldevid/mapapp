from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from .forms import CustomUserCreationForm, UserChangeForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache

@login_required
def change_user_info(request):
    if request.method == 'POST':
        form = UserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'ユーザー情報を更新しました。')
        else:
            messages.error(request, '入力に誤りがあります。')

    # ✅ hiddenで渡された `next` にリダイレクト（安全＆確実）
    next_url = request.POST.get('next', '/')
    return redirect(next_url)

@never_cache
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('map:default_map')
        else:
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
