import { Injectable, Logger } from '@nestjs/common';
import { NewsReliabilityService } from '../../../news-reliability/business/services/news-reliability.service';
import { StockPricesService } from '../../../stock-prices/business/services/stock-prices.service';
import { PatternRecognitionRepository } from '../../data/repositories/pattern-recognition.repository';
import { PatternRecognition } from '../../data/entities/pattern-recognition.entity';

@Injectable()
export class PatternRecognitionService {
  private readonly logger = new Logger(PatternRecognitionService.name);

  constructor(
    private readonly reliabilityService: NewsReliabilityService,
    private readonly stockPricesService: StockPricesService,
    private readonly patternRepository: PatternRecognitionRepository,
  ) {}

  /**
   * Analyze time-based patterns (hour of day, day of week)
   */
  async analyzeTimeBasedPatterns(): Promise<void> {
    try {
      const predictions = await this.reliabilityService.findByDateRange(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );

      // Analyze hourly patterns
      const hourlyAccuracy = new Map<number, number[]>();
      const hourlyVolume = new Map<number, number[]>();

      predictions.forEach(prediction => {
        const hour = prediction.createdAt.getHours();
        
        // Track accuracy by hour
        if (!hourlyAccuracy.has(hour)) {
          hourlyAccuracy.set(hour, []);
        }
        hourlyAccuracy.get(hour)!.push(prediction.predictionAccuracy || 0);
        
        // Track volume by hour
        if (!hourlyVolume.has(hour)) {
          hourlyVolume.set(hour, []);
        }
        hourlyVolume.get(hour)!.push(1); // Count predictions
      });

      // Find patterns
      for (const [hour, accuracies] of hourlyAccuracy) {
        const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        const volume = hourlyVolume.get(hour)?.length || 0;
        
        if (avgAccuracy > 80 && volume > 10) {
          await this.savePattern({
            patternType: 'TIME_BASED',
            patternData: JSON.stringify({
              type: 'hourly_accuracy',
              hour,
              averageAccuracy: avgAccuracy,
              volume,
              description: `${hour}:00 saatlerinde yüksek tahmin doğruluğu`
            }),
            confidence: avgAccuracy,
            frequency: volume,
          });
        }
      }

      // Analyze day-of-week patterns
      const dailyAccuracy = new Map<number, number[]>();
      predictions.forEach(prediction => {
        const dayOfWeek = prediction.createdAt.getDay();
        if (!dailyAccuracy.has(dayOfWeek)) {
          dailyAccuracy.set(dayOfWeek, []);
        }
        dailyAccuracy.get(dayOfWeek)!.push(prediction.predictionAccuracy || 0);
      });

      for (const [dayOfWeek, accuracies] of dailyAccuracy) {
        const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        
        if (avgAccuracy > 75 && accuracies.length > 5) {
          await this.savePattern({
            patternType: 'TIME_BASED',
            patternData: JSON.stringify({
              type: 'daily_accuracy',
              dayOfWeek,
              dayName: dayNames[dayOfWeek],
              averageAccuracy: avgAccuracy,
              volume: accuracies.length,
              description: `${dayNames[dayOfWeek]} günlerinde yüksek tahmin doğruluğu`
            }),
            confidence: avgAccuracy,
            frequency: accuracies.length,
          });
        }
      }

    } catch (error) {
      this.logger.error('Error analyzing time-based patterns:', error);
    }
  }

