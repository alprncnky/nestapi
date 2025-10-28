# StockInsight Web Dashboard - Comprehensive Development Guide

## 📋 Document Overview

**Document Purpose**: Complete web development specification for StockInsight dashboard based on InsightAPI endpoints
**Target Audience**: Frontend development team
**Document Version**: 1.0
**Last Updated**: 2025-01-26
**Status**: Implementation Ready

---

## 🎯 Project Overview

### Current State Analysis
The existing dashboard has basic functionality for:
- ✅ Dashboard overview with basic stats
- ✅ News articles listing with filtering
- ✅ RSS sources management with CRUD operations
- ✅ Basic stock tracker component
- ✅ Reliability component placeholder

### Required Enhancements
Based on the comprehensive API endpoints, the dashboard needs significant expansion to cover:
- 📊 **Stock Prediction Module**: Complete prediction management system
- 📈 **Advanced Analytics**: Daily reports, retrospective analysis
- 🔍 **Pattern Recognition**: AI-powered pattern discovery
- 📋 **Learning System**: Prediction rules and accuracy tracking
- 🎛️ **Real-time Monitoring**: Live prediction tracking and updates

---

## 🏗️ Application Architecture

### Tech Stack
- **Framework**: Angular 20
- **State Management**: NgRx (for complex state)
- **UI Library**: Angular Material + Custom Components
- **Charts**: Chart.js or D3.js
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with lazy loading
- **Styling**: SCSS with CSS Grid/Flexbox

### Project Structure
```
src/app/
├── core/                           # Core functionality
│   ├── services/                   # API services
│   ├── guards/                     # Route guards
│   ├── interceptors/               # HTTP interceptors
│   └── models/                     # TypeScript interfaces
├── shared/                         # Shared components
│   ├── components/                 # Reusable UI components
│   ├── pipes/                      # Custom pipes
│   ├── directives/                 # Custom directives
│   └── utils/                      # Utility functions
├── features/                       # Feature modules
│   ├── dashboard/                  # Dashboard module
│   ├── news/                       # News management
│   ├── rss-sources/                # RSS sources management
│   ├── stock-prices/               # Stock prices tracking
│   ├── predictions/                # Stock predictions
│   ├── analytics/                  # Analytics and reports
│   ├── reliability/                # Reliability tracking
│   └── settings/                  # Application settings
└── layouts/                        # Layout components
    ├── main-layout/                # Main application layout
    └── auth-layout/                # Authentication layout
```

---

## 📱 Page Structure & Navigation

### Main Navigation Menu
```typescript
const navigationItems = [
  {
    path: '/dashboard',
    label: '📊 Dashboard',
    icon: 'dashboard',
    description: 'System overview and key metrics'
  },
  {
    path: '/news',
    label: '📰 News',
    icon: 'article',
    description: 'News articles management'
  },
  {
    path: '/sources',
    label: '📡 RSS Sources',
    icon: 'rss_feed',
    description: 'RSS feed sources management'
  },
  {
    path: '/stocks',
    label: '📈 Stock Prices',
    icon: 'trending_up',
    description: 'Real-time stock price tracking'
  },
  {
    path: '/predictions',
    label: '🔮 Predictions',
    icon: 'psychology',
    description: 'AI-powered stock predictions'
  },
  {
    path: '/analytics',
    label: '📊 Analytics',
    icon: 'analytics',
    description: 'Reports and insights'
  },
  {
    path: '/reliability',
    label: '🎯 Reliability',
    icon: 'verified',
    description: 'Prediction accuracy tracking'
  },
  {
    path: '/settings',
    label: '⚙️ Settings',
    icon: 'settings',
    description: 'System configuration'
  }
];
```

---

## 🎨 Detailed Page Specifications

### 1. Dashboard Page (`/dashboard`)

#### Overview
Central hub displaying system health, key metrics, and quick access to important information.

