const multer = require("multer");
const Datauri = require("datauri/parser");
const path = require("path");
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("avatar");
const dUri = new Datauri();
console.log("gg", dUri);
const dataUri = (req) =>
  dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
module.exports = { dataUri, multerUploads };
