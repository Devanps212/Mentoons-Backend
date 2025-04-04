const express = require("express");
const {
  subscribeNewsletter,
  getLeadData,
  freeDownloadsRequest,
  freeDownloadsVerifyOtp,
  freeDownloadComic,
  sendEmailToUser,
} = require("../controllers/emailController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/subscribeToNewsletter", subscribeNewsletter);
router.post("/free-downloads", freeDownloadComic);
router.post("/freeDownloadClaim", freeDownloadComic);
router.get("/getLeadData", authMiddleware, getLeadData);
router.post("/sendEmail", sendEmailToUser);
router.post("/freeDownloadsVerify", freeDownloadsVerifyOtp);
router.post("/freeDownloadsReq", freeDownloadsRequest);

module.exports = router;
