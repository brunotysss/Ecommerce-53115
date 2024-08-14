import CartService from '../services/cart.service.js';
import TicketService from '../services/ticket.service.js';
import ProductService from '../services/product.service.js';

// Obtener carrito por ID de usuario
 const getCartByUser = async (req, res) => {
  try {
    const userId = req.user.id; // Asegúrate de usar el ID del usuario autenticado
    
    const cart = await CartService.getCartByUserId(userId);
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.render('cart', { cart }); // Renderiza la vista `cart.handlebars` con los datos del carrito
  } catch (error) {
    console.error("Error al obtener el carrito del usuario:", error.message);
    res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
  }
};

/*
// Comprar carrito
const purchaseCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await CartService.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let totalAmount = 0;
    const productsToPurchase = [];
    const productsUnavailable = [];

    for (const cartProduct of cart.products) {
      const product = await ProductService.getProductById(cartProduct.product);
      if (product.stock >= cartProduct.quantity) {
        product.stock -= cartProduct.quantity;
        await product.save();
        totalAmount += product.price * cartProduct.quantity;
        productsToPurchase.push(cartProduct);
      } else {
        productsUnavailable.push(cartProduct.product);
      }
    }

    if (productsToPurchase.length > 0) {
      const ticketData = {
        code: `TCK-${Date.now()}`,
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: req.user.email
      };

      await TicketService.createTicket(ticketData);
    }

    cart.products = productsUnavailable;
    await cart.save();

    res.json({
      message: 'Purchase completed',
      productsUnavailable
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete purchase', details: error.message });
  }
};
*/
/*

const purchaseCart = async (req, res) => {
  try {
      const userId = req.user.id;
      const userEmail = req.user.email; // Obtenemos el email del usuario
      const cartId = req.params.cid;
      
      console.log('Iniciando compra para el carrito:', cartId);
      console.log('Usuario que realiza la compra:', userId);
      const { ticket, errors } = await CartService.purchaseCart(cartId, userId, userEmail);

      // Redirigir a la vista del ticket
      if (ticket) {
        console.log('Ticket generado:', ticket);
          return res.render('ticket', { ticket, errors });
      } else {
        console.error('No se pudo generar el ticket');
          return res.status(400).json({ error: 'No se pudo generar el ticket.' });
      }

  } catch (error) {
    console.error('Error en purchaseCart:', error.message);
      res.status(500).json({ error: 'Failed to complete purchase', details: error.message });
  }
};*/
const purchaseCart = async (req, res) => {
  try {
      const userId = req.user.id;
      const userEmail = req.user.email; 
      const cartId = req.params.cid;
      
      const { ticket, errors } = await CartService.purchaseCart(cartId, userId, userEmail);

      // Convertir el ticket en un objeto plano
      const plainTicket = {
          code: ticket.code,
          purchase_datetime: ticket.purchase_datetime,
          amount: ticket.amount,
          purchaser: ticket.purchaser,
          id: ticket._id // Si necesitas incluir el ID también
      };

      // Redirigir a la vista del ticket
      if (ticket) {
          return res.render('ticket', { ticket: plainTicket, errors });
      } else {
          return res.status(400).json({ error: 'No se pudo generar el ticket.' });
      }

  } catch (error) {
      res.status(500).json({ error: 'Failed to complete purchase', details: error.message });
  }
};



// Crear un nuevo carrito
const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart(req.user.id);
    if (!newCart) {
      return res.status(400).json({ error: 'Failed to create cart' });
    }
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cart', details: error.message });
  }
};

// Obtener carrito por ID
const getCartById = async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
  }
};

// Agregar producto al carrito
const addProductToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.pid;

    let cart = await CartService.getCartByUserId(userId);
  
    if (!cart) {
    

      cart = await CartService.createCart(userId);

    }

    if (!cart) {
     
      return res.status(500).json({ error: 'Failed to create or retrieve cart' });
    }

    const updatedCart = await CartService.addProductToCart(cart.id, productId);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }

    res.json(updatedCart);
  } catch (error) {
;
    res.status(500).json({ error: 'Failed to add product to cart', details: error.message });
  }
};


// Actualizar carrito
const updateCart = async (req, res) => {
  try {
    const updatedCart = await CartService.updateCart(req.params.cid, req.body.products);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart', details: error.message });
  }
};

// Actualizar la cantidad de un producto en el carrito
const updateProductQuantity = async (req, res) => {
  try {
    const updatedCart = await CartService.updateProductQuantity(req.params.cid, req.params.pid, req.body.quantity);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product quantity', details: error.message });
  }
};

// Eliminar un producto del carrito
const deleteProductFromCart = async (req, res) => {
  try {
    const updatedCart = await CartService.deleteProductFromCart(req.params.cid, req.params.pid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart or product not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product from cart', details: error.message });
  }
};

// Eliminar todos los productos del carrito
const deleteAllProductsFromCart = async (req, res) => {
  try {
    const updatedCart = await CartService.deleteAllProductsFromCart(req.params.cid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products from cart', details: error.message });
  }
};

// Exportamos todas las funciones en un objeto
export default {
  getCartByUser,
  purchaseCart,
  createCart,
  getCartById,
  addProductToCart,
  updateCart,
  updateProductQuantity,
  deleteProductFromCart,
  deleteAllProductsFromCart
};
