import TaskModel from "../Models/TaskModal.js";

export const addTask = async (req, res) => {
  const id = req.params.id; //logged in user
  try {
    const { title, description, dueDate } = req.body;
    const task = new TaskModel({ user: id, title, description, dueDate });
    await task.save();
    res.status(200).send({
      success: true,
      message: "Task Added!",
      data: task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while Adding a Task!",
      error,
    });
  }
};
export const getTasksById = async (req, res) => {
  const id = req.params.id; //logged in user
  try {
    const tasks = await TaskModel.find({ user: id });
    res.status(200).send({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while Fetching Tasks!",
      error,
    });
  }
};
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params; // specific task
    const { completed } = req.body;
    const task = await TaskModel.findByIdAndUpdate(
      id,
      { completed, completedDate: Date.now() },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Task marked as Completed!",
      data: task,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while Updating a Task!",
      error,
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params; // specific task
    await TaskModel.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Task Deleed!",
      data: task,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while Deleting a Task!",
      error,
    });
  }
};
