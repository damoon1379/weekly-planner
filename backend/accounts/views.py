from django.conf import settings

from .serializers import UserRegistrationSerializer

from rest_framework_simplejwt.views import(TokenObtainPairView,TokenRefreshView)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({
        "csrfToken": get_token(request)
    })

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"Message": "user registered successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@method_decorator(csrf_protect, name="dispatch")
class CookieTokenObtainPairView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access=serializer.validated_data['access']
        refresh=serializer.validated_data['refresh']

        response = Response({'access':access},status=status.HTTP_200_OK)
        response.set_cookie(
            key='refresh_token',
            value=refresh,
            secure=not settings.DEBUG,
            httponly=True,
            samesite='None' if not settings.DEBUG else 'Lax',
            max_age=7*24*60*60,
        )
        return response

@method_decorator(csrf_protect, name="dispatch")
class CookieTokenRefreshView(TokenRefreshView):
    def post(self,request, *args, **kwargs):
        refresh_token=request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail":"refresh token not found"},
            status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = self.get_serializer(data={"refresh":refresh_token})
        
        try:
            serializer.is_valid(raise_exception=True)
        except(TokenError, InvalidToken):
            response = Response(
                {"detail":"Refresh token is invalid or expired"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie(
                key="refresh_token",
                samesite="None" if not settings.DEBUG else "Lax",
            )
            return response

        access = serializer.validated_data['access']

        return Response({"access":access},status=status.HTTP_200_OK)

@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    def post(self,request):
        refresh_token =  request.COOKIES.get("refresh_token")

        response = Response(
            {"detail":"Successfully logged out"},
            status=status.HTTP_200_OK
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()

            except Exception:
                pass

        response.delete_cookie(
            key='refresh_token',
            samesite='None' if not settings.DEBUG else 'Lax',
        )

        return response