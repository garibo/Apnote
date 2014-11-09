
/*

Author					Versión
=========				===========
Javier Diaz			v1.0.0

*/

var baseURI = 'http://192.168.1.75/webapnote/API';

	// Initial Components and Modules - PhoneGap;
	function init(){
		document.addEventListener('deviceready', onDeviceReady, false);
		delete init;
	}

	// All the functionality - onDeviceReady();
	function onDeviceReady(){

		// Demo Ripple ;
		if(window.localStorage.getItem('session') === 'true'){
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
							showAlert(data.message, 'Autenticación Satisfactoria', 'Ir al Dashboard');
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

		$('#panelMenuP').on('click','#btnLogout2', function(e){
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
					
				}
			});
		});

	/*********** Take a Picture ***********/
		$('#takepicture').on('click', function(){
			var tarea = $(this).data('idtarea');
			console.log('Presed: '+tarea);
			//$.mobile.changePage('#imagePage', {transition: 'slide'});
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
				ft.upload(imageURL, baseURI+"/uploadFiles", win, fail, options);
				$('#getTake').attr('src', imageURL);
				$('#getTake').attr('data-name', imageURL);
				$.mobile.changePage('#imagePage', {transition: 'slide'});
			}, function(message){
				alert(message);
			}, {
				quality: 50,
				destinationType: Camera.DestinationType.FILE_URL
			});
		});

	/*********** End Take a Picture ***********/

		$('#tareas').on('click', 'a#tag', function(){
			var id = $(this).data('idtarea');
			var val = $(this).data('val');
			console.log(id+' '+val);
			$('#append-title').remove();
			$('.title-activity').append('<p id="append-title">'+val+'</p>');
			$.mobile.changePage('#activityPage', {transition: 'slide'});
		});

		$('#bckbutton').on('click', function(e){
			e.preventDefault();
			$.mobile.changePage('#pageDashboard', {transition: 'slide', reverse: true});
		});

		$('#bckbutton2').on('click', function(e){
			e.preventDefault();
			$.mobile.changePage('#projectPage', {transition: 'slide', reverse: true});
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