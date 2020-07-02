$(document).ready(function() {

	var FundHabit = {}; // Namespace for variables and default values
	var FundHabitData = {}; // Namespace for variables and custom values, stored on cookies

	FundHabit.url = window.location.href;
	FundHabit.fileName = FundHabit.url.substr(FundHabit.url.lastIndexOf('/') + 1);

	// Strings for localization:

	FundHabit.dayString = {EN: "Day ", ES: "Día "};
	FundHabit.apportationToFundString = {EN: "Apportation to fond", ES: "Aportación al fondo"};
	FundHabit.spanIncentives1String = {EN: "If you keep the habit for more than ", ES: "¡Si mantienes el hábito durante más de "};
	FundHabit.spanIncentives2String = {EN: " days, you will be earning ", ES: " días, ganarás "};
	FundHabit.spanIncentives3String = {EN: " (fictial) money per day!", ES: " de dinero (ficticio) por día!"};
	FundHabit.actionAlreadyRegisteredString = {EN: "Action already registered", ES: "Acción ya registrada"};
	FundHabit.changesSavedString = {EN: "Changes saved successfully", ES: "Cambios guardados correctamente"};
	FundHabit.noCookiesToCleanString = {EN: "There aren't cookies to clean, reload the page to create them again", ES: "No hay cookies que eliminar, recarga la página para volver a crearlas"};
	FundHabit.cookiesDeletedString = {EN: "Cookies successfully deleted. Reload the page to start from scratch", ES: "Cookies eliminadas correctamente. Recarga la página para empezar de cero"};
	FundHabit.baseMustBePositiveString = {EN: "The base amount must be a positive number", ES: "La cantidad base debe ser un número positivo"};
	FundHabit.notLinearVariationsMustBePositiveString = {EN: "The variations must be positive numbers for each day", ES: "Las variaciones deben ser números positivos para cada día"};

	// Default values:

	FundHabit.notLinearPlaceholder = "25 25 25 25 15 15 15 15 20 20 45 45 45 45 50";
	FundHabit.linearPlaceholder = "25 25 25 25 25 25 25 25 25 25 25 25 25 25 25";
	FundHabit.base = 0.50;
	FundHabit.FAIL = "FAIL";
	FundHabit.SUCCESS = "SUCCESS";
	FundHabit.LINEAR = "LINEAR";
	FundHabit.NOT_LINEAR = "NOT_LINEAR";

	// Global variables:

	FundHabitData.lan = "EN";

	if (FundHabit.fileName.includes("ES")) {
	   FundHabitData.lan = "ES";
	}

	FundHabitData.mode = FundHabit.LINEAR;

	if (FundHabitData.mode == FundHabit.LINEAR){
		FundHabit.variations = FundHabit.linearPlaceholder.split(" ").map(Number);
	} else {
		FundHabit.variations = FundHabit.notLinearPlaceholder.split(" ").map(Number);
	}

	FundHabitData.base = FundHabit.base;
	FundHabitData.relativeVariations = FundHabit.variations;
	FundHabitData.labelsXAxes = generateLabelsXAxes(FundHabitData.relativeVariations);
	FundHabitData.absoluteVariations = generateAbsoluteVariations(FundHabitData.relativeVariations, FundHabitData.base);
	FundHabitData.failValue = 0;
	FundHabitData.successValue = 0;
	FundHabitData.lastAction = "";
	FundHabitData.datesLogged = [];

	// Utility variables:

	FundHabit.cookieName = "data1";
	FundHabit.graphColor = "rgba(255, 99, 132, 0.2)";

	// Functions:

	function loadData(){
		if ($.cookie(FundHabit.cookieName)) {
			FundHabitData = JSON.parse($.cookie(FundHabit.cookieName));
	    } else {
	        $.cookie(FundHabit.cookieName, JSON.stringify(FundHabitData));
	    }
	}

	function generateLabelsXAxes(nameArray){
		labels = [];
		for (i = 0; i < nameArray.length; i++) {
			labels[i] = FundHabit.dayString[FundHabitData.lan] + (i + 1);
			if (i == nameArray.length - 1){
				labels[i] = FundHabit.dayString[FundHabitData.lan] + (i + 1) + "...";
			}
		}
		return labels;
	}

	function generateAbsoluteVariations(relativeVariations, base){
		// Absolute variations are the revenues per day, shown on graph and on its caption

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
		        labels: FundHabitData.labelsXAxes,
		        datasets: [{
		            label: FundHabit.apportationToFundString[FundHabitData.lan],
		            data: FundHabitData.absoluteVariations,
		            backgroundColor: FundHabit.graphColor
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
		$('#span_incentives').html(FundHabit.spanIncentives1String[FundHabitData.lan] + FundHabitData.absoluteVariations.length + FundHabit.spanIncentives2String[FundHabitData.lan] + Math.max.apply(Math, FundHabitData.absoluteVariations) + FundHabit.spanIncentives3String[FundHabitData.lan])
	}

	function loadUI() {

		// Only show instructions if it hasn't been used yet: 
		if (FundHabitData.datesLogged.length != 0){
			$('#instructions').hide();
		}
		
		generateGraph();

		if (FundHabitData.mode == FundHabit.LINEAR){		
			$('#linear').attr("checked", true);
		    $('#not_linear').attr("checked", false);
		    $('.not_linear_info').hide();
		} else {
			$('#linear').attr("checked", false);
		    $('#not_linear').attr("checked", true);
		    $('.not_linear_info').show();
		    
		    // If relative variations are the default, show them on placeholder. Otherwise, show their value:
		    if (FundHabitData.relativeVariations.toString().replaceAll(",", " ") == FundHabit.notLinearPlaceholder){
			    $('#txt_not_linear').attr("placeholder", FundHabit.notLinearPlaceholder);
			    $('#txt_not_linear').val("");
			} else {
				$('#txt_not_linear').val(FundHabitData.relativeVariations.toString());
			}
		}

		$('input#base').val(FundHabitData.base);

	    greaterValue = FundHabitData.failValue > FundHabitData.successValue ? FundHabitData.failValue : FundHabitData.successValue;
	    ratio = 1;
	    standardSize = 20;
	    fontSize = 3;

	    // Calculate sizes for fund circles:
	    // Fail value is greater => Fail circle greater:
	    if (FundHabitData.failValue != FundHabitData.successValue && greaterValue == FundHabitData.failValue){
	    	
	    	// Absolute value to avoid disappearance when negative amounts:
	    	ratio = Math.abs(FundHabitData.successValue / FundHabitData.failValue);
	    	
	    	setTimeout(function(){
	    		$('div.fund span.guide, div.fund span.state').html("");
	    		$('div.fund#success').css("width", standardSize * ratio + "em");
		    	$('div.fund#success').css("height", standardSize * ratio + "em");
		    	$('div.fund#success span.amount').css("font-size", fontSize * ratio + "em");
		    	$('div.fund#fail').css("width", standardSize * (1 + ratio) + "em");
		    	$('div.fund#fail').css("height", standardSize * (1 + ratio) + "em");
		    	$('div.fund#fail span.amount').css("font-size", fontSize * (1 + ratio) + "em");
	    	}, 300);
	    
	    // Success value is greater => Success circle greater:
	    } else if (FundHabitData.failValue != FundHabitData.successValue && greaterValue == FundHabitData.successValue){
	    	
	    	// Absolute value to avoid disappearance when negative amounts:
	    	ratio = Math.abs(FundHabitData.failValue / FundHabitData.successValue);
	    	
	    	setTimeout(function(){
	    		$('div.fund span.guide, div.fund span.state').html("");
	    		$('div.fund#fail').css("width", standardSize * ratio + "em");
		    	$('div.fund#fail').css("height", standardSize * ratio + "em");
		    	$('div.fund#fail span.amount').css("font-size", fontSize * ratio + "em");
		    	$('div.fund#success').css("width", standardSize * (1 + ratio) + "em");
		    	$('div.fund#success').css("height", standardSize * (1 + ratio) + "em");
		    	$('div.fund#success span.amount').css("font-size", fontSize * (1 + ratio) + "em");
	    	}, 300);
	    
	    // Both values are equal => Same circle size:
	    } else if (FundHabitData.failValue == FundHabitData.successValue) {
	    	ratio = 1;
	    	
	    	setTimeout(function(){
	    		$('div.fund span.guide, div.fund span.state').html("");
	    		$('div.fund#fail').css("width", standardSize * ratio + "em");
		    	$('div.fund#fail').css("height", standardSize * ratio + "em");
		    	$('div.fund#fail span.amount').css("font-size", fontSize * ratio + "em");
		    	$('div.fund#success').css("width", standardSize * ratio + "em");
		    	$('div.fund#success').css("height", standardSize * ratio + "em");
		    	$('div.fund#success span.amount').css("font-size", fontSize * ratio + "em");
	    	}, 300);
	    }

	    // Show amounts with two decimal positions:

	    $('div.fund#fail span.amount').html(Math.round((FundHabitData.failValue) * 100) / 100);
	    $('div.fund#success span.amount').html(Math.round((FundHabitData.successValue) * 100) / 100);
	}

	$('#clean-cookies').click(function() {
		if ($.cookie(FundHabit.cookieName)) {
			document.cookie = FundHabit.cookieName + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
			showSuccess(FundHabit.cookiesDeletedString[FundHabitData.lan]);
	    } else {
	        showError(FundHabit.noCookiesToCleanString[FundHabitData.lan]);
	    }
	});

	$('#lan_EN').click(function(){
		FundHabitData.lan = "EN";
		FundHabitData.labelsXAxes = generateLabelsXAxes(FundHabitData.relativeVariations);
		saveData();
		window.location = 'index';
	});

	$('#lan_ES').click(function(){
		FundHabitData.lan = "ES";
		FundHabitData.labelsXAxes = generateLabelsXAxes(FundHabitData.relativeVariations);
		saveData();
		window.location = 'index_ES';
	});

	$('div.fund#fail').click(function(){
		$('div.fund span.guide').hide();

		today = moment().format('DD-MM-YYYY');

		// No action was made today:
		if (!FundHabitData.datesLogged.includes(today)){
			FundHabitData.datesLogged.push(today);
			numDay = FundHabitData.datesLogged.length - 1;
			FundHabitData.failValue += FundHabitData.absoluteVariations[numDay];
			FundHabitData.successValue -= FundHabitData.absoluteVariations[numDay];
			FundHabitData.lastAction = FundHabit.FAIL;

			loadUI();
			saveData();

		// An action was already made today:
		} else {

			// If the action is the same as the button, don't allow it. Otherwise, undo last action:
			if (FundHabitData.datesLogged.includes(today) && FundHabitData.lastAction == FundHabit.SUCCESS){
				numDay = FundHabitData.datesLogged.length - 1;
				FundHabitData.failValue += FundHabitData.absoluteVariations[numDay];
				FundHabitData.successValue -= FundHabitData.absoluteVariations[numDay];
				FundHabitData.lastAction = "";

				// Remove date from dates log:
				index = FundHabitData.datesLogged.indexOf(today);
				if (index !== -1) FundHabitData.datesLogged.splice(index, 1);
				
				loadUI();
				saveData();
			} else {
				showError(FundHabit.actionAlreadyRegisteredString[FundHabitData.lan]);
			}
		}
	});

	$('div.fund#success').click(function(){
		$('div.fund span.guide').hide();

		today = moment().format('DD-MM-YYYY');
		
		// No action was made today:
		if (!FundHabitData.datesLogged.includes(today)){
			FundHabitData.datesLogged.push(today);
			numDay = FundHabitData.datesLogged.length - 1;
			FundHabitData.failValue -= FundHabitData.absoluteVariations[numDay];
			FundHabitData.successValue += FundHabitData.absoluteVariations[numDay];
			FundHabitData.lastAction = FundHabit.SUCCESS;

			loadUI();
			saveData();
		
		// An action was already made today:
		} else {
			
			// If the action is the same as the button, don't allow it. Otherwise, undo last action:
			if (FundHabitData.datesLogged.includes(today) && FundHabitData.lastAction == FundHabit.FAIL){
				numDay = FundHabitData.datesLogged.length - 1;
				FundHabitData.failValue -= FundHabitData.absoluteVariations[numDay];
				FundHabitData.successValue += FundHabitData.absoluteVariations[numDay];
				FundHabitData.lastAction = "";

				// Remove date from dates log:
				index = FundHabitData.datesLogged.indexOf(today);
				if (index !== -1) FundHabitData.datesLogged.splice(index, 1);

				loadUI();
				saveData();
			} else {
				showError(FundHabit.actionAlreadyRegisteredString[FundHabitData.lan]);
			}
		}
	});

	function saveData() {
		if ($('#graph-wrapper').is(':visible')){
			generateGraph();
		}
		$.cookie(FundHabit.cookieName, JSON.stringify(FundHabitData));
		showSuccess(FundHabit.changesSavedString[FundHabitData.lan]);
	}

	function showError(msg) {
		$('footer.alert p').html(msg);
		$('footer.alert').slideToggle(500).delay(3500).slideToggle(500);
	}

	function showSuccess(msg) {
		$('footer.ok p').html(msg);
		$('footer.ok').slideToggle(500).delay(2500).slideToggle(500);
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

	// Trick to show the guide at the same distance on both circles:

	$('div.fund#fail, div.fund#fail span.amount').mouseenter(function() {
		$('div.fund#success span.guide').css("color", $('div.fund#success').css("background-color"));
		$('div.fund#fail span.guide').css("color", "black");
		$('div.fund span.guide').show();
	});

	$('div.fund#success, div.fund#success span.amount').mouseenter(function() {
		$('div.fund#fail span.guide').css("color", $('div.fund#fail').css("background-color"));
		$('div.fund#success span.guide').css("color", "black");
		$('div.fund span.guide').show();
	});

	$('div.fund#fail').mouseout(function() {
		$('div.fund span.guide').hide();
	});

	$('div.fund#success').mouseout(function() {
		$('div.fund span.guide').hide();
	});

	$('input#base').change(function() {
		// Replace comma with dot for decimal annotation:
		$('input#base').val($('input#base').val().replace(",", "."));

		// Check the base amount is a positive number:
		if (isNaN($('input#base').val()) || parseFloat($('input#base').val()) <= 0 ){
			showError(FundHabit.baseMustBePositiveString[FundHabitData.lan]);
			$('input#base').val("0.50");
		} else {
			FundHabitData.base = parseFloat($('input#base').val());
			FundHabitData.absoluteVariations = generateAbsoluteVariations(FundHabitData.relativeVariations, FundHabitData.base);
			saveData();
		}
	});

	$("input[name='increment_type']").change(function() {

		if (this.value == 'linear'){
			$('.not_linear_info').hide();
			$('input#txt_not_linear').val("");
			FundHabit.variations = FundHabit.linearPlaceholder.split(" ").map(Number);
			FundHabitData.relativeVariations = FundHabit.variations;
			FundHabitData.mode = FundHabit.LINEAR;
		}
		if (this.value == 'not_linear'){
			$('.not_linear_info').show();
			FundHabit.variations = FundHabit.notLinearPlaceholder.split(" ").map(Number);
			FundHabitData.relativeVariations = FundHabit.variations;
			FundHabitData.mode = FundHabit.NOT_LINEAR;
		}

		// Re-generate labels and absolute variations:
		FundHabitData.labelsXAxes = generateLabelsXAxes(FundHabitData.relativeVariations);
		FundHabitData.absoluteVariations = generateAbsoluteVariations(FundHabitData.relativeVariations, FundHabitData.base);

		saveData();
	});

	$("input#txt_not_linear").change(function() {

		// Check if the input for no linear variations has at least one number, which must be an integer positive:
		if (isNaN($("input#txt_not_linear").val().replaceAll(" ", "")) || parseInt($("input#txt_not_linear").val().replaceAll(" ", "") <= 0)){
			showError(FundHabit.notLinearVariationsMustBePositiveString[FundHabitData.lan]);
		} else {
			FundHabitData.variations = $("input#txt_not_linear").val().split(" ").map(Number);
			FundHabitData.relativeVariations = FundHabit.variations;
			FundHabitData.labelsXAxes = generateLabelsXAxes(FundHabitData.relativeVariations);
			FundHabitData.absoluteVariations = generateAbsoluteVariations(FundHabitData.relativeVariations, FundHabitData.base);

			saveData();
		}

	});

	// Entry point:

	loadData();
	loadUI();

});