import * as tf from "@tensorflow/tfjs";
import * as mobilebnet from "@tensorflow-models/mobilenet";
import fetch from "node-fetch";
import { createCanvas, loadImage, Canvas } from "canvas";

export class ImageClassificationService {
  private model: mobilebnet.MobileNet | null = null;

  async initialize(): Promise<void> {
    try {
      //load the mobileNet model
      this.model = await mobilebnet.load({
        version: 2,
        alpha: 1.0,
      });
      console.log("MobileNet model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      throw error;
    }
  }

  private async loadImage(imageUrl: string): Promise<Canvas | null> {
    try {
      //fetch image
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();

      //load image using canvas
      const image = await loadImage(buffer);
      const canvas = createCanvas(224, 224);
      const ctx = canvas.getContext("2d");

      //draw and resize the image
      ctx.drawImage(image, 0, 0, 224, 224);

      return canvas;
    } catch (error) {
      console.error(`Error loading image ${imageUrl}:`, error);
      return null;
    }
  }

  async classifyImage(imageUrl: string): Promise<string[]> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const canvas = await this.loadImage(imageUrl);
    if (!canvas) {
      return [];
    }

    try {
      //classify the image
      const predictions = await this.model.classify(canvas, 3);

      //extract class names an clean them up
      return predictions.map((p) => p.className.split(",")[0].trim());
    } catch (error) {
      console.error(`Error classifying image ${imageUrl}:`, error);
      return [];
    }
  }
}
