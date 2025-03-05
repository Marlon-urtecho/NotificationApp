from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, RecordatorioViewSet, UserViewSet, SucursalViewSet, RecordatorioListView,SucursalListCreateView, SucursalRetrieveUpdateDestroyView
from . import views  # Importa views aquí
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'recordatorios', RecordatorioViewSet)

urlpatterns = [
     # Rutas de autenticación JWT
    # Para obtener el token de acceso y refresco
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Para refrescar el token de acceso
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('', include(router.urls)),
    path('api/recordatorios/', RecordatorioListView.as_view(), name='recordatorio-list'),
    path('bot/', views.bot, name='bot'), 
    path('enviar-bienvenida/', views.enviar_bienvenida, name='enviar_bienvenida'),
    path('list_Clientes/', views.list_Clientes, name='list_Clientes'),
    path('sucursales/', SucursalListCreateView.as_view(), name='sucursal-list-create'),
    path('users/', SucursalListCreateView.as_view(), name='sucursal-list-create'),
    path('sucursales/<int:pk>/', SucursalRetrieveUpdateDestroyView.as_view(), name='sucursal-retrieve-update-destroy'),
    path('api/users/', views.list_users, name='list_users'),  # Listar usuarios
    path('api/users/', views.create_user, name='create_user'),  # Crear usuario
    path('api/users/<int:id>/', views.update_user, name='update_user'),  # Actualizar usuario
    path('api/users/<int:id>/', views.delete_user, name='delete_user'),  # Eliminar usuario
    path('api/importar-clientes/', views.importar_clientes, name='importar_clientes'),
    path('api/importar_clientes_desde_b2/', views.importar_clientes_desde_b2, name='importar_clientes_desde_b2'),

    
]

