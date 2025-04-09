import * as cron from "node-cron";
// Register the canvas backend
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import { ProductService } from "./services/productService.js";
import { ImageClassificationService } from "./services/imageClassification.js";
import { ImageService } from "./services/imageService.js";
async function startServer() {
  try {
    // Set backend to CPU
    await tf.setBackend("cpu");
    // Initialize services
    const imageClassifier = new ImageClassificationService();
    await imageClassifier.initialize();
    const productService = new ProductService(imageClassifier);
    const imageService = new ImageService(imageClassifier);
    // Schedule cron job
    cron.schedule("*/2 * * * *", async () => {
      console.log("Running product classification job...");
      try {
        await productService.processProducts();
        await imageService.processImages();
        console.log("Product classification completed successfully");
        console.log("Image classification completed successfully");
      } catch (error) {
        console.error("Error in classification job:", error);
      }
    });
    console.log("Server started successfully");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
startServer();
