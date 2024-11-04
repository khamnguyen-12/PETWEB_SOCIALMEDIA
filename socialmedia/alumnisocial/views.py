from urllib import request

from django.contrib.sites import requests
from django.core.exceptions import PermissionDenied
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
# from google.oauth2.credentials.Credentials import id_token
from oauth2_provider.models import RefreshToken
from oauth2_provider.views import TokenView
from rest_framework import generics, viewsets, parsers, permissions, generics, status
from rest_framework.exceptions import NotFound

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
from .serializers import CoverImageUpdateSerializer, CommentSerializer, UserInteractionSerializer
from .utils import generate_access_token
from google.oauth2 import id_token
from google.auth.transport import requests  # Đảm bảo rằng bạn đã import requests


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

    def list(self, request, *args, **kwargs):
        """
        API để lấy danh sách tất cả user sắp xếp theo created_date mới nhất.
        """
        users = self.get_queryset().filter(active=True).order_by('-created_date')  # Sắp xếp theo thứ tự mới nhất
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        email = request.data.get('email', None)

        if email:
            try:
                user = User.objects.get(email=email)
                return Response({
                    "exists": True,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                })
            except User.DoesNotExist:
                return Response({"exists": False})

        return Response({"error": "Email not provided"}, status=400)

    def get_permissions(self):
        if self.action in ['get_list_posts', 'list_posts', 'update_cover_image']:
            return [permissions.IsAuthenticated()]
        if self.action in ['destroy', "add_posts"]:
            return [perms.IsOwner()]
        if self.action in ['add_surveys', 'destroy', 'list', 'deactivate_user']:
            return [permissions.IsAdminUser()]
        return self.permission_classes

    @action(detail=False, methods=['get'], url_path='moderators')
    def list_moderators(self, request):
        moderators = User.objects.filter(role=User.Role.MODERATOR)
        serializer = self.serializer_class(moderators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    @action(methods=['get'], detail=False, url_path='list_posts')
    def list_posts(self, request):
        user = request.user
        posts = Post.objects.filter(user=user).order_by('id')
        serializer = serializers.PostSerializer(posts, many=True, context={'request': request})
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

    @action(detail=True, methods=['patch'], url_path='deactivate', permission_classes=[permissions.IsAdminUser])
    def deactivate_user(self, request, pk=None):
        try:
            user = self.get_object()  # Lấy đối tượng user dựa trên pk
            user.active = False  # Đặt trường active thành False
            user.save()  # Lưu thay đổi
            return Response({"message": "User has been deactivated."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Tích hợp API đăng nhập Google trong UserViewSet
    @action(methods=['POST'], detail=False, url_path='login-google')
    def login_google(self, request):
        token_id = request.data.get("tokenId")
        access_token = request.data.get("accessToken")

        if not token_id or not access_token:
            return Response({"error": "Token ID and Access Token are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Xác thực token từ Google
            request_session = requests.Request()
            id_info = id_token.verify_oauth2_token(token_id, request_session)

            email = id_info.get("email")
            first_name = id_info.get("given_name")
            last_name = id_info.get("family_name")
            avatar_url = id_info.get("picture")

            user, created = User.objects.get_or_create(email=email, defaults={
                'first_name': first_name,
                'last_name': last_name,
                'username': email.split('@')[0],
            })

            if created:
                user.avatar = avatar_url
                user.save()

            # Tạo access token
            access_token = generate_access_token(user)

            return Response({
                "user": self.get_serializer(user).data,
                "access_token": access_token  # Trả về access token cho frontend
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

    # Phương thức kiểm tra email
    from django.contrib.auth import authenticate

    @action(detail=False, methods=['post'], url_path='check-email')
    def check_email(self, request):
        email = request.data.get('email')
        password = request.data.get('password')  # Lấy password từ request (nếu cần kiểm tra)

        if not email:
            return Response({"detail": "Email không được để trống."}, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({"detail": "Password không được để trống."}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem email có tồn tại trong CSDL hay không
        user = User.objects.filter(email=email).first()

        if user:
            # Kiểm tra mật khẩu thông qua hàm authenticate của Django
            user_auth = authenticate(username=user.username, password=password)
            if user_auth:
                return Response({
                    "exists": True,
                    "detail": "Email và mật khẩu hợp lệ.",
                    "username": user.username  # Trả về username của user
                }, status=status.HTTP_200_OK)
            else:
                return Response({"exists": True, "detail": "Mật khẩu không đúng."}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"exists": False, "detail": "Email chưa tồn tại."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='update-avatar')
    def update_avatar(self, request, pk=None):
        """
        Cập nhật avatar của người dùng.
        """
        try:
            user = self.get_object()  # Lấy người dùng theo ID
            serializer = self.get_serializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()  # Lưu thay đổi
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.UpdateAPIView,
                  generics.RetrieveAPIView,
                  generics.DestroyAPIView):
    queryset = Post.objects.filter(active=True).all()
    serializer_class = serializers.PostSerializer
    permission_classes = [permissions.IsAuthenticated()]
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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({
            'request': self.request,  # Truyền request vào context
        })
        return context

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
    permission_classes = [permissions.IsAuthenticated()]

    # permission_classes = [perms.IsOwner]

    def get_permissions(self):
        if self.action.__eq__('destroy'):
            return [perms.IsCommentAuthorOrPostAuthor()]
        return self.permission_classes

    def create(self, request, *args, **kwargs):
        post_id = self.kwargs.get('post_id')  # Lấy post_id từ URL
        # Kiểm tra xem bài viết có tồn tại không
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFound('Bài viết không tồn tại')

        data = request.data.copy()
        data['user'] = request.user.id  # Gán người dùng hiện tại là tác giả bình luận
        data['post'] = post.id  # Gán post_id từ URL vào dữ liệu

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='list-comments')
    def list_comments(self, request, pk=None):
        """API để lấy danh sách comment của bài viết theo id (pk là id của bài viết)"""
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Lấy tất cả comment của bài viết
        comments = Comment.objects.filter(post=post, active=True)

        # Serialize dữ liệu comment
        serializer = CommentSerializer(comments, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-comment')
    def add_comment(self, request, pk=None):
        # Kiểm tra xem bài viết có tồn tại không
        try:
            post = Post.objects.get(id=pk)
        except Post.DoesNotExist:
            return Response({'error': 'Bài viết không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        # Chuẩn bị dữ liệu cho serializer, bỏ qua 'user' trong request.data
        data = request.data.copy()
        data['post'] = post.id  # Gán post_id từ URL vào dữ liệu

        # Tạo serializer mà không truyền 'user' trực tiếp trong request data
        serializer = self.serializer_class(data=data)

        # Kiểm tra tính hợp lệ của dữ liệu
        if serializer.is_valid():
            # Lưu bình luận với người dùng từ `request.user`
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='delete-comment')
    def delete(self, request, pk=None):
        try:
            comment = Comment.objects.get(id=pk)
            # Kiểm tra xem người dùng có quyền sửa đổi comment này không
            if comment.user != request.user:
                return Response({'error': 'Bạn không có quyền thực hiện thao tác này'},
                                status=status.HTTP_403_FORBIDDEN)

            comment.active = False
            comment.save()
            return Response({'status': 'Comment đã bị ẩn'}, status=status.HTTP_200_OK)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


class ReactionViewSet(viewsets.ModelViewSet):
    queryset = Reaction.objects.all()
    serializer_class = serializers.ReactionSerializer

    # API lấy danh sách các phản ứng của mỗi bài viết
    def list_reactions_by_post(self, request, post_id=None):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=404)

        reactions = Reaction.objects.filter(post=post)
        serializer = self.get_serializer(reactions, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        return Category.objects.filter(active=True)

    @action(detail=True, methods=['patch'], url_path='update-name')
    def update_name(self, request, pk=None):
        # Lấy category dựa trên pk (primary key)
        category = self.get_object()

        # Lấy tên mới từ request data
        new_name = request.data.get('name')

        if new_name:
            # Cập nhật tên và lưu lại
            category.name = new_name
            category.save()

            # Trả về phản hồi thành công
            return Response({
                'success': True,
                'message': 'Category name updated successfully',
                'data': serializers.CategorySerializer(category).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Name field is required'
            }, status=status.HTTP_400_BAD_REQUEST)

    # Custom PATCH method to set 'active' to False
    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        try:
            category = self.get_object()
            category.active = False
            category.save()
            return Response({'status': 'Category deactivated successfully'}, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = serializers.TopicSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        return Topic.objects.filter(active=True)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        try:
            topic = self.get_object()
            topic.active = False
            topic.save()
            return Response({'status': 'Topic deactivated successfully'}, status=status.HTTP_200_OK)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)


class PetPostViewSet(viewsets.ModelViewSet):
    queryset = PetPost.objects.all()
    serializer_class = serializers.PetPostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the author to the current user if they are a MODERATOR
        if self.request.user.role == User.Role.MODERATOR:
            serializer.save(author=self.request.user)
        else:
            raise PermissionDenied("Only Moderators can create posts.")

    def get_queryset(self):
        return PetPost.objects.filter(active=True)

    @action(detail=True, methods=['patch'], url_path='deactive-petpost')
    def deactivate(self, request, pk=None):
        try:
            pet_post = self.get_object()
            pet_post.active = False
            pet_post.save()
            return Response("PetPost deactivated successfully", status=status.HTTP_200_OK)
        except PetPost.DoesNotExist:
            return Response({"error": "PetPost not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='topic/(?P<topic_id>[^/.]+)')
    def list_by_topic(self, request, topic_id=None):
        """
        Lọc và trả về danh sách PetPost theo topic_id, bao gồm cả số lượng PetPost.
        """
        try:
            # Tìm Topic theo topic_id
            topic = Topic.objects.get(pk=topic_id)
            # Lọc các PetPost thuộc Topic này với active=True
            pet_posts = PetPost.objects.filter(topic=topic, active=True)
            # Đếm số lượng PetPost
            post_count = pet_posts.count()
            # Serialize danh sách PetPost
            serializer = self.get_serializer(pet_posts, many=True)

            # Định dạng dữ liệu phản hồi với post_count và danh sách PetPost
            response_data = {
                'topic': {
                    'id': topic.id,
                    'name': topic.name
                },
                'post_count': post_count,
                'posts': serializer.data
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except Topic.DoesNotExist:
            return Response({"error": "Topic not found"}, status=status.HTTP_404_NOT_FOUND)


class PostReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = serializers.PostReportSerializer

    def get_permissions(self):
        if self.action in ['create']:  # Người dùng có thể tạo và xem danh sách báo cáo
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update',
                             'destroy', 'list']:  # Chỉ quản lý (MODERATOR) có thể cập nhật trạng thái báo cáo
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Gán người dùng hiện tại làm người báo cáo
        serializer.save(reporter=self.request.user)

    def perform_update(self, serializer):
        # Gán người quản lý hiện tại là người xem xét báo cáo
        serializer.save(reviewed_by=self.request.user)

    # Thêm action riêng để người dùng báo cáo bài viết
    @action(detail=True, methods=['post'], url_path='report-post')
    def report_post(self, request, pk=None):
        """
        API action riêng để người dùng báo cáo bài viết.
        """
        try:
            # Lấy bài viết được báo cáo dựa trên pk
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Bài viết không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        # Tạo một báo cáo bài viết mới
        serializer = serializers.PostReportSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            # Lưu báo cáo và gán người báo cáo là người dùng hiện tại
            serializer.save(reporter=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        report = self.get_object()  # Lấy đối tượng Report cần cập nhật
        if 'status_report' not in request.data:
            return Response({"detail": "status_report is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Cập nhật status_report và lưu
        report.status_report = request.data['status_report']
        report.reviewed_by = request.user  # Gán người quản lý hiện tại là người đã xử lý báo cáo
        report.save()

        serializer = self.get_serializer(report)
        return Response(serializer.data)
