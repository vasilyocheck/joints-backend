import ExpansionJointModel from '../models/expansion-joints.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { EXPANSION_JOINTS_IMAGES_BASE_PATH } from '../constants/constants.js';

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

export const addExpansionJoint = async (req, res) => {
  const { brand, divisibility, isJoint, jointName, params, parts, units } =
    req.body;
  try {
    const existingJoint = await ExpansionJointModel.findOne({ jointName });
    if (existingJoint) {
      return res.status(400).json({ message: 'Such joint already exists' });
    }

    const files = req.files;

    if (!files || !files['image'] || !files['drawing'] || !files['scheme']) {
      return res.status(400).send('All three images are required.');
    }

    const imagesURL = {
      image: `${EXPANSION_JOINTS_IMAGES_BASE_PATH}images/${randomImageName()}`,
      scheme: `${EXPANSION_JOINTS_IMAGES_BASE_PATH}schemes/${randomImageName()}`,
      drawing: `${EXPANSION_JOINTS_IMAGES_BASE_PATH}drawings/${randomImageName()}`,
    };

    const paramsForImageUpload = {
      Bucket: bucketName,
      Key: imagesURL['image'],
      Body: files['image'][0].buffer,
      ContentType: files['image'][0].mimetype,
    };

    const commandUploadImage = new PutObjectCommand(paramsForImageUpload);
    const imageUploadPromise = s3.send(commandUploadImage);

    const paramsForDrawingUpload = {
      Bucket: bucketName,
      Key: imagesURL['drawing'],
      Body: files['drawing'][0].buffer,
      ContentType: files['drawing'][0].mimetype,
    };

    const commandUploadDrawing = new PutObjectCommand(paramsForDrawingUpload);
    const drawingUploadPromise = s3.send(commandUploadDrawing);

    const paramsForSchemeUpload = {
      Bucket: bucketName,
      Key: imagesURL['scheme'],
      Body: files['scheme'][0].buffer,
      ContentType: files['scheme'][0].mimetype,
    };

    const commandUploadScheme = new PutObjectCommand(paramsForSchemeUpload);
    const schemeUploadPromise = s3.send(commandUploadScheme);

    await Promise.all([
      imageUploadPromise,
      drawingUploadPromise,
      schemeUploadPromise,
    ])
      .then(() => {
        console.log('Files uploaded successfully.');
      })
      .catch(() => {
        return res.status(500).send('Error uploading files to S3.');
      });

    const newExpansionJoint = {
      brand,
      image: `${endpoint}/${bucketName}/${imagesURL['image']}`,
      drawing: `${endpoint}/${bucketName}/${imagesURL['drawing']}`,
      scheme: `${endpoint}/${bucketName}/${imagesURL['scheme']}`,
      jointName,
      divisibility: Number(divisibility.trim().replace(',', '.')),
      parts: JSON.parse(parts),
      units,
      isJoint: JSON.parse(isJoint),
      params: JSON.parse(params),
    };

    const savedExpansionJoint =
      await ExpansionJointModel.create(newExpansionJoint);
    await savedExpansionJoint.save();

    const expansionJoint = await ExpansionJointModel.findOne({
      _id: savedExpansionJoint._id,
    })
      .populate('units')
      .populate({
        path: 'parts.part',
        model: 'JointsPart',
      })
      .exec();

    return res.send(expansionJoint);
  } catch (e) {
    console.error(e);
    return res.status(400).send({ message: e.message });
  }
};

export const getExpansionJoints = async (req, res) => {
  const { searchName, page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;
    const query = searchName
      ? { jointName: { $regex: searchName, $options: 'i' } }
      : {};

    const expansionJoints = await ExpansionJointModel.find(query)
      .populate('units')
      .populate({
        path: 'parts.part',
        model: 'JointsPart',
      })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .exec();

    const totalCount = await ExpansionJointModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      expansionJoints,
      totalCount,
      totalPages,
      currentPage: parseInt(page, 10),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ message: e.message });
  }
};
