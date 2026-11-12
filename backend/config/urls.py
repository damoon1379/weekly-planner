from django.contrib import admin
from django.urls import path, include
from accounts.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
)

from drf_spectacular.views import (
SpectacularAPIView,
SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('planner.urls')),
    path('api/', include('accounts.urls')),

    path('api/token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),

    path('api/schema/',
         SpectacularAPIView.as_view(),
         name='schema'),
    path('api/docs/',
         SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui',
        ),
  
]
