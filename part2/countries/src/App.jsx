import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null)
  const apiKey = import.meta.env.VITE_WEATHER_KEY

  useEffect(() => {
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`)
      .then(response => {
        setWeather(response.data)
      })
  }, [capital])

  if (!weather) {
    return null
  }

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p>temperature {weather.main.temp} °C</p>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  )
}

const Country = ({ country }) => {
  const languages = Object.values(country.languages || {})
  const capital = country.capital?.[0]

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>capital {capital}</p>
      <p>area {country.area}</p>
      <h3>languages</h3>
      <ul>
        {languages.map(language => <li key={language}>{language}</li>)}
      </ul>
      <img src={country.flags.png} alt={`flag of ${country.name.common}`} width="150" />
      {capital && <Weather capital={capital} />}
    </div>
  )
}

const Countries = ({ countries, onShow }) => {
  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length > 1) {
    return (
      <ul>
        {countries.map(country =>
          <li key={country.name.common}>
            {country.name.common}
            <button onClick={() => onShow(country.name.common)}>show</button>
          </li>
        )}
      </ul>
    )
  }

  if (countries.length === 1) {
    return <Country country={countries[0]} />
  }

  return <p>No matches found</p>
}

const App = () => {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
    setSelectedCountry(null)
  }

  const showCountry = (name) => {
    setSelectedCountry(name)
  }

  const countriesToShow = selectedCountry
    ? countries.filter(country => country.name.common === selectedCountry)
    : countries.filter(country =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
      )

  return (
    <div>
      <div>
        find countries <input value={filter} onChange={handleFilterChange} />
      </div>
      <Countries countries={countriesToShow} onShow={showCountry} />
    </div>
  )
}

export default App