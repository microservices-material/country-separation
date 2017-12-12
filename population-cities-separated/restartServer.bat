call pm2 flush
call pm2 delete all
call pm2 start cityData.js
call pm2 start countryPopulationData.js
call pm2 start countryData.js