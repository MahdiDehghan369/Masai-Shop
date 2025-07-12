const calculateCartTotals = (items, discount = 0) => {
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const finalPrice = Math.max(totalPrice - discount, 0);
  return { totalPrice, finalPrice };
};


module.exports = calculateCartTotals