#### Components Required
```typescript
interface DashboardComponents {
  // Statistics Cards
  statsCards: {
    totalNews: StatCard;
    activeSources: StatCard;
    pendingPredictions: StatCard;
    systemAccuracy: StatCard;
    activeStocks: StatCard;
    dailyPredictions: StatCard;
  };
  
  // Charts and Visualizations
  charts: {
    predictionAccuracyTrend: LineChart;
    newsVolumeChart: BarChart;
    stockPerformanceChart: CandlestickChart;
    sourceReliabilityChart: PieChart;
  };
  
  // Quick Access Widgets
  widgets: {
    latestHighImpactNews: NewsWidget;
    topPerformingStocks: StockWidget;
    recentPredictions: PredictionWidget;
    systemAlerts: AlertWidget;
  };
}
```

#### Key Features
- **Real-time Updates**: WebSocket connection for live data
- **Customizable Layout**: Drag-and-drop widget arrangement
- **Quick Actions**: One-click access to common operations
- **Alert System**: System notifications and warnings

#### API Integration
```typescript
// Dashboard service methods
class DashboardService {
  getSystemStats(): Observable<SystemStats>
  getLatestNews(limit: number): Observable<NewsArticle[]>
  getTopStocks(limit: number): Observable<StockPrice[]>
  getRecentPredictions(limit: number): Observable<Prediction[]>
  getAccuracyTrend(days: number): Observable<AccuracyData[]>
}
```

### 2. News Management Page (`/news`)

#### Current State Enhancement
Extend existing news listing with advanced features.

#### New Components Required
```typescript
interface NewsPageComponents {
  // Enhanced Listing
  newsGrid: NewsGridComponent;
  newsTable: NewsTableComponent;
  
  // Advanced Filtering
  advancedFilters: {
    categoryFilter: MultiSelectFilter;
    sentimentFilter: RangeFilter;
    impactLevelFilter: SelectFilter;
    dateRangeFilter: DateRangeFilter;
    sourceFilter: MultiSelectFilter;
    stockMentionFilter: AutocompleteFilter;
  };
  
  // News Management
  newsActions: {
    bulkActions: BulkActionToolbar;
    exportOptions: ExportDropdown;
    refreshButton: RefreshButton;
  };
  
  // News Details
  newsDetailModal: NewsDetailModal;
  newsEditModal: NewsEditModal;
}
```

#### Advanced Features
- **Bulk Operations**: Select multiple articles for batch processing
- **Advanced Search**: Full-text search with filters
- **Export Options**: CSV, Excel, PDF export
- **News Clustering**: Group related news articles
- **Sentiment Analysis**: Visual sentiment indicators
- **Stock Mention Highlighting**: Highlight mentioned stocks

#### API Integration
```typescript
class NewsService {
  // Existing methods
  getNewsList(criteria: CriteriaDto): Observable<NewsListResponse>
  getNewsById(id: number): Observable<NewsArticle>
  saveNews(news: SaveNewsArticleDto): Observable<NewsArticle>
  deleteNews(id: number): Observable<void>
  
  // New methods
  searchNews(query: string, filters: NewsFilters): Observable<NewsArticle[]>
  getNewsByStock(symbol: string): Observable<NewsArticle[]>
  getNewsClusters(): Observable<NewsCluster[]>
  exportNews(format: string, criteria: CriteriaDto): Observable<Blob>
  bulkUpdateNews(ids: number[], updates: Partial<NewsArticle>): Observable<void>
}
```

### 3. RSS Sources Management (`/sources`)

#### Current State Enhancement
Enhance existing RSS sources management with advanced features.

#### New Components Required
```typescript
interface SourcesPageComponents {
  // Enhanced Management
  sourcesTable: SourcesTableComponent;
  sourceDetailModal: SourceDetailModal;
  sourceEditModal: SourceEditModal;
  
  // Source Monitoring
  sourceMonitoring: {
    fetchStatusIndicator: StatusIndicator;
    lastFetchTime: TimeDisplay;
    fetchHistoryChart: LineChart;
    errorLogs: ErrorLogComponent;
  };
  
  // Source Analytics
  sourceAnalytics: {
    reliabilityTrend: LineChart;
    newsVolumeChart: BarChart;
    categoryDistribution: PieChart;
    performanceMetrics: MetricsGrid;
  };
  
  // Bulk Operations
  bulkOperations: {
    bulkActivate: BulkActionButton;
    bulkDeactivate: BulkActionButton;
    bulkDelete: BulkActionButton;
    bulkTest: BulkActionButton;
  };
}
```

