from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente, Recordatorio, User, Sucursal
from .serializers import ClienteSerializer, RecordatorioSerializer, UserSerializer, SucursalSerializer
from django.http import HttpResponse
from .tasks import programar_recordatorios


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class RecordatorioViewSet(viewsets.ModelViewSet):
    queryset = Recordatorio.objects.all()
    serializer_class = RecordatorioSerializer
    
    
def programar_recordatorios_view(request):
    programar_recordatorios.apply_async()  # Ejecuta la tarea de forma asincrónica
    return HttpResponse("Recordatorios programados con éxito.")

class RecordatorioListView(APIView):
    def get(self, request, format=None):
        recordatorios = Recordatorio.objects.all()  # Aquí puedes filtrar según el estado, como pendientes/enviados
        serializer = RecordatorioSerializer(recordatorios, many=True)
        return Response({
            'recordatorios': serializer.data
        })