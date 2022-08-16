# node-express-socketio-mysql-sqlite3-mongo-normalizr

la base de datos fue removida de los archivos en las siguientes rutas (src/db/database.js code-line: 19.) (src/server.js, code-line: 39.), Por ende, deberás crearte y copiar la url de tu base de mongo antes de iniciar el servidor. esto es para mejorar la seguridad y pertenencias de datos, y así evitar hackeos. O simplemente insertar la url de una base de datos de mongo ya creada y encriptarle datos... También sirve.

ejemplo de URL: mongodb+srv://bauti:bauti@cluster0.pcdnxq9.mongodb.net/ecommerce-node-project?retryWrites=true&w=majority

by: Ribeiro Bautista. 