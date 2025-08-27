import { ProductCard, Product } from "./ProductCard";

// Mock data - in the future, this will come from an API call.
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Abstrato Geométrico",
    artist: "Ana Clara",
    price: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800",
  },
  {
    id: "2",
    name: "Céu Estrelado Moderno",
    artist: "Bruno Alves",
    price: 99.9,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
  },
  {
    id: "3",
    name: "Folhagem Tropical",
    artist: "Carla Dias",
    price: 79.9,
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800",
  },
  {
    id: "4",
    name: "Gato Cósmico",
    artist: "Daniel Paiva",
    price: 149.9,
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800",
  },
   {
    id: "5",
    name: "Onda Retrô",
    artist: "Eduarda Lima",
    price: 119.9,
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800",
  },
  {
    id: "6",
    name: "Montanhas Nevadas",
    artist: "Fábio Souza",
    price: 89.9,
    imageUrl: "https://images.unsplash.com/photo-1580133318324-f2f76d9876f2?q=80&w=800",
  },
  {
    id: "7",
    name: "Cidade Noturna",
    artist: "Gabriela Rocha",
    price: 139.9,
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800",
  },
  {
    id: "8",
    name: "Flores em Aquarela",
    artist: "Heitor Borges",
    price: 69.9,
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800",
  },
];


export const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {mockProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
