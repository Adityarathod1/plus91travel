import fs from "fs";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://postgres:CZjDVeVZFIUZqnFaHNgNdOjiUfrQNhen@autorack.proxy.rlwy.net:19903/railway",
});

async function main() {
    const client = await pool.connect();

    try {
        // =========================
        // 1. READ FILES
        // =========================
        // const travRaw = fs.readFileSync("./travclan.json", "utf-8");
        // const mmtRaw = fs.readFileSync("./mmt.json", "utf-8");

        // const travJson = JSON.parse(travRaw);
        // const mmtJson = JSON.parse(mmtRaw);

        const tboRaw = fs.readFileSync("./tbo.json", "utf-8");
        const tboJson = JSON.parse(tboRaw);

        // =========================
        // 2. PARSE TRAVCLAN
        // =========================
        // const travResults = travJson?.results || [];
        // let travHotels = [];

        // for (const result of travResults) {
        //     travHotels.push(...(result.data || []));
        // }

        // console.log(`📦 TravClan hotels: ${travHotels.length}`);

        // =========================
        // 3. PARSE MMT
        // =========================
        // const sections = mmtJson?.response?.personalizedSections || [];
        // let mmtHotels = [];

        // for (const section of sections) {
        //     mmtHotels.push(...(section.hotels || []));
        // }

        // console.log(`📦 MMT hotels: ${mmtHotels.length}`);

        // =========================
        // 4. PARSE TBO
        // =========================
        const tboHotels = tboJson?.data?.getHotelsForMap?.Data || [];

        console.log(`📦 TBO hotels: ${tboHotels.length}`);

        // =========================
        // 4. INSERT TRAVCLAN
        // =========================
        // for (const h of travHotels) {
        //     const name = h.name || "N/A";
        //     const price = h?.availability?.rate?.finalRate || null;

        //     if (!price) continue;

        //     await client.query(
        //         `
        // INSERT INTO hotels (hotel_name, vendor_name, price)
        // VALUES ($1, $2, $3)
        // ON CONFLICT (hotel_name, vendor_name)
        // DO UPDATE SET price = EXCLUDED.price
        // `,
        //         [name, "travclan", price]
        //     );
        // }

        // console.log("✅ TravClan inserted");

        // =========================
        // 5. INSERT MMT
        // =========================
        // for (const h of mmtHotels) {
        //     const name = h.name || "N/A";
        //     const price = h?.priceDetail?.discountedPrice || null;

        //     if (!price) continue;

        //     await client.query(
        //         `
        // INSERT INTO hotels (hotel_name, vendor_name, price)
        // VALUES ($1, $2, $3)
        // ON CONFLICT (hotel_name, vendor_name)
        // DO UPDATE SET price = EXCLUDED.price
        // `,
        //         [name, "makemytrip", price]
        //     );
        // }

        // =========================
        // 6. INSERT TBO
        // =========================
        for (const h of tboHotels) {
            const name = h.HotelName || "N/A";
            const price = h.MinAmount || null;

            if (!price) continue;

            await client.query(
                `
        INSERT INTO hotels (hotel_name, vendor_name, price)
        VALUES ($1, $2, $3)
        ON CONFLICT (hotel_name, vendor_name)
        DO UPDATE SET price = EXCLUDED.price
        `,
                [name, "travelboutiqueonline", price]
            );
        }

        console.log("✅ TBO inserted");

        // console.log("✅ MMT inserted");

        // =========================
        // DONE
        // =========================
        console.log("🎉 All data processed successfully");

    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        client.release();
    }
}

main();