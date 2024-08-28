from urllib import request

from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from oauth2_provider.models import RefreshToken
from oauth2_provider.views import TokenView
from rest_framework import generics, viewsets, parsers, permissions, generics, status
from .models import *
from django.http import HttpResponse, JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from rest_framework.generics import get_object_or_404
from django.core.mail import send_mail
import datetime
import json
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from . import serializers, perms, paginators, mixins, dao
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CoverImageUpdateSerializer


# chỉnh thành ModelViewset
class UserViewSet(viewsets.ViewSet,
                  generics.CreateAPIView,
                  generics.UpdateAPIView,
                  generics.DestroyAPIView,
                  generics.RetrieveAPIView,
                  mixins.FriendRequestMixin):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserDetailSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    permission_classes = [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.UserDetailSerializer
        return self.serializer_class

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response(self.get_serializer(self.get_object()).data, status=status.HTTP_200_OK)

    def check_username(request):
        username = request.GET.get('username', None)
        exists = User.objects.filter(username=username).exists()
        return JsonResponse({'exists': exists})

    def check_email(request):
        email = request.GET.get('email', None)
        exists = User.objects.filter(email=email).exists()
        return JsonResponse({'exists': exists})

    def get_permissions(self):
        if self.action in ['get_list_posts', 'list_posts', 'update_cover_image']:
            return [permissions.IsAuthenticated()]
        if self.action in ['destroy', "add_posts"]:
            return [perms.IsOwner()]
        if self.action in ['add_surveys', 'destroy']:
            return [permissions.IsAdminUser()]
        return self.permission_classes

    @action(methods=['get'], url_path='current_user', url_name='current_user', detail=False)
    def current_user(self, request):
        return Response(self.get_serializer(request.user).data, status=status.HTTP_200_OK)

    # API lấy profile của cựu sv
    @action(methods=['get'], detail=True, url_path='profile')
    def profile(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # hàm update mk
    @action(methods=['post'], url_path='change_password', detail=True)
    def change_password(self, request, pk):
        password_serializer = serializers.PasswordSerializer(data=request.data)
        if password_serializer.is_valid():
            if not request.user.check_password(password_serializer.old_password):
                return Response({'message': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
            # set new password
            request.user.set_password(password_serializer.new_password)
            request.user.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='create_posts')
    def create_posts(self, request):
        post = Post.objects.create(user=request.user, content=request.data.get('content'))
        for image in request.data.getlist('images'):
            Image.objects.create(post=post, image=image)

        return Response(serializers.PostSerializer(post).data, status=status.HTTP_201_CREATED)

    # lấy tất cả bài đăng từ users được gui thông qua {id}
    # chỉnh detail = True khi muoon nhập {id}
    @action(methods=['get'], detail=False, url_path='list_posts')
    def user_list_posts(self, request):
        user = request.user
        posts = Post.objects.filter(user=user).order_by('id')
        serializer = serializers.PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(methods=['GET'], detail=False, url_path='search')
    def search(self, request):
        users = dao.search_people(params=request.GET)

        return Response(serializers.UserInteractionSerializer(users, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, url_path='forget_password')
    def forget_password(self, request):
        serializer = serializers.ForgetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data.get('email')
            user = get_object_or_404(User, email=email)
            password = mixins.ForgetPasswordMixin().change_random_password(email=email, instance=user)
            send_mail(
                'CẤP MẬT KHẨU MỚI',
                f'Mật khẩu mới của bạn là {password}. \n\n Vui lòng thay đổi mật khẩu. ',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostViewSet(viewsets.ViewSet,

                  generics.ListAPIView,
                  generics.UpdateAPIView,
                  generics.RetrieveAPIView,
                  generics.DestroyAPIView):
    queryset = Post.objects.filter(active=True).all()
    serializer_class = serializers.PostSerializer
    permission_classes = [permissions.AllowAny()]
    pagination_class = paginators.PostPaginator

    def get_permissions(self):
        # if self.action in ['update', 'block_comments_post']:
        #     return [perms.IsOwner()]
        if self.action.__eq__('destroy'):
            return [perms.PostOwner() or permissions.IsAdminUser()]
        if self.action in ['add_comments', 'react_posts', 'create', 'list_newest_posts']:
            return [permissions.IsAuthenticated()]
        if self.action.__eq__('partial_update'):
            return [perms.PostOwner()]
        return self.permission_classes

    # tạo hàm để lấy toàn bộ bài viết( đc set active = true) của user đó theo thứ tự ngày đăng bào giảm dần
    def get_queryset(self):
        queries = self.queryset
        q = self.request.query_params.get("userId")
        if q:
            user = User.objects.get(pk=q)
            if user:
                queries = user.post_set.filter(active=True).order_by('-created_date').all()
        return queries


    def create(self, request, *args, **kwargs):
        data = request.data.copy()  # Copy the request data
        user = request.user
        # Tạo post trước
        post_data = {
            'content': data.get('content'),
            'user': user,
            'comment_blocked': data.get('comment_blocked', False)
        }
        post = Post.objects.create(**post_data)

        # Thêm hình ảnh vào bài viết
        images = request.FILES.getlist('images')
        for image in images:
            Image.objects.create(post=post, image=image)

        # Thêm video vào bài viết
        videos = request.FILES.getlist('videos')
        for video in videos:
            Video.objects.create(post=post, video=video)

        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # lấy bài viết ngẫu nhiên khi vừa mở MXH
    @action(methods=['get'], detail=False, url_path="list-newest-posts")
    def list_newest_posts(self, request):
        posts = self.queryset.order_by('-created_date').all()
        result_page = self.paginate_queryset(posts)
        serializer = self.serializer_class(result_page, many=True, context={'request': request})
        response = self.get_paginated_response(serializer.data)
        return response

    @action(methods=['post'], detail=True, url_path='comments')
    def add_comments(self, request, pk):
        # comment từ phương thức post sẽ đc gán cho truong comment của model Comment
        c = Comment.objects.create(user=request.user, post=self.get_object(), comment=request.data.get('comment'))
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    # thả react cho bài viết, nhập type = 1/2/3/4 để thả
    # @action(methods=['post'], detail=True, url_path='reacts')
    # def react_posts(self, request, pk):
    #     type = int(request.data.get('type'))
    #     reaction, created = Reaction.objects.get_or_create(user=request.user, post=self.get_object(),
    #                                                        type=type)
    #     # Kiểm tra xem type có hợp lệ không
    #     if type not in [reaction_type.value for reaction_type in Reaction.ReactionTypes]:
    #         return Response({"detail": "Invalid reaction type."}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     if not created:
    #         reaction.active = not reaction.active
    #         reaction.save()
    #     post_detail_serializer = self.get_serializer(self.get_object(), context={'request': request})
    #     return Response(post_detail_serializer.data, status=status.HTTP_204_NO_CONTENT)

    @action(methods=['post'], detail=True, url_path='reacts')
    def react_posts(self, request, pk):
        type = int(request.data.get('type'))

        # Kiểm tra xem type có hợp lệ không
        if type not in [reaction_type.value for reaction_type in Reaction.ReactionTypes]:
            return Response({"detail": "Invalid reaction type."}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy bài viết hiện tại
        post = self.get_object()

        # Kiểm tra xem người dùng đã có phản ứng với bài viết chưa
        try:
            reaction = Reaction.objects.get(user=request.user, post=post)

            # Nếu đã có phản ứng với type hiện tại
            if reaction.type == type:
                # Chuyển đổi trạng thái active
                reaction.active = not reaction.active
                reaction.save()
            else:
                # Nếu type khác, cập nhật loại phản ứng
                reaction.type = type
                reaction.active = True
                reaction.save()
        except Reaction.DoesNotExist:
            # Nếu chưa có phản ứng, tạo mới
            Reaction.objects.create(user=request.user, post=post, type=type)

        # Serializer để trả về dữ liệu cập nhật
        post_detail_serializer = self.get_serializer(post, context={'request': request})
        return Response(post_detail_serializer.data, status=status.HTTP_200_OK)

    # mở danh sách comment của bài viết
    @action(methods=['get'], detail=True)
    def list_comments(self, request, pk):
        comments = Comment.objects.filter(post=pk)
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)


class CommentViewSet(viewsets.ViewSet,
                     generics.ListAPIView,
                     generics.CreateAPIView,
                     generics.UpdateAPIView,
                     generics.DestroyAPIView):
    queryset = Comment.objects.filter(active=True).all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [permissions.AllowAny()]

    # permission_classes = [perms.IsOwner]

    def get_permissions(self):
        if self.action.__eq__('destroy'):
            return [perms.IsCommentAuthorOrPostAuthor()]
        return self.permission_classes
