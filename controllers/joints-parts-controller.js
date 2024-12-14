import JointsPartModel from '../models/joints-parts.js';
import dotenv from 'dotenv';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { JOINTS_PARTS_IMAGE_BASE_PATH } from '../constants/constants.js';
import crypto from 'crypto';

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

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

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
    const existingPart = await JointsPartModel.findOne({ partName });
    if (existingPart) {
      return res.status(400).json({ message: 'Such part already exists' });
    }

    const imageURL = JOINTS_PARTS_IMAGE_BASE_PATH + randomImageName();
    const params = {
      Bucket: bucketName,
      Key: imageURL,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    /* const imageURL = JOINTS_PARTS_IMAGE_BASE_PATH + units;
    const params = {
      Bucket: bucketName,
      Key: imageURL,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);*/

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

    const savedJointsPart = await JointsPartModel.findOne({
      _id: newJointsPart._id,
    })
      .populate('units')
      .exec();

    return res.status(200).json(savedJointsPart);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const getJointsParts = async (req, res) => {
  const { searchName } = req.query;
  try {
    if (!searchName) {
      const allJointsParts = await JointsPartModel.find()
        .populate('units')
        .exec();
      return res.status(200).json(allJointsParts);
    }
    const jointsPartsFilteredBySearchName = await JointsPartModel.find({
      partName: { $regex: new RegExp(searchName, 'i') },
    })
      .populate('units')
      .exec();
    return res.status(200).json(jointsPartsFilteredBySearchName);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const deleteJointsPart = async (req, res) => {
  const { partId } = req.params;
  try {
    const jointsPart = await JointsPartModel.findOne({
      _id: partId,
    })
      .populate('units')
      .exec();

    if (!jointsPart) {
      return res
        .status(404)
        .json({ message: 'No joints part with the requested id found.' });
    }
    const edgeIndexImageURL = `${endpoint}/${bucketName}/`.length;
    const imageURL = jointsPart.imageURL.slice(edgeIndexImageURL);

    const params = {
      Bucket: bucketName,
      Key: imageURL,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    const deletedJointsPart = await JointsPartModel.findByIdAndDelete({
      _id: partId,
    });

    if (!deletedJointsPart) {
      return res
        .status(404)
        .json({ message: 'No joints part with the requested id found.' });
    }

    return res.status(200).json({ status: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const updateJointsPart = async (req, res) => {
  const { partId } = req.params;
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
    const jointsPart = await JointsPartModel.findOne({
      _id: partId,
    });

    const imageURL = jointsPart.imageURL;
    const updatedJointsPart = await JointsPartModel.findByIdAndUpdate(
      {
        _id: partId,
      },
      {
        brand,
        partName,
        divisibility,
        packQuantity,
        units,
        unitWeightKg,
        unitVolumeM3,
        isCompensator,
        imageURL,
      },
      {
        returnDocument: 'after',
      },
    );
    if (!updatedJointsPart) {
      return res
        .status(400)
        .json({ message: 'No joints part with the requested id found.' });
    }

    return res.status(200).json({ updatedJointsPart });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update joints part' });
  }
};
