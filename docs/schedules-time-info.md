# Schedule Timeline Documentation

## Overview

This document provides a comprehensive overview of all scheduled tasks in the InsightAPI system, their execution times, dependencies, and optimization strategies.

## 📊 Complete Schedule Timeline

### Hourly Execution Pattern

| Time | Schedule | Frequency | Duration | Purpose |
|------|----------|-----------|----------|---------|
| `:00` | **RssFetchSchedule** | Every 30 min | ~2-5 min | Fetch RSS feeds from all sources |
| `:00` | **StockFetchSchedule** | Every 15 min | ~1-3 min | Fetch BIST100 stock prices |
| `:00` | **NewsClusteringSchedule** | Every hour | ~3-8 min | Cluster related news articles |
| `:15` | **PredictionProcessorSchedule** | Every hour | ~5-15 min | Generate AI predictions for new articles |
| `:15` | **StockFetchSchedule** | Every 15 min | ~1-3 min | Fetch BIST100 stock prices |
| `:30` | **RssFetchSchedule** | Every 30 min | ~2-5 min | Fetch RSS feeds from all sources |
| `:30` | **StockFetchSchedule** | Every 15 min | ~1-3 min | Fetch BIST100 stock prices |
| `:45` | **ActualImpactTrackerSchedule** | Every hour | ~3-10 min | Evaluate prediction accuracy |
| `:45` | **StockFetchSchedule** | Every 15 min | ~1-3 min | Fetch BIST100 stock prices |

### Daily Execution Pattern

| Time | Schedule | Purpose | Duration |
|------|----------|---------|----------|
| `18:00` | **DailyAnalysisSchedule** | Generate comprehensive daily reports | ~10-20 min |
| `18:30` | **DailyLearningReportSchedule** | Generate learning insights and recommendations | ~5-15 min |
| `19:00` | **RetrospectiveLearningSchedule** | Analyze missed opportunities and patterns | ~15-30 min |

## 🔄 Job Dependencies and Flow

### Data Flow Chain
```
RSS Sources → News Articles → Stock Predictions → Impact Tracking → Learning System
     ↓              ↓              ↓                ↓              ↓
RssFetchSchedule → PredictionProcessorSchedule → ActualImpactTrackerSchedule → Learning Updates
```

### Dependency Timeline
1. **RSS Fetch** (`:00`, `:30`) → **News Articles** (15 min processing time)
2. **Prediction Processing** (`:15`) → **Stock Predictions** (30 min processing time)  
3. **Impact Tracking** (`:45`) → **Accuracy Evaluation** (15 min processing time)
4. **Daily Analysis** (`18:00`) → **Learning Reports** (`18:30`) → **Retrospective Analysis** (`19:00`)

## 📈 Schedule Optimization Benefits

### Before Optimization Issues
- ❌ **Overlap Conflicts**: DailyAnalysisSchedule and DailyLearningReportSchedule both at 18:00
- ❌ **Resource Contention**: Multiple jobs running simultaneously every 5 minutes
- ❌ **Dependency Violations**: Predictions processed before RSS fetch completed
- ❌ **API Rate Limiting**: Excessive RSS fetching every 5 minutes

### After Optimization Benefits
- ✅ **No Overlaps**: Clear time gaps between dependent jobs
- ✅ **Resource Efficiency**: Reduced concurrent database connections
- ✅ **Proper Sequencing**: Jobs run in logical dependency order
- ✅ **API Optimization**: RSS fetching reduced to reasonable 30-minute intervals
- ✅ **Predictable Execution**: Easy to monitor and debug

## 🕐 Detailed Schedule Configuration

### RSS Sources Module
```typescript
// RssFetchSchedule
readonly schedule = CronExpression.EVERY_30_MINUTES;
// Runs at: :00 and :30 of every hour
// Purpose: Fetch RSS feeds from all active sources
```

### Stock Prices Module  
```typescript
// StockFetchSchedule
readonly schedule = '0 */15 * * * *';
// Runs at: :00, :15, :30, :45 of every hour
// Purpose: Fetch BIST100 stock prices from API
```

