'use strict';

/*
	Data 2 Visualize on map ...
*/
var museums = [
  {title: "Museo Nacional del Prado", lat: 40.413722, lng: -3.692412},
  {title: "Museo de Historia de Madrid", lat: 40.4259, lng: -3.70074},
  {title: "Museo Thyssen-Bornemisza", lat: 40.416111, lng: -3.695}, 
  {title: "Museo Reina Sofía", lat: 40.408889, lng: -3.694444},
  {title: "Museo de Arte Contemporáneo de Madrid", lat: 40.427852, lng: -3.710681},
  {title: "Museo Nacional de Antropología de Madrid", lat: 40.407694, lng: -3.688975},
  {title: "Museo Cerralbo", lat: 40.423684, lng: -3.714577},
  {title: "Museo Sorolla", lat: 40.435404, lng: -3.692539},
  {title: "Museo Romanticismo Madrid", lat: 40.425869, lng: -3.698839},
  {title: "Museo de América Madrid", lat: 40.438131, lng: -3.722069},
  {title: "Museo del Traje Madrid", lat: 40.44, lng: -3.728611},
  {title: "Museo Lázaro Galdiano", lat: 40.448189, lng: -3.683594},
  {title: "Museo del Ferrocarril Madrid", lat: 40.398333, lng: -3.694167},
  {title: "Museo del Aire Madrid", lat: 40.368744, lng: -3.80085},
  {title: "Museo Naval Madrid", lat: 40.417456, lng: -3.692804},
  {title: "Real Academia de Bellas Artes", lat: 40.418056, lng: -3.700278}
];

/*
	Map & Styles ...
*/
var map;
var map_styles = [{"featureType": "landscape", "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]}, {"featureType": "poi", "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]}, {"featureType": "road.highway", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "road.arterial", "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]}, {"featureType": "road.local", "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]}, {"featureType": "transit", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]}];
var markers =  [];
var infowindow;

/*
	Museum Class 2 build markers on map ...	
*/
var Museum = function(museum){
	var self = this;
	this.title = museum.title;
	this.lng = museum.lng;
	this.lat = museum.lat;
	infowindow = new google.maps.InfoWindow();
	this.marker = new google.maps.Marker({
		map: map,
		title: self.title,
		position: new google.maps.LatLng(self.lat, self.lng)
	});

	this.marker.addListener('click', function(){
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.visible = ko.observable(true);
	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.fromNeo2Map = function() {

		/*
			Neo4j call 2 recover DataBase info ...
		*/
		var neo4jTimeout = setTimeout(function(){
			self.infoMuseum = '<div class="info-window"><div class="museum-title">'  + self.title + '</div>';
        	self.infoMuseum = self.infoMuseum + '<div> Apologizes, Museum´s Info not available right now ... </div>';
        	infowindow.setContent(self.infoMuseum);
  		}, 3000);
		
		$.ajaxSetup({
		    headers: {
		        "Authorization": "Basic bmVvNGo6bmVvNGowMQ==" 
		    }
		});

		$.ajax({
			type: "POST",
			dataType: "json",
		    contentType: "application/json;charset=UTF-8",
		    url: "http://192.168.33.10:7474/db/data/transaction/commit ",
		    data: JSON.stringify({
		      statements: [{
		        statement: "MATCH(W:WEB)-[]->(M:MUSEUM{NAME: {name}})<-[]-(I:IMAGE) RETURN W.URL, I.SRC",
		        parameters: {
		          name: self.title
		        }
		      }]
		    }),

		    success: function (data, textStatus, jqXHR) {
		        if(typeof data.results[0].data[0] != 'undefined'){
		          var record = data.results[0].data[0].row;
		          self.infoMuseum = '<div class="info-window"><div class="museum-title">'  + self.title + '</div>';
		          self.infoMuseum = self.infoMuseum + '<hr><div><img src="' + record[1] + '" alt="' + self.title + '" height="150" width="250"></div><p></p>';
		          self.infoMuseum = self.infoMuseum + '<div><a href="' + record[0] + '">Visit its web</a></div></div>';
		          clearTimeout(neo4jTimeout);
		        }
		        else{
		        	self.infoMuseum = '<div class="info-window"><div class="museum-title">'  + self.title + '</div>';
		        }
		    },

		    error: function (jqXHR, textStatus, errorThrown) {
		        self.infoMuseum = '<div> Upps ... it seems neo4j is not available  ... </div>';
        		infowindow.setContent(self.infoMuseum);
        		alert(errorThrown);
		    }
		});

	}();

	/*
		Function 2 Show museum info ...
	*/
	this.openInfowindow = function() {
		infowindow.close();
		map.panTo(self.marker.getPosition())
		infowindow.setContent(self.infoMuseum);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
        	setTimeout(function() {
          	self.marker.setAnimation(null);
      	}, 2100);
		infowindow.open(map,self.marker);
	};

	/*
		Marker listener ...
	*/
	this.marker.addListener('click', function(){
		infowindow.setContent(self.infoMuseum);
		infowindow.open(map, this);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});
	this.addListener = google.maps.event.addListener(self.marker,'click', (this.openInfowindow));
	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");
	this.museumsList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 14,
			center: {lat: 40.419272, lng: -3.693125}
	});
	map.set('styles', map_styles);
	museums.forEach(function(museum){
		self.museumsList.push(new Museum(museum));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.museumsList().forEach(function(museum){
				museum.visible(true);		
			});
			return self.museumsList();
		} else {
			return ko.utils.arrayFilter(self.museumsList(), function(museum) {
				var string = museum.title.toLowerCase();
				var result = (string.search(filter) >= 0);
				museum.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function initMap() {
	ko.applyBindings(new AppViewModel());
}

function errorConnection() {
	alert("Please check your Internet Connection, it seems it is not working ...");
}
