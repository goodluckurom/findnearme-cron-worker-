import { supabase } from "../config/db.js";
export class ImageService {
  constructor(imageClassifier) {
    this.imageClassifier = imageClassifier;
  }
  async getWaitingImages() {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("recommendations", "{}");
    if (error) {
      console.error("Error fetching waiting products:", error);
      throw error;
    }
    return data || [];
  }
  async updateImageRecommendations(imageId, recommendations) {
    const { error } = await supabase
      .from("images")
      .update({ recommendations: recommendations })
      .eq("id", imageId);
    if (error) {
      console.error("Error updating image rcommendations:", error);
      throw error;
    }
  }
  async processImages() {
    try {
      const images = await this.getWaitingImages();
      console.log(`Found ${images.length} images to process`);
      for (const image of images) {
        const allPredictions = [];
        if (image.imageurl) {
          const predictions = await this.imageClassifier.classifyImage(
            image.imageurl
          );
          allPredictions.push(...predictions);
        }
        const uniquePredictions = [...new Set(allPredictions)].slice(0, 3);
        await this.updateImageRecommendations(image.id, uniquePredictions);
        if (images.length === 0) {
          console.log("No images found to process.");
        } else if (images.length === 1) {
          console.log("Found 1 image to process.");
        } else {
          console.log(`Found ${images.length} images to process.`);
        }
      }
    } catch (error) {
      console.error("Error processing images", error);
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
