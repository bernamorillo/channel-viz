(function($) {

	/*
	 * EXAMPLE CONFIGURATION
	 * 
	 * var defaultKey = 'fje329iun52ngtuijo2f4jeun432A', // Unique master Xively
	 * API key to be used as a default defaultFeeds = [61916,12425,94322], //
	 * Comma separated array of Xively Feed ID numbers applicationName = 'My
	 * Company\'s Application', // Replaces Xively logo in the header
	 * dataDuration = '90days', // Default duration of data to be displayed //
	 * ref: https://xively.com/dev/docs/api/data/read/historical_data/
	 * dataInterval = 10800, // Default interval for data to be displayed (in
	 * seconds) dataColor = '0A1922', // CSS HEX value of color to represent
	 * data (omit leading #) hideForm = 0;
	 */
	var COLOR_NAMES = [ "Aqua", "Aquamarine", "Black", "Blue", "BlueViolet",
			"Brown", "BurlyWood", "CadetBlue", "Chocolate", "Coral",
			"CornflowerBlue", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod",
			"DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta",
			"DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed",
			"DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray",
			"DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink",
			"DeepSkyBlue", "DodgerBlue", "FireBrick", "ForestGreen", "Fuchsia",
			"Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow",
			"HotPink", "IndianRed", "Indigo", "LawnGreen", "Lime", "LimeGreen",
			"Magenta", "Maroon", "MediumAquaMarine", "MediumBlue",
			"MediumOrchid", "MediumPurple", "MediumSeaGreen",
			"MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise",
			"MediumVioletRed", "MidnightBlue", "Navy", "Olive", "OliveDrab",
			"Orange", "OrangeRed", "Orchid", "Pink", "PowderBlue", "Purple",
			"Red", "RosyBrown", "RoyalBlue", "SeaGreen", "SkyBlue",
			"SlateBlue", "SpringGreen", "SteelBlue", "Tomato", "Turquoise",
			"Violet", "Yellow", "YellowGreen" ];
	var palette = new Rickshaw.Color.Palette({
		scheme : 'munin'
	});// Color Schemes:
	// classic9,colorwheel,cool,munin,spectrum14,spectrum2000,spectrum2001
	var defaultKey = 'OMCzabPFgxwth38NaNLqwgpOPSfj0CIllfjzVynlhgj8FDeE', // bztdUQPEyZUbtTTRXTRtNud4BY6HAqvpqyyLUUfxoUMM01jC
	defaultFeeds = '3368415', // Comma separated array of Xively Feed ID numbers
	interpolation = 'monotone', // linear, step-after,step-before,
	// cardinal,monotone,basis,bundle
	defaultName = '', // Comma separated array of Xively Feed ID numbers
	applicationName = 'SANTA ENGRACIA XIVELY', // Replaces Xively logo in the header
	renderer = 'line', 
	dataColor = '', // CSS HEX value of color to represent data
	filter = '', // default filter
	series = [], hideForm = 0, defaultDuration = '6hours', // '1hour','6hours','1day','1week','1month','90days'
	defaultInterval = 120;

	// Function Declarations

	// URL Parameters
	function getParam(key) {
		var value = location.hash.match(new RegExp(key + '=([^&]*)'));
		if (value) {
			return value[1];
		} else {
			return "";
		}
	}

	// Graph Annotations
	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(seriesData[2][seriesData[2].length - 1].x, messages
					.shift());
		}
	}

	// Add One (1) Day to Date Object
	Date.prototype.addDays = function(d) {
		if (d) {
			var t = this.getTime();
			t = t + (d * 86400000);
			this.setTime(t);
		}
	};

	// Subtract One (1) Day to Date Object
	Date.prototype.subtractDays = function(d) {
		if (d) {
			var t = this.getTime();
			t = t - (d * 86400000);
			this.setTime(t);
		}
	};

	// Parse Xively ISO Date Format to Date Object
	Date.prototype.parseISO = function(iso) {
		var stamp = Date.parse(iso);
		if (!stamp)
			throw iso + ' Unknown date format';
		return new Date(stamp);
	}

	// Set xively API Key
	function setApiKey(key) {
		xively.setKey(key);
	}

	function updateFeed(feedId, duration, interval, filtertag) {
	//	$('#loadingData').foundation('reveal','open');
		console.log(feedId);
				console.log(duration);
				console.log(interval);
				console.log(filtertag);

				lastDuration = duration;
				lastInterval = interval;

				if ($('#feed-' + feedId + ' .graph').attr('id') == ('graph-' + feedId)) {

					$('#graph-' + feedId).empty();
					$('#feed-' + feedId + ' .datastream-time').empty();
					$('#legend-' + feedId).empty();
					$('#legendDetail-' + feedId).empty();
					$('#preview-' + feedId).empty();
					$('#legend-' + feedId).remove();
					$('#legend').clone().appendTo(
							'#feed-graph-' + feedId + ' .legend_container').addClass(
							'legend').attr('id', 'legend-' + feedId);
					$('#legendDetail').clone().appendTo(
							'#feed-graph-' + feedId + ' .legend_container').addClass(
							'legendDetail').attr('id', 'legendDetail-' + feedId);
					$('#interpolation-' + feedId).remove();
					$('#interpolation').clone().appendTo(
							'#feed-graph-' + feedId + ' .interpolation_container').addClass(
							'interpolation').attr('id', 'interpolation-' + feedId);

				} else {
					$('#feed-' + feedId + ' .feed-graph').attr('id',
							'feed-graph-' + feedId);
				}
				$('#feed-graph-' + feedId + ' .graph').attr('id', 'graph-' + feedId);
				$('#feed-graph-' + feedId + ' .legend').prop('id', 'legend-' + feedId);
				$('#feed-graph-' + feedId + ' .legendDetail').prop('id', 'legendDetail-' + feedId);
				// $('#feed-graph-' + feedId + ' .datastream-form').prop('id', 'form-' +
				// feedId);
				$('#feed-graph-' + feedId + ' .preview')
						.prop('id', 'preview-' + feedId);

				$('#feed-' + feedId + ' .legendDetail').addClass('hidden');
				$('#feed-' + feedId + ' .datastream-time').addClass('hidden');
				$('#feed-' + feedId + ' .legend').removeClass('hidden');

				xively.feed
						.get(
								feedId,
								function(feedData) {
									if (feedData.datastreams) {
										//console.log(feedData);
		// ID
										$('#feed-' + feedId + ' .title .value').html(
												feedData.title);

										// Date Updated
										$('#feed-' + feedId + ' .updated .value').html(
												feedData.updated);
										var minValue = 100000000;

										feedData.datastreams
												.forEach(function(datastream) {
													//var thisMinValue = parseFloat(datastream.min_value);
													//if (thisMinValue < minValue) {minValue = thisMinValue;}
												});
										var series = [];
										var graph = new Rickshaw.Graph({
											element : document.querySelector('#graph-'
													+ feedId),
											width : 600,
											height : 400,
											dotSize : 2,
											renderer : 'multi',
											min : -1,
											interpolation : interpolation,
											series : series,
											stroke : true,
											preserve : true
										});
										var laststream = feedData.datastreams[feedData.datastreams.length - 1];
										//console.log('laststream' + (feedData.datastreams.length - 1));

										feedData.datastreams
												.forEach(function(datastream) {
													//console.log(datastream);
													var data = 0;
													var now = new Date();
													var then = new Date();
													var updated = new Date;
													updated = updated
															.parseISO(datastream.at);

													var diff = null;
													if (duration == '1hour')
														diff = 3600000;
													if (duration == '6hours')
														diff = 21600000;
													if (duration == '1day')
														diff = 86400000;
													if (duration == '1week')
														diff = 604800000;
													if (duration == '1month')
														diff = 2628000000;
													if (duration == '90days')
														diff = 7884000000;
													then.setTime(now.getTime() - diff);
													if (updated.getTime() > then
															.getTime()) {
														data = 1;
														//console.log(feedId);
														//console.log(datastream.id);

														xively.datastream
																.history(
																		feedId,
																		datastream.id,
																		{
																			duration : duration,
																			interval : interval,
																			limit : 1000
																		},
																		function(datastreamData) {
																			//console.log(datastreamData);

																			if (datastreamData) {
																				console.log(datastreamData);

																			var data = [];
																			var points = [];
																			var filterarray = [];
																			var datastreamSymbol = '';
																			if (datastream.unit) {
																				datastreamSymbol = datastream.unit.symbol;
																			}

																			if (datastreamData.tags) {
																				datastreamData.tags
																						.forEach(function(
																								tag) {
																							filterarray
																									.push(tag);
																						});
																			}
																			$(
																					'#feed-'
																							+ feedId
																							+ ' .datastream-name')
																					.html(
																							filtertag);

																			if (datastreamData.datapoints) {
																			//	console.log('? datastreamData.datapoints ' + datastreamData.datapoints);

																				if (jQuery
																						.inArray(
																								filtertag,
																								filterarray) != -1
																						|| filtertag == '') {

																					datastreamData.datapoints
																							.forEach(function(
																									datapoint) {
																								if(datapoint.value.indexOf('NaN') < 0){

																								points
																										.push({
																											x : new Date(
																													datapoint.at)
																													.getTime() / 1000.0,
																											y : parseFloat(datapoint.value)
																										});}
																							});
																					var min = Number.MAX_VALUE;
																					var max = Number.MIN_VALUE;
																					for (i = 0; i < points.length; i++) {
																						min = Math
																								.min(
																										min,
																										points[i].y);
																						max = Math
																								.max(
																										max,
																										points[i].y);
																					}
																					//console.log(min);
																					//console.log(max);
																					var linearScale = d3.scale.linear()
																							.range([0,100 ])
																							;
																					linearScale.domain([min,max ]);
																					linearScale.domain(); // [-2.347,
																										// 7.431];
																					linearScale.nice(); // [-3,
																										// 8]
																					var rbg = Math
																							.floor(Math
																									.random()
																									* COLOR_NAMES.length);
																					// var
																					// color
																					// =
																					// COLOR_NAMES[rbg];
																					var color = palette
																							.color();
																					if (datastream.id
																							.indexOf('Uptime') != -1) {
																						;
																					} else{series.push({
																									name : datastream.id,
																									data : points,
																									scale : linearScale,
																									renderer : 'line',
																									symbol : datastreamSymbol,
																									color : color,// dataColorRandom,
																								});
																					}
																				}
																				graph
																						.render();
																				if (laststream == datastream) {
																					setTimeout(function() {
																					// console.log(laststream.id);
																					series.sort(function(a, b){
																					    if(b.name < a.name) return -1;
																					    if(b.name > a.name) return 1;
																					    return 0;
																					});
																					var legend = new Rickshaw.Graph.Legend(
																							{
																								graph : graph,
																								element : document
																										.querySelector('#legend-'
																												+ feedId),
																							});
																					var legendDetails = new Rickshaw.Graph.Legend(
																							{
																								graph : graph,
																								element : document
																										.querySelector('#legendDetail-'
																												+ feedId),
																							});

																					var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
																							{
																								graph : graph,
																								legend : legend,
																								disabledColor : function() {
																									return 'rgba(0, 0, 0, 0.2)'
																								}
																							});

																					var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
																							{
																								graph : graph,
																								legend : legend
																							});

																					var order = new Rickshaw.Graph.Behavior.Series.Order(
																							{
																								graph : graph,
																								legend : legend
																							});

																					var preview = new Rickshaw.Graph.RangeSlider.Preview(
																							{
																								graph : graph,
																								element : document
																										.querySelector('#preview-'
																												+ feedId)
																							});
																					var legendDetail = document.querySelector('#legendDetail-'
																							+ feedId);

																					var Hover = Rickshaw.Class
																					.create(
																							Rickshaw.Graph.HoverDetail,
																							{

																								render : function(args) {

																									$('#feed-' + feedId + ' .legend').addClass('hidden');
																									$('#feed-' + feedId + ' .legendDetail').removeClass('hidden');
																									$('#feed-' + feedId + ' .datastream-time').removeClass('hidden');

																									
																									$('#feed-'+ feedId+ ' .datastream-time').html(args.formattedXValue);
																									$('#feed-'+ feedId+ ' .datastream-time').unbind();
																									$('#feed-'+ feedId+ ' .datastream-time').click(function() {
																										console.log('hidden');

																										$('#feed-' + feedId + ' .legendDetail').addClass('hidden');
																										$('#feed-' + feedId + ' .datastream-time').addClass('hidden');
																										$('#feed-' + feedId + ' .legend').removeClass('hidden');

																									});
																									legendDetail.innerHTML = '';
																									var sortable = document
																									.createElement('ul');
																									sortable.className = 'ui-sortable';
																									legendDetail
																									.appendChild(sortable);
																									$('#legendDetail-' + feedId + ' .ui-sortable').attr('id', 'ui-sortable-' + feedId);
																									var uiSortable = document.querySelector('#ui-sortable-'
																											+ feedId);
																									//<ul class="ui-sortable"></ul>
																									//console.log(series);
																									args.detail.sort(
																													function(
																															a,
																															b) {
																													    if(a.name < b.name) return -1
																													    if(a.name > b.name) return 1
																													    return 0})
																											.forEach(
																													function(
																															d) {
																														//console.log(d);

																														var line = document
																																.createElement('div');
																														line.className = 'line';

																														var swatch = document
																																.createElement('div');
																														swatch.className = 'swatch';
																														swatch.style.backgroundColor = d.series.color;

																														var label = document
																																.createElement('span');
																														var symbol = '';
																														if (d.series.symbol != ''
																																&& d.series.symbol != 0) {
																															symbol = d.series.symbol + ' ';
																														}
																														label.className = 'label';

																														label.innerHTML = d.formattedYValue
																																+ " "
																																+ symbol
																																+ ": "
																																+ d.name;
																														//label.style.fontSize = "small";

																														line
																																.appendChild(swatch);
																														line
																																.appendChild(label);

																														uiSortable
																																.appendChild(line);

																														var dot = document
																																.createElement('div');
																														dot.className = 'dot';
																														dot.style.top = graph
																																.y(d.value.y0
																																		+ d.value.y)
																																+ 'px';
																														dot.style.borderColor = d.series.color;

																														this.element
																																.appendChild(dot);

																														dot.className = 'dot active';

																														this
																																.show();

																													}, this);
																									var newLine = document
																											.createElement('div');
																									newLine.className = 'label';
																									newLine.innerHTML = '  ';
																									uiSortable
																											.appendChild(newLine);
																									
																									var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
																											{
																												graph : graph,
																												legend : legendDetails,
																												disabledColor : function() {
																													return 'rgba(0, 0, 0, 0.2)'
																												}
																											});

																									var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
																											{
																												graph : graph,
																												legend : legendDetails
																											});

																									var order = new Rickshaw.Graph.Behavior.Series.Order(
																											{
																												graph : graph,
																												legend : legendDetails
																											});

																								}
																							});

																			var hover = new Hover({
																				graph : graph
																			});
																			
																			
																			
																			var hoverDetail = new Rickshaw.Graph.HoverDetail(
																					{
																						graph : graph,
																						formatter : function(series, x, y) {
																							var symbol = '';
																							if (series.symbol != ''
																									&& series.symbol != 0) {
																								symbol = series.symbol;
																							}
																							y = +y.toFixed(2);
																							var date = '<span class="date">'
																									+ new Date(x * 1000)
																											.toUTCString()
																									+ '</span>';
																							var swatch = '<span class="detail_swatch" style="background-color: '
																									+ series.color
																									+ '"></span>';
																							var content = series.name
																									+ ": " + y
																									+ " " + symbol;
																							return content;
																						}
																					});
																			var ticksTreatment = 'glow';

																			var xAxis = new Rickshaw.Graph.Axis.Time(
																				{
																					graph : graph,
																					ticksTreatment : ticksTreatment
																				});
																		xAxis
																				.render();

																		var yAxis = new Rickshaw.Graph.Axis.Y(
																				{
																					graph : graph,
																					scale : linearScale,

																					orientation : 'left',
																					tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
																					ticksTreatment : ticksTreatment
																				});
																		yAxis
																				.render();
																		$('#loadingData').foundation('reveal', 'close');

																					},1000);}
																				
																			}if (laststream == datastream){
																				console.log('last datastream');
																				$('#loadingData').foundation('reveal', 'close');
																			}
																			}else{
																				console.log('no datastreamData');
																				$('#loadingData').foundation('reveal', 'close');}
																			//console.log('? datastreamData');
																			$('#loadingData').foundation('reveal', 'close');
																		});
													}else{ 
														console.log('no update');
														if (laststream == datastream){
															console.log('laststream == datastream');
														if (data == 0){
															console.log('data == 0');
														$('#feed-' + feedId + ' .tags').addClass('hidden');
														$('#feed-' + feedId + ' .interpolation').addClass('hidden');
														$('#feed-'+ feedId+ ' .button-group').addClass('hidden');
														$('#feed-' + feedId + ' .updated .value').html("No datapoints found.");
														}
														$('#loadingData').foundation('reveal', 'close');}}
													$('#loadingData').foundation('reveal', 'close');

												});
										
										/*
										console.log(series);
										var Seriesmin = 0;
										var Seriesmax = 0;
										var SeriesMinMax = 0;
										series.forEach(function(
												object) {
											object.forEach(function(
													data) {
										
										var min = 0;
										var max = 0;
										for (i = 0; i < data.length; i++) {
											min = Math
													.min(
															min,
															data.y);
											max = Math
													.max(
															max,
															data.y);
										}
										console.log(min);
										console.log(max);
										SeriesMinMax.push(min);
										SeriesMinMax.push(max);});});
										for (i = 0; i < SeriesMinMax.length; i++) {
											Seriesmin = Math
													.min(
															SeriesMinMax);
											Seriesmax = Math
													.max(
															SeriesMinMax);
										}
										console.log(Seriesmin);
										console.log(Seriesmax);

										*/



									
										/*var formScale = document
												.getElementsByName('scale');
										formScale[2].onclick = function() {
											changeScale(graph, formScale[2].value);
										}
										formScale[3].onclick = function() {
											changeScale(graph, formScale[3].value);
										}*/
										$('#feed-' + feedId + ' .interpolation')
										.attr('id',
												'interpolation-' + feedId);
										var form = document
												.getElementById('interpolation');
										
										$('#interpolation-'+ feedId+ ' .monotone')
										.click(function() {changeInterpolation(graph, 'monotone');});
										$('#interpolation-'+ feedId+ ' .cardinal')
										.click(function() {changeInterpolation(graph, 'cardinal');});
										$('#interpolation-'+ feedId+ ' .linear')
										.click(function() {changeInterpolation(graph, 'linear');});
										$('#interpolation-'+ feedId+ ' .step')
										.click(function() {changeInterpolation(graph, 'step-before');});
										$('#interpolation-'+ feedId+ ' .basis')
										.click(function() {changeInterpolation(graph, 'basis');});
										

									}else{$('#loadingData').foundation('reveal', 'close');}
								});
			
	}

		
		
		function updateMultiFeeds(feedString, duration, interval, filtertag) {
			//$('#loadingData').foundation('reveal','open');
			console.log(feedString);
		console.log(duration);
		console.log(interval);
		console.log(filtertag);

		lastDuration = duration;
		lastInterval = interval;
multiId = '0';
		if ($('#feed-' + multiId + ' .graph').attr('id') == ('graph-' + multiId)) {
			console.log('rebuild graph');

			$('#graph-' + multiId).empty();
			$('#feed-' + multiId + ' .datastream-time').empty();
			$('#legend-' + multiId).empty();
			$('#legendDetail-' + multiId).empty();
			$('#preview-' + multiId).empty();
			$('#legend-' + multiId).remove();
			$('#legend').clone().appendTo(
					'#feed-graph-' + multiId + ' .legend_container').addClass(
					'legend').attr('id', 'legend-' + multiId);
			$('#legendDetail').clone().appendTo(
					'#feed-graph-' + multiId + ' .legend_container').addClass(
					'legendDetail').attr('id', 'legendDetail-' + multiId);
			$('#interpolation-' + multiId).remove();
			$('#interpolation').clone().appendTo(
					'#feed-graph-' + multiId + ' .interpolation_container').addClass(
					'interpolation').attr('id', 'interpolation-' + multiId);

		} else {
			$('#feed-' + multiId + ' .feed-graph').attr('id',
					'feed-graph-' + multiId);
		}
		$('#feed-graph-' + multiId + ' .graph').attr('id', 'graph-' + multiId);
		$('#feed-graph-' + multiId + ' .legend').prop('id', 'legend-' + multiId);
		$('#feed-graph-' + multiId + ' .legendDetail').prop('id', 'legendDetail-' + multiId);
		// $('#feed-graph-' + feedId + ' .datastream-form').prop('id', 'form-' +
		// feedId);
		$('#feed-graph-' + multiId + ' .preview')
				.prop('id', 'preview-' + multiId);

		$('#feed-' + multiId + ' .legendDetail').addClass('hidden');
		$('#feed-' + multiId + ' .datastream-time').addClass('hidden');
		$('#feed-' + multiId + ' .legend').removeClass('hidden');
		
		var series = [];
		var graph = new Rickshaw.Graph({
			element : document.querySelector('#graph-'
					+ multiId),
			width : 600,
			height : 400,
			dotSize : 2,
			renderer : 'multi',
			min : -1,
			interpolation : interpolation,
			series : series,
			stroke : true,
			preserve : true
		});
		var lastfeed = feedString[feedString.length - 1];
		console.log('lastfeed' + (feedString.length - 1));
		console.log(lastfeed);

		var currentfeed = 0;
		var feedcount = feedString.length;
		console.log('feedcount' + feedcount);

		feedString.forEach(function(feedId) {
			console.log(feedId);
			console.log(currentfeed);
		xively.feed
				.get(
						feedId,
						function(feedData) {
							console.log(feedData);
							currentfeed++;
							console.log(currentfeed);

							if (feedData.datastreams) {
								// ID
								//$('#feed-' + feedId + ' .title .value').html(feedData.title);

								// Date Updated
								//$('#feed-' + feedId + ' .updated .value').html(feedData.updated);
								//var minValue = 100000000;

								
								
								var laststream = feedData.datastreams[feedData.datastreams.length - 1];

								feedData.datastreams
										.forEach(function(datastream) {

											var now = new Date();
											var then = new Date();
											var updated = new Date;
											updated = updated.parseISO(datastream.at);

											var diff = null;
											if (duration == '1hour')
												diff = 3600000;
											if (duration == '6hours')
												diff = 21600000;
											if (duration == '1day')
												diff = 86400000;
											if (duration == '1week')
												diff = 604800000;
											if (duration == '1month')
												diff = 2628000000;
											if (duration == '90days')
												diff = 7884000000;
											then.setTime(now.getTime() - diff);
										//	if (updated.getTime() > then.getTime()) {

												xively.datastream
														.history(
																feedId,
																datastream.id,
																{
																	duration : duration,
																	interval : interval,
																	limit : 1000
																},
																function(
																		datastreamData) {
																	var data = [];
																	var points = [];
																	var filterarray = [];
																	var datastreamSymbol = '';
																	if (datastream.unit) {
																		datastreamSymbol = datastream.unit.symbol;
																	}

																	if (datastreamData.tags) {
																		datastreamData.tags
																				.forEach(function(
																						tag) {
																					filterarray
																							.push(tag);
																				});
																	}
																	$(
																			'#feed-'
																					+ feedId
																					+ ' .datastream-name')
																			.html(
																					filtertag);

																	if (datastreamData.datapoints) {

																		if (jQuery
																				.inArray(
																						filtertag,
																						filterarray) != -1
																				|| filtertag == '') {

																			datastreamData.datapoints
																					.forEach(function(
																							datapoint) {
																						if(datapoint.value.indexOf('NaN') < 0){
																						points
																								.push({
																									x : new Date(
																											datapoint.at)
																											.getTime() / 1000.0,
																									y : parseFloat(datapoint.value)
																								});}
																					});
																			var min = Number.MAX_VALUE;
																			var max = Number.MIN_VALUE;
																			for (i = 0; i < points.length; i++) {
																				min = Math
																						.min(
																								min,
																								points[i].y);
																				max = Math
																						.max(
																								max,
																								points[i].y);
																			}
																			//console.log(min);
																			//console.log(max);

																		
																			var linearScale = d3.scale.linear()
																					.range([0,100 ])
																					;
																			linearScale.domain([min,max ]);
																			linearScale.domain(); // [-2.347,
																								// 7.431];
																			linearScale.nice(); // [-3,
																								// 8]
																			var rbg = Math
																					.floor(Math
																							.random()
																							* COLOR_NAMES.length);
																			// var
																			// color
																			// =
																			// COLOR_NAMES[rbg];
																			var color = palette
																					.color();
																			if (datastream.id
																					.indexOf('Uptime') != -1) {
																				;
																			} else{
																				series.push({
																							name : datastream.id,
																							data : points,
																							scale : linearScale,
																							renderer : 'line',
																							symbol : datastreamSymbol,
																							color : color,// dataColorRandom,
																						});
																			}
																		}}else{console.log('no datapoints');}
																		graph.render();

																		if (laststream == datastream && lastfeed == feedId) {
																			console.log('laststream == datastream && lastfeed == feedId ');

																			setTimeout(function() {																			// console.log(laststream.id);
																			series.sort(function(a, b){
																			    if(b.name < a.name) return -1;
																			    if(b.name > a.name) return 1;
																			    return 0;
																			});
																			var legend = new Rickshaw.Graph.Legend(
																					{
																						graph : graph,
																						element : document
																								.querySelector('#legend-'
																										+ multiId),
																					});
																			var legendDetails = new Rickshaw.Graph.Legend(
																					{
																						graph : graph,
																						element : document
																								.querySelector('#legendDetail-'
																										+ multiId),
																					});

																			var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
																					{
																						graph : graph,
																						legend : legend,
																						disabledColor : function() {
																							return 'rgba(0, 0, 0, 0.2)'
																						}
																					});

																			var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
																					{
																						graph : graph,
																						legend : legend
																					});

																			var order = new Rickshaw.Graph.Behavior.Series.Order(
																					{
																						graph : graph,
																						legend : legend
																					});

																			var preview = new Rickshaw.Graph.RangeSlider.Preview(
																					{
																						graph : graph,
																						element : document
																								.querySelector('#preview-'
																										+ multiId)
																					});
																			var legendDetail = document.querySelector('#legendDetail-'
																					+ multiId);

																			var Hover = Rickshaw.Class
																			.create(
																					Rickshaw.Graph.HoverDetail,
																					{

																						render : function(args) {

																							$('#feed-' + multiId + ' .legend').addClass('hidden');
																							$('#feed-' + multiId + ' .legendDetail').removeClass('hidden');
																							$('#feed-' + multiId + ' .datastream-time').removeClass('hidden');

																							
																							$('#feed-'+ multiId+ ' .datastream-time').html(args.formattedXValue);
																							$('#feed-'+ multiId+ ' .datastream-time').unbind();
																							$('#feed-'+ multiId+ ' .datastream-time').click(function() {
																								console.log('hidden');

																								$('#feed-' + multiId + ' .legendDetail').addClass('hidden');
																								$('#feed-' + multiId + ' .datastream-time').addClass('hidden');
																								$('#feed-' + multiId + ' .legend').removeClass('hidden');

																							});
																							legendDetail.innerHTML = '';
																							var sortable = document
																							.createElement('ul');
																							sortable.className = 'ui-sortable';
																							legendDetail
																							.appendChild(sortable);
																							$('#legendDetail-' + multiId + ' .ui-sortable').attr('id', 'ui-sortable-' + multiId);
																							var uiSortable = document.querySelector('#ui-sortable-'
																									+ multiId);
																							//<ul class="ui-sortable"></ul>
																							//console.log(series);
																							args.detail.sort(
																											function(
																													a,
																													b) {
																											    if(a.name < b.name) return -1
																											    if(a.name > b.name) return 1
																											    return 0})
																									.forEach(
																											function(
																													d) {
																												//console.log(d);

																												var line = document
																														.createElement('div');
																												line.className = 'line';

																												var swatch = document
																														.createElement('div');
																												swatch.className = 'swatch';
																												swatch.style.backgroundColor = d.series.color;

																												var label = document
																														.createElement('span');
																												var symbol = '';
																												if (d.series.symbol != ''
																														&& d.series.symbol != 0) {
																													symbol = d.series.symbol + ' ';
																												}
																												label.className = 'label';

																												label.innerHTML = d.formattedYValue
																														+ " "
																														+ symbol
																														+ ": "
																														+ d.name;
																												//label.style.fontSize = "small";

																												line
																														.appendChild(swatch);
																												line
																														.appendChild(label);

																												uiSortable
																														.appendChild(line);

																												var dot = document
																														.createElement('div');
																												dot.className = 'dot';
																												dot.style.top = graph
																														.y(d.value.y0
																																+ d.value.y)
																														+ 'px';
																												dot.style.borderColor = d.series.color;

																												this.element
																														.appendChild(dot);

																												dot.className = 'dot active';

																												this
																														.show();

																											}, this);
																							var newLine = document
																									.createElement('div');
																							newLine.className = 'label';
																							newLine.innerHTML = '  ';
																							uiSortable
																									.appendChild(newLine);
																							
																							var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
																									{
																										graph : graph,
																										legend : legendDetails,
																										disabledColor : function() {
																											return 'rgba(0, 0, 0, 0.2)'
																										}
																									});

																							var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
																									{
																										graph : graph,
																										legend : legendDetails
																									});

																							var order = new Rickshaw.Graph.Behavior.Series.Order(
																									{
																										graph : graph,
																										legend : legendDetails
																									});

																						}
																					});

																	var hover = new Hover({
																		graph : graph
																	});
																	
																	
																	
																	var hoverDetail = new Rickshaw.Graph.HoverDetail(
																			{
																				graph : graph,
																				formatter : function(series, x, y) {
																					var symbol = '';
																					if (series.symbol != ''
																							&& series.symbol != 0) {
																						symbol = series.symbol;
																					}
																					y = +y.toFixed(2);
																					var date = '<span class="date">'
																							+ new Date(x * 1000)
																									.toUTCString()
																							+ '</span>';
																					var swatch = '<span class="detail_swatch" style="background-color: '
																							+ series.color
																							+ '"></span>';
																					var content = series.name
																							+ ": " + y
																							+ " " + symbol;
																					return content;
																				}
																			});
																	var ticksTreatment = 'glow';

																	var xAxis = new Rickshaw.Graph.Axis.Time(
																		{
																			graph : graph,
																			ticksTreatment : ticksTreatment
																		});
																xAxis
																		.render();

																var yAxis = new Rickshaw.Graph.Axis.Y(
																		{
																			graph : graph,
																			scale : linearScale,

																			orientation : 'left',
																			tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
																			ticksTreatment : ticksTreatment
																		});
																yAxis
																		.render();
																$('#loadingData').foundation('reveal', 'close');

																		},1000);}else{
																			console.log(laststream , datastream,lastfeed, feedId);
																			}
																});
										/*	}else{console.log('no update');
											if (lastfeed == feedId){
	
											console.log('laststream == datastream && lastfeed == feedId ');
											$('#loadingData').foundation('reveal', 'close');
											setTimeout(function() {																			// console.log(laststream.id);
											series.sort(function(a, b){
											    if(b.name < a.name) return -1;
											    if(b.name > a.name) return 1;
											    return 0;
											});
											var legend = new Rickshaw.Graph.Legend(
													{
														graph : graph,
														element : document
																.querySelector('#legend-'
																		+ multiId),
													});
											var legendDetails = new Rickshaw.Graph.Legend(
													{
														graph : graph,
														element : document
																.querySelector('#legendDetail-'
																		+ multiId),
													});

											var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
													{
														graph : graph,
														legend : legend,
														disabledColor : function() {
															return 'rgba(0, 0, 0, 0.2)'
														}
													});

											var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
													{
														graph : graph,
														legend : legend
													});

											var order = new Rickshaw.Graph.Behavior.Series.Order(
													{
														graph : graph,
														legend : legend
													});

											var preview = new Rickshaw.Graph.RangeSlider.Preview(
													{
														graph : graph,
														element : document
																.querySelector('#preview-'
																		+ multiId)
													});
											var legendDetail = document.querySelector('#legendDetail-'
													+ multiId);

											var Hover = Rickshaw.Class
											.create(
													Rickshaw.Graph.HoverDetail,
													{

														render : function(args) {

															$('#feed-' + multiId + ' .legend').addClass('hidden');
															$('#feed-' + multiId + ' .legendDetail').removeClass('hidden');
															$('#feed-' + multiId + ' .datastream-time').removeClass('hidden');

															
															$('#feed-'+ multiId+ ' .datastream-time').html(args.formattedXValue);
															$('#feed-'+ multiId+ ' .datastream-time').unbind();
															$('#feed-'+ multiId+ ' .datastream-time').click(function() {
																console.log('hidden');

																$('#feed-' + multiId + ' .legendDetail').addClass('hidden');
																$('#feed-' + multiId + ' .datastream-time').addClass('hidden');
																$('#feed-' + multiId + ' .legend').removeClass('hidden');

															});
															legendDetail.innerHTML = '';
															var sortable = document
															.createElement('ul');
															sortable.className = 'ui-sortable';
															legendDetail
															.appendChild(sortable);
															$('#legendDetail-' + multiId + ' .ui-sortable').attr('id', 'ui-sortable-' + multiId);
															var uiSortable = document.querySelector('#ui-sortable-'
																	+ multiId);
															//<ul class="ui-sortable"></ul>
															//console.log(series);
															args.detail.sort(
																			function(
																					a,
																					b) {
																			    if(a.name < b.name) return -1
																			    if(a.name > b.name) return 1
																			    return 0})
																	.forEach(
																			function(
																					d) {
																				//console.log(d);

																				var line = document
																						.createElement('div');
																				line.className = 'line';

																				var swatch = document
																						.createElement('div');
																				swatch.className = 'swatch';
																				swatch.style.backgroundColor = d.series.color;

																				var label = document
																						.createElement('span');
																				var symbol = '';
																				if (d.series.symbol != ''
																						&& d.series.symbol != 0) {
																					symbol = d.series.symbol + ' ';
																				}
																				label.className = 'label';

																				label.innerHTML = d.formattedYValue
																						+ " "
																						+ symbol
																						+ ": "
																						+ d.name;
																				//label.style.fontSize = "small";

																				line
																						.appendChild(swatch);
																				line
																						.appendChild(label);

																				uiSortable
																						.appendChild(line);

																				var dot = document
																						.createElement('div');
																				dot.className = 'dot';
																				dot.style.top = graph
																						.y(d.value.y0
																								+ d.value.y)
																						+ 'px';
																				dot.style.borderColor = d.series.color;

																				this.element
																						.appendChild(dot);

																				dot.className = 'dot active';

																				this
																						.show();

																			}, this);
															var newLine = document
																	.createElement('div');
															newLine.className = 'label';
															newLine.innerHTML = '  ';
															uiSortable
																	.appendChild(newLine);
															
															var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight(
																	{
																		graph : graph,
																		legend : legendDetails,
																		disabledColor : function() {
																			return 'rgba(0, 0, 0, 0.2)'
																		}
																	});

															var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle(
																	{
																		graph : graph,
																		legend : legendDetails
																	});

															var order = new Rickshaw.Graph.Behavior.Series.Order(
																	{
																		graph : graph,
																		legend : legendDetails
																	});

														}
													});

									var hover = new Hover({
										graph : graph
									});
									
									
									
									var hoverDetail = new Rickshaw.Graph.HoverDetail(
											{
												graph : graph,
												formatter : function(series, x, y) {
													var symbol = '';
													if (series.symbol != ''
															&& series.symbol != 0) {
														symbol = series.symbol;
													}
													y = +y.toFixed(2);
													var date = '<span class="date">'
															+ new Date(x * 1000)
																	.toUTCString()
															+ '</span>';
													var swatch = '<span class="detail_swatch" style="background-color: '
															+ series.color
															+ '"></span>';
													var content = series.name
															+ ": " + y
															+ " " + symbol;
													return content;
												}
											});
									var ticksTreatment = 'glow';

									var xAxis = new Rickshaw.Graph.Axis.Time(
										{
											graph : graph,
											ticksTreatment : ticksTreatment
										});
								xAxis
										.render();

								var yAxis = new Rickshaw.Graph.Axis.Y(
										{
											graph : graph,
											//scale : linearScale,

											orientation : 'left',
											tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
											ticksTreatment : ticksTreatment
										});
								yAxis
										.render();
								$('#loadingData').foundation('reveal', 'close');

										},1000);}
											}*/
										});
								
								/*
								console.log(series);
								var Seriesmin = 0;
								var Seriesmax = 0;
								var SeriesMinMax = 0;
								series.forEach(function(
										object) {
									object.forEach(function(
											data) {
								
								var min = 0;
								var max = 0;
								for (i = 0; i < data.length; i++) {
									min = Math
											.min(
													min,
													data.y);
									max = Math
											.max(
													max,
													data.y);
								}
								console.log(min);
								console.log(max);
								SeriesMinMax.push(min);
								SeriesMinMax.push(max);});});
								for (i = 0; i < SeriesMinMax.length; i++) {
									Seriesmin = Math
											.min(
													SeriesMinMax);
									Seriesmax = Math
											.max(
													SeriesMinMax);
								}
								console.log(Seriesmin);
								console.log(Seriesmax);

								*/



							
								/*var formScale = document
										.getElementsByName('scale');
								formScale[2].onclick = function() {
									changeScale(graph, formScale[2].value);
								}
								formScale[3].onclick = function() {
									changeScale(graph, formScale[3].value);
								}*/
								$('#feed-' + multiId + ' .interpolation')
								.attr('id',
										'interpolation-' + multiId);
								var form = document
										.getElementById('interpolation');
								
								$('#interpolation-'+ multiId+ ' .monotone')
								.click(function() {changeInterpolation(graph, 'monotone');});
								$('#interpolation-'+ multiId+ ' .cardinal')
								.click(function() {changeInterpolation(graph, 'cardinal');});
								$('#interpolation-'+ multiId+ ' .linear')
								.click(function() {changeInterpolation(graph, 'linear');});
								$('#interpolation-'+ multiId+ ' .step')
								.click(function() {changeInterpolation(graph, 'step-before');});
								$('#interpolation-'+ multiId+ ' .basis')
								.click(function() {changeInterpolation(graph, 'basis');});
								

							}	else{
								console.log('no feedData.datastreams');
								if (lastfeed == feedId) {
									console.log('lastfeed == feedId '); 
							}
								}
						});
	});
		}

	function hide_details() {
		
	}

		
	function set_filter() {
		var tag = set_filter.tag;
		var id = set_filter.id;
		var duration = set_filter.duration;
		var interval = set_filter.interval;
		updateFeed(id, duration, interval, tag);
	}
	function set_Multi_filter() {
		var tag = set_Multi_filter.tag;
		var id = set_Multi_filter.id;
		var duration = set_Multi_filter.duration;
		var interval = set_Multi_filter.interval;
		updateMultiFeeds(id, duration, interval, tag);
	}
	function changeScale(graph, scale) {
		console.log(scale);
		graph.configure({
			scale : scale
		});
		graph.update();
	}
	;
	function changeInterpolation(graph, interpolation) {
		console.log(graph);
		console.log(interpolation);
		graph.configure({
			interpolation : interpolation
		});
		graph.update();
	}
	;

	function setMultiFeeds(feeds) {

		console.log(feeds);

		$('#welcome').addClass('hidden');
		duration = '1hour';
		interval = 10;
		var thisFeedId, thisFeedDatastreams;

		feed = $('#feedsInput').val().replace(/\s+/g, '').split(',');

		feed.forEach(function(id) {
			if ($('#feed-' + id)) {
				$('#feed-' + id).remove();
			}
		});
		feedId = '0';
		if ($('#feed-' + feedId)) {
			$('#feed-' + feedId).remove();
		}
		$('#exampleFeed').clone().appendTo(
		'#feeds').attr('id',
		'feed-' + feedId).removeClass(
		'hidden');
$('#feed-' + feedId + ' .tags')
		.attr('id',
				'tags-' + feedId);
//$('#tags-' + feedId).addClass('hidden');
var tag = '';
var buttonnode = document
		.createElement('input');
buttonnode.setAttribute('type',
		'button');
buttonnode
		.setAttribute('class',
				'small button secondary');
buttonnode.setAttribute('name',
		'filter-All');
buttonnode.setAttribute(
		'value', 'All');
set_Multi_filter.tag = tag;
buttonnode.onclick = function() {
	filter = tag;
	duration = updateMultiFeeds.duration;
	interval = updateMultiFeeds.interval;
			$('#loadingData')
					.foundation(
							'reveal',
							'open'),

							set_Multi_filter.tag = '',// change to multi filter
							set_Multi_filter.id = feeds,
							set_Multi_filter.duration = lastDuration,
							set_Multi_filter.interval = lastInterval,
							set_Multi_filter()
};
var ul = document
		.getElementById('tags-0');
ul.appendChild(buttonnode);

$(
		'#feed-' + feedId + ' .title .value')
		.html("All");

// Date Updated
$(
		'#feed-' + feedId + ' .updated .value')
		.html(" ");

		feeds.forEach(function(id) {
					xively.feed
							.history(
									id,
									{
										duration : duration,
										interval : interval
									},
									function(feed_data) {
										//console.log(feed_data);
										if (feed_data.id == id) {
										var feedId = feed_data.id;
											
											if (feed_data.datastreams) {
												

												

												feed_data.datastreams
														.forEach(function(
																datastream) {
															if (datastream.tags) {
																$('#tags-' + feedId)
																		.removeClass(
																				'hidden');
																datastream.tags
																		.forEach(function(
																				tag) {
																			{
																				if (!document
																						.getElementById('filter-'
																								+ tag)) {
																					var buttonnode = document
																							.createElement('input');
																					buttonnode
																							.setAttribute(
																									'type',
																									'button');
																					buttonnode
																							.setAttribute(
																									'class',
																									'small button secondary');
																					buttonnode
																							.setAttribute(
																									'name',
																									'filter-'
																											+ tag);
																					buttonnode
																							.setAttribute(
																									'id',
																									'filter-'
																											+ tag);
																					buttonnode
																							.setAttribute(
																									'value',
																									tag);
																					set_Multi_filter.tag = tag;
																					buttonnode.onclick = function() {
																						filter = tag;
																								$(
																										'#loadingData')
																										.foundation(
																												'reveal',
																												'open'),
																												set_Multi_filter.tag = tag,//build multi filter
																												set_Multi_filter.id = feeds,
																												set_Multi_filter.duration = lastDuration,
																												set_Multi_filter.interval = lastInterval,
																												set_Multi_filter()
																					};
																					var ul = document
																							.getElementById('tags-0');
																					ul
																							.appendChild(buttonnode);
																				}
																			}
																		});

															}
														});
											}

											$(
													'#feed-'
															+ feedId
															+ ' .duration-onehour')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'1hour',
																		10,
																		filter);
																return false;
															});

											$(
													'#feed-' + feedId
															+ ' .duration-hour')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'6hours',
																		60,
																		filter);
																return false;
															});

											$(
													'#feed-' + feedId
															+ ' .duration-day')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'1day',
																		120,
																		filter);
																return false;
															});

											$(
													'#feed-' + feedId
															+ ' .duration-week')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'1week',
																		900,
																		filter);
																return false;
															});

											$(
													'#feed-'
															+ feedId
															+ ' .duration-month')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'1month',
																		1800,
																		filter);
																return false;
															});

											$(
													'#feed-' + feedId
															+ ' .duration-90')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateMultiFeeds(
																		feed_data.id,
																		'90days',
																		10800,
																		filter);
																return false;
															});

											// Handle Datastreams
											
										} else {
											// Duplicate Example to Build Feed
											// UI
											$('#exampleFeedNotFound').clone()
													.appendTo('#feeds').attr(
															'id', 'feed-' + id)
													.removeClass('hidden');
											$('#feed-' + id + ' h2').html(id);
										}
									});
				});
	
		if (defaultDuration != ''
			&& defaultInterval != 0) {
			updateMultiFeeds(feeds,
				defaultDuration,
				defaultInterval, '');
	} else {
		updateMultiFeeds(feeds, duration,
				interval, '');
	}
		
	}
		function setFeed(feed) {
		console.log(feed);

		$('#welcome').addClass('hidden');
		feed
				.forEach(function(id) {

					duration = '1hour';
					interval = 10;
					var thisFeedId, thisFeedDatastreams;

					feed = $('#feedsInput').val().replace(/\s+/g, '')
							.split(',');

					feed.forEach(function(id) {
						if ($('#feed-' + id)) {
							$('#feed-' + id).remove();
						}
					});
					if ($('#feed-0')) {
						$('#feed-0').remove();
					}
					xively.feed
							.history(
									id,
									{
										duration : duration,
										interval : interval
									},
									function(feed_data) {
										console.log(feed_data);
										if (feed_data.id == id) {
											var feedId = feed_data.id;
											$('#exampleFeed').clone().appendTo(
													'#feeds').attr('id',
													'feed-' + id).removeClass(
													'hidden');
											$('#feed-' + feedId + ' .tags')
													.attr('id',
															'tags-' + feedId);
											$(
													'#feed-' + feed_data.id
															+ ' .title .value')
													.html(feed_data.title);

											// Date Updated
											$(
													'#feed-'
															+ feed_data.id
															+ ' .updated .value')
													.html(feed_data.updated);

											if (feed_data.datastreams) {
												$('#tags-' + id).addClass(
														'hidden');

												var tag = '';
												var buttonnode = document
														.createElement('input');
												buttonnode.setAttribute('type',
														'button');
												buttonnode
														.setAttribute('class',
																'small button secondary');
												buttonnode.setAttribute('name',
														'filter-All');
												buttonnode.setAttribute(
														'value', 'All');
												set_filter.tag = tag;
												buttonnode.onclick = function() {
													filter = tag;
													duration = updateFeed.duration;
													interval = updateFeed.interval;
															$('#loadingData')
																	.foundation(
																			'reveal',
																			'open'),

															set_filter.tag = '',
															set_filter.id = feed_data.id,
															set_filter.duration = lastDuration,
															set_filter.interval = lastInterval,
															set_filter()
												};
												var ul = document
														.getElementById('tags-'
																+ id);
												ul.appendChild(buttonnode);

												feed_data.datastreams
														.forEach(function(
																datastream) {
															if (datastream.tags) {
																$('#tags-' + id)
																		.removeClass(
																				'hidden');
																datastream.tags
																		.forEach(function(
																				tag) {
																			{
																				if (!document
																						.getElementById('filter-'
																								+ tag)) {
																					var buttonnode = document
																							.createElement('input');
																					buttonnode
																							.setAttribute(
																									'type',
																									'button');
																					buttonnode
																							.setAttribute(
																									'class',
																									'small button secondary');
																					buttonnode
																							.setAttribute(
																									'name',
																									'filter-'
																											+ tag);
																					buttonnode
																							.setAttribute(
																									'id',
																									'filter-'
																											+ tag);
																					buttonnode
																							.setAttribute(
																									'value',
																									tag);
																					set_filter.tag = tag;
																					buttonnode.onclick = function() {
																						filter = tag;
																								$(
																										'#loadingData')
																										.foundation(
																												'reveal',
																												'open'),
																								set_filter.tag = tag,
																								set_filter.id = feed_data.id,
																								set_filter.duration = lastDuration,
																								set_filter.interval = lastInterval,
																								set_filter()
																					};
																					var ul = document
																							.getElementById('tags-'
																									+ id);
																					ul
																							.appendChild(buttonnode);
																				}
																			}
																		});

															}
														});
											}

											$(
													'#feed-'
															+ feed_data.id
															+ ' .duration-onehour')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'1hour',
																		10,
																		filter);
																return false;
															});

											$(
													'#feed-' + feed_data.id
															+ ' .duration-hour')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'6hours',
																		60,
																		filter);
																return false;
															});

											$(
													'#feed-' + feed_data.id
															+ ' .duration-day')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'1day',
																		120,
																		filter);
																return false;
															});

											$(
													'#feed-' + feed_data.id
															+ ' .duration-week')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'1week',
																		900,
																		filter);
																return false;
															});

											$(
													'#feed-'
															+ feed_data.id
															+ ' .duration-month')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'1month',
																		1800,
																		filter);
																return false;
															});

											$(
													'#feed-' + feed_data.id
															+ ' .duration-90')
													.click(
															function() {
																$(
																		'#loadingData')
																		.foundation(
																				'reveal',
																				'open');
																updateFeed(
																		feed_data.id,
																		'90days',
																		10800,
																		filter);
																return false;
															});

											// Handle Datastreams
											if (defaultDuration != ''
													&& defaultInterval != 0) {
												updateFeed(feed_data.id,
														defaultDuration,
														defaultInterval, '');
											} else {
												updateFeed(data.id, duration,
														interval, '');
											}
										} else {
											// Duplicate Example to Build Feed
											// UI
											$('#exampleFeedNotFound').clone()
													.appendTo('#feeds').attr(
															'id', 'feed-' + id)
													.removeClass('hidden');
											$('#feed-' + id + ' h2').html(id);
										}
									});
				});
	}

	// END Function Declarations
	// BEGIN Initialization
	if (hideForm == 1) {
		$('#form').hide();
	}
	var today = new Date();
	var yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 1);
	var lastWeek = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 7);
	if (applicationName != '') {
		$('h1').html(applicationName).css('color', 'white');
		document.title = applicationName + ' - Powered by Xively';
	}
	if (dataColor == '') {
		dataColor = '0A1922';
	}
	var key = getParam('key');
	var feedString = getParam('feeds');
	var name = getParam('name');
	// Check for Default Values
	if (key == '' && defaultKey != '') {
		key = defaultKey;
	}
	$('#apiKeyInput').val(key);

	/*$("#apiKeyInput").mouseover(function() {
		console.log($("#apiKeyInput").prop('disabled'));
		if ($("#apiKeyInput").prop('disabled')) {
			$("#apiKeyInput").prop('disabled', false);
		}
	});*/
	if (key != '') {
		setApiKey($('#apiKeyInput').val());
	}
	if (name == '' && defaultName != '') {
		name = defaultName;
	}
	if (feedString == '' && defaultFeeds.toString(',') != '') {
		feedString = defaultFeeds.toString(',');
	}
	if (name != '' && key != '') {
		$('#userNameInput').val(name)
		xively.feed.list('user=' + name, function(feeds) {
			if (feeds.results) {
				console.log(feeds);
				var userFeeds = [];
				feeds.results.forEach(function(datastream) {
					userFeeds.push(datastream.id);
				});
				userFeedlist = userFeeds.toString(',');
				if (feedString == '') {
					feedString = userFeedlist;
				}
				$('#feedsInput').val(feedString);
				var feedList = feedString.split(',');
				set_feeds(feeds);
			}
		});
	} else if (key != '') {
		var feeds = feedString.split(',');
		$('#feedsInput').val(feedString);
		feeds = $('#feedsInput').val().replace(/\s+/g, '').split(',');

		if (feedString != '') { // setFeeds(feeds);
			set_feeds();
		}
	}
	/*if (key != '') {
		$("#apiKeyInput").prop('disabled', true);
	}*/
	function set_feeds(feed_list) {
		ga('send', 'event', 'button', 'set_feeds', location.href);
		if (key != '') {
			setApiKey($('#apiKeyInput').val());
			feeds = $('#feedsInput').val().replace(/\s+/g, '').split(',');
			// set feedid buttons click listeners
			var ul = document.getElementById('ids');
			if (feed_list) {
				// userFeedlist = feeds.toString(',');
				var userFeedlist = [];
				feed_list.results.forEach(function(feed) {
					userFeedlist.push(feed.id);
				});
				var buttonnode = document.createElement('input');
				buttonnode.setAttribute('value', "All");
				buttonnode.setAttribute('type', 'button');
				buttonnode.setAttribute('class',
						'small button secondary');
				buttonnode.setAttribute('name', 'feed-All');
				// buttonnode.setAttribute('value', name);
				set_feed.id = userFeedlist;
				buttonnode.onclick = function() {
					$('#loadingData').foundation('reveal', 'open'),
							set_feed.id = userFeedlist, set_feed(this,
									userFeedlist)
				};
				ul.appendChild(buttonnode);   // uncomment to get multi feed support  //////////////////////////////////////////////////
				feed_list.results.forEach(function(feed) {
					// var FeedIdString = '' + feed.id;
					if (jQuery.inArray(feed.id, userFeedlist) != -1) {
						var buttonnode = document.createElement('input');
						buttonnode.setAttribute('value', feed.title);
						buttonnode.setAttribute('type', 'button');
						buttonnode.setAttribute('class',
								'small button secondary');
						buttonnode.setAttribute('name', 'feed-' + feed.id);
						// buttonnode.setAttribute('value', name);
						set_feed.id = feed.id;
						buttonnode.onclick = function() {
							$('#loadingData').foundation('reveal', 'open'),
									set_feed.id = feed.id, set_feed(this,
											feed.id)
						};
						ul.appendChild(buttonnode);
						$('#ids').removeClass('hidden');
					}
				});
			} else if (feeds[1] >= 1) {
				feeds.forEach(function(feed) {
					var name = '';
					xively.feed.get(feed, function(data) {
						if (data.id == feed) {
							buttonnode.setAttribute('value', data.title);
						}
					});
					var buttonnode = document.createElement('input');
					buttonnode.setAttribute('type', 'button');
					buttonnode.setAttribute('class', 'small button secondary');
					buttonnode.setAttribute('name', 'feed-' + feed);
					buttonnode.setAttribute('value', name);
					set_feed.id = feed;
					buttonnode.onclick = function() {
						$('#loadingData').foundation('reveal', 'open'),
								set_feed.id = feed, set_feed(this, feed)
					};
					ul.appendChild(buttonnode);
					$('#ids').removeClass('hidden');
				});
			} else {
				$('#ids').addClass('hidden');
			}
		}
		var def = [ $('#feedsInput').val().replace(/\s+/g, '').split(',')[0] ];
		lastDuration = defaultDuration;
		lastInterval = defaultInterval;
		setFeed(def);
	}

	function set_feed() {
		var id = set_feed.id;
		if (id[1]>0){
			setMultiFeeds( id );
		}else{
		setFeed( [id ]);}
		
		
	}

	/*if (key != '') {
		$("#apiKeyInput").prop('disabled', true);
	}*/

	$('#apiKeyInput').change(function() {
		if ($('#apiKeyInput').val() == '') {
			$('#welcome').addClass('hidden');
			$('#invalidApiKey').removeClass('hidden');
			$('#validApiKey').addClass('hidden');
		} else {
			xively.setKey($('#apiKeyInput').val());
			xively.feed.get(61916, function(data) {
				if (data.id == 61916) {
					console.log("Valid apiKeyInput");

					$("#apiKeyInput").prop('disabled', true);
					$('#welcome').addClass('hidden');
					$('#validApiKey').removeClass('hidden');
					$('#invalidApiKey').addClass('hidden');
				} else {
					console.log("Invalid apiKeyInput");

					$('#welcome').addClass('hidden');
					$('#validApiKey').addClass('hidden');
					$('#invalidApiKey').removeClass('hidden');
				}
			});
		}
		return false;
	});
	$('#setFeeds').click(
			function() {
				setApiKey($('#apiKeyInput').val());
				name = $('#userNameInput').val();
				feeds = $('#feedsInput').val().replace(/\s+/g, '').split(',');
				window.location = './index.html#key=' + $('#apiKeyInput').val()
						+ '&feeds=' + $('#feedsInput').val() + '&name='
						+ $('#userNameInput').val();
				location.reload();
				return false;
			});
	// END Initialization

})(jQuery);
