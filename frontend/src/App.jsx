import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const courses = ["BCA", "BCS", "BBA", "MCA", "MBA"];

function App() {
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    course: "",
    age: ""
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    courses: [],
    averageAge: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     FETCH STUDENTS
  ========================= */

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const params = {};

      if (search) params.search = search;
      if (course) params.course = course;
      if (age) params.age = age;

      const response = await axios.get("/api/students", {
        params
      });

      setStudents(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH STATISTICS
  ========================= */

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/students/stats");
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  /* =========================
     SEARCH / FILTER
  ========================= */

  const handleFilter = () => {
    fetchStudents();
  };

  const clearFilters = () => {
    setSearch("");
    setCourse("");
    setAge("");

    setTimeout(() => {
      fetchStudents();
    }, 0);
  };

  /* =========================
     FORM HANDLING
  ========================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setEditingStudent(null);

    setFormData({
      name: "",
      course: "",
      age: ""
    });

    setShowForm(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name,
      course: student.course,
      age: student.age
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await axios.put(
          `/api/students/${editingStudent._id}`,
          formData
        );

        setMessage("Student updated successfully.");
      } else {
        await axios.post("/api/students", formData);

        setMessage("Student added successfully.");
      }

      closeForm();

      await fetchStudents();
      await fetchStats();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
          "Something went wrong."
      );
    }
  };

  /* =========================
     DELETE
  ========================= */

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/students/${id}`);

      setMessage("Student deleted successfully.");

      await fetchStudents();
      await fetchStats();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete student.");
    }
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>Student Management</h1>
          <p>
            Manage students, courses and records
          </p>
        </div>

        <button
          className="add-btn"
          onClick={openAddForm}
        >
          + Add Student
        </button>
      </header>

      {/* STATISTICS */}

      <section className="stats">

        <div className="stat-card">
          <span>Total Students</span>
          <strong>{stats.totalStudents}</strong>
        </div>

        <div className="stat-card">
          <span>Total Courses</span>
          <strong>{stats.courses.length}</strong>
        </div>

        <div className="stat-card">
          <span>Average Age</span>
          <strong>{stats.averageAge}</strong>
        </div>

        <div className="stat-card">
          <span>Showing</span>
          <strong>{students.length}</strong>
        </div>

      </section>

      {/* COURSE STATISTICS */}

      <section className="course-stats">

        <h2>Course Statistics</h2>

        <div className="course-list">

          {stats.courses.map((item) => (
            <div
              className="course-card"
              key={item._id}
            >
              <span>{item._id}</span>
              <strong>{item.count}</strong>
            </div>
          ))}

        </div>

      </section>

      {/* SEARCH / FILTER */}

      <section className="filters">

        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilter();
            }
          }}
        />

        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option value="">All Courses</option>

          {courses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <button onClick={handleFilter}>
          Search
        </button>

        <button
          className="clear-btn"
          onClick={clearFilters}
        >
          Clear
        </button>

      </section>

      {/* MESSAGE */}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* STUDENTS */}

      <section className="students-section">

        <div className="section-header">
          <h2>Students</h2>

          <span>
            {students.length} record
            {students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="empty">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="empty">
            No students found.
          </div>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {students.map((student) => (
                  <tr key={student._id}>

                    <td>
                      <strong>{student.name}</strong>
                    </td>

                    <td>{student.age}</td>

                    <td>
                      <span className="course-badge">
                        {student.course}
                      </span>
                    </td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEditForm(student)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteStudent(student._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingStudent
                  ? "Edit Student"
                  : "Add Student"}
              </h2>

              <button
                className="close-btn"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Course</label>

              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select course
                </option>

                {courses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label>Age</label>

              <input
                type="number"
                name="age"
                placeholder="Enter age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                required
              />

              <div className="form-actions">

                <button
                  type="button"
                  className="clear-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-btn"
                >
                  {editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;
