# import pdb

from rest_framework import serializers

from .models import *




# đã khóa hàm tạo tk, và ẩn password ở UserSerializer
class UserDetailSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    cover_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'avatar', 'cover_image', 'username', 'role',
                  'password', 'gender', 'date_of_birth', 'note']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }

    # hàm tạo tk đã băm mk
    def create(self, validated_data):
        #băm password
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()
        return user


class UserInteractionSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']


class CoverImageUpdateSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ['cover_image']


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = Image
        fields = ['image']

class VideoSerializer(serializers.ModelSerializer):
    video = serializers.URLField(source='video.url', read_only=True)

    class Meta:
        model = Video
        fields = ['video']


class PostSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, required=False)
    videos = VideoSerializer(many=True, required=False)
    reacted = serializers.SerializerMethodField()  # Thêm trường reacted
    user = UserDetailSerializer()
    userReactType = serializers.SerializerMethodField()  # Thêm trường cho react của user hiện tại

    class Meta:
        model = Post
        fields = ['id', 'content', 'images', 'comment_blocked', 'created_date', 'updated_date',
                  'videos', 'reacted', 'user', 'userReactType']

    def get_reacted(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            reaction = Reaction.objects.filter(post=obj, user=user, active=True).first()
            if reaction:
                return reaction.type
        return None

    def get_userReactType(self, obj):
        # Lấy thông tin của user đang đăng nhập từ request
        user = self.context['request'].user
        if user.is_authenticated:
            # Tìm phản hồi của người dùng cho bài viết hiện tại
            reaction = Reaction.objects.filter(user=user, post=obj).first()
            if reaction:
                return reaction.type  # Trả về type của react (1: Like, 2: Haha, 3: Love, ...)
        return None  # Trả về None nếu user chưa react


# thiếu fields 'shared_post'
class PostDetailSerializer(PostSerializer):
    reacted = serializers.SerializerMethodField()

    def get_reacted(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return post.reaction_set.filter(active=True).exists()

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['reacted']


class CommentSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'comment', 'post', 'user', 'created_date']
        read_only_fields = ['id', 'created_date', 'user']


class ReactionSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()

    class Meta:
        model = Reaction
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class TopicSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category')

    class Meta:
        model = Topic
        fields = ['id', 'name', 'category', 'category_id']


class PetPostSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), source='topic')

    class Meta:
        model = PetPost
        fields = ['id', 'title', 'content', 'topic', 'topic_id']

    def validate_author(self, value):
        if value.role != User.Role.MODERATOR:
            raise serializers.ValidationError("Only Moderators can create posts.")
        return value


class PostReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.ReadOnlyField(source='reporter.username')
    post_title = serializers.ReadOnlyField(source='post.title')
    status_display = serializers.CharField(source='get_status_report_display', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_username', 'post', 'post_title', 'reason', 'status_report', 'status_display', 'reviewed_by', 'created_date']
        read_only_fields = ['id', 'reporter', 'reporter_username', 'post', 'post_title', 'status_display', 'reviewed_by', 'created_date']

    def create(self, validated_data):
        # Gán tự động người dùng làm người báo cáo
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

