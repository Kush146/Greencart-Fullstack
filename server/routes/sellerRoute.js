import express from 'express';
import { 
  isSellerAuth, 
  sellerLogin, 
  sellerLogout,
  deleteProduct, 
  bulkDeleteProducts 
} from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';

const sellerRouter = express.Router();

// Existing routes
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

/* ----------------------------------------
   ADDITIONS: Product delete routes
   ---------------------------------------- */

// Delete a single product by ID
// Method: DELETE  →  /api/seller/products/:id
sellerRouter.delete('/products/:id', authSeller, deleteProduct);

// Bulk delete multiple products
// Method: POST  →  /api/seller/products/bulk-delete
sellerRouter.post('/products/bulk-delete', authSeller, bulkDeleteProducts);

export default sellerRouter;
