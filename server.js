const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment");
const Message = require("./models/messageModel");
require("./config/mongo");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "view"));
app.use(express.static("public"));

hbs.registerHelper("eq", (v1, v2) => v1 === v2);

hbs.registerHelper('formatDateForInput', function(dateString) {
    return moment(dateString, 'DD-MM-YYYY').format('YYYY-MM-DD');
});

hbs.registerHelper('formatDate', function (date, format) {
    // Ensure format is a string or fallback to a default
    const fmt = typeof format === 'string' ? format : 'DD-MM-YYYY';
    return moment(date).format(fmt);
});

hbs.registerHelper('subtract', function (a, b) {
    return a - b;
});

hbs.registerHelper("inc", (value) => parseInt(value) + 1);

hbs.registerHelper("groupBySemester", function (examResults) {
    const groupedResults = {};

    examResults.forEach(result => {
        if (!groupedResults[result.semester]) {
            groupedResults[result.semester] = [];
        }
        groupedResults[result.semester].push(result);
    });

    let resultHtml = "";
    for (const semester in groupedResults) {
        resultHtml += `<h4 class="mt-3 text-primary">Semester ${semester}</h4>
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th width="15%">Subject Code</th>
                        <th width="65%">Subject Name</th>
                        <th width="10%" class="text-center">Grade</th>
                        <th width="10%" class="text-center">Result</th>
                    </tr>
                </thead>
                <tbody>`;
        groupedResults[semester].forEach(item => {
            resultHtml += `<tr>
                <td>${item.subjectCode}</td>
                <td>${item.subjectName || "N/A"}</td>
                <td class="text-center"><span class="grade-${item.grade}">${item.grade}</span></td>
                <td class="text-center"><span class="result-${item.result.toLowerCase()}">${item.result}</span></td>
            </tr>`;
        });
        resultHtml += `</tbody></table>`;
    }

    return new hbs.handlebars.SafeString(resultHtml);
});

app.use("/v1/api", require("./routes/index"));

app.get("/", (req, res) => {
  res.render("newHome");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/studentHome", (req, res) => {
  res.render("studentHome");
});

const users = {};
const rooms = {};

io.on('connection', async (socket) => {
    console.log('A user connected');
  
    socket.on('joinChat', async ({ username, year, course, senderId }) => {
        if (!year) {
            socket.emit('error', 'Year information is required to join the chat.');
            return;
        }

        if (!users[socket.id]) { 
            users[socket.id] = { username, year, course, senderId };

            if (!rooms[year]) {
                rooms[year] = new Set();
            }

            rooms[year].add(socket.id);
            socket.join(`year_${year}`);

            try {
                const joinMessage = new Message({
                    senderName: username,
                    senderId: senderId,
                    year: year,
                    course: course,
                    message: `${username} joined the chat`,
                    type: 'join'
                });

                await joinMessage.save();
                // io.emit('receiveMessage', joinMessage);
                io.to(`year_${year}`).emit('receiveMessage', joinMessage);
            } catch (err) {
                console.error('Error in joinChat:', err);
                socket.emit('error', 'Failed to save join message');
            }
        }
    });
  
    socket.on("loadOlderMessages", async ({ skip, limit, year, course }) => {
        try {
            const olderMessages = await Message.find({ year: year, course: course })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
    
            socket.emit("olderMessages", olderMessages);
        } catch (err) {
            console.error("Error loading older messages:", err);
            socket.emit("error", "Failed to load older messages");
        }
    });
  
    socket.on('sendMessage', async (data) => {
        const user = users[socket.id];
      if (!user || !data.username || !data.message) return;
  
      try {
        const newMessage = new Message({
          senderName: data.username,
          year: user.year,
          message: data.message,
          course: data.course,
          senderId: data.senderId,
          type: 'message'
        });
  
        await newMessage.save();
        // io.emit('receiveMessage', newMessage);
        io.to(`year_${user.year}`).emit('receiveMessage', newMessage);
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('error', 'Failed to save message');
      }
    });

    socket.on('typing', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('userTyping', users[socket.id]);
        }
    });
    
    socket.on('stopTyping', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('userStoppedTyping', users[socket.id]);
        }
    });

    socket.on("messageDeleted", (messageId) => {
        const messageElement = document.querySelector(`[data-id='${messageId}']`);
        if (messageElement) {
            messageElement.parentNode.removeChild(messageElement);
        }
    });
  
    socket.on('disconnect', async () => {
        // const username = users[socket.id];
        const user = users[socket.id];
        if (user) {
            try {
                const leaveMessage = new Message({
                    senderName: user.username,
                    year: user.year,
                    course: user.course,
                    message: `${user.username} left the chat`,
                    type: 'leave'
                });

                await leaveMessage.save();
                // io.emit('receiveMessage', leaveMessage);
                io.to(`year_${user.year}`).emit('receiveMessage', leaveMessage);
            } catch (err) {
                console.error('Error saving leave message:', err);
            }

            rooms[user.year]?.delete(socket.id);
            delete users[socket.id];
            console.log(`${user.username} disconnected`);
        }
    });
});

const PORT = process.env.PORT || 9578;
server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}...`));