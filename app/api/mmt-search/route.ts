import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(
            'https://mapi.makemytrip.com/clientbackend/cg/search-hotels/DESKTOP/2?cityCode=CTDUB&language=eng&region=in&currency=INR&idContext=B2C&countryCode=UNI&funnel=myPartner',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',

                    // 🔥 Only required headers
                    'origin': 'https://www.makemytrip.com',
                    'referer': 'https://www.makemytrip.com/',

                    // ⚠️ IMPORTANT: move this to env
                    'mmt-auth': 'MAT111398cd3311efa7599f2c638719a94d43cd14444eb17cd2dab9e4e1ea35847c3ec5fcbe962179bfa58ac4e7a62e253e7Z',

                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('MMT Proxy Error:', error);
        return NextResponse.json(
            { error: 'Proxy failed' },
            { status: 500 }
        );
    }
}