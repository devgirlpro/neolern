import React, { useState, useEffect } from 'react';
import './Launches.css';

const Launches = () => {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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

        // Fetch rocket description for each launch concurrently using Promise.all
        const launchDescriptions = await Promise.all(
          data.map(async (launch) => {
            const rocketResponse = await fetch(
              `${rocketInfoApi}${launch.rocket}`
            );
            const rocketData = await rocketResponse.json();
            return rocketData.description; // Extract description from rocket info
          })
        );

        const combinedData = data.map((launch, index) => ({
          ...launch,
          description: launchDescriptions[index],
        }));

        setLaunches(combinedData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>SpaceX Launches</h2>
      {isLoading && <p>Loading launches...</p>}
      {error && <p>Error fetching launches: {error.message}</p>}
      {launches.length > 0 && (
        <ul className="launches">
          {launches.map((launch) => (
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
    </div>
  );
};

export default Launches;
