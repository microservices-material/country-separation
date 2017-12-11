call pm2 flush
call pm2 delete 0
call pm2 delete 1
call pm2 start countryPopulationData.js
call pm2 start countryData.js