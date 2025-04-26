const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: false, unique: true },
    title: { type: String, required: false },
    department: { type: String, required: false },
    format: {
      type: String,
      enum: ["Hardcover", "Paperback", "Ebook"],
      required: false,
    },
    price: { type: Number, required: false },
    inStock: { type: Boolean, required: false },
    stock: { type: Number, required: false },
    imageUrl: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Product', productSchema);