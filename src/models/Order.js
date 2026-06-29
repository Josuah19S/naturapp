export class Order {
  constructor({ id, items, total, status, date, address }) {
    this.id = id;
    this.items = items || [];
    this.total = total;
    this.status = status || 'pendiente';
    this.date = date || new Date().toISOString();
    this.address = address || '';
  }

  static fromJSON(json) {
    return new Order(json);
  }

  getFormattedDate() {
    return new Date(this.date).toLocaleDateString('es-PE');
  }

  getStatusColor() {
    const colors = {
      pendiente: '#F39C12',
      procesando: '#3498DB',
      enviado: '#8E44AD',
      entregado: '#27AE60',
    };
    return colors[this.status] || '#95A5A6';
  }
}
