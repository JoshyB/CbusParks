import axios from "axios";
import { $ } from "./bling";

const mapOptions = {
  center: { lat: 39.962, lng: -82.999 },
  zoom: 11
};

function loadPlaces(map, lat = 39.962, lng = -82.999) {
  axios.get(`/api/parks/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert("No parks found. Sorry");
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });
      marker.place = place;
      return marker;
    });
    markers.forEach(marker =>
      marker.addListener("click", function() {
        console.log(this.place.slug);
        const html = `
          <div class="popup">
            <a href="/park/${this.place.slug}">
              <img src="/uploads/${this.place.photo ||
                "parkGeneric.jpg"}" alt="${this.place.name}">
            </a>
            <p>${this.place.name} - ${this.place.location.address}</p>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      })
    );

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  //make the map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  const autoComplete = new google.maps.places.Autocomplete(input);
  autoComplete.addListener("place_changed", () => {
    const place = autoComplete.getPlace();
    loadPlaces(
      map,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
  });
}

export default makeMap;
