"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 5.0.7.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import dj_database_url
# 追加
import os
import environ
from decouple import config
from dj_database_url import parse as dburl


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/



SUPERUSER_ACCOUNT_ID = env("SUPERUSER_ACCOUNT_ID")
SUPERUSER_LAST_NAME = env("SUPERUSER_LAST_NAME")
SUPERUSER_FIRST_NAME = env("SUPERUSER_FIRST_NAME")
SUPERUSER_PASSWORD = env("SUPERUSER_PASSWORD")
SECRET_KEY = env('SECRET_KEY')



DEBUG = True


ALLOWED_HOSTS = ['127.0.0.1', 'django-render-1no8.onrender.com']
# ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
]

AUTH_USER_MODEL = "accounts.User"

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', #追加
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        #'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'




#追加
default_dburl = "sqlite:///" + str(BASE_DIR / "db.sqlite3")
DATABASES = {
    "default": config("DATABASE_URL", 
                      default=default_dburl, 
                      cast=dburl),
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_TZ = True



STATIC_URL = '/static/'
STATIC_ROOT = str(BASE_DIR / "staticfiles")
STATICFILES_DIRS = [
    BASE_DIR / 'static'
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'index' #ログインが必要なページに承認していないユーザーがアクセスした場合にredirectされるURL
LOGIN_REDIRECT_URL = "accounts:table"  #ログインごのredirectのURL
LOGOUT_REDIRECT_URL = "accounts:login" #ログアウト後のredirectのURL

# セッションが有効な時間を指定（ここでは30分）
SESSION_COOKIE_AGE = 30 * 60  # 30分
SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # ブラウザを閉じたらログアウト

