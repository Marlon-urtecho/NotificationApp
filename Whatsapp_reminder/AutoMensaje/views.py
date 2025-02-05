
# Vista para el bot que interactua con el usuarioffrom datetime import datetime
from pyexpat.errors import messages
from turtle import pd
from venv import logger
from .utils import enviar_whatsapp_twilio, enviar_whatsapp_bot
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente, Recordatorio, User, Sucursal
from .serializers import ClienteSerializer, RecordatorioSerializer, UserSerializer, SucursalSerializer
from django.http import HttpResponse
from .tasks import enviar_recordatorio, programar_recordatorios, enviar_mensajes_bienvenida
from twilio.rest import Client
from django.views.decorators.csrf import csrf_exempt
from .models import Cliente 
from django.http.response import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
import json
from django.shortcuts import render
from django.core.files.storage import default_storage
import openpyxl
import pandas as pd
from django.db import transaction



class SucursalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['get'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'Usuario activado'})

    @action(detail=True, methods=['get'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'Usuario desactivado'})   
    
class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    
    
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class RecordatorioViewSet(viewsets.ModelViewSet):
    queryset = Recordatorio.objects.all()
    serializer_class = RecordatorioSerializer

class ejecutar_tareas_view(viewsets.ModelViewSet):
    queryset = Recordatorio.objects.all()
    serializer_class = RecordatorioSerializer


def crear_cliente(request):
    if request.method == 'POST':
        serializer = ClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# Vista para listar los clientes en el frontend
def list_Clientes(request):
    clients = Cliente.objects.all()
    clients_data = [{
        'id': client.id,
        'nombre': client.nombre,
        'telefono': client.telefono,
        'placa': client.placa,
        'poliza': client.poliza,
        'fecha_renovacion': client.fecha_renovacion,
        'precio': client.precio,
        'sucursal': client.sucursal.nombre
    } for client in clients]
    return JsonResponse({'Cliente': clients_data})

