// server.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://masumbillahnishan:NQG0KqX8kb9i3Lr5@cluster0.w9n8919.mongodb.net/?retryWrites=true&w=majority&appName=cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const studentCollection = client.db("studentsDB").collection("students");
        const teacherCollection = client.db("studentsDB").collection("teachers");
        const courseCollection = client.db("studentsDB").collection("courses");

        app.get('/students', async (req, res) => {
            const cursor = studentCollection.find();
            const results = await cursor.toArray();
            res.send(results);
        });

        app.get('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await studentCollection.findOne(query);
            res.send(result);
        });

        app.get('/students/:id', async (req, res) => {
            const studentId = req.params.id;
            try {
                // Find the student document by ID
                const student = await studentCollection.findOne({ studentID: studentId });
                if (!student) {
                    return res.status(404).send({ error: 'Student not found' });
                }
                // Retrieve the courses data for the student
                const courses = await courseCollection.find({ _id: { $in: student.results.map(result => result.courseId) } }).toArray();
                // Combine the student data with the enrolled courses
                const studentWithCourses = {
                    ...student,
                    courses: courses
                };
                res.send(studentWithCourses);
            } catch (error) {
                console.error('Error fetching student data:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        });
        


        app.get('/courses', async (req, res) => {
            const cursor = courseCollection.find();
            const results = await cursor.toArray();
            res.send(results);
        });

        app.get('/teachers', async (req, res) => {
            const cursor = teacherCollection.find();
            const results = await cursor.toArray();
            res.send(results);
        });



        app.post('/students', async (req, res) => {
            const user = req.body;

            const existingUser = await studentCollection.findOne({ email: user.email });
            if (existingUser) {
                return res.status(400).send({ error: 'Email already exists' });
            }
            const result = await studentCollection.insertOne(user);
            res.send(result);




        });




        // Inside your server.js file

app.patch('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { courseId, index } = req.body;

    try {
        // Find the student by ID
        const student = await studentCollection.findOne({ _id: new ObjectId(studentId) });
        if (!student) {
            return res.status(404).send({ error: 'Student not found' });
        }

        // Fetch the details of the selected course
        const course = await courseCollection.findOne({ _id: new ObjectId(courseId) });
        if (!course) {
            return res.status(404).send({ error: 'Course not found' });
        }

        // Add the course details into the student's result field at the specified index
        student.result[index] = {
            courseId: course._id,
            courseName: course.course,
            department: course.department,
            courseCode: course.coursecode,
            credit: course.credit,
            status: course.status,
            detailsMark: course.detailsMark,
            totalMark: course.totalMark,
            level: course.level,
            term: course.term,
            // Add other course details as needed
        };

        // Update the student record in the database
        const updatedStudent = await studentCollection.findOneAndUpdate(
            { _id: new ObjectId(studentId) },
            { $set: { result: student.result } },
            { returnOriginal: false }
        );

        res.send(updatedStudent.value);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



   


       




      

        app.post('/teachers', async (req, res) => {
            const user = req.body;
            console.log
            const existingUser = await Collection.findOne({ email: user.email });
            if (existingUser) {
                return res.status(400).send({ error: 'Email already exists' });
            }
            const result = await teacherCollection.insertOne(user);
            res.send(result);





        });

        app.post('/courses', async (req, res) => {
            const course = req.body;
            const result = await courseCollection.insertOne(course)
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('simple crud is running');
});

app.listen(port, () => {
    console.log(`simple crud is running on port: ${port}`);
});

