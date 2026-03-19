import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const lowerQuery = query.toLowerCase();

  try {
    // Pivot vendors into columns using conditional aggregation
    const { rows } = await pool.query<{
      hotel_name: string;
      makemytrip: number | null;
      travclan: number | null;
      travelboutiqueonline: number | null;
    }>(
      `
      SELECT
        hotel_name,
        MAX(CASE WHEN vendor_name = 'makemytrip' THEN price END) AS makemytrip,
        MAX(CASE WHEN vendor_name = 'travclan'   THEN price END) AS travclan,
        MAX(CASE WHEN vendor_name = 'travelboutiqueonline'    THEN price END) AS travelboutiqueonline
      FROM hotels
      WHERE LOWER(hotel_name) LIKE $1
      GROUP BY hotel_name
      `,
      [`%${lowerQuery}%`]
    );

    const exactMatches = rows.filter(
      (r) => r.hotel_name.toLowerCase() === lowerQuery
    );
    const similarMatches = rows.filter(
      (r) => r.hotel_name.toLowerCase() !== lowerQuery
    );

    return NextResponse.json({ exactMatches, similarMatches });
  } catch (err) {
    console.error('DB error:', err);
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
}