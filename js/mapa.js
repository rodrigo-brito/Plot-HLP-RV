var geocoder;
var map;
var marker;
var bounds;
var service;
var directionsService;
var listaRotas = []; 
var listaMarcadores = [];
//icones
var iconTemporario;
var iconSalvo;
var iconNo;
var iconHub;


var lugares = [];
var matrizDistancia = [];
var iteracoesPorLinha;
var iteracao;
var numLinhas;
var linhaAtual;
erro = 0;

var cidades = [];

var cordenadas = [];
var solucao = [];

function initialize() {
	//cordenada inicial (IFMG)
	var latlng = new google.maps.LatLng(-19.8950405, -43.79351650000001);

	var configStyle = [ { 
	  "featureType": "water", 
	  "stylers": [ { 
	    "color": "#dddddd",
	    "visibility": "on" } 
	    ] 
	  },{ 
	  "featureType": "landscape", 
	  "elementType": "geometry", 
	  "stylers": [ { 
	    "color": "#ffffff" } 
	   ] 
	  },{ 
	  "featureType": "administrative", 
	  "elementType": "labels.text", 
	  "stylers": [
	      { "visibility": "on" },
	      { "color": "#000000" },
	      { "weight": 0.1 }
	    ] 
	  },{ 
	  "featureType": "administrative", 
	  "elementType": "labels.text.stroke", 
	  "stylers": [ { 
	  	"color": "#000000",
	    "visibility": "on" } 
	    ] 
	  },{ 
	  "featureType": "road", 
	  "elementType": "geometry", 
	  "stylers": [ { 
	    "visibility": "off" } 
	    ] 
	  },{ 
	  "featureType": "poi", 
	  "elementType": "geometry.fill", 
	  "stylers": [ { 
	    "color": "#000000" }, { 
	    "visibility": "on" } 
	    ] 
	  },{ 
	  "featureType": "administrative.province", 
	  "stylers": [ { 
	    "visibility": "on" } 
	    ] 
	  },{ 
	  "featureType": "road", 
	  "elementType": "geometry.stroke", 
	  "stylers": [ { 
	    "color": "#ffffff" }, { 
	    "weight": 2 }, { 
	    "visibility": "off" } 
	    ] 
	  },{ 
	  "featureType": "road", 
	  "elementType": "labels", 
	  "stylers": [ { 
	    "visibility": "off" } 
	    ] 
	  },{ 
	  "featureType": "poi", 
	  "stylers": [ { 
	    "visibility": "off" } 
	    ] 
	  },{ 
	  "featureType": "transit", 
	  "stylers": [ { 
	    "visibility": "off" } 
	    ] 
	  },{ 
	  "featureType": "administrative.neighborhood", 
	  "stylers": [ { 
	    "visibility": "off" } 
	    ] 
	  },
	  {
	    "featureType": "administrative.province",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      { "color": "#000000" },
	      { "weight": 3 },
	      { "visibility": "on" }
	    ]
	  },
	  {
	    "featureType": "administrative.country",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      { "color": "#000000" },
	      { "weight": 3 },
	      { "visibility": "on" }
	    ]
	  }
	];

	var styledMap = new google.maps.StyledMapType(configStyle,
    {name: "Styled Map"});


	var options = {
		zoom: 6,
		center: latlng,
		//mapTypeId: google.maps.MapTypeId.ROADMAP, //mapa de rodovias
		types: ['geocode'],
  		componentRestrictions: {country: "br"}
	};
	


	//inicializa instancia do mapa e seleção de div
	map = new google.maps.Map(document.getElementById("mapa"), options);
	
	map.mapTypes.set('map_style', styledMap);
  	map.setMapTypeId('map_style');


	//inicializa localizador geográfico
	geocoder = new google.maps.Geocoder();

	//inicializa marcador do limite usado no mapa para zoom
	bounds = new google.maps.LatLngBounds();

	//inicializa serviço de Matriz de distancia
	service = new google.maps.DistanceMatrixService();

	//inicializa serviço para calculo de rotas para impressao
	directionsService = new google.maps.DirectionsService();

	iconHub = new google.maps.MarkerImage("img/icon_concentrador.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconNo = new google.maps.MarkerImage("img/icon_no.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconTemporario = new google.maps.MarkerImage("img/icon_base.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	iconSalvo = new google.maps.MarkerImage("img/icon_salvo.png", null, null, new google.maps.Point(25, 50), new google.maps.Size(50, 50));
	
	//inicializa marcador temporário de posição
	marker = new google.maps.Marker({
		map: map,
		draggable: true,
		icon: iconTemporario
	});

	carregarDados();

}

function carregarDados(){
	$.getJSON('data/cidades.json', function(data) {
		lugares = data.cidades;
	}).complete(function(){
		$.getJSON('data/alocacao.json', function(sol) {
			solucao = sol;
		}).complete(function(){
			$.getJSON('data/cordenadas.json', function(cord) {
				cordenadas = cord.cordenadas;
			});
		});
	});
}


//adiciona um marcador a lista de marcadores do mapa
function adicionarMarcador(location, titulo) {
	marcador = new google.maps.Marker({
		position: location,
		map: map,
		title: titulo,
		icon: iconSalvo
	});
	return listaMarcadores.push(marcador) - 1;
}

function adicionarMarcadorNo(location, titulo) {
	marcador = new google.maps.Marker({
		position: location,
		map: map,
		title: titulo,
		icon: iconNo
	});
	return listaMarcadores.push(marcador) - 1;
}

function adicionarMarcadorHub(location, titulo) {
	marcador = new google.maps.Marker({
		position: location,
		map: map,
		title: titulo,
		icon: iconHub
	});
	return listaMarcadores.push(marcador) - 1;
}

//faz leitura de todos os marcadores e da zoom de modo que todos os narcadores apareçam
function fitMapa(){
	bounds = new google.maps.LatLngBounds();
	for(var i = 0; i < listaMarcadores.length; i++){
		if(listaMarcadores[i].getMap() != null){
			bounds.extend(listaMarcadores[i].getPosition());
		}		
	}
	map.fitBounds(bounds);
}


function sleep(milliseconds) {
	var start = new Date().getTime();
	while(true) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

$(document).ready(function () {

	$('#saveSVG').click(function(event) {
		//$(this).href = map.toDataURL();
		var canvas = document.getElementById('mapa');
		var image = canvas.getContext('2d').toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
		window.location.href=image;
		//$(this).download = "mypainting.png";
	});

	initialize(); //inicializa serviços do google maps
	
	//salva ponto no mapa através de endereço formatado
	function carregarNoMapa(endereco) {
		geocoder.geocode({ 'address': endereco + ', Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					var enderecoFormatado = results[0].formatted_address;
		
					$('#txtEndereco').val(enderecoFormatado);

					var location = new google.maps.LatLng(latitude, longitude);
					marker.setPosition(null);
					indice = adicionarMarcador(location, enderecoFormatado);

					$('#lugares-vazio').hide('fast');
                   	itemLista = '<span class="list-group-item"><a href="#" data-latitude="'+latitude+'" data-longitude="'+longitude+'" class="lista-lugares">'+results[0].formatted_address+'</a><a href="#" class="remover-lugar" data-indice="'+indice+'" data-latitude="'+latitude+'" data-longitude="'+longitude+'"><span class="icon-remover-lugar glyphicon glyphicon-remove-circle"></span></a></span>';
					$('#listLugares').append(itemLista);

					fitMapa();
				}
			}
		})
	}


	//salva ponto no mapa através de endereço formatado
	function marcadorNo(endereco) {
		geocoder.geocode({ 'address': endereco + ', Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					var enderecoFormatado = results[0].formatted_address;

					var location = new google.maps.LatLng(latitude, longitude);
					indice = adicionarMarcadorNo(location, enderecoFormatado);

				}
			}
		})
	}

	function marcadorHub(endereco) {
		geocoder.geocode({ 'address': endereco + ', Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					var enderecoFormatado = results[0].formatted_address;

					var location = new google.maps.LatLng(latitude, longitude);
					indice = adicionarMarcadorHub(location, enderecoFormatado);

				}
			}
		})
	}
	
	//carrega marcador definitivo de endereço após clicar em botão
	$("#btnEndereco").click(function() {
		if($("#txtEndereco").val() != ""){
			carregarNoMapa($("#txtEndereco").val());
		}			
	});
	

	$( ".list-group" ).on( "click",'.lista-lugares',function() {
		var latitude = $(this).data('latitude');
		var longitude = $(this).data('longitude');
		var location = new google.maps.LatLng(latitude, longitude);
		map.setCenter(location);
		map.setZoom(15);
		
	});

	$( ".list-group" ).on( "click",'.remover-lugar',function() {
		var latitude = $(this).data('latitude');
		var longitude = $(this).data('longitude');
		var indice = $(this).data('indice');
		console.log('apgando '+indice);
		listaMarcadores[indice].setMap(null);

		$(this).closest('.list-group-item').remove();
		
	});

	//envento de click para posicionar marcador temporário
	google.maps.event.addListener(map, 'click', function(event) {		
		geocoder.geocode({ 'latLng': event.latLng }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					marker.setPosition(event.latLng);
					$('#txtEndereco').val(results[0].formatted_address);
				}
			}
		});
	});
	
	//evento de arraste do marcador temporário
	google.maps.event.addListener(marker, 'drag', function () {
		geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {  
					$('#txtEndereco').val(results[0].formatted_address);
				}
			}
		});
	});

	//gera tabela de instâncias ao clicar em botão
	$('#btnGerarInstancia').click(function() {

		lugares = [];

		$('.lista-lugares').each(function() {
			lugares.push($(this).text());
		});

		service.getDistanceMatrix({
			origins: lugares,
			destinations: lugares,
			travelMode: google.maps.TravelMode.DRIVING,
			avoidHighways: false, //apenas rodovias
			avoidTolls: false //sem pedágios
		}, function callback(response, status) {
			if (status == google.maps.DistanceMatrixStatus.OK) {

				var tabela = $('#matrizDistancia');
				tabela.html('');

				var origens = response.originAddresses;
				var destinos = response.destinationAddresses;

				linhaLabels = $('<tr></tr>');
				linhaLabels.append('<th>Origem / Destino</th>');//celula diagonal branca

				for (var i = 0; i < destinos.length; i++) {
					linhaLabels.append('<th>'+destinos[i]+'</th>');
				}
				tabela.append(linhaLabels);

				for (var i = 0; i < origens.length; i++) {
					var results = response.rows[i].elements;
					linha = $('<tr></tr>').append('<th>'+origens[i]+'</th>');
					for (var j = 0; j < results.length; j++) {
						var elemento = results[j];
						var distancia = elemento.distance.text;
						var duracao = elemento.duration.text;
						var from = origens[i];
						var to = destinos[j];

						linha.append('<td>'+distancia+'</td>');
					}
					tabela.append(linha);
				}
			}
		});

	});


	$('#btnPlotarSolucao').click(function(event) {		
		plotarSolucao();
	});

	function gerarInstancia(){
		//var lugares = ["Campo Grande","Londrina","São José do Rio Preto","Cuiabá","Brasília","Goiânia","Governador Valadares","Vila Velha","Belo Horizonte"];
		// 10 var lugares = ["Belo Horizonte","Uberaba","Juiz de Fora"];
		// 50 var lugares = ["Belo Horizonte","Araguari","Barbacena","Ipatinga"];
		// 100 
		var lugares = ["Santa Juliana","Ipatinga","Belo Horizonte","Montes Claros","Andradas","Barbacena"];
		for (var i = 0; i < lugares.length; i++) {
			$( carregarNoMapa(lugares[i]) ).delay( 1000 );
		};

		// Gerando matriz de distância
		service.getDistanceMatrix({
			origins: lugares,
			destinations: lugares,
			travelMode: google.maps.TravelMode.DRIVING,
			avoidHighways: false, //apenas rodovias -> False
			avoidTolls: false //sem pedágios -> False
		}, function callback(response, status) {
			if (status == google.maps.DistanceMatrixStatus.OK) {

				var tabela = $('#matrizDistancia');
				tabela.html('');

				var origens = response.originAddresses;
				var destinos = response.destinationAddresses;

				linhaLabels = $('<tr></tr>');
				linhaLabels.append('<th>Origem / Destino</th>');//celula diagonal branca

				for (var i = 0; i < destinos.length; i++) {
					linhaLabels.append('<th>'+destinos[i]+'</th>');
				}
				tabela.append(linhaLabels);

				for (var i = 0; i < origens.length; i++) {
					var results = response.rows[i].elements;
					linha = $('<tr></tr>').append('<th>'+origens[i]+'</th>');
					for (var j = 0; j < results.length; j++) {
						var elemento = results[j];
						var distancia = elemento.distance.text;
						var duracao = elemento.duration.text;
						var from = origens[i];
						var to = destinos[j];

						linha.append('<td>'+distancia+'</td>');
					}
					tabela.append(linha);
				}
			}
		});
	}

	$('#btnMuitosLugares').click(function(event) {
		gerarInstancia100();
	});

	function gerarInstancia100() {

		$.getJSON('data/cidades.json', function(data) {
			lugares = data.cidades;
		});

		var tabela = $('#matrizDistancia');
		tabela.html('');

		linhaLabels = $('<tr></tr>');
		linhaLabels.append('<th>Origem / Destino</th>');//celula diagonal branca
		for (var i = 0; i < lugares.length; i++) {
			linhaLabels.append('<th>'+lugares[i]+'</th>');
		}
		tabela.append(linhaLabels);

		matrizDistancia = new Array( numLinhas );
		numLinhas = lugares.length;
		iteracoesPorLinha = Math.ceil( numLinhas / 25 ); //25 ites por cada chamada
		iteracao = 0;
		linhaAtual = 0;
		linha_parar = linhaAtual+3;

		async.whilst(
			function () { return linhaAtual < numLinhas; },
			function(callback){	
				getMatrizDistancia(callback);
			},
			function (err) {
        		console.log("Erro: "+err);
    		}
    	);

	}

	function getMatrizDistancia(callback){

		var origem 	= 	[ lugares[linhaAtual] ];
		var colini 	= 	25*iteracao;
		var colfim 	=  	Math.min( 25*iteracao+25, lugares.length);
		var destino = 	lugares.slice(colini, colfim);
		var service = 	new google.maps.DistanceMatrixService();
		service.getDistanceMatrix({
			origins: origem,
			destinations: destino,
			travelMode: google.maps.TravelMode.DRIVING,
			avoidHighways: false, //apenas rodovias -> False
			avoidTolls: false //sem pedágios -> False
		}, function (response, status) {
			if (status === google.maps.DistanceMatrixStatus.OK) {

				if( iteracao === 0 ){//inicio da linha
					var linhaTabela = $('<tr class="linha-'+linhaAtual+'"></tr>').append('<th>'+lugares[linhaAtual]+'</th>');
					$('#matrizDistancia').append(linhaTabela);
					matrizDistancia[linhaAtual] = [];
				}

				//var origens = response.originAddresses;
				//var destinos = response.destinationAddresses;

				var results = response.rows[0].elements;
				for (var j = 0; j < results.length; j++) {
					var elemento = results[j];
					var dist = elemento.distance.value;

					matrizDistancia[linhaAtual].push(dist);
					$('.linha-'+linhaAtual).append('<td>'+dist+'</td>');
				}				

				iteracao++; //proxima iteracao
				if(iteracao >= iteracoesPorLinha){
					iteracao = 0;
					linhaAtual++;
				}
				callback();


			}else if (status === google.maps.DistanceMatrixStatus.OVER_QUERY_LIMIT) {    
	            var tempoRand = Math.floor((Math.random() * 1000) + 1000);
	            setTimeout(function() {
	                callback();
	            }, tempoRand);
	        }
		});		
	}

	function gerarLigacao(){		
		var hubs = [ 2, 5, 8 ];
		var alocacao = [ 2, 2, 2, 5, 5, 5, 8, 8, 8 ];

		for (var i = 0; i < listaMarcadores.length; i++) {
			listaMarcadores[i].setIcon(iconNo);
		};

		for(var i = 0; i < hubs.length; i++){

			listaMarcadores[ hubs[i] ].setIcon(iconHub);

			for (var j = i+1; j < hubs.length; j++) {
				criarLicacao( listaMarcadores[ hubs[i] ].getPosition(), listaMarcadores[ hubs[j] ].getPosition() );
			}
		}

		for (var i = 0; i < alocacao.length; i++) {
			if(alocacao[i] != i){
				criarLicacao( listaMarcadores[i].getPosition(), listaMarcadores[ alocacao[i] ].getPosition() );
			}
		};
	}

	function plotarSolucao(){

		var lugares = ["Santa Juliana","Ipatinga","Belo Horizonte","Montes Claros","Andradas","Barbacena"];		

		for(var i = 0; i<lugares.length; i++){			

			geocoder.geocode({ 'address': lugares[i] + ' - MG, Brasil', 'region': 'BR' }, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						var latitude = results[0].geometry.location.lat();
						var longitude = results[0].geometry.location.lng();
						var enderecoFormatado = results[0].formatted_address;
						marker.setPosition(null);
						var location = new google.maps.LatLng(latitude, longitude);						
						var indice = adicionarMarcador(location, enderecoFormatado);

						var objCidade = new Object();

						objCidade.nome = enderecoFormatado;
						objCidade.lat = latitude;
						objCidade.lng = longitude;
						objCidade.indice = indice;

						cidades.push(objCidade);
					}
				}
			});
		}

		console.log(cidades);
	}
	var retorno;
	function getLocation(endereco){
		geocoder.geocode({ 'address': endereco + ' - MG, Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					
					retorno =  new google.maps.LatLng(latitude, longitude);
				}
			}
		});
	}

	//main gambiarra
	
	$('#getDistanciaEuclidiana').click(function(event) {
		var tabela = $('#matrizDistancia');
		tabela.html('');

		linhaLabels = $('<tr></tr>');
		linhaLabels.append('<th>Origem / Destino</th>');//celula diagonal branca
		for (var i = 0; i < lugares.length; i++) {
			linhaLabels.append('<th>'+lugares[i]+'</th>');
		}
		tabela.append(linhaLabels);

		//calcula distancia das cidades restantes
		distanciaCidades(["Santa Bárbara", "São Francisco"]);

	});

	$('#btnAlocarNos').click(function(event) {
		alocacao();	
	});

	function indexCidade(cidade){
		for (i = 0; i < cordenadas.length; i++) {
		    if (cordenadas[i].nome === cidade) {
		        return i;
		    }
		}
	}


	function armazenarCordenadas(){
		for(var j = 0; j < solucao.hubs.length; j++){
			cordenadas.push({'nome':solucao.hubs[j], 'latLng': new Object()});
			//cordenadas[ solucao.hubs[j] ] = new Object();
			//for (var k = j+1; k < solucao.hubs.length; k++) {
				//criarLigacao( solucao.hubs[j], solucao.hubs[k] );
			//}
		}

		for(var i = 0; i < solucao.ligacoes.length; i++){
			cordenadas.push({'nome': solucao.ligacoes[i].no, 'latLng': new Object()});
			//cordenadas[ solucao.ligacoes[i].no ] = new Object();
			//criarLigacao( solucao.ligacoes[i].no, solucao.ligacoes[i].concentrador );
		}

		//console.log(cordenadas);
		//console.log(indexCidade("Uberlândia"));
		
		theNext();
	}

	/**
	 * Distância euclidiana entre duas cidades dadas
	 * @param  {String} cidadeOrigem  cidagem inicial do deslocamente
	 * @param  {String} cidadeDestino cidade final do deslocamento
	 * @return {Float}	Distância entre as duas cidades de entada em KM.
	 */
	function distanciaEuclidiana(cidadeOrigem, cidadeDestino){
		var latOrigem = cordenadas[indexCidade(cidadeOrigem)].latLng.k;
		var lonOrigem = cordenadas[indexCidade(cidadeOrigem)].latLng.D;

		var latDestino = cordenadas[indexCidade(cidadeDestino)].latLng.k;
		var lonDestino = cordenadas[indexCidade(cidadeDestino)].latLng.D;

		distanciaLat = Math.abs(latOrigem - latDestino) * 60 * 1852;
		distanciaLon = Math.abs(lonOrigem - lonDestino) * 60 * 1852;

		return Math.sqrt( distanciaLat*distanciaLat +  distanciaLon*distanciaLon );
	}

	function distanciaCidades(cidades){
		if(cidades.length>0){
			for (var i = 600; i < lugares.length; i++) {
				var linhaTabela = $('<tr class="linha-'+i+'"></tr>').append('<th>'+lugares[i]+'</th>');
				$('#matrizDistancia').append(linhaTabela);

				for (var j = 0; j < lugares.length; j++) {
					var dist = distanciaEuclidiana(lugares[i].replace(' - MG',''),lugares[j].replace(' - MG',''));
					$('.linha-'+i).append('<td>'+Math.floor(dist)+'</td>');
				}
			}
		}
	}



	$('#mesoResults').click(function(event) {
		var arquivoPlot = 'data/meso-results.json';
		plotarRotas(arquivoPlot);
	});

	$('#microResults').click(function(event) {
		var arquivoPlot = 'data/micro-results.json';
		plotarRotas(arquivoPlot);
	});

	$('#macroResults').click(function(event) {
		var arquivoPlot = 'data/macro-results.json';
		plotarRotas(arquivoPlot);
	});

	$('#btn-plot-manual').click(function(event) {
		event.preventDefault();
		var textoEntrada = $('#rotas-plot').val();
		try{

		}catch(err){
			alert('Erro de sintaxe, formato ideal:\n ["Cidade 1", "Cidade 2", "Cidade 3"]');
		}
		var rotas = JSON.parse( textoEntrada );

		var concentradores = [];
		//identificando hubs			
		for(var i = 0; i<rotas.length; i++){
			for(var j = 0; j<i; j++){
				if(rotas[i] === rotas[j] && concentradores.indexOf(rotas[i]) == -1){
					concentradores.push(rotas[i].replace("'",""));
				}
			}
		}

		//plotando ligacoes
		for(var i = 0; i<rotas.length-1; i++){

			if(concentradores.indexOf(rotas[i].replace("'","")) == -1 || concentradores.indexOf(rotas[i+1].replace("'","")) ==-1){
				var origem = new google.maps.LatLng(cordenadas[indexCidade(rotas[i].replace("'",""))].latLng.k, cordenadas[indexCidade(rotas[i].replace("'",""))].latLng.D);
				var destino = new google.maps.LatLng(cordenadas[indexCidade(rotas[i+1].replace("'",""))].latLng.k, cordenadas[indexCidade(rotas[i+1].replace("'",""))].latLng.D);
				var cod = [origem, destino];

				var ligacao = new google.maps.Polyline({
					path: cod,
					geodesic: true,
					strokeColor: '#000',
					strokeOpacity: 1,
					strokeWeight: 2,
					map: map
				});
			}
		}

	});

	function plotarRotas (arquivoPlot) {
		$.getJSON(arquivoPlot, function(data) {
			var rotas = data.rotas;
			var concentradores = [];
			//identificando hubs			
			for(var i = 0; i<rotas.length; i++){
				for(var j = 0; j<i; j++){
					if(rotas[i] === rotas[j] && concentradores.indexOf(rotas[i]) == -1){
						concentradores.push(rotas[i]);
					}
				}
			}

			//plotando ligacoes
			for(var i = 0; i<rotas.length-1; i++){

				if(concentradores.indexOf(rotas[i]) == -1 || concentradores.indexOf(rotas[i+1]) ==-1){
					var origem = new google.maps.LatLng(cordenadas[indexCidade(rotas[i])].latLng.k, cordenadas[indexCidade(rotas[i])].latLng.D);
					var destino = new google.maps.LatLng(cordenadas[indexCidade(rotas[i+1])].latLng.k, cordenadas[indexCidade(rotas[i+1])].latLng.D);
					var cod = [origem, destino];

					var ligacao = new google.maps.Polyline({
						path: cod,
						geodesic: true,
						strokeColor: '#000',
						strokeOpacity: 1,
						strokeWeight: 2,
						map: map
					});
				}
			}
		});
	}

	/**
	 * Plota as ligações retornadas no arquivo de plot "alocacao.json"
	 */
	function alocacao(){


		for(var j = 0; j < solucao.hubs.length; j++){
			//cordenadas[ solucao.hubs[j] ] = new Object();
			for (var k = j+1; k < solucao.hubs.length; k++) {

				//console.log("ligacao"+j);
				var origem = new google.maps.LatLng(cordenadas[indexCidade(solucao.hubs[j])].latLng.k, cordenadas[indexCidade(solucao.hubs[j])].latLng.D);
				var destino = new google.maps.LatLng(cordenadas[indexCidade(solucao.hubs[k])].latLng.k, cordenadas[indexCidade(solucao.hubs[k])].latLng.D);
				var cod = [origem, destino];

				var ligacao = new google.maps.Polyline({
					path: cod,
					geodesic: true,
					strokeColor: '#000',
					strokeOpacity: 1,
					strokeWeight: 4,
					map: map
				});

			}
		}

		for(var i = 0; i < solucao.ligacoes.length; i++){

			//console.log("ligacao"+i);

			var origem = new google.maps.LatLng(cordenadas[indexCidade(solucao.ligacoes[i].no)].latLng.k, cordenadas[indexCidade(solucao.ligacoes[i].no)].latLng.D);
			var destino = new google.maps.LatLng(cordenadas[indexCidade(solucao.ligacoes[i].concentrador)].latLng.k, cordenadas[indexCidade(solucao.ligacoes[i].concentrador)].latLng.D);
			var cod = [origem, destino];
			 
			var ligacao = new google.maps.Polyline({
				path: cod,
				geodesic: true,
				strokeColor: '#000',
				strokeOpacity: 1,
				strokeWeight: 2,
				map: map
			});

			//cordenadas[ solucao.ligacoes[i].no ] = new Object();
			//criarLigacao( solucao.ligacoes[i].no, solucao.ligacoes[i].concentrador );
		}




		//console.log(solucao);


		
		
		//criarLicacao( "Santa Juliana","Ipatinga");

		/*for (var i = 0; i < listaMarcadores.length; i++) {
			listaMarcadores[i].setIcon(iconNo);
		};


		for(var i = 0; i < hubs.length; i++){

			for (var j = i+1; j < hubs.length; j++) {
				criarLicacao( getLocation("Santa Juliana"), getLocation("Ipatinga"));
			}
		}

		for (var i = 0; i < alocacao.length; i++) {
			if(alocacao[i] != i){
				//zcriarLicacao( getLocation(lugares[hubs[i]]), getLocation(lugares[hubs[j]] ));
			}
		};*/
	}

	function criarRota(origem, destino){
		var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
		var directionsService = new google.maps.DirectionsService();
		directionsDisplay.setMap(map);
		var request = {
			origin: origem,
			destination: destino,
			travelMode: google.maps.TravelMode.DRIVING
		};
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(result);
			}
		});
		//rotas.push(directionsDisplay);
	}

	var delay = 100;

	function getAddress(search, next) {
        geocoder.geocode({address:search+ ' - MG, Brasil', 'region': 'BR'}, function (results,status)
          { 
            // If that was successful
            if (status == google.maps.GeocoderStatus.OK) {
              // Lets assume that the first marker is the one we want
              var p = results[0].geometry.location;
              var lat=p.lat();
              var lng=p.lng();
              var location = new google.maps.LatLng(lat, lng);
              cordenadas[indexCidade(search)].latLng = location;
              console.log("OK"+nextAddress);

				nextAddress++;
            }
            // ====== Decode the error status ======
            else {
              // === if we were sending the requests to fast, try this one again and increase the delay
              if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                //nextAddress--;
                delay++;
              } else {
                var reason="Code "+status;
                var msg = 'address="' + search + '" error=' +reason+ '(delay='+delay+'ms)<br>';
                //document.getElementById("messages").innerHTML += msg;
              }   
            }
            next();
          }
        );
      }

	var nextAddress = 800;

	function theNext() {
		if (nextAddress < 853) {
			setTimeout(function(){
				getAddress(cordenadas[nextAddress].nome,theNext);
			}, delay);
		} else {
			// We're done. Show map bounds
			console.log(cordenadas);
			//alocacao();
			$('.resultado').html('<pre>'+JSON.stringify(cordenadas)+'</pre>');
		}
	}

	

	function criarLigacao(origem, destino){

		var cordOrigem;
		var cordDestino;

		geocoder.geocode({ 'address': origem + ' - MG, Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					
					cordOrigem =  new google.maps.LatLng(latitude, longitude);
					
				}
			}else{
				alert(status);
				setTimeout(function(){
					criarLigacao(origem, destino);
				}, 500);
			}
		});	

		geocoder.geocode({ 'address': destino + ' - MG, Brasil', 'region': 'BR' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();

					cordDestino =  new google.maps.LatLng(latitude, longitude);

					cordenadas = [cordOrigem, cordDestino];

					var ligacao = new google.maps.Polyline({
						path: cordenadas,
						geodesic: true,
						strokeColor: '#000',
						strokeOpacity: 1,
						strokeWeight: 1,
						map: map
					});

					ligacao.setMap(map);
				}
			}else{
				alert(status);
				setTimeout(function(){
					criarLigacao(origem, destino);
				}, 500);
			}
		});

	}

	$('#btnGerarRota').click(function() {
		var hubs = [2, 3];
		var alocacao = [ 2, 2, 2, 3, 3, 3 ];

		for (var i = 0; i < listaMarcadores.length; i++) {
			listaMarcadores[i].setIcon(iconNo);
		};

		for(var i = 0; i < hubs.length; i++){

			listaMarcadores[ hubs[i] ].setIcon(iconHub);

			for (var j = i+1; j < hubs.length; j++) {
				criarRota( listaMarcadores[ hubs[i] ].getPosition(), listaMarcadores[ hubs[j] ].getPosition() );
			}
		}

		for (var i = 0; i < alocacao.length; i++) {
			if(alocacao[i] != i){
				criarRota( listaMarcadores[i].getPosition(), listaMarcadores[ alocacao[i] ].getPosition() );
			}
		};
	});

	//auto complete em endereço digitado
	$("#txtEndereco").autocomplete({
		source: function (request, response) {
			geocoder.geocode({ 'address': request.term + ', Brasil', 'region': 'BR' }, function (results, status) {
				response($.map(results, function (item) {
					return {
						label: item.formatted_address,
						value: item.formatted_address,
						latitude: item.geometry.location.lat(),
						longitude: item.geometry.location.lng()
					}
				}));
			});
		},
		select: function (event, ui) {
			var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
			marker.setPosition(location);
			map.setCenter(location);
			map.setZoom(15);
		}
	});
	
	$("form").submit(function(event) {
		event.preventDefault();
	});

	//Rotas para impressão de soluções
	
 
	

});