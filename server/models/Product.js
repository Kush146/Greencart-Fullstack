import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },

    /* ✅ NEW: optional seller field to link product with seller */
    seller: { type: String, default: 'admin' },

    /* ✅ NEW: soft delete support */
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

/* ✅ NEW: index to avoid duplicates by same seller & category (case-insensitive) */
productSchema.index(
  { seller: 1, name: 1, category: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

const Product =
  mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