#### Advanced Features
- **Source Testing**: Test RSS feed connectivity and parsing
- **Performance Monitoring**: Track fetch times and success rates
- **Reliability Scoring**: Visual reliability score trends
- **Error Logging**: Detailed error logs and debugging
- **Bulk Operations**: Manage multiple sources simultaneously
- **Source Templates**: Pre-configured source templates

#### API Integration
```typescript
class SourcesService {
  // Existing methods
  getSourcesList(criteria: CriteriaDto): Observable<RssSourceListResponse>
  getSourceById(id: number): Observable<RssSource>
  saveSource(source: SaveRssSourceDto): Observable<RssSource>
  deleteSource(id: number): Observable<void>
  
  // New methods
  testSource(url: string): Observable<SourceTestResult>
  getSourcePerformance(id: number): Observable<SourcePerformance>
  getSourceErrorLogs(id: number): Observable<ErrorLog[]>
  bulkUpdateSources(ids: number[], updates: Partial<RssSource>): Observable<void>
  getSourceTemplates(): Observable<SourceTemplate[]>
}
```

### 4. Stock Prices Page (`/stocks`)

#### Complete Redesign Required
Transform basic stock tracker into comprehensive stock monitoring system.

#### Components Required
```typescript
interface StocksPageComponents {
  // Stock Overview
  stockOverview: {
    marketSummary: MarketSummaryCard;
    topGainers: StockListComponent;
    topLosers: StockListComponent;
    mostActive: StockListComponent;
  };
  
  // Stock Details
  stockDetails: {
    stockInfo: StockInfoCard;
    priceChart: CandlestickChart;
    volumeChart: BarChart;
    technicalIndicators: TechnicalIndicators;
  };
  
  // Stock Search & Filtering
  stockSearch: {
    searchInput: AutocompleteInput;
    sectorFilter: SelectFilter;
    marketCapFilter: RangeFilter;
    performanceFilter: SelectFilter;
  };
  
  // Stock Comparison
  stockComparison: {
    comparisonTable: ComparisonTable;
    comparisonChart: MultiLineChart;
    addToComparison: AddStockButton;
  };
  
  // Real-time Updates
  realTimeUpdates: {
    priceTicker: PriceTickerComponent;
    updateIndicator: UpdateIndicator;
    lastUpdateTime: TimeDisplay;
  };
}
```

#### Advanced Features
- **Real-time Price Updates**: WebSocket connection for live prices
- **Interactive Charts**: Candlestick charts with technical indicators
- **Stock Comparison**: Compare multiple stocks side-by-side
- **Sector Analysis**: Group stocks by sectors
- **Price Alerts**: Set price alerts for specific stocks
- **Historical Data**: Access to historical price data
- **Technical Analysis**: Built-in technical indicators

#### API Integration
```typescript
class StockPricesService {
  // Existing methods
  getStockById(id: number): Observable<StockPrice>
  getAllLatestStocks(): Observable<StockPriceListResponse>
  getStockBySymbol(symbol: string): Observable<StockPrice>
  
  // New methods
  getStocksBySymbols(symbols: string[]): Observable<StockPrice[]>
  getStockHistory(symbol: string, startDate: Date, endDate: Date): Observable<StockPrice[]>
  getMarketSummary(): Observable<MarketSummary>
  getSectorPerformance(): Observable<SectorPerformance[]>
  getTopMovers(type: 'gainers' | 'losers' | 'active'): Observable<StockPrice[]>
  subscribeToPriceUpdates(symbols: string[]): Observable<StockPriceUpdate>
}
```

### 5. Stock Predictions Page (`/predictions`) - **NEW**

