from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import routers
from . import views


r = routers.DefaultRouter()
r.register('users', views.UserViewSet, basename='users')
r.register('posts', views.PostViewSet, basename='posts')
r.register('reacts', views.ReactionViewSet, basename='reacts')
r.register('comments', views.CommentViewSet, basename='comments')
r.register('petpost', views.PetPostViewSet, basename='petposts')
r.register('categories', views.CategoryViewSet, basename='categories')
r.register('topics', views.TopicViewSet, basename='topics')
r.register('report', views.PostReportViewSet, basename='report')

# r.register('notifications', views.NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(r.urls)),
    # path('login/', views.LoginView.as_view(), name='login'),
    # path('register/', views.RegisterView.as_view(), name='register'),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('accounts/', include('allauth.urls')),  # URL cho các endpoint của allauth

]
