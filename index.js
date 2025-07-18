import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { validateSignUp } from './validators/auth.js';
import checkAuth from './utils/checkAuth.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  authMe,
  changePassword,
  login,
  logout,
  signUp,
} from './controllers/user-controller.js';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getSeveralProducts,
  removeProduct,
  updateProduct,
} from './controllers/product-controller.js';
import { createJoint, getJoints } from './controllers/joints-controller.js';
import {
  createEcorasterItem,
  getEcorasterItems,
  updateEcorasterItem,
} from './controllers/ecoraster-controller.js';
import {
  addNewMeasurementUnit,
  getMeasurementUnits,
} from './controllers/measurement-unit-controller.js';
import {
  addJointsPart,
  deleteJointsPart,
  getJointsParts,
  updateJointsPart,
  updateJointsPartImage,
} from './controllers/joints-parts-controller.js';
import multer from 'multer';
import {
  addExpansionJoint,
  deleteExpansionJoint,
  getExpansionJoints,
  updateExpansionJointImage,
  updateExpansionJointParams,
} from './controllers/expansion-joints-controller.js';
import {
  addWaterstopComponent,
  deleteWaterstopsComponent,
  getWaterstopsComponents,
  updateWaterstopComponentImage,
  updateWaterstopsComponent,
} from './controllers/waterstops/components-controller.js';
import {
  addWaterstopCategory,
  deleteWaterstopCategory,
  getWaterstopCategories,
} from './controllers/waterstops/categories-controller.js';
import {
  addWaterstop,
  deleteWaterstop,
  getWaterstopById,
  getWaterstops,
} from './controllers/waterstops/waterstops-controller.js';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single('file');

dotenv.config();

mongoose
  .connect(process.env.JOINTS_DB)
  .then(() => {
    console.log('DB is connected');
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cookieParser());
app.use(function (req, res, next) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://joints-front.vercel.app',
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Allow-Control-Allow-Credentials', 'true');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://joints-front.vercel.app'],
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('Welcome to Joints API!');
});

app.post('/auth/signup', ...validateSignUp, signUp);

app.post('/auth/login', login);

app.get('/auth/me', checkAuth, authMe);

app.get('/auth/logout', checkAuth, logout);
app.put('/auth/changePassword', checkAuth, changePassword);

app.post('/products', checkAuth, createProduct);

app.get('/products', checkAuth, getAllProducts);

app.get('/products/:id', checkAuth, getProductById);

app.delete('/products/:id', checkAuth, removeProduct);

app.put('/products/:id', checkAuth, updateProduct);

app.post('/products/several', checkAuth, getSeveralProducts);

app.post('/joints', checkAuth, createJoint);

app.get('/joints', checkAuth, getJoints);

app.get('/ecoraster', checkAuth, getEcorasterItems);
app.post('/ecoraster', checkAuth, createEcorasterItem);
app.put('/ecoraster/:id', checkAuth, updateEcorasterItem);

app.post('/measurement-units-reference', checkAuth, addNewMeasurementUnit);
app.get('/measurement-units-reference', checkAuth, getMeasurementUnits);

app.post('/joints/parts', checkAuth, upload.single('file'), addJointsPart);
app.get('/joints/parts', checkAuth, getJointsParts);
app.put('/joints/parts/:partId', checkAuth, updateJointsPart);
app.delete('/joints/parts/:partId', checkAuth, deleteJointsPart);
app.patch(
  '/joints/parts/:partId/image',
  checkAuth,
  upload.single('file'),
  updateJointsPartImage,
);

app.post(
  '/joints/expansion-joints',
  checkAuth,
  upload.fields([{ name: 'image' }, { name: 'scheme' }, { name: 'drawing' }]),
  addExpansionJoint,
);

app.get('/joints/expansion-joints', checkAuth, getExpansionJoints);
app.delete('/joints/expansion-joints/:id', checkAuth, deleteExpansionJoint);
app.put(
  '/joints/expansion-joints/:id',
  checkAuth,
  upload.single('file'),
  updateExpansionJointImage,
);
app.put(
  '/joints/expansion-joints/:id/joint-params',
  checkAuth,
  updateExpansionJointParams,
);

app.post(
  '/waterstops/components',
  checkAuth,
  upload.single('file'),
  addWaterstopComponent,
);
app.get('/waterstops/components', checkAuth, getWaterstopsComponents);
app.delete(
  '/waterstops/components/:componentId',
  checkAuth,
  deleteWaterstopsComponent,
);
app.put(
  '/waterstops/components/:componentId/info',
  checkAuth,
  updateWaterstopsComponent,
);

app.put(
  '/waterstops/components/:componentId/image',
  checkAuth,
  upload.single('file'),
  updateWaterstopComponentImage,
);

app.post(
  '/waterstops/categories',
  checkAuth,
  upload.fields([{ name: 'installation' }, { name: 'isometric' }]),
  addWaterstopCategory,
);

app.get('/waterstops/categories', checkAuth, getWaterstopCategories);

app.delete('/waterstops/categories/:id', checkAuth, deleteWaterstopCategory);

app.post(
  '/waterstops/products',
  checkAuth,
  upload.fields([{ name: 'image3d' }, { name: 'drawing' }]),
  addWaterstop,
);

app.get('/waterstops/products', checkAuth, getWaterstops);
app.get('/waterstops/product/:id', checkAuth, getWaterstopById);

app.delete('/waterstops/products/:id', checkAuth, deleteWaterstop);

app.listen(4444, (e) => {
  if (e) {
    return console.log(e);
  }
  console.log('[server] Listening on port 4444! Server is OK.');
});