#### Complete New Module
This is a completely new module for managing AI-powered stock predictions.

#### Components Required
```typescript
interface PredictionsPageComponents {
  // Prediction Management
  predictionList: PredictionListComponent;
  predictionDetail: PredictionDetailComponent;
  predictionForm: PredictionFormComponent;
  
  // Prediction Analytics
  predictionAnalytics: {
    accuracyChart: LineChart;
    confidenceDistribution: HistogramChart;
    predictionTrends: TrendChart;
    performanceMetrics: MetricsGrid;
  };
  
  // Prediction Rules
  predictionRules: {
    rulesList: RulesListComponent;
    ruleEditor: RuleEditorComponent;
    rulePerformance: RulePerformanceChart;
  };
  
  // Pattern Recognition
  patternRecognition: {
    patternsList: PatternsListComponent;
    patternDetail: PatternDetailComponent;
    patternChart: PatternChart;
  };
  
  // Learning System
  learningSystem: {
    learningProgress: ProgressChart;
    accuracyImprovement: ImprovementChart;
    learningInsights: InsightsList;
  };
}
```

#### Key Features
- **Prediction Creation**: Manual prediction creation interface
- **Prediction Tracking**: Real-time prediction outcome tracking
- **Accuracy Analytics**: Comprehensive accuracy analysis
- **Rule Management**: Create and manage prediction rules
- **Pattern Discovery**: View discovered patterns
- **Learning Progress**: Track system learning progress
- **Retrospective Analysis**: Analyze missed opportunities

#### API Integration
```typescript
class PredictionsService {
  // Prediction Management
  triggerPrediction(dto: CreatePredictionDto): Observable<{message: string}>
  getPredictions(criteria: CriteriaDto): Observable<PredictionListResponse>
  getPredictionById(id: number): Observable<PredictionResponse>
  
  // Analytics
  getDailyReports(criteria: CriteriaDto): Observable<DailyReportListResponse>
  getRetrospectiveAnalyses(criteria: CriteriaDto): Observable<RetrospectiveAnalysisListResponse>
  getPatterns(type?: string): Observable<Pattern[]>
  
  // Learning System
  getPredictionRules(type?: string): Observable<PredictionRule[]>
  triggerRetrospectiveAnalysis(): Observable<{message: string}>
  triggerDailyReport(): Observable<{message: string}>
}
```

### 6. Analytics Page (`/analytics`) - **NEW**

#### Complete New Module
Comprehensive analytics and reporting system.

#### Components Required
```typescript
interface AnalyticsPageComponents {
  // Report Dashboard
  reportDashboard: {
    reportSelector: ReportSelector;
    dateRangePicker: DateRangePicker;
    exportOptions: ExportDropdown;
  };
  
  // Daily Reports
  dailyReports: {
    reportsList: ReportsListComponent;
    reportDetail: ReportDetailComponent;
    reportChart: ReportChart;
  };
  
  // Retrospective Analysis
  retrospectiveAnalysis: {
    analysisList: AnalysisListComponent;
    analysisDetail: AnalysisDetailComponent;
    missedOpportunities: MissedOpportunitiesList;
  };
  
  // Performance Metrics
  performanceMetrics: {
    accuracyMetrics: AccuracyMetricsChart;
    predictionVolume: VolumeChart;
    sourcePerformance: SourcePerformanceChart;
    timeBasedAnalysis: TimeAnalysisChart;
  };
  
  // Custom Reports
  customReports: {
    reportBuilder: ReportBuilderComponent;
    savedReports: SavedReportsList;
    scheduledReports: ScheduledReportsList;
  };
}
```

#### Key Features
- **Daily Reports**: Comprehensive daily analysis reports
- **Retrospective Analysis**: Analysis of missed opportunities
- **Performance Metrics**: System performance tracking
- **Custom Reports**: Build custom analytics reports
- **Export Options**: Export reports in various formats
- **Scheduled Reports**: Automated report generation
- **Interactive Charts**: Dynamic and interactive visualizations

