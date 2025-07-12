const CartModel = require("./../models/cartModel");
const ProductModel = require("./../models/productModel");
const CoupenModel = require("./../models/coupenModel");
const calculateCartTotals = require("./../utils/calculateCartTotals");

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, color } = req.body;
    const userId = req.user.id;

    const product = await ProductModel.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produt not found ❌",
      });
    }

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      cart = new CartModel({ user: userId, items: [] });
    }

    const [existingItem] = cart.items.filter(
      (item) => item.product == productId && item.color == color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        color,
      });
    }
    const totals = calculateCartTotals(cart.items, cart.discountAmount);
    cart.totalPrice = totals.totalPrice;
    cart.finalPrice = totals.finalPrice;
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    await cart.save();
    res.json({ success: true, message: "Item added to cart ✅", cart });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const { productId, color, quantity } = req.body;

    const product = await ProductModel.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produt not found ❌",
      });
    }

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => {
      return (
        item.product.toString() === productId &&
        (item.color || null) === (color || null)
      );
    });

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    const totals = calculateCartTotals(cart.items, cart.discountAmount);
    cart.totalPrice = totals.totalPrice;
    cart.finalPrice = totals.finalPrice;
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    await cart.save();
    res.json({ success: true, message: "Cart item updated ✅", cart });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, color } = req.body;

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => {
      return !(
        item.product.toString() === productId &&
        (item.color || null) === (color || null)
      );
    });

    const totals = calculateCartTotals(cart.items, cart.discountAmount);
    cart.totalPrice = totals.totalPrice;
    cart.finalPrice = totals.finalPrice;
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    await cart.save();
    res.json({ success: true, message: "Item removed ✅", cart });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await CartModel.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await CartModel.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.discountAmount = 0;
    cart.appliedCoupon = undefined;
    cart.totalPrice = 0;
    cart.finalPrice = 0;
    cart.totalQuantity = 0;

    await cart.save();
    res.json({ success: true, message: "Cart cleared ✅" });
  } catch (error) {
    next(error);
  }
};

exports.applyCoupen = async (req, res, next) => {
  try {
    let { coupenCode } = req.body;
    const userId = req.user.id;

    coupenCode.trim();

    const coupen = await CoupenModel.findOne({ code: coupenCode });


    if (
      !coupen ||
      coupen.expiresAt < Date.now() ||
      coupen.usageLimit <= coupen.usedCount ||
      !coupen.isActive
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon invalid or expired",
      });
    }


    const alreadyUsed = coupen.usedBy.find((item) => item.user.toString() === userId);

    if (alreadyUsed) {
      return res.status(300).json({
        success: false,
        message: "You used this coupen",
      });
    }

    const cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    }

    let discountAmount;

    if (coupen.type === "percentage") {
      discountAmount = (cart.totalPrice * coupen.value) / 100;
    } else {
      discountAmount = coupen.value;
    }

    cart.appliedCoupon = coupen._id;
    cart.discountAmount = discountAmount

    const totals = calculateCartTotals(cart.items, discountAmount);
    cart.finalPrice = totals.finalPrice;

    coupen.usedCount += 1
    coupen.usedBy.push({
      user: userId
    })

    await coupen.save()
    await cart.save();
    res.json({ success: true, message: "Coupon applied ✅", cart });
  } catch (error) {
    next(error);
  }
};
