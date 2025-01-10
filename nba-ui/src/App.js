import React, { useEffect, useState } from 'react';

const App = () => {
  const [games, setGames] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  // Function to fetch games data from S3 based on the selected date
  const fetchGames = async (selectedDate) => {
    const bucketUrl = `<S#-URL>/nba-data/${selectedDate}.json`;
    setLoading(true);
    try {
      const response = await fetch(bucketUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch data from S3");
      }
      const data = await response.json();
      setGames(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NBA games:", error);
      setLoading(false);
    }
  };

  // Function to handle date change
  const handleDateChange = async (event) => {
    const selectedDate = event.target.value;
    setDate(selectedDate);

    // Fetch data from S3 after Lambda completes processing
    await fetchGames(selectedDate);
  };

  useEffect(() => {
    fetchGames(date);
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">NBA Game Updates</h1>
        
        <div className="flex justify-center mb-6">
          <label htmlFor="date" className="text-xl text-gray-700 mr-4">Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            id="date"
            className="border border-gray-300 rounded-lg p-2 text-gray-800"
          />
        </div>

        {loading && <p className="text-center text-blue-600">Loading...</p>}

        <div className="space-y-4">
          {games.length ? (
            games.map((game, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-blue-700">
                  {game.AwayTeam} vs {game.HomeTeam}
                </h2>
                <p className="text-gray-700">Status: <span className="font-semibold">{game.Status}</span></p>
                <p className="text-gray-700">Score: <span className="font-semibold">{game.AwayTeamScore} - {game.HomeTeamScore}</span></p>
                <p className="text-gray-700">Start Time: <span className="font-semibold">{game.DateTime}</span></p>
                <p className="text-gray-700">Channel: <span className="font-semibold">{game.Channel}</span></p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No games available for the selected date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