### 7. Reliability Tracking Page (`/reliability`)

#### Enhancement of Existing Component
Transform basic reliability component into comprehensive tracking system.

#### Components Required
```typescript
interface ReliabilityPageComponents {
  // Reliability Overview
  reliabilityOverview: {
    overallAccuracy: AccuracyCard;
    accuracyTrend: TrendChart;
    sourceReliability: SourceReliabilityChart;
    predictionDistribution: DistributionChart;
  };
  
  // Tracking Management
  trackingManagement: {
    trackingList: TrackingListComponent;
    trackingDetail: TrackingDetailComponent;
    trackingForm: TrackingFormComponent;
  };
  
  // Accuracy Analysis
  accuracyAnalysis: {
    accuracyByCategory: CategoryAccuracyChart;
    accuracyBySource: SourceAccuracyChart;
    accuracyByTime: TimeAccuracyChart;
    accuracyByStock: StockAccuracyChart;
  };
  
  // Performance Insights
  performanceInsights: {
    insightsList: InsightsListComponent;
    improvementSuggestions: SuggestionsList;
    performanceAlerts: AlertsList;
  };
}
```

#### Key Features
- **Comprehensive Tracking**: Track all prediction outcomes
- **Accuracy Analysis**: Detailed accuracy breakdown
- **Performance Insights**: AI-generated insights and suggestions
- **Source Reliability**: Track reliability by source
- **Improvement Tracking**: Monitor system improvements over time

### 8. Settings Page (`/settings`) - **NEW**

#### Complete New Module
System configuration and user preferences.

#### Components Required
```typescript
interface SettingsPageComponents {
  // System Settings
  systemSettings: {
    apiConfiguration: ApiConfigForm;
    predictionSettings: PredictionSettingsForm;
    notificationSettings: NotificationSettingsForm;
    dataRetentionSettings: DataRetentionForm;
  };
  
  // User Preferences
  userPreferences: {
    dashboardLayout: DashboardLayoutEditor;
    themeSettings: ThemeSelector;
    languageSettings: LanguageSelector;
    timezoneSettings: TimezoneSelector;
  };
  
  // System Monitoring
  systemMonitoring: {
    systemHealth: HealthIndicator;
    performanceMetrics: PerformanceMetrics;
    errorLogs: ErrorLogsViewer;
    systemAlerts: SystemAlertsList;
  };
  
  // Data Management
  dataManagement: {
    dataExport: DataExportComponent;
    dataImport: DataImportComponent;
    dataCleanup: DataCleanupComponent;
    backupRestore: BackupRestoreComponent;
  };
}
```

---

## 🔧 Shared Components Architecture

### Core UI Components
```typescript
// Data Display Components
interface DataDisplayComponents {
  dataTable: DataTableComponent<T>;
  dataGrid: DataGridComponent<T>;
  dataCard: DataCardComponent<T>;
  dataList: DataListComponent<T>;
  dataChart: DataChartComponent<T>;
}

// Form Components
interface FormComponents {
  formField: FormFieldComponent;
  formSelect: FormSelectComponent;
  formDatePicker: FormDatePickerComponent;
  formMultiSelect: FormMultiSelectComponent;
  formRangeSlider: FormRangeSliderComponent;
  formAutocomplete: FormAutocompleteComponent;
}

// Action Components
interface ActionComponents {
  actionButton: ActionButtonComponent;
  actionMenu: ActionMenuComponent;
  bulkActionToolbar: BulkActionToolbarComponent;
  exportDropdown: ExportDropdownComponent;
  refreshButton: RefreshButtonComponent;
}

// Layout Components
interface LayoutComponents {
  pageHeader: PageHeaderComponent;
  pageContent: PageContentComponent;
  sidebar: SidebarComponent;
  breadcrumb: BreadcrumbComponent;
  modal: ModalComponent;
  drawer: DrawerComponent;
}
```

