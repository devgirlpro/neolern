import React, { useState, useEffect } from 'react';
import './Launches.css';

const Search = () => {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLaunches, setVisibleLaunches] = useState(20);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filter, setFilter] = useState('all'); 

  const placeholderImageUrl = 'https://via.placeholder.com/150'; 
  const launcheInfoApi = 'https://api.spacexdata.com/v5/launches';
  const rocketInfoApi = 'https://api.spacexdata.com/v4/rockets/';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(launcheInfoApi);
        const data = await response.json();

        const launchDescriptions = await Promise.all(
          data.map(async (launch) => {
            const rocketResponse = await fetch(
              `${rocketInfoApi}${launch.rocket}`
            );
            const rocketData = await rocketResponse.json();
            return rocketData.description; 
          })
        );

        const combinedData = data.map((launch, index) => ({
          ...launch,
          description: launchDescriptions[index],
        }));

        setLaunches(combinedData);
        setHasMoreData(combinedData.length > visibleLaunches);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredLaunches = () => {
    let filteredData = launches;
    if (searchTerm) {
      filteredData = filteredData.filter((launch) =>
        launch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filter !== 'all') {
      if (filter === 'successful') {
        filteredData = filteredData.filter((launch) => launch.success);
      } else if (filter === 'future') {
        const today = new Date().toISOString().slice(0, 10); // Get today's date
        filteredData = filteredData.filter((launch) => launch.date_local > today);
      }
    }
    return filteredData;
  };

  const getRocketInfo = (launch) => {
    return (
      <div className="rocket-tooltip">
        <p>Rocket: {launch.rocket}</p>
        {/* You can add more information about the rocket from the API data here if available */}
      </div>
    );
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleLoadMore = () => {
    if (hasMoreData) {
      setVisibleLaunches((prevValue) => Math.min(prevValue + 20, launches.length));
    }
  };

  return (
    <div>
      <h2>SpaceX Launches</h2>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search launches..."
          value={searchTerm}
          onChange={handleChange}
        />
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">All Launches</option>
          <option value="successful">Successful Launches</option>
          <option value="future">Future Launches</option>
        </select>
      </div>
      {isLoading && <p>Loading launches...</p>}
      {error && <p>Error fetching launches: {error.message}</p>}
      {launches.length > 0 && (
        <ul className="launches">
          {getFilteredLaunches().map((launch) => (
            <li key={launch.id}>
              <div className="launch-image-container">
                <img
                  src={launch.links?.patch?.small || placeholderImageUrl}
                  alt={launch.name}
                  loading="lazy"
                />
                <div className="rocket-tooltip-container">
                  {getRocketInfo(launch)}
                </div>
              </div>
              <p>{launch.details}</p>
              <p>
                **Launch Status:** {launch.success ? "Successful" : "Failed"}
              </p>
              <p>**Rocket:** {launch.rocket}</p>
            </li>
          ))}
        </ul>
      )}
        {hasMoreData && (
        <button onClick={handleLoadMore}>Load More Launches</button>
      )}
    </div>
  );
};

export default Search;