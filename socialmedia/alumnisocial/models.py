
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.conf import settings
from ckeditor.fields import RichTextField
from ckeditor_uploader.fields import RichTextUploadingField
from django.db.models import Count
from django.contrib.auth.models import User
from bs4 import BeautifulSoup
from django.utils import timezone
from pyasn1_modules.rfc3739 import Gender


class User(AbstractUser):
    class Gender(models.IntegerChoices):
        MALE = 1, "Nam"
        FEMALE = 2, "Nữ"
        OTHER = 3, "Khác"

    class Role(models.IntegerChoices):
        USER = 1, "User"
        MODERATOR = 2, "Moderator"
        ADMIN = 3, "Admin"
    email = models.EmailField("email_address", unique=True, null=True)
    role = models.IntegerField(choices=Role.choices, default=Role.USER)
    avatar = CloudinaryField(null=True)
    cover_image = CloudinaryField(null=True)
    password_changed = models.BooleanField(default=False)
    note = RichTextField(null=True)
    gender = models.IntegerField(choices=Gender.choices, default=Gender.MALE)
    date_of_birth = models.DateField(null=True)



    def save(self, *args, **kwargs):
        if self.role in [User.Role.ADMIN, User.Role.MODERATOR]:
            self.is_staff = True
        else:
            self.is_staff = False
        super().save()


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True

class PostBaseModel(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_blocked = models.BooleanField(default=False)

    class Meta:
        abstract = True


class Post(PostBaseModel):
    content = RichTextUploadingField(null=True)


class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField(null=True)

class Video(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='videos')
    video = models.FileField(upload_to='videos/')

class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        abstract = True




class Reaction(Interaction):
    class ReactionTypes(models.IntegerChoices):
        LIKE = 1, "Like"
        HAHA = 2, "Haha"
        LOVE = 3, "Love"
        SAD = 4,  "Sad"
    active = models.BooleanField(default=True)
    type = models.IntegerField(choices=ReactionTypes, null=True)

    def __str__(self):
        return self.type.name

    class Meta:
        unique_together = ('user', 'post')


class Comment(Interaction):
    comment = models.TextField()


# Model cho Danh mục (Category)
class Category(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Model cho Topic, mỗi Topic thuộc một Danh mục
class Topic(BaseModel):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')

    def __str__(self):
        return self.name


# Model cho Bài viết (Post), kế thừa BaseModel, thuộc về một Topic và có tác giả là User với role Moderator
class PetPost(BaseModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': User.Role.MODERATOR}, related_name='moderator_posts')
    title = models.CharField(max_length=200)
    content = RichTextUploadingField(null=True)
    image = CloudinaryField('image', null=True, blank=True)  # Ảnh của bài viết

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_date']


class Report(BaseModel):
    class Status(models.IntegerChoices):
        PENDING = 1, "Chờ xử lý"
        RESOLVED = 2, "Đã giải quyết"
        REJECTED = 3, "Bị từ chối"

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    reason = models.TextField()  # Người dùng có thể nhập lý do báo cáo
    status_report = models.IntegerField(choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': User.Role.MODERATOR}, related_name='reports_reviewed')  # Người quản lý xem xét báo cáo

    def __str__(self):
        return f"Báo cáo bài đăng: {self.post.title} bởi {self.reporter.username}"

    class Meta:
        ordering = ['-created_date']  # Sắp xếp theo thời gian tạo báo cáo mới nhất

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.content}"

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def create_friend_request_notification(cls, sender, receiver):
        content = f"You have a friend request from {sender.first_name}."
        cls.objects.create(user=receiver, content=content)

    @classmethod
    def create_invitation_notification(cls, invitation):
        for user in invitation.recipients_users.all():
            content = f"You have an invitation: {invitation.title}"
            cls.objects.create(user=user, content=content)

        for group in invitation.recipients_groups.all():
            for user in group.members.all():
                content = f"You have an invitation from {invitation.sender.username}: {invitation.title}"
                cls.objects.create(user=user, content=content)

    @classmethod
    def mark_as_read(cls, notification_ids):
        cls.objects.filter(pk__in=notification_ids).update(is_read=True)


class FriendShip(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_sent')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_received')
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.sender} -> {self.receiver}'
