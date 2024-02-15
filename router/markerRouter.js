const router = require("express").Router();
const { Markers, Coordinates } = require("../models/marker");
require("dotenv").config();

router.get("/all", async (req, res) => {
  try {
    const cafeList = await Markers.find();

    const result = {
      cafes: cafeList,
    };

    console.log("데이터", result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 마커 데이터 추가
router.post("/add", async (req, res) => {
  try {
    const { address, category, coordinates } = req.body;

    const findMarker = await Markers.findOne({ address: address });

    if (findMarker) {
      res
        .status(400)
        .json({ error: "이미 해당 주소로 등록된 마커가 존재합니다." });
    }

    const newMarker = new Markers({
      address: address,
      category: category,
      coordinates: coordinates,
    });

    // 새로운 마커 저장
    await newMarker.save();

    res
      .status(200)
      .json({ message: "데이터가 성공적으로 추가되었습니다.", newMarker });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
