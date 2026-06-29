export class CartItem {
  constructor({ id, productId, name, price, image, quantity }) {
    this.id = id;
    this.productId = productId;
    this.name = name;
    this.price = price;
    this.image = image;
    this.quantity = quantity || 1;
  }

  getSubtotal() {
    return this.price * this.quantity;
  }

  static fromRow(row) {
    return new CartItem({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      price: row.price,
      image: row.image,
      quantity: row.quantity,
    });
  }
}
