import { supabase } from "../config/db";
import { Product } from "../types";
import { ImageClassificationService } from "./imageClassification";
import { Canvas } from "canvas";

export class ProductService {
  constructor(private imageClassifier: ImageClassificationService) {}

  async getWaitingProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("maincategory", "{}");

    if (error) {
      console.error("Error fetching waiting products:", error);
      throw error;
    }

    return data || [];
  }

  async updateProductCategory(
    productId: string,
    categories: string[]
  ): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ maincategory: categories })
      .eq("id", productId);

    if (error) {
      console.error("Error updating product category:", error);
      throw error;
    }
  }

  async processProducts(): Promise<void> {
    try {
      const products = await this.getWaitingProducts();

      if (products.length === 0) {
        console.log("No products found to process.");
      } else if (products.length === 1) {
        console.log("Found 1 product to process.");
      } else {
        console.log(`Found ${products.length} products to process.`);
      }

      for (const product of products) {
        const allPredictions: string[] = [];

        if (product.images) {
          for (const imageUrl of product.images) {
            const predictions = await this.imageClassifier.classifyImage(
              imageUrl
            );
            allPredictions.push(...predictions);
          }
        }

        const uniquePredictions = [...new Set(allPredictions)].slice(0, 3);
        await this.updateProductCategory(product.id, uniquePredictions);

        console.log(
          `Updated product ${product.id} with categories:`,
          uniquePredictions
        );
      }
    } catch (error) {
      console.error("Error processing products", error);
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
