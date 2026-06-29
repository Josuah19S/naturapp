export class Product {
  constructor({ id, name, description, price, image, category, stock, rating, benefits }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
    this.category = category;
    this.stock = stock;
    this.rating = rating || 0;
    this.benefits = benefits || [];
  }

  static fromJSON(json) {
    return new Product(json);
  }

  isAvailable() {
    return this.stock > 0;
  }

  getFormattedPrice() {
    return `S/ ${this.price.toFixed(2)}`;
  }
}
