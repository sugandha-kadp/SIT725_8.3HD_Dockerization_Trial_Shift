const Module = require('../models/module');


// Create a new module
exports.createModule = async (req, res) => {
  try {
    // Validation logic 
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload assets to a module

exports.uploadAssets = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const { type, title, text, url } = req.body;
    let asset = { type, title };
    if (type === 'text') {
      asset.text = text;
    } else if (url) {
      asset.url = url;
    }
    const module = await Module.findByIdAndUpdate(
      moduleId,
      { $push: { assets: asset } },
      { new: true }
    );
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.status(201).json({ message: 'Asset uploaded', asset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Fetch all modules
exports.getModules = async (req, res) => {
  try {
    const { category, search, visibility } = req.query;
    let filter = {};
    if (category) filter['category'] = category;
    if (visibility) filter['visibility'] = visibility;
    if (search) {
      filter['title'] = { $regex: search, $options: 'i' };
    }
    const modules = await Module.find(filter);
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch module details and assets
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    // Optionally populate assets
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update or archive a module
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Publish a new version
exports.releaseModule = async (req, res) => {
  try {
    // notification logic 
    res.json({ message: 'Module released (stub)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
