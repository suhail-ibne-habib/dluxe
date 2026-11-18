const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function startImport() {
  console.log('Booting Strapi instance...');
  const app = await createStrapi().load();

  let csvFilePath = path.join(process.cwd(), 'airports.csv');
  if (!fs.existsSync(csvFilePath)) {
    csvFilePath = path.join(process.cwd(), 'airports.csv');
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: CSV file not found at ${csvFilePath}`);
    await app.destroy();
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records. Starting import...`);

  for (const record of records) {
    try {
      let locationDocId = null;

      if (record.location && record.location.trim() !== '') {
        const countryName = record.location.trim();

        // 1. Search for existing location by country_name
        const existingLocations = await app.documents('api::location.location').findMany({
          filters: { country_name: { $eq: countryName } },
        });

        if (existingLocations && existingLocations.length > 0) {
          locationDocId = existingLocations[0].documentId;
          console.log(`[INFO] Found existing Location for country: ${countryName} with documentId: ${locationDocId}`);
        } 
        else {
          // 2. Create the Location entry in published status
          const createdLocation = await app.documents('api::location.location').create({
            data: {
              country_name: countryName,
              isAvailable: true,
              isEnabled: true,
            },
            status: 'published',
          });

          console.log(`[INFO] Created new Location for country: ${countryName} with documentId: ${createdLocation.documentId}`);

          // Extract documentId directly from created response
          if (createdLocation && createdLocation.documentId) {
            locationDocId = createdLocation.documentId;
          } else {
            // Fallback query to fetch the newly created document's documentId
            const fetchedNew = await app.documents('api::location.location').findMany({
              filters: { country_name: { $eq: countryName } },
            });
            if (fetchedNew && fetchedNew.length > 0) {
              locationDocId = fetchedNew[0].documentId;
            }
          }
        }
      }

      // 3. Prepare payload for Airport creation
      const airportPayload = {
        airportName: record.airportName,
        iata_code: record.iata_code,
      };

      // Only add location relation if a valid documentId was resolved
      if (locationDocId) {
        airportPayload.location = locationDocId; // Make sure this is the correct field name
      } else {
        console.warn(`[WARN] No location found for ${record.airportName}, creating without location`);
      }

      // 4. Create Airport document - FIXED: use singular 'airport'
      const createdAirport = await app.documents('api::airport.airport').create({
        data: airportPayload,
        status: 'published',
      });

      console.log(`[INFO] Created Airport: ${record.airportName} with documentId: ${createdAirport.documentId}`);

      console.log(`[SUCCESS] Imported: ${record.airportName} (${record.location || 'No location'} ${locationDocId})`);
    } catch (err) {
      console.error(`[ERROR] Failed to import ${record.airportName || 'unknown'}:`, err.message);
      console.error(err.stack); // Add stack trace for debugging
    }
  }

  console.log('--- IMPORT COMPLETED SUCCESSFULLY ---');

  // Gracefully close Strapi
  await app.destroy();
  process.exit(0);
}

startImport();