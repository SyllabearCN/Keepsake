import type { Journey } from '~/types/content'

export const journeys: Journey[] = [
  {
    id: 'wedding-day',
    bvid: 'BV1BJnr6AEs8',
    title: {
      zh: '婚礼那天',
      en: 'Wedding Day',
    },
    description: {
      zh: '婚礼当天，留下属于我们的珍贵片段。',
      en: 'The moments we kept from our wedding day.',
    },
    location: {
      zh: '婚礼记录',
      en: 'Wedding memories',
    },
    date: '2026-10-22',
    duration: '--:--',
    featured: false,
  },
  {
    id: 'hundred-day-photo',
    bvid: 'BV1CFnq68Esj',
    title: {
      zh: '百日照',
      en: '100-Day Photo Session',
    },
    description: { zh: '记录宝宝百日照的拍摄花絮。', en: 'Behind the scenes of our baby’s 100-day photo session.' },
    location: { zh: '家庭日常', en: 'Family moments' },
    date: '2026-06-16',
    duration: '03:17',
    featured: true,
  },
  {
    id: 'hundred-day-record',
    bvid: 'BV1zTnq6RE2v',
    title: {
      zh: '百日记录',
      en: '100-Day Memories',
    },
    description: { zh: '属于宝宝百日的家庭成长记录。', en: 'A family keepsake from our baby’s first 100 days.' },
    location: { zh: '成长记录', en: 'Growing up' },
    date: '2026-06-16',
    duration: '03:50',
    featured: true,
  },
]
