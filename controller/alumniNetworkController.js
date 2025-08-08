const alumniModel = require("../models/studentModel");
const connectionModel = require("../models/connectionModel");
const helper = require("../helper");

exports.alumniNetwork = async (req, res) => {
  try {
    let alumni = await alumniModel.findById(req.student?.id);
    res.render("alumniNetwork", { alumni:  alumni});
  } catch (err) {
    console.log("Error in alumniNetwork: " + err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.alumniNetworkDetails = async (req, res) => {
  let alumniId = req.params.alumniId || null
  let currentUserId = req.student?.id
  try {
    let alumniData = await alumniModel.findById(alumniId);
    if (!alumniData) {
      return res.json({
        success: false,
        message: "Alumni not found!",
      })
    }

    let connection = await connectionModel.findOne({
      $or: [
        { requester: currentUserId, recipient: alumniData._id },
        { recipient: currentUserId, requester: alumniData._id },
      ],
    });

    let connectionStatus = "not_connected";

    if (connection) {
      if (connection.status === "accepted") {
        connectionStatus = "connected";
      } else if (connection.status === "pending") {
        connectionStatus = "pending";
      } else {
        connectionStatus = "not_connected";
      }
    }

    let alumniObj = alumniData.toObject();
    alumniObj.connectionStatus = connectionStatus;

    return res.json({
      success: true,
      data: alumniObj,
    })
  } catch (err) {
    console.log("Error in alumniNetworkDetails: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.getAlumniList = async (req, res) => {
  try {
    let page = Number.parseInt(req.query.page) || 1
    let limit = Number.parseInt(req.query.limit) || 12
    let skip = (page - 1) * limit

    let { search, batch, course } = req.query
    let currentUserId = req.student?.id

    let filter = { isDelete: false, isAlumni: true }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { currentPosition: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (batch) {
      filter.graduationYear = Number.parseInt(batch)
    }

    if (course) {
      filter.course = { $regex: course, $options: "i" }
    }

    if (currentUserId) {
      filter._id = { $ne: currentUserId }
    }

    let totalAlumni = await alumniModel.countDocuments(filter);
    let totalPages = Math.ceil(totalAlumni / limit);

    let alumni = await alumniModel
      .find(filter)
      .select("name email phone gender course graduationYear currentPosition company location skills")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    if (currentUserId && alumni.length > 0) {
      let alumniIds = alumni.map((a) => a._id)
      let connections = await connectionModel.find({
        $or: [
          { requester: currentUserId, recipient: { $in: alumniIds } },
          { recipient: currentUserId, requester: { $in: alumniIds } },
        ],
      })

      alumni = alumni.map((alumniItem) => {
        let alumniObj = alumniItem.toObject()
        let connection = connections.find(
          (conn) =>
            (conn.requester.toString() === currentUserId && conn.recipient.toString() === alumniItem._id.toString()) ||
            (conn.recipient.toString() === currentUserId && conn.requester.toString() === alumniItem._id.toString()),
        )

        if (connection) {
          if (connection.status === "accepted") {
            alumniObj.connectionStatus = "connected"
          } else if (connection.status === "pending") {
            alumniObj.connectionStatus = "pending"
          } else {
            alumniObj.connectionStatus = "not_connected"
          }
        } else {
          alumniObj.connectionStatus = "not_connected"
        }

        return alumniObj
      })
    }

    return res.json({
      success: true,
      data: {
        alumni,
        currentPage: page,
        totalPages,
        totalAlumni,
        hasMore: page < totalPages,
      },
    })
  } catch (err) {
    console.log("Error in getAlumniList: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.getNetworkStats = async (req, res) => {
  try {
    let currentUserId = req.student?.id

    let totalAlumni = await alumniModel.countDocuments({ isDelete: false, isAlumni: true })

    let connections = 0
    if (currentUserId) {
      connections = await connectionModel.countDocuments({
        $or: [
          { requester: currentUserId, status: "accepted" },
          { recipient: currentUserId, status: "accepted" },
        ],
      })
    }

    let requestCount = 0
    if (currentUserId) {
      requestCount = await connectionModel.countDocuments({
        recipient: currentUserId,
        status: "pending",
      })
    }

    let sameCourseCount = 0
    if (currentUserId) {
      let currentUser = await alumniModel.findById(currentUserId)
      if (currentUser) {
        sameCourseCount = await alumniModel.countDocuments({
          course: currentUser.course,
          isAlumni: true,
          isDelete: false,
          _id: { $ne: currentUserId },
        })
      }
    }

    return res.json({
      success: true,
      data: {
        totalAlumni,
        connections,
        requestCount,
        sameCourseCount,
      },
    })
  } catch (err) {
    console.log("Error in getNetworkStats: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.getConnections = async (req, res) => {
  try {
    let currentUserId = req.student?.id

    if (!currentUserId) {
      return res.json({
        success: false,
        message: "User not authenticated!",
      })
    }

    let connections = await connectionModel
      .find({
        $or: [
          { requester: currentUserId, status: "accepted" },
          { recipient: currentUserId, status: "accepted" },
        ],
      })
      .populate("requester recipient", "name currentPosition company gender")

    let connectionsList = connections.map((conn) => {
      let otherUser = conn.requester._id.toString() === currentUserId ? conn.recipient : conn.requester
      return {
        id: otherUser._id,
        name: otherUser.name,
        currentPosition: otherUser.currentPosition,
        company: otherUser.company,
        gender: otherUser.gender,
      }
    })

    return res.json({
      success: true,
      data: connectionsList,
    })
  } catch (err) {
    console.log("Error in getConnections: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.getConnectionRequests = async (req, res) => {
  try {
    let currentUserId = req.student?.id

    if (!currentUserId) {
      return res.json({
        success: false,
        message: "User not authenticated!",
      })
    }

    let requests = await connectionModel
      .find({
        recipient: currentUserId,
        status: "pending",
      })
      .populate("requester", "name currentPosition company gender")

    let requestsList = requests.map((req) => ({
      id: req.requester._id,
      name: req.requester.name,
      currentPosition: req.requester.currentPosition,
      company: req.requester.company,
      gender: req.requester.gender,
      requestId: req._id,
    }))

    return res.json({
      success: true,
      data: requestsList,
    })
  } catch (err) {
    console.log("Error in getConnectionRequests: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.sendConnectionRequest = async (req, res) => {
  try {
    let currentUserId = req.student?.id
    let { alumniId } = req.body

    if (!currentUserId) {
      return res.json({
        success: false,
        message: "User not authenticated!",
      })
    }

    if (!alumniId) {
      return res.json({
        success: false,
        message: "Alumni ID is required!",
      })
    }

    if (currentUserId === alumniId) {
      return res.json({
        success: false,
        message: "Cannot send connection request to yourself!",
      })
    }

    let existingConnection = await connectionModel.findOne({
      $or: [
        { requester: currentUserId, recipient: alumniId },
        { requester: alumniId, recipient: currentUserId },
      ],
    })

    if (existingConnection) {
      return res.json({
        success: false,
        message: "Connection request already exists!",
      })
    }

    let newConnection = new connectionModel({
      requester: currentUserId,
      recipient: alumniId,
      status: "pending",
    })

    await newConnection.save();

    let requester = await alumniModel.findById(currentUserId);

    let notificationData = {
      title: "New Connection Request",
      type: "connection",
      message: `${requester.name} sent you a connection request`,
      relatedId: newConnection._id,
      userId: alumniId
    }

    await helper.sendNotification(notificationData.title, notificationData.message, notificationData.userId, notificationData.type);
    // let notification = new notificationModel({
    //   userId: alumniId,
    //   type: "connection",
    //   message: ,
    //   relatedId: newConnection._id,
    // })

    // await notification.save()

    return res.json({
      success: true,
      message: "Connection request sent successfully!",
    })
  } catch (err) {
    console.log("Error in sendConnectionRequest: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.acceptConnectionRequest = async (req, res) => {
  try {
    let currentUserId = req.student?.id
    let { requestId } = req.body

    if (!currentUserId) {
      return res.json({
        success: false,
        message: "User not authenticated!",
      })
    }

    let connection = await connectionModel.findOne({
      _id: requestId,
      recipient: currentUserId,
      status: "pending",
    })

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection request not found!",
      })
    }

    connection.status = "accepted";
    connection.respondedAt = new Date();
    await connection.save();

    let recipient = await alumniModel.findById(currentUserId);

    let notificationData = {
      title: "New Connection Request",
      type: "connection",
      message: `${recipient.name} accepted your connection request`,
      relatedId: recipient._id,
      userId: connection.requester
    }

    await helper.sendNotification(notificationData.title, notificationData.message, notificationData.userId, notificationData.type);

    // let notification = new notificationModel({
    //   userId: connection.requester,
    //   type: "connection",
    //   message: `${recipient.name} accepted your connection request`,
    //   relatedId: connection._id,
    // })

    // await notification.save();

    return res.json({
      success: true,
      message: "Connection request accepted!",
    })
  } catch (err) {
    console.log("Error in acceptConnectionRequest: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.declineConnectionRequest = async (req, res) => {
  try {
    let currentUserId = req.student?.id
    let { requestId } = req.body

    if (!currentUserId) {
      return res.json({
        success: false,
        message: "User not authenticated!",
      })
    }

    let connection = await connectionModel.findOne({
      _id: requestId,
      recipient: currentUserId,
      status: "pending",
    })

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection request not found!",
      })
    }

    connection.status = "declined"
    connection.respondedAt = new Date()
    await connection.save()

    return res.json({
      success: true,
      message: "Connection request declined!",
    })
  } catch (err) {
    console.log("Error in declineConnectionRequest: " + err)
    return res.json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

module.exports = exports;