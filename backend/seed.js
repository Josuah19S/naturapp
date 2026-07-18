// Script de datos iniciales: pobla categorías, productos y un usuario demo.
// Uso:  npm run seed
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/naturapp';

const CATEGORIES = [
  { name: 'Superalimentos', icon: 'nutrition', description: 'Alimentos de alta densidad nutricional' },
  { name: 'Infusiones', icon: 'cafe', description: 'Hierbas e infusiones naturales' },
  { name: 'Suplementos', icon: 'fitness', description: 'Cápsulas y suplementos' },
  { name: 'Cuidado Personal', icon: 'flower', description: 'Aceites y cuidado natural' },
  { name: 'Snacks', icon: 'fast-food', description: 'Snacks saludables' },
];

// Los productos se asocian por nombre de categoría (resuelto tras insertarlas)
const PRODUCTS = [
  {
    name: 'Maca Andina en Polvo 250g',
    description: 'Maca peruana 100% natural, energizante y adaptógena.',
    price: 39.9,
    category: 'Superalimentos',
    image: 'https://picsum.photos/seed/maca/400/300',
    stock: 24,
    tags: ['energia', 'andino'],
    nutritionalInfo: { calories: 325, protein: '14g', fiber: '8g' },
  },
  {
    name: 'Chía Orgánica 500g',
    description: 'Semillas de chía ricas en omega 3 y fibra.',
    price: 22.5,
    category: 'Superalimentos',
    image: 'https://picsum.photos/seed/chia/400/300',
    stock: 33,
    tags: ['omega3', 'fibra'],
    nutritionalInfo: { calories: 486, protein: '17g', fiber: '34g' },
  },
  {
    name: 'Infusión de Manzanilla x25',
    description: 'Manzanilla seleccionada, relajante y digestiva.',
    price: 12.9,
    category: 'Infusiones',
    image: 'https://picsum.photos/seed/manzanilla/400/300',
    stock: 60,
    tags: ['relajante'],
    nutritionalInfo: { calories: 1, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Infusión de Muña Andina x25',
    description: 'Hierba andina digestiva y aromática.',
    price: 14.5,
    category: 'Infusiones',
    image: 'https://picsum.photos/seed/muna/400/300',
    stock: 45,
    tags: ['digestiva'],
    nutritionalInfo: { calories: 2, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Cápsulas de Uña de Gato x60',
    description: 'Suplemento antiinflamatorio y de refuerzo inmunológico.',
    price: 32.5,
    category: 'Suplementos',
    image: 'https://picsum.photos/seed/unagato/400/300',
    stock: 40,
    tags: ['defensas'],
    nutritionalInfo: { calories: 0, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Cápsulas de Cúrcuma + Pimienta x90',
    description: 'Cúrcuma con pimienta negra para máxima absorción.',
    price: 38.0,
    category: 'Suplementos',
    image: 'https://picsum.photos/seed/curcuma/400/300',
    stock: 27,
    tags: ['antiinflamatorio'],
    nutritionalInfo: { calories: 0, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Aceite de Coco Extra Virgen 500ml',
    description: 'Aceite de coco prensado en frío, sin refinar.',
    price: 45.0,
    category: 'Cuidado Personal',
    image: 'https://picsum.photos/seed/coco/400/300',
    stock: 15,
    tags: ['multiuso'],
    nutritionalInfo: { calories: 862, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Aceite de Sacha Inchi 250ml',
    description: 'Aceite amazónico rico en omega 3, 6 y 9.',
    price: 49.9,
    category: 'Cuidado Personal',
    image: 'https://picsum.photos/seed/sachainchi/400/300',
    stock: 10,
    tags: ['omega'],
    nutritionalInfo: { calories: 884, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Miel de Abeja Pura 1kg',
    description: 'Miel multifloral 100% natural, sin aditivos.',
    price: 28.0,
    category: 'Snacks',
    image: 'https://picsum.photos/seed/miel/400/300',
    stock: 20,
    tags: ['endulzante'],
    nutritionalInfo: { calories: 304, protein: '0g', fiber: '0g' },
  },
  {
    name: 'Barras de Quinua y Miel x6',
    description: 'Snack energético de quinua inflada y miel.',
    price: 18.5,
    category: 'Snacks',
    image: 'https://picsum.photos/seed/quinua/400/300',
    stock: 50,
    tags: ['snack', 'energia'],
    nutritionalInfo: { calories: 220, protein: '5g', fiber: '3g' },
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB, sembrando datos...');

  await Product.deleteMany({});
  await Category.deleteMany({});

  const createdCategories = await Category.insertMany(CATEGORIES);
  const categoryByName = Object.fromEntries(
    createdCategories.map((c) => [c.name, c._id])
  );

  const productsToInsert = PRODUCTS.map((p) => ({
    ...p,
    category: categoryByName[p.category],
  }));
  await Product.insertMany(productsToInsert);

  // Usuario demo (idempotente)
  const email = 'demo@naturapp.com';
  if (!(await User.findOne({ email }))) {
    await User.create({
      name: 'Usuario Demo',
      email,
      password: '123456',
      phone: '999999999',
    });
  }

  console.log(
    `Listo: ${createdCategories.length} categorías, ${productsToInsert.length} productos.`
  );
  console.log('Usuario demo -> email: demo@naturapp.com  password: 123456');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
