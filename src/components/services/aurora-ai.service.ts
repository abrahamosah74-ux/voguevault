// Aurora AI Fashion Co-Pilot Service
// Provides AI-powered fashion recommendations and outfit generation

export interface FashionContext {
  userPreferences: string[];
  budget: number;
  occasion: string;
  season: string;
  style: string;
}

export interface OutfitRecommendation {
  id: string;
  items: string[];
  description: string;
  confidence: number;
  priceEstimate: number;
  occasion: string;
}

export class AuroraAI {
  private static instance: AuroraAI;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  private constructor() {}

  static getInstance(): AuroraAI {
    if (!AuroraAI.instance) {
      AuroraAI.instance = new AuroraAI();
    }
    return AuroraAI.instance;
  }

  // Generate outfit recommendations based on context
  async generateOutfitRecommendations(
    context: FashionContext
  ): Promise<OutfitRecommendation[]> {
    const recommendations: OutfitRecommendation[] = [];

    // Mock recommendations (replace with API call in production)
    const baseOutfits = [
      {
        items: ['Blue Blazer', 'White Shirt', 'Black Trousers', 'Brown Loafers'],
        description: 'Classic business casual look',
        occasion: 'work',
      },
      {
        items: ['Black T-Shirt', 'Denim Jeans', 'Leather Jacket', 'Sneakers'],
        description: 'Modern casual streetwear',
        occasion: 'casual',
      },
      {
        items: ['Red Dress', 'High Heels', 'Gold Accessories', 'Clutch'],
        description: 'Elegant evening outfit',
        occasion: 'party',
      },
    ];

    for (const outfit of baseOutfits) {
      recommendations.push({
        id: `outfit-${Math.random().toString(36).substr(2, 9)}`,
        items: outfit.items,
        description: outfit.description,
        confidence: 0.85 + Math.random() * 0.15,
        priceEstimate: context.budget * (0.7 + Math.random() * 0.3),
        occasion: outfit.occasion,
      });
    }

    return recommendations;
  }

  // Process user message and generate response
  async chat(userMessage: string, context?: FashionContext): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Mock AI response (replace with actual API call in production)
    const response = await this.generateAIResponse(userMessage, context);

    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  // Generate AI response (mock implementation)
  private async generateAIResponse(
    message: string,
    context?: FashionContext
  ): Promise<string> {
    // Simple keyword matching for mock responses
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('outfit') ||
      lowerMessage.includes('suggest')
    ) {
      return "I'd recommend checking out our outfit generator! It can create personalized looks based on your style, budget, and occasion. Would you like me to generate some recommendations for you?";
    }

    if (lowerMessage.includes('color')) {
      return "Color selection is important! Based on current trends, earth tones and pastels are great for spring, while jewel tones work beautifully in fall. What's your favorite color palette?";
    }

    if (
      lowerMessage.includes('occasion') ||
      lowerMessage.includes('event')
    ) {
      return "The occasion definitely matters for styling! Tell me more about the event - is it casual, business, formal, or social? That'll help me suggest the perfect outfit.";
    }

    if (lowerMessage.includes('budget')) {
      return "Budget is key to practical fashion! Whether you're looking for affordable basics or investment pieces, I can help you build a great wardrobe. What's your budget range?";
    }

    return "Great question! As your fashion co-pilot, I can help you with outfit recommendations, styling tips, material information, and more. What would you like to explore?";
  }

  // Analyze product for fashion compatibility
  async analyzeProductCompatibility(
    productId: string,
    context: FashionContext
  ): Promise<{ compatible: boolean; score: number; reasoning: string }> {
    // Mock analysis (replace with ML model in production)
    const score = 0.75 + Math.random() * 0.25;

    return {
      compatible: score > 0.6,
      score,
      reasoning: `This item matches your style preferences with a ${(score * 100).toFixed(1)}% compatibility score.`,
    };
  }

  // Generate material suggestions
  async suggestMaterials(occasion: string): Promise<string[]> {
    const materialMap: { [key: string]: string[] } = {
      work: ['Cotton', 'Polyester', 'Wool', 'Linen'],
      casual: ['Cotton', 'Denim', 'Jersey', 'Canvas'],
      party: ['Silk', 'Satin', 'Velvet', 'Lace'],
      outdoor: ['Nylon', 'Gore-Tex', 'Cotton Blend', 'Canvas'],
      formal: ['Wool', 'Silk', 'Linen', 'Cotton'],
    };

    return materialMap[occasion] || materialMap['casual'];
  }

  // Get conversation history
  getConversationHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Provide styling tips
  async getStylingTips(style: string): Promise<string[]> {
    const tips: { [key: string]: string[] } = {
      minimalist: [
        'Stick to neutral color palettes',
        'Choose quality over quantity',
        'Focus on clean lines and simple cuts',
        'Invest in versatile basics',
      ],
      bohemian: [
        'Mix patterns and textures',
        'Choose natural fabrics',
        'Layer clothing and accessories',
        'Embrace earthy color tones',
      ],
      classic: [
        'Invest in timeless pieces',
        'Perfect the fit of your clothes',
        'Choose quality materials',
        'Build a versatile capsule wardrobe',
      ],
      trendy: [
        'Follow current fashion trends',
        'Mix vintage with modern pieces',
        'Experiment with bold colors',
        'Update your wardrobe seasonally',
      ],
    };

    return tips[style] || tips['classic'];
  }

  // Calculate outfit coordination score
  calculateCoordinationScore(items: string[]): number {
    // Mock calculation
    return 0.8 + Math.random() * 0.2;
  }
}

// Export singleton instance
export const auroraAI = AuroraAI.getInstance();