  /**
   * Analyze sector correlation patterns
   */
  async analyzeSectorCorrelations(): Promise<void> {
    try {
      // Get all stocks and their movements
      const allStocks = await this.stockPricesService.findAllLatest();
      const movements = [];

      for (const stock of allStocks) {
        const prices = await this.stockPricesService.findBySymbolAndDateRange(
          stock.stockSymbol,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date()
        );

        if (prices.length >= 2) {
          const startPrice = prices[0].last;
          const endPrice = prices[prices.length - 1].last;
          const changePercent = ((endPrice - startPrice) / startPrice) * 100;
          
          movements.push({
            symbol: stock.stockSymbol,
            changePercent,
            sector: this.getSectorFromSymbol(stock.stockSymbol), // Simple sector mapping
          });
        }
      }

      // Group by sector and analyze correlations
      const sectorMovements = new Map<string, number[]>();
      movements.forEach(movement => {
        if (!sectorMovements.has(movement.sector)) {
          sectorMovements.set(movement.sector, []);
        }
        sectorMovements.get(movement.sector)!.push(movement.changePercent);
      });

      // Find sector-wide patterns
      for (const [sector, changes] of sectorMovements) {
        if (changes.length > 3) {
          const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
          const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length);
          
          if (Math.abs(avgChange) > 3 || volatility > 5) {
            await this.savePattern({
              patternType: 'SECTOR_CORRELATION',
              patternData: JSON.stringify({
                sector,
                averageChange: avgChange,
                volatility,
                stockCount: changes.length,
                description: `${sector} sektöründe ${avgChange > 0 ? 'pozitif' : 'negatif'} trend`
              }),
              confidence: Math.min(100, Math.abs(avgChange) * 10),
              frequency: changes.length,
            });
          }
        }
      }

    } catch (error) {
      this.logger.error('Error analyzing sector correlations:', error);
    }
  }

  /**
   * Analyze volume spike patterns
   */
  async analyzeVolumePatterns(): Promise<void> {
    try {
      const allStocks = await this.stockPricesService.findAllLatest();
      
      for (const stock of allStocks) {
        const prices = await this.stockPricesService.findBySymbolAndDateRange(
          stock.stockSymbol,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date()
        );

        if (prices.length >= 2) {
          // Calculate average volume
          const volumes = prices.map(p => p.volumeLot);
          const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
          
          // Find volume spikes (>200% of average)
          const volumeSpikes = prices.filter(p => p.volumeLot > avgVolume * 2);
          
          if (volumeSpikes.length > 0) {
            // Check if volume spikes correlate with price movements
            for (const spike of volumeSpikes) {
              const priceChange = spike.dailyChangePercent;
              
              if (Math.abs(priceChange) > 5) {
                await this.savePattern({
                  patternType: 'VOLUME_PATTERN',
                  patternData: JSON.stringify({
                    stockSymbol: stock.stockSymbol,
                    volumeRatio: spike.volumeLot / avgVolume,
                    priceChange,
                    spikeTime: spike.lastUpdate,
                    description: `${stock.stockSymbol} hissesinde hacim artışı ile fiyat değişimi korelasyonu`
                  }),
                  confidence: Math.min(100, Math.abs(priceChange) * 5),
                  frequency: 1,
                });
              }
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error analyzing volume patterns:', error);
    }
  }

  /**
   * Analyze market condition patterns
   */
  async analyzeMarketConditionPatterns(): Promise<void> {
    try {
      const allStocks = await this.stockPricesService.findAllLatest();
      const marketMovements = [];

      // Calculate market-wide movements
      for (const stock of allStocks) {
        const prices = await this.stockPricesService.findBySymbolAndDateRange(
          stock.stockSymbol,
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          new Date()
        );

        if (prices.length >= 2) {
          const startPrice = prices[0].last;
          const endPrice = prices[prices.length - 1].last;
          const changePercent = ((endPrice - startPrice) / startPrice) * 100;
          
          marketMovements.push(changePercent);
        }
      }

      if (marketMovements.length > 10) {
        const avgMovement = marketMovements.reduce((a, b) => a + b, 0) / marketMovements.length;
        const volatility = Math.sqrt(marketMovements.reduce((sum, change) => sum + Math.pow(change - avgMovement, 2), 0) / marketMovements.length);
        
        // Classify market condition
        let marketCondition = 'NORMAL';
        if (volatility > 3) marketCondition = 'HIGH_VOLATILITY';
        if (avgMovement > 2) marketCondition = 'BULLISH';
        if (avgMovement < -2) marketCondition = 'BEARISH';
        
        await this.savePattern({
          patternType: 'MARKET_CONDITION',
          patternData: JSON.stringify({
            condition: marketCondition,
            averageMovement: avgMovement,
            volatility,
            stockCount: marketMovements.length,
            description: `Piyasa durumu: ${marketCondition}`
          }),
          confidence: Math.min(100, volatility * 10),
          frequency: 1,
        });
      }

    } catch (error) {
      this.logger.error('Error analyzing market condition patterns:', error);
    }
  }

  /**
   * Save pattern to database
   */
  private async savePattern(patternData: Partial<PatternRecognition>): Promise<void> {
    try {
      const pattern = new PatternRecognition();
      Object.assign(pattern, patternData);
      pattern.lastSeen = new Date();
      pattern.createdAt = new Date();
      
      await this.patternRepository.save(pattern);
      
      this.logger.debug(`Saved pattern: ${patternData.patternType} - ${JSON.parse(patternData.patternData || '{}').description || 'No description'}`);
    } catch (error) {
      this.logger.error('Error saving pattern:', error);
    }
  }

  /**
   * Apply patterns to predictions
   */
  async applyPatterns(prediction: any): Promise<any> {
    try {
      const hour = prediction.createdAt.getHours();
      const dayOfWeek = prediction.createdAt.getDay();
      
      // Get time-based patterns
      const timePatterns = await this.patternRepository.findByPatternType('TIME_BASED');
      
      let adjustmentFactor = 1;
      let confidenceBoost = 0;
      
      for (const pattern of timePatterns) {
        const data = JSON.parse(pattern.patternData);
        
        if (data.type === 'hourly_accuracy' && data.hour === hour) {
          adjustmentFactor *= (pattern.confidence / 100);
          confidenceBoost += 5;
        }
        
        if (data.type === 'daily_accuracy' && data.dayOfWeek === dayOfWeek) {
          adjustmentFactor *= (pattern.confidence / 100);
          confidenceBoost += 3;
        }
      }
      
      // Apply adjustments
      prediction.predictedChangePercent *= adjustmentFactor;
      prediction.predictionConfidence = Math.min(100, prediction.predictionConfidence + confidenceBoost);
      
      return prediction;
    } catch (error) {
      this.logger.error('Error applying patterns:', error);
      return prediction;
    }
  }

  /**
   * Simple sector mapping based on stock symbols
   */
  private getSectorFromSymbol(symbol: string): string {
    // Simple sector mapping - in real implementation, this would be more sophisticated
    const sectorMap: Record<string, string> = {
      'AKBNK': 'BANKING',
      'GARAN': 'BANKING',
      'ISCTR': 'BANKING',
      'THYAO': 'AVIATION',
      'TUPRS': 'ENERGY',
      'SAHOL': 'HOLDING',
      'KOZAL': 'CHEMICAL',
      'PETKM': 'ENERGY',
    };
    
    return sectorMap[symbol] || 'OTHER';
  }
}
