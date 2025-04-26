const ProductModel = require("../models/productModel");
const OrderModel = require("../models/orderModel");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.getProductManagement = async (req, res) => {
  try {
    res.render("manageProduct");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res) => {
  try {
    res.render("orders");
  } catch (err) {
    console.log(err);
  }
};

exports.getBookStore = async (req, res) => {
  try {
    res.render("bookStore");
  } catch (err) {
    console.log(err);
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { productId, title, author, department, format, price, inStock, stock, year, description, publisher, isbn } = req.body;

    const existingProduct = await ProductModel.findOne({ productId });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this ID already exists" });
    }

    let imageUrl;

    if (req.file) {
      try {
        imageUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                public_id: req.file.originalname,
                resource_type: "auto",
                folder: "student",
              },
              (error, result) => (error ? reject(error) : resolve(result))
            )
            .end(req.file.buffer);
        });
        student.imageUrl = studentImg.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

    const newProduct = new ProductModel({
      productId,
      title,
      author,
      department,
      format,
      price,
      inStock,
      stock,
      year,
      imageUrl,
      description,
      publisher,
      isbn,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, customer } = req.body;

    const product = await ProductModel.findOne({ productId: productId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.inStock || product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    product.stock -= quantity;
    product.inStock = product.stock > 0;
    await product.save();
    const order = new OrderModel({
      orderId: `ORD-${Date.now()}`,
      customer,
      date: new Date(),
      total: product.price * quantity,
      status: "processing",
      payment: {
        method: "Pending",
        details: "N/A",
        status: "pending",
      },
      shipping: { ...customer },
      billing: { ...customer },
      items: [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          quantity,
          image: product.imageUrl,
        },
      ],
      summary: {
        subtotal: product.price * quantity,
        shipping: 5.99,
        tax: product.price * quantity * 0.1,
        total: product.price * quantity + 5.99 + product.price * quantity * 0.1,
      },
      timeline: [
        {
          status: "order_placed",
          date: new Date(),
          note: "Order placed successfully",
        },
      ],
    });

    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
};

module.exports = exports;
