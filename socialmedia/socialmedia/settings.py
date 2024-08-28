import os
from pathlib import Path
import cloudinary
import cloudinary.uploader
import cloudinary.api

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-py$u8vu7%k56$3i!l=6iwp1-==$2he0iev+uq(t*p3gdxnw+by'

DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', '192.168.1.233', '172.20.10.6', 'localhost']
# https://kham77bd.pythonanywhere.com/

STATIC_URL = 'static/'
CKEDITOR_UPLOAD_PATH = ['image/', 'uploads/']

CKEDITOR_5_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'height': 300,
        'width': '100%',
        'config': {
            'language': 'en',
            'toolbarGroups': [
                {'name': 'basicstyles', 'groups': ['basicstyles', 'cleanup']},
                {'name': 'paragraph', 'groups': ['list', 'indent', 'blocks', 'align']},
                {'name': 'styles'},
                {'name': 'colors'},
                {'name': 'tools'}
            ],
        },
    },
}

import pymysql

pymysql.install_as_MySQLdb()

import cloudinary

cloudinary.config(
    cloud_name="dp2lb0arb",
    api_key="612688762958826",
    api_secret="xJIY4LPq6ughrJqkIsOI6c4-3SI"
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'alumnisocial.apps.AlumnisocialConfig',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider',
    'django.contrib.sites',  # Required for django-oauth-toolkit
    'corsheaders',

]

# REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
# lỏa
# OAUTH2_PROVIDER = {'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore'}


# OAuth2 Provider settings
# OAUTH2_PROVIDER = {
#     'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore',
#     'SCOPES': {'read': 'Read scope', 'write': 'Write scope'},
#     'ACCESS_TOKEN_EXPIRE_SECONDS': 36000,
#     'AUTHORIZATION_CODE_EXPIRE_SECONDS': 600,
#     'OIDC_ENABLED': False,
#     'GRANT_TYPES': ['authorization_code', 'password', 'client_credentials', 'refresh_token'],
# }



# MTien
OAUTH2_PROVIDER = {
    # 'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore',
    'SCOPES': {'read': 'Read scope', 'write': 'Write scope'},
    'ACCESS_TOKEN_EXPIRE_SECONDS': 36000,
    'AUTHORIZATION_CODE_EXPIRE_SECONDS': 600,
    'OIDC_ENABLED': False,
    'RESOURCE_SERVER_INTROSPECTION_URL': 'http://localhost:8000/o/token/',  # URL local server
    'RESOURCE_SERVER_AUTH_TOKEN': 'Bearer your_token',  # Token cho local server
    'RESOURCE_SERVER_INTROSPECTION_CREDENTIALS': ('client_id', 'client_secret'),
}


# Địa chỉ của site dùng trong django-oauth-toolkit, chỉ định nếu sử dụng `django.contrib.sites`
SITE_ID = 1

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'oauth2_provider.middleware.OAuth2TokenMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',

]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# Hoặc nếu bạn muốn cho phép tất cả các domain (không nên dùng trong môi trường production)
CORS_ALLOW_ALL_ORIGINS = True

AUTHENTICATION_BACKENDS = (
    'oauth2_provider.backends.OAuth2Backend',
    'django.contrib.auth.backends.ModelBackend',
)

ROOT_URLCONF = 'socialmedia.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'socialmedia.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'socialmediadb',
        'USER': 'root',
        'PASSWORD': '123456',
        'HOST': ''
    }
}

AUTH_USER_MODEL = 'alumnisocial.User'

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# MEDIA_ROOT = '%s/static/image' % BASE_DIR

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CLIENT_ID = 'Ap91RYqwPglTWPf40tX38kTvwSxUd7pkLT9u8N06'

CLIENT_SECRET = 'kHAcLZThhQzWKCPOhbxrAcvnoPytoEhr9kfnZ4wSZIvqCjpuStaILA4V8TSeGggBfqIpgoyMpB6rwT2x9qHsQd2IJ8iwkY2lqPTH6VFDbeoCGEDnTbptMoDz1NSOvBKG'

PASSWORD_LECTURER_DEFAULT = 'ou@123'

# import environ
#
# env = environ.Env()
# environ.Env.read_env()
#
# # Email
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_USE_TLS = True
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_HOST_USER = env("EMAIL_HOST_USER")
# EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