### Chart Components
```typescript
interface ChartComponents {
  lineChart: LineChartComponent;
  barChart: BarChartComponent;
  pieChart: PieChartComponent;
  candlestickChart: CandlestickChartComponent;
  histogramChart: HistogramChartComponent;
  scatterChart: ScatterChartComponent;
  multiLineChart: MultiLineChartComponent;
  heatmapChart: HeatmapChartComponent;
}
```

---

## 📊 State Management Strategy

### NgRx Store Structure
```typescript
interface AppState {
  // Feature States
  dashboard: DashboardState;
  news: NewsState;
  sources: SourcesState;
  stocks: StocksState;
  predictions: PredictionsState;
  analytics: AnalyticsState;
  reliability: ReliabilityState;
  settings: SettingsState;
  
  // Shared States
  ui: UIState;
  auth: AuthState;
  notifications: NotificationState;
}

// Example Feature State
interface NewsState {
  articles: NewsArticle[];
  selectedArticle: NewsArticle | null;
  filters: NewsFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortOptions: SortOptions;
}
```

### Actions Structure
```typescript
// News Actions Example
export const NewsActions = {
  // Load Actions
  loadNews: createAction('[News] Load News'),
  loadNewsSuccess: createAction('[News] Load News Success', props<{articles: NewsArticle[]}>()),
  loadNewsFailure: createAction('[News] Load News Failure', props<{error: string}>()),
  
  // CRUD Actions
  createNews: createAction('[News] Create News', props<{news: SaveNewsArticleDto}>()),
  updateNews: createAction('[News] Update News', props<{id: number, news: SaveNewsArticleDto}>()),
  deleteNews: createAction('[News] Delete News', props<{id: number}>()),
  
  // Filter Actions
  setFilters: createAction('[News] Set Filters', props<{filters: NewsFilters}>()),
  setSearchQuery: createAction('[News] Set Search Query', props<{query: string}>()),
  setSortOptions: createAction('[News] Set Sort Options', props<{sort: SortOptions}>()),
  
  // UI Actions
  selectArticle: createAction('[News] Select Article', props<{article: NewsArticle}>()),
  clearSelection: createAction('[News] Clear Selection'),
  setLoading: createAction('[News] Set Loading', props<{loading: boolean}>()),
};
```

---

## 🔌 API Integration Strategy

### Service Architecture
```typescript
// Base API Service
abstract class BaseApiService<T, TCreate, TUpdate> {
  protected baseUrl: string;
  
  constructor(protected http: HttpClient, endpoint: string) {
    this.baseUrl = `${environment.apiUrl}/api/${endpoint}`;
  }
  
  // Generic CRUD operations
  getAll(criteria?: CriteriaDto): Observable<T[]>
  getById(id: number): Observable<T>
  create(item: TCreate): Observable<T>
  update(id: number, item: TUpdate): Observable<T>
  delete(id: number): Observable<void>
  
  // Pagination support
  getPaginated(criteria: CriteriaDto): Observable<PaginatedResponse<T>>
  
  // Search support
  search(query: string, filters?: any): Observable<T[]>
}

// Specific Service Implementation
@Injectable()
export class NewsService extends BaseApiService<NewsArticle, SaveNewsArticleDto, SaveNewsArticleDto> {
  constructor(http: HttpClient) {
    super(http, 'news');
  }
  
  // News-specific methods
  getNewsByCategory(category: string): Observable<NewsArticle[]>
  getNewsByStock(symbol: string): Observable<NewsArticle[]>
  getNewsByDateRange(startDate: Date, endDate: Date): Observable<NewsArticle[]>
  exportNews(format: string, criteria: CriteriaDto): Observable<Blob>
}
```

### Error Handling Strategy
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
        }
        
        // Show user-friendly error message
        this.notificationService.showError(errorMessage);
        
        return throwError(() => error);
      })
    );
  }
}
```

---

## 🎨 UI/UX Design Guidelines

### Design System
```scss
// Color Palette
$primary-color: #2563eb;
$secondary-color: #64748b;
$success-color: #059669;
$warning-color: #d97706;
$error-color: #dc2626;
$info-color: #0891b2;

