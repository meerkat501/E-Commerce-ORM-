const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedTag = await Tag.findByPk(req.params.id);
      res.json(updatedTag);
    } else {
      res.status(404).json({ message: 'No tag found with this id' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tag.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.json({ message: 'Tag deleted' });
    } else {
      res.status(404).json({ message: 'No tag found with this id' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
