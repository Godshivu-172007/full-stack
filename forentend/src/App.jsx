import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

// ✅ Backend API URL (Update if needed)
const API_BASE_URL = "https://full-stack-z38s.onrender.com";

function App() {
  const [jokes, setJokes] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showJokes, setShowJokes] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const personsPerPage = 5;

  // ✅ Fetch Jokes
  const fetchJokes = (isRefresh = false) => {
    setLoading(true);
    setError(null);

    axios.get(`${API_BASE_URL}/api/jokes`)
      .then((response) => {
        setJokes(response.data);
        localStorage.setItem("jokes", JSON.stringify(response.data));
      })
      .catch(() => setError("Failed to fetch jokes. Try again!"))
      .finally(() => setLoading(false));

    if (isRefresh) console.log("🔄 Refreshing jokes...");
  };

  // ✅ Fetch Persons
  const fetchPersons = () => {
    setLoading(true);
    setError(null);

    axios.get(`${API_BASE_URL}/api/persons`)
      .then((response) => setPersons(response.data))
      .catch(() => setError("Failed to fetch persons. Try again!"))
      .finally(() => setLoading(false));
  };

  // ✅ Add New Person
  const addNewPerson = () => {
    const name = prompt("Enter Name:");
    const marks = prompt("Enter Marks:");
    const age = prompt("Enter Age:");
    const dob = prompt("Enter DOB (YYYY-MM-DD):");

    if (!name || !marks || !age || !dob || isNaN(marks) || isNaN(age)) {
      return alert("❌ Invalid Input");
    }

    const newPerson = { name, marks: Number(marks), age: Number(age), dob };

    axios.post(`${API_BASE_URL}/api/persons`, newPerson)
      .then(() => {
        alert("✅ User added!");
        fetchPersons();
      })
      .catch(() => alert("❌ Failed to add person."));
  };

  useEffect(() => {
    const storedJokes = localStorage.getItem("jokes");
    storedJokes ? setJokes(JSON.parse(storedJokes)) : fetchJokes();
  }, []);

  // ✅ Pagination Logic
  const paginatedPersons = persons.slice(
    currentPage * personsPerPage,
    (currentPage + 1) * personsPerPage
  );

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>✨ Bhushan Full Stack Project 🧿</h1>

      {/* ✅ Toggle Buttons */}
      <div>
        <button onClick={() => { setShowJokes(true); fetchJokes(); }} className={showJokes ? "active" : ""}>
          🎭 Show Jokes
        </button>
        <button onClick={() => { setShowJokes(false); fetchPersons(); }} className={!showJokes ? "active" : ""}>
          👤 Person Details
        </button>
      </div>

      {loading ? <p>⏳ Loading...</p> : error ? <p style={{ color: "red" }}>❌ {error}</p> :
        showJokes ? (
          <>
            <button onClick={() => fetchJokes(true)}>🔄 Refresh Jokes</button>
            <p>JOKES: {jokes.length}</p>
            {jokes.map(joke => (
              <div key={joke.id} className="card">
                <h3>{joke.title}</h3>
                <p>{joke.content}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={addNewPerson}>➕ Add User</button>
            <p>Persons: {persons.length}</p>
            {paginatedPersons.map(person => (
              <div key={person._id} className="card">
                <h3>👤 {person.name}</h3>
                <p>🎓 Marks: {person.marks}</p>
                <p>📅 Age: {person.age}</p>
                <p>📆 DOB: {person.dob}</p>
              </div>
            ))}
            {/* ✅ Pagination */}
            <div>
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>⬅️ Previous</button>
              <button disabled={(currentPage + 1) * personsPerPage >= persons.length} onClick={() => setCurrentPage(prev => prev + 1)}>Next ➡️</button>
            </div>
          </>
        )
      }
    </div>
  );
}

export default App;
