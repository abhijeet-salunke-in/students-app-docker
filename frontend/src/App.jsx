import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const emptyForm = {
  name: "",
  age: "",
  course: "BCA"
};

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const totalCourses = new Set(students.map((s) => s.course)).size;

  const averageAge =
    students.length > 0
      ? (
          students.reduce((sum, student) => sum + Number(student.age), 0) /
          students.length
        ).toFixed(1)
      : "0";

  const openAddModal = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);

    setForm({
      name: student.name,
      age: student.age,
      course: student.course
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await axios.put(
          `/api/students/${editingStudent._id}`,
          form
        );
      } else {
        await axios.post("/api/students", form);
      }

      closeModal();
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Unable to save student.");
    }
  };

  const deleteStudent = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Unable to delete student.");
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">🎓</div>

          <div>
            <h2>Student Portal</h2>
            <span>Manage • Learn • Grow</span>
          </div>
        </div>

        <nav className="navigation">

          <div className="nav-item active">
            <span>⌂</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>♙</span>
            Students
          </div>

          <div className="nav-item">
            <span>⚙</span>
            Settings
          </div>

        </nav>

        <div className="sidebar-bottom">
          <div className="connection">
            <span className="status-dot"></span>
            API Connected
          </div>

          <small>v1.0.0</small>
        </div>

      </aside>


      {/* MAIN */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">

          <div className="welcome">
            <strong>Welcome back!</strong>
            <span>Here's an overview of your students</span>
          </div>

          <div className="admin">
            <div className="date">
              📅
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>

            <div className="avatar">A</div>

            <strong>Admin</strong>
          </div>

        </header>


        {/* CONTENT */}
        <section className="content">

          <div className="page-heading">
            <div>
              <h1>
                Student <span>Management System</span>
              </h1>

              <p>
                Keep track of your students, courses and records
              </p>
            </div>

            <button
              className="add-button"
              onClick={openAddModal}
            >
              + Add Student
            </button>
          </div>


          {/* STATISTICS */}
          <div className="stats">

            <div className="stat-card">
              <div className="stat-icon blue">♙</div>

              <div>
                <p>Total Students</p>
                <h2>{students.length}</h2>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon green">▣</div>

              <div>
                <p>Total Courses</p>
                <h2>{totalCourses}</h2>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon purple">♙</div>

              <div>
                <p>Average Age</p>
                <h2>{averageAge}</h2>
              </div>
            </div>


            <div className="stat-card">
              <div className="stat-icon orange">↗</div>

              <div>
                <p>Showing</p>
                <h2>{filteredStudents.length}</h2>
              </div>
            </div>

          </div>


          {/* STUDENTS */}
          <div className="students-card">

            <div className="students-header">

              <div>
                <h2>Students</h2>
                <p>View and manage all students</p>
              </div>

              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button onClick={() => setSearch("")}>
                    ×
                  </button>
                )}
              </div>

            </div>


            {/* TABLE */}
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Course</th>
                    <th>Added On</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (

                      <tr key={student._id}>

                        <td>{index + 1}</td>

                        <td className="student-name">
                          {student.name}
                        </td>

                        <td>{student.age}</td>

                        <td>
                          <span className="course-badge">
                            {student.course}
                          </span>
                        </td>

                        <td>
                          {student.createdAt
                            ? new Date(
                                student.createdAt
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </td>

                        <td>

                          <div className="actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(student)
                              }
                            >
                              ✎ Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                deleteStudent(student._id)
                              }
                            >
                              × Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))
                  )}

                </tbody>

              </table>

            </div>


            <div className="table-footer">
              Showing {filteredStudents.length} of {students.length} students
            </div>

          </div>


          <footer>
            © 2026 Student Management System
            <span>Built with MERN • Docker • Jenkins</span>
          </footer>

        </section>

      </main>


      {/* MODAL */}
      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p>
                  {editingStudent
                    ? "Update student information"
                    : "Enter student information"}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <label>
                Student Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                />
              </label>


              <label>
                Age
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="1"
                  required
                />
              </label>


              <label>
                Course
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                >
                  <option value="BCA">BCA</option>
                  <option value="BCS">BCS</option>
                  <option value="BBA">BBA</option>
                  <option value="B.Com">B.Com</option>
                  <option value="MCA">MCA</option>
                </select>
              </label>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
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
