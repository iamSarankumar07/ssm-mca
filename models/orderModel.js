const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: false, unique: true },
    customer: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      phone: { type: String, required: false },
    },
    date: { type: Date, required: false },
    total: { type: Number, required: false },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      required: false,
    },
    payment: {
      method: { type: String, required: false },
      details: { type: String, required: false },
      status: {
        type: String,
        enum: ["paid", "pending", "failed"],
        required: false,
      },
    },
    shipping: {
      name: { type: String, required: false },
      address1: { type: String, required: false },
      address2: { type: String },
      city: { type: String, required: false },
      state: { type: String, required: false },
      zip: { type: String, required: false },
      country: { type: String, required: false },
    },
    billing: {
      name: { type: String, required: false },
      address1: { type: String, required: false },
      address2: { type: String },
      city: { type: String, required: false },
      state: { type: String, required: false },
      zip: { type: String, required: false },
      country: { type: String, required: false },
    },
    items: [
      {
        id: { type: String, required: false },
        title: { type: String, required: false },
        price: { type: Number, required: false },
        quantity: { type: Number, required: false },
        image: { type: String, required: false },
      },
    ],
    summary: {
      subtotal: { type: Number, required: false },
      shipping: { type: Number, required: false },
      tax: { type: Number, required: false },
      total: { type: Number, required: false },
    },
    timeline: [
      {
        status: { type: String, required: false },
        date: { type: Date, required: false },
        note: { type: String },
      },
    ],
  },
  { timestamps: false }
);

module.exports = mongoose.model('Order', orderSchema);