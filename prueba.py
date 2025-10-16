import psycopg2
try:
    conn = psycopg2.connect(
        dbname="libreria",
        user="bibliotecario",
        password="4321",
        host="127.0.0.1",  # Usamos 127.0.0.1 para ser explícitos
        port="5432"
    )
    print("¡CONEXIÓN EXITOSA! El problema está en la configuración de Django.")
    conn.close()
except Exception as e:
    print("FALLÓ LA CONEXIÓN. El problema está en PostgreSQL o en el firewall.")
    print("El error es:", e)