const OrderModel = require("./../models/orderModel");
const AddressModel = require("./../models/addressModel");
const CartModel = require("./../models/cartModel");
const ProductModel = require("./../models/productModel");
const { isValidObjectId } = require("mongoose");

exports.createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(addressId)) {
      return res.status(422).json({
        success: false,
        message: "Address ID is not valid ❌",
      });
    }

    const address = await AddressModel.findOne({ _id: addressId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found ❌",
      });
    }

    const cart = await CartModel.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty ❌",
      });
    }

    const order = await OrderModel.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        color: item.color || null,
      })),
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        province: address.province,
        city: address.city,
        addressLine: address.addressLine,
        postalCode: address.postalCode,
        plaque: address.plaque,
        unit: address.unit,
      },
      paymentMethod: paymentMethod || "online",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
      totalPrice: cart.totalPrice,
      discountAmount: cart.discountAmount,
      finalPrice: cart.finalPrice,
    });

    cart.items.forEach(async (element) => {
      const product = await ProductModel.findOne({_id: element.product})
      await ProductModel.updateOne({_id: element.product} , {
        quantity: product.quantity - element.quantity
      })
    });

    cart.items = [];
    cart.totalPrice = 0;
    cart.finalPrice = 0;
    cart.totalQuantity = 0;
    cart.discountAmount = 0;
    cart.appliedCoupon = undefined;
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order submited successfully ✅",
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { paymentMethod, paymentStatus, orderStatus } = req.query;

    let query = {};

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    const orders = await OrderModel.find({ user: userId, ...query }).populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Order ID is not valid ❌",
      });
    }

    const order = await OrderModel.findOne({ user: userId, _id: id }).populate(
      "items.product"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found ❌",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { paymentMethod, paymentStatus, orderStatus } = req.query;

    let query = {};

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    const orders = await OrderModel.find({ ...query }).populate(
      "items.product"
    );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Order ID is not valid ❌",
      });
    }

    const order = await OrderModel.findOne({
      _id: id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found ❌",
      });
    }

    if(status === "cancelled"){
      order.items.forEach(async (element) => {
        const product = await ProductModel.findOne({ _id: element.product });
        await ProductModel.updateOne(
          { _id: element.product },
          {
            quantity: product.quantity + element.quantity,
          }
        );
      });
    }

    order.orderStatus = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status changed successfully ✅ ",
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Order ID is not valid ❌",
      });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: " Order not found ❌" });
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === "paid") {
      order.paidAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order payment status updated successfully ✅",
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTrackingCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackingCode } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(422).json({
        success: false,
        message: "Order ID is not valid ❌",
      });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    order.trackingCode = trackingCode;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Tracking code submited successfully ✅",
      order,
    });
  } catch (error) {
    next(error);
  }
};
