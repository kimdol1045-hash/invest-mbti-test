import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fetchAllEvents, getEventById, type NormalizedEvent } from './adapters/index.ts';
import { regionCodeToName } from './adapters/types.ts';

config(); // Load .env

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// TODO: 프로덕션 배포 시 mTLS 인증서 기반 통신 적용 필요
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://today-culture.apps-in-toss.com']
    : true,
}));
app.use(express.json());

// Simple response cache
let cachedEvents: NormalizedEvent[] = [];
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (공공데이터 API 일일 호출 한도 고려)

async function getEvents(forceRefresh = false): Promise<NormalizedEvent[]> {
  const now = Date.now();
  if (!forceRefresh && cachedEvents.length > 0 && now - cacheTime < CACHE_TTL) {
    return cachedEvents;
  }
  // Fetch all with large page size for caching
  cachedEvents = await fetchAllEvents({ pageSize: 200 });
  cacheTime = now;
  return cachedEvents;
}

// GET /api/events
app.get('/api/events', async (req, res) => {
  try {
    const {
      category,
      region, // region code like '11', '41'
      keyword,
      page = '1',
      pageSize = '20',
      sort = 'latest',
    } = req.query as Record<string, string>;

    // region can be a name (서울) or code (11)
    const regionName = region
      ? (regionCodeToName(region) || region) // try code first, fallback to name
      : '';

    let events = await getEvents();

    // Filter
    if (category && category !== '전체') {
      events = events.filter(e => e.category === category);
    }
    if (regionName) {
      events = events.filter(e => e.region === regionName);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(kw) ||
        e.venue.toLowerCase().includes(kw) ||
        e.address.toLowerCase().includes(kw),
      );
    }

    // Sort
    if (sort === 'latest') {
      events.sort((a, b) => b.startDate.localeCompare(a.startDate));
    }

    // Paginate
    const p = parseInt(page);
    const ps = parseInt(pageSize);
    const start = (p - 1) * ps;
    const paged = events.slice(start, start + ps);

    res.json({
      total: events.length,
      page: p,
      pageSize: ps,
      events: paged,
    });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events', message: err.message });
  }
});

// GET /api/events/:id
app.get('/api/events/:id', async (req, res) => {
  try {
    // Ensure cache is populated
    await getEvents();

    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err: any) {
    console.error('Error fetching event detail:', err);
    res.status(500).json({ error: 'Failed to fetch event', message: err.message });
  }
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    cachedEvents: cachedEvents.length,
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Configured API keys:');
  console.log(`  DATA_GO_KR_KEY: ${process.env.DATA_GO_KR_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  CULTURE_ARTS_KEY: ${process.env.CULTURE_ARTS_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  CULTURE_PORTAL_KEY: ${process.env.CULTURE_PORTAL_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  SEOUL_API_KEY: ${process.env.SEOUL_API_KEY ? 'set' : 'NOT SET'}`);
  console.log(`  GYEONGGI_API_KEY: ${process.env.GYEONGGI_API_KEY ? 'set' : 'NOT SET'}`);

  // Pre-warm cache
  getEvents().then(() => {
    console.log(`Cache warmed: ${cachedEvents.length} events`);
  }).catch(err => {
    console.error('Cache warm failed:', err.message);
  });
});
