import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

interface FavoriteItem {
  id: string;
  title: string;
  cover_url: string;
  slug?: string;
}

interface FavoritesCarouselProps {
  queryKey: string;
  items: FavoriteItem[];
  isLoading: boolean;
}

const FavoritesCarousel: React.FC<FavoritesCarouselProps> = ({ 
  queryKey, 
  items, 
  isLoading 
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex space-x-4 px-4 overflow-visible">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-36 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  // Set options for better mobile display
  const carouselOptions = {
    align: "start" as const,
    loop: false,
    dragFree: true
  };

  const handleItemClick = (item: FavoriteItem) => {
    if (item.slug) {
      navigate(`/icons/${item.slug}`);
    }
  };

  return (
    <Carousel 
      opts={carouselOptions} 
      className="w-full pb-10 overflow-visible"
    >
      <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
        {items.map((item) => (
          <CarouselItem 
            key={item.id} 
            className="pl-2 md:pl-4 basis-[57%] md:basis-1/4 lg:basis-1/5"
          >
            <div 
              className="w-full h-full cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Virgil.png";
                  }}
                />
              </div>
              <h4 className="text-[#E9E7E2] font-oxanium text-base mt-2 uppercase">
                {item.title}
              </h4>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default FavoritesCarousel;
