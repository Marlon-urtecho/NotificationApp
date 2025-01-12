from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, RecordatorioViewSet
from . import views
from .views import RecordatorioListView

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'recordatorios', RecordatorioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('programar_recordatorios/', views.programar_recordatorios_view, name='programar_recordatorios'),
    path('api/recordatorios/', RecordatorioListView.as_view(), name='recordatorio-list'),
]

