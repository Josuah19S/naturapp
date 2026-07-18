// ============================================
// DATOS DE EJEMPLO (MOCK)
// Permiten ejecutar la app sin backend (demo autónoma).
// apiService.js los usa cuando USE_MOCK está activo.
// ============================================

export const MOCK_CATEGORIES = [
  'superfoods',
  'aceites',
  'capsulas',
  'infusiones',
  'miel',
];

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Maca Andina en Polvo 250g',
    description:
      'Maca peruana 100% natural, energizante y adaptógena. Ideal para aumentar la vitalidad y el rendimiento físico.',
    price: 39.9,
    image: 'https://picsum.photos/seed/maca/400/300',
    category: 'superfoods',
    stock: 24,
    rating: 4.7,
    benefits: ['Aumenta la energía', 'Equilibra hormonas', 'Rica en minerales'],
  },
  {
    id: '2',
    name: 'Aceite de Coco Extra Virgen 500ml',
    description:
      'Aceite de coco prensado en frío, sin refinar. Para cocina, piel y cabello.',
    price: 45.0,
    image: 'https://picsum.photos/seed/coco/400/300',
    category: 'aceites',
    stock: 15,
    rating: 4.8,
    benefits: ['Hidrata la piel', 'Fuente de grasas saludables', 'Multiuso'],
  },
  {
    id: '3',
    name: 'Cápsulas de Uña de Gato x60',
    description:
      'Suplemento natural con propiedades antiinflamatorias y de refuerzo inmunológico.',
    price: 32.5,
    image: 'https://picsum.photos/seed/unagato/400/300',
    category: 'capsulas',
    stock: 40,
    rating: 4.5,
    benefits: ['Refuerza defensas', 'Antiinflamatorio', 'Antioxidante'],
  },
  {
    id: '4',
    name: 'Infusión de Manzanilla x25 filtros',
    description:
      'Manzanilla seleccionada, relajante y digestiva. Perfecta para después de las comidas.',
    price: 12.9,
    image: 'https://picsum.photos/seed/manzanilla/400/300',
    category: 'infusiones',
    stock: 60,
    rating: 4.6,
    benefits: ['Relaja', 'Mejora la digestión', 'Sin cafeína'],
  },
  {
    id: '5',
    name: 'Miel de Abeja Pura 1kg',
    description:
      'Miel multifloral 100% natural, sin aditivos ni azúcares añadidos.',
    price: 28.0,
    image: 'https://picsum.photos/seed/miel/400/300',
    category: 'miel',
    stock: 0,
    rating: 4.9,
    benefits: ['Endulzante natural', 'Rica en antioxidantes', 'Energizante'],
  },
  {
    id: '6',
    name: 'Chía Orgánica 500g',
    description:
      'Semillas de chía ricas en omega 3 y fibra. Ideal para desayunos y batidos.',
    price: 22.5,
    image: 'https://picsum.photos/seed/chia/400/300',
    category: 'superfoods',
    stock: 33,
    rating: 4.7,
    benefits: ['Alta en fibra', 'Omega 3', 'Saciante'],
  },
  {
    id: '7',
    name: 'Aceite de Sacha Inchi 250ml',
    description:
      'Aceite amazónico rico en omega 3, 6 y 9. Cuida el corazón y el cerebro.',
    price: 49.9,
    image: 'https://picsum.photos/seed/sachainchi/400/300',
    category: 'aceites',
    stock: 10,
    rating: 4.8,
    benefits: ['Omega 3-6-9', 'Cuida el corazón', 'Origen amazónico'],
  },
  {
    id: '8',
    name: 'Cápsulas de Cúrcuma + Pimienta x90',
    description:
      'Cúrcuma con pimienta negra para máxima absorción. Antiinflamatorio natural.',
    price: 38.0,
    image: 'https://picsum.photos/seed/curcuma/400/300',
    category: 'capsulas',
    stock: 27,
    rating: 4.6,
    benefits: ['Antiinflamatorio', 'Antioxidante', 'Mejora absorción'],
  },
  {
    id: '9',
    name: 'Infusión de Muña Andina x25',
    description:
      'Hierba andina digestiva y aromática, tradicional de la sierra peruana.',
    price: 14.5,
    image: 'https://picsum.photos/seed/muna/400/300',
    category: 'infusiones',
    stock: 45,
    rating: 4.4,
    benefits: ['Digestiva', 'Alivia el malestar', 'Aromática'],
  },
  {
    id: '10',
    name: 'Miel con Propóleo 500g',
    description:
      'Miel enriquecida con propóleo, refuerzo natural para las defensas.',
    price: 34.9,
    image: 'https://picsum.photos/seed/propoleo/400/300',
    category: 'miel',
    stock: 18,
    rating: 4.8,
    benefits: ['Refuerza defensas', 'Alivia la garganta', '100% natural'],
  },
];
