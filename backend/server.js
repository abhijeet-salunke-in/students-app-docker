const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema, "students");

/* =========================
   GET ALL STUDENTS
   Search + Filter
========================= */

app.get("/api/students", async (req, res) => {
  try {
    const { search, course, age } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (course) {
      filter.course = course;
    }

    if (age) {
      filter.age = Number(age);
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   GET SINGLE STUDENT
========================= */

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   CREATE STUDENT
========================= */

app.post("/api/students", async (req, res) => {
  try {
    const { name, course, age } = req.body;

    const student = new Student({
      name,
      course,
      age
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

/* =========================
   UPDATE STUDENT
========================= */

app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, course, age } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        course,
        age
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

/* =========================
   DELETE STUDENT
========================= */

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   DASHBOARD STATISTICS
========================= */

app.get("/api/students/stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const courseStats = await Student.aggregate([
      {
        $group: {
          _id: "$course",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ]);

    const ageStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          averageAge: {
            $avg: "$age"
          }
        }
      }
    ]);

    res.json({
      totalStudents,
      courses: courseStats,
      averageAge:
        ageStats.length > 0
          ? Number(ageStats[0].averageAge.toFixed(1))
          : 0
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });
