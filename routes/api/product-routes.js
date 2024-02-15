const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ],
    });
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const products = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag }
      ],
    });
    if(!products) {
      res.status(404).json({ message: 'Product with this id was not found'})
      return;
    }
    res.json(products)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map(tag_id => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr);
      return res.status(200).json({ product, productTagIds });
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', async (req, res) => {
  try {
    const [updateCount] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (updateCount === 0) {
      return res.status(404).json({ message: 'No product found with this id' });
    }

    if (req.body.tagIds) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      const newProductTags = req.body.tagIds
        .filter(tag_id => !productTagIds.includes(tag_id))
        .map(tag_id => ({
          product_id: req.params.id,
          tag_id,
        }));

      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        productTagsToRemove.length > 0 ? ProductTag.destroy({ where: { id: productTagsToRemove } }) : null,
        newProductTags.length > 0 ? ProductTag.bulkCreate(newProductTags) : null,
      ]);
    }

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, through: ProductTag }],
    });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.destroy({
      where: { 
        id: req.params.id
      },
    });
    if(!product) {
      res.status(404).json({ message: 'Product was this id was not found'})
    }
    res.json({ message: 'Product was successfully deleted!'});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
