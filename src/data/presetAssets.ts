import { StockAsset } from '../types/finance';

export const PRESET_ASSETS: StockAsset[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Полупроводники & AI',
    currentPrice: 138.5,
    sharesOutstanding: 24.5,
    freeCashFlow: 54.0, // $54B FCF
    netCash: 26.0, // $26B net cash
    marketCap: 3393, // ~$3.39T
    peRatio: 52.4,
    beta: 1.68,
    historicalGrowthRate: 48.2,
    description: 'Лидер в области графических процессоров и ускорителей вычислений для искусственного интеллекта.',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Потребительские технологии',
    currentPrice: 232.0,
    sharesOutstanding: 15.1,
    freeCashFlow: 108.8, // $108.8B FCF
    netCash: -48.0, // Net debt around -$48B
    marketCap: 3503, // ~$3.5T
    peRatio: 34.8,
    beta: 1.05,
    historicalGrowthRate: 9.6,
    description: 'Глобальная экосистема устройств, сервисов и программных платформ с огромным свободным денежным потоком.',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    sector: 'Облачные сервисы & ПО',
    currentPrice: 428.0,
    sharesOutstanding: 7.43,
    freeCashFlow: 74.1, // $74.1B FCF
    netCash: 12.0,
    marketCap: 3180, // ~$3.18T
    peRatio: 33.2,
    beta: 1.18,
    historicalGrowthRate: 14.5,
    description: 'Облачная платформа Azure, пакет Office 365, enterprise решения и стратегические инвестиции в OpenAI.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Интернет & Реклама',
    currentPrice: 178.0,
    sharesOutstanding: 12.3,
    freeCashFlow: 69.2, // $69.2B FCF
    netCash: 88.0, // huge cash hoard
    marketCap: 2189,
    peRatio: 23.9,
    beta: 1.12,
    historicalGrowthRate: 15.3,
    description: 'Поисковая экосистема Google, YouTube, облачные сервисы Google Cloud и передовые AI-модели Gemini.',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Электронная коммерция & Cloud',
    currentPrice: 198.0,
    sharesOutstanding: 10.5,
    freeCashFlow: 51.5, // $51.5B FCF
    netCash: -12.0,
    marketCap: 2079,
    peRatio: 41.6,
    beta: 1.25,
    historicalGrowthRate: 24.1,
    description: 'Крупнейший в мире маркетплейс и лидер облачной инфраструктуры AWS с расширяющейся операционной маржой.',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Электромобили & Робототехника',
    currentPrice: 255.0,
    sharesOutstanding: 3.2,
    freeCashFlow: 6.8, // $6.8B FCF
    netCash: 24.0, // Solid cash cushion
    marketCap: 816,
    peRatio: 78.5,
    beta: 2.21,
    historicalGrowthRate: 28.0,
    description: 'Производство электромобилей, энергетические системы Megapack, автономное вождение FSD и проект Optimus.',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Социальные сети & AI',
    currentPrice: 585.0,
    sharesOutstanding: 2.53,
    freeCashFlow: 52.8,
    netCash: 42.0,
    marketCap: 1480,
    peRatio: 27.2,
    beta: 1.22,
    historicalGrowthRate: 18.4,
    description: 'Платформы семейств Instagram, WhatsApp, Facebook и разработки в области открытого ИИ (Llama).',
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Technologies',
    sector: 'Data & Enterprise AI',
    currentPrice: 44.0,
    sharesOutstanding: 2.28,
    freeCashFlow: 0.95,
    netCash: 4.0,
    marketCap: 100.3,
    peRatio: 94.0,
    beta: 1.85,
    historicalGrowthRate: 31.0,
    description: 'Платформы Foundry и AIP для анализа больших данных оборонных ведомств и корпораций.',
  },
  {
    ticker: 'BRK.B',
    name: 'Berkshire Hathaway',
    sector: 'Холдинг & Страхование',
    currentPrice: 465.0,
    sharesOutstanding: 2.18,
    freeCashFlow: 38.5,
    netCash: 280.0, // massive cash reserves
    marketCap: 1013,
    peRatio: 21.0,
    beta: 0.82,
    historicalGrowthRate: 8.2,
    description: 'Инвестиционный конгломерат Уоррена Баффета с крупнейшим страховым флоутом и рекордной подушкой ликвидности.',
  },
  {
    ticker: 'SPY',
    name: 'S&P 500 ETF (Базовый индекс)',
    sector: 'Широкий рынок США',
    currentPrice: 580.0,
    sharesOutstanding: 0.92,
    freeCashFlow: 24.5,
    netCash: 0,
    marketCap: 533,
    peRatio: 24.5,
    beta: 1.0,
    historicalGrowthRate: 10.2,
    description: 'Бенчмарк крупнейших 500 публичных корпораций США, эталон рыночной доходности.',
  },
];
