
/*

Author					Versión
=========				===========
Javier Diaz			v1.0.0

*/

//var baseURI = 'http://10.42.0.1/webapnote/API';
//var baseImages = 'http://10.42.0.1/webapnote/uploads';

var baseURI = 'http://192.168.1.75/webapnote/API';
var baseImages = 'http://192.168.1.75/webapnote/uploads';

	// Initial Components and Modules - PhoneGap;
	function init(){
		document.addEventListener('deviceready', onDeviceReady, false);
		delete init;
	}

	// All the functionality - onDeviceReady();
	function onDeviceReady(){
		var usuario = window.localStorage.getItem('email');
		$('#panelprofile span').html(usuario);

		// Demo Ripple ;
		if(window.localStorage.getItem('session') === 'true'){
			proyectosIniciados();
			proyectosCurso();
			$.mobile.changePage('#pageDashboard');
		}

		// Session init onResume;
		document.addEventListener('resume', onResume, false);
		function onResume(){
			if(window.localStorage.getItem('session') === 'true'){
				//$.mobile.changePage('#pageDashboard');
			}
		}

		// On BackKeyDown
		document.addEventListener('backbutton', onBackKeyDown, false);
		function onBackKeyDown(){
			if($.mobile.activePage.is('#pageDashboard')){
				// Nothing action here ;
			}else if($.mobile.activePage.is('#pageLogin')){
				navigator.app.exitApp();
			}else{
				navigator.app.backHistory();
			}
		}

		//On MenuButton event;
		document.addEventListener('menubutton', onMenuButton, false);
		function onMenuButton(){
			$('#panelMenu').panel('open');
		}
 
		// Function to login panel;
		$('#btnLogin').on('click', function(e){
			e.preventDefault();
			$.ajax({
				type: 'GET',
				url: baseURI+'/APILogin?jsoncallback=?',
				data: $('#appLogin').serialize(),
				dataType: 'json',
				beforeSend: function(){
					$.mobile.loading('show');
				},
				success: function(data){
					setTimeout(function(){
						if(data.success == 1){
							$.mobile.loading('hide');
							//showAlert(data.message, 'Autenticación Satisfactoria', 'Ir al Dashboard');
							$.mobile.changePage('#pageDashboard', {transition: 'slide'});
							console.log(data);
							window.localStorage.setItem('session', 'true');
							window.localStorage.setItem('nombre', data.nombre);
							window.localStorage.setItem('username', data.username);
							window.localStorage.setItem('email', data.email);
							window.localStorage.setItem('apem', data.apem);
							window.localStorage.setItem('apep', data.apep);
							window.localStorage.setItem('date', data.date);
							proyectosIniciados();
							proyectosCurso();
						}else{
							$.mobile.loading('hide');
							showAlert(data.message, 'Autenticación Erronea', 'Volver a Intentar');
							console.log(data);
						}
					}, 1000);
				}
			});
			return false;
		});

		// Function to logout ;
		$('#panelMenu').on('click','#btnLogout', function(e){
			e.preventDefault();
			window.localStorage.clear();
			$.mobile.changePage('#pageLogin', {transition: 'slide'})
		});

		$('#refreshProjects').on('click',function(e){
			e.preventDefault();
			console.log('ok');
			proyectosIniciados();
			proyectosCurso();
		});

		// Lista de Proyectos con Tareas
		$('#projectList').on('click', '#item', function(){
			var id = this.getAttribute('data-id');
			window.localStorage.setItem('proyecto', id);
			$.ajax({
				type: 'GET',
				url: baseURI+'/verProyecto/'+id+'?jsoncallback=?',
				dataType: 'json',
				success: function(data){
					console.log(data);
					$('#menu p').remove();
					$.each(data, function(label, content){
						var datas = "<p>"+content+"</p>";
						$(datas).appendTo("#"+label);
						console.log('This is '+label+' , the content is '+content+'');
					});
					$('#tareas li').remove();
					$.ajax({
						url: baseURI+'/verTareas/'+id+'?jsoncallback=?',
						type: 'GET',
						dataType: 'json',
						success: function(data){
							console.log(data);
							$.each(data, function(i, object){
								var list = $('<li/>');
								var chtml = '<a href="#" id="tag" data-idtarea="'+object.Id+'" data-val="'+object.Titulo+'">'+object.Titulo+'</a>';
								$(chtml).addClass('ui-btn ui-btn-icon-right ui-icon-carat-r').appendTo(list);
								list.appendTo('#tareas');
							});
							$.mobile.changePage('#projectPage', {transition: 'slide'});
						}
					});
					
				},
				complete: function(){
					$.ajax({
						url: baseURI+'/updateTarea/'+id+'?jsoncallback=?',
						dataType: 'json',
						type: 'GET',
						success: function(response){
							console.log(response);
						}
					});
				}
			});
		});

	/* Take a Picture */
		$('.act').on('click', '#takepicture', function(e){
			e.preventDefault();
			navigator.camera.getPicture(function(imageURL){
				alert(imageURL);
				var options = new FileUploadOptions();
				options.filekey = "file";
				options.fileName = imageURL.substr(imageURL.lastIndexOf('/')+1);
				options.mimeType = "image/jpeg";

				var params = new Object();
				params.value1 = "test";
				params.value2 = "param";
				options.params = params;
				options.chunkedMode = false;

				var ft = new FileTransfer();
				ft.upload(imageURL, encodeURI(baseURI+"/uploadFiles"), win, fail, options);
				$('#getTake').attr('src', imageURL);
				window.localStorage.removeItem('nombreImagen');
				window.localStorage.setItem('nombreImagen', imageURL.substr(imageURL.lastIndexOf('/')+1) );
				$.mobile.changePage('#imagePage', {transition: 'slide'});
			}, function(message){
				alert(message);
			}, {
				quality: 50,
				destinationType: Camera.DestinationType.FILE_URL
			});
		});

	/*********** End Take a Picture ***********/

	/************** Saving Picture *******/
	
	$('#savepicture').on('click', function(e){
		e.preventDefault();
		var title = $('#tituloImage').val();
		var descr = $('#desImage').val();
		var imagen = window.localStorage.getItem('nombreImagen');
		var tarea = window.localStorage.getItem('tarea');
		$.ajax({
			url: baseURI+'/registerImage?jsoncallback=?',
			type: 'GET',
			data: {titulo: title, descripcion: descr, image: imagen , idtarea: tarea },
			dataType: 'json',
			success: function(response){
				showAlert(response.mensaje, 'Subida', 'Continuar');
				$('#tituloImage').val("");
				$('#desImage').val("");
				$.mobile.changePage('#projectPage', {transition: 'slide', reverse: true});
			}
		});
	});

	/************************************
		Updating a File.
	*************************************/
	$('#fotos').on('click', 'a#getimgUpdate', function(){
		var id = this.getAttribute('data-imgid');
		console.log(id);
		$.ajax({
			url: baseURI+'/getImageInformation/'+id+'?jsoncallback=?',
			type: 'GET',
			dataType: 'json',
			success: function(response){
				console.log(response);
				$('#getTakeU').attr('src',baseImages+'/'+response[0].NameURL);
				$('#tituloImageU').val(response[0].Titulo);
				$('#desImageU').val(response[0].Descripcion);
			}
		});
		$.mobile.changePage('#imageupdatePage');
	});

	/*************************************/
		/* Click en un elemento de tareas */
		$('#tareas').on('click', 'a#tag', function(){
			var id = $(this).data('idtarea');
			var val = $(this).data('val');
			console.log(id+' '+val);
			$('#append-title').remove();
			window.localStorage.removeItem('tarea');
			window.localStorage.setItem('tarea', id);
			getImages();
			$('.title-activity').append('<p id="append-title">'+val+'<span id="number" style="float: right;">Fotos: </span></p>');
			$.mobile.changePage('#activityPage', {transition: 'slide'});
		});

		/* Enviar para Revisión */
		$('#checkSuccess').on('click', function(e){
			e.preventDefault();
			var pr = window.localStorage.getItem('proyecto');
			$.ajax({
				url: baseURI+'/getImagesByWork/'+pr+'?jsoncallback=?',
				type: 'GET',
				dataType: 'json',
				success: function(response) {
					console.log(response);
					if(response !== null){
						if(response.total == response.objetos.length){
							console.log("Iguales: "+response.total+","+response.objetos.length);
							completarProyecto();
						}else{
							console.log("No son Iguales: "+response.total+","+response.objetos.length);
						}
					}else{
						console.log('No puede enviarse a revisión.');
					}
				}
			});
		});

		$('#bckbutton').on('click', function(e){
			e.preventDefault();
			proyectosIniciados();
			proyectosCurso();
			$.mobile.changePage('#pageDashboard', {transition: 'slide', reverse: true});
		});

		$('#bckbutton2').on('click', function(e){
			e.preventDefault();
			proyectosIniciados();
			proyectosCurso();
			$.mobile.changePage('#projectPage', {transition: 'slide', reverse: true});
		});

		$('#bckbutton3').on('click', function(e){
			e.preventDefault();
			$('#getTakeU').attr('src','');
			$('#tituloImageU').val('');
			$('#desImageU').val('');
			$.mobile.changePage('#activityPage');
		});

		$('#panelMenu').trigger('updatelayout');

		/*** Events Touch ***/
		$("#pageDashboard").swipe(function(){
			$('#panelMenu').panel('open');
		});

		$('#pageDashboard').swipeLeft(function(){
			$('#panelMenu').panel('close');
		});

	}

	function alerts(message){
		alert(message);
	}

	function win(r) {
		console.log("Code = " + r.responseCode);
		console.log("Response  =" + r.response);
		console.log("Sent = " + r.bytesSent);
		alert(r.reponse);
	}

	function fail(error) {
		alert("An error has ocurred: Code = " + error.code);
	}

	/***** Llamada de Datos al Servidor *****/

	// Proyectos sin iniciar ;
	function proyectosCurso(){
		var user = window.localStorage.getItem('email');
		$.ajax({
			type: 'GET',
			url: baseURI+'/proyectosCurso?jsoncallback=?',
			data: {email: user},
			dataType: 'json',
			beforeSend: function(){
				$.mobile.loading('show', {
					theme: 'renew'
				});
				$('#refreshProjects span').hide();
			},
			success: function(data){
				$('.app-append-two').remove();
				if(data != null){
					for(var i = 0; i < data.length; i++){
						$('#prosNuevos').after('<li id="item" data-id="'+data[i].id_proyecto+'" class="box waves-effect app-append-two"><div><p><b>Nombre</b></p><p>'+data[i].p_nombre+'</p><p><b>Descripción</b></p><p>'+data[i].p_descri+'</p><p><b>Fecha y Hora: </b>'+data[i].p_fecha+'</p><p><b>Categoría: </b>'+data[i].p_cat+'</p></div></li>');
					}
				}else{
					$('#prosNuevos').after('<li id="item" class="box waves-effect app-append-two"><div><p class="center" style="font-size: .7em;"><span class="icon-info2" style="padding-right: 5px;"></span> No hay proyectos nuevos.</p></div></li>')
				}
				
			}
		});
	}

	// Proyectos sin iniciar ;
	function proyectosIniciados(){
		var user = window.localStorage.getItem('email');
		$.ajax({
			type: 'GET',
			url: baseURI+'/proyectosIniciados?jsoncallback=?',
			data: {email: user},
			dataType: 'json',
			success: function(data){
				$('.app-append').remove();
				if(data != null){
					for(var i = 0; i < data.length; i++){
						$('#prosIniciados').after('<li id="item" data-id="'+data[i].id_proyectos+'" class="box waves-effect app-append"><div><p><b>Nombre</b></p><p>'+data[i].p_nombre+'</p><p><b>Descripción</b></p><p>'+data[i].p_descri+'</p><p><b>Fecha y Hora: </b>'+data[i].p_fecha+'</p><p><b>Categoría: </b>'+data[i].p_cat+'</p></div></li>');
					}
				}else{
					$('#prosIniciados').after('<li id="item" class="box waves-effect app-append"><div><p class="center" style="font-size: .7em;"><span class="icon-info2" style="padding-right: 5px;"></span> No hay proyectos en curso.</p></div></li>')
				}
			}, 
			complete: function(){
				$.mobile.loading('hide');
				$('#refreshProjects span').show();
			}
		});
	}

	function getImages(){
		var tarea = window.localStorage.getItem('tarea');
		$.ajax({
			url: baseURI+'/getWorks/'+tarea+'?jsoncallback=?',
			dataType: 'json',
			type: 'GET',
			success: function(response){
				console.log(response);
				$('#fotos .col-img').remove();
				if(response != null) {
					window.localStorage.setItem('pictures', response.length);
					var number = window.localStorage.getItem('pictures');
					window.localStorage.removeItem('pictures');
					$('#number').append(number);
				}else {
					$('#number').append('0');
				}
				$.each(response, function(i, object){
					var imga = '<a href="#" id="getimgUpdate" data-imgid="'+object.ImageID+'"><div class="col-img"><img src="'+baseImages+'/'+object.URL+'" width="320px" /></div></a>';
					$(imga).appendTo('#fotos');
				});
			}
		});
	}

	function completarProyecto(){
		var id = window.localStorage.getItem('proyecto');
		$.ajax({
			url: baseURI+'/updateProyecto/'+id+'?jsoncallback=?',
			dataType: 'json',
			type: 'GET',
			success: function(response){
				alert(response.message, 'Enviado', 'Regresar');
				proyectosIniciados();
				proyectosCurso();
				$.mobile.changePage('#pageDashboard');
			}
		});
	}

	/***** ALERTS *****/

	function alertDismissed(){
		// Nothing here ;
	}

	function showAlert(message, title, buttonName){
		navigator.notification.alert(message, alertDismissed, title, buttonName);
	}

	/***** END ALERTS *****/