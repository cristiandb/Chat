var socket = io.connect("http://localhost:3000"); //Establecemos conexion con el servidor chat
var submit = false;

////////////////////////////////////////////////////////////////////////
	/*
		RECORDATORIO:
		Esta consulta solo debe hacerse una vez, y no debe ser el chat el que lo haga,
		cuando el usuario se logee, se hara una consulta de sus datos y amigos, por lo
		que esa informacion se volcara en el chat, el chat solo se actualiza para saber el
		estado de los usuarios.
		
		Si se crea un grupo nuevo o se agrega un amigo nuevo, se actualizara el chat cuando 
		se hagan esas insercciones en la base de datos.
		
		De momento se hara cada vez que se pulse el boton de busqueda, pero mas adelante
		se quitara esto.
	*/
	//////////////////////////////////////////////////////////////////////
	
	socket.emit('mostrarGrupos');

/*---------------------------------------------------------------------------------
EVENTOS DEL CHAT
---------------------------------------------------------------------------------*/
socket.on("message",function(data){
	var mensaje = document.createElement("div");
	var chat = document.getElementById("chat");
	
    mensaje.className = "mensaje";
    mensaje.innerHTML = data;
    chat.appendChild(mensaje);
	chat.scrollTop += chat.lastChild.offsetHeight;
});

socket.on('privateInfo', function (data){
	//Obtencion de datos privados de un amigo
	//alert("IP: " + data.address + " Port: " + data.port);
});

socket.on('error_access_database', function (mensaje){
	//Comunicamos el error producido con la base de datos, al usuario
	//$(".div_error").empty(); No hace falta
	$(".div_error").css('display', 'block');
	$(".div_error").css('margin-top', '');
	$(".div_error").append('<span>' + mensaje + '</span>');
});

socket.on('disconnect_friend', function (data){
	//Aviso de que un amigo se ha marchado
	alert("Se fue");
});

socket.on('getInfoGroup', function(name_group){
	//Se crean nuevos elementos para visualizar a los grupos
	var li = $(document.createElement('li'));
	li.append('<img src="/images/agenda.png" width="35" height="35" style="float:left;padding-left:5px;"/>');
	
	if(name_group.length <= 16)
		li.append('<span style="font-size:14px;margin-top:7px;"><b> ' + name_group +' </b></span>');
	else {
		if(name_group.length > 46){
			li.attr('title', name_group);
			name_group = name_group.substring(0, 40) + "...";
		}
		
		li.append('<span><b> ' + name_group +' </b></span>');
	}
	
	li.on('click', handler_ver_amigos);
	$(".content_groups").append(li);
});

/*---------------------------------------------------------------------------------
VALORES POR DEFECTO PARA LOS ELEMENTOS DE LA PAGINA
---------------------------------------------------------------------------------*/
$(document).ready(function(){
	//Evento de click en el boton del chat
	$("#toolife_btnchat").click(handler_btnchat);
	$("#toolife_chat_textarea").val("");

	//Evento de introducir texto en la caja de texto del chat
	$("#toolife_chat_textarea").bind('input propertychange', null, handler_textarea_chat);

	//ESTE CODIGO MAS ADELANTE NO IRA AQUI
	$("#toolife_btnchat").hover(handler_btnchat_hover, handler_btnchat_blur); 
	
	//Se muestra los grupos/amigos del usuario
	$("#toolife_btnBusqueda").click(handler_btnbusqueda_click);
	$("#toolife_bar_busqueda").click(handler_toolife_bar_busqueda_click);
});

/*---------------------------------------------------------------------------------
CONTROL Y GESTION DE LOS MENSAJES DEL CHAT
---------------------------------------------------------------------------------*/
function enviar($e, $text_area){
	var keynum;
	
	if(window.event) // IE
		keynum = $e.keyCode
	else if($e.which) // Netscape/Firefox/Opera
		keynum = $e.which
		
	if (keynum == 13 && !$e.shiftKey){
		//Cuando se da al enter aparece la barra del scroll cuando hay poco texto, eso se debe quitar
		if($(".toolife_input").height() < 90)
			$("#" + $text_area.id).css("overflow", "hidden");
		
		enviarMensaje($text_area);
		submit = true;
	} 
	
	return true;
}

function empty_chat(text_area){
	//BORRADO TOTAL DE LA CAJA TEXTO
	if(submit){
		submit = false;
		$texto_escapado = escape(text_area.value);

		if(navigator.appName == "Opera" || navigator.appName == "Microsoft Internet Explorer") 
			$txt_empty = str_replace("%0D%0A", "", $texto_escapado); 
		else 
			$txt_empty = str_replace("%0A", "", $texto_escapado);
      
		text_area.value = unescape($txt_empty); 
		text_area.value = "";
		
		//TODOS los elementos del chat vuelven a su posicion original
		$("#chat").css("height", '');
		$(".toolife_input").css("height", '');
		$("#" + text_area.id).css("height", '');
		$("#" + text_area.id).css("overflow", '');
	}
}

