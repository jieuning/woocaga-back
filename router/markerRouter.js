const router = require("express").Router();
const { Markers } = require("../models/users");
require("dotenv").config();

// 모든 마커
router.get("/all", async (req, res) => {
  try {
    const markers = await Markers.find();

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

    if (findMarker) {
      return res
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

    return res
      .status(200)
      .json({ message: "데이터가 성공적으로 추가되었습니다.", newMarker });
  } catch (error) {
    console.log("message", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
