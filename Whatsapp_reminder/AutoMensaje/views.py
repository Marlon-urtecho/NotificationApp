from rest_framework import viewsets
from .models import Cliente, Recordatorio
from .serializers import ClienteSerializer, RecordatorioSerializer
from django.http import HttpResponse
from .tasks import programar_recordatorios


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