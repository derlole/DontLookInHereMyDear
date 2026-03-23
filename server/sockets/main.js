module.exports = (io, socket) => {
    socket.on("test_msg", (data) => {
        console.log(data)
    })
}