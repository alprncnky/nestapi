import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface SentimentAnalysis {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
}

export interface EntityExtraction {
  entities: Array<{
    text: string;
    type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'MONEY' | 'DATE' | 'OTHER';
    confidence: number;
  }>;
}

export interface NewsCategorization {
  category: string;
  subcategory?: string;
  confidence: number;
}

export interface StockSymbolExtraction {
  symbols: Array<{
    symbol: string;
    companyName?: string;
    confidence: number;
  }>;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey,
    });

    this.logger.log('OpenAI service initialized');
  }

  /**
   * Analyze sentiment of Turkish financial news
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const prompt = `
Türkçe finansal haber metninin sentiment analizini yap.

METİN: ${text.substring(0, 2000)}

JSON formatında dön:
{
  "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
  "score": -1 ile 1 arası sayı,
  "confidence": 0 ile 1 arası güven skoru
}
`;

      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        sentiment: result.sentiment || 'NEUTRAL',
        score: result.score || 0,
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error('OpenAI sentiment analysis failed:', error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  /**
   * Extract named entities from Turkish text
   */
  async extractEntities(text: string): Promise<EntityExtraction> {
    try {
      const prompt = `
Türkçe finansal haber metninden named entity recognition yap.

METİN: ${text.substring(0, 2000)}

JSON formatında dön:
{
  "entities": [
    {
      "text": "entity metni",
      "type": "PERSON/ORGANIZATION/LOCATION/MONEY/DATE/OTHER",
      "confidence": 0 ile 1 arası güven skoru
    }
  ]
}
`;

      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        entities: result.entities || [],
      };
    } catch (error) {
      this.logger.error('OpenAI entity extraction failed:', error);
      return { entities: [] };
    }
  }

  /**
   * Categorize Turkish financial news
   */
  async categorizeNews(title: string, content: string): Promise<NewsCategorization> {
    try {
      const prompt = `
Türkçe finansal haberi kategorize et.

BAŞLIK: ${title}
İÇERİK: ${content.substring(0, 1500)}

Kategoriler: COMPANY_NEWS, ECONOMIC_NEWS, POLITICAL_NEWS, MARKET_NEWS, SECTOR_NEWS, INTERNATIONAL_NEWS, TECHNOLOGY_NEWS, OTHER

JSON formatında dön:
{
  "category": "kategori",
  "subcategory": "alt kategori (opsiyonel)",
  "confidence": 0 ile 1 arası güven skoru
}
`;

      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        category: result.category || 'OTHER',
        subcategory: result.subcategory,
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      this.logger.error('OpenAI news categorization failed:', error);
      return this.fallbackNewsCategorization(title, content);
    }
  }

  /**
   * Extract stock symbols from Turkish financial text
   */
  async extractStockSymbols(text: string): Promise<StockSymbolExtraction> {
    try {
      const prompt = `
Türkçe finansal haber metninden BIST hisse senedi kodlarını çıkar.

METİN: ${text.substring(0, 2000)}

BIST hisse kodları genellikle 3-5 harf uzunluğundadır (örn: AKBNK, THYAO, TUPRS).

JSON formatında dön:
{
  "symbols": [
    {
      "symbol": "hisse kodu",
      "companyName": "şirket adı (opsiyonel)",
      "confidence": 0 ile 1 arası güven skoru
    }
  ]
}
`;

      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        symbols: result.symbols || [],
      };
    } catch (error) {
      this.logger.error('OpenAI stock symbol extraction failed:', error);
      return this.fallbackStockSymbolExtraction(text);
    }
  }

  /**
   * Generic OpenAI completion for custom prompts
   */
  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content || '{}';
    } catch (error) {
      this.logger.error('OpenAI completion failed:', error);
      return '{}';
    }
  }

  /**
   * Fallback sentiment analysis using simple keyword matching
   */
  private fallbackSentimentAnalysis(text: string): SentimentAnalysis {
    const positiveKeywords = ['artış', 'yükseliş', 'kazanç', 'başarı', 'olumlu', 'iyi', 'güçlü', 'büyüme'];
    const negativeKeywords = ['düşüş', 'kayıp', 'zarar', 'olumsuz', 'kötü', 'zayıf', 'küçülme', 'kriz'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'POSITIVE', score: 0.3, confidence: 0.3 };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'NEGATIVE', score: -0.3, confidence: 0.3 };
    } else {
      return { sentiment: 'NEUTRAL', score: 0, confidence: 0.3 };
    }
  }

  /**
   * Fallback news categorization using keyword matching
   */
  private fallbackNewsCategorization(title: string, content: string): NewsCategorization {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('şirket') || text.includes('firma') || text.includes('kurumsal')) {
      return { category: 'COMPANY_NEWS', confidence: 0.4 };
    } else if (text.includes('ekonomi') || text.includes('gdp') || text.includes('enflasyon')) {
      return { category: 'ECONOMIC_NEWS', confidence: 0.4 };
    } else if (text.includes('politika') || text.includes('hükümet') || text.includes('meclis')) {
      return { category: 'POLITICAL_NEWS', confidence: 0.4 };
    } else if (text.includes('borsa') || text.includes('hisse') || text.includes('yatırım')) {
      return { category: 'MARKET_NEWS', confidence: 0.4 };
    } else {
      return { category: 'OTHER', confidence: 0.3 };
    }
  }

  /**
   * Fallback stock symbol extraction using regex
   */
  private fallbackStockSymbolExtraction(text: string): StockSymbolExtraction {
    // Simple regex to find potential BIST stock symbols (3-5 uppercase letters)
    const symbolRegex = /\b[A-Z]{3,5}\b/g;
    const matches = text.match(symbolRegex) || [];
    
    // Filter out common non-stock words
    const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BUT', 'NOT', 'WHAT', 'ALL', 'WERE', 'WHEN', 'YOUR', 'SAID', 'EACH', 'WHICH', 'THEIR', 'TIME', 'WILL', 'ABOUT', 'IF', 'UP', 'OUT', 'MANY', 'THEN', 'THEM', 'THESE', 'SO', 'SOME', 'HER', 'WOULD', 'MAKE', 'LIKE', 'INTO', 'HIM', 'TIME', 'HAS', 'TWO', 'MORE', 'GO', 'NO', 'WAY', 'COULD', 'MY', 'THAN', 'FIRST', 'BEEN', 'CALL', 'WHO', 'ITS', 'NOW', 'FIND', 'LONG', 'DOWN', 'DAY', 'DID', 'GET', 'COME', 'MADE', 'MAY', 'PART'];
    
    const symbols = matches
      .filter(symbol => !commonWords.includes(symbol))
      .map(symbol => ({
        symbol,
        confidence: 0.3,
      }));
    
    return { symbols };
  }
}
