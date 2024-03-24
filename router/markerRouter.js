const router = require("express").Router();
const axios = require("axios");
const { Markers } = require("../models/users");
require("dotenv").config();
// utils
const distanceBetweenMarker = require("../utils/distanceBetweenMarker");
const getMarkersByCategory = require("../utils/getMarkersByCategory");

// 모든 마커
router.get("/all", async (req, res) => {
  try {
    const markers = await Markers.find();

    if (!markers) {
      res.status(404).json(markers);
    }

    res.status(200).json(markers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 페이지네이션
router.get("/pagination", async (req, res) => {
  try {
    // 쿼리 파라미터
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const user = req.query.user;
    const category = req.query.category;

    const markerFind = await Markers.find({ useremail: user });

    if (!markerFind && !user) {
      res.status(404).json({ markerFind, user });
    }

    let getMarkers;
    if (category !== "디저트") {
      const coffeeMarkers = getMarkersByCategory.getCoffeeMarkers(
        markerFind,
        category
      );
      getMarkers = coffeeMarkers;
    } else {
      const dessertMarkers = getMarkersByCategory.getDessertMarkers(
        markerFind,
        category
      );
      getMarkers = dessertMarkers;
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const markers = getMarkers.slice(startIndex, endIndex);
    const lastIndex = Math.ceil(getMarkers.length / pageSize);
    let lastPage;

    if (markers.length < pageSize && lastIndex) {
      lastPage = true;
    } else {
      lastPage = false;
    }

    const response = {
      page: page,
      pageSize: pageSize,
      totalMarkers: getMarkers.length,
      totalPages: lastIndex,
      markers: markers,
      lastPage: lastPage,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 마커 추가
router.post("/add", async (req, res) => {
  try {
    const { address, category, coordinates, useremail } = req.body;

    const findMarker = await Markers.findOne({ address: address });

    if (findMarker) {
      return res
        .status(400)
        .json({ error: "이미 해당 주소로 등록된 마커가 존재합니다." });
    }

    const getMarker = await Markers.find();

    // WGS84 -> WTM
    const response = await axios.get(
      "https://dapi.kakao.com/v2/local/geo/transcoord.json",
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
        params: {
          x: String(coordinates[0].latitude),
          y: String(coordinates[0].longitude),
          output_coord: "WTM",
        },
      }
    );

    if (response.status === 200) {
      const data = response.data;
      const positions = [
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          x: data.documents[0].x,
          y: data.documents[0].y,
        },
      ];

      let coffeeCoordinates = [];
      let dessertCoordinates = [];

      getMarker.forEach((marker) => {
        marker.coordinates.forEach((coordinate) => {
          if (marker.category !== "디저트") {
            coffeeCoordinates.push(coordinate);
          } else {
            dessertCoordinates.push(coordinate);
          }
        });
      });

      // 현재 마커와 가장 가까운 마커와의 거리를 계산
      // 80m 이상이면 false 아니면 true
      let distance;
      if (category !== "디저트") {
        distance = distanceBetweenMarker(coffeeCoordinates, positions);
      } else {
        distance = distanceBetweenMarker(dessertCoordinates, positions);
      }

      if (distance !== null && distance === false) {
        return res.status(403).json({
          error: "다른 마커와의 거리가 80m 이상이어야 합니다.",
        });
      }

      const newMarker = new Markers({
        useremail: useremail,
        address: address,
        category: category,
        coordinates: positions,
      });

      // 새로운 마커 저장
      await newMarker.save();

      return res.status(200).json({
        message: "데이터가 성공적으로 추가되었습니다.",
        newMarker,
      });
    }
  } catch (error) {
    console.log("message", error);
    res.status(500).json({ error: error.message });
  }
});

// 마커 삭제
router.delete("/marker_delete", async (req, res) => {
  try {
    const { address } = req.body;

    const deleteMarker = await Markers.deleteOne({ address: address }).exec();

    if (!deleteMarker) {
      // 일치하는 주소가 없을 시
      console.log(
        res.status(404).send({ message: "삭제할 마커를 찾을 수 없습니다." })
      );
      return res
        .status(404)
        .send({ message: "삭제할 마커를 찾을 수 없습니다." });
    }
    res.status(200).send({ message: "마커가 성공적으로 삭제되었습니다." });
  } catch (err) {
    res.status(500).send({ message: "서버 에러가 발생했습니다.", error: err });
  }
});

module.exports = router;
