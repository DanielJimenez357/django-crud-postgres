REM Creacion del entorno virtual
python -m venv ./venv
set ruta_entorno=%CD%

REM Creacion de la base de datos
cd "C:\Program Files\PostgreSQL\18\bin"
set /p contrasena= Introduce la contraseña del super usuario en postgres: 
set /p usuario= Usuario que desee crear para la base de datos: 
set /p us_contrasena= Contraseña que desee usar el nuevo usuario: 
set PGPASSWORD=%contrasena%
psql -U postgres -v usuario=%usuario% -v us_contrasena=%us_contrasena% -f %ruta_entorno%/psql_commands.sql
(
	echo DB_NAME=libreria
	echo DB_USER=%usuario%
	echo US_PASSWORD=%us_contrasena%
	echo DB_HOST=localhost
	echo DB_PORT=5432
	echo DEBUG=True
) > %ruta_entorno%/.env

cd %ruta_entorno%
call venv/Scripts/activate.bat
python.exe -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
pause