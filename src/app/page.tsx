
import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Utensils, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { placeholderImages } from "@/lib/placeholder-images";
import { AppHeader } from "@/components/shared/header";

export default function LandingPage() {
  const heroImage = placeholderImages.find(p => p.id === "hero-image-1");

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white drop-shadow-lg">
                Your Cravings, Delivered.
              </h1>
              <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                From local restaurants to your favorite grocery stores, Calabar
                Market brings the best of the city to your doorstep.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="font-bold text-lg">
                  <Link href="/browse">
                    Start Your Order <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                What are you looking for?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select a category to start exploring vendors near you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <CategoryCard
                title="Food Delivery"
                description="Order from the best local restaurants."
                icon={<Utensils className="h-12 w-12 text-primary" />}
                href="/browse?category=food"
                image={placeholderImages.find(p => p.id === "category-food")}
              />
              <CategoryCard
                title="Grocery Delivery"
                description="Get fresh groceries delivered in minutes."
                icon={<ShoppingCart className="h-12 w-12 text-primary" />}
                href="/browse?category=groceries"
                image={placeholderImages.find(p => p.id === "category-groceries")}
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 bg-primary">
        <div className="container mx-auto px-4 md:px-6 text-center text-primary-foreground">
          &copy; {new Date().getFullYear()} Calabar Market. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({ title, description, icon, href, image }: { title: string; description: string; icon: React.ReactNode; href: string; image: any; }) {
  return (
    <Link href={href} className="group block">
      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105 group-hover:shadow-primary/20">
        <CardContent className="p-0">
          <div className="relative h-64">
            {image && (
                <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                data-ai-hint={image.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
                <div className="bg-primary/90 backdrop-blur-sm p-3 rounded-full mb-4 w-fit shadow-lg">
                    {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-primary-foreground" })}
                </div>
                <h3 className="text-2xl font-bold font-headline text-primary-foreground drop-shadow-md">{title}</h3>
                <p className="text-primary-foreground/90 drop-shadow-sm">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