### Stock Prediction Module
```typescript
// PredictionProcessorSchedule
readonly schedule = '0 15 * * * *';
// Runs at: :15 of every hour
// Purpose: Process new articles and generate predictions

// ActualImpactTrackerSchedule  
readonly schedule = '0 45 * * * *';
// Runs at: :45 of every hour
// Purpose: Evaluate prediction accuracy against actual results

// NewsClusteringSchedule
readonly schedule = CronExpression.EVERY_HOUR;
// Runs at: :00 of every hour
// Purpose: Cluster related news articles

// DailyAnalysisSchedule
readonly schedule = CronExpression.EVERY_DAY_AT_6PM;
// Runs at: 18:00 daily
// Purpose: Generate comprehensive daily analysis reports

// DailyLearningReportSchedule
readonly schedule = '0 30 18 * * *';
// Runs at: 18:30 daily
// Purpose: Generate learning insights and recommendations

// RetrospectiveLearningSchedule
readonly schedule = CronExpression.EVERY_DAY_AT_7PM;
// Runs at: 19:00 daily
// Purpose: Analyze missed opportunities and patterns
```

## 🔧 BaseSchedulerService Features

### Overlap Prevention
- **Running Tasks Tracking**: Uses `Set<string>` to track currently running tasks
- **Automatic Skip**: If a task is still running, new execution is skipped with warning
- **Error Handling**: Comprehensive error handling with custom error callbacks

### Monitoring Capabilities
- **Execution Logging**: Start/completion times and durations
- **Error Tracking**: Detailed error logs with stack traces
- **Manual Triggering**: Ability to manually trigger tasks for testing/debugging

## 📊 Performance Metrics

### Expected Execution Times
- **RSS Fetch**: 2-5 minutes (depends on number of sources)
- **Stock Fetch**: 1-3 minutes (BIST100 API response time)
- **Prediction Processing**: 5-15 minutes (depends on number of new articles)
- **Impact Tracking**: 3-10 minutes (depends on number of pending predictions)
- **News Clustering**: 3-8 minutes (depends on number of recent articles)
- **Daily Analysis**: 10-20 minutes (comprehensive report generation)
- **Learning Reports**: 5-15 minutes (insights and recommendations)
- **Retrospective Analysis**: 15-30 minutes (pattern analysis)

### Resource Usage
- **Database Connections**: Optimized to prevent pool exhaustion
- **Memory Usage**: Jobs include cleanup to prevent memory leaks
- **API Rate Limits**: Respectful of external API limitations

## 🚨 Monitoring and Alerts

### Key Metrics to Monitor
1. **Execution Duration**: Jobs taking longer than expected
2. **Overlap Warnings**: Tasks running simultaneously (should be rare)
3. **Error Rates**: Failed job executions
4. **Data Quality**: Prediction accuracy trends
5. **API Response Times**: External service performance

### Log Patterns to Watch
```
✅ Task "RssFetchSchedule" completed in 3247ms
⚠️  Task "PredictionProcessorSchedule" is still running, skipping this execution
❌ Task "ActualImpactTrackerSchedule" failed after 12000ms: Database connection timeout
```

## 🔄 Maintenance and Updates

### Schedule Adjustment Guidelines
1. **Maintain Dependencies**: Ensure dependent jobs have sufficient processing time
2. **Avoid Overlaps**: Keep heavy jobs separated by at least 15-30 minutes
3. **Monitor Performance**: Adjust frequencies based on actual execution times
4. **Test Changes**: Use manual triggering to test schedule changes

### Common Adjustments
- **Peak Hours**: Consider reducing frequency during high-traffic periods
- **Weekend Patterns**: Some jobs may need different schedules for weekends
- **Seasonal Adjustments**: Market hours may affect optimal timing

---

**Last Updated**: 2025-01-26  
**Version**: 1.0  
**Status**: Production Ready
