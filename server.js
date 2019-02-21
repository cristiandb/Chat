//Dependencias
var express = require('express');
var routes = require('./routes');
var async = require("async");
var mysql = require('mysql');
require('Array.prototype.forEachAsync');
var forEachAsync = require('futures').forEachAsync;

//Variables globales
var num_conexiones = 0;
var server = module.exports = express.createServer();
var clientes = []; //Arrays de clientes

//Configuracion del servidor
server.configure(function(){
  server.set('views', __dirname + '/views');
  server.set('view engine', 'ejs');
  server.use(express.bodyParser());
  server.use(express.methodOverride());
  server.use(server.router);
  server.use(express.static(__dirname + '/public'));
});

// Routes
server.get('/', routes.index);

server.listen(3000);

// Si el cliente logra establecer conexion con el servidor, se establece un handler solo para el
var io = require('socket.io').listen(server);
io.set('log level', 1); //Con esto se sale del modo debugging

io.sockets.on('connection', function(socket){
    //Conexion establecida
	socket.userName =  "Usuario: ";
	clientes.push(socket);
	num_conexiones++;
	
	//Transmision de los mensajes del chat
	socket.on('message', function (message){
		//Reenviamos el mensaje
		//En futuro se debera usar async
		/*
		async.forEach(clientes, clienteBuscado, function(err){
			//Se llama este metodo si se produce un error o si no se encuentra el cliente
		});
		*/
		
		//Mas adelante se debe quitar
		for(var i = 0; i < num_conexiones; i++){
			if(socket != clientes[i])
				clientes[i].send("<font color='blue'>" + socket.userName + "</font>" + message);
		}
	});

	//Obtencion de la direccion Ip y puerto de un amigo para transmitir un archivo
	socket.on('privateInfo', function (data){
		var address = socket.handshake.address;
		console.log("New connection from " + address.address + ":" + address.port);
		socket.emit('privateInfo', { address: address.address, port: address.port});
	});
	
	socket.on('mostrarGrupos', function (){
		var cliente = mysql.createClient({
			user: 'root',
			password: '',
			host: '127.0.0.1',
			port: '3306',
			database: 'mydb'
		});
		
		cliente.query(
			'CALL consulta_amigos_grupos(1)', 
			function (err, results, fields) {
				if (err){
					var mensaje = 'No se puede acceder actualmente al chat, intentelo mas tarde.</br></br>Lamentamos las molestias.';
					socket.emit('error_access_database', mensaje);
				} else {
					//Cerramos la conexion
					cliente.end();
					
					var idGroup = 0;
					socket.emit('getInfoGroup', 'Todos'); //Grupo por defecto
					
					results.forEachAsync(function (next, grupo) {
						if(idGroup != grupo.idGrupos){
							socket.emit('getInfoGroup', grupo.NombreGrupo);
							idGroup = grupo.idGrupos;
						}
						
						setTimeout(next, 0);
					});/*.then(function (next) {
						console.log("All Done");
					});*/
				}
        });
	});
	
	//Desconexion de un cliente, esta desconexion es muy brusca, es cuando el cliente cierra la pagina
	socket.on('disconnect', function () {
		//Mas adelante se debe quitar
		for(var i = 0; i < num_conexiones; i++){
			if(socket != clientes[i])
				clientes[i].emit('disconnect_friend', { user_friend: socket.userName });
		}
		
		clientes.splice(clientes.indexOf(socket.userName,1));
		num_conexiones--;
	});
});

////////////////////////////////////////////////////////////////////////////////////////////
// FUNCIONES 
////////////////////////////////////////////////////////////////////////////////////////////
function infoGrupo(next, grupo){
	console.log("Grupo: " + grupo + "\n");
	setTimeout(next, grupo);
}