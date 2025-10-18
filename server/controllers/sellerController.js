import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';

// Login Seller : /api/seller/login
export const sellerLogin = async (req, res) =>{
    try {
        const { email, password } = req.body;

        if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
            const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'});

            res.cookie('sellerToken', token, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, message: "Logged In" });
        }else{
            return res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req, res)=>{
    try {
        return res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res)=>{
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

/* -------------------------------------------------------
   ADDITIONS: Delete endpoints for products (hard delete)
   ------------------------------------------------------- */

// Delete a single product by ID
// Route: DELETE /api/seller/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // If your Product has a seller field and you attach req.user in auth,
    // you can restrict deletes to the owner by adding: , seller: req.user._id
    const deleted = await Product.findOneAndDelete({ _id: id /*, seller: req.user._id */ });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, message: 'Deleted', id });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk delete products by array of IDs
// Route: POST /api/seller/products/bulk-delete
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body; // expects: { ids: ["id1","id2",...] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids[] required' });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } /*, seller: req.user._id */ });

    return res.status(200).json({
      success: true,
      message: 'Deleted',
      deleted: result.deletedCount,
      ids
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
