import JointsPartModel from '../models/joints-parts.js';
import dotenv from 'dotenv';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const endpoint = process.env.ENDPOINT;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
  endpoint: endpoint,
});

export const addJointsPart = async (req, res) => {
  const {
    brand,
    partName,
    divisibility,
    packQuantity,
    units,
    unitWeightKg,
    unitVolumeM3,
    isCompensator,
  } = req.body;
  try {
    const imageURL = `pgk/images/joints-parts/${units}`;
    const params = {
      Bucket: bucketName,
      Key: imageURL,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const jointsPartWithImageURL = {
      brand,
      partName,
      divisibility: Number(divisibility),
      packQuantity: Number(packQuantity),
      units,
      unitWeightKg: Number(unitWeightKg),
      unitVolumeM3: Number(unitVolumeM3),
      isCompensator: Boolean(isCompensator),
      imageURL: `${endpoint}/${bucketName}/${imageURL}`,
    };

    const newJointsPart = await JointsPartModel.create(jointsPartWithImageURL);
    await newJointsPart.save();

    const savedJointPart = await JointsPartModel.findOne({
      _id: newJointsPart._id,
    })
      .populate('units')
      .exec();
    /*const newJointPart = await JointsPartModel.create({ ...jointPart });

    await newJointPart.save();

    const savedJointPart = await JointsPartModel.findOne({
      _id: newJointPart._id,
    })
      .populate('units')
      .exec();*/

    return res.status(200).json(savedJointPart);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};
