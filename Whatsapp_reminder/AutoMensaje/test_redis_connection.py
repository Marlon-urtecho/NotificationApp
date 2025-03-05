import redis

print("Iniciando conexión a Redis...")

r = redis.Redis(host='localhost', port=6379, db=0)
try:
    r.ping()
    print("Conectado a Redis")
except redis.exceptions.ConnectionError as e:
    print(f"Error de conexión a Redis: {e}")
