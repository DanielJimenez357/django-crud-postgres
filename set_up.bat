REM Creacion del entorno virtual
python -m venv ./venv
set ruta_entorno=%CD%

REM Creacion de la base de datos
cd "C:\Program Files\PostgreSQL\18\bin"
REM set /p contrasena= Introduce la contraseña del super usuario en postgres: 
REM set PGPASSWORD=%contrasena%
REM psql -U postgres -c "CREATE DATABASE libreria WITH ENCODING 'UTF8' LC_COLLATE='Spanish_Spain.1252' LC_CTYPE='Spanish_Spain.1252';"

cd %ruta_entorno%
call venv/Scripts/activate.bat
python.exe -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py runserver
pause