function enviarMensaje($text_area){
	var msg = str_replace("\n", "", $text_area.value);

	if(msg.length != 0){
		msg = str_replace("\n", "<br \>", $text_area.value);
		var mensaje = document.createElement("div");
		var chat = document.getElementById("chat");
		
		mensaje.className = "mensaje";
		mensaje.innerHTML = "<font color='green'>Yo: </font>" + msg;
		chat.appendChild(mensaje);
		chat.scrollTop += chat.lastChild.offsetHeight * 220;
		
		socket.send(msg);
	}
}

/*---------------------------------------------------------------------------------
FUNCIONES AUXILIARES
---------------------------------------------------------------------------------*/
function str_replace($cambia_esto, $por_esto, $cadena) {
   return $cadena.split($cambia_esto).join($por_esto);
}

function creaChat($id){
}

/*---------------------------------------------------------------------------------
HANDLERS
---------------------------------------------------------------------------------*/
function handler_btnchat() {
	var cssObj = {};
		
	//Se oculta el boton
	if($(".toolife_chat").css("display") == "none")
		cssObj = {'display' : 'none'}

	$(this).css(cssObj);
	$(".toolife_chat").css("bottom", '5px');	
		
	$(".toolife_chat").slideToggle("slow", function() {
		var bar_chat = $(this).children(".toolife_bar_chat");
		bar_chat.click(handler_bar_chat);
	});
}

function handler_btnchat_hover(){
	$(this).stop().animate({width: "230"},{queue:false, duration:"fast" });
}

function handler_btnchat_blur(){
	$(this).stop().animate({width: "180"},{queue:false, duration:"fast"});
}

function handler_btnbusqueda_click(){
	$("#toolife_bar_busqueda").unbind("click");
	
	$(this).fadeOut(200, function(){
		$(this).css("visibility", 'hidden');
		$(this).css('display', '');
		$("#toolife_busqueda").fadeIn(300, function(){
			$("#toolife_bar_busqueda").click(handler_toolife_bar_busqueda_click);
			$("#toolife_text_busqueda").focus();
		});
	});
}

function handler_toolife_bar_busqueda_click(){
	$(this).unbind("click");
	$("#toolife_btnBusqueda").unbind("click");
	
	$("#toolife_busqueda").fadeOut(200, function(){
		$("#toolife_btnBusqueda").css("visibility", '');
		$("#toolife_btnBusqueda").css('display', 'none');
		$("#toolife_btnBusqueda").fadeIn(300,function(){
			$("#toolife_btnBusqueda").click(handler_btnbusqueda_click);
		});
	});
}

function handler_bar_chat(){
	//Borramos el evento de la barra del chat y hacemos visible el boton del chat
	$(this).unbind("click");
	$(".toolife_chat").slideToggle("slow", function() {
		$("#toolife_btnchat").unbind("click");
		$("#toolife_btnchat").unbind("hover");
		$("#toolife_btnchat").fadeIn(300, function() {
			$(this).click(handler_btnchat);
			$(this).hover(handler_btnchat_hover, handler_btnchat_blur); 
		});
	});
}

function handler_textarea_chat() {
	//Se captura cualquier cambio en la caja de texto
	//Autoresize chat, por cada linea caben 30 caracteres
	var txt = $(this).val();
	var incremento = (Math.floor(txt.length / 30) * 16) + 16;
	var altoTextArea = $("#toolife_chat_textarea").height();

	if($(".toolife_input").height() < 90 && (incremento > altoTextArea)){
		//Crece dinamicamente el textarea para poder meter mas texto
		incremento = incremento - altoTextArea;
			
		if(incremento > 64)
			incremento = 64;
			
		$("#chat").css("height", "-=" + incremento);
		$(".toolife_input").css("height", "+=" + incremento);
		$("#toolife_chat_textarea").css("height", "+=" + incremento);

		//Reubicamos el scroll del chat al final
		var chat = document.getElementById("chat");
		if(chat.lastChild)
			chat.scrollTop += chat.lastChild.offsetHeight;
	} else if(altoTextArea > incremento && incremento < 80){
		//Decrece dianmicamente el textarea cuando se borra texto
		incremento = incremento - altoTextArea;
		$("#chat").css("height", "-=" + incremento);
		$(".toolife_input").css("height", "+=" + incremento);
		$("#toolife_chat_textarea").css("height", "+=" + incremento);
	}
}

function handler_ver_amigos(){
//alert($(this).contents().find("b").text());
}