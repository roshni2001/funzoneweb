import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SupervisorModel from "../Models/supervisorModel.js";
import MeetingModel from "../Models/MeetingModel.js";
import moment from "moment";
// get all users

export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModel.find({ isAdministrator: false });
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

// get a user
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a user

// export const updateUser = async(req, res)=>{
//     let id=req.params.id;
//     const {_id, currentUserAdminStatus, password} = req.body;

//     if(id === _id || currentUserAdminStatus){
//         try {
//             if(password){
//                 const salt=await bcrypt.genSalt(10);
//                 req.body.password=await bcrypt.hash(password, salt);
//             }
//             const user=await UserModel.findByIdAndUpdate(id, req.body, {new:true});
//             const token=jwt.sign(
//                 {email:user.email, id:user._id},
//                 process.env.JWT_KEY, {expiresIn:"1h"}
//             );
//             res.status(200).json({user, token});
//         } catch (error) {
//             res.status(500).json(error);
//         }
//     }else{
//         res.status(403).json("Access Denied!")
//     }
// };

export const updateUser = async (req, res) => {
  const id = req.params.id;
  // console.log("Data Received", req.body)
  const { _id, currentUserAdmin, password } = req.body;

  if (id === _id) {
    try {
      // if we also have to update password then password will be bcrypted again
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      // have to change this
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        {
          email: user.email,
          id: user._id,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({ user, token });
    } catch (error) {
      console.log(error + "inside update");
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied!");
  }
};

// Delete User

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  // if(currentUserId === id || currentUserAdminStatus){
  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).json("User deleted successfully!");
  } catch (error) {
    res.status(500).json(error);
  }
  // }else{
  //     res.status(403).json("Access Denied!")
  // }
};

// follow a user

export const followUser = async (req, res) => {
  const id = req.params.id;

  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("Action forbidden!");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);
      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("User is Already followed by you!");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// Unfollow a user

export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("Action forbidden!");
  } else {
    try {
      const unfollowUser = await UserModel.findById(id);
      const unfollowingUser = await UserModel.findById(_id);
      if (unfollowUser.followers.includes(_id)) {
        await unfollowUser.updateOne({ $pull: { followers: _id } });
        await unfollowingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User Unfollowed!");
      } else {
        res.status(403).json("User is not followed by you!");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
export const addUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const studentId = req.body.studentId;

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // check if studentId already exists in mystudents array
    if (user.mystudents.includes(studentId)) {
      return res.status(400).json({ msg: "Student already added" });
    }

    user.mystudents.push(studentId);

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
export const removeUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const studentId = req.body.studentId;

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // check if studentId exists in mystudents array
    if (!user.mystudents.includes(studentId)) {
      return res.status(400).json({ msg: "Student not found" });
    }

    user.mystudents = user.mystudents.filter((id) => id !== studentId);

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const getAllSearchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } }, // i means case insensitive
        ],
      }
    : {};
  const users = await UserModel.find(keyword);
  res.send(users);
};

// add supervisor

export const addSupervisor = async (req, res) => {
  try {
    const newSupervisor = await SupervisorModel({
      ...req.body,
      status: "pending",
    });
    await newSupervisor.save();
    const administrator = await UserModel.findOne({ isAdministrator: true });

    if (administrator && administrator.notification) {
      const notification = administrator.notification;
      notification.push({
        type: "apply-supervisor-request",
        message: `${newSupervisor.username} ${newSupervisor.email} has applied for a Supervisor Account`,
        data: {
          supervisorId: newSupervisor._id,
          name: newSupervisor.username,
          onClickPath: "/administrator/supervisors",
        },
      });
      await UserModel.findByIdAndUpdate(administrator._id, { notification });
    }
    res.status(201).send({
      success: true,
      message: "Supervisor Account Applied Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

export const getAllNotification = async (req, res) => {
  // try {
  //   const user = await UserModel.findOne({ _id: req.body.userId });
  //   const seenNotification = user.seenNotification;
  //   const notification = user.notification;
  //   seenNotification.push(...notification);
  //   user.notification = [];
  //   user.seenNotification = notification;
  //   const updatedUser = await user.save();
  //   res.status(200).send({
  //     success: true,
  //     message: "All notifications marked as read",
  //     data: updatedUser,
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send({
  //     message: "Error in notifucation",
  //     success: false,
  //     error,
  //   });
  // }
  try {
    const user = await UserModel.findOne({ _id: req.body.userId });
    const seenNotification = user.seenNotification;
    const notification = user.notification;
    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

export const deleteAllNotification = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seenNotification = [];
    const updatedUser = await user.save();
    // updatedUser.password=undefined;
    res.status(200).send({
      success: true,
      message: "Notifications deleted Successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Unable to delete notifications",
      success: false,
      error,
    });
  }
};

export const getAllApprovedSupervisors = async (req, res) => {
  try {
    const supervisors = await SupervisorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Supervisors data list",
      data: supervisors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error while fetching Supervisors data!",
      error,
    });
  }
};

export const scheduleMeeting = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newMeeting = new MeetingModel(req.body);
    await newMeeting.save();
    const user = await UserModel.findOne({
      _id: req.body.supervisorInfo.userId,
    });
    user.notification.push({
      type: "New-Meeting-Request",
      message: `A new meeting request from ${req.body.userInfo.username}`,
      onClickPath: "/user/meetings",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Meeting Scheduled Successfully!",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while scheduling meeting!",
      error,
    });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const supervisorId = req.body.supervisorId;
    const meetings = await MeetingModel.find({
      supervisorId,
      date,
      time: {
        $gte: fromTime, // greater than equal to gte
        $lte: toTime, // less than equal to lte
      },
    });
    if (meetings.length > 0) {
      return res.status(200).send({
        message: "Meetings not Available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        message: "Meetings Available at this time",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while Checking Availability!",
      error,
    });
  }
};

export const userAppointmentsList = async (req, res) => {
  try {
    const { _id } = req.body;
    const appointments = await MeetingModel.find(_id);
    res.status(200).send({
      success: true,
      message: "User's Meeting Appointments fetched Successfully!",
      data: appointments,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Meeting Appointments!",
      error,
    });
  }
};
