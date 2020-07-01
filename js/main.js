$(document).ready(function() {

	var FundHabit = {}; // Namespace

	FundHabit.url = window.location.href;
	FundHabit.fileName = FundHabit.url.substr(FundHabit.url.lastIndexOf('/') + 1);
	FundHabit.lan = "EN";

	if (FundHabit.fileName.includes("ES")) {
	   FundHabit.lan = "ES";
	}

	// Strings for localization:

	FundHabit.dayString = {EN: "Day ", ES: "Día "};
	FundHabit.apportationToFundString = {EN: "Apportation to fond", ES: "Aportación al fondo"};
	FundHabit.spanIncentives1String = {EN: "If you keep the habit for more than ", ES: "¡Si mantienes el hábito durante más de "};
	FundHabit.spanIncentives2String = {EN: " days, you will be earning ", ES: " días, ganarás "};
	FundHabit.spanIncentives3String = {EN: " (fictial) money per day!", ES: " de dinero (ficticio) por día!"};
	FundHabit.actionAlreadyRegisteredString = {EN: "Action already registered", ES: "Acción ya registrada"};
	FundHabit.changesSavedString = {EN: "Changes saved successfully", ES: "Cambios guardados correctamente"};
	FundHabit.noCookiesToCleanString = {EN: "There aren't cookies to clean, reload the page to create them again", ES: "No hay cookies que eliminar, recarga la página para volver a crearlas"};
	FundHabit.cookiesDeleted = {EN: "Cookies successfully deleted. Reload the page to start from scratch", ES: "Cookies eliminadas correctamente. Recarga la página para empezar de cero"};

	// Global variables:

	FundHabit.$notLinearPlaceholder = "25 25 25 25 15 15 15 15 20 20 45 45 45 45 50";
	FundHabit.$linearPlaceholder = "25 25 25 25 25 25 25 25 25 25 25 25 25 25 25";

	FundHabit.$base = parseFloat($('input#base').attr("value"));
	FundHabit.$placeholderVariations = FundHabit.$linearPlaceholder.split(" ").map(Number);
	FundHabit.$relativeVariations = FundHabit.$placeholderVariations;
	FundHabit.$labelsXAxes = generateLabelsXAxes(FundHabit.$relativeVariations);
	FundHabit.$absoluteVariations = generateAbsoluteVariations(FundHabit.$relativeVariations, FundHabit.$base);
	FundHabit.$failValue = 4.32;
	FundHabit.$successValue = 2.32;
	FundHabit.$lastAction = "";
	FundHabit.$FAIL = "FAIL";
	FundHabit.$SUCCESS = "SUCCESS";

	FundHabit.$datesLogged = [];

	FundHabit.$cookieName = "data1";

	// Functions:

	function loadData(){
		if ($.cookie(FundHabit.$cookieName)) {
			FundHabit = JSON.parse($.cookie(FundHabit.$cookieName));
	    } else {
	        var CookieSet = $.cookie(FundHabit.$cookieName, JSON.stringify(FundHabit));
	    }
	}

	function generateLabelsXAxes(nameArray){
		labels = [];
		for (i = 0; i < nameArray.length; i++) {
			labels[i] = FundHabit.dayString[FundHabit.lan] + (i + 1);
			if (i == nameArray.length - 1){
				labels[i] = FundHabit.dayString[FundHabit.lan] + (i + 1) + "...";
			}
		}
		return labels;
	}

	function generateAbsoluteVariations(relativeVariations, base){
		absoluteVariations = [];
		for (i = 0; i < relativeVariations.length; i++) {
			if (i == 0){
				absoluteVariations[i] = Math.round((base + base * relativeVariations[i]/100) * 100) / 100;
			} else {
				absoluteVariations[i] = Math.round((absoluteVariations[i-1] + absoluteVariations[i-1] * relativeVariations[i]/100) * 100) / 100;
			}
		}
		return absoluteVariations;
	}

	function generateGraph() {
		var ctx = document.getElementById('graph_incentives').getContext('2d');
		var myChart = new Chart(ctx, {
		    type: 'line',
		    data: {
		        labels: FundHabit.$labelsXAxes,
		        datasets: [{
		            label: FundHabit.apportationToFundString[FundHabit.lan],
		            data: FundHabit.$absoluteVariations,
		            backgroundColor: 'rgba(255, 99, 132, 0.2)'
		        }]
		    },
		    options: {
			    scales: {
			        yAxes: [{
			            ticks: {
			                stepSize: 7,
				            fontSize: 30
			            }
			        }],
			        xAxes: [{
			            ticks: {
			                fontSize: 20
			            }
			        }]
			    }
			}
			
		});
		$('#span_incentives').html(FundHabit.spanIncentives1String[FundHabit.lan] + FundHabit.$absoluteVariations.length + FundHabit.spanIncentives2String[FundHabit.lan] + Math.max.apply(Math, FundHabit.$absoluteVariations) + FundHabit.spanIncentives3String[FundHabit.lan])
	}

	function loadUI() {
		$('#instructions').hide();
		generateGraph();
	    $('#linear').attr("checked", true);
	    $('#not_linear').attr("checked", false);
	    $('.not_linear_info').hide();
	    $('#txt_not_linear').attr("placeholder", FundHabit.$notLinearPlaceholder);

	    $greaterValue = FundHabit.$failValue > FundHabit.$successValue ? FundHabit.$failValue : FundHabit.$successValue;
	    $ratio = 1;
	    $standardSize = 20;
	    $fontSize = 3;

	    if ($greaterValue == FundHabit.$failValue){
	    	$ratio = FundHabit.$successValue / FundHabit.$failValue;
	    }

	    if (FundHabit.$failValue != FundHabit.$successValue && $greaterValue == FundHabit.$failValue){
	    	$ratio = FundHabit.$successValue / FundHabit.$failValue;
	    	setTimeout(function(){
	    		$('div.fund span.guide, div.fund span.state').html("");
	    		$('div.fund#success').css("width", $standardSize * $ratio + "em");
		    	$('div.fund#success').css("height", $standardSize * $ratio + "em");
		    	$('div.fund#success span.amount').css("font-size", $fontSize * $ratio + "em");
		    	$('div.fund#fail').css("width", $standardSize * (1 + $ratio) + "em");
		    	$('div.fund#fail').css("height", $standardSize * (1 + $ratio) + "em");
		    	$('div.fund#fail span.amount').css("font-size", $fontSize * (1 + $ratio) + "em");
	    	}, 300);
	    
	    } else if (FundHabit.$failValue != FundHabit.$successValue && $greaterValue == FundHabit.$successValue){
	    	$ratio = FundHabit.$failValue / FundHabit.$successValue;
	    	setTimeout(function(){
	    		$('div.fund span.guide, div.fund span.state').html("");
	    		$('div.fund#fail').css("width", $standardSize * $ratio + "em");
		    	$('div.fund#fail').css("height", $standardSize * $ratio + "em");
		    	$('div.fund#fail span.amount').css("font-size", $fontSize * $ratio + "em");
		    	$('div.fund#success').css("width", $standardSize * (1 + $ratio) + "em");
		    	$('div.fund#success').css("height", $standardSize * (1 + $ratio) + "em");
		    	$('div.fund#success span.amount').css("font-size", $fontSize * (1 + $ratio) + "em");
	    	}, 300); 
	    }

	    $('div.fund#fail span.amount').html(Math.round((FundHabit.$failValue) * 100) / 100);
	    $('div.fund#success span.amount').html(Math.round((FundHabit.$successValue) * 100) / 100);
	}

	$('#clean-cookies').click(function() {
		if ($.cookie(FundHabit.$cookieName)) {
			document.cookie = FundHabit.$cookieName + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
			showSuccess(FundHabit.cookiesDeleted[FundHabit.lan]);
	    } else {
	        showError(FundHabit.noCookiesToCleanString[FundHabit.lan]);
	    }
	});

	$('div.fund#fail').click(function(){
		$today = moment().format('DD-MM-YYYY');
		if (!FundHabit.$datesLogged.includes($today)){
			FundHabit.$datesLogged.push($today);
			$numDay = FundHabit.$datesLogged.length - 1;
			FundHabit.$failValue += FundHabit.$absoluteVariations[$numDay];
			FundHabit.$successValue -= FundHabit.$absoluteVariations[$numDay];
			FundHabit.$lastAction = FundHabit.$FAIL;
			loadUI();
			saveData();
		} else {
			if (FundHabit.$datesLogged.includes($today) && FundHabit.$lastAction == FundHabit.$SUCCESS){
				$numDay = FundHabit.$datesLogged.length - 1;
				FundHabit.$failValue += FundHabit.$absoluteVariations[$numDay];
				FundHabit.$successValue -= FundHabit.$absoluteVariations[$numDay];
				FundHabit.$lastAction = "";
				$index = FundHabit.$datesLogged.indexOf($today);
				if ($index !== -1) FundHabit.$datesLogged.splice($index, 1);
				loadUI();
				saveData();
			} else {
				showError(FundHabit.actionAlreadyRegisteredString[FundHabit.lan]);
			}
		}
	});

	$('div.fund#success').click(function(){
		$today = moment().format('DD-MM-YYYY');
		if (!FundHabit.$datesLogged.includes($today)){
			FundHabit.$datesLogged.push($today);
			$numDay = FundHabit.$datesLogged.length - 1;
			FundHabit.$failValue -= FundHabit.$absoluteVariations[$numDay];
			FundHabit.$successValue += FundHabit.$absoluteVariations[$numDay];
			FundHabit.$lastAction = FundHabit.$SUCCESS;
			loadUI();
			saveData();
		} else {
			if (FundHabit.$datesLogged.includes($today) && FundHabit.$lastAction == FundHabit.$FAIL){
				$numDay = FundHabit.$datesLogged.length - 1;
				FundHabit.$failValue -= FundHabit.$absoluteVariations[$numDay];
				FundHabit.$successValue += FundHabit.$absoluteVariations[$numDay];
				FundHabit.$lastAction = "";
				$index = FundHabit.$datesLogged.indexOf($today);
				if ($index !== -1) FundHabit.$datesLogged.splice($index, 1);
				loadUI();
				saveData();
			} else {
				showError(FundHabit.actionAlreadyRegisteredString[FundHabit.lan]);
			}
		}
	});

	function saveData() {
		if ($('#graph-wrapper').is(':visible')){
			generateGraph();
		}
		showSuccess(FundHabit.changesSavedString[FundHabit.lan]);
	}

	function showError($msg) {
		$('footer.alert p').html($msg);
		$('footer.alert').slideToggle(500).delay(1500).slideToggle(500);
	}

	function showSuccess($msg) {
		$('footer.ok p').html($msg);
		$('footer.ok').slideToggle(500).delay(1500).slideToggle(500);
	}
    
    $("#help").click(function() {
	    $('#instructions').slideToggle();
	});

	$("#show-graph").click(function() {
		$('#graph-wrapper').slideToggle();
		if ($('#graph-wrapper').is(':visible')){
			setTimeout(function(){
				generateGraph();
			}, 200);
		}
	});

	$('div.fund#fail, div.fund#fail span.amount').mouseenter(function() {
		$('div.fund#success span.guide').css("color", "rgb(70,200,50)");
		$('div.fund#fail span.guide').css("color", "black");
		$('div.fund span.guide').show();
	});

	$('div.fund#success, div.fund#success span.amount').mouseenter(function() {
		$('div.fund#fail span.guide').css("color", "rgb(220,50,70)");
		$('div.fund#success span.guide').css("color", "black");
		$('div.fund span.guide').show();
	});

	$('div.fund#fail').mouseout(function() {
		$('div.fund span.guide').hide();
	});

	$('div.fund#success').mouseout(function() {
		$('div.fund span.guide').hide();
	});

	$('div.fund#fail').click(function() {
		$('div.fund span.guide').hide();
		$('div.fund#success span.state').css("color", "rgb(70,200,50)");
		$('div.fund#fail span.state').css("color", "black");
		$('div.fund span.state').fadeIn();
		setTimeout(function(){
			$('div.fund span.state').fadeOut();
		}, 1000);
	});

	$('div.fund#success').click(function() {
		$('div.fund span.guide').hide();
		$('div.fund#fail span.state').css("color", "rgb(220,50,70)");
		$('div.fund#success span.state').css("color", "black");
		$('div.fund span.state').fadeIn();
		setTimeout(function(){
			$('div.fund span.state').fadeOut();
		}, 1000);
	});

	$('input#base').change(function() {
		FundHabit.$base = parseFloat($('input#base').attr("value"));
		FundHabit.$labelsXAxes = generateLabelsXAxes(FundHabit.$relativeVariations);
		FundHabit.$absoluteVariations = generateAbsoluteVariations(FundHabit.$relativeVariations, FundHabit.$base);
		saveData();
	})

	$("input[name='increment_type']").change(function() {
		if (this.value == 'linear'){
			$('.not_linear_info').hide();
			FundHabit.$placeholderVariations = FundHabit.$linearPlaceholder.split(" ").map(Number);
			FundHabit.$relativeVariations = FundHabit.$placeholderVariations;
		}
		if (this.value == 'not_linear'){
			$('.not_linear_info').show();
			FundHabit.$placeholderVariations = FundHabit.$notLinearPlaceholder.split(" ").map(Number);
			FundHabit.$relativeVariations = FundHabit.$placeholderVariations;
		}

		FundHabit.$labelsXAxes = generateLabelsXAxes(FundHabit.$relativeVariations);
		FundHabit.$absoluteVariations = generateAbsoluteVariations(FundHabit.$relativeVariations, FundHabit.$base);

		saveData();
	})

	// Entry point:

	loadData();
	loadUI();

});