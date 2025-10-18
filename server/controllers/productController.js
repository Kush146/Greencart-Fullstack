import { v2 as cloudinary } from "cloudinary"
import Product from "../models/Product.js"

// Add Product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        // ✅ NEW: basic sanitization
        const name = (productData?.name || '').trim()
        const category = (productData?.category || '').trim()
        const price = Number(productData?.price)
        const offerPrice = Number(productData?.offerPrice)

        if (!name || !category) {
            return res.json({ success: false, message: "Name and category are required" })
        }
        if (!price || !offerPrice || price <= 0 || offerPrice <= 0) {
            return res.json({ success: false, message: "Invalid price/offerPrice" })
        }
        if (offerPrice > price) {
            return res.json({ success: false, message: "Offer Price cannot be greater than Price" })
        }

        // ✅ NEW: duplicate check BEFORE uploading images
        const existing = await Product.findOne(
          { name, category, /* isDeleted: false */ },
        ).collation({ locale: 'en', strength: 2 }); // case-insensitive

        if (existing) {
            return res.json({ success: false, message: "A product with the same name already exists in this category" })
        }

        const images = req.files || []

        if (!images.length) {
            return res.json({ success: false, message: "Please upload at least one image" })
        }

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        // ✅ NEW: ensure numeric storage + default seller for now
        await Product.create({
            ...productData,
            name,
            category,
            price,
            offerPrice,
            image: imagesUrl,
            seller: productData?.seller || 'admin'
        })

        res.json({success: true, message: "Product Added"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Product : /api/product/list
export const productList = async (req, res)=>{
    try {
        // ✅ UPDATED: exclude soft-deleted if that field exists (safe even if it doesn't)
        const products = await Product.find({ $or: [ { isDeleted: { $exists: false } }, { isDeleted: false } ] })
        res.json({success: true, products})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res)=>{
    try {
        const { id } = req.body
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "Stock Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
