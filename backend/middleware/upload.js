const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("crypto").webcrypto ? 
  { v4: () => require("crypto").randomUUID() } : 
  require("crypto");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const uploadToS3 = async (file) => {
  const key = `profiles/${require("crypto").randomUUID()}-${file.originalname}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = { upload, uploadToS3 };
