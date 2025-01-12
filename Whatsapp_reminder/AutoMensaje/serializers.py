from rest_framework import serializers
from .models import Cliente, Recordatorio

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class RecordatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recordatorio
        fields = ['cliente', 'mensaje', 'fecha_envio', 'enviado']
