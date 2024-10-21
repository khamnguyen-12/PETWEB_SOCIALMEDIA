import jwt
from django.conf import settings
from datetime import datetime, timedelta


# def generate_access_token(user):
#     """Hàm tạo access token cho người dùng"""
#     token_payload = {
#         'user_id': user.id,
#         'username': user.username,
#         'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),  # Token hết hạn sau 24 giờ
#         'iat': datetime.datetime.utcnow(),  # Thời điểm phát hành token
#     }
#
#     token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')  # Tạo JWT với HS256 và SECRET_KEY của bạn
#
#     return token

def generate_access_token(user):
    token_payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=24),  # Thời hạn token
        'iat': datetime.utcnow(),  # Thời điểm phát hành token
    }
    token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')
    return token
