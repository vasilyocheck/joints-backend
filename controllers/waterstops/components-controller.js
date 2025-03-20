import dotenv from 'dotenv';
import crypto from 'crypto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import WaterstopComponentModel from '../../models/waterstops/components.js';
import { WATERSTOPS_COMPONENTS_BASE_PATH } from '../../constants/constants.js';

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

export const addWaterstopComponent = async (req, res) => {
  const { name, weight, volume } = req.body;
  try {
    const existingComponent = await WaterstopComponentModel.findOne({ name });
    if (existingComponent) {
      return res.status(400).json({ message: 'Such component already exists' });
    }
    const imageURL = WATERSTOPS_COMPONENTS_BASE_PATH + randomImageName();
    const params = {
      Bucket: bucketName,
      Key: imageURL,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const waterstopComponentWithUrl = {
      name,
      weight: Number(weight),
      volume: Number(volume),
      imageURL: `${endpoint}/${bucketName}/${imageURL}`,
    };

    const newWaterstopComponent = await WaterstopComponentModel.create(
      waterstopComponentWithUrl,
    );
    await newWaterstopComponent.save();

    return res.status(200).json(newWaterstopComponent);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const getWaterstopsComponents = async (req, res) => {
  const { searchName } = req.query;
  try {
    if (!searchName) {
      const allWaterstopsComponents = await WaterstopComponentModel.find();
      return res.status(200).json(allWaterstopsComponents);
    }
    const waterstopsComponentFilteredBySearchName =
      await WaterstopComponentModel.find({
        name: { $regex: new RegExp(searchName, 'i') },
      });
    return res.status(200).json(waterstopsComponentFilteredBySearchName);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const deleteWaterstopsComponent = async (req, res) => {
  const { componentId } = req.params;
  try {
    const component = await WaterstopComponentModel.findOne({
      _id: componentId,
    });

    if (!component) {
      return res.status(404).json({
        message: 'No waterstop component with the requested id found.',
      });
    }

    const edgeIndexImageURL = `${endpoint}/${bucketName}/`.length;
    const imageURL = component.imageURL.slice(edgeIndexImageURL);

    const params = {
      Bucket: bucketName,
      Key: imageURL,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    const deletedComponent = await WaterstopComponentModel.findByIdAndDelete({
      _id: componentId,
    });

    if (!deletedComponent) {
      return res.status(404).json({
        message: 'No waterstop component with the requested id found.',
      });
    }

    return res.status(200).json({ status: 'success' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const updateWaterstopsComponent = async (req, res) => {
  const { componentId } = req.params;

  const { name, volume, weight } = req.body;
  try {
    const component = await WaterstopComponentModel.findOne({
      _id: componentId,
    });
    if (!component) {
      return res.status(404).json({
        message: 'No waterstop component with the requested id found.',
      });
    }
    const imageURL = component.imageURL;
    const updatedComponent = await WaterstopComponentModel.findOneAndUpdate(
      {
        _id: componentId,
      },
      {
        imageURL,
        name,
        volume,
        weight,
      },
      {
        returnDocument: 'after',
      },
    );
    if (!updatedComponent) {
      return res.status(404).json({
        message: 'No waterstop component with the requested id found.',
      });
    }
    return res.status(200).json(updatedComponent);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};

export const updateWaterstopComponentImage = async (req, res) => {
  const { componentId } = req.params;
  try {
    const updatedComponent = await WaterstopComponentModel.findOne({
      _id: componentId,
    });
    if (!updatedComponent) {
      return res.status(404).json({
        message: 'No waterstop component with the requested id found.',
      });
    }

    const edgeIndexImageURL = `${endpoint}/${bucketName}/`.length;
    const imageURLtoDelete = updatedComponent.imageURL.slice(edgeIndexImageURL);

    const deleteParams = {
      Bucket: bucketName,
      Key: imageURLtoDelete,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);

    const updatedImageURL = WATERSTOPS_COMPONENTS_BASE_PATH + randomImageName();
    const updatedParams = {
      Bucket: bucketName,
      Key: updatedImageURL,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const updateCommand = new PutObjectCommand(updatedParams);
    await Promise.all([s3.send(deleteCommand), s3.send(updateCommand)]);

    updatedComponent.imageURL = `${endpoint}/${bucketName}/${updatedImageURL}`;
    await updatedComponent.save();

    return res.status(200).json({ updatedComponent });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e });
  }
};
