const distanceBetweenMarker = (coordinates, positions) => {
  let result = null;
  const currentMarkerWtmX = positions[0].x;
  const currentMarkerWtmY = positions[0].y;

  result = coordinates.reduce((closest, coordinate) => {
    const markerWtmX = coordinate.x;
    const markerWtmY = coordinate.y;

    if (markerWtmX !== undefined && markerWtmY !== undefined) {
      // 두 지점 사이의 거리를 계산
      const distance = Math.sqrt(
        Math.pow(currentMarkerWtmX - markerWtmX, 2) +
          Math.pow(currentMarkerWtmY - markerWtmY, 2)
      );
      const roundedDistance = Math.round(distance);

      if (closest === null || distance < closest.distance) {
        return { marker: coordinate, distance: roundedDistance };
      }
    }
    return closest;
  }, null);

  if (result && result.distance >= 80) {
    return false;
  } else {
    return true;
  }
};

module.exports = distanceBetweenMarker;