// Typography
$font-family-primary: 'Inter', sans-serif;
$font-family-mono: 'JetBrains Mono', monospace;

// Spacing
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

### Component Styling
```scss
// Card Component
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  &-header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: $spacing-md;
    margin-bottom: $spacing-md;
    
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: $primary-color;
    }
  }
  
  &-body {
    // Card body styles
  }
}

// Data Table Component
.data-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: $spacing-sm $spacing-md;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    color: $secondary-color;
  }
  
  tr:hover {
    background-color: #f9fafb;
  }
}
```

---

## 📱 Responsive Design Strategy

### Mobile-First Approach
```scss
// Mobile Styles (default)
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
}

// Tablet Styles
@media (min-width: $breakpoint-md) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Desktop Styles
@media (min-width: $breakpoint-lg) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Large Desktop Styles
@media (min-width: $breakpoint-xl) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Component Responsiveness
```typescript
// Responsive Service
@Injectable()
export class ResponsiveService {
  private breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };
  
  getCurrentBreakpoint(): Observable<string> {
    return fromEvent(window, 'resize').pipe(
      startWith(window.innerWidth),
      map(width => this.getBreakpointName(width)),
      distinctUntilChanged()
    );
  }
  
  private getBreakpointName(width: number): string {
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    return 'sm';
  }
}
```

---

## 🔄 Real-time Updates Strategy

### WebSocket Integration
```typescript
@Injectable()
export class WebSocketService {
  private socket: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(): Observable<any> {
    return new Observable(observer => {
      this.socket = new WebSocket(environment.wsUrl);
      
      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        observer.next({ type: 'connected' });
      };
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);
      };
      
      this.socket.onclose = () => {
        this.handleReconnect();
      };
      
      this.socket.onerror = (error) => {
        observer.error(error);
      };
    });
  }
  
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }
}
```

### Real-time Data Updates
```typescript
// Real-time Stock Prices
@Injectable()
export class RealTimeStockService {
  private priceUpdates$ = new Subject<StockPriceUpdate>();
  
  constructor(private wsService: WebSocketService) {
    this.wsService.connect().subscribe(data => {
      if (data.type === 'stock_price_update') {
        this.priceUpdates$.next(data.payload);
      }
    });
  }
  
  getPriceUpdates(): Observable<StockPriceUpdate> {
    return this.priceUpdates$.asObservable();
  }
  
  subscribeToStocks(symbols: string[]): void {
    this.wsService.send({
      type: 'subscribe_stocks',
      symbols
    });
  }
}
```

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Component Testing Example
describe('NewsListComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;
  let newsService: jasmine.SpyObj<NewsService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('NewsService', ['getNewsList', 'deleteNews']);
    
    TestBed.configureTestingModule({
      declarations: [NewsListComponent],
      providers: [
        { provide: NewsService, useValue: spy }
      ]
    });
    
    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    newsService = TestBed.inject(NewsService) as jasmine.SpyObj<NewsService>;
  });
  
  it('should load news on init', () => {
    const mockNews = [/* mock data */];
    newsService.getNewsList.and.returnValue(of(mockNews));
    
    component.ngOnInit();
    
    expect(newsService.getNewsList).toHaveBeenCalled();
    expect(component.newsList).toEqual(mockNews);
  });
});
```

### Integration Testing
```typescript
// API Integration Testing
describe('NewsService Integration', () => {
  let service: NewsService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NewsService]
    });
    
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should fetch news list', () => {
    const mockResponse = { items: [], total: 0 };
    
    service.getNewsList({ page: 0, pageSize: 10 }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/news/getlist`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

---

## 🚀 Performance Optimization

### Lazy Loading Strategy
```typescript
// App Routing with Lazy Loading
const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'news',
    loadChildren: () => import('./features/news/news.module').then(m => m.NewsModule)
  },
  {
    path: 'predictions',
    loadChildren: () => import('./features/predictions/predictions.module').then(m => m.PredictionsModule)
  },
  // ... other routes
];
```

