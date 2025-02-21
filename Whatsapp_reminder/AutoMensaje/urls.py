from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, RecordatorioViewSet, UserViewSet, SucursalViewSet, RecordatorioListView, bot, SucursalListCreateView, SucursalRetrieveUpdateDestroyView, ejecutar_tareas_view
from . import views  # Importa views aquí
from rest_framework_simplejwt import views as jwt_views
from .views import obtener_recordatorios
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sucursales', SucursalViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'recordatorios', RecordatorioViewSet)



urlpatterns = [
     # Rutas de autenticación JWT
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('', include(router.urls)),
    path('programar_recordatorios/', views.programar_recordatorios_view, name='programar_recordatorios'),  # Accede a views
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
    path('AutoMensaje/v1/api/ejecutar-tareas/', views.ejecutar_tareas, name='ejecutar_tareas'),
    path('AutoMensaje/v1/api/recordatorios/', obtener_recordatorios, name='recordatorios'),
    path('api/ejecutar-tareas-nueva/', views.ejecutar_tareas_nueva, name='ejecutar_tareas_nueva'),
    path('api/importar-clientes/', views.importar_clientes, name='importar_clientes'),
    path('api/importar_clientes_desde_b2/', views.importar_clientes_desde_b2, name='importar_clientes_desde_b2'),

    
]

