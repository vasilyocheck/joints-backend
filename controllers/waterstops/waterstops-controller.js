import WaterstopModel from '../../models/waterstops/waterstops.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { WATERSTOPS_BASE_PATH } from '../../constants/constants.js';

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

export const addWaterstop = async (req, res) => {
  const {
    category,
    compression,
    horizontalStretching,
    individualAccessories,
    productName,
    rollLength,
    verticalStretching,
    diagonalStretching,
    waterPressureMpa,
    weightPerMeter,
    volumePerMeter,
  } = req.body;
  try {
    const existingWaterstop = await WaterstopModel.findOne({ productName });

    if (existingWaterstop) {
      return res
        .status(400)
        .json({ message: 'Waterstop with such name already exists' });
    }

    const files = req.files;

    if (!files || !files['image3d'] || !files['drawing']) {
      return res.status(400).send('Both 3d image and drawing are required.');
    }

    const imagesURL = {
      image3d: `${WATERSTOPS_BASE_PATH}images3d/${randomImageName()}`,
      drawing: `${WATERSTOPS_BASE_PATH}drawings/${randomImageName()}`,
    };

    const paramsForImage3dUpload = {
      Bucket: bucketName,
      Key: imagesURL['image3d'],
      Body: files['image3d'][0].buffer,
      ContentType: files['image3d'][0].mimetype,
    };

    const commandUploadImage3d = new PutObjectCommand(paramsForImage3dUpload);
    const image3dUploadPromise = s3.send(commandUploadImage3d);

    const paramsForDrawingUpload = {
      Bucket: bucketName,
      Key: imagesURL['drawing'],
      Body: files['drawing'][0].buffer,
      ContentType: files['drawing'][0].mimetype,
    };

    const commandUploadDrawing = new PutObjectCommand(paramsForDrawingUpload);
    const drawingUploadPromise = s3.send(commandUploadDrawing);

    await Promise.all([image3dUploadPromise, drawingUploadPromise])
      .then(() => {
        console.log('Files uploaded successfully.');
      })
      .catch(() => {
        return res.status(500).send('Error uploading files to S3.');
      });

    const newWaterstop = {
      category: category,
      productName,
      image3d: `${endpoint}/${bucketName}/${imagesURL['image3d']}`,
      drawing: `${endpoint}/${bucketName}/${imagesURL['drawing']}`,
      compression: Number(compression.trim().replace(',', '.')),
      horizontalStretching: Number(
        horizontalStretching.trim().replace(',', '.'),
      ),
      individualAccessories: JSON.parse(individualAccessories),
      rollLength: Number(rollLength.trim().replace(',', '.')),
      verticalStretching: Number(verticalStretching.trim().replace(',', '.')),
      diagonalStretching: Number(diagonalStretching.trim().replace(',', '.')),
      waterPressureMpa: Number(waterPressureMpa.trim().replace(',', '.')),
      weightPerMeter: Number(weightPerMeter.trim().replace(',', '.')),
      volumePerMeter: Number(volumePerMeter.trim().replace(',', '.')),
    };

    const savedWaterstop = await WaterstopModel.create(newWaterstop);
    await savedWaterstop.save();

    const waterstop = await WaterstopModel.findOne({
      _id: savedWaterstop._id,
    })
      .populate('category')
      .populate({
        path: 'individualAccessories.component',
        model: 'WaterstopComponent',
      })
      .exec();

    return res.send(waterstop);
  } catch (e) {
    console.error(e);
    res.status(400).send({ message: e.message });
  }
};

export const getWaterstops = async (req, res) => {
  const { searchName } = req.query;
  try {
    if (!searchName) {
      const allWaterstops = await WaterstopModel.find()
        .populate('category')
        .populate({
          path: 'individualAccessories.component',
          model: 'WaterstopComponent',
        })
        .exec();
      return res.status(200).json(allWaterstops);
    }
    const filteredWaterstops = await WaterstopModel.find({
      productName: { $regex: new RegExp(searchName, 'i') },
    });
    res.status(200).json(filteredWaterstops);
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: e.message });
  }
};
