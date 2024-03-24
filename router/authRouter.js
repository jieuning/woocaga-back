const router = require("express").Router();
const authenticateToken = require("../middleware/authenticateToken");
const { User, Markers } = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const key = process.env.JWT_SECRET;
    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 해싱된 값과 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(isPasswordValid);
      return res
        .status(401)
        .json({ code: 401, message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      {
        type: "accessToken",
        email: email,
      },
      key,
      {
        expiresIn: "3h",
        issuer: "jieun",
      }
    );

    return res.status(200).json({
      code: 200,
      message: "토큰이 생성되었습니다.",
      email: email,
      token: token,
    });
  } catch (error) {
    return res.status(419).json({
      code: 419,
      message: error,
    });
  }
});

// 토큰 재발급
router.post("/refresh", (req, res) => {
  const key = process.env.JWT_SECRET;
  const accessToken =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (accessToken === undefined) {
    return res.status(401).json({
      code: 401,
      message: "리프레시 토큰이 없습니다.",
    });
  }

  // 토큰 검증 및 새로운 엑세스 토큰 발급
  jwt.verify(accessToken, key, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: "리프레시 토큰이 유효하지 않습니다.",
      });
    }

    // 새로운 엑세스 토큰 발급
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        type: "newAccessToken",
      },
      key,
      {
        expiresIn: "3h",
        issuer: "jieun",
      }
    );

    // 새로운 엑세스 토큰을 클라이언트에게 응답
    res.status(200).json({ newAccessToken: newAccessToken });
  });
});

// 유저 회원 탈퇴
router.delete("/delete", authenticateToken, async (req, res) => {
  try {
    const email = req.decoded.email;
    const userDelete = await User.deleteOne({ email: email });
    const markerDelete = await Markers.deleteMany({ useremail: email });

    if (!userDelete) {
      return res.status(404).json({
        message: "일치하는 유저가 존재하지 않습니다.",
      });
    }
    if (!markerDelete) {
      return res.status(404).json({
        message: "일치하는 마커 데이터가 존재하지 않습니다.",
      });
    }

    return res.status(200).json({
      message: "회원 탈퇴가 성공적으로 완료되었습니다.",
    });
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = router;
