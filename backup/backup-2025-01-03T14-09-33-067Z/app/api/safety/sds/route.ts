import { NextResponse } from 'next/server';

// Mock data for demonstration
const mockSDS = {
    chemical: {
        name: "Sodium Hydroxide",
        casNumber: "1310-73-2"
    },
    sections: [
        {
            number: 1,
            title: "Identification",
            content: [
                "Product Name: Sodium Hydroxide",
                "Common Names: Caustic Soda, Lye",
                "Recommended Use: Industrial cleaning, chemical manufacturing"
            ]
        },
        {
            number: 2,
            title: "Hazard Identification",
            content: [
                "Causes severe skin burns and eye damage",
                "May be corrosive to metals",
                "Fatal if swallowed"
            ]
        }
    ],
    hazardClass: [
        "Skin Corrosion - Category 1A",
        "Serious Eye Damage - Category 1",
        "Corrosive to Metals - Category 1"
    ],
    pictograms: [
        "corrosive",
        "toxic"
    ],
    updated: new Date().toISOString(),
    source: "Safety Data Sheet Database"
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json(
            { error: 'Chemical name is required' },
            { status: 400 }
        );
    }

    // In a real application, you would search a database or external API
    // For now, return mock data
    return NextResponse.json({
        ...mockSDS,
        chemical: {
            ...mockSDS.chemical,
            name: name
        }
    });
}
