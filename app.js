const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

let db = null
const DbPATH = path.join(__dirname, 'covid19India.db')

const DBandServer = async () => {
  try {
    db = await open({
      filename: DbPATH,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000')
    })
  } catch (a) {
    console.log(`DB Error:${a.message}`)
    process.exit(1)
  }
}

DBandServer()

//GET stats FROM STATE TABLE
app.get('/states/', async (request, response) => {
  const sql = `
  SELECT
    state_id  As stateId,
    state_name As  stateName,
    population As population 
 FROM state;
`
  const stateArray = await db.all(sql)
  response.send(stateArray)
})

//GET MOVIE BY MOVIE_ID
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const query = `
  SELECT 
    state_id  As stateId,
    state_name As  stateName,
    population As population
  FROM state
  WHERE state_id=${stateId};`
  const stateDetails = await db.get(query)
  response.send(stateDetails)
})

//POST district in the district table
app.post('/districts/', async (request, response) => {
  const districtsDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtsDetails
  const Query = `
  INSERT INTO
  district(district_name,state_id,cases,cured,active,deaths)
  VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`
  await db.run(Query)
  response.send('District Successfully Added')
})

//GET district BY district_ID
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `
  SELECT 
    district_id As districtId,
    district_name  As districtName,
    state_id As  stateId,
    cases As cases,
    cured As cured,
    active As active,
    deaths As deaths
  FROM district
  WHERE district_id=${districtId};`
  const districtDetails = await db.get(query)
  response.send(districtDetails)
})

//DELETE district BY district_ID
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const sql = `
  DELETE FROM district
  WHERE district_id=${districtId};`
  await db.run(sql)
  response.send('District Removed')
})

//PUT API
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const sql = `
  UPDATE District
    SET
  district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths}
  WHERE district_id=${districtId};`
  await db.run(sql)
  response.send('District Details Updated')
})

//Get stats of a specific state
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const query = `
    SELECT
      SUM(cases) AS totalCases,
      SUM(cured) AS totalCured,
      SUM(active) AS totalActive,
      SUM(deaths) AS totalDeaths
    FROM district
    WHERE state_id =${stateId};
  `
  const stats = await db.get(query)
  response.send(stats)
})

//Get state name of a district
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const query = `
    SELECT state.state_name AS stateName
    FROM district
      INNER JOIN state
      ON district.state_id = state.state_id
    WHERE district.district_id =${districtId};
  `
  const state = await db.get(query)
  response.send(state)
})

module.exports = app
