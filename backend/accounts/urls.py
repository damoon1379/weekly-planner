from django.urls import path
from .views import RegisterView,LogoutView,csrf_token_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("csrf/", csrf_token_view, name="csrf-token"),
]
