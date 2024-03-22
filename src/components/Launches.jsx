import React, { useState, useEffect } from 'react';
import './Launches.css';

const Launches = () => {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleLaunches, setVisibleLaunches] = useState(20);
  const [hasMoreData, setHasMoreData] = useState(true);


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

  const handleLoadMore = () => {
    if (hasMoreData) {
      setVisibleLaunches((prevValue) => Math.min(prevValue + 20, launches.length));
    }
  };

  return (
    <div>
      <h2>SpaceX Launches</h2>
      {isLoading && <p>Loading launches...</p>}
      {error && <p>Error fetching launches: {error.message}</p>}
      {launches.length > 0 && (
        <ul className="launches">
          {launches.slice(0, visibleLaunches).map((launch) => (
            <li key={launch.id}>
              <img
                src={launch.links?.patch?.small || placeholderImageUrl}
                alt={launch.name}
                loading="lazy"
              />
              <p>
                <strong>details:</strong> {launch.details}
              </p>
              <p>
                <strong>Rocket info:</strong> {launch.description}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {launch.success ? 'Successful' : 'Failed'}
              </p>
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

export default Launches;




