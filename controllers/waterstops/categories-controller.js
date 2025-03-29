import WaterstopCategoryModel from '../../models/waterstops/categories.js';
import { WATERSTOPS_CATEGORIES_BASE_PATH } from '../../constants/constants.js';
import crypto from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import ExpansionJointModel from '../../models/expansion-joints.js';

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

export const addWaterstopCategory = async (req, res) => {
  const { name, extraComponents, includedComponents } = req.body;
  try {
    const existingCategory = await WaterstopCategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).send({
        message: 'Category with the same name already exists',
      });
    }

    const files = req.files;

    if (!files || !files['installation'] || !files['isometric']) {
      return res
        .status(400)
        .send('Both installation and isometric images are required.');
    }

    const imagesURL = {
      installation: `${WATERSTOPS_CATEGORIES_BASE_PATH}installations/${randomImageName()}`,
      isometric: `${WATERSTOPS_CATEGORIES_BASE_PATH}isometrics/${randomImageName()}`,
    };

    const paramsForInstallationUpload = {
      Bucket: bucketName,
      Key: imagesURL['installation'],
      Body: files['installation'][0].buffer,
      ContentType: files['installation'][0].mimetype,
    };

    const commandUploadInstallation = new PutObjectCommand(
      paramsForInstallationUpload,
    );
    const installationUploadPromise = s3.send(commandUploadInstallation);

    const paramsForIsometricUpload = {
      Bucket: bucketName,
      Key: imagesURL['isometric'],
      Body: files['isometric'][0].buffer,
      ContentType: files['isometric'][0].mimetype,
    };

    const commandUploadIsometric = new PutObjectCommand(
      paramsForIsometricUpload,
    );
    const isometricUploadPromise = s3.send(commandUploadIsometric);

    await Promise.all([installationUploadPromise, isometricUploadPromise])
      .then(() => {
        console.log('Files uploaded successfully.');
      })
      .catch(() => {
        return res.status(500).send('Error uploading files to S3.');
      });

    const newCategory = {
      name,
      extraComponents: JSON.parse(extraComponents),
      includedComponents: JSON.parse(includedComponents) || [],
      installationScheme: `${endpoint}/${bucketName}/${imagesURL['installation']}`,
      isometricScheme: `${endpoint}/${bucketName}/${imagesURL['isometric']}`,
    };

    const savedCategory = await WaterstopCategoryModel.create(newCategory);
    await savedCategory.save();

    const category = await WaterstopCategoryModel.findOne({
      _id: savedCategory._id,
    })
      .populate({
        path: 'includedComponents.component',
        model: 'WaterstopComponent',
      })
      .populate({
        path: 'extraComponents.component',
        model: 'WaterstopComponent',
      })
      .exec();

    res.status(200).send(category);
  } catch (e) {
    console.log(e);
    res.status(400).send({ error: JSON.stringify(e) });
  }
};
