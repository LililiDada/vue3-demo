export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}

export interface KLineItem {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  amount: number
  amplitude: number
  changePercent: number
  changeAmount: number
  turnoverRate: number
}

export interface StockSpotItem {
  code: string
  name: string
  price: number
  changePercent: number
  changeAmount: number
  volume: number
  amount: number
  high: number
  low: number
  open: number
  turnoverRate: number
}

export interface FundRankItem {
  code: string
  name: string
  unitNav: number
  accumNav: number
  dayReturn: string
  weekReturn: string
  monthReturn: string
  threeMonthReturn: string
  sixMonthReturn: string
  yearReturn: string
}

export interface FuturesSpotItem {
  code: string
  name: string
  price: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  position: number
}

export interface MacroItem {
  date: string
  value: number
}
