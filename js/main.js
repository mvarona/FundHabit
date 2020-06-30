$(document).ready(function() {

	$notLinearPlaceholder = "25 25 25 25 15 15 15 15 20 20 45 45 45 45 50";
	$linearPlaceholder = "25 25 25 25 25 25 25 25 25 25 25 25 25 25 25";

	$base = parseFloat($('input#base').attr("value"));
	$placeholderVariations = $linearPlaceholder.split(" ").map(Number);
	$relativeVariations = $placeholderVariations;
	$labelsXAxes = generateLabelsXAxes($relativeVariations);
	$absoluteVariations = generateAbsoluteVariations($relativeVariations, $base);

	function generateLabelsXAxes(nameArray){
		labels = [];
		for (i = 0; i < nameArray.length; i++) {
			labels[i] = "Day " + (i + 1);
			if (i == nameArray.length - 1){
				labels[i] = "Day " + (i + 1) + "...";
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
		        labels: $labelsXAxes,
		        datasets: [{
		            label: 'Apportation to fond',
		            data: $absoluteVariations,
		            backgroundColor: 'rgba(255, 99, 132, 0.2)'
		        }]
		    },
		    options: {
			    scales: {
			        yAxes: [{
			            ticks: {
			                stepSize: 7,
				            fontSize: 40
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
		$('#span_incentives').html("If you keep the habit for more than " + $absoluteVariations.length + " days, you will be earning " + Math.max.apply(Math, $absoluteVariations) + " (fictial) money per day!")
	}

	function loadUI() {
		$('#instructions').hide();
		generateGraph();
	    $('#linear').attr("checked", true);
	    $('#not_linear').attr("checked", false);
	    $('.not_linear_info').hide();
	    $('#txt_not_linear').attr("placeholder", $notLinearPlaceholder);
	}

	function saveData() {
		if ($('#graph-wrapper').is(':visible')){
			generateGraph();
		}
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

	$('div.fund#fail').hover(function() {
		$('div.fund#success span.guide').css("color", "rgb(70,200,50)");
		$('div.fund#fail span.guide').css("color", "black");
		$('div.fund span.guide').toggle();
	});

	$('div.fund#success').hover(function() {
		$('div.fund#fail span.guide').css("color", "rgb(220,50,70)");
		$('div.fund#success span.guide').css("color", "black");
		$('div.fund span.guide').toggle();
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
		$base = parseFloat($('input#base').attr("value"));
		$labelsXAxes = generateLabelsXAxes($relativeVariations);
		$absoluteVariations = generateAbsoluteVariations($relativeVariations, $base);
		saveData();
	})

	$("input[name='increment_type']").change(function() {
		if (this.value == 'linear'){
			$('.not_linear_info').hide();
			$placeholderVariations = $linearPlaceholder.split(" ").map(Number);
			$relativeVariations = $placeholderVariations;
		}
		if (this.value == 'not_linear'){
			$('.not_linear_info').show();
			$placeholderVariations = $notLinearPlaceholder.split(" ").map(Number);
			$relativeVariations = $placeholderVariations;
		}

		$labelsXAxes = generateLabelsXAxes($relativeVariations);
		$absoluteVariations = generateAbsoluteVariations($relativeVariations, $base);

		saveData();
	})

	loadUI();

});