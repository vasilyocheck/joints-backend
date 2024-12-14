import JointModel from '../models/joints.js';

export const createJoint = async (req, res) => {
  try {
    const doc = new JointModel({
      name: req.body.name,
      code: req.body.code,
      jointLength: req.body.jointLength,
      jointWidth: req.body.jointWidth,
      load: req.body.load,
      height: req.body.height,
      surface: req.body.surface,
      isOutsideOk: req.body.isOutsideOk,
      corner: req.body.corner,
    });
    const joint = await doc.save();
    res.json(joint);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Failed to create a joint.',
    });
  }
};

export const getJoints = async (req, res) => {
  try {
    const joints = await JointModel.find();
    res.status(200).json(joints);
  } catch (e) {
    res.json({
      message: 'No joints found.',
    });
  }
};
