
/*

Author					Versión
=========				===========
Javier Diaz			v1.0.0

*/

// Initial Components and Modules - PhoneGap;
function init(){
	document.addEventListener('deviceready', onDeviceReady, false);
	delete init;
}

// All the functionality;
function onDeviceReady(){

	// Demo Ripple ;
	if(window.localStorage.getItem('session') === 'true'){
		$.mobile.changePage('#pageDashboard');
	}

	// Session init ;
	document.addEventListener('resume', onResume, false);
	function onResume(){
		if(window.localStorage.getItem('session') === 'true'){
			$.mobile.changePage('#pageDashboard');
		}
	}

	// On BackKeyDown
	document.addEventListener('backbutton', onBackKeyDown, false);
	function onBackKeyDown(){
		if($.mobile.activePage.is('#pageDashboard')){
			// Nothing action here ;
		}else{
			navigator.app.backHistory();
		}
	}

	// Base URI API ;
	var baseURI = 'http://192.168.1.68/webapnote/API';

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
						$.mobile.changePage('#pageDashboard');
						console.log(data);
						window.localStorage.setItem('session', 'true');
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
	$('#btnLogout').on('click', function(e){
		e.preventDefault();
		window.localStorage.clear();
		$.mobile.changePage('#pageLogin')
	});

}


// Alerts ;

function alertDismissed(){
	// Nothing here ;
}

function showAlert(message, title, buttonName){
	navigator.notification.alert(message, alertDismissed, title, buttonName);
}