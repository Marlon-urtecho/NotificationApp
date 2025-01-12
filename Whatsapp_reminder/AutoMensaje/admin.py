from django.contrib import admin
from .models import User, Sucursal, Cliente, Recordatorio

# Registrar el modelo User
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'phone_number', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')  # Campos para mostrar en la lista
    search_fields = ('username', 'email')  # Campos que se pueden buscar en el admin
    list_filter = ('is_staff', 'is_active')  # Filtros para la lista
    ordering = ('username',)  # Ordenar por el campo username

admin.site.register(User, UserAdmin)

# Registrar el modelo Sucursal
class SucursalAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'direccion', 'telefono', 'email')  # Campos para mostrar en la lista
    search_fields = ('nombre', 'direccion', 'telefono')  # Campos que se pueden buscar en el admin

admin.site.register(Sucursal, SucursalAdmin)

# Registrar el modelo Cliente
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'telefono', 'placa', 'poliza', 'fecha_renovacion', 'precio', 'user', 'sucursal')  # Campos para mostrar
    search_fields = ('nombre', 'telefono', 'placa', 'poliza')  # Campos que se pueden buscar
    list_filter = ('sucursal', 'fecha_renovacion')  # Filtros para la lista
    ordering = ('fecha_renovacion',)  # Ordenar por fecha de renovación

admin.site.register(Cliente, ClienteAdmin)

# Registrar el modelo Recordatorio
class RecordatorioAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'mensaje', 'fecha_envio', 'enviado')  # Campos para mostrar en la lista
    search_fields = ('mensaje', 'cliente__nombre')  # Campos que se pueden buscar
    list_filter = ('enviado',)  # Filtros para la lista
    list_editable = ('enviado',)  # Permite editar el campo 'enviado' directamente desde la lista

admin.site.register(Recordatorio, RecordatorioAdmin)
