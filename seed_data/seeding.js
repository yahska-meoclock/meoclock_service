const Seeder =  require("mongo-seeding").Seeder
const path = require('path');

const config = {
    database: {
      host: '127.0.0.1',
      port: 27017,
      name: 'meoclocks',
    },
};

const seeder = new Seeder(config);

const loadInitialData = async () => {
    try {
        const collections = seeder.readCollectionsFromPath(path.resolve('./seed_data'), {
            transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
          });
        console.log(collections)
        await seeder.import(collections);
    } catch(e) {
        console.log(e)
    }
}

const main = async ()=>{
    console.log("Loading Data")
    await loadInitialData()
    console.log("Data Loaded")
}

main()