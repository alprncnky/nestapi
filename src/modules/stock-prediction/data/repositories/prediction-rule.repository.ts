import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../../common/base/base-repository';
import { PredictionRule } from '../entities/prediction-rule.entity';
import { RuleTypeEnum } from '../../contracts/enums/rule-type.enum';

@Injectable()
export class PredictionRuleRepository extends BaseRepository<PredictionRule> {
  constructor(@InjectRepository(PredictionRule) repository: Repository<PredictionRule>) {
    super(repository);
  }

  async findByTypeAndValue(ruleType: RuleTypeEnum, ruleValue: string): Promise<PredictionRule | null> {
    return await this.findOne({ ruleType, ruleValue } as any);
  }

  async findTopPerforming(limit: number = 10): Promise<PredictionRule[]> {
    return await this.repository.find({
      order: { averageAccuracy: 'DESC' },
      take: limit,
    });
  }

  async findByRuleType(ruleType: RuleTypeEnum): Promise<PredictionRule[]> {
    return await this.findBy({ ruleType } as any);
  }

  async findHighAccuracyRules(minAccuracy: number = 70): Promise<PredictionRule[]> {
    return await this.repository
      .createQueryBuilder('rule')
      .where('rule.averageAccuracy >= :minAccuracy', { minAccuracy })
      .orderBy('rule.averageAccuracy', 'DESC')
      .getMany();
  }
}
