function countryIndicators(countryId) {
  var theData = null
  // Argentina 
  if (countryId == 1) { 
    theData = { gini: 42.67, hdi: 0.83, lifeExpectancy: 76.3, gdpPerCapita: 12450 }
  // Brazil
  } else if (countryId == 2) { 
    theData = { gini: 51.48, hdi: 0.75, lifeExpectancy: 75, gdpPerCapita: 8650 }
  // Thailand
  } else if (countryId == 3) {
    theData = { gini: 37.85, hdi: 0.74, lifeExpectancy: 74.9, gdpPerCapita: 5900 }
  } else {
    throw new Error("There is no country having id " + countryId)
  }
  theData.countryId = countryId
  return theData
}
