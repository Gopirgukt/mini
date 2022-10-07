import {Component} from 'react'

import Cookies from 'js-cookie'
import Header from '../Header'
import FailureView from '../FailureView'
import LoadingView from '../Loader'
import MovieDetailsLink from '../MovieDetailsLink'
import FooterSection from '../FooterSection'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class MovieItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    movieDetailsList: [],
    genresList: [],
    similarMoviesList: [],
    spokenLanguagesList: [],
  }

  componentDidMount() {
    this.getMovieDetailsList()
  }

  getMovieDetailsList = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const {match} = this.props
    const {params} = match
    const {id} = params

    const jwtToken = Cookies.get('jwt_token')

    const movieItemDetailsApi = `https://apis.ccbp.in/movies-app/movies/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(movieItemDetailsApi, options)

    if (response.ok === true) {
      const fetchedData = await response.json()
      console.log(fetchedData)

      const updatedData = {
        id: fetchedData.movie_details.id,
        adult: fetchedData.movie_details.adult,
        backdropPath: fetchedData.movie_details.poster_path,
        budget: fetchedData.movie_details.budget,
        title: fetchedData.movie_details.title,
        overview: fetchedData.movie_details.overview,
        releaseDate: fetchedData.movie_details.release_date,
        ratingCount: fetchedData.movie_details.vote_count,
        ratingAverage: fetchedData.movie_details.vote_average,
        runtime: fetchedData.movie_details.runtime,
        posterPath: fetchedData.movie_details.poster_path,
      }
      console.log(updatedData)

      const genresData = fetchedData.movie_details.genres.map(eachGenre => ({
        id: eachGenre.id,
        name: eachGenre.name,
      }))

      const similarMoviesData = fetchedData.movie_details.similar_movies.map(
        eachSimilar => ({
          id: eachSimilar.id,
          posterPath: eachSimilar.poster_path,
          title: eachSimilar.title,
        }),
      )

      const spokenLanguagesData = fetchedData.movie_details.spoken_languages.map(
        eachLanguage => ({
          id: eachLanguage.id,
          language: eachLanguage.english_name,
        }),
      )

      this.setState({
        apiStatus: apiStatusConstants.success,
        movieDetailsList: updatedData,
        genresList: genresData,
        similarMoviesList: similarMoviesData,
        spokenLanguagesList: spokenLanguagesData,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  onClickRetry = () => {
    this.getMovieDetailsList()
  }

  renderFailureView = () => <FailureView onClickRetry={this.onClickRetry} />

  renderLoadingView = () => <LoadingView />

  renderSuccessView = () => {
    const {
      movieDetailsList,
      similarMoviesList,
      genresList,
      spokenLanguagesList,
    } = this.state
    console.log(movieDetailsList)

    const {
      adult,
      backdropPath,
      budget,
      overview,
      releaseDate,
      runtime,
      title,
      ratingAverage,
      ratingCount,
    } = movieDetailsList
    console.log(backdropPath)

    const hours = Math.floor(runtime / 60)
    const minutes = runtime % 60
    const movieRuntime = `${hours}h ${minutes}m `
    const censorCertificate = adult ? 'A' : 'U/A'

    const year = new Date(releaseDate).getFullYear()

    return (
      <>
        <div className="background">
          <div
            style={{backgroundImage: `url(${backdropPath})`}}
            className="movie-details-home-page"
          >
            <Header />
            <div className="home-page-container">
              <h1 className="title">{title}</h1>
              <div className="movie-details">
                <p className="run-time">{movieRuntime}</p>
                <p className="censor">{censorCertificate}</p>
                <p className="rele-year">{year}</p>
              </div>
              <p className="over-view">{overview}</p>
              <button type="button" className="play-btn">
                Play
              </button>
            </div>
          </div>
          <div className="movie-information">
            <div className="movie-details-container">
              <div className="each-info">
                <h1 className="info-heading">Genres</h1>
                <ul className="list-items">
                  {genresList.map(eachGenre => (
                    <li className="genre-name" key={eachGenre.id}>
                      {eachGenre.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="each-info">
                <h1 className="info-heading">Audio Available</h1>
                <ul className="list-items">
                  {spokenLanguagesList.map(eachLang => (
                    <li className="genre-name" key={eachLang.id}>
                      {eachLang.language}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="each-info">
                <h1 className="info-heading">Rating Count</h1>
                <p className="genre-name">{ratingCount}</p>
                <h1 className="info-heading">Rating Average</h1>
                <p className="genre-name">{ratingAverage}</p>
              </div>
              <div className="each-info">
                <h1 className="info-heading">Budget</h1>
                <p className="genre-name">{budget}</p>
                <h1 className="info-heading">Release Date</h1>
                <p className="genre-name">{releaseDate}</p>
              </div>
            </div>
            <div className="similar-movies-container">
              <h1 className="side-heading">More like this</h1>
              <div className="similar-movies-list">
                {similarMoviesList.map(eachMovie => (
                  <MovieDetailsLink
                    movieDetails={eachMovie}
                    key={eachMovie.id}
                  />
                ))}
              </div>
            </div>

            <FooterSection />
          </div>
        </div>
      </>
    )
  }

  renderMovieDetailsView = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return <>{this.renderMovieDetailsView()}</>
  }
}

export default MovieItemDetails
