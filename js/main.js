$(document).ready(function() {

	$base = parseFloat($('input#base').attr("value"));
	$placeholderVariations = $('input#txt_not_linear').attr("placeholder").split(" ").map(Number);
	$relativeVariations = $placeholderVariations;
	$labelsXAxes = generateLabelsXAxes($relativeVariations);
	$absoluteVariations = generateAbsoluteVariations($relativeVariations, $base);
	console.log($absoluteVariations);

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

	function generateData() {
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
	}

	function loadUI() {
		$('#instructions').hide();
	    $('#graph_incentives').hide();

		generateData();

	    $('#linear').attr("checked", true);
	    $('#not_linear').attr("checked", false);
	    $('.not_linear_info').hide();
	}

	function saveData() {
		$('footer.ok').slideToggle(500).delay(1500).slideToggle(500);
	}
    
    $("#help").click(function() {
	    $('#instructions').slideToggle();
	});

	$("#show-graph").click(function() {
	    $('#graph_incentives').slideToggle();
	});

	$('input#base').change(function() {
		saveData();
	})

	$("input[name='increment_type']").change(function() {
		if (this.value == 'linear'){
			$('.not_linear_info').hide();
		}
		if (this.value == 'not_linear'){
			$('.not_linear_info').show();
		}

		saveData();
	})

	loadUI();

});