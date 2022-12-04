import js.Browser.*;

function main() {
	trace('dummy');
}

@:expose('initGoogleMap')
function initGoogleMap() {
	final container = document.createDivElement();
	container.style.height = '100vh';
	document.body.appendChild(container);
	
	final map = new google.maps.Map(container, {
		center: { lat: -34.397, lng: 150.644 },
		zoom: 8,
	});
}