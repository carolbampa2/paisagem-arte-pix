import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

export type Product = {
  id: string;
  name: string;
  artist: string;
  price: number;
  imageUrl: string;
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden">
        <Link to={`/product/${product.id}`}>
            <CardHeader className="p-0">
                <AspectRatio ratio={1 / 1}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                </AspectRatio>
            </CardHeader>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">por {product.artist}</p>
            </CardContent>
        </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-bold text-xl">
            {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(product.price)}
        </p>
      </CardFooter>
    </Card>
  );
};
