import jwt
from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                # Tách token từ header Authorization: Bearer <token>
                token = auth_header.split(' ')[1]
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                request.user_id = decoded_token['user_id']
            except (jwt.ExpiredSignatureError, jwt.DecodeError):
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        return None