@api_view(['GET'])
def obtener_clientes(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_sucursales(request):
    sucursales = Sucursal.objects.all()
    sucursal_serializer = SucursalSerializer(sucursales, many=True)
    return Response(sucursal_serializer.data)


class SucursalListCreateView(generics.ListCreateAPIView):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class SucursalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer

    
def list_users(request):
    users = User.objects.all()
    users_data = [{
        'id': user.id,
        'username': user.username,
        'phone_number': user.phone_number,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_active': user.is_active
    } for user in users]
    return JsonResponse(users_data, safe=False)

def create_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = User.objects.create(
                username=data['username'],
                phone_number=data['phone_number'],
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_staff=data['is_staff'],
                is_active=data['is_active']
            )
            return JsonResponse({'message': 'Usuario creado exitosamente'}, status=201)
        except KeyError as e:
            return JsonResponse({'error': f'Faltan campos: {e}'}, status=400)
        
def update_user(request, id):
    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            user.username = data.get('username', user.username)
            user.phone_number = data.get('phone_number', user.phone_number)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            user.save()

            return JsonResponse({'message': 'Usuario actualizado exitosamente'}, status=200)
        except KeyError as e:
            return JsonResponse({'error': f'Faltan campos: {e}'}, status=400)
        

def delete_user(request, id):
    try:
        user = User.objects.get(id=id)
        user.delete()
        return JsonResponse({'message': 'Usuario eliminado exitosamente'}, status=204)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado'}, status=404)       

def enviar_bienvenida(request):
    enviar_mensajes_bienvenida.apply_async()
    return HttpResponse("Mensajes de bienvenida enviados con éxito.")


@csrf_exempt
def bot(request):
    if request.method == 'POST':
        message = request.POST.get("Body", "").strip()
        sender_number = request.POST.get("From", "")
        sender_name = request.POST.get("ProfileName", "Usuario")

        print(f"Recibido mensaje de {sender_name} ({sender_number}): {message}")

        if message.lower() in ["menu", "opciones"]:
            response_message = (
                "📋 *Menú de Opciones* 📋\n"
                "1️⃣ Información sobre seguros\n"
                "2️⃣ Renovación de póliza\n"
                "3️⃣ Contactar a un agente\n"
                "4️⃣ Horario de atención\n"
                "5️⃣ Ubicación de oficinas\n"
                "Escriba el número de la opción que desea consultar."
            )
            enviar_whatsapp_bot(sender_number, response_message)
            return HttpResponse("Mensaje enviado", status=200)
        
        cliente = Cliente.objects.filter(telefono=sender_number).first() or Cliente.objects.filter(nombre__iexact=sender_name).first()

        if cliente:
            response_message = (
                f"Buen día 👋: Soy Orlando Vega Fonseca, Prisma S. A. Agente de Seguros.\n\n"
                f"Permítanos recordarle que el Seguro Obligatorio de su Motocicleta Vence el {cliente.fecha_renovacion} 📝\n"
                f"Placa: {cliente.placa}.\n"
                f"A Nombre de: {cliente.nombre}.\n\n"
                "A sus órdenes para renovación en nuestras oficinas. 🤝\n"
                "📍 De la policía Jinotepe, ½ c. abajo (Fotocopias Vega)\n"
                "📞 Números telefónicos: 8510-2186 CL. / 7708-5139 TIG.\n\n"
                "Si necesita más información, escriba *menu* para ver nuestras opciones de atención. 😊"
            )
        else:
            response_message = (
                f"Hola {sender_name}, no encontramos información de seguro registrada con tu número o nombre. ¿Cómo podemos ayudarte?\n"
                "Si deseas registrar tu información con nosotros, envíanos los siguientes datos: Placa, Póliza, Fecha de Renovación y Precio.\n"
                "También puedes escribir *menu* para ver nuestras opciones de atención."
            )

        enviar_whatsapp_bot(sender_number, response_message)
        return HttpResponse("Mensaje enviado", status=200)
    
    return HttpResponse("Método no permitido", status=405)




@csrf_exempt
@api_view(['POST'])
def importar_clientes(request):
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({'message': 'No se encontró un archivo en la solicitud'}, status=400)

        file = request.FILES['file']

        try:
            # Verifica el tipo de archivo
            if file.name.endswith('.xlsx') or file.name.endswith('.xls'):
                # Leer solo las columnas relevantes desde B7 hasta G
                df = pd.read_excel(file, header=6, usecols='B:G')
            elif file.name.endswith('.csv'):
                return JsonResponse({'message': 'El archivo debe ser Excel con las columnas en el rango especificado (B7:G7).'}, status=400)
            else:
                return JsonResponse({'message': 'El archivo debe ser Excel (.xlsx o .xls).'}, status=400)

            # Validar las columnas esperadas
            columnas_esperadas = ['Numero', 'Nombre', 'Placa', 'Poliza', 'Fecha_vence', 'Precio']
            if not all(col in df.columns for col in columnas_esperadas):
                return JsonResponse({'message': f'El archivo debe contener las columnas: {", ".join(columnas_esperadas)} en el rango B7:G7.'}, status=400)

            # Convertir la columna 'Fecha_vence' a tipo datetime, manejando errores
            df['Fecha_vence'] = pd.to_datetime(df['Fecha_vence'], errors='coerce')

            clientes_importados = 0
            clientes_omitidos = 0

            # Usar transacción para asegurar consistencia
            with transaction.atomic():
                for _, row in df.iterrows():
                    # Verificar si la fecha es válida
                    if pd.isna(row['Fecha_vence']):
                        continue

                    # Validar y truncar valores según los límites de la base de datos
                    cliente_data = {
                        'telefono': str(row['Numero'])[:15],  # Ejemplo: máximo 15 caracteres
                        'nombre': str(row['Nombre'])[:50],   # Ejemplo: máximo 50 caracteres
                        'placa': str(row['Placa'])[:10],     # Ejemplo: máximo 10 caracteres
                        'poliza': str(row['Poliza'])[:20],   # Ejemplo: máximo 20 caracteres
                        'fecha_renovacion': row['Fecha_vence'],
                        'precio': row['Precio'],
                    }

                    # Verificar si el cliente ya existe
                    if Cliente.objects.filter(telefono=cliente_data['telefono']).exists():
                        clientes_omitidos += 1
                        continue

                    # Crear cliente
                    Cliente.objects.create(**cliente_data)
                    clientes_importados += 1

            return JsonResponse({
                'message': 'Procesamiento completado.',
                'clientes_importados': clientes_importados,
                'clientes_omitidos': clientes_omitidos,
            }, status=200)

        except Exception as e:
            return JsonResponse({'message': f'Error al procesar el archivo: {str(e)}'}, status=400)

    return JsonResponse({'message': 'No se ha subido ningún archivo.'}, status=400)

# para el inser de los clientes desde la fise de excel

@csrf_exempt
@api_view(['POST'])
def importar_clientes_desde_b2(request):
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({'message': 'No se encontró un archivo en la solicitud'}, status=400)

        file = request.FILES['file']

        try:
            # Verifica el tipo de archivo
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith('.xlsx') or file.name.endswith('.xls'):
                df = pd.read_excel(file)
            else:
                return JsonResponse({'message': 'El archivo debe ser CSV o Excel'}, status=400)

            # Leer el rango específico de columnas
            df = df.iloc[1:, 1:7]  # Rango B2:G2 (índices basados en cero)
            df.columns = ['Telefono', 'Nombre', 'PLACA', 'POLIZA', 'Fecha_renovacion', 'precio']

            # Validar que las columnas requeridas están presentes
            columnas_requeridas = ['Telefono', 'Nombre', 'PLACA', 'POLIZA', 'Fecha_renovacion', 'precio']
            for columna in columnas_requeridas:
                if columna not in df.columns:
                    return JsonResponse({'message': f'El archivo debe contener las columnas: {", ".join(columnas_requeridas)} en el rango B2:G2.'}, status=400)

            # Procesar las filas del archivo
            for _, row in df.iterrows():
                cliente_data = {
                    'telefono': row['Telefono'],
                    'nombre': row['Nombre'],
                    'placa': row['PLACA'] if pd.notna(row['PLACA']) else None,  # Permitir valores nulos en PLACA
                    'poliza': row['POLIZA'],
                    'fecha_renovacion': pd.to_datetime(row['Fecha_renovacion'], errors='coerce').date() if pd.notna(row['Fecha_renovacion']) else None,
                    'precio': row['precio'],
                }

                # Verificar si el cliente ya existe en la base de datos por teléfono
                if Cliente.objects.filter(telefono=cliente_data['telefono']).exists():
                    continue  # Si ya existe, no crear el cliente nuevamente

                # Crear el cliente
                Cliente.objects.create(**cliente_data)

            return JsonResponse({'message': 'Clientes importados correctamente'}, status=200)

        except Exception as e:
            return JsonResponse({'message': f'Error al procesar el archivo: {str(e)}'}, status=400)

    return JsonResponse({'message': 'No se ha subido ningún archivo.'}, status=400)



@csrf_exempt
def obtener_recordatorios(request):
    """Vista para obtener la lista de recordatorios"""
    recordatorios = Recordatorio.objects.all().order_by('-fecha_envio')
    recordatorios_data = [
        {
            'cliente': recordatorio.cliente.nombre,
            'telefono': recordatorio.cliente.telefono,  # Agregamos el teléfono del cliente
            'mensaje': recordatorio.mensaje,
            'fecha_envio': recordatorio.fecha_envio.strftime('%d/%m/%Y %H:%M'),
            'enviado': recordatorio.enviado
        }
        for recordatorio in recordatorios
    ]
    return JsonResponse({'recordatorios': recordatorios_data})


@api_view(['POST'])
def ejecutar_tareas(request):
    # Aquí se agregaría la lógica para ejecutar las tareas, por ejemplo:
    try:
        # Ejecuta la lógica de tus tareas aquí
        # Por ejemplo, actualizar el estado de los recordatorios
        recordatorios = Recordatorio.objects.all()  # Esto solo es un ejemplo
        serializer = RecordatorioSerializer(recordatorios, many=True)
        return Response({'status': 'success', 'message': 'Las tareas se han ejecutado correctamente.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)


@api_view(['POST'])
def ejecutar_tareas_nueva(request):
    try:
        # Aquí puedes ejecutar la misma lógica que en la vista original
        recordatorios = Recordatorio.objects.all()  # Solo un ejemplo
        serializer = RecordatorioSerializer(recordatorios, many=True)
        return Response({'status': 'success', 'message': 'Las tareas se han ejecutado correctamente.'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
def programar_recordatorios_view(request):
    programar_recordatorios.apply_async()  # Ejecuta la tarea de forma asincrónica
    return HttpResponse("Recordatorios programados con éxito.")

class RecordatorioListView(APIView):
     def get(self, request, format=None):
        recordatorios = Recordatorio.objects.all()
        serializer = RecordatorioSerializer(recordatorios, many=True)
        return Response({
            'recordatorios': serializer.data
        })