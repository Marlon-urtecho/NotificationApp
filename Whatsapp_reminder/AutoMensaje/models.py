from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db.models.signals import post_save
from django.dispatch import receiver


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
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.nombre  # Agregar la clave foránea aquí

class Cliente(models.Model):
    telefono = models.CharField(max_length=15)
    nombre = models.CharField(max_length=100)
    placa = models.CharField(max_length=15, blank=True, null=True)  # Ahora puede ser nulo
    poliza = models.CharField(max_length=50)
    fecha_renovacion = models.DateField()
    precio = models.DecimalField(max_digits=15, decimal_places=2)
    sucursal = models.ForeignKey(Sucursal, null=True, blank=True, on_delete=models.SET_NULL)  # Permitir nulo en sucursal

    def __str__(self):
        return self.nombre

class Recordatorio(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField()
    enviado = models.BooleanField(default=False)

    def __str__(self):
        return f"Recordatorio: {self.mensaje} - {self.fecha_envio}" 