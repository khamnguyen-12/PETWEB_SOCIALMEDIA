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
# class VideoSerializer(serializers.ModelSerializer):
#     video = serializers.SerializerMethodField()
#
#     class Meta:
#         model = Video
#         fields = ['video']

class PostSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, required=False)
    videos = VideoSerializer(many=True, required=False)
    class Meta:
        model = Post
        fields = ['id', 'content', 'images', 'comment_blocked', 'created_date', 'updated_date', 'videos']


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
    user = UserInteractionSerializer()

    class Meta:
        model = Comment
        fields = '__all__'

class ReactionSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()

    class Meta:
        model = Reaction
        fields = '__all__'

#