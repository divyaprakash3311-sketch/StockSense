const { getDB } = require('../config/db');

exports.getAllProducts = async (req, res) => {
  const db = getDB();
  try {
    const products = await db.all(`
      SELECT 
        p.id, 
        p.name, 
        p.sku, 
        p.unit_of_measure, 
        p.reorder_level,
        IFNULL(c.name, 'Uncategorized') as category,
        IFNULL(SUM(s.quantity), 0) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock_levels s ON p.id = s.product_id
      GROUP BY p.id
    `);

    const productsWithStatus = products.map(item => ({
      ...item,
      is_low_stock: item.total_stock <= item.reorder_level
    }));

    res.json(productsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, sku, category_name, unit_of_measure, reorder_level, initial_stock } = req.body;
  const db = getDB();

  try {
    let category = await db.get('SELECT id FROM categories WHERE name = ?', [category_name]);
    let category_id;
    if (!category) {
      const catResult = await db.run('INSERT INTO categories (name) VALUES (?)', [category_name]);
      category_id = catResult.lastID;
    } else {
      category_id = category.id;
    }

    const result = await db.run(
      'INSERT INTO products (name, sku, category_id, unit_of_measure, reorder_level) VALUES (?, ?, ?, ?, ?)',
      [name, sku, category_id, unit_of_measure, reorder_level || 10]
    );

    const productId = result.lastID;

    let defaultLocation = await db.get('SELECT id FROM locations WHERE name = ?', ['Main Store']);
    if (!defaultLocation) {
      let wh = await db.get('SELECT id FROM warehouses LIMIT 1');
      if (!wh) {
        const whRes = await db.run('INSERT INTO warehouses (name, code) VALUES (?, ?)', ['Central Warehouse', 'WH-01']);
        wh = { id: whRes.lastID };
      }
      const locRes = await db.run('INSERT INTO locations (warehouse_id, name, location_type) VALUES (?, ?, ?)', [wh.id, 'Main Store', 'internal']);
      defaultLocation = { id: locRes.lastID };
    }

    if (initial_stock && Number(initial_stock) > 0) {
      await db.run(
        'INSERT INTO stock_levels (product_id, location_id, quantity) VALUES (?, ?, ?)',
        [productId, defaultLocation.id, Number(initial_stock)]
      );
    }

    res.status(201).json({ message: 'Product created successfully!', productId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};