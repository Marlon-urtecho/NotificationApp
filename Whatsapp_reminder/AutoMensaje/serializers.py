from rest_framework import serializers
from .models import Cliente, Recordatorio
from .models import User, Sucursal

class UserSerializer(serializers.ModelSerializer):
    # Puedes incluir el teléfono que agregaste
    class Meta:
        model = User
        fields = [
            'id',
            'username',  # Nombre de usuario único
            'password',  # Contraseña (se recomienda cifrado en el backend)
            'email',  # Correo electrónico
            'first_name',  # Nombre
            'last_name',  # Apellido
            'phone_number',  # El teléfono que agregaste
            'is_active',  # Para saber si está activo
            'is_staff',  # Para saber si es personal del sitio
            'is_superuser',  # Para saber si tiene permisos completos
            'groups',  # Relación con grupos
            'user_permissions'  # Permisos del usuario
        ]
        
    def create(self, validated_data):
        # Asegúrate de encriptar la contraseña antes de guardar
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)  # Establece la contraseña de forma segura
            user.save()
        return user

    def update(self, instance, validated_data):
        # En caso de que quieras actualizar la contraseña
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


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
