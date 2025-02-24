# NotificationApp
Reposritorio de proyecto django, automatizacion de notificaciones para seguros obligatorios de vehiculos 

<h2>comando para ejecutar el Frontend </h2>
<h2> entrar en el entorno virtual Entrar en la carpeta de el proyecto de react 
  conmando 1 ( cd wharssap_reminder)
  coamndo 2 ( cd fronted)
  Comando 3 ( npm start )
</h2>

<h1>Comandos para ejecutar el Backend</h1>

<h2> 1- Activar entorno </h2>

<p> Activar el entorno virtual donde estan las librerias y paquetes
    para esto entramos en la carpeta donde esta el proyecto completo llamado NotificationProyect
    Comando ( cd NotificationProyect )
</p>

<h2>Ejecutar Sevidor de Django</h2>

<p> 2-  Entrar en la carpeta de la raiz del proyecto y ejecutar runserver
  esta es donde se encuntra el archivo manage.py 
    comando ( cd whatsapp_remindder ) 
    comando ( python manage.py runserver)
</p>

<h2>Ejecutar Celery para las Tareas automaticas</h2>
<p> 
  Ejecuatar Redis desde el contenedor de docker
  
  Entrar en el carpeta raiz (whatssap_reminder) y ejecuar 
  comando ( celery -A Whatsapp_reminder worker -P gevent --loglevel=debug )

  Abrir otra terminal igualmente en la raiz del proyecto y ejecuatar
  comando ( celery -A Whatsapp_reminder beat --loglevel=info )
</p>

<h2> Ejecuatar el servidor publico para ngrok </h2>
<p>
  Servidor donde procesan las solicitudes de twilio 
  (ngrok 8000)
</p>

<h2>Ejecutar al conssola de twilio </h2>
<p>
  Escaniar el codigo https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn?frameUrl=%2Fconsole%2Fsms%2Fwhatsapp%2Flearn%3Fx-target-region%3Dus1
</p>


http://127.0.0.1:8000/AutoMensaje/v1/api/login/
http://127.0.0.1:8000/AutoMensaje/v1/api/token/refresh/


<h1>Diseño navbar<h1/>
https://youtu.be/l0F09p_7L7k?si=cd9-ADb7kOB_8x4B

<h1>Documanetacion Api<h1/>
https://youtu.be/Xts8NmyAc8c?si=6SbAvYKCLAXna-2k

<h1>table models<h1/>
https://youtu.be/vNu3ZsiM2Q8?si=gENEa_bNPkXSc9_s

<h1>Token de Ngrok<h1/>
https://dashboard.ngrok.com/get-started/your-authtoken


Nmap = para los analisis de ip en la red,
analisisi de vulnerabilidad 
explotacion de las fallas 
informe que es de manera informal 
informe tecnico que muestra el proceso de las vulnerabilidades
paso 1 = tecnica osin


Tipos de vulnerabilidades comunes 
Inyeccion SQL = ocurre cuando el atacante manipula una consulta Sql para para acceder a informacion no autorizada 
Cross site Scripts (XSS) = permite a un atacante inyectar Scrpits maliciosos de la wed para para robar credenciales y redirigir a las paginas falsas
Ataques de fuerza bruta = se base en probar miles de contraseñas hasta encontrar la correcta 
Ransomware y explotacion de vulnerabiolidades ¿ malware que sifra datos y exige un pago de parea restaurarlos
Phiihng : en 2024 Banpro(rifa vehiculo)






