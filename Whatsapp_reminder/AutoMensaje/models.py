from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    phone_number = models.CharField(max_length=15)

    # Cambiamos los `related_name` para evitar el conflicto
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',  # Cambia el related_name a algo único
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions_set',  # Cambia el related_name a algo único
        blank=True,
    )

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15)
    email = models.EmailField()

class Cliente(models.Model):
    telefono = models.CharField(max_length=15)
    nombre = models.CharField(max_length=100)
    placa = models.CharField(max_length=20)
    poliza = models.CharField(max_length=50)
    fecha_renovacion = models.DateField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE)

class Recordatorio(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField()
    enviado = models.BooleanField(default=False)
