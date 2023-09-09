const { Server } = require('socket.io');

const io = new Server(5500, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let users = [];
const addUser = (userId, socketId) => {
    // Kiểm tra trong users có userId, nếu không sẽ thêm userId và socketId
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    // Lọc bỏ những object trong users có socketId === socketId
    users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    // Lấy ra userId trong users(phải giống vs tham số userId mà ta truyền vào)
    return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
    // When connect
    console.log('A user connected!');

    // Take userId and socketId from user
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });

    // Send and get message
    socket.on('sendMessage', ({ receiverId, msg }) => {
        const user = getUser(receiverId);

        io.to(user?.socketId).emit('getMessage', msg);
    });

    // When disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnect');
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});
