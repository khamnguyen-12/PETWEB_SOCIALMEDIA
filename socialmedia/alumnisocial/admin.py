from datetime import datetime
from django.contrib import admin
from django.contrib.auth.decorators import permission_required
from django.template.response import TemplateResponse
from django.urls import path
# from rest_framework import permissions
from . import dao
from .models import *
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear


# from alumnisocial.models import FriendShip, Group, AlumniProfile
# from ckeditor.widgets import CKEditorWidget
# from rest_framework import serializers

class SocialNetworkAppAdminSite(admin.AdminSite):
    site_header = 'AlumniSocialNetwork'

    def get_urls(self):
        return [
            path('stats/', self.stats_view),
            # path('survey_stats/', self.survey_stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        # Tổng số bài đăng

        return TemplateResponse(request, 'admin/stats.html', context)

    def survey_stats_view(self, request):
        survey_id = request.POST.get('survey_id')
        statistic_data = dao.stats_survey(survey_id)

        return TemplateResponse(request, 'admin/survey_stats.html',
                                {'survey': statistic_data['survey'],
                                 'text_questions': statistic_data['text_questions'],
                                 'mcq_counts': statistic_data['multiple_choice_question_counts']})


admin.site = SocialNetworkAppAdminSite(name='mysocialmediaapp')


class AlumniAdmin(admin.ModelAdmin):
    search_fields = ['student_id']


class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'role', 'is_active']
    search_fields = ['username']
    list_filter = ['role', 'username', 'first_name', ]
    # inlines = [AlumniProfileInlineAdmin, ]
    # actions = [reset_password_change_time, confirm_student]


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class ImagesInlineAdmin(admin.StackedInline):
    model = Image


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_date', 'active', 'content', 'user']
    inlines = [ImagesInlineAdmin, ]
    form = PostForm

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)