### Virtual Scrolling
```typescript
// Virtual Scrolling for Large Lists
@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollComponent {
  items = Array.from({length: 10000}, (_, i) => ({name: `Item ${i}`}));
}
```

### Caching Strategy
```typescript
// HTTP Caching Interceptor
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, any>();
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    const cachedResponse = this.cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event);
        }
      })
    );
  }
}
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Angular 20 project structure
- [ ] Implement core services and models
- [ ] Create shared components library
- [ ] Set up routing and navigation
- [ ] Implement basic authentication

### Phase 2: Core Features (Week 3-4)
- [ ] Enhance existing dashboard page
- [ ] Improve news management page
- [ ] Enhance RSS sources management
- [ ] Implement stock prices tracking
- [ ] Add real-time updates

### Phase 3: Advanced Features (Week 5-6)
- [ ] Implement predictions module
- [ ] Create analytics and reports
- [ ] Enhance reliability tracking
- [ ] Add pattern recognition features
- [ ] Implement learning system UI

### Phase 4: Polish & Optimization (Week 7-8)
- [ ] Add settings and configuration
- [ ] Implement advanced filtering and search
- [ ] Add export/import functionality
- [ ] Optimize performance
- [ ] Add comprehensive testing

### Phase 5: Testing & Deployment (Week 9-10)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment preparation

---

## 🎯 Success Metrics

### User Experience Metrics
- **Page Load Time**: < 2 seconds for initial load
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB for initial bundle
- **Lighthouse Score**: > 90 for all categories

### Functionality Metrics
- **API Integration**: 100% endpoint coverage
- **Real-time Updates**: < 1 second latency
- **Data Accuracy**: 99.9% data consistency
- **Error Handling**: Graceful error recovery

### Performance Metrics
- **Memory Usage**: < 100MB for typical usage
- **CPU Usage**: < 50% during normal operation
- **Network Efficiency**: Optimized API calls
- **Caching Hit Rate**: > 80% for static data

---

## 🔧 Development Tools & Setup

### Required Dependencies
```json
{
  "dependencies": {
    "@angular/core": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/router": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "@angular/material": "^20.0.0",
    "@ngrx/store": "^18.0.0",
    "@ngrx/effects": "^18.0.0",
    "chart.js": "^4.4.0",
    "rxjs": "^7.8.0",
    "lodash-es": "^4.17.21"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^20.0.0",
    "@angular/cli": "^20.0.0",
    "@types/lodash-es": "^4.17.12",
    "karma": "^6.4.0",
    "jasmine": "^5.1.0"
  }
}
```

### Development Environment Setup
```bash
# Install Angular CLI
npm install -g @angular/cli@latest

# Create new project
ng new stockinsight-dashboard --routing --style=scss

# Install additional dependencies
npm install @angular/material @ngrx/store @ngrx/effects chart.js lodash-es

# Install development dependencies
npm install --save-dev @types/lodash-es
```

---

## 📚 Documentation Requirements

### Technical Documentation
- [ ] API integration documentation
- [ ] Component library documentation
- [ ] State management documentation
- [ ] Testing strategy documentation
- [ ] Deployment guide

### User Documentation
- [ ] User manual
- [ ] Feature guides
- [ ] Troubleshooting guide
- [ ] FAQ section
- [ ] Video tutorials

---

## 🎉 Conclusion

This comprehensive web development specification provides a complete roadmap for transforming the existing StockInsight dashboard into a full-featured financial analysis platform. The specification covers:

- **Complete page structure** for all API modules
- **Advanced component architecture** with reusable components
- **Real-time data integration** with WebSocket support
- **Comprehensive state management** with NgRx
- **Performance optimization** strategies
- **Testing and deployment** guidelines

The implementation follows Angular best practices and provides a scalable, maintainable codebase that can grow with the project's requirements.

**Estimated Timeline**: 10 weeks for complete implementation
**Team Size**: 2-3 frontend developers
**Priority**: High - Critical for API utilization

---

**Document Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 implementation  
**Dependencies**: InsightAPI backend completion
