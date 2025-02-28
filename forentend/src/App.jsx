import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [jokes, setJokes] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJokes, setShowJokes] = useState(true); // ✅ Toggle between Jokes & Persons
  const [currentPage, setCurrentPage] = useState(0); // ✅ Tracks pagination index
  const personsPerPage = 5; // ✅ Show 5 persons per page

  // ✅ Fetch jokes from backend
  const fetchJokes = (isRefresh = false) => {
    setLoading(true);
    setError(null);

    axios
      .get(`/api/jokes`)
      .then((response) => {
        console.log("✅ Jokes received:", response.data);
        setJokes(response.data);
        localStorage.setItem("jokes", JSON.stringify(response.data)); // ✅ Save jokes
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching jokes:", error);
        setError("Failed to fetch jokes. Please try again later.");
        setLoading(false);
      });

    if (isRefresh) {
      console.log("🔄 Refreshing jokes...");
    }
  };

  // ✅ Fetch persons from backend
  const fetchPersons = () => {
    setLoading(true);
    setError(null);

    axios
      .get(`/api/persons`)
      .then((response) => {
        console.log("✅ Persons received:", response.data);
        setPersons(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching persons:", error);
        setError("Failed to fetch persons. Please try again later.");
        setLoading(false);
      });
  };

  // ✅ Add New Person (Prompt for details & send to backend)
  const addNewPerson = () => {
    const name = prompt("Enter Name:");
    if (!name) return;

    const marks = prompt("Enter Marks:");
    if (!marks || isNaN(marks)) return alert("❌ Invalid Marks");

    const age = prompt("Enter Age:");
    if (!age || isNaN(age)) return alert("❌ Invalid Age");

    const dob = prompt("Enter DOB (YYYY-MM-DD):");
    if (!dob) return alert("❌ Invalid DOB");

    const newPerson = { name, marks: Number(marks), age: Number(age), dob };

    axios
      .post(`/api/persons`, newPerson)
      .then(() => {
        alert("✅ User added successfully!");
        fetchPersons(); // ✅ Refresh the Person list
      })
      .catch((error) => {
        console.error("❌ Error adding person:", error);
        alert("❌ Failed to add person.");
      });
  };

  useEffect(() => {
    const storedJokes = localStorage.getItem("jokes");

    if (storedJokes) {
      console.log("✅ Loaded jokes from local storage");
      setJokes(JSON.parse(storedJokes));
      setLoading(false);
    } else {
      fetchJokes();
    }
  }, []);

  // ✅ Paginated persons
  const paginatedPersons = persons.slice(
    currentPage * personsPerPage,
    (currentPage + 1) * personsPerPage
  );

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>✨ Bhushan Full Stack Project 🧿</h1>

      {/* ✅ Toggle Buttons */}
      <div>
        <button
          onClick={() => {
            setShowJokes(true);
            fetchJokes();
          }}
          style={{
            padding: "10px 15px",
            margin: "5px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: showJokes ? "#28a745" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            transition: "background 0.3s",
          }}
        >
          🎭 Show Jokes
        </button>

        <button
          onClick={() => {
            setShowJokes(false);
            fetchPersons();
          }}
          style={{
            padding: "10px 15px",
            margin: "5px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: !showJokes ? "#28a745" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            transition: "background 0.3s",
          }}
        >
          👤 Person Details
        </button>
      </div>

      {loading ? (
        <p>⏳ Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>❌ {error}</p>
      ) : showJokes ? (
        <>
          <button
            onClick={() => fetchJokes(true)}
            style={{
              padding: "10px 20px",
              margin: "10px 0",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              transition: "background 0.3s",
            }}
          >
            🔄 Refresh Jokes
          </button>

          <p>JOKES: {jokes.length}</p>
          {jokes.map((joke) => (
            <div
              key={joke.id}
              style={{
                padding: "10px",
                margin: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{joke.title}</h3>
              <p>{joke.content}</p>
            </div>
          ))}
        </>
      ) : (
        <>
          <button
            onClick={addNewPerson}
            style={{
              padding: "10px 15px",
              margin: "10px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
            }}
          >
            ➕ Add User
          </button>

          <p>Persons: {persons.length}</p>

          {paginatedPersons.map((person) => (
            <div
              key={person._id}
              style={{
                padding: "10px",
                margin: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#f1f1f1",
                textDecoration:"uppercase",
              }}
            >
              <h3>👤 {person.name}</h3>
              <p>🎓 Marks: {person.marks}</p>
              <p>📅 Age: {person.age}</p>
              <p>📆 DOB: {person.dob}</p>
            </div>
          ))}

          {/* ✅ Pagination Buttons */}
          <div>
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ⬅️ Previous
            </button>

            <button
              disabled={(currentPage + 1) * personsPerPage >= persons.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
