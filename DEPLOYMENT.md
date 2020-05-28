# Arquidiocesis de Monterrey - BDA Servidor

## Paso 1 - Instalar NodeJS
[https://nodejs.org/en/](https://nodejs.org/en/)  
- Descargar la versión para el sistema operativo utilizado.
- Versión recomendada **v12**.
- Asegurarse de que se instale **npm**.

## Paso 2 - Instalar librerias del proyecto
Correr el siguiente comando para instalar todas las librerias y componentes requeridos para correr el servidor.  
**Este comando se debe de correr dentro de la carpeta de el proyecto.**
```
$ npm install
```

## Paso 4 - Revisar archivos requeridos
- La aplicación usa Firebase como base de datos.
- Se requiere del archivo _ServiceAccountKey.json_ para correr
- Este archivo se puede conseguir de Firebase usando las credenciales proporcionadas anteriormente.

## Paso 3 - Correr servidor
Correr el siguiente comando dentro de la capreta del proyecto.  
```
$ npm start
```

## Paso 4 - Subir a Heroku
Para subir a producción en Heroku, se corren los siguientes comandos
1. Instalar Heroku-CLI
	- https://devcenter.heroku.com/articles/heroku-cli

2. Iniciar sesión en Heroku
	- Utilizar las credenciales de Heroku que se proporcionaron anteriormente.
	```
	$ heroku login
	```
3. Hacer push a heroku
	```
	$ git push heroku master
	```
	- Esto subirá a heroku todo lo que esta en la branch **master**.
	- Si se desea utilizar otra branch se puede correr
	```
	$ git push heroku {branch_name}:master
	```
4. El servidor puede usar la información de Firebase dentro de una _Environment Variable_ que se tiene configurada en Heroku.
	- Heroku les llama a las Environment Variables **Config Vars**
	- Esta se llama _FIREBASE_SERVICE_ACCOUNT_ y tiene el mismo contenido de JSON que tiene el archivo _ServiceAccountKey.json_ pero en formato _base64_.
	- Se puede ver esta funcionalidad dentro de el archivo _index.js_.

## Notas adicionales
- Si se cambiar de servidor de Heroku o se usa otra herramienta, se tendrá que cambiar el URL dentro de la Aplicación en el otro repositorio.
	- Este se encuentra en el archivo _src/lib/API.js_ en la variable _ROOT_URL_
- Si se cambia de cuenta de Firebase, se deberá de cambiar dentro de las _Config Vars_ de Heroku en el format especificado en el paso 4.