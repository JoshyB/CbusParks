function autoComplete(input, latInput, lngInput) {
  //skip if there is no input
  if (!input) return;

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener("place_changed", () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  //preventing people from hitting enter on the address form and accidentally submitting the form
  input.on("keydown", e => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });
}

export default autoComplete;
