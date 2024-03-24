const getMarkersByCategory = (markers, category) => {
  const userMarkers = [];

  markers.forEach((marker) => {
    if (marker.category === category) {
      userMarkers.push(marker);
    }
  });
  return userMarkers;
};

const getCoffeeMarkers = (markers) => {
  return getMarkersByCategory(markers, "커피류");
};

const getDessertMarkers = (markers) => {
  return getMarkersByCategory(markers, "디저트");
};

module.exports = {
  getCoffeeMarkers,
  getDessertMarkers,
};
