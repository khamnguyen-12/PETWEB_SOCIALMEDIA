from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Alumni Social Network API",
        default_version='v1',
        description="APIs for Social Network",
        contact=openapi.Contact(email="2151053029kham@ou.edu.vn"),
        license=openapi.License(name="Khâm@2024"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny]
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('stats/', admin.site.stats_view),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('', include('alumnisocial.urls')),
    # path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('', TemplateView.as_view(template_name="home.html"), name='home'),

    re_path(r'^ckeditor', include('ckeditor_uploader.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),

]
