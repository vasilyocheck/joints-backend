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
} from './controllers/joints-parts-controller.js';
import multer from 'multer';

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
app.delete('/joints/parts/:partId', checkAuth, deleteJointsPart);

app.listen(4444, (e) => {
  if (e) {
    return console.log(e);
  }
  console.log('[server] Listening on port 4444! Server is OK.');
});
