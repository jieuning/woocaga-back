const router = require("express").Router();
const axios = require("axios");
const { Markers } = require("../models/users");
require("dotenv").config();
const distanceBetweenMarker = require("../utils/distanceBetweenMarker");

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

// category가 "디저트"인 마커
router.get("/desserts", async (req, res) => {
  try {
    const desserts = await Markers.find({ category: "디저트" });

    if (!desserts) res.status(404).json("일치하는 데이터가 존재하지 않습니다.");
    res.status(200).json(desserts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// category가 "커피"인 마커
router.get("/coffee", async (req, res) => {
  try {
    const desserts = await Markers.find({ category: "커피류" });

    if (!desserts) {
      res.status(404).json("일치하는 데이터가 존재하지 않습니다.");
    }

    res.status(200).json(desserts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 마커 추가
router.post("/add", async (req, res) => {
  try {
    const { address, category, coordinates } = req.body;

    const findMarker = await Markers.findOne({ address: address });
    const getMarker = await Markers.find();

    let coffeeCoordinates = [];
    let dessertCoordinates = [];

    getMarker.forEach((marker) => {
      marker.coordinates.forEach((coordinate) => {
        if (marker.category === "커피류") {
          coffeeCoordinates.push(coordinate);
        } else {
          dessertCoordinates.push(coordinate);
        }
      });
    });

    if (findMarker) {
      return res
        .status(400)
        .json({ error: "이미 해당 주소로 등록된 마커가 존재합니다." });
    }

    // WGS84 -> WTM
    const response = await axios.get(
      "https://dapi.kakao.com/v2/local/geo/transcoord.json",
      {
        headers: {
          Authorization: `KakaoAK ${process.env.VITE_KAKAO_REST_API_KEY}`,
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

      // 현재 마커와 가장 가까운 마커와의 거리를 계산
      // 100 초과면 false 아니면 true
      const distance = coffeeCoordinates
        ? distanceBetweenMarker(coffeeCoordinates, positions)
        : distanceBetweenMarker(dessertCoordinates, positions);

      if (distance === true) {
        return res
          .status(403)
          .json({ error: "다른 마커와의 거리가 80m이상이여야 합니다." });
      }

      const newMarker = new Markers({
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

module.exports = router;
