import WaterstopModel from '../../models/waterstops/waterstops.js';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
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
  const { searchName, limit = 10, page = 1 } = req.query;
  try {
    const skip = (page - 1) * limit;
    const query = searchName
      ? { productName: { $regex: searchName, $options: 'i' } }
      : {};

    const waterstopsList = await WaterstopModel.find(query)
      .populate('category')
      .populate({
        path: 'individualAccessories.component',
        model: 'WaterstopComponent',
      })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .exec();

    const totalCount = await WaterstopModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      waterstopsList,
      totalCount,
      totalPages,
      currentPage: parseInt(page, 10),
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: e.message });
  }
};

export const getWaterstopById = async (req, res) => {
  const { id } = req.params;
  try {
    const waterstop = await WaterstopModel.findById(id)
      .populate('category')
      .populate({
        path: 'category',
        populate: {
          path: 'includedComponents.component',
          model: 'WaterstopComponent',
        },
      })
      .populate({
        path: 'category',
        populate: {
          path: 'extraComponents.component',
          model: 'WaterstopComponent',
        },
      })
      .populate({
        path: 'individualAccessories.component',
        model: 'WaterstopComponent',
      })
      .exec();

    return res.status(200).send(waterstop);
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: e.message });
  }
};

export const deleteWaterstop = async (req, res) => {
  const { id } = req.params;
  try {
    const existingWaterstop = await WaterstopModel.findById(id);
    if (!existingWaterstop) {
      return res
        .status(404)
        .send({ message: 'Waterstop with the requested id not found' });
    }

    const imageKeys = [
      existingWaterstop.image3d.split(`${endpoint}/${bucketName}/`)[1],
      existingWaterstop.drawing.split(`${endpoint}/${bucketName}/`)[1],
    ];

    const deleteCommands = imageKeys.map((key) => {
      return new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
    });

    await Promise.all(deleteCommands.map((command) => s3.send(command)))
      .then(() => {
        console.log('Files deleted successfully.');
      })
      .catch((err) => {
        console.error('Error deleting files from S3:', err);
        return res.status(500).send('Error deleting files from S3.');
      });

    await WaterstopModel.findByIdAndDelete(id);

    return res.send({ message: 'Waterstop deleted successfully.' });
  } catch (e) {
    console.error(e);
    res.status(400).send({ message: e.message });
  }
};
