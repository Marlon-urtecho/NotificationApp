from rest_framework import serializers
from .models import Cliente, Recordatorio
from .models import User, Sucursal

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'phone_number', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']

class ClienteSerializer(serializers.ModelSerializer):
    sucursal = serializers.StringRelatedField()  # Asegúrate de que esto esté bien dependiendo de tu modelo

    class Meta:
        model = Cliente
        fields = '__all__'
        extra_kwargs = {
            'placa': {'required': False, 'allow_null': True},  # Permitir placa vacía
            'sucursal': {'required': False, 'allow_null': True},  # Permitir sucursal vacía
        }

class RecordatorioSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_telefono = serializers.CharField(source='cliente.telefono', read_only=True)
    class Meta:
        model = Recordatorio
        fields = '__all__'


class SucursalSerializer(serializers.ModelSerializer):
    # Mostrar detalles del usuario (nombre de usuario, email, etc.)
    user = UserSerializer(required=False)  # Para mostrar detalles del usuario en la respuesta (GET)
    
    # Crear o asignar el usuario utilizando su ID
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, required=False)  # Para crear o asignar el usuario mediante su ID (POST/PUT)
    
    class Meta:
        model = Sucursal
        fields = ['id', 'nombre', 'direccion', 'telefono', 'email', 'user', 'user_id']

    def create(self, validated_data):
        # Extraemos el user_id si está presente
        user_data = validated_data.pop('user_id', None)
        
        # Creamos la sucursal
        sucursal = Sucursal.objects.create(**validated_data)

        # Si se ha proporcionado un user_id, asignamos el usuario a la sucursal
        if user_data:
            sucursal.user = user_data
            sucursal.save()

        return sucursal

    def update(self, instance, validated_data):
        # Extraemos el user_id si está presente
        user_data = validated_data.pop('user_id', None)

        # Actualizamos los campos de la sucursal
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Si se ha proporcionado un user_id, asignamos el nuevo usuario
        if user_data:
            instance.user = user_data
        
        instance.save()
        return instance
