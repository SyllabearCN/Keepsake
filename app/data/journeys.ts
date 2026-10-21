import type { Journey } from '~/types/content'

// Replace these Bilibili BV ids with your own travel vlog ids.
export const journeys: Journey[] = [
  {
    id: 'summer-coast-vlog',
    bvid: 'BV1xx411c7mD',
    title: { zh: '带着小朋友去看海', en: 'Taking our little one to the sea' },
    description: { zh: '四天三夜的海边慢旅行，以及一只不肯离开沙滩的小脚丫。', en: 'A four-day coastal escape and a tiny pair of feet that refused to leave the beach.' },
    location: { zh: '厦门', en: 'Xiamen' },
    date: '2026-07-24',
    duration: '08:42',
    cover: '/albums/2026-summer/01-sea.jpg',
    featured: true,
  },
  {
    id: 'winter-snow-vlog',
    bvid: 'BV1xx411c7mD',
    title: { zh: '第一次一起看雪', en: 'Our first snow together' },
    description: { zh: '温泉、热可可和一整片安静的白色森林。', en: 'Hot springs, cocoa, and a whole quiet white forest.' },
    location: { zh: '北海道', en: 'Hokkaido' },
    date: '2025-01-18',
    duration: '12:08',
    cover: '/albums/2025-winter/01-snow.jpg',
  },
  {
    id: 'weekend-road-vlog',
    bvid: 'BV1xx411c7mD',
    title: { zh: '周末逃离计划', en: 'A weekend escape plan' },
    description: { zh: '没有攻略的公路旅行，反而收获了最松弛的周末。', en: 'A road trip without a plan became our most relaxed weekend.' },
    location: { zh: '皖南', en: 'Southern Anhui' },
    date: '2024-10-08',
    duration: '06:16',
    cover: '/albums/2024-slow-days/03-road.jpg',
    featured: true,
  },
